import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Play, Clock, Zap, Target, Book, Brain, User, Shield } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { profileAPI } from '../services/api';

const MODES = [
  {
    id: 'focus',
    name: 'DEEP FOCUS',
    role: 'Concentration',
    description: 'Intense distraction-free work blocks. Ideal for coding or writing.',
    abilities: ['Blocker', 'White Noise', 'Timer'],
    color: '#ff4655', // Red
    img: 'https://images.unsplash.com/photo-1516110833967-0b5716ca1387?auto=format&fit=crop&q=80&w=800' 
  },
  {
    id: 'pomodoro',
    name: 'POMODORO',
    role: 'Balance',
    description: 'Classic 25/5 intervals. Keep fresh with regular breaks.',
    abilities: ['Intervals', 'Breaks', 'Stats'],
    color: '#0fb8ce', // Cyan/Omen
    img: 'https://images.unsplash.com/photo-1456406644174-8ddd4cd52a06?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'exam',
    name: 'EXAM PREP',
    role: 'Endurance',
    description: 'Long format study with strategic review points.',
    abilities: ['Review', 'Notes', 'Quiz'],
    color: '#a35cf7', // Purple/Reyna
    img: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=800'
  }
];

const Lobby = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [selectedMode, setSelectedMode] = useState(MODES[0]);
  const [lockedIn, setLockedIn] = useState(false);
  const [profile, setProfile] = useState(null);
  const [matchState, setMatchState] = useState('selecting'); // selecting, counting, found
  const [countdown, setCountdown] = useState(5); // 5 seconds for demo

  useEffect(() => {
    const loadProfile = async () => {
        try {
            const res = await profileAPI.get();
            setProfile(res.data.profile);
        } catch (e) { console.error(e); }
    };
    loadProfile();
  }, []);

  const handleLockIn = () => {
    setLockedIn(true);
    // 1. Simulate "Lock In" animation/delay
    setTimeout(() => {
        setMatchState('found'); // Show card
        // 2. Start countdown
        let count = 10;
        setCountdown(count);
        const interval = setInterval(() => {
            count--;
            setCountdown(count);
            if (count <= 0) {
                clearInterval(interval);
                // navigate logic
                navigate('/sessions', { state: { mode: selectedMode.id } });
            }
        }, 1000);
    }, 1000); // 1s delay for lock-in animation
  };

  if (matchState === 'found') {
      return (
        <div className="min-h-screen bg-[#0f1923] flex flex-col items-center justify-center relative overflow-hidden">
             {/* Background rays */}
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#1a2633] to-[#0f1923]" />
             <div className="absolute inset-0 z-0 opacity-20">
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#ff4655] rounded-full blur-[200px]" />
             </div>

             {/* Match Found Text */}
             <motion.div 
                initial={{ scale: 2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="z-20 text-center mb-12"
             >
                <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase text-white drop-shadow-[0_0_15px_rgba(255,70,85,0.8)]">
                    MATCH FOUND
                </h1>
                <p className="text-[#ff4655] font-bold tracking-[0.5em] text-xl mt-4 uppercase">
                    {countdown > 0 ? `GAME STARTS IN ${countdown}` : "GAME STARTED"}
                </p>
             </motion.div>

             {/* Player Card */}
             <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="z-20 w-80 md:w-96 aspect-[3/5] bg-[#1a2633] border-4 border-[#ff4655] rounded-xl relative overflow-hidden shadow-2xl group"
             >
                 {/* Card Background Image/Avatar */}
                  <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                      style={{ backgroundImage: `url(${profile?.avatar ? (profile.avatar.startsWith('data:') ? profile.avatar : (profile.avatar.startsWith('http') ? profile.avatar : `${import.meta.env.VITE_API_URL || ''}${profile.avatar}`)) : (user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + (user?.name || 'Agent'))})` }}
                  />
                 <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
                 
                 {/* Content */}
                 <div className="absolute bottom-0 w-full p-6 text-center">
                    <div className="mb-2">
                        <span className="bg-[#ff4655] text-black px-2 py-1 text-xs font-bold uppercase rounded-sm">
                            {profile?.level?.title || 'AGENT'}
                        </span>
                    </div>
                    <h2 className="text-3xl font-black uppercase italic tracking-wider text-white mb-1">
                        {profile?.nickname || user?.name || 'UNKNOWN'}
                    </h2>
                    <p className="text-gray-400 font-bold tracking-widest text-sm mb-4">
                        LEVEL {profile?.level?.current || 1}
                    </p>
                    
                    <div className="w-full h-1 bg-[#333] mt-4 rounded-full overflow-hidden">
                        <motion.div 
                            className="h-full bg-[#ff4655]" 
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 10, ease: "linear" }}
                        />
                    </div>
                 </div>
                 
                 {/* Top Icon */}
                 <div className="absolute top-4 left-4">
                     <Shield className="w-8 h-8 text-[#ff4655]" />
                 </div>
                 <div className="absolute top-4 right-4">
                    <div className="w-2 h-2 bg-[#00ff00] rounded-full animate-pulse shadow-[0_0_10px_#00ff00]" />
                 </div>
             </motion.div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-[#0f1923] overflow-hidden relative text-white font-sans flex flex-col">
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a2633] via-[#0f1923] to-[#0f1923] z-0" />
      
      {/* Header */}
      <div className="relative z-20 h-20 px-8 flex items-center border-b border-[#ffffff10] bg-[#0f1923]/80 backdrop-blur-md">
        <div className="text-xl font-bold tracking-widest text-[#ff4655] mr-4">//</div>
        <h1 className="text-2xl font-bold tracking-wider uppercase">Session Setup</h1>
        <div className="ml-auto flex items-center gap-4 text-sm font-bold tracking-widest text-gray-500">
             <span>LOBBY</span>
             <span className="text-[#ff4655]">●</span>
        </div>
      </div>

      <div className="flex-1 relative z-10 flex">
         
         {/* LEFT: Mode Selection List (Like Agent Selector) */}
         <div className="w-24 md:w-32 py-8 flex flex-col gap-4 items-center border-r border-[#ffffff10] bg-[#1a2633]/30 backdrop-blur-sm overflow-y-auto custom-scrollbar">
            {MODES.map((mode) => (
               <motion.div
                 key={mode.id}
                 onClick={() => setSelectedMode(mode)}
                 whileHover={{ scale: 1.05, x: 5 }}
                 className={`w-16 h-16 md:w-20 md:h-20 rounded-xl cursor-pointer transition-all duration-300 relative overflow-hidden group ${
                    selectedMode.id === mode.id 
                    ? 'ring-2 ring-[#ff4655] shadow-[0_0_20px_rgba(255,70,85,0.4)]' 
                    : 'opacity-50 hover:opacity-100 hover:ring-2 hover:ring-white/50'
                 }`}
               >
                   <img src={mode.img} alt={mode.name} className="w-full h-full object-cover" />
                   {/* Overlay */}
                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-center pb-2">
                       <span className="text-[10px] uppercase font-bold tracking-widest truncate max-w-full px-1">{mode.name.split(' ')[0]}</span>
                   </div>
               </motion.div>
            ))}
         </div>

         {/* CENTER: Main Visual (Agent Showcase) */}
         <div className="flex-1 relative flex items-center justify-center overflow-hidden">
             
             {/* Character/Mode Background Graphic */}
             <div className="absolute inset-0 opacity-20 pointer-events-none">
                 <h1 className="text-[200px] font-black tracking-tighter text-white opacity-5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none uppercase whitespace-nowrap">
                    {selectedMode.name}
                 </h1>
             </div>

             <AnimatePresence mode='wait'>
                 <motion.div
                   key={selectedMode.id}
                   initial={{ opacity: 0, scale: 0.9, x: 50 }}
                   animate={{ opacity: 1, scale: 1, x: 0 }}
                   exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                   transition={{ duration: 0.4 }}
                   className="relative z-10 max-w-4xl w-full flex flex-col md:flex-row items-center gap-12 px-12"
                 >
                     {/* Large Image Card */}
                     <div className="w-full md:w-1/2 aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl relative border border-[#ffffff10] group">
                         <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 opacity-80" />
                         <img src={selectedMode.img} alt={selectedMode.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                         
                         <div className="absolute bottom-0 left-0 w-full p-8 z-20">
                             <h2 className="text-5xl font-black italic tracking-tighter uppercase mb-2 leading-none">
                                {selectedMode.name}
                             </h2>
                             <div className="flex items-center gap-2 mb-4">
                                <span className="bg-[#ff4655] px-2 py-1 text-xs font-bold uppercase text-black rounded-sm">
                                    {selectedMode.role}
                                </span>
                             </div>
                             <p className="text-gray-300 font-medium leading-relaxed max-w-sm">
                                {selectedMode.description}
                             </p>
                         </div>
                     </div>

                     {/* Stats / Abilities Side Panel */}
                     <div className="w-full md:w-1/2 space-y-8">
                         <div>
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">
                                SESSION FEATURES
                            </h3>
                            <div className="space-y-4">
                                {selectedMode.abilities.map((ability, idx) => (
                                    <div key={idx} className="flex items-center gap-4 bg-[#1a2633]/50 p-4 rounded-lg border border-[#ffffff05]">
                                        <div className="w-10 h-10 rounded bg-[#ffffff05] flex items-center justify-center text-[#ff4655]">
                                            {idx === 0 ? <Zap /> : idx === 1 ? <Brain /> : <Clock />}
                                        </div>
                                        <div>
                                            <div className="font-bold uppercase tracking-wider text-sm">{ability}</div>
                                            <div className="text-xs text-gray-500">Feature Active</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                         </div>
                     </div>
                 </motion.div>
             </AnimatePresence>
         </div>
      </div>

      {/* FOOTER: Controls */}
      <div className="h-24 bg-[#0f1923] border-t border-[#ffffff10] relative z-20 flex items-center justify-center px-12">
          <button 
             onClick={handleLockIn}
             disabled={lockedIn}
             className={`
                px-16 py-4 bg-[#ff4655] text-white font-black text-xl tracking-widest uppercase clip-path-polygon hover:bg-[#ff2a3a] transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,70,85,0.4)]
                ${lockedIn ? 'animate-pulse cursor-not-allowed opacity-80' : ''}
             `}
             style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
          >
             {lockedIn ? 'STARTING...' : 'LOCK IN'}
          </button>
      </div>
    </div>
  );
};

export default Lobby;
