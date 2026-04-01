import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { defaultSettings, type WallpaperSettings } from "./types/fluidMesh";
import "./App.css";
import { ControllerContainer, Preview } from "./components";

const isTauri = !!window.__TAURI__;

const getApiBase = () => {
  const envBase = import.meta.env.VITE_API_BASE as string | undefined;
  if (envBase) return envBase.replace(/\/$/, "");

  if (import.meta.env.DEV) {
    return "";
  }

  const { protocol, hostname, port } = window.location;
  return `${protocol}//${hostname}${port ? `:${port}` : ""}`;
};

const getEmbedBase = () => {
  const envBase = import.meta.env.VITE_EMBED_BASE as string | undefined;
  if (envBase) return envBase.replace(/\/$/, "");
  if (isTauri) return "liveesh://wallpaper";
  return window.location.origin;
};

export default function App() {
  const [settings, setSettings] = useState<WallpaperSettings>(defaultSettings);
  const [embedId] = useState(() => {
    const match = window.location.pathname.match(/\/embed\/([a-zA-Z0-9-]+)/);
    return match?.[1] ?? null;
  });
  const [embedUrl, setEmbedUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [fps, setFps] = useState(0);
  const [adaptiveScale, setAdaptiveScale] = useState(
    defaultSettings.renderScale,
  );
  const [adaptiveOctaves, setAdaptiveOctaves] = useState(
    defaultSettings.fbmOctaves,
  );

  const isEmbed = Boolean(embedId);
  // const palette = palettes[settings.paletteIndex];
  const apiBase = useMemo(() => getApiBase(), []);
  const embedBase = useMemo(() => getEmbedBase(), []);

  useEffect(() => {
    let frameId = 0;
    const lastTime = performance.now();
    let lastReport = lastTime;
    let frames = 0;

    const loop = (time: number) => {
      frames += 1;
      const elapsed = time - lastReport;
      if (elapsed >= 500) {
        const fpsValue = (frames / elapsed) * 1000;
        setFps(Math.round(fpsValue));
        frames = 0;
        lastReport = time;
      }
      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, []);

  useEffect(() => {
    setAdaptiveScale(settings.renderScale);
    const clampedOctaves = Math.max(
      2,
      Math.min(4, Math.round(settings.fbmOctaves)),
    );
    setAdaptiveOctaves(clampedOctaves);
  }, [settings.renderScale, settings.fbmOctaves]);

  useEffect(() => {
    if (!settings.adaptiveMode) return;
    if (!fps) return;

    const minOctaves = 2;
    const maxOctaves = Math.max(
      2,
      Math.min(4, Math.round(settings.fbmOctaves)),
    );

    let nextOctaves = adaptiveOctaves;
    if (fps < 50) {
      nextOctaves = Math.max(minOctaves, adaptiveOctaves - 1);
    } else if (fps > 58) {
      nextOctaves = Math.min(maxOctaves, adaptiveOctaves + 1);
    }

    let targetScale = adaptiveScale;
    if (fps < 50 && nextOctaves === minOctaves) {
      targetScale = adaptiveScale - 0.05;
    } else if (fps > 58 && nextOctaves === maxOctaves) {
      targetScale = adaptiveScale + 0.02;
    }

    targetScale = Math.max(0.5, Math.min(1, targetScale));
    const smoothedScale = adaptiveScale * 0.9 + targetScale * 0.1;

    setAdaptiveOctaves(nextOctaves);
    setAdaptiveScale(smoothedScale);
  }, [
    adaptiveOctaves,
    adaptiveScale,
    fps,
    settings.adaptiveMode,
    settings.fbmOctaves,
  ]);

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

  const updateSettings = (patch: Partial<WallpaperSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  };

  const handleCompile = async () => {
    setIsSaving(true);
    setStatusMessage("");

    try {
      const response = await axios.post(`${apiBase}/api/wallpapers`, {
        settings,
      });
      const id = response.data.id;
      if (!id || typeof id !== "string") {
        throw new Error("Missing wallpaper id");
      }
      const link = embedBase.startsWith("liveesh://")
        ? `${embedBase}/${id}`
        : `${embedBase}/embed/${id}`;
      setEmbedUrl(link);
      setStatusMessage("Saved. Your embed link is ready.");
    } catch (error) {
      setStatusMessage("Could not save this wallpaper. Try again.");
      console.log("Error", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className={`w-screen h-screen overflow-hidden bg-[#0A0A0A]`}>
      <div
        className="flex flex-col items-center justify-center w-full h-full gap-2.5 p-2.5"
        style={{
          ["--blur-strength" as string]: `${settings.blurStrength}px`,
          ["--noise-opacity" as string]: settings.noiseAmount.toString(),
          ["--grain-scale" as string]: `${settings.grainScale}px`,
        }}
      >
        <Preview adaptiveOctaves={adaptiveOctaves} adaptiveScale={adaptiveScale} settings={settings}/>
        <ControllerContainer/>

        {/* <div className="blur-layer" aria-hidden="true" />
        <div className="noise-layer" aria-hidden="true" /> */}
        <div className="text-black absolute top-5 left-5">{fps} fps</div>
        {isEmbed && statusMessage && (
          <div className="embed-status">{statusMessage}</div>
        )}
      </div>
    </main>
  );
}
