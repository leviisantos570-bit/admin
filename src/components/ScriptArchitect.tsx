import React, { useState } from "react";
import { PenTool, Loader2, ListOrdered, Video, MessageSquare, ArrowRight, Share2, Download, Zap, ChevronDown, ChevronUp, Clock, Bookmark } from "lucide-react";
import { generateScriptOutline } from "../services/geminiService";
import { ScriptArchive } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { FirebaseUser, db, handleFirestoreError, OperationType } from "../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

interface ScriptArchitectProps {
  user: FirebaseUser;
}

export default function ScriptArchitect({ user }: ScriptArchitectProps) {
  const [topic, setTopic] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [script, setScript] = useState<ScriptArchive | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || !title.trim()) return;
    setLoading(true);
    try {
      const data = await generateScriptOutline(topic, title);
      setScript(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const saveToLab = async () => {
    if (!script || isSaving) return;
    setIsSaving(true);
    try {
      await addDoc(collection(db, "ideas"), {
        userId: user.uid,
        title: title,
        topic: topic,
        aiInsights: `Script Outline Generated: ${script.hook.substring(0, 50)}...`,
        status: "Scripting",
        createdAt: serverTimestamp()
        // Note: For complex scripts, you could expand the schema, 
        // but for now we link it to the Idea Lab.
      });
      alert("Script outline linked to your Idea Lab!");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "ideas");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Header Config */}
      <div className="bg-slate-900 p-10 md:p-20 rounded-[60px] border border-slate-800 shadow-2xl shadow-indigo-600/5 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-indigo-500/5 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
           <h3 className="text-5xl font-black tracking-tighter mb-4 text-white">Structure Your <span className="text-indigo-400">Retention</span>.</h3>
           <p className="text-slate-400 mb-12 leading-relaxed font-serif italic text-xl">"The first 30 seconds decide your RPM. Do not leave it to chance."</p>
           
           <form onSubmit={handleGenerate} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-5">Core Message</label>
                <input 
                  type="text" 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Topic: The decline of traditional social media..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-[32px] py-6 px-10 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-slate-950 transition-all font-medium text-slate-100"
                />
              </div>
              <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-5">Optimized Title</label>
                 <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Paste your Peak AI title here..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-[32px] py-6 px-10 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-slate-950 transition-all font-medium text-slate-100"
                />
              </div>
              <div className="flex gap-4">
                <button 
                  disabled={loading || !topic.trim() || !title.trim()}
                  className="flex-1 bg-indigo-600 text-white py-6 rounded-[32px] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-4 hover:bg-indigo-500 active:scale-95 transition-all disabled:opacity-50 shadow-3xl shadow-indigo-600/20"
                >
                  {loading ? <Loader2 className="animate-spin" size={24} /> : <Zap size={24} fill="currentColor" />}
                  {loading ? 'ARCHITECTING FLOW...' : 'ARCHITECT SCRIPT'}
                </button>
                {script && (
                  <button 
                    onClick={saveToLab}
                    disabled={isSaving}
                    className="w-20 bg-slate-800 text-white rounded-[32px] flex items-center justify-center hover:bg-slate-700 transition-all border border-slate-700 disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="animate-spin" size={24} /> : <Bookmark size={24} />}
                  </button>
                )}
              </div>
           </form>
        </div>
      </div>

      <AnimatePresence>
        {script && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10"
          >
            {/* Essential Hook Card */}
            <div className="bg-indigo-600/10 border-2 border-indigo-500/30 p-10 rounded-[50px] relative group shadow-lg shadow-indigo-600/5">
              <div className="absolute -top-4 left-10 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-5 py-2 rounded-full shadow-xl">The 15s Hook (Vital)</div>
              <p className="text-2xl font-black leading-tight text-white italic pr-16 tracking-tight">"{script.hook}"</p>
              <div className="mt-6 flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-indigo-400">
                 <span className="flex items-center gap-2 px-3 py-1 bg-indigo-600/20 rounded-lg border border-indigo-500/20"><Clock size={14} /> 00:00 - 00:15</span>
                 <span className="px-3 py-1 bg-indigo-600/20 rounded-lg border border-indigo-500/20">Retention Anchor</span>
              </div>
              <button className="absolute right-10 top-1/2 -translate-y-1/2 p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:text-indigo-400 translate-x-4 group-hover:translate-x-0">
                <Share2 size={24} />
              </button>
            </div>

            {/* Intro Section */}
            <div className="bg-slate-900 border border-slate-800 p-12 rounded-[60px] shadow-sm relative overflow-hidden">
               <div className="absolute right-10 top-10 opacity-5 text-indigo-400">
                  <Video size={120} />
               </div>
               <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-8 flex items-center gap-3">
                 <Video size={16} className="text-indigo-400" /> The Bridge (Intro)
               </h4>
               <p className="text-xl leading-relaxed text-slate-300 italic font-serif max-w-3xl">"{script.intro}"</p>
            </div>

            {/* Main Points Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {script.points.map((point, i) => (
                 <div key={i} className={`bg-slate-900 border border-slate-800 p-10 rounded-[50px] hover:border-indigo-500/30 transition-all cursor-pointer group relative overflow-hidden ${expandedIndex === i ? 'md:col-span-2' : ''}`} onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 -translate-y-1/2 translate-x-1/2 rounded-full blur-3xl" />
                    <div className="flex justify-between items-center mb-6 relative z-10">
                      <div className="bg-slate-950 w-12 h-12 rounded-2xl flex items-center justify-center font-black text-md text-indigo-400 border border-slate-800">0{i+1}</div>
                      <div className="text-slate-600 group-hover:text-indigo-400 transition-colors">
                        {expandedIndex === i ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                      </div>
                    </div>
                    <h5 className="text-2xl font-bold mb-4 text-white relative z-10">{point.header}</h5>
                    <p className={`text-slate-400 leading-relaxed text-lg font-medium relative z-10 transition-all ${expandedIndex === i ? '' : 'line-clamp-2 opacity-60'}`}>{point.content}</p>
                 </div>
               ))}
            </div>

            {/* Call to Action */}
            <div className="bg-white text-indigo-950 p-12 rounded-[60px] relative overflow-hidden group shadow-2xl">
               <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-indigo-600/10 skew-x-12 translate-x-1/2 pointer-events-none transition-transform group-hover:translate-x-1/3" />
               <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                  <div className="max-w-xl space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">Final Beat</div>
                    <p className="text-2xl font-black leading-tight italic">"{script.cta}"</p>
                  </div>
                  <button className="bg-indigo-600 text-white px-10 py-5 rounded-[28px] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-4 hover:bg-indigo-500 hover:scale-105 transition-all shadow-xl shadow-indigo-600/20">
                    <Download size={24} /> Export Protocol
                  </button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!script && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 opacity-20 hover:opacity-30 transition-opacity">
           {[ListOrdered, MessageSquare, PenTool].map((Icon, i) => (
             <div key={i} className="bg-slate-900 p-12 rounded-[50px] border border-slate-800 flex flex-col items-center justify-center text-center space-y-6">
                <Icon size={56} className="text-slate-500" />
                <div className="h-2.5 w-32 bg-slate-800 rounded-full" />
                <div className="h-2.5 w-20 bg-slate-800 rounded-full opacity-50" />
             </div>
           ))}
        </div>
      )}
    </div>
  );
}
