import { Compiler } from "@/features/toolbar/components/compiler";
import type { WallpaperSettings } from "@/shared/types/wallpaper";
import { motion } from "motion/react";

type ToolbarProps = {
  settings: WallpaperSettings;
};

export function Toolbar({ settings }: ToolbarProps) {
  return (
    <motion.aside
      aria-label="Wallpaper actions"
      className="fixed bottom-4 left-1/2 z-20 flex gap-1 max-w-[calc(100vw-24px)] -translate-x-1/2 items-center overflow-hidden text-card-foreground"
    >
      <Compiler settings={settings} />
    </motion.aside>
  );
}
