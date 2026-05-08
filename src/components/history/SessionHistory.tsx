import { format } from 'date-fns';
import { Wind, Timer, Calendar, ChevronRight } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface Session {
  id: string;
  type: 'exercise' | 'hold';
  exerciseName?: string;
  durationSeconds?: number;
  breathHoldSeconds?: number;
  timestamp: any;
}

interface SessionHistoryProps {
  sessions: Session[];
}

export function SessionHistory({ sessions }: SessionHistoryProps) {
  const sortedSessions = [...sessions].sort((a, b) => 
    b.timestamp.toMillis() - a.timestamp.toMillis()
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/40">Chronological Flow</h3>
        <span className="text-[10px] text-white/20 whitespace-neutral-400">{sessions.length} Sessions Recorded</span>
      </div>

      <div className="space-y-3">
        {sortedSessions.length > 0 ? (
          sortedSessions.map((session) => (
            <div 
              key={session.id}
              className="group bg-white/5 border border-white/5 hover:border-white/10 p-5 rounded-[24px] flex items-center justify-between transition-all hover:bg-white/[0.08]"
            >
              <div className="flex items-center gap-5">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                  session.type === 'exercise' ? "bg-indigo-500/10 text-indigo-400" : "bg-emerald-500/10 text-emerald-400"
                )}>
                  {session.type === 'exercise' ? <Wind size={20} /> : <Timer size={20} />}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-white/90">
                    {session.type === 'exercise' ? session.exerciseName : 'Breath Retention'}
                  </h4>
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-white/40 uppercase tracking-widest font-mono">
                    <div className="flex items-center gap-1">
                      <Calendar size={10} />
                      {format(session.timestamp.toDate(), 'MMM d, HH:mm')}
                    </div>
                    <div className="w-1 h-1 rounded-full bg-white/10" />
                    <div>
                      {session.type === 'exercise' 
                        ? `${Math.floor((session.durationSeconds || 0) / 60)}m ${Math.floor((session.durationSeconds || 0) % 60)}s`
                        : `${session.breathHoldSeconds}s hold`
                      }
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                <ChevronRight size={16} className="text-white/20" />
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-[32px] opacity-30">
            <Calendar size={32} className="mb-4" />
            <p className="text-[10px] uppercase tracking-widest">No activity detected in the stream</p>
          </div>
        )}
      </div>
    </div>
  );
}
