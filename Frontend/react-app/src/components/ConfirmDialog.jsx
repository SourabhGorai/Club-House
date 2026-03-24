import React from "react";
import { AlertTriangle, CheckCircle, X } from "lucide-react";
import ThemedScrollbarStyles from "./ThemedScrollbarStyles";

/**
 * Reusable confirmation dialog that matches the app's design system.
 *
 * Props:
 *  isOpen       {boolean}  – controls visibility
 *  title        {string}   – dialog heading
 *  message      {string}   – body text
 *  confirmText  {string}   – confirm button label  (default "Confirm")
 *  cancelText   {string}   – cancel button label   (default "Cancel")
 *  variant      {string}   – "primary" (teal) | "danger" (red)   (default "primary")
 *  onConfirm    {function} – called when user clicks confirm
 *  onCancel     {function} – called when user clicks cancel or backdrop
 */
const ConfirmDialog = ({
  isOpen,
  isDarkMode = false,
  title = "Are you sure?",
  message = "",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "primary",
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const isDanger = variant === "danger";

  // Dark mode aware colors
  const bgColor = isDarkMode ? "#343541" : "#ffffff";
  const textPrimary = isDarkMode ? "#ECECF1" : "#1e293b";
  const textSecondary = isDarkMode ? "#9CA3AF" : "#6b7280";
  const borderColor = isDarkMode ? "border-[#4b5563]" : "border-gray-200";
  const buttonHoverBg = isDarkMode ? "hover:bg-[#414854]" : "hover:bg-gray-50";
  const closeButtonColor = isDarkMode ? "text-[#9CA3AF] hover:text-[#ECECF1]" : "text-gray-400 hover:text-gray-600";
  
  // Icon backgrounds - danger or primary, adjusted for dark mode
  const iconBgDark = isDanger ? "bg-red-900 bg-opacity-30" : "bg-purple-900 bg-opacity-30";
  const iconBgLight = isDanger ? "bg-red-100" : "bg-teal-100";
  const iconBg = isDarkMode ? iconBgDark : iconBgLight;
  
  const iconColor = isDanger ? "text-red-500" : isDarkMode ? "text-[#D946EF]" : "text-[#4CA1AF]";
  
  const confirmGradient = isDanger
    ? "from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700"
    : isDarkMode
    ? "from-[#D946EF] to-[#a21caf] hover:from-[#ec4899] hover:to-[#be185d]"
    : "from-[#4CA1AF] to-[#2C3E50] hover:from-[#3d8a9c] hover:to-[#1f2f3f]";

  return (
    <>
      <ThemedScrollbarStyles isDarkMode={isDarkMode} className="theme-scrollbar" includePageScrollbar={false} />
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", backdropFilter: "blur(4px)" }}
        onClick={onCancel}
      >
        {/* Card – stop click bubbling so backdrop click doesn't also fire from card */}
        <div
          className="relative rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-[dialogIn_0.2s_ease-out]"
          style={{ backgroundColor: bgColor }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onCancel}
            className={`absolute top-4 right-4 transition-colors ${closeButtonColor}`}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon */}
          <div className={`mx-auto mb-4 w-14 h-14 rounded-full flex items-center justify-center ${iconBg}`}>
            {isDanger ? (
              <AlertTriangle className={`w-7 h-7 ${iconColor}`} />
            ) : (
              <CheckCircle className={`w-7 h-7 ${iconColor}`} />
            )}
          </div>

          {/* Text */}
          <h3 className="text-lg font-bold text-center mb-2" style={{ color: textPrimary }}>{title}</h3>
          {message && (
            <p className="text-sm text-center mb-6 leading-relaxed" style={{ color: textSecondary }}>{message}</p>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className={`flex-1 py-2.5 px-4 rounded-xl ${borderColor} font-medium text-sm transition-colors ${buttonHoverBg}`}
              style={{ color: textSecondary, borderColor: isDarkMode ? "#4b5563" : undefined }}
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 py-2.5 px-4 rounded-xl text-white font-medium text-sm bg-gradient-to-r ${confirmGradient} transition-all shadow-md hover:shadow-lg`}
            >
              {confirmText}
            </button>
          </div>
        </div>

        <style>{`
          @keyframes dialogIn {
            from { opacity: 0; transform: scale(0.92) translateY(8px); }
            to   { opacity: 1; transform: scale(1)    translateY(0);   }
          }
        `}</style>
      </div>
    </>
  );
};

export default ConfirmDialog;
