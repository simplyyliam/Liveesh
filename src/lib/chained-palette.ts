import { hsvaToRgba, type HsvaColor } from "@uiw/react-color";
import type { WallpaperColors } from "@/shared/types/wallpaper";

type LinearRgb = {
  r: number;
  g: number;
  b: number;
};

type Oklch = {
  l: number;
  c: number;
  h: number;
};

const toneSteps = [
  { lightnessLift: 0.48, chromaScale: 0.32 },
  { lightnessLift: 0.32, chromaScale: 0.58 },
  { lightnessLift: 0.16, chromaScale: 0.82 },
  { lightnessLift: 0, chromaScale: 1 },
] as const;

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function srgbToLinear(channel: number) {
  const normalized = channel / 255;

  return normalized <= 0.04045
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
}

function linearToSrgb(channel: number) {
  const normalized =
    channel <= 0.0031308
      ? channel * 12.92
      : 1.055 * channel ** (1 / 2.4) - 0.055;

  return Math.round(clamp(normalized) * 255);
}

function rgbToOklch(r: number, g: number, b: number): Oklch {
  const linearR = srgbToLinear(r);
  const linearG = srgbToLinear(g);
  const linearB = srgbToLinear(b);

  const l = Math.cbrt(
    0.4122214708 * linearR +
      0.5363325363 * linearG +
      0.0514459929 * linearB,
  );
  const m = Math.cbrt(
    0.2119034982 * linearR +
      0.6806995451 * linearG +
      0.1073969566 * linearB,
  );
  const s = Math.cbrt(
    0.0883024619 * linearR +
      0.2817188376 * linearG +
      0.6299787005 * linearB,
  );

  const lightness = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const labB = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const hue = (Math.atan2(labB, a) * 180) / Math.PI;

  return {
    l: lightness,
    c: Math.hypot(a, labB),
    h: hue < 0 ? hue + 360 : hue,
  };
}

function oklchToLinearRgb({ l, c, h }: Oklch): LinearRgb {
  const hue = (h * Math.PI) / 180;
  const a = c * Math.cos(hue);
  const labB = c * Math.sin(hue);
  const lRoot = l + 0.3963377774 * a + 0.2158037573 * labB;
  const mRoot = l - 0.1055613458 * a - 0.0638541728 * labB;
  const sRoot = l - 0.0894841775 * a - 1.291485548 * labB;
  const linearL = lRoot ** 3;
  const linearM = mRoot ** 3;
  const linearS = sRoot ** 3;

  return {
    r:
      4.0767416621 * linearL -
      3.3077115913 * linearM +
      0.2309699292 * linearS,
    g:
      -1.2684380046 * linearL +
      2.6097574011 * linearM -
      0.3413193965 * linearS,
    b:
      -0.0041960863 * linearL -
      0.7034186147 * linearM +
      1.707614701 * linearS,
  };
}

function isInSrgbGamut(color: LinearRgb) {
  return Object.values(color).every((channel) => channel >= 0 && channel <= 1);
}

function findMaxChroma(lightness: number, hue: number) {
  let low = 0;
  let high = 0.4;

  for (let index = 0; index < 20; index += 1) {
    const chroma = (low + high) / 2;
    const color = oklchToLinearRgb({ l: lightness, c: chroma, h: hue });

    if (isInSrgbGamut(color)) {
      low = chroma;
    } else {
      high = chroma;
    }
  }

  return low;
}

function toHex(color: LinearRgb) {
  const channels = [color.r, color.g, color.b].map((channel) =>
    linearToSrgb(channel).toString(16).padStart(2, "0"),
  );

  return `#${channels.join("")}`;
}

export function generateChainedPalette(hsva: HsvaColor): WallpaperColors {
  const rgb = hsvaToRgba(hsva);
  const base = rgbToOklch(rgb.r, rgb.g, rgb.b);
  const baseMaxChroma = findMaxChroma(base.l, base.h);
  const baseChromaRatio =
    baseMaxChroma === 0 ? 0 : clamp(base.c / baseMaxChroma);

  return toneSteps.map(({ lightnessLift, chromaScale }) => {
    const lightness = base.l + (1 - base.l) * lightnessLift;
    const maxChroma = findMaxChroma(lightness, base.h);
    const chroma = maxChroma * baseChromaRatio * chromaScale;

    return toHex(oklchToLinearRgb({ l: lightness, c: chroma, h: base.h }));
  }) as WallpaperColors;
}
