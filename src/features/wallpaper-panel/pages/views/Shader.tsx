import {
  shaderControlSections,
  type ShaderControlKey,
  type ShaderControlSectionId,
  type ShaderSettings,
} from "@/features/shader-editor";
import { ShaderLibrary } from "@/features/shader-library";
import type { WallpaperPattern } from "@/shared/types/wallpaper";
import {
  FormIcon,
  MaterialAndTextureIcon,
  Motion01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { WallpaperPanelSlider } from "../../components/WallpaperPanelSlider";

const sectionIcons = {
  form: FormIcon,
  motion: Motion01Icon,
  material: MaterialAndTextureIcon,
} satisfies Record<ShaderControlSectionId, typeof FormIcon>;

export type ShaderViewProps = {
  pattern: WallpaperPattern;
  settings: ShaderSettings;
  onPatternChange: (pattern: WallpaperPattern) => void;
  onSettingChange: (key: ShaderControlKey, value: number) => void;
};

export function Shader({
  pattern,
  settings,
  onPatternChange,
  onSettingChange,
}: ShaderViewProps) {
  return (
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
                    onChange={(value) => onSettingChange(control.key, value)}
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
  );
}
