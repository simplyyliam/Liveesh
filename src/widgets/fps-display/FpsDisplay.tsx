type FpsDisplayProps = {
  fps: number;
};

export function FpsDisplay({ fps }: FpsDisplayProps) {
  const displayFps = Math.max(0, Math.round(fps));

  return (
    <output
      aria-label={`${displayFps} frames per second`}
      className="flex size-6 gap-1 w-fit px-1.5 shrink-0 items-center justify-center rounded-md bg-primary/10 font-mono text-foreground tabular-nums"
      title={`${displayFps} frames per second`}
    >
      <span className="text-xs leading-[0.8] font-medium">{displayFps}</span>
      <span className="text-xs leading-none text-muted-foreground">fps</span>
    </output>
  );
}
