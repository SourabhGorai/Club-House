import {Users,CalendarRange,Calendar} from 'lucide-react';
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmDialog from "../../components/ConfirmDialog";


export default function ClubAdminDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: "", message: "", variant: "primary", confirmText: "Confirm", onConfirm: () => {} });
  const closeConfirm = () => setConfirmDialog((prev) => ({ ...prev, isOpen: false }));

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <>
    <div className="min-h-screen bg-green-50 p-2 sm:p-3 md:p-4 lg:p-6 safe-area-top safe-area-bottom">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 md:mb-8 gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-4xl font-bold text-green-600">Club Admin Dashboard 🎯</h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Club management and member coordination</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 w-full sm:w-auto flex-wrap">
            <span className="bg-green-100 text-green-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
              CLUB_ADMIN
            </span>
            <button
              onClick={() => setConfirmDialog({ isOpen: true, title: "Sign Out", message: "Are you sure you want to sign out?", confirmText: "Sign Out", variant: "danger", onConfirm: () => { closeConfirm(); handleLogout(); } })}
              className="bg-red-500 cursor-pointer hover:bg-red-600 text-white px-3 sm:px-4 py-2 rounded-lg transition duration-300 text-xs sm:text-sm whitespace-nowrap"
            >
              Logout
            </button>
          </div>
        </div>

         {/* Welcome Message */}
          <div className="bg-white my-3 sm:my-4 md:my-6 rounded-lg sm:rounded-xl shadow-md sm:shadow-lg p-3 sm:p-4 md:p-6">
            <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-2 sm:mb-3 md:mb-4 text-gray-800">
              Welcome back, {user?.username}!
            </h3>
            <p className="text-gray-600 mb-2 sm:mb-3 md:mb-4 text-xs sm:text-sm">
              this is random again ignore change krna hai You have 2 new notifications and 1 upcoming assignment. 
              Continue your learning journey with us!
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 sm:p-3 md:p-4">
              <p className="text-yellow-800 text-xs sm:text-sm">
                <i className="fas fa-bell mr-2"></i>
                <strong>Reminder:</strong> nonsence Complete the JavaScript fundamentals course by Friday.
              </p>
            </div>
          </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
          {/* Club Members */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-md sm:shadow-lg p-3 sm:p-4 md:p-6">
            <div className="flex items-center mb-3 sm:mb-4">
              <div className="bg-green-100 p-2 sm:p-3 rounded-lg mr-2 sm:mr-3 md:mr-4">
                <Users className="w-5 sm:w-6 h-5 sm:h-6 text-green-800" />
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-semibold text-green-800">Club Members</h3>
            </div>
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-600 mb-2">45</p>
            <p className="text-gray-600 text-xs sm:text-sm">Active members</p>
          </div>

          {/* Events */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-md sm:shadow-lg p-3 sm:p-4 md:p-6">
            <div className="flex items-center mb-3 sm:mb-4">
              <div className="bg-blue-100 p-2 sm:p-3 rounded-lg mr-2 sm:mr-3 md:mr-4">
               <Calendar className="w-5 sm:w-6 h-5 sm:h-6 text-blue-600" /> 
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-semibold text-blue-800">Upcoming Events</h3>
            </div>
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-600 mb-2">3</p>
            <p className="text-gray-600 text-xs sm:text-sm">This week</p>
          </div>

          {/* Previous Events */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-md sm:shadow-lg p-3 sm:p-4 md:p-6">
            <div className="flex items-center mb-3 sm:mb-4">
              <div className="bg-purple-100 p-2 sm:p-3 rounded-lg mr-2 sm:mr-3 md:mr-4">
                <CalendarRange className="w-5 sm:w-6 h-5 sm:h-6 text-purple-800" />
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-semibold text-purple-800">All Previous Events</h3>
            </div>
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-600 mb-2"></p>
            <p className="text-gray-600 text-xs sm:text-sm"></p>
          </div>

          {/* Club Management */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-md sm:shadow-lg p-3 sm:p-4 md:p-6 sm:col-span-2 lg:col-span-3">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 text-gray-800">Club Management</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                 <button 
                  onClick={() => navigate("/add-users-with-club")}
                  className="bg-green-500 cursor-pointer hover:bg-green-600 text-white py-2 sm:py-3 rounded-lg transition duration-300 text-xs sm:text-sm">
                Add Members
              </button>
               <button 
                  onClick={() => navigate("/remove-users-from-club")}
                  className="bg-green-500 cursor-pointer hover:bg-green-600 text-white py-2 sm:py-3 rounded-lg transition duration-300 text-xs sm:text-sm">
                Remove Members
              </button>
              <button 
                  onClick={() => navigate("/events")}
                  className="bg-blue-500 cursor-pointer hover:bg-blue-600 text-white py-2 sm:py-3 rounded-lg transition duration-300 text-xs sm:text-sm">
                Schedule Event
              </button>
              <button className="bg-purple-500 hover:bg-purple-600 text-white py-2 sm:py-3 rounded-lg transition duration-300 text-xs sm:text-sm">
                Create Notification/Alert
              </button>
              <button className="bg-orange-500 cursor-pointer hover:bg-orange-600 text-white py-2 sm:py-3 rounded-lg transition duration-300 text-xs sm:text-sm">
                Club Settings
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-md sm:shadow-lg p-3 sm:p-4 md:p-6 sm:col-span-2 lg:col-span-3">
            <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-3 sm:mb-4 text-gray-800">all nonsense Recent Club Activity</h3>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-2 sm:p-3 bg-gray-50 rounded-lg gap-2">
                <span className="text-xs sm:text-sm">New member registration - John Doe</span>
                <span className="text-xs text-gray-500 whitespace-nowrap">2 hours ago</span>
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-2 sm:p-3 bg-gray-50 rounded-lg gap-2">
                <span className="text-xs sm:text-sm">Weekly meeting scheduled</span>
                <span className="text-xs text-gray-500 whitespace-nowrap">1 day ago</span>
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-2 sm:p-3 bg-gray-50 rounded-lg gap-2">
                <span className="text-xs sm:text-sm">Budget approved for new equipment</span>
                <span className="text-xs text-gray-500 whitespace-nowrap">2 days ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ConfirmDialog
      isOpen={confirmDialog.isOpen}
      isDarkMode={false}
      title={confirmDialog.title}
      message={confirmDialog.message}
      confirmText={confirmDialog.confirmText}
      variant={confirmDialog.variant}
      onConfirm={confirmDialog.onConfirm}
      onCancel={closeConfirm}
    />
    </>
  );
}

// import { Users, CalendarRange, Calendar, Moon, Sun } from 'lucide-react';
// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import ConfirmDialog from "../../components/ConfirmDialog";

// // ─── THEME CONFIGURATION ─────────────────────────────────────────────────────
// const LIGHT_PRIMARY_COLOR = "#4CA1AF";
// const LIGHT_PRIMARY_DARK = "#2d8391";
// const LIGHT_PRIMARY_LIGHT = "rgba(76, 161, 175, 0.1)";
// const LIGHT_PRIMARY_GRADIENT = "linear-gradient(135deg, #4CA1AF 0%, #2c7a8a 100%)";

// const LIGHT_BG_MAIN = "#f5faff";
// const LIGHT_BG_GRADIENT = "linear-gradient(135deg, #f5faff 0%, #f0f8ff 100%)";
// const LIGHT_BG_CARD = "#ffffff";
// const LIGHT_BORDER_COLOR = "#e9f0f9";
// const LIGHT_BORDER_COLOR_HOVER = "#d9e6f5";
// const LIGHT_TEXT_PRIMARY = "#1e293b";
// const LIGHT_TEXT_SECONDARY = "#475569";
// const LIGHT_TEXT_MUTED = "#64748b";
// const LIGHT_ACCENT_SOFT = "#f8fcff";

// // Dark mode colors - ChatGPT style
// const DARK_PRIMARY_COLOR = "#10A37F";
// const DARK_PRIMARY_DARK = "#0E8C6D";
// const DARK_PRIMARY_LIGHT = "rgba(16, 163, 127, 0.15)";
// const DARK_PRIMARY_GRADIENT = "linear-gradient(135deg, #10A37F 0%, #0E8C6D 100%)";

// const DARK_BG_MAIN = "#343541";
// const DARK_BG_GRADIENT = "linear-gradient(135deg, #343541 0%, #2A2B36 100%)";
// const DARK_BG_CARD = "#444654";
// const DARK_BORDER_COLOR = "#4D4F5E";
// const DARK_BORDER_COLOR_HOVER = "#5E5F70";
// const DARK_TEXT_PRIMARY = "#ECECF1";
// const DARK_TEXT_SECONDARY = "#C5C5D2";
// const DARK_TEXT_MUTED = "#9B9CA9";
// const DARK_ACCENT_SOFT = "rgba(255, 255, 255, 0.05)";

// export default function ClubAdminDashboard() {
//   const navigate = useNavigate();
//   const user = JSON.parse(localStorage.getItem("user"));

//   // ── Theme state ───────────────────────────────────────────────────────────
//   const [isDarkMode, setIsDarkMode] = useState(() =>
//     localStorage.getItem("clubAdminDashboardTheme") === "dark"
//   );

//   // Get current theme colors
//   const theme = {
//     primaryColor: isDarkMode ? DARK_PRIMARY_COLOR : LIGHT_PRIMARY_COLOR,
//     primaryDark: isDarkMode ? DARK_PRIMARY_DARK : LIGHT_PRIMARY_DARK,
//     primaryLight: isDarkMode ? DARK_PRIMARY_LIGHT : LIGHT_PRIMARY_LIGHT,
//     primaryGradient: isDarkMode ? DARK_PRIMARY_GRADIENT : LIGHT_PRIMARY_GRADIENT,
//     bgMain: isDarkMode ? DARK_BG_MAIN : LIGHT_BG_MAIN,
//     bgGradient: isDarkMode ? DARK_BG_GRADIENT : LIGHT_BG_GRADIENT,
//     bgCard: isDarkMode ? DARK_BG_CARD : LIGHT_BG_CARD,
//     borderColor: isDarkMode ? DARK_BORDER_COLOR : LIGHT_BORDER_COLOR,
//     borderColorHover: isDarkMode ? DARK_BORDER_COLOR_HOVER : LIGHT_BORDER_COLOR_HOVER,
//     textPrimary: isDarkMode ? DARK_TEXT_PRIMARY : LIGHT_TEXT_PRIMARY,
//     textSecondary: isDarkMode ? DARK_TEXT_SECONDARY : LIGHT_TEXT_SECONDARY,
//     textMuted: isDarkMode ? DARK_TEXT_MUTED : LIGHT_TEXT_MUTED,
//     accentSoft: isDarkMode ? DARK_ACCENT_SOFT : LIGHT_ACCENT_SOFT,
//     isDarkMode: isDarkMode,
//   };

//   // Save theme preference to localStorage
//   useEffect(() => {
//     localStorage.setItem("clubAdminDashboardTheme", isDarkMode ? "dark" : "light");
//   }, [isDarkMode]);

//   const [confirmDialog, setConfirmDialog] = useState({ 
//     isOpen: false, 
//     title: "", 
//     message: "", 
//     variant: "primary", 
//     confirmText: "Confirm", 
//     onConfirm: () => {} 
//   });
  
//   const closeConfirm = () => setConfirmDialog((prev) => ({ ...prev, isOpen: false }));

//   const handleLogout = () => {
//     localStorage.removeItem("user");
//     localStorage.removeItem("token");
//     window.location.href = "/login";
//   };

//   return (
//     <>
//       <div 
//         className="min-h-screen p-2 sm:p-3 md:p-4 lg:p-6 safe-area-top safe-area-bottom transition-colors duration-300"
//         style={{ background: theme.bgGradient }}
//       >
//         {/* Animated background - only show in light mode */}
//         {!isDarkMode && (
//           <div className="fixed inset-0 overflow-hidden pointer-events-none">
//             <div className="absolute top-20 left-10 w-64 h-64 bg-white/40 rounded-full blur-3xl"></div>
//             <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/40 rounded-full blur-3xl"></div>
//           </div>
//         )}

//         <div className="max-w-7xl mx-auto relative z-10">
//           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 md:mb-8 gap-3 sm:gap-4">
//             <div>
//               <h1 className="text-xl sm:text-2xl md:text-4xl font-bold" style={{ color: theme.primaryColor }}>
//                 Club Admin Dashboard 🎯
//               </h1>
//               <p className="text-xs sm:text-sm mt-1" style={{ color: theme.textSecondary }}>
//                 Club management and member coordination
//               </p>
//             </div>
//             <div className="flex items-center gap-2 sm:gap-3 md:gap-4 w-full sm:w-auto flex-wrap">
//               <span 
//                 className="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium"
//                 style={{ 
//                   background: theme.primaryLight, 
//                   color: theme.primaryColor 
//                 }}
//               >
//                 CLUB_ADMIN
//               </span>
              
//               {/* Theme Toggle */}
//               <button
//                 onClick={() => setIsDarkMode((prev) => !prev)}
//                 className="p-2 rounded-xl transition-colors cursor-pointer"
//                 style={{ background: theme.accentSoft, color: theme.textSecondary }}
//                 title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
//               >
//                 {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
//               </button>

//               <button
//                 onClick={() => setConfirmDialog({ 
//                   isOpen: true, 
//                   title: "Sign Out", 
//                   message: "Are you sure you want to sign out?", 
//                   confirmText: "Sign Out", 
//                   variant: "danger", 
//                   onConfirm: () => { closeConfirm(); handleLogout(); } 
//                 })}
//                 className="cursor-pointer text-white px-3 sm:px-4 py-2 rounded-lg transition duration-300 text-xs sm:text-sm whitespace-nowrap"
//                 style={{ background: 'linear-gradient(135deg, #ef4444, #b91c1c)' }}
//               >
//                 Logout
//               </button>
//             </div>
//           </div>

//           {/* Welcome Message */}
//           <div 
//             className="my-3 sm:my-4 md:my-6 rounded-lg sm:rounded-xl shadow-md sm:shadow-lg p-3 sm:p-4 md:p-6 transition-colors duration-300"
//             style={{ 
//               background: theme.bgCard, 
//               border: `1px solid ${theme.borderColor}`,
//               boxShadow: isDarkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
//             }}
//           >
//             <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-2 sm:mb-3 md:mb-4" style={{ color: theme.textPrimary }}>
//               Welcome back, {user?.username}!
//             </h3>
//             <p className="mb-2 sm:mb-3 md:mb-4 text-xs sm:text-sm" style={{ color: theme.textSecondary }}>
//               this is random again ignore change krna hai You have 2 new notifications and 1 upcoming assignment. 
//               Continue your learning journey with us!
//             </p>
//             <div 
//               className="border rounded-lg p-2 sm:p-3 md:p-4"
//               style={{ 
//                 background: isDarkMode ? 'rgba(245, 158, 11, 0.1)' : '#fef9c3',
//                 borderColor: isDarkMode ? 'rgba(245, 158, 11, 0.2)' : '#fde047'
//               }}
//             >
//               <p className="text-xs sm:text-sm" style={{ color: isDarkMode ? '#FBBF24' : '#92400e' }}>
//                 <i className="fas fa-bell mr-2"></i>
//                 <strong>Reminder:</strong> nonsence Complete the JavaScript fundamentals course by Friday.
//               </p>
//             </div>
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
//             {/* Club Members */}
//             <div 
//               className="rounded-lg sm:rounded-xl shadow-md sm:shadow-lg p-3 sm:p-4 md:p-6 transition-colors duration-300"
//               style={{ 
//                 background: theme.bgCard, 
//                 border: `1px solid ${theme.borderColor}`,
//                 boxShadow: isDarkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
//               }}
//             >
//               <div className="flex items-center mb-3 sm:mb-4">
//                 <div className="p-2 sm:p-3 rounded-lg mr-2 sm:mr-3 md:mr-4" style={{ background: isDarkMode ? 'rgba(16, 163, 127, 0.2)' : '#dcfce7' }}>
//                   <Users className="w-5 sm:w-6 h-5 sm:h-6" style={{ color: theme.primaryColor }} />
//                 </div>
//                 <h3 className="text-base sm:text-lg md:text-xl font-semibold" style={{ color: theme.textPrimary }}>Club Members</h3>
//               </div>
//               <p className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2" style={{ color: theme.primaryColor }}>45</p>
//               <p className="text-xs sm:text-sm" style={{ color: theme.textMuted }}>Active members</p>
//             </div>

//             {/* Events */}
//             <div 
//               className="rounded-lg sm:rounded-xl shadow-md sm:shadow-lg p-3 sm:p-4 md:p-6 transition-colors duration-300"
//               style={{ 
//                 background: theme.bgCard, 
//                 border: `1px solid ${theme.borderColor}`,
//                 boxShadow: isDarkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
//               }}
//             >
//               <div className="flex items-center mb-3 sm:mb-4">
//                 <div className="p-2 sm:p-3 rounded-lg mr-2 sm:mr-3 md:mr-4" style={{ background: isDarkMode ? 'rgba(59, 130, 246, 0.2)' : '#dbeafe' }}>
//                   <Calendar className="w-5 sm:w-6 h-5 sm:h-6" style={{ color: isDarkMode ? '#60A5FA' : '#2563eb' }} />
//                 </div>
//                 <h3 className="text-base sm:text-lg md:text-xl font-semibold" style={{ color: theme.textPrimary }}>Upcoming Events</h3>
//               </div>
//               <p className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2" style={{ color: isDarkMode ? '#60A5FA' : '#2563eb' }}>3</p>
//               <p className="text-xs sm:text-sm" style={{ color: theme.textMuted }}>This week</p>
//             </div>

//             {/* Previous Events */}
//             <div 
//               className="rounded-lg sm:rounded-xl shadow-md sm:shadow-lg p-3 sm:p-4 md:p-6 transition-colors duration-300"
//               style={{ 
//                 background: theme.bgCard, 
//                 border: `1px solid ${theme.borderColor}`,
//                 boxShadow: isDarkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
//               }}
//             >
//               <div className="flex items-center mb-3 sm:mb-4">
//                 <div className="p-2 sm:p-3 rounded-lg mr-2 sm:mr-3 md:mr-4" style={{ background: isDarkMode ? 'rgba(139, 92, 246, 0.2)' : '#ede9fe' }}>
//                   <CalendarRange className="w-5 sm:w-6 h-5 sm:h-6" style={{ color: isDarkMode ? '#C084FC' : '#7c3aed' }} />
//                 </div>
//                 <h3 className="text-base sm:text-lg md:text-xl font-semibold" style={{ color: theme.textPrimary }}>All Previous Events</h3>
//               </div>
//               <p className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2" style={{ color: isDarkMode ? '#C084FC' : '#7c3aed' }}>12</p>
//               <p className="text-xs sm:text-sm" style={{ color: theme.textMuted }}>Total events conducted</p>
//             </div>

//             {/* Club Management */}
//             <div 
//               className="rounded-lg sm:rounded-xl shadow-md sm:shadow-lg p-3 sm:p-4 md:p-6 sm:col-span-2 lg:col-span-3 transition-colors duration-300"
//               style={{ 
//                 background: theme.bgCard, 
//                 border: `1px solid ${theme.borderColor}`,
//                 boxShadow: isDarkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
//               }}
//             >
//               <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4" style={{ color: theme.textPrimary }}>Club Management</h3>
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
//                 <button 
//                   onClick={() => navigate("/add-users-with-club")}
//                   className="cursor-pointer text-white py-2 sm:py-3 rounded-lg transition duration-300 text-xs sm:text-sm hover:opacity-90"
//                   style={{ background: theme.primaryGradient }}
//                 >
//                   Add Members
//                 </button>
//                 <button 
//                   onClick={() => navigate("/remove-users-from-club")}
//                   className="cursor-pointer text-white py-2 sm:py-3 rounded-lg transition duration-300 text-xs sm:text-sm hover:opacity-90"
//                   style={{ background: theme.primaryGradient }}
//                 >
//                   Remove Members
//                 </button>
//                 <button 
//                   onClick={() => navigate("/events")}
//                   className="cursor-pointer text-white py-2 sm:py-3 rounded-lg transition duration-300 text-xs sm:text-sm hover:opacity-90"
//                   style={{ background: isDarkMode ? '#3B82F6' : '#2563eb' }}
//                 >
//                   Schedule Event
//                 </button>
//                 <button 
//                   className="cursor-pointer text-white py-2 sm:py-3 rounded-lg transition duration-300 text-xs sm:text-sm hover:opacity-90"
//                   style={{ background: isDarkMode ? '#8B5CF6' : '#7c3aed' }}
//                 >
//                   Create Notification/Alert
//                 </button>
//                 <button 
//                   className="cursor-pointer text-white py-2 sm:py-3 rounded-lg transition duration-300 text-xs sm:text-sm hover:opacity-90"
//                   style={{ background: isDarkMode ? '#F97316' : '#ea580c' }}
//                 >
//                   Club Settings
//                 </button>
//               </div>
//             </div>

//             {/* Recent Activity */}
//             <div 
//               className="rounded-lg sm:rounded-xl shadow-md sm:shadow-lg p-3 sm:p-4 md:p-6 sm:col-span-2 lg:col-span-3 transition-colors duration-300"
//               style={{ 
//                 background: theme.bgCard, 
//                 border: `1px solid ${theme.borderColor}`,
//                 boxShadow: isDarkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
//               }}
//             >
//               <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-3 sm:mb-4" style={{ color: theme.textPrimary }}>
//                 all nonsense Recent Club Activity
//               </h3>
//               <div className="space-y-2 sm:space-y-3">
//                 <div 
//                   className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-2 sm:p-3 rounded-lg gap-2"
//                   style={{ background: theme.accentSoft }}
//                 >
//                   <span className="text-xs sm:text-sm" style={{ color: theme.textPrimary }}>New member registration - John Doe</span>
//                   <span className="text-xs whitespace-nowrap" style={{ color: theme.textMuted }}>2 hours ago</span>
//                 </div>
//                 <div 
//                   className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-2 sm:p-3 rounded-lg gap-2"
//                   style={{ background: theme.accentSoft }}
//                 >
//                   <span className="text-xs sm:text-sm" style={{ color: theme.textPrimary }}>Weekly meeting scheduled</span>
//                   <span className="text-xs whitespace-nowrap" style={{ color: theme.textMuted }}>1 day ago</span>
//                 </div>
//                 <div 
//                   className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-2 sm:p-3 rounded-lg gap-2"
//                   style={{ background: theme.accentSoft }}
//                 >
//                   <span className="text-xs sm:text-sm" style={{ color: theme.textPrimary }}>Budget approved for new equipment</span>
//                   <span className="text-xs whitespace-nowrap" style={{ color: theme.textMuted }}>2 days ago</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <ConfirmDialog
//         isOpen={confirmDialog.isOpen}
//         title={confirmDialog.title}
//         message={confirmDialog.message}
//         confirmText={confirmDialog.confirmText}
//         variant={confirmDialog.variant}
//         onConfirm={confirmDialog.onConfirm}
//         onCancel={closeConfirm}
//         theme={theme}
//       />
//     </>
//   );
// }