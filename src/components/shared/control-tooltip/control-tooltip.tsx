"use client";
import { Children, isValidElement, type ComponentProps, type ReactNode } from "react";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@fradelli/ui/tooltip";
import { Kbd, KbdGroup } from "@fradelli/ui/kbd";

type ControlTooltipProps = Omit<ComponentProps<typeof TooltipTrigger>, "render" | "children"> & {
  label: string;
  shortcut?: string;
  children: ReactNode;
};
export function ControlTooltip({
  label,
  shortcut,
  children,
  ...triggerProps
}: ControlTooltipProps) {
  const child = Children.toArray(children).find(isValidElement);
  if (!isValidElement<{ disabled?: boolean }>(child)) return <>{children}</>;
  const disabled = child.props.disabled;
  // Keep the hover target mounted when a control switches between enabled and disabled.
  const hasDisabledState = Object.hasOwn(child.props, "disabled");
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          render={
            hasDisabledState ? (
              <span tabIndex={disabled ? 0 : undefined} className="inline-flex">
                {child}
              </span>
            ) : (
              child
            )
          }
          {...triggerProps}
        />
        <TooltipContent>
          <span>{label}</span>
          {shortcut && (
            <KbdGroup>
              {shortcut.split("+").map((key, index) => (
                <Kbd key={index}>{key}</Kbd>
              ))}
            </KbdGroup>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
