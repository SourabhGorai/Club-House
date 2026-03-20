// import React, { useState, useRef, useEffect, useCallback } from "react";
// import { createPortal } from "react-dom";
// import { Calendar, Clock, ChevronLeft, ChevronRight, X } from "lucide-react";

// // ── tiny helpers ────────────────────────────────────────────────────────────
// const pad = (n) => String(n).padStart(2, "0");
// const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
// const MONTHS = [
//   "January","February","March","April","May","June",
//   "July","August","September","October","November","December",
// ];

// const parseValue = (v) => {
//   if (!v || typeof v !== "string") return null;
//   const [datePart, timePart] = v.split("T");
//   if (!datePart || !timePart) return null;
//   const [year, month, day] = datePart.split("-").map(Number);
//   const [hour, minute]     = timePart.split(":").map(Number);
//   if ([year, month, day, hour, minute].some((x) => Number.isNaN(x))) return null;
//   return { year, month, day, hour, minute };
// };

// const buildValue = ({ year, month, day, hour, minute }) =>
//   `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}`;

// const daysInMonth  = (year, month) => new Date(year, month, 0).getDate();
// const firstWeekday = (year, month) => new Date(year, month - 1, 1).getDay();

// const GRAD = "linear-gradient(135deg, #4CA1AF, #2C3E50)";

// // ════════════════════════════════════════════════════════════════════════════
// const DateTimePicker = ({
//   value       = "",
//   onChange,
//   label       = "",
//   placeholder = "Select date & time",
//   disabled    = false,
//   required    = false,
//   minValue    = "",
//   maxValue    = "",
//   className   = "",
// }) => {
//   const parsed    = parseValue(value);
//   const minParsed = parseValue(minValue);
//   const maxParsed = parseValue(maxValue);

//   const [open, setOpen]         = useState(false);
//   const [view, setView]         = useState("calendar");
//   const [navYear, setNavYear]   = useState(() => parsed?.year  ?? new Date().getFullYear());
//   const [navMonth, setNavMonth] = useState(() => parsed?.month ?? new Date().getMonth() + 1);
//   const [pending, setPending]   = useState(parsed);

//   const rootRef    = useRef(null);
//   const popoverRef = useRef(null);
//   const triggerRef = useRef(null);
//   const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });

//   useEffect(() => {
//     const p = parseValue(value);
//     setPending(p);
//     if (p) { setNavYear(p.year); setNavMonth(p.month); }
//   }, [value]);

//   useEffect(() => {
//     if (!open) return;
//     const handler = (e) => {
//       const insideRoot    = rootRef.current    && rootRef.current.contains(e.target);
//       const insidePopover = popoverRef.current && popoverRef.current.contains(e.target);
//       if (!insideRoot && !insidePopover) { setOpen(false); setView("calendar"); }
//     };
//     document.addEventListener("mousedown", handler);
//     return () => document.removeEventListener("mousedown", handler);
//   }, [open]);

//   const isDateDisabled = useCallback((y, m, d) => {
//     const ts = new Date(y, m - 1, d).getTime();
//     if (minParsed) {
//       const minTs = new Date(minParsed.year, minParsed.month - 1, minParsed.day).getTime();
//       if (ts < minTs) return true;
//     }
//     if (maxParsed) {
//       const maxTs = new Date(maxParsed.year, maxParsed.month - 1, maxParsed.day).getTime();
//       if (ts > maxTs) return true;
//     }
//     return false;
//   }, [minParsed, maxParsed]);

//   const isToday    = (y, m, d) => {
//     const t = new Date();
//     return t.getFullYear() === y && t.getMonth() + 1 === m && t.getDate() === d;
//   };
//   const isSelected = (y, m, d) =>
//     pending?.year === y && pending?.month === m && pending?.day === d;

//   const prevMonth = () => {
//     if (navMonth === 1) { setNavMonth(12); setNavYear(y => y - 1); }
//     else setNavMonth(m => m - 1);
//   };
//   const nextMonth = () => {
//     if (navMonth === 12) { setNavMonth(1); setNavYear(y => y + 1); }
//     else setNavMonth(m => m + 1);
//   };

//   const handleDayClick = (y, m, d) => {
//     if (isDateDisabled(y, m, d)) return;
//     const next = {
//       year: y, month: m, day: d,
//       hour:   pending != null ? pending.hour   : 0,
//       minute: pending != null ? pending.minute : 0,
//     };
//     setPending(next);
//     setView("time");
//   };

//   const handleHourChange   = (h)   => setPending(p => p ? { ...p, hour: h }    : null);
//   const handleMinuteChange = (min) => setPending(p => p ? { ...p, minute: min } : null);

//   const handleApply = () => {
//     if (pending) onChange?.(buildValue(pending));
//     setOpen(false);
//     setView("calendar");
//   };

//   const handleClear = (e) => {
//     e.stopPropagation();
//     onChange?.("");
//     setPending(null);
//   };

//   const displayText = parsed
//     ? `${MONTHS[parsed.month - 1].slice(0, 3)} ${pad(parsed.day)}, ${parsed.year}  ${pad(parsed.hour)}:${pad(parsed.minute)}`
//     : "";

//   const totalDays = daysInMonth(navYear, navMonth);
//   const startDay  = firstWeekday(navYear, navMonth);
//   const calCells  = Array.from({ length: startDay + totalDays }, (_, i) =>
//     i < startDay ? null : i - startDay + 1
//   );
//   while (calCells.length % 7 !== 0) calCells.push(null);

//   const hours   = Array.from({ length: 24 }, (_, i) => i);
//   const minutes = Array.from({ length: 60 }, (_, i) => i);
//   const selHour   = pending != null ? pending.hour   : 0;
//   const selMinute = pending != null ? pending.minute : 0;

//   return (
//     <div ref={rootRef} className={`relative ${className}`}>
//       {label && (
//         <label className="block text-sm font-medium text-gray-700 mb-1.5">
//           {label}{required && <span className="text-red-500 ml-0.5">*</span>}
//         </label>
//       )}

//       <button
//         type="button"
//         disabled={disabled}
//         ref={triggerRef}
//         onClick={() => {
//           if (!disabled) {
//             if (triggerRef.current) {
//               const rect = triggerRef.current.getBoundingClientRect();
//               setPopoverPos({
//                 top:  rect.bottom + window.scrollY + 8,
//                 left: rect.left   + window.scrollX,
//               });
//             }
//             setOpen(o => !o);
//             setView("calendar");
//           }
//         }}
//         className={`
//           w-full flex items-center justify-between gap-2
//           px-3.5 py-2.5 rounded-xl border transition-all duration-200
//           text-sm text-left
//           ${disabled
//             ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
//             : open
//               ? "border-[#4CA1AF] ring-2 ring-[#4CA1AF]/20 bg-white shadow-sm"
//               : "border-gray-200 bg-white hover:border-[#4CA1AF]/60 hover:shadow-sm"
//           }
//         `}
//       >
//         <div className="flex items-center gap-2.5 flex-1 min-w-0">
//           <Calendar className="w-4 h-4 flex-shrink-0" style={{ color: "#4CA1AF" }} />
//           <span className={`truncate ${displayText ? "text-gray-800" : "text-gray-400"}`}>
//             {displayText || placeholder}
//           </span>
//         </div>
//         {displayText && !disabled && (
//           <span
//             role="button"
//             tabIndex={0}
//             aria-label="Clear date and time"
//             onMouseDown={(e) => {
//               e.preventDefault();
//               e.stopPropagation();
//             }}
//             onClick={handleClear}
//             onKeyDown={(e) => {
//               if (e.key === "Enter" || e.key === " ") {
//                 e.preventDefault();
//                 handleClear(e);
//               }
//             }}
//             className="flex-shrink-0 text-gray-300 hover:text-gray-500 transition-colors p-0.5 rounded"
//           >
//             <X className="w-3.5 h-3.5" />
//           </span>
//         )}
//       </button>

//       {open && createPortal(
//         <div
//           ref={popoverRef}
//           className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
//           style={{ position: "absolute", top: popoverPos.top, left: popoverPos.left, width: "300px", zIndex: 9999 }}
//         >
//           {/* Tab bar */}
//           <div className="flex border-b border-gray-100">
//             {[
//               { id: "calendar", icon: <Calendar className="w-3.5 h-3.5" />, label: "Date" },
//               { id: "time",     icon: <Clock     className="w-3.5 h-3.5" />, label: "Time" },
//             ].map(({ id, icon, label }) => (
//               <button key={id} type="button" onClick={() => setView(id)}
//                 className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-all duration-200 ${view === id ? "text-white" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
//                 style={view === id ? { background: GRAD } : {}}>
//                 {icon}{label}
//               </button>
//             ))}
//           </div>

//           {/* Calendar view */}
//           {view === "calendar" && (
//             <div className="p-3">
//               <div className="flex items-center justify-between mb-3">
//                 <button type="button" onClick={prevMonth}
//                   className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors">
//                   <ChevronLeft className="w-4 h-4" />
//                 </button>
//                 <span className="text-sm font-semibold text-gray-800">{MONTHS[navMonth - 1]} {navYear}</span>
//                 <button type="button" onClick={nextMonth}
//                   className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors">
//                   <ChevronRight className="w-4 h-4" />
//                 </button>
//               </div>

//               <div className="grid grid-cols-7 mb-1">
//                 {DAYS.map(d => (
//                   <div key={d} className="text-center text-[10px] font-semibold text-gray-400 py-1">{d}</div>
//                 ))}
//               </div>

//               <div className="grid grid-cols-7 gap-y-0.5">
//                 {calCells.map((day, idx) => {
//                   if (!day) return <div key={`empty-${idx}`} />;
//                   const sel   = isSelected(navYear, navMonth, day);
//                   const today = isToday(navYear, navMonth, day);
//                   const dis   = isDateDisabled(navYear, navMonth, day);
//                   return (
//                     <button key={day} type="button" disabled={dis}
//                       onClick={() => handleDayClick(navYear, navMonth, day)}
//                       className={`relative h-8 w-full rounded-lg text-xs font-medium transition-all duration-150 flex items-center justify-center ${dis ? "text-gray-300 cursor-not-allowed" : sel ? "text-white shadow-md" : today ? "text-[#4CA1AF] font-bold hover:bg-[#4CA1AF]/10" : "text-gray-700 hover:bg-gray-100"}`}
//                       style={sel ? { background: GRAD } : {}}>
//                       {day}
//                       {today && !sel && (
//                         <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#4CA1AF]" />
//                       )}
//                     </button>
//                   );
//                 })}
//               </div>

//               <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
//                 <span className="text-xs text-gray-400">
//                   {pending ? `${pad(pending.hour)}:${pad(pending.minute)} selected` : "Pick a date to continue"}
//                 </span>
//                 <button type="button" disabled={!pending} onClick={() => setView("time")}
//                   className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white disabled:opacity-40 transition-all"
//                   style={{ background: GRAD }}>
//                   Set Time →
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* Time view */}
//           {view === "time" && (
//             <div className="p-3">
//               {pending && (
//                 <div className="mb-3 px-3 py-2 rounded-xl text-center text-xs font-medium text-white" style={{ background: GRAD }}>
//                   {MONTHS[pending.month - 1]} {pad(pending.day)}, {pending.year}
//                 </div>
//               )}

//               <div className="text-center mb-3">
//                 <span className="text-3xl font-bold tracking-tight" style={{ color: "#2C3E50" }}>
//                   {pad(selHour)}<span className="animate-pulse text-[#4CA1AF]">:</span>{pad(selMinute)}
//                 </span>
//               </div>

//               <div className="flex gap-2 justify-center">
//                 <div className="flex-1">
//                   <p className="text-[10px] text-gray-400 text-center mb-1.5 font-semibold uppercase tracking-wide">Hour</p>
//                   <ScrollWheel items={hours}   selected={selHour}   onSelect={handleHourChange}   format={pad} />
//                 </div>
//                 <div className="flex-1">
//                   <p className="text-[10px] text-gray-400 text-center mb-1.5 font-semibold uppercase tracking-wide">Minute</p>
//                   <ScrollWheel items={minutes} selected={selMinute} onSelect={handleMinuteChange} format={pad} />
//                 </div>
//               </div>

//               <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
//                 <button type="button" onClick={() => setView("calendar")}
//                   className="flex-1 py-2 rounded-xl text-xs font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors">
//                   ← Back
//                 </button>
//                 <button type="button" disabled={!pending} onClick={handleApply}
//                   className="flex-1 py-2 rounded-xl text-xs font-semibold text-white disabled:opacity-40 transition-all shadow-md hover:shadow-lg"
//                   style={{ background: GRAD }}>
//                   Apply
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>,
//         document.body
//       )}
//     </div>
//   );
// };

// // ── ScrollWheel ──────────────────────────────────────────────────────────────
// const ITEM_H  = 36;
// const VISIBLE = 5;
// const OFFSET  = ITEM_H * 2; // centre slot = row index 2

// const ScrollWheel = ({ items, selected, onSelect, format }) => {
//   const ref          = useRef(null);
//   const snapTimer    = useRef(null);
//   const programmatic = useRef(false);

//   // Scroll to selected whenever it changes
//   useEffect(() => {
//     const el = ref.current;
//     if (!el) return;
//     const idx = items.findIndex((v) => v === selected);
//     if (idx === -1) return;
//     programmatic.current = true;
//     // With paddingTop=OFFSET, scrollTop=0 already shows item[0] in centre.
//     // So the correct scrollTop for item[idx] is simply idx * ITEM_H.
//     el.scrollTo({ top: idx * ITEM_H, behavior: "smooth" });
//     setTimeout(() => { programmatic.current = false; }, 350);
//   }, [selected, items]);

//   const commitSnap = useCallback(() => {
//     const el = ref.current;
//     if (!el || programmatic.current) return;
//     const idx     = Math.round(el.scrollTop / ITEM_H);
//     const clamped = Math.max(0, Math.min(items.length - 1, idx));
//     programmatic.current = true;
//     el.scrollTo({ top: clamped * ITEM_H, behavior: "smooth" });
//     setTimeout(() => { programmatic.current = false; }, 350);
//     if (items[clamped] !== selected) onSelect(items[clamped]);
//   }, [items, selected, onSelect]);

//   useEffect(() => {
//     const el = ref.current;
//     if (!el) return;
//     const onScroll = () => {
//       clearTimeout(snapTimer.current);
//       snapTimer.current = setTimeout(commitSnap, 150);
//     };
//     el.addEventListener("scroll", onScroll, { passive: true });
//     return () => { el.removeEventListener("scroll", onScroll); clearTimeout(snapTimer.current); };
//   }, [commitSnap]);

//   const handleClick = (item, idx) => {
//     const el = ref.current;
//     if (el) {
//       programmatic.current = true;
//       el.scrollTo({ top: idx * ITEM_H, behavior: "smooth" });
//       setTimeout(() => { programmatic.current = false; }, 350);
//     }
//     onSelect(item);
//   };

//   return (
//     <div className="relative rounded-xl overflow-hidden" style={{ height: ITEM_H * VISIBLE }}>
//       {/* Top fade */}
//       <div className="absolute inset-x-0 top-0 z-10 pointer-events-none"
//         style={{ height: OFFSET, background: "linear-gradient(to bottom, white 60%, transparent 100%)" }} />
//       {/* Bottom fade */}
//       <div className="absolute inset-x-0 bottom-0 z-10 pointer-events-none"
//         style={{ height: OFFSET, background: "linear-gradient(to top, white 60%, transparent 100%)" }} />

//       {/* Centre highlight */}
//       <div className="absolute inset-x-1 z-10 pointer-events-none rounded-lg"
//         style={{
//           top:        OFFSET,
//           height:     ITEM_H,
//           background: "rgba(76,161,175,0.12)",
//           border:     "1.5px solid rgba(76,161,175,0.35)",
//         }} />

//       {/*
//         THE FIX:
//         paddingTop / paddingBottom = OFFSET on the scroll container itself.
//         This means:
//           - scrollTop = 0  → item[0]  (00) is centred in the highlight ✓
//           - scrollTop = ITEM_H → item[1] (01) is centred ✓
//           - No spacer divs needed, scroll-snap just works.
//         scrollPaddingTop = OFFSET tells the browser where the snap viewport starts.
//       */}
//       <div
//         ref={ref}
//         className="dtp-wheel"
//         style={{
//           height:           ITEM_H * VISIBLE,
//           overflowY:        "scroll",
//           boxSizing:        "border-box",
//           paddingTop:       OFFSET,
//           paddingBottom:    OFFSET,
//           scrollSnapType:   "y mandatory",
//           scrollPaddingTop: `${OFFSET}px`,
//         }}
//       >
//         {items.map((item, idx) => (
//           <div
//             key={item}
//             onClick={() => handleClick(item, idx)}
//             style={{
//               height:          ITEM_H,
//               scrollSnapAlign: "start",
//               display:         "flex",
//               alignItems:      "center",
//               justifyContent:  "center",
//               cursor:          "pointer",
//               userSelect:      "none",
//               fontSize:        "14px",
//               fontWeight:      item === selected ? 700 : 400,
//               color:           item === selected ? "#2C3E50" : "#9CA3AF",
//               transform:       item === selected ? "scale(1.1)" : "scale(1)",
//               transition:      "color 0.15s, transform 0.15s",
//             }}
//           >
//             {format(item)}
//           </div>
//         ))}
//       </div>

//       <style>{`.dtp-wheel::-webkit-scrollbar { display: none; }`}</style>
//     </div>
//   );
// };

// export default DateTimePicker;

import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Calendar, Clock, ChevronLeft, ChevronRight, X } from "lucide-react";

// ── tiny helpers ────────────────────────────────────────────────────────────
const pad = (n) => String(n).padStart(2, "0");
const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const parseValue = (v) => {
  if (!v || typeof v !== "string") return null;
  const [datePart, timePart] = v.split("T");
  if (!datePart || !timePart) return null;
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute]     = timePart.split(":").map(Number);
  if ([year, month, day, hour, minute].some((x) => Number.isNaN(x))) return null;
  return { year, month, day, hour, minute };
};

const buildValue = ({ year, month, day, hour, minute }) =>
  `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}`;

const daysInMonth  = (year, month) => new Date(year, month, 0).getDate();
const firstWeekday = (year, month) => new Date(year, month - 1, 1).getDay();

// ─────────────────────────────────────────────────────────────────────────────
const DateTimePicker = ({
  value       = "",
  onChange,
  label       = "",
  placeholder = "Select date & time",
  disabled    = false,
  required    = false,
  minValue    = "",
  maxValue    = "",
  className   = "",
  theme, // ← theme prop
}) => {
  const parsed    = parseValue(value);
  const minParsed = parseValue(minValue);
  const maxParsed = parseValue(maxValue);

  const [open, setOpen]         = useState(false);
  const [view, setView]         = useState("calendar");
  const [navYear, setNavYear]   = useState(() => parsed?.year  ?? new Date().getFullYear());
  const [navMonth, setNavMonth] = useState(() => parsed?.month ?? new Date().getMonth() + 1);
  const [pending, setPending]   = useState(parsed);

  const rootRef    = useRef(null);
  const popoverRef = useRef(null);
  const triggerRef = useRef(null);
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });

  // Get gradient from theme or fallback
  const GRAD = theme?.primaryGradient || "linear-gradient(135deg, #4CA1AF, #2C3E50)";
  const primaryColor = theme?.primaryColor || "#4CA1AF";
  const primaryLight = theme?.primaryLight || "rgba(76, 161, 175, 0.1)";

  useEffect(() => {
    const p = parseValue(value);
    setPending(p);
    if (p) { setNavYear(p.year); setNavMonth(p.month); }
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      const insideRoot    = rootRef.current    && rootRef.current.contains(e.target);
      const insidePopover = popoverRef.current && popoverRef.current.contains(e.target);
      if (!insideRoot && !insidePopover) { setOpen(false); setView("calendar"); }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const isDateDisabled = useCallback((y, m, d) => {
    const ts = new Date(y, m - 1, d).getTime();
    if (minParsed) {
      const minTs = new Date(minParsed.year, minParsed.month - 1, minParsed.day).getTime();
      if (ts < minTs) return true;
    }
    if (maxParsed) {
      const maxTs = new Date(maxParsed.year, maxParsed.month - 1, maxParsed.day).getTime();
      if (ts > maxTs) return true;
    }
    return false;
  }, [minParsed, maxParsed]);

  const isToday    = (y, m, d) => {
    const t = new Date();
    return t.getFullYear() === y && t.getMonth() + 1 === m && t.getDate() === d;
  };
  const isSelected = (y, m, d) =>
    pending?.year === y && pending?.month === m && pending?.day === d;

  const prevMonth = () => {
    if (navMonth === 1) { setNavMonth(12); setNavYear(y => y - 1); }
    else setNavMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (navMonth === 12) { setNavMonth(1); setNavYear(y => y + 1); }
    else setNavMonth(m => m + 1);
  };

  const handleDayClick = (y, m, d) => {
    if (isDateDisabled(y, m, d)) return;
    const next = {
      year: y, month: m, day: d,
      hour:   pending != null ? pending.hour   : 0,
      minute: pending != null ? pending.minute : 0,
    };
    setPending(next);
    setView("time");
  };

  const handleHourChange   = (h)   => setPending(p => p ? { ...p, hour: h }    : null);
  const handleMinuteChange = (min) => setPending(p => p ? { ...p, minute: min } : null);

  const handleApply = () => {
    if (pending) onChange?.(buildValue(pending));
    setOpen(false);
    setView("calendar");
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange?.("");
    setPending(null);
  };

  const displayText = parsed
    ? `${MONTHS[parsed.month - 1].slice(0, 3)} ${pad(parsed.day)}, ${parsed.year}  ${pad(parsed.hour)}:${pad(parsed.minute)}`
    : "";

  const totalDays = daysInMonth(navYear, navMonth);
  const startDay  = firstWeekday(navYear, navMonth);
  const calCells  = Array.from({ length: startDay + totalDays }, (_, i) =>
    i < startDay ? null : i - startDay + 1
  );
  while (calCells.length % 7 !== 0) calCells.push(null);

  const hours   = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);
  const selHour   = pending != null ? pending.hour   : 0;
  const selMinute = pending != null ? pending.minute : 0;

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium mb-1.5" style={{ color: theme?.textSecondary || "#475569" }}>
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      <button
        type="button"
        disabled={disabled}
        ref={triggerRef}
        onClick={() => {
          if (!disabled) {
            if (triggerRef.current) {
              const rect = triggerRef.current.getBoundingClientRect();
              setPopoverPos({
                top:  rect.bottom + window.scrollY + 8,
                left: rect.left   + window.scrollX,
              });
            }
            setOpen(o => !o);
            setView("calendar");
          }
        }}
        className={`
          w-full flex items-center justify-between gap-2
          px-3.5 py-2.5 rounded-xl border transition-all duration-200
          text-sm text-left
          ${disabled
            ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
            : open
              ? "border-[#4CA1AF] ring-2 ring-[#4CA1AF]/20 bg-white shadow-sm"
              : "border-gray-200 bg-white hover:border-[#4CA1AF]/60 hover:shadow-sm"
          }
        `}
        style={disabled ? {} : { 
          borderColor: open ? primaryColor : theme?.borderColor,
          backgroundColor: open ? theme?.bgCard : theme?.accentSoft,
          color: theme?.textPrimary
        }}
      >
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <Calendar className="w-4 h-4 flex-shrink-0" style={{ color: primaryColor }} />
          <span className={`truncate ${displayText ? "" : "opacity-60"}`} style={{ color: displayText ? theme?.textPrimary : theme?.textMuted }}>
            {displayText || placeholder}
          </span>
        </div>
        {displayText && !disabled && (
          <span
            role="button"
            tabIndex={0}
            aria-label="Clear date and time"
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onClick={handleClear}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleClear(e);
              }
            }}
            className="flex-shrink-0 transition-colors p-0.5 rounded"
            style={{ color: theme?.textMuted }}
          >
            <X className="w-3.5 h-3.5" />
          </span>
        )}
      </button>

      {open && createPortal(
        <div
          ref={popoverRef}
          className="rounded-2xl shadow-2xl border overflow-hidden"
          style={{ 
            position: "absolute", 
            top: popoverPos.top, 
            left: popoverPos.left, 
            width: "300px", 
            zIndex: 9999,
            background: theme?.bgCard,
            borderColor: theme?.borderColor
          }}
        >
          {/* Tab bar */}
          <div className="flex border-b" style={{ borderColor: theme?.borderColor }}>
            {[
              { id: "calendar", icon: <Calendar className="w-3.5 h-3.5" />, label: "Date" },
              { id: "time",     icon: <Clock     className="w-3.5 h-3.5" />, label: "Time" },
            ].map(({ id, icon, label }) => (
              <button key={id} type="button" onClick={() => setView(id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-all duration-200 ${view === id ? "text-white" : ""}`}
                style={view === id 
                  ? { background: GRAD } 
                  : { color: theme?.textSecondary, background: theme?.accentSoft }}
                onMouseEnter={(e) => {
                  if (view !== id) {
                    e.currentTarget.style.background = theme?.accentSoft;
                    e.currentTarget.style.color = theme?.textPrimary;
                  }
                }}
                onMouseLeave={(e) => {
                  if (view !== id) {
                    e.currentTarget.style.background = theme?.accentSoft;
                    e.currentTarget.style.color = theme?.textSecondary;
                  }
                }}
              >
                {icon}{label}
              </button>
            ))}
          </div>

          {/* Calendar view */}
          {view === "calendar" && (
            <div className="p-3">
              <div className="flex items-center justify-between mb-3">
                <button type="button" onClick={prevMonth}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                  style={{ color: theme?.textSecondary, background: theme?.accentSoft }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = theme?.primaryLight; e.currentTarget.style.color = theme?.primaryColor; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = theme?.accentSoft; e.currentTarget.style.color = theme?.textSecondary; }}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-semibold" style={{ color: theme?.textPrimary }}>{MONTHS[navMonth - 1]} {navYear}</span>
                <button type="button" onClick={nextMonth}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                  style={{ color: theme?.textSecondary, background: theme?.accentSoft }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = theme?.primaryLight; e.currentTarget.style.color = theme?.primaryColor; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = theme?.accentSoft; e.currentTarget.style.color = theme?.textSecondary; }}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-7 mb-1">
                {DAYS.map(d => (
                  <div key={d} className="text-center text-[10px] font-semibold py-1" style={{ color: theme?.textMuted }}>{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-y-0.5">
                {calCells.map((day, idx) => {
                  if (!day) return <div key={`empty-${idx}`} />;
                  const sel   = isSelected(navYear, navMonth, day);
                  const today = isToday(navYear, navMonth, day);
                  const dis   = isDateDisabled(navYear, navMonth, day);
                  return (
                    <button key={day} type="button" disabled={dis}
                      onClick={() => handleDayClick(navYear, navMonth, day)}
                      className={`relative h-8 w-full rounded-lg text-xs font-medium transition-all duration-150 flex items-center justify-center ${dis ? "cursor-not-allowed" : ""}`}
                      style={dis 
                        ? { color: theme?.textMuted, background: "transparent", opacity: 0.5 }
                        : sel 
                          ? { background: GRAD, color: "#fff" }
                          : { color: theme?.textPrimary, background: "transparent" }}
                    >
                      {day}
                      {today && !sel && (
                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full" style={{ backgroundColor: primaryColor }} />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 pt-3 border-t flex items-center justify-between" style={{ borderColor: theme?.borderColor }}>
                <span className="text-xs" style={{ color: theme?.textMuted }}>
                  {pending ? `${pad(pending.hour)}:${pad(pending.minute)} selected` : "Pick a date to continue"}
                </span>
                <button type="button" disabled={!pending} onClick={() => setView("time")}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white disabled:opacity-40 transition-all"
                  style={{ background: GRAD }}>
                  Set Time →
                </button>
              </div>
            </div>
          )}

          {/* Time view */}
          {view === "time" && (
            <div className="p-3">
              {pending && (
                <div className="mb-3 px-3 py-2 rounded-xl text-center text-xs font-medium text-white" style={{ background: GRAD }}>
                  {MONTHS[pending.month - 1]} {pad(pending.day)}, {pending.year}
                </div>
              )}

              <div className="text-center mb-3">
                <span className="text-3xl font-bold tracking-tight" style={{ color: theme?.textPrimary }}>
                  {pad(selHour)}<span className="animate-pulse" style={{ color: primaryColor }}>:</span>{pad(selMinute)}
                </span>
              </div>

              <div className="flex gap-2 justify-center">
                <div className="flex-1">
                  <p className="text-[10px] text-center mb-1.5 font-semibold uppercase tracking-wide" style={{ color: theme?.textMuted }}>Hour</p>
                  <ScrollWheel items={hours}   selected={selHour}   onSelect={handleHourChange}   format={pad} theme={theme} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-center mb-1.5 font-semibold uppercase tracking-wide" style={{ color: theme?.textMuted }}>Minute</p>
                  <ScrollWheel items={minutes} selected={selMinute} onSelect={handleMinuteChange} format={pad} theme={theme} />
                </div>
              </div>

              <div className="mt-3 pt-3 border-t flex gap-2" style={{ borderColor: theme?.borderColor }}>
                <button type="button" onClick={() => setView("calendar")}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold transition-colors"
                  style={{ 
                    color: theme?.textSecondary, 
                    border: `1px solid ${theme?.borderColor}`,
                    background: theme?.accentSoft
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = theme?.primaryLight; e.currentTarget.style.color = theme?.primaryColor; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = theme?.accentSoft; e.currentTarget.style.color = theme?.textSecondary; }}
                >
                  ← Back
                </button>
                <button type="button" disabled={!pending} onClick={handleApply}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold text-white disabled:opacity-40 transition-all shadow-md hover:shadow-lg"
                  style={{ background: GRAD }}>
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
};

// ── ScrollWheel with theme support ──────────────────────────────────────────────
const ITEM_H  = 36;
const VISIBLE = 5;
const OFFSET  = ITEM_H * 2; // centre slot = row index 2

const ScrollWheel = ({ items, selected, onSelect, format, theme }) => {
  const ref          = useRef(null);
  const snapTimer    = useRef(null);
  const programmatic = useRef(false);
  const primaryColor = theme?.primaryColor || "#4CA1AF";

  // Scroll to selected whenever it changes
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const idx = items.findIndex((v) => v === selected);
    if (idx === -1) return;
    programmatic.current = true;
    el.scrollTo({ top: idx * ITEM_H, behavior: "smooth" });
    setTimeout(() => { programmatic.current = false; }, 350);
  }, [selected, items]);

  const commitSnap = useCallback(() => {
    const el = ref.current;
    if (!el || programmatic.current) return;
    const idx     = Math.round(el.scrollTop / ITEM_H);
    const clamped = Math.max(0, Math.min(items.length - 1, idx));
    programmatic.current = true;
    el.scrollTo({ top: clamped * ITEM_H, behavior: "smooth" });
    setTimeout(() => { programmatic.current = false; }, 350);
    if (items[clamped] !== selected) onSelect(items[clamped]);
  }, [items, selected, onSelect]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      clearTimeout(snapTimer.current);
      snapTimer.current = setTimeout(commitSnap, 150);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => { el.removeEventListener("scroll", onScroll); clearTimeout(snapTimer.current); };
  }, [commitSnap]);

  const handleClick = (item, idx) => {
    const el = ref.current;
    if (el) {
      programmatic.current = true;
      el.scrollTo({ top: idx * ITEM_H, behavior: "smooth" });
      setTimeout(() => { programmatic.current = false; }, 350);
    }
    onSelect(item);
  };

  return (
    <div className="relative rounded-xl overflow-hidden" style={{ height: ITEM_H * VISIBLE }}>
      {/* Top fade */}
      <div className="absolute inset-x-0 top-0 z-10 pointer-events-none"
        style={{ height: OFFSET, background: `linear-gradient(to bottom, ${theme?.bgCard || "#fff"} 60%, transparent 100%)` }} />
      {/* Bottom fade */}
      <div className="absolute inset-x-0 bottom-0 z-10 pointer-events-none"
        style={{ height: OFFSET, background: `linear-gradient(to top, ${theme?.bgCard || "#fff"} 60%, transparent 100%)` }} />

      {/* Centre highlight */}
      <div className="absolute inset-x-1 z-10 pointer-events-none rounded-lg"
        style={{
          top:        OFFSET,
          height:     ITEM_H,
          background: theme?.primaryLight || "rgba(76,161,175,0.12)",
          border:     `1.5px solid ${theme?.primaryLight || "rgba(76,161,175,0.35)"}`,
        }} />

      <div
        ref={ref}
        className="dtp-wheel"
        style={{
          height:           ITEM_H * VISIBLE,
          overflowY:        "scroll",
          boxSizing:        "border-box",
          paddingTop:       OFFSET,
          paddingBottom:    OFFSET,
          scrollSnapType:   "y mandatory",
          scrollPaddingTop: `${OFFSET}px`,
        }}
      >
        {items.map((item, idx) => (
          <div
            key={item}
            onClick={() => handleClick(item, idx)}
            style={{
              height:          ITEM_H,
              scrollSnapAlign: "start",
              display:         "flex",
              alignItems:      "center",
              justifyContent:  "center",
              cursor:          "pointer",
              userSelect:      "none",
              fontSize:        "14px",
              fontWeight:      item === selected ? 700 : 400,
              color:           item === selected ? theme?.textPrimary || "#2C3E50" : theme?.textMuted || "#9CA3AF",
              transform:       item === selected ? "scale(1.1)" : "scale(1)",
              transition:      "color 0.15s, transform 0.15s",
            }}
          >
            {format(item)}
          </div>
        ))}
      </div>

      <style>{`.dtp-wheel::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
};

export default DateTimePicker;