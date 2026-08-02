import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { WallpaperPattern } from "@/shared/types/wallpaper";
import { ArrowUp01Icon, LibraryIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion } from "motion/react";

type ShaderLibraryProps = {
  pattern: WallpaperPattern;
  onPatternChange: (pattern: WallpaperPattern) => void;
};

const patterns: Array<{ id: WallpaperPattern; label: string }> = [
  { id: "fluid", label: "Fluid" },
  { id: "topographic", label: "Topographic" },
];

function PatternThumbnail({ pattern }: { pattern: WallpaperPattern }) {
  if (pattern === "topographic") {
    return (
      <svg
        aria-hidden="true"
        className="size-full bg-background text-foreground/35"
        preserveAspectRatio="none"
        viewBox="0 0 120 48"
      >
        <path
          d="M-8 38C8 25 19 19 34 23s15 17 31 16 17-17 31-20 20 6 31 15M-7 30C7 18 19 11 35 15s17 16 30 15 17-16 30-20 20 7 33 16M-8 21C8 10 22 3 37 8s15 14 28 13S82 6 96 3s21 7 31 16M4 48c8-9 15-13 26-12s18 10 29 11 18-7 29-10 20 0 32 10"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <path
          d="M13 48c8-6 14-8 21-7 9 1 15 7 23 7M52 0c4 5 9 8 16 8 8 0 13-6 20-8"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.8"
        />
      </svg>
    );
  }

  return (
    <div className="relative size-full overflow-hidden bg-background">
      <span className="absolute -top-5 -left-4 size-16 rounded-full bg-primary/18 blur-md" />
      <span className="absolute top-1 -right-5 size-16 rounded-full bg-foreground/12 blur-lg" />
      <span className="absolute -bottom-7 left-8 size-20 rounded-full bg-primary/12 blur-lg" />
    </div>
  );
}

export function ShaderLibrary({
  pattern,
  onPatternChange,
}: ShaderLibraryProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <section className="flex w-full flex-col gap-2">
      <Button
        aria-controls="shader-pattern-library"
        aria-expanded={!isCollapsed}
        className="w-full justify-between"
        onClick={() => setIsCollapsed((collapsed) => !collapsed)}
        size="default"
        type="button"
        variant="ghost"
      >
        <span className="flex items-center gap-2">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-foreground">
            <HugeiconsIcon
              aria-hidden="true"
              data-icon="inline-start"
              icon={LibraryIcon}
              strokeWidth={1.8}
            />
          </span>
          <span className="text-[13px] leading-none text-foreground">Library</span>
        </span>
        <motion.span
          animate={{ rotate: isCollapsed ? 180 : 0 }}
          transition={{ type: "spring", duration: 0.3, bounce: 0 }}
        >
          <HugeiconsIcon
            aria-hidden="true"
            data-icon="inline-end"
            icon={ArrowUp01Icon}
            strokeWidth={1.8}
          />
        </motion.span>
      </Button>

      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            id="shader-pattern-library"
            animate={{ height: "auto", opacity: 1 }}
            className="overflow-hidden"
            exit={{ height: 0, opacity: 0 }}
            initial={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", duration: 0.3, bounce: 0 }}
          >
            <div
              aria-label="Wallpaper pattern"
              className="grid grid-cols-2 gap-2 p-0.5"
              role="radiogroup"
            >
              {patterns.map((option) => {
                const isSelected = option.id === pattern;

                return (
                  <label
                    className={cn(
                      "group flex min-w-0 cursor-pointer flex-col gap-1 rounded-lg bg-muted/45 p-1.5",
                      "transition-[background-color,box-shadow,scale] duration-150 ease-out active:scale-[0.96]",
                      "has-focus-visible:ring-2 has-focus-visible:ring-ring/50",
                      isSelected
                        ? "bg-muted ring-1 ring-ring/70"
                        : "hover:bg-muted/75",
                    )}
                    key={option.id}
                  >
                    <input
                      checked={isSelected}
                      className="sr-only"
                      name="wallpaper-pattern"
                      onChange={() => onPatternChange(option.id)}
                      type="radio"
                      value={option.id}
                    />
                    <span className="block h-11 w-full overflow-hidden rounded-md">
                      <PatternThumbnail pattern={option.id} />
                    </span>
                    <span className="truncate px-0.5 text-[11px] font-medium text-foreground/80">
                      {option.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
