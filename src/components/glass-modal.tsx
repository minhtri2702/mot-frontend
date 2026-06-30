"use client";

import { useState, useRef, useEffect, useCallback, type ReactNode } from "react";
import { X } from "lucide-react";

interface GlassModalProps {
  /** The trigger element (button/icon) */
  trigger: ReactNode;
  /** Content to show inside the modal */
  children: ReactNode;
  /** Optional title for the modal header */
  title?: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Optional icon to show in header */
  headerIcon?: ReactNode;
  /** Whether the modal is open (controlled) */
  open?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Modal width (default: 420px) */
  width?: string;
  /** Modal height (default: auto) */
  height?: string;
  /** Trigger button class name */
  triggerClassName?: string;
}

export default function GlassModal({
  trigger,
  children,
  title,
  subtitle,
  headerIcon,
  open: controlledOpen,
  onOpenChange,
  width = "min(420px, calc(100vw - 48px))",
  height = "auto",
  triggerClassName = "",
}: GlassModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [phase, setPhase] = useState<"idle" | "hover" | "morphing" | "open">("idle");
  const [showContent, setShowContent] = useState(false);

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  const triggerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleOpen = useCallback(() => {
    setPhase("morphing");
    setIsOpen(true);

    setTimeout(() => {
      setPhase("open");
      setTimeout(() => {
        setShowContent(true);
      }, 100);
    }, 450);
  }, [setIsOpen]);

  const handleClose = useCallback(() => {
    setShowContent(false);
    setPhase("morphing");

    setTimeout(() => {
      setPhase("idle");
      setIsOpen(false);
    }, 400);
  }, [setIsOpen]);

  return (
    <>
      {/* ===== Trigger ===== */}
      <div
        ref={triggerRef}
        onClick={phase === "idle" || phase === "hover" ? handleOpen : undefined}
        onMouseEnter={() => phase === "idle" && setPhase("hover")}
        onMouseLeave={() => phase === "hover" && setPhase("idle")}
        className={`
          inline-flex items-center justify-center
          transition-all duration-300 ease-out cursor-pointer
          ${phase === "idle" ? "opacity-70 hover:opacity-100" : ""}
          ${phase === "hover" ? "opacity-100 scale-105" : ""}
          ${phase === "morphing" || phase === "open" ? "opacity-0 pointer-events-none" : ""}
          ${triggerClassName}
        `}
      >
        {trigger}
      </div>

      {/* ===== Backdrop ===== */}
      {(phase === "morphing" || phase === "open") && (
        <div
          className="fixed inset-0 z-[60] transition-all duration-500"
          style={{
            backgroundColor: phase === "morphing"
              ? "rgba(0,0,0,0)"
              : "rgba(0,0,0,0.35)",
            backdropFilter: phase === "morphing"
              ? "blur(0px)"
              : "blur(6px)",
            WebkitBackdropFilter: phase === "morphing"
              ? "blur(0px)"
              : "blur(6px)",
          }}
          onClick={handleClose}
        />
      )}

      {/* ===== Morphing Panel ===== */}
      {(phase === "morphing" || phase === "open") && (
        <div
          ref={panelRef}
          className="fixed z-[70] flex flex-col overflow-hidden transition-all duration-500 ease-out"
          style={{
            bottom: "24px",
            right: "24px",
            width: phase === "morphing" ? "56px" : width,
            height: phase === "morphing" ? "56px" : height,
            maxHeight: phase === "open" ? "min(650px, calc(100vh - 48px))" : "56px",
            borderRadius: phase === "morphing" ? "9999px" : "24px",
            backgroundColor: phase === "morphing" ? "rgba(24,24,27,0.6)" : "#18181B",
            borderWidth: "1px",
            borderStyle: "solid",
            borderColor: phase === "morphing" ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.08)",
            boxShadow: "0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)",
            opacity: 1,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* ===== Header ===== */}
          {(title || subtitle) && (
            <div
              className="shrink-0 px-5 py-4 border-b border-white/[0.06]"
              style={{
                opacity: showContent ? 1 : 0,
                transform: showContent ? "translateY(0)" : "translateY(-12px)",
                transition: "opacity 0.25s ease-out, transform 0.25s ease-out",
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {headerIcon && (
                    <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
                      {headerIcon}
                    </div>
                  )}
                  <div>
                    {title && <h2 className="text-base font-semibold text-white/90">{title}</h2>}
                    {subtitle && <p className="text-[11px] text-white/40">{subtitle}</p>}
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-all"
                  title="Đóng"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* ===== Content ===== */}
          <div
            className="flex-1 overflow-y-auto"
            style={{
              opacity: showContent ? 1 : 0,
              transition: "opacity 0.3s ease-out 0.1s",
            }}
          >
            {children}
          </div>
        </div>
      )}
    </>
  );
}
