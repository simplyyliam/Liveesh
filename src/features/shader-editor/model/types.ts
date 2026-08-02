import type { WallpaperSettings } from "@/shared/types/wallpaper";

export type ShaderControlKey =
  | "grainScale"
  | "grainOpacity"
  | "noiseAmount"
  | "fbmOctaves"
  | "softness"
  | "animationSpeed"
  | "opacity";

export type ShaderControlSectionId = "form" | "motion" | "material";

export type ShaderControlDefinition = {
  key: ShaderControlKey;
  label: string;
  min: number;
  max: number;
  step: number;
  unit?: string;
};

export type ShaderControlSection = {
  id: ShaderControlSectionId;
  title: string;
  controls: ShaderControlDefinition[];
};

export type ShaderSettings = Pick<WallpaperSettings, ShaderControlKey>;
