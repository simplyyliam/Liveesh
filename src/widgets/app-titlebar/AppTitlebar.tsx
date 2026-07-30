import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react"
import { Minus, Square, X } from "lucide-react";
import { getCurrentWindow } from "@tauri-apps/api/window"

const REVEAL_ZONE_HEIGHT = 6
const HIDE_DELAY = 150


export const Apptitlebar = () => {
  const [visible, setVisible] = useState(false);
  const hideTimeout = useRef<ReturnType<typeof setTimeout>>(0)

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      const nearTop = e.clientY <= REVEAL_ZONE_HEIGHT
      const overTitlebar = (e.target as HTMLElement)?.closest(
        "[data-titlebar]"
      )

      if (nearTop || overTitlebar) {
        clearTimeout(hideTimeout.current)
        setVisible(true)
      } else if (visible) {
        clearTimeout(hideTimeout.current)
        hideTimeout.current = setTimeout(() => setVisible(false), HIDE_DELAY)
      }
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      clearTimeout(hideTimeout.current)
    }
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          data-titlebar
          initial={{ y: "-100%" }}
          animate={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
          className="fixed inset-x-0 top-0 z-50 w-full overflow-hidden bg-accent"
        >
          <div
            data-tauri-drag-region
            className="flex items-center justify-between w-full select-none"
          >
            <span className="flex items-center justify-center p-1.5"></span>
            <div className="flex items-center justify-between">
              <button
                onClick={() => getCurrentWindow().minimize()}
                className="flex items-center justify-center py-2.5 px-4 hover:bg-neutral-300 transition-all ease-linear cursor-pointer"
              >
                <Minus size={16} />
              </button>
              <button
                onClick={() => getCurrentWindow().toggleMaximize()}
                className="flex items-center justify-center py-2.5 px-4 hover:bg-neutral-300 transition-all ease-linear cursor-pointer"
              >
                <Square size={16} />
              </button>
              <button
                onClick={() => getCurrentWindow().close()}
                className="flex items-center justify-center py-2.5 px-4 hover:bg-neutral-300 transition-all ease-linear cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
