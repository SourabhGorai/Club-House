import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

/**
 * CustomSelect - A reusable styled dropdown component
 *
 * Uses a fixed-position portal for the dropdown so it always renders on top,
 * even when ancestor elements create new stacking contexts (e.g. CSS transforms,
 * perspective, will-change, opacity < 1) — which is the case with flip cards.
 *
 * Props:
 * @param {string}   name        - Field name (used in onChange event)
 * @param {string}   value       - Currently selected value
 * @param {function} onChange    - Change handler — receives a synthetic { target: { name, value } } event
 * @param {Array}    options     - Array of { value, label } objects
 * @param {string}   placeholder - Placeholder text shown when nothing is selected
 * @param {boolean}  disabled    - Disables the dropdown when true
 * @param {boolean}  required    - Marks the field as required (for form validation)
 * @param {string}   className   - Optional extra classes for the wrapper div
 */
export default function CustomSelect({
  name,
  value,
  onChange,
  options = [],
  placeholder = "Select an option",
  disabled = false,
  required = false,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState({});
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);

  // ── Position the portal dropdown to align with the trigger button ──
  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const dropdownHeight = 220; // approx max-h
    const spaceBelow = viewportHeight - rect.bottom;
    const openUpward = spaceBelow < dropdownHeight && rect.top > dropdownHeight;

    setDropdownStyle({
      position: "fixed",
      left: rect.left,
      width: rect.width,
      zIndex: 99999,
      ...(openUpward
        ? { bottom: viewportHeight - rect.top + 4 }
        : { top: rect.bottom + 4 }),
    });
  };

  // Recalculate position whenever dropdown opens or window scrolls/resizes
  useEffect(() => {
    if (open) {
      updatePosition();
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);
    }
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const selected = options.find((o) => String(o.value) === String(value));

  const handleSelect = (optValue) => {
    onChange({ target: { name, value: optValue } });
    setOpen(false);
  };

  const dropdown = open ? (
    <div
      ref={dropdownRef}
      style={dropdownStyle}
      className="bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden"
    >
      <style>{`
        @keyframes customSelectFadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .custom-select-fade-in { animation: customSelectFadeIn 0.15s ease-out; }
      `}</style>
      <div className="max-h-52 overflow-y-auto py-1.5 px-1.5 space-y-0.5 custom-select-fade-in">
        {options.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-3">No options available</p>
        ) : (
          options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onMouseDown={(e) => e.preventDefault()} // prevent blur before click
              onClick={() => handleSelect(opt.value)}
              className={`
                w-full text-left px-3.5 py-2.5 rounded-xl text-sm
                transition-all duration-150 font-medium cursor-pointer
                ${String(value) === String(opt.value)
                  ? "bg-[#4CA1AF]/10 text-[#4CA1AF]"
                  : "text-gray-700 hover:bg-gray-50 hover:text-[#4CA1AF]"}
              `}
            >
              {opt.label}
            </button>
          ))
        )}
      </div>
    </div>
  ) : null;

  return (
    <div ref={triggerRef} className={`relative w-full ${className}`}>
      {/* Trigger button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            if (!open) updatePosition();
            setOpen((prev) => !prev);
          }
        }}
        className={`
          w-full flex items-center justify-between px-4 py-3
          border border-gray-200 rounded-xl bg-white/50
          text-sm md:text-base transition-all duration-200
          ${open ? "border-[#4CA1AF] ring-2 ring-[#4CA1AF]/20" : "hover:border-[#4CA1AF]/50"}
          ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
          ${selected ? "text-gray-800 font-medium" : "text-gray-400"}
        `}
      >
        <span className="truncate">{selected ? selected.label : placeholder}</span>
        <svg
          className={`w-4 h-4 flex-shrink-0 ml-2 text-gray-400 transition-transform duration-200 ${open ? "rotate-180 text-[#4CA1AF]" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Portal: renders outside all stacking contexts, directly on <body> */}
      {typeof document !== "undefined" && createPortal(dropdown, document.body)}
    </div>
  );
}