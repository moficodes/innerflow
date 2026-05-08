import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RotateCcw, Wind, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Exercise {
  id: string;
  name: string;
  difficulty: Difficulty;
  description: string;
  benefits: string[];
  useCase: string;
  steps: {
    type: 'inhale' | 'hold' | 'exhale' | 'sustain';
    duration: number;
    label: string;
  }[];
}

export const EXERCISES: Exercise[] = [
  // Box Breathing
  {
    id: 'box-beginner',
    name: 'Standard Box',
    difficulty: 'beginner',
    description: '4-4-4-4 rhythm. Ideal for focus and resetting.',
    benefits: ['Lowers stress', 'Improves concentration', 'Balances energy'],
    useCase: 'Use this to quickly reset during a stressful workday or before a meeting.',
    steps: [
      { type: 'inhale', duration: 4, label: 'Inhale' },
      { type: 'hold', duration: 4, label: 'Hold' },
      { type: 'exhale', duration: 4, label: 'Exhale' },
      { type: 'sustain', duration: 4, label: 'Pause' },
    ],
  },
  {
    id: 'box-intermediate',
    name: 'Steady Box',
    difficulty: 'intermediate',
    description: '5-5-5-5 rhythm. A step up in control.',
    benefits: ['Increases lung capacity', 'Deepens focus', 'Calms nervous system'],
    useCase: 'Ideal for transitioning from work to personal time or preparing for deep work.',
    steps: [
      { type: 'inhale', duration: 5, label: 'Inhale' },
      { type: 'hold', duration: 5, label: 'Hold' },
      { type: 'exhale', duration: 5, label: 'Exhale' },
      { type: 'sustain', duration: 5, label: 'Pause' },
    ],
  },
  {
    id: 'box-advanced',
    name: 'Deep Box',
    difficulty: 'advanced',
    description: '6-6-6-6 rhythm for expanded lung capacity.',
    benefits: ['Maximized CO2 tolerance', 'Superior mental clarity', 'Vagal tone enhancement'],
    useCase: 'For experienced practitioners looking to significantly expand their respiratory control.',
    steps: [
      { type: 'inhale', duration: 6, label: 'Inhale' },
      { type: 'hold', duration: 6, label: 'Hold' },
      { type: 'exhale', duration: 6, label: 'Exhale' },
      { type: 'sustain', duration: 6, label: 'Pause' },
    ],
  },
  // 4-7-8
  {
    id: '478-beginner',
    name: '4-7-8 Calm',
    difficulty: 'beginner',
    description: 'The standard relaxing rhythm.',
    benefits: ['Promotes sleep', 'Reduces anxiety', 'Natural tranquilizer'],
    useCase: 'Perfect for falling asleep or calming down after an argument.',
    steps: [
      { type: 'inhale', duration: 4, label: 'Inhale' },
      { type: 'hold', duration: 7, label: 'Hold' },
      { type: 'exhale', duration: 8, label: 'Exhale' },
    ],
  },
  {
    id: '478-intermediate',
    name: '4-7-8 Focus',
    difficulty: 'intermediate',
    description: 'Mid-range durations for deeper calm.',
    benefits: ['Neurological reset', 'Emotional regulation', 'Deep relaxation'],
    useCase: 'Use during a break to shift from a high-alpha/beta state to a calm theta state.',
    steps: [
      { type: 'inhale', duration: 5, label: 'Inhale' },
      { type: 'hold', duration: 8, label: 'Hold' },
      { type: 'exhale', duration: 10, label: 'Exhale' },
    ],
  },
  {
    id: '478-advanced',
    name: '4-7-8 Deep',
    difficulty: 'advanced',
    description: 'Extended durations for deeper nervous system reset.',
    benefits: ['Profound stillness', 'Parasympathetic dominance', 'Optimized HRV'],
    useCase: 'Advanced recovery session after intense physical or mental exertion.',
    steps: [
      { type: 'inhale', duration: 6, label: 'Inhale' },
      { type: 'hold', duration: 10, label: 'Hold' },
      { type: 'exhale', duration: 12, label: 'Exhale' },
    ],
  },
  // Physiological Sigh
  {
    id: 'sigh-beginner',
    name: 'Instant Relief',
    difficulty: 'beginner',
    description: 'Quick stress reduction.',
    benefits: ['Immediate CO2 offloading', 'Rapid heart rate drop', 'Mental reset'],
    useCase: 'The fastest way to lower your real-time stress levels in just 2-3 cycles.',
    steps: [
      { type: 'inhale', duration: 3, label: 'Deep Inhale' },
      { type: 'inhale', duration: 1, label: 'Top it up' },
      { type: 'exhale', duration: 6, label: 'Long Exhale' },
    ],
  },
  {
    id: 'sigh-intermediate',
    name: 'Steady Sigh',
    difficulty: 'intermediate',
    description: 'Balanced reset.',
    benefits: ['Enhanced carbon dioxide clearance', 'Restores lung alveoli', 'Mood elevation'],
    useCase: 'Use whenever you feel "stuck" or mentally fatigued to refresh your system.',
    steps: [
      { type: 'inhale', duration: 4, label: 'Deep Inhale' },
      { type: 'inhale', duration: 1.5, label: 'Top it up' },
      { type: 'exhale', duration: 8, label: 'Long Exhale' },
    ],
  },
  {
    id: 'sigh-advanced',
    name: 'Somatic Release',
    difficulty: 'advanced',
    description: 'Maximized exhales for total system clearance.',
    benefits: ['Deep somatic discharge', 'Total muscle relaxation', 'Unlocks respiratory diaphragm'],
    useCase: 'Integrated into a morning or evening routine for proactive stress management.',
    steps: [
      { type: 'inhale', duration: 4, label: 'Deep Inhale' },
      { type: 'inhale', duration: 2, label: 'Top it up' },
      { type: 'exhale', duration: 10, label: 'Long Exhale' },
    ],
  },
];

interface BreathingCircleProps {
  exercise: Exercise;
  onComplete?: (durationSeconds: number) => void;
}

export function BreathingCircle({ exercise, onComplete }: BreathingCircleProps) {
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [accumulatedTime, setAccumulatedTime] = useState(0);
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);
  const [targetCycles, setTargetCycles] = useState(() => {
    if (exercise.difficulty === 'beginner') return 5;
    if (exercise.difficulty === 'intermediate') return 10;
    return 15;
  });
  const [currentCycle, setCurrentCycle] = useState(0);
  
  const startTimeRef = useRef<number | null>(null);
  const sessionStartRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const currentStep = exercise.steps[currentStepIndex];

  // Sound Logic
  const playTone = (type: 'inhale' | 'hold' | 'exhale' | 'sustain') => {
    if (!isSoundEnabled) return;

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const frequencies = {
      inhale: 432, // Healing frequency
      hold: 349.23, // F4
      exhale: 216, // Octave below 432
      sustain: 164.81, // E3
    };

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequencies[type], ctx.currentTime);
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

    osc.start();
    osc.stop(ctx.currentTime + 0.8);
  };

  // Update sound when step changes
  useEffect(() => {
    if (isActive) {
      playTone(currentStep.type);
    }
  }, [currentStepIndex, isActive]);

  // Update target cycles when exercise or difficulty changes (if not active)
  useEffect(() => {
    if (!isActive && !isCompleted) {
      if (exercise.difficulty === 'beginner') setTargetCycles(5);
      else if (exercise.difficulty === 'intermediate') setTargetCycles(10);
      else setTargetCycles(15);
      setCurrentCycle(0);
    }
  }, [exercise.id, exercise.difficulty]);

  useEffect(() => {
    let animationFrame: number;
    
    const update = (time: number) => {
      if (!startTimeRef.current) startTimeRef.current = time;
      const elapsed = (time - startTimeRef.current) / 1000;
      const stepProgress = Math.min(elapsed / currentStep.duration, 1);
      
      setProgress(stepProgress);

      if (stepProgress >= 1) {
        startTimeRef.current = null;
        const nextStepIndex = (currentStepIndex + 1) % exercise.steps.length;
        
        // Check if a full cycle (loop) was completed
        if (nextStepIndex === 0) {
          const nextCycle = currentCycle + 1;
          setCurrentCycle(nextCycle);
          
          if (nextCycle >= targetCycles) {
            handleSessionComplete();
            return;
          }
        }
        
        setCurrentStepIndex(nextStepIndex);
      }

      animationFrame = requestAnimationFrame(update);
    };

    if (isActive) {
      animationFrame = requestAnimationFrame(update);
    }

    return () => cancelAnimationFrame(animationFrame);
  }, [isActive, currentStepIndex, currentStep.duration, exercise.steps.length, currentCycle, targetCycles]);

  const handleSessionComplete = () => {
    const now = Date.now();
    if (sessionStartRef.current) {
      const sessionTime = (now - sessionStartRef.current) / 1000;
      const total = accumulatedTime + sessionTime;
      if (total > 5) onComplete?.(total);
    }
    setIsActive(false);
    setIsCompleted(true);
    setProgress(1);
    setCurrentStepIndex(0);
    sessionStartRef.current = null;
  };

  const togglePractice = () => {
    const now = Date.now();
    if (isCompleted) {
      setIsCompleted(false);
      setCurrentCycle(0);
      setCurrentStepIndex(0);
      setProgress(0);
      setAccumulatedTime(0);
    }

    if (isActive) {
      // Pausing
      if (sessionStartRef.current) {
        const sessionTime = (now - sessionStartRef.current) / 1000;
        const total = accumulatedTime + sessionTime;
        setAccumulatedTime(total);
        if (total > 5) { // Only record if session was significant
           onComplete?.(total);
           setAccumulatedTime(0); // Reset after recording
        }
      }
      setIsActive(false);
      startTimeRef.current = null;
      setProgress(0);
      sessionStartRef.current = null;
    } else {
      // Starting
      setIsActive(true);
      setIsCompleted(false);
      sessionStartRef.current = now;
      startTimeRef.current = null;
    }
  };

  const reset = () => {
    if (isActive && sessionStartRef.current) {
      const now = Date.now();
      const sessionTime = (now - sessionStartRef.current) / 1000;
      const total = accumulatedTime + sessionTime;
      if (total > 5) onComplete?.(total);
    }
    setIsActive(false);
    setIsCompleted(false);
    setCurrentStepIndex(0);
    setCurrentCycle(0);
    setProgress(0);
    setAccumulatedTime(0);
    startTimeRef.current = null;
    sessionStartRef.current = null;
  };

  // Animation values based on step type
  const getScale = () => {
    if (currentStep.type === 'inhale') return 0.8 + progress * 0.4; // 0.8 -> 1.2
    if (currentStep.type === 'hold') return 1.2;
    if (currentStep.type === 'exhale') return 1.2 - progress * 0.4; // 1.2 -> 0.8
    if (currentStep.type === 'sustain') return 0.8;
    return 1;
  };

  const currentScale = isActive ? getScale() : 1;

  return (
    <div className="flex flex-col items-center justify-center gap-12 py-8">
      {/* Session Quick Settings */}
      {!isActive && !isCompleted && (
        <div className="flex items-center gap-8 animate-in fade-in slide-in-from-top-2 duration-700">
          <div className="h-10 flex items-center gap-4 bg-white/5 px-4 rounded-2xl border border-white/5">
            <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-white/30">Target Loops</span>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setTargetCycles(Math.max(1, targetCycles - 1))}
                className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors text-white/40"
              >
                -
              </button>
              <span className="text-sm font-medium tabular-nums min-w-[1rem] text-center text-white/80">{targetCycles}</span>
              <button 
                onClick={() => setTargetCycles(targetCycles + 1)}
                className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors text-white/40"
              >
                +
              </button>
            </div>
          </div>

          <button
            onClick={() => setIsSoundEnabled(!isSoundEnabled)}
            className={cn(
              "h-10 flex items-center gap-3 px-4 rounded-2xl transition-all border",
              isSoundEnabled 
                ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" 
                : "bg-white/5 border-white/5 text-white/30 hover:text-white/50"
            )}
          >
            {isSoundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            <span className="text-[9px] font-bold tracking-[0.2em] uppercase">Audio Cues</span>
          </button>
        </div>
      )}

      {/* Cycle Indicator */}
      {(isActive || isCompleted) && (
        <div className="flex flex-col gap-1 items-center animate-in fade-in duration-700">
          <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-indigo-400">
            {isCompleted ? 'Sequence Complete' : `Phase ${currentCycle + 1} of ${targetCycles}`}
          </span>
          <div className="w-48 h-[2px] bg-white/5 rounded-full mt-2 overflow-hidden">
            <motion.div 
              className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
              initial={{ width: 0 }}
              animate={{ width: `${(currentCycle / targetCycles) * 100}%` }}
              transition={{ type: 'spring', damping: 20 }}
            />
          </div>
        </div>
      )}

      <div className="relative flex items-center justify-center w-96 h-96">
        {/* Outer Glow Ring (Sleek Theme) */}
        <div className="absolute inset-0 rounded-full border border-indigo-400/10 shadow-[0_0_60px_rgba(99,102,241,0.05)]" />
        
        {/* Middle Pulse Ring (Sleek Theme) */}
        <motion.div 
          animate={{ 
            scale: isActive ? currentScale * 1.05 : 1,
            opacity: currentStep.type === 'hold' ? [0.2, 0.4, 0.2] : 0.2,
          }}
          transition={currentStep.type === 'hold' ? {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          } : {}}
          className="absolute inset-8 rounded-full border border-indigo-500/20" 
        />

        {/* Hold Pulse Ripple */}
        <AnimatePresence>
          {isActive && currentStep.type === 'hold' && (
            <motion.div
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1.5, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "easeOut" 
              }}
              className="absolute inset-0 rounded-full border border-indigo-400/10 pointer-events-none"
            />
          )}
        </AnimatePresence>

        {/* Retention Orbit (Unique indicator for hold/sustain) */}
        <AnimatePresence>
          {isActive && (currentStep.type === 'hold' || currentStep.type === 'sustain') && (
            <motion.div
              initial={{ opacity: 0, rotate: 0 }}
              animate={{ opacity: 1, rotate: 360 }}
              exit={{ opacity: 0 }}
              transition={{ 
                opacity: { duration: 0.5 },
                rotate: { duration: 4, repeat: Infinity, ease: "linear" }
              }}
              className="absolute inset-[-20px] rounded-full border border-dashed border-indigo-400/20 pointer-events-none"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* The Main Circle */}
        <motion.div
          animate={{ 
            scale: isCompleted ? 1.1 : currentScale,
            boxShadow: (currentStep.type === 'hold' || currentStep.type === 'sustain')
              ? '0 0 60px rgba(99,102,241,0.25)' 
              : '0 0 0px rgba(99,102,241,0)',
            borderColor: (currentStep.type === 'hold' || currentStep.type === 'sustain')
              ? 'rgba(129, 140, 248, 0.4)'
              : 'rgba(255, 255, 255, 0.1)'
          }}
          transition={{ 
            type: 'spring', 
            damping: 25, 
            stiffness: 50, 
            mass: 1,
            boxShadow: { duration: 0.8 },
            borderColor: { duration: 0.8 }
          }}
          className={cn(
            "relative w-72 h-72 rounded-full backdrop-blur-3xl flex items-center justify-center transition-all duration-700",
            isActive || isCompleted
              ? "bg-gradient-to-br from-indigo-500/10 to-emerald-500/10" 
              : "bg-white/5 border-white/5"
          )}
        >
          {/* Inner Heartbeat Pulse during retention */}
          <AnimatePresence>
            {isActive && (currentStep.type === 'hold' || currentStep.type === 'sustain') && (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: [0.8, 1, 0.8], opacity: 0.15 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-12 rounded-full bg-indigo-500 pointer-events-none blur-xl"
              />
            )}
          </AnimatePresence>
          <div className="flex flex-col items-center">
            <AnimatePresence mode="wait">
              <motion.span 
                key={isCompleted ? 'finished' : (isActive ? currentStep.label : 'begin')}
                initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                transition={{ duration: 0.3 }}
                className={cn(
                  "text-xs tracking-[0.4em] uppercase mb-2 font-medium",
                  isCompleted ? "text-emerald-400" : (isActive ? "text-indigo-300" : "text-white/40")
                )}
              >
                {isCompleted ? 'Finished' : (isActive ? currentStep.label : 'Begin')}
              </motion.span>
            </AnimatePresence>
            <span className="text-6xl font-light tabular-nums tracking-tighter">
              {isCompleted ? (
                <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                  <Wind className="text-emerald-500" size={48} />
                </motion.div>
              ) : (
                isActive ? (
                  <AnimatePresence mode="popLayout">
                    <motion.span
                      key={`${currentStepIndex}-${Math.ceil(currentStep.duration * (1 - progress))}`}
                      initial={{ opacity: 0.5, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                      className="inline-block"
                    >
                      {Math.ceil(currentStep.duration * (1 - progress))}
                    </motion.span>
                  </AnimatePresence>
                ) : '00'
              )}
            </span>
          </div>

          {/* Progress Ring (Indigo) */}
          <svg className="absolute inset-0 -rotate-90 pointer-events-none scale-[1.02]" viewBox="0 0 100 100">
            <motion.circle
              cx="50"
              cy="50"
              r="48"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-white/5"
              style={{ pathLength: 1 }}
            />
             <motion.circle
              cx="50"
              cy="50"
              r="48"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              className={cn(
                "transition-colors duration-500",
                isCompleted ? "text-emerald-500" : "text-indigo-500"
              )}
              style={{
                pathLength: isCompleted ? 1 : (isActive ? progress : 0),
              }}
            />
          </svg>
        </motion.div>
      </div>

      <div className="flex items-center gap-6 z-20">
        <button
          onClick={togglePractice}
          className={cn(
            "px-10 py-3 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase transition-all min-w-[160px]",
            isActive 
              ? "bg-white/10 border border-white/20 text-white hover:bg-white/20" 
              : "bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:bg-indigo-400"
          )}
        >
          {isCompleted ? 'Restart Loop' : (isActive ? 'Pause Flow' : 'Enter Loop')}
        </button>
        
        <button
          onClick={reset}
          className="px-6 py-3 rounded-full border border-white/10 text-[10px] font-bold tracking-[0.2em] uppercase text-white/40 hover:text-white hover:bg-white/5 transition-all"
        >
          Reset
        </button>
      </div>

    </div>
  );
}
