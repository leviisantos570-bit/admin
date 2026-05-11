import React, { useState, useEffect } from "react";
import { Video, Loader2, Play, Download, Sparkles, AlertCircle, Key, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { generateVideo, hasApiKey, openApiKeyDialog } from "../services/veoService";
import { FirebaseUser } from "../lib/firebase";

interface VideoStudioProps {
  user: FirebaseUser;
}

export default function VideoStudio({ user }: VideoStudioProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isApiKeySelected, setIsApiKeySelected] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState([
    "Synthesizing visual frames...",
    "Applying cinematic lighting...",
    "Refining motion vectors...",
    "Perfecting resolution details...",
    "Finalizing video stream..."
  ]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    const checkApiKey = async () => {
      const selected = await hasApiKey();
      setIsApiKeySelected(selected);
    };
    checkApiKey();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleOpenKey = async () => {
    await openApiKeyDialog();
    setIsApiKeySelected(true);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !isApiKeySelected) return;

    setLoading(true);
    setError(null);
    setVideoUrl(null);

    try {
      const blob = await generateVideo(prompt);
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
    } catch (err: any) {
      console.error(err);
      if (err.message.includes("Requested entity was not found")) {
        setIsApiKeySelected(false);
        setError("API Session expired. Please re-select your key.");
      } else {
        setError(err.message || "An unexpected error occurred during generation.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <div className="inline-flex p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-indigo-400 mb-4">
          <Video size={32} />
        </div>
        <h2 className="text-4xl font-black tracking-tight text-white uppercase italic">Video Studio <span className="text-indigo-500">BETA</span></h2>
        <p className="text-slate-400 max-w-xl mx-auto font-serif italic text-lg">
          Transform your descriptions into high-fidelity AI cinematic sequences. Powered by Veo.
        </p>
      </div>

      {!isApiKeySelected ? (
        <div className="bg-slate-900/50 p-12 rounded-[48px] border border-slate-800 text-center space-y-8 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Key size={120} />
          </div>
          <div className="relative z-10 space-y-6">
            <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto text-amber-500">
               <AlertCircle size={40} />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-white">Authorization Required</h3>
              <p className="text-slate-400 text-sm max-w-xs mx-auto">
                Veo requires a paid Gemini API key. Please select one from your authorized projects.
              </p>
            </div>
            <button 
              onClick={handleOpenKey}
              className="px-8 py-4 bg-white text-slate-950 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all active:scale-95 flex items-center gap-3 mx-auto"
            >
              <Key size={16} />
              Open Key Selector
            </button>
            <p className="text-[10px] text-slate-500 italic max-w-xs mx-auto pt-4 leading-relaxed">
              Note: You must have billing enabled on your Google Cloud Project to access Veo generation. 
              <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-indigo-400 ml-1">Learn more about billing.</a>
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <form onSubmit={handleGenerate} className="bg-slate-900 border border-slate-800 rounded-[40px] p-8 shadow-2xl relative">
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4 ml-2">Cinematic Prompt</label>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A futuristic synthwave city at night, neon lights reflecting on wet pavement, cinematic slow motion tracking shot..."
              className="w-full bg-slate-950 border border-slate-800 rounded-[32px] py-6 px-8 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-slate-950 transition-all font-medium text-slate-100 min-h-[160px] resize-none text-lg leading-relaxed mb-6"
            />
            <div className="flex gap-4">
              <button 
                type="submit"
                disabled={loading || !prompt.trim()}
                className="flex-1 bg-indigo-600 text-white py-6 rounded-[32px] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-4 hover:bg-indigo-500 active:scale-95 transition-all disabled:opacity-50 shadow-3xl shadow-indigo-600/20"
              >
                {loading ? <Loader2 className="animate-spin" size={24} /> : <Sparkles size={24} fill="currentColor" />}
                {loading ? 'GENERATING CINEMATIC FLOW...' : 'GENERATE CLIP'}
              </button>
              <button 
                type="button"
                onClick={() => setIsApiKeySelected(false)}
                className="w-20 bg-slate-800 text-slate-400 rounded-[32px] border border-slate-700 hover:text-white flex items-center justify-center transition-all"
                title="Reset API Key"
              >
                <RefreshCw size={24} />
              </button>
            </div>
          </form>

          {error && (
            <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-[32px] flex items-center gap-4 text-red-100 text-sm font-medium animate-in fade-in slide-in-from-top-4 duration-300">
               <AlertCircle className="text-red-500 shrink-0" size={20} />
               <p>{error}</p>
            </div>
          )}

          <AnimatePresence mode="wait">
            {loading && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="aspect-video bg-slate-900 rounded-[48px] border border-slate-800 flex flex-col items-center justify-center space-y-8 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/5 via-transparent to-transparent animate-pulse" />
                <div className="relative">
                  <div className="w-24 h-24 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
                  <Video className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-400" size={32} />
                </div>
                <div className="text-center space-y-2 relative z-10 px-8">
                  <p className="text-xl font-bold text-white tracking-tight">{loadingMessages[currentMessageIndex]}</p>
                  <p className="text-slate-500 font-mono text-[10px] uppercase tracking-widest">Veo Generator 3.1 • Processing</p>
                  <p className="text-slate-600 text-xs mt-6 italic font-serif">This may take up to 2-3 minutes. Perfection takes time.</p>
                </div>
              </motion.div>
            )}

            {videoUrl && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="aspect-video bg-slate-900 rounded-[48px] border border-slate-800 overflow-hidden shadow-2xl relative group">
                  <video 
                    src={videoUrl} 
                    controls 
                    className="w-full h-full object-cover" 
                    autoPlay 
                    loop 
                  />
                  <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a 
                      href={videoUrl} 
                      download="content_peak_ai_gen.mp4"
                      className="p-4 bg-indigo-600 text-white rounded-2xl shadow-xl flex items-center gap-2 hover:bg-indigo-500 transition-all font-bold"
                    >
                      <Download size={20} /> Download MP4
                    </a>
                  </div>
                </div>
                <div className="flex justify-center">
                  <button 
                    onClick={() => { setVideoUrl(null); setPrompt(""); }}
                    className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all flex items-center gap-2"
                  >
                    <RefreshCw size={14} /> Generate New Sequence
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Showcase / Tips */}
      {!loading && !videoUrl && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
          <div className="bg-slate-900/30 p-8 rounded-[40px] border border-slate-800/50">
            <h4 className="font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles size={18} className="text-indigo-400" /> Pro Prompting Tip
            </h4>
            <p className="text-sm text-slate-400 leading-relaxed font-serif italic">
              "Include details about camera movement—like 'panning right' or 'low angle tracking shot'—and lighting styles like 'golden hour' or 'cyberpunk' for dramatically better results."
            </p>
          </div>
          <div className="bg-slate-900/30 p-8 rounded-[40px] border border-slate-800/50 flex flex-col justify-center">
             <div className="flex items-center gap-4 text-slate-500">
                <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center">
                   <Play size={20} />
                </div>
                <div>
                   <p className="text-sm font-bold text-slate-300">Veo Engine 3.1 Lite</p>
                   <p className="text-[10px] uppercase font-black tracking-widest mt-0.5">720p Optimized • Zero Latency API</p>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
