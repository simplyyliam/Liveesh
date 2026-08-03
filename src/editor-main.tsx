import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "@/components/ui/toast";
import App from "./App";

export function mount() {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <Toaster>
        <App />
      </Toaster>
    </StrictMode>,
  );
}
