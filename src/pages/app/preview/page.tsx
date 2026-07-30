import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAdaptivePerformance } from "../../../features/preview";
import {
  defaultSettings,
  type WallpaperSettings,
} from "../../../shared/types/wallpaper";
import { WallpaperPreview } from "../../../widgets/wallpaper-preview";

const getApiBase = () => {
  const envBase = import.meta.env.VITE_API_BASE as string | undefined;
  if (envBase) return envBase.replace(/\/$/, "");

  if (import.meta.env.DEV) {
    return "";
  }

  const { protocol, hostname, port } = window.location;
  return `${protocol}//${hostname}${port ? `:${port}` : ""}`;
};

export default function LivePreview() {
  const [settings, setSettings] = useState<WallpaperSettings>(defaultSettings);
  const [embedId] = useState(() => {
    const match = window.location.pathname.match(/\/embed\/([a-zA-Z0-9-]+)/);
    return match?.[1] ?? null;
  });
  const [statusMessage, setStatusMessage] = useState("");
  const { adaptiveOctaves, adaptiveScale, fps } =
    useAdaptivePerformance(settings);

  const isEmbed = Boolean(embedId);
  const apiBase = useMemo(() => getApiBase(), []);

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
    <main className="h-screen w-screen overflow-hidden bg-[#0A0A0A]">
      <div
        className="flex h-full w-full flex-col items-center justify-center gap-2.5 p-2.5"
        style={{
          ["--blur-strength" as string]: `${settings.blurStrength}px`,
          ["--noise-opacity" as string]: settings.noiseAmount.toString(),
          ["--grain-scale" as string]: `${settings.grainScale}px`,
        }}
      >
        <WallpaperPreview
          adaptiveOctaves={adaptiveOctaves}
          adaptiveScale={adaptiveScale}
          settings={settings}
        />
        {/* <div className="blur-layer" aria-hidden="true" />
        <div className="noise-layer" aria-hidden="true" /> */}
        <div className="absolute top-5 left-5 text-black">{fps} fps</div>
        {isEmbed && statusMessage && (
          <div className="embed-status">{statusMessage}</div>
        )}
      </div>
    </main>
  );
}
