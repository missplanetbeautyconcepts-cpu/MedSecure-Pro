import { ReactNode, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Lock } from "lucide-react";
import { Button } from "./Button";
import { cn } from "../../lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, footer, className }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-[2px]"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
              className={cn(
                "w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden pointer-events-auto border border-slate-200",
                className
              )}
            >
              <div className="flex items-center gap-4 px-6 py-5 bg-slate-50 border-b border-slate-100">
                <div className="w-10 h-10 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Lock className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 id="modal-title" className="text-lg font-bold text-slate-900 leading-tight">{title}</h3>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-0.5">Authorization Required</p>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close modal" className="rounded-full p-1 h-8 w-8 text-slate-400">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="px-6 py-6 overflow-y-auto max-h-[70vh]">
                {children}
              </div>
              {footer && (
                <div className="flex justify-end gap-3 px-6 py-5 bg-slate-50 border-t border-slate-100">
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
