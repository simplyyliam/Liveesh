import { useCallback, useEffect, useMemo, useRef } from "react";
import { animate, useMotionValue, type PanInfo } from "motion/react";

type SnapPanelOptions = {
  edgePadding?: number;
  mobileEdgePadding?: number;
  mobileBreakpoint?: number;
};

type Bounds = {
  maxX: number;
  maxY: number;
  padding: number;
};

function getEdgePadding({
  edgePadding = 16,
  mobileEdgePadding = 12,
  mobileBreakpoint = 640,
}: SnapPanelOptions) {
  return window.innerWidth < mobileBreakpoint ? mobileEdgePadding : edgePadding;
}

function getBounds(element: HTMLElement, options: SnapPanelOptions): Bounds {
  const padding = getEdgePadding(options);

  return {
    maxX: Math.max(padding, window.innerWidth - element.offsetWidth - padding),
    maxY: Math.max(padding, window.innerHeight - element.offsetHeight - padding),
    padding,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function projectPosition(current: number, velocity: number) {
  const decelerationRate = 0.998;

  return current + (velocity / 1000) * (decelerationRate / (1 - decelerationRate));
}

function animateMotionValue(value: ReturnType<typeof useMotionValue<number>>, target: number, velocity = 0) {
  animate(value, target, {
    type: "spring",
    bounce: 0,
    duration: 0.42,
    velocity,
  });
}

export function useSnapPanelPosition(options: SnapPanelOptions = {}) {
  const panelRef = useRef<HTMLElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const {
    edgePadding = 16,
    mobileBreakpoint = 640,
    mobileEdgePadding = 12,
  } = options;
  const resolvedOptions = useMemo(
    () => ({
      edgePadding,
      mobileBreakpoint,
      mobileEdgePadding,
    }),
    [edgePadding, mobileBreakpoint, mobileEdgePadding],
  );

  const snapToBounds = useCallback(
    (info?: PanInfo) => {
      const panel = panelRef.current;

      if (!panel) {
        return;
      }

      const { maxX, maxY, padding } = getBounds(panel, resolvedOptions);
      const projectedX = projectPosition(x.get(), info?.velocity.x ?? 0);
      const projectedY = projectPosition(y.get(), info?.velocity.y ?? 0);
      const panelCenterX = projectedX + panel.offsetWidth / 2;
      const panelCenterY = projectedY + panel.offsetHeight / 2;
      const viewportMidX = window.innerWidth / 2;
      const snapTopZone = window.innerHeight * 0.22;
      const snapBottomZone = window.innerHeight * 0.78;

      const nextX = panelCenterX < viewportMidX ? padding : maxX;
      const nextY =
        panelCenterY < snapTopZone
          ? padding
          : panelCenterY > snapBottomZone
            ? maxY
            : clamp(projectedY, padding, maxY);

      animateMotionValue(x, nextX, info?.velocity.x);
      animateMotionValue(y, nextY, info?.velocity.y);
    },
    [resolvedOptions, x, y],
  );

  useEffect(() => {
    const panel = panelRef.current;

    if (!panel) {
      return;
    }

    const setInitialPosition = () => {
      const { maxX, padding } = getBounds(panel, resolvedOptions);

      x.set(maxX);
      y.set(padding);
    };

    setInitialPosition();

    const resizeObserver = new ResizeObserver(() => snapToBounds());
    const handleResize = () => snapToBounds();

    resizeObserver.observe(panel);
    window.addEventListener("resize", handleResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, [
    resolvedOptions,
    snapToBounds,
    x,
    y,
  ]);

  return {
    panelRef,
    x,
    y,
    snapToBounds,
  };
}
