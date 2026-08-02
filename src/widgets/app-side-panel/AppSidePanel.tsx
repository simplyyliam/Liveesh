import { useLayoutEffect, useRef, useState } from "react";
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
import { motion, useDragControls, useReducedMotion } from "motion/react";

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
  const [isScrollable, setIsScrollable] = useState(false);
  const [panelHeight, setPanelHeight] = useState<number>();
  const contentRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();
  const shouldReduceMotion = useReducedMotion();
  const { panelRef, snapToBounds, x, y } = useSnapPanelPosition();

  useLayoutEffect(() => {
    const content = contentRef.current;

    if (!content) {
      return;
    }

    let animationFrame = 0;

    const updateHeight = () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(() => {
        const viewportPadding = window.innerWidth < 640 ? 24 : 32;
        const contentHeight = content.getBoundingClientRect().height;
        const maximumHeight = window.innerHeight - viewportPadding;
        const nextHeight = Math.min(contentHeight, maximumHeight);

        setIsScrollable(contentHeight > maximumHeight);
        setPanelHeight(nextHeight);
      });
    };

    const resizeObserver = new ResizeObserver(updateHeight);

    resizeObserver.observe(content);
    window.addEventListener("resize", updateHeight);
    updateHeight();

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, []);

  return (
    <motion.aside
      animate={panelHeight === undefined ? undefined : { height: panelHeight }}
      aria-label="Wallpaper controls"
      className="fixed top-0 left-0 z-20 flex max-h-[calc(100svh-24px)] w-[calc(100vw-24px)] overflow-hidden rounded-[18px] bg-card/95 text-card-foreground shadow-2xl backdrop-blur-xl sm:max-h-[calc(100svh-32px)] sm:w-[min(340px,calc(100vw-32px))]"
      drag
      dragControls={dragControls}
      dragElastic={0.08}
      dragListener={false}
      dragMomentum={false}
      initial={false}
      onDragEnd={(_, info) => snapToBounds(info)}
      ref={panelRef}
      style={{ x, y }}
      transition={{
        height: shouldReduceMotion
          ? { duration: 0 }
          : { type: "spring", duration: 0.35, bounce: 0 },
      }}
    >
      <ScrollArea
        className="max-h-[inherit] w-full"
        showScrollbar={isScrollable}
      >
        <div ref={contentRef}>
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
        </div>
      </ScrollArea>
    </motion.aside>
  );
}
