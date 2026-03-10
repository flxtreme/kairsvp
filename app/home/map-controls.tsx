"use client";

import { useState, useEffect, useRef } from "react";
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
  { action: "flyTo",  label: "Overlook",           emoji: "⛰️",  index: 3 },
  { action: "flyTo",  label: "Lagoon",             emoji: "🪷",  index: 4 },
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
  "🦨": "Skunk",     "🦡": "Badger",   "🦔": "Hedgehog", "🦇": "Bat",
  "🦅": "Eagle",     "🦉": "Owl",      "🦩": "Flamingo", "🦚": "Peacock",
  "🦜": "Parrot",    "🐊": "Croc",     "🐍": "Snake",    "🐢": "Turtle",
};

function loadCaptures(): Record<string, number> {
  try { return JSON.parse(localStorage.getItem(CAPTURES_KEY) || "{}"); }
  catch { return {}; }
}

export default function MapControlsUI({ controls, onCloseMap, hideControls }: Props) {
  const [current, setCurrent] = useState(0);
  const [showInventory, setShowInventory] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [captures, setCaptures] = useState<Record<string, number>>({});
  const actionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setCaptures(loadCaptures()); }, []);
  useEffect(() => { if (showInventory) setCaptures(loadCaptures()); }, [showInventory]);
  useEffect(() => {
    const refresh = () => setCaptures(loadCaptures());
    window.addEventListener("safari:capture", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("safari:capture", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  // Close action tray when clicking outside
  useEffect(() => {
    if (!showActions) return;
    const handler = (e: MouseEvent) => {
      if (actionsRef.current && !actionsRef.current.contains(e.target as Node)) {
        setShowActions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showActions]);

  const goTo = (step: number) => {
    const s = STEPS[step];
    if (s.action === "reset") controls?.reset();
    else controls?.flyTo(s.index);
    setCurrent(step);
    setShowActions(false);
  };

  const prev = () => goTo((current - 1 + STEPS.length) % STEPS.length);
  const next = () => goTo((current + 1) % STEPS.length);

  const totalCaptured = ALL_ANIMALS.filter(a => (captures[a] || 0) > 0).length;
  const isComplete = totalCaptured >= ALL_ANIMALS.length;

  const btnBase = "cursor-pointer bg-amber-950/90 backdrop-blur-sm text-amber-100 hover:bg-amber-800 active:bg-amber-700 transition-colors flex items-center justify-center";

  return (
    <div className={`pointer-events-none absolute z-[400] inset-0 transition-opacity duration-300 ${hideControls ? "opacity-0 pointer-events-none" : "opacity-100"}`}>

      {/* ── BOTTOM TOOLBAR ── */}
      <div className="absolute bottom-8 inset-x-0 flex items-end justify-center pointer-events-none px-4">
        <div className="relative flex items-center gap-px rounded-sm overflow-visible pointer-events-auto shadow-xl">

          {/* PREV */}
          <button onClick={prev} title="Previous" className={`${btnBase} w-10 h-10 rounded-l-sm`}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <polyline points="9,2 4,7 9,12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* ZOOM IN */}
          <button onClick={() => controls?.zoomIn()} title="Zoom in" className={`${btnBase} w-10 h-10`}>
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
              <line x1="7" y1="4.5" x2="7" y2="9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="4.5" y1="7" x2="9.5" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="10.5" y1="10.5" x2="14" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>

          {/* ZOOM OUT */}
          <button onClick={() => controls?.zoomOut()} title="Zoom out" className={`${btnBase} w-10 h-10`}>
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
              <line x1="4.5" y1="7" x2="9.5" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="10.5" y1="10.5" x2="14" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>

          {/* RESET */}
          <button onClick={() => { controls?.reset(); setCurrent(0); }} title="Reset view" className={`${btnBase} w-10 h-10`}>
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <path d="M8 2.5C5.0 2.5 2.5 5.0 2.5 8s2.5 5.5 5.5 5.5 5.5-2.5 5.5-5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <polyline points="10.5,1 13.5,3.5 10.5,5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="8" cy="8" r="1.5" fill="currentColor"/>
            </svg>
          </button>

          {/* ACTION BUTTON — opens tray */}
          <div ref={actionsRef} className="relative">
            <button
              onClick={() => setShowActions(v => !v)}
              title="Menu"
              className={`${btnBase} w-10 h-10 ${showActions ? "bg-amber-700" : ""}`}
            >
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="3" r="1.3" fill="currentColor"/>
                <circle cx="8" cy="8" r="1.3" fill="currentColor"/>
                <circle cx="8" cy="13" r="1.3" fill="currentColor"/>
              </svg>
            </button>

            {/* Action tray — pops up above */}
            {showActions && (
              <div className="absolute bottom-full mb-2 right-0 flex flex-col gap-px rounded-sm overflow-hidden shadow-xl" style={{ minWidth: "170px" }}>

                {/* Quick selects */}
                {STEPS?.filter(({action}) => action !== "reset")?.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    className={`${btnBase} h-9 px-3 justify-start gap-2 text-xs tracking-wider whitespace-nowrap w-full`}
                  >
                    <span className="text-sm leading-none">{s.emoji}</span>
                    <span className="font-lso">{s.label}</span>
                  </button>
                ))}

                {/* Divider */}
                <div className="h-px bg-amber-800/60" />

                {/* Collection */}
                <button
                  onClick={() => { setShowInventory(true); setShowActions(false); }}
                  className={`${btnBase} h-9 px-3 justify-start gap-2 text-xs tracking-wider whitespace-nowrap w-full ${isComplete ? "bg-emerald-700 hover:bg-emerald-600" : ""}`}
                >
                  {isComplete ? (
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                      <polyline points="4.5,8.5 7,11 11.5,5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <span className="text-sm leading-none">📷</span>
                  )}
                  <span className="font-lso">Collection {totalCaptured}/{ALL_ANIMALS.length}</span>
                </button>

                {/* Close Map */}
                <button
                  onClick={() => { setShowActions(false); onCloseMap?.(); }}
                  className={`${btnBase} h-9 px-3 justify-start gap-2 text-xs tracking-wider whitespace-nowrap w-full hover:bg-red-900`}
                >
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                    <line x1="1" y1="1" x2="13" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <line x1="13" y1="1" x2="1" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <span className="font-lso">Close Map</span>
                </button>

              </div>
            )}
          </div>

          {/* NEXT */}
          <button onClick={next} title="Next" className={`${btnBase} w-10 h-10 rounded-r-sm`}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <polyline points="5,2 10,7 5,12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

        </div>
      </div>

      {/* ── INVENTORY MODAL ── */}
      {showInventory && (
        <div
          className="pointer-events-auto absolute inset-0 flex items-center justify-center"
          style={{ background: "rgba(28,20,16,0.72)", backdropFilter: "blur(2px)", zIndex: 9999 }}
          onClick={() => setShowInventory(false)}
        >
          <div
            style={{ background: "#fffbf0", border: "1.5px solid #e5c98a", borderRadius: "12px", padding: "20px", width: "min(340px, 90vw)", maxHeight: "80vh", overflowY: "auto", fontFamily: "sans-serif" }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
              <div>
                <div style={{ fontSize: "0.6rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#92400e", marginBottom: "2px" }}>Safari Collection</div>
                <div style={{ fontSize: "1rem", fontWeight: 700, color: "#1c1410" }}>📷 My Photos</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#92400e", lineHeight: 1 }}>
                  {totalCaptured}<span style={{ fontSize: "0.75rem", color: "#a8a29e", fontWeight: 400 }}>/{ALL_ANIMALS.length}</span>
                </div>
                <div style={{ fontSize: "0.6rem", color: "#a8a29e", letterSpacing: "0.1em", textTransform: "uppercase" }}>captured</div>
              </div>
            </div>
            <div style={{ background: "#e5e7eb", borderRadius: "99px", height: "4px", marginBottom: "16px", overflow: "hidden" }}>
              <div style={{ background: "#92400e", height: "100%", borderRadius: "99px", width: `${(totalCaptured / ALL_ANIMALS.length) * 100}%`, transition: "width 0.4s ease" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
              {ALL_ANIMALS.map(sprite => {
                const count = captures[sprite] || 0;
                const captured = count > 0;
                return (
                  <div key={sprite} style={{ background: captured ? "#fef3c7" : "#f5f0e8", border: `1.5px solid ${captured ? "#e5c98a" : "#e0d8cc"}`, borderRadius: "8px", padding: "10px 6px 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", opacity: captured ? 1 : 0.45, transition: "opacity 0.3s ease", position: "relative" }}>
                    <div style={{ fontSize: "1.8rem", lineHeight: 1, filter: captured ? "none" : "grayscale(1)" }}>{sprite}</div>
                    <div style={{ fontSize: "0.55rem", color: "#78716c", textAlign: "center", letterSpacing: "0.06em" }}>{ANIMAL_NAMES[sprite]}</div>
                    {captured && <div style={{ position: "absolute", top: "4px", right: "5px", background: "#92400e", color: "#fef3c7", fontSize: "0.5rem", fontWeight: 700, borderRadius: "99px", padding: "1px 4px", lineHeight: 1.4 }}>×{count}</div>}
                    {!captured && <div style={{ position: "absolute", top: "4px", right: "5px", fontSize: "0.55rem", color: "#c4b49a" }}>?</div>}
                  </div>
                );
              })}
            </div>
            <button onClick={() => setShowInventory(false)} style={{ marginTop: "16px", width: "100%", background: "#292524", color: "#fef3c7", border: "none", borderRadius: "4px", padding: "8px", fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}