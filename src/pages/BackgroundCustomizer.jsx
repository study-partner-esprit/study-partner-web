import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Image,
  Upload,
  Palette,
  EyeOff,
  Lock,
  Check,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import useGamificationStore from "../store/gamificationStore";

const TABS = [
  { id: "presets", label: "Presets", icon: Palette },
  { id: "upload", label: "Upload", icon: Upload },
  { id: "settings", label: "Settings", icon: SlidersHorizontal },
];

const BackgroundCustomizer = () => {
  const navigate = useNavigate();
  const {
    level,
    backgroundSettings,
    backgroundPresets,
    fetchBackgroundPresets,
    fetchBackgroundSettings,
    applyBackground,
    uploadBackground,
    disableBackground,
    hasFeature,
    loading,
  } = useGamificationStore();

  const [activeTab, setActiveTab] = useState("presets");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [localSettings, setLocalSettings] = useState({
    opacity: 0.15,
    blur: 2,
    position: "cover",
  });
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);
  const fileInputRef = useRef(null);

  const unlocked = hasFeature("wallpaper");

  useEffect(() => {
    fetchBackgroundPresets();
    fetchBackgroundSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (backgroundSettings) {
      setLocalSettings({
        opacity: backgroundSettings.opacity || 0.15,
        blur: backgroundSettings.blur || 2,
        position: backgroundSettings.position || "cover",
      });
      if (backgroundSettings.enabled && backgroundSettings.imageUrl) {
        setPreviewUrl(backgroundSettings.imageUrl);
      }
    }
  }, [backgroundSettings]);

  const handlePresetSelect = (preset) => {
    setPreviewUrl(preset.url);
  };

  const handleApply = async () => {
    if (!previewUrl) return;
    await applyBackground({
      imageUrl: previewUrl,
      type: uploadFile ? "uploaded" : "preset",
      opacity: localSettings.opacity,
      blur: localSettings.blur,
      position: localSettings.position,
      enabled: true,
    });
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadPreview(reader.result);
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadApply = async () => {
    if (!uploadFile) return;
    // Pass just the file; uploadBackground handles FormData creation
    await uploadBackground(uploadFile);
    // Apply settings after successful upload
    await applyBackground({
      type: "uploaded",
      opacity: localSettings.opacity,
      blur: localSettings.blur,
      position: localSettings.position,
      enabled: true,
    });
  };

  const handleDisable = async () => {
    await disableBackground();
    setPreviewUrl(null);
  };

  // ── Locked state ───────────────────────────────────────────────────
  if (!unlocked) {
    return (
      <div className="min-h-screen bg-[#0f1923] flex items-center justify-center text-white relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#ff4655] rounded-full blur-[200px]" />
        </div>
        <div className="relative z-10 text-center max-w-md p-8">
          <Lock size={64} className="mx-auto text-gray-600 mb-6" />
          <h1 className="text-4xl font-black tracking-tighter uppercase mb-3">
            LOCKED
          </h1>
          <p className="text-gray-400 mb-4">
            Custom wallpapers unlock at{" "}
            <span className="text-[#ff4655] font-bold">Level 10</span>.
          </p>
          <p className="text-gray-500 text-sm mb-8">
            You are currently{" "}
            <span className="text-white font-bold">Level {level}</span>. Keep
            studying to unlock this feature!
          </p>
          <div className="w-full h-3 bg-[#1a2633] rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-gradient-to-r from-[#ff4655] to-[#ff4655]/50 rounded-full"
              style={{ width: `${Math.min((level / 10) * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-600">{level}/10 levels</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-8 px-6 py-3 bg-[#1a2633] border border-[#ffffff10] text-white font-bold tracking-wider uppercase rounded-lg hover:bg-[#ffffff10] transition-all"
          >
            GO BACK
          </button>
        </div>
      </div>
    );
  }

  // ── Main customizer ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0f1923] text-white">
      {/* Header */}
      <div className="h-16 px-6 flex items-center justify-between border-b border-[#ffffff10] bg-[#0f1923]/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-[#ffffff10] rounded-lg transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <Image size={18} className="text-[#ff4655]" />
          <span className="font-bold tracking-wider uppercase text-sm">
            Wallpaper Customizer
          </span>
        </div>
        <div className="flex items-center gap-3">
          {backgroundSettings?.enabled && (
            <button
              onClick={handleDisable}
              className="px-4 py-2 text-xs font-bold tracking-wider uppercase bg-[#1a2633] border border-[#ffffff10] text-gray-400 rounded hover:text-white transition-colors flex items-center gap-1"
            >
              <EyeOff size={14} /> Disable
            </button>
          )}
          <button
            onClick={uploadFile ? handleUploadApply : handleApply}
            disabled={!previewUrl || loading}
            className="px-6 py-2 bg-[#ff4655] text-white text-xs font-bold tracking-wider uppercase rounded hover:bg-[#ff2a3a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <Check size={14} /> {loading ? "Saving..." : "Apply"}
          </button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <div className="w-80 border-r border-[#ffffff10] bg-[#0f1923] flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-[#ffffff10]">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-1.5 transition-colors ${
                  activeTab === tab.id
                    ? "text-[#ff4655] border-b-2 border-[#ff4655]"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === "presets" && (
              <div className="grid grid-cols-2 gap-3">
                {backgroundPresets.map((preset, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handlePresetSelect(preset)}
                    className={`relative aspect-video rounded-xl overflow-hidden border-2 transition-colors ${
                      previewUrl === preset.url
                        ? "border-[#ff4655]"
                        : "border-transparent hover:border-[#ffffff20]"
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <span className="absolute bottom-1 left-2 text-[10px] font-bold text-white/80">
                      {preset.name}
                    </span>
                    {previewUrl === preset.url && (
                      <div className="absolute top-1 right-1 w-5 h-5 bg-[#ff4655] rounded-full flex items-center justify-center">
                        <Check size={12} />
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            )}

            {activeTab === "upload" && (
              <div className="space-y-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#ffffff15] rounded-xl p-8 text-center cursor-pointer hover:border-[#ff4655]/50 transition-colors"
                >
                  <Upload size={32} className="mx-auto text-gray-500 mb-3" />
                  <p className="text-sm text-gray-400 mb-1">
                    Click to upload a wallpaper
                  </p>
                  <p className="text-xs text-gray-600">
                    JPG, PNG, WebP • Max 5MB
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleUpload}
                    className="hidden"
                  />
                </div>
                {uploadPreview && (
                  <div className="relative rounded-xl overflow-hidden border border-[#ffffff10]">
                    <img
                      src={uploadPreview}
                      alt="Upload preview"
                      className="w-full aspect-video object-cover"
                    />
                    <button
                      onClick={() => {
                        setUploadFile(null);
                        setUploadPreview(null);
                        if (previewUrl === uploadPreview) setPreviewUrl(null);
                      }}
                      className="absolute top-2 right-2 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6">
                <div>
                  <label className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2 block">
                    Opacity — {(localSettings.opacity * 100).toFixed(0)}%
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={localSettings.opacity * 100}
                    onChange={(e) =>
                      setLocalSettings((prev) => ({
                        ...prev,
                        opacity: parseInt(e.target.value) / 100,
                      }))
                    }
                    className="w-full accent-[#ff4655]"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2 block">
                    Blur — {localSettings.blur}px
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={localSettings.blur}
                    onChange={(e) =>
                      setLocalSettings((prev) => ({
                        ...prev,
                        blur: parseInt(e.target.value),
                      }))
                    }
                    className="w-full accent-[#ff4655]"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2 block">
                    Position
                  </label>
                  <div className="flex gap-2">
                    {["cover", "contain", "repeat"].map((pos) => (
                      <button
                        key={pos}
                        onClick={() =>
                          setLocalSettings((prev) => ({
                            ...prev,
                            position: pos,
                          }))
                        }
                        className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border transition-colors ${
                          localSettings.position === pos
                            ? "border-[#ff4655] text-[#ff4655] bg-[#ff4655]/10"
                            : "border-[#ffffff10] text-gray-500 hover:text-gray-300"
                        }`}
                      >
                        {pos}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 relative flex items-center justify-center bg-[#0a1018]">
          {previewUrl ? (
            <>
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${previewUrl})`,
                  backgroundSize:
                    localSettings.position === "repeat"
                      ? "auto"
                      : localSettings.position,
                  backgroundPosition: "center",
                  backgroundRepeat:
                    localSettings.position === "repeat"
                      ? "repeat"
                      : "no-repeat",
                  opacity: localSettings.opacity,
                  filter: `blur(${localSettings.blur}px)`,
                }}
              />
              <div className="absolute inset-0 bg-[#0f1923]/60" />
              {/* Mock dashboard overlay for preview */}
              <div className="relative z-10 w-[80%] max-w-2xl">
                <div className="bg-[#1a2633]/80 backdrop-blur-md border border-[#ffffff10] rounded-2xl p-8 text-center">
                  <Sparkles size={32} className="mx-auto text-[#ff4655] mb-4" />
                  <h2 className="text-2xl font-black tracking-tighter uppercase mb-2">
                    LIVE PREVIEW
                  </h2>
                  <p className="text-gray-400 text-sm">
                    This is how your wallpaper will look behind the app content.
                    Adjust opacity and blur in the Settings tab.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center">
              <Image size={48} className="mx-auto text-gray-700 mb-4" />
              <p className="text-gray-500">
                Select a preset or upload an image to preview
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BackgroundCustomizer;
