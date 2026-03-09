"use client";

import { useState, useEffect } from "react";
import type { MapControls } from "./map";

interface Props {
  controls: MapControls | null;
  onCloseMap?: () => void;
  hideControls?: boolean;
}

const STEPS = [
  { action: "reset",  label: "Overview",          emoji: "🗺️" },
  { action: "flyTo",  label: "Kaiden's Camp",      emoji: "🏕️", index: 2 },
  { action: "flyTo",  label: "St. Isidore Parish", emoji: "⛪",  index: 0 },
  { action: "flyTo",  label: "Cabuyao Reception",  emoji: "🍽️", index: 1 },
] as const;

const CAPTURES_KEY = "safari_captures";

const ALL_ANIMALS = [
  "🐅","🐆","🐘","🦣","🦏","🦛","🦒","🦘",
  "🦨","🦡","🦔","🦇","🦅","🦉",
  "🦩","🦚","🦜","🐊","🐍","🐢",
];

const ANIMAL_NAMES: Record<string, string> = {
  "🐅": "Tiger",     "🐆": "Leopard",  "🐘": "Elephant", "🦣": "Mammoth",
  "🦏": "Rhino",     "🦛": "Hippo",    "🦒": "Giraffe",  "🦘": "Kangaroo",
  "🦨": "Skunk",    "🦡": "Badger",
  "🦔": "Hedgehog",  "🦇": "Bat",      "🦅": "Eagle",    "🦉": "Owl",
  "🦩": "Flamingo",  "🦚": "Peacock",  "🦜": "Parrot",   "🐊": "Crocodile",
  "🐍": "Snake",     "🐢": "Turtle",
};

function loadCaptures(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(CAPTURES_KEY) || "{}");
  } catch { return {}; }
}

export default function MapControlsUI({ controls, onCloseMap, hideControls }: Props) {
  const [current, setCurrent] = useState(0);
  const [showInventory, setShowInventory] = useState(false);
  const [captures, setCaptures] = useState<Record<string, number>>({});

  // Load captures on mount
  useEffect(() => {
    setCaptures(loadCaptures());
  }, []);

  // Refresh captures when modal opens
  useEffect(() => {
    if (showInventory) setCaptures(loadCaptures());
  }, [showInventory]);

  // Listen for capture events (same-tab, instant) and storage events (cross-tab)
  useEffect(() => {
    const refresh = () => setCaptures(loadCaptures());
    window.addEventListener("safari:capture", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("safari:capture", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const goTo = (step: number) => {
    const s = STEPS[step];
    if (s.action === "reset") controls?.reset();
    else controls?.flyTo(s.index);
    setCurrent(step);
  };

  const prev = () => goTo((current - 1 + STEPS.length) % STEPS.length);
  const next = () => goTo((current + 1) % STEPS.length);

  const totalCaptured = ALL_ANIMALS.filter(a => (captures[a] || 0) > 0).length;

  return (
    <div className={`pointer-events-none absolute z-[400] inset-0 transition-opacity duration-300 ${hideControls ? "opacity-0 pointer-events-none" : "opacity-100"}`}>

      {/* ── TOP LEFT: Inventory Button ── */}
      {(() => {
        const isComplete = totalCaptured >= ALL_ANIMALS.length;
        return (
          <div className="absolute top-20 left-4 pointer-events-auto">
            <button
              onClick={() => setShowInventory(true)}
              title="My Collection"
              className={`h-9 px-3 cursor-pointer backdrop-blur-sm text-amber-100 transition-colors flex items-center gap-2 rounded-sm ${isComplete ? "bg-emerald-700 hover:bg-emerald-600" : "bg-amber-950/90 hover:bg-amber-800"}`}
            >
              {isComplete ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                  <polyline points="4.5,8.5 7,11 11.5,5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <span className="text-base leading-none">📷</span>
              )}
              <span className="text-xs tracking-wider font-lso whitespace-nowrap">
                {totalCaptured}/{ALL_ANIMALS.length}
              </span>
            </button>
          </div>
        );
      })()}

      {/* ── TOP RIGHT: Close Button ── */}
      <div className="absolute top-20 right-4 pointer-events-auto">
        <button
          onClick={onCloseMap}
          title="Close map"
          className="w-9 h-9 cursor-pointer bg-amber-950/90 backdrop-blur-sm text-amber-100 hover:bg-amber-800 transition-colors flex items-center justify-center rounded-sm"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <line x1="1" y1="1" x2="13" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="13" y1="1" x2="1" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* ── CENTER: Prev / Next arrows ── */}
      <div className="absolute inset-y-0 left-4 right-4 flex items-center justify-between px-2 pointer-events-none">
        <button
          onClick={prev}
          title="Previous"
          className="w-8 h-8 cursor-pointer pointer-events-auto bg-amber-950/80 backdrop-blur-sm text-amber-100 hover:bg-amber-800 transition-colors flex items-center justify-center rounded-sm"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <polyline points="9,2 4,7 9,12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button
          onClick={next}
          title="Next"
          className="w-8 h-8 cursor-pointer pointer-events-auto bg-amber-950/80 backdrop-blur-sm text-amber-100 hover:bg-amber-800 transition-colors flex items-center justify-center rounded-sm"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <polyline points="5,2 10,7 5,12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* ── BOTTOM LEFT: Zoom Controls ── */}
      <div className="absolute left-4 bottom-24 flex flex-col gap-px overflow-hidden rounded-sm pointer-events-auto">
        <button
          onClick={() => controls?.zoomIn()}
          title="Zoom in"
          className="w-9 h-9 cursor-pointer bg-amber-950/90 backdrop-blur-sm text-amber-100 hover:bg-amber-800 transition-colors flex items-center justify-center"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
            <line x1="7" y1="4.5" x2="7" y2="9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="4.5" y1="7" x2="9.5" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="11" y1="11" x2="14.5" y2="14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
        <button
          onClick={() => controls?.zoomOut()}
          title="Zoom out"
          className="w-9 h-9 cursor-pointer bg-amber-950/90 backdrop-blur-sm text-amber-100 hover:bg-amber-800 transition-colors flex items-center justify-center"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
            <line x1="4.5" y1="7" x2="9.5" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="11" y1="11" x2="14.5" y2="14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
        <button
          onClick={() => { controls?.reset(); setCurrent(0); }}
          title="Reset view"
          className="w-9 h-9 cursor-pointer bg-amber-950/90 backdrop-blur-sm text-amber-100 hover:bg-amber-800 transition-colors flex items-center justify-center"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2.5C5.0 2.5 2.5 5.0 2.5 8s2.5 5.5 5.5 5.5 5.5-2.5 5.5-5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <polyline points="10.5,1 13.5,3.5 10.5,5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="8" cy="8" r="1.5" fill="currentColor"/>
          </svg>
        </button>
      </div>

      {/* ── BOTTOM RIGHT: Quick Toggle Buttons ── */}
      <div className="absolute right-4 bottom-24 flex flex-col gap-px overflow-hidden rounded-sm pointer-events-auto">
        <button
          onClick={() => { controls?.flyTo(2); setCurrent(1); }}
          title="Kaiden's Camp"
          className="h-9 px-3 cursor-pointer bg-amber-950/90 backdrop-blur-sm text-amber-100 hover:bg-amber-800 transition-colors flex items-center gap-2"
        >
          <span className="text-base leading-none">🏕️</span>
          <span className="text-xs tracking-wider font-lso whitespace-nowrap">Kaiden's Camp</span>
        </button>
        <button
          onClick={() => { controls?.flyTo(0); setCurrent(2); }}
          title="St. Isidore Parish Church"
          className="h-9 px-3 cursor-pointer bg-amber-950/90 backdrop-blur-sm text-amber-100 hover:bg-amber-800 transition-colors flex items-center gap-2"
        >
          <span className="text-base leading-none">⛪</span>
          <span className="text-xs tracking-wider font-lso whitespace-nowrap">St. Isidore Parish</span>
        </button>
        <button
          onClick={() => { controls?.flyTo(1); setCurrent(3); }}
          title="Cabuyao Reception Hall"
          className="h-9 px-3 cursor-pointer bg-amber-950/90 backdrop-blur-sm text-amber-100 hover:bg-amber-800 transition-colors flex items-center gap-2"
        >
          <span className="text-base leading-none">🍽️</span>
          <span className="text-xs tracking-wider font-lso whitespace-nowrap">Cabuyao Reception</span>
        </button>
      </div>

      {/* ── INVENTORY MODAL ── */}
      {showInventory && (
        <div
          className="pointer-events-auto absolute inset-0 flex items-center justify-center"
          style={{ background: "rgba(28,20,16,0.72)", backdropFilter: "blur(2px)", zIndex: 9999 }}
          onClick={() => setShowInventory(false)}
        >
          <div
            style={{
              background: "#fffbf0",
              border: "1.5px solid #e5c98a",
              borderRadius: "12px",
              padding: "20px",
              width: "min(340px, 90vw)",
              maxHeight: "80vh",
              overflowY: "auto",
              fontFamily: "sans-serif",
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
              <div>
                <div style={{ fontSize: "0.6rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#92400e", marginBottom: "2px" }}>
                  Safari Collection
                </div>
                <div style={{ fontSize: "1rem", fontWeight: 700, color: "#1c1410" }}>
                  📷 My Photos
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#92400e", lineHeight: 1 }}>
                  {totalCaptured}
                  <span style={{ fontSize: "0.75rem", color: "#a8a29e", fontWeight: 400 }}>/{ALL_ANIMALS.length}</span>
                </div>
                <div style={{ fontSize: "0.6rem", color: "#a8a29e", letterSpacing: "0.1em", textTransform: "uppercase" }}>captured</div>
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ background: "#e5e7eb", borderRadius: "99px", height: "4px", marginBottom: "16px", overflow: "hidden" }}>
              <div style={{
                background: "#92400e",
                height: "100%",
                borderRadius: "99px",
                width: `${(totalCaptured / ALL_ANIMALS.length) * 100}%`,
                transition: "width 0.4s ease",
              }} />
            </div>

            {/* Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
              {ALL_ANIMALS.map(sprite => {
                const count = captures[sprite] || 0;
                const captured = count > 0;
                return (
                  <div
                    key={sprite}
                    style={{
                      background: captured ? "#fef3c7" : "#f5f0e8",
                      border: `1.5px solid ${captured ? "#e5c98a" : "#e0d8cc"}`,
                      borderRadius: "8px",
                      padding: "10px 6px 8px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "4px",
                      opacity: captured ? 1 : 0.45,
                      transition: "opacity 0.3s ease",
                      position: "relative",
                    }}
                  >
                    <div style={{ fontSize: "1.8rem", lineHeight: 1, filter: captured ? "none" : "grayscale(1)" }}>
                      {sprite}
                    </div>
                    <div style={{ fontSize: "0.55rem", color: "#78716c", textAlign: "center", letterSpacing: "0.06em" }}>
                      {ANIMAL_NAMES[sprite]}
                    </div>
                    {captured && (
                      <div style={{
                        position: "absolute", top: "4px", right: "5px",
                        background: "#92400e", color: "#fef3c7",
                        fontSize: "0.5rem", fontWeight: 700,
                        borderRadius: "99px", padding: "1px 4px",
                        lineHeight: 1.4,
                      }}>
                        ×{count}
                      </div>
                    )}
                    {!captured && (
                      <div style={{
                        position: "absolute", top: "4px", right: "5px",
                        fontSize: "0.55rem", color: "#c4b49a",
                      }}>?</div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Close */}
            <button
              onClick={() => setShowInventory(false)}
              style={{
                marginTop: "16px", width: "100%",
                background: "#292524", color: "#fef3c7",
                border: "none", borderRadius: "4px",
                padding: "8px", fontSize: "0.7rem",
                letterSpacing: "0.1em", textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}