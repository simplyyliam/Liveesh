import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type {
  ShaderControlKey,
  ShaderSettings,
} from "@/features/shader-editor";
import {
  PanelRouter,
  useSnapPanelPosition,
} from "@/features/wallpaper-panel";
import type {
  WallpaperColors,
  WallpaperPattern,
} from "@/shared/types/wallpaper";
import { FpsDisplay } from "@/widgets/fps-display";
import { ArrowUp01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion, useDragControls } from "motion/react";

type AppSidePanelProps = {
  colors: WallpaperColors;
  fps: number;
  pattern: WallpaperPattern;
  settings: ShaderSettings;
  onColorsChange: (colors: WallpaperColors) => void;
  onPatternChange: (pattern: WallpaperPattern) => void;
  onSettingChange: (key: ShaderControlKey, value: number) => void;
};

export function AppSidePanel({
  colors,
  fps,
  pattern,
  settings,
  onColorsChange,
  onPatternChange,
  onSettingChange,
}: AppSidePanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const dragControls = useDragControls();
  const { panelRef, snapToBounds, x, y } = useSnapPanelPosition();

  return (
    <motion.aside
      aria-label="Wallpaper controls"
      className="fixed top-0 left-0 z-20 flex max-h-[calc(100svh-24px)] w-[calc(100vw-24px)] overflow-hidden rounded-[18px] bg-card/95 text-card-foreground shadow-2xl backdrop-blur-xl sm:max-h-[calc(100svh-32px)] sm:w-[min(340px,calc(100vw-32px))]"
      drag
      dragControls={dragControls}
      dragElastic={0.08}
      dragListener={false}
      dragMomentum={false}
      onDragEnd={(_, info) => snapToBounds(info)}
      ref={panelRef}
      style={{ x, y }}
    >
      <ScrollArea className="max-h-[inherit] w-full">
        <PanelRouter
          colors={colors}
          headerActions={
            <>
              <FpsDisplay fps={fps} />
              <Button
                aria-controls="wallpaper-panel-content"
                aria-expanded={!isCollapsed}
                aria-label={
                  isCollapsed ? "Expand panel controls" : "Collapse panel controls"
                }
                onClick={() => setIsCollapsed((collapsed) => !collapsed)}
                size="icon-sm"
                type="button"
                variant="ghost"
              >
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
            </>
          }
          isCollapsed={isCollapsed}
          onColorsChange={onColorsChange}
          onHeaderPointerDown={(event) => dragControls.start(event)}
          onPatternChange={onPatternChange}
          onSettingChange={onSettingChange}
          pattern={pattern}
          settings={settings}
        />
      </ScrollArea>
    </motion.aside>
  );
}
