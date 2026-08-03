import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAdaptivePerformance } from "../../features/preview";
import { getApiBase } from "../../lib/api";
import {
  defaultSettings,
  type WallpaperSettings,
} from "../../shared/types/wallpaper";
import { WallpaperPreview } from "../../widgets/wallpaper-preview";

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
      <div className="flex h-full w-full flex-col items-center justify-center gap-2.5 p-1.5">
        <WallpaperPreview
          adaptiveOctaves={adaptiveOctaves}
          adaptiveScale={adaptiveScale}
          settings={settings}
        />
        {statusMessage && <div className="embed-status">{statusMessage}</div>}
      </div>
    </main>
  );
}
