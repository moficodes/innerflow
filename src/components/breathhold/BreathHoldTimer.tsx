import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Timer, Trophy, History } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface BreathHoldTimerProps {
  onRecord: (seconds: number) => void;
}

export function BreathHoldTimer({ onRecord }: BreathHoldTimerProps) {
  const [isHolding, setIsHolding] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isHolding) {
      timerRef.current = window.setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isHolding]);

  const toggleHold = () => {
    if (isHolding) {
      onRecord(seconds);
      setIsHolding(false);
    } else {
      setSeconds(0);
      setIsHolding(true);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center py-8 gap-16">
      <div className="relative group">
        <div className={cn(
          "absolute -inset-8 rounded-full blur-[100px] transition-all duration-1000",
          isHolding ? "bg-indigo-600/20 scale-125 opacity-100" : "bg-transparent opacity-0"
        )} />
        
        <button
          onClick={toggleHold}
          className={cn(
            "relative w-80 h-80 rounded-full border flex flex-col items-center justify-center transition-all duration-700 backdrop-blur-xl",
            isHolding 
              ? "border-indigo-500/50 bg-indigo-500/5 scale-105" 
              : "border-white/10 hover:border-white/20 bg-white/5 active:scale-95"
          )}
        >
          <span className="text-[10px] font-bold tracking-[0.4em] text-indigo-300 uppercase mb-4">
            {isHolding ? 'Retention Active' : 'Begin Hold'}
          </span>
          <span className="text-7xl font-light tabular-nums tracking-tighter">
            {formatTime(seconds)}
          </span>
          <div className="mt-8 opacity-20 group-hover:opacity-100 transition-opacity">
            <Timer className={isHolding ? "animate-pulse text-indigo-400" : "text-white"} size={24} />
          </div>
        </button>
      </div>

      <div className="text-center max-w-sm">
        <h3 className="text-xl font-light tracking-wide text-white/90 mb-2">Breath Retention</h3>
        <p className="text-[10px] text-white/40 tracking-[0.2em] uppercase mb-8">Quiet Space • Stillness</p>
        
        {seconds > 0 && !isHolding && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center gap-3 px-8 py-3 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold tracking-[0.2em] uppercase"
          >
            <Trophy size={14} />
            Achievement: {seconds}s hold recorded
          </motion.div>
        )}
      </div>
    </div>
  );
}
