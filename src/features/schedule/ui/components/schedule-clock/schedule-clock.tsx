"use client";
import { ScheduleSelect } from "../schedule-select/schedule-select";

const options = Array.from({ length: 96 }, (_, index) => {
  const value =
    String(Math.floor(index / 4)).padStart(2, "0") +
    ":" +
    String((index % 4) * 15).padStart(2, "0");
  return { value, label: value };
});
export function ScheduleClock({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
}) {
  return <ScheduleSelect label={label} items={options} value={value} onChange={onChange} />;
}
