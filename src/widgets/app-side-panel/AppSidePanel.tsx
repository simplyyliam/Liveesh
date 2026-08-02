import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  shaderControlSections,
  type ShaderControlKey,
  type ShaderControlSectionId,
  type ShaderSettings,
} from "@/features/shader-editor";
import { ShaderLibrary } from "@/features/shader-library";
import {
  useSnapPanelPosition,
  WallpaperPanelSlider,
} from "@/features/wallpaper-panel";
import type { WallpaperPattern } from "@/shared/types/wallpaper";
import { FpsDisplay } from "@/widgets/fps-display";
import {
  ArrowUp01Icon,
  FormIcon,
  MaterialAndTextureIcon,
  Motion01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion, useDragControls } from "motion/react";

const sectionIcons = {
  form: FormIcon,
  motion: Motion01Icon,
  material: MaterialAndTextureIcon,
} satisfies Record<ShaderControlSectionId, typeof FormIcon>;

type AppSidePanelProps = {
  fps: number;
  pattern: WallpaperPattern;
  settings: ShaderSettings;
  onPatternChange: (pattern: WallpaperPattern) => void;
  onSettingChange: (key: ShaderControlKey, value: number) => void;
};



export function AppSidePanel({
  fps,
  pattern,
  settings,
  onPatternChange,
  onSettingChange,
}: AppSidePanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const dragControls = useDragControls();
  const { panelRef, snapToBounds, x, y } = useSnapPanelPosition();

  return (
    <motion.aside
      aria-label="Wallpaper shader controls"
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
        <div className="flex flex-col gap-4 p-2">
          <div
            className="flex min-h-10 cursor-grab touch-none select-none items-center justify-between rounded-[12px] px-2 text-foreground"
            onPointerDown={(event) => dragControls.start(event)}
          >
            <span className="text-[13px] font-medium leading-none">
              Shader
            </span>
            <div className="flex items-center gap-1 ">
              <FpsDisplay fps={fps} />
              <Button
                aria-controls="shader-panel-controls"
                aria-expanded={!isCollapsed}
                aria-label={isCollapsed ? "Expand shader controls" : "Collapse shader controls"}
                onClick={() => setIsCollapsed((collapsed) => !collapsed)}
                onPointerDown={(event) => event.stopPropagation()}
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
                    data-icon="inline-start"
                    icon={ArrowUp01Icon}
                    strokeWidth={1.8}
                  />
                </motion.span>
              </Button>
            </div>
          </div>

          <AnimatePresence initial={false}>
            {!isCollapsed && (
              <motion.div
                id="shader-panel-controls"
                animate={{ height: "auto", opacity: 1 }}
                className="overflow-hidden"
                exit={{ height: 0, opacity: 0 }}
                initial={{ height: 0, opacity: 0 }}
                transition={{ type: "spring", duration: 0.3, bounce: 0 }}
              >
                <div className="flex flex-col gap-4">
                  <ShaderLibrary
                    onPatternChange={onPatternChange}
                    pattern={pattern}
                  />
                  {shaderControlSections.map(
                    ({ id, title, controls: sectionControls }) => {
                      const icon = sectionIcons[id];

                      return (
                        <section className="flex w-full flex-col gap-2" key={id}>
                          <div className="flex min-h-8 items-center gap-2 text-muted-foreground">
                            <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-foreground">
                              <HugeiconsIcon
                                aria-hidden="true"
                                icon={icon}
                                size={12}
                                strokeWidth={1.8}
                              />
                            </span>
                            <h2 className="text-[13px] font-medium leading-none text-foreground">
                              {title}
                            </h2>
                          </div>
                          <div className="flex flex-col gap-1">
                            {sectionControls.map((control) => (
                              <WallpaperPanelSlider
                                key={control.key}
                                label={control.label}
                                max={control.max}
                                min={control.min}
                                onChange={(value) =>
                                  onSettingChange(control.key, value)
                                }
                                step={control.step}
                                unit={control.unit}
                                value={settings[control.key]}
                              />
                            ))}
                          </div>
                        </section>
                      );
                    },
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </motion.aside>
  );
}
