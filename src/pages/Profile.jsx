import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { profileAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { Camera, Edit2, Zap, Trophy, Share2, Award } from 'lucide-react';

// Helper to determine avatar src
const getAvatarSrc = (avatarPath, userName) => {
    if (!avatarPath) return `https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`;
    if (avatarPath.startsWith('http')) return avatarPath;
    // If it's a relative path from our uploads, prepend API base if needed
    // Assuming API is proxied on same origin in dev, or use env var
    return `http://localhost:3000${avatarPath}`; 
};

const Profile = () => {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    nickname: '',
    bio: '',
    avatar: '',
    avatarFile: null
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await profileAPI.get();
      setProfile(response.data.profile);
      setFormData({
        nickname: response.data.profile.nickname || user.name,
        bio: response.data.profile.bio || '',
        avatar: response.data.profile.avatar || ''
      });
    } catch (error) {
      console.error('Failed to fetch profile', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (xp) => {
    // Simple logic: Next level at 100 XP * current level
    const currentLevel = profile?.level?.current || 1;
    const nextLevelXP = 100 * currentLevel;
    const progress = (xp / nextLevelXP) * 100;
    return Math.min(progress, 100);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('nickname', formData.nickname);
      data.append('bio', formData.bio);
      
      // If we have a file, append it as 'avatarFile'
      // If we have a URL string (not file), send as 'avatar'
      if (formData.avatarFile) {
          data.append('avatarFile', formData.avatarFile);
      } else if (formData.avatar) {
          data.append('avatar', formData.avatar);
      }

      await profileAPI.update(data);
      setEditing(false);
      fetchProfile();
    } catch (error) {
      console.error('Failed to update profile', error);
      const msg = error.response?.data?.error || error.message;
      alert('Failed to update profile: ' + msg);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#0f1923] flex items-center justify-center text-white">LOADING...</div>;

  return (
    <div className="min-h-screen bg-[#0f1923] pt-24 px-6 md:px-12 text-white overflow-hidden relative">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20 pointer-events-none">
         <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#ff4655] rounded-full blur-[150px]" />
         <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#0f1923] rounded-full blur-[150px]" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Profile Header Card */}
        <div className="relative mb-12">
            
          {/* Card Container - Glassmorphism Valorant Style */}
          <div className="relative bg-[#1a2633]/80 backdrop-blur-xl border border-[#ffffff10] rounded-3xl p-8 shadow-2xl overflow-hidden">
             {/* Decorative Border Line */}
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#ff4655] via-transparent to-transparent opacity-80" />
             
             <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
               {/* Avatar Section */}
               <div className="relative group">
                 <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl overflow-hidden border-4 border-[#ffffff10] shadow-xl relative z-10 group-hover:border-[#ff4655] transition-all duration-300">
                    <img 
                      src={editing && formData.avatar ? formData.avatar : getAvatarSrc(profile?.avatar, user?.name)} 
                      alt="Profile" 
                      className="w-full h-full object-cover bg-[#0f1923]" 
                    />
                    {editing && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center cursor-pointer hover:bg-black/70 transition-colors">
                        <Camera className="w-8 h-8 text-white opacity-80" />
                      </div>
                    )}
                 </div>
                 {/* Level Badge overlapping avatar */}
                 <div className="absolute -bottom-3 -right-3 bg-[#ff4655] w-10 h-10 flex items-center justify-center font-bold text-lg rounded-xl shadow-lg border-2 border-[#1a2633] z-20">
                    {profile?.level?.current || 1}
                 </div>
               </div>

               {/* Info Section */}
               <div className="flex-1 w-full text-center md:text-left">
                  <div className="flex flex-col md:flex-row justify-between items-center mb-4">
                     <div>
                       <h1 className="text-3xl md:text-4xl font-bold font-valorant tracking-wider mb-1">
                         {formData.nickname || user?.name}
                       </h1>
                       <p className="text-gray-400 font-medium tracking-widest text-sm uppercase flex items-center justify-center md:justify-start gap-2">
                         <Trophy className="w-4 h-4 text-[#ff4655]" />
                         {profile?.level?.title || 'Novice Explorer'}
                       </p>
                     </div>
                     
                     <button 
                       onClick={() => setEditing(!editing)}
                       className="mt-4 md:mt-0 px-6 py-2 rounded-lg bg-[#ffffff05] border border-[#ffffff10] hover:bg-[#ffffff10] hover:border-[#ff4655] transition-all flex items-center gap-2 text-sm font-bold tracking-wider"
                     >
                       <Edit2 className="w-4 h-4" />
                       {editing ? 'CANCEL' : 'EDIT PROFILE'}
                     </button>
                  </div>

                  {/* Level Progress */}
                  <div className="bg-[#0f1923] rounded-full h-4 w-full mb-2 overflow-hidden relative">
                    <div 
                      className="h-full bg-gradient-to-r from-[#ff4655] to-[#ff8f9a]" 
                      style={{ width: `${calculateProgress(profile?.level?.xp || 0)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs font-bold tracking-wider text-gray-500 uppercase">
                    <span>{profile?.level?.xp || 0} XP</span>
                    <span>Next Level: {(profile?.level?.current || 1) * 100} XP</span>
                  </div>

                  {/* Quick Stats Row */}
                  <div className="grid grid-cols-3 gap-4 mt-8">
                     <div className="bg-[#0f1923]/50 p-3 rounded-xl border border-[#ffffff05] text-center">
                        <div className="text-[#ff4655] mb-1 flex justify-center"><Zap className="w-5 h-5" /></div>
                        <div className="text-xl font-bold">{profile?.stats?.currentStreak || 0}</div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-widest">Streak</div>
                     </div>
                     <div className="bg-[#0f1923]/50 p-3 rounded-xl border border-[#ffffff05] text-center">
                        <div className="text-yellow-500 mb-1 flex justify-center"><Award className="w-5 h-5" /></div>
                        <div className="text-xl font-bold">{profile?.stats?.completedTasks || 0}</div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-widest">Tasks</div>
                     </div>
                     <div className="bg-[#0f1923]/50 p-3 rounded-xl border border-[#ffffff05] text-center">
                        <div className="text-cyan-500 mb-1 flex justify-center"><Share2 className="w-5 h-5" /></div>
                        <div className="text-xl font-bold">0</div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-widest">Friends</div>
                     </div>
                  </div>
               </div>
             </div>

             {/* Editing Form */}
             {editing && (
               <motion.form 
                 initial={{ height: 0, opacity: 0 }}
                 animate={{ height: 'auto', opacity: 1 }}
                 className="mt-8 pt-8 border-t border-[#ffffff10]"
                 onSubmit={handleUpdate}
               >
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Nickname</label>
                      <input 
                        type="text" 
                        value={formData.nickname}
                        onChange={e => setFormData({...formData, nickname: e.target.value})}
                        className="w-full bg-[#0f1923] border border-[#ffffff10] rounded-lg px-4 py-3 text-white focus:border-[#ff4655] outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Avatar</label>
                      <div className="space-y-3">
                          <input 
                            type="text" 
                            value={formData.avatar}
                            onChange={e => setFormData({...formData, avatar: e.target.value, avatarFile: null})}
                            className="w-full bg-[#0f1923] border border-[#ffffff10] rounded-lg px-4 py-3 text-white focus:border-[#ff4655] outline-none transition-colors text-sm"
                            placeholder="Enter Image URL or Upload File below..."
                          />
                          <div className="relative group">
                              <input 
                                type="file"
                                accept="image/png, image/jpeg, image/jpg"
                                onChange={e => {
                                    if(e.target.files[0]) {
                                        setFormData({
                                            ...formData, 
                                            avatarFile: e.target.files[0],
                                            avatar: '' // Clear URL if file selected
                                        });
                                    }
                                }}
                                className="block w-full text-sm text-gray-400
                                  file:mr-4 file:py-2 file:px-4
                                  file:rounded-full file:border-0
                                  file:text-xs file:font-semibold
                                  file:bg-[#ff4655] file:text-white
                                  hover:file:bg-[#d93b49]
                                  cursor-pointer"
                              />
                          </div>
                      </div>
                    </div>
                 </div>
                 <button 
                   type="submit"
                   className="mt-6 w-full py-3 bg-[#ff4655] hover:bg-[#d93b49] text-white font-bold tracking-widest uppercase rounded-lg transition-colors"
                 >
                   Save Changes
                 </button>
               </motion.form>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
