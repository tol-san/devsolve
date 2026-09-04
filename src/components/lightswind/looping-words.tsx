"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

interface LoopingWordsProps {
  words: string[];
  className?: string;
}

export function LoopingWords({ words, className }: LoopingWordsProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [words.length]);

  const currentWord = words[index];

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="relative inline-flex items-center justify-center px-8 py-4 text-[7vw] sm:text-[5vw] md:text-[3.8vw] leading-none font-black uppercase whitespace-nowrap">
        
        <AnimatePresence mode="wait">
          <motion.span
            key={currentWord}
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -24, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="text-slate-900 dark:text-slate-900 tracking-tighter font-extrabold select-none"
          >
            {currentWord}
          </motion.span>
        </AnimatePresence>

        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-indigo-600" />
          <div className="absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 border-indigo-600" />
          <div className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b-2 border-l-2 border-indigo-600" />
          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 border-indigo-600" />
        </div>
      </div>
    </div>
  );
}

