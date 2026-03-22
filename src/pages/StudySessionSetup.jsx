import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Users,
  User,
  Zap,
  Clock,
  Target,
  ChevronRight,
  ArrowLeft,
  Loader2,
  Check,
  Search,
  LogIn,
} from "lucide-react";
import useSessionStore from "../store/sessionStore";
import useFriendsStore from "../store/friendsStore";

const SESSION_MODES = [
  {
    id: "focus",
    name: "DEEP FOCUS",
    description: "Intense distraction-free study blocks",
    icon: Target,
    color: "#ff4655",
  },
  {
    id: "pomodoro",
    name: "POMODORO",
    description: "Classic 25/5 intervals with breaks",
    icon: Clock,
    color: "#0fb8ce",
  },
  {
    id: "exam",
    name: "EXAM PREP",
    description: "Long format with strategic reviews",
    icon: Zap,
    color: "#a35cf7",
  },
];

const StudySessionSetup = () => {
  const navigate = useNavigate();
  const {
    courses,
    selectedCourse,
    coursesLoading,
    sessionMode,
    sessionLoading,
    error,
    fetchCourses,
    selectCourse,
    setSessionMode,
    setMode,
    setupSoloSession,
    setupTeamSession,
    teamSession,
    joinTeamSessionByCode,
  } = useSessionStore();

  const { friends, fetchFriends, inviteToSession } = useFriendsStore();

  const [selectedType, setSelectedType] = useState(null); // 'solo' | 'team'
  const [step, setLocalStep] = useState("mode"); // 'mode' | 'course' | 'friends' | 'confirm'
  const [selectedFriends, setSelectedFriends] = useState(new Set());
  const [friendSearch, setFriendSearch] = useState("");
  const [showJoinCode, setShowJoinCode] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [joinCodeLoading, setJoinCodeLoading] = useState(false);
  const [joinCodeError, setJoinCodeError] = useState("");

  useEffect(() => {
    fetchCourses();
    fetchFriends();
  }, [fetchCourses, fetchFriends]);

  const handleJoinByCode = async () => {
    const code = joinCode.trim().toUpperCase();
    if (code.length !== 6) {
      setJoinCodeError("Invite code must be 6 characters");
      return;
    }
    setJoinCodeLoading(true);
    setJoinCodeError("");
    try {
      await joinTeamSessionByCode(code);
      navigate("/team-lobby");
    } catch (err) {
      setJoinCodeError(
        err.response?.data?.error || "Invalid code or session not found",
      );
    } finally {
      setJoinCodeLoading(false);
    }
  };

  const handleModeSelect = (type) => {
    setSelectedType(type);
    setMode(type);
    setLocalStep("course");
  };

  const handleCourseSelect = (course) => {
    selectCourse(course);
    // Team → show friend picker; Solo → go to confirm
    setLocalStep(selectedType === "team" ? "friends" : "confirm");
  };

  const toggleFriend = (userId) => {
    setSelectedFriends((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else if (next.size < 3) next.add(userId); // max 3 friends (4 total incl. host)
      return next;
    });
  };

  const handleStart = async () => {
    if (selectedType === "solo") {
      await setupSoloSession();
      navigate("/session-live");
    } else {
      const session = await setupTeamSession();
      // Use returned session or fall back to store value
      const sid = session?._id || teamSession?._id;
      if (sid && selectedFriends.size > 0) {
        for (const friendId of selectedFriends) {
          try {
            await inviteToSession(sid, friendId);
          } catch {
            /* best-effort */
          }
        }
      }
      navigate("/team-lobby");
    }
  };

  const handleBack = () => {
    if (step === "confirm") {
      setLocalStep(selectedType === "team" ? "friends" : "course");
    } else if (step === "friends") {
      setLocalStep("course");
    } else if (step === "course") {
      setLocalStep("mode");
      setSelectedType(null);
    } else {
      navigate("/dashboard");
    }
  };

  // Show all non-failed courses (processing ones are valid too)
  const usableCourses = courses.filter((c) => c.status !== "failed");

  const filteredFriends = friends.filter((f) =>
    (f.name || "").toLowerCase().includes(friendSearch.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-[#0f1923] overflow-hidden relative text-white font-sans flex flex-col">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a2633] via-[#0f1923] to-[#0f1923] z-0" />

      {/* Top bar */}
      <div className="relative z-20 h-20 px-8 flex items-center border-b border-[#ffffff10] bg-[#0f1923]/80 backdrop-blur-md">
        <button
          onClick={handleBack}
          className="mr-4 p-2 hover:bg-[#ffffff10] rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="text-xl font-bold tracking-widest text-[#ff4655] mr-4">
          {"//"}
        </div>
        <h1 className="text-2xl font-bold tracking-wider uppercase">
          {step === "mode"
            ? "Select Mode"
            : step === "course"
              ? "Select Course"
              : "Confirm Session"}
        </h1>
        <div className="ml-auto flex items-center gap-4 text-sm font-bold tracking-widest text-gray-500">
          <span className={step === "mode" ? "text-[#ff4655]" : ""}>MODE</span>
          <ChevronRight size={14} />
          <span className={step === "course" ? "text-[#ff4655]" : ""}>
            COURSE
          </span>{" "}
          {selectedType === "team" && (
            <>
              <ChevronRight size={14} />
              <span className={step === "friends" ? "text-[#ff4655]" : ""}>
                FRIENDS
              </span>
            </>
          )}{" "}
          <ChevronRight size={14} />
          <span className={step === "confirm" ? "text-[#ff4655]" : ""}>
            START
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 relative z-10 flex items-center justify-center p-8">
        <AnimatePresence mode="wait">
          {/* Step 1: Mode Selection */}
          {step === "mode" && (
            <motion.div
              key="mode"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="max-w-4xl w-full"
            >
              <h2 className="text-4xl font-black tracking-tighter uppercase mb-2 text-center">
                HOW DO YOU WANT TO STUDY?
              </h2>
              <p className="text-gray-400 text-center mb-12">
                Study solo or team up with friends for bonus XP
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
                {/* Solo Card */}
                <motion.button
                  whileHover={{ scale: 1.03, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleModeSelect("solo")}
                  className="relative bg-[#1a2633] border-2 border-[#ffffff10] hover:border-[#ff4655] rounded-2xl p-8 text-left transition-all duration-300 group overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#ff4655]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-[#ff4655]/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#ff4655]/20 transition-colors">
                      <User size={32} className="text-[#ff4655]" />
                    </div>
                    <h3 className="text-2xl font-black uppercase tracking-wider mb-2">
                      SOLO
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Study at your own pace with AI coaching and focus
                      tracking. 1.0x XP multiplier.
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                      <Zap size={12} className="text-[#ff4655]" />
                      <span>1.0x XP</span>
                    </div>
                  </div>
                </motion.button>

                {/* Team Card */}
                <motion.button
                  whileHover={{ scale: 1.03, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleModeSelect("team")}
                  className="relative bg-[#1a2633] border-2 border-[#ffffff10] hover:border-[#0fb8ce] rounded-2xl p-8 text-left transition-all duration-300 group overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0fb8ce]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-[#0fb8ce]/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#0fb8ce]/20 transition-colors">
                      <Users size={32} className="text-[#0fb8ce]" />
                    </div>
                    <h3 className="text-2xl font-black uppercase tracking-wider mb-2">
                      TEAM
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Invite up to 3 friends. Earn bonus XP together with team
                      multiplier up to 1.25x.
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                      <Zap size={12} className="text-[#0fb8ce]" />
                      <span>Up to 1.25x XP</span>
                    </div>
                  </div>
                </motion.button>
              </div>

              {/* Join with invite code */}
              <div className="mt-8 max-w-2xl mx-auto">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#ffffff10]" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-3 bg-[#0f1923] text-xs text-gray-600 uppercase tracking-widest">
                      or
                    </span>
                  </div>
                </div>

                {!showJoinCode ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowJoinCode(true)}
                    className="mt-6 w-full flex items-center justify-center gap-3 p-4 rounded-xl border-2 border-dashed border-[#ffffff15] hover:border-[#a78bfa]/60 hover:bg-[#a78bfa]/5 transition-all duration-300 group"
                  >
                    <LogIn
                      size={18}
                      className="text-gray-600 group-hover:text-[#a78bfa] transition-colors"
                    />
                    <span className="text-sm font-bold tracking-widest uppercase text-gray-600 group-hover:text-[#a78bfa] transition-colors">
                      Join with Invite Code
                    </span>
                  </motion.button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-5 rounded-xl border border-[#a78bfa]/30 bg-[#a78bfa]/5"
                  >
                    <p className="text-center text-sm font-bold text-[#a78bfa] tracking-widest uppercase mb-4">
                      Enter 6-Character Invite Code
                    </p>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={joinCode}
                        onChange={(e) => {
                          setJoinCode(
                            e.target.value
                              .toUpperCase()
                              .replace(/[^A-Z0-9]/g, "")
                              .slice(0, 6),
                          );
                          setJoinCodeError("");
                        }}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleJoinByCode()
                        }
                        placeholder="e.g. A1B2C3"
                        maxLength={6}
                        className="flex-1 bg-[#0f1923] border border-[#a78bfa]/30 rounded-lg px-4 py-2.5 text-center text-xl font-black tracking-[0.4em] text-white placeholder-gray-700 focus:border-[#a78bfa] focus:outline-none uppercase"
                        autoFocus
                      />
                      <button
                        onClick={handleJoinByCode}
                        disabled={joinCodeLoading || joinCode.length !== 6}
                        className="px-6 py-2.5 bg-[#a78bfa] text-white font-black uppercase tracking-widest rounded-lg hover:bg-[#9061f9] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {joinCodeLoading ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <LogIn size={16} />
                        )}
                        JOIN
                      </button>
                      <button
                        onClick={() => {
                          setShowJoinCode(false);
                          setJoinCode("");
                          setJoinCodeError("");
                        }}
                        className="px-3 py-2.5 border border-[#ffffff10] rounded-lg text-gray-500 hover:text-white hover:border-[#ffffff30] transition-colors text-sm"
                      >
                        ✕
                      </button>
                    </div>
                    {joinCodeError && (
                      <p className="mt-2 text-center text-xs text-red-400">
                        {joinCodeError}
                      </p>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 2: Course Selection */}
          {step === "course" && (
            <motion.div
              key="course"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="max-w-5xl w-full"
            >
              <h2 className="text-3xl font-black tracking-tighter uppercase mb-2 text-center">
                CHOOSE YOUR COURSE
              </h2>
              <p className="text-gray-400 text-center mb-8">
                Select a course to study &mdash; tasks will be loaded
                automatically
              </p>

              {/* Session mode selector */}
              <div className="flex gap-3 justify-center mb-8">
                {SESSION_MODES.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSessionMode(m.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all text-sm font-bold tracking-wider uppercase ${
                      sessionMode === m.id
                        ? "border-[#ff4655] bg-[#ff4655]/10 text-white"
                        : "border-[#ffffff10] text-gray-500 hover:text-white hover:border-[#ffffff30]"
                    }`}
                  >
                    <m.icon size={16} />
                    {m.name}
                  </button>
                ))}
              </div>

              {coursesLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="animate-spin text-[#ff4655]" size={32} />
                </div>
              ) : usableCourses.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                  <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="text-xl mb-2">No courses available</p>
                  <p className="text-sm">
                    Please upload a course first from the Subjects section to
                    start studying
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                  {usableCourses.map((course, idx) => (
                    <motion.button
                      key={course.id || course._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => handleCourseSelect(course)}
                      className={`text-left p-5 rounded-xl border transition-all ${
                        (selectedCourse?._id || selectedCourse?.id) ===
                        (course._id || course.id)
                          ? "border-[#ff4655] bg-[#ff4655]/10"
                          : "border-[#ffffff10] bg-[#1a2633]/50 hover:border-[#ffffff30]"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-bold text-lg truncate flex-1">
                          {course.title}
                        </h3>
                        {course.status !== "completed" && (
                          <span className="ml-2 shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 uppercase tracking-wider">
                            {course.status}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-xs mb-3 line-clamp-2">
                        {course.description || "No description"}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <BookOpen size={12} />
                          {course.topics?.length ||
                            course.topicsCount ||
                            0}{" "}
                          topics
                        </span>
                        <span className="flex items-center gap-1">
                          <Target size={12} />
                          {course.topics?.reduce(
                            (sum, t) => sum + (t.subtopics?.length || 0),
                            0,
                          )}{" "}
                          subtopics
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Step 3 (Team only): Friend Picker */}
          {step === "friends" && selectedType === "team" && (
            <motion.div
              key="friends"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="max-w-2xl w-full"
            >
              <h2 className="text-3xl font-black tracking-tighter uppercase mb-1 text-center">
                INVITE FRIENDS
              </h2>
              <p className="text-gray-400 text-center mb-6 text-sm">
                Select up to 3 friends to invite — or skip and invite from the
                lobby
              </p>

              {/* Search */}
              <div className="relative mb-4">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                />
                <input
                  type="text"
                  placeholder="Search friends..."
                  value={friendSearch}
                  onChange={(e) => setFriendSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-[#1a2633] border border-[#ffffff10] rounded-lg text-sm text-white placeholder-gray-600 focus:border-[#0fb8ce]/50 outline-none transition-colors"
                />
              </div>

              {/* Friends list */}
              <div className="space-y-2 max-h-[45vh] overflow-y-auto pr-1 custom-scrollbar mb-6">
                {filteredFriends.length === 0 ? (
                  <div className="text-center py-10 text-gray-600">
                    <Users size={36} className="mx-auto mb-3 opacity-40" />
                    <p className="text-sm">
                      {friends.length === 0 ? "No friends yet" : "No matches"}
                    </p>
                  </div>
                ) : (
                  filteredFriends.map((friend) => {
                    const fid = friend.userId || friend._id;
                    const selected = selectedFriends.has(fid);
                    const disabled = !selected && selectedFriends.size >= 3;
                    return (
                      <motion.button
                        key={fid}
                        whileHover={{ scale: disabled ? 1 : 1.01 }}
                        whileTap={{ scale: disabled ? 1 : 0.99 }}
                        onClick={() => !disabled && toggleFriend(fid)}
                        disabled={disabled}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                          selected
                            ? "border-[#0fb8ce] bg-[#0fb8ce]/10"
                            : disabled
                              ? "border-[#ffffff05] bg-[#1a2633]/30 opacity-40 cursor-not-allowed"
                              : "border-[#ffffff10] bg-[#1a2633]/50 hover:border-[#ffffff30]"
                        }`}
                      >
                        {/* Avatar */}
                        <div className="relative shrink-0">
                          <div className="w-10 h-10 rounded-full bg-[#0fb8ce]/20 flex items-center justify-center text-[#0fb8ce] font-bold text-sm">
                            {(friend.name || "?")[0].toUpperCase()}
                          </div>
                          <div
                            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0f1923] ${
                              friend.onlineStatus === "online" ||
                              friend.onlineStatus === "studying"
                                ? "bg-green-500"
                                : "bg-gray-600"
                            }`}
                          />
                        </div>
                        {/* Info */}
                        <div className="flex-1 text-left">
                          <p className="font-semibold text-sm">{friend.name}</p>
                          <p className="text-[11px] text-gray-500 capitalize">
                            {friend.onlineStatus === "studying"
                              ? "Currently studying"
                              : friend.onlineStatus || "offline"}
                            {" • "}Lvl {friend.level || 1}
                          </p>
                        </div>
                        {/* Checkmark */}
                        {selected && (
                          <div className="w-6 h-6 rounded-full bg-[#0fb8ce] flex items-center justify-center shrink-0">
                            <Check size={14} className="text-white" />
                          </div>
                        )}
                      </motion.button>
                    );
                  })
                )}
              </div>

              {/* Slot summary + Continue */}
              <div className="flex items-center gap-4">
                <div className="flex-1 text-sm text-gray-500">
                  {selectedFriends.size > 0
                    ? `${selectedFriends.size}/3 friend${selectedFriends.size > 1 ? "s" : ""} selected`
                    : "No friends selected (solo lobby)"}
                </div>
                <button
                  onClick={() => setLocalStep("confirm")}
                  className="px-6 py-3 bg-[#0fb8ce] text-white font-bold rounded-xl hover:bg-[#0da3b7] transition-colors tracking-wider text-sm uppercase"
                >
                  {selectedFriends.size > 0
                    ? "Continue →"
                    : "Skip & Continue →"}
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Confirmation */}
          {step === "confirm" && selectedCourse && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="max-w-lg w-full text-center"
            >
              <div className="bg-[#1a2633] border border-[#ffffff10] rounded-2xl p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#ff4655] to-[#a35cf7]" />

                <div className="mb-6">
                  <div
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${
                      selectedType === "team"
                        ? "bg-[#0fb8ce]/10 text-[#0fb8ce]"
                        : "bg-[#ff4655]/10 text-[#ff4655]"
                    }`}
                  >
                    {selectedType === "team" ? (
                      <Users size={16} />
                    ) : (
                      <User size={16} />
                    )}
                    {selectedType?.toUpperCase()} MODE
                  </div>
                </div>

                <h2 className="text-3xl font-black tracking-tighter uppercase mb-2">
                  {selectedCourse.title}
                </h2>
                <p className="text-gray-400 text-sm mb-2">
                  {SESSION_MODES.find((m) => m.id === sessionMode)?.name} •{" "}
                  {selectedCourse.topics?.reduce(
                    (sum, t) => sum + (t.subtopics?.length || 0),
                    0,
                  )}{" "}
                  tasks
                </p>

                {/* Show invited friends summary */}
                {selectedType === "team" && selectedFriends.size > 0 && (
                  <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
                    {[...selectedFriends].map((fid) => {
                      const f = friends.find(
                        (fr) => (fr.userId || fr._id) === fid,
                      );
                      return f ? (
                        <span
                          key={fid}
                          className="flex items-center gap-1.5 text-xs bg-[#0fb8ce]/10 border border-[#0fb8ce]/30 text-[#0fb8ce] px-2.5 py-1 rounded-full font-medium"
                        >
                          <Users size={11} />
                          {f.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                )}

                {error && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleStart}
                  disabled={sessionLoading}
                  className="w-full px-8 py-4 bg-[#ff4655] text-white font-black text-xl tracking-widest uppercase hover:bg-[#ff2a3a] transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,70,85,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    clipPath:
                      "polygon(5% 0, 100% 0, 100% 70%, 95% 100%, 0 100%, 0 30%)",
                  }}
                >
                  {sessionLoading ? (
                    <Loader2 className="animate-spin mx-auto" size={24} />
                  ) : selectedType === "team" ? (
                    "CREATE LOBBY"
                  ) : (
                    "START GAME"
                  )}
                </button>

                {selectedType === "team" && selectedFriends.size === 0 && (
                  <p className="text-gray-500 text-xs mt-4">
                    You can also invite friends from inside the lobby
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StudySessionSetup;
