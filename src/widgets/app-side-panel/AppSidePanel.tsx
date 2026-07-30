import { ScrollArea } from "@/components/ui/scroll-area";
import {
  shaderControlSections,
  type ShaderControlKey,
  type ShaderControlSectionId,
  type ShaderSettings,
} from "@/features/shader-editor";
import {
  useSnapPanelPosition,
  WallpaperPanelSlider,
} from "@/features/wallpaper-panel";
import {
  DragDropHorizontalIcon,
  FormIcon,
  MaterialAndTextureIcon,
  Motion01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion, useDragControls } from "motion/react";

const sectionIcons = {
  form: FormIcon,
  motion: Motion01Icon,
  material: MaterialAndTextureIcon,
} satisfies Record<ShaderControlSectionId, typeof FormIcon>;

type AppSidePanelProps = {
  settings: ShaderSettings;
  onSettingChange: (key: ShaderControlKey, value: number) => void;
};

export function AppSidePanel({
  settings,
  onSettingChange,
}: AppSidePanelProps) {
  const dragControls = useDragControls();
  const { panelRef, snapToBounds, x, y } = useSnapPanelPosition();

  return (
    <motion.aside
      aria-label="Wallpaper shader controls"
      className="fixed top-0 left-0 z-20 flex max-h-[calc(100svh-24px)] w-[calc(100vw-24px)] overflow-hidden rounded-[22px] bg-card/80 text-card-foreground shadow-[0_20px_60px_oklch(0_0_0/0.2)] backdrop-blur-md sm:max-h-[calc(100svh-32px)] sm:w-[min(340px,calc(100vw-32px))] sm:rounded-[24px]"
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
        <div className="flex flex-col gap-4 p-3.5">
          <div
            className="flex min-h-10 cursor-grab touch-none select-none items-center justify-between rounded-[12px] px-2 text-muted-foreground"
            onPointerDown={(event) => dragControls.start(event)}
          >
            <span className="text-[13px] font-medium leading-none">
              Shader
            </span>
            <HugeiconsIcon
              aria-hidden="true"
              icon={DragDropHorizontalIcon}
              size={18}
              strokeWidth={1.8}
            />
          </div>

          {shaderControlSections.map(
            ({ id, title, controls: sectionControls }) => {
              const icon = sectionIcons[id];

              return (
                <section className="flex w-full flex-col gap-2" key={id}>
                  <div className="flex min-h-8 items-center gap-1.5 text-muted-foreground">
                    <HugeiconsIcon
                      aria-hidden="true"
                      icon={icon}
                      size={14}
                      strokeWidth={1.8}
                    />
                    <h2 className="text-[13px] font-medium leading-none">
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
      </ScrollArea>
    </motion.aside>
  );
}
