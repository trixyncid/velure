"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { IconAlert, IconCheck, IconClose } from "@/components/icons";

export type ToastTone = "success" | "error" | "warning";

type ToastInput = {
  tone: ToastTone;
  title: string;
  message?: string;
};

type ToastItem = ToastInput & { id: string };

type Timer = {
  remaining: number;
  started: number;
  timeout: number;
};

const ToastContext = createContext<((toast: ToastInput) => void) | null>(null);

const durationFor: Record<ToastTone, number> = {
  success: 4500,
  warning: 6500,
  error: 8000,
};

const eyebrow: Record<ToastTone, string> = {
  success: "Success",
  warning: "Warning",
  error: "Error",
};

const tone: Record<ToastTone, { badge: string; label: string; bar: string }> = {
  success: { badge: "bg-ink text-white", label: "text-gold", bar: "bg-gold/70" },
  warning: { badge: "bg-champagne text-ink", label: "text-[#9a7b45]", bar: "bg-champagne-deep" },
  error: { badge: "bg-sale text-white", label: "text-sale", bar: "bg-sale/70" },
};

export function useToast() {
  const notify = useContext(ToastContext);
  if (!notify) {
    throw new Error("useToast must be used inside the atelier.");
  }
  return notify;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef(new Map<string, Timer>());
  const paused = useRef(false);
  // Mirrors `paused` so the countdown bars can pause visually too.
  const [isPaused, setIsPaused] = useState(false);

  const dismiss = useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer) window.clearTimeout(timer.timeout);
    timers.current.delete(id);
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const arm = useCallback(
    (id: string, remaining: number) => {
      const timer = timers.current.get(id);
      if (timer) window.clearTimeout(timer.timeout);
      timers.current.set(id, {
        remaining,
        started: Date.now(),
        timeout: window.setTimeout(() => dismiss(id), remaining),
      });
    },
    [dismiss],
  );

  const notify = useCallback(
    (toast: ToastInput) => {
      const id = crypto.randomUUID();
      setToasts((current) => [...current, { ...toast, id }].slice(-3));
      if (!paused.current) arm(id, durationFor[toast.tone]);
      else {
        timers.current.set(id, { remaining: durationFor[toast.tone], started: Date.now(), timeout: 0 });
      }
    },
    [arm],
  );

  const pauseAll = useCallback(() => {
    if (paused.current) return;
    paused.current = true;
    setIsPaused(true);
    for (const timer of timers.current.values()) {
      window.clearTimeout(timer.timeout);
      timer.remaining = Math.max(800, timer.remaining - (Date.now() - timer.started));
    }
  }, []);

  const resumeAll = useCallback(() => {
    if (!paused.current) return;
    paused.current = false;
    setIsPaused(false);
    for (const [id, timer] of timers.current) {
      arm(id, timer.remaining);
    }
  }, [arm]);

  useEffect(() => {
    const active = timers.current;
    return () => {
      for (const timer of active.values()) window.clearTimeout(timer.timeout);
      active.clear();
    };
  }, []);

  const value = useMemo(() => notify, [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-label="Notices"
        className="pointer-events-none fixed inset-x-0 top-3 z-[70] flex flex-col items-center gap-2.5 px-3 sm:top-5"
        onMouseEnter={pauseAll}
        onMouseLeave={resumeAll}
        onFocus={pauseAll}
        onBlur={(event) => {
          const next = event.relatedTarget;
          if (next instanceof Node && event.currentTarget.contains(next)) return;
          resumeAll();
        }}
      >
        {[...toasts].reverse().map((toast) => {
          const style = tone[toast.tone];
          return (
            <article
              key={toast.id}
              role={toast.tone === "error" ? "alert" : "status"}
              className="animate-toast-down pointer-events-auto relative w-full max-w-[420px] overflow-hidden rounded-2xl border border-white/60 bg-white/85 shadow-[0_24px_60px_-12px_rgba(28,25,21,0.35),0_0_0_1px_rgba(28,25,21,0.04)] backdrop-blur-xl backdrop-saturate-150"
            >
              <div className="flex items-start gap-3.5 p-4 pr-3">
                <span
                  aria-hidden="true"
                  className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-full ${style.badge}`}
                >
                  {toast.tone === "success" ? (
                    <IconCheck className="size-4" />
                  ) : (
                    <IconAlert className="size-[18px]" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={`text-[10px] tracking-[0.2em] uppercase ${style.label}`}>
                    {eyebrow[toast.tone]}
                  </p>
                  <p className="mt-0.5 text-[15px] leading-snug text-ink">{toast.title}</p>
                  {toast.message ? (
                    <p className="mt-1 text-[13px] leading-5 text-muted">{toast.message}</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => dismiss(toast.id)}
                  className="grid size-8 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-ink/5 hover:text-ink"
                >
                  <IconClose className="size-3.5" />
                  <span className="sr-only">Dismiss notice</span>
                </button>
              </div>
              <span
                aria-hidden="true"
                className={`absolute inset-x-0 bottom-0 h-0.5 origin-left ${style.bar}`}
                style={{
                  animation: `toast-timer ${durationFor[toast.tone]}ms linear forwards`,
                  animationPlayState: isPaused ? "paused" : "running",
                }}
              />
            </article>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
