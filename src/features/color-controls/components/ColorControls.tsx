import { useState } from "react";
import { generateChainedPalette } from "@/lib/chained-palette";
import type { WallpaperColors } from "@/shared/types/wallpaper";
import {
  Hue,
  Saturation,
  hexToHsva,
  type HsvaColor,
} from "@uiw/react-color";

type ColorControlProps = {
  colors: WallpaperColors;
  onColorsChange: (colors: WallpaperColors) => void;
};

export function ColorControls({ colors, onColorsChange }: ColorControlProps) {
  const [pickerColor, setPickerColor] = useState<HsvaColor>(() =>
    hexToHsva(colors[2]),
  );

  function updateSwatch(index: number, color: string) {
    const nextColors = [...colors] as WallpaperColors;
    nextColors[index] = color;
    setPickerColor(hexToHsva(color));
    onColorsChange(nextColors);
  }

  function updateChainedPalette(color: HsvaColor) {
    setPickerColor(color);
    onColorsChange(generateChainedPalette(color));
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-4 gap-2">
        {colors.map((color, index) => (
          <label
            className="relative aspect-square cursor-pointer overflow-hidden rounded-lg outline -outline-offset-1 outline-black/10"
            key={index}
            style={{ backgroundColor: color }}
          >
            <span className="sr-only">Color {index + 1}</span>
            <input
              aria-label={`Color ${index + 1}`}
              className="absolute inset-0 size-full cursor-pointer opacity-0"
              onInput={(event) =>
                updateSwatch(index, event.currentTarget.value)
              }
              type="color"
              value={color}
            />
          </label>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="px-1 text-[13px] font-medium leading-none text-foreground">
          Chained color picker
        </h3>

        <div className="flex w-full justify-center rounded-lg bg-muted/45 p-3">
          <div className="flex flex-col gap-2">
            <Saturation
              aria-label="Linked palette saturation field"
              hsva={pickerColor}
              onChange={updateChainedPalette}
              radius="var(--radius-md)"
              style={{ width: 220, height: 220 }}
            />
            <Hue
              aria-label="Linked palette hue"
              height={14}
              hue={pickerColor.h}
              onChange={({ h }) =>
                updateChainedPalette({ ...pickerColor, h })
              }
              radius="var(--radius-md)"
              width={220}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
