import { ColorControls } from "@/features/color-controls/components";
import type { WallpaperColors } from "@/shared/types/wallpaper";

export type ColorsViewProps = {
  colors: WallpaperColors;
  onColorsChange: (colors: WallpaperColors) => void;
};

export function Colors({ colors, onColorsChange }: ColorsViewProps) {
  return (
    <section className="flex w-full flex-col gap-3">
      <div className="flex flex-col gap-1 px-1">
        <h2 className="text-[13px] font-medium leading-none text-foreground">
          Wallpaper colors
        </h2>
        <p className="text-[11px] leading-normal text-muted-foreground">
          Choose the four colors blended by the active shader.
        </p>
      </div>

      <ColorControls colors={colors} onColorsChange={onColorsChange} />
    </section>
  );
}
