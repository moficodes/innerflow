import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { ReactNode } from 'react';

interface ShellProps {
  children: ReactNode;
  headerContent?: ReactNode;
}

export function Shell({ children, headerContent }: ShellProps) {
  return (
    <div className="relative min-h-screen w-full bg-[#05050A] text-slate-200 font-sans selection:bg-indigo-500/30 overflow-hidden flex flex-col">
      {/* Recipe 7: Atmospheric Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: `
              radial-gradient(circle at 25% 25%, #4f46e5 0%, transparent 40%),
              radial-gradient(circle at 75% 75%, #10b981 0%, transparent 40%)
            `,
            filter: 'blur(120px)',
          }}
        />
      </div>

      <div className="flex-1 flex flex-col relative z-10 overflow-auto">
        <header className="flex items-center justify-between px-10 py-4 border-b border-white/5 backdrop-blur-sm sticky top-0 z-50">
          <h1 className="text-sm font-bold tracking-[0.3em] uppercase text-white/90">InnerFlow</h1>
          
          {headerContent && (
            <div className="flex-1 flex justify-center">
              {headerContent}
            </div>
          )}

          <div className="flex items-center gap-6">
             <div className="text-[10px] uppercase tracking-widest text-white/40">Status: In Flow</div>
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </header>

        <main className="flex-1 p-10 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Decorative gradient mask for bottom */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#05050A] to-transparent pointer-events-none" />
    </div>
  );
}
