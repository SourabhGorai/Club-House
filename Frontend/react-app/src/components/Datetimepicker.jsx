import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Calendar, Clock, ChevronLeft, ChevronRight, X } from "lucide-react";

/**
 * DateTimePicker — fully custom, zero native browser UI.
 *
 * Props:
 *   value       {string}   — datetime-local string  "YYYY-MM-DDTHH:mm"  (controlled)
 *   onChange    {function} — called with new "YYYY-MM-DDTHH:mm" string
 *   label       {string}   — field label
 *   placeholder {string}   — shown when empty
 *   disabled    {boolean}
 *   required    {boolean}
 *   minValue    {string}   — optional "YYYY-MM-DDTHH:mm" lower bound
 *   maxValue    {string}   — optional "YYYY-MM-DDTHH:mm" upper bound
 *   className   {string}   — extra classes on the root wrapper
 */

// ── tiny helpers ────────────────────────────────────────────────────────────
const pad  = (n) => String(n).padStart(2, "0");
const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

/** Parse "YYYY-MM-DDTHH:mm" → { year, month, day, hour, minute } or null */
const parseValue = (v) => {
  if (!v || typeof v !== "string") return null;
  const [datePart, timePart] = v.split("T");
  if (!datePart || !timePart) return null;
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute]     = timePart.split(":").map(Number);
  if ([year, month, day, hour, minute].some(isNaN)) return null;
  return { year, month, day, hour, minute };
};

/** Build "YYYY-MM-DDTHH:mm" from parts */
const buildValue = ({ year, month, day, hour, minute }) =>
  `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}`;

/** Days in a month (accounts for leap years) */
const daysInMonth = (year, month) => new Date(year, month, 0).getDate();

/** First weekday of a month (0=Sun) */
const firstWeekday = (year, month) => new Date(year, month - 1, 1).getDay();

// ── gradient used throughout ────────────────────────────────────────────────
const GRAD = "linear-gradient(135deg, #4CA1AF, #2C3E50)";

// ════════════════════════════════════════════════════════════════════════════
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
}) => {
  const parsed    = parseValue(value);
  const minParsed = parseValue(minValue);
  const maxParsed = parseValue(maxValue);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [open, setOpen]         = useState(false);
  const [view, setView]         = useState("calendar"); // "calendar" | "time"
  const [navYear, setNavYear]   = useState(() => parsed?.year  ?? new Date().getFullYear());
  const [navMonth, setNavMonth] = useState(() => parsed?.month ?? new Date().getMonth() + 1);
  const [pending, setPending]   = useState(parsed);

  const rootRef    = useRef(null);
  const popoverRef = useRef(null);
  const triggerRef = useRef(null);
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0, width: 0 });

  // Sync nav when value changes externally
  useEffect(() => {
    const p = parseValue(value);
    setPending(p);
    if (p) { setNavYear(p.year); setNavMonth(p.month); }
  }, [value]);

  // Close on outside click — must check both rootRef AND popoverRef because
  // the popover is rendered via createPortal outside the root element.
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      const insideRoot    = rootRef.current    && rootRef.current.contains(e.target);
      const insidePopover = popoverRef.current && popoverRef.current.contains(e.target);
      if (!insideRoot && !insidePopover) {
        setOpen(false);
        setView("calendar");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // ── helpers ───────────────────────────────────────────────────────────────
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

  const isToday = (y, m, d) => {
    const t = new Date();
    return t.getFullYear() === y && t.getMonth() + 1 === m && t.getDate() === d;
  };

  const isSelected = (y, m, d) =>
    pending?.year === y && pending?.month === m && pending?.day === d;

  // ── navigation ────────────────────────────────────────────────────────────
  const prevMonth = () => {
    if (navMonth === 1) { setNavMonth(12); setNavYear(y => y - 1); }
    else setNavMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (navMonth === 12) { setNavMonth(1); setNavYear(y => y + 1); }
    else setNavMonth(m => m + 1);
  };

  // ── day click ─────────────────────────────────────────────────────────────
  const handleDayClick = (y, m, d) => {
    if (isDateDisabled(y, m, d)) return;
    const next = {
      year: y, month: m, day: d,
      hour:   pending?.hour   ?? 0,
      minute: pending?.minute ?? 0,
    };
    setPending(next);
    setView("time");
  };

  // ── time change ───────────────────────────────────────────────────────────
  const handleHourChange   = (h)   => { setPending(p => p ? { ...p, hour: h }      : null); };
  const handleMinuteChange = (min) => { setPending(p => p ? { ...p, minute: min }   : null); };

  // ── apply ─────────────────────────────────────────────────────────────────
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

  // ── display label ─────────────────────────────────────────────────────────
  const displayText = parsed
    ? `${MONTHS[parsed.month - 1].slice(0, 3)} ${pad(parsed.day)}, ${parsed.year}  ${pad(parsed.hour)}:${pad(parsed.minute)}`
    : "";

  // ── calendar grid ─────────────────────────────────────────────────────────
  const totalDays = daysInMonth(navYear, navMonth);
  const startDay  = firstWeekday(navYear, navMonth);
  const calCells  = Array.from({ length: startDay + totalDays }, (_, i) =>
    i < startDay ? null : i - startDay + 1
  );
  while (calCells.length % 7 !== 0) calCells.push(null);

  const hours   = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);
  const selHour   = pending?.hour   ?? 0;
  const selMinute = pending?.minute ?? 0;

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div ref={rootRef} className={`relative ${className}`}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            if (triggerRef.current) {
              const rect = triggerRef.current.getBoundingClientRect();
              setPopoverPos({
                top:   rect.bottom + window.scrollY + 8,
                left:  rect.left   + window.scrollX,
                width: rect.width,
              });
            }
            setOpen(o => !o);
            setView("calendar");
          }
        }}
        ref={triggerRef}
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
      >
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <Calendar className="w-4 h-4 flex-shrink-0" style={{ color: "#4CA1AF" }} />
          <span className={`truncate ${displayText ? "text-gray-800" : "text-gray-400"}`}>
            {displayText || placeholder}
          </span>
        </div>
        {displayText && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="flex-shrink-0 text-gray-300 hover:text-gray-500 transition-colors p-0.5 rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </button>

      {/* Popover — rendered via portal into document.body to escape all stacking contexts */}
      {open && createPortal(
        <div
          ref={popoverRef}
          className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
          style={{
            position: "absolute",
            top:      popoverPos.top,
            left:     popoverPos.left,
            width:    "300px",
            minWidth: "300px",
            zIndex:   9999,
          }}
        >
          {/* ── Tab bar ── */}
          <div className="flex border-b border-gray-100">
            {[
              { id: "calendar", icon: <Calendar className="w-3.5 h-3.5" />, label: "Date" },
              { id: "time",     icon: <Clock     className="w-3.5 h-3.5" />, label: "Time" },
            ].map(({ id, icon, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setView(id)}
                className={`
                  flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold
                  transition-all duration-200
                  ${view === id
                    ? "text-white"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }
                `}
                style={view === id ? { background: GRAD } : {}}
              >
                {icon}{label}
              </button>
            ))}
          </div>

          {/* ── Calendar view ── */}
          {view === "calendar" && (
            <div className="p-3">
              {/* Month nav */}
              <div className="flex items-center justify-between mb-3">
                <button
                  type="button"
                  onClick={prevMonth}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-semibold text-gray-800">
                  {MONTHS[navMonth - 1]} {navYear}
                </span>
                <button
                  type="button"
                  onClick={nextMonth}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 mb-1">
                {DAYS.map(d => (
                  <div key={d} className="text-center text-[10px] font-semibold text-gray-400 py-1">
                    {d}
                  </div>
                ))}
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7 gap-y-0.5">
                {calCells.map((day, idx) => {
                  if (!day) return <div key={`empty-${idx}`} />;
                  const sel      = isSelected(navYear, navMonth, day);
                  const today    = isToday(navYear, navMonth, day);
                  const dis      = isDateDisabled(navYear, navMonth, day);
                  return (
                    <button
                      key={day}
                      type="button"
                      disabled={dis}
                      onClick={() => handleDayClick(navYear, navMonth, day)}
                      className={`
                        relative h-8 w-full rounded-lg text-xs font-medium
                        transition-all duration-150 flex items-center justify-center
                        ${dis
                          ? "text-gray-300 cursor-not-allowed"
                          : sel
                            ? "text-white shadow-md"
                            : today
                              ? "text-[#4CA1AF] font-bold hover:bg-[#4CA1AF]/10"
                              : "text-gray-700 hover:bg-gray-100"
                        }
                      `}
                      style={sel ? { background: GRAD } : {}}
                    >
                      {day}
                      {today && !sel && (
                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#4CA1AF]" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  {pending
                    ? `${pad(pending.hour)}:${pad(pending.minute)} selected`
                    : "Pick a date to continue"}
                </span>
                <button
                  type="button"
                  disabled={!pending}
                  onClick={() => setView("time")}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white disabled:opacity-40 transition-all"
                  style={{ background: GRAD }}
                >
                  Set Time →
                </button>
              </div>
            </div>
          )}

          {/* ── Time view ── */}
          {view === "time" && (
            <div className="p-3">
              {/* Selected date reminder */}
              {pending && (
                <div className="mb-3 px-3 py-2 rounded-xl text-center text-xs font-medium text-white" style={{ background: GRAD }}>
                  {MONTHS[pending.month - 1]} {pad(pending.day)}, {pending.year}
                </div>
              )}

              {/* Time display */}
              <div className="text-center mb-3">
                <span className="text-3xl font-bold tracking-tight" style={{ color: "#2C3E50" }}>
                  {pad(selHour)}<span className="animate-pulse text-[#4CA1AF]">:</span>{pad(selMinute)}
                </span>
              </div>

              {/* Scroll wheels */}
              <div className="flex gap-2 justify-center">
                <div className="flex-1">
                  <p className="text-[10px] text-gray-400 text-center mb-1.5 font-semibold uppercase tracking-wide">Hour</p>
                  <ScrollWheel
                    items={hours}
                    selected={selHour}
                    onSelect={handleHourChange}
                    format={(h) => pad(h)}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-gray-400 text-center mb-1.5 font-semibold uppercase tracking-wide">Minute</p>
                  <ScrollWheel
                    items={minutes}
                    selected={selMinute}
                    onSelect={handleMinuteChange}
                    format={(m) => pad(m)}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => setView("calendar")}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  disabled={!pending}
                  onClick={handleApply}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold text-white disabled:opacity-40 transition-all shadow-md hover:shadow-lg"
                  style={{ background: GRAD }}
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
        , document.body
      )}
    </div>
  );
};

// ── ScrollWheel subcomponent ────────────────────────────────────────────────
const ITEM_H  = 36;
const VISIBLE = 5;

const ScrollWheel = ({ items, selected, onSelect, format }) => {
  const containerRef = useRef(null);
  const isDragging   = useRef(false);

  // Scroll to selected item on mount / selection change
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const idx = items.indexOf(selected);
    if (idx === -1) return;
    el.scrollTo({ top: idx * ITEM_H, behavior: "smooth" });
  }, [selected, items]);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el || isDragging.current) return;
    const idx = Math.round(el.scrollTop / ITEM_H);
    const clamped = Math.max(0, Math.min(items.length - 1, idx));
    if (items[clamped] !== selected) onSelect(items[clamped]);
  }, [items, selected, onSelect]);

  // Snap on scroll end
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let timer;
    const onScroll = () => {
      clearTimeout(timer);
      timer = setTimeout(handleScroll, 80);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => { el.removeEventListener("scroll", onScroll); clearTimeout(timer); };
  }, [handleScroll]);

  return (
    <div className="relative rounded-xl overflow-hidden" style={{ height: ITEM_H * VISIBLE }}>
      {/* Top fade */}
      <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none"
        style={{ height: ITEM_H * 2, background: "linear-gradient(to bottom, white 0%, transparent 100%)" }} />
      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none"
        style={{ height: ITEM_H * 2, background: "linear-gradient(to top, white 0%, transparent 100%)" }} />

      {/* Selection highlight */}
      <div
        className="absolute left-0 right-0 z-10 pointer-events-none rounded-lg mx-1"
        style={{
          top: ITEM_H * 2,
          height: ITEM_H,
          background: "rgba(76, 161, 175, 0.12)",
          border: "1.5px solid rgba(76, 161, 175, 0.35)",
        }}
      />

      {/* Scrollable list */}
      <div
        ref={containerRef}
        className="dtp-scroll-wheel overflow-y-scroll h-full"
        style={{
          scrollSnapType: "y mandatory",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <div style={{ height: ITEM_H * 2 }} />
        {items.map((item) => (
          <div
            key={item}
            onClick={() => {
              onSelect(item);
              const el = containerRef.current;
              if (el) el.scrollTo({ top: items.indexOf(item) * ITEM_H, behavior: "smooth" });
            }}
            style={{ height: ITEM_H, scrollSnapAlign: "start" }}
            className={`
              flex items-center justify-center cursor-pointer
              text-sm font-medium transition-all duration-150
              ${item === selected ? "text-[#2C3E50] font-bold scale-110" : "text-gray-400 hover:text-gray-600"}
            `}
          >
            {format(item)}
          </div>
        ))}
        <div style={{ height: ITEM_H * 2 }} />
      </div>

      <style>{`.dtp-scroll-wheel::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
};

export default DateTimePicker;