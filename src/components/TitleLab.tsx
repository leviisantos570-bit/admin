import React, { useState } from "react";
import { Copy, Loader2, Sparkles, Wand2, CheckCircle2, ChevronRight, BarChart3, AlertTriangle, Lightbulb } from "lucide-react";
import { generateTitles } from "../services/geminiService";
import { TitleIdea } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { FirebaseUser, db, handleFirestoreError, OperationType } from "../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

interface TitleLabProps {
  user: FirebaseUser;
}

export default function TitleLab({ user }: TitleLabProps) {
  const [topic, setTopic] = useState("");
  const [goal, setGoal] = useState("Click-Through Rate");
  const [loading, setLoading] = useState(false);
  const [titles, setTitles] = useState<TitleIdea[] | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState<number | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const data = await generateTitles(topic, goal);
      setTitles(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const saveToLab = async (title: string, rationale: string, index: number) => {
    setIsSaving(index);
    try {
      await addDoc(collection(db, "ideas"), {
        userId: user.uid,
        title: title,
        topic: topic,
        aiInsights: rationale,
        status: "Researching",
        createdAt: serverTimestamp()
      });
      alert("Title saved to your Idea Lab!");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "ideas");
    } finally {
      setIsSaving(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Search Header */}
      <div className="bg-slate-900 p-10 md:p-20 rounded-[60px] border border-slate-800 shadow-3xl shadow-indigo-600/5 text-center relative overflow-hidden">
        <div className="absolute -left-20 -bottom-20 p-8 opacity-20 text-indigo-600/5 rotate-45 pointer-events-none">
            <Sparkles size={320} />
        </div>
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-indigo-600/10 px-4 py-2 rounded-full border border-indigo-500/20 mb-8">
            <Sparkles size={14} className="text-indigo-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Viral Title Engine</span>
          </div>
          
          <h3 className="text-5xl font-black tracking-tighter mb-6 text-white text-balance">Master the <span className="text-indigo-400 italic">Curiosity Gap</span>.</h3>
          <p className="text-slate-400 font-serif mb-12 leading-relaxed italic text-lg max-w-2xl mx-auto">"The title is 80% of the click. Do not leave your performance to chance."</p>
          
          <form onSubmit={handleGenerate} className="space-y-8 max-w-2xl mx-auto text-left">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-5">Video Premise</label>
              <input 
                type="text" 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Building a SaaS with Gemini API..."
                className="w-full bg-slate-950 border border-slate-800 rounded-[32px] py-6 px-10 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium text-xl text-slate-100 placeholder-slate-700 shadow-inner"
              />
            </div>
            
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-5">Primary Goal</label>
                <select 
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-[28px] py-5 px-8 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-bold text-slate-300 appearance-none shadow-inner"
                >
                  <option>Click-Through Rate</option>
                  <option>Retention Focus</option>
                  <option>SEO Visibility</option>
                  <option>Controversial / Viral</option>
                </select>
              </div>
              <button 
                disabled={loading || !topic.trim()}
                className="md:w-56 bg-white text-indigo-950 px-10 py-5 rounded-[28px] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-200 transition-all active:scale-95 disabled:opacity-50 mt-auto shadow-2xl shadow-white/10"
              >
                {loading ? <Loader2 className="animate-spin text-indigo-600" size={20} /> : <Wand2 size={20} className="text-indigo-600" />}
                {loading ? 'Synthesizing...' : 'Engineer Hook'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <AnimatePresence>
        {titles && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center px-6">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Optimized Variations</h4>
              <div className="flex items-center gap-2 text-[10px] font-black text-pink-400 bg-pink-400/10 px-3 py-1.5 rounded-full border border-pink-400/20 uppercase tracking-tighter">
                <AlertTriangle size={12} /> High CTR Variance Detected
              </div>
            </div>
            {titles.map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="bg-slate-900 p-8 rounded-[40px] border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-900/80 transition-all group relative overflow-hidden"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-10 relative z-10">
                  <div className="shrink-0 flex flex-col items-center justify-center w-24 h-24 bg-slate-950 rounded-3xl border border-slate-800 group-hover:bg-indigo-600 transition-all duration-300">
                    <span className="text-4xl font-black text-white">{item.score}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-indigo-100 transition-colors">Score</span>
                  </div>
                  <div className="flex-1 space-y-3">
                    <h5 className="text-2xl font-bold tracking-tight text-white leading-tight">{item.title}</h5>
                    <p className="text-sm text-slate-400 font-serif leading-relaxed italic pr-16">{item.rationale}</p>
                    <div className="pt-2">
                       <button 
                         onClick={() => saveToLab(item.title, item.rationale, i)}
                         disabled={isSaving === i}
                         className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-white transition-colors"
                       >
                         {isSaving === i ? <Loader2 size={12} className="animate-spin" /> : <Lightbulb size={12} />}
                         {isSaving === i ? 'Saving...' : 'Save as Idea'}
                       </button>
                    </div>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(item.title, i)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 md:static md:translate-y-0 w-14 h-14 bg-slate-800 hover:bg-indigo-600 rounded-2xl transition-all flex items-center justify-center shrink-0 hover:shadow-lg hover:shadow-indigo-600/20"
                  >
                    {copiedIndex === i ? <CheckCircle2 className="text-white" size={24} /> : <Copy size={24} className="text-slate-500 group-hover:text-white" />}
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-indigo-600 p-12 rounded-[60px] text-white flex flex-col lg:flex-row items-center gap-12 overflow-hidden relative group">
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-white/5 skew-x-12 translate-x-1/2 pointer-events-none" />
        <div className="flex-1 space-y-6 relative z-10">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-white backdrop-blur-md">
            <BarChart3 size={32} />
          </div>
          <h4 className="text-4xl font-black tracking-tighter">Why Peak AI scores titles</h4>
          <p className="text-indigo-100 text-lg leading-relaxed max-w-lg font-medium opacity-80 italic">Our engine evaluates psychological anchors: Authoritative Framimg, Negative Utility, the Zeigarnik Effect, and Scarcity. Titles scoring above 88 historically see an average CTR uplift of <span className="text-white font-black underline underline-offset-4 pointer-events-none">38%</span>.</p>
        </div>
        <div className="w-full lg:w-80 aspect-[4/5] bg-slate-950 rounded-[40px] p-8 flex flex-col justify-end relative overflow-hidden shadow-2xl border border-white/10 group-hover:rotate-1 transition-transform duration-500">
           <div className="absolute top-6 left-6 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-lg">Optimized Hook</div>
           <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Original: "Best AI Coding Tools"</p>
           <div className="my-4 h-1 bg-white/10 w-24 rounded-full" />
           <p className="text-2xl font-black leading-tight text-white italic">"The End of Programming? 5 Tools That Change Everything."</p>
           <ChevronRight className="absolute right-6 bottom-6 text-indigo-500 animate-pulse" size={56} />
        </div>
      </div>
    </div>
  );
}
