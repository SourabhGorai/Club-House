import {
  Globe,
  Users,
  Briefcase,
  Target,
  Code,
  Music,
  Camera,
  Trophy,
  Heart,
  BookOpen,
  Coffee,
  Sparkles,
} from "lucide-react";

// ─── Target type helpers ──────────────────────────────────────────────────────
export const getTargetTypeIcon = (type) => {
  switch (type?.toLowerCase()) {
    case "global":     return <Globe     className="w-4 h-4" />;
    case "club":       return <Users     className="w-4 h-4" />;
    case "department": return <Briefcase className="w-4 h-4" />;
    default:           return <Target    className="w-4 h-4" />;
  }
};

export const getTargetTypeColor = (type, isDarkMode = false) => {
  // Returns color schemes for both light and dark modes
  // Now returns an object with background and text colors for better theme support
  const colorMap = {
    global: isDarkMode
      ? { bg: "linear-gradient(135deg, #3B82F6, #1E40AF)", text: "#93C5FD" }      // Dark blue gradient
      : { bg: "#dbeafe", text: "#1e40af" },                                        // Light blue
    club: isDarkMode
      ? { bg: "linear-gradient(135deg, #A855F7, #6D28D9)", text: "#D8B4FE" }      // Dark purple gradient
      : { bg: "#f3e8ff", text: "#6d28d9" },                                        // Light purple
    department: isDarkMode
      ? { bg: "linear-gradient(135deg, #10B981, #047857)", text: "#6EE7B7" }      // Dark emerald gradient
      : { bg: "#ccfbf1", text: "#047857" },                                        // Light emerald
    default: isDarkMode
      ? { bg: "linear-gradient(135deg, #6B7280, #374151)", text: "#D1D5DB" }      // Dark gray gradient
      : { bg: "#f3f4f6", text: "#374151" },                                        // Light gray
  };

  const scheme = colorMap[type?.toLowerCase()] || colorMap.default;
  
  // For backward compatibility with existing code expecting className strings,
  // return className for light mode, but for dark mode we'll use the object directly in TeacherEvents.jsx
  if (isDarkMode) {
    return scheme;
  }
  
  // Return Tailwind classes for light mode (backward compatible)
  switch (type?.toLowerCase()) {
    case "global":     return "bg-blue-100 text-blue-700";
    case "club":       return "bg-purple-100 text-purple-700";
    case "department": return "bg-green-100 text-green-700";
    default:           return "bg-gray-100 text-gray-700";
  }
};

// ─── Event category icon ──────────────────────────────────────────────────────
export const getEventCategoryIcon = (title) => {
  const t = title?.toLowerCase() || "";
  if (t.includes("tech")   || t.includes("code"))    return <Code     className="w-5 h-5" />;
  if (t.includes("music")  || t.includes("concert")) return <Music    className="w-5 h-5" />;
  if (t.includes("photo")  || t.includes("camera"))  return <Camera   className="w-5 h-5" />;
  if (t.includes("sport")  || t.includes("game"))    return <Trophy   className="w-5 h-5" />;
  if (t.includes("art")    || t.includes("creative"))return <Heart    className="w-5 h-5" />;
  if (t.includes("workshop")|| t.includes("learn"))  return <BookOpen className="w-5 h-5" />;
  if (t.includes("social") || t.includes("meet"))    return <Coffee   className="w-5 h-5" />;
  return <Sparkles className="w-5 h-5" />;
};

// ─── Date / time formatters ───────────────────────────────────────────────────
export const formatDateTime = (s) => {
  if (!s) return "N/A";
  const d = new Date(s);
  if (isNaN(d.getTime())) return "N/A";
  return d.toLocaleString("en-US", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
};

export const formatDateOnly = (s) => {
  if (!s) return "N/A";
  const d = new Date(s);
  if (isNaN(d.getTime())) return "N/A";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

export const getDaysUntil = (date) =>
  Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));

// ─── Visibility helper ────────────────────────────────────────────────────────
export const isEventVisibleToUser = (event, currentDeptId, currentUserClubs, currentUserPrn, currentIsTeacher) => {
  const targetType = event.targetType?.toUpperCase();
  if (targetType === "GLOBAL") return true;
  if (targetType === "DEPARTMENT") {
    return currentDeptId != null && event.targetIds?.map(Number).includes(Number(currentDeptId));
  }
  if (targetType === "CLUB") {
    const myClubIds = currentUserClubs.map((c) => Number(c.clubId));
    return event.targetIds?.map(Number).some((id) => myClubIds.includes(id));
  }
  if (currentIsTeacher && event.creatorPrn === currentUserPrn) return true;
  return false;
};

// ─── Shared CSS (inject once via a <style> tag in each component) ─────────────
export const sharedStyles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0);    }
  }
  @keyframes blob {
    0%   { transform: translate(0, 0) scale(1);          }
    33%  { transform: translate(30px, -50px) scale(1.1); }
    66%  { transform: translate(-20px, 20px) scale(0.9); }
    100% { transform: translate(0, 0) scale(1);          }
  }
  .animate-blob { animation: blob 7s infinite; }
  .animation-delay-2000 { animation-delay: 2s; }
  .animation-delay-4000 { animation-delay: 4s; }
  .event-card-container { perspective: 1000px; height: 280px; }
  .event-card {
    transform-style: preserve-3d;
    transition: transform 0.5s ease-in-out;
    width: 100%; height: 100%; position: relative;
  }
  .event-card-container:hover .event-card { transform: rotateY(180deg); }
  .card-face {
    position: absolute; width: 100%; height: 100%;
    backface-visibility: hidden; border-radius: 0.75rem; overflow: hidden;
  }
  .card-front { transform: rotateY(0deg);   }
  .card-back  { transform: rotateY(180deg); }
  .custom-scrollbar::-webkit-scrollbar        { width: 2px; }
  .custom-scrollbar::-webkit-scrollbar-track  { background: rgba(255,255,255,0.1); border-radius: 10px; }
  .custom-scrollbar::-webkit-scrollbar-thumb  { background: rgba(255,255,255,0.3); border-radius: 10px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.5); }
  .line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
  .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
`;