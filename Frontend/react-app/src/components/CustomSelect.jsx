import { useState, useEffect, useRef } from "react";

/**
 * CustomSelect - A reusable styled dropdown component
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
 *
 * Usage:
 * <CustomSelect
 *   name="clubId"
 *   value={form.clubId}
 *   onChange={handleChange}
 *   placeholder="Select a Club"
 *   options={clubs.map((c) => ({ value: c.clubId, label: c.clubName }))}
 * />
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
  const ref = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find((o) => String(o.value) === String(value));

  const handleSelect = (optValue) => {
    onChange({ target: { name, value: optValue } });
    setOpen(false);
  };

  return (
    <>
      {/* Inject keyframe animation once */}
      <style>{`
        @keyframes customSelectFadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .custom-select-fade-in {
          animation: customSelectFadeIn 0.15s ease-out;
        }
      `}</style>

      <div ref={ref} className={`relative w-full ${className}`}>
        {/* Trigger button */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setOpen((prev) => !prev)}
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
            className={`w-4 h-4 flex-shrink-0 ml-2 text-gray-400 transition-transform duration-200 ${
              open ? "rotate-180 text-[#4CA1AF]" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown list */}
        {open && (
          <div className="absolute z-50 mt-1.5 w-full bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden custom-select-fade-in">
            <div className="max-h-52 overflow-y-auto py-1.5 px-1.5 space-y-0.5">
              {options.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-3">No options available</p>
              ) : (
                options.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`
                      w-full text-left px-3.5 py-2.5 rounded-xl text-sm
                      transition-all duration-150 font-medium cursor-pointer
                      ${
                        String(value) === String(opt.value)
                          ? "bg-[#4CA1AF]/10 text-[#4CA1AF]"
                          : "text-gray-700 hover:bg-gray-50 hover:text-[#4CA1AF]"
                      }
                    `}
                  >
                    {opt.label}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}