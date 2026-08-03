import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  NoiseOverlay,
  WallpaperCanvas,
  useAdaptivePerformance,
} from "../../features/preview";
import { getApiBase } from "../../lib/api";
import { palettes } from "../../lib/palettes";
import {
  defaultSettings,
  type WallpaperSettings,
} from "../../shared/types/wallpaper";

export default function EmbedPage() {
  const [embedId] = useState(() => {
    const match = window.location.pathname.match(
      /^\/embed\/([a-zA-Z0-9-]+)\/?$/,
    );

    return match?.[1];
  });
  const [settings, setSettings] = useState<WallpaperSettings>(defaultSettings);
  const [statusMessage, setStatusMessage] = useState("");
  const apiBase = useMemo(() => getApiBase(), []);
  const { adaptiveOctaves, adaptiveScale } = useAdaptivePerformance(
    settings,
    false,
  );
  const palette = useMemo(() => {
    const preset = palettes[settings.paletteIndex];

    return {
      ...preset,
      anchors: settings.colors,
    };
  }, [settings.colors, settings.paletteIndex]);
  const canvasSettings = useMemo(
    () => ({
      ...settings,
      renderScale: settings.adaptiveMode
        ? adaptiveScale
        : settings.renderScale,
      fbmOctaves: settings.adaptiveMode
        ? adaptiveOctaves
        : settings.fbmOctaves,
    }),
    [adaptiveOctaves, adaptiveScale, settings],
  );

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
    <>
      <WallpaperCanvas
        fullscreen
        palette={palette}
        settings={canvasSettings}
      />
      <NoiseOverlay opacity={settings.grainOpacity} rounded={0} />
      {statusMessage && <div className="embed-status">{statusMessage}</div>}
    </>
  );
}
