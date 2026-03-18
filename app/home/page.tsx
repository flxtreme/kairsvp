"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cls } from "@/utils/cls";
import { useState } from "react";
import Image from "next/image";
import Animals from "@/app/home/animals.png";
import Parchment from "@/app/home/parchment.png";
import Silhoutte from "@/app/home/silhouette.png";
import LeafletMap, { MapControls } from "./map";

export default function Home() {
  const [open, setOpen] = useState(false);
  const [completelyOpen, setCompletelyOpen] = useState(false);
  const [letterClicked, setLetterClicked] = useState(false);
  const [openMap, setOpenMap] = useState(false);

  // 1. Add state
  const [mapControls, setMapControls] = useState<MapControls | null>(null);


  const onEnvelopCompletelyOpen = () => {
    setCompletelyOpen(open);
  }

  const handleLetterClick = () => {
    setLetterClicked(!letterClicked);
  }

  const openEnvelop = () => {
    if ( !open ) {
      setCompletelyOpen(false);
      setOpen(true);
    }
  }

  const closeEnvelop = () => {
    if ( letterClicked ) {
      setLetterClicked(false);
      return;
    }
    if (open) {
      setCompletelyOpen(false)
      setOpen(false);
    }
  }
  
  const handleLetsGoWild = () => {
    if (!letterClicked) return;
    setLetterClicked(false);
    setCompletelyOpen(false);
    setOpen(false);

    setOpenMap(true);
  }

  const handleOnCloseMap = () => {
    setOpenMap(false);
  }

  return (
    <div className={cls(
      "h-screen w-full overflow-hidden bg-amber-50 relative"
    )}>
      <div className="h-full w-full mx-auto max-w-xs flex items-center justify-center">

        {/* ── MAP OVERLAY ── */}
        <AnimatePresence>
          {openMap && (
            <>
              {/* Stage 1: fast radial ripple burst that fades out */}
              <motion.div
                className="absolute z-20 rounded-full bg-amber-900 pointer-events-none"
                style={{ left: "50%", top: "50%" }}
                initial={{ width: 0, height: 0, x: "-50%", y: "-50%" }}
                animate={{ width: "300vmax", height: "300vmax" }}
                transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
              />

              {/* Stage 2: ink-bleed / circular wipe that reveals the map */}
              <motion.div
                className="absolute inset-0 z-30 bg-amber-100 flex items-center justify-center origin-center"
                initial={{ clipPath: "circle(0% at 50% 50%)" }}
                animate={{ clipPath: "circle(150% at 50% 50%)" }}
                transition={{ duration: 2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
              >
                {/* Stage 3: content fades + slides up inside the revealed panel */}
                <motion.div
                  className="text-amber-900 font-lso text-2xl h-screen w-screen tracking-widest"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 1.1 }}
                >

                  <div className="absolute inset-0 z-1">
                    <LeafletMap onMapReady={setMapControls} onCloseMap={handleOnCloseMap} />
                  </div>
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <motion.div
          initial={false}
          animate={{
            scale: open ? 1.1 : 1,
            marginTop: letterClicked ? "100%" : 0
          }}
          className={cls(
            "relative flex items-center justify-center w-full h-55 bg-radial from-olive-50 to-olive-200 shadow-2xl",
            "cursor-pointer origin-center",
            "rounded-b-md",
            "transition-all duration-800 ease-in-out"
          )}
        >
          
          {/* Envelope Flap */}
          <motion.div
            initial={false}
            animate={{ rotateX: open ? -180 : 0 }}
            style={{ transformOrigin: "top" }}
            onClick={closeEnvelop}
            onTransitionEnd={onEnvelopCompletelyOpen}
            className={cls(
              "absolute inset-x-0 top-0 h-1/2 bg-radial from-olive-50 to-olive-200 rounded-b-[300px]",
              "-rotate-x-3 shadow-lg origin-top",
              "transition-all ease-in-out duration-800",
              completelyOpen ? "z-1" : "z-5"
            )}
          />

          <motion.div
            initial={false}
            animate={{
              scale: open ? 0 : 1
            }}
            onClick={openEnvelop}
            className={cls(
              "cursor-pointer size-18 shadow-lg drop-shadow-sm absolute left-1/2 top-1/2 -translate-y-1/2 rounded-full -translate-x-1/2 bg-radial from-red-400 to-red-500 z-6",
              "transition-all duration-500 ease-in-out delay-500",
              "p-1 border-2 border-white/20 hover:delay-0",
              "hover:scale-105"
            )}
          >
            <div className="size-full border-2 border-dashed rounded-full border-white/25">
            </div>
          </motion.div>

          {/* Envelope Body */}
          <div 
            onClick={closeEnvelop}
            className={cls(
              "absolute drop-shadow-sm bottom-0 w-full bg-radial from-olive-200 to-olive-50 rounded-b-md flex items-center justify-center z-3",
              completelyOpen ? "top-1/10" : "top-0",
              "transition-all duration-800 ease-in-out"
            )}>
            <div className={cls(
              "absolute inset-0",
              "flex flex-col font-lso items-center justify-center gap-2 h-full w-full",
              completelyOpen ? "opacity-100" : "opacity-0",
              "transition-all duration-800 ease-in-out"
            )}>
              <span className="absolute text-lg top-4 left-4">From: Kaiden</span>
            </div>
            <Image src={Animals} alt="animals" className="absolute -bottom-0.5 z-4 select-none w-full h-auto" />
          </div>


          <motion.div 
            initial={false}
            animate={{ 
              bottom: letterClicked ? "90%" : completelyOpen ? 50 : 0,
            }}
            onClick={handleLetterClick}
            className={cls(
              "w-9/10 h-7/10 absolute bg-white z-2 bottom-0 drop-shadow-sm",
              "transition-all duration-800 ease-in-out",
              "relative drop-shadow-sm"
            )}>
              <div className="absolute inset-0 overflow-hidden flex items-center justify-center">
                <Image src={Parchment} alt="matte" className="h-full w-full opacity-90" />
                <Image src={Silhoutte} alt="animals" className="absolute bottom-0 h-auto opacity-10 w-full mix-blend-multiply" />
              </div>
              <div className="h-full w-full flex items-center justify-center relative z-1 text-amber-900 font-lso">
                <div className="flex-1 w-full flex flex-col h-full pt-4 pb-2 items-center justify-center text-center text-xs">
                  <div className={cls(
                    "bg-amber-950 text-sm text-amber-100 px-2 inline-flex gap-2 uppercase",
                    "transition-all duration-200 ease-in-out",
                    !letterClicked && "animate-bounce"
                  )}>
                    <span>&gt;&gt;</span>
                    <span className="font-lso">you are invited to</span>
                    <span>&lt;&lt;</span>
                  </div>
                  <div className="flex-1"></div>
                  <div className="font-bold text-3xl font-lso">
                    KAIDEN FELIX's
                  </div>
                  <div className="text-base">
                    Christening & 1st Birthday
                  </div>
                  <div className="flex-1"></div>
                  <div className="flex items-end justify-stretch gap-2 w-full px-3">
                    <div className="text-xs flex-1 flex flex-col items-start text-left">
                      <span>APRIL 19, 2026</span>
                      <span className="text-sm">9:30 AM</span>
                    </div>
                    <div className="text-right text-xs ml-auto px-2 text-amber-100 flex items-center gap-2 animate-bounce bg-amber-950">
                      <span>for directions</span>
                      <span>&gt;&gt;</span>
                    </div>
                  </div>
                </div>
                <div className={cls(
                  "w-14 relative h-full border-2 border-dashed border-amber-900 flex items-center justify-center",
                  "transition-all duration-500 ease-in-out",
                )}>
                  <div className="flex flex-col items-center top-1/2 left-1/2 absolute -translate-y-1/2 -translate-x-1/2 rotate-90">
                    <div 
                      onClick={handleLetsGoWild}
                      className={cls(
                        "w-37 py-2.5 bg-amber-950 text-center",
                        "transition-all duration-200 ease-in-out",
                        letterClicked && "hover:bg-amber-900"
                      )}
                    >
                      <div className="text-amber-100 text-xl tracking-widest font-bold">
                        <span className={cls(
                          letterClicked && "animate-pulse"
                        )}>LET'S GO WILD</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

        </motion.div>
      </div>
    </div>
  );
}

