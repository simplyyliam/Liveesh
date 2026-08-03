import {
  defaultSettings,
  type WallpaperColors,
  type WallpaperSettings,
} from "@/shared/types/wallpaper";

const WALLPAPER_SETTINGS_STORAGE_KEY = "liveesh:wallpaper-settings:v1";

const numberSettingKeys = [
  "paletteIndex",
  "blobCount",
  "minSize",
  "maxSize",
  "softness",
  "opacity",
  "blurStrength",
  "noiseAmount",
  "grainScale",
  "grainOpacity",
  "animationSpeed",
  "renderScale",
  "fbmOctaves",
  "seed",
] as const;

function createDefaultSettings(): WallpaperSettings {
  return {
    ...defaultSettings,
    colors: [...defaultSettings.colors] as WallpaperColors,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function restoreSettings(value: unknown): WallpaperSettings {
  const restored = createDefaultSettings();

  if (!isRecord(value)) return restored;

  if (value.pattern === "fluid" || value.pattern === "topographic") {
    restored.pattern = value.pattern;
  }

  if (
    Array.isArray(value.colors) &&
    value.colors.length === 4 &&
    value.colors.every((color) => typeof color === "string")
  ) {
    restored.colors = [...value.colors] as WallpaperColors;
  }

  for (const key of numberSettingKeys) {
    const settingValue = value[key];

    if (typeof settingValue === "number" && Number.isFinite(settingValue)) {
      restored[key] = settingValue;
    }
  }

  if (typeof value.adaptiveMode === "boolean") {
    restored.adaptiveMode = value.adaptiveMode;
  }

  return restored;
}

export function loadWallpaperSettings(): WallpaperSettings {
  if (typeof window === "undefined") return createDefaultSettings();

  try {
    const storedSettings = window.localStorage.getItem(
      WALLPAPER_SETTINGS_STORAGE_KEY,
    );

    return storedSettings
      ? restoreSettings(JSON.parse(storedSettings) as unknown)
      : createDefaultSettings();
  } catch (error) {
    console.warn("Unable to restore wallpaper settings", error);
    return createDefaultSettings();
  }
}

export function saveWallpaperSettings(settings: WallpaperSettings) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      WALLPAPER_SETTINGS_STORAGE_KEY,
      JSON.stringify(settings),
    );
  } catch (error) {
    console.warn("Unable to save wallpaper settings", error);
  }
}
