import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './lib/firebase';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { Shell } from './components/layout/Shell';
import { BreathingCircle, EXERCISES, Exercise, Difficulty } from './components/breathing/BreathingCircle';
import { BreathHoldTimer } from './components/breathhold/BreathHoldTimer';
import { ProgressStats } from './components/progress/ProgressStats';
import { SessionHistory } from './components/history/SessionHistory';
import { LogIn, Wind, Timer as TimerIcon, BarChart2, ChevronRight, History } from 'lucide-react';
import { cn } from './lib/utils';

function AppContent() {
  const { user, loading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'practice' | 'hold' | 'progress' | 'profile'>('practice');
  const [selectedExercise, setSelectedExercise] = useState<Exercise>(EXERCISES[0]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('beginner');
  const [sessions, setSessions] = useState<any[]>([]);
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);

  useEffect(() => {
    // Update selected exercise if it's no longer in the filtered list when difficulty changes
    const filtered = EXERCISES.filter(ex => ex.difficulty === selectedDifficulty);
    if (!filtered.find(ex => ex.id === selectedExercise.id)) {
      setSelectedExercise(filtered[0]);
    }
  }, [selectedDifficulty]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'sessions'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSessions(data);
    });

    return () => unsubscribe();
  }, [user]);

  const recordSession = async (data: any) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'sessions'), {
        userId: user.uid,
        timestamp: serverTimestamp(),
        ...data
      });
    } catch (e) {
      console.error("Error recording session:", e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0502] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-t-2 border-[#ff4e00] animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <Shell>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-24 h-24 rounded-full bg-indigo-500 flex items-center justify-center mb-10 shadow-[0_0_40px_rgba(99,102,241,0.3)]">
            <Wind className="text-white" size={48} />
          </div>
          <h2 className="text-6xl font-light tracking-tighter mb-6 text-white/90">InnerFlow</h2>
          <p className="max-w-md text-sm text-white/40 tracking-[0.2em] uppercase mb-12">
            Meditation in Motion • Neural Synchronization
          </p>
          <AuthForm />
        </div>
      </Shell>
    );
  }

  const difficulties: Difficulty[] = ['beginner', 'intermediate', 'advanced'];

  return (
    <Shell
      headerContent={
        <div className="inline-flex p-1 bg-white/5 rounded-2xl border border-white/5">
          <TabButton 
            active={activeTab === 'practice'} 
            onClick={() => setActiveTab('practice')}
          >
            Practice
          </TabButton>
          <TabButton 
            active={activeTab === 'hold'} 
            onClick={() => setActiveTab('hold')}
          >
            Retention
          </TabButton>
          <TabButton 
            active={activeTab === 'progress'} 
            onClick={() => setActiveTab('progress')}
          >
            Analytics
          </TabButton>
          <TabButton 
            active={activeTab === 'profile'} 
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </TabButton>
        </div>
      }
    >
      <div className="flex flex-col gap-12 max-w-6xl mx-auto">
        <div className="min-h-[500px]">
          {activeTab === 'practice' && (
            <div className="flex flex-col gap-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Main Exercise Circle */}
              <div className="flex flex-col items-center justify-center">
                <BreathingCircle 
                  exercise={selectedExercise} 
                  onComplete={(duration) => recordSession({ 
                    type: 'exercise', 
                    exerciseName: selectedExercise.name, 
                    durationSeconds: duration 
                  })}
                />
                
                {/* Exercise Selection Trigger */}
                <button 
                  onClick={() => setIsExerciseModalOpen(true)}
                  className="mt-8 group flex flex-col items-center gap-2 hover:opacity-80 transition-all cursor-pointer"
                >
                  <h2 className="text-2xl font-light tracking-tight text-white/90 group-hover:text-indigo-400 transition-colors">
                    {selectedExercise.name}
                  </h2>
                  <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.3em] uppercase text-white/40">
                    <span>Deep Flow State</span>
                    <span className="w-1 h-1 rounded-full bg-white/10" />
                    <span>Guided</span>
                  </div>
                </button>
              </div>

              {/* Subroutine Selection Modal */}
              <AnimatePresence>
                {isExerciseModalOpen && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setIsExerciseModalOpen(false)}
                      className="absolute inset-0 bg-black/60 backdrop-blur-md"
                    />
                    
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 20 }}
                      className="relative w-full max-w-5xl bg-[#0A0A10] border border-white/10 rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                    >
                      <div className="p-8 sm:p-12 overflow-y-auto custom-scrollbar">
                        <div className="flex justify-between items-center mb-12">
                          <h3 className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/40">Select Routine</h3>
                          <button 
                            onClick={() => setIsExerciseModalOpen(false)}
                            className="p-2 hover:bg-white/5 rounded-full transition-colors"
                          >
                            <ChevronRight className="rotate-90 text-white/40" size={20} />
                          </button>
                        </div>

                        <div className="space-y-12">
                          {/* Intensity Selector */}
                          <div className="flex flex-col items-center gap-6">
                            <div className="flex p-1 bg-white/5 rounded-2xl border border-white/5">
                              {difficulties.map(diff => (
                                <button
                                  key={diff}
                                  onClick={() => setSelectedDifficulty(diff)}
                                  className={cn(
                                    "px-6 py-2 rounded-xl text-[10px] font-bold tracking-[0.1em] uppercase transition-all",
                                    selectedDifficulty === diff
                                      ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-sm"
                                      : "text-white/20 hover:text-white/40 hover:bg-white/5"
                                  )}
                                >
                                  {diff}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Exercise Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {EXERCISES.filter(ex => ex.difficulty === selectedDifficulty).map((ex) => (
                              <button
                                key={ex.id}
                                onClick={() => {
                                  setSelectedExercise(ex);
                                  setIsExerciseModalOpen(false);
                                }}
                                className={cn(
                                  "text-left p-8 rounded-[32px] border transition-all flex flex-col gap-6 group relative overflow-hidden backdrop-blur-sm",
                                  selectedExercise.id === ex.id 
                                    ? "bg-indigo-500/10 border-indigo-500/30 ring-1 ring-indigo-500/30" 
                                    : "bg-white/5 border-white/5 hover:bg-white/[0.08]"
                                )}
                              >
                                <div className="flex justify-between items-start w-full">
                                  <div className="space-y-1">
                                    <h4 className="text-sm font-medium text-white/90">{ex.name}</h4>
                                    <p className="text-[10px] text-white/40 tracking-[0.1em] uppercase leading-relaxed">
                                      {ex.steps.length} Phases • {ex.steps.reduce((a, b) => a + b.duration, 0)}s Loop
                                    </p>
                                  </div>
                                </div>

                                <div className="space-y-4">
                                  <div className="flex flex-wrap gap-2">
                                    {ex.benefits.map((benefit, i) => (
                                      <span key={i} className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-white/40">
                                        {benefit}
                                      </span>
                                    ))}
                                  </div>
                                  <p className="text-[11px] text-white/60 leading-relaxed italic border-l border-indigo-500/30 pl-3">
                                    "{ex.useCase}"
                                  </p>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          )}

          {activeTab === 'hold' && (
            <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              <BreathHoldTimer 
                onRecord={(seconds) => recordSession({ type: 'hold', breathHoldSeconds: seconds })} 
              />
            </div>
          )}

          {activeTab === 'progress' && (
            <div className="max-w-5xl mx-auto">
              <ProgressStats sessions={sessions} />
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="max-w-4xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* User Identity Section */}
              <div className="bg-white/5 border border-white/5 rounded-[40px] p-8 sm:p-12 relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                
                <div className="relative flex flex-col md:flex-row items-center md:items-start justify-between gap-12">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="relative">
                      <div className="w-32 h-32 rounded-[40px] overflow-hidden border-2 border-indigo-500/30">
                        {user.photoURL ? (
                          <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-full h-full bg-indigo-500 flex items-center justify-center">
                            <Wind className="text-white" size={40} />
                          </div>
                        )}
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-2xl bg-emerald-500 border-4 border-[#0A0A10] flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      </div>
                    </div>

                    <div className="text-center md:text-left space-y-2">
                       <h2 className="text-3xl font-light text-white/90">{user.displayName || 'Soul Operator'}</h2>
                       <p className="text-xs text-white/40 tracking-[0.1em] uppercase font-mono">{user.email}</p>
                       <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
                         <div className="bg-white/5 border border-white/5 px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest text-white/40">
                           Rank: Flow Initiate
                         </div>
                         <div className="bg-white/5 border border-white/5 px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest text-white/40">
                           {sessions.length} Integration Blocks
                         </div>
                       </div>
                    </div>
                  </div>

                  <button
                    onClick={logout}
                    className="group bg-white/5 border border-white/10 hover:border-red-500/30 hover:bg-red-500/5 px-8 py-3 rounded-2xl transition-all"
                  >
                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/40 group-hover:text-red-400">Terminate Session</span>
                  </button>
                </div>
              </div>

              {/* Integration History */}
              <div className="space-y-8">
                <div className="flex items-center gap-4 px-4">
                  <h3 className="text-sm font-medium text-white/90">Session Repository</h3>
                  <div className="h-px flex-1 bg-white/5" />
                </div>
                <SessionHistory sessions={sessions} />
              </div>
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}

function AuthForm() {
  const { signIn, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showEmailOptions, setShowEmailOptions] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await signIn(email, password);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-white/5 border border-white/10 rounded-[32px] p-8">
      <h3 className="text-xl font-medium text-white/90 mb-6 text-center">Welcome</h3>
      
      <div className="flex flex-col gap-4">
        <button
          onClick={handleGoogleSignIn}
          className="flex items-center justify-center gap-3 w-full px-8 py-3.5 rounded-xl bg-white text-gray-900 text-sm font-medium hover:bg-gray-100 transition-all active:scale-95 shadow-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
            <path d="M1 1h22v22H1z" fill="none" />
          </svg>
          Continue with Google
        </button>

        <div className="relative flex items-center py-4">
          <div className="flex-grow border-t border-white/10"></div>
          <span className="flex-shrink-0 mx-4 text-white/40 text-[10px] uppercase tracking-widest">or</span>
          <div className="flex-grow border-t border-white/10"></div>
        </div>

        {!showEmailOptions ? (
          <button
            onClick={() => setShowEmailOptions(true)}
            className="flex items-center justify-center gap-2 w-full px-8 py-3 rounded-xl bg-white/5 text-white/80 text-xs font-bold tracking-[0.1em] uppercase hover:bg-white/10 transition-all active:scale-95 border border-white/5"
          >
            Continue with Email
          </button>
        ) : (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <h4 className="text-sm font-medium text-white/80 mb-4 text-center">Sign In</h4>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="Email address" 
                required 
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/90 outline-none focus:border-indigo-500/50 transition-colors"
              />
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="Password" 
                required 
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/90 outline-none focus:border-indigo-500/50 transition-colors"
              />
              {error && <p className="text-red-400 text-xs text-left">{error}</p>}
              <button
                type="submit"
                className="flex items-center justify-center gap-2 mt-2 px-8 py-3 rounded-xl bg-indigo-500 text-white text-xs font-bold tracking-[0.1em] uppercase hover:bg-indigo-600 transition-all active:scale-95"
              >
                <LogIn size={14} />
                Initialize Sequence
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({ children, active, onClick }: { children: React.ReactNode, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-8 py-2 rounded-xl text-[10px] font-bold tracking-[0.2em] uppercase transition-all",
        active 
          ? "bg-white/10 text-white shadow-xl shadow-white/5 border border-white/10" 
          : "text-white/30 hover:text-white hover:bg-white/5"
      )}
    >
      {children}
    </button>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
