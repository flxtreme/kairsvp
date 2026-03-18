"use client";

import { useEffect, useRef, useState } from "react";
import MapControlsUI from "./map-controls";

interface LeafletMapProps {
  onMapReady?: (controls: MapControls) => void;
  onCloseMap?: () => void;
}

export interface MapControls {
  zoomIn: () => void;
  zoomOut: () => void;
  flyTo: (index: number) => void;
  reset: () => void;
}

const RSVP_URL = "https://forms.google.com";
const CAPTURES_KEY = "safari_captures";
const RESPAWN_KEY = "safari_next_respawn";
const MINIGAME_KEY = "safari_minigame_accepted";

const MARKERS = [
  {
    coords: [13.94109723559923, 121.62199024348725] as [number, number],
    emoji: "⛪",
    label: "CHURCH",
    popup: `
      <div style="font-family:sans-serif;min-width:180px;">
        <div style="font-size:0.65rem;letter-spacing:0.12em;text-transform:uppercase;color:#92400e;margin-bottom:4px;">Church</div>
        <div style="font-size:0.9rem;font-weight:600;color:#1c1410;line-height:1.3;margin-bottom:2px;">St. Isidore Parish Church</div>
        <div style="font-size:0.75rem;color:#78716c;line-height:1.4;margin-bottom:8px;">RED-V, Ibabang Dupay, Lucena City</div>
        <div style="display:flex;align-items:center;gap:4px;margin-bottom:10px;">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" style="flex-shrink:0"><circle cx="8" cy="8" r="6.5" stroke="#92400e" stroke-width="1.5"/><polyline points="8,4.5 8,8.5 10.5,10.5" stroke="#92400e" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <span style="font-size:0.75rem;color:#92400e;font-weight:500;">9:00 AM</span>
        </div>
        <button data-action="go" data-target="1" style="width:100%;padding:5px 8px;background:#292524;color:#fef3c7;font-size:0.7rem;text-align:center;letter-spacing:0.08em;text-transform:uppercase;border-radius:2px;border:none;cursor:pointer;">
          🍽️ Check Out the Event
        </button>
      </div>
    `,
  },
  {
    coords: [13.952323269641392, 121.6434723394454] as [number, number],
    emoji: "🍽️",
    label: "RSVP HERE",
    popup: `
      <div style="font-family:sans-serif;min-width:200px;">
        <div style="font-size:0.65rem;letter-spacing:0.12em;text-transform:uppercase;color:#92400e;margin-bottom:4px;">Reception</div>
        <div style="font-size:0.9rem;font-weight:600;color:#1c1410;line-height:1.3;margin-bottom:2px;">Cabuyao Reception Hall</div>
        <div style="font-size:0.75rem;color:#78716c;line-height:1.4;margin-bottom:8px;">Mayao Silangan, Lucena City</div>
        <div style="display:flex;align-items:center;gap:4px;margin-bottom:10px;">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" style="flex-shrink:0"><circle cx="8" cy="8" r="6.5" stroke="#92400e" stroke-width="1.5"/><polyline points="8,4.5 8,8.5 10.5,10.5" stroke="#92400e" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <span style="font-size:0.75rem;color:#92400e;font-weight:500;">10:00 AM</span>
        </div>
        <div style="height:1px;background:#e5d9b0;margin-bottom:10px;"></div>
        <div style="font-size:0.65rem;letter-spacing:0.12em;text-transform:uppercase;color:#92400e;margin-bottom:6px;">Dress Code</div>
        <div style="font-size:0.78rem;color:#1c1410;font-weight:600;margin-bottom:6px;">Safari Earth Tones:</div>
        <div style="display:flex;gap:8px;align-items:center;margin-bottom:6px;">
          <div title="Khaki" style="width:20px;height:20px;border-radius:50%;background:#c8b06a;border:1.5px solid #e5d9b0;flex-shrink:0;"></div>
          <div title="Olive" style="width:20px;height:20px;border-radius:50%;background:#7a8c5a;border:1.5px solid #c5d0a8;flex-shrink:0;"></div>
          <div title="Saddle Brown" style="width:20px;height:20px;border-radius:50%;background:#8b5c2a;border:1.5px solid #d4a97a;flex-shrink:0;"></div>
          <div title="Warm Cream" style="width:20px;height:20px;border-radius:50%;background:#e8d9b8;border:1.5px solid #c8b88a;flex-shrink:0;"></div>
          <div title="Forest Green" style="width:20px;height:20px;border-radius:50%;background:#4a6741;border:1.5px solid #8aad85;flex-shrink:0;"></div>
        </div>
        <div style="font-size:0.7rem;color:#92400e;font-style:italic;margin-bottom:12px;">Smart casual — no formal wear needed 🌿</div>
        <a href="${RSVP_URL}" target="_blank" style="display:block;width:100%;box-sizing:border-box;padding:5px 8px;background:#92400e;color:#fef3c7;font-size:0.7rem;text-align:center;text-decoration:none;letter-spacing:0.08em;text-transform:uppercase;border-radius:2px;">
          RSVP HERE
        </a>
      </div>
    `,
  },
  {
    coords: [13.93553858982911, 121.63548098041677] as [number, number],
    emoji: "🏕️",
    label: "CAMP",
    popup: "",
  },
];

const DEFAULT_CENTER: [number, number] = [13.946248797612691, 121.63413903456582];
const DEFAULT_ZOOM = 14;
const FLY_ZOOM = 17;

const TREES = ["🌳", "🌲", "🌴"];
const ROCKY_TREES = ["🌳", "⛰️", "⛰️", "⛰️", "🪨", "🌴"];
const SWAMP_TREES = ["🪷", "🪷", "🌴", "🌴", "🪷"];

function dist(a: [number, number], b: [number, number]) {
  return Math.sqrt((a[0]-b[0])**2 + (a[1]-b[1])**2);
}

function generateTrees(
  center: [number, number], count: number, minR: number, maxR: number,
  minSpacing: number, seed: number, existing: [number, number][] = [],
  emojiSet: string[] = TREES
): { coords: [number, number]; emoji: string; size: number }[] {
  let s = seed;
  const rand = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  const placed: { coords: [number, number]; emoji: string; size: number }[] = [];
  const occupied: [number, number][] = [...existing];
  let attempts = 0;
  while (placed.length < count && attempts < count * 40) {
    attempts++;
    const angle = rand() * Math.PI * 2;
    const radius = minR + rand() * (maxR - minR);
    const coords: [number, number] = [center[0] + Math.sin(angle) * radius, center[1] + Math.cos(angle) * radius];
    if (occupied.some(c => dist(coords, c) < minSpacing)) continue;
    placed.push({ coords, emoji: emojiSet[Math.floor(rand() * emojiSet.length)], size: 16 + Math.floor(rand() * 14) });
    occupied.push(coords);
  }
  return placed;
}

const markerCoords: [number, number][] = [
  [13.94109723559923, 121.62199024348725],
  [13.952323269641392, 121.6434723394454],
  [13.93553858982911, 121.63548098041677],
];

const churchTrees    = generateTrees(markerCoords[0], 10, 0.0014, 0.0035, 0.0014, 1, markerCoords);
const receptionTrees = generateTrees(markerCoords[1], 10, 0.0014, 0.0035, 0.0014, 42, [...markerCoords, ...churchTrees.map(t=>t.coords)]);
const campTrees      = generateTrees(markerCoords[2], 14, 0.0012, 0.0030, 0.0014, 99, [...markerCoords, ...churchTrees.map(t=>t.coords), ...receptionTrees.map(t=>t.coords)]);
const rockyTrees     = generateTrees([13.949319240144398, 121.63213171410052], 18, 0.0010, 0.0028, 0.0014, 777, [...markerCoords, ...churchTrees.map(t=>t.coords), ...receptionTrees.map(t=>t.coords), ...campTrees.map(t=>t.coords)], ROCKY_TREES);
const swampTrees     = generateTrees([13.944111725539413, 121.63636114344037], 18, 0.0010, 0.0028, 0.0014, 555, [...markerCoords, ...churchTrees.map(t=>t.coords), ...receptionTrees.map(t=>t.coords), ...campTrees.map(t=>t.coords), ...rockyTrees.map(t=>t.coords)], SWAMP_TREES);

const TREE_MARKERS = [...churchTrees, ...receptionTrees, ...campTrees, ...rockyTrees, ...swampTrees];
const ALL_TREE_COORDS = TREE_MARKERS.map(t => t.coords);

const ANIMAL_EMOJIS: { sprite: string; size: [number, number]; captureRate: number }[] = [
  { sprite: "🐅", size: [2, 2.5], captureRate: 0.50 },
  { sprite: "🐆", size: [2, 2.5], captureRate: 0.50 },
  { sprite: "🐘", size: [3, 4],   captureRate: 0.65 },
  { sprite: "🦣", size: [3, 4],   captureRate: 0.55 },
  { sprite: "🦏", size: [2, 3],   captureRate: 0.65 },
  { sprite: "🦛", size: [2, 3],   captureRate: 0.65 },
  { sprite: "🦒", size: [3, 4],   captureRate: 0.75 },
  { sprite: "🦘", size: [2, 2.5], captureRate: 0.70 },
  { sprite: "🦨", size: [1, 1],   captureRate: 0.90 },
  { sprite: "🦡", size: [1, 1],   captureRate: 0.85 },
  { sprite: "🦔", size: [1, 1],   captureRate: 0.90 },
  { sprite: "🦇", size: [1, 1],   captureRate: 0.80 },
  { sprite: "🦅", size: [1, 1],   captureRate: 0.60 },
  { sprite: "🦉", size: [1, 1],   captureRate: 0.80 },
  { sprite: "🦩", size: [1, 1],   captureRate: 0.85 },
  { sprite: "🦚", size: [1, 1],   captureRate: 0.80 },
  { sprite: "🦜", size: [1, 1],   captureRate: 0.85 },
  { sprite: "🐊", size: [2, 3],   captureRate: 0.55 },
  { sprite: "🐍", size: [1, 2],   captureRate: 0.70 },
  { sprite: "🐢", size: [1, 1],   captureRate: 0.95 },
];

function randomNearTree(rng: () => number): [number, number] {
  const tree = ALL_TREE_COORDS[Math.floor(rng() * ALL_TREE_COORDS.length)];
  return [tree[0] + (rng() - 0.5) * 0.0006, tree[1] + (rng() - 0.5) * 0.0006];
}

let _seed = Date.now() % 2147483647;
const rng = () => { _seed = (_seed * 16807) % 2147483647; return (_seed - 1) / 2147483646; };

function loadCaptures(): Record<string, number> {
  try { return JSON.parse(localStorage.getItem(CAPTURES_KEY) || "{}"); }
  catch { return {}; }
}
function saveCapture(sprite: string) {
  const c = loadCaptures();
  c[sprite] = (c[sprite] || 0) + 1;
  localStorage.setItem(CAPTURES_KEY, JSON.stringify(c));
}

export default function LeafletMap({ onMapReady, onCloseMap }: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<any>(null);
  const [mapControls, setMapControls] = useState<MapControls | null>(null);
  const [flashCapture, setFlashCapture] = useState<string | null>(null);
  const [flashFailed, setFlashFailed] = useState(false);
  const [minigameEnabled, setMinigameEnabled] = useState(false);
  const flashRef = useRef<((s: string | null) => void) | null>(null);
  const flashFailedRef = useRef<((v: boolean) => void) | null>(null);
  const minigameRef = useRef(false);
  flashRef.current = setFlashCapture;
  flashFailedRef.current = setFlashFailed;

  useEffect(() => { minigameRef.current = minigameEnabled; }, [minigameEnabled]);

  useEffect(() => {
    if (!mapRef.current) return;

    const initMap = async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      if (instanceRef.current) { instanceRef.current.remove(); instanceRef.current = null; }

      const map = L.map(mapRef.current!, { center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM, zoomControl: false, scrollWheelZoom: true });

      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        subdomains: "abcd", maxZoom: 20,
      }).addTo(map);

      // ── STYLES ──
      const style = document.createElement("style");
      style.textContent = `
        .leaflet-popup-content-wrapper { border-radius:6px!important; border:1.5px solid #e5c98a!important; box-shadow:0 4px 18px rgba(146,64,14,0.18)!important; background:#fffbf0!important; padding:0!important; }
        .leaflet-popup-content { margin:12px 14px!important; }
        .leaflet-popup-tip { background:#fffbf0!important; }
        .leaflet-popup-close-button { display:none!important; }
        @keyframes animalBounce { 0%,100%{transform:translateY(0)} 25%{transform:translateY(-4px)} 50%{transform:translateY(-7px)} 75%{transform:translateY(-3px)} }
        .animal-wrapper { display:inline-block; pointer-events:auto; user-select:none; cursor:pointer; transition:transform 0.25s ease; }
        .animal-bounce { display:inline-block; filter:drop-shadow(0 2px 3px rgba(0,0,0,0.25)); animation:animalBounce 1.4s ease-in-out infinite; }
        @keyframes captureFlash { 0%{opacity:0;transform:scale(0.7)} 30%{opacity:1;transform:scale(1.15)} 70%{opacity:1;transform:scale(1)} 100%{opacity:0;transform:scale(1.1)} }
        @keyframes captureShake { 0%{opacity:0;transform:scale(0.8) translateX(0)} 20%{opacity:1;transform:scale(1) translateX(-8px)} 40%{transform:scale(1) translateX(8px)} 60%{transform:scale(1) translateX(-6px)} 80%{transform:scale(1) translateX(4px)} 100%{opacity:0;transform:scale(0.9) translateX(0)} }
      `;
      document.head.appendChild(style);

      // ── ICONS ──
      const emojiIcon = (emoji: string, sublabel: string) => L.divIcon({
        className: "",
        html: `<div class="flex flex-col items-center cursor-pointer animate-bounce"><div class="flex items-center gap-1.5 bg-amber-800 text-amber-100 text-[0.65rem] font-bold tracking-widest uppercase px-2.5 py-1.5 rounded whitespace-nowrap shadow-lg"><span class="text-base leading-none">${emoji}</span><span class="text-amber-300 text-[0.58rem] tracking-widest">${sublabel}</span></div><div class="w-0.5 h-2 bg-amber-800 mx-auto"></div><div class="w-1.5 h-1.5 bg-amber-800 rounded-full"></div></div>`,
        iconSize: [110, 46], iconAnchor: [55, 46], popupAnchor: [0, -50],
      });

      const campIcon = L.divIcon({
        className: "",
        html: `<div class="flex flex-col items-center"><div class="flex items-center gap-1.5 bg-stone-900 text-amber-100 text-[0.65rem] font-bold tracking-widest uppercase px-2.5 py-1.5 rounded whitespace-nowrap shadow-lg"><span class="text-base leading-none">🏕️</span><span class="text-amber-400 text-[0.58rem] tracking-widest">CAMP</span></div><div class="w-0.5 h-2 bg-stone-900 mx-auto"></div><div class="w-1.5 h-1.5 bg-stone-900 rounded-full"></div></div>`,
        iconSize: [110, 46], iconAnchor: [55, 46],
      });

      const treeIcon = (emoji: string, size: number) => L.divIcon({
        className: "",
        html: `<div style="font-size:${size}px;line-height:1;opacity:0.65;pointer-events:none;user-select:none;">${emoji}</div>`,
        iconSize: [size, size], iconAnchor: [size/2, size/2],
      });

      const minigameIcon = () => L.divIcon({
        className: "",
        html: `<div class="flex flex-col items-center cursor-pointer"><div class="flex items-center gap-1.5 bg-amber-50 text-amber-900 text-[0.6rem] font-bold tracking-widest uppercase px-2 py-1.5 rounded shadow-md whitespace-nowrap border border-amber-300"><span class="text-sm leading-none">🎮</span><span>MINI GAME</span></div><div class="w-0.5 h-2 bg-amber-300 mx-auto"></div><div class="w-1.5 h-1.5 bg-amber-300 rounded-full"></div></div>`,
        iconSize: [140, 46], iconAnchor: [70, 46], popupAnchor: [0, -50],
      });

      const giftIdeasIcon = () => L.divIcon({
        className: "",
        html: `<div class="flex flex-col items-center cursor-pointer"><div class="flex items-center gap-1.5 bg-amber-50 text-amber-900 text-[0.6rem] font-bold tracking-widest uppercase px-2 py-1.5 rounded shadow-md whitespace-nowrap border border-amber-300"><span class="text-sm leading-none">🪷</span><span>GIFT IDEAS</span></div><div class="w-0.5 h-2 bg-amber-300 mx-auto"></div><div class="w-1.5 h-1.5 bg-amber-300 rounded-full"></div></div>`,
        iconSize: [130, 46], iconAnchor: [65, 46], popupAnchor: [0, -50],
      });

      const animalIcon = (emoji: string, delay: number, fontSize: number) => L.divIcon({
        className: "",
        html: `<div class="animal-wrapper"><div class="animal-bounce" style="animation-delay:${delay}ms;font-size:${fontSize}rem;">${emoji}</div></div>`,
        iconSize: [44, 44], iconAnchor: [22, 22],
      });

      const swampPuddleIcon = (scale: number) => L.divIcon({
        className: "",
        html: `<div style="pointer-events:none;user-select:none;opacity:0.7;"><svg width="${Math.round(40*scale)}" height="${Math.round(22*scale)}" viewBox="0 0 40 22" fill="none"><ellipse cx="20" cy="16" rx="18" ry="6" fill="#6ee7b7" fill-opacity="0.45" stroke="#34d399" stroke-width="0.8"/><ellipse cx="12" cy="16.5" rx="6" ry="2.5" fill="#a7f3d0" fill-opacity="0.5"/><ellipse cx="27" cy="15.5" rx="5" ry="2" fill="#a7f3d0" fill-opacity="0.5"/><circle cx="10" cy="13" r="1.8" fill="#f9a8d4" fill-opacity="0.9"/><circle cx="28" cy="14" r="1.4" fill="#fda4af" fill-opacity="0.9"/><line x1="20" y1="2" x2="20" y2="13" stroke="#7c6c3a" stroke-width="1.2" stroke-linecap="round"/><line x1="24" y1="4" x2="24" y2="13" stroke="#7c6c3a" stroke-width="1.2" stroke-linecap="round"/><line x1="16" y1="5" x2="16" y2="13" stroke="#7c6c3a" stroke-width="1.2" stroke-linecap="round"/><ellipse cx="20" cy="2" rx="1.6" ry="2.8" fill="#a16207" fill-opacity="0.85"/><ellipse cx="24" cy="4" rx="1.3" ry="2.2" fill="#a16207" fill-opacity="0.85"/><ellipse cx="16" cy="5" rx="1.3" ry="2.2" fill="#a16207" fill-opacity="0.85"/></svg></div>`,
        iconSize: [Math.round(40*scale), Math.round(22*scale)],
        iconAnchor: [Math.round(20*scale), Math.round(22*scale)],
      });

      // ── TREES ──
      TREE_MARKERS.forEach(({ coords, emoji, size }) => {
        L.marker(coords, { icon: treeIcon(emoji, size), interactive: false, zIndexOffset: -1000 }).addTo(map);
      });

      // ── SWAMP PUDDLES ──
      const LAGOON_CENTER: [number, number] = [13.944111725539413, 121.63636114344037];
      const swampOffsets: [number, number, number][] = [[-0.0010,0.0005,1.1],[0.0008,-0.0008,0.85],[-0.0005,-0.0012,1.0],[0.0013,0.0010,0.9],[0.0000,0.0015,1.2],[-0.0014,0.0012,0.8]];
      swampOffsets.forEach(([dlat, dlng, scale]) => {
        L.marker([LAGOON_CENTER[0]+dlat, LAGOON_CENTER[1]+dlng], { icon: swampPuddleIcon(scale), interactive: false, zIndexOffset: -900 }).addTo(map);
      });

      // ── ANIMALS ──
      const closeAllTooltips = () => document.querySelectorAll(".animal-tooltip").forEach(el => el.remove());

      const showAnimalTooltip = (marker: any, sprite: string, captureRate: number, onCapture: () => void) => {
        closeAllTooltips();
        const el = marker.getElement();
        if (!el || !mapRef.current) return;
        const rect = el.getBoundingClientRect();
        const mapRect = mapRef.current.getBoundingClientRect();
        const tooltip = document.createElement("div");
        tooltip.className = "animal-tooltip absolute z-[9999] pointer-events-auto flex flex-col items-center gap-2 bg-amber-50 border border-amber-300 rounded-xl px-4 py-3 shadow-xl";
        tooltip.style.cssText = `left:${rect.left - mapRect.left + rect.width/2}px;top:${rect.top - mapRect.top - 12}px;transform:translate(-50%,-100%);`;
        tooltip.innerHTML = `
          <div class="text-4xl leading-none">${sprite}</div>
          <button class="animal-tooltip-btn flex items-center gap-1.5 bg-stone-900 hover:bg-amber-800 text-amber-100 text-[0.62rem] tracking-widest uppercase px-3 py-2 rounded-md cursor-pointer border-0 whitespace-nowrap w-full justify-center">
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none"><rect x="1" y="4" width="14" height="10" rx="2" stroke="currentColor" stroke-width="1.5"/><circle cx="8" cy="9" r="2.5" stroke="currentColor" stroke-width="1.5"/><path d="M5.5 4V3a1 1 0 011-1h3a1 1 0 011 1v1" stroke="currentColor" stroke-width="1.5"/></svg>
            Capture
          </button>`;
        mapRef.current.appendChild(tooltip);
        tooltip.querySelector("button")?.addEventListener("click", (e) => {
          e.stopPropagation();
          tooltip.remove();
          if (Math.random() < captureRate) {
            saveCapture(sprite);
            window.dispatchEvent(new CustomEvent("safari:capture"));
            onCapture();
            flashRef.current?.(sprite);
            setTimeout(() => flashRef.current?.(null), 1400);
          } else {
            onCapture();
            flashFailedRef.current?.(true);
            setTimeout(() => flashFailedRef.current?.(false), 1200);
          }
        });
      };

      const animateToLatLng = (marker: any, from: [number, number], to: [number, number], durationMs: number) => {
        const wrapper = marker.getElement()?.querySelector(".animal-wrapper") as HTMLElement | null;
        if (wrapper) wrapper.style.transform = `scaleX(${to[1] < from[1] ? -1 : 1})`;
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min((now - start) / durationMs, 1);
          const e = t < 0.5 ? 4*t*t*t : 1 - (-2*t+2)**3/2;
          marker.setLatLng([from[0]+(to[0]-from[0])*e, from[1]+(to[1]-from[1])*e]);
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      };

      let animalData: { marker: any; coords: [number, number]; sprite: string; captureRate: number }[] = [];
      let wanderInterval: ReturnType<typeof setInterval> | null = null;
      let respawnInterval: ReturnType<typeof setInterval> | ReturnType<typeof setTimeout> | null = null;

      const spawnAnimals = () => {
        if (!instanceRef.current || !mapRef.current || !minigameRef.current) return;
        closeAllTooltips();
        if (wanderInterval) { clearInterval(wanderInterval); wanderInterval = null; }
        animalData.forEach(a => { try { a.marker.remove(); } catch {} });
        animalData = [];
        const shuffled = [...ANIMAL_EMOJIS].sort(() => Math.random() - 0.5);
        const count = 3 + Math.floor(Math.random() * 3);
        for (let i = 0; i < count; i++) {
          try {
            const animal = shuffled[i % shuffled.length];
            const fontSize = animal.size[0] + Math.random() * (animal.size[1] - animal.size[0]);
            const coords = randomNearTree(rng);
            const marker = L.marker(coords, { icon: animalIcon(animal.sprite, Math.floor(rng()*800), fontSize), interactive: true, zIndexOffset: -500 }).addTo(instanceRef.current);
            const entry = { marker, coords, sprite: animal.sprite, captureRate: animal.captureRate };
            animalData.push(entry);
            marker.on("click", (e: any) => {
              e.originalEvent.stopPropagation();
              instanceRef.current?.flyTo(entry.coords, FLY_ZOOM, { duration: 0.8 });
              setTimeout(() => showAnimalTooltip(marker, entry.sprite, entry.captureRate, () => {
                marker.remove();
                const idx = animalData.indexOf(entry);
                if (idx !== -1) animalData.splice(idx, 1);
              }), 900);
            });
          } catch {}
        }
        wanderInterval = setInterval(() => {
          if (!instanceRef.current) return;
          animalData.forEach(animal => {
            const from: [number, number] = [...animal.coords];
            const to: [number, number] = [from[0]+(rng()-0.5)*0.0014, from[1]+(rng()-0.5)*0.0014];
            animal.coords = to;
            animateToLatLng(animal.marker, from, to, 2500);
          });
        }, 3000);
      };

      const enableMinigame = () => {
        localStorage.setItem(MINIGAME_KEY, "true");
        minigameRef.current = true;
        setMinigameEnabled(true);
        window.dispatchEvent(new CustomEvent("safari:minigame-started"));
        spawnAnimals();
        const RESPAWN_MS = 30_000;
        if (respawnInterval) { clearTimeout(respawnInterval as any); clearInterval(respawnInterval as any); }
        localStorage.setItem(RESPAWN_KEY, String(Date.now() + RESPAWN_MS));
        respawnInterval = setInterval(spawnAnimals, RESPAWN_MS);
      };

      instanceRef.current = map;

      // Resume if already accepted
      if (localStorage.getItem(MINIGAME_KEY) === "true") {
        minigameRef.current = true;
        setMinigameEnabled(true);
        const RESPAWN_MS = 30_000;
        const remaining = parseInt(localStorage.getItem(RESPAWN_KEY) || "0") - Date.now();
        if (remaining > 0) {
          respawnInterval = setTimeout(() => { spawnAnimals(); respawnInterval = setInterval(spawnAnimals, RESPAWN_MS); }, remaining);
        } else {
          spawnAnimals();
          respawnInterval = setInterval(spawnAnimals, RESPAWN_MS);
        }
      }

      map.on("dragstart click", closeAllTooltips);

      (map as any)._cleanup = () => {
        if (wanderInterval) { clearInterval(wanderInterval); wanderInterval = null; }
        if (respawnInterval) { clearTimeout(respawnInterval as any); clearInterval(respawnInterval as any); respawnInterval = null; }
        animalData.forEach(a => { try { a.marker.remove(); } catch {} });
        animalData = [];
        closeAllTooltips();
      };

      // ── EVENT MARKERS (Church + RSVP) ──
      const leafletMarkers: (any | null)[] = [];

      const wireGoButton = (lm: any) => {
        const container = lm.getPopup()?.getElement();
        if (!container) return;
        const btn = container.querySelector("[data-action='go']") as HTMLElement | null;
        if (!btn) return;
        const fresh = btn.cloneNode(true) as HTMLElement;
        btn.replaceWith(fresh);
        fresh.addEventListener("click", (e) => {
          e.stopPropagation();
          selectMarker(parseInt(fresh.getAttribute("data-target") ?? "0", 10));
        });
      };

      const selectMarker = (index: number) => {
        leafletMarkers.forEach(lm => lm?.closePopup());
        mountainMarkers.forEach(m => m?.closePopup());
        map.flyTo(MARKERS[index].coords, FLY_ZOOM, { duration: 1.2 });
        leafletMarkers[index]?.openPopup();
        setTimeout(() => wireGoButton(leafletMarkers[index]), 100);
      };

      MARKERS.forEach((m, i) => {
        if (i === 2) {
          // Camp: static, non-interactive
          L.marker(m.coords, { icon: campIcon, interactive: false, zIndexOffset: -100 }).addTo(map);
          leafletMarkers.push(null);
          return;
        }
        const lm = L.marker(m.coords, { icon: emojiIcon(m.emoji, m.label) })
          .addTo(map)
          .bindPopup(m.popup, { maxWidth: 260, closeOnClick: false, autoClose: false, closeButton: false });
        lm.on("click", (e: any) => { e.originalEvent.stopPropagation(); selectMarker(i); });
        leafletMarkers.push(lm);
      });

      // ── MOUNTAIN PINS (Mini Game + Gift Ideas) ──
      const GIFT_IDEAS_POPUP = `
        <div style="font-family:sans-serif;min-width:200px;">
          <div style="font-size:0.65rem;letter-spacing:0.12em;text-transform:uppercase;color:#92400e;margin-bottom:4px;">Gift Ideas</div>
          <div style="font-size:0.88rem;font-weight:600;color:#1c1410;margin-bottom:8px;line-height:1.4;">Your presence is the greatest gift!</div>
          <div style="font-size:0.78rem;color:#57534e;line-height:1.7;margin-bottom:6px;">
            But if you'd like to bring something:<br/>
            🧸 Stuffed animals & plush toys<br/>
            📚 Children's books<br/>
            🦁 Safari-themed keepsakes<br/>
            💛 Cash or GCash is also welcome
          </div>
          <div style="font-size:0.7rem;color:#92400e;font-style:italic;">No pressure — just come and celebrate! 🎉</div>
        </div>`;

      const MOUNTAIN_COORDS = [
        [13.949319240144398, 121.63213171410052] as [number, number],
        [13.944111725539413, 121.63636114344037] as [number, number],
      ];

      const mountainMarkers: any[] = [];

      map.on("dragstart", () => {
        leafletMarkers.forEach(lm => lm?.closePopup());
        mountainMarkers.forEach(m => m?.closePopup());
      });

      // Builds the minigame popup HTML dynamically based on current state
      const buildMinigamePopup = () => {
        const started = localStorage.getItem(MINIGAME_KEY) === "true";
        const captures = loadCaptures();
        const total = Object.values(captures).filter(v => v > 0).length;
        const ALL_COUNT = 20;

        if (!started) {
          return `
            <div style="font-family:sans-serif;min-width:200px;">
              <div style="font-size:0.65rem;letter-spacing:0.12em;text-transform:uppercase;color:#92400e;margin-bottom:4px;">Safari Mini-Game</div>
              <div style="font-size:0.88rem;font-weight:600;color:#1c1410;margin-bottom:8px;line-height:1.4;">Collect All the Animals! 🦁</div>
              <div style="font-size:0.78rem;color:#57534e;line-height:1.7;margin-bottom:10px;">Tap an animal to zoom in, then press <strong style="color:#92400e;">Capture</strong>. Collect all 20 and claim a prize at the event! 🏆</div>
              <div style="display:flex;gap:6px;justify-content:center;font-size:1.2rem;margin-bottom:12px;">🐅 🐘 🦒 🦜 🐊</div>
              <button data-action="enable-minigame" style="width:100%;padding:6px 8px;background:#92400e;color:#fef3c7;font-size:0.7rem;letter-spacing:0.08em;text-transform:uppercase;border-radius:2px;border:none;cursor:pointer;font-weight:600;">🌿 Start Hunting!</button>
            </div>`;
        }

        return `
          <div style="font-family:sans-serif;min-width:200px;">
            <div style="font-size:0.65rem;letter-spacing:0.12em;text-transform:uppercase;color:#92400e;margin-bottom:4px;">Safari Mini-Game</div>
            <div style="font-size:0.88rem;font-weight:600;color:#1c1410;margin-bottom:4px;line-height:1.4;">Your Collection 📷</div>
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
              <div style="flex:1;background:#e5e7eb;border-radius:99px;height:6px;overflow:hidden;">
                <div style="background:#92400e;height:100%;width:${Math.round((total/ALL_COUNT)*100)}%;border-radius:99px;transition:width 0.4s;"></div>
              </div>
              <span style="font-size:0.85rem;font-weight:700;color:#92400e;white-space:nowrap;">${total}<span style="font-size:0.65rem;color:#a8a29e;font-weight:400;">/${ALL_COUNT}</span></span>
            </div>
            <button data-action="view-collection" style="width:100%;padding:6px 8px;background:#92400e;color:#fef3c7;font-size:0.7rem;letter-spacing:0.08em;text-transform:uppercase;border-radius:2px;border:none;cursor:pointer;font-weight:600;">📷 View Collection</button>
          </div>`;
      };

      const openMinigamePopup = (lm: any) => {
        lm.setPopupContent(buildMinigamePopup());
        lm.openPopup();
        setTimeout(() => {
          const popup = lm.getPopup()?.getElement();
          if (!popup) return;

          // Wire start hunting button
          const startBtn = popup.querySelector("[data-action='enable-minigame']") as HTMLElement | null;
          if (startBtn) {
            const fresh = startBtn.cloneNode(true) as HTMLElement;
            startBtn.replaceWith(fresh);
            fresh.addEventListener("click", (ev) => {
              ev.stopPropagation();
              enableMinigame();
              // Refresh popup to show collection view
              lm.setPopupContent(buildMinigamePopup());
              setTimeout(() => wireMinigamePopupButtons(lm), 100);
            });
          }

          // Wire view collection button
          const viewBtn = popup.querySelector("[data-action='view-collection']") as HTMLElement | null;
          if (viewBtn) {
            const fresh = viewBtn.cloneNode(true) as HTMLElement;
            viewBtn.replaceWith(fresh);
            fresh.addEventListener("click", (ev) => {
              ev.stopPropagation();
              lm.closePopup();
              window.dispatchEvent(new CustomEvent("safari:open-collection"));
            });
          }
        }, 100);
      };

      const wireMinigamePopupButtons = (lm: any) => {
        const popup = lm.getPopup()?.getElement();
        if (!popup) return;
        const startBtn = popup.querySelector("[data-action='enable-minigame']") as HTMLElement | null;
        if (startBtn) {
          const fresh = startBtn.cloneNode(true) as HTMLElement;
          startBtn.replaceWith(fresh);
          fresh.addEventListener("click", (ev) => {
            ev.stopPropagation();
            enableMinigame();
            lm.setPopupContent(buildMinigamePopup());
            setTimeout(() => wireMinigamePopupButtons(lm), 100);
          });
        }
        const viewBtn = popup.querySelector("[data-action='view-collection']") as HTMLElement | null;
        if (viewBtn) {
          const fresh = viewBtn.cloneNode(true) as HTMLElement;
          viewBtn.replaceWith(fresh);
          fresh.addEventListener("click", (ev) => {
            ev.stopPropagation();
            lm.closePopup();
            window.dispatchEvent(new CustomEvent("safari:open-collection"));
          });
        }
      };

      // minigame marker (index 0)
      const mgMarker = L.marker(MOUNTAIN_COORDS[0], { icon: minigameIcon(), zIndexOffset: -200 })
        .addTo(map)
        .bindPopup("", { maxWidth: 240, closeOnClick: false, autoClose: false, closeButton: false });
      mgMarker.on("click", (e: any) => {
        e.originalEvent.stopPropagation();
        leafletMarkers.forEach(m => m?.closePopup());
        mountainMarkers.forEach(m => { if (m !== mgMarker) m?.closePopup(); });
        map.flyTo(MOUNTAIN_COORDS[0], FLY_ZOOM, { duration: 1.2 });
        openMinigamePopup(mgMarker);
      });
      mountainMarkers.push(mgMarker);

      // gift ideas marker (index 1)
      const giMarker = L.marker(MOUNTAIN_COORDS[1], { icon: giftIdeasIcon(), zIndexOffset: -200 })
        .addTo(map)
        .bindPopup(GIFT_IDEAS_POPUP, { maxWidth: 240, closeOnClick: false, autoClose: false, closeButton: false });
      giMarker.on("click", (e: any) => {
        e.originalEvent.stopPropagation();
        leafletMarkers.forEach(m => m?.closePopup());
        mountainMarkers.forEach(m => { if (m !== giMarker) m?.closePopup(); });
        map.flyTo(MOUNTAIN_COORDS[1], FLY_ZOOM, { duration: 1.2 });
        giMarker.openPopup();
      });
      mountainMarkers.push(giMarker);

      // Also refresh minigame popup count when a capture happens
      window.addEventListener("safari:capture", () => {
        if (mgMarker.isPopupOpen()) {
          mgMarker.setPopupContent(buildMinigamePopup());
          setTimeout(() => wireMinigamePopupButtons(mgMarker), 100);
        }
      });

      // ── CONTROLS ──
      const controls: MapControls = {
        zoomIn:  () => map.zoomIn(),
        zoomOut: () => map.zoomOut(),
        flyTo: (index: number) => {
          if (index <= 2) {
            selectMarker(index);
          } else {
            const pinCoords = MOUNTAIN_COORDS[index - 3];
            if (!pinCoords) return;
            leafletMarkers.forEach(m => m?.closePopup());
            mountainMarkers.forEach(m => m?.closePopup());
            map.flyTo(pinCoords, FLY_ZOOM, { duration: 1.2 });
            setTimeout(() => {
              if (index - 3 === 0) openMinigamePopup(mgMarker);
              else mountainMarkers[index - 3]?.openPopup();
            }, 1300);
          }
        },
        reset: () => {
          leafletMarkers.forEach(lm => lm?.closePopup());
          mountainMarkers.forEach(m => m?.closePopup());
          map.flyTo(DEFAULT_CENTER, DEFAULT_ZOOM, { duration: 1.2 });
        },
      };

      setMapControls(controls);
      onMapReady?.(controls);
    };

    initMap();

    return () => {
      (instanceRef.current as any)?._cleanup?.();
      instanceRef.current?.remove();
      instanceRef.current = null;
    };
  }, []);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <div ref={mapRef} style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }} />
      <MapControlsUI controls={mapControls} hideControls={false} onCloseMap={onCloseMap} />

      {flashCapture && (
        <div style={{ position:"absolute", inset:0, zIndex:9000, display:"flex", alignItems:"center", justifyContent:"center", pointerEvents:"none", animation:"captureFlash 1.4s ease forwards" }}>
          <div style={{ background:"#fffbf0", border:"2px solid #92400e", borderRadius:"16px", padding:"20px 32px", display:"flex", flexDirection:"column", alignItems:"center", gap:"6px", boxShadow:"0 8px 32px rgba(146,64,14,0.25)" }}>
            <div style={{ fontSize:"3.5rem", lineHeight:1 }}>{flashCapture}</div>
            <div style={{ fontSize:"0.7rem", letterSpacing:"0.14em", textTransform:"uppercase", color:"#92400e", fontWeight:700 }}>📸 Captured!</div>
          </div>
        </div>
      )}

      {flashFailed && (
        <div style={{ position:"absolute", inset:0, zIndex:9000, display:"flex", alignItems:"center", justifyContent:"center", pointerEvents:"none", animation:"captureShake 1.2s ease forwards" }}>
          <div style={{ background:"#fff5f5", border:"2px solid #dc2626", borderRadius:"16px", padding:"20px 32px", display:"flex", flexDirection:"column", alignItems:"center", gap:"6px", boxShadow:"0 8px 32px rgba(220,38,38,0.2)" }}>
            <div style={{ fontSize:"3.5rem", lineHeight:1 }}>💨</div>
            <div style={{ fontSize:"0.7rem", letterSpacing:"0.14em", textTransform:"uppercase", color:"#dc2626", fontWeight:700 }}>Got Away!</div>
          </div>
        </div>
      )}
    </div>
  );
}