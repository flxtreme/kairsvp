"use client";

import { useState, useEffect } from "react";
import type { MapControls } from "./map";
import { ANIMAL_POINTS, ANIMAL_CAPTURE_RATES } from "./map";

interface Props {
  controls: MapControls | null;
  onCloseMap?: () => void;
  hideControls?: boolean;
}

const CAPTURES_KEY = "safari_captures";

const ALL_ANIMALS = [
  "🐅","🐆","🐘","🦣","🦏","🦛","🦒","🦘",
  "🦨","🦡","🦔","🦇","🦅","🦉",
  "🦩","🦚","🦜","🐊","🐍","🐢",
];

const ANIMAL_NAMES: Record<string, string> = {
  "🐅": "Tiger",    "🐆": "Leopard",  "🐘": "Elephant", "🦣": "Mammoth",
  "🦏": "Rhino",    "🦛": "Hippo",    "🦒": "Giraffe",  "🦘": "Kangaroo",
  "🦨": "Skunk",    "🦡": "Badger",   "🦔": "Hedgehog", "🦇": "Bat",
  "🦅": "Eagle",    "🦉": "Owl",      "🦩": "Flamingo", "🦚": "Peacock",
  "🦜": "Parrot",   "🐊": "Croc",     "🐍": "Snake",    "🐢": "Turtle",
};

function loadCaptures(): Record<string, number> {
  try { return JSON.parse(localStorage.getItem(CAPTURES_KEY) || "{}"); }
  catch { return {}; }
}

export default function MapControlsUI({ controls, onCloseMap, hideControls }: Props) {
  const [showInventory, setShowInventory] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [captures, setCaptures] = useState<Record<string, number>>({});
  const [heldAnimal, setHeldAnimal] = useState<string | null>(null);
  const [holdTimer, setHoldTimer] = useState<number | null>(null);

  useEffect(() => { setCaptures(loadCaptures()); }, []);
  useEffect(() => { if (showInventory) setCaptures(loadCaptures()); }, [showInventory]);

  useEffect(() => {
    const refresh = () => setCaptures(loadCaptures());
    const openCollection = () => setShowInventory(true);
    const openInstructions = () => setShowInstructions(true);
    window.addEventListener("safari:capture", refresh);
    window.addEventListener("storage", refresh);
    window.addEventListener("safari:open-collection", openCollection);
    window.addEventListener("safari:show-instructions", openInstructions);
    return () => {
      window.removeEventListener("safari:capture", refresh);
      window.removeEventListener("storage", refresh);
      window.removeEventListener("safari:open-collection", openCollection);
      window.removeEventListener("safari:show-instructions", openInstructions);
    };
  }, []);

  const captureRates = ANIMAL_CAPTURE_RATES;
  const totalCaptured = ALL_ANIMALS.filter(a => (captures[a] || 0) > 0).length;
  const isComplete = totalCaptured >= ALL_ANIMALS.length;

  const btn = "cursor-pointer bg-amber-950/90 backdrop-blur-sm text-amber-100 hover:bg-amber-800 active:bg-amber-700 transition-colors flex items-center justify-center";

  return (
    <div className={`pointer-events-none absolute z-400 inset-0 transition-opacity duration-300 ${hideControls ? "opacity-0 pointer-events-none" : "opacity-100"}`}>

      {/* ── TITLE ── */}
      <div className="pointer-events-none absolute top-6 inset-x-0 flex justify-center">
        <div className="font-lso text-amber-950/80 text-lg tracking-widest text-center drop-shadow-sm select-none">
          Kaiden Felix&apos;s Safari
        </div>
      </div>

      {/* ── RIGHT QUICK BUTTONS ── */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-px pointer-events-auto shadow-xl rounded-sm overflow-hidden">
        <button
          onClick={() => controls?.flyTo(0)}
          className={`${btn} h-9 px-3 gap-2 text-xs tracking-wider whitespace-nowrap justify-start rounded-t-sm`}
        >
          <span className="text-sm leading-none">⛪</span>
          <span className="font-lso">Church</span>
        </button>
        <button
          onClick={() => controls?.flyTo(1)}
          className={`${btn} h-9 px-3 gap-2 text-xs tracking-wider whitespace-nowrap justify-start rounded-b-sm`}
        >
          <span className="text-sm leading-none">🍽️</span>
          <span className="font-lso">Event Place</span>
        </button>
      </div>

      {/* ── BOTTOM TOOLBAR ── */}
      <div className="absolute bottom-24 inset-x-0 flex justify-center pointer-events-none">
        <div className="relative flex items-center gap-px pointer-events-auto shadow-xl rounded-sm overflow-visible">

          {/* ZOOM IN */}
          <button onClick={() => controls?.zoomIn()} title="Zoom in" className={`${btn} w-10 h-10 rounded-l-sm`}>
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
              <line x1="7" y1="4.5" x2="7" y2="9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="4.5" y1="7" x2="9.5" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="10.5" y1="10.5" x2="14" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>

          {/* ZOOM OUT */}
          <button onClick={() => controls?.zoomOut()} title="Zoom out" className={`${btn} w-10 h-10`}>
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
              <line x1="4.5" y1="7" x2="9.5" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="10.5" y1="10.5" x2="14" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>

          {/* RESET */}
          <button onClick={() => controls?.reset()} title="Reset view" className={`${btn} w-10 h-10`}>
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <path d="M8 2.5C5.0 2.5 2.5 5.0 2.5 8s2.5 5.5 5.5 5.5 5.5-2.5 5.5-5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <polyline points="10.5,1 13.5,3.5 10.5,5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="8" cy="8" r="1.5" fill="currentColor"/>
            </svg>
          </button>

          {/* CLOSE MAP */}
          <button onClick={() => onCloseMap?.()} title="Close map" className={`${btn} w-10 h-10 rounded-r-sm hover:bg-red-900`}>
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <line x1="1" y1="1" x2="13" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="13" y1="1" x2="1" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>

        </div>
      </div>

      {/* ── INSTRUCTIONS MODAL ── */}
      {showInstructions && (
        <div
          className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-stone-950/70 backdrop-blur-sm z-9999"
          onClick={() => setShowInstructions(false)}
        >
          <div
            className="bg-amber-50 border border-amber-300 rounded-xl p-6 w-[min(300px,90vw)] flex flex-col items-center gap-4 text-center"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-4xl leading-none">🦁</div>
            <div>
              <p className="text-[0.6rem] tracking-widest uppercase text-amber-800 mb-1">How to Play</p>
              <p className="text-base font-bold text-stone-900 mb-2">Collect All the Animals!</p>
              <p className="text-xs text-stone-500 leading-relaxed">
                Tap an animal on the map to zoom in, then press{" "}
                <span className="font-semibold text-amber-800">Capture</span>.
                Catch as many animals as you can and score the most points! 🏆
              </p>
            </div>
            <div className="flex gap-1 flex-wrap justify-center text-xl">
              {["🐅","🐘","🦒","🦜","🐊","🦩","🐍","🐢"].map(e => <span key={e}>{e}</span>)}
            </div>
            <button
              onClick={() => setShowInstructions(false)}
              className="w-full bg-stone-900 text-amber-100 text-xs tracking-widest uppercase rounded py-2 cursor-pointer hover:bg-stone-700 transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {/* ── INVENTORY MODAL ── */}
      {showInventory && (
        <div
          className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-stone-950/70 backdrop-blur-sm z-9999"
          onClick={() => setShowInventory(false)}
        >
          <div
            className={`border rounded-xl p-5 w-[min(340px,90vw)] max-h-[80vh] overflow-y-auto flex flex-col gap-4 ${isComplete ? "bg-emerald-50 border-emerald-300" : "bg-amber-50 border-amber-300"}`}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-[0.6rem] tracking-widest uppercase mb-0.5 ${isComplete ? "text-emerald-700" : "text-amber-800"}`}>Safari Collection</p>
                <p className="text-base font-bold text-stone-900">
                  {isComplete ? "🏆 Complete!" : "📷 My Photos"}
                </p>
              </div>
              <div className="text-right">
                <p className={`text-2xl font-bold leading-none ${isComplete ? "text-emerald-700" : "text-amber-800"}`}>
                  {totalCaptured}<span className="text-xs text-stone-400 font-normal">/{ALL_ANIMALS.length}</span>
                </p>
                <p className="text-[0.6rem] tracking-widest uppercase text-stone-400">captured</p>
              </div>
            </div>

            {/* Score panel */}
            <div className={`rounded-lg px-3 py-2.5 border ${isComplete ? "bg-emerald-100 border-emerald-200" : "bg-amber-100 border-amber-200"}`}>
              <p className={`text-[0.6rem] tracking-widest uppercase text-center mb-2 ${isComplete ? "text-emerald-700" : "text-amber-800"}`}>
                🏅 Who has the most?
              </p>
              <div className="flex gap-2">
                <div className="flex-1 text-center">
                  <p className="text-[0.55rem] tracking-widest uppercase text-stone-400 mb-0.5">Total Captures</p>
                  <p className={`text-2xl font-bold leading-none ${isComplete ? "text-emerald-700" : "text-amber-800"}`}>
                    {Object.values(captures).reduce((a, b) => a + b, 0)}
                  </p>
                </div>
                <div className={`w-px ${isComplete ? "bg-emerald-200" : "bg-amber-200"}`} />
                <div className="flex-1 text-center">
                  <p className="text-[0.55rem] tracking-widest uppercase text-stone-400 mb-0.5">Total Points</p>
                  <p className={`text-2xl font-bold leading-none ${isComplete ? "text-emerald-700" : "text-amber-800"}`}>
                    {Object.entries(captures).reduce((sum, [sprite, count]) => sum + (ANIMAL_POINTS[sprite] || 0) * count, 0)}
                  </p>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${isComplete ? "bg-emerald-500" : "bg-amber-800"}`}
                style={{ width: `${(totalCaptured / ALL_ANIMALS.length) * 100}%` }}
              />
            </div>

            {/* Grid — always show all animals with counts */}
            <div className="grid grid-cols-4 gap-2">
              {ALL_ANIMALS.map(sprite => {
                const count = captures[sprite] || 0;
                const captured = count > 0;
                return (
                  <div
                    key={sprite}
                    className={`relative flex flex-col items-center gap-1 rounded-lg px-1.5 py-2.5 border select-none cursor-pointer ${
                      captured
                        ? isComplete
                          ? "bg-emerald-100 border-emerald-300"
                          : "bg-amber-100 border-amber-300"
                        : "bg-stone-100 border-stone-200 opacity-40"
                    }`}
                    onContextMenu={e => e.preventDefault()}
                    onPointerDown={() => {
                      const t = setTimeout(() => setHeldAnimal(sprite), 400);
                      setHoldTimer(t as unknown as number);
                    }}
                    onPointerUp={() => { clearTimeout(holdTimer ?? undefined); setHoldTimer(null); }}
                    onPointerLeave={() => { clearTimeout(holdTimer ?? undefined); setHoldTimer(null); setHeldAnimal(null); }}
                  >
                    {heldAnimal === sprite && (
                      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-lg bg-stone-900/90 gap-0.5 px-1">
                        <span className="text-amber-300 text-[0.6rem] font-bold leading-none">{ANIMAL_POINTS[sprite]}pt</span>
                        <span className="text-stone-300 text-[0.5rem] leading-none">{Math.round((captureRates[sprite] || 0) * 100)}% catch</span>
                      </div>
                    )}
                    <span className={`text-3xl leading-none ${captured ? "" : "grayscale"}`}>{sprite}</span>
                    <span className="text-[0.5rem] text-stone-500 text-center tracking-wide">{ANIMAL_NAMES[sprite]}</span>
                    {/* Count badge — top right */}
                    <span className={`absolute top-1 right-1 text-[0.45rem] font-bold rounded-full px-1 leading-4 ${
                      captured
                        ? isComplete
                          ? "bg-emerald-700 text-emerald-50"
                          : "bg-amber-800 text-amber-50"
                        : "text-stone-400"
                    }`}>
                      {captured ? `×${count}` : "?"}
                    </span>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setShowInventory(false)}
              className="w-full bg-stone-900 text-amber-100 text-xs tracking-widest uppercase rounded py-2 cursor-pointer hover:bg-stone-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}