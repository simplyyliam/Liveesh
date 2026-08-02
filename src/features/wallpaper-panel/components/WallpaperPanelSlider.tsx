import { useState, type ChangeEvent } from "react";
import { motion } from "motion/react";

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

function getStepPrecision(step: number) {
  const stepString = String(step);

  if (stepString.includes("e-")) {
    return Number(stepString.split("e-")[1]);
  }

  return stepString.split(".")[1]?.length ?? 0;
}

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
  const [isDragging, setIsDragging] = useState(false);

  const clampedValue = Math.min(max, Math.max(min, value));
  const range = max - min;

  const progress =
    range === 0 ? 0 : ((clampedValue - min) / range) * 100;

  const precision = getStepPrecision(step);

  const displayValue = Number(
    clampedValue.toFixed(precision),
  ).toString();

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onChange(Number(event.target.value));
  }

  function stopDragging() {
    setIsDragging(false);
  }

  return (
    <label
      className={cn(
        "group relative block h-fit min-h-11 w-full cursor-ew-resize select-none overflow-hidden rounded-lg bg-muted py-1.5 outline-none",
        "has-focus-visible:ring-2 has-focus-visible:ring-ring/50",
        "sm:h-8",
        className,
      )}
    >
      <span
        className={cn(
          "absolute inset-0 origin-left rounded-lg bg-primary/15",
          "transition-colors duration-150 ease-out",
          "will-change-transform group-hover:bg-primary/20",
        )}
        style={{
          transform: `scaleX(${Math.min(100, Math.max(0, progress)) / 100})`,
        }}
      />

      <span className="pointer-events-none absolute inset-0 z-10 flex items-center justify-between px-3 pr-1.5">
        <span className="text-[12px] font-medium leading-none text-foreground">
          {label}
        </span>

        <motion.span
          animate={{
            scale: isDragging ? 1.025 : 1,
          }}
          initial={false}
          transition={{
            type: "spring",
            stiffness: 600,
            damping: 42,
            mass: 0.35,
          }}
          className={cn(
            "inline-flex h-6 min-w-8 origin-right items-center justify-center",
            "rounded-[7px] bg-foreground/8 px-1.5",
            "font-mono text-[11px] font-medium leading-none",
            "text-foreground/75 tabular-nums",
          )}
        >
          <span className="flex items-center justify-center whitespace-nowrap text-center">
            <span>{displayValue}</span>

            {unit && (
              <span className="ml-0.5 text-[10px] text-foreground/45">
                {unit}
              </span>
            )}
          </span>
        </motion.span>
      </span>

      <input
        aria-label={label}
        aria-valuetext={`${displayValue}${unit ?? ""}`}
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
        max={max}
        min={min}
        onBlur={stopDragging}
        onChange={handleChange}
        onLostPointerCapture={stopDragging}
        onPointerCancel={stopDragging}
        onPointerDown={() => setIsDragging(true)}
        onPointerUp={stopDragging}
        step={step}
        type="range"
        value={clampedValue}
      />
    </label>
  );
}
