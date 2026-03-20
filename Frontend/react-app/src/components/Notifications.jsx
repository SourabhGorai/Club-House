// import React, { useState, useEffect, useCallback } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import CustomSelect from "./CustomSelect";
// import DateTimePicker from "./Datetimepicker";
// import ConfirmDialog from "./ConfirmDialog";
// import {
//   Bell,
//   BellOff,
//   BellRing,
//   Plus,
//   X,
//   Check,
//   CheckCheck,
//   ChevronLeft,
//   ChevronRight,
//   Search,
//   Globe,
//   Building2,
//   Calendar,
//   Users,
//   Layers,
//   AlertCircle,
//   CheckCircle2,
//   Clock,
//   Trash2,
//   RefreshCw,
//   Eye,
//   EyeOff,
//   Send,
//   Edit3,
//   Zap,
//   ShieldCheck,
//   GraduationCap,
//   User,
// } from "lucide-react";

// const BASE_URL = import.meta.env.VITE_API_URL || "http://72.155.88.211:8080";

// // ─────────────────────────────────────────────
// // Constants & Helpers
// // ─────────────────────────────────────────────
// const NOTIFICATION_TYPES = ["GLOBAL", "CLUB_SPECIFIC", "DEPARTMENT_SPECIFIC", "YEAR_SPECIFIC", "REMINDER"];
// const SOURCE_TYPES = ["DEPARTMENT", "CLUB", "SYSTEM"];
// const TARGET_TYPES = ["GLOBAL", "DEPARTMENT", "CLUB", "YEAR"];
// const PAGE_SIZE = 10;

// const TYPE_META = {
//   GLOBAL:              { icon: <Globe size={14} />,     color: "#4CA1AF", bg: "rgba(76,161,175,0.12)",  label: "Global" },
//   CLUB_SPECIFIC:       { icon: <Users size={14} />,     color: "#10B981", bg: "rgba(16,185,129,0.12)",  label: "Club" },
//   DEPARTMENT_SPECIFIC: { icon: <Building2 size={14} />, color: "#F97316", bg: "rgba(249,115,22,0.12)",  label: "Department" },
//   YEAR_SPECIFIC:       { icon: <Layers size={14} />,    color: "#8B5CF6", bg: "rgba(139,92,246,0.12)",  label: "Year" },
//   REMINDER:            { icon: <Clock size={14} />,     color: "#EF4444", bg: "rgba(239,68,68,0.12)",   label: "Reminder" },
//   EVENT_SPECIFIC:      { icon: <Calendar size={14} />,  color: "#0EA5E9", bg: "rgba(14,165,233,0.12)",  label: "Event" },
// };

// const parseBackendDate = (value) => {
//   if (!value) return null;
//   if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
//   if (typeof value === "number") { const d = new Date(value); return Number.isNaN(d.getTime()) ? null : d; }
//   if (Array.isArray(value)) {
//     const [y, m, d, h = 0, min = 0, s = 0] = value;
//     const parsed = new Date(y, (m || 1) - 1, d || 1, h, min, s);
//     return Number.isNaN(parsed.getTime()) ? null : parsed;
//   }
//   if (typeof value !== "string") return null;
//   const text = value.trim();
//   let match = text.match(/^(\d{2})-(\d{2})-(\d{4})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/);
//   if (match) {
//     const [, dd, mm, yyyy, hh = "00", mi = "00", ss = "00"] = match;
//     const parsed = new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(mi), Number(ss));
//     return Number.isNaN(parsed.getTime()) ? null : parsed;
//   }
//   match = text.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?/);
//   if (match) {
//     const [, yyyy, mm, dd, hh = "00", mi = "00", ss = "00"] = match;
//     const parsed = new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(mi), Number(ss));
//     return Number.isNaN(parsed.getTime()) ? null : parsed;
//   }
//   const fallback = new Date(text);
//   return Number.isNaN(fallback.getTime()) ? null : fallback;
// };

// const fmt = (dt) => {
//   if (!dt) return "—";
//   const parsed = parseBackendDate(dt);
//   if (!parsed) return "—";
//   return parsed.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
// };

// const toPickerValue = (dt) => {
//   if (!dt) return "";
//   const parsed = parseBackendDate(dt);
//   if (!parsed) return "";
//   const pad = (n) => String(n).padStart(2, "0");
//   return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}T${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`;
// };

// const getRole = () => {
//   try { return JSON.parse(localStorage.getItem("user"))?.role || "USER"; }
//   catch { return "USER"; }
// };
// const isSuperAdmin = (r) => r === "SUPER_ADMIN";
// const isTeacher    = (r) => ["TEACHER", "TEACHERS"].includes(r?.toUpperCase());

// // ─────────────────────────────────────────────
// // Shared sub-components
// // ─────────────────────────────────────────────

// const TypeBadge = ({ type }) => {
//   const m = TYPE_META[type] || { icon: <Bell size={14} />, color: "#4CA1AF", bg: "rgba(76,161,175,0.12)", label: type };
//   return (
//     <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
//       style={{ color: m.color, backgroundColor: m.bg }}>
//       {m.icon}{m.label}
//     </span>
//   );
// };

// const StatusDot = ({ active }) => (
//   <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${active ? "text-emerald-600 bg-emerald-50" : "text-slate-400 bg-slate-100"}`}>
//     <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`}></span>
//     {active ? "Active" : "Inactive"}
//   </span>
// );

// const ReadBadge = ({ isRead }) => (
//   <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${isRead ? "text-slate-400 bg-slate-100" : "text-[#4CA1AF] bg-[rgba(76,161,175,0.1)]"}`}>
//     <span className={`w-1.5 h-1.5 rounded-full ${isRead ? "bg-slate-400" : "bg-[#4CA1AF]"}`}></span>
//     {isRead ? "Read" : "Unread"}
//   </span>
// );

// const EmptyState = ({ icon, title, subtitle, action }) => (
//   <div className="flex flex-col items-center justify-center py-24 text-center px-4">
//     <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5"
//       style={{ backgroundColor: "rgba(76,161,175,0.1)", color: "#4CA1AF" }}>
//       {icon}
//     </div>
//     <h3 className="text-xl font-black text-slate-800 mb-2">{title}</h3>
//     <p className="text-slate-400 font-medium max-w-xs mb-6">{subtitle}</p>
//     {action}
//   </div>
// );

// const Toast = ({ message, type, onClose }) => {
//   useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
//   return (
//     <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border transition-all ${type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"}`}>
//       {type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
//       <span className="text-sm font-bold">{message}</span>
//       <button onClick={onClose} className="ml-2 hover:opacity-70 cursor-pointer"><X size={16} /></button>
//     </div>
//   );
// };

// const Loader = ({ text = "Loading notifications..." }) => (
//   <div className="flex flex-col items-center justify-center py-24">
//     <div className="w-12 h-12 border-4 rounded-full animate-spin mb-4"
//       style={{ borderColor: "rgba(76,161,175,0.15)", borderTopColor: "#4CA1AF" }}></div>
//     <p className="text-slate-400 font-medium animate-pulse">{text}</p>
//   </div>
// );

// const Pagination = ({ totalElements, page, pageSize, onPage }) => {
//   const pages = Math.ceil(totalElements / pageSize);
//   if (pages <= 1) return null;
//   const items = Array.from({ length: pages }, (_, i) => i)
//     .filter(i => i === 0 || i === pages - 1 || Math.abs(i - page) <= 1)
//     .reduce((acc, i, idx, arr) => {
//       if (idx > 0 && i - arr[idx - 1] > 1) acc.push("...");
//       acc.push(i);
//       return acc;
//     }, []);
//   const start = page * pageSize + 1;
//   const end   = Math.min((page + 1) * pageSize, totalElements);
//   return (
//     <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 px-2">
//       <p className="text-sm font-bold text-slate-400">
//         Showing <span className="text-slate-700">{start}–{end}</span> of <span className="text-slate-700">{totalElements}</span>
//       </p>
//       <div className="flex items-center gap-2">
//         <button onClick={() => onPage(Math.max(0, page - 1))} disabled={page === 0}
//           className="w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#4CA1AF] hover:border-[#4CA1AF] disabled:opacity-30 disabled:cursor-not-allowed transition-all">
//           <ChevronLeft size={16} />
//         </button>
//         {items.map((item, idx) => item === "..." ? (
//           <span key={`e${idx}`} className="px-1 text-slate-400 font-bold text-sm">…</span>
//         ) : (
//           <button key={item} onClick={() => onPage(item)}
//             className="w-9 h-9 rounded-xl text-sm font-black transition-all border"
//             style={item === page
//               ? { background: "linear-gradient(135deg, #4CA1AF, #315169)", color: "#fff", borderColor: "transparent" }
//               : { backgroundColor: "#fff", borderColor: "#e2e8f0", color: "#64748b" }}>
//             {item + 1}
//           </button>
//         ))}
//         <button onClick={() => onPage(Math.min(pages - 1, page + 1))} disabled={page >= pages - 1}
//           className="w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#4CA1AF] hover:border-[#4CA1AF] disabled:opacity-30 disabled:cursor-not-allowed transition-all">
//           <ChevronRight size={16} />
//         </button>
//       </div>
//     </div>
//   );
// };

// // ─────────────────────────────────────────────
// // Notification Card
// // ─────────────────────────────────────────────
// const NotificationCard = ({ notif, onMarkRead }) => (
//   <div className="group relative bg-white rounded-2xl border border-slate-100 transition-all hover:shadow-lg">
//     <div className="p-5">
//       <div className="flex items-start gap-4">
//         <div className="flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center"
//           style={{ backgroundColor: (TYPE_META[notif.notificationType] || TYPE_META.GLOBAL).bg, color: (TYPE_META[notif.notificationType] || TYPE_META.GLOBAL).color }}>
//           {React.cloneElement((TYPE_META[notif.notificationType] || TYPE_META.GLOBAL).icon, { size: 20 })}
//         </div>
//         <div className="flex-1 min-w-0">
//           <div className="flex items-start justify-between gap-2 flex-wrap">
//             <div className="flex items-center gap-2 flex-wrap">
//               <TypeBadge type={notif.notificationType} />
//             </div>
//             <span className="text-[11px] text-slate-400 font-semibold whitespace-nowrap">{fmt(notif.createdAt)}</span>
//           </div>
//           <h4 className="mt-2 font-black leading-snug text-slate-800">{notif.title}</h4>
//           <p className="mt-1 text-sm text-slate-500 font-medium leading-relaxed">{notif.message}</p>
//           {notif.validUntil && (
//             <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400">
//               <Clock size={11} /> Expires: {fmt(notif.validUntil)}
//             </div>
//           )}
//         </div>
//       </div>
//       <div className="mt-4 flex items-center gap-2 justify-end">
//         {!notif.isRead && onMarkRead && (
//           <button onClick={() => onMarkRead(notif.notificationId)}
//             className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl text-[#4CA1AF] hover:bg-[rgba(76,161,175,0.1)] transition-all cursor-pointer">
//             <Check size={13} /> Mark read
//           </button>
//         )}
//       </div>
//     </div>
//   </div>
// );

// // ─────────────────────────────────────────────
// // Admin Notification Row
// // ─────────────────────────────────────────────
// const AdminNotifRow = ({ notif, onToggle, onDelete, onEdit, onTrigger, showCheckbox, checked, onCheck, showReadStatus, onMarkRead, showFullMessage = false }) => (
//   <tr className={`group border-b border-slate-100 last:border-0 transition-all ${checked ? "bg-[rgba(76,161,175,0.04)]" : !notif.isRead && showReadStatus ? "bg-[rgba(76,161,175,0.02)]" : "hover:bg-slate-50/80"}`}>
//     {showCheckbox && (
//       <td className="pl-5 pr-3 py-5">
//         <input type="checkbox" checked={checked} onChange={onCheck}
//           className="w-4 h-4 rounded cursor-pointer accent-[#4CA1AF]" />
//       </td>
//     )}
//     <td className="px-4 py-5">
//       <div className="flex flex-col gap-1">
//         <div className="flex items-center gap-2">
//           {showReadStatus && !notif.isRead && <span className="w-2 h-2 rounded-full bg-[#4CA1AF] flex-shrink-0 animate-pulse" />}
//           <span className={`text-sm leading-tight ${!notif.isRead && showReadStatus ? "font-black text-[#162F38]" : "font-black text-slate-800"}`}>{notif.title}</span>
//         </div>
//         <span className={`text-xs text-slate-400 font-medium ${showFullMessage ? "whitespace-normal break-words max-w-xl" : "line-clamp-1 max-w-xs"}`}>{notif.message}</span>
//         {notif.createdByPrn && <span className="text-[10px] text-slate-300 font-medium">by {notif.createdByPrn}</span>}
//       </div>
//     </td>
//     <td className="px-4 py-5 hidden sm:table-cell"><TypeBadge type={notif.notificationType} /></td>
//     <td className="px-4 py-5 hidden md:table-cell">
//       {showReadStatus ? <ReadBadge isRead={notif.isRead} /> : <StatusDot active={notif.isActive} />}
//     </td>
//     <td className="px-4 py-5 hidden lg:table-cell"><span className="text-xs font-semibold text-slate-400">{fmt(notif.createdAt)}</span></td>
//     <td className="px-4 py-5 hidden lg:table-cell"><span className="text-xs font-semibold text-slate-400">{fmt(notif.validUntil)}</span></td>
//     <td className="px-4 py-5 text-right">
//       <div className="flex items-center justify-end gap-2">
//         {showReadStatus && !notif.isRead && onMarkRead && (
//           <button onClick={() => onMarkRead(notif.notificationId)}
//             className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#4CA1AF] hover:border-[#4CA1AF] transition-all cursor-pointer"
//             title="Mark as read">
//             <Check size={15} />
//           </button>
//         )}
//         {onEdit && (
//           <button onClick={() => onEdit(notif)}
//             className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#4CA1AF] hover:border-[#4CA1AF] transition-all cursor-pointer">
//             <Edit3 size={15} />
//           </button>
//         )}
//         {onTrigger && (
//           <button onClick={() => onTrigger(notif)}
//             className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:border-emerald-300 transition-all cursor-pointer"
//             title="Trigger notification now">
//             <BellRing size={15} />
//           </button>
//         )}
//         {onToggle && (
//           <button onClick={() => onToggle(notif)}
//             className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-amber-500 hover:border-amber-300 transition-all cursor-pointer"
//             title={notif.isActive ? "Deactivate" : "Reactivate"}>
//             {notif.isActive ? <EyeOff size={15} /> : <Eye size={15} />}
//           </button>
//         )}
//         {onDelete && (
//           <button onClick={() => onDelete(notif)}
//             className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-300 transition-all cursor-pointer">
//             <Trash2 size={15} />
//           </button>
//         )}
//       </div>
//     </td>
//   </tr>
// );

// // ─────────────────────────────────────────────
// // Multi-Select Chip Picker
// // ─────────────────────────────────────────────
// const MultiSelectPicker = ({ options, selectedIds, onToggle, loading, placeholder }) => {
//   const [search, setSearch] = useState("");
//   const filtered = options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()));
//   const selectedSet = new Set(selectedIds);
//   return (
//     <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50">
//       <div className="relative border-b border-slate-200">
//         <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
//         <input value={search} onChange={e => setSearch(e.target.value)} placeholder={placeholder || "Search…"}
//           className="w-full pl-9 pr-4 py-2.5 bg-white text-sm text-slate-700 font-medium focus:outline-none" />
//       </div>
//       <div className="max-h-40 overflow-y-auto">
//         {loading ? (
//           <div className="flex items-center justify-center py-6 text-slate-400 text-xs font-bold gap-2">
//             <div className="w-4 h-4 border-2 border-slate-200 border-t-[#4CA1AF] rounded-full animate-spin" />Loading…
//           </div>
//         ) : filtered.length === 0 ? (
//           <p className="text-center py-6 text-slate-400 text-xs font-bold">No options found</p>
//         ) : (
//           filtered.map(o => {
//             const active = selectedSet.has(o.value);
//             return (
//               <button key={o.value} type="button" onClick={() => onToggle(o.value)}
//                 className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium transition-all cursor-pointer border-b border-slate-100 last:border-0 ${active ? "bg-[rgba(76,161,175,0.08)] text-[#315169]" : "bg-white text-slate-600 hover:bg-slate-50"}`}>
//                 <span>{o.label}</span>
//                 {active && (
//                   <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#4CA1AF" }}>
//                     <Check size={11} color="#fff" />
//                   </span>
//                 )}
//               </button>
//             );
//           })
//         )}
//       </div>
//       {selectedIds.length > 0 && (
//         <div className="flex flex-wrap gap-1.5 px-3 py-2.5 border-t border-slate-200 bg-white">
//           {selectedIds.map(id => {
//             const opt = options.find(o => o.value === id);
//             return (
//               <span key={id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
//                 style={{ backgroundColor: "rgba(76,161,175,0.1)", color: "#315169" }}>
//                 {opt?.label || id}
//                 <button type="button" onClick={() => onToggle(id)} className="hover:text-red-500 cursor-pointer"><X size={10} /></button>
//               </span>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// };

// const YEAR_OPTIONS = [
//   { value: 1, label: "Year 1 — First Year"  },
//   { value: 2, label: "Year 2 — Second Year" },
//   { value: 3, label: "Year 3 — Third Year"  },
//   { value: 4, label: "Year 4 — Fourth Year" },
// ];

// // ─────────────────────────────────────────────
// // Create / Edit Notification Modal
// // ─────────────────────────────────────────────
// const NotificationFormModal = ({ initial, onClose, onSubmit, saving, token }) => {
//   const isEdit = !!initial?.notificationId;
//   const [form, setForm] = useState({
//     sourceType:        initial?.sourceType       || "SYSTEM",
//     sourceId:          initial?.sourceId         ?? "",
//     notificationTitle: initial?.title            || "",
//     message:           initial?.message          || "",
//     notificationType:  initial?.notificationType || "GLOBAL",
//     targetType:        initial?.targetType       || "GLOBAL",
//     targetedIds:       initial?.targetIds        || [],
//     validUntil:        toPickerValue(initial?.validUntil),
//   });
//   const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

//   const [clubs,        setClubs]        = useState([]);
//   const [depts,        setDepts]        = useState([]);
//   const [loadingClubs, setLoadingClubs] = useState(false);
//   const [loadingDepts, setLoadingDepts] = useState(false);

//   const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

//   const ensureClubs = useCallback(async () => {
//     if (clubs.length > 0 || loadingClubs) return;
//     setLoadingClubs(true);
//     try {
//       const res = await axios.get(`${BASE_URL}/api/clubs`, authHeaders);
//       const list = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];
//       setClubs(list.filter(c => c.isActive !== false));
//     } catch { /* silently fail */ }
//     finally { setLoadingClubs(false); }
//   }, [clubs.length, loadingClubs, token]);

//   const ensureDepts = useCallback(async () => {
//     if (depts.length > 0 || loadingDepts) return;
//     setLoadingDepts(true);
//     try {
//       const res = await axios.get(`${BASE_URL}/api/department`, authHeaders);
//       const list = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];
//       setDepts(list.filter(d => d.isActive !== false));
//     } catch { /* silently fail */ }
//     finally { setLoadingDepts(false); }
//   }, [depts.length, loadingDepts, token]);

//   useEffect(() => {
//     if (form.sourceType === "CLUB"       || form.targetType === "CLUB")       ensureClubs();
//     if (form.sourceType === "DEPARTMENT" || form.targetType === "DEPARTMENT") ensureDepts();
//   }, [form.sourceType, form.targetType]);

//   const clubOptions = clubs.map(c => ({ value: c.clubId,       label: c.clubName }));
//   const deptOptions = depts.map(d => ({ value: d.departmentId, label: d.name     }));
//   const sourceOptions = form.sourceType === "CLUB" ? clubOptions : form.sourceType === "DEPARTMENT" ? deptOptions : [];
//   const targetOptions = form.targetType === "CLUB" ? clubOptions : form.targetType === "DEPARTMENT" ? deptOptions : form.targetType === "YEAR" ? YEAR_OPTIONS : [];
//   const needsSourceDropdown = ["CLUB", "DEPARTMENT"].includes(form.sourceType);
//   const needsTargetPicker   = ["CLUB", "DEPARTMENT", "YEAR"].includes(form.targetType);

//   const toggleTargetId = (id) =>
//     set("targetedIds", form.targetedIds.includes(id) ? form.targetedIds.filter(i => i !== id) : [...form.targetedIds, id]);

//   const handleSourceTypeChange = (v) => { set("sourceType", v); set("sourceId", ""); };
//   const handleTargetTypeChange = (v) => { set("targetType", v); set("targetedIds", []); };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     onSubmit({ ...form, sourceId: form.sourceId !== "" ? Number(form.sourceId) : undefined, validUntil: form.validUntil ? form.validUntil + ":00" : undefined });
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
//       <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
//         <div className="px-7 py-6 flex items-center justify-between border-b border-slate-100"
//           style={{ background: "linear-gradient(135deg, rgba(76,161,175,0.07), rgba(49,81,105,0.05))" }}>
//           <div>
//             <h3 className="text-lg font-black text-slate-800">{isEdit ? "Edit Notification" : "Create Notification"}</h3>
//             <p className="text-xs text-slate-400 mt-0.5">{isEdit ? "Update notification details" : "Send a new notification to users"}</p>
//           </div>
//           <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all cursor-pointer"><X size={18} /></button>
//         </div>

//         <div className="flex-1 overflow-y-auto px-7 py-5">
//           <form id="notif-form" onSubmit={handleSubmit} className="space-y-4">
//             <FormField label="Title *">
//               <input required value={form.notificationTitle} onChange={e => set("notificationTitle", e.target.value)}
//                 placeholder="Enter notification title..."
//                 className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:outline-none focus:border-[#4CA1AF] focus:ring-2 focus:ring-[rgba(76,161,175,0.2)] transition-all" />
//             </FormField>
//             <FormField label="Message *">
//               <textarea required value={form.message} onChange={e => set("message", e.target.value)}
//                 placeholder="Write your notification message..." rows={3}
//                 className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:outline-none focus:border-[#4CA1AF] focus:ring-2 focus:ring-[rgba(76,161,175,0.2)] transition-all resize-none" />
//             </FormField>
//             <div className="grid grid-cols-2 gap-3">
//               <FormField label="Notification Type *">
//                 <SelectField value={form.notificationType} onChange={v => set("notificationType", v)} options={NOTIFICATION_TYPES} />
//               </FormField>
//               <FormField label="Source Type *">
//                 <SelectField value={form.sourceType} onChange={handleSourceTypeChange} options={SOURCE_TYPES} />
//               </FormField>
//             </div>
//             {needsSourceDropdown && (
//               <FormField label={`Source ${form.sourceType === "CLUB" ? "Club" : "Department"} *`}>
//                 {(form.sourceType === "CLUB" ? loadingClubs : loadingDepts) ? (
//                   <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-400">
//                     <div className="w-4 h-4 border-2 border-slate-200 border-t-[#4CA1AF] rounded-full animate-spin" />
//                     Loading {form.sourceType === "CLUB" ? "clubs" : "departments"}…
//                   </div>
//                 ) : (
//                   <CustomSelect name="sourceId" value={String(form.sourceId)} onChange={e => set("sourceId", e.target.value)}
//                     options={[{ value: "", label: `— Select ${form.sourceType === "CLUB" ? "Club" : "Department"} —` }, ...sourceOptions.map(o => ({ value: String(o.value), label: o.label }))]}
//                     placeholder={`Select ${form.sourceType === "CLUB" ? "club" : "department"}`} />
//                 )}
//               </FormField>
//             )}
//             <FormField label="Target Type *">
//               <SelectField value={form.targetType} onChange={handleTargetTypeChange} options={TARGET_TYPES} />
//             </FormField>
//             {needsTargetPicker && (
//               <FormField label={`Target ${form.targetType === "CLUB" ? "Clubs" : form.targetType === "DEPARTMENT" ? "Departments" : "Years"} * (select one or more)`}>
//                 <MultiSelectPicker
//                   options={targetOptions}
//                   selectedIds={form.targetedIds}
//                   onToggle={toggleTargetId}
//                   loading={(form.targetType === "CLUB" && loadingClubs) || (form.targetType === "DEPARTMENT" && loadingDepts)}
//                   placeholder={`Search ${form.targetType.toLowerCase()}s…`}
//                 />
//                 {form.targetedIds.length === 0 && (
//                   <p className="mt-1.5 text-[11px] text-amber-500 font-bold">⚠ Select at least one {form.targetType.toLowerCase()}</p>
//                 )}
//               </FormField>
//             )}
//             <FormField label="Valid Until">
//               <DateTimePicker value={form.validUntil} onChange={(v) => set("validUntil", v)} placeholder="Select validity date and time" />
//             </FormField>
//           </form>
//         </div>

//         <div className="px-7 py-5 border-t border-slate-100 flex gap-3">
//           <button onClick={onClose} className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all cursor-pointer">Cancel</button>
//           <button form="notif-form" type="submit" disabled={saving}
//             className="flex-1 py-3 rounded-2xl text-white font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
//             style={{ background: "linear-gradient(135deg, #4CA1AF, #315169)" }}>
//             {saving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving…</> : <><Send size={15} /> {isEdit ? "Update" : "Send Notification"}</>}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// const FormField = ({ label, children }) => (
//   <div>
//     <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{label}</label>
//     {children}
//   </div>
// );

// const SelectField = ({ value, onChange, options }) => (
//   <CustomSelect name="selectField" value={value} onChange={(e) => onChange(e.target.value)}
//     options={options.map((o) => ({ value: o, label: o.replace(/_/g, " ") }))} placeholder="Select option" />
// );

// const PAGE_BG_ANIMATION_STYLES = `
//   @keyframes blob {
//     0% { transform: translate(0px, 0px) scale(1); }
//     33% { transform: translate(30px, -50px) scale(1.1); }
//     66% { transform: translate(-20px, 20px) scale(0.9); }
//     100% { transform: translate(0px, 0px) scale(1); }
//   }
//   .animate-blob { animation: blob 7s infinite; }
//   .animation-delay-2000 { animation-delay: 2s; }
//   .animation-delay-4000 { animation-delay: 4s; }
// `;

// // ─────────────────────────────────────────────
// // Filter Bar
// // ─────────────────────────────────────────────
// const FilterBar = ({ search, onSearch, typeFilter, onType, activeFilter, onActiveFilter, showActiveFilter = true }) => (
//   <div className="flex flex-col sm:flex-row gap-3 mb-6">
//     <div className="relative flex-1">
//       <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
//       <input value={search} onChange={e => onSearch(e.target.value)} placeholder="Search notifications..."
//         className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:outline-none focus:border-[#4CA1AF] focus:ring-2 focus:ring-[rgba(76,161,175,0.15)] transition-all shadow-sm" />
//     </div>
//     <div className="w-full sm:w-48">
//       <CustomSelect name="notificationTypeFilter" value={typeFilter} onChange={(e) => onType(e.target.value)}
//         options={[{ value: "", label: "All Types" }, ...NOTIFICATION_TYPES.map((t) => ({ value: t, label: t.replace(/_/g, " ") }))]}
//         placeholder="All Types" />
//     </div>
//     {showActiveFilter && (
//       <div className="flex rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden shrink-0">
//         {[
//           { value: "true",  label: "Active",   activeClass: "text-emerald-700 bg-emerald-50" },
//           { value: "false", label: "Inactive", activeClass: "text-amber-700 bg-amber-50" },
//           { value: "all",   label: "All",      activeClass: "text-[#4CA1AF] bg-[rgba(76,161,175,0.08)]" },
//         ].map(({ value, label, activeClass }) => (
//           <button key={value} onClick={() => onActiveFilter(value)}
//             className={`px-4 py-3 text-sm font-bold transition-all cursor-pointer border-r last:border-r-0 border-slate-200 whitespace-nowrap ${activeFilter === value ? activeClass : "text-slate-400 hover:text-slate-600"}`}>
//             {label}
//           </button>
//         ))}
//       </div>
//     )}
//   </div>
// );

// // ─────────────────────────────────────────────
// // Stats Row
// // ─────────────────────────────────────────────
// const StatsRow = ({ stats }) => (
//   <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
//     {stats.map(({ label, value, icon, color, bg }) => (
//       <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-all">
//         <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: bg, color }}>{icon}</div>
//         <div>
//           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
//           <p className="text-2xl font-black text-slate-800">{value ?? "—"}</p>
//         </div>
//       </div>
//     ))}
//   </div>
// );

// // ─────────────────────────────────────────────
// // Tab Bar
// // ─────────────────────────────────────────────
// const TabBar = ({ tabs, active, onChange }) => (
//   <div className="flex bg-white rounded-2xl border border-slate-200 shadow-sm p-1.5 mb-6 w-fit flex-wrap gap-1">
//     {tabs.map(({ id, icon, label, badge }) => (
//       <button key={id} onClick={() => onChange(id)}
//         className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer"
//         style={active === id ? { background: "linear-gradient(135deg, #4CA1AF, #315169)", color: "#fff" } : { color: "#64748b" }}>
//         {icon}{label}
//         {badge > 0 && <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center">{badge}</span>}
//       </button>
//     ))}
//   </div>
// );

// // ─────────────────────────────────────────────
// // Page Shell
// // ─────────────────────────────────────────────
// const PageShell = ({ title, subtitle, icon, roleLabel, children, headerRight }) => {
//   const navigate = useNavigate();
//   return (
//     <div className="min-h-screen font-sans bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative">
//       <style dangerouslySetInnerHTML={{ __html: PAGE_BG_ANIMATION_STYLES }} />
//       <div className="fixed inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-25 animate-blob"></div>
//         <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-25 animate-blob animation-delay-2000" style={{ backgroundColor: "#4CA1AF" }}></div>
//         <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-25 animate-blob animation-delay-4000"></div>
//       </div>
//       <div className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-sm">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex items-center justify-between h-14">
//             {/* <button onClick={() => navigate("/dashboard")}
//               className="flex items-center gap-2 text-sm text-slate-500 hover:text-[#4CA1AF] transition-colors group cursor-pointer">
//               <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" style={{ color: "#4CA1AF" }} />
//               Back to Dashboard
//             </button> */}
//                   <button
//         onClick={() => navigate("/dashboard")}
//         className="group flex items-center gap-2 sm:gap-3 border border-white/20 hover:border-white/40 font-medium rounded-full py-2 sm:py-2.5 px-4 sm:px-5 transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer"
//         style={{ background: "var(--primary-gradient)", color: "white" }}
//       >
//         <svg
//           className="w-4 sm:w-5 h-4 sm:h-5 text-white transform group-hover:scale-110 transition-transform"
//           fill="none"
//           viewBox="0 0 24 24"
//           stroke="currentColor"
//         >
//           <path
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             strokeWidth={2.5}
//             d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
//           />
//         </svg>
//         <span className="text-xs sm:text-sm hidden xs:inline">Dashboard</span>
//       </button>
//             <span className="hidden sm:flex items-center gap-2 text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full"
//               style={{ color: "#4CA1AF", backgroundColor: "rgba(76,161,175,0.1)" }}>
//               {icon}{roleLabel}
//             </span>
//           </div>
//         </div>
//       </div>
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
//           <div>
//             <div className="pb-2">
//               <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight"
//                 style={{ background: "linear-gradient(135deg, #4CA1AF, #162F38)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
//                 {title}
//               </h1>
//             </div>
//             <p className="text-slate-500 font-medium mt-1">{subtitle}</p>
//           </div>
//           {headerRight && <div>{headerRight}</div>}
//         </div>
//         {children}
//       </div>
//     </div>
//   );
// };

// // ─────────────────────────────────────────────
// // Manage Table (server-side paged)
// // ─────────────────────────────────────────────
// const ManageTable = ({
//   token,
//   showCheckboxes   = false,
//   showReadStatus   = false,
//   showFullMessage  = false,
//   showActiveFilter = true,
//   fetchMode        = "all",
//   onEdit,
//   onTrigger,
//   onToggle,
//   onDelete,
//   onMarkRead,
//   refreshSignal,
// }) => {
//   const [data,         setData]         = useState({ content: [], totalElements: 0 });
//   const [loading,      setLoading]      = useState(true);
//   const [page,         setPage]         = useState(0);
//   const [search,       setSearch]       = useState("");
//   const [typeFilter,   setTypeFilter]   = useState("");
//   const [activeFilter, setActiveFilter] = useState("true");
//   const [selectedIds,  setSelectedIds]  = useState(new Set());

//   const fetchData = useCallback(async (pg = 0) => {
//     setLoading(true);
//     try {
//       if (fetchMode === "created-by-me") {
//         const res = await axios.get(
//           `${BASE_URL}/api/notification/cr/created-by-me/paged?page=${pg}&size=${PAGE_SIZE}`,
//           { headers: { Authorization: `Bearer ${token}` } }
//         );
//         const pageData = res.data?.data || res.data;
//         setData({ content: pageData?.content || [], totalElements: pageData?.totalElements || 0 });
//       } else if (activeFilter === "all") {
//         const [activeRes, inactiveRes] = await Promise.all([
//           axios.get(`${BASE_URL}/api/notification/paged?active=true&page=0&size=1000`,  { headers: { Authorization: `Bearer ${token}` } }),
//           axios.get(`${BASE_URL}/api/notification/paged?active=false&page=0&size=1000`, { headers: { Authorization: `Bearer ${token}` } }),
//         ]);
//         const extract = (r) => r.data?.data?.content || r.data?.content || [];
//         const all = [...extract(activeRes), ...extract(inactiveRes)].sort((a, b) => {
//           const da = parseBackendDate(a.createdAt), db = parseBackendDate(b.createdAt);
//           return (db?.getTime() || 0) - (da?.getTime() || 0);
//         });
//         setData({ content: all.slice(pg * PAGE_SIZE, (pg + 1) * PAGE_SIZE), totalElements: all.length });
//       } else {
//         const res = await axios.get(
//           `${BASE_URL}/api/notification/paged?active=${activeFilter}&page=${pg}&size=${PAGE_SIZE}`,
//           { headers: { Authorization: `Bearer ${token}` } }
//         );
//         const pageData = res.data?.data || res.data;
//         setData({ content: pageData?.content || [], totalElements: pageData?.totalElements || 0 });
//       }
//     } catch (e) {
//       console.error("Failed to fetch notifications", e);
//     } finally {
//       setLoading(false);
//     }
//   }, [token, activeFilter, fetchMode]);

//   useEffect(() => { setPage(0); }, [activeFilter, typeFilter, search]);
//   useEffect(() => { fetchData(page); }, [fetchData, page, refreshSignal]);

//   const filtered = data.content.filter(n => {
//     const s = search.toLowerCase();
//     return (!search || n.title?.toLowerCase().includes(s) || n.message?.toLowerCase().includes(s)) &&
//            (!typeFilter || n.notificationType === typeFilter);
//   });

//   const toggleSelect     = (id) => setSelectedIds(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
//   const selectAll        = () => setSelectedIds(new Set(filtered.map(n => n.notificationId)));
//   const clearSelect      = () => setSelectedIds(new Set());
//   const handlePageChange = (pg) => { setPage(pg); setSelectedIds(new Set()); };

//   const handleMarkRead = async (id) => {
//     if (onMarkRead) await onMarkRead(id);
//     setData(d => ({ ...d, content: d.content.map(x => x.notificationId === id ? { ...x, isRead: true } : x) }));
//   };

//   return (
//     <>
//       <FilterBar search={search} onSearch={setSearch} typeFilter={typeFilter} onType={setTypeFilter}
//         activeFilter={activeFilter} onActiveFilter={v => { setActiveFilter(v); setPage(0); }}
//         showActiveFilter={showActiveFilter} />

//       {selectedIds.size > 0 && (
//         <div className="mb-4 flex items-center gap-3 px-5 py-3.5 bg-[rgba(76,161,175,0.07)] border border-[rgba(76,161,175,0.2)] rounded-2xl">
//           <span className="text-sm font-black text-[#4CA1AF]">{selectedIds.size} selected</span>
//           <button onClick={clearSelect} className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer">Clear</button>
//         </div>
//       )}

//       <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
//         {loading ? <Loader /> : filtered.length === 0 ? (
//           <EmptyState icon={<BellOff size={36} />} title="No notifications found" subtitle="Try adjusting your filters or create a new notification."
//             action={onEdit && (
//               <button onClick={() => onEdit(null)} className="flex items-center gap-2 px-5 py-3 rounded-2xl text-white text-sm font-bold cursor-pointer"
//                 style={{ background: "linear-gradient(135deg, #4CA1AF, #315169)" }}>
//                 <Plus size={15} /> Create Notification
//               </button>
//             )} />
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead>
//                 <tr className="bg-slate-50 border-b border-slate-100">
//                   {showCheckboxes && (
//                     <th className="pl-5 pr-3 py-4">
//                       <input type="checkbox"
//                         onChange={e => e.target.checked ? selectAll() : clearSelect()}
//                         checked={filtered.length > 0 && filtered.every(n => selectedIds.has(n.notificationId))}
//                         className="w-4 h-4 rounded cursor-pointer accent-[#4CA1AF]" />
//                     </th>
//                   )}
//                   <th className="px-4 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Notification</th>
//                   <th className="px-4 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest hidden sm:table-cell">Type</th>
//                   <th className="px-4 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest hidden md:table-cell">
//                     {showReadStatus ? "Read" : "Status"}
//                   </th>
//                   <th className="px-4 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest hidden lg:table-cell">Created</th>
//                   <th className="px-4 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest hidden lg:table-cell">Expires</th>
//                   <th className="px-4 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filtered.map(n => (
//                   <AdminNotifRow key={n.notificationId} notif={n}
//                     showCheckbox={showCheckboxes} checked={selectedIds.has(n.notificationId)} onCheck={() => toggleSelect(n.notificationId)}
//                     showReadStatus={showReadStatus} showFullMessage={showFullMessage}
//                     onMarkRead={showReadStatus ? handleMarkRead : undefined}
//                     onEdit={onEdit} onTrigger={onTrigger} onToggle={onToggle} onDelete={onDelete} />
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//       <Pagination totalElements={data.totalElements} page={page} pageSize={PAGE_SIZE} onPage={handlePageChange} />
//     </>
//   );
// };

// // ─────────────────────────────────────────────
// // My Notifications Panel — User & Teacher
// // Uses /api/notification/me/paged
// // ─────────────────────────────────────────────
// const MyNotificationsPanel = ({ token, onMarkRead, onMarkAllRead, refreshSignal }) => {
//   const [data,       setData]       = useState({ content: [], totalElements: 0 });
//   const [loading,    setLoading]    = useState(true);
//   const [page,       setPage]       = useState(0);
//   const [search,     setSearch]     = useState("");
//   const [typeFilter, setTypeFilter] = useState("");
//   const [activeTab,  setActiveTab]  = useState("unread");

//   const fetchData = useCallback(async (pg = 0) => {
//     setLoading(true);
//     try {
//       const res = await axios.get(
//         `${BASE_URL}/api/notification/me/paged?page=${pg}&size=${PAGE_SIZE}`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       const pageData = res.data?.data || res.data;
//       setData({ content: pageData?.content || [], totalElements: pageData?.totalElements || 0 });
//     } catch (e) {
//       console.error("Failed to fetch my notifications", e);
//     } finally {
//       setLoading(false);
//     }
//   }, [token]);

//   // Normal page-change fetch
//   useEffect(() => { fetchData(page); }, [fetchData, page]);

//   // ── Mark-all-read signal from parent ──────────────────────────────────────
//   // 1. Optimistically flip every card to isRead = true immediately (no flicker)
//   // 2. Re-fetch in the background so the data stays in sync with the server
//   useEffect(() => {
//     if (refreshSignal > 0) {
//       setData(d => ({
//         ...d,
//         content: d.content.map(n => ({ ...n, isRead: true })),
//       }));
//       const t = setTimeout(() => fetchData(page), 300);
//       return () => clearTimeout(t);
//     }
//   }, [refreshSignal]);

//   // Mark a single notification read — optimistic update only, parent handles API call
//   const handleMarkRead = async (id) => {
//     await onMarkRead(id);
//     setData(d => ({
//       ...d,
//       content: d.content.map(x => x.notificationId === id ? { ...x, isRead: true } : x),
//     }));
//   };

//   const filtered = data.content.filter(n => {
//     const s = search.toLowerCase();
//     return (!search || n.title?.toLowerCase().includes(s) || n.message?.toLowerCase().includes(s)) &&
//            (!typeFilter || n.notificationType === typeFilter);
//   });

//   const unreadList  = filtered.filter(n => !n.isRead);
//   const readList    = filtered.filter(n => n.isRead);
//   const visibleList = activeTab === "unread" ? unreadList : readList;

//   return (
//     <>
//       {/* Unread / Read sub-tabs */}
//       <div className="flex items-center gap-2 mb-4">
//         {[{ id: "unread", label: "Unread" }, { id: "read", label: "Read" }].map(({ id, label }) => (
//           <button key={id} onClick={() => setActiveTab(id)}
//             className="px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer border"
//             style={activeTab === id
//               ? { background: "linear-gradient(135deg, #4CA1AF, #315169)", color: "#fff", borderColor: "transparent" }
//               : { backgroundColor: "#fff", borderColor: "#e2e8f0", color: "#64748b" }}>
//             {label}
//           </button>
//         ))}
//       </div>

//       <FilterBar search={search} onSearch={setSearch} typeFilter={typeFilter} onType={setTypeFilter} showActiveFilter={false} />

//       {loading ? <Loader /> : visibleList.length === 0 ? (
//         <EmptyState icon={<BellOff size={36} />}
//           title={activeTab === "unread" ? "All caught up!" : "No read notifications"}
//           subtitle={activeTab === "unread" ? "You have no unread notifications." : "Notifications you've read will appear here."} />
//       ) : (
//         <>
//           <div className="space-y-3">
//             {visibleList.map(n => <NotificationCard key={n.notificationId} notif={n} onMarkRead={handleMarkRead} />)}
//           </div>
//           <Pagination totalElements={data.totalElements} page={page} pageSize={PAGE_SIZE} onPage={p => setPage(p)} />
//         </>
//       )}
//     </>
//   );
// };

// // ─────────────────────────────────────────────
// // Admin My Notifications Panel — Super Admin
// // Uses /api/notification/admin/read-unread/paged
// // ─────────────────────────────────────────────
// const AdminMyNotificationsPanel = ({ token, onMarkRead, onMarkAllRead, refreshSignal }) => {
//   const [readData,   setReadData]   = useState({ content: [], totalElements: 0 });
//   const [unreadData, setUnreadData] = useState({ content: [], totalElements: 0 });
//   const [loading,    setLoading]    = useState(true);
//   const [readPage,   setReadPage]   = useState(0);
//   const [unreadPage, setUnreadPage] = useState(0);
//   const [search,     setSearch]     = useState("");
//   const [typeFilter, setTypeFilter] = useState("");
//   const [activeTab,  setActiveTab]  = useState("unread");

//   const fetchData = useCallback(async (rPage = 0, uPage = 0) => {
//     setLoading(true);
//     try {
//       const currentPage = activeTab === "read" ? rPage : uPage;
//       const res = await axios.get(
//         `${BASE_URL}/api/notification/admin/read-unread/paged?page=${currentPage}&size=${PAGE_SIZE}`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       const data = res.data?.data || res.data;
//       setReadData({   content: data?.read?.content        || [], totalElements: data?.read?.totalElements   || 0 });
//       setUnreadData({ content: data?.unread?.content      || [], totalElements: data?.unread?.totalElements || 0 });
//     } catch (e) {
//       console.error("Failed to fetch admin read/unread notifications", e);
//     } finally {
//       setLoading(false);
//     }
//   }, [token, activeTab]);

//   useEffect(() => { fetchData(readPage, unreadPage); }, [fetchData, refreshSignal, readPage, unreadPage]);

//   // ── Mark single as read — move item from unread bucket to read bucket ──────
//   const handleMarkRead = async (id) => {
//     await onMarkRead(id);
//     setUnreadData(prev => {
//       const item = prev.content.find(x => x.notificationId === id);
//       if (item) {
//         setReadData(r => ({
//           content: [{ ...item, isRead: true }, ...r.content],
//           totalElements: r.totalElements + 1,
//         }));
//       }
//       return {
//         content:       prev.content.filter(x => x.notificationId !== id),
//         totalElements: Math.max(0, prev.totalElements - 1),
//       };
//     });
//   };

//   // ── Mark ALL as read — flush unread into read bucket, then re-sync ─────────
//   const handleMarkAllRead = async () => {
//     await onMarkAllRead();
//     setUnreadData(prev => {
//       setReadData(r => ({
//         content:       [...prev.content.map(n => ({ ...n, isRead: true })), ...r.content],
//         totalElements: r.totalElements + prev.totalElements,
//       }));
//       return { content: [], totalElements: 0 };
//     });
//     // Re-fetch after a short delay to stay in sync with backend
//     const t = setTimeout(() => fetchData(readPage, unreadPage), 300);
//     return () => clearTimeout(t);
//   };

//   const activeContent = activeTab === "unread" ? unreadData : readData;

//   const filtered = activeContent.content.filter(n => {
//     const s = search.toLowerCase();
//     return (!search || n.title?.toLowerCase().includes(s) || n.message?.toLowerCase().includes(s)) &&
//            (!typeFilter || n.notificationType === typeFilter);
//   });

//   return (
//     <>
//       {/* Read / Unread sub-tabs + mark-all button */}
//       <div className="flex items-center gap-2 mb-5">
//         {[
//           { id: "unread", label: "Unread", count: unreadData.totalElements, dotColor: "bg-[#4CA1AF]" },
//           { id: "read",   label: "Read",   count: readData.totalElements,   dotColor: "bg-slate-400" },
//         ].map(({ id, label, count, dotColor }) => (
//           <button key={id} onClick={() => { setActiveTab(id); setReadPage(0); setUnreadPage(0); }}
//             className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer border"
//             style={activeTab === id
//               ? { background: "linear-gradient(135deg, #4CA1AF, #315169)", color: "#fff", borderColor: "transparent" }
//               : { backgroundColor: "#fff", borderColor: "#e2e8f0", color: "#64748b" }}>
//             <span className={`w-2 h-2 rounded-full ${dotColor}`} />
//             {label}
//             <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${activeTab === id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
//               {count}
//             </span>
//           </button>
//         ))}

//         {unreadData.totalElements > 0 && (
//           <button onClick={handleMarkAllRead}
//             className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white cursor-pointer hover:opacity-90 transition-all"
//             style={{ background: "linear-gradient(135deg, #4CA1AF, #315169)" }}>
//             <CheckCheck size={14} /> Mark all read
//           </button>
//         )}
//       </div>

//       <FilterBar search={search} onSearch={setSearch} typeFilter={typeFilter} onType={setTypeFilter} showActiveFilter={false} />

//       <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
//         {loading ? <Loader /> : filtered.length === 0 ? (
//           <EmptyState icon={<BellOff size={36} />}
//             title={activeTab === "unread" ? "All caught up!" : "No read notifications"}
//             subtitle={activeTab === "unread" ? "You have no unread notifications." : "Notifications you've read will appear here."} />
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead>
//                 <tr className="bg-slate-50 border-b border-slate-100">
//                   <th className="px-4 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Notification</th>
//                   <th className="px-4 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest hidden sm:table-cell">Type</th>
//                   <th className="px-4 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest hidden md:table-cell">Status</th>
//                   <th className="px-4 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest hidden lg:table-cell">Created</th>
//                   <th className="px-4 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest hidden lg:table-cell">Expires</th>
//                   <th className="px-4 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filtered.map(n => (
//                   <AdminNotifRow key={n.notificationId} notif={n}
//                     showCheckbox={false} checked={false} onCheck={() => {}}
//                     showReadStatus showFullMessage
//                     onMarkRead={activeTab === "unread" ? handleMarkRead : undefined} />
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//       <Pagination
//         totalElements={activeContent.totalElements}
//         page={activeTab === "unread" ? unreadPage : readPage}
//         pageSize={PAGE_SIZE}
//         onPage={(pg) => { if (activeTab === "unread") setUnreadPage(pg); else setReadPage(pg); }}
//       />
//     </>
//   );
// };

// // ─────────────────────────────────────────────
// // USER Notifications View
// // ─────────────────────────────────────────────
// const UserNotifications = () => {
//   const token = localStorage.getItem("token");
//   const [toast,         setToast]         = useState(null);
//   const [unreadCount,   setUnreadCount]   = useState(0);
//   const [refreshSignal, setRefreshSignal] = useState(0);

//   useEffect(() => {
//     axios.get(`${BASE_URL}/api/notification/me/unread-count`, { headers: { Authorization: `Bearer ${token}` } })
//       .then(res => setUnreadCount(res.data?.data ?? res.data ?? 0))
//       .catch(() => {});
//   }, [token]);

//   const markRead = async (id) => {
//     try {
//       await axios.patch(`${BASE_URL}/api/notification/${id}/read`, {}, { headers: { Authorization: `Bearer ${token}` } });
//       setUnreadCount(c => Math.max(0, c - 1));
//     } catch { setToast({ msg: "Failed to mark as read", type: "error" }); }
//   };

//   const markAllRead = async () => {
//     try {
//       await axios.patch(`${BASE_URL}/api/notification/me/read-all`, {}, { headers: { Authorization: `Bearer ${token}` } });
//       setUnreadCount(0);
//       setRefreshSignal(s => s + 1); // ← tells MyNotificationsPanel to flush + re-fetch
//       setToast({ msg: "All notifications marked as read", type: "success" });
//     } catch { setToast({ msg: "Failed to mark all as read", type: "error" }); }
//   };

//   return (
//     <PageShell title="Notifications" subtitle="Stay updated with announcements, reminders, and club activity"
//       icon={<User size={12} />} roleLabel="Student"
//       headerRight={unreadCount > 0 && (
//         <button onClick={markAllRead}
//           className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold text-white cursor-pointer shadow-md hover:opacity-90 transition-all"
//           style={{ background: "linear-gradient(135deg, #4CA1AF, #315169)" }}>
//           <CheckCheck size={15} /> Mark all read ({unreadCount})
//         </button>
//       )}>
//       {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
//       <MyNotificationsPanel
//         token={token}
//         onMarkRead={markRead}
//         onMarkAllRead={markAllRead}
//         refreshSignal={refreshSignal}
//       />
//     </PageShell>
//   );
// };

// // ─────────────────────────────────────────────
// // TEACHER Notifications View
// // ─────────────────────────────────────────────
// const TeacherNotifications = () => {
//   const token = localStorage.getItem("token");
//   const [toast,         setToast]         = useState(null);
//   const [tab,           setTab]           = useState("my");
//   const [saving,        setSaving]        = useState(false);
//   const [showForm,      setShowForm]      = useState(false);
//   const [editNotif,     setEditNotif]     = useState(null);
//   const [refreshSignal, setRefreshSignal] = useState(0);
//   const [unreadCount,   setUnreadCount]   = useState(0);
//   const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: "", message: "", confirmText: "Confirm", variant: "primary", onConfirm: () => {} });
//   const closeConfirm = () => setConfirmDialog(p => ({ ...p, isOpen: false }));

//   useEffect(() => {
//     axios.get(`${BASE_URL}/api/notification/me/unread-count`, { headers: { Authorization: `Bearer ${token}` } })
//       .then(res => setUnreadCount(res.data?.data ?? res.data ?? 0))
//       .catch(() => {});
//   }, [token]);

//   const markRead = async (id) => {
//     try {
//       await axios.patch(`${BASE_URL}/api/notification/${id}/read`, {}, { headers: { Authorization: `Bearer ${token}` } });
//       setUnreadCount(c => Math.max(0, c - 1));
//     } catch { setToast({ msg: "Failed to mark as read", type: "error" }); }
//   };

//   const markAllRead = async () => {
//     try {
//       await axios.patch(`${BASE_URL}/api/notification/me/read-all`, {}, { headers: { Authorization: `Bearer ${token}` } });
//       setUnreadCount(0);
//       setRefreshSignal(s => s + 1); // ← tells MyNotificationsPanel to flush + re-fetch
//       setToast({ msg: "All marked as read", type: "success" });
//     } catch { setToast({ msg: "Failed", type: "error" }); }
//   };

//   const createOrUpdate = async (data) => {
//     setSaving(true);
//     try {
//       if (editNotif) {
//         await axios.patch(`${BASE_URL}/api/notification/${editNotif.notificationId}`,
//           { notificationTitle: data.notificationTitle, message: data.message, validUntil: data.validUntil, notificationType: data.notificationType },
//           { headers: { Authorization: `Bearer ${token}` } });
//         setToast({ msg: "Notification updated", type: "success" });
//       } else {
//         await axios.post(`${BASE_URL}/api/notification`, data, { headers: { Authorization: `Bearer ${token}` } });
//         setToast({ msg: "Notification created", type: "success" });
//       }
//       setShowForm(false); setEditNotif(null);
//       setRefreshSignal(s => s + 1);
//     } catch { setToast({ msg: "Failed to save notification", type: "error" }); }
//     finally { setSaving(false); }
//   };

//   const toggleActive = async (notif) => {
//     try {
//       await axios.patch(`${BASE_URL}/api/notification/${notif.notificationId}/${notif.isActive ? "deactivate" : "reactivate"}`, {}, { headers: { Authorization: `Bearer ${token}` } });
//       setToast({ msg: `Notification ${notif.isActive ? "deactivated" : "reactivated"}`, type: "success" });
//       setRefreshSignal(s => s + 1);
//     } catch { setToast({ msg: "Failed to toggle status", type: "error" }); }
//   };

//   const deleteNotif = async (notif) => {
//     try {
//       await axios.delete(`${BASE_URL}/api/notification/${notif.notificationId}`, { headers: { Authorization: `Bearer ${token}` } });
//       setToast({ msg: "Notification deleted", type: "success" });
//       setRefreshSignal(s => s + 1);
//     } catch { setToast({ msg: "Failed to delete", type: "error" }); }
//   };

//   const triggerNotif = async (notif) => {
//     try {
//       await axios.get(`${BASE_URL}/api/notification/trigger/${notif.notificationId}`, { headers: { Authorization: `Bearer ${token}` } });
//       setToast({ msg: "Notification triggered successfully", type: "success" });
//       setRefreshSignal(s => s + 1);
//     } catch { setToast({ msg: "Failed to trigger notification", type: "error" }); }
//   };

//   const askToggle  = (notif) => setConfirmDialog({ isOpen: true, title: notif.isActive ? "Deactivate Notification" : "Reactivate Notification", message: notif.isActive ? "This notification will stop being shown to users." : "This notification will become active and visible again.", confirmText: notif.isActive ? "Deactivate" : "Reactivate", variant: notif.isActive ? "danger" : "primary", onConfirm: async () => { closeConfirm(); await toggleActive(notif); } });
//   const askDelete  = (notif) => setConfirmDialog({ isOpen: true, title: "Delete Notification", message: "This action cannot be undone.", confirmText: "Delete", variant: "danger", onConfirm: async () => { closeConfirm(); await deleteNotif(notif); } });
//   const askTrigger = (notif) => setConfirmDialog({ isOpen: true, title: "Trigger Notification", message: "This will immediately trigger this notification.", confirmText: "Trigger", variant: "primary", onConfirm: async () => { closeConfirm(); await triggerNotif(notif); } });

//   return (
//     <PageShell title="Notifications" subtitle="View your notifications and manage club announcements"
//       icon={<GraduationCap size={12} />} roleLabel="Teacher"
//       headerRight={
//         <div className="flex gap-2">
//           {tab === "manage" && (
//             <button onClick={() => { setEditNotif(null); setShowForm(true); }}
//               className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold text-white cursor-pointer shadow-md hover:opacity-90 transition-all"
//               style={{ background: "linear-gradient(135deg, #4CA1AF, #315169)" }}>
//               <Plus size={15} /> New Notification
//             </button>
//           )}
//           {/* Mark all read button lives inside MyNotificationsPanel for teachers */}
//         </div>
//       }>
//       {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
//       {(showForm || editNotif) && (
//         <NotificationFormModal initial={editNotif} onClose={() => { setShowForm(false); setEditNotif(null); }}
//           onSubmit={createOrUpdate} saving={saving} token={token} />
//       )}
//       <ConfirmDialog isOpen={confirmDialog.isOpen} title={confirmDialog.title} message={confirmDialog.message}
//         confirmText={confirmDialog.confirmText} variant={confirmDialog.variant}
//         onConfirm={confirmDialog.onConfirm} onCancel={closeConfirm} />

//       <TabBar active={tab} onChange={t => setTab(t)} tabs={[
//         { id: "my",     icon: <Bell size={14} />, label: "My Notifications", badge: unreadCount },
//         { id: "manage", icon: <Zap size={14} />,  label: "Manage",           badge: 0 },
//       ]} />

//       {tab === "my" ? (
//         <MyNotificationsPanel
//           token={token}
//           onMarkRead={markRead}
//           onMarkAllRead={markAllRead}
//           refreshSignal={refreshSignal}
//         />
//       ) : (
//         <ManageTable token={token} showCheckboxes={false} showActiveFilter={false}
//           fetchMode="created-by-me" refreshSignal={refreshSignal}
//           onEdit={(n) => { setEditNotif(n); setShowForm(true); }}
//           onTrigger={askTrigger} onToggle={askToggle} onDelete={askDelete} />
//       )}
//     </PageShell>
//   );
// };

// // ─────────────────────────────────────────────
// // SUPER ADMIN Notifications View
// // ─────────────────────────────────────────────
// const SuperAdminNotifications = () => {
//   const token = localStorage.getItem("token");
//   const [toast,         setToast]         = useState(null);
//   const [tab,           setTab]           = useState("my");
//   const [saving,        setSaving]        = useState(false);
//   const [showForm,      setShowForm]      = useState(false);
//   const [editNotif,     setEditNotif]     = useState(null);
//   const [refreshSignal, setRefreshSignal] = useState(0);
//   const [unreadCount,   setUnreadCount]   = useState(0);
//   const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: "", message: "", confirmText: "Confirm", variant: "primary", onConfirm: () => {} });
//   const closeConfirm = () => setConfirmDialog(p => ({ ...p, isOpen: false }));

//   useEffect(() => {
//     axios.get(`${BASE_URL}/api/notification/me/unread-count`, { headers: { Authorization: `Bearer ${token}` } })
//       .then(res => setUnreadCount(res.data?.data ?? res.data ?? 0))
//       .catch(() => {});
//   }, [token]);

//   const markRead = async (id) => {
//     try {
//       await axios.patch(`${BASE_URL}/api/notification/${id}/read`, {}, { headers: { Authorization: `Bearer ${token}` } });
//       setUnreadCount(c => Math.max(0, c - 1));
//     } catch { setToast({ msg: "Failed to mark as read", type: "error" }); }
//   };

//   const markAllRead = async () => {
//     try {
//       await axios.patch(`${BASE_URL}/api/notification/me/read-all`, {}, { headers: { Authorization: `Bearer ${token}` } });
//       setUnreadCount(0);
//       setRefreshSignal(s => s + 1); // ← tells AdminMyNotificationsPanel to flush + re-fetch
//       setToast({ msg: "All notifications marked as read", type: "success" });
//     } catch { setToast({ msg: "Failed to mark all as read", type: "error" }); }
//   };

//   const createOrUpdate = async (data) => {
//     setSaving(true);
//     try {
//       if (editNotif) {
//         await axios.patch(`${BASE_URL}/api/notification/${editNotif.notificationId}`,
//           { notificationTitle: data.notificationTitle, message: data.message, validUntil: data.validUntil, notificationType: data.notificationType },
//           { headers: { Authorization: `Bearer ${token}` } });
//         setToast({ msg: "Notification updated", type: "success" });
//       } else {
//         await axios.post(`${BASE_URL}/api/notification`, data, { headers: { Authorization: `Bearer ${token}` } });
//         setToast({ msg: "Notification sent", type: "success" });
//       }
//       setShowForm(false); setEditNotif(null);
//       setRefreshSignal(s => s + 1);
//     } catch { setToast({ msg: "Failed to save notification", type: "error" }); }
//     finally { setSaving(false); }
//   };

//   const toggleActive = async (notif) => {
//     try {
//       await axios.patch(`${BASE_URL}/api/notification/${notif.notificationId}/${notif.isActive ? "deactivate" : "reactivate"}`, {}, { headers: { Authorization: `Bearer ${token}` } });
//       setToast({ msg: `${notif.isActive ? "Deactivated" : "Reactivated"} successfully`, type: "success" });
//       setRefreshSignal(s => s + 1);
//     } catch { setToast({ msg: "Failed", type: "error" }); }
//   };

//   const hardDelete = async (notif) => {
//     try {
//       await axios.delete(`${BASE_URL}/api/notification/${notif.notificationId}`, { headers: { Authorization: `Bearer ${token}` } });
//       setToast({ msg: "Notification permanently deleted", type: "success" });
//       setRefreshSignal(s => s + 1);
//     } catch { setToast({ msg: "Failed to delete", type: "error" }); }
//   };

//   const triggerNotif = async (notif) => {
//     try {
//       await axios.get(`${BASE_URL}/api/notification/trigger/${notif.notificationId}`, { headers: { Authorization: `Bearer ${token}` } });
//       setToast({ msg: "Notification triggered successfully", type: "success" });
//       setRefreshSignal(s => s + 1);
//     } catch { setToast({ msg: "Failed to trigger notification", type: "error" }); }
//   };

//   const askToggle  = (notif) => setConfirmDialog({ isOpen: true, title: notif.isActive ? "Deactivate Notification" : "Reactivate Notification", message: notif.isActive ? "This notification will stop being shown to users." : "This notification will become active and visible again.", confirmText: notif.isActive ? "Deactivate" : "Reactivate", variant: notif.isActive ? "danger" : "primary", onConfirm: async () => { closeConfirm(); await toggleActive(notif); } });
//   const askDelete  = (notif) => setConfirmDialog({ isOpen: true, title: "Permanently Delete Notification", message: "This will permanently remove the notification and cannot be undone.", confirmText: "Delete Permanently", variant: "danger", onConfirm: async () => { closeConfirm(); await hardDelete(notif); } });
//   const askTrigger = (notif) => setConfirmDialog({ isOpen: true, title: "Trigger Notification", message: "This will immediately trigger this notification.", confirmText: "Trigger", variant: "primary", onConfirm: async () => { closeConfirm(); await triggerNotif(notif); } });

//   return (
//     // <PageShell title="Notification Management" subtitle="System-wide notification control center — create, manage, and broadcast"
//     <PageShell title="Notification Management" 
//       icon={<ShieldCheck size={12} />} roleLabel="Super Admin"
//       headerRight={
//         <div className="flex gap-2">
//           <button onClick={() => setRefreshSignal(s => s + 1)}
//             className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold border border-slate-200 bg-white text-slate-600 hover:border-[#4CA1AF] hover:text-[#4CA1AF] transition-all cursor-pointer">
//             <RefreshCw size={14} /> Refresh
//           </button>
//           {tab !== "my" && (
//             <button onClick={() => { setEditNotif(null); setShowForm(true); }}
//               className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold text-white cursor-pointer shadow-md hover:opacity-90 transition-all"
//               style={{ background: "linear-gradient(135deg, #4CA1AF, #315169)" }}>
//               <Plus size={15} /> New Notification
//             </button>
//           )}
//         </div>
//       }>
//       {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
//       {(showForm || editNotif) && (
//         <NotificationFormModal initial={editNotif} onClose={() => { setShowForm(false); setEditNotif(null); }}
//           onSubmit={createOrUpdate} saving={saving} token={token} />
//       )}
//       <ConfirmDialog isOpen={confirmDialog.isOpen} title={confirmDialog.title} message={confirmDialog.message}
//         confirmText={confirmDialog.confirmText} variant={confirmDialog.variant}
//         onConfirm={confirmDialog.onConfirm} onCancel={closeConfirm} />

//       <TabBar active={tab} onChange={t => setTab(t)} tabs={[
//         { id: "my",     icon: <Bell size={14} />, label: "My Notifications", badge: unreadCount },
//         { id: "manage", icon: <Zap size={14} />,  label: "Manage All",       badge: 0 },
//       ]} />

//       {tab === "my" ? (
//         <AdminMyNotificationsPanel
//           token={token}
//           onMarkRead={markRead}
//           onMarkAllRead={markAllRead}
//           refreshSignal={refreshSignal}
//         />
//       ) : (
//         <ManageTable token={token} showCheckboxes showFullMessage showActiveFilter
//           refreshSignal={refreshSignal}
//           onEdit={(n) => { setEditNotif(n); setShowForm(true); }}
//           onTrigger={askTrigger} onToggle={askToggle} onDelete={askDelete} />
//       )}
//     </PageShell>
//   );
// };

// // ─────────────────────────────────────────────
// // Root — route to correct view by role
// // ─────────────────────────────────────────────
// const Notifications = () => {
//   const role = getRole();
//   if (isSuperAdmin(role)) return <SuperAdminNotifications />;
//   if (isTeacher(role))    return <TeacherNotifications />;
//   return <UserNotifications />;
// };

// export default Notifications;

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import CustomSelect from "./CustomSelect";
import DateTimePicker from "./Datetimepicker";
import ConfirmDialog from "./ConfirmDialog";
import {
  Bell,
  BellOff,
  BellRing,
  Plus,
  X,
  Check,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Search,
  Globe,
  Building2,
  Calendar,
  Users,
  Layers,
  AlertCircle,
  CheckCircle2,
  Clock,
  Trash2,
  RefreshCw,
  Eye,
  EyeOff,
  Send,
  Edit3,
  Zap,
  ShieldCheck,
  GraduationCap,
  User,
  Moon,
  Sun,
} from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_URL || "http://72.155.88.211:8080";

// ─── THEME CONFIGURATION ─────────────────────────────────────────────────────
const LIGHT_PRIMARY_COLOR = "#4CA1AF";
const LIGHT_PRIMARY_DARK = "#2d8391";
const LIGHT_PRIMARY_LIGHT = "rgba(76, 161, 175, 0.1)";
const LIGHT_PRIMARY_GRADIENT = "linear-gradient(135deg, #4CA1AF 0%, #2c7a8a 100%)";

const LIGHT_BG_MAIN = "#f5faff";
const LIGHT_BG_GRADIENT = "linear-gradient(135deg, #f5faff 0%, #f0f8ff 100%)";
const LIGHT_BG_CARD = "#ffffff";
const LIGHT_BORDER_COLOR = "#e9f0f9";
const LIGHT_BORDER_COLOR_HOVER = "#d9e6f5";
const LIGHT_TEXT_PRIMARY = "#1e293b";
const LIGHT_TEXT_SECONDARY = "#475569";
const LIGHT_TEXT_MUTED = "#64748b";
const LIGHT_ACCENT_SOFT = "#f8fcff";

// Dark mode colors - ChatGPT style
const DARK_PRIMARY_COLOR = "#10A37F";
const DARK_PRIMARY_DARK = "#0E8C6D";
const DARK_PRIMARY_LIGHT = "rgba(16, 163, 127, 0.15)";
const DARK_PRIMARY_GRADIENT = "linear-gradient(135deg, #10A37F 0%, #0E8C6D 100%)";

const DARK_BG_MAIN = "#343541";
const DARK_BG_GRADIENT = "linear-gradient(135deg, #343541 0%, #2A2B36 100%)";
const DARK_BG_CARD = "#444654";
const DARK_BORDER_COLOR = "#4D4F5E";
const DARK_BORDER_COLOR_HOVER = "#5E5F70";
const DARK_TEXT_PRIMARY = "#ECECF1";
const DARK_TEXT_SECONDARY = "#C5C5D2";
const DARK_TEXT_MUTED = "#9B9CA9";
const DARK_ACCENT_SOFT = "rgba(255, 255, 255, 0.05)";

// ─────────────────────────────────────────────
// Constants & Helpers
// ─────────────────────────────────────────────
const NOTIFICATION_TYPES = ["GLOBAL", "CLUB_SPECIFIC", "DEPARTMENT_SPECIFIC", "YEAR_SPECIFIC", "REMINDER"];
const SOURCE_TYPES = ["DEPARTMENT", "CLUB", "SYSTEM"];
const TARGET_TYPES = ["GLOBAL", "DEPARTMENT", "CLUB", "YEAR"];
const PAGE_SIZE = 10;

const TYPE_META = (theme) => ({
  GLOBAL:              { icon: <Globe size={14} />,     color: theme.primaryColor, bg: theme.primaryLight,  label: "Global" },
  CLUB_SPECIFIC:       { icon: <Users size={14} />,     color: "#10B981", bg: "rgba(16,185,129,0.12)",  label: "Club" },
  DEPARTMENT_SPECIFIC: { icon: <Building2 size={14} />, color: "#F97316", bg: "rgba(249,115,22,0.12)",  label: "Department" },
  YEAR_SPECIFIC:       { icon: <Layers size={14} />,    color: "#8B5CF6", bg: "rgba(139,92,246,0.12)",  label: "Year" },
  REMINDER:            { icon: <Clock size={14} />,     color: "#EF4444", bg: "rgba(239,68,68,0.12)",   label: "Reminder" },
  EVENT_SPECIFIC:      { icon: <Calendar size={14} />,  color: "#0EA5E9", bg: "rgba(14,165,233,0.12)",  label: "Event" },
});

const parseBackendDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === "number") { const d = new Date(value); return Number.isNaN(d.getTime()) ? null : d; }
  if (Array.isArray(value)) {
    const [y, m, d, h = 0, min = 0, s = 0] = value;
    const parsed = new Date(y, (m || 1) - 1, d || 1, h, min, s);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  if (typeof value !== "string") return null;
  const text = value.trim();
  let match = text.match(/^(\d{2})-(\d{2})-(\d{4})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/);
  if (match) {
    const [, dd, mm, yyyy, hh = "00", mi = "00", ss = "00"] = match;
    const parsed = new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(mi), Number(ss));
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  match = text.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?/);
  if (match) {
    const [, yyyy, mm, dd, hh = "00", mi = "00", ss = "00"] = match;
    const parsed = new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(mi), Number(ss));
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  const fallback = new Date(text);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
};

const fmt = (dt) => {
  if (!dt) return "—";
  const parsed = parseBackendDate(dt);
  if (!parsed) return "—";
  return parsed.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
};

const toPickerValue = (dt) => {
  if (!dt) return "";
  const parsed = parseBackendDate(dt);
  if (!parsed) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}T${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`;
};

const getRole = () => {
  try { return JSON.parse(localStorage.getItem("user"))?.role || "USER"; }
  catch { return "USER"; }
};
const isSuperAdmin = (r) => r === "SUPER_ADMIN";
const isTeacher    = (r) => ["TEACHER", "TEACHERS"].includes(r?.toUpperCase());

// ─────────────────────────────────────────────
// Shared sub-components with theme support
// ─────────────────────────────────────────────

const TypeBadge = ({ type, theme }) => {
  const meta = TYPE_META(theme);
  const m = meta[type] || { icon: <Bell size={14} />, color: theme.primaryColor, bg: theme.primaryLight, label: type };
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
      style={{ color: m.color, backgroundColor: m.bg }}>
      {m.icon}{m.label}
    </span>
  );
};

const StatusDot = ({ active, theme }) => (
  <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${active ? "text-emerald-600 bg-emerald-50" : "text-slate-400 bg-slate-100"}`}
    style={active ? { backgroundColor: "rgba(16,185,129,0.12)", color: "#10B981" } : { backgroundColor: theme.accentSoft, color: theme.textMuted }}>
    <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`}></span>
    {active ? "Active" : "Inactive"}
  </span>
);

const ReadBadge = ({ isRead, theme }) => (
  <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full`}
    style={isRead ? { backgroundColor: theme.accentSoft, color: theme.textMuted } : { backgroundColor: theme.primaryLight, color: theme.primaryColor }}>
    <span className={`w-1.5 h-1.5 rounded-full ${isRead ? "bg-slate-400" : `bg-[${theme.primaryColor}]`}`} style={{ backgroundColor: isRead ? theme.textMuted : theme.primaryColor }}></span>
    {isRead ? "Read" : "Unread"}
  </span>
);

const EmptyState = ({ icon, title, subtitle, action, theme }) => (
  <div className="flex flex-col items-center justify-center py-24 text-center px-4">
    <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5"
      style={{ backgroundColor: theme.primaryLight, color: theme.primaryColor }}>
      {icon}
    </div>
    <h3 className="text-xl font-black mb-2" style={{ color: theme.textPrimary }}>{title}</h3>
    <p className="font-medium max-w-xs mb-6" style={{ color: theme.textMuted }}>{subtitle}</p>
    {action}
  </div>
);

const Toast = ({ message, type, onClose, theme }) => {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border transition-all`}
      style={type === "success" ? { backgroundColor: theme.primaryLight, borderColor: theme.primaryColor, color: theme.primaryColor } : { backgroundColor: "rgba(239,68,68,0.1)", borderColor: "#ef4444", color: "#ef4444" }}>
      {type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
      <span className="text-sm font-bold">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-70 cursor-pointer"><X size={16} /></button>
    </div>
  );
};

const Loader = ({ text = "Loading notifications...", theme }) => (
  <div className="flex flex-col items-center justify-center py-24">
    <div className="w-12 h-12 border-4 rounded-full animate-spin mb-4"
      style={{ borderColor: `${theme.primaryColor}20`, borderTopColor: theme.primaryColor }}></div>
    <p className="font-medium animate-pulse" style={{ color: theme.textMuted }}>{text}</p>
  </div>
);

const Pagination = ({ totalElements, page, pageSize, onPage, theme }) => {
  const pages = Math.ceil(totalElements / pageSize);
  if (pages <= 1) return null;
  const items = Array.from({ length: pages }, (_, i) => i)
    .filter(i => i === 0 || i === pages - 1 || Math.abs(i - page) <= 1)
    .reduce((acc, i, idx, arr) => {
      if (idx > 0 && i - arr[idx - 1] > 1) acc.push("...");
      acc.push(i);
      return acc;
    }, []);
  const start = page * pageSize + 1;
  const end   = Math.min((page + 1) * pageSize, totalElements);
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 px-2">
      <p className="text-sm font-bold" style={{ color: theme.textMuted }}>
        Showing <span style={{ color: theme.textPrimary }}>{start}–{end}</span> of <span style={{ color: theme.textPrimary }}>{totalElements}</span>
      </p>
      <div className="flex items-center gap-2">
        <button onClick={() => onPage(Math.max(0, page - 1))} disabled={page === 0}
          className="w-9 h-9 rounded-xl border flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          style={{ borderColor: theme.borderColor, backgroundColor: theme.accentSoft, color: theme.textMuted }}
          onMouseEnter={(e) => { if (page !== 0) { e.currentTarget.style.background = theme.primaryGradient; e.currentTarget.style.color = "white"; e.currentTarget.style.borderColor = "transparent"; } }}
          onMouseLeave={(e) => { if (page !== 0) { e.currentTarget.style.background = theme.accentSoft; e.currentTarget.style.color = theme.textMuted; e.currentTarget.style.borderColor = theme.borderColor; } }}>
          <ChevronLeft size={16} />
        </button>
        {items.map((item, idx) => item === "..." ? (
          <span key={`e${idx}`} className="px-1 font-bold text-sm" style={{ color: theme.textMuted }}>…</span>
        ) : (
          <button key={item} onClick={() => onPage(item)}
            className="w-9 h-9 rounded-xl text-sm font-black transition-all border"
            style={item === page
              ? { background: theme.primaryGradient, color: "#fff", borderColor: "transparent" }
              : { backgroundColor: theme.accentSoft, borderColor: theme.borderColor, color: theme.textSecondary }}>
            {item + 1}
          </button>
        ))}
        <button onClick={() => onPage(Math.min(pages - 1, page + 1))} disabled={page >= pages - 1}
          className="w-9 h-9 rounded-xl border flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          style={{ borderColor: theme.borderColor, backgroundColor: theme.accentSoft, color: theme.textMuted }}
          onMouseEnter={(e) => { if (page < pages - 1) { e.currentTarget.style.background = theme.primaryGradient; e.currentTarget.style.color = "white"; e.currentTarget.style.borderColor = "transparent"; } }}
          onMouseLeave={(e) => { if (page < pages - 1) { e.currentTarget.style.background = theme.accentSoft; e.currentTarget.style.color = theme.textMuted; e.currentTarget.style.borderColor = theme.borderColor; } }}>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Notification Card with theme
// ─────────────────────────────────────────────
const NotificationCard = ({ notif, onMarkRead, theme }) => (
  <div className="group relative rounded-2xl border transition-all hover:shadow-lg" style={{ backgroundColor: theme.bgCard, borderColor: theme.borderColor }}>
    <div className="p-5">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: (TYPE_META(theme)[notif.notificationType] || TYPE_META(theme).GLOBAL).bg, color: (TYPE_META(theme)[notif.notificationType] || TYPE_META(theme).GLOBAL).color }}>
          {React.cloneElement((TYPE_META(theme)[notif.notificationType] || TYPE_META(theme).GLOBAL).icon, { size: 20 })}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <TypeBadge type={notif.notificationType} theme={theme} />
            </div>
            <span className="text-[11px] font-semibold whitespace-nowrap" style={{ color: theme.textMuted }}>{fmt(notif.createdAt)}</span>
          </div>
          <h4 className="mt-2 font-black leading-snug" style={{ color: theme.textPrimary }}>{notif.title}</h4>
          <p className="mt-1 text-sm font-medium leading-relaxed" style={{ color: theme.textSecondary }}>{notif.message}</p>
          {notif.validUntil && (
            <div className="mt-2 flex items-center gap-1.5 text-[11px]" style={{ color: theme.textMuted }}>
              <Clock size={11} /> Expires: {fmt(notif.validUntil)}
            </div>
          )}
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 justify-end">
        {!notif.isRead && onMarkRead && (
          <button onClick={() => onMarkRead(notif.notificationId)}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer"
            style={{ color: theme.primaryColor, backgroundColor: theme.primaryLight }}>
            <Check size={13} /> Mark read
          </button>
        )}
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────
// Admin Notification Row with theme
// ─────────────────────────────────────────────
const AdminNotifRow = ({ notif, onToggle, onDelete, onEdit, onTrigger, showCheckbox, checked, onCheck, showReadStatus, onMarkRead, showFullMessage = false, theme }) => (
  <tr className={`group border-b last:border-0 transition-all`} style={{ borderColor: theme.borderColor, backgroundColor: checked ? theme.primaryLight : (!notif.isRead && showReadStatus ? `${theme.primaryLight}30` : "transparent") }}>
    {showCheckbox && (
      <td className="pl-5 pr-3 py-5">
        <input type="checkbox" checked={checked} onChange={onCheck}
          className="w-4 h-4 rounded cursor-pointer accent-[#4CA1AF]" />
       </td>
    )}
    <td className="px-4 py-5">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          {showReadStatus && !notif.isRead && <span className="w-2 h-2 rounded-full flex-shrink-0 animate-pulse" style={{ backgroundColor: theme.primaryColor }} />}
          <span className={`text-sm leading-tight ${!notif.isRead && showReadStatus ? "font-black" : "font-black"}`} style={{ color: theme.textPrimary }}>{notif.title}</span>
        </div>
        <span className={`text-xs font-medium ${showFullMessage ? "whitespace-normal break-words max-w-xl" : "line-clamp-1 max-w-xs"}`} style={{ color: theme.textMuted }}>{notif.message}</span>
        {notif.createdByPrn && <span className="text-[10px] font-medium" style={{ color: `${theme.textMuted}80` }}>by {notif.createdByPrn}</span>}
      </div>
    </td>
    <td className="px-4 py-5 hidden sm:table-cell"><TypeBadge type={notif.notificationType} theme={theme} /></td>
    <td className="px-4 py-5 hidden md:table-cell">
      {showReadStatus ? <ReadBadge isRead={notif.isRead} theme={theme} /> : <StatusDot active={notif.isActive} theme={theme} />}
    </td>
    <td className="px-4 py-5 hidden lg:table-cell"><span className="text-xs font-semibold" style={{ color: theme.textMuted }}>{fmt(notif.createdAt)}</span></td>
    <td className="px-4 py-5 hidden lg:table-cell"><span className="text-xs font-semibold" style={{ color: theme.textMuted }}>{fmt(notif.validUntil)}</span></td>
    <td className="px-4 py-5 text-right">
      <div className="flex items-center justify-end gap-2">
        {showReadStatus && !notif.isRead && onMarkRead && (
          <button onClick={() => onMarkRead(notif.notificationId)}
            className="w-9 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer"
            style={{ borderColor: theme.borderColor, backgroundColor: theme.accentSoft, color: theme.textMuted }}
            onMouseEnter={(e) => { e.currentTarget.style.background = theme.primaryGradient; e.currentTarget.style.color = "white"; e.currentTarget.style.borderColor = "transparent"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = theme.accentSoft; e.currentTarget.style.color = theme.textMuted; e.currentTarget.style.borderColor = theme.borderColor; }}
            title="Mark as read">
            <Check size={15} />
          </button>
        )}
        {onEdit && (
          <button onClick={() => onEdit(notif)}
            className="w-9 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer"
            style={{ borderColor: theme.borderColor, backgroundColor: theme.accentSoft, color: theme.textMuted }}
            onMouseEnter={(e) => { e.currentTarget.style.background = theme.primaryGradient; e.currentTarget.style.color = "white"; e.currentTarget.style.borderColor = "transparent"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = theme.accentSoft; e.currentTarget.style.color = theme.textMuted; e.currentTarget.style.borderColor = theme.borderColor; }}>
            <Edit3 size={15} />
          </button>
        )}
        {onTrigger && (
          <button onClick={() => onTrigger(notif)}
            className="w-9 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer"
            style={{ borderColor: theme.borderColor, backgroundColor: theme.accentSoft, color: theme.textMuted }}
            onMouseEnter={(e) => { e.currentTarget.style.background = theme.primaryGradient; e.currentTarget.style.color = "white"; e.currentTarget.style.borderColor = "transparent"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = theme.accentSoft; e.currentTarget.style.color = theme.textMuted; e.currentTarget.style.borderColor = theme.borderColor; }}
            title="Trigger notification now">
            <BellRing size={15} />
          </button>
        )}
        {onToggle && (
          <button onClick={() => onToggle(notif)}
            className="w-9 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer"
            style={{ borderColor: theme.borderColor, backgroundColor: theme.accentSoft, color: theme.textMuted }}
            onMouseEnter={(e) => { e.currentTarget.style.background = theme.primaryGradient; e.currentTarget.style.color = "white"; e.currentTarget.style.borderColor = "transparent"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = theme.accentSoft; e.currentTarget.style.color = theme.textMuted; e.currentTarget.style.borderColor = theme.borderColor; }}
            title={notif.isActive ? "Deactivate" : "Reactivate"}>
            {notif.isActive ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
        {onDelete && (
          <button onClick={() => onDelete(notif)}
            className="w-9 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer"
            style={{ borderColor: theme.borderColor, backgroundColor: theme.accentSoft, color: theme.textMuted }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#ef4444"; e.currentTarget.style.color = "white"; e.currentTarget.style.borderColor = "transparent"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = theme.accentSoft; e.currentTarget.style.color = theme.textMuted; e.currentTarget.style.borderColor = theme.borderColor; }}>
            <Trash2 size={15} />
          </button>
        )}
      </div>
    </td>
  </tr>
);

// ─────────────────────────────────────────────
// Multi-Select Chip Picker with theme
// ─────────────────────────────────────────────
const MultiSelectPicker = ({ options, selectedIds, onToggle, loading, placeholder, theme }) => {
  const [search, setSearch] = useState("");
  const filtered = options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()));
  const selectedSet = new Set(selectedIds);
  return (
    <div className="border rounded-2xl overflow-hidden" style={{ borderColor: theme.borderColor, backgroundColor: theme.accentSoft }}>
      <div className="relative border-b" style={{ borderColor: theme.borderColor }}>
        <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: theme.textMuted }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={placeholder || "Search…"}
          className="w-full pl-9 pr-4 py-2.5 text-sm font-medium focus:outline-none"
          style={{ backgroundColor: theme.bgCard, color: theme.textPrimary }} />
      </div>
      <div className="max-h-40 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-6 text-xs font-bold gap-2" style={{ color: theme.textMuted }}>
            <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: `${theme.primaryColor}20`, borderTopColor: theme.primaryColor }} />Loading…
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center py-6 text-xs font-bold" style={{ color: theme.textMuted }}>No options found</p>
        ) : (
          filtered.map(o => {
            const active = selectedSet.has(o.value);
            return (
              <button key={o.value} type="button" onClick={() => onToggle(o.value)}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium transition-all cursor-pointer border-b last:border-0 ${active ? "" : ""}`}
                style={active ? { backgroundColor: theme.primaryLight, color: theme.primaryColor } : { backgroundColor: theme.accentSoft, color: theme.textSecondary }}>
                <span>{o.label}</span>
                {active && (
                  <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: theme.primaryColor }}>
                    <Check size={11} color="#fff" />
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-3 py-2.5 border-t" style={{ borderColor: theme.borderColor, backgroundColor: theme.accentSoft }}>
          {selectedIds.map(id => {
            const opt = options.find(o => o.value === id);
            return (
              <span key={id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                style={{ backgroundColor: theme.primaryLight, color: theme.primaryColor }}>
                {opt?.label || id}
                <button type="button" onClick={() => onToggle(id)} className="hover:text-red-500 cursor-pointer"><X size={10} /></button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};

const YEAR_OPTIONS = [
  { value: 1, label: "Year 1 — First Year"  },
  { value: 2, label: "Year 2 — Second Year" },
  { value: 3, label: "Year 3 — Third Year"  },
  { value: 4, label: "Year 4 — Fourth Year" },
];

// ─────────────────────────────────────────────
// Create / Edit Notification Modal with theme
// ─────────────────────────────────────────────
const NotificationFormModal = ({ initial, onClose, onSubmit, saving, token, theme }) => {
  const isEdit = !!initial?.notificationId;
  const [form, setForm] = useState({
    sourceType:        initial?.sourceType       || "SYSTEM",
    sourceId:          initial?.sourceId         ?? "",
    notificationTitle: initial?.title            || "",
    message:           initial?.message          || "",
    notificationType:  initial?.notificationType || "GLOBAL",
    targetType:        initial?.targetType       || "GLOBAL",
    targetedIds:       initial?.targetIds        || [],
    validUntil:        toPickerValue(initial?.validUntil),
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const [clubs,        setClubs]        = useState([]);
  const [depts,        setDepts]        = useState([]);
  const [loadingClubs, setLoadingClubs] = useState(false);
  const [loadingDepts, setLoadingDepts] = useState(false);

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const ensureClubs = useCallback(async () => {
    if (clubs.length > 0 || loadingClubs) return;
    setLoadingClubs(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/clubs`, authHeaders);
      const list = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];
      setClubs(list.filter(c => c.isActive !== false));
    } catch { /* silently fail */ }
    finally { setLoadingClubs(false); }
  }, [clubs.length, loadingClubs, token]);

  const ensureDepts = useCallback(async () => {
    if (depts.length > 0 || loadingDepts) return;
    setLoadingDepts(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/department`, authHeaders);
      const list = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];
      setDepts(list.filter(d => d.isActive !== false));
    } catch { /* silently fail */ }
    finally { setLoadingDepts(false); }
  }, [depts.length, loadingDepts, token]);

  useEffect(() => {
    if (form.sourceType === "CLUB"       || form.targetType === "CLUB")       ensureClubs();
    if (form.sourceType === "DEPARTMENT" || form.targetType === "DEPARTMENT") ensureDepts();
  }, [form.sourceType, form.targetType]);

  const clubOptions = clubs.map(c => ({ value: c.clubId,       label: c.clubName }));
  const deptOptions = depts.map(d => ({ value: d.departmentId, label: d.name     }));
  const sourceOptions = form.sourceType === "CLUB" ? clubOptions : form.sourceType === "DEPARTMENT" ? deptOptions : [];
  const targetOptions = form.targetType === "CLUB" ? clubOptions : form.targetType === "DEPARTMENT" ? deptOptions : form.targetType === "YEAR" ? YEAR_OPTIONS : [];
  const needsSourceDropdown = ["CLUB", "DEPARTMENT"].includes(form.sourceType);
  const needsTargetPicker   = ["CLUB", "DEPARTMENT", "YEAR"].includes(form.targetType);

  const toggleTargetId = (id) =>
    set("targetedIds", form.targetedIds.includes(id) ? form.targetedIds.filter(i => i !== id) : [...form.targetedIds, id]);

  const handleSourceTypeChange = (v) => { set("sourceType", v); set("sourceId", ""); };
  const handleTargetTypeChange = (v) => { set("targetType", v); set("targetedIds", []); };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...form, sourceId: form.sourceId !== "" ? Number(form.sourceId) : undefined, validUntil: form.validUntil ? form.validUntil + ":00" : undefined });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col transition-colors duration-300"
        style={{ background: theme.bgCard, border: `1px solid ${theme.borderColor}` }}>
        <div className="px-7 py-6 flex items-center justify-between border-b" style={{ borderColor: theme.borderColor, background: theme.accentSoft }}>
          <div>
            <h3 className="text-lg font-black" style={{ color: theme.textPrimary }}>{isEdit ? "Edit Notification" : "Create Notification"}</h3>
            <p className="text-xs mt-0.5" style={{ color: theme.textMuted }}>{isEdit ? "Update notification details" : "Send a new notification to users"}</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer"
            style={{ color: theme.textMuted, backgroundColor: theme.accentSoft }}>
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-7 py-5">
          <form id="notif-form" onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Title *" theme={theme}>
              <input required value={form.notificationTitle} onChange={e => set("notificationTitle", e.target.value)}
                placeholder="Enter notification title..."
                className="w-full px-4 py-3 rounded-2xl text-sm font-medium focus:outline-none transition-all"
                style={{ backgroundColor: theme.accentSoft, border: `1px solid ${theme.borderColor}`, color: theme.textPrimary }} />
            </FormField>
            <FormField label="Message *" theme={theme}>
              <textarea required value={form.message} onChange={e => set("message", e.target.value)}
                placeholder="Write your notification message..." rows={3}
                className="w-full px-4 py-3 rounded-2xl text-sm font-medium focus:outline-none transition-all resize-none"
                style={{ backgroundColor: theme.accentSoft, border: `1px solid ${theme.borderColor}`, color: theme.textPrimary }} />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Notification Type *" theme={theme}>
                <SelectField value={form.notificationType} onChange={v => set("notificationType", v)} options={NOTIFICATION_TYPES} theme={theme} />
              </FormField>
              <FormField label="Source Type *" theme={theme}>
                <SelectField value={form.sourceType} onChange={handleSourceTypeChange} options={SOURCE_TYPES} theme={theme} />
              </FormField>
            </div>
            {needsSourceDropdown && (
              <FormField label={`Source ${form.sourceType === "CLUB" ? "Club" : "Department"} *`} theme={theme}>
                {(form.sourceType === "CLUB" ? loadingClubs : loadingDepts) ? (
                  <div className="flex items-center gap-2 px-4 py-3 rounded-2xl text-sm"
                    style={{ backgroundColor: theme.accentSoft, border: `1px solid ${theme.borderColor}`, color: theme.textMuted }}>
                    <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: `${theme.primaryColor}20`, borderTopColor: theme.primaryColor }} />
                    Loading {form.sourceType === "CLUB" ? "clubs" : "departments"}…
                  </div>
                ) : (
                  <CustomSelect name="sourceId" value={String(form.sourceId)} onChange={e => set("sourceId", e.target.value)}
                    options={[{ value: "", label: `— Select ${form.sourceType === "CLUB" ? "Club" : "Department"} —` }, ...sourceOptions.map(o => ({ value: String(o.value), label: o.label }))]}
                    placeholder={`Select ${form.sourceType === "CLUB" ? "club" : "department"}`} theme={theme} />
                )}
              </FormField>
            )}
            <FormField label="Target Type *" theme={theme}>
              <SelectField value={form.targetType} onChange={handleTargetTypeChange} options={TARGET_TYPES} theme={theme} />
            </FormField>
            {needsTargetPicker && (
              <FormField label={`Target ${form.targetType === "CLUB" ? "Clubs" : form.targetType === "DEPARTMENT" ? "Departments" : "Years"} * (select one or more)`} theme={theme}>
                <MultiSelectPicker
                  options={targetOptions}
                  selectedIds={form.targetedIds}
                  onToggle={toggleTargetId}
                  loading={(form.targetType === "CLUB" && loadingClubs) || (form.targetType === "DEPARTMENT" && loadingDepts)}
                  placeholder={`Search ${form.targetType.toLowerCase()}s…`}
                  theme={theme}
                />
                {form.targetedIds.length === 0 && (
                  <p className="mt-1.5 text-[11px] font-bold" style={{ color: "#F59E0B" }}>⚠ Select at least one {form.targetType.toLowerCase()}</p>
                )}
              </FormField>
            )}
            <FormField label="Valid Until" theme={theme}>
              <DateTimePicker value={form.validUntil} onChange={(v) => set("validUntil", v)} placeholder="Select validity date and time" theme={theme} />
            </FormField>
          </form>
        </div>

        <div className="px-7 py-5 border-t flex gap-3" style={{ borderColor: theme.borderColor, background: theme.accentSoft }}>
          <button onClick={onClose} className="flex-1 py-3 rounded-2xl font-bold text-sm transition-all cursor-pointer"
            style={{ border: `1px solid ${theme.borderColor}`, color: theme.textSecondary, backgroundColor: theme.accentSoft }}>
            Cancel
          </button>
          <button form="notif-form" type="submit" disabled={saving}
            className="flex-1 py-3 rounded-2xl text-white font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            style={{ background: theme.primaryGradient }}>
            {saving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving…</> : <><Send size={15} /> {isEdit ? "Update" : "Send Notification"}</>}
          </button>
        </div>
      </div>
    </div>
  );
};

const FormField = ({ label, children, theme }) => (
  <div>
    <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: theme.textMuted }}>{label}</label>
    {children}
  </div>
);

const SelectField = ({ value, onChange, options, theme }) => (
  <CustomSelect name="selectField" value={value} onChange={(e) => onChange(e.target.value)}
    options={options.map((o) => ({ value: o, label: o.replace(/_/g, " ") }))} placeholder="Select option" theme={theme} />
);

const PAGE_BG_ANIMATION_STYLES = `
  @keyframes blob {
    0% { transform: translate(0px, 0px) scale(1); }
    33% { transform: translate(30px, -50px) scale(1.1); }
    66% { transform: translate(-20px, 20px) scale(0.9); }
    100% { transform: translate(0px, 0px) scale(1); }
  }
  .animate-blob { animation: blob 7s infinite; }
  .animation-delay-2000 { animation-delay: 2s; }
  .animation-delay-4000 { animation-delay: 4s; }
`;

// ─────────────────────────────────────────────
// Filter Bar with theme
// ─────────────────────────────────────────────
const FilterBar = ({ search, onSearch, typeFilter, onType, activeFilter, onActiveFilter, showActiveFilter = true, theme }) => (
  <div className="flex flex-col sm:flex-row gap-3 mb-6">
    <div className="relative flex-1">
      <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: theme.textMuted }} />
      <input value={search} onChange={e => onSearch(e.target.value)} placeholder="Search notifications..."
        className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm font-medium focus:outline-none transition-all shadow-sm"
        style={{ backgroundColor: theme.accentSoft, border: `1px solid ${theme.borderColor}`, color: theme.textPrimary }} />
    </div>
    <div className="w-full sm:w-48">
      <CustomSelect name="notificationTypeFilter" value={typeFilter} onChange={(e) => onType(e.target.value)}
        options={[{ value: "", label: "All Types" }, ...NOTIFICATION_TYPES.map((t) => ({ value: t, label: t.replace(/_/g, " ") }))]}
        placeholder="All Types" theme={theme} />
    </div>
    {showActiveFilter && (
      <div className="flex rounded-2xl border overflow-hidden shrink-0" style={{ borderColor: theme.borderColor, backgroundColor: theme.accentSoft }}>
        {[
          { value: "true",  label: "Active",   activeClass: "text-emerald-700 bg-emerald-50" },
          { value: "false", label: "Inactive", activeClass: "text-amber-700 bg-amber-50" },
          { value: "all",   label: "All",      activeClass: "text-[#4CA1AF] bg-[rgba(76,161,175,0.08)]" },
        ].map(({ value, label, activeClass }) => (
          <button key={value} onClick={() => onActiveFilter(value)}
            className={`px-4 py-3 text-sm font-bold transition-all cursor-pointer border-r last:border-r-0 whitespace-nowrap ${activeFilter === value ? "" : ""}`}
            style={activeFilter === value ? { background: theme.primaryLight, color: theme.primaryColor, borderColor: theme.borderColor } : { color: theme.textMuted, borderColor: theme.borderColor }}>
            {label}
          </button>
        ))}
      </div>
    )}
  </div>
);

// ─────────────────────────────────────────────
// Stats Row with theme
// ─────────────────────────────────────────────
const StatsRow = ({ stats, theme }) => (
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
    {stats.map(({ label, value, icon, color, bg }) => (
      <div key={label} className="rounded-2xl border shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-all"
        style={{ backgroundColor: theme.bgCard, borderColor: theme.borderColor }}>
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: theme.primaryLight, color: theme.primaryColor }}>{icon}</div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: theme.textMuted }}>{label}</p>
          <p className="text-2xl font-black" style={{ color: theme.textPrimary }}>{value ?? "—"}</p>
        </div>
      </div>
    ))}
  </div>
);

// ─────────────────────────────────────────────
// Tab Bar with theme
// ─────────────────────────────────────────────
const TabBar = ({ tabs, active, onChange, theme }) => (
  <div className="flex rounded-2xl border shadow-sm p-1.5 mb-6 w-fit flex-wrap gap-1" style={{ backgroundColor: theme.accentSoft, borderColor: theme.borderColor }}>
    {tabs.map(({ id, icon, label, badge }) => (
      <button key={id} onClick={() => onChange(id)}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer"
        style={active === id ? { background: theme.primaryGradient, color: "#fff" } : { color: theme.textSecondary }}>
        {icon}{label}
        {badge > 0 && <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center">{badge}</span>}
      </button>
    ))}
  </div>
);

// ─────────────────────────────────────────────
// Page Shell with theme
// ─────────────────────────────────────────────
const PageShell = ({ title, subtitle, icon, roleLabel, children, headerRight, theme, isDarkMode }) => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen font-sans relative transition-colors duration-300" style={{ background: theme.bgGradient }}>
      <style dangerouslySetInnerHTML={{ __html: PAGE_BG_ANIMATION_STYLES }} />
      {/* Animated Background Blobs - only show in light mode */}
      {!isDarkMode && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-25 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-25 animate-blob animation-delay-2000" style={{ backgroundColor: theme.primaryColor }}></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-25 animate-blob animation-delay-4000"></div>
        </div>
      )}
      <div className="sticky top-0 z-40 border-b shadow-sm transition-colors duration-300" style={{ backgroundColor: theme.bgCard, borderColor: theme.borderColor }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <button onClick={() => navigate("/dashboard")}
              className="group flex items-center gap-2 sm:gap-3 font-medium rounded-full py-2 sm:py-2.5 px-4 sm:px-5 transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer"
              style={{ background: theme.primaryGradient, color: "white" }}>
              <svg className="w-4 sm:w-5 h-4 sm:h-5 text-white transform group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-xs sm:text-sm hidden xs:inline">Dashboard</span>
            </button>
            <span className="hidden sm:flex items-center gap-2 text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full"
              style={{ color: theme.primaryColor, backgroundColor: theme.primaryLight }}>
              {icon}{roleLabel}
            </span>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="pb-2">
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                <span style={{ color: theme.textPrimary, background: isDarkMode ? 'none' : theme.primaryGradient, WebkitBackgroundClip: isDarkMode ? 'unset' : 'text', WebkitTextFillColor: isDarkMode ? 'unset' : 'transparent' }}>
                  {title}
                </span>
              </h1>
            </div>
            <p className="font-medium mt-1" style={{ color: theme.textSecondary }}>{subtitle}</p>
          </div>
          {headerRight && <div>{headerRight}</div>}
        </div>
        {children}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Manage Table (server-side paged) with theme
// ─────────────────────────────────────────────
const ManageTable = ({
  token,
  showCheckboxes   = false,
  showReadStatus   = false,
  showFullMessage  = false,
  showActiveFilter = true,
  fetchMode        = "all",
  onEdit,
  onTrigger,
  onToggle,
  onDelete,
  onMarkRead,
  refreshSignal,
  theme,
}) => {
  const [data,         setData]         = useState({ content: [], totalElements: 0 });
  const [loading,      setLoading]      = useState(true);
  const [page,         setPage]         = useState(0);
  const [search,       setSearch]       = useState("");
  const [typeFilter,   setTypeFilter]   = useState("");
  const [activeFilter, setActiveFilter] = useState("true");
  const [selectedIds,  setSelectedIds]  = useState(new Set());

  const fetchData = useCallback(async (pg = 0) => {
    setLoading(true);
    try {
      if (fetchMode === "created-by-me") {
        const res = await axios.get(
          `${BASE_URL}/api/notification/cr/created-by-me/paged?page=${pg}&size=${PAGE_SIZE}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const pageData = res.data?.data || res.data;
        setData({ content: pageData?.content || [], totalElements: pageData?.totalElements || 0 });
      } else if (activeFilter === "all") {
        const [activeRes, inactiveRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/notification/paged?active=true&page=0&size=1000`,  { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${BASE_URL}/api/notification/paged?active=false&page=0&size=1000`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const extract = (r) => r.data?.data?.content || r.data?.content || [];
        const all = [...extract(activeRes), ...extract(inactiveRes)].sort((a, b) => {
          const da = parseBackendDate(a.createdAt), db = parseBackendDate(b.createdAt);
          return (db?.getTime() || 0) - (da?.getTime() || 0);
        });
        setData({ content: all.slice(pg * PAGE_SIZE, (pg + 1) * PAGE_SIZE), totalElements: all.length });
      } else {
        const res = await axios.get(
          `${BASE_URL}/api/notification/paged?active=${activeFilter}&page=${pg}&size=${PAGE_SIZE}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const pageData = res.data?.data || res.data;
        setData({ content: pageData?.content || [], totalElements: pageData?.totalElements || 0 });
      }
    } catch (e) {
      console.error("Failed to fetch notifications", e);
    } finally {
      setLoading(false);
    }
  }, [token, activeFilter, fetchMode]);

  useEffect(() => { setPage(0); }, [activeFilter, typeFilter, search]);
  useEffect(() => { fetchData(page); }, [fetchData, page, refreshSignal]);

  const filtered = data.content.filter(n => {
    const s = search.toLowerCase();
    return (!search || n.title?.toLowerCase().includes(s) || n.message?.toLowerCase().includes(s)) &&
           (!typeFilter || n.notificationType === typeFilter);
  });

  const toggleSelect     = (id) => setSelectedIds(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const selectAll        = () => setSelectedIds(new Set(filtered.map(n => n.notificationId)));
  const clearSelect      = () => setSelectedIds(new Set());
  const handlePageChange = (pg) => { setPage(pg); setSelectedIds(new Set()); };

  const handleMarkRead = async (id) => {
    if (onMarkRead) await onMarkRead(id);
    setData(d => ({ ...d, content: d.content.map(x => x.notificationId === id ? { ...x, isRead: true } : x) }));
  };

  return (
    <>
      <FilterBar search={search} onSearch={setSearch} typeFilter={typeFilter} onType={setTypeFilter}
        activeFilter={activeFilter} onActiveFilter={v => { setActiveFilter(v); setPage(0); }}
        showActiveFilter={showActiveFilter} theme={theme} />

      {selectedIds.size > 0 && (
        <div className="mb-4 flex items-center gap-3 px-5 py-3.5 rounded-2xl" style={{ backgroundColor: theme.primaryLight, border: `1px solid ${theme.primaryColor}` }}>
          <span className="text-sm font-black" style={{ color: theme.primaryColor }}>{selectedIds.size} selected</span>
          <button onClick={clearSelect} className="text-xs hover:opacity-80 cursor-pointer" style={{ color: theme.textMuted }}>Clear</button>
        </div>
      )}

      <div className="rounded-2xl border shadow-sm overflow-hidden" style={{ backgroundColor: theme.bgCard, borderColor: theme.borderColor }}>
        {loading ? <Loader theme={theme} /> : filtered.length === 0 ? (
          <EmptyState icon={<BellOff size={36} />} title="No notifications found" subtitle="Try adjusting your filters or create a new notification."
            action={onEdit && (
              <button onClick={() => onEdit(null)} className="flex items-center gap-2 px-5 py-3 rounded-2xl text-white text-sm font-bold cursor-pointer"
                style={{ background: theme.primaryGradient }}>
                <Plus size={15} /> Create Notification
              </button>
            )} theme={theme} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: theme.borderColor, backgroundColor: theme.accentSoft }}>
                  {showCheckboxes && (
                    <th className="pl-5 pr-3 py-4">
                      <input type="checkbox"
                        onChange={e => e.target.checked ? selectAll() : clearSelect()}
                        checked={filtered.length > 0 && filtered.every(n => selectedIds.has(n.notificationId))}
                        className="w-4 h-4 rounded cursor-pointer accent-[#4CA1AF]" />
                    </th>
                  )}
                  <th className="px-4 py-4 text-left text-[10px] font-black uppercase tracking-widest" style={{ color: theme.textMuted }}>Notification</th>
                  <th className="px-4 py-4 text-left text-[10px] font-black uppercase tracking-widest hidden sm:table-cell" style={{ color: theme.textMuted }}>Type</th>
                  <th className="px-4 py-4 text-left text-[10px] font-black uppercase tracking-widest hidden md:table-cell" style={{ color: theme.textMuted }}>
                    {showReadStatus ? "Read" : "Status"}
                  </th>
                  <th className="px-4 py-4 text-left text-[10px] font-black uppercase tracking-widest hidden lg:table-cell" style={{ color: theme.textMuted }}>Created</th>
                  <th className="px-4 py-4 text-left text-[10px] font-black uppercase tracking-widest hidden lg:table-cell" style={{ color: theme.textMuted }}>Expires</th>
                  <th className="px-4 py-4 text-right text-[10px] font-black uppercase tracking-widest" style={{ color: theme.textMuted }}>Actions</th>
                 </tr>
              </thead>
              <tbody>
                {filtered.map(n => (
                  <AdminNotifRow key={n.notificationId} notif={n}
                    showCheckbox={showCheckboxes} checked={selectedIds.has(n.notificationId)} onCheck={() => toggleSelect(n.notificationId)}
                    showReadStatus={showReadStatus} showFullMessage={showFullMessage}
                    onMarkRead={showReadStatus ? handleMarkRead : undefined}
                    onEdit={onEdit} onTrigger={onTrigger} onToggle={onToggle} onDelete={onDelete}
                    theme={theme} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination totalElements={data.totalElements} page={page} pageSize={PAGE_SIZE} onPage={handlePageChange} theme={theme} />
    </>
  );
};

// ─────────────────────────────────────────────
// My Notifications Panel — User & Teacher with theme
// ─────────────────────────────────────────────
const MyNotificationsPanel = ({ token, onMarkRead, onMarkAllRead, refreshSignal, theme }) => {
  const [data,       setData]       = useState({ content: [], totalElements: 0 });
  const [loading,    setLoading]    = useState(true);
  const [page,       setPage]       = useState(0);
  const [search,     setSearch]     = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [activeTab,  setActiveTab]  = useState("unread");

  const fetchData = useCallback(async (pg = 0) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${BASE_URL}/api/notification/me/paged?page=${pg}&size=${PAGE_SIZE}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const pageData = res.data?.data || res.data;
      setData({ content: pageData?.content || [], totalElements: pageData?.totalElements || 0 });
    } catch (e) {
      console.error("Failed to fetch my notifications", e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchData(page); }, [fetchData, page]);

  useEffect(() => {
    if (refreshSignal > 0) {
      setData(d => ({
        ...d,
        content: d.content.map(n => ({ ...n, isRead: true })),
      }));
      const t = setTimeout(() => fetchData(page), 300);
      return () => clearTimeout(t);
    }
  }, [refreshSignal]);

  const handleMarkRead = async (id) => {
    await onMarkRead(id);
    setData(d => ({
      ...d,
      content: d.content.map(x => x.notificationId === id ? { ...x, isRead: true } : x),
    }));
  };

  const filtered = data.content.filter(n => {
    const s = search.toLowerCase();
    return (!search || n.title?.toLowerCase().includes(s) || n.message?.toLowerCase().includes(s)) &&
           (!typeFilter || n.notificationType === typeFilter);
  });

  const unreadList  = filtered.filter(n => !n.isRead);
  const readList    = filtered.filter(n => n.isRead);
  const visibleList = activeTab === "unread" ? unreadList : readList;

  return (
    <>
      <div className="flex items-center gap-2 mb-4">
        {[{ id: "unread", label: "Unread" }, { id: "read", label: "Read" }].map(({ id, label }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className="px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer border"
            style={activeTab === id
              ? { background: theme.primaryGradient, color: "#fff", borderColor: "transparent" }
              : { backgroundColor: theme.accentSoft, borderColor: theme.borderColor, color: theme.textSecondary }}>
            {label}
          </button>
        ))}
      </div>

      <FilterBar search={search} onSearch={setSearch} typeFilter={typeFilter} onType={setTypeFilter} showActiveFilter={false} theme={theme} />

      {loading ? <Loader theme={theme} /> : visibleList.length === 0 ? (
        <EmptyState icon={<BellOff size={36} />}
          title={activeTab === "unread" ? "All caught up!" : "No read notifications"}
          subtitle={activeTab === "unread" ? "You have no unread notifications." : "Notifications you've read will appear here."}
          theme={theme} />
      ) : (
        <>
          <div className="space-y-3">
            {visibleList.map(n => <NotificationCard key={n.notificationId} notif={n} onMarkRead={handleMarkRead} theme={theme} />)}
          </div>
          <Pagination totalElements={data.totalElements} page={page} pageSize={PAGE_SIZE} onPage={p => setPage(p)} theme={theme} />
        </>
      )}
    </>
  );
};

// ─────────────────────────────────────────────
// Admin My Notifications Panel with theme
// ─────────────────────────────────────────────
const AdminMyNotificationsPanel = ({ token, onMarkRead, onMarkAllRead, refreshSignal, theme }) => {
  const [readData,   setReadData]   = useState({ content: [], totalElements: 0 });
  const [unreadData, setUnreadData] = useState({ content: [], totalElements: 0 });
  const [loading,    setLoading]    = useState(true);
  const [readPage,   setReadPage]   = useState(0);
  const [unreadPage, setUnreadPage] = useState(0);
  const [search,     setSearch]     = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [activeTab,  setActiveTab]  = useState("unread");

  const fetchData = useCallback(async (rPage = 0, uPage = 0) => {
    setLoading(true);
    try {
      const currentPage = activeTab === "read" ? rPage : uPage;
      const res = await axios.get(
        `${BASE_URL}/api/notification/admin/read-unread/paged?page=${currentPage}&size=${PAGE_SIZE}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = res.data?.data || res.data;
      setReadData({   content: data?.read?.content        || [], totalElements: data?.read?.totalElements   || 0 });
      setUnreadData({ content: data?.unread?.content      || [], totalElements: data?.unread?.totalElements || 0 });
    } catch (e) {
      console.error("Failed to fetch admin read/unread notifications", e);
    } finally {
      setLoading(false);
    }
  }, [token, activeTab]);

  useEffect(() => { fetchData(readPage, unreadPage); }, [fetchData, refreshSignal, readPage, unreadPage]);

  const handleMarkRead = async (id) => {
    await onMarkRead(id);
    setUnreadData(prev => {
      const item = prev.content.find(x => x.notificationId === id);
      if (item) {
        setReadData(r => ({
          content: [{ ...item, isRead: true }, ...r.content],
          totalElements: r.totalElements + 1,
        }));
      }
      return {
        content:       prev.content.filter(x => x.notificationId !== id),
        totalElements: Math.max(0, prev.totalElements - 1),
      };
    });
  };

  const handleMarkAllRead = async () => {
    await onMarkAllRead();
    setUnreadData(prev => {
      setReadData(r => ({
        content:       [...prev.content.map(n => ({ ...n, isRead: true })), ...r.content],
        totalElements: r.totalElements + prev.totalElements,
      }));
      return { content: [], totalElements: 0 };
    });
    const t = setTimeout(() => fetchData(readPage, unreadPage), 300);
    return () => clearTimeout(t);
  };

  const activeContent = activeTab === "unread" ? unreadData : readData;

  const filtered = activeContent.content.filter(n => {
    const s = search.toLowerCase();
    return (!search || n.title?.toLowerCase().includes(s) || n.message?.toLowerCase().includes(s)) &&
           (!typeFilter || n.notificationType === typeFilter);
  });

  return (
    <>
      <div className="flex items-center gap-2 mb-5">
        {[
          { id: "unread", label: "Unread", count: unreadData.totalElements },
          { id: "read",   label: "Read",   count: readData.totalElements },
        ].map(({ id, label, count }) => (
          <button key={id} onClick={() => { setActiveTab(id); setReadPage(0); setUnreadPage(0); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer border"
            style={activeTab === id
              ? { background: theme.primaryGradient, color: "#fff", borderColor: "transparent" }
              : { backgroundColor: theme.accentSoft, borderColor: theme.borderColor, color: theme.textSecondary }}>
            <span className={`w-2 h-2 rounded-full ${id === "unread" ? "bg-[#4CA1AF]" : "bg-slate-400"}`} style={{ backgroundColor: id === "unread" ? theme.primaryColor : theme.textMuted }} />
            {label}
            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${activeTab === id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}
              style={activeTab === id ? { backgroundColor: `${theme.primaryColor}40` } : { backgroundColor: theme.accentSoft, color: theme.textMuted }}>
              {count}
            </span>
          </button>
        ))}

        {unreadData.totalElements > 0 && (
          <button onClick={handleMarkAllRead}
            className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white cursor-pointer hover:opacity-90 transition-all"
            style={{ background: theme.primaryGradient }}>
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      <FilterBar search={search} onSearch={setSearch} typeFilter={typeFilter} onType={setTypeFilter} showActiveFilter={false} theme={theme} />

      <div className="rounded-2xl border shadow-sm overflow-hidden" style={{ backgroundColor: theme.bgCard, borderColor: theme.borderColor }}>
        {loading ? <Loader theme={theme} /> : filtered.length === 0 ? (
          <EmptyState icon={<BellOff size={36} />}
            title={activeTab === "unread" ? "All caught up!" : "No read notifications"}
            subtitle={activeTab === "unread" ? "You have no unread notifications." : "Notifications you've read will appear here."}
            theme={theme} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: theme.borderColor, backgroundColor: theme.accentSoft }}>
                  <th className="px-4 py-4 text-left text-[10px] font-black uppercase tracking-widest" style={{ color: theme.textMuted }}>Notification</th>
                  <th className="px-4 py-4 text-left text-[10px] font-black uppercase tracking-widest hidden sm:table-cell" style={{ color: theme.textMuted }}>Type</th>
                  <th className="px-4 py-4 text-left text-[10px] font-black uppercase tracking-widest hidden md:table-cell" style={{ color: theme.textMuted }}>Status</th>
                  <th className="px-4 py-4 text-left text-[10px] font-black uppercase tracking-widest hidden lg:table-cell" style={{ color: theme.textMuted }}>Created</th>
                  <th className="px-4 py-4 text-left text-[10px] font-black uppercase tracking-widest hidden lg:table-cell" style={{ color: theme.textMuted }}>Expires</th>
                  <th className="px-4 py-4 text-right text-[10px] font-black uppercase tracking-widest" style={{ color: theme.textMuted }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(n => (
                  <AdminNotifRow key={n.notificationId} notif={n}
                    showCheckbox={false} checked={false} onCheck={() => {}}
                    showReadStatus showFullMessage
                    onMarkRead={activeTab === "unread" ? handleMarkRead : undefined}
                    theme={theme} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination
        totalElements={activeContent.totalElements}
        page={activeTab === "unread" ? unreadPage : readPage}
        pageSize={PAGE_SIZE}
        onPage={(pg) => { if (activeTab === "unread") setUnreadPage(pg); else setReadPage(pg); }}
        theme={theme}
      />
    </>
  );
};

// ─────────────────────────────────────────────
// USER Notifications View
// ─────────────────────────────────────────────
const UserNotifications = ({ theme, isDarkMode }) => {
  const token = localStorage.getItem("token");
  const [toast,         setToast]         = useState(null);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [refreshSignal, setRefreshSignal] = useState(0);

  useEffect(() => {
    axios.get(`${BASE_URL}/api/notification/me/unread-count`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setUnreadCount(res.data?.data ?? res.data ?? 0))
      .catch(() => {});
  }, [token]);

  const markRead = async (id) => {
    try {
      await axios.patch(`${BASE_URL}/api/notification/${id}/read`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setUnreadCount(c => Math.max(0, c - 1));
    } catch { setToast({ msg: "Failed to mark as read", type: "error" }); }
  };

  const markAllRead = async () => {
    try {
      await axios.patch(`${BASE_URL}/api/notification/me/read-all`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setUnreadCount(0);
      setRefreshSignal(s => s + 1);
      setToast({ msg: "All notifications marked as read", type: "success" });
    } catch { setToast({ msg: "Failed to mark all as read", type: "error" }); }
  };

  return (
    <PageShell title="Notifications" subtitle="Stay updated with announcements, reminders, and club activity"
      icon={<User size={12} />} roleLabel="Student" theme={theme} isDarkMode={isDarkMode}
      headerRight={unreadCount > 0 && (
        <button onClick={markAllRead}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold text-white cursor-pointer shadow-md hover:opacity-90 transition-all"
          style={{ background: theme.primaryGradient }}>
          <CheckCheck size={15} /> Mark all read ({unreadCount})
        </button>
      )}>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} theme={theme} />}
      <MyNotificationsPanel
        token={token}
        onMarkRead={markRead}
        onMarkAllRead={markAllRead}
        refreshSignal={refreshSignal}
        theme={theme}
      />
    </PageShell>
  );
};

// ─────────────────────────────────────────────
// TEACHER Notifications View
// ─────────────────────────────────────────────
const TeacherNotifications = ({ theme, isDarkMode }) => {
  const token = localStorage.getItem("token");
  const [toast,         setToast]         = useState(null);
  const [tab,           setTab]           = useState("my");
  const [saving,        setSaving]        = useState(false);
  const [showForm,      setShowForm]      = useState(false);
  const [editNotif,     setEditNotif]     = useState(null);
  const [refreshSignal, setRefreshSignal] = useState(0);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: "", message: "", confirmText: "Confirm", variant: "primary", onConfirm: () => {} });
  const closeConfirm = () => setConfirmDialog(p => ({ ...p, isOpen: false }));

  useEffect(() => {
    axios.get(`${BASE_URL}/api/notification/me/unread-count`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setUnreadCount(res.data?.data ?? res.data ?? 0))
      .catch(() => {});
  }, [token]);

  const markRead = async (id) => {
    try {
      await axios.patch(`${BASE_URL}/api/notification/${id}/read`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setUnreadCount(c => Math.max(0, c - 1));
    } catch { setToast({ msg: "Failed to mark as read", type: "error" }); }
  };

  const markAllRead = async () => {
    try {
      await axios.patch(`${BASE_URL}/api/notification/me/read-all`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setUnreadCount(0);
      setRefreshSignal(s => s + 1);
      setToast({ msg: "All marked as read", type: "success" });
    } catch { setToast({ msg: "Failed", type: "error" }); }
  };

  const createOrUpdate = async (data) => {
    setSaving(true);
    try {
      if (editNotif) {
        await axios.patch(`${BASE_URL}/api/notification/${editNotif.notificationId}`,
          { notificationTitle: data.notificationTitle, message: data.message, validUntil: data.validUntil, notificationType: data.notificationType },
          { headers: { Authorization: `Bearer ${token}` } });
        setToast({ msg: "Notification updated", type: "success" });
      } else {
        await axios.post(`${BASE_URL}/api/notification`, data, { headers: { Authorization: `Bearer ${token}` } });
        setToast({ msg: "Notification created", type: "success" });
      }
      setShowForm(false); setEditNotif(null);
      setRefreshSignal(s => s + 1);
    } catch { setToast({ msg: "Failed to save notification", type: "error" }); }
    finally { setSaving(false); }
  };

  const toggleActive = async (notif) => {
    try {
      await axios.patch(`${BASE_URL}/api/notification/${notif.notificationId}/${notif.isActive ? "deactivate" : "reactivate"}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setToast({ msg: `Notification ${notif.isActive ? "deactivated" : "reactivated"}`, type: "success" });
      setRefreshSignal(s => s + 1);
    } catch { setToast({ msg: "Failed to toggle status", type: "error" }); }
  };

  const deleteNotif = async (notif) => {
    try {
      await axios.delete(`${BASE_URL}/api/notification/${notif.notificationId}`, { headers: { Authorization: `Bearer ${token}` } });
      setToast({ msg: "Notification deleted", type: "success" });
      setRefreshSignal(s => s + 1);
    } catch { setToast({ msg: "Failed to delete", type: "error" }); }
  };

  const triggerNotif = async (notif) => {
    try {
      await axios.get(`${BASE_URL}/api/notification/trigger/${notif.notificationId}`, { headers: { Authorization: `Bearer ${token}` } });
      setToast({ msg: "Notification triggered successfully", type: "success" });
      setRefreshSignal(s => s + 1);
    } catch { setToast({ msg: "Failed to trigger notification", type: "error" }); }
  };

  const askToggle  = (notif) => setConfirmDialog({ isOpen: true, title: notif.isActive ? "Deactivate Notification" : "Reactivate Notification", message: notif.isActive ? "This notification will stop being shown to users." : "This notification will become active and visible again.", confirmText: notif.isActive ? "Deactivate" : "Reactivate", variant: notif.isActive ? "danger" : "primary", onConfirm: async () => { closeConfirm(); await toggleActive(notif); } });
  const askDelete  = (notif) => setConfirmDialog({ isOpen: true, title: "Delete Notification", message: "This action cannot be undone.", confirmText: "Delete", variant: "danger", onConfirm: async () => { closeConfirm(); await deleteNotif(notif); } });
  const askTrigger = (notif) => setConfirmDialog({ isOpen: true, title: "Trigger Notification", message: "This will immediately trigger this notification.", confirmText: "Trigger", variant: "primary", onConfirm: async () => { closeConfirm(); await triggerNotif(notif); } });

  return (
    <PageShell title="Notifications" subtitle="View your notifications and manage club announcements"
      icon={<GraduationCap size={12} />} roleLabel="Teacher" theme={theme} isDarkMode={isDarkMode}
      headerRight={
        <div className="flex gap-2">
          {tab === "manage" && (
            <button onClick={() => { setEditNotif(null); setShowForm(true); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold text-white cursor-pointer shadow-md hover:opacity-90 transition-all"
              style={{ background: theme.primaryGradient }}>
              <Plus size={15} /> New Notification
            </button>
          )}
        </div>
      }>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} theme={theme} />}
      {(showForm || editNotif) && (
        <NotificationFormModal initial={editNotif} onClose={() => { setShowForm(false); setEditNotif(null); }}
          onSubmit={createOrUpdate} saving={saving} token={token} theme={theme} />
      )}
      <ConfirmDialog isOpen={confirmDialog.isOpen} title={confirmDialog.title} message={confirmDialog.message}
        confirmText={confirmDialog.confirmText} variant={confirmDialog.variant}
        onConfirm={confirmDialog.onConfirm} onCancel={closeConfirm} theme={theme} />

      <TabBar active={tab} onChange={t => setTab(t)} tabs={[
        { id: "my",     icon: <Bell size={14} />, label: "My Notifications", badge: unreadCount },
        { id: "manage", icon: <Zap size={14} />,  label: "Manage",           badge: 0 },
      ]} theme={theme} />

      {tab === "my" ? (
        <MyNotificationsPanel
          token={token}
          onMarkRead={markRead}
          onMarkAllRead={markAllRead}
          refreshSignal={refreshSignal}
          theme={theme}
        />
      ) : (
        <ManageTable token={token} showCheckboxes={false} showActiveFilter={false}
          fetchMode="created-by-me" refreshSignal={refreshSignal}
          onEdit={(n) => { setEditNotif(n); setShowForm(true); }}
          onTrigger={askTrigger} onToggle={askToggle} onDelete={askDelete}
          theme={theme} />
      )}
    </PageShell>
  );
};

// ─────────────────────────────────────────────
// SUPER ADMIN Notifications View
// ─────────────────────────────────────────────
const SuperAdminNotifications = ({ theme, isDarkMode }) => {
  const token = localStorage.getItem("token");
  const [toast,         setToast]         = useState(null);
  const [tab,           setTab]           = useState("my");
  const [saving,        setSaving]        = useState(false);
  const [showForm,      setShowForm]      = useState(false);
  const [editNotif,     setEditNotif]     = useState(null);
  const [refreshSignal, setRefreshSignal] = useState(0);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: "", message: "", confirmText: "Confirm", variant: "primary", onConfirm: () => {} });
  const closeConfirm = () => setConfirmDialog(p => ({ ...p, isOpen: false }));

  useEffect(() => {
    axios.get(`${BASE_URL}/api/notification/me/unread-count`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setUnreadCount(res.data?.data ?? res.data ?? 0))
      .catch(() => {});
  }, [token]);

  const markRead = async (id) => {
    try {
      await axios.patch(`${BASE_URL}/api/notification/${id}/read`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setUnreadCount(c => Math.max(0, c - 1));
    } catch { setToast({ msg: "Failed to mark as read", type: "error" }); }
  };

  const markAllRead = async () => {
    try {
      await axios.patch(`${BASE_URL}/api/notification/me/read-all`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setUnreadCount(0);
      setRefreshSignal(s => s + 1);
      setToast({ msg: "All notifications marked as read", type: "success" });
    } catch { setToast({ msg: "Failed to mark all as read", type: "error" }); }
  };

  const createOrUpdate = async (data) => {
    setSaving(true);
    try {
      if (editNotif) {
        await axios.patch(`${BASE_URL}/api/notification/${editNotif.notificationId}`,
          { notificationTitle: data.notificationTitle, message: data.message, validUntil: data.validUntil, notificationType: data.notificationType },
          { headers: { Authorization: `Bearer ${token}` } });
        setToast({ msg: "Notification updated", type: "success" });
      } else {
        await axios.post(`${BASE_URL}/api/notification`, data, { headers: { Authorization: `Bearer ${token}` } });
        setToast({ msg: "Notification sent", type: "success" });
      }
      setShowForm(false); setEditNotif(null);
      setRefreshSignal(s => s + 1);
    } catch { setToast({ msg: "Failed to save notification", type: "error" }); }
    finally { setSaving(false); }
  };

  const toggleActive = async (notif) => {
    try {
      await axios.patch(`${BASE_URL}/api/notification/${notif.notificationId}/${notif.isActive ? "deactivate" : "reactivate"}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setToast({ msg: `${notif.isActive ? "Deactivated" : "Reactivated"} successfully`, type: "success" });
      setRefreshSignal(s => s + 1);
    } catch { setToast({ msg: "Failed", type: "error" }); }
  };

  const hardDelete = async (notif) => {
    try {
      await axios.delete(`${BASE_URL}/api/notification/${notif.notificationId}`, { headers: { Authorization: `Bearer ${token}` } });
      setToast({ msg: "Notification permanently deleted", type: "success" });
      setRefreshSignal(s => s + 1);
    } catch { setToast({ msg: "Failed to delete", type: "error" }); }
  };

  const triggerNotif = async (notif) => {
    try {
      await axios.get(`${BASE_URL}/api/notification/trigger/${notif.notificationId}`, { headers: { Authorization: `Bearer ${token}` } });
      setToast({ msg: "Notification triggered successfully", type: "success" });
      setRefreshSignal(s => s + 1);
    } catch { setToast({ msg: "Failed to trigger notification", type: "error" }); }
  };

  const askToggle  = (notif) => setConfirmDialog({ isOpen: true, title: notif.isActive ? "Deactivate Notification" : "Reactivate Notification", message: notif.isActive ? "This notification will stop being shown to users." : "This notification will become active and visible again.", confirmText: notif.isActive ? "Deactivate" : "Reactivate", variant: notif.isActive ? "danger" : "primary", onConfirm: async () => { closeConfirm(); await toggleActive(notif); } });
  const askDelete  = (notif) => setConfirmDialog({ isOpen: true, title: "Permanently Delete Notification", message: "This will permanently remove the notification and cannot be undone.", confirmText: "Delete Permanently", variant: "danger", onConfirm: async () => { closeConfirm(); await hardDelete(notif); } });
  const askTrigger = (notif) => setConfirmDialog({ isOpen: true, title: "Trigger Notification", message: "This will immediately trigger this notification.", confirmText: "Trigger", variant: "primary", onConfirm: async () => { closeConfirm(); await triggerNotif(notif); } });

  return (
    <PageShell title="Notification Management" icon={<ShieldCheck size={12} />} roleLabel="Super Admin" theme={theme} isDarkMode={isDarkMode}
      headerRight={
        <div className="flex gap-2">
          <button onClick={() => setRefreshSignal(s => s + 1)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold border transition-all cursor-pointer"
            style={{ borderColor: theme.borderColor, backgroundColor: theme.accentSoft, color: theme.textSecondary }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.primaryColor; e.currentTarget.style.color = theme.primaryColor; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.borderColor; e.currentTarget.style.color = theme.textSecondary; }}>
            <RefreshCw size={14} /> Refresh
          </button>
          {tab !== "my" && (
            <button onClick={() => { setEditNotif(null); setShowForm(true); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold text-white cursor-pointer shadow-md hover:opacity-90 transition-all"
              style={{ background: theme.primaryGradient }}>
              <Plus size={15} /> New Notification
            </button>
          )}
        </div>
      }>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} theme={theme} />}
      {(showForm || editNotif) && (
        <NotificationFormModal initial={editNotif} onClose={() => { setShowForm(false); setEditNotif(null); }}
          onSubmit={createOrUpdate} saving={saving} token={token} theme={theme} />
      )}
      <ConfirmDialog isOpen={confirmDialog.isOpen} title={confirmDialog.title} message={confirmDialog.message}
        confirmText={confirmDialog.confirmText} variant={confirmDialog.variant}
        onConfirm={confirmDialog.onConfirm} onCancel={closeConfirm} theme={theme} />

      <TabBar active={tab} onChange={t => setTab(t)} tabs={[
        { id: "my",     icon: <Bell size={14} />, label: "My Notifications", badge: unreadCount },
        { id: "manage", icon: <Zap size={14} />,  label: "Manage All",       badge: 0 },
      ]} theme={theme} />

      {tab === "my" ? (
        <AdminMyNotificationsPanel
          token={token}
          onMarkRead={markRead}
          onMarkAllRead={markAllRead}
          refreshSignal={refreshSignal}
          theme={theme}
        />
      ) : (
        <ManageTable token={token} showCheckboxes showFullMessage showActiveFilter
          refreshSignal={refreshSignal}
          onEdit={(n) => { setEditNotif(n); setShowForm(true); }}
          onTrigger={askTrigger} onToggle={askToggle} onDelete={askDelete}
          theme={theme} />
      )}
    </PageShell>
  );
};

// ─────────────────────────────────────────────
// Root — route to correct view by role
// ─────────────────────────────────────────────
const Notifications = () => {
  const [isDarkMode, setIsDarkMode] = useState(() =>
    localStorage.getItem("notificationsTheme") === "dark"
  );

  const theme = {
    primaryColor: isDarkMode ? DARK_PRIMARY_COLOR : LIGHT_PRIMARY_COLOR,
    primaryDark: isDarkMode ? DARK_PRIMARY_DARK : LIGHT_PRIMARY_DARK,
    primaryLight: isDarkMode ? DARK_PRIMARY_LIGHT : LIGHT_PRIMARY_LIGHT,
    primaryGradient: isDarkMode ? DARK_PRIMARY_GRADIENT : LIGHT_PRIMARY_GRADIENT,
    bgMain: isDarkMode ? DARK_BG_MAIN : LIGHT_BG_MAIN,
    bgGradient: isDarkMode ? DARK_BG_GRADIENT : LIGHT_BG_GRADIENT,
    bgCard: isDarkMode ? DARK_BG_CARD : LIGHT_BG_CARD,
    borderColor: isDarkMode ? DARK_BORDER_COLOR : LIGHT_BORDER_COLOR,
    borderColorHover: isDarkMode ? DARK_BORDER_COLOR_HOVER : LIGHT_BORDER_COLOR_HOVER,
    textPrimary: isDarkMode ? DARK_TEXT_PRIMARY : LIGHT_TEXT_PRIMARY,
    textSecondary: isDarkMode ? DARK_TEXT_SECONDARY : LIGHT_TEXT_SECONDARY,
    textMuted: isDarkMode ? DARK_TEXT_MUTED : LIGHT_TEXT_MUTED,
    accentSoft: isDarkMode ? DARK_ACCENT_SOFT : LIGHT_ACCENT_SOFT,
    isDarkMode: isDarkMode,
  };

  useEffect(() => {
    localStorage.setItem("notificationsTheme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const role = getRole();

  // Add theme toggle button to the header
  const addThemeToggle = () => {
    const header = document.querySelector('.sticky.top-0.z-40 .flex.items-center.justify-between');
    if (header && !header.querySelector('.theme-toggle-btn')) {
      const btn = document.createElement('button');
      btn.className = 'theme-toggle-btn p-2 rounded-xl transition-colors cursor-pointer';
      btn.style.background = theme.accentSoft;
      btn.style.color = theme.textSecondary;
      btn.title = isDarkMode ? "Switch to light mode" : "Switch to dark mode";
      btn.innerHTML = isDarkMode ? '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>' : '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
      btn.onclick = () => setIsDarkMode(prev => !prev);
      header.appendChild(btn);
    }
  };

  useEffect(() => {
    addThemeToggle();
  }, [theme.accentSoft, theme.textSecondary, isDarkMode]);

  if (isSuperAdmin(role)) return <SuperAdminNotifications theme={theme} isDarkMode={isDarkMode} />;
  if (isTeacher(role))    return <TeacherNotifications theme={theme} isDarkMode={isDarkMode} />;
  return <UserNotifications theme={theme} isDarkMode={isDarkMode} />;
};

export default Notifications;