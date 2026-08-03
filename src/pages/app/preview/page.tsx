import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import type { ShaderControlKey } from "@/features/shader-editor";
import { getApiBase } from "@/lib/api";
import {
  loadWallpaperSettings,
  saveWallpaperSettings,
} from "@/lib/wallpaper-settings-storage";
import { useAdaptivePerformance } from "../../../features/preview";
import {
  defaultSettings,
  type WallpaperColors,
  type WallpaperPattern,
  type WallpaperSettings,
} from "../../../shared/types/wallpaper";
import { WallpaperPreview } from "../../../widgets/wallpaper-preview";
import { AppSidePanel } from "../../../widgets/app-side-panel";
import { Toolbar } from "../../../widgets/app-toolbar";

export default function LivePreview() {
  const [embedId] = useState(() => {
    const match = window.location.pathname.match(/\/embed\/([a-zA-Z0-9-]+)/);
    return match?.[1] ?? null;
  });
  const isEmbed = Boolean(embedId);
  const [settings, setSettings] = useState<WallpaperSettings>(() =>
    isEmbed ? defaultSettings : loadWallpaperSettings(),
  );
  const [statusMessage, setStatusMessage] = useState("");
  const settingsRef = useRef(settings);
  const { adaptiveOctaves, adaptiveScale, fps } =
    useAdaptivePerformance(settings);

  const apiBase = useMemo(() => getApiBase(), []);
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

    if (isEmbed) return;

    const saveTimer = window.setTimeout(() => {
      saveWallpaperSettings(settings);
    }, 150);

    return () => window.clearTimeout(saveTimer);
  }, [isEmbed, settings]);

  useEffect(() => {
    if (isEmbed) return;

    const flushSettings = () => {
      saveWallpaperSettings(settingsRef.current);
    };

    window.addEventListener("pagehide", flushSettings);

    return () => window.removeEventListener("pagehide", flushSettings);
  }, [isEmbed]);

  useEffect(() => {
    if (!embedId) return;
    let isMounted = true;

    axios
      .get(`${apiBase}/api/wallpapers/${embedId}`)
      .then((response) => {
        if (!isMounted) return;
        setSettings({ ...defaultSettings, ...response.data.settings });
      })
      .catch(() => {
        if (!isMounted) return;
        setStatusMessage("Unable to load this wallpaper.");
      });

    return () => {
      isMounted = false;
    };
  }, [apiBase, embedId]);

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
        {!isEmbed && (
          <>
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
          </>
        )}
        {isEmbed && statusMessage && (
          <div className="embed-status">{statusMessage}</div>
        )}
      </div>
    </main>
  );
}
