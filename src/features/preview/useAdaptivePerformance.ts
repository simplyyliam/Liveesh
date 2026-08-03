import { useEffect, useState } from "react";
import type { WallpaperSettings } from "../../shared/types/wallpaper";

type AdaptivePerformance = {
  adaptiveOctaves: number;
  adaptiveScale: number;
  fps: number;
};

const clampOctaves = (octaves: number) =>
  Math.max(2, Math.min(4, Math.round(octaves)));

export function useAdaptivePerformance(
  settings: WallpaperSettings,
  trackFps = true,
): AdaptivePerformance {
  const [fps, setFps] = useState(0);
  const [adaptive, setAdaptive] = useState(() => ({
    scale: settings.renderScale,
    octaves: clampOctaves(settings.fbmOctaves),
  }));

  useEffect(() => {
    if (!trackFps && !settings.adaptiveMode) return;

    let frameId = 0;
    let lastReport = performance.now();
    let frames = 0;

    const loop = (time: number) => {
      frames += 1;
      const elapsed = time - lastReport;

      if (elapsed >= 500) {
        setFps(Math.round((frames / elapsed) * 1000));
        frames = 0;
        lastReport = time;
      }

      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [settings.adaptiveMode, trackFps]);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      setAdaptive({
        scale: settings.renderScale,
        octaves: clampOctaves(settings.fbmOctaves),
      });
    });

    return () => cancelAnimationFrame(frameId);
  }, [settings.fbmOctaves, settings.renderScale]);

  useEffect(() => {
    if (!settings.adaptiveMode || !fps) return;

    const frameId = requestAnimationFrame(() => {
      const minOctaves = 2;
      const maxOctaves = clampOctaves(settings.fbmOctaves);

      setAdaptive((current) => {
        let nextOctaves = current.octaves;
        if (fps < 50) {
          nextOctaves = Math.max(minOctaves, current.octaves - 1);
        } else if (fps > 58) {
          nextOctaves = Math.min(maxOctaves, current.octaves + 1);
        }

        let targetScale = current.scale;
        if (fps < 50 && nextOctaves === minOctaves) {
          targetScale = current.scale - 0.05;
        } else if (fps > 58 && nextOctaves === maxOctaves) {
          targetScale = current.scale + 0.02;
        }

        targetScale = Math.max(0.5, Math.min(1, targetScale));
        return {
          octaves: nextOctaves,
          scale: current.scale * 0.9 + targetScale * 0.1,
        };
      });
    });

    return () => cancelAnimationFrame(frameId);
  }, [fps, settings.adaptiveMode, settings.fbmOctaves]);

  return {
    adaptiveOctaves: adaptive.octaves,
    adaptiveScale: adaptive.scale,
    fps,
  };
}
