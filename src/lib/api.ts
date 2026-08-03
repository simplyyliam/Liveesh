const DEFAULT_API_BASE = "https://liveesh.onrender.com";

export function getApiBase() {
  const configuredBase = import.meta.env.VITE_API_BASE as string | undefined;

  return (configuredBase || DEFAULT_API_BASE).replace(/\/$/, "");
}
