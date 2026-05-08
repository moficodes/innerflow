import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { format } from 'date-fns';
import { Trophy, TrendingUp, Calendar, Timer } from 'lucide-react';

interface SessionData {
  id: string;
  type: 'exercise' | 'hold';
  timestamp: any;
  breathHoldSeconds?: number;
  durationSeconds?: number;
  exerciseName?: string;
}

interface ProgressStatsProps {
  sessions: SessionData[];
}

export function ProgressStats({ sessions }: ProgressStatsProps) {
  const holdSessions = sessions.filter(s => s.type === 'hold');
  const exerciseSessions = sessions.filter(s => s.type === 'exercise');

  const holdData = holdSessions.map(s => ({
    date: format(s.timestamp?.toDate() || new Date(), 'MMM d'),
    seconds: s.breathHoldSeconds || 0,
    timestamp: s.timestamp?.toMillis() || 0,
  })).sort((a, b) => a.timestamp - b.timestamp);

  const exerciseData = exerciseSessions.map(s => ({
    date: format(s.timestamp?.toDate() || new Date(), 'MMM d'),
    duration: s.durationSeconds || 0,
    exerciseName: s.exerciseName,
    timestamp: s.timestamp?.toMillis() || 0,
  })).sort((a, b) => a.timestamp - b.timestamp);

  // Stats calculation
  const maxHold = holdSessions.length > 0 ? Math.max(...holdSessions.map(s => s.breathHoldSeconds || 0)) : 0;
  const totalBreathingSeconds = exerciseSessions.reduce((acc, s) => acc + (s.durationSeconds || 0), 0);
  const totalSessions = sessions.length;
  
  const totalMinutes = Math.floor(totalBreathingSeconds / 60);
  const totalHours = (totalBreathingSeconds / 3600).toFixed(1);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
          label="Max Hold" 
          value={`${maxHold}s`} 
          icon={<Trophy className="text-amber-400" size={18} />} 
        />
        <StatCard 
          label="Practice Time" 
          value={totalMinutes > 60 ? `${totalHours}h` : `${totalMinutes}m`} 
          icon={<Timer className="text-indigo-400" size={18} />} 
        />
        <StatCard 
          label="Total Flow" 
          value={totalSessions.toString()} 
          icon={<Calendar className="text-emerald-400" size={18} />} 
        />
        <StatCard 
          label="Exercise Avg" 
          value={exerciseSessions.length > 0 ? `${Math.round(totalBreathingSeconds / exerciseSessions.length / 60)}m` : '0m'} 
          icon={<TrendingUp className="text-indigo-400" size={18} />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Retention Progression */}
        <div className="bg-white/5 rounded-[32px] border border-white/5 p-8 h-[400px] backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[60px] group-hover:bg-indigo-500/20 transition-all duration-700" />
          <h3 className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/40 mb-8">Retention progression</h3>
          {holdData.length > 0 ? (
            <ResponsiveContainer width="100%" height="80%">
              <LineChart data={holdData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="date" stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#080810', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px', fontSize: '12px' }}
                  itemStyle={{ color: '#818cf8' }}
                />
                <Line type="monotone" dataKey="seconds" name="Hold (s)" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-[10px] uppercase tracking-widest text-white/20">No data points synced</div>
          )}
        </div>

        {/* Practice Volume */}
        <div className="bg-white/5 rounded-[32px] border border-white/5 p-8 h-[400px] backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[60px] group-hover:bg-emerald-500/20 transition-all duration-700" />
          <h3 className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/40 mb-8">Practice Volume</h3>
          {exerciseData.length > 0 ? (
            <ResponsiveContainer width="100%" height="80%">
              <LineChart data={exerciseData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="date" stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} unit="s" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#080810', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px', fontSize: '12px' }}
                  itemStyle={{ color: '#10b981' }}
                />
                <Line type="monotone" dataKey="duration" name="Breathing (s)" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-[10px] uppercase tracking-widest text-white/20">Awaiting practice sessions</div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="bg-white/5 rounded-[32px] border border-white/5 p-6 flex flex-col gap-4 hover:bg-white/[0.07] transition-all group">
      <div className="flex justify-between items-start">
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/40">{label}</span>
        <div className="p-2 rounded-xl bg-white/5 group-hover:scale-110 transition-transform">
          {icon}
        </div>
      </div>
      <span className="text-3xl font-light tabular-nums tracking-tighter text-white/90">{value}</span>
    </div>
  );
}

