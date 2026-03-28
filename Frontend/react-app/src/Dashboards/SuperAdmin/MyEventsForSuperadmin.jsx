// import React, { useState, useEffect, useCallback, useRef } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import ConfirmDialog from "../../components/ConfirmDialog";
// import CustomSelect from "../../components/CustomSelect";
// import StartAttendancePopup from "../../components/StartAttendencePopup";
// import EditEvent from "../../components/EditEvent";
// import DateTimePicker from "../../components/Datetimepicker";
// import "leaflet/dist/leaflet.css";
// import L from "leaflet";

// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
//   iconUrl:       "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
//   shadowUrl:     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
// });

// import {
//   Calendar, MapPin, Users, User, Clock, Target, Globe,
//   AlertCircle, CheckCircle, XCircle, Loader2, Sparkles,
//   Trophy, Star, BookOpen, Coffee, Music, Code, Camera, Heart,
//   Filter, ChevronDown, Search, Settings, Edit, Trash2,
//   Share2, Plus, Briefcase, X, ArrowLeft, ChevronLeft, ChevronRight,
// } from "lucide-react";

// // ─── Constants ────────────────────────────────────────────────────────────────
// const BASE_URL = import.meta.env.VITE_API_URL || "http://72.155.88.211:8080";
// const PAGE_SIZE = 9;
// const authHeaders = (token) => ({ Authorization: `Bearer ${token}`, "Content-Type": "application/json" });

// // ─── Server filter descriptor ─────────────────────────────────────────────────
// // A single descriptor object drives which API endpoint to call.
// // This replaces the old fragile string-based serverFilter and eliminates
// // stale-closure issues — every loadPage() call receives the full descriptor
// // as an explicit argument.
// //
// // Shapes:
// //   { kind: "all" }
// //   { kind: "enrollment", status: "OPEN" | "CLOSED" }
// //   { kind: "completed",  value: "true" | "false" }
// //   { kind: "ratings",    rating: number }
// //   { kind: "targetType", targetType: "GLOBAL" | "DEPARTMENT" | "CLUB" }
// //   { kind: "targetData", targetType: "DEPARTMENT" | "CLUB", targetId: number }
// const buildUrl = (descriptor, page) => {
//   const p = `page=${page}&size=${PAGE_SIZE}`;
//   switch (descriptor.kind) {
//     case "all":        return `${BASE_URL}/api/events/paged?${p}`;
//     case "enrollment": return `${BASE_URL}/api/events/enrollment/${descriptor.status}/paged?${p}`;
//     case "completed":  return `${BASE_URL}/api/events/endEvent/${descriptor.value}/paged?${p}`;
//     case "ratings":    return `${BASE_URL}/api/events/ratings/${descriptor.rating}/paged?${p}`;
//     case "targetType": return `${BASE_URL}/api/events/getByTargetType/${descriptor.targetType}/paged?${p}`;
//     case "targetData": return `${BASE_URL}/api/events/targetData/${descriptor.targetType}/${descriptor.targetId}/paged?${p}`;
//     default:           return `${BASE_URL}/api/events/paged?${p}`;
//   }
// };

// const fetchPagedEvents = async (descriptor, page, token) => {
//   const res = await axios.get(buildUrl(descriptor, page), { headers: authHeaders(token) });
//   return res.data?.data;
// };

// const fetchAllForStats = async (token) => {
//   const res = await axios.get(`${BASE_URL}/api/events`, { headers: authHeaders(token) });
//   return res.data?.data || [];
// };
// const fetchDepartments = async (token) => {
//   const res = await axios.get(`${BASE_URL}/api/department`, { headers: authHeaders(token) });
//   return res.data?.data || [];
// };
// const fetchAllClubs = async (token) => {
//   const res = await axios.get(`${BASE_URL}/api/clubs`, { headers: authHeaders(token) });
//   return res.data?.data || [];
// };

// // ─── Pure helpers ──────────────────────────────────────────────────────────────
// const formatDateTime = (dt) => {
//   if (!dt) return "N/A";
//   return new Date(dt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
// };
// const getDaysUntil = (date) => Math.ceil((new Date(date) - new Date()) / 86400000);

// const getTargetTypeIcon  = (t) => ({ global: <Globe className="w-4 h-4" />, club: <Users className="w-4 h-4" />, department: <Briefcase className="w-4 h-4" /> }[t?.toLowerCase()] ?? <Target className="w-4 h-4" />);
// const getTargetTypeColor = (t) => ({ global: "bg-blue-100 text-blue-700", club: "bg-purple-100 text-purple-700", department: "bg-green-100 text-green-700" }[t?.toLowerCase()] ?? "bg-gray-100 text-gray-700");

// // ─── Component ────────────────────────────────────────────────────────────────
// const MyEventsForSuperadmin = () => {
//   const navigate = useNavigate();
//   const token = localStorage.getItem("token");

//   // ── Server data ────────────────────────────────────────────────────────────
//   const [pageData, setPageData]       = useState({ content: [], pageNumber: 0, totalElements: 0, totalPages: 0, last: true });
//   const [statsEvents, setStatsEvents] = useState([]);
//   const [departments, setDepartments] = useState([]);
//   const [clubs, setClubs]             = useState([]);

//   // ── UI ─────────────────────────────────────────────────────────────────────
//   const [loading, setLoading]         = useState(true);
//   const [pageLoading, setPageLoading] = useState(false);
//   const [error, setError]             = useState(null);
//   const [showFilters, setShowFilters] = useState(false);
//   const [sortBy, setSortBy]           = useState("date");

//   // ── Active descriptor (drives which API endpoint is used) ─────────────────
//   // descriptorRef always holds the latest value so async callbacks never
//   // capture a stale closure.
//   const [descriptor, setDescriptor] = useState({ kind: "all" });
//   const descriptorRef               = useRef({ kind: "all" });
//   const [currentPage, setCurrentPage] = useState(0);

//   // ── UI filter state (kept in sync with descriptor) ─────────────────────────
//   const [filterType, setFilterType]                 = useState("all");   // all | GLOBAL | DEPARTMENT | CLUB
//   const [selectedDepartment, setSelectedDepartment] = useState("all");
//   const [selectedClub, setSelectedClub]             = useState("all");
//   const [selectedStatus, setSelectedStatus]         = useState("all");
//   const [selectedCompleted, setSelectedCompleted]   = useState("all");
//   const [selectedRating, setSelectedRating]         = useState("all");

//   // ── Client-side only (search + sort) ──────────────────────────────────────
//   const [searchTerm, setSearchTerm] = useState("");

//   // ── Modals ─────────────────────────────────────────────────────────────────
//   const [showEditModal, setShowEditModal]                           = useState(false);
//   const [editingEvent, setEditingEvent]                             = useState(null);
//   const [showAttendancePopup, setShowAttendancePopup]               = useState(false);
//   const [selectedEventForAttendance, setSelectedEventForAttendance] = useState(null);
//   const [showQRCodeModal, setShowQRCodeModal]                       = useState(false);
//   const [qrCodeEventId, setQrCodeEventId]                           = useState(null);
//   const [initialQRData, setInitialQRData]                           = useState(null);

//   const [activeAttendanceEvents, setActiveAttendanceEvents]   = useState({});
//   const [loadingAttendanceStatus, setLoadingAttendanceStatus] = useState(false);

//   const [confirmDialog, setConfirmDialog] = useState({
//     isOpen: false, title: "", message: "", variant: "primary", confirmText: "Confirm", onConfirm: () => {},
//   });
//   const closeConfirm = () => setConfirmDialog((p) => ({ ...p, isOpen: false }));

//   // ── Init ────────────────────────────────────────────────────────────────────
//   useEffect(() => {
//     const user = JSON.parse(localStorage.getItem("user"));
//     if (user?.role !== "SUPER_ADMIN") { setError("Access denied. This page is only for Super Admins."); setLoading(false); return; }
//     if (!token) { setError("No authentication token found. Please login again."); setLoading(false); return; }
//     initLoad();
//   }, []);

//   const initLoad = async () => {
//     setLoading(true);
//     try {
//       const [page, allEvents, depts, clubList] = await Promise.all([
//         fetchPagedEvents({ kind: "all" }, 0, token),
//         fetchAllForStats(token),
//         fetchDepartments(token),
//         fetchAllClubs(token),
//       ]);
//       setPageData(page);
//       setStatsEvents(allEvents);
//       setDepartments(depts);
//       setClubs(clubList);
//     } catch (err) {
//       setError(err.message || "An error occurred while fetching events");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ── Core page loader ─────────────────────────────────────────────────────────
//   // Always receives an explicit descriptor + page so it never relies on closure state.
//   const loadPage = useCallback(async (desc, page) => {
//     setPageLoading(true);
//     try {
//       const data = await fetchPagedEvents(desc, page, token);
//       setPageData(data);
//       setCurrentPage(page);
//     } catch (err) {
//       console.error("Page load error:", err);
//     } finally {
//       setPageLoading(false);
//     }
//   }, [token]);

//   // ── Descriptor applicator ─────────────────────────────────────────────────
//   // One function to update both the ref (for async callbacks) and the state
//   // (for render), then immediately load page 0.
//   const applyDescriptor = useCallback((desc) => {
//     descriptorRef.current = desc;
//     setDescriptor(desc);
//     setCurrentPage(0);
//     loadPage(desc, 0);
//   }, [loadPage]);

//   // ── Attendance helpers ─────────────────────────────────────────────────────
//   const checkAttendanceActive = async (eventId) => {
//     try {
//       const res = await axios.get(`${BASE_URL}/api/events/getById/${eventId}`, { headers: authHeaders(token) });
//       return res.data?.data?.attendanceActive || false;
//     } catch { return false; }
//   };

//   const checkAllEventsAttendance = useCallback(async () => {
//     if (!pageData.content?.length) return;
//     setLoadingAttendanceStatus(true);
//     const statusMap = {};
//     await Promise.all(pageData.content.map(async (event) => {
//       statusMap[event.eventId] = await checkAttendanceActive(event.eventId);
//     }));
//     setActiveAttendanceEvents(statusMap);
//     setLoadingAttendanceStatus(false);
//   }, [pageData.content, token]);

//   useEffect(() => {
//     if (pageData.content?.length) checkAllEventsAttendance();
//   }, [pageData.content, checkAllEventsAttendance]);

//   // ── Filter handlers ────────────────────────────────────────────────────────

//   // View by target type → /getByTargetType/{type}/paged
//   const handleFilterTypeChange = (type) => {
//     const next = filterType === type ? "all" : type;
//     setFilterType(next);
//     setSelectedDepartment("all");
//     setSelectedClub("all");
//     setSelectedStatus("all");
//     setSelectedCompleted("all");
//     setSelectedRating("all");
//     applyDescriptor(next === "all" ? { kind: "all" } : { kind: "targetType", targetType: next });
//   };

//   // Specific department → /targetData/DEPARTMENT/{id}/paged
//   const handleDepartmentChange = (value) => {
//     setSelectedDepartment(value);
//     setSelectedClub("all");
//     setSelectedStatus("all");
//     setSelectedCompleted("all");
//     setSelectedRating("all");
//     setFilterType(value === "all" ? "all" : "DEPARTMENT");
//     applyDescriptor(
//       value === "all"
//         ? { kind: "all" }
//         : { kind: "targetData", targetType: "DEPARTMENT", targetId: parseInt(value) }
//     );
//   };

//   // Specific club → /targetData/CLUB/{id}/paged
//   const handleClubChange = (value) => {
//     setSelectedClub(value);
//     setSelectedDepartment("all");
//     setSelectedStatus("all");
//     setSelectedCompleted("all");
//     setSelectedRating("all");
//     setFilterType(value === "all" ? "all" : "CLUB");
//     applyDescriptor(
//       value === "all"
//         ? { kind: "all" }
//         : { kind: "targetData", targetType: "CLUB", targetId: parseInt(value) }
//     );
//   };

//   // Enrollment status → /enrollment/{status}/paged
//   const handleEnrollmentStatusChange = (value) => {
//     setSelectedStatus(value);
//     setSelectedCompleted("all");
//     setFilterType("all");
//     setSelectedDepartment("all");
//     setSelectedClub("all");
//     setSelectedRating("all");
//     applyDescriptor(value === "all" ? { kind: "all" } : { kind: "enrollment", status: value.toUpperCase() });
//   };

//   // Completion status → /endEvent/{status}/paged
//   const handleCompletedStatusChange = (value) => {
//     setSelectedCompleted(value);
//     setSelectedStatus("all");
//     setFilterType("all");
//     setSelectedDepartment("all");
//     setSelectedClub("all");
//     setSelectedRating("all");
//     applyDescriptor(value === "all" ? { kind: "all" } : { kind: "completed", value: value === "completed" ? "true" : "false" });
//   };

//   // Ratings filter (minimum rating) → /ratings/{rating}/paged
//   const handleRatingsFilterChange = (value) => {
//     setSelectedRating(value);
//     setSelectedStatus("all");
//     setSelectedCompleted("all");
//     setFilterType("all");
//     setSelectedDepartment("all");
//     setSelectedClub("all");
//     applyDescriptor(value === "all" ? { kind: "all" } : { kind: "ratings", rating: parseInt(value) });
//   };

//   const clearAllFilters = () => {
//     setSearchTerm("");
//     setFilterType("all");
//     setSelectedDepartment("all");
//     setSelectedClub("all");
//     setSelectedStatus("all");
//     setSelectedCompleted("all");
//     setSelectedRating("all");
//     applyDescriptor({ kind: "all" });
//   };

//   // ── Attendance actions ─────────────────────────────────────────────────────
//   const handleStopAttendanceForEvent = async (eventId) => {
//     try {
//       const res = await axios.post(`${BASE_URL}/api/attendance/stop/${eventId}`, {}, { headers: authHeaders(token) });
//       if (res.data?.success) {
//         checkAllEventsAttendance();
//         loadPage(descriptorRef.current, currentPage);
//       } else { alert(res.data?.message || "Failed to stop attendance"); }
//     } catch (err) { alert(err.response?.data?.message || "Error stopping attendance"); }
//   };

//   // FIX: Accept eventId explicitly so this handler never depends on the
//   // selectedEventForAttendance state value, which may already be nulled out
//   // by the time React flushes the onClose batch.
//   const handleAttendanceStartSuccess = (apiResponse, eventId) => {
//     const qrData = apiResponse?.data ?? null;
//     if (eventId) {
//       setQrCodeEventId(eventId);
//       setInitialQRData(qrData);
//       setShowQRCodeModal(true);
//     }
//     checkAllEventsAttendance();
//     loadPage(descriptorRef.current, currentPage);
//   };

//   // ── Client-side: search + sort only (targetType/dept/club are now server-side) ──
//   const filteredEvents = (() => {
//     let list = [...(pageData.content || [])];
//     if (searchTerm.trim()) {
//       const q = searchTerm.toLowerCase();
//       list = list.filter((e) =>
//         e.title?.toLowerCase().includes(q) ||
//         e.description?.toLowerCase().includes(q) ||
//         e.organizer?.toLowerCase().includes(q) ||
//         e.creatorName?.toLowerCase().includes(q)
//       );
//     }
//     switch (sortBy) {
//       case "date":       list.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime)); break;
//       case "popularity": list.sort((a, b) => (b.currEnrollments || 0) - (a.currEnrollments || 0)); break;
//       case "enrollment": list.sort((a, b) => (b.maxEnrollments  || 0) - (a.maxEnrollments  || 0)); break;
//       case "ratings":    list.sort((a, b) => (Number(b.ratings) || 0) - (Number(a.ratings) || 0)); break;
//     }
//     return list;
//   })();

//   // ── Edit / Delete ──────────────────────────────────────────────────────────
//   const handleEditClick = (event) => {
//     // FIX: toISOString() always outputs UTC, which shifts the displayed time
//     // by the user's UTC offset (e.g. -5:30 in IST). Instead, build the
//     // datetime-local string from local clock values so the input shows
//     // exactly the same time that is stored in the DB.
//     const fmt = (d) => {
//       if (!d) return "";
//       const date = new Date(d);
//       const pad = (n) => String(n).padStart(2, "0");
//       return (
//         date.getFullYear() + "-" +
//         pad(date.getMonth() + 1) + "-" +
//         pad(date.getDate()) + "T" +
//         pad(date.getHours()) + ":" +
//         pad(date.getMinutes())
//       );
//     };
//     setEditingEvent({
//       ...event,
//       dateTime: fmt(event.dateTime),
//       enrollmentDeadline: fmt(event.enrollmentDeadline),
//       attendanceWindowStart: fmt(event.attendanceWindowStart),
//       attendanceWindowEnd: fmt(event.attendanceWindowEnd),
//     });
//     setShowEditModal(true);
//   };

//   const handleDeleteEvent = async (eventId) => {
//     try {
//       await axios.delete(`${BASE_URL}/api/events/deleteEvent/${eventId}`, { headers: authHeaders(token) });
//       const targetPage = pageData.content.length === 1 && currentPage > 0 ? currentPage - 1 : currentPage;
//       if (targetPage !== currentPage) setCurrentPage(targetPage);
//       await Promise.all([
//         loadPage(descriptorRef.current, targetPage),
//         fetchAllForStats(token).then(setStatsEvents),
//       ]);
//     } catch (err) { alert(err.response?.data?.message || "Failed to delete event"); }
//   };

//   // ── Stats ──────────────────────────────────────────────────────────────────
//   const stats = {
//     total:       statsEvents.length,
//     open:        statsEvents.filter((e) => e.enrollmentStatus?.toLowerCase() === "open").length,
//     closed:      statsEvents.filter((e) => e.enrollmentStatus?.toLowerCase() === "closed").length,
//     enrollments: statsEvents.reduce((s, e) => s + (e.currEnrollments || 0), 0),
//     global:      statsEvents.filter((e) => e.targetType?.toUpperCase() === "GLOBAL").length,
//     club:        statsEvents.filter((e) => e.targetType?.toUpperCase() === "CLUB").length,
//     dept:        statsEvents.filter((e) => e.targetType?.toUpperCase() === "DEPARTMENT").length,
//   };

//   const hasAnyFilter = descriptor.kind !== "all" || searchTerm;
//   const totalPages   = pageData.totalPages || 0;

//   // ── Loading / Error ────────────────────────────────────────────────────────
//   if (loading) return (
//     <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
//       <div className="text-center">
//         <div className="relative">
//           <div className="w-24 h-24 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-6" />
//           <div className="absolute inset-0 flex items-center justify-center"><Sparkles className="w-8 h-8 text-white animate-pulse" /></div>
//         </div>
//         <p className="text-white text-xl font-light animate-pulse">Loading admin dashboard...</p>
//         <p className="text-white/60 text-sm mt-2">Managing events for you</p>
//       </div>
//     </div>
//   );

//   if (error) return (
//     <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
//       <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 max-w-md w-full text-center border border-white/20">
//         <div className="bg-red-500/20 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6"><AlertCircle className="w-12 h-12 text-red-400" /></div>
//         <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
//         <p className="text-white/80 mb-8">{error}</p>
//         <button onClick={initLoad} className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all transform hover:scale-105 shadow-lg">Try Again</button>
//       </div>
//     </div>
//   );

//   // ── Render ─────────────────────────────────────────────────────────────────
//   return (
//     <>
//       <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
//         {/* Animated background */}
//         <div className="fixed inset-0 overflow-hidden pointer-events-none">
//           <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
//           <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
//           <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
//         </div>

//         {/* Sticky back bar */}
//         <div className="sticky top-0 z-50 w-full bg-white border-b border-gray-100">
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//             <div className="flex items-center h-16">
//               {/* <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#4CA1AF] transition-colors group">
//                 <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /><span>Back to Dashboard</span>
//               </button> */}
//                     <button
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
//             </div>
//           </div>
//         </div>

//         <div className="relative max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

//           {/* Header */}
//           <div className="mb-8">
//             <h1 className="text-5xl font-bold mb-4">
//               <span className="bg-clip-text text-transparent" style={{ background: "linear-gradient(135deg, #4CA1AF, #2C3E50)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
//                 Event Management
//               </span>
//             </h1>
//             <p className="text-xl text-gray-600 max-w-2xl">Monitor, manage, and analyze all events across the platform</p>
//           </div>

//           {/* Stats cards */}
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-5xl mx-auto mb-6">
//             {[
//               { label: "Total Events",      value: stats.total,       color: "text-gray-800",   bg: "bg-blue-100",   icon: <Calendar className="w-6 h-6 text-blue-600" /> },
//               { label: "Open Events",       value: stats.open,        color: "text-green-600",  bg: "bg-green-100",  icon: <CheckCircle className="w-6 h-6 text-green-600" /> },
//               { label: "Closed Events",     value: stats.closed,      color: "text-red-600",    bg: "bg-red-100",    icon: <XCircle className="w-6 h-6 text-red-600" /> },
//               { label: "Total Enrollments", value: stats.enrollments, color: "text-purple-600", bg: "bg-purple-100", icon: <Users className="w-6 h-6 text-purple-600" /> },
//             ].map(({ label, value, color, bg, icon }) => (
//               <div key={label} className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
//                 <div className="flex items-center justify-between">
//                   <div><p className="text-sm text-gray-600">{label}</p><p className={`text-3xl font-bold ${color}`}>{value}</p></div>
//                   <div className={`${bg} p-3 rounded-lg`}>{icon}</div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Target type stats */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-8">
//             {[
//               { label: "Global",     value: stats.global, color: "text-blue-600",   bg: "bg-blue-50/80",   icon: <Globe className="w-5 h-5 text-blue-600 mr-2" /> },
//               { label: "Club",       value: stats.club,   color: "text-purple-600", bg: "bg-purple-50/80", icon: <Users className="w-5 h-5 text-purple-600 mr-2" /> },
//               { label: "Department", value: stats.dept,   color: "text-green-600",  bg: "bg-green-50/80",  icon: <Briefcase className="w-5 h-5 text-green-600 mr-2" /> },
//             ].map(({ label, value, color, bg, icon }) => (
//               <div key={label} className={`${bg} backdrop-blur-sm p-4 rounded-xl`}>
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center">{icon}<span className="text-sm font-medium text-gray-600">{label}</span></div>
//                   <span className={`text-xl font-bold ${color}`}>{value}</span>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Create button */}
//           <div className="mb-6 flex justify-end">
//             <button
//               className="px-4 py-2 text-white rounded-lg shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
//               style={{ background: "linear-gradient(135deg, #4CA1AF, #2C3E50)" }}
//               onClick={() => navigate("/create-event")}
//             >
//               <Plus className="w-4 h-4" /><span>Create Event</span>
//             </button>
//           </div>

//           {/* Search & Filter bar */}
//           <div className="mb-8">
//             <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 border border-white/20">
//               <div className="flex flex-col lg:flex-row gap-4">
//                 <div className="flex-1 relative">
//                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 w-5 h-5" />
//                   <input
//                     type="text"
//                     placeholder="Search events by title, description, organizer..."
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all bg-white/50"
//                   />
//                 </div>
//                 <div className="flex items-center gap-3">
//                   <button
//                     onClick={() => setShowFilters(!showFilters)}
//                     className="px-4 py-3 text-white rounded-xl font-medium transition-all transform hover:scale-105 flex items-center space-x-2 shadow-lg"
//                     style={{ background: "linear-gradient(135deg, #4CA1AF, #2C3E50)" }}
//                   >
//                     <Filter className="w-5 h-5" /><span>Filters</span>
//                     <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
//                   </button>
//                   <CustomSelect
//                     value={sortBy}
//                     onChange={(e) => setSortBy(e.target.value)}
//                     options={[
//                       { value: "date",       label: "Sort by Date" },
//                       { value: "popularity", label: "Sort by Popularity" },
//                       { value: "enrollment", label: "Sort by Capacity" },
//                       { value: "ratings",    label: "Sort by Ratings" },
//                     ]}
//                   />
//                 </div>
//               </div>

//               {/* Active filter chips */}
//               {hasAnyFilter && (
//                 <div className="mt-4 pt-4 border-t border-gray-200">
//                   <div className="flex flex-wrap items-center gap-2">
//                     <span className="text-sm font-medium text-gray-600 mr-2">Active Filters:</span>
//                     {filterType !== "all" && selectedDepartment === "all" && selectedClub === "all" && (
//                       <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center">
//                         Type: {filterType}
//                         <button onClick={() => handleFilterTypeChange(filterType)} className="ml-2"><X className="w-3 h-3" /></button>
//                       </span>
//                     )}
//                     {selectedDepartment !== "all" && (
//                       <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center">
//                         Dept: {departments.find((d) => d.departmentId === parseInt(selectedDepartment))?.name || selectedDepartment}
//                         <button onClick={() => handleDepartmentChange("all")} className="ml-2"><X className="w-3 h-3" /></button>
//                       </span>
//                     )}
//                     {selectedClub !== "all" && (
//                       <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center">
//                         Club: {clubs.find((c) => c.clubId === parseInt(selectedClub))?.clubName || selectedClub}
//                         <button onClick={() => handleClubChange("all")} className="ml-2"><X className="w-3 h-3" /></button>
//                       </span>
//                     )}
//                     {selectedStatus !== "all" && (
//                       <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center">
//                         Enrollment: {selectedStatus}
//                         <button onClick={() => handleEnrollmentStatusChange("all")} className="ml-2"><X className="w-3 h-3" /></button>
//                       </span>
//                     )}
//                     {selectedCompleted !== "all" && (
//                       <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm flex items-center">
//                         Completion: {selectedCompleted === "completed" ? "Completed" : "Not Completed"}
//                         <button onClick={() => handleCompletedStatusChange("all")} className="ml-2"><X className="w-3 h-3" /></button>
//                       </span>
//                     )}
//                     {selectedRating !== "all" && (
//                       <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm flex items-center">
//                         Rating: {selectedRating}+
//                         <button onClick={() => handleRatingsFilterChange("all")} className="ml-2"><X className="w-3 h-3" /></button>
//                       </span>
//                     )}
//                     {searchTerm && (
//                       <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center">
//                         Search: "{searchTerm}"<button onClick={() => setSearchTerm("")} className="ml-2"><X className="w-3 h-3" /></button>
//                       </span>
//                     )}
//                     <button onClick={clearAllFilters} className="px-3 py-1 text-red-600 hover:text-red-800 text-sm font-medium ml-auto">Clear All</button>
//                   </div>
//                 </div>
//               )}

//               {/* Filter panel */}
//               {showFilters && (
//                 <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
//                   <div className="flex flex-wrap items-center gap-3">
//                     <span className="text-sm font-medium text-gray-600">View by:</span>
//                     <div className="flex flex-wrap gap-2">
//                       {[
//                         { key: "all",        label: "All Events",        grad: "linear-gradient(135deg,#6B7280,#374151)" },
//                         { key: "GLOBAL",     label: "Global Events",     grad: "linear-gradient(135deg,#3B82F6,#06B6D4)" },
//                         { key: "DEPARTMENT", label: "Department Events", grad: "linear-gradient(135deg,#10B981,#059669)" },
//                         { key: "CLUB",       label: "Club Events",       grad: "linear-gradient(135deg,#8B5CF6,#EC4899)" },
//                       ].map(({ key, label, grad }) => {
//                         const isActive = key === "all"
//                           ? descriptor.kind === "all"
//                           : filterType === key && selectedDepartment === "all" && selectedClub === "all";
//                         return (
//                           <button
//                             key={key}
//                             onClick={() => key === "all" ? clearAllFilters() : handleFilterTypeChange(key)}
//                             className={`px-4 py-2 rounded-lg font-medium transition-all ${isActive ? "text-white shadow-lg" : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"}`}
//                             style={isActive ? { background: grad } : {}}
//                           >
//                             {label}
//                           </button>
//                         );
//                       })}
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
//                       <CustomSelect
//                         value={selectedDepartment}
//                         onChange={(e) => handleDepartmentChange(e.target.value)}
//                         options={[
//                           { value: "all", label: "All Departments" },
//                           ...departments.map((d) => ({ value: String(d.departmentId), label: d.name })),
//                         ]}
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">Club</label>
//                       <CustomSelect
//                         value={selectedClub}
//                         onChange={(e) => handleClubChange(e.target.value)}
//                         options={[
//                           { value: "all", label: "All Clubs" },
//                           ...clubs.map((c) => ({ value: String(c.clubId), label: c.clubName })),
//                         ]}
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">Enrollment Status</label>
//                       <CustomSelect
//                         value={selectedStatus}
//                         onChange={(e) => handleEnrollmentStatusChange(e.target.value)}
//                         options={[{ value: "all", label: "All Status" }, { value: "open", label: "Open" }, { value: "closed", label: "Closed" }]}
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">Completion Status</label>
//                       <CustomSelect
//                         value={selectedCompleted}
//                         onChange={(e) => handleCompletedStatusChange(e.target.value)}
//                         options={[{ value: "all", label: "All Events" }, { value: "completed", label: "Completed" }, { value: "not-completed", label: "Not Completed" }]}
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">Ratings</label>
//                       <CustomSelect
//                         value={selectedRating}
//                         onChange={(e) => handleRatingsFilterChange(e.target.value)}
//                         options={[
//                           { value: "all", label: "All Ratings" },
//                           { value: "1", label: "1+" },
//                           { value: "2", label: "2+" },
//                           { value: "3", label: "3+" },
//                           { value: "4", label: "4+" },
//                           { value: "5", label: "5" },
//                         ]}
//                       />
//                     </div>
//                   </div>

//                   <div className="flex justify-end gap-2">
//                     <button onClick={clearAllFilters} className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium">Clear All</button>
//                     <button onClick={() => setShowFilters(false)} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Done</button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Results summary */}
//           <div className="mb-4 flex justify-between items-center">
//             <p className="text-sm text-gray-600">
//               Showing <span className="font-semibold">{filteredEvents.length}</span>
//               {filteredEvents.length !== (pageData.content || []).length && (
//                 <span className="text-gray-400"> (filtered from {(pageData.content || []).length})</span>
//               )}{" "}
//               · Total <span className="font-semibold">{pageData.totalElements}</span> events
//               {" · "}Page <span className="font-semibold">{currentPage + 1}</span> of{" "}
//               <span className="font-semibold">{totalPages || 1}</span>
//             </p>
//             {pageLoading && (
//               <div className="flex items-center gap-2 text-sm text-gray-500">
//                 <Loader2 className="w-4 h-4 animate-spin" />Loading...
//               </div>
//             )}
//           </div>

//           {/* Events grid */}
//           {filteredEvents.length === 0 && !pageLoading ? (
//             <div className="text-center py-16">
//               <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 max-w-md mx-auto border border-white/20">
//                 <div className="relative">
//                   <div className="absolute inset-0 flex items-center justify-center">
//                     <div className="w-32 h-32 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 animate-ping" />
//                   </div>
//                   <Calendar className="w-20 h-20 text-gray-400 mx-auto mb-4 relative z-10" />
//                 </div>
//                 <h3 className="text-2xl font-bold text-gray-800 mb-2">No Events Found</h3>
//                 <p className="text-gray-600 mb-6">There are no events matching your criteria.</p>
//                 <button onClick={clearAllFilters} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg">
//                   Clear All Filters
//                 </button>
//               </div>
//             </div>
//           ) : (
//             <>
//               <div className={`grid gap-4 w-full ${filteredEvents.length === 1 ? "grid-cols-1 max-w-sm mx-auto" : filteredEvents.length === 2 ? "grid-cols-1 md:grid-cols-2 max-w-2xl mx-auto" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"}`}>
//                 {filteredEvents.map((event, index) => {
//                   const daysUntil       = getDaysUntil(event.dateTime);
//                   const targetTypeColor = getTargetTypeColor(event.targetType);
//                   const enrollmentPct   = Math.min(100, ((event.currEnrollments || 0) / (event.maxEnrollments || 1)) * 100);
//                   const overallRating   = Number(event.ratings);
//                   const hasOverallRating = Number.isFinite(overallRating) && overallRating > 0;

//                   return (
//                     <div key={event.eventId} className="event-card-container" style={{ animationDelay: `${index * 80}ms` }}>
//                       <div className="event-card">
//                         {/* Front */}
//                         <div className="card-face card-front bg-white/90 backdrop-blur-sm rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-500 border border-white/20">
//                           <div className="relative h-32 p-3 overflow-hidden" style={{ background: "linear-gradient(135deg, #4CA1AF, #2C3E50)" }}>
//                             <div className="absolute inset-0 opacity-10">
//                               <div className="absolute -top-12 -right-12 w-24 h-24 bg-white rounded-full" />
//                               <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-white rounded-full" />
//                             </div>
//                             {daysUntil > 0 && (
//                               <div className="absolute top-2 left-2 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
//                                 <span className="text-white text-xs font-semibold">{daysUntil} days to go</span>
//                               </div>
//                             )}
//                             <div className="absolute top-2 right-2">
//                               <span className={`text-[10px] font-medium px-2 py-1 rounded-full ${event.completed ? "bg-gray-100 text-gray-600" : "bg-green-100 text-green-600"}`}>
//                                 {event.completed ? "Completed" : "Upcoming"}
//                               </span>
//                             </div>
//                             {event.completed && hasOverallRating && (
//                               <div className="absolute bottom-2 left-2 z-10 flex items-center gap-0.5 bg-black/35 backdrop-blur-sm px-1.5 py-0.5 rounded-full">
//                                 <Star className="w-2.5 h-2.5" style={{ fill: "#FBBF24", color: "#FBBF24" }} />
//                                 <span className="text-white text-[10px] font-bold leading-none">
//                                   {overallRating.toFixed(1)}
//                                 </span>
//                               </div>
//                             )}
//                             <div className="absolute bottom-2 right-2 text-right">
//                               <h3 className="text-sm font-bold text-white mb-0.5 line-clamp-1">{event.title}</h3>
//                               <p className="text-[10px] text-white/80 line-clamp-1">{event.description}</p>
//                             </div>
//                           </div>

//                           <div className="p-3 space-y-2">
//                             <div className="flex flex-wrap gap-1">
//                               <div className="bg-blue-50 px-2 py-0.5 rounded-full text-[10px] font-medium text-blue-600 flex items-center">
//                                 <Calendar className="w-2.5 h-2.5 mr-1" />{formatDateTime(event.dateTime)}
//                               </div>
//                               <div className="bg-green-50 px-2 py-0.5 rounded-full text-[10px] font-medium text-green-600 flex items-center">
//                                 <MapPin className="w-2.5 h-2.5 mr-1" />{event.venue}
//                               </div>
//                             </div>
//                             <div className="grid grid-cols-2 gap-1">
//                               <div className="bg-gray-50 p-1.5 rounded-lg">
//                                 <p className="text-[8px] text-gray-500">Organizer</p>
//                                 <p className="text-xs font-semibold text-gray-800 flex items-center truncate">
//                                   <User className="w-3 h-3 mr-0.5 text-blue-500 flex-shrink-0" /><span className="truncate">{event.organizer}</span>
//                                 </p>
//                               </div>
//                               <div className="bg-gray-50 p-1.5 rounded-lg">
//                                 <p className="text-[8px] text-gray-500">Speaker</p>
//                                 <p className="text-xs font-semibold text-gray-800 flex items-center truncate">
//                                   <User className="w-3 h-3 mr-0.5 text-green-500 flex-shrink-0" /><span className="truncate">{event.speakerName || event.organizer}</span>
//                                 </p>
//                               </div>
//                             </div>
//                             <div className="flex items-center justify-between">
//                               <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${targetTypeColor} flex items-center`}>
//                                 {getTargetTypeIcon(event.targetType)}<span className="ml-1 capitalize text-xs">{event.targetType || "N/A"}</span>
//                               </span>
//                             </div>
//                             {event.completed && hasOverallRating && (
//                               <div className="flex items-center gap-1">
//                                 <div className="flex items-center gap-0.5">
//                                   {[1, 2, 3, 4, 5].map((s) => (
//                                     <Star
//                                       key={s}
//                                       className="w-2.5 h-2.5"
//                                       style={{
//                                         fill: s <= Math.round(overallRating) ? "#FBBF24" : "#E5E7EB",
//                                         color: s <= Math.round(overallRating) ? "#FBBF24" : "#E5E7EB",
//                                       }}
//                                     />
//                                   ))}
//                                 </div>
//                                 <span className="text-[10px] text-gray-500 font-medium">{overallRating.toFixed(1)}</span>
//                               </div>
//                             )}
//                             <div className="text-center text-[8px] mt-1 flex items-center justify-center" style={{ color: "#4CA1AF" }}>
//                               <span className="animate-pulse mr-1 text-[6px]">●</span>Hover to view all details
//                             </div>
//                           </div>
//                         </div>

//                         {/* Back */}
//                         <div className="card-face card-back rounded-xl shadow-md overflow-hidden p-3" style={{ background: "linear-gradient(135deg, #4CA1AF, #2C3E50)" }}>
//                           <div className="h-full flex flex-col">
//                             <h3 className="text-sm font-bold mb-2 line-clamp-1 text-white">{event.title}</h3>

//                             <div className="space-y-1.5 overflow-y-auto flex-1 pr-1 custom-scrollbar text-xs">
//                               <div className="grid grid-cols-2 gap-1">
//                                 <div className="p-1.5 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
//                                   <div className="flex items-center mb-0.5"><Calendar className="w-3 h-3 mr-1 text-white/80" /><p className="text-[10px] text-white/80">Date</p></div>
//                                   <p className="text-xs font-medium text-white">{formatDateTime(event.dateTime)}</p>
//                                 </div>
//                                 <div className="p-1.5 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
//                                   <div className="flex items-center mb-0.5"><Clock className="w-3 h-3 mr-1 text-white/80" /><p className="text-[10px] text-white/80">Deadline</p></div>
//                                   <p className="text-xs font-medium text-white">{new Date(event.enrollmentDeadline).toLocaleDateString()}</p>
//                                 </div>
//                               </div>

//                               <div className="p-1.5 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
//                                 <p className="text-[10px] text-white/80 mb-1 flex items-center"><Star className="w-2.5 h-2.5 mr-1" />Created By</p>
//                                 <p className="text-xs font-medium text-white truncate">{event.creatorName}</p>
//                               </div>

//                               {event.targetType?.toUpperCase() === "DEPARTMENT" && event.targetIds?.length > 0 && (
//                                 <div className="p-1.5 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
//                                   <p className="text-[10px] text-white/80 mb-1 flex items-center"><Briefcase className="w-2.5 h-2.5 mr-1" />Target Departments</p>
//                                   <div className="flex flex-wrap gap-1">
//                                     {event.targetIds.map((id) => (
//                                       <span key={id} className="px-1.5 py-0.5 rounded text-[8px] font-medium text-white" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
//                                         {departments.find((d) => d.departmentId === id)?.name || `ID: ${id}`}
//                                       </span>
//                                     ))}
//                                   </div>
//                                 </div>
//                               )}

//                               {event.targetType?.toUpperCase() === "CLUB" && event.targetIds?.length > 0 && (
//                                 <div className="p-1.5 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
//                                   <p className="text-[10px] text-white/80 mb-1 flex items-center"><Users className="w-2.5 h-2.5 mr-1" />Target Clubs</p>
//                                   <div className="flex flex-wrap gap-1">
//                                     {event.targetIds.map((id) => (
//                                       <span key={id} className="px-1.5 py-0.5 rounded text-[8px] font-medium text-white" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
//                                         {clubs.find((c) => c.clubId === id)?.clubName || `ID: ${id}`}
//                                       </span>
//                                     ))}
//                                   </div>
//                                 </div>
//                               )}

//                               <div className="p-1.5 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
//                                 <div className="flex justify-between items-center mb-1">
//                                   <span className="text-[10px] text-white/80">Enrollment</span>
//                                   <span className="text-xs text-white">{event.currEnrollments}/{event.maxEnrollments}</span>
//                                 </div>
//                                 <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
//                                   <div className="h-full rounded-full" style={{ width: `${enrollmentPct}%`, backgroundColor: "#4CA1AF" }} />
//                                 </div>
//                               </div>
//                             </div>

//                             <div className="mt-2 pt-1 border-t border-white/20 flex items-center justify-between">
//                               <div className="flex items-center gap-1">
//                                 <span className="text-[9px] text-white/60">Enrollment:</span>
//                                 <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${event.enrollmentStatus?.toLowerCase() === "open" ? "bg-green-500/30 text-green-100" : event.enrollmentStatus?.toLowerCase() === "closed" ? "bg-red-500/30 text-red-100" : "bg-yellow-500/30 text-yellow-100"}`}>
//                                   {event.enrollmentStatus || "N/A"}
//                                 </span>
//                               </div>
//                               <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${event.completed ? "bg-gray-500/30 text-gray-100" : "bg-blue-500/30 text-blue-100"}`}>
//                                 {event.completed ? "Done" : "Upcoming"}
//                               </span>
//                             </div>

//                             <div className="mt-1.5 flex gap-1">
//                               {event.completed ? (
//                                 <div className="flex-1 px-2 py-1.5 rounded-lg flex items-center justify-center gap-1" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
//                                   <CheckCircle className="w-3 h-3 text-gray-300" />
//                                   <span className="text-[10px] text-gray-300 font-medium">Event Completed</span>
//                                 </div>
//                               ) : (
//                                 <>
//                                   {loadingAttendanceStatus ? (
//                                     <div className="flex-1 px-1.5 py-1 rounded-lg text-[10px] font-medium flex items-center justify-center text-white bg-gray-400">
//                                       <Loader2 className="w-2.5 h-2.5 mr-0.5 animate-spin" />Loading...
//                                     </div>
//                                   ) : activeAttendanceEvents[event.eventId] ? (
//                                     <>
//                                       <button
//                                         onClick={(e) => { e.stopPropagation(); setConfirmDialog({ isOpen: true, title: "Stop Attendance", message: "Are you sure you want to stop attendance for this event? Students will no longer be able to mark attendance.", confirmText: "Stop", variant: "danger", onConfirm: () => { closeConfirm(); handleStopAttendanceForEvent(event.eventId); } }); }}
//                                         className="flex-1 px-1.5 py-1 rounded-lg text-[10px] font-medium transition flex items-center justify-center text-white"
//                                         style={{ backgroundColor: "rgba(239,68,68,0.6)" }}
//                                         onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.8)")}
//                                         onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.6)")}
//                                       >
//                                         <XCircle className="w-2.5 h-2.5 mr-0.5" />Stop
//                                       </button>
//                                       <button
//                                         onClick={(e) => { e.stopPropagation(); setInitialQRData(null); setQrCodeEventId(event.eventId); setShowQRCodeModal(true); }}
//                                         className="flex-1 px-1.5 py-1 rounded-lg text-[10px] font-medium transition flex items-center justify-center text-white"
//                                         style={{ backgroundColor: "rgba(156,39,176,0.6)" }}
//                                         onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(156,39,176,0.8)")}
//                                         onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(156,39,176,0.6)")}
//                                       >
//                                         <svg className="w-2.5 h-2.5 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
//                                         </svg>
//                                         QR
//                                       </button>
//                                     </>
//                                   ) : (
//                                     <button
//                                       onClick={(e) => { e.stopPropagation(); setSelectedEventForAttendance(event); setShowAttendancePopup(true); }}
//                                       className="flex-1 px-1.5 py-1 rounded-lg text-[10px] font-medium transition flex items-center justify-center text-white"
//                                       style={{ backgroundColor: "rgba(76,175,80,0.5)" }}
//                                       onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(76,175,80,0.6)")}
//                                       onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(76,175,80,0.5)")}
//                                     >
//                                       <MapPin className="w-2.5 h-2.5 mr-0.5" />Start
//                                     </button>
//                                   )}

//                                   <button
//                                     onClick={(e) => { e.stopPropagation(); handleEditClick(event); }}
//                                     className="flex-1 px-1.5 py-1 rounded-lg text-[10px] font-medium transition flex items-center justify-center text-white"
//                                     style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
//                                     onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.3)")}
//                                     onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.2)")}
//                                   >
//                                     <Edit className="w-2.5 h-2.5 mr-0.5" />Edit
//                                   </button>
//                                   <button
//                                     onClick={(e) => { e.stopPropagation(); setConfirmDialog({ isOpen: true, title: "Delete Event", message: "Are you sure you want to delete this event? This action cannot be undone.", confirmText: "Delete", variant: "danger", onConfirm: () => { closeConfirm(); handleDeleteEvent(event.eventId); } }); }}
//                                     className="flex-1 px-1.5 py-1 rounded-lg text-[10px] font-medium transition flex items-center justify-center text-white"
//                                     style={{ backgroundColor: "rgba(239,68,68,0.5)" }}
//                                     onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.6)")}
//                                     onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.5)")}
//                                   >
//                                     <Trash2 className="w-2.5 h-2.5 mr-0.5" />Delete
//                                   </button>
//                                 </>
//                               )}
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>

//               {/* Pagination — totalPages & totalElements now come from the server
//                   for the active descriptor, so they already reflect the filtered
//                   subset. If there is only 1 page, the bar is hidden entirely. */}
//               {totalPages > 1 && (
//                 <div className="mt-10 flex flex-col items-center gap-3">
//                   <div className="flex items-center gap-2">
//                     <button
//                       onClick={() => loadPage(descriptorRef.current, currentPage - 1)}
//                       disabled={currentPage === 0 || pageLoading}
//                       className="p-2 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
//                     >
//                       <ChevronLeft className="w-5 h-5" />
//                     </button>

//                     {Array.from({ length: totalPages }, (_, i) => i)
//                       .filter((i) => i === 0 || i === totalPages - 1 || Math.abs(i - currentPage) <= 1)
//                       .reduce((acc, i, idx, arr) => {
//                         if (idx > 0 && i - arr[idx - 1] > 1) acc.push(`ellipsis-${i}`);
//                         acc.push(i);
//                         return acc;
//                       }, [])
//                       .map((item) =>
//                         typeof item === "string" ? (
//                           <span key={item} className="px-2 text-gray-400">…</span>
//                         ) : (
//                           <button
//                             key={item}
//                             onClick={() => loadPage(descriptorRef.current, item)}
//                             disabled={pageLoading}
//                             className={`w-9 h-9 rounded-full text-sm font-medium transition border disabled:cursor-not-allowed ${currentPage === item ? "text-white border-transparent" : "text-gray-600 border-gray-200 hover:bg-gray-50"}`}
//                             style={currentPage === item ? { background: "linear-gradient(135deg, #4CA1AF, #2C3E50)" } : {}}
//                           >
//                             {item + 1}
//                           </button>
//                         )
//                       )}

//                     <button
//                       onClick={() => loadPage(descriptorRef.current, currentPage + 1)}
//                       disabled={pageData.last || pageLoading}
//                       className="p-2 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
//                     >
//                       <ChevronRight className="w-5 h-5" />
//                     </button>
//                   </div>
//                   <p className="text-xs text-gray-400">
//                     Page {currentPage + 1} of {totalPages} — {pageData.totalElements} events
//                   </p>
//                 </div>
//               )}
//             </>
//           )}

//           {/* Footer */}
//           <div className="mt-12 text-center">
//             <div className="inline-flex items-center space-x-2 text-gray-500 text-sm">
//               <Settings className="w-4 h-4" />
//               <span>Admin controls active · {pageData.totalElements} events total</span>
//               <Share2 className="w-4 h-4" />
//             </div>
//           </div>
//         </div>

//         {/* Edit Modal */}
//         {showEditModal && editingEvent && (
//           <EditEvent
//             event={editingEvent}
//             token={token}
//             onClose={() => { setShowEditModal(false); setEditingEvent(null); }}
//             onSuccess={() => { loadPage(descriptorRef.current, currentPage); checkAllEventsAttendance(); }}
//           />
//         )}

//         <style jsx>{`
//           @keyframes blob { 0%{transform:translate(0,0) scale(1)} 33%{transform:translate(30px,-50px) scale(1.1)} 66%{transform:translate(-20px,20px) scale(0.9)} 100%{transform:translate(0,0) scale(1)} }
//           .animate-blob{animation:blob 7s infinite} .animation-delay-2000{animation-delay:2s} .animation-delay-4000{animation-delay:4s}
//           .event-card-container{perspective:1000px;height:280px}
//           .event-card{transform-style:preserve-3d;transition:transform 0.5s ease-in-out;width:100%;height:100%;position:relative}
//           .event-card-container:hover .event-card{transform:rotateY(180deg)}
//           .card-face{position:absolute;width:100%;height:100%;backface-visibility:hidden;border-radius:.75rem;overflow:hidden}
//           .card-front{transform:rotateY(0deg)} .card-back{transform:rotateY(180deg)}
//           .custom-scrollbar::-webkit-scrollbar{width:2px} .custom-scrollbar::-webkit-scrollbar-track{background:rgba(255,255,255,.1);border-radius:10px}
//           .custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(255,255,255,.3);border-radius:10px}
//           .line-clamp-1{display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden}
//         `}</style>
//       </div>

//       <ConfirmDialog
//         isOpen={confirmDialog.isOpen}
//         title={confirmDialog.title}
//         message={confirmDialog.message}
//         confirmText={confirmDialog.confirmText}
//         variant={confirmDialog.variant}
//         onConfirm={confirmDialog.onConfirm}
//         onCancel={closeConfirm}
//       />

//       {/* FIX: Capture eventId at call time so handleAttendanceStartSuccess
//           never depends on selectedEventForAttendance state (which may already
//           be nulled out when React flushes the batch from onClose). */}
//       <StartAttendancePopup
//         isOpen={showAttendancePopup}
//         onClose={() => { setShowAttendancePopup(false); setSelectedEventForAttendance(null); }}
//         event={selectedEventForAttendance}
//         onSuccess={(apiResponse) => {
//           const eventId = selectedEventForAttendance?.eventId;
//           setShowAttendancePopup(false);
//           setSelectedEventForAttendance(null);
//           handleAttendanceStartSuccess(apiResponse, eventId);
//         }}
//         token={token}
//       />

//       {showQRCodeModal && (
//         <div className="fixed inset-0 z-50 overflow-y-auto">
//           <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowQRCodeModal(false)} />
//           <div className="flex min-h-full items-center justify-center p-4">
//             <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl">
//               <QRCodeDisplay
//                 eventId={qrCodeEventId}
//                 token={token}
//                 initialQRData={initialQRData}
//                 onClose={() => { setShowQRCodeModal(false); setInitialQRData(null); checkAllEventsAttendance(); }}
//                 onAttendanceEnd={() => { setShowQRCodeModal(false); setInitialQRData(null); checkAllEventsAttendance(); }}
//               />
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// // ─── QRCodeDisplay (unchanged from previous version) ──────────────────────────
// const QRCodeDisplay = ({ eventId, token, initialQRData, onClose, onAttendanceEnd }) => {
//   const [qrData, setQrData]                     = useState(initialQRData ?? null);
//   const [loading, setLoading]                   = useState(!initialQRData);
//   const [error, setError]                       = useState(null);
//   const [timeLeft, setTimeLeft]                 = useState(initialQRData?.refreshInSeconds ?? 0);
//   const [attendanceActive, setAttendanceActive] = useState(true);
//   const [eventDetails, setEventDetails]         = useState(null);
//   const [refreshInterval, setRefreshInterval]   = useState(initialQRData?.refreshInSeconds ?? 120);
//   const [stopLoading, setStopLoading]           = useState(false);
//   const [stopError, setStopError]               = useState(null);

//   const qrTimerRef        = useRef(null);
//   const statusCheckRef    = useRef(null);
//   const countdownRef      = useRef(null);
//   const windowEndTimerRef = useRef(null);

//   const handleStopAttendance = async () => {
//     setStopLoading(true); setStopError(null);
//     try {
//       const res = await axios.post(`${BASE_URL}/api/attendance/stop/${eventId}`, {}, { headers: authHeaders(token) });
//       if (res.data?.success) {
//         clearTimeout(qrTimerRef.current); clearInterval(statusCheckRef.current);
//         clearInterval(countdownRef.current); clearTimeout(windowEndTimerRef.current);
//         setAttendanceActive(false);
//         if (onAttendanceEnd) onAttendanceEnd();
//       } else { setStopError(res.data?.message || "Failed to stop attendance"); }
//     } catch (err) { setStopError(err.response?.data?.message || "Error stopping attendance"); }
//     finally { setStopLoading(false); }
//   };

//   const scheduleWindowEndTimer = useCallback((windowEnd) => {
//     clearTimeout(windowEndTimerRef.current);
//     if (!windowEnd) return;
//     const ms = new Date(windowEnd) - Date.now();
//     if (ms <= 0) return;
//     windowEndTimerRef.current = setTimeout(() => {
//       setAttendanceActive(false);
//       clearTimeout(qrTimerRef.current); clearInterval(statusCheckRef.current); clearInterval(countdownRef.current);
//       if (onAttendanceEnd) onAttendanceEnd();
//     }, ms);
//   }, [onAttendanceEnd]);

//   const fetchEventDetails = useCallback(async () => {
//     try {
//       const res = await axios.get(`${BASE_URL}/api/events/getById/${eventId}`, { headers: authHeaders(token) });
//       const data = res.data?.data;
//       setEventDetails(data);
//       scheduleWindowEndTimer(data?.attendanceWindowEnd);
//       return data?.attendanceActive ?? false;
//     } catch { return true; }
//   }, [eventId, token, scheduleWindowEndTimer]);

//   const fetchQRCode = useCallback(async () => {
//     try {
//       setError(null);
//       const res = await axios.get(`${BASE_URL}/api/attendance/qr-code/${eventId}`, { headers: authHeaders(token) });
//       if (res.data?.success) {
//         const newQr = res.data.data;
//         setQrData(newQr);
//         const secs = newQr.refreshInSeconds || 120;
//         setRefreshInterval(secs); setTimeLeft(secs);
//         clearTimeout(qrTimerRef.current);
//         qrTimerRef.current = setTimeout(fetchQRCode, secs * 1000);
//       } else { setError("Failed to fetch QR code"); }
//     } catch (err) { setError(err.response?.data?.message || "Error fetching QR code"); }
//     finally { setLoading(false); }
//   }, [eventId, token]);

//   useEffect(() => {
//     let mounted = true;
//     const initialize = async () => {
//       if (initialQRData) {
//         const secs = initialQRData.refreshInSeconds || 120;
//         setRefreshInterval(secs); setTimeLeft(secs);
//         clearTimeout(qrTimerRef.current);
//         qrTimerRef.current = setTimeout(fetchQRCode, secs * 1000);
//         fetchEventDetails();
//       } else {
//         const isActive = await fetchEventDetails();
//         if (!mounted) return;
//         if (!isActive) { setAttendanceActive(false); setLoading(false); return; }
//         if (mounted) await fetchQRCode();
//       }
//       statusCheckRef.current = setInterval(async () => {
//         const isActive = await fetchEventDetails();
//         if (!mounted) return;
//         if (!isActive) {
//           setAttendanceActive(false);
//           clearTimeout(qrTimerRef.current); clearInterval(statusCheckRef.current); clearInterval(countdownRef.current);
//           if (onAttendanceEnd) onAttendanceEnd();
//         }
//       }, 10000);
//     };
//     initialize();
//     return () => {
//       mounted = false;
//       clearTimeout(qrTimerRef.current); clearInterval(statusCheckRef.current);
//       clearInterval(countdownRef.current); clearTimeout(windowEndTimerRef.current);
//     };
//   }, [eventId]);

//   useEffect(() => {
//     clearInterval(countdownRef.current);
//     if (timeLeft <= 0) return;
//     countdownRef.current = setInterval(() => setTimeLeft((p) => (p <= 1 ? refreshInterval : p - 1)), 1000);
//     return () => clearInterval(countdownRef.current);
//   }, [refreshInterval]);

//   useEffect(() => {
//     if (qrData?.refreshInSeconds) { setRefreshInterval(qrData.refreshInSeconds); setTimeLeft(qrData.refreshInSeconds); }
//   }, [qrData]);

//   const getWindowTimeRemaining = () => {
//     if (!eventDetails?.attendanceWindowEnd) return null;
//     const remaining = new Date(eventDetails.attendanceWindowEnd) - new Date();
//     if (remaining <= 0) return null;
//     return `${Math.floor(remaining / 60000)}m ${Math.floor((remaining % 60000) / 1000)}s`;
//   };

//   if (!attendanceActive) return (
//     <div className="text-center py-8 p-6">
//       <div className="bg-yellow-50 rounded-lg p-6">
//         <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
//         <h3 className="text-lg font-semibold text-gray-800 mb-2">Attendance Session Ended</h3>
//         <p className="text-gray-600 mb-4">The attendance session for this event is no longer active.</p>
//         <button onClick={onClose} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">Close</button>
//       </div>
//     </div>
//   );

//   if (loading) return (
//     <div className="text-center py-12 p-6">
//       <Loader2 className="w-12 h-12 animate-spin text-[#4CA1AF] mx-auto" />
//       <p className="text-gray-600 mt-4">Loading QR code...</p>
//     </div>
//   );

//   if (error) return (
//     <div className="text-center py-8 p-6">
//       <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
//       <p className="text-red-600 mb-4">{error}</p>
//       <button onClick={() => { setLoading(true); fetchQRCode(); }} className="px-4 py-2 bg-[#4CA1AF] text-white rounded-lg hover:bg-[#3d8a9c]">Retry</button>
//     </div>
//   );

//   const windowTimeRemaining = getWindowTimeRemaining();

//   return (
//     <div className="p-6">
//       <div className="flex justify-between items-center border-b pb-3 mb-6">
//         <h2 className="text-lg font-semibold" style={{ background: "linear-gradient(135deg, #4CA1AF, #2C3E50)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
//           Attendance QR Code
//         </h2>
//         <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
//       </div>
//       <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
//         <div className="md:col-span-3 text-center">
//           <div className="p-4 rounded-lg mb-4 text-white flex justify-between items-center" style={{ background: "linear-gradient(135deg, #4CA1AF, #2C3E50)" }}>
//             <span className="text-sm">Next QR refresh in:</span>
//             <span className="text-2xl font-bold tabular-nums">{timeLeft}s</span>
//           </div>
//           {windowTimeRemaining && (
//             <div className="mb-3 px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-700 flex items-center justify-center gap-2">
//               <Clock className="w-4 h-4" />Window closes in: <span className="font-semibold">{windowTimeRemaining}</span>
//             </div>
//           )}
//           {qrData?.qrToken && (
//             <>
//               <div className="bg-white p-4 rounded-xl shadow-md inline-block border border-gray-100">
//                 <img src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(qrData.qrToken)}`} className="w-60 h-60" alt="Attendance QR Code" />
//               </div>
//               <p className="text-xs text-gray-500 mt-2">Expires: {new Date(qrData.expiresAt).toLocaleTimeString()}</p>
//             </>
//           )}
//         </div>
//         <div className="md:col-span-2 flex flex-col gap-4">
//           <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
//             <p className="text-sm font-medium text-gray-700 mb-2">Manual Entry Token:</p>
//             <code className="bg-gray-800 text-green-400 p-3 rounded-lg block break-all text-xs leading-relaxed">{qrData?.qrToken}</code>
//           </div>
//           <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 text-sm">
//             <p className="font-semibold text-blue-700 mb-2">Instructions</p>
//             <ul className="space-y-1.5 text-blue-800 text-xs list-disc list-inside">
//               <li>Students scan this QR code to mark attendance</li>
//               <li>QR auto-refreshes every {refreshInterval}s for security</li>
//               <li>Students must be within the geofence radius</li>
//               <li>Attendance can only be marked during the active window</li>
//             </ul>
//           </div>
//           {stopError && <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{stopError}</div>}
//           <div className="mt-auto flex gap-2">
//             <button onClick={handleStopAttendance} disabled={stopLoading}
//               className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
//               {stopLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}Stop Attendance
//             </button>
//             <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">Close</button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MyEventsForSuperadmin;


import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import ConfirmDialog from "../../components/ConfirmDialog";
import CustomSelect from "../../components/CustomSelect";
import StartAttendancePopup from "../../components/StartAttendencePopup";
import EditEvent from "../../components/EditEvent";
import DateTimePicker from "../../components/Datetimepicker";
import ThemedScrollbarStyles from "../../components/ThemedScrollbarStyles";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

import {
  Calendar, MapPin, Users, User, Clock, Target, Globe,
  AlertCircle, CheckCircle, XCircle, Loader2, Sparkles,
  Trophy, Star, BookOpen, Coffee, Music, Code, Camera, Heart,
  Filter, ChevronDown, Search, Settings, Edit, Trash2,
  Share2, Plus, Briefcase, X, ArrowLeft, ChevronLeft, ChevronRight,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_URL || "http://72.155.88.211:8080";
const PAGE_SIZE = 9;
const authHeaders = (token) => ({ Authorization: `Bearer ${token}`, "Content-Type": "application/json" });

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

// Dark mode colors - Fuchsia theme
  const DARK_PRIMARY_COLOR = "#D946EF"; // Vibrant fuchsia
  const DARK_PRIMARY_DARK = "#A21CAF";
  const DARK_PRIMARY_LIGHT = "rgba(217, 70, 239, 0.15)";
  const DARK_PRIMARY_GRADIENT = "linear-gradient(135deg, #D946EF 0%, #A21CAF 100%)";

const DARK_BG_MAIN = "#343541";
const DARK_BG_GRADIENT = "linear-gradient(135deg, #343541 0%, #2A2B36 100%)";
const DARK_BG_CARD = "#444654";
const DARK_BORDER_COLOR = "#4D4F5E";
const DARK_BORDER_COLOR_HOVER = "#5E5F70";
const DARK_TEXT_PRIMARY = "#ECECF1";
const DARK_TEXT_SECONDARY = "#C5C5D2";
const DARK_TEXT_MUTED = "#9B9CA9";
const DARK_ACCENT_SOFT = "rgba(255, 255, 255, 0.05)";

// ─── CSS Styles as a constant ─────────────────────────────────────────────────
const animationStyles = `
  @keyframes blob {
    0% { transform: translate(0px, 0px) scale(1); }
    33% { transform: translate(30px, -50px) scale(1.1); }
    66% { transform: translate(-20px, 20px) scale(0.9); }
    100% { transform: translate(0px, 0px) scale(1); }
  }
  .animate-blob { animation: blob 7s infinite; }
  .animation-delay-2000 { animation-delay: 2s; }
  .animation-delay-4000 { animation-delay: 4s; }
  .event-card-container { perspective: 1000px; height: 280px; }
  .event-card {
    transform-style: preserve-3d;
    transition: transform 0.5s ease-in-out;
    width: 100%;
    height: 100%;
    position: relative;
  }
  .event-card-container:hover .event-card { transform: rotateY(180deg); }
  .card-face {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    border-radius: 0.75rem;
    overflow: hidden;
  }
  .card-front { transform: rotateY(0deg); }
  .card-back { transform: rotateY(180deg); }
  .custom-scrollbar::-webkit-scrollbar { width: 2px; }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 10px;
  }
  .line-clamp-1 {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;

// ─── Server filter descriptor ─────────────────────────────────────────────────
const buildUrl = (descriptor, page) => {
  const p = `page=${page}&size=${PAGE_SIZE}`;
  switch (descriptor.kind) {
    case "all": return `${BASE_URL}/api/events/paged?${p}`;
    case "enrollment": return `${BASE_URL}/api/events/enrollment/${descriptor.status}/paged?${p}`;
    case "completed": return `${BASE_URL}/api/events/endEvent/${descriptor.value}/paged?${p}`;
    case "ratings": return `${BASE_URL}/api/events/ratings/${descriptor.rating}/paged?${p}`;
    case "targetType": return `${BASE_URL}/api/events/getByTargetType/${descriptor.targetType}/paged?${p}`;
    case "targetData": return `${BASE_URL}/api/events/targetData/${descriptor.targetType}/${descriptor.targetId}/paged?${p}`;
    default: return `${BASE_URL}/api/events/paged?${p}`;
  }
};

const fetchPagedEvents = async (descriptor, page, token) => {
  const res = await axios.get(buildUrl(descriptor, page), { headers: authHeaders(token) });
  return res.data?.data;
};

const fetchAllForStats = async (token) => {
  const res = await axios.get(`${BASE_URL}/api/events`, { headers: authHeaders(token) });
  return res.data?.data || [];
};
const fetchDepartments = async (token) => {
  const res = await axios.get(`${BASE_URL}/api/department`, { headers: authHeaders(token) });
  return res.data?.data || [];
};
const fetchAllClubs = async (token) => {
  const res = await axios.get(`${BASE_URL}/api/clubs`, { headers: authHeaders(token) });
  return res.data?.data || [];
};

// ─── Pure helpers ──────────────────────────────────────────────────────────────
const formatDateTime = (dt) => {
  if (!dt) return "N/A";
  return new Date(dt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
};
const getDaysUntil = (date) => Math.ceil((new Date(date) - new Date()) / 86400000);

const getTargetTypeIcon = (t) => ({ global: <Globe className="w-4 h-4" />, club: <Users className="w-4 h-4" />, department: <Briefcase className="w-4 h-4" /> }[t?.toLowerCase()] ?? <Target className="w-4 h-4" />);
const getTargetTypeColor = (t, theme) => ({
  global: theme?.isDarkMode ? "bg-blue-900/30 text-blue-300" : "bg-blue-100 text-blue-700",
  club: theme?.isDarkMode ? "bg-purple-900/30 text-purple-300" : "bg-purple-100 text-purple-700",
  department: theme?.isDarkMode ? "bg-green-900/30 text-green-300" : "bg-green-100 text-green-700"
}[t?.toLowerCase()] ?? (theme?.isDarkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700"));

// ─── Component ────────────────────────────────────────────────────────────────
const MyEventsForSuperadmin = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // ── Theme state ───────────────────────────────────────────────────────────
  const { isDarkMode } = useTheme();

  // Get current theme colors
  const theme = {
    primaryColor: isDarkMode ? DARK_PRIMARY_COLOR : LIGHT_PRIMARY_COLOR,
    primaryDark: isDarkMode ? DARK_PRIMARY_DARK : LIGHT_PRIMARY_DARK,
    primaryLight: isDarkMode ? DARK_PRIMARY_LIGHT : LIGHT_PRIMARY_LIGHT,
    primaryGradient: isDarkMode ? DARK_PRIMARY_GRADIENT : LIGHT_PRIMARY_GRADIENT,
    cardHeaderGradient: isDarkMode ? "linear-gradient(135deg, #A21CAF 0%, #701A75 100%)" : LIGHT_PRIMARY_GRADIENT,
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

  // ── Server data ────────────────────────────────────────────────────────────
  const [pageData, setPageData] = useState({ content: [], pageNumber: 0, totalElements: 0, totalPages: 0, last: true });
  const [statsEvents, setStatsEvents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [clubs, setClubs] = useState([]);

  // ── UI ─────────────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("date");

  // ── Active descriptor ─────────────────────────────────────────────────────
  const [descriptor, setDescriptor] = useState({ kind: "all" });
  const descriptorRef = useRef({ kind: "all" });
  const [currentPage, setCurrentPage] = useState(0);

  // ── UI filter state ────────────────────────────────────────────────────────
  const [filterType, setFilterType] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedClub, setSelectedClub] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCompleted, setSelectedCompleted] = useState("all");
  const [selectedRating, setSelectedRating] = useState("all");

  // ── Client-side only (search + sort) ──────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState("");

  // ── Modals ─────────────────────────────────────────────────────────────────
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showAttendancePopup, setShowAttendancePopup] = useState(false);
  const [selectedEventForAttendance, setSelectedEventForAttendance] = useState(null);
  const [showQRCodeModal, setShowQRCodeModal] = useState(false);
  const [qrCodeEventId, setQrCodeEventId] = useState(null);
  const [initialQRData, setInitialQRData] = useState(null);

  const [activeAttendanceEvents, setActiveAttendanceEvents] = useState({});
  const [loadingAttendanceStatus, setLoadingAttendanceStatus] = useState(false);

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false, title: "", message: "", variant: "primary", confirmText: "Confirm", onConfirm: () => { },
  });
  const closeConfirm = () => setConfirmDialog((p) => ({ ...p, isOpen: false }));

  // ── Init ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.role !== "SUPER_ADMIN") {
      setError("Access denied. This page is only for Super Admins.");
      setLoading(false);
      return;
    }
    if (!token) {
      setError("No authentication token found. Please login again.");
      setLoading(false);
      return;
    }
    initLoad();
  }, []);

  const initLoad = async () => {
    setLoading(true);
    try {
      const [page, allEvents, depts, clubList] = await Promise.all([
        fetchPagedEvents({ kind: "all" }, 0, token),
        fetchAllForStats(token),
        fetchDepartments(token),
        fetchAllClubs(token),
      ]);
      setPageData(page);
      setStatsEvents(allEvents);
      setDepartments(depts);
      setClubs(clubList);
    } catch (err) {
      setError(err.message || "An error occurred while fetching events");
    } finally {
      setLoading(false);
    }
  };

  // ── Core page loader ─────────────────────────────────────────────────────────
  const loadPage = useCallback(async (desc, page) => {
    setPageLoading(true);
    try {
      const data = await fetchPagedEvents(desc, page, token);
      setPageData(data);
      setCurrentPage(page);
    } catch (err) {
      console.error("Page load error:", err);
    } finally {
      setPageLoading(false);
    }
  }, [token]);

  // ── Descriptor applicator ─────────────────────────────────────────────────
  const applyDescriptor = useCallback((desc) => {
    descriptorRef.current = desc;
    setDescriptor(desc);
    setCurrentPage(0);
    loadPage(desc, 0);
  }, [loadPage]);

  // ── Attendance helpers ─────────────────────────────────────────────────────
  const checkAttendanceActive = async (eventId) => {
    try {
      const res = await axios.get(`${BASE_URL}/api/events/getById/${eventId}`, { headers: authHeaders(token) });
      return res.data?.data?.attendanceActive || false;
    } catch { return false; }
  };

  const checkAllEventsAttendance = useCallback(async () => {
    if (!pageData.content?.length) return;
    setLoadingAttendanceStatus(true);
    const statusMap = {};
    await Promise.all(pageData.content.map(async (event) => {
      statusMap[event.eventId] = await checkAttendanceActive(event.eventId);
    }));
    setActiveAttendanceEvents(statusMap);
    setLoadingAttendanceStatus(false);
  }, [pageData.content, token]);

  useEffect(() => {
    if (pageData.content?.length) checkAllEventsAttendance();
  }, [pageData.content, checkAllEventsAttendance]);

  // ── Filter handlers ────────────────────────────────────────────────────────
  const handleFilterTypeChange = (type) => {
    const next = filterType === type ? "all" : type;
    setFilterType(next);
    setSelectedDepartment("all");
    setSelectedClub("all");
    setSelectedStatus("all");
    setSelectedCompleted("all");
    setSelectedRating("all");
    applyDescriptor(next === "all" ? { kind: "all" } : { kind: "targetType", targetType: next });
  };

  const handleDepartmentChange = (value) => {
    setSelectedDepartment(value);
    setSelectedClub("all");
    setSelectedStatus("all");
    setSelectedCompleted("all");
    setSelectedRating("all");
    setFilterType(value === "all" ? "all" : "DEPARTMENT");
    applyDescriptor(
      value === "all"
        ? { kind: "all" }
        : { kind: "targetData", targetType: "DEPARTMENT", targetId: parseInt(value) }
    );
  };

  const handleClubChange = (value) => {
    setSelectedClub(value);
    setSelectedDepartment("all");
    setSelectedStatus("all");
    setSelectedCompleted("all");
    setSelectedRating("all");
    setFilterType(value === "all" ? "all" : "CLUB");
    applyDescriptor(
      value === "all"
        ? { kind: "all" }
        : { kind: "targetData", targetType: "CLUB", targetId: parseInt(value) }
    );
  };

  const handleEnrollmentStatusChange = (value) => {
    setSelectedStatus(value);
    setSelectedCompleted("all");
    setFilterType("all");
    setSelectedDepartment("all");
    setSelectedClub("all");
    setSelectedRating("all");
    applyDescriptor(value === "all" ? { kind: "all" } : { kind: "enrollment", status: value.toUpperCase() });
  };

  const handleCompletedStatusChange = (value) => {
    setSelectedCompleted(value);
    setSelectedStatus("all");
    setFilterType("all");
    setSelectedDepartment("all");
    setSelectedClub("all");
    setSelectedRating("all");
    applyDescriptor(value === "all" ? { kind: "all" } : { kind: "completed", value: value === "completed" ? "true" : "false" });
  };

  const handleRatingsFilterChange = (value) => {
    setSelectedRating(value);
    setSelectedStatus("all");
    setSelectedCompleted("all");
    setFilterType("all");
    setSelectedDepartment("all");
    setSelectedClub("all");
    applyDescriptor(value === "all" ? { kind: "all" } : { kind: "ratings", rating: parseInt(value) });
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setFilterType("all");
    setSelectedDepartment("all");
    setSelectedClub("all");
    setSelectedStatus("all");
    setSelectedCompleted("all");
    setSelectedRating("all");
    applyDescriptor({ kind: "all" });
  };

  // ── Attendance actions ─────────────────────────────────────────────────────
  const handleStopAttendanceForEvent = async (eventId) => {
    try {
      const res = await axios.post(`${BASE_URL}/api/attendance/stop/${eventId}`, {}, { headers: authHeaders(token) });
      if (res.data?.success) {
        checkAllEventsAttendance();
        loadPage(descriptorRef.current, currentPage);
      } else { alert(res.data?.message || "Failed to stop attendance"); }
    } catch (err) { alert(err.response?.data?.message || "Error stopping attendance"); }
  };

  const handleAttendanceStartSuccess = (apiResponse, eventId) => {
    const qrData = apiResponse?.data ?? null;
    if (eventId) {
      setQrCodeEventId(eventId);
      setInitialQRData(qrData);
      setShowQRCodeModal(true);
    }
    checkAllEventsAttendance();
    loadPage(descriptorRef.current, currentPage);
  };

  // ── Client-side: search + sort only ────────────────────────────────────────
  const filteredEvents = (() => {
    let list = [...(pageData.content || [])];
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter((e) =>
        e.title?.toLowerCase().includes(q) ||
        e.description?.toLowerCase().includes(q) ||
        e.organizer?.toLowerCase().includes(q) ||
        e.creatorName?.toLowerCase().includes(q)
      );
    }
    switch (sortBy) {
      case "date": list.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime)); break;
      case "popularity": list.sort((a, b) => (b.currEnrollments || 0) - (a.currEnrollments || 0)); break;
      case "enrollment": list.sort((a, b) => (b.maxEnrollments || 0) - (a.maxEnrollments || 0)); break;
      case "ratings": list.sort((a, b) => (Number(b.ratings) || 0) - (Number(a.ratings) || 0)); break;
    }
    return list;
  })();

  // ── Edit / Delete ──────────────────────────────────────────────────────────
  const handleEditClick = (event) => {
    const fmt = (d) => {
      if (!d) return "";
      const date = new Date(d);
      const pad = (n) => String(n).padStart(2, "0");
      return (
        date.getFullYear() + "-" +
        pad(date.getMonth() + 1) + "-" +
        pad(date.getDate()) + "T" +
        pad(date.getHours()) + ":" +
        pad(date.getMinutes())
      );
    };
    setEditingEvent({
      ...event,
      dateTime: fmt(event.dateTime),
      enrollmentDeadline: fmt(event.enrollmentDeadline),
      attendanceWindowStart: fmt(event.attendanceWindowStart),
      attendanceWindowEnd: fmt(event.attendanceWindowEnd),
    });
    setShowEditModal(true);
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      await axios.delete(`${BASE_URL}/api/events/deleteEvent/${eventId}`, { headers: authHeaders(token) });
      const targetPage = pageData.content.length === 1 && currentPage > 0 ? currentPage - 1 : currentPage;
      if (targetPage !== currentPage) setCurrentPage(targetPage);
      await Promise.all([
        loadPage(descriptorRef.current, targetPage),
        fetchAllForStats(token).then(setStatsEvents),
      ]);
    } catch (err) { alert(err.response?.data?.message || "Failed to delete event"); }
  };

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = {
    total: statsEvents.length,
    open: statsEvents.filter((e) => e.enrollmentStatus?.toLowerCase() === "open").length,
    closed: statsEvents.filter((e) => e.enrollmentStatus?.toLowerCase() === "closed").length,
    enrollments: statsEvents.reduce((s, e) => s + (e.currEnrollments || 0), 0),
    global: statsEvents.filter((e) => e.targetType?.toUpperCase() === "GLOBAL").length,
    club: statsEvents.filter((e) => e.targetType?.toUpperCase() === "CLUB").length,
    dept: statsEvents.filter((e) => e.targetType?.toUpperCase() === "DEPARTMENT").length,
  };

  const hasAnyFilter = descriptor.kind !== "all" || searchTerm;
  const totalPages = pageData.totalPages || 0;

  // ── Loading / Error ────────────────────────────────────────────────────────
  if (loading) return (
    <div
      className="min-h-screen flex items-center justify-center transition-colors duration-300"
      style={{ background: theme.bgGradient }}
    >
      <div className="text-center">
        <div className="relative">
          <div className="w-24 h-24 border-4 rounded-full animate-spin mx-auto mb-6" style={{ borderColor: `${theme.primaryColor}20`, borderTopColor: theme.primaryColor }} />
          <div className="absolute inset-0 flex items-center justify-center"><Sparkles className="w-8 h-8" style={{ color: theme.primaryColor }} /></div>
        </div>
        <p className="text-xl font-light animate-pulse" style={{ color: theme.textPrimary }}>Loading admin dashboard...</p>
        <p className="text-sm mt-2" style={{ color: theme.textMuted }}>Managing events for you</p>
      </div>
    </div>
  );

  if (error) return (
    <div
      className="min-h-screen flex items-center justify-center p-4 transition-colors duration-300"
      style={{ background: theme.bgGradient }}
    >
      <div
        className="backdrop-blur-lg rounded-2xl shadow-2xl p-8 max-w-md w-full text-center border"
        style={{ background: theme.bgCard, borderColor: theme.borderColor }}
      >
        <div className="bg-red-500/20 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-12 h-12 text-red-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: theme.textPrimary }}>Access Denied</h2>
        <p className="mb-8" style={{ color: theme.textSecondary }}>{error}</p>
        <button
          onClick={initLoad}
          className="text-white px-8 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
          style={{ background: theme.primaryGradient }}
        >
          Try Again
        </button>
      </div>
    </div>
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Global styles - moved outside the main div to ensure they're always applied */}
      <style>{animationStyles}</style>
      <ThemedScrollbarStyles
        isDarkMode={isDarkMode}
        className="theme-scrollbar"
        includePageScrollbar
      />

      <div
        className="min-h-screen transition-colors duration-300"
        style={{ background: theme.bgGradient }}
      >
        {/* Animated background - only show in light mode */}
        {!isDarkMode && (
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
            <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
          </div>
        )}

        {/* Sticky back bar */}
        <div
          className="sticky top-0 z-50 w-full backdrop-blur-sm transition-colors duration-300"
          style={{
            background: isDarkMode ? 'rgba(32, 33, 35, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            borderBottom: `1px solid ${theme.borderColor}`
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <button
                onClick={() => navigate("/dashboard")}
                className="group flex items-center gap-2 sm:gap-3 font-medium rounded-full py-2 sm:py-2.5 px-4 sm:px-5 transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer"
                style={{ background: theme.primaryGradient, color: "white" }}
              >
                <svg
                  className="w-4 sm:w-5 h-4 sm:h-5 text-white transform group-hover:scale-110 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                <span className="text-xs sm:text-sm hidden xs:inline">Dashboard</span>
              </button>


            </div>
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

          {/* Header - FIXED: Made text visible in both modes */}
          <div className="mb-8">
            <h1 className="text-5xl font-bold mb-4">
              <span style={{ 
                color: theme.textPrimary,
                background: isDarkMode ? 'none' : theme.primaryGradient,
                WebkitBackgroundClip: isDarkMode ? 'unset' : 'text',
                WebkitTextFillColor: isDarkMode ? 'unset' : 'transparent'
              }}>
                Event Management
              </span>
            </h1>
            <p className="text-xl max-w-2xl" style={{ color: theme.textSecondary }}>
              Monitor, manage, and analyze all events across the platform
            </p>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-5xl mx-auto mb-6">
            {[
              { label: "Total Events", value: stats.total, icon: <Calendar className="w-6 h-6" style={{ color: theme.primaryColor }} /> },
              { label: "Open Events", value: stats.open, icon: <CheckCircle className="w-6 h-6" style={{ color: theme.isDarkMode ? "#4ADE80" : "#16A34A" }} /> },
              { label: "Closed Events", value: stats.closed, icon: <XCircle className="w-6 h-6" style={{ color: theme.isDarkMode ? "#F87171" : "#DC2626" }} /> },
              { label: "Total Enrollments", value: stats.enrollments, icon: <Users className="w-6 h-6" style={{ color: theme.isDarkMode ? "#C084FC" : "#9333EA" }} /> },
            ].map(({ label, value, icon }) => (
              <div
                key={label}
                className="backdrop-blur-sm p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                style={{
                  background: theme.bgCard,
                  border: `1px solid ${theme.borderColor}`,
                  boxShadow: isDarkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium" style={{ color: theme.textMuted }}>{label}</p>
                    <p className="text-3xl font-bold" style={{ color: theme.textPrimary }}>{value}</p>
                  </div>
                  <div className="p-3 rounded-lg" style={{ background: theme.accentSoft }}>{icon}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Target type stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-8">
            {[
              { label: "Global", value: stats.global, icon: <Globe className="w-5 h-5 mr-2" style={{ color: theme.primaryColor }} /> },
              { label: "Club", value: stats.club, icon: <Users className="w-5 h-5 mr-2" style={{ color: theme.primaryColor }} /> },
              { label: "Department", value: stats.dept, icon: <Briefcase className="w-5 h-5 mr-2" style={{ color: theme.primaryColor }} /> },
            ].map(({ label, value, icon }) => (
              <div
                key={label}
                className="backdrop-blur-sm p-4 rounded-xl"
                style={{
                  background: theme.accentSoft,
                  border: `1px solid ${theme.borderColor}`,
                  boxShadow: isDarkMode ? '0 2px 4px -1px rgba(0, 0, 0, 0.2)' : '0 2px 4px -1px rgba(0, 0, 0, 0.05)'
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {icon}
                    <span className="text-sm font-medium" style={{ color: theme.textSecondary }}>{label}</span>
                  </div>
                  <span className="text-xl font-bold" style={{ color: theme.textPrimary }}>{value}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Create button */}
          <div className="mb-6 flex justify-end">
            <button
              className="px-4 py-2 text-white rounded-lg shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
              style={{
                background: theme.primaryGradient,
                boxShadow: isDarkMode ? `0 4px 6px -1px ${theme.primaryColor}40` : `0 4px 6px -1px ${theme.primaryColor}30`
              }}
              onClick={() => navigate("/create-event")}
            >
              <Plus className="w-4 h-4" /><span>Create Event</span>
            </button>
          </div>

          {/* Search & Filter bar */}
          <div className="mb-8">
            <div
              className="backdrop-blur-sm rounded-2xl shadow-xl p-4 border transition-colors duration-300"
              style={{
                background: isDarkMode ? 'rgba(68, 70, 84, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                borderColor: theme.borderColor
              }}
            >
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: theme.textMuted }} />
                  <input
                    type="text"
                    placeholder="Search events by title, description, organizer..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl focus:ring-2 transition-all"
                    style={{
                      background: theme.accentSoft,
                      border: `1px solid ${theme.borderColor}`,
                      color: theme.textPrimary,
                      outlineColor: theme.primaryColor
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = theme.primaryColor;
                      e.target.style.boxShadow = `0 0 0 2px ${theme.primaryColor}20`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = theme.borderColor;
                      e.target.style.boxShadow = "";
                    }}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="px-4 py-3 text-white rounded-xl font-medium transition-all transform hover:scale-105 flex items-center space-x-2 shadow-lg"
                    style={{ background: theme.primaryGradient }}
                  >
                    <Filter className="w-5 h-5" /><span>Filters</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
                  </button>
                  <CustomSelect
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    options={[
                      { value: "date", label: "Sort by Date" },
                      { value: "popularity", label: "Sort by Popularity" },
                      { value: "enrollment", label: "Sort by Capacity" },
                      { value: "ratings", label: "Sort by Ratings" },
                    ]}
                    theme={theme}
                  />
                </div>
              </div>

              {/* Active filter chips */}
              {hasAnyFilter && (
                <div className="mt-4 pt-4 border-t" style={{ borderColor: theme.borderColor }}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium mr-2" style={{ color: theme.textMuted }}>Active Filters:</span>
                    {filterType !== "all" && selectedDepartment === "all" && selectedClub === "all" && (
                      <span className="px-3 py-1 rounded-full text-sm flex items-center" style={{ background: theme.primaryLight, color: theme.primaryColor }}>
                        Type: {filterType}
                        <button onClick={() => handleFilterTypeChange(filterType)} className="ml-2"><X className="w-3 h-3" /></button>
                      </span>
                    )}
                    {selectedDepartment !== "all" && (
                      <span className="px-3 py-1 rounded-full text-sm flex items-center" style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10B981" }}>
                        Dept: {departments.find((d) => d.departmentId === parseInt(selectedDepartment))?.name || selectedDepartment}
                        <button onClick={() => handleDepartmentChange("all")} className="ml-2"><X className="w-3 h-3" /></button>
                      </span>
                    )}
                    {selectedClub !== "all" && (
                      <span className="px-3 py-1 rounded-full text-sm flex items-center" style={{ background: "rgba(139, 92, 246, 0.1)", color: "#8B5CF6" }}>
                        Club: {clubs.find((c) => c.clubId === parseInt(selectedClub))?.clubName || selectedClub}
                        <button onClick={() => handleClubChange("all")} className="ml-2"><X className="w-3 h-3" /></button>
                      </span>
                    )}
                    {selectedStatus !== "all" && (
                      <span className="px-3 py-1 rounded-full text-sm flex items-center" style={{ background: "rgba(59, 130, 246, 0.1)", color: "#3B82F6" }}>
                        Enrollment: {selectedStatus}
                        <button onClick={() => handleEnrollmentStatusChange("all")} className="ml-2"><X className="w-3 h-3" /></button>
                      </span>
                    )}
                    {selectedCompleted !== "all" && (
                      <span className="px-3 py-1 rounded-full text-sm flex items-center" style={{ background: "rgba(245, 158, 11, 0.1)", color: "#F59E0B" }}>
                        Completion: {selectedCompleted === "completed" ? "Completed" : "Not Completed"}
                        <button onClick={() => handleCompletedStatusChange("all")} className="ml-2"><X className="w-3 h-3" /></button>
                      </span>
                    )}
                    {selectedRating !== "all" && (
                      <span className="px-3 py-1 rounded-full text-sm flex items-center" style={{ background: "rgba(245, 158, 11, 0.1)", color: "#F59E0B" }}>
                        Rating: {selectedRating}+
                        <button onClick={() => handleRatingsFilterChange("all")} className="ml-2"><X className="w-3 h-3" /></button>
                      </span>
                    )}
                    {searchTerm && (
                      <span className="px-3 py-1 rounded-full text-sm flex items-center" style={{ background: theme.accentSoft, color: theme.textSecondary }}>
                        Search: "{searchTerm}"<button onClick={() => setSearchTerm("")} className="ml-2"><X className="w-3 h-3" /></button>
                      </span>
                    )}
                    <button onClick={clearAllFilters} className="px-3 py-1 text-sm font-medium ml-auto" style={{ color: theme.primaryColor }}>Clear All</button>
                  </div>
                </div>
              )}

              {/* Filter panel */}
              {showFilters && (
                <div className="mt-4 pt-4 border-t space-y-4" style={{ borderColor: theme.borderColor }}>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm font-medium" style={{ color: theme.textMuted }}>View by:</span>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { key: "all", label: "All Events" },
                        { key: "GLOBAL", label: "Global Events" },
                        { key: "DEPARTMENT", label: "Department Events" },
                        { key: "CLUB", label: "Club Events" },
                      ].map(({ key, label }) => {
                        const isActive = key === "all"
                          ? descriptor.kind === "all"
                          : filterType === key && selectedDepartment === "all" && selectedClub === "all";
                        return (
                          <button
                            key={key}
                            onClick={() => key === "all" ? clearAllFilters() : handleFilterTypeChange(key)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${isActive ? "text-white shadow-lg" : ""}`}
                            style={isActive
                              ? { background: theme.primaryGradient }
                              : {
                                background: theme.accentSoft,
                                color: theme.textSecondary,
                                border: `1px solid ${theme.borderColor}`
                              }}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: theme.textSecondary }}>Department</label>
                      <CustomSelect
                        value={selectedDepartment}
                        onChange={(e) => handleDepartmentChange(e.target.value)}
                        options={[
                          { value: "all", label: "All Departments" },
                          ...departments.map((d) => ({ value: String(d.departmentId), label: d.name })),
                        ]}
                        theme={theme}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: theme.textSecondary }}>Club</label>
                      <CustomSelect
                        value={selectedClub}
                        onChange={(e) => handleClubChange(e.target.value)}
                        options={[
                          { value: "all", label: "All Clubs" },
                          ...clubs.map((c) => ({ value: String(c.clubId), label: c.clubName })),
                        ]}
                        theme={theme}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: theme.textSecondary }}>Enrollment Status</label>
                      <CustomSelect
                        value={selectedStatus}
                        onChange={(e) => handleEnrollmentStatusChange(e.target.value)}
                        options={[{ value: "all", label: "All Status" }, { value: "open", label: "Open" }, { value: "closed", label: "Closed" }]}
                        theme={theme}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: theme.textSecondary }}>Completion Status</label>
                      <CustomSelect
                        value={selectedCompleted}
                        onChange={(e) => handleCompletedStatusChange(e.target.value)}
                        options={[{ value: "all", label: "All Events" }, { value: "completed", label: "Completed" }, { value: "not-completed", label: "Not Completed" }]}
                        theme={theme}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: theme.textSecondary }}>Ratings</label>
                      <CustomSelect
                        value={selectedRating}
                        onChange={(e) => handleRatingsFilterChange(e.target.value)}
                        options={[
                          { value: "all", label: "All Ratings" },
                          { value: "1", label: "1+" },
                          { value: "2", label: "2+" },
                          { value: "3", label: "3+" },
                          { value: "4", label: "4+" },
                          { value: "5", label: "5" },
                        ]}
                        theme={theme}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button onClick={clearAllFilters} className="px-4 py-2 font-medium" style={{ color: theme.textSecondary }}>Clear All</button>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="px-4 py-2 text-white rounded-lg hover:opacity-90"
                      style={{ background: theme.primaryGradient }}
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Results summary */}
          <div className="mb-4 flex justify-between items-center">
            <p className="text-sm" style={{ color: theme.textMuted }}>
              Showing <span className="font-semibold" style={{ color: theme.textPrimary }}>{filteredEvents.length}</span>
              {filteredEvents.length !== (pageData.content || []).length && (
                <span> (filtered from {(pageData.content || []).length})</span>
              )}{" "}
              · Total <span className="font-semibold" style={{ color: theme.textPrimary }}>{pageData.totalElements}</span> events
              {" · "}Page <span className="font-semibold" style={{ color: theme.textPrimary }}>{currentPage + 1}</span> of{" "}
              <span className="font-semibold" style={{ color: theme.textPrimary }}>{totalPages || 1}</span>
            </p>
            {pageLoading && (
              <div className="flex items-center gap-2 text-sm" style={{ color: theme.textMuted }}>
                <Loader2 className="w-4 h-4 animate-spin" style={{ color: theme.primaryColor }} />Loading...
              </div>
            )}
          </div>

          {/* Events grid */}
          {filteredEvents.length === 0 && !pageLoading ? (
            <div className="text-center py-16">
              <div
                className="backdrop-blur-sm rounded-2xl shadow-xl p-12 max-w-md mx-auto border"
                style={{ background: theme.bgCard, borderColor: theme.borderColor }}
              >
                <div className="relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full opacity-20 animate-ping" style={{ background: theme.primaryGradient }} />
                  </div>
                  <Calendar className="w-20 h-20 mx-auto mb-4 relative z-10" style={{ color: theme.textMuted }} />
                </div>
                <h3 className="text-2xl font-bold mb-2" style={{ color: theme.textPrimary }}>No Events Found</h3>
                <p className="mb-6" style={{ color: theme.textSecondary }}>There are no events matching your criteria.</p>
                <button
                  onClick={clearAllFilters}
                  className="text-white px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
                  style={{ background: theme.primaryGradient }}
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className={`grid gap-4 w-full ${filteredEvents.length === 1 ? "grid-cols-1 max-w-sm mx-auto" : filteredEvents.length === 2 ? "grid-cols-1 md:grid-cols-2 max-w-2xl mx-auto" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"}`}>
                {filteredEvents.map((event, index) => {
                  const daysUntil = getDaysUntil(event.dateTime);
                  const targetTypeColor = getTargetTypeColor(event.targetType, theme);
                  const enrollmentPct = Math.min(100, ((event.currEnrollments || 0) / (event.maxEnrollments || 1)) * 100);
                  const overallRating = Number(event.ratings);
                  const hasOverallRating = Number.isFinite(overallRating) && overallRating > 0;

                  return (
                    <div key={event.eventId} className="event-card-container" style={{ animationDelay: `${index * 80}ms` }}>
                      <div className="event-card">
                        {/* Front */}
                        <div
                          className="card-face card-front backdrop-blur-sm rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-500 border"
                          style={{
                            background: theme.bgCard,
                            borderColor: theme.borderColor
                          }}
                        >
                          <div className="relative h-32 p-3 overflow-hidden" style={{ background: isDarkMode ? theme.cardHeaderGradient : theme.primaryGradient }}>
                            <div className="absolute inset-0 opacity-10">
                              <div className="absolute -top-12 -right-12 w-24 h-24 bg-white rounded-full" />
                              <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-white rounded-full" />
                            </div>
                            {daysUntil > 0 && (
                              <div className="absolute top-2 left-2 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                                <span className="text-white text-xs font-semibold">{daysUntil} days to go</span>
                              </div>
                            )}
                            <div className="absolute top-2 right-2">
                              <span className={`text-[10px] font-medium px-2 py-1 rounded-full ${event.completed ? "bg-gray-100 text-gray-600" : "bg-green-100 text-green-600"}`}>
                                {event.completed ? "Completed" : "Upcoming"}
                              </span>
                            </div>
                            {event.completed && hasOverallRating && (
                              <div className="absolute bottom-2 left-2 z-10 flex items-center gap-0.5 bg-black/35 backdrop-blur-sm px-1.5 py-0.5 rounded-full">
                                <Star className="w-2.5 h-2.5" style={{ fill: "#FBBF24", color: "#FBBF24" }} />
                                <span className="text-white text-[10px] font-bold leading-none">
                                  {overallRating.toFixed(1)}
                                </span>
                              </div>
                            )}
                            <div className="absolute bottom-2 right-2 text-right">
                              <h3 className="text-sm font-bold text-white mb-0.5 line-clamp-1">{event.title}</h3>
                              <p className="text-[10px] text-white/80 line-clamp-1">{event.description}</p>
                            </div>
                          </div>

                          <div className="p-3 space-y-2">
                            <div className="flex flex-wrap gap-1">
                              <div className="px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center" style={{ background: theme.primaryLight, color: theme.primaryColor }}>
                                <Calendar className="w-2.5 h-2.5 mr-1" />{formatDateTime(event.dateTime)}
                              </div>
                              <div className="px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center"
                                style={{
                                  background: theme.isDarkMode ? "rgba(34, 197, 94, 0.2)" : "rgba(34, 197, 94, 0.1)",
                                  color: theme.isDarkMode ? "#4ADE80" : "#16A34A"
                                }}
                              >
                                <MapPin className="w-2.5 h-2.5 mr-1" />{event.venue}
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-1">
                              <div className="p-1.5 rounded-lg" style={{ background: theme.accentSoft }}>
                                <p className="text-[8px]" style={{ color: theme.textMuted }}>Organizer</p>
                                <p className="text-xs font-semibold flex items-center truncate" style={{ color: theme.textPrimary }}>
                                  <User className="w-3 h-3 mr-0.5 flex-shrink-0" style={{ color: theme.primaryColor }} /><span className="truncate">{event.organizer}</span>
                                </p>
                              </div>
                              <div className="p-1.5 rounded-lg" style={{ background: theme.accentSoft }}>
                                <p className="text-[8px]" style={{ color: theme.textMuted }}>Speaker</p>
                                <p className="text-xs font-semibold flex items-center truncate" style={{ color: theme.textPrimary }}>
                                  <User className="w-3 h-3 mr-0.5 flex-shrink-0" style={{ color: theme.primaryColor }} /><span className="truncate">{event.speakerName || event.organizer}</span>
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center ${targetTypeColor}`}>
                                {getTargetTypeIcon(event.targetType)}<span className="ml-1 capitalize text-xs">{event.targetType || "N/A"}</span>
                              </span>
                            </div>
                            {event.completed && hasOverallRating && (
                              <div className="flex items-center gap-1">
                                <div className="flex items-center gap-0.5">
                                  {[1, 2, 3, 4, 5].map((s) => (
                                    <Star
                                      key={s}
                                      className="w-2.5 h-2.5"
                                      style={{
                                        fill: s <= Math.round(overallRating) ? "#FBBF24" : "#E5E7EB",
                                        color: s <= Math.round(overallRating) ? "#FBBF24" : "#E5E7EB",
                                      }}
                                    />
                                  ))}
                                </div>
                                <span className="text-[10px] font-medium" style={{ color: theme.textMuted }}>{overallRating.toFixed(1)}</span>
                              </div>
                            )}
                            <div className="text-center text-[8px] mt-1 flex items-center justify-center" style={{ color: theme.primaryColor }}>
                              <span className="animate-pulse mr-1 text-[6px]">●</span>Hover to view all details
                            </div>
                          </div>
                        </div>

                        {/* Back */}
                        <div
                          className="card-face card-back rounded-xl shadow-md overflow-hidden p-3"
                          style={{ background: isDarkMode ? theme.cardHeaderGradient : theme.primaryGradient }}
                        >
                          <div className="h-full flex flex-col">
                            <h3 className="text-sm font-bold mb-2 line-clamp-1 text-white">{event.title}</h3>

                            <div className="space-y-1.5 overflow-y-auto flex-1 pr-1 theme-scrollbar text-xs">
                              <div className="grid grid-cols-2 gap-1">
                                <div className="p-1.5 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
                                  <div className="flex items-center mb-0.5"><Calendar className="w-3 h-3 mr-1 text-white/80" /><p className="text-[10px] text-white/80">Date</p></div>
                                  <p className="text-xs font-medium text-white">{formatDateTime(event.dateTime)}</p>
                                </div>
                                <div className="p-1.5 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
                                  <div className="flex items-center mb-0.5"><Clock className="w-3 h-3 mr-1 text-white/80" /><p className="text-[10px] text-white/80">Deadline</p></div>
                                  <p className="text-xs font-medium text-white">{new Date(event.enrollmentDeadline).toLocaleDateString()}</p>
                                </div>
                              </div>

                              <div className="p-1.5 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
                                <p className="text-[10px] text-white/80 mb-1 flex items-center"><Star className="w-2.5 h-2.5 mr-1" />Created By</p>
                                <p className="text-xs font-medium text-white truncate">{event.creatorName}</p>
                              </div>

                              {event.targetType?.toUpperCase() === "DEPARTMENT" && event.targetIds?.length > 0 && (
                                <div className="p-1.5 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
                                  <p className="text-[10px] text-white/80 mb-1 flex items-center"><Briefcase className="w-2.5 h-2.5 mr-1" />Target Departments</p>
                                  <div className="flex flex-wrap gap-1">
                                    {event.targetIds.map((id) => (
                                      <span key={id} className="px-1.5 py-0.5 rounded text-[8px] font-medium text-white" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
                                        {departments.find((d) => d.departmentId === id)?.name || `ID: ${id}`}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {event.targetType?.toUpperCase() === "CLUB" && event.targetIds?.length > 0 && (
                                <div className="p-1.5 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
                                  <p className="text-[10px] text-white/80 mb-1 flex items-center"><Users className="w-2.5 h-2.5 mr-1" />Target Clubs</p>
                                  <div className="flex flex-wrap gap-1">
                                    {event.targetIds.map((id) => (
                                      <span key={id} className="px-1.5 py-0.5 rounded text-[8px] font-medium text-white" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
                                        {clubs.find((c) => c.clubId === id)?.clubName || `ID: ${id}`}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div className="p-1.5 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-[10px] text-white/80">Enrollment</span>
                                  <span className="text-xs text-white">{event.currEnrollments}/{event.maxEnrollments}</span>
                                </div>
                                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
                                  <div className="h-full rounded-full" style={{ width: `${enrollmentPct}%`, backgroundColor: theme.primaryColor }} />
                                </div>
                              </div>
                            </div>

                            <div className="mt-2 pt-1 border-t border-white/20 flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                <span className="text-[9px] text-white/60">Enrollment:</span>
                                <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${event.enrollmentStatus?.toLowerCase() === "open" ? "bg-green-500/30 text-green-100" : event.enrollmentStatus?.toLowerCase() === "closed" ? "bg-red-500/30 text-red-100" : "bg-yellow-500/30 text-yellow-100"}`}>
                                  {event.enrollmentStatus || "N/A"}
                                </span>
                              </div>
                              <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${event.completed ? "bg-gray-500/30 text-gray-100" : "bg-blue-500/30 text-blue-100"}`}>
                                {event.completed ? "Done" : "Upcoming"}
                              </span>
                            </div>

                            <div className="mt-1.5 flex gap-1">
                              {event.completed ? (
                                <div className="flex-1 px-2 py-1.5 rounded-lg flex items-center justify-center gap-1" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
                                  <CheckCircle className="w-3 h-3 text-gray-300" />
                                  <span className="text-[10px] text-gray-300 font-medium">Event Completed</span>
                                </div>
                              ) : (
                                <>
                                  {loadingAttendanceStatus ? (
                                    <div className="flex-1 px-1.5 py-1 rounded-lg text-[10px] font-medium flex items-center justify-center" style={{ background: theme.accentSoft, color: theme.textSecondary }}>
                                      <Loader2 className="w-2.5 h-2.5 mr-0.5 animate-spin" style={{ color: theme.primaryColor }} />Loading...
                                    </div>
                                  ) : activeAttendanceEvents[event.eventId] ? (
                                    <>
                                      <button
                                        onClick={(e) => { e.stopPropagation(); setConfirmDialog({ isOpen: true, title: "Stop Attendance", message: "Are you sure you want to stop attendance for this event? Students will no longer be able to mark attendance.", confirmText: "Stop", variant: "danger", onConfirm: () => { closeConfirm(); handleStopAttendanceForEvent(event.eventId); } }); }}
                                        className="flex-1 px-1.5 py-1 rounded-lg text-[10px] font-medium transition flex items-center justify-center text-white"
                                        style={{ backgroundColor: "rgba(239,68,68,0.6)" }}
                                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.8)")}
                                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.6)")}
                                      >
                                        <XCircle className="w-2.5 h-2.5 mr-0.5" />Stop
                                      </button>
                                      <button
                                        onClick={(e) => { e.stopPropagation(); setInitialQRData(null); setQrCodeEventId(event.eventId); setShowQRCodeModal(true); }}
                                        className="flex-1 px-1.5 py-1 rounded-lg text-[10px] font-medium transition flex items-center justify-center text-white"
                                        style={{ backgroundColor: "rgba(156,39,176,0.6)" }}
                                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(156,39,176,0.8)")}
                                        onMouseLeave={(e) => (e.currentTarget.stylebackgroundColor = "rgba(156,39,176,0.6)")}
                                      >
                                        <svg className="w-2.5 h-2.5 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                        </svg>
                                        QR
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      onClick={(e) => { e.stopPropagation(); setSelectedEventForAttendance(event); setShowAttendancePopup(true); }}
                                      className="flex-1 px-1.5 py-1 rounded-lg text-[10px] font-medium transition flex items-center justify-center text-white"
                                      style={{ backgroundColor: "rgba(76,175,80,0.5)" }}
                                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(76,175,80,0.6)")}
                                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(76,175,80,0.5)")}
                                    >
                                      <MapPin className="w-2.5 h-2.5 mr-0.5" />Start
                                    </button>
                                  )}

                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleEditClick(event); }}
                                    className="flex-1 px-1.5 py-1 rounded-lg text-[10px] font-medium transition flex items-center justify-center text-white"
                                    style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.3)")}
                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.2)")}
                                  >
                                    <Edit className="w-2.5 h-2.5 mr-0.5" />Edit
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setConfirmDialog({ isOpen: true, title: "Delete Event", message: "Are you sure you want to delete this event? This action cannot be undone.", confirmText: "Delete", variant: "danger", onConfirm: () => { closeConfirm(); handleDeleteEvent(event.eventId); } }); }}
                                    className="flex-1 px-1.5 py-1 rounded-lg text-[10px] font-medium transition flex items-center justify-center text-white"
                                    style={{ backgroundColor: "rgba(239,68,68,0.5)" }}
                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.6)")}
                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.5)")}
                                  >
                                    <Trash2 className="w-2.5 h-2.5 mr-0.5" />Delete
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-10 flex flex-col items-center gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => loadPage(descriptorRef.current, currentPage - 1)}
                      disabled={currentPage === 0 || pageLoading}
                      className="p-2 rounded-full border transition disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{
                        borderColor: theme.borderColor,
                        color: theme.textSecondary,
                        background: theme.accentSoft
                      }}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i)
                      .filter((i) => i === 0 || i === totalPages - 1 || Math.abs(i - currentPage) <= 1)
                      .reduce((acc, i, idx, arr) => {
                        if (idx > 0 && i - arr[idx - 1] > 1) acc.push(`ellipsis-${i}`);
                        acc.push(i);
                        return acc;
                      }, [])
                      .map((item) =>
                        typeof item === "string" ? (
                          <span key={item} className="px-2" style={{ color: theme.textMuted }}>…</span>
                        ) : (
                          <button
                            key={item}
                            onClick={() => loadPage(descriptorRef.current, item)}
                            disabled={pageLoading}
                            className={`w-9 h-9 rounded-full text-sm font-medium transition border disabled:cursor-not-allowed ${currentPage === item ? "text-white border-transparent" : ""
                              }`}
                            style={currentPage === item
                              ? { background: theme.primaryGradient }
                              : {
                                color: theme.textSecondary,
                                borderColor: theme.borderColor,
                                background: theme.accentSoft
                              }}
                          >
                            {item + 1}
                          </button>
                        )
                      )}

                    <button
                      onClick={() => loadPage(descriptorRef.current, currentPage + 1)}
                      disabled={pageData.last || pageLoading}
                      className="p-2 rounded-full border transition disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{
                        borderColor: theme.borderColor,
                        color: theme.textSecondary,
                        background: theme.accentSoft
                      }}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-xs" style={{ color: theme.textMuted }}>
                    Page {currentPage + 1} of {totalPages} — {pageData.totalElements} events
                  </p>
                </div>
              )}
            </>
          )}

          {/* Footer */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center space-x-2 text-sm" style={{ color: theme.textMuted }}>
              <Settings className="w-4 h-4" />
              <span>Admin controls active · {pageData.totalElements} events total</span>
              <Share2 className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        {showEditModal && editingEvent && (
          <EditEvent
            event={editingEvent}
            token={token}
            onClose={() => { setShowEditModal(false); setEditingEvent(null); }}
            onSuccess={() => { loadPage(descriptorRef.current, currentPage); checkAllEventsAttendance(); }}
            theme={theme}
            isDarkMode={isDarkMode}
          />
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        isDarkMode={isDarkMode}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        variant={confirmDialog.variant}
        onConfirm={confirmDialog.onConfirm}
        onCancel={closeConfirm}
      />

      <StartAttendancePopup
        isOpen={showAttendancePopup}
        onClose={() => { setShowAttendancePopup(false); setSelectedEventForAttendance(null); }}
        event={selectedEventForAttendance}
        onSuccess={(apiResponse) => {
          const eventId = selectedEventForAttendance?.eventId;
          setShowAttendancePopup(false);
          setSelectedEventForAttendance(null);
          handleAttendanceStartSuccess(apiResponse, eventId);
        }}
        token={token}
        theme={theme}
      />

      {showQRCodeModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowQRCodeModal(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div
              className="relative rounded-2xl shadow-2xl w-full max-w-4xl transition-colors duration-300"
              style={{ background: theme.bgCard, border: `1px solid ${theme.borderColor}` }}
            >
              <QRCodeDisplay
                eventId={qrCodeEventId}
                token={token}
                initialQRData={initialQRData}
                onClose={() => { setShowQRCodeModal(false); setInitialQRData(null); checkAllEventsAttendance(); }}
                onAttendanceEnd={() => { setShowQRCodeModal(false); setInitialQRData(null); checkAllEventsAttendance(); }}
                theme={theme}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ─── QRCodeDisplay with theme support ──────────────────────────────────────────
const QRCodeDisplay = ({ eventId, token, initialQRData, onClose, onAttendanceEnd, theme }) => {
  const [qrData, setQrData] = useState(initialQRData ?? null);
  const [loading, setLoading] = useState(!initialQRData);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(initialQRData?.refreshInSeconds ?? 0);
  const [attendanceActive, setAttendanceActive] = useState(true);
  const [eventDetails, setEventDetails] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(initialQRData?.refreshInSeconds ?? 120);
  const [stopLoading, setStopLoading] = useState(false);
  const [stopError, setStopError] = useState(null);

  const qrTimerRef = useRef(null);
  const statusCheckRef = useRef(null);
  const countdownRef = useRef(null);
  const windowEndTimerRef = useRef(null);

  const handleStopAttendance = async () => {
    setStopLoading(true); setStopError(null);
    try {
      const res = await axios.post(`${BASE_URL}/api/attendance/stop/${eventId}`, {}, { headers: authHeaders(token) });
      if (res.data?.success) {
        clearTimeout(qrTimerRef.current); clearInterval(statusCheckRef.current);
        clearInterval(countdownRef.current); clearTimeout(windowEndTimerRef.current);
        setAttendanceActive(false);
        if (onAttendanceEnd) onAttendanceEnd();
      } else { setStopError(res.data?.message || "Failed to stop attendance"); }
    } catch (err) { setStopError(err.response?.data?.message || "Error stopping attendance"); }
    finally { setStopLoading(false); }
  };

  const scheduleWindowEndTimer = useCallback((windowEnd) => {
    clearTimeout(windowEndTimerRef.current);
    if (!windowEnd) return;
    const ms = new Date(windowEnd) - Date.now();
    if (ms <= 0) return;
    windowEndTimerRef.current = setTimeout(() => {
      setAttendanceActive(false);
      clearTimeout(qrTimerRef.current); clearInterval(statusCheckRef.current); clearInterval(countdownRef.current);
      if (onAttendanceEnd) onAttendanceEnd();
    }, ms);
  }, [onAttendanceEnd]);

  const fetchEventDetails = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/events/getById/${eventId}`, { headers: authHeaders(token) });
      const data = res.data?.data;
      setEventDetails(data);
      scheduleWindowEndTimer(data?.attendanceWindowEnd);
      return data?.attendanceActive ?? false;
    } catch { return true; }
  }, [eventId, token, scheduleWindowEndTimer]);

  const fetchQRCode = useCallback(async () => {
    try {
      setError(null);
      const res = await axios.get(`${BASE_URL}/api/attendance/qr-code/${eventId}`, { headers: authHeaders(token) });
      if (res.data?.success) {
        const newQr = res.data.data;
        setQrData(newQr);
        const secs = newQr.refreshInSeconds || 120;
        setRefreshInterval(secs); setTimeLeft(secs);
        clearTimeout(qrTimerRef.current);
        qrTimerRef.current = setTimeout(fetchQRCode, secs * 1000);
      } else { setError("Failed to fetch QR code"); }
    } catch (err) { setError(err.response?.data?.message || "Error fetching QR code"); }
    finally { setLoading(false); }
  }, [eventId, token]);

  useEffect(() => {
    let mounted = true;
    const initialize = async () => {
      if (initialQRData) {
        const secs = initialQRData.refreshInSeconds || 120;
        setRefreshInterval(secs); setTimeLeft(secs);
        clearTimeout(qrTimerRef.current);
        qrTimerRef.current = setTimeout(fetchQRCode, secs * 1000);
        fetchEventDetails();
      } else {
        const isActive = await fetchEventDetails();
        if (!mounted) return;
        if (!isActive) { setAttendanceActive(false); setLoading(false); return; }
        if (mounted) await fetchQRCode();
      }
      statusCheckRef.current = setInterval(async () => {
        const isActive = await fetchEventDetails();
        if (!mounted) return;
        if (!isActive) {
          setAttendanceActive(false);
          clearTimeout(qrTimerRef.current); clearInterval(statusCheckRef.current); clearInterval(countdownRef.current);
          if (onAttendanceEnd) onAttendanceEnd();
        }
      }, 10000);
    };
    initialize();
    return () => {
      mounted = false;
      clearTimeout(qrTimerRef.current); clearInterval(statusCheckRef.current);
      clearInterval(countdownRef.current); clearTimeout(windowEndTimerRef.current);
    };
  }, [eventId]);

  useEffect(() => {
    clearInterval(countdownRef.current);
    if (timeLeft <= 0) return;
    countdownRef.current = setInterval(() => setTimeLeft((p) => (p <= 1 ? refreshInterval : p - 1)), 1000);
    return () => clearInterval(countdownRef.current);
  }, [refreshInterval]);

  useEffect(() => {
    if (qrData?.refreshInSeconds) { setRefreshInterval(qrData.refreshInSeconds); setTimeLeft(qrData.refreshInSeconds); }
  }, [qrData]);

  const getWindowTimeRemaining = () => {
    if (!eventDetails?.attendanceWindowEnd) return null;
    const remaining = new Date(eventDetails.attendanceWindowEnd) - new Date();
    if (remaining <= 0) return null;
    return `${Math.floor(remaining / 60000)}m ${Math.floor((remaining % 60000) / 1000)}s`;
  };

  if (!attendanceActive) return (
    <div className="text-center py-8 p-6">
      <div className="rounded-lg p-6" style={{ background: theme.accentSoft }}>
        <AlertCircle className="w-12 h-12 mx-auto mb-3" style={{ color: theme.primaryColor }} />
        <h3 className="text-lg font-semibold mb-2" style={{ color: theme.textPrimary }}>Attendance Session Ended</h3>
        <p className="mb-4" style={{ color: theme.textSecondary }}>The attendance session for this event is no longer active.</p>
        <button
          onClick={onClose}
          className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition"
          style={{ background: theme.primaryGradient }}
        >
          Close
        </button>
      </div>
    </div>
  );

  if (loading) return (
    <div className="text-center py-12 p-6">
      <Loader2 className="w-12 h-12 animate-spin mx-auto" style={{ color: theme.primaryColor }} />
      <p className="mt-4" style={{ color: theme.textSecondary }}>Loading QR code...</p>
    </div>
  );

  if (error) return (
    <div className="text-center py-8 p-6">
      <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
      <p className="text-red-600 mb-4">{error}</p>
      <button
        onClick={() => { setLoading(true); fetchQRCode(); }}
        className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition"
        style={{ background: theme.primaryGradient }}
      >
        Retry
      </button>
    </div>
  );

  const windowTimeRemaining = getWindowTimeRemaining();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center border-b pb-3 mb-6" style={{ borderColor: theme.borderColor }}>
        <h2 className="text-lg font-semibold" style={{ color: theme.primaryColor }}>
          Attendance QR Code
        </h2>
        <button onClick={onClose} className="text-2xl leading-none" style={{ color: theme.textMuted }}>&times;</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="md:col-span-3 text-center">
          <div
            className="p-4 rounded-lg mb-4 text-white flex justify-between items-center"
            style={{ background: theme.primaryGradient }}
          >
            <span className="text-sm">Next QR refresh in:</span>
            <span className="text-2xl font-bold tabular-nums">{timeLeft}s</span>
          </div>
          {windowTimeRemaining && (
            <div className="mb-3 px-3 py-1.5 border rounded-lg text-sm flex items-center justify-center gap-2"
              style={{ background: theme.accentSoft, borderColor: theme.primaryLight, color: theme.primaryColor }}>
              <Clock className="w-4 h-4" />Window closes in: <span className="font-semibold">{windowTimeRemaining}</span>
            </div>
          )}
          {qrData?.qrToken && (
            <>
              <div
                className="p-4 rounded-xl shadow-md inline-block border"
                style={{ background: theme.bgCard, borderColor: theme.borderColor }}
              >
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(qrData.qrToken)}`} className="w-60 h-60" alt="Attendance QR Code" />
              </div>
              <p className="text-xs mt-2" style={{ color: theme.textMuted }}>Expires: {new Date(qrData.expiresAt).toLocaleTimeString()}</p>
            </>
          )}
        </div>
        <div className="md:col-span-2 flex flex-col gap-4">
          <div className="p-4 rounded-lg border" style={{ background: theme.accentSoft, borderColor: theme.borderColor }}>
            <p className="text-sm font-medium mb-2" style={{ color: theme.textSecondary }}>Manual Entry Token:</p>
            <code className="bg-gray-800 text-green-400 p-3 rounded-lg block break-all text-xs leading-relaxed">{qrData?.qrToken}</code>
          </div>
          <div className="p-4 rounded-lg border" style={{ background: theme.accentSoft, borderColor: theme.borderColor }}>
            <p className="font-semibold mb-2" style={{ color: theme.primaryColor }}>Instructions</p>
            <ul className="space-y-1.5 text-xs list-disc list-inside" style={{ color: theme.textSecondary }}>
              <li>Students scan this QR code to mark attendance</li>
              <li>QR auto-refreshes every {refreshInterval}s for security</li>
              <li>Students must be within the geofence radius</li>
              <li>Attendance can only be marked during the active window</li>
            </ul>
          </div>
          {stopError && <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{stopError}</div>}
          <div className="mt-auto flex gap-2">
            <button
              onClick={handleStopAttendance}
              disabled={stopLoading}
              className="flex-1 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #ef4444, #b91c1c)" }}
            >
              {stopLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}Stop Attendance
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded-lg transition-colors"
              style={{ borderColor: theme.borderColor, color: theme.textSecondary, background: theme.accentSoft }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyEventsForSuperadmin;