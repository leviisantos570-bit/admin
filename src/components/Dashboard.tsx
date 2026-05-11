import { TrendingUp, Users, Eye, Plus, MessageSquare, Clock, Filter, Search, MoreHorizontal, Sparkles, Loader2, BarChart2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import { db, handleFirestoreError, OperationType, FirebaseUser } from "../lib/firebase";
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

const audienceData = [
  { name: 'Jan', value: 4000 },
  { name: 'Feb', value: 3000 },
  { name: 'Mar', value: 5000 },
  { name: 'Apr', value: 2780 },
  { name: 'May', value: 1890 },
  { name: 'Jun', value: 2390 },
  { name: 'Jul', value: 3490 },
];

const performanceData = [
  { name: 'Hooks', views: 400, engagement: 240 },
  { name: 'Value', views: 300, engagement: 139 },
  { name: 'Story', views: 200, engagement: 980 },
  { name: 'Edit', views: 278, engagement: 390 },
  { name: 'SEO', views: 189, engagement: 480 },
];

interface DashboardProps {
  user: FirebaseUser;
}

export default function Dashboard({ user }: DashboardProps) {
  const [ideas, setIdeas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newIdeaTitle, setNewIdeaTitle] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, "ideas"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ideasData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setIdeas(ideasData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "ideas");
    });

    return () => unsubscribe();
  }, [user.uid]);

  const handleAddIdea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIdeaTitle.trim()) return;

    setIsAdding(true);
    try {
      await addDoc(collection(db, "ideas"), {
        userId: user.uid,
        title: newIdeaTitle,
        topic: "General",
        status: "Researching",
        createdAt: serverTimestamp(),
      });
      setNewIdeaTitle("");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "ideas");
    } finally {
      setIsAdding(false);
    }
  };

  const handleUpdateStatus = async (id: string, currentStatus: string) => {
    const statuses = ["Researching", "Scripting", "Published"];
    const nextStatus = statuses[(statuses.indexOf(currentStatus) + 1) % statuses.length];
    
    try {
      await updateDoc(doc(db, "ideas", id), {
        status: nextStatus
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `ideas/${id}`);
    }
  };

  const handleDeleteIdea = async (id: string) => {
    try {
      await deleteDoc(doc(db, "ideas", id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `ideas/${id}`);
    }
  };

  const stats = [
    { label: 'Saved Ideas', value: ideas.length.toString(), icon: TrendingUp, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
    { label: 'Est. Monthly Reach', value: '14.2K', icon: Eye, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { label: 'Niche Score', value: '88/100', icon: Users, color: 'text-amber-400', bg: 'bg-amber-400/10' },
  ];

  return (
    <div className="space-y-12">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-slate-900/50 p-8 rounded-[32px] border border-slate-800 backdrop-blur-sm relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
              <stat.icon className={stat.color} size={24} />
            </div>
            <p className="text-slate-400 text-sm font-semibold uppercase tracking-widest">{stat.label}</p>
            <p className="text-4xl font-black mt-2 text-white">{stat.value}</p>
            <div className="absolute -right-4 -bottom-4 opacity-5 text-white group-hover:scale-110 transition-transform">
              <stat.icon size={80} />
            </div>
          </div>
        ))}
      </div>

      {/* Performance Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900/50 p-8 rounded-[40px] border border-slate-800 backdrop-blur-sm">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <TrendingUp size={20} className="text-indigo-400" /> Audience Growth
              </h3>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-black mt-1">Net Subscriber Gain</p>
            </div>
            <select className="bg-slate-950 border border-slate-800 text-[10px] uppercase font-black tracking-widest px-3 py-1.5 rounded-lg focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all">
              <option>Last 6 Months</option>
              <option>Last Year</option>
            </select>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={audienceData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#475569" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  dy={10}
                />
                <YAxis 
                  stroke="#475569" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(val) => `${val/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ color: '#white' }}
                />
                <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900/50 p-8 rounded-[40px] border border-slate-800 backdrop-blur-sm">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <BarChart2 size={20} className="text-emerald-400" /> Video Performance
              </h3>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-black mt-1">Average Engagement Scale</p>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                <span className="text-[8px] uppercase font-bold text-slate-500">Views</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[8px] uppercase font-bold text-slate-500">Likes</span>
              </div>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#475569" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  dy={10}
                />
                <YAxis 
                  stroke="#475569" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="views" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={12} />
                <Bar dataKey="engagement" fill="#10b981" radius={[4, 4, 0, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Lab Central */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Ideas List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                Idea Lab <span className="px-2.5 py-0.5 bg-indigo-500/10 text-indigo-400 text-xs rounded-full border border-indigo-500/20">{ideas.length}</span>
              </h3>
              <p className="text-slate-500 text-sm italic font-serif">Convert sparks into viral narratives.</p>
            </div>
            <div className="flex gap-2">
              <button className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white hover:border-slate-700 transition-all">
                <Filter size={18} />
              </button>
              <button className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white hover:border-slate-700 transition-all">
                <Search size={18} />
              </button>
            </div>
          </div>

          <form onSubmit={handleAddIdea} className="relative">
             <input 
               type="text" 
               placeholder="Quick capture idea..."
               value={newIdeaTitle}
               onChange={(e) => setNewIdeaTitle(e.target.value)}
               className="w-full bg-slate-900 border-2 border-dashed border-slate-800 px-6 py-5 rounded-[24px] focus:outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all text-sm font-medium placeholder:text-slate-600"
             />
             <button 
               type="submit"
               disabled={isAdding}
               className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl shadow-xl shadow-indigo-600/20 transition-all active:scale-95 disabled:opacity-50"
             >
               {isAdding ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
             </button>
          </form>

          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="text-slate-700 animate-spin" size={32} />
            </div>
          ) : (
            <div className="space-y-4">
              {ideas.length === 0 ? (
                <div className="text-center py-12 bg-slate-900/30 rounded-[32px] border border-dashed border-slate-800">
                   <p className="text-slate-500 font-serif italic">Your idea bank is empty. Start creating.</p>
                </div>
              ) : (
                ideas.map((idea) => (
                  <div key={idea.id} className="bg-slate-900/50 p-6 rounded-[28px] border border-slate-800 group hover:border-slate-700 transition-all flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg ${
                        idea.status === 'Published' ? 'bg-emerald-500/10 text-emerald-400' : 
                        idea.status === 'Scripting' ? 'bg-indigo-500/10 text-indigo-400' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {idea.title[0].toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">{idea.title}</h4>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-[10px] uppercase font-black tracking-widest text-slate-500 flex items-center gap-1">
                            <Clock size={10} /> {idea.createdAt?.toDate().toLocaleDateString() || 'Today'}
                          </span>
                          <button 
                            onClick={() => handleUpdateStatus(idea.id, idea.status)}
                            className="text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded-full border border-slate-800 text-indigo-400 hover:bg-slate-800 transition-colors"
                          >
                            {idea.status}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-white transition-colors">
                        <MessageSquare size={20} />
                      </button>
                      <button 
                        onClick={() => handleDeleteIdea(idea.id)}
                        className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-red-400 transition-colors"
                      >
                        <MoreHorizontal size={20} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* AI Insight Panel */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 rounded-[40px] text-white shadow-2xl shadow-indigo-600/30 relative overflow-hidden">
             <div className="relative z-10">
                <Sparkles className="mb-6 opacity-80" size={32} />
                <h3 className="text-2xl font-bold leading-tight">Niche Opportunity Detected</h3>
                <p className="mt-4 text-indigo-100/80 leading-relaxed font-serif italic text-lg">
                  "AI productivity tools for remote writers is currently underserved. Expect 30% higher click-through on long-form tutorials."
                </p>
                <button className="mt-8 w-full bg-white text-indigo-950 py-4 rounded-[20px] font-black uppercase tracking-widest text-xs hover:bg-slate-100 transition-all">
                  Analyze Trend
                </button>
             </div>
             <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
          </div>

          <div className="bg-slate-900/50 p-8 rounded-[40px] border border-slate-800">
             <h4 className="font-bold text-white mb-6 uppercase tracking-widest text-xs">Recently Analyzed</h4>
             <div className="space-y-6">
                {[
                  { topic: 'SaaS Design', score: 92 },
                  { topic: 'Minimal Setup', score: 78 },
                  { topic: 'Deep Work', score: 85 },
                ].map(item => (
                  <div key={item.topic} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-300">{item.topic}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500" style={{ width: `${item.score}%` }} />
                      </div>
                      <span className="text-[10px] font-bold text-indigo-400">{item.score}%</span>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
