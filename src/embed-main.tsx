import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import EmbedPage from "./pages/embed/EmbedPage";

export function mount() {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <EmbedPage />
    </StrictMode>,
  );
}
