import { motion, AnimatePresence } from "motion/react";
import { BarChart3, Search, Lightbulb, PenTool, LayoutDashboard, Settings, TrendingUp, Zap, Target, LogOut, User as UserIcon, Loader2, Video } from "lucide-react";
import { useState, useEffect } from "react";
import Dashboard from "./components/Dashboard";
import KeywordExplorer from "./components/KeywordExplorer";
import TitleLab from "./components/TitleLab";
import ScriptArchitect from "./components/ScriptArchitect";
import VideoStudio from "./components/VideoStudio";
import { auth, signInWithGoogle, signOut, onAuthStateChanged, FirebaseUser, db, testConnection } from "./lib/firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'keywords' | 'titles' | 'scripts' | 'video'>('dashboard');
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    testConnection();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Sync user profile
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        }
      }
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'keywords', icon: Search, label: 'Keyword Research' },
    { id: 'titles', icon: Target, label: 'Title Lab' },
    { id: 'scripts', icon: PenTool, label: 'Script Architect' },
    { id: 'video', icon: Video, label: 'Video Studio' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <Loader2 className="text-indigo-500 animate-spin mb-4" size={48} />
        <p className="text-slate-400 font-mono text-sm tracking-widest uppercase">Initializing Peak AI...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-indigo-500/30 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-slate-950 to-slate-950">
        <div className="max-w-md w-full space-y-12 text-center relative">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-600/10 blur-3xl rounded-full" />
          
          <div className="space-y-6 relative">
            <div className="w-20 h-20 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-indigo-600/40 rotate-12">
              <Zap size={40} fill="currentColor" />
            </div>
            <div className="space-y-4">
              <h1 className="text-5xl font-black tracking-tighter">CreatorPeak <span className="text-indigo-400 italic">AI</span></h1>
              <p className="text-slate-400 text-lg font-serif italic">Your personal AI Content Strategist for YouTube dominance.</p>
            </div>
          </div>

          <div className="bg-slate-900/50 p-8 rounded-[40px] border border-slate-800 backdrop-blur-xl relative">
            <h2 className="text-xl font-bold mb-8">Access the Protocol</h2>
            <button 
              onClick={handleLogin}
              className="w-full bg-white text-indigo-950 py-5 rounded-[24px] font-black flex items-center justify-center gap-4 hover:bg-slate-200 transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-white/5"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
              Sign in with Google
            </button>
            <p className="text-[10px] text-slate-500 mt-8 uppercase font-black tracking-widest">Secured by Firebase Enterprise</p>
          </div>

          <div className="flex justify-center gap-8 opacity-30">
             <div className="flex items-center gap-2 text-xs font-bold"><TrendingUp size={14} /> Analytics</div>
             <div className="flex items-center gap-2 text-xs font-bold"><Target size={14} /> SEO</div>
             <div className="flex items-center gap-2 text-xs font-bold"><PenTool size={14} /> Scripting</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Sidebar Navigation */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-50">
        <div className="p-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
              <Zap size={22} fill="currentColor" />
            </div>
            <h1 className="font-bold text-xl tracking-tight text-white">Peak <span className="text-indigo-400">AI</span></h1>
          </div>
          <p className="text-[10px] uppercase tracking-widest text-slate-500 mt-3 font-bold">Creator Success OS</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === item.id 
                  ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={18} strokeWidth={activeTab === item.id ? 2.5 : 2} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-800 space-y-4">
          <div className="flex items-center gap-3 px-3 py-2">
             <img src={user.photoURL || ''} alt="" className="w-8 h-8 rounded-full border border-slate-700" />
             <div className="overflow-hidden">
                <p className="text-xs font-bold truncate text-white">{user.displayName}</p>
                <button 
                  onClick={() => signOut()}
                  className="text-[10px] text-slate-500 hover:text-indigo-400 transition-colors uppercase font-black flex items-center gap-1"
                >
                  <LogOut size={10} /> Logout
                </button>
             </div>
          </div>

          <div className="bg-indigo-600/5 p-4 rounded-2xl border border-indigo-500/20 relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-400">Pro Status</p>
              <p className="text-sm font-medium mt-1 text-slate-300">Unlimited AI Credits</p>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform text-indigo-400">
              <TrendingUp size={64} />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8 lg:p-12 min-h-screen">
        <header className="flex justify-between items-center mb-12 py-4 border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-40">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white">
              {navItems.find(n => n.id === activeTab)?.label}
            </h2>
            <p className="text-slate-500 mt-1 italic font-serif">Welcome back, <span className="text-indigo-400">{user.displayName?.split(' ')[0]}</span>.</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95">
              Create Content
            </button>
            <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-700 shadow-sm flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer">
              <Settings size={20} />
            </div>
          </div>
        </header>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'dashboard' && <Dashboard user={user} />}
          {activeTab === 'keywords' && <KeywordExplorer user={user} />}
          {activeTab === 'titles' && <TitleLab user={user} />}
          {activeTab === 'scripts' && <ScriptArchitect user={user} />}
          {activeTab === 'video' && <VideoStudio user={user} />}
        </motion.div>
      </main>
    </div>
  );
}

