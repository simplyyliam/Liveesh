import type { ChangeEvent } from "react";
import { cn } from "@/lib/utils";

type EditorPanelSliderProps = {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  className?: string;
};

export function WallpaperPanelSlider({
  label,
  value,
  min = 0,
  max = 10,
  step = 1,
  unit,
  onChange,
  className,
}: EditorPanelSliderProps) {
  const clampedValue = Math.min(max, Math.max(min, value));
  const progress = ((clampedValue - min) / (max - min)) * 100;

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onChange(Number(event.target.value));
  }

  return (
    <label
      className={cn(
        "group relative block h-11 w-full cursor-ew-resize select-none rounded-[10px] bg-muted/50 sm:h-8 sm:rounded-[8px] overflow-hidden",
        className,
      )}
    >
      <span
        className="absolute inset-0 origin-left rounded-[10px] bg-primary/50 transition-colors duration-150 ease-out will-change-transform group-hover:bg-primary/50 sm:rounded-[8px]"
        style={{ transform: `scaleX(${progress / 100})` }}
      />
      <span className="pointer-events-none absolute inset-0 flex items-center justify-between px-3">
        <span className="text-[12px] font-medium leading-none text-accent/50">
          {label}
        </span>
        <span className="font-mono text-[11px] leading-none text-foreground tabular-nums">
          {clampedValue}
          {unit}
        </span>
      </span>
      <input
        aria-label={label}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        max={max}
        min={min}
        onChange={handleChange}
        step={step}
        type="range"
        value={clampedValue}
      />
    </label>
  );
}
