import { useMemo, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
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
const isTauri = typeof window !== "undefined" && Boolean(window.__TAURI__);

async function waitForMinimumFeedback(startedAt: number) {
  const remainingTime = MIN_COMPILE_FEEDBACK_MS - (performance.now() - startedAt);

  if (remainingTime > 0) {
    await new Promise((resolve) => window.setTimeout(resolve, remainingTime));
  }
}

function getApiBase() {
  const environmentBase = import.meta.env.VITE_API_BASE as string | undefined;

  if (environmentBase) {
    return environmentBase.replace(/\/$/, "");
  }

  if (import.meta.env.DEV) {
    return "";
  }

  const { protocol, hostname, port } = window.location;

  return `${protocol}//${hostname}${port ? `:${port}` : ""}`;
}

function getEmbedBase() {
  const environmentBase = import.meta.env.VITE_EMBED_BASE as string | undefined;

  if (environmentBase) {
    return environmentBase.replace(/\/$/, "");
  }

  return isTauri ? "liveesh://wallpaper" : window.location.origin;
}

export function Compiler({ settings }: CompilerProps) {
  const [compiledSettings, setCompiledSettings] = useState<WallpaperSettings>();
  const [embedUrl, setEmbedUrl] = useState("");
  const [isCompiling, setIsCompiling] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState("");
  const apiBase = useMemo(() => getApiBase(), []);
  const embedBase = useMemo(() => getEmbedBase(), []);
  const currentEmbedUrl = compiledSettings === settings ? embedUrl : "";
  const isCopied = copiedUrl === currentEmbedUrl && currentEmbedUrl.length > 0;

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

      const link = embedBase.startsWith("liveesh://")
        ? `${embedBase}/${id}`
        : `${embedBase}/embed/${id}`;

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
    <div className="flex min-w-0 flex-wrap items-end justify-center gap-2.5">
      <div className="flex flex-col gap-1.5">
        <Button
          className="h-10 rounded-full px-4 text-[13px]"
          disabled={isCompiling}
          onClick={handleCompile}
          type="button"
          variant="light"
        >
          {isCompiling && <Spinner data-icon="inline-start" />}
          {isCompiling ? "Compiling…" : "Compile"}
        </Button>
      </div>

      <AnimatePresence initial={false} mode="popLayout">
        {currentEmbedUrl && (
          <motion.div
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            className="flex min-w-0 flex-col gap-1.5"
            exit={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
            initial={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
            key={currentEmbedUrl}
            transition={{ type: "spring", duration: 0.3, bounce: 0 }}
          >
            <span className="px-1 text-[11px] font-medium leading-none text-muted-foreground">
              Generated link
            </span>
            <div className="flex h-10 min-w-0 items-center rounded-full bg-muted p-1 pl-3">
              <a
                className="max-w-52 truncate font-mono text-[11px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline sm:max-w-64"
                href={currentEmbedUrl}
                rel="noreferrer"
                target="_blank"
                title={currentEmbedUrl}
              >
                {currentEmbedUrl}
              </a>
              <Button
                aria-label={isCopied ? "Wallpaper link copied" : "Copy wallpaper link"}
                className="ml-2 rounded-full"
                onClick={handleCopy}
                size="icon-lg"
                type="button"
                variant="ghost"
              >
                <AnimatePresence initial={false} mode="wait">
                  <motion.span
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
                    initial={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
                    key={isCopied ? "copied" : "copy"}
                    transition={{ type: "spring", duration: 0.2, bounce: 0 }}
                  >
                    <HugeiconsIcon
                      aria-hidden="true"
                      data-icon="inline-start"
                      icon={isCopied ? CheckmarkCircle01Icon : Copy01Icon}
                      strokeWidth={1.8}
                    />
                  </motion.span>
                </AnimatePresence>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p aria-live="polite" className="sr-only" role="status">
        {isCompiling
          ? "Compiling wallpaper"
          : currentEmbedUrl
            ? "Wallpaper compiled. The link is ready."
            : ""}
      </p>
    </div>
  );
}
