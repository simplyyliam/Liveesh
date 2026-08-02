import type { PointerEvent, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "motion/react";

export type PanelViewId = "shader" | "colors";

type PanelLayoutProps = {
  activeView: PanelViewId;
  children: ReactNode;
  headerActions: ReactNode;
  isCollapsed: boolean;
  onHeaderPointerDown: (event: PointerEvent<HTMLDivElement>) => void;
  onViewChange: (view: PanelViewId) => void;
};

const panelViews: Array<{ id: PanelViewId; label: string }> = [
  { id: "shader", label: "Shader" },
  { id: "colors", label: "Color" },
];

export function PanelLayout({
  activeView,
  children,
  headerActions,
  isCollapsed,
  onHeaderPointerDown,
  onViewChange,
}: PanelLayoutProps) {
  return (
    <div className="flex flex-col gap-4 p-2">
      <div
        className="flex min-h-10 cursor-grab touch-none select-none items-center justify-between rounded-[12px] px-2 text-foreground"
        onPointerDown={onHeaderPointerDown}
      >
        <nav
          aria-label="Panel views"
          className="flex items-center gap-1"
          role="tablist"
        >
          {panelViews.map((view) => {
            const isActive = activeView === view.id;

            return (
              <Button
                aria-controls={`panel-view-${view.id}`}
                aria-selected={isActive}
                id={`panel-tab-${view.id}`}
                key={view.id}
                onClick={() => onViewChange(view.id)}
                onPointerDown={(event) => event.stopPropagation()}
                role="tab"
                size="sm"
                type="button"
                variant={isActive ? "secondary" : "ghost"}
              >
                {view.label}
              </Button>
            );
          })}
        </nav>

        <div
          className="flex items-center gap-1"
          onPointerDown={(event) => event.stopPropagation()}
        >
          {headerActions}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            id="wallpaper-panel-content"
            animate={{ height: "auto", opacity: 1 }}
            className="overflow-hidden"
            exit={{ height: 0, opacity: 0 }}
            initial={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", duration: 0.3, bounce: 0 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
