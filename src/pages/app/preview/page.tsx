import { useCallback, useEffect, useRef, useState } from "react";
import type { ShaderControlKey } from "@/features/shader-editor";
import {
  loadWallpaperSettings,
  saveWallpaperSettings,
} from "@/lib/wallpaper-settings-storage";
import { useAdaptivePerformance } from "../../../features/preview";
import {
  type WallpaperColors,
  type WallpaperPattern,
  type WallpaperSettings,
} from "../../../shared/types/wallpaper";
import { WallpaperPreview } from "../../../widgets/wallpaper-preview";
import { AppSidePanel } from "../../../widgets/app-side-panel";
import { Toolbar } from "../../../widgets/app-toolbar";

export default function LivePreview() {
  const [settings, setSettings] = useState<WallpaperSettings>(() =>
    loadWallpaperSettings(),
  );
  const settingsRef = useRef(settings);
  const { adaptiveOctaves, adaptiveScale, fps } =
    useAdaptivePerformance(settings);

  const updateShaderSetting = useCallback(
    (key: ShaderControlKey, value: number) => {
      setSettings((current) => ({ ...current, [key]: value }));
    },
    [],
  );
  const updatePattern = useCallback((pattern: WallpaperPattern) => {
    setSettings((current) => ({ ...current, pattern }));
  }, []);

  const updateColors = useCallback((colors: WallpaperColors) => {
    setSettings((current) => ({ ...current, colors }));
  }, []);

  useEffect(() => {
    settingsRef.current = settings;

    const saveTimer = window.setTimeout(() => {
      saveWallpaperSettings(settings);
    }, 150);

    return () => window.clearTimeout(saveTimer);
  }, [settings]);

  useEffect(() => {
    const flushSettings = () => {
      saveWallpaperSettings(settingsRef.current);
    };

    window.addEventListener("pagehide", flushSettings);

    return () => window.removeEventListener("pagehide", flushSettings);
  }, []);

  return (
    <main className="h-screen w-screen overflow-hidden">
      <div
        className="flex h-full w-full flex-col items-center justify-center gap-2.5 p-1.5"
      >
        <WallpaperPreview
          adaptiveOctaves={adaptiveOctaves}
          adaptiveScale={adaptiveScale}
          settings={settings}
        />
        <AppSidePanel
          colors={settings.colors}
          fps={fps}
          onColorsChange={updateColors}
          onPatternChange={updatePattern}
          onSettingChange={updateShaderSetting}
          pattern={settings.pattern}
          settings={settings}
        />
        <Toolbar settings={settings} />
      </div>
    </main>
  );
}
