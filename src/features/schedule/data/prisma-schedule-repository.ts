import "server-only";
import { createHash } from "node:crypto";
import { Prisma, type PrismaClient } from "@/generated/prisma/client";
import {
  scheduleCommandSchema,
  ScheduleMutationError,
  type ScheduleResult,
  type ScheduleSaved,
} from "../application/schedule-command";
import { writeSchedule } from "./schedule-writer";

function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, item]) => [key, canonical(item)]),
    );
  }
  return value;
}

export class PrismaScheduleRepository {
  constructor(
    private readonly client: PrismaClient,
    private readonly workspaceId: string,
    private readonly clock: () => Date = () => new Date(),
  ) {}

  async execute(input: unknown): Promise<ScheduleResult> {
    const parsed = scheduleCommandSchema.safeParse(input);
    if (!parsed.success) return { status: "invalid", code: "invalid_command" };
    const command = parsed.data;
    const hash = createHash("sha256")
      .update(JSON.stringify(canonical(command)))
      .digest("hex");
    const now = this.clock();
    for (let attempt = 0; attempt < 3; attempt++) {
      const started = performance.now();
      const timing: Record<string, number | string> = { attempt: attempt + 1 };
      let callbackFinished: number | undefined;
      try {
        const saved = await this.client.$transaction(
          async (tx) => {
            timing.transactionSetupMs = Math.round(performance.now() - started);
            let stageStarted = performance.now();
            const receipt = await tx.agendaMutationReceipt.findUnique({
              where: {
                workspaceId_operationId: {
                  workspaceId: this.workspaceId,
                  operationId: command.operationId,
                },
              },
            });
            timing.receiptReadMs = Math.round(performance.now() - stageStarted);
            if (receipt) {
              if (receipt.commandHash !== hash) {
                throw new ScheduleMutationError("conflict", "operation_reused");
              }
              callbackFinished = performance.now();
              return receipt.result as unknown as ScheduleSaved;
            }
            stageStarted = performance.now();
            const result = await writeSchedule(tx, this.workspaceId, command, now);
            timing.writeMs = Math.round(performance.now() - stageStarted);
            stageStarted = performance.now();
            await tx.agendaMutationReceipt.create({
              data: {
                workspaceId: this.workspaceId,
                operationId: command.operationId,
                commandHash: hash,
                result,
              },
            });
            timing.receiptWriteMs = Math.round(performance.now() - stageStarted);
            callbackFinished = performance.now();
            return result;
          },
          { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, timeout: 15000 },
        );
        timing.commitMs = Math.round(performance.now() - (callbackFinished ?? started));
        timing.outcome = "saved";
        return saved;
      } catch (error) {
        timing.outcome = "error";
        if (error instanceof ScheduleMutationError) {
          timing.outcome = error.status;
          return { status: error.status, code: error.code };
        }
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") {
          timing.outcome = "retry_transaction";
          continue;
        }
        // A concurrent replay may race on the receipt's unique key.
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002" &&
          String(error.meta?.modelName) === "AgendaMutationReceipt"
        ) {
          timing.outcome = "retry_receipt";
          continue;
        }
        throw error;
      } finally {
        if (process.env.NODE_ENV === "development" && command.kind === "delete_list") {
          console.info("[schedule.delete-group.transaction]", {
            ...timing,
            totalMs: Math.round(performance.now() - started),
          });
        }
      }
    }
    return { status: "conflict", code: "concurrent_change" };
  }
}
