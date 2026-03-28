// import React, { useState, useEffect, useCallback, useRef } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import ConfirmDialog from "../../components/ConfirmDialog";
// import CustomSelect from "../../components/CustomSelect";
// import StartAttendancePopup from "../../components/StartAttendencePopup";
// import EditEvent from "../../components/EditEvent";
// import PaginationControls from "../../components/Paginationcontrols";
// import {
//   getTargetTypeIcon,
//   getTargetTypeColor,
//   formatDateTime,
//   formatDateOnly,
//   getDaysUntil,
//   isEventVisibleToUser,
//   sharedStyles,
// } from "../../components/EventUtils";
// import {
//   Calendar, MapPin, Users, User, Clock, Globe, AlertCircle,
//   CheckCircle, Loader2, Radio, Sparkles, Star, Briefcase,
//   Plus, X, Edit, Trash2, Filter, ChevronDown, ChevronLeft,
//   ChevronRight, Search, Bell, Gift, ArrowLeft, CheckSquare,
//   Square, XCircle,
// } from "lucide-react";

// const BASE_URL = import.meta.env.VITE_API_URL || "http://72.155.88.211:8080";

// // ─── QRCodeDisplay ─────────────────────────────────────────────────────────────
// const QRCodeDisplay = ({ eventId, token, initialQRData, onClose, onAttendanceEnd }) => {
//   const [qrData,            setQrData           ] = useState(initialQRData ?? null);
//   const [loading,           setLoading          ] = useState(!initialQRData);
//   const [error,             setError            ] = useState(null);
//   const [timeLeft,          setTimeLeft         ] = useState(initialQRData?.refreshInSeconds ?? 0);
//   const [attendanceActive,  setAttendanceActive ] = useState(true);
//   const [eventDetails,      setEventDetails     ] = useState(null);
//   const [refreshInterval,   setRefreshInterval  ] = useState(initialQRData?.refreshInSeconds ?? 120);
//   const [stopLoading,       setStopLoading      ] = useState(false);
//   const [stopError,         setStopError        ] = useState(null);

//   const qrTimerRef        = useRef(null);
//   const statusCheckRef    = useRef(null);
//   const countdownRef      = useRef(null);
//   const windowEndTimerRef = useRef(null);

//   const authHeaders = () => ({ Authorization: `Bearer ${token}`, "Content-Type": "application/json" });

//   const handleStopAttendance = async () => {
//     setStopLoading(true);
//     setStopError(null);
//     try {
//       const res = await axios.post(
//         `${BASE_URL}/api/attendance/stop/${eventId}`, {},
//         { headers: authHeaders() }
//       );
//       if (res.data?.success) {
//         if (qrTimerRef.current)        clearTimeout(qrTimerRef.current);
//         if (statusCheckRef.current)    clearInterval(statusCheckRef.current);
//         if (countdownRef.current)      clearInterval(countdownRef.current);
//         if (windowEndTimerRef.current) clearTimeout(windowEndTimerRef.current);
//         setAttendanceActive(false);
//         if (onAttendanceEnd) onAttendanceEnd();
//       } else {
//         setStopError(res.data?.message || "Failed to stop attendance");
//       }
//     } catch (err) {
//       setStopError(err.response?.data?.message || "Error stopping attendance");
//     } finally {
//       setStopLoading(false);
//     }
//   };

//   const scheduleWindowEndTimer = useCallback((windowEnd) => {
//     if (windowEndTimerRef.current) clearTimeout(windowEndTimerRef.current);
//     if (!windowEnd) return;
//     const msUntilEnd = new Date(windowEnd) - Date.now();
//     if (msUntilEnd <= 0) return;
//     windowEndTimerRef.current = setTimeout(() => {
//       setAttendanceActive(false);
//       if (qrTimerRef.current)     clearTimeout(qrTimerRef.current);
//       if (statusCheckRef.current) clearInterval(statusCheckRef.current);
//       if (countdownRef.current)   clearInterval(countdownRef.current);
//       if (onAttendanceEnd) onAttendanceEnd();
//     }, msUntilEnd);
//   }, [onAttendanceEnd]);

//   const fetchEventDetails = useCallback(async () => {
//     try {
//       const res = await axios.get(
//         `${BASE_URL}/api/events/getById/${eventId}`,
//         { headers: authHeaders() }
//       );
//       const data = res.data?.data;
//       setEventDetails(data);
//       scheduleWindowEndTimer(data?.attendanceWindowEnd);
//       return data?.attendanceActive ?? false;
//     } catch (err) {
//       console.error("Error fetching event details:", err);
//       return true;
//     }
//   }, [eventId, token, scheduleWindowEndTimer]);

//   const fetchQRCode = useCallback(async () => {
//     try {
//       setError(null);
//       const res = await axios.get(
//         `${BASE_URL}/api/attendance/qr-code/${eventId}`,
//         { headers: authHeaders() }
//       );
//       if (res.data?.success) {
//         const newQr = res.data.data;
//         setQrData(newQr);
//         const secs = newQr.refreshInSeconds || 120;
//         setRefreshInterval(secs);
//         setTimeLeft(secs);
//         if (qrTimerRef.current) clearTimeout(qrTimerRef.current);
//         qrTimerRef.current = setTimeout(fetchQRCode, secs * 1000);
//       } else {
//         setError("Failed to fetch QR code");
//       }
//     } catch (err) {
//       setError(err.response?.data?.message || "Error fetching QR code");
//     } finally {
//       setLoading(false);
//     }
//   }, [eventId, token]);

//   useEffect(() => {
//     let mounted = true;

//     const initialize = async () => {
//       if (initialQRData) {
//         const secs = initialQRData.refreshInSeconds || 120;
//         setRefreshInterval(secs);
//         setTimeLeft(secs);
//         if (qrTimerRef.current) clearTimeout(qrTimerRef.current);
//         qrTimerRef.current = setTimeout(fetchQRCode, secs * 1000);
//         fetchEventDetails();
//       } else {
//         const isActive = await fetchEventDetails();
//         if (!mounted) return;
//         if (!isActive) {
//           setAttendanceActive(false);
//           setLoading(false);
//           return;
//         }
//         if (mounted) await fetchQRCode();
//       }

//       statusCheckRef.current = setInterval(async () => {
//         const isActive = await fetchEventDetails();
//         if (!mounted) return;
//         if (!isActive) {
//           setAttendanceActive(false);
//           if (qrTimerRef.current)     clearTimeout(qrTimerRef.current);
//           if (statusCheckRef.current) clearInterval(statusCheckRef.current);
//           if (countdownRef.current)   clearInterval(countdownRef.current);
//           if (onAttendanceEnd) onAttendanceEnd();
//         }
//       }, 10000);
//     };

//     initialize();

//     return () => {
//       mounted = false;
//       if (qrTimerRef.current)        clearTimeout(qrTimerRef.current);
//       if (statusCheckRef.current)    clearInterval(statusCheckRef.current);
//       if (countdownRef.current)      clearInterval(countdownRef.current);
//       if (windowEndTimerRef.current) clearTimeout(windowEndTimerRef.current);
//     };
//   }, [eventId]);

//   // Countdown tick
//   useEffect(() => {
//     if (countdownRef.current) clearInterval(countdownRef.current);
//     if (timeLeft <= 0) return;
//     countdownRef.current = setInterval(() => {
//       setTimeLeft((prev) => (prev <= 1 ? refreshInterval : prev - 1));
//     }, 1000);
//     return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
//   }, [refreshInterval]);

//   // Sync countdown when new QR arrives
//   useEffect(() => {
//     if (qrData?.refreshInSeconds) {
//       setRefreshInterval(qrData.refreshInSeconds);
//       setTimeLeft(qrData.refreshInSeconds);
//     }
//   }, [qrData]);

//   const getWindowTimeRemaining = () => {
//     if (!eventDetails?.attendanceWindowEnd) return null;
//     const remaining = new Date(eventDetails.attendanceWindowEnd) - new Date();
//     if (remaining <= 0) return null;
//     const m = Math.floor(remaining / 60000);
//     const s = Math.floor((remaining % 60000) / 1000);
//     return `${m}m ${s}s`;
//   };

//   if (!attendanceActive) {
//     return (
//       <div className="text-center py-8 p-6">
//         <div className="bg-yellow-50 rounded-lg p-6">
//           <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
//           <h3 className="text-lg font-semibold text-gray-800 mb-2">Attendance Session Ended</h3>
//           <p className="text-gray-600 mb-4">The attendance session for this event is no longer active.</p>
//           <button onClick={onClose} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">Close</button>
//         </div>
//       </div>
//     );
//   }

//   if (loading) {
//     return (
//       <div className="text-center py-12 p-6">
//         <Loader2 className="w-12 h-12 animate-spin text-[#4CA1AF] mx-auto" />
//         <p className="text-gray-600 mt-4">Loading QR code...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="text-center py-8 p-6">
//         <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
//         <p className="text-red-600 mb-4">{error}</p>
//         <button onClick={() => { setLoading(true); fetchQRCode(); }} className="px-4 py-2 bg-[#4CA1AF] text-white rounded-lg hover:bg-[#3d8a9c]">Retry</button>
//       </div>
//     );
//   }

//   const windowTimeRemaining = getWindowTimeRemaining();

//   return (
//     <div className="p-6">
//       {/* Header */}
//       <div className="flex justify-between items-center border-b pb-3 mb-6">
//         <h2 className="text-lg font-semibold" style={{ background: "linear-gradient(135deg, #4CA1AF, #2C3E50)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
//           Attendance QR Code
//         </h2>
//         <div className="flex items-center gap-3">
//           {stopError && <p className="text-xs text-red-500">{stopError}</p>}
//           <button
//             onClick={handleStopAttendance}
//             disabled={stopLoading}
//             className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition flex items-center gap-1.5 disabled:opacity-50"
//           >
//             {stopLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
//             Stop Attendance
//           </button>
//           <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
//         {/* Left — QR image */}
//         <div className="md:col-span-3 text-center">
//           <div className="p-4 rounded-lg mb-4 text-white flex justify-between items-center" style={{ background: "linear-gradient(135deg, #4CA1AF, #2C3E50)" }}>
//             <span className="text-sm">Next QR refresh in:</span>
//             <span className="text-2xl font-bold tabular-nums">{timeLeft}s</span>
//           </div>

//           {windowTimeRemaining && (
//             <div className="mb-3 px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-700 flex items-center justify-center gap-2">
//               <Clock className="w-4 h-4" />
//               Window closes in: <span className="font-semibold">{windowTimeRemaining}</span>
//             </div>
//           )}

//           {qrData?.qrToken && (
//             <>
//               <div className="bg-white p-4 rounded-xl shadow-md inline-block border border-gray-100">
//                 <img
//                   src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(qrData.qrToken)}`}
//                   className="w-60 h-60"
//                   alt="Attendance QR Code"
//                 />
//               </div>
//               <p className="text-xs text-gray-500 mt-2">
//                 Expires: {new Date(qrData.expiresAt).toLocaleTimeString()}
//               </p>
//             </>
//           )}
//         </div>

//         {/* Right — Token + Instructions */}
//         <div className="md:col-span-2 flex flex-col gap-4">
//           <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
//             <p className="text-sm font-medium text-gray-700 mb-2">Manual Entry Token:</p>
//             <code className="bg-gray-800 text-green-400 p-3 rounded-lg block break-all text-xs leading-relaxed">
//               {qrData?.qrToken}
//             </code>
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

//           <button onClick={onClose} className="mt-auto px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors self-end">
//             Close
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ─── TeacherEvents ─────────────────────────────────────────────────────────────
// const TeacherEvents = () => {
//   const navigate = useNavigate();

//   // ── Core state ─────────────────────────────────────────────────
//   const [events,        setEvents       ] = useState([]);
//   const [allEvents,     setAllEvents    ] = useState([]);
//   const [loading,       setLoading      ] = useState(true);
//   const [error,         setError        ] = useState(null);
//   const [userPrn,       setUserPrn      ] = useState("");
//   const [userDept,      setUserDept     ] = useState("");
//   const [deptId,        setDeptId       ] = useState(null);
//   const [departments,   setDepartments  ] = useState([]);
//   const [userClubs,     setUserClubs    ] = useState([]);
//   const [allClubs,      setAllClubs     ] = useState([]);
//   const [userMap,       setUserMap      ] = useState({});

//   // ── Filter / UI state ──────────────────────────────────────────
//   const [filterType,       setFilterType      ] = useState("GLOBAL");
//   const [selectedClubId,   setSelectedClubId  ] = useState("");
//   const [searchTerm,       setSearchTerm      ] = useState("");
//   const [showFilters,      setShowFilters     ] = useState(false);
//   const [sortBy,           setSortBy          ] = useState("date");
//   const [showClubDropdown, setShowClubDropdown] = useState(false);
//   const [showCreatedEvents,setShowCreatedEvents] = useState(false);
//   const [selectedStatus,   setSelectedStatus  ] = useState("all");
//   const [completedFilter,  setCompletedFilter ] = useState("all");
//   const [selectedRating,   setSelectedRating  ] = useState("all");

//   // ── Pagination ──────────────────────────────────────────────────
//   const [currentPage,    setCurrentPage  ] = useState(0);
//   const [pageSize,       setPageSize     ] = useState(12);
//   const [totalPages,     setTotalPages   ] = useState(0);
//   const [totalElements,  setTotalElements] = useState(0);

//   // ── Attendance popup ────────────────────────────────────────────
//   const [showAttendancePopup,         setShowAttendancePopup        ] = useState(false);
//   const [selectedEventForAttendance,  setSelectedEventForAttendance ] = useState(null);

//   // ── Attendance active tracking ──────────────────────────────────
//   const [activeAttendanceEvents,    setActiveAttendanceEvents   ] = useState({});
//   const [loadingAttendanceStatus,   setLoadingAttendanceStatus  ] = useState(false);

//   // ── QR Modal ────────────────────────────────────────────────────
//   const [showQRCodeModal, setShowQRCodeModal] = useState(false);
//   const [qrCodeEventId,   setQrCodeEventId  ] = useState(null);
//   const [initialQRData,   setInitialQRData  ] = useState(null);

//   // ── Edit modal ──────────────────────────────────────────────────
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [editingEvent,  setEditingEvent ] = useState(null);

//   // ── Complete event ──────────────────────────────────────────────
//   const [completingEventId, setCompletingEventId] = useState(null);
//   const [completionMessage, setCompletionMessage] = useState({
//     show: false, eventId: null, success: false, message: "",
//   });

//   // ── Confirm dialog ──────────────────────────────────────────────
//   const [confirmDialog, setConfirmDialog] = useState({
//     isOpen: false, title: "", message: "", variant: "primary",
//     confirmText: "Confirm", onConfirm: () => {},
//   });
//   const closeConfirm = () => setConfirmDialog((p) => ({ ...p, isOpen: false }));

//   // ── CustomSelect option sets ────────────────────────────────────
//   const enrollmentStatusOptions = [
//     { value: "all",    label: "Enrollment Status" },
//     { value: "open",   label: "Open"              },
//     { value: "closed", label: "Closed"            },
//   ];
//   const completedStatusOptions = [
//     { value: "all",          label: "Completed Status" },
//     { value: "completed",    label: "Completed"        },
//     { value: "notCompleted", label: "Not Completed"    },
//   ];
//   const sortOptions = [
//     { value: "date",       label: "Sort by Date"       },
//     { value: "popularity", label: "Sort by Popularity" },
//     { value: "enrollment", label: "Sort by Capacity"   },
//     { value: "ratings",    label: "Sort by Ratings"    },
//   ];
//   const ratingOptions = [
//     { value: "all", label: "Ratings" },
//     { value: "1",   label: "1+"      },
//     { value: "2",   label: "2+"      },
//     { value: "3",   label: "3+"      },
//     { value: "4",   label: "4+"      },
//     { value: "5",   label: "5"       },
//   ];

//   // ── Init ────────────────────────────────────────────────────────
//   useEffect(() => {
//     const init = async () => {
//       const user  = JSON.parse(localStorage.getItem("user"));
//       const token = localStorage.getItem("token");
//       if (!token) { setError("No authentication token found. Please login again."); setLoading(false); return; }
//       const prn = user?.prn;
//       if (prn) setUserPrn(prn);
//       fetchDepartments(token);
//       fetchUserProfile(token);
//       fetchUserClubs(token);
//       fetchAllClubs(token);
//       fetchEventsPaged(token, "TEACHER", "GLOBAL", null, 0, 12);
//     };
//     init();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // ── Attendance: check one event ─────────────────────────────────
//   const checkAttendanceActive = async (eventId) => {
//     const token = localStorage.getItem("token");
//     try {
//       const res = await axios.get(
//         `${BASE_URL}/api/events/getById/${eventId}`,
//         { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
//       );
//       return res.data?.data?.attendanceActive || false;
//     } catch (err) {
//       console.error(`Error checking attendance for event ${eventId}:`, err);
//       return false;
//     }
//   };

//   // ── Attendance: check all current-page events ───────────────────
//   const checkAllEventsAttendance = useCallback(async () => {
//     if (!events || events.length === 0) return;
//     setLoadingAttendanceStatus(true);
//     const statusMap = {};
//     await Promise.all(
//       events.map(async (event) => {
//         statusMap[event.eventId] = await checkAttendanceActive(event.eventId);
//       })
//     );
//     setActiveAttendanceEvents(statusMap);
//     setLoadingAttendanceStatus(false);
//   }, [events]);

//   useEffect(() => {
//     if (events && events.length > 0) {
//       checkAllEventsAttendance();
//     }
//   }, [events]);

//   // ── Attendance: stop ────────────────────────────────────────────
//   const handleStopAttendanceForEvent = async (eventId) => {
//     const token = localStorage.getItem("token");
//     try {
//       const res = await axios.post(
//         `${BASE_URL}/api/attendance/stop/${eventId}`, {},
//         { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
//       );
//       if (res.data?.success) {
//         checkAllEventsAttendance();
//         fetchEventsPaged(token, "TEACHER", filterType, selectedClubId || deptId, currentPage, pageSize);
//       } else {
//         alert(res.data?.message || "Failed to stop attendance");
//       }
//     } catch (err) {
//       alert(err.response?.data?.message || "Error stopping attendance");
//     }
//   };

//   // ── API helpers ─────────────────────────────────────────────────
//   const fetchUserProfile = async (token) => {
//     try {
//       const user = JSON.parse(localStorage.getItem("user"));
//       const prn  = user?.prn;
//       if (!prn) return;
//       setUserPrn(prn);
//       const response = await axios.get(
//         `${BASE_URL}/api/profiles/prn/${prn}`,
//         { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } },
//       );
//       if (response.data.success) {
//         const profile = response.data.data;
//         setUserDept(profile.department);
//         fetchDepartmentId(token, profile.department);
//       }
//     } catch (err) { console.error("Error fetching user profile:", err); }
//   };

//   const fetchDepartments = async (token) => {
//     try {
//       const response = await axios.get(`${BASE_URL}/api/department`,
//         { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } });
//       if (response.data.success) setDepartments(response.data.data);
//     } catch (err) { console.error("Error fetching departments:", err); }
//   };

//   const fetchDepartmentId = async (token, deptName) => {
//     try {
//       const response = await axios.get(`${BASE_URL}/api/department`,
//         { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } });
//       if (response.data.success) {
//         const dept = response.data.data.find((d) => d.name === deptName);
//         if (dept) setDeptId(dept.departmentId);
//       }
//     } catch (err) { console.error("Error fetching department ID:", err); }
//   };

//   const fetchUserClubs = async (token) => {
//     try {
//       const response = await axios.get(`${BASE_URL}/api/user-clubs/getMyClubs`,
//         { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } });
//       if (response.data.success) setUserClubs(response.data.data);
//     } catch (err) { console.error("Error fetching user clubs:", err); }
//   };

//   const fetchAllClubs = async (token) => {
//     try {
//       const response = await axios.get(`${BASE_URL}/api/clubs`,
//         { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } });
//       if (response.data.success) setAllClubs(response.data.data);
//     } catch (err) { console.error("Error fetching all clubs:", err); }
//   };

//   const fetchUserNameByPrn = async (token, prn) => {
//     if (userMap[prn]) return userMap[prn];
//     try {
//       const response = await axios.get(
//         `${BASE_URL}/api/profiles/prn/${prn}`,
//         { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } },
//       );
//       if (response.data.success) {
//         const name = response.data.data.name || response.data.data.fullName || prn;
//         setUserMap((prev) => ({ ...prev, [prn]: name }));
//         return name;
//       }
//     } catch (err) { console.error(`Error fetching user for PRN ${prn}:`, err); }
//     return prn;
//   };

//   const enrichWithCreatorNames = async (token, list) => {
//     if (!list.length) return list;
//     return Promise.all(
//       list.map(async (event) => {
//         if (!event.creatorName || event.creatorName.match(/^\d+$/)) {
//           const creatorName = await fetchUserNameByPrn(token, event.creatorPrn);
//           return { ...event, creatorName };
//         }
//         return event;
//       }),
//     );
//   };

//   const applyPageResponse = (data) => {
//     setTotalPages(data.totalPages ?? 0);
//     setTotalElements(data.totalElements ?? 0);
//     setCurrentPage(data.pageNumber ?? 0);
//   };

//   // ── Core paginated fetcher ─────────────────────────────────────
//   const fetchEventsPaged = async (token, role, filter = "GLOBAL", targetId = null, page = 0, size = pageSize) => {
//     try {
//       setLoading(true);
//       const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
//       const params  = { page, size };
//       let response;

//       if (filter === "GLOBAL") {
//         response = await axios.get(
//           `${BASE_URL}/api/events/getByTargetType/GLOBAL/paged`,
//           { headers, params },
//         );
//       } else if (filter === "CREATED") {
//         response = await axios.get(
//           `${BASE_URL}/api/events/myEvents/paged`,
//           { headers, params },
//         );
//       } else if (filter === "DEPARTMENT" && targetId) {
//         response = await axios.get(
//           `${BASE_URL}/api/events/targetData/DEPARTMENT/${targetId}/paged`,
//           { headers, params },
//         );
//       } else if (filter === "CLUB" && targetId) {
//         response = await axios.get(
//           `${BASE_URL}/api/events/targetData/CLUB/${targetId}/paged`,
//           { headers, params },
//         );
//       }

//       if (response?.data?.success) {
//         const pageData = response.data.data;
//         let fetched = pageData.content || [];
//         fetched = await enrichWithCreatorNames(token, fetched);
//         setEvents(fetched);
//         setAllEvents(fetched);
//         applyPageResponse(pageData);
//       }
//     } catch (err) {
//       console.error("Error fetching events:", err);
//       setError(err.message || "An error occurred while fetching events");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchEventsByCompletedStatusPaged = async (completed, page = 0, size = pageSize) => {
//     try {
//       setLoading(true);
//       const token      = localStorage.getItem("token");
//       const user       = JSON.parse(localStorage.getItem("user"));
//       const currentPrn = user?.prn || userPrn;
//       const headers    = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
//       const response   = await axios.get(
//         `${BASE_URL}/api/events/endEvent/${completed}/paged`,
//         { headers, params: { page, size } },
//       );
//       if (response.data.success) {
//         const pageData = response.data.data;
//         let fetched = pageData.content || [];
//         fetched = await enrichWithCreatorNames(token, fetched);
//         fetched = fetched.filter((event) =>
//           isEventVisibleToUser(event, deptId, userClubs, currentPrn, true),
//         );
//         setEvents(fetched);
//         setAllEvents(fetched);
//         applyPageResponse(pageData);
//       }
//     } catch (err) {
//       console.error("Error fetching events by completed status:", err);
//       setError(err.message || "An error occurred");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchEventsByDeadlinePaged = async (status, page = 0, size = pageSize) => {
//     try {
//       setLoading(true);
//       const token      = localStorage.getItem("token");
//       const user       = JSON.parse(localStorage.getItem("user"));
//       const currentPrn = user?.prn || userPrn;
//       const headers    = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
//       const response   = await axios.get(
//         `${BASE_URL}/api/events/enrollment/${status}/paged`,
//         { headers, params: { page, size } },
//       );
//       if (response.data.success) {
//         const pageData = response.data.data;
//         let fetched = pageData.content || [];
//         fetched = await enrichWithCreatorNames(token, fetched);
//         fetched = fetched.filter((event) =>
//           isEventVisibleToUser(event, deptId, userClubs, currentPrn, true),
//         );
//         setEvents(fetched);
//         setAllEvents(fetched);
//         applyPageResponse(pageData);
//       }
//     } catch (err) {
//       console.error("Error fetching events by deadline:", err);
//       setError(err.message || "An error occurred");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchEventsByRatingsPaged = async (rating, page = 0, size = pageSize) => {
//     try {
//       setLoading(true);
//       const token      = localStorage.getItem("token");
//       const user       = JSON.parse(localStorage.getItem("user"));
//       const currentPrn = user?.prn || userPrn;
//       const headers    = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
//       const response   = await axios.get(
//         `${BASE_URL}/api/events/ratings/${rating}/paged`,
//         { headers, params: { page, size } },
//       );
//       if (response.data.success) {
//         const pageData = response.data.data;
//         let fetched = pageData.content || [];
//         fetched = await enrichWithCreatorNames(token, fetched);
//         fetched = fetched.filter((event) =>
//           isEventVisibleToUser(event, deptId, userClubs, currentPrn, true),
//         );
//         setEvents(fetched);
//         setAllEvents(fetched);
//         applyPageResponse(pageData);
//       }
//     } catch (err) {
//       console.error("Error fetching events by ratings:", err);
//       setError(err.message || "An error occurred");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ── Page change ────────────────────────────────────────────────
//   const handlePageChange = (newPage) => {
//     if (newPage < 0 || newPage >= totalPages) return;
//     setCurrentPage(newPage);
//     const token = localStorage.getItem("token");
//     if (completedFilter !== "all") {
//       fetchEventsByCompletedStatusPaged(completedFilter === "completed", newPage, pageSize);
//     } else if (selectedStatus !== "all") {
//       fetchEventsByDeadlinePaged(selectedStatus.toUpperCase(), newPage, pageSize);
//     } else if (selectedRating !== "all") {
//       fetchEventsByRatingsPaged(Number(selectedRating), newPage, pageSize);
//     } else {
//       fetchEventsPaged(token, "TEACHER", filterType, selectedClubId || deptId, newPage, pageSize);
//     }
//     window.scrollTo({ top: 400, behavior: "smooth" });
//   };

//   const handlePageSizeChange = (newSize) => {
//     setPageSize(newSize);
//     setCurrentPage(0);
//     const token = localStorage.getItem("token");
//     if (completedFilter !== "all") {
//       fetchEventsByCompletedStatusPaged(completedFilter === "completed", 0, newSize);
//     } else if (selectedStatus !== "all") {
//       fetchEventsByDeadlinePaged(selectedStatus.toUpperCase(), 0, newSize);
//     } else if (selectedRating !== "all") {
//       fetchEventsByRatingsPaged(Number(selectedRating), 0, newSize);
//     } else {
//       fetchEventsPaged(token, "TEACHER", filterType, selectedClubId || deptId, 0, newSize);
//     }
//   };

//   // ── Filter handlers ────────────────────────────────────────────
//   const handleFilterChange = async (newFilterType, targetId = null) => {
//     const token = localStorage.getItem("token");
//     setFilterType(newFilterType);
//     setCurrentPage(0);

//     const resetFilters = () => {
//       setShowCreatedEvents(false);
//       setSelectedClubId("");
//       setShowClubDropdown(false);
//       setCompletedFilter("all");
//       setSelectedStatus("all");
//       setSelectedRating("all");
//     };

//     if (newFilterType === "CREATED") {
//       resetFilters();
//       setShowCreatedEvents(true);
//     } else if (newFilterType === "CLUB") {
//       if (targetId) { resetFilters(); setSelectedClubId(targetId); }
//       else { setShowClubDropdown(true); return; }
//     } else {
//       resetFilters();
//     }
//     await fetchEventsPaged(token, "TEACHER", newFilterType, targetId || deptId, 0, pageSize);
//   };

//   const handleCompletedFilterChange = async (value) => {
//     setCompletedFilter(value);
//     setSelectedRating("all");
//     setCurrentPage(0);
//     if (value === "all") {
//       const token = localStorage.getItem("token");
//       await fetchEventsPaged(token, "TEACHER", filterType, selectedClubId || deptId, 0, pageSize);
//     } else {
//       await fetchEventsByCompletedStatusPaged(value === "completed", 0, pageSize);
//     }
//   };

//   const handleStatusFilterChange = async (value) => {
//     setSelectedStatus(value);
//     setSelectedRating("all");
//     setCurrentPage(0);
//     if (value === "all") {
//       const token = localStorage.getItem("token");
//       await fetchEventsPaged(token, "TEACHER", filterType, selectedClubId || deptId, 0, pageSize);
//     } else {
//       await fetchEventsByDeadlinePaged(value.toUpperCase(), 0, pageSize);
//     }
//   };

//   const handleRatingFilterChange = async (value) => {
//     setSelectedRating(value);
//     setSelectedStatus("all");
//     setCompletedFilter("all");
//     setCurrentPage(0);
//     if (value === "all") {
//       const token = localStorage.getItem("token");
//       await fetchEventsPaged(token, "TEACHER", filterType, selectedClubId || deptId, 0, pageSize);
//     } else {
//       await fetchEventsByRatingsPaged(Number(value), 0, pageSize);
//     }
//   };

//   const clearAllFilters = () => {
//     setSearchTerm("");
//     setSelectedStatus("all");
//     setCompletedFilter("all");
//     setSelectedRating("all");
//     setFilterType("GLOBAL");
//     setSelectedClubId("");
//     setShowCreatedEvents(false);
//     setCurrentPage(0);
//     const token = localStorage.getItem("token");
//     fetchEventsPaged(token, "TEACHER", "GLOBAL", null, 0, pageSize);
//   };

//   const removeStatusFilter = async () => {
//     setSelectedStatus("all");
//     setCurrentPage(0);
//     const token = localStorage.getItem("token");
//     await fetchEventsPaged(token, "TEACHER", filterType, selectedClubId || deptId, 0, pageSize);
//   };

//   const removeCompletedFilter = () => {
//     setCompletedFilter("all");
//     setCurrentPage(0);
//     const token = localStorage.getItem("token");
//     fetchEventsPaged(token, "TEACHER", filterType, selectedClubId || deptId, 0, pageSize);
//   };

//   const removeRatingFilter = () => {
//     setSelectedRating("all");
//     setCurrentPage(0);
//     const token = localStorage.getItem("token");
//     fetchEventsPaged(token, "TEACHER", filterType, selectedClubId || deptId, 0, pageSize);
//   };

//   // ── Teacher actions ────────────────────────────────────────────
//   const handleEditClick = (event) => {
//     // Pass the raw event — EditEvent handles all datetime formatting internally
//     setEditingEvent({ ...event });
//     setShowEditModal(true);
//   };

//   const handleDeleteEvent = async (eventId) => {
//     try {
//       const token = localStorage.getItem("token");
//       await axios.delete(
//         `${BASE_URL}/api/events/deleteEvent/${eventId}`,
//         { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } },
//       );
//       alert("Event deleted successfully!");
//       fetchEventsPaged(token, "TEACHER", "GLOBAL", null, 0, pageSize);
//     } catch (err) { alert(err.response?.data?.message || "Failed to delete event"); }
//   };

//   const handleCompleteEvent = async (eventId) => {
//     try {
//       setCompletingEventId(eventId);
//       const token = localStorage.getItem("token");
//       const response = await axios.post(
//         `${BASE_URL}/api/events/completeEvent/${eventId}`, {},
//         { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } },
//       );
//       if (response.data.success) {
//         setEvents((prev)    => prev.map((e) => e.eventId === eventId ? { ...e, completed: true } : e));
//         setAllEvents((prev) => prev.map((e) => e.eventId === eventId ? { ...e, completed: true } : e));
//         setCompletionMessage({ show: true, eventId, success: true, message: "Event marked as completed successfully!" });
//       } else {
//         setCompletionMessage({ show: true, eventId, success: false, message: response.data.message || "Failed to mark event as completed" });
//       }
//     } catch (err) {
//       setCompletionMessage({ show: true, eventId, success: false, message: err.response?.data?.message || "Error completing event." });
//     } finally {
//       setCompletingEventId(null);
//       setTimeout(() => setCompletionMessage({ show: false, eventId: null, success: false, message: "" }), 3000);
//     }
//   };

//   // ── Attendance start success — capture QR data, open modal ─────
//   const handleAttendanceStartSuccess = (apiResponse) => {
//     const qrData = apiResponse?.data ?? null;
//     if (selectedEventForAttendance) {
//       setQrCodeEventId(selectedEventForAttendance.eventId);
//       setInitialQRData(qrData);
//       setShowQRCodeModal(true);
//     }
//     checkAllEventsAttendance();
//     const token = localStorage.getItem("token");
//     fetchEventsPaged(token, "TEACHER", filterType, selectedClubId || deptId, currentPage, pageSize);
//   };

//   const handleRetry = () => {
//     const token = localStorage.getItem("token");
//     if (token) fetchEventsPaged(token, "TEACHER", "GLOBAL", null, 0, pageSize);
//     else setError("No authentication token found. Please login again.");
//   };

//   // ── Client-side filter + sort ──────────────────────────────────
//   const getFilteredEvents = () => {
//     let filtered = [...events];
//     if (searchTerm) {
//       filtered = filtered.filter((e) =>
//         e.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         e.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         e.organizer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         e.creatorName?.toLowerCase().includes(searchTerm.toLowerCase()),
//       );
//     }
//     if (completedFilter !== "all") {
//       filtered = filtered.filter((e) => e.completed === (completedFilter === "completed"));
//     }
//     switch (sortBy) {
//       case "date":       filtered.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));          break;
//       case "popularity": filtered.sort((a, b) => (b.currEnrollments || 0) - (a.currEnrollments || 0)); break;
//       case "enrollment": filtered.sort((a, b) => (b.maxEnrollments  || 0) - (a.maxEnrollments  || 0)); break;
//       case "ratings":    filtered.sort((a, b) => (Number(b.ratings) || 0) - (Number(a.ratings) || 0)); break;
//       default: break;
//     }
//     return filtered;
//   };

//   const filteredEvents = getFilteredEvents();

//   // ── Stats ──────────────────────────────────────────────────────
//   const totalEventsCount   = totalElements;
//   const openEvents         = events.filter((e) => e.enrollmentStatus?.toLowerCase() === "open").length;
//   const totalEnrollments   = events.reduce((sum, e) => sum + (e.currEnrollments || 0), 0);
//   const completedEvents    = events.filter((e) => e.completed === true).length;
//   const notCompletedEvents = events.filter((e) => e.completed === false).length;
//   const departmentEvents   = events.filter((e) => e.targetType?.toUpperCase() === "DEPARTMENT").length;
//   const clubEvents         = events.filter((e) => e.targetType?.toUpperCase() === "CLUB").length;
//   const globalEvents       = events.filter((e) => e.targetType?.toUpperCase() === "GLOBAL").length;

//   // ── Loading / Error screens ────────────────────────────────────
//   if (loading && events.length === 0) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
//         <div className="text-center">
//           <div className="relative">
//             <div className="w-24 h-24 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-6"></div>
//             <div className="absolute inset-0 flex items-center justify-center">
//               <Sparkles className="w-8 h-8 text-white animate-pulse" />
//             </div>
//           </div>
//           <p className="text-white text-xl font-light animate-pulse">Loading amazing events...</p>
//           <p className="text-white/60 text-sm mt-2">Get ready for something special!</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
//         <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 max-w-md w-full text-center border border-white/20">
//           <div className="bg-red-500/20 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
//             <AlertCircle className="w-12 h-12 text-red-400" />
//           </div>
//           <h2 className="text-2xl font-bold text-white mb-2">Oops! Something went wrong</h2>
//           <p className="text-white/80 mb-8">{error}</p>
//           <button
//             onClick={handleRetry}
//             className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
//           >
//             Try Again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // ── Render ─────────────────────────────────────────────────────
//   return (
//     <>
//       <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
//         {/* Animated background blobs */}
//         <div className="fixed inset-0 overflow-hidden pointer-events-none">
//           <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
//           <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"
//             style={{ backgroundColor: "#4CA1AF" }}></div>
//           <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
//         </div>

//         {/* Sticky nav */}
//         <div className="sticky top-0 z-50 w-full bg-white border-b border-gray-100">
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//             <div className="flex items-center h-16">
//               {/* <button
//                 onClick={() => navigate("/dashboard")}
//                 className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#4CA1AF] transition-colors group"
//               >
//                 <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
//                 <span>Back to Dashboard</span>
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
//           {/* Title */}
//           <div className="text-center">
//             <h1 className="text-5xl font-bold mb-4">
//               <span className="bg-clip-text text-transparent"
//                 style={{ background: "linear-gradient(135deg, #4CA1AF, #2C3E50)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
//                 Events Dashboard
//               </span>
//             </h1>
//             <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
//               Manage your created events and discover events from your clubs and department
//             </p>
//           </div>

//           {/* Stats */}
//           <div className="grid grid-cols-1 md:grid-cols-5 gap-4 max-w-5xl mx-auto mb-6">
//             {[
//               { label: "Total Events",      value: totalEventsCount,   colorClass: "text-gray-800",   bgClass: "bg-blue-100",   icon: <Calendar    className="w-6 h-6 text-blue-600"   /> },
//               { label: "Open Events",       value: openEvents,         colorClass: "text-green-600",  bgClass: "bg-green-100",  icon: <CheckCircle  className="w-6 h-6 text-green-600" /> },
//               { label: "Completed",         value: completedEvents,    colorClass: "text-purple-600", bgClass: "bg-purple-100", icon: <CheckSquare  className="w-6 h-6 text-purple-600"/> },
//               { label: "Not Completed",     value: notCompletedEvents, colorClass: "text-orange-600", bgClass: "bg-orange-100", icon: <Square       className="w-6 h-6 text-orange-600" /> },
//               { label: "Total Enrollments", value: totalEnrollments,   colorClass: "text-purple-600", bgClass: "bg-purple-100", icon: <Users        className="w-6 h-6 text-purple-600" /> },
//             ].map(({ label, value, colorClass, bgClass, icon }) => (
//               <div key={label} className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-sm text-gray-600">{label}</p>
//                     <p className={`text-3xl font-bold ${colorClass}`}>{value}</p>
//                   </div>
//                   <div className={`${bgClass} p-3 rounded-lg`}>{icon}</div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Target type breakdown */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-6">
//             {[
//               { icon: <Globe     className="w-5 h-5 text-blue-600 mr-2"   />, label: "Global",     value: globalEvents,     color: "text-blue-600",   bg: "bg-blue-50/80"   },
//               { icon: <Users     className="w-5 h-5 text-purple-600 mr-2" />, label: "Club",       value: clubEvents,       color: "text-purple-600", bg: "bg-purple-50/80" },
//               { icon: <Briefcase className="w-5 h-5 text-green-600 mr-2"  />, label: "Department", value: departmentEvents, color: "text-green-600",  bg: "bg-green-50/80"  },
//             ].map(({ icon, label, value, color, bg }) => (
//               <div key={label} className={`${bg} backdrop-blur-sm p-4 rounded-xl`}>
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center">{icon}<span className="text-sm font-medium text-gray-600">{label}</span></div>
//                   <span className={`text-xl font-bold ${color}`}>{value}</span>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {userDept && (
//             <div className="mt-4 mb-8 text-center">
//               <div className="inline-block bg-white/80 backdrop-blur-sm px-6 py-3 rounded-xl shadow-md">
//                 <div className="flex items-center space-x-2">
//                   <div className="bg-green-100 p-2 rounded-lg"><Users className="w-4 h-4 text-green-600" /></div>
//                   <span className="text-sm font-medium text-gray-600">Department:</span>
//                   <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-sm font-semibold">{userDept}</span>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Create Event button */}
//           <div className="mb-6 flex justify-end">
//             <button
//               onClick={() => navigate("/create-event")}
//               className="px-4 py-2 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
//               style={{ background: "linear-gradient(135deg, #4CA1AF, #2C3E50)" }}
//             >
//               <Plus className="w-4 h-4" /><span>Create Event</span>
//             </button>
//           </div>

//           {/* ── Search & Filter Bar ── */}
//           <div className="mb-8">
//             <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 border border-white/20">
//               <div className="flex flex-col lg:flex-row gap-4">
//                 <div className="flex-1 relative">
//                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 w-5 h-5" />
//                   <input
//                     type="text"
//                     placeholder="Search events by title, description, organizer, or creator..."
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
//                     <Filter className="w-5 h-5" />
//                     <span>Filters</span>
//                     <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showFilters ? "rotate-180" : ""}`} />
//                   </button>
//                   <div className="w-52">
//                     <CustomSelect name="sortBy" value={sortBy} onChange={(e) => setSortBy(e.target.value)} options={sortOptions} placeholder="Sort by..." />
//                   </div>
//                 </div>
//               </div>

//               {/* Active filter chips */}
//               {(filterType !== "GLOBAL" || selectedStatus !== "all" || completedFilter !== "all" || selectedRating !== "all" || selectedClubId || showCreatedEvents) && (
//                 <div className="mt-4 pt-4 border-t border-gray-200">
//                   <div className="flex flex-wrap items-center gap-2">
//                     <span className="text-sm font-medium text-gray-600 mr-2">Active Filters:</span>
//                     {filterType === "DEPARTMENT" && userDept && (
//                       <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center">
//                         Dept: {userDept}
//                         <button onClick={() => handleFilterChange("GLOBAL")} className="ml-2 hover:text-green-900"><X className="w-3 h-3" /></button>
//                       </span>
//                     )}
//                     {filterType === "CLUB" && selectedClubId && (
//                       <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center">
//                         Club: {userClubs.find((c) => c.clubId.toString() === selectedClubId.toString())?.clubName}
//                         <button onClick={() => handleFilterChange("GLOBAL")} className="ml-2 hover:text-purple-900"><X className="w-3 h-3" /></button>
//                       </span>
//                     )}
//                     {showCreatedEvents && (
//                       <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm flex items-center">
//                         My Created Events
//                         <button onClick={() => handleFilterChange("GLOBAL")} className="ml-2 hover:text-orange-900"><X className="w-3 h-3" /></button>
//                       </span>
//                     )}
//                     {selectedStatus !== "all" && (
//                       <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center">
//                         Enrollment: {selectedStatus}
//                         <button onClick={removeStatusFilter} className="ml-2 hover:text-blue-900"><X className="w-3 h-3" /></button>
//                       </span>
//                     )}
//                     {completedFilter !== "all" && (
//                       <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center">
//                         Completed: {completedFilter === "completed" ? "Yes" : "No"}
//                         <button onClick={removeCompletedFilter} className="ml-2 hover:text-purple-900"><X className="w-3 h-3" /></button>
//                       </span>
//                     )}
//                     {selectedRating !== "all" && (
//                       <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm flex items-center">
//                         Rating: {selectedRating}+
//                         <button onClick={removeRatingFilter} className="ml-2 hover:text-amber-900"><X className="w-3 h-3" /></button>
//                       </span>
//                     )}
//                     <button onClick={clearAllFilters} className="px-3 py-1 text-red-600 hover:text-red-800 text-sm font-medium ml-auto">Clear All</button>
//                   </div>
//                 </div>
//               )}

//               {/* Expanded filter panel */}
//               {showFilters && (
//                 <div className="mt-4 pt-4 border-t border-gray-200">
//                   <div className="flex flex-col space-y-4">
//                     <div className="flex flex-wrap items-start gap-3">
//                       <span className="text-sm font-medium text-gray-600 pt-2.5">Filter by:</span>
//                       <div className="flex flex-wrap items-center gap-2 flex-1">
//                         <button
//                           onClick={() => handleFilterChange("CREATED")}
//                           className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${showCreatedEvents ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg" : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"}`}
//                         >My Created Events</button>
//                         <button
//                           onClick={() => handleFilterChange("GLOBAL")}
//                           className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${filterType === "GLOBAL" && !showCreatedEvents ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg" : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"}`}
//                         >Global Events</button>
//                         {userDept && (
//                           <button
//                             onClick={() => handleFilterChange("DEPARTMENT")}
//                             className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${filterType === "DEPARTMENT" ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg" : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"}`}
//                           >{userDept} Events</button>
//                         )}
//                         <button
//                           onClick={() => { setShowClubDropdown(!showClubDropdown); }}
//                           className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${filterType === "CLUB" ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg" : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"}`}
//                         >
//                           <span>Club Events</span>
//                           <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showClubDropdown ? "rotate-180" : ""}`} />
//                         </button>
//                         <div className="w-48">
//                           <CustomSelect name="selectedStatus" value={selectedStatus} onChange={(e) => handleStatusFilterChange(e.target.value)} options={enrollmentStatusOptions} placeholder="Enrollment Status" />
//                         </div>
//                         <div className="w-48">
//                           <CustomSelect name="completedFilter" value={completedFilter} onChange={(e) => handleCompletedFilterChange(e.target.value)} options={completedStatusOptions} placeholder="Completed Status" />
//                         </div>
//                         <div className="w-48">
//                           <CustomSelect name="selectedRating" value={selectedRating} onChange={(e) => handleRatingFilterChange(e.target.value)} options={ratingOptions} placeholder="Ratings" />
//                         </div>
//                       </div>
//                     </div>

//                     {/* Club sub-list */}
//                     {showClubDropdown && (
//                       <div className="mt-2 border border-gray-200 rounded-xl bg-white shadow-lg overflow-hidden">
//                         <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
//                           <h3 className="font-semibold text-gray-700">SELECT A CLUB</h3>
//                         </div>
//                         <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
//                           {userClubs.length > 0 ? userClubs.map((club) => (
//                             <button key={club.clubId} onClick={() => { handleFilterChange("CLUB", club.clubId); setShowClubDropdown(false); }}
//                               className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${selectedClubId === club.clubId.toString() ? "bg-purple-50" : ""}`}>
//                               <div className="flex items-center justify-between mb-2">
//                                 <span className="font-semibold text-gray-800">{club.clubName}</span>
//                                 <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">{club.memberCount || "0"} members</span>
//                               </div>
//                               {club.desc && <p className="text-sm text-gray-600">{club.desc}</p>}
//                             </button>
//                           )) : (
//                             <div className="p-6 text-center"><p className="text-gray-500">No clubs available</p></div>
//                           )}
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Results count */}
//           <div className="mb-4 flex justify-between items-center">
//             <p className="text-sm text-gray-600">
//               Showing <span className="font-semibold">{filteredEvents.length}</span> on this page
//               {totalPages > 1 && (
//                 <> · Page <span className="font-semibold">{currentPage + 1}</span> of <span className="font-semibold">{totalPages}</span></>
//               )}
//               {" "}· <span className="font-semibold">{totalElements}</span> total
//             </p>
//           </div>

//           {/* Loading overlay */}
//           {loading && events.length > 0 && (
//             <div className="flex justify-center mb-4">
//               <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow flex items-center gap-2 text-sm text-gray-600">
//                 <Loader2 className="w-4 h-4 animate-spin text-[#4CA1AF]" />
//                 Loading page {currentPage + 1}…
//               </div>
//             </div>
//           )}

//           {/* Events grid */}
//           {filteredEvents.length === 0 ? (
//             <div className="text-center py-16">
//               <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 max-w-md mx-auto border border-white/20">
//                 <div className="relative">
//                   <div className="absolute inset-0 flex items-center justify-center">
//                     <div className="w-32 h-32 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 animate-ping"></div>
//                   </div>
//                   <Calendar className="w-20 h-20 text-gray-400 mx-auto mb-4 relative z-10" />
//                 </div>
//                 <h3 className="text-2xl font-bold text-gray-800 mb-2">No Events Found</h3>
//                 <p className="text-gray-600 mb-6">
//                   {filterType === "CLUB" && !selectedClubId
//                     ? "Please select a club from the dropdown to view its events."
//                     : showCreatedEvents
//                       ? "You haven't created any events yet. Create your first event to get started!"
//                       : completedFilter !== "all"
//                         ? `No ${completedFilter === "completed" ? "completed" : "not completed"} events visible to you.`
//                         : selectedStatus !== "all"
//                           ? `No ${selectedStatus} enrollment events visible to you.`
//                           : "There are no events available at the moment. Check back later!"}
//                 </p>
//                 <button
//                   onClick={() => navigate("/create-event")}
//                   className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg"
//                 >
//                   Create New Event
//                 </button>
//                 {(filterType !== "GLOBAL" || searchTerm || selectedStatus !== "all" || completedFilter !== "all") && (
//                   <button onClick={clearAllFilters} className="mt-4 px-6 py-3 text-purple-600 hover:text-purple-800 font-medium block mx-auto">
//                     Clear All Filters
//                   </button>
//                 )}
//               </div>
//             </div>
//           ) : (
//             <>
//               <div className="flex justify-center">
//                 <div className={`grid gap-4 w-full ${filteredEvents.length === 1 ? "grid-cols-1 max-w-sm mx-auto" : filteredEvents.length === 2 ? "grid-cols-1 md:grid-cols-2 max-w-2xl mx-auto" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"}`}>
//                   {filteredEvents.map((event, index) => {
//                     const daysUntil       = getDaysUntil(event.dateTime);
//                     const targetTypeColor = getTargetTypeColor(event.targetType);
//                     const isCreator       = event.creatorPrn === userPrn;
//                     const isActive        = activeAttendanceEvents[event.eventId];
//                     const overallRating   = Number(event.ratings);
//                     const hasOverallRating = Number.isFinite(overallRating) && overallRating > 0;

//                     return (
//                       <div key={event.eventId} className="event-card-container animate-[fadeIn_0.5s_ease-in-out]" style={{ animationDelay: `${index * 100}ms` }}>
//                         <div className="event-card">
//                           {/* ── FRONT ── */}
//                           <div className="card-face card-front bg-white/90 backdrop-blur-sm rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-500 border border-white/20">
//                             <div className="relative h-32 p-3 overflow-hidden" style={{ background: "linear-gradient(135deg, #4CA1AF, #2C3E50)" }}>
//                               <div className="absolute inset-0 opacity-10">
//                                 <div className="absolute -top-12 -right-12 w-24 h-24 bg-white rounded-full"></div>
//                                 <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-white rounded-full"></div>
//                               </div>
//                               {daysUntil > 0 && !event.completed && (
//                                 <div className="absolute top-2 left-2 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
//                                   <span className="text-white text-xs font-semibold">{daysUntil} days to go</span>
//                                 </div>
//                               )}
//                               {event.completed && (
//                                 <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full flex items-center shadow-lg">
//                                   <CheckSquare className="w-3 h-3 mr-1" /><span className="text-xs font-semibold">Completed</span>
//                                 </div>
//                               )}
//                               {/* Live attendance badge on front */}
//                               {isActive && !event.completed && (
//                                 <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full flex items-center shadow-lg animate-pulse">
//                                   <span className="w-1.5 h-1.5 bg-white rounded-full mr-1"></span>
//                                   <span className="text-[10px] font-semibold">LIVE</span>
//                                 </div>
//                               )}
//                               {event.completed && hasOverallRating && (
//                                 <div className="absolute bottom-2 left-2 z-10 flex items-center gap-0.5 bg-black/35 backdrop-blur-sm px-1.5 py-0.5 rounded-full">
//                                   <Star className="w-2.5 h-2.5" style={{ fill: "#FBBF24", color: "#FBBF24" }} />
//                                   <span className="text-white text-[10px] font-bold leading-none">
//                                     {overallRating.toFixed(1)}
//                                   </span>
//                                 </div>
//                               )}
//                               <div className="absolute bottom-2 right-2 text-right">
//                                 <h3 className="text-sm font-bold text-white mb-0.5 line-clamp-1">{event.title}</h3>
//                                 <p className="text-[10px] text-white/80 line-clamp-1">{event.description}</p>
//                               </div>
//                             </div>

//                             <div className="p-3 space-y-2">
//                               <div className="flex flex-wrap gap-1">
//                                 <div className="bg-blue-50 px-2 py-0.5 rounded-full text-[10px] font-medium text-blue-600 flex items-center">
//                                   <Calendar className="w-2.5 h-2.5 mr-1" />{formatDateTime(event.dateTime)}
//                                 </div>
//                                 <div className="bg-green-50 px-2 py-0.5 rounded-full text-[10px] font-medium text-green-600 flex items-center">
//                                   <MapPin className="w-2.5 h-2.5 mr-1" />{event.venue}
//                                 </div>
//                               </div>
//                               <div className="grid grid-cols-2 gap-1">
//                                 <div className="bg-gray-50 p-1.5 rounded-lg">
//                                   <p className="text-[8px] text-gray-500">Organizer</p>
//                                   <p className="text-xs font-semibold text-gray-800 flex items-center truncate">
//                                     <User className="w-3 h-3 mr-0.5 text-blue-500 flex-shrink-0" />
//                                     <span className="truncate">{event.organizer}</span>
//                                   </p>
//                                 </div>
//                                 <div className="bg-gray-50 p-1.5 rounded-lg">
//                                   <p className="text-[8px] text-gray-500">Speaker</p>
//                                   <p className="text-xs font-semibold text-gray-800 flex items-center truncate">
//                                     <User className="w-3 h-3 mr-0.5 text-green-500 flex-shrink-0" />
//                                     <span className="truncate">{event.speakerName || event.organizer}</span>
//                                   </p>
//                                 </div>
//                               </div>
//                               <div className="flex items-center justify-between">
//                                 <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${targetTypeColor} flex items-center`}>
//                                   {getTargetTypeIcon(event.targetType)}
//                                   <span className="ml-1 capitalize text-xs">{event.targetType || "N/A"}</span>
//                                 </span>
//                               </div>
//                               {event.completed && hasOverallRating && (
//                                 <div className="flex items-center gap-1">
//                                   <div className="flex items-center gap-0.5">
//                                     {[1, 2, 3, 4, 5].map((s) => (
//                                       <Star
//                                         key={s}
//                                         className="w-2.5 h-2.5"
//                                         style={{
//                                           fill: s <= Math.round(overallRating) ? "#FBBF24" : "#E5E7EB",
//                                           color: s <= Math.round(overallRating) ? "#FBBF24" : "#E5E7EB",
//                                         }}
//                                       />
//                                     ))}
//                                   </div>
//                                   <span className="text-[10px] text-gray-500 font-medium">{overallRating.toFixed(1)}</span>
//                                 </div>
//                               )}
//                               <div className="text-center text-[8px] mt-1 flex items-center justify-center text-purple-600">
//                                 <span className="animate-pulse mr-1 text-[6px]">●</span>
//                                 Hover to view all details
//                               </div>
//                             </div>
//                           </div>

//                           {/* ── BACK ── */}
//                           <div className="card-face card-back rounded-xl shadow-md overflow-hidden p-3 bg-gradient-to-br from-[#4CA1AF] to-[#2C3E50]">
//                             <div className="h-full flex flex-col">
//                               <div className="flex items-center justify-between mb-2">
//                                 <h3 className="text-sm font-bold text-white line-clamp-1 flex-1">{event.title}</h3>
//                                 {event.completed && (
//                                   <span className="bg-green-500 text-white px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center ml-1">
//                                     <CheckSquare className="w-2.5 h-2.5 mr-0.5" />Completed
//                                   </span>
//                                 )}
//                               </div>

//                               <div className="space-y-1.5 overflow-y-auto flex-1 pr-1 custom-scrollbar text-xs">
//                                 <div className="grid grid-cols-2 gap-1">
//                                   <div className="p-1.5 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
//                                     <div className="flex items-center mb-0.5">
//                                       <Calendar className="w-3 h-3 mr-1 text-white/80" />
//                                       <p className="text-[10px] text-white/80">Date</p>
//                                     </div>
//                                     <p className="text-xs font-medium text-white">{formatDateTime(event.dateTime)}</p>
//                                   </div>
//                                   <div className="p-1.5 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
//                                     <div className="flex items-center mb-0.5">
//                                       <Clock className="w-3 h-3 mr-1 text-white/80" />
//                                       <p className="text-[10px] text-white/80">Enrollment Deadline</p>
//                                     </div>
//                                     <p className="text-xs font-medium text-white">{formatDateOnly(event.enrollmentDeadline)}</p>
//                                   </div>
//                                 </div>

//                                 <div className="p-1.5 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
//                                   <p className="text-[10px] text-white/80 mb-1 flex items-center">
//                                     <Star className="w-2.5 h-2.5 mr-1" />Created By
//                                   </p>
//                                   <p className="text-xs font-medium text-white truncate">{event.creatorName || event.organizer || "Unknown"}</p>
//                                 </div>

//                                 {event.enrollmentStatus && (
//                                   <div className="p-1.5 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
//                                     <p className="text-[10px] text-white/80 mb-1 flex items-center">
//                                       <Radio className="w-2.5 h-2.5 mr-1" />Enrollment Status
//                                     </p>
//                                     <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${event.enrollmentStatus?.toUpperCase() === "OPEN" ? "bg-emerald-400/30 text-emerald-100" : "bg-red-400/30 text-red-100"}`}>
//                                       {event.enrollmentStatus?.toUpperCase() === "OPEN" ? "Open" : "Closed"}
//                                     </span>
//                                   </div>
//                                 )}

//                                 {event.targetType?.toUpperCase() === "DEPARTMENT" && event.targetIds?.length > 0 && (
//                                   <div className="p-1.5 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
//                                     <p className="text-[10px] text-white/80 mb-1 flex items-center">
//                                       <Briefcase className="w-2.5 h-2.5 mr-1" />Target Departments
//                                     </p>
//                                     <div className="flex flex-wrap gap-1 mt-1">
//                                       {event.targetIds.map((id) => {
//                                         const dept = departments.find((d) => Number(d.departmentId) === Number(id));
//                                         return (
//                                           <span key={id} className="px-1.5 py-0.5 rounded text-[8px] font-medium text-white" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
//                                             {dept?.name || `Dept ${id}`}
//                                           </span>
//                                         );
//                                       })}
//                                     </div>
//                                   </div>
//                                 )}

//                                 {event.targetType?.toUpperCase() === "CLUB" && event.targetIds?.length > 0 && (
//                                   <div className="p-1.5 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
//                                     <p className="text-[10px] text-white/80 mb-1 flex items-center">
//                                       <Users className="w-2.5 h-2.5 mr-1" />Target Clubs
//                                     </p>
//                                     <div className="flex flex-wrap gap-1 mt-1">
//                                       {event.targetIds.map((id) => {
//                                         const club = allClubs.find((c) => Number(c.clubId) === Number(id)) || userClubs.find((c) => Number(c.clubId) === Number(id));
//                                         return (
//                                           <span key={id} className="px-1.5 py-0.5 rounded text-[8px] font-medium text-white" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
//                                             {club?.clubName || `Club ${id}`}
//                                           </span>
//                                         );
//                                       })}
//                                     </div>
//                                   </div>
//                                 )}

//                                 {/* Enrollment progress bar */}
//                                 <div className="p-1.5 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
//                                   <div className="flex justify-between items-center mb-1">
//                                     <span className="text-[10px] text-white/80">Total Enrollments</span>
//                                     <span className="text-xs text-white">{event.currEnrollments || 0}/{event.maxEnrollments || 0}</span>
//                                   </div>
//                                   <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
//                                     <div className="h-full rounded-full bg-white/60"
//                                       style={{ width: `${Math.min((event.currEnrollments / event.maxEnrollments) * 100, 100)}%` }}></div>
//                                   </div>
//                                 </div>
//                               </div>

//                               {/* ── Card action buttons — Teacher (creator) ── */}
//                               {isCreator && (
//                                 <div className="mt-2 pt-1 border-t border-white/20">
//                                   <div className="flex flex-col gap-1">
//                                     {completionMessage.show && completionMessage.eventId === event.eventId && (
//                                       <div className={`text-center text-[10px] font-medium ${completionMessage.success ? "text-green-400" : "text-red-400"}`}>
//                                         {completionMessage.message}
//                                       </div>
//                                     )}

//                                     {event.completed ? (
//                                       /* Completed: no actions */
//                                       <div className="w-full py-1 rounded-lg text-[10px] font-medium text-center bg-green-500/50 text-white flex items-center justify-center">
//                                         <CheckSquare className="w-2.5 h-2.5 mr-0.5" />Completed
//                                       </div>
//                                     ) : (
//                                       <>
//                                         {/* Row 1: Attendance + Edit + Delete */}
//                                         <div className="flex gap-1">
//                                           {/* Attendance button group */}
//                                           {loadingAttendanceStatus ? (
//                                             <div className="flex-1 px-1.5 py-1 rounded-lg text-[10px] font-medium flex items-center justify-center text-white bg-white/20">
//                                               <Loader2 className="w-2.5 h-2.5 mr-0.5 animate-spin" />...
//                                             </div>
//                                           ) : isActive ? (
//                                             <>
//                                               {/* Stop attendance */}
//                                               <button
//                                                 onClick={(e) => {
//                                                   e.stopPropagation();
//                                                   setConfirmDialog({
//                                                     isOpen: true,
//                                                     title: "Stop Attendance",
//                                                     message: "Are you sure you want to stop attendance? Students will no longer be able to mark attendance.",
//                                                     confirmText: "Stop",
//                                                     variant: "danger",
//                                                     onConfirm: () => { closeConfirm(); handleStopAttendanceForEvent(event.eventId); },
//                                                   });
//                                                 }}
//                                                 className="flex-1 px-1.5 py-1 rounded-lg text-[10px] font-medium transition flex items-center justify-center text-white"
//                                                 style={{ backgroundColor: "rgba(239,68,68,0.6)" }}
//                                                 onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.8)")}
//                                                 onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.6)")}
//                                               >
//                                                 <XCircle className="w-2.5 h-2.5 mr-0.5" />Stop
//                                               </button>
//                                               {/* Show QR */}
//                                               <button
//                                                 onClick={(e) => {
//                                                   e.stopPropagation();
//                                                   setInitialQRData(null);
//                                                   setQrCodeEventId(event.eventId);
//                                                   setShowQRCodeModal(true);
//                                                 }}
//                                                 className="flex-1 px-1.5 py-1 rounded-lg text-[10px] font-medium transition flex items-center justify-center text-white"
//                                                 style={{ backgroundColor: "rgba(156,39,176,0.6)" }}
//                                                 onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(156,39,176,0.8)")}
//                                                 onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(156,39,176,0.6)")}
//                                               >
//                                                 <svg className="w-2.5 h-2.5 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
//                                                 </svg>
//                                                 QR
//                                               </button>
//                                             </>
//                                           ) : (
//                                             /* Start attendance */
//                                             <button
//                                               onClick={(e) => { e.stopPropagation(); setSelectedEventForAttendance(event); setShowAttendancePopup(true); }}
//                                               className="flex-1 px-1.5 py-1 rounded-lg text-[10px] font-medium transition flex items-center justify-center text-white"
//                                               style={{ backgroundColor: "rgba(76, 175, 80, 0.5)" }}
//                                               onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(76, 175, 80, 0.6)")}
//                                               onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(76, 175, 80, 0.5)")}
//                                             >
//                                               <MapPin className="w-2.5 h-2.5 mr-0.5" />Start
//                                             </button>
//                                           )}

//                                           {/* Edit */}
//                                           <button
//                                             onClick={(e) => { e.stopPropagation(); handleEditClick(event); }}
//                                             className="flex-1 px-1.5 py-1 rounded-lg text-[10px] font-medium transition flex items-center justify-center text-white"
//                                             style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
//                                             onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.3)")}
//                                             onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.2)")}
//                                           >
//                                             <Edit className="w-2.5 h-2.5 mr-0.5" />Edit
//                                           </button>

//                                           {/* Delete */}
//                                           <button
//                                             onClick={(e) => {
//                                               e.stopPropagation();
//                                               setConfirmDialog({
//                                                 isOpen: true, title: "Delete Event",
//                                                 message: "Are you sure you want to delete this event? This action cannot be undone.",
//                                                 confirmText: "Delete", variant: "danger",
//                                                 onConfirm: () => { closeConfirm(); handleDeleteEvent(event.eventId); },
//                                               });
//                                             }}
//                                             className="flex-1 px-1.5 py-1 rounded-lg text-[10px] font-medium transition flex items-center justify-center text-white"
//                                             style={{ backgroundColor: "rgba(239,68,68,0.5)" }}
//                                             onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.6)")}
//                                             onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.5)")}
//                                           >
//                                             <Trash2 className="w-2.5 h-2.5 mr-0.5" />Delete
//                                           </button>
//                                         </div>

//                                         {/* Row 2: Complete event */}
//                                         <button
//                                           onClick={(e) => { e.stopPropagation(); handleCompleteEvent(event.eventId); }}
//                                           disabled={completingEventId === event.eventId}
//                                           className="w-full px-1.5 py-1 rounded-lg text-[10px] font-medium transition flex items-center justify-center text-white"
//                                           style={{ backgroundColor: completingEventId === event.eventId ? "rgba(255,255,255,0.1)" : "rgba(34,197,94,0.5)" }}
//                                           onMouseEnter={(e) => { if (completingEventId !== event.eventId) e.currentTarget.style.backgroundColor = "rgba(34,197,94,0.6)"; }}
//                                           onMouseLeave={(e) => { if (completingEventId !== event.eventId) e.currentTarget.style.backgroundColor = "rgba(34,197,94,0.5)"; }}
//                                         >
//                                           {completingEventId === event.eventId ? (
//                                             <><Loader2 className="w-2.5 h-2.5 mr-0.5 animate-spin" />Completing...</>
//                                           ) : (
//                                             <><CheckSquare className="w-2.5 h-2.5 mr-0.5" />Complete Event</>
//                                           )}
//                                         </button>
//                                       </>
//                                     )}
//                                   </div>
//                                 </div>
//                               )}

//                               {/* Non-creator teacher: show completed pill if applicable */}
//                               {!isCreator && event.completed && (
//                                 <div className="mt-2 pt-1 border-t border-white/20">
//                                   <div className="w-full py-1.5 rounded-lg text-xs font-medium text-center bg-gray-500/50 text-white">
//                                     Event Completed
//                                   </div>
//                                 </div>
//                               )}
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               </div>

//               {totalPages > 1 && (
//                 <PaginationControls
//                   currentPage={currentPage}
//                   totalPages={totalPages}
//                   totalElements={totalElements}
//                   pageSize={pageSize}
//                   onPageChange={handlePageChange}
//                   onPageSizeChange={handlePageSizeChange}
//                   loading={loading}
//                 />
//               )}
//             </>
//           )}

//           <div className="mt-12 text-center">
//             <div className="inline-flex items-center space-x-2 text-gray-500 text-sm">
//               <Bell className="w-4 h-4" />
//               <span>Stay tuned for more exciting events!</span>
//               <Gift className="w-4 h-4" />
//             </div>
//           </div>
//         </div>

//         {/* ── Edit Event Modal — standalone component with full map integration ── */}
//         {showEditModal && editingEvent && (
//           <EditEvent
//             event={editingEvent}
//             token={localStorage.getItem("token")}
//             onClose={() => { setShowEditModal(false); setEditingEvent(null); }}
//             onSuccess={() => {
//               const token = localStorage.getItem("token");
//               fetchEventsPaged(token, "TEACHER", filterType, selectedClubId || deptId, currentPage, pageSize);
//               checkAllEventsAttendance();
//             }}
//           />
//         )}

//         <style jsx>{sharedStyles}</style>
//       </div>

//       <StartAttendancePopup
//         isOpen={showAttendancePopup}
//         onClose={() => { setShowAttendancePopup(false); setSelectedEventForAttendance(null); }}
//         event={selectedEventForAttendance}
//         onSuccess={handleAttendanceStartSuccess}
//         token={localStorage.getItem("token")}
//       />

//       <ConfirmDialog
//         isOpen={confirmDialog.isOpen}
//         title={confirmDialog.title}
//         message={confirmDialog.message}
//         confirmText={confirmDialog.confirmText}
//         variant={confirmDialog.variant}
//         onConfirm={confirmDialog.onConfirm}
//         onCancel={closeConfirm}
//       />

//       {/* ── QR Code Modal ── */}
//       {showQRCodeModal && (
//         <div className="fixed inset-0 z-50 overflow-y-auto">
//           <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowQRCodeModal(false)} />
//           <div className="flex min-h-full items-center justify-center p-4">
//             <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl">
//               <QRCodeDisplay
//                 eventId={qrCodeEventId}
//                 token={localStorage.getItem("token")}
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

// export default TeacherEvents;



import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import ConfirmDialog from "../../components/ConfirmDialog";
import CustomSelect from "../../components/CustomSelect";
import StartAttendancePopup from "../../components/StartAttendencePopup";
import EditEvent from "../../components/EditEvent";
import PaginationControls from "../../components/Paginationcontrols";
import ThemedScrollbarStyles from "../../components/ThemedScrollbarStyles";
import {
  getTargetTypeIcon,
  getTargetTypeColor,
  formatDateTime,
  formatDateOnly,
  getDaysUntil,
  isEventVisibleToUser,
  sharedStyles,
} from "../../components/EventUtils";
import {
  Calendar, MapPin, Users, User, Clock, Globe, AlertCircle,
  CheckCircle, Loader2, Radio, Sparkles, Star, Briefcase,
  Plus, X, Edit, Trash2, Filter, ChevronDown, ChevronLeft,
  ChevronRight, Search, Bell, Gift, ArrowLeft, CheckSquare,
  Square, XCircle, Moon, Sun,
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

// // Dark mode colors - ChatGPT style
// const DARK_PRIMARY_COLOR = "#10A37F";
// const DARK_PRIMARY_DARK = "#0E8C6D";
// const DARK_PRIMARY_LIGHT = "rgba(16, 163, 127, 0.15)";
// const DARK_PRIMARY_GRADIENT = "linear-gradient(135deg, #10A37F 0%, #0E8C6D 100%)";
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

// ─── QRCodeDisplay with theme support ─────────────────────────────────────────
const QRCodeDisplay = ({ eventId, token, initialQRData, onClose, onAttendanceEnd, theme }) => {
  const [qrData,            setQrData           ] = useState(initialQRData ?? null);
  const [loading,           setLoading          ] = useState(!initialQRData);
  const [error,             setError            ] = useState(null);
  const [timeLeft,          setTimeLeft         ] = useState(initialQRData?.refreshInSeconds ?? 0);
  const [attendanceActive,  setAttendanceActive ] = useState(true);
  const [eventDetails,      setEventDetails     ] = useState(null);
  const [refreshInterval,   setRefreshInterval  ] = useState(initialQRData?.refreshInSeconds ?? 120);
  const [stopLoading,       setStopLoading      ] = useState(false);
  const [stopError,         setStopError        ] = useState(null);

  const qrTimerRef        = useRef(null);
  const statusCheckRef    = useRef(null);
  const countdownRef      = useRef(null);
  const windowEndTimerRef = useRef(null);

  const authHeaders = () => ({ Authorization: `Bearer ${token}`, "Content-Type": "application/json" });

  const handleStopAttendance = async () => {
    setStopLoading(true);
    setStopError(null);
    try {
      const res = await axios.post(
        `${BASE_URL}/api/attendance/stop/${eventId}`, {},
        { headers: authHeaders() }
      );
      if (res.data?.success) {
        if (qrTimerRef.current)        clearTimeout(qrTimerRef.current);
        if (statusCheckRef.current)    clearInterval(statusCheckRef.current);
        if (countdownRef.current)      clearInterval(countdownRef.current);
        if (windowEndTimerRef.current) clearTimeout(windowEndTimerRef.current);
        setAttendanceActive(false);
        if (onAttendanceEnd) onAttendanceEnd();
      } else {
        setStopError(res.data?.message || "Failed to stop attendance");
      }
    } catch (err) {
      setStopError(err.response?.data?.message || "Error stopping attendance");
    } finally {
      setStopLoading(false);
    }
  };

  const scheduleWindowEndTimer = useCallback((windowEnd) => {
    if (windowEndTimerRef.current) clearTimeout(windowEndTimerRef.current);
    if (!windowEnd) return;
    const msUntilEnd = new Date(windowEnd) - Date.now();
    if (msUntilEnd <= 0) return;
    windowEndTimerRef.current = setTimeout(() => {
      setAttendanceActive(false);
      if (qrTimerRef.current)     clearTimeout(qrTimerRef.current);
      if (statusCheckRef.current) clearInterval(statusCheckRef.current);
      if (countdownRef.current)   clearInterval(countdownRef.current);
      if (onAttendanceEnd) onAttendanceEnd();
    }, msUntilEnd);
  }, [onAttendanceEnd]);

  const fetchEventDetails = useCallback(async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/events/getById/${eventId}`,
        { headers: authHeaders() }
      );
      const data = res.data?.data;
      setEventDetails(data);
      scheduleWindowEndTimer(data?.attendanceWindowEnd);
      return data?.attendanceActive ?? false;
    } catch (err) {
      console.error("Error fetching event details:", err);
      return true;
    }
  }, [eventId, token, scheduleWindowEndTimer]);

  const fetchQRCode = useCallback(async () => {
    try {
      setError(null);
      const res = await axios.get(
        `${BASE_URL}/api/attendance/qr-code/${eventId}`,
        { headers: authHeaders() }
      );
      if (res.data?.success) {
        const newQr = res.data.data;
        setQrData(newQr);
        const secs = newQr.refreshInSeconds || 120;
        setRefreshInterval(secs);
        setTimeLeft(secs);
        if (qrTimerRef.current) clearTimeout(qrTimerRef.current);
        qrTimerRef.current = setTimeout(fetchQRCode, secs * 1000);
      } else {
        setError("Failed to fetch QR code");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching QR code");
    } finally {
      setLoading(false);
    }
  }, [eventId, token]);

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      if (initialQRData) {
        const secs = initialQRData.refreshInSeconds || 120;
        setRefreshInterval(secs);
        setTimeLeft(secs);
        if (qrTimerRef.current) clearTimeout(qrTimerRef.current);
        qrTimerRef.current = setTimeout(fetchQRCode, secs * 1000);
        fetchEventDetails();
      } else {
        const isActive = await fetchEventDetails();
        if (!mounted) return;
        if (!isActive) {
          setAttendanceActive(false);
          setLoading(false);
          return;
        }
        if (mounted) await fetchQRCode();
      }

      statusCheckRef.current = setInterval(async () => {
        const isActive = await fetchEventDetails();
        if (!mounted) return;
        if (!isActive) {
          setAttendanceActive(false);
          if (qrTimerRef.current)     clearTimeout(qrTimerRef.current);
          if (statusCheckRef.current) clearInterval(statusCheckRef.current);
          if (countdownRef.current)   clearInterval(countdownRef.current);
          if (onAttendanceEnd) onAttendanceEnd();
        }
      }, 10000);
    };

    initialize();

    return () => {
      mounted = false;
      if (qrTimerRef.current)        clearTimeout(qrTimerRef.current);
      if (statusCheckRef.current)    clearInterval(statusCheckRef.current);
      if (countdownRef.current)      clearInterval(countdownRef.current);
      if (windowEndTimerRef.current) clearTimeout(windowEndTimerRef.current);
    };
  }, [eventId]);

  useEffect(() => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    if (timeLeft <= 0) return;
    countdownRef.current = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? refreshInterval : prev - 1));
    }, 1000);
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, [refreshInterval]);

  useEffect(() => {
    if (qrData?.refreshInSeconds) {
      setRefreshInterval(qrData.refreshInSeconds);
      setTimeLeft(qrData.refreshInSeconds);
    }
  }, [qrData]);

  const getWindowTimeRemaining = () => {
    if (!eventDetails?.attendanceWindowEnd) return null;
    const remaining = new Date(eventDetails.attendanceWindowEnd) - new Date();
    if (remaining <= 0) return null;
    const m = Math.floor(remaining / 60000);
    const s = Math.floor((remaining % 60000) / 1000);
    return `${m}m ${s}s`;
  };

  if (!attendanceActive) {
    return (
      <div className="text-center py-8 p-6">
        <div className="rounded-lg p-6" style={{ background: theme.accentSoft }}>
          <AlertCircle className="w-12 h-12 mx-auto mb-3" style={{ color: theme.primaryColor }} />
          <h3 className="text-lg font-semibold mb-2" style={{ color: theme.textPrimary }}>Attendance Session Ended</h3>
          <p className="mb-4" style={{ color: theme.textSecondary }}>The attendance session for this event is no longer active.</p>
          <button onClick={onClose} className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition" style={{ background: theme.primaryGradient }}>Close</button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12 p-6">
        <Loader2 className="w-12 h-12 animate-spin mx-auto" style={{ color: theme.primaryColor }} />
        <p className="mt-4" style={{ color: theme.textSecondary }}>Loading QR code...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 p-6">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={() => { setLoading(true); fetchQRCode(); }} className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition" style={{ background: theme.primaryGradient }}>Retry</button>
      </div>
    );
  }

  const windowTimeRemaining = getWindowTimeRemaining();

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-3 mb-6" style={{ borderColor: theme.borderColor }}>
        <h2 className="text-lg font-semibold" style={{ color: theme.primaryColor }}>
          Attendance QR Code
        </h2>
        <div className="flex items-center gap-3">
          {stopError && <p className="text-xs text-red-500">{stopError}</p>}
          <button
            onClick={handleStopAttendance}
            disabled={stopLoading}
            className="px-3 py-1.5 text-white text-sm rounded-lg transition flex items-center gap-1.5 disabled:opacity-50"
            style={{ background: "#ef4444" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#dc2626")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#ef4444")}
          >
            {stopLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
            Stop Attendance
          </button>
          <button onClick={onClose} className="text-2xl leading-none" style={{ color: theme.textMuted }}>&times;</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Left — QR image */}
        <div className="md:col-span-3 text-center">
          <div className="p-4 rounded-lg mb-4 text-white flex justify-between items-center" style={{ background: theme.primaryGradient }}>
            <span className="text-sm">Next QR refresh in:</span>
            <span className="text-2xl font-bold tabular-nums">{timeLeft}s</span>
          </div>

          {windowTimeRemaining && (
            <div className="mb-3 px-3 py-1.5 border rounded-lg text-sm flex items-center justify-center gap-2"
              style={{ background: theme.accentSoft, borderColor: theme.primaryLight, color: theme.primaryColor }}>
              <Clock className="w-4 h-4" />
              Window closes in: <span className="font-semibold">{windowTimeRemaining}</span>
            </div>
          )}

          {qrData?.qrToken && (
            <>
              <div className="p-4 rounded-xl shadow-md inline-block border" style={{ background: theme.bgCard, borderColor: theme.borderColor }}>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(qrData.qrToken)}`}
                  className="w-60 h-60"
                  alt="Attendance QR Code"
                />
              </div>
              <p className="text-xs mt-2" style={{ color: theme.textMuted }}>
                Expires: {new Date(qrData.expiresAt).toLocaleTimeString()}
              </p>
            </>
          )}
        </div>

        {/* Right — Token + Instructions */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <div className="p-4 rounded-lg border" style={{ background: theme.accentSoft, borderColor: theme.borderColor }}>
            <p className="text-sm font-medium mb-2" style={{ color: theme.textSecondary }}>Manual Entry Token:</p>
            <code className="bg-gray-800 text-green-400 p-3 rounded-lg block break-all text-xs leading-relaxed">
              {qrData?.qrToken}
            </code>
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

          <button onClick={onClose} className="mt-auto px-6 py-2 border rounded-lg transition-colors self-end"
            style={{ borderColor: theme.borderColor, color: theme.textSecondary, background: theme.accentSoft }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── TeacherEvents ─────────────────────────────────────────────────────────────
const TeacherEvents = () => {
  const navigate = useNavigate();

  // ── Theme state ───────────────────────────────────────────────────────────
  const { isDarkMode } = useTheme();

  // Get current theme colors
  const theme = {
    primaryColor: isDarkMode ? DARK_PRIMARY_COLOR : LIGHT_PRIMARY_COLOR,
    primaryDark: isDarkMode ? DARK_PRIMARY_DARK : LIGHT_PRIMARY_DARK,
    primaryLight: isDarkMode ? DARK_PRIMARY_LIGHT : LIGHT_PRIMARY_LIGHT,
    primaryGradient: isDarkMode ? DARK_PRIMARY_GRADIENT : LIGHT_PRIMARY_GRADIENT,
    cardHeaderGradient: isDarkMode ? "linear-gradient(135deg, #A21CAF 0%, #701A75 100%)" : LIGHT_PRIMARY_GRADIENT, // Slightly darker fuchsia shade
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

  // Save theme preference to localStorage
  useEffect(() => {
    localStorage.setItem("teacherEventsTheme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  // ── Core state ─────────────────────────────────────────────────
  const [events,        setEvents       ] = useState([]);
  const [allEvents,     setAllEvents    ] = useState([]);
  const [loading,       setLoading      ] = useState(true);
  const [error,         setError        ] = useState(null);
  const [userPrn,       setUserPrn      ] = useState("");
  const [userDept,      setUserDept     ] = useState("");
  const [deptId,        setDeptId       ] = useState(null);
  const [departments,   setDepartments  ] = useState([]);
  const [userClubs,     setUserClubs    ] = useState([]);
  const [allClubs,      setAllClubs     ] = useState([]);
  const [userMap,       setUserMap      ] = useState({});

  // ── Filter / UI state ──────────────────────────────────────────
  const [filterType,       setFilterType      ] = useState("GLOBAL");
  const [selectedClubId,   setSelectedClubId  ] = useState("");
  const [searchTerm,       setSearchTerm      ] = useState("");
  const [showFilters,      setShowFilters     ] = useState(false);
  const [sortBy,           setSortBy          ] = useState("date");
  const [showClubDropdown, setShowClubDropdown] = useState(false);
  const [showCreatedEvents,setShowCreatedEvents] = useState(false);
  const [selectedStatus,   setSelectedStatus  ] = useState("all");
  const [completedFilter,  setCompletedFilter ] = useState("all");
  const [selectedRating,   setSelectedRating  ] = useState("all");

  // ── Pagination ──────────────────────────────────────────────────
  const [currentPage,    setCurrentPage  ] = useState(0);
  const [pageSize,       setPageSize     ] = useState(10);
  const [totalPages,     setTotalPages   ] = useState(0);
  const [totalElements,  setTotalElements] = useState(0);

  // ── Attendance popup ────────────────────────────────────────────
  const [showAttendancePopup,         setShowAttendancePopup        ] = useState(false);
  const [selectedEventForAttendance,  setSelectedEventForAttendance ] = useState(null);

  // ── Attendance active tracking ──────────────────────────────────
  const [activeAttendanceEvents,    setActiveAttendanceEvents   ] = useState({});
  const [loadingAttendanceStatus,   setLoadingAttendanceStatus  ] = useState(false);

  // ── QR Modal ────────────────────────────────────────────────────
  const [showQRCodeModal, setShowQRCodeModal] = useState(false);
  const [qrCodeEventId,   setQrCodeEventId  ] = useState(null);
  const [initialQRData,   setInitialQRData  ] = useState(null);

  // ── Edit modal ──────────────────────────────────────────────────
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEvent,  setEditingEvent ] = useState(null);

  // ── Complete event ──────────────────────────────────────────────
  const [completingEventId, setCompletingEventId] = useState(null);
  const [completionMessage, setCompletionMessage] = useState({
    show: false, eventId: null, success: false, message: "",
  });

  // ── Confirm dialog ──────────────────────────────────────────────
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false, title: "", message: "", variant: "primary",
    confirmText: "Confirm", onConfirm: () => {},
  });
  const closeConfirm = () => setConfirmDialog((p) => ({ ...p, isOpen: false }));

  // ── CustomSelect option sets ────────────────────────────────────
  const enrollmentStatusOptions = [
    { value: "all",    label: "Enrollment Status" },
    { value: "open",   label: "Open"              },
    { value: "closed", label: "Closed"            },
  ];
  const completedStatusOptions = [
    { value: "all",          label: "Completed Status" },
    { value: "completed",    label: "Completed"        },
    { value: "notCompleted", label: "Not Completed"    },
  ];
  const sortOptions = [
    { value: "date",       label: "Sort by Date"       },
    { value: "popularity", label: "Sort by Popularity" },
    { value: "enrollment", label: "Sort by Capacity"   },
    { value: "ratings",    label: "Sort by Ratings"    },
  ];
  const ratingOptions = [
    { value: "all", label: "Ratings" },
    { value: "1",   label: "1+"      },
    { value: "2",   label: "2+"      },
    { value: "3",   label: "3+"      },
    { value: "4",   label: "4+"      },
    { value: "5",   label: "5"       },
  ];

  // ── Init ────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      const user  = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("token");
      if (!token) { setError("No authentication token found. Please login again."); setLoading(false); return; }
      const prn = user?.prn;
      if (prn) setUserPrn(prn);
      fetchDepartments(token);
      fetchUserProfile(token);
      fetchUserClubs(token);
      fetchAllClubs(token);
      fetchEventsPaged(token, "TEACHER", "GLOBAL", null, 0, 12);
    };
    init();
  }, []);

  // ── Attendance: check one event ─────────────────────────────────
  const checkAttendanceActive = async (eventId) => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(
        `${BASE_URL}/api/events/getById/${eventId}`,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      return res.data?.data?.attendanceActive || false;
    } catch (err) {
      console.error(`Error checking attendance for event ${eventId}:`, err);
      return false;
    }
  };

  // ── Attendance: check all current-page events ───────────────────
  const checkAllEventsAttendance = useCallback(async () => {
    if (!events || events.length === 0) return;
    setLoadingAttendanceStatus(true);
    const statusMap = {};
    await Promise.all(
      events.map(async (event) => {
        statusMap[event.eventId] = await checkAttendanceActive(event.eventId);
      })
    );
    setActiveAttendanceEvents(statusMap);
    setLoadingAttendanceStatus(false);
  }, [events]);

  useEffect(() => {
    if (events && events.length > 0) {
      checkAllEventsAttendance();
    }
  }, [events]);

  // ── Attendance: stop ────────────────────────────────────────────
  const handleStopAttendanceForEvent = async (eventId) => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.post(
        `${BASE_URL}/api/attendance/stop/${eventId}`, {},
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      if (res.data?.success) {
        checkAllEventsAttendance();
        fetchEventsPaged(token, "TEACHER", filterType, selectedClubId || deptId, currentPage, pageSize);
      } else {
        alert(res.data?.message || "Failed to stop attendance");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Error stopping attendance");
    }
  };

  // ── API helpers ─────────────────────────────────────────────────
  const fetchUserProfile = async (token) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const prn  = user?.prn;
      if (!prn) return;
      setUserPrn(prn);
      const response = await axios.get(
        `${BASE_URL}/api/profiles/prn/${prn}`,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } },
      );
      if (response.data.success) {
        const profile = response.data.data;
        setUserDept(profile.department);
        fetchDepartmentId(token, profile.department);
      }
    } catch (err) { console.error("Error fetching user profile:", err); }
  };

  const fetchDepartments = async (token) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/department`,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } });
      if (response.data.success) setDepartments(response.data.data);
    } catch (err) { console.error("Error fetching departments:", err); }
  };

  const fetchDepartmentId = async (token, deptName) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/department`,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } });
      if (response.data.success) {
        const dept = response.data.data.find((d) => d.name === deptName);
        if (dept) setDeptId(dept.departmentId);
      }
    } catch (err) { console.error("Error fetching department ID:", err); }
  };

  const fetchUserClubs = async (token) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/user-clubs/getMyClubs`,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } });
      if (response.data.success) setUserClubs(response.data.data);
    } catch (err) { console.error("Error fetching user clubs:", err); }
  };

  const fetchAllClubs = async (token) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/clubs`,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } });
      if (response.data.success) setAllClubs(response.data.data);
    } catch (err) { console.error("Error fetching all clubs:", err); }
  };

  const fetchUserNameByPrn = async (token, prn) => {
    if (userMap[prn]) return userMap[prn];
    try {
      const response = await axios.get(
        `${BASE_URL}/api/profiles/prn/${prn}`,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } },
      );
      if (response.data.success) {
        const name = response.data.data.name || response.data.data.fullName || prn;
        setUserMap((prev) => ({ ...prev, [prn]: name }));
        return name;
      }
    } catch (err) { console.error(`Error fetching user for PRN ${prn}:`, err); }
    return prn;
  };

  const enrichWithCreatorNames = async (token, list) => {
    if (!list.length) return list;
    return Promise.all(
      list.map(async (event) => {
        if (!event.creatorName || event.creatorName.match(/^\d+$/)) {
          const creatorName = await fetchUserNameByPrn(token, event.creatorPrn);
          return { ...event, creatorName };
        }
        return event;
      }),
    );
  };

  const applyPageResponse = (data) => {
    setTotalPages(data.totalPages ?? 0);
    setTotalElements(data.totalElements ?? 0);
    setCurrentPage(data.pageNumber ?? 0);
  };

  // For endpoints where visibility is enforced client-side, compute totals
  // from only events the current teacher can actually see.
  const getVisibleTotalForPagedEndpoint = async (url, headers, currentPrn, pageSizeForCount = 200) => {
    let page = 0;
    let totalPagesFromApi = 1;
    let visibleTotal = 0;

    while (page < totalPagesFromApi) {
      const response = await axios.get(url, {
        headers,
        params: { page, size: pageSizeForCount },
      });

      if (!response.data?.success) break;

      const data = response.data.data;
      const content = data?.content || [];

      visibleTotal += content.filter((event) =>
        isEventVisibleToUser(event, deptId, userClubs, currentPrn, true),
      ).length;

      totalPagesFromApi = data?.totalPages ?? 1;
      page += 1;
    }

    return visibleTotal;
  };

  // ── Core paginated fetcher ─────────────────────────────────────
  const fetchEventsPaged = async (token, role, filter = "GLOBAL", targetId = null, page = 0, size = pageSize) => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
      const params  = { page, size };
      let response;

      if (filter === "GLOBAL") {
        response = await axios.get(
          `${BASE_URL}/api/events/getByTargetType/GLOBAL/paged`,
          { headers, params },
        );
      } else if (filter === "CREATED") {
        response = await axios.get(
          `${BASE_URL}/api/events/myEvents/paged`,
          { headers, params },
        );
      } else if (filter === "DEPARTMENT" && targetId) {
        response = await axios.get(
          `${BASE_URL}/api/events/targetData/DEPARTMENT/${targetId}/paged`,
          { headers, params },
        );
      } else if (filter === "CLUB" && targetId) {
        response = await axios.get(
          `${BASE_URL}/api/events/targetData/CLUB/${targetId}/paged`,
          { headers, params },
        );
      }

      if (response?.data?.success) {
        const pageData = response.data.data;
        let fetched = pageData.content || [];
        fetched = await enrichWithCreatorNames(token, fetched);
        setEvents(fetched);
        setAllEvents(fetched);
        applyPageResponse(pageData);
      }
    } catch (err) {
      console.error("Error fetching events:", err);
      setError(err.message || "An error occurred while fetching events");
    } finally {
      setLoading(false);
    }
  };

  const fetchEventsByCompletedStatusPaged = async (completed, page = 0, size = pageSize) => {
    try {
      setLoading(true);
      const token      = localStorage.getItem("token");
      const user       = JSON.parse(localStorage.getItem("user"));
      const currentPrn = user?.prn || userPrn;
      const headers    = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
      const endpoint   = `${BASE_URL}/api/events/endEvent/${completed}/paged`;
      const response   = await axios.get(
        endpoint,
        { headers, params: { page, size } },
      );
      if (response.data.success) {
        const pageData = response.data.data;
        let fetched = pageData.content || [];
        fetched = await enrichWithCreatorNames(token, fetched);
        fetched = fetched.filter((event) =>
          isEventVisibleToUser(event, deptId, userClubs, currentPrn, true),
        );
        setEvents(fetched);
        setAllEvents(fetched);

        const visibleTotal = await getVisibleTotalForPagedEndpoint(endpoint, headers, currentPrn);
        setTotalElements(visibleTotal);
        setTotalPages(Math.ceil(visibleTotal / size));
        setCurrentPage(pageData.pageNumber ?? 0);
      }
    } catch (err) {
      console.error("Error fetching events by completed status:", err);
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const fetchEventsByDeadlinePaged = async (status, page = 0, size = pageSize) => {
    try {
      setLoading(true);
      const token      = localStorage.getItem("token");
      const user       = JSON.parse(localStorage.getItem("user"));
      const currentPrn = user?.prn || userPrn;
      const headers    = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
      const endpoint   = `${BASE_URL}/api/events/enrollment/${status}/paged`;
      const response   = await axios.get(
        endpoint,
        { headers, params: { page, size } },
      );
      if (response.data.success) {
        const pageData = response.data.data;
        let fetched = pageData.content || [];
        fetched = await enrichWithCreatorNames(token, fetched);
        fetched = fetched.filter((event) =>
          isEventVisibleToUser(event, deptId, userClubs, currentPrn, true),
        );
        setEvents(fetched);
        setAllEvents(fetched);

        const visibleTotal = await getVisibleTotalForPagedEndpoint(endpoint, headers, currentPrn);
        setTotalElements(visibleTotal);
        setTotalPages(Math.ceil(visibleTotal / size));
        setCurrentPage(pageData.pageNumber ?? 0);
      }
    } catch (err) {
      console.error("Error fetching events by deadline:", err);
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const fetchEventsByRatingsPaged = async (rating, page = 0, size = pageSize) => {
    try {
      setLoading(true);
      const token      = localStorage.getItem("token");
      const user       = JSON.parse(localStorage.getItem("user"));
      const currentPrn = user?.prn || userPrn;
      const headers    = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
      const endpoint   = `${BASE_URL}/api/events/ratings/${rating}/paged`;
      const response   = await axios.get(
        endpoint,
        { headers, params: { page, size } },
      );
      if (response.data.success) {
        const pageData = response.data.data;
        let fetched = pageData.content || [];
        fetched = await enrichWithCreatorNames(token, fetched);
        fetched = fetched.filter((event) =>
          isEventVisibleToUser(event, deptId, userClubs, currentPrn, true),
        );
        setEvents(fetched);
        setAllEvents(fetched);

        const visibleTotal = await getVisibleTotalForPagedEndpoint(endpoint, headers, currentPrn);
        setTotalElements(visibleTotal);
        setTotalPages(Math.ceil(visibleTotal / size));
        setCurrentPage(pageData.pageNumber ?? 0);
      }
    } catch (err) {
      console.error("Error fetching events by ratings:", err);
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // ── Page change ────────────────────────────────────────────────
  const handlePageChange = (newPage) => {
    if (newPage < 0 || newPage >= totalPages) return;
    setCurrentPage(newPage);
    const token = localStorage.getItem("token");
    if (completedFilter !== "all") {
      fetchEventsByCompletedStatusPaged(completedFilter === "completed", newPage, pageSize);
    } else if (selectedStatus !== "all") {
      fetchEventsByDeadlinePaged(selectedStatus.toUpperCase(), newPage, pageSize);
    } else if (selectedRating !== "all") {
      fetchEventsByRatingsPaged(Number(selectedRating), newPage, pageSize);
    } else {
      fetchEventsPaged(token, "TEACHER", filterType, selectedClubId || deptId, newPage, pageSize);
    }
    window.scrollTo({ top: 400, behavior: "smooth" });
  };

  // ── Filter handlers ────────────────────────────────────────────
  const handleFilterChange = async (newFilterType, targetId = null) => {
    const token = localStorage.getItem("token");
    setFilterType(newFilterType);
    setCurrentPage(0);

    const resetFilters = () => {
      setShowCreatedEvents(false);
      setSelectedClubId("");
      setShowClubDropdown(false);
      setCompletedFilter("all");
      setSelectedStatus("all");
      setSelectedRating("all");
    };

    if (newFilterType === "CREATED") {
      resetFilters();
      setShowCreatedEvents(true);
    } else if (newFilterType === "CLUB") {
      if (targetId) { resetFilters(); setSelectedClubId(targetId); }
      else { setShowClubDropdown(true); return; }
    } else {
      resetFilters();
    }
    await fetchEventsPaged(token, "TEACHER", newFilterType, targetId || deptId, 0, pageSize);
  };

  const handleCompletedFilterChange = async (value) => {
    setCompletedFilter(value);
    setSelectedRating("all");
    setCurrentPage(0);
    if (value === "all") {
      const token = localStorage.getItem("token");
      await fetchEventsPaged(token, "TEACHER", filterType, selectedClubId || deptId, 0, pageSize);
    } else {
      await fetchEventsByCompletedStatusPaged(value === "completed", 0, pageSize);
    }
  };

  const handleStatusFilterChange = async (value) => {
    setSelectedStatus(value);
    setSelectedRating("all");
    setCurrentPage(0);
    if (value === "all") {
      const token = localStorage.getItem("token");
      await fetchEventsPaged(token, "TEACHER", filterType, selectedClubId || deptId, 0, pageSize);
    } else {
      await fetchEventsByDeadlinePaged(value.toUpperCase(), 0, pageSize);
    }
  };

  const handleRatingFilterChange = async (value) => {
    setSelectedRating(value);
    setSelectedStatus("all");
    setCompletedFilter("all");
    setCurrentPage(0);
    if (value === "all") {
      const token = localStorage.getItem("token");
      await fetchEventsPaged(token, "TEACHER", filterType, selectedClubId || deptId, 0, pageSize);
    } else {
      await fetchEventsByRatingsPaged(Number(value), 0, pageSize);
    }
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedStatus("all");
    setCompletedFilter("all");
    setSelectedRating("all");
    setFilterType("GLOBAL");
    setSelectedClubId("");
    setShowCreatedEvents(false);
    setCurrentPage(0);
    const token = localStorage.getItem("token");
    fetchEventsPaged(token, "TEACHER", "GLOBAL", null, 0, pageSize);
  };

  const removeStatusFilter = async () => {
    setSelectedStatus("all");
    setCurrentPage(0);
    const token = localStorage.getItem("token");
    await fetchEventsPaged(token, "TEACHER", filterType, selectedClubId || deptId, 0, pageSize);
  };

  const removeCompletedFilter = () => {
    setCompletedFilter("all");
    setCurrentPage(0);
    const token = localStorage.getItem("token");
    fetchEventsPaged(token, "TEACHER", filterType, selectedClubId || deptId, 0, pageSize);
  };

  const removeRatingFilter = () => {
    setSelectedRating("all");
    setCurrentPage(0);
    const token = localStorage.getItem("token");
    fetchEventsPaged(token, "TEACHER", filterType, selectedClubId || deptId, 0, pageSize);
  };

  // ── Teacher actions ────────────────────────────────────────────
  const handleEditClick = (event) => {
    setEditingEvent({ ...event });
    setShowEditModal(true);
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${BASE_URL}/api/events/deleteEvent/${eventId}`,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } },
      );
      alert("Event deleted successfully!");
      fetchEventsPaged(token, "TEACHER", "GLOBAL", null, 0, pageSize);
    } catch (err) { alert(err.response?.data?.message || "Failed to delete event"); }
  };

  const handleCompleteEvent = async (eventId) => {
    try {
      setCompletingEventId(eventId);
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${BASE_URL}/api/events/completeEvent/${eventId}`, {},
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } },
      );
      if (response.data.success) {
        setEvents((prev)    => prev.map((e) => e.eventId === eventId ? { ...e, completed: true } : e));
        setAllEvents((prev) => prev.map((e) => e.eventId === eventId ? { ...e, completed: true } : e));
        setCompletionMessage({ show: true, eventId, success: true, message: "Event marked as completed successfully!" });
      } else {
        setCompletionMessage({ show: true, eventId, success: false, message: response.data.message || "Failed to mark event as completed" });
      }
    } catch (err) {
      setCompletionMessage({ show: true, eventId, success: false, message: err.response?.data?.message || "Error completing event." });
    } finally {
      setCompletingEventId(null);
      setTimeout(() => setCompletionMessage({ show: false, eventId: null, success: false, message: "" }), 3000);
    }
  };

  // ── Attendance start success — capture QR data, open modal ─────
  const handleAttendanceStartSuccess = (apiResponse) => {
    const qrData = apiResponse?.data ?? null;
    if (selectedEventForAttendance) {
      setQrCodeEventId(selectedEventForAttendance.eventId);
      setInitialQRData(qrData);
      setShowQRCodeModal(true);
    }
    checkAllEventsAttendance();
    const token = localStorage.getItem("token");
    fetchEventsPaged(token, "TEACHER", filterType, selectedClubId || deptId, currentPage, pageSize);
  };

  const handleRetry = () => {
    const token = localStorage.getItem("token");
    if (token) fetchEventsPaged(token, "TEACHER", "GLOBAL", null, 0, pageSize);
    else setError("No authentication token found. Please login again.");
  };

  // ── Client-side filter + sort ──────────────────────────────────
  const getFilteredEvents = () => {
    let filtered = [...events];
    if (searchTerm) {
      filtered = filtered.filter((e) =>
        e.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.organizer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.creatorName?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }
    if (completedFilter !== "all") {
      filtered = filtered.filter((e) => e.completed === (completedFilter === "completed"));
    }
    switch (sortBy) {
      case "date":       filtered.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));          break;
      case "popularity": filtered.sort((a, b) => (b.currEnrollments || 0) - (a.currEnrollments || 0)); break;
      case "enrollment": filtered.sort((a, b) => (b.maxEnrollments  || 0) - (a.maxEnrollments  || 0)); break;
      case "ratings":    filtered.sort((a, b) => (Number(b.ratings) || 0) - (Number(a.ratings) || 0)); break;
      default: break;
    }
    return filtered;
  };

  const filteredEvents = getFilteredEvents();

  // ── Stats ──────────────────────────────────────────────────────
  const totalEventsCount   = totalElements;
  const openEvents         = events.filter((e) => e.enrollmentStatus?.toLowerCase() === "open").length;
  const totalEnrollments   = events.reduce((sum, e) => sum + (e.currEnrollments || 0), 0);
  const completedEvents    = events.filter((e) => e.completed === true).length;
  const notCompletedEvents = events.filter((e) => e.completed === false).length;
  const departmentEvents   = events.filter((e) => e.targetType?.toUpperCase() === "DEPARTMENT").length;
  const clubEvents         = events.filter((e) => e.targetType?.toUpperCase() === "CLUB").length;
  const globalEvents       = events.filter((e) => e.targetType?.toUpperCase() === "GLOBAL").length;

  // ── Loading / Error screens ────────────────────────────────────
  if (loading && events.length === 0) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center transition-colors duration-300"
        style={{ background: theme.bgGradient }}
      >
        <div className="text-center">
          <div className="relative">
            <div className="w-24 h-24 border-4 rounded-full animate-spin mx-auto mb-6" style={{ borderColor: `${theme.primaryColor}20`, borderTopColor: theme.primaryColor }}></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-8 h-8 animate-pulse" style={{ color: theme.primaryColor }} />
            </div>
          </div>
          <p className="text-xl font-light animate-pulse" style={{ color: theme.textPrimary }}>Loading amazing events...</p>
          <p className="text-sm mt-2" style={{ color: theme.textMuted }}>Get ready for something special!</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
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
          <h2 className="text-2xl font-bold mb-2" style={{ color: theme.textPrimary }}>Oops! Something went wrong</h2>
          <p className="mb-8" style={{ color: theme.textSecondary }}>{error}</p>
          <button
            onClick={handleRetry}
            className="text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            style={{ background: theme.primaryGradient }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────
  return (
    <>
      <ThemedScrollbarStyles
        isDarkMode={isDarkMode}
        className="theme-scrollbar"
        includePageScrollbar
      />
      <div 
        className="min-h-screen relative transition-colors duration-300"
        style={{ background: theme.bgGradient }}
      >
        {/* Animated background blobs - only show in light mode */}
        {!isDarkMode && (
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"
              style={{ backgroundColor: theme.primaryColor }}></div>
            <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
          </div>
        )}

        {/* Sticky nav */}
        <div 
          className="sticky top-0 z-50 w-full backdrop-blur-sm border-b transition-colors duration-300"
          style={{ 
            background: isDarkMode ? 'rgba(32, 33, 35, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            borderColor: theme.borderColor
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
          {/* Title - FIXED: Made text visible in both modes */}
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4">
              <span style={{ 
                color: theme.textPrimary,
                background: isDarkMode ? 'none' : theme.primaryGradient,
                WebkitBackgroundClip: isDarkMode ? 'unset' : 'text',
                WebkitTextFillColor: isDarkMode ? 'unset' : 'transparent'
              }}>
                Events Dashboard
              </span>
            </h1>
            <p className="text-xl max-w-2xl mx-auto mb-8" style={{ color: theme.textSecondary }}>
              Manage your created events and discover events from your clubs and department
            </p>
          </div>

          {/* Stats - Theme-aware */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 max-w-5xl mx-auto mb-6">
            {[
              { label: "Total Events",      value: totalEventsCount,   icon: <Calendar    className="w-6 h-6" style={{ color: theme.primaryColor }} /> },
              { label: "Open Events",       value: openEvents,         icon: <CheckCircle  className="w-6 h-6" style={{ color: "#10B981" }} /> },
              { label: "Completed",         value: completedEvents,    icon: <CheckSquare  className="w-6 h-6" style={{ color: "#8B5CF6" }} /> },
              { label: "Not Completed",     value: notCompletedEvents, icon: <Square       className="w-6 h-6" style={{ color: "#F97316" }} /> },
              { label: "Total Enrollments", value: totalEnrollments,   icon: <Users        className="w-6 h-6" style={{ color: "#A855F7" }} /> },
            ].map(({ label, value, icon }) => (
              <div 
                key={label} 
                className="backdrop-blur-sm p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                style={{ background: theme.bgCard, border: `1px solid ${theme.borderColor}` }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm" style={{ color: theme.textMuted }}>{label}</p>
                    <p className="text-3xl font-bold" style={{ color: theme.textPrimary }}>{value}</p>
                  </div>
                  <div className="p-3 rounded-lg" style={{ background: theme.accentSoft }}>{icon}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Target type breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-6">
            {[
              { icon: <Globe     className="w-5 h-5 mr-2" style={{ color: theme.primaryColor }} />, label: "Global",     value: globalEvents },
              { icon: <Users     className="w-5 h-5 mr-2" style={{ color: theme.primaryColor }} />, label: "Club",       value: clubEvents },
              { icon: <Briefcase className="w-5 h-5 mr-2" style={{ color: theme.primaryColor }} />, label: "Department", value: departmentEvents },
            ].map(({ icon, label, value }) => (
              <div 
                key={label} 
                className="backdrop-blur-sm p-4 rounded-xl"
                style={{ background: theme.accentSoft, border: `1px solid ${theme.borderColor}` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">{icon}<span className="text-sm font-medium" style={{ color: theme.textSecondary }}>{label}</span></div>
                  <span className="text-xl font-bold" style={{ color: theme.textPrimary }}>{value}</span>
                </div>
              </div>
            ))}
          </div>

          {userDept && (
            <div className="mt-4 mb-8 text-center">
              <div 
                className="inline-block backdrop-blur-sm px-6 py-3 rounded-xl shadow-md"
                style={{ background: theme.bgCard, border: `1px solid ${theme.borderColor}` }}
              >
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-lg" style={{ background: theme.primaryLight }}>
                    <Users className="w-4 h-4" style={{ color: theme.primaryColor }} />
                  </div>
                  <span className="text-sm font-medium" style={{ color: theme.textSecondary }}>Department:</span>
                  <span className="px-3 py-1 rounded-full text-sm font-semibold" style={{ background: theme.primaryGradient, color: "#fff" }}>{userDept}</span>
                </div>
              </div>
            </div>
          )}

          {/* Create Event button */}
          <div className="mb-6 flex justify-end">
            <button
              onClick={() => navigate("/create-event")}
              className="px-4 py-2 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
              style={{ background: theme.primaryGradient }}
            >
              <Plus className="w-4 h-4" /><span>Create Event</span>
            </button>
          </div>

          {/* ── Search & Filter Bar ── */}
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
                    placeholder="Search events by title, description, organizer, or creator..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl focus:ring-2 focus:border-transparent transition-all"
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
                    <Filter className="w-5 h-5" />
                    <span>Filters</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showFilters ? "rotate-180" : ""}`} />
                  </button>
                  <div className="w-52">
                    <CustomSelect name="sortBy" value={sortBy} onChange={(e) => setSortBy(e.target.value)} options={sortOptions} placeholder="Sort by..." theme={theme} />
                  </div>
                </div>
              </div>

              {/* Active filter chips */}
              {(filterType !== "GLOBAL" || selectedStatus !== "all" || completedFilter !== "all" || selectedRating !== "all" || selectedClubId || showCreatedEvents) && (
                <div className="mt-4 pt-4 border-t" style={{ borderColor: theme.borderColor }}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium mr-2" style={{ color: theme.textMuted }}>Active Filters:</span>
                    {filterType === "DEPARTMENT" && userDept && (
                      <span className="px-3 py-1 rounded-full text-sm flex items-center" style={{ background: "rgba(16,185,129,0.1)", color: "#10B981" }}>
                        Dept: {userDept}
                        <button onClick={() => handleFilterChange("GLOBAL")} className="ml-2"><X className="w-3 h-3" /></button>
                      </span>
                    )}
                    {filterType === "CLUB" && selectedClubId && (
                      <span className="px-3 py-1 rounded-full text-sm flex items-center" style={{ background: "rgba(139,92,246,0.1)", color: "#8B5CF6" }}>
                        Club: {userClubs.find((c) => c.clubId.toString() === selectedClubId.toString())?.clubName}
                        <button onClick={() => handleFilterChange("GLOBAL")} className="ml-2"><X className="w-3 h-3" /></button>
                      </span>
                    )}
                    {showCreatedEvents && (
                      <span className="px-3 py-1 rounded-full text-sm flex items-center" style={{ background: "rgba(249,115,22,0.1)", color: "#F97316" }}>
                        My Created Events
                        <button onClick={() => handleFilterChange("GLOBAL")} className="ml-2"><X className="w-3 h-3" /></button>
                      </span>
                    )}
                    {selectedStatus !== "all" && (
                      <span className="px-3 py-1 rounded-full text-sm flex items-center" style={{ background: "rgba(59,130,246,0.1)", color: "#3B82F6" }}>
                        Enrollment: {selectedStatus}
                        <button onClick={removeStatusFilter} className="ml-2"><X className="w-3 h-3" /></button>
                      </span>
                    )}
                    {completedFilter !== "all" && (
                      <span className="px-3 py-1 rounded-full text-sm flex items-center" style={{ background: "rgba(139,92,246,0.1)", color: "#8B5CF6" }}>
                        Completed: {completedFilter === "completed" ? "Yes" : "No"}
                        <button onClick={removeCompletedFilter} className="ml-2"><X className="w-3 h-3" /></button>
                      </span>
                    )}
                    {selectedRating !== "all" && (
                      <span className="px-3 py-1 rounded-full text-sm flex items-center" style={{ background: "rgba(245,158,11,0.1)", color: "#F59E0B" }}>
                        Rating: {selectedRating}+
                        <button onClick={removeRatingFilter} className="ml-2"><X className="w-3 h-3" /></button>
                      </span>
                    )}
                    <button onClick={clearAllFilters} className="px-3 py-1 text-sm font-medium ml-auto" style={{ color: "#ef4444" }}>Clear All</button>
                  </div>
                </div>
              )}

              {/* Expanded filter panel */}
              {showFilters && (
                <div className="mt-4 pt-4 border-t" style={{ borderColor: theme.borderColor }}>
                  <div className="flex flex-col space-y-4">
                    <div className="flex flex-wrap items-start gap-3">
                      <span className="text-sm font-medium pt-2.5" style={{ color: theme.textMuted }}>Filter by:</span>
                      <div className="flex flex-wrap items-center gap-2 flex-1">
                        <button
                          onClick={() => handleFilterChange("CREATED")}
                          className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${showCreatedEvents ? "text-white shadow-lg" : ""}`}
                          style={showCreatedEvents 
                            ? { background: "linear-gradient(135deg, #F97316, #EA580C)" } 
                            : { background: theme.accentSoft, color: theme.textSecondary, border: `1px solid ${theme.borderColor}` }}
                        >My Created Events</button>
                        <button
                          onClick={() => handleFilterChange("GLOBAL")}
                          className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${filterType === "GLOBAL" && !showCreatedEvents ? "text-white shadow-lg" : ""}`}
                          style={filterType === "GLOBAL" && !showCreatedEvents
                            ? { background: theme.primaryGradient }
                            : { background: theme.accentSoft, color: theme.textSecondary, border: `1px solid ${theme.borderColor}` }}
                        >Global Events</button>
                        {userDept && (
                          <button
                            onClick={() => handleFilterChange("DEPARTMENT")}
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${filterType === "DEPARTMENT" ? "text-white shadow-lg" : ""}`}
                            style={filterType === "DEPARTMENT"
                              ? { background: "linear-gradient(135deg, #10B981, #059669)" }
                              : { background: theme.accentSoft, color: theme.textSecondary, border: `1px solid ${theme.borderColor}` }}
                          >{userDept} Events</button>
                        )}
                        <button
                          onClick={() => { setShowClubDropdown(!showClubDropdown); }}
                          className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${filterType === "CLUB" ? "text-white shadow-lg" : ""}`}
                          style={filterType === "CLUB"
                            ? { background: "linear-gradient(135deg, #8B5CF6, #7C3AED)" }
                            : { background: theme.accentSoft, color: theme.textSecondary, border: `1px solid ${theme.borderColor}` }}
                        >
                          <span>Club Events</span>
                          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showClubDropdown ? "rotate-180" : ""}`} />
                        </button>
                        <div className="w-48">
                          <CustomSelect name="selectedStatus" value={selectedStatus} onChange={(e) => handleStatusFilterChange(e.target.value)} options={enrollmentStatusOptions} placeholder="Enrollment Status" theme={theme} />
                        </div>
                        <div className="w-48">
                          <CustomSelect name="completedFilter" value={completedFilter} onChange={(e) => handleCompletedFilterChange(e.target.value)} options={completedStatusOptions} placeholder="Completed Status" theme={theme} />
                        </div>
                        <div className="w-48">
                          <CustomSelect name="selectedRating" value={selectedRating} onChange={(e) => handleRatingFilterChange(e.target.value)} options={ratingOptions} placeholder="Ratings" theme={theme} />
                        </div>
                      </div>
                    </div>

                    {/* Club sub-list */}
                    {showClubDropdown && (
                      <div 
                        className="mt-2 border rounded-xl shadow-lg overflow-hidden"
                        style={{ borderColor: theme.borderColor, background: theme.bgCard }}
                      >
                        <div className="px-4 py-3 border-b" style={{ borderColor: theme.borderColor, background: theme.accentSoft }}>
                          <h3 className="font-semibold" style={{ color: theme.textPrimary }}>SELECT A CLUB</h3>
                        </div>
                        <div className="divide-y max-h-60 overflow-y-auto" style={{ borderColor: theme.borderColor }}>
                          {userClubs.length > 0 ? userClubs.map((club) => (
                            <button key={club.clubId} onClick={() => { handleFilterChange("CLUB", club.clubId); setShowClubDropdown(false); }}
                              className={`w-full text-left p-4 transition-colors ${selectedClubId === club.clubId.toString() ? "" : ""}`}
                              style={{
                                backgroundColor: selectedClubId === club.clubId.toString() ? theme.primaryLight : 'transparent',
                                color: theme.textPrimary
                              }}>
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold">{club.clubName}</span>
                                <span className="text-xs px-2 py-1 rounded-full" style={{ background: theme.accentSoft, color: theme.textMuted }}>{club.memberCount || "0"} members</span>
                              </div>
                              {club.desc && <p className="text-sm" style={{ color: theme.textSecondary }}>{club.desc}</p>}
                            </button>
                          )) : (
                            <div className="p-6 text-center"><p style={{ color: theme.textMuted }}>No clubs available</p></div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Results count */}
          <div className="mb-4 flex justify-between items-center">
            <p className="text-sm" style={{ color: theme.textMuted }}>
              Showing <span className="font-semibold" style={{ color: theme.textPrimary }}>{filteredEvents.length}</span> on this page
              {totalPages > 1 && (
                <> · Page <span className="font-semibold" style={{ color: theme.textPrimary }}>{currentPage + 1}</span> of <span className="font-semibold" style={{ color: theme.textPrimary }}>{totalPages}</span></>
              )}
              {" "}· <span className="font-semibold" style={{ color: theme.textPrimary }}>{totalElements}</span> total
            </p>
          </div>

          {/* Loading overlay */}
          {loading && events.length > 0 && (
            <div className="flex justify-center mb-4">
              <div className="backdrop-blur-sm px-4 py-2 rounded-full shadow flex items-center gap-2 text-sm" style={{ background: theme.bgCard, color: theme.textMuted }}>
                <Loader2 className="w-4 h-4 animate-spin" style={{ color: theme.primaryColor }} />
                Loading page {currentPage + 1}…
              </div>
            </div>
          )}

          {/* Events grid */}
          {filteredEvents.length === 0 ? (
            <div className="text-center py-16">
              <div 
                className="backdrop-blur-sm rounded-2xl shadow-xl p-12 max-w-md mx-auto border"
                style={{ background: theme.bgCard, borderColor: theme.borderColor }}
              >
                <div className="relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full opacity-20 animate-ping" style={{ background: theme.primaryGradient }}></div>
                  </div>
                  <Calendar className="w-20 h-20 mx-auto mb-4 relative z-10" style={{ color: theme.textMuted }} />
                </div>
                <h3 className="text-2xl font-bold mb-2" style={{ color: theme.textPrimary }}>No Events Found</h3>
                <p className="mb-6" style={{ color: theme.textSecondary }}>
                  {filterType === "CLUB" && !selectedClubId
                    ? "Please select a club from the dropdown to view its events."
                    : showCreatedEvents
                      ? "You haven't created any events yet. Create your first event to get started!"
                      : completedFilter !== "all"
                        ? `No ${completedFilter === "completed" ? "completed" : "not completed"} events visible to you.`
                        : selectedStatus !== "all"
                          ? `No ${selectedStatus} enrollment events visible to you.`
                          : "There are no events available at the moment. Check back later!"}
                </p>
                <button
                  onClick={() => navigate("/create-event")}
                  className="text-white px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
                  style={{ background: theme.primaryGradient }}
                >
                  Create New Event
                </button>
                {(filterType !== "GLOBAL" || searchTerm || selectedStatus !== "all" || completedFilter !== "all") && (
                  <button onClick={clearAllFilters} className="mt-4 px-6 py-3 font-medium block mx-auto" style={{ color: theme.primaryColor }}>
                    Clear All Filters
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-center">
                <div className={`grid gap-4 w-full ${filteredEvents.length === 1 ? "grid-cols-1 max-w-sm mx-auto" : filteredEvents.length === 2 ? "grid-cols-1 md:grid-cols-2 max-w-2xl mx-auto" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"}`}>
                  {filteredEvents.map((event, index) => {
                    const daysUntil       = getDaysUntil(event.dateTime);
                    const targetTypeColor = getTargetTypeColor(event.targetType, isDarkMode);
                    const isCreator       = event.creatorPrn === userPrn;
                    const isActive        = activeAttendanceEvents[event.eventId];
                    const overallRating   = Number(event.ratings);
                    const hasOverallRating = Number.isFinite(overallRating) && overallRating > 0;

                    return (
                      <div key={event.eventId} className="event-card-container animate-[fadeIn_0.5s_ease-in-out]" style={{ animationDelay: `${index * 100}ms` }}>
                        <div className="event-card">
                          {/* ── FRONT ── */}
                          <div 
                            className="card-face card-front backdrop-blur-sm rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-500 border"
                            style={{ 
                              background: theme.bgCard, 
                              borderColor: theme.borderColor 
                            }}
                          >
                            <div className="relative h-32 p-3 overflow-hidden" style={{ background: isDarkMode ? theme.cardHeaderGradient : theme.primaryGradient }}>
                              <div className="absolute inset-0 opacity-10">
                                <div className="absolute -top-12 -right-12 w-24 h-24 bg-white rounded-full"></div>
                                <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-white rounded-full"></div>
                              </div>
                              {daysUntil > 0 && !event.completed && (
                                <div className="absolute top-2 left-2 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                                  <span className="text-white text-xs font-semibold">{daysUntil} days to go</span>
                                </div>
                              )}
                              {event.completed && (
                                <div className="absolute top-2 left-2 px-2 py-1 rounded-full flex items-center shadow-lg" style={{ background: "rgba(34,197,94,0.8)" }}>
                                  <CheckSquare className="w-3 h-3 mr-1 text-white" /><span className="text-xs font-semibold text-white">Completed</span>
                                </div>
                              )}
                              {isActive && !event.completed && (
                                <div className="absolute top-2 right-2 px-2 py-1 rounded-full flex items-center shadow-lg animate-pulse" style={{ background: "rgba(239,68,68,0.8)" }}>
                                  <span className="w-1.5 h-1.5 bg-white rounded-full mr-1"></span>
                                  <span className="text-[10px] font-semibold text-white">LIVE</span>
                                </div>
                              )}
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
                                <div className="px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center" style={{ background: theme.isDarkMode ? "rgba(34,197,94,0.2)" : "rgba(34,197,94,0.1)", color: theme.isDarkMode ? "#4ADE80" : "#16A34A" }}>
                                  <MapPin className="w-2.5 h-2.5 mr-1" />{event.venue}
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-1">
                                <div className="p-1.5 rounded-lg" style={{ background: theme.accentSoft }}>
                                  <p className="text-[8px]" style={{ color: theme.textMuted }}>Organizer</p>
                                  <p className="text-xs font-semibold flex items-center truncate" style={{ color: theme.textPrimary }}>
                                    <User className="w-3 h-3 mr-0.5 flex-shrink-0" style={{ color: theme.primaryColor }} />
                                    <span className="truncate">{event.organizer}</span>
                                  </p>
                                </div>
                                <div className="p-1.5 rounded-lg" style={{ background: theme.accentSoft }}>
                                  <p className="text-[8px]" style={{ color: theme.textMuted }}>Speaker</p>
                                  <p className="text-xs font-semibold flex items-center truncate" style={{ color: theme.textPrimary }}>
                                    <User className="w-3 h-3 mr-0.5 flex-shrink-0" style={{ color: theme.primaryColor }} />
                                    <span className="truncate">{event.speakerName || event.organizer}</span>
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                {isDarkMode && typeof targetTypeColor === 'object' ? (
                                  <span 
                                    className="px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center"
                                    style={{ background: targetTypeColor.bg, color: targetTypeColor.text }}
                                  >
                                    {getTargetTypeIcon(event.targetType)}
                                    <span className="ml-1 capitalize text-xs">{event.targetType || "N/A"}</span>
                                  </span>
                                ) : (
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${targetTypeColor} flex items-center`}>
                                    {getTargetTypeIcon(event.targetType)}
                                    <span className="ml-1 capitalize text-xs">{event.targetType || "N/A"}</span>
                                  </span>
                                )}
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
                                <span className="animate-pulse mr-1 text-[6px]">●</span>
                                Hover to view all details
                              </div>
                            </div>
                          </div>

                          {/* ── BACK ── */}
                          <div className="card-face card-back rounded-xl shadow-md overflow-hidden p-3" style={{ background: isDarkMode ? theme.cardHeaderGradient : theme.primaryGradient }}>
                            <div className="h-full flex flex-col">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-bold text-white line-clamp-1 flex-1">{event.title}</h3>
                                {event.completed && (
                                  <span className="bg-green-500 text-white px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center ml-1">
                                    <CheckSquare className="w-2.5 h-2.5 mr-0.5" />Completed
                                  </span>
                                )}
                              </div>

                              <div className="space-y-1.5 overflow-y-auto flex-1 pr-1 theme-scrollbar text-xs">
                                <div className="grid grid-cols-2 gap-1">
                                  <div className="p-1.5 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
                                    <div className="flex items-center mb-0.5">
                                      <Calendar className="w-3 h-3 mr-1 text-white/80" />
                                      <p className="text-[10px] text-white/80">Date</p>
                                    </div>
                                    <p className="text-xs font-medium text-white">{formatDateTime(event.dateTime)}</p>
                                  </div>
                                  <div className="p-1.5 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
                                    <div className="flex items-center mb-0.5">
                                      <Clock className="w-3 h-3 mr-1 text-white/80" />
                                      <p className="text-[10px] text-white/80">Enrollment Deadline</p>
                                    </div>
                                    <p className="text-xs font-medium text-white">{formatDateOnly(event.enrollmentDeadline)}</p>
                                  </div>
                                </div>

                                <div className="p-1.5 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
                                  <p className="text-[10px] text-white/80 mb-1 flex items-center">
                                    <Star className="w-2.5 h-2.5 mr-1" />Created By
                                  </p>
                                  <p className="text-xs font-medium text-white truncate">{event.creatorName || event.organizer || "Unknown"}</p>
                                </div>

                                {event.enrollmentStatus && (
                                  <div className="p-1.5 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
                                    <p className="text-[10px] text-white/80 mb-1 flex items-center">
                                      <Radio className="w-2.5 h-2.5 mr-1" />Enrollment Status
                                    </p>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${event.enrollmentStatus?.toUpperCase() === "OPEN" ? "bg-emerald-400/30 text-emerald-100" : "bg-red-400/30 text-red-100"}`}>
                                      {event.enrollmentStatus?.toUpperCase() === "OPEN" ? "Open" : "Closed"}
                                    </span>
                                  </div>
                                )}

                                {event.targetType?.toUpperCase() === "DEPARTMENT" && event.targetIds?.length > 0 && (
                                  <div className="p-1.5 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
                                    <p className="text-[10px] text-white/80 mb-1 flex items-center">
                                      <Briefcase className="w-2.5 h-2.5 mr-1" />Target Departments
                                    </p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {event.targetIds.map((id) => {
                                        const dept = departments.find((d) => Number(d.departmentId) === Number(id));
                                        return (
                                          <span key={id} className="px-1.5 py-0.5 rounded text-[8px] font-medium text-white" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
                                            {dept?.name || `Dept ${id}`}
                                          </span>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}

                                {event.targetType?.toUpperCase() === "CLUB" && event.targetIds?.length > 0 && (
                                  <div className="p-1.5 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
                                    <p className="text-[10px] text-white/80 mb-1 flex items-center">
                                      <Users className="w-2.5 h-2.5 mr-1" />Target Clubs
                                    </p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {event.targetIds.map((id) => {
                                        const club = allClubs.find((c) => Number(c.clubId) === Number(id)) || userClubs.find((c) => Number(c.clubId) === Number(id));
                                        return (
                                          <span key={id} className="px-1.5 py-0.5 rounded text-[8px] font-medium text-white" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
                                            {club?.clubName || `Club ${id}`}
                                          </span>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}

                                {/* Enrollment progress bar */}
                                <div className="p-1.5 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="text-[10px] text-white/80">Total Enrollments</span>
                                    <span className="text-xs text-white">{event.currEnrollments || 0}/{event.maxEnrollments || 0}</span>
                                  </div>
                                  <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
                                    <div className="h-full rounded-full" style={{ width: `${Math.min((event.currEnrollments / event.maxEnrollments) * 100, 100)}%`, backgroundColor: "white" }}></div>
                                  </div>
                                </div>
                              </div>

                              {/* ── Card action buttons — Teacher (creator) ── */}
                              {isCreator && (
                                <div className="mt-2 pt-1 border-t border-white/20">
                                  <div className="flex flex-col gap-1">
                                    {completionMessage.show && completionMessage.eventId === event.eventId && (
                                      <div className={`text-center text-[10px] font-medium ${completionMessage.success ? "text-green-400" : "text-red-400"}`}>
                                        {completionMessage.message}
                                      </div>
                                    )}

                                    {event.completed ? (
                                      <div className="w-full py-1 rounded-lg text-[10px] font-medium text-center flex items-center justify-center" style={{ background: "rgba(34,197,94,0.5)", color: "white" }}>
                                        <CheckSquare className="w-2.5 h-2.5 mr-0.5" />Completed
                                      </div>
                                    ) : (
                                      <>
                                        <div className="flex gap-1">
                                          {loadingAttendanceStatus ? (
                                            <div className="flex-1 px-1.5 py-1 rounded-lg text-[10px] font-medium flex items-center justify-center text-white" style={{ background: theme.accentSoft }}>
                                              <Loader2 className="w-2.5 h-2.5 mr-0.5 animate-spin" style={{ color: theme.primaryColor }} />...
                                            </div>
                                          ) : isActive ? (
                                            <>
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setConfirmDialog({
                                                    isOpen: true,
                                                    title: "Stop Attendance",
                                                    message: "Are you sure you want to stop attendance? Students will no longer be able to mark attendance.",
                                                    confirmText: "Stop",
                                                    variant: "danger",
                                                    onConfirm: () => { closeConfirm(); handleStopAttendanceForEvent(event.eventId); },
                                                  });
                                                }}
                                                className="flex-1 px-1.5 py-1 rounded-lg text-[10px] font-medium transition flex items-center justify-center text-white"
                                                style={{ backgroundColor: "rgba(239,68,68,0.6)" }}
                                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.8)")}
                                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.6)")}
                                              >
                                                <XCircle className="w-2.5 h-2.5 mr-0.5" />Stop
                                              </button>
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setInitialQRData(null);
                                                  setQrCodeEventId(event.eventId);
                                                  setShowQRCodeModal(true);
                                                }}
                                                className="flex-1 px-1.5 py-1 rounded-lg text-[10px] font-medium transition flex items-center justify-center text-white"
                                                style={{ backgroundColor: "rgba(156,39,176,0.6)" }}
                                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(156,39,176,0.8)")}
                                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(156,39,176,0.6)")}
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
                                              style={{ backgroundColor: "rgba(76, 175, 80, 0.5)" }}
                                              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(76, 175, 80, 0.6)")}
                                              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(76, 175, 80, 0.5)")}
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
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setConfirmDialog({
                                                isOpen: true, title: "Delete Event",
                                                message: "Are you sure you want to delete this event? This action cannot be undone.",
                                                confirmText: "Delete", variant: "danger",
                                                onConfirm: () => { closeConfirm(); handleDeleteEvent(event.eventId); },
                                              });
                                            }}
                                            className="flex-1 px-1.5 py-1 rounded-lg text-[10px] font-medium transition flex items-center justify-center text-white"
                                            style={{ backgroundColor: "rgba(239,68,68,0.5)" }}
                                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.6)")}
                                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.5)")}
                                          >
                                            <Trash2 className="w-2.5 h-2.5 mr-0.5" />Delete
                                          </button>
                                        </div>

                                        <button
                                          onClick={(e) => { e.stopPropagation(); handleCompleteEvent(event.eventId); }}
                                          disabled={completingEventId === event.eventId}
                                          className="w-full px-1.5 py-1 rounded-lg text-[10px] font-medium transition flex items-center justify-center text-white"
                                          style={{ backgroundColor: completingEventId === event.eventId ? "rgba(255,255,255,0.1)" : "rgba(34,197,94,0.5)" }}
                                          onMouseEnter={(e) => { if (completingEventId !== event.eventId) e.currentTarget.style.backgroundColor = "rgba(34,197,94,0.6)"; }}
                                          onMouseLeave={(e) => { if (completingEventId !== event.eventId) e.currentTarget.style.backgroundColor = "rgba(34,197,94,0.5)"; }}
                                        >
                                          {completingEventId === event.eventId ? (
                                            <><Loader2 className="w-2.5 h-2.5 mr-0.5 animate-spin" />Completing...</>
                                          ) : (
                                            <><CheckSquare className="w-2.5 h-2.5 mr-0.5" />Complete Event</>
                                          )}
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              )}

                              {!isCreator && event.completed && (
                                <div className="mt-2 pt-1 border-t border-white/20">
                                  <div className="w-full py-1.5 rounded-lg text-xs font-medium text-center" style={{ background: "rgba(255,255,255,0.2)", color: "white" }}>
                                    Event Completed
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {totalPages > 1 && (
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalElements={totalElements}
                  pageSize={pageSize}
                  onPageChange={handlePageChange}
                  showPageSizeSelector={false}
                  loading={loading}
                />
              )}
            </>
          )}

          <div className="mt-12 text-center">
            <div className="inline-flex items-center space-x-2 text-sm" style={{ color: theme.textMuted }}>
              <Bell className="w-4 h-4" />
              <span>Stay tuned for more exciting events!</span>
              <Gift className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* ── Edit Event Modal ── */}
        {showEditModal && editingEvent && (
          <EditEvent
            event={editingEvent}
            token={localStorage.getItem("token")}
            onClose={() => { setShowEditModal(false); setEditingEvent(null); }}
            onSuccess={() => {
              const token = localStorage.getItem("token");
              fetchEventsPaged(token, "TEACHER", filterType, selectedClubId || deptId, currentPage, pageSize);
              checkAllEventsAttendance();
            }}
            theme={theme}
            isDarkMode={isDarkMode}
          />
        )}

        <style>{sharedStyles}</style>
      </div>

      <StartAttendancePopup
        isOpen={showAttendancePopup}
        onClose={() => { setShowAttendancePopup(false); setSelectedEventForAttendance(null); }}
        event={selectedEventForAttendance}
        onSuccess={handleAttendanceStartSuccess}
        token={localStorage.getItem("token")}
      />

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

      {/* ── QR Code Modal ── */}
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
                token={localStorage.getItem("token")}
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

export default TeacherEvents;