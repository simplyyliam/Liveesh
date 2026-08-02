import { useState } from "react";
import { Button } from "@/components/ui/button";
import { generateChainedPalette } from "@/lib/chained-palette";
import type { WallpaperColors } from "@/shared/types/wallpaper";
import {
  Hue,
  Saturation,
  Wheel,
  hexToHsva,
  type HsvaColor,
} from "@uiw/react-color";

type PickerMode = "wheel" | "square";

type ColorControlProps = {
  colors: WallpaperColors;
  onColorsChange: (colors: WallpaperColors) => void;
};

export function ColorControls({ colors, onColorsChange }: ColorControlProps) {
  const [pickerMode, setPickerMode] = useState<PickerMode>("wheel");
  const [wheelColor, setWheelColor] = useState<HsvaColor>(() =>
    hexToHsva(colors[2]),
  );

  function updateSwatch(index: number, color: string) {
    const nextColors = [...colors] as WallpaperColors;
    nextColors[index] = color;
    setWheelColor(hexToHsva(color));
    onColorsChange(nextColors);
  }

  function updateChainedPalette(color: HsvaColor) {
    setWheelColor(color);
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

        <div
          aria-labelledby={`color-picker-${pickerMode}-tab`}
          className="flex w-full justify-center rounded-lg bg-muted/45 p-3"
          id={`color-picker-${pickerMode}`}
          role="tabpanel"
        >
          {pickerMode === "wheel" ? (
            <Wheel
              aria-label="Linked palette color wheel"
              color={wheelColor}
              height={220}
              onChange={({ hsva }) => updateChainedPalette(hsva)}
              width={220}
            />
          ) : (
            <div className="flex flex-col gap-2">
              <Saturation
                aria-label="Linked palette saturation field"
                hsva={wheelColor}
                onChange={updateChainedPalette}
                radius="var(--radius-md)"
                style={{ width: 220, height: 220 }}
              />
              <Hue
                aria-label="Linked palette hue"
                height={14}
                hue={wheelColor.h}
                onChange={({ h }) =>
                  updateChainedPalette({ ...wheelColor, h })
                }
                radius="var(--radius-md)"
                width={220}
              />
            </div>
          )}
        </div>

        <div
          aria-label="Color picker type"
          className="grid grid-cols-2 gap-1 rounded-lg bg-muted/45 p-1"
          role="tablist"
        >
          <Button
            aria-controls="color-picker-wheel"
            aria-selected={pickerMode === "wheel"}
            id="color-picker-wheel-tab"
            onClick={() => setPickerMode("wheel")}
            role="tab"
            size="sm"
            type="button"
            variant="tab"
          >
            Wheel
          </Button>
          <Button
            aria-controls="color-picker-square"
            aria-selected={pickerMode === "square"}
            id="color-picker-square-tab"
            onClick={() => setPickerMode("square")}
            role="tab"
            size="sm"
            type="button"
            variant="tab"
          >
            Square
          </Button>
        </div>
      </div>
    </div>
  );
}
