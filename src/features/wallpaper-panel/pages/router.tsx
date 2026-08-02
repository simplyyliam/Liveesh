import { useState, type PointerEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  PanelLayout,
  type PanelViewId,
} from "./layout/PanelLayout";
import { Colors, type ColorsViewProps } from "./views/Colors";
import { Shader, type ShaderViewProps } from "./views/Shader";

type PanelRouterProps = ColorsViewProps &
  ShaderViewProps & {
    headerActions: ReactNode;
    isCollapsed: boolean;
    onHeaderPointerDown: (event: PointerEvent<HTMLDivElement>) => void;
  };

export function PanelRouter({
  colors,
  headerActions,
  isCollapsed,
  onColorsChange,
  onHeaderPointerDown,
  onPatternChange,
  onSettingChange,
  pattern,
  settings,
}: PanelRouterProps) {
  const [activeView, setActiveView] = useState<PanelViewId>("shader");

  return (
    <PanelLayout
      activeView={activeView}
      headerActions={headerActions}
      isCollapsed={isCollapsed}
      onHeaderPointerDown={onHeaderPointerDown}
      onViewChange={setActiveView}
    >
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          aria-labelledby={`panel-tab-${activeView}`}
          id={`panel-view-${activeView}`}
          key={activeView}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          initial={{ opacity: 0, y: 4 }}
          role="tabpanel"
          transition={{ type: "spring", duration: 0.3, bounce: 0 }}
        >
          {activeView === "shader" ? (
            <Shader
              onPatternChange={onPatternChange}
              onSettingChange={onSettingChange}
              pattern={pattern}
              settings={settings}
            />
          ) : (
            <Colors colors={colors} onColorsChange={onColorsChange} />
          )}
        </motion.div>
      </AnimatePresence>
    </PanelLayout>
  );
}
