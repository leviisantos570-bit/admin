import React, { useState } from "react";
import { Search, Loader2, BarChart2, Star, Lightbulb, TrendingUp, AlertCircle, Rocket, Bookmark } from "lucide-react";
import { generateKeywordSuggestions } from "../services/geminiService";
import { KeywordResult, BlueOceanNiche } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { FirebaseUser, db, handleFirestoreError, OperationType } from "../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

interface KeywordExplorerProps {
  user: FirebaseUser;
}

export default function KeywordExplorer({ user }: KeywordExplorerProps) {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ keywords: KeywordResult[], blueOceanNiches: BlueOceanNiche[] } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const data = await generateKeywordSuggestions(topic);
      setResults(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSearch = async () => {
    if (!results || isSaving) return;
    setIsSaving(true);
    try {
      await addDoc(collection(db, "keywordSearches"), {
        userId: user.uid,
        topic: topic,
        results: results,
        createdAt: serverTimestamp()
      });
      alert("Search results saved to your history!");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "keywordSearches");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      {/* Search Header */}
      <div className="bg-slate-900 p-8 md:p-14 rounded-[40px] border border-slate-800 shadow-2xl shadow-indigo-600/5 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 p-8 opacity-20 text-indigo-600/10 rotate-12">
            <Search size={220} />
        </div>
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Search size={16} />
            </div>
            <h3 className="text-3xl font-bold tracking-tight text-white">Keyword Intelligence</h3>
          </div>
          <p className="text-slate-400 mb-10 font-serif text-lg leading-relaxed italic">Discover untapped <span className="text-indigo-400">blue oceans</span> in your niche.</p>
          
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
              <input 
                type="text" 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Mechanical keyboards, Cooking healthy..."
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-5 pl-14 pr-6 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all outline-none font-medium text-slate-200 placeholder-slate-600"
              />
            </div>
            <button 
              disabled={loading || !topic.trim()}
              className="bg-indigo-600 text-white px-10 py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-indigo-500 shadow-xl shadow-indigo-600/10 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-xs"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <TrendingUp size={18} />}
              {loading ? 'Analyzing Gap...' : 'Locate Market Gap'}
            </button>
          </form>
        </div>
      </div>

      <AnimatePresence>
        {results && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Keyword Table */}
            <div className="lg:col-span-8 bg-slate-900 rounded-[40px] border border-slate-800 overflow-hidden flex flex-col shadow-sm">
              <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-sm">
                <h4 className="font-bold text-white flex items-center gap-3">
                  <BarChart2 size={20} className="text-indigo-400" /> High-Value Opportunities
                </h4>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={handleSaveSearch}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all border border-slate-700 disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Bookmark size={14} />}
                    {isSaving ? 'Archiving...' : 'Save to Board'}
                  </button>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Peak AI Analysis</span>
                </div>
              </div>
              <div className="flex-1 overflow-x-auto p-4">
                <table className="w-full">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-widest font-black text-slate-500">
                      <th className="px-6 py-5 text-left border-b border-slate-800">Term</th>
                      <th className="px-6 py-5 text-center border-b border-slate-800">Score</th>
                      <th className="px-6 py-5 text-center border-b border-slate-800">Competition</th>
                      <th className="px-6 py-5 text-right border-b border-slate-800">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {results.keywords.map((kw, i) => (
                      <tr key={i} className="hover:bg-slate-800/30 transition-colors group">
                        <td className="px-6 py-5">
                          <p className="font-bold text-sm text-slate-200 group-hover:text-indigo-400 transition-colors">{kw.term}</p>
                          <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-tight">Trending in: {topic}</p>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-xs font-mono text-slate-300">{kw.volume}</span>
                            <div className="w-12 h-1 bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-500" style={{ width: `${kw.volume}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                           <span className={`text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-tighter border ${
                             kw.difficulty.toLowerCase() === 'easy' ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' :
                             kw.difficulty.toLowerCase() === 'medium' ? 'bg-indigo-400/10 text-indigo-400 border-indigo-400/20' :
                             'bg-pink-400/10 text-pink-400 border-pink-400/20'
                           }`}>
                             {kw.difficulty}
                           </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                           <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-500 hover:text-white">
                              <BarChart2 size={16} />
                           </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Blue Ocean Insights */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-indigo-600/10 border border-indigo-500/30 p-8 rounded-[40px] text-white overflow-hidden relative shadow-lg shadow-indigo-600/5">
                 <div className="absolute -right-8 -top-8 rotate-12 opacity-10 text-indigo-400">
                    <Lightbulb size={160} />
                 </div>
                 <div className="relative z-10">
                   <h4 className="text-xl font-bold mb-8 flex items-center gap-3">
                     <Rocket size={22} className="text-indigo-400" /> Blue Oceans
                   </h4>
                   <div className="space-y-8">
                     {results.blueOceanNiches.map((niche, i) => (
                       <div key={i} className="group cursor-pointer">
                         <div className="flex items-center gap-3 mb-2">
                           <div className="w-1.5 h-6 bg-indigo-500 rounded-full group-hover:scale-y-125 transition-transform" />
                           <p className="font-bold text-sm text-slate-100">{niche.title}</p>
                         </div>
                         <p className="text-xs text-slate-400 leading-relaxed italic ml-4 group-hover:text-slate-300 transition-colors">{niche.reasoning}</p>
                       </div>
                     ))}
                   </div>
                 </div>
              </div>

              <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 flex items-start gap-4 shadow-sm">
                 <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                    <AlertCircle size={20} />
                 </div>
                 <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">AI Strategy</p>
                   <p className="text-xs text-slate-300 leading-relaxed font-medium">Competition detected in generic head terms. Focus on <span className="text-indigo-400">comparative storytelling</span> for better retention.</p>
                 </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
