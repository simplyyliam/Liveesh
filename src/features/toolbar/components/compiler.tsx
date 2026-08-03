import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { getApiBase } from "@/lib/api";
import { toast } from "@/lib/toast-manager";
import type { WallpaperSettings } from "@/shared/types/wallpaper";
import {
  CheckmarkCircle01Icon,
  Copy01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion } from "motion/react";

type CompilerProps = {
  settings: WallpaperSettings;
};

const MIN_COMPILE_FEEDBACK_MS = 700;
const GENERATED_LINK_VISIBILITY_MS = 6_000;
const COPY_DISMISS_DELAY_MS = 350;
const DEFAULT_EMBED_BASE = "https://liveesh.vercel.app";

async function waitForMinimumFeedback(startedAt: number) {
  const remainingTime = MIN_COMPILE_FEEDBACK_MS - (performance.now() - startedAt);

  if (remainingTime > 0) {
    await new Promise((resolve) => window.setTimeout(resolve, remainingTime));
  }
}

function getEmbedBase() {
  const environmentBase = import.meta.env.VITE_EMBED_BASE as string | undefined;

  return (environmentBase || DEFAULT_EMBED_BASE).replace(/\/$/, "");
}

export function Compiler({ settings }: CompilerProps) {
  const [compiledSettings, setCompiledSettings] = useState<WallpaperSettings>();
  const [embedUrl, setEmbedUrl] = useState("");
  const [isCompiling, setIsCompiling] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState("");
  const copyDismissTimerRef = useRef<number | undefined>(undefined);
  const apiBase = useMemo(() => getApiBase(), []);
  const embedBase = useMemo(() => getEmbedBase(), []);
  const currentEmbedUrl = compiledSettings === settings ? embedUrl : "";
  const isCopied = copiedUrl === currentEmbedUrl && currentEmbedUrl.length > 0;

  useEffect(() => {
    if (!currentEmbedUrl) return;

    const dismissTimer = window.setTimeout(() => {
      setEmbedUrl("");
    }, GENERATED_LINK_VISIBILITY_MS);

    return () => window.clearTimeout(dismissTimer);
  }, [currentEmbedUrl]);

  useEffect(() => {
    return () => window.clearTimeout(copyDismissTimerRef.current);
  }, []);

  async function handleCompile() {
    setIsCompiling(true);
    const startedAt = performance.now();

    try {
      const response = await axios.post(`${apiBase}/api/wallpapers`, {
        settings,
      });
      const id: unknown = response.data?.id;

      if (typeof id !== "string" || id.length === 0) {
        throw new Error("The wallpaper API did not return an ID.");
      }

      const link = `${embedBase}/embed/${id}`;

      await waitForMinimumFeedback(startedAt);
      setCompiledSettings(settings);
      setEmbedUrl(link);
    } catch (error) {
      await waitForMinimumFeedback(startedAt);
      console.error("Unable to compile wallpaper", error);
      toast.add({
        description: "Could not compile this wallpaper. Try again.",
        priority: "high",
        title: "Compile failed",
        type: "error",
      });
    } finally {
      setIsCompiling(false);
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(currentEmbedUrl);
      setCopiedUrl(currentEmbedUrl);
      window.clearTimeout(copyDismissTimerRef.current);
      copyDismissTimerRef.current = window.setTimeout(() => {
        setEmbedUrl("");
      }, COPY_DISMISS_DELAY_MS);
    } catch (error) {
      console.error("Unable to copy wallpaper link", error);
      toast.add({
        description: "Could not copy the wallpaper link.",
        priority: "high",
        title: "Copy failed",
        type: "error",
      });
    }
  }

  return (
    <motion.div
      layout="size"
      transition={{ layout: { type: "spring", duration: 0.3, bounce: 0 } }}
    >
      <Button
        aria-label={
          isCompiling
            ? "Compiling wallpaper"
            : currentEmbedUrl
              ? isCopied
                ? "Wallpaper link copied"
                : "Copy generated wallpaper link"
              : "Compile wallpaper"
        }
        className="h-10 max-w-[calc(100vw-24px)] rounded-full px-4 text-[13px] disabled:opacity-100 bg-card/95 shadow-2xl backdrop-blur-xl"
        disabled={isCompiling}
        onClick={() => {
          if (currentEmbedUrl) {
            void handleCopy();
            return;
          }

          void handleCompile();
        }}
        title={currentEmbedUrl || undefined}
        type="button"
        variant="surface"
      >
        <AnimatePresence initial={false} mode="wait">
          <motion.span
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            className="flex min-w-0 items-center gap-1.5"
            exit={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
            initial={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
            key={
              isCompiling
                ? "compiling"
                : currentEmbedUrl
                  ? isCopied
                    ? "copied"
                    : "link"
                  : "compile"
            }
            transition={{ type: "spring", duration: 0.3, bounce: 0 }}
          >
            {isCompiling ? (
              <>
                <Spinner data-icon="inline-start" />
                <span>Compiling…</span>
              </>
            ) : currentEmbedUrl ? (
              <>
                <span className="max-w-64 truncate font-mono text-[11px]">
                  {currentEmbedUrl}
                </span>
                <HugeiconsIcon
                  aria-hidden="true"
                  data-icon="inline-end"
                  icon={isCopied ? CheckmarkCircle01Icon : Copy01Icon}
                  strokeWidth={1.8}
                />
              </>
            ) : (
              <span>Compile</span>
            )}
          </motion.span>
        </AnimatePresence>
      </Button>

      <p aria-live="polite" className="sr-only" role="status">
        {isCompiling
          ? "Compiling wallpaper"
          : currentEmbedUrl
            ? "Wallpaper compiled. The link is ready."
            : ""}
      </p>
    </motion.div>
  );
}
