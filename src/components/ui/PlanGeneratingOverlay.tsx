"use client";

import { useEffect, useState } from "react";

const MESSAGES = [
  "Crunching millions of data points...",
  "Learning from similar hiring patterns...",
  "Calibrating cost vs volume trade-offs...",
  "Building your optimal media strategy...",
  "Almost there...",
];

// 5 messages × 950 ms = 4750 ms — all messages complete just before the 5 s floor
const MESSAGE_INTERVAL_MS = 950;

const FADE_OUT_MS = 400;

export function PlanGeneratingOverlay({ visible }: { visible: boolean }) {
  const [msgIndex, setMsgIndex] = useState(0);
  const [msgVisible, setMsgVisible] = useState(true);
  // mounted = whether the DOM node should exist at all
  const [mounted, setMounted] = useState(false);
  // fadingOut = overlay is in the process of fading to opacity 0
  const [fadingOut, setFadingOut] = useState(false);

  // Mount/unmount with fade-out
  useEffect(() => {
    if (visible) {
      setMounted(true);
      setFadingOut(false);
    } else if (mounted) {
      setFadingOut(true);
      const t = setTimeout(() => {
        setMounted(false);
        setFadingOut(false);
        setMsgIndex(0);
        setMsgVisible(true);
      }, FADE_OUT_MS);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // Cycle messages while mounted
  useEffect(() => {
    if (!mounted) return;
    const timer = setInterval(() => {
      setMsgVisible(false);
      setTimeout(() => {
        setMsgIndex((i) => (i + 1) % MESSAGES.length);
        setMsgVisible(true);
      }, 280);
    }, MESSAGE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [mounted]);

  if (!mounted) return null;

  return (
    <>
      <style>{`
        @keyframes jv-ring-cw {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes jv-ring-ccw {
          from { transform: rotate(0deg); }
          to   { transform: rotate(-360deg); }
        }
        @keyframes jv-core-pulse {
          0%, 100% {
            box-shadow:
              0 0 0 0   rgba(48, 63, 159, 0.18),
              0 0 18px 4px rgba(48, 63, 159, 0.07);
          }
          50% {
            box-shadow:
              0 0 0 10px rgba(48, 63, 159, 0.05),
              0 0 30px 8px rgba(48, 63, 159, 0.13);
          }
        }
        @keyframes jv-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>

      {/* Backdrop */}
      <div
        role="status"
        aria-live="polite"
        aria-label="Generating media plan"
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{
          backgroundColor: "rgba(239, 243, 248, 0.80)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          opacity: fadingOut ? 0 : 1,
          transition: fadingOut
            ? `opacity ${FADE_OUT_MS}ms ease`
            : "opacity 0.25s ease",
          animation: fadingOut ? undefined : "jv-fade-in 0.25s ease both",
        }}
      >
        {/* Card */}
        <div
          className="flex flex-col items-center gap-9 px-12 py-11 rounded-2xl bg-[var(--surface)] border border-[var(--border)]"
          style={{
            minWidth: 340,
            boxShadow: "0 8px 40px rgba(26, 32, 44, 0.10), 0 1px 4px rgba(26, 32, 44, 0.06)",
          }}
        >
          {/* ── Animated node ── */}
          <div
            className="relative flex items-center justify-center"
            style={{ width: 128, height: 128 }}
          >
            {/* Outer ring — slow counter-clockwise, one dot */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                border: "1px solid #C5CAE9",
                animation: "jv-ring-ccw 9s linear infinite",
              }}
            >
              <span
                className="absolute rounded-full bg-[#7986CB]"
                style={{
                  width: 6, height: 6,
                  top: 0, left: "50%",
                  transform: "translate(-50%, -50%)",
                  opacity: 0.75,
                }}
              />
            </div>

            {/* Middle ring — faster clockwise, one dot */}
            <div
              className="absolute rounded-full"
              style={{
                inset: 18,
                border: "1px solid #9FA8DA",
                animation: "jv-ring-cw 5.5s linear infinite",
              }}
            >
              <span
                className="absolute rounded-full bg-[#5C6BC0]"
                style={{
                  width: 5, height: 5,
                  top: 0, left: "50%",
                  transform: "translate(-50%, -50%)",
                  opacity: 0.85,
                }}
              />
            </div>

            {/* Core node */}
            <div
              className="relative z-10 rounded-full bg-[#303F9F]"
              style={{
                width: 34, height: 34,
                animation: "jv-core-pulse 2.6s ease-in-out infinite",
              }}
            >
              {/* Inner specular highlight */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle at 33% 33%, rgba(255,255,255,0.30) 0%, transparent 60%)",
                }}
              />
            </div>
          </div>

          {/* ── Rotating message + branding ── */}
          <div className="flex flex-col items-center gap-2.5 text-center" style={{ minHeight: 48 }}>
            <p
              className="text-sm font-medium text-[var(--text-primary)]"
              style={{
                opacity: msgVisible ? 1 : 0,
                transition: "opacity 0.28s ease",
              }}
            >
              {MESSAGES[msgIndex]}
            </p>
            <p className="text-xs text-[var(--text-muted)] tracking-wide">
              Powered by Joveo Planning Intelligence
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
