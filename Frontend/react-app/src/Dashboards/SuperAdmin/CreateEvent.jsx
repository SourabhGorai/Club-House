





// import { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import { useNavigate, useSearchParams } from "react-router-dom";
// import CustomSelect from "../../components/CustomSelect";
// import DateTimePicker from "../../components/Datetimepicker";
// import {
//   Calendar,
//   Clock,
//   MapPin,
//   Users,
//   Building2,
//   FileText,
//   X,
//   CalendarPlus,
//   AlertCircle,
//   CheckCircle,
//   Loader,
//   ChevronLeft,
//   Globe,
//   Map as MapIcon,
//   QrCode,
//   Mail,
//   User,
//   Hash,
//   Check,
//   Plus,
//   Trash2,
//   Crosshair,
//   Layers,
//   Sparkles,
//   Bell,
//   Gift,
//   Home,
// } from "lucide-react";

// import "leaflet/dist/leaflet.css";
// import L from "leaflet";

// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl:
//     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
//   iconUrl:
//     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
//   shadowUrl:
//     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
// });

// const BASE_URL = import.meta.env.VITE_API_URL || "http://72.155.88.211:8080";

// // Responsive container classes
// const responsiveClasses = {
//   container: "w-full px-3 sm:px-4 md:px-6 lg:px-8",
//   grid: "grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6",
//   input: "w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base",
//   button: "px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base",
//   heading: "text-xl sm:text-2xl md:text-3xl font-bold",
//   subheading: "text-base sm:text-lg md:text-xl font-semibold",
//   card: "bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-5 md:p-6",
// };

// export default function CreateEvent() {
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();
//   const token = localStorage.getItem("token");
//   const user = JSON.parse(localStorage.getItem("user"));

//   const preSelectedClubId = searchParams.get("clubId");
//   const preSelectedClubName = searchParams.get("clubName");

//   const mapRef = useRef(null);
//   const markerRef = useRef(null);
//   const circleRef = useRef(null);
//   const mapContainerRef = useRef(null);
//   const mapInitializedRef = useRef(false);

//   const [formData, setFormData] = useState({
//     title: "",
//     description: "",
//     speakerName: "",
//     eventDate: "",
//     organizer: "",
//     eventCreator: user?.username || "",
//     venue: "",
//     maxEnrollments: "",
//     currEnrollments: 0,
//     target: "GLOBAL",
//     targetIds: preSelectedClubId ? [preSelectedClubId] : [],
//     isCompleted: false,
//     enrollmentDeadline: "",
//     enrollmentStatus: "OPEN",
//     contactEmail: user?.email || "",
//     notificationType: "",
//     latitude: "18.5204",
//     longitude: "73.8567",
//     radiusInMeters: 50,
//     attendanceWindowStart: "",
//     attendanceWindowEnd: "",
//     qrRefreshIntervalSeconds: 120,
//     attendanceEnabled: false,
//     attendanceActive: false,
//   });

//   const [loading, setLoading] = useState(false);
//   const [clubs, setClubs] = useState([]);
//   const [departments, setDepartments] = useState([]);
//   const [loadingOptions, setLoadingOptions] = useState(false);
//   const [message, setMessage] = useState({ text: "", type: "" });
//   const [selectedTargets, setSelectedTargets] = useState([]);
//   const [formErrors, setFormErrors] = useState({});
//   const [enableAttendance, setEnableAttendance] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [searchingLocation, setSearchingLocation] = useState(false);
//   const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

//   // Handle resize events
//   useEffect(() => {
//     const handleResize = () => {
//       setIsMobile(window.innerWidth < 768);
//       if (mapRef.current && enableAttendance) {
//         setTimeout(() => mapRef.current.invalidateSize(), 100);
//       }
//     };

//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, [enableAttendance]);

//   useEffect(() => {
//     if (preSelectedClubId && preSelectedClubName) {
//       setSelectedTargets([{ id: preSelectedClubId, name: preSelectedClubName }]);
//     }
//   }, [preSelectedClubId, preSelectedClubName]);

//   useEffect(() => {
//     if (enableAttendance && mapContainerRef.current && !mapInitializedRef.current) {
//       requestAnimationFrame(() => { initializeMap(); });
//     }
//     return () => {
//       if (mapRef.current) {
//         mapRef.current.remove();
//         mapRef.current = null;
//         markerRef.current = null;
//         circleRef.current = null;
//         mapInitializedRef.current = false;
//       }
//     };
//   }, [enableAttendance]);

//   const initializeMap = () => {
//     if (!mapContainerRef.current || mapInitializedRef.current) return;

//     const defaultLat = parseFloat(formData.latitude) || 18.5204;
//     const defaultLng = parseFloat(formData.longitude) || 73.8567;

//     try {
//       mapRef.current = L.map(mapContainerRef.current).setView([defaultLat, defaultLng], 15);

//       L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//         attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
//         maxZoom: 19,
//       }).addTo(mapRef.current);

//       markerRef.current = L.marker([defaultLat, defaultLng], { draggable: true, autoPan: true }).addTo(mapRef.current);

//       circleRef.current = L.circle([defaultLat, defaultLng], {
//         radius: formData.radiusInMeters,
//         color: "#4CA1AF",
//         fillColor: "#4CA1AF",
//         fillOpacity: 0.2,
//         weight: 2,
//       }).addTo(mapRef.current);

//       markerRef.current.on("dragend", function (e) {
//         const position = e.target.getLatLng();
//         updateCoordinates(position.lat, position.lng);
//         if (circleRef.current) circleRef.current.setLatLng([position.lat, position.lng]);
//       });

//       mapRef.current.on("click", function (e) {
//         const { lat, lng } = e.latlng;
//         if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
//         if (circleRef.current) circleRef.current.setLatLng([lat, lng]);
//         updateCoordinates(lat, lng);
//       });

//       setTimeout(() => { 
//         if (mapRef.current) {
//           mapRef.current.invalidateSize();
//         }
//       }, 200);
      
//       mapInitializedRef.current = true;
//     } catch (error) {
//       console.error("Error initializing map:", error);
//     }
//   };

//   const updateCoordinates = (lat, lng) => {
//     setFormData((prev) => ({ ...prev, latitude: lat.toFixed(6), longitude: lng.toFixed(6) }));
//   };

//   useEffect(() => {
//     if (circleRef.current && formData.radiusInMeters) {
//       circleRef.current.setRadius(parseInt(formData.radiusInMeters));
//     }
//   }, [formData.radiusInMeters]);

//   const searchLocation = async () => {
//     if (!searchQuery.trim()) return;
//     try {
//       setSearchingLocation(true);
//       setMessage({ text: "Searching location...", type: "success" });
//       const response = await axios.get(
//         `https://photon.komoot.io/api/?q=${encodeURIComponent(searchQuery)}&limit=1`
//       );
//       if (response.data?.features?.length > 0) {
//         const [lon, lat] = response.data.features[0].geometry.coordinates;
//         const latitude = parseFloat(lat);
//         const longitude = parseFloat(lon);
//         if (mapRef.current) {
//           mapRef.current.setView([latitude, longitude], 16);
//           if (markerRef.current) markerRef.current.setLatLng([latitude, longitude]);
//           if (circleRef.current) circleRef.current.setLatLng([latitude, longitude]);
//         }
//         updateCoordinates(latitude, longitude);
//         setMessage({ text: "Location found!", type: "success" });
//         setTimeout(() => setMessage({ text: "", type: "" }), 3000);
//       } else {
//         setMessage({ text: "Location not found. Try a different search term.", type: "error" });
//       }
//     } catch (error) {
//       console.error("Error searching location:", error);
//       setMessage({ text: "Error searching location. Please try again.", type: "error" });
//     } finally {
//       setSearchingLocation(false);
//     }
//   };

//   const getCurrentLocation = () => {
//     if (!navigator.geolocation) {
//       setMessage({ text: "Geolocation is not supported by your browser", type: "error" });
//       return;
//     }
//     setMessage({ text: "Getting your location...", type: "success" });
//     navigator.geolocation.getCurrentPosition(
//       (position) => {
//         const { latitude, longitude } = position.coords;
//         if (mapRef.current) {
//           mapRef.current.setView([latitude, longitude], 16);
//           if (markerRef.current) markerRef.current.setLatLng([latitude, longitude]);
//           if (circleRef.current) circleRef.current.setLatLng([latitude, longitude]);
//         }
//         updateCoordinates(latitude, longitude);
//         setMessage({ text: "Location captured!", type: "success" });
//         setTimeout(() => setMessage({ text: "", type: "" }), 3000);
//       },
//       (error) => {
//         const errorMessages = {
//           1: "Permission denied — please allow location access in your browser settings and refresh.",
//           2: "Position unavailable — your device couldn't determine location.",
//           3: "Request timed out — try again.",
//         };
//         setMessage({ text: errorMessages[error.code] || "Unknown location error.", type: "error" });
//       },
//       { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
//     );
//   };

//   const fetchTargetOptions = async () => {
//     setLoadingOptions(true);
//     try {
//       const userRole = user?.role;
//       let clubsEndpoint = `${BASE_URL}/api/clubs`;
//       if (userRole === "TEACHER") clubsEndpoint = `${BASE_URL}/api/user-clubs/getMyClubs`;

//       const clubsResponse = await axios.get(clubsEndpoint, {
//         headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
//       });

//       if (clubsResponse.data.success && Array.isArray(clubsResponse.data.data)) {
//         setClubs(clubsResponse.data.data);
//       } else if (Array.isArray(clubsResponse.data)) {
//         setClubs(clubsResponse.data);
//       } else if (clubsResponse.data.data && Array.isArray(clubsResponse.data.data)) {
//         setClubs(clubsResponse.data.data);
//       } else {
//         setClubs([]);
//       }

//       const deptResponse = await axios.get(`${BASE_URL}/api/department`, {
//         headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
//       });

//       if (deptResponse.data.success && Array.isArray(deptResponse.data.data)) {
//         setDepartments(deptResponse.data.data.filter((dept) => dept.active === true));
//       } else if (Array.isArray(deptResponse.data)) {
//         setDepartments(deptResponse.data);
//       } else {
//         setDepartments([]);
//       }
//     } catch (error) {
//       console.error("Error fetching options:", error);
//       setMessage({ text: "Failed to load clubs/departments", type: "error" });
//     } finally {
//       setLoadingOptions(false);
//     }
//   };

//   useEffect(() => { fetchTargetOptions(); }, []);

//   const handleInputChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
//     if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: null }));
//   };

//   const handleDateTimeChange = (field) => (value) => {
//     setFormData((prev) => ({ ...prev, [field]: value }));
//     if (formErrors[field]) setFormErrors((prev) => ({ ...prev, [field]: null }));
//   };

//   const handleTargetTypeChange = (type) => {
//     setFormData((prev) => ({ ...prev, target: type, targetIds: [] }));
//     setSelectedTargets([]);
//   };

//   const toggleTargetSelection = (target) => {
//     const exists = selectedTargets.some((t) => t.id === target.id);
//     const updatedTargets = exists
//       ? selectedTargets.filter((t) => t.id !== target.id)
//       : [...selectedTargets, target];
//     setSelectedTargets(updatedTargets);
//     setFormData((prev) => ({ ...prev, targetIds: updatedTargets.map((t) => t.id) }));
//     if (formErrors.targetIds) setFormErrors((prev) => ({ ...prev, targetIds: null }));
//   };

//   const removeTarget = (targetId) => {
//     const updatedTargets = selectedTargets.filter((t) => t.id !== targetId);
//     setSelectedTargets(updatedTargets);
//     setFormData((prev) => ({ ...prev, targetIds: updatedTargets.map((t) => t.id) }));
//   };

//   const validateForm = () => {
//     const errors = {};
//     if (!formData.title.trim()) errors.title = "Title is required";
//     if (!formData.organizer) errors.organizer = "Organizer is required";

//     if (!formData.eventDate) {
//       errors.eventDate = "Event Date is required";
//     } else if (new Date(formData.eventDate) < new Date()) {
//       errors.eventDate = "Event date must be in the future";
//     }

//     if (!formData.venue.trim()) errors.venue = "Venue is required";

//     if (!formData.enrollmentDeadline) {
//       errors.enrollmentDeadline = "Enrollment Deadline is required";
//     } else {
//       const deadlineDate = new Date(formData.enrollmentDeadline);
//       const eventDate = new Date(formData.eventDate);
//       if (deadlineDate < new Date()) {
//         errors.enrollmentDeadline = "Deadline must be in the future";
//       } else if (deadlineDate >= eventDate) {
//         errors.enrollmentDeadline = "Deadline must be before the event date";
//       }
//     }

//     if (!formData.contactEmail.trim()) {
//       errors.contactEmail = "Contact email is required";
//     } else if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) {
//       errors.contactEmail = "Please enter a valid email address";
//     }

//     if (formData.target !== "GLOBAL" && formData.targetIds.length === 0) {
//       errors.targetIds = `Please select at least one ${formData.target.toLowerCase()}`;
//     }

//     if (formData.maxEnrollments && parseInt(formData.maxEnrollments) < 1) {
//       errors.maxEnrollments = "Max enrollments must be at least 1";
//     }

//     if (enableAttendance) {
//       if (!formData.latitude || !formData.longitude)
//         errors.location = "Please select a location on the map";
//       if (!formData.attendanceWindowStart || !formData.attendanceWindowEnd)
//         errors.attendanceWindow = "Attendance window is required";
//       if (formData.radiusInMeters < 10 || formData.radiusInMeters > 1000)
//         errors.radius = "Radius must be between 10 and 1000 meters";
//     }

//     setFormErrors(errors);
//     return Object.keys(errors).length === 0;
//   };

//   const sendEventNotification = async (eventId, eventTitle) => {
//     try {
//       const autoTypeMap = {
//         GLOBAL:     "GLOBAL",
//         CLUB:       "CLUB_SPECIFIC",
//         DEPARTMENT: "DEPARTMENT_SPECIFIC",
//       };

//       const resolvedType =
//         formData.notificationType ||
//         autoTypeMap[formData.target] ||
//         "EVENT_SPECIFIC";

//       const notificationPayload = {
//         sourceType: "EVENT",
//         sourceId: eventId ? Number(eventId) : null,
//         notificationTitle: eventTitle,
//         message: `You're invited to ${eventTitle}! Join us at ${formData.venue}. ${
//           formData.description
//             ? formData.description.slice(0, 120) +
//               (formData.description.length > 120 ? "..." : "")
//             : "Don't miss this exciting event."
//         } Enroll before ${new Date(formData.enrollmentDeadline).toLocaleDateString(
//           "en-IN",
//           { dateStyle: "medium" }
//         )}.`,
//         notificationType: resolvedType,
//         targetType: formData.target,
//         targetedIds:
//           formData.target === "GLOBAL" ? [] : formData.targetIds.map(Number),
//         validUntil: formData.eventDate,
//       };
//       console.log("Sending event notification with payload:", notificationPayload);

//       await axios.post(`${BASE_URL}/api/notification`, notificationPayload, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       });

//       console.log("Event notification sent:", resolvedType);
//     } catch (err) {
//       console.warn("Notification send failed (non-blocking):", err);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!validateForm()) {
//       setMessage({ text: "Please fill all required fields", type: "error" });
//       return;
//     }

//     setLoading(true);
//     setMessage({ text: "", type: "" });

//     const eventData = {
//       title: formData.title,
//       description: formData.description || null,
//       speakerName: formData.speakerName || null,
//       eventDate: formData.eventDate,
//       organizer: formData.organizer,
//       eventCreator: formData.eventCreator,
//       venue: formData.venue,
//       maxEnrollments: formData.maxEnrollments ? parseInt(formData.maxEnrollments) : null,
//       currEnrollments: 0,
//       target: formData.target,
//       targetIds: formData.target === "GLOBAL" ? [] : formData.targetIds,
//       isCompleted: false,
//       enrollmentDeadline: formData.enrollmentDeadline,
//       enrollmentStatus: "OPEN",
//       contactEmail: formData.contactEmail,

//       ...(enableAttendance && {
//         latitude: parseFloat(formData.latitude),
//         longitude: parseFloat(formData.longitude),
//         radiusInMeters: parseInt(formData.radiusInMeters),
//         attendanceWindowStart: formData.attendanceWindowStart,
//         attendanceWindowEnd: formData.attendanceWindowEnd,
//         qrRefreshIntervalSeconds: parseInt(formData.qrRefreshIntervalSeconds),
//         attendanceEnabled: true,
//         attendanceActive: false,
//       }),
//     };

//     try {
//       const response = await axios.post(`${BASE_URL}/api/events/create`, eventData, {
//         headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
//       });

//       if (response.data.success) {
//         const createdEventId =
//           response.data.data?.eventId ||
//           response.data.data?.id ||
//           null;
//         await sendEventNotification(createdEventId, formData.title);

//         setMessage({ text: "Event created successfully!", type: "success" });
//         setTimeout(() => navigate(-1), 1500);
//       } else {
//         setMessage({
//           text: response.data.message || "Failed to create event",
//           type: "error",
//         });
//       }
//     } catch (error) {
//       console.error("Error creating event:", error);
//       setMessage({
//         text: error.response?.data?.message || "Error creating event",
//         type: "error",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getMinDateTime = () => {
//     const now = new Date();
//     now.setHours(now.getHours() + 1);
//     now.setSeconds(0, 0);
//     const pad = (n) => String(n).padStart(2, "0");
//     return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
//   };

//   const getNowDateTime = () => {
//     const now = new Date();
//     now.setSeconds(0, 0);
//     const pad = (n) => String(n).padStart(2, "0");
//     return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
//   };

//   const getTargetOptions = () => {
//     if (formData.target === "CLUB") {
//       return clubs.map((item) => ({
//         id: item.clubId || item.id,
//         name: item.name || item.clubName || "Unnamed Club",
//       }));
//     } else if (formData.target === "DEPARTMENT") {
//       return departments.map((item) => ({
//         id: item.departmentId,
//         name: item.name || "Unnamed Department",
//       }));
//     }
//     return [];
//   };

//   const targetOptions = getTargetOptions();

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
//       {/* Animated Background - Optimized for mobile */}
//       <div className="fixed inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute -top-40 -right-40 w-64 sm:w-80 h-64 sm:h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
//         <div
//           className="absolute -bottom-40 -left-40 w-64 sm:w-80 h-64 sm:h-80 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"
//           style={{ backgroundColor: "#4CA1AF" }}
//         ></div>
//         <div className="absolute top-40 left-40 w-64 sm:w-80 h-64 sm:h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
//       </div>

//       {/* Responsive Header */}
//       <div className="relative bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
//         <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
//           <div className="flex justify-between items-center h-14 sm:h-16">
//             {/* Back to Dashboard button */}
//             <button
//               onClick={() => navigate("/dashboard")}
//               className="group flex items-center gap-1.5 sm:gap-2 border border-white/20 hover:border-white/40 font-medium rounded-full py-1.5 sm:py-2 px-3 sm:px-4 transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer"
//               style={{ background: "linear-gradient(135deg, #4CA1AF, #315169)", color: "white" }}
//             >
//               <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
//               {/* <span className="text-xs sm:text-sm hidden xs:inline">Dashboard</span> */}
//             </button>

//             {/* Create New Event title */}
//             <div className="flex items-center gap-1.5 sm:gap-2">
//               <CalendarPlus className="w-3.5 h-3.5 sm:w-5 sm:h-5" style={{ color: "#4CA1AF" }} />
//               <span className="text-xs sm:text-sm md:text-base font-semibold text-gray-900 truncate max-w-[150px] sm:max-w-none">
//                 {isMobile ? "New Event" : "Create New Event"}
//               </span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="relative max-w-7xl mx-auto py-4 sm:py-6 md:py-8 px-2 sm:px-4 md:px-6 lg:px-8">
//         <div className="bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl shadow-lg sm:shadow-xl border border-white/20 overflow-hidden">

//           {/* Responsive Form Header */}
//           <div
//             className="px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 border-b border-gray-700/50"
//             style={{ background: "linear-gradient(135deg, #4CA1AF, #315169)" }}
//           >
//             <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-white">Event Details</h1>
//             <p className="text-xs sm:text-sm text-white/90 mt-0.5 sm:mt-1">
//               {isMobile ? "Fill in the information below" : "Fill in the information below to create your event"}
//             </p>
//             {preSelectedClubName && (
//               <p className="text-xs sm:text-sm mt-1 sm:mt-2 text-white/80">
//                 Creating event for:{" "}
//                 <span className="font-semibold text-white break-words">{preSelectedClubName}</span>
//               </p>
//             )}
//           </div>

//           {/* Status Message - Responsive */}
//           {message.text && (
//             <div
//               className={`mx-3 sm:mx-4 md:mx-6 lg:mx-8 mt-4 sm:mt-5 md:mt-6 p-3 sm:p-4 rounded-lg flex items-center gap-2 ${
//                 message.type === "error"
//                   ? "bg-red-50 text-red-700 border border-red-200"
//                   : "bg-green-50 text-green-700 border border-green-200"
//               }`}
//             >
//               {message.type === "error" ? (
//                 <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
//               ) : (
//                 <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
//               )}
//               <span className="text-xs sm:text-sm font-medium break-words">{message.text}</span>
//             </div>
//           )}

//           <form onSubmit={handleSubmit} className="p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-8">

//             {/* Responsive Grid Layout */}
//             <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
//               {/* Title Field */}
//               <div>
//                 <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
//                   Event Title <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="title"
//                   value={formData.title}
//                   onChange={handleInputChange}
//                   placeholder={isMobile ? "e.g., Tech Symposium" : "e.g., Annual Tech Symposium"}
//                   className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border rounded-lg focus:ring-2 focus:border-transparent transition-colors cursor-text bg-white/50 backdrop-blur-sm ${
//                     formErrors.title ? "border-red-300 bg-red-50" : "border-gray-300"
//                   }`}
//                 />
//                 {formErrors.title && (
//                   <p className="mt-0.5 sm:mt-1 text-xs text-red-600">{formErrors.title}</p>
//                 )}
//               </div>

//               {/* Speaker Name Field */}
//               <div>
//                 <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
//                   Speaker Name
//                 </label>
//                 <input
//                   type="text"
//                   name="speakerName"
//                   value={formData.speakerName}
//                   onChange={handleInputChange}
//                   placeholder={isMobile ? "e.g., Dr. Smith" : "e.g., Dr. John Smith"}
//                   className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors cursor-text bg-white/50 backdrop-blur-sm"
//                 />
//               </div>
//             </div>

//             {/* Description Field - Full Width */}
//             <div>
//               <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
//                 Description
//               </label>
//               <textarea
//                 name="description"
//                 value={formData.description}
//                 onChange={handleInputChange}
//                 rows={isMobile ? "2" : "3"}
//                 placeholder={isMobile ? "Brief description..." : "Provide a detailed description of your event..."}
//                 className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors resize-none cursor-text bg-white/50 backdrop-blur-sm"
//               />
//             </div>

//             {/* Event Date & Enrollment Deadline */}
//             <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
//               <div>
//                 <DateTimePicker
//                   label="Event Date & Time"
//                   required
//                   value={formData.eventDate}
//                   onChange={handleDateTimeChange("eventDate")}
//                   minValue={getMinDateTime()}
//                   placeholder="Select event date & time"
//                 />
//                 {formErrors.eventDate && (
//                   <p className="mt-0.5 sm:mt-1 text-xs text-red-600">{formErrors.eventDate}</p>
//                 )}
//               </div>

//               <div>
//                 <DateTimePicker
//                   label="Enrollment Deadline"
//                   required
//                   value={formData.enrollmentDeadline}
//                   onChange={handleDateTimeChange("enrollmentDeadline")}
//                   minValue={getNowDateTime()}
//                   maxValue={formData.eventDate || undefined}
//                   placeholder="Select enrollment deadline"
//                 />
//                 {formErrors.enrollmentDeadline && (
//                   <p className="mt-0.5 sm:mt-1 text-xs text-red-600">{formErrors.enrollmentDeadline}</p>
//                 )}
//               </div>
//             </div>

//             {/* Venue & Max Enrollments */}
//             <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
//               <div>
//                 <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
//                   Venue <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                   <MapPin
//                     className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 z-10 pointer-events-none"
//                     style={{ color: "#4CA1AF" }}
//                   />
//                   <input
//                     type="text"
//                     name="venue"
//                     value={formData.venue}
//                     onChange={handleInputChange}
//                     placeholder={isMobile ? "e.g., Main Hall" : "e.g., Main Auditorium"}
//                     className={`w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm sm:text-base border rounded-lg focus:ring-2 focus:border-transparent transition-colors cursor-text bg-white/50 backdrop-blur-sm ${
//                       formErrors.venue ? "border-red-300 bg-red-50" : "border-gray-300"
//                     }`}
//                   />
//                 </div>
//                 {formErrors.venue && (
//                   <p className="mt-0.5 sm:mt-1 text-xs text-red-600">{formErrors.venue}</p>
//                 )}
//               </div>

//               <div>
//                 <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
//                   Maximum Enrollments
//                 </label>
//                 <input
//                   type="number"
//                   name="maxEnrollments"
//                   value={formData.maxEnrollments}
//                   onChange={handleInputChange}
//                   placeholder="Unlimited"
//                   min="1"
//                   className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border rounded-lg focus:ring-2 focus:border-transparent transition-colors cursor-text bg-white/50 backdrop-blur-sm ${
//                     formErrors.maxEnrollments ? "border-red-300 bg-red-50" : "border-gray-300"
//                   }`}
//                 />
//                 {formErrors.maxEnrollments && (
//                   <p className="mt-0.5 sm:mt-1 text-xs text-red-600">{formErrors.maxEnrollments}</p>
//                 )}
//               </div>
//             </div>

//             {/* Contact Email */}
//             <div>
//               <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
//                 Contact Email <span className="text-red-500">*</span>
//               </label>
//               <div className="relative">
//                 <Mail
//                   className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 z-10 pointer-events-none"
//                   style={{ color: "#4CA1AF" }}
//                 />
//                 <input
//                   type="email"
//                   name="contactEmail"
//                   value={formData.contactEmail}
//                   onChange={handleInputChange}
//                   placeholder={isMobile ? "e.g., organizer@college.edu" : "e.g., organizer@college.edu"}
//                   className={`w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm sm:text-base border rounded-lg focus:ring-2 focus:border-transparent transition-colors cursor-text bg-white/50 backdrop-blur-sm ${
//                     formErrors.contactEmail ? "border-red-300 bg-red-50" : "border-gray-300"
//                   }`}
//                 />
//               </div>
//               {formErrors.contactEmail && (
//                 <p className="mt-0.5 sm:mt-1 text-xs text-red-600">{formErrors.contactEmail}</p>
//               )}
//             </div>

//             {/* Organizer */}
//             <div>
//               <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
//                 Organizer <span className="text-red-500">*</span>
//               </label>
//               <CustomSelect
//                 name="organizer"
//                 value={formData.organizer}
//                 onChange={handleInputChange}
//                 placeholder="Select organizer..."
//                 required
//                 options={[
//                   { value: "Global", label: "Global" },
//                   ...departments.map((dept) => ({
//                     value: dept.name,
//                     label: `Department: ${dept.name}`,
//                   })),
//                   ...clubs.map((club) => ({
//                     value: club.clubName || club.name,
//                     label: `Club: ${club.clubName || club.name}`,
//                   })),
//                 ]}
//               />
//               {formErrors.organizer && (
//                 <p className="mt-0.5 sm:mt-1 text-xs text-red-600">{formErrors.organizer}</p>
//               )}
//             </div>

//             {/* Target Audience - Responsive buttons */}
//             <div>
//               <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">
//                 Target Audience <span className="text-red-500">*</span>
//               </label>
//               <div className="flex flex-col xs:flex-row flex-wrap gap-2 sm:gap-3">
//                 {[
//                   { value: "GLOBAL",     icon: <Globe className="w-3 h-3 sm:w-4 sm:h-4" />,     label: isMobile ? "Global" : "Global (Everyone)" },
//                   { value: "CLUB",       icon: <Users className="w-3 h-3 sm:w-4 sm:h-4" />,     label: isMobile ? "Clubs" : "Specific Clubs" },
//                   { value: "DEPARTMENT", icon: <Building2 className="w-3 h-3 sm:w-4 sm:h-4" />, label: isMobile ? "Depts" : "Specific Departments" },
//                 ].map(({ value, icon, label }) => (
//                   <button
//                     key={value}
//                     type="button"
//                     onClick={() => handleTargetTypeChange(value)}
//                     className={`px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 rounded-lg border transition-colors flex items-center gap-1.5 sm:gap-2 cursor-pointer bg-white/50 backdrop-blur-sm text-xs sm:text-sm ${
//                       formData.target === value
//                         ? "border-[#4CA1AF] text-[#4CA1AF]"
//                         : "border-gray-300 hover:border-[#4CA1AF] hover:bg-[#4CA1AF]/5"
//                     }`}
//                     style={formData.target === value ? { backgroundColor: "rgba(76, 161, 175, 0.1)" } : {}}
//                   >
//                     {icon}
//                     <span className="font-medium">{label}</span>
//                     {formData.target === value && (
//                       <Check className="w-3 h-3 sm:w-4 sm:h-4 ml-0.5 sm:ml-1" style={{ color: "#4CA1AF" }} />
//                     )}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {/* Target Selection */}
//             {formData.target !== "GLOBAL" && (
//               <div>
//                 <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
//                   Select {formData.target === "CLUB" ? "Clubs" : "Departments"}{" "}
//                   <span className="text-red-500">*</span>
//                 </label>

//                 {selectedTargets.length > 0 && (
//                   <div className="mb-2 sm:mb-3 flex flex-wrap gap-1.5 sm:gap-2">
//                     {selectedTargets.map((target) => (
//                       <span
//                         key={target.id}
//                         className="inline-flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm"
//                         style={{ backgroundColor: "rgba(76, 161, 175, 0.1)", color: "#4CA1AF" }}
//                       >
//                         <span className="max-w-[100px] sm:max-w-[150px] truncate">{target.name}</span>
//                         <button
//                           type="button"
//                           onClick={() => removeTarget(target.id)}
//                           className="hover:opacity-80 cursor-pointer flex-shrink-0"
//                           style={{ color: "#4CA1AF" }}
//                         >
//                           <X size={isMobile ? 12 : 14} />
//                         </button>
//                       </span>
//                     ))}
//                   </div>
//                 )}

//                 {loadingOptions ? (
//                   <div className="flex items-center justify-center py-4 sm:py-6 md:py-8 text-gray-500 bg-white/50 backdrop-blur-sm rounded-lg">
//                     <Loader className="w-4 h-4 sm:w-5 sm:h-5 animate-spin mr-2" style={{ color: "#4CA1AF" }} />
//                     <span className="text-xs sm:text-sm">Loading...</span>
//                   </div>
//                 ) : (
//                   <div className="border border-gray-200 rounded-lg overflow-hidden bg-white/50 backdrop-blur-sm">
//                     <div className="max-h-48 sm:max-h-60 overflow-y-auto">
//                       {targetOptions.length > 0 ? (
//                         targetOptions.map((item) => {
//                           const isSelected = selectedTargets.some((t) => t.id === item.id);
//                           return (
//                             <div
//                               key={item.id}
//                               onClick={() => toggleTargetSelection(item)}
//                               className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-100 last:border-0 cursor-pointer transition-colors"
//                               style={isSelected ? { backgroundColor: "rgba(76, 161, 175, 0.1)" } : {}}
//                             >
//                               <span className="text-xs sm:text-sm font-medium text-gray-700 truncate pr-2">{item.name}</span>
//                               {isSelected && <Check className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" style={{ color: "#4CA1AF" }} />}
//                             </div>
//                           );
//                         })
//                       ) : (
//                         <div className="px-3 sm:px-4 py-4 sm:py-6 md:py-8 text-center text-gray-400 text-xs sm:text-sm">
//                           No {formData.target === "CLUB" ? "clubs" : "departments"} available
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 )}

//                 {formErrors.targetIds && (
//                   <p className="mt-1.5 sm:mt-2 text-xs text-red-600">{formErrors.targetIds}</p>
//                 )}
//               </div>
//             )}

//             {/* Notification Type - Responsive */}
//             <div className="border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 bg-white/60 backdrop-blur-sm">
//               <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
//                 <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: "#4CA1AF" }} />
//                 <label className="block text-xs sm:text-sm font-medium text-gray-700">
//                   Notification Type
//                 </label>
//               </div>
//               <p className="text-xs text-gray-400 mb-2 sm:mb-3">
//                 {isMobile 
//                   ? "Leave as Auto to detect from target audience"
//                   : "Leave as Auto to detect from the target audience above, or manually override the notification type"}
//               </p>

//               {!formData.notificationType && (
//                 <div
//                   className="inline-flex items-center gap-1 sm:gap-1.5 text-xs font-semibold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full mb-2 sm:mb-3"
//                   style={{ backgroundColor: "rgba(76,161,175,0.1)", color: "#4CA1AF" }}
//                 >
//                   <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
//                   Auto →{" "}
//                   {{
//                     GLOBAL:     "GLOBAL",
//                     CLUB:       "CLUB_SPECIFIC",
//                     DEPARTMENT: "DEPARTMENT_SPECIFIC",
//                   }[formData.target] || "EVENT_SPECIFIC"}
//                 </div>
//               )}

//               <CustomSelect
//                 name="notificationType"
//                 value={formData.notificationType}
//                 onChange={handleInputChange}
//                 placeholder="Auto (recommended)"
//                 options={[
//                   { value: "",                    label: "Auto — detect from target audience" },
//                   { value: "GLOBAL",              label: "Global" },
//                   { value: "CLUB_SPECIFIC",       label: "Club Specific" },
//                   { value: "DEPARTMENT_SPECIFIC", label: "Department Specific" },
//                   { value: "YEAR_SPECIFIC",       label: "Year Specific" },
//                   { value: "REMINDER",            label: "Reminder" },
//                   { value: "EVENT_SPECIFIC",      label: "Event Specific" },
//                 ]}
//               />
//             </div>

//             {/* Attendance Tracking Toggle */}
//             <div className="border-t border-gray-200 pt-4 sm:pt-5 md:pt-6">
//               <label className="flex items-center gap-2 sm:gap-3 cursor-pointer">
//                 <div className="relative flex-shrink-0">
//                   <input
//                     type="checkbox"
//                     checked={enableAttendance}
//                     onChange={(e) => {
//                       setEnableAttendance(e.target.checked);
//                       if (!e.target.checked && mapRef.current) {
//                         mapRef.current.remove();
//                         mapRef.current = null;
//                         markerRef.current = null;
//                         circleRef.current = null;
//                         mapInitializedRef.current = false;
//                       }
//                     }}
//                     className="sr-only"
//                   />
//                   <div className={`w-8 sm:w-10 h-4 sm:h-6 rounded-full transition-colors ${enableAttendance ? "bg-[#4CA1AF]" : "bg-gray-300"}`}>
//                     <div className={`w-3 sm:w-4 h-3 sm:h-4 rounded-full bg-white transform transition-transform absolute top-0.5 sm:top-1 ${enableAttendance ? "translate-x-4 sm:translate-x-5" : "translate-x-1 sm:translate-x-1"}`} />
//                   </div>
//                 </div>
//                 <span className="text-xs sm:text-sm font-medium text-gray-700">
//                   Enable Attendance Tracking with Geofencing
//                 </span>
//               </label>
//               <p className="mt-0.5 sm:mt-1 text-xs text-gray-500 ml-8 sm:ml-13">
//                 Set up location-based attendance using map selection
//               </p>
//             </div>

//             {/* Map and Attendance Fields */}
//             {enableAttendance && (
//               <div className="space-y-4 sm:space-y-5 md:space-y-6 p-3 sm:p-4 md:p-5 lg:p-6 bg-white/50 backdrop-blur-sm rounded-lg border border-gray-200">
//                 <h3 className="text-xs sm:text-sm font-semibold text-gray-900">
//                   📍 Select Event Location on Map
//                 </h3>

//                 {/* Map Controls - Responsive */}
//                 <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-3 sm:mb-4">
//                   <div className="flex-1 relative">
//                     <input
//                       type="text"
//                       value={searchQuery}
//                       onChange={(e) => setSearchQuery(e.target.value)}
//                       onKeyPress={(e) => e.key === "Enter" && searchLocation()}
//                       placeholder={isMobile ? "Search location..." : "Search for a location (e.g. Bharati Vidyapeeth, Pune)..."}
//                       className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent cursor-text bg-white/50 backdrop-blur-sm"
//                     />
//                   </div>
//                   <div className="flex gap-2">
//                     <button
//                       type="button"
//                       onClick={searchLocation}
//                       disabled={searchingLocation}
//                       className="flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-white rounded-lg hover:opacity-90 transition-colors flex items-center justify-center gap-1 sm:gap-2 cursor-pointer disabled:opacity-60"
//                       style={{ background: "linear-gradient(135deg, #4CA1AF, #315169)" }}
//                     >
//                       {searchingLocation ? <Loader className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" /> : <MapIcon className="w-3 h-3 sm:w-4 sm:h-4" />}
//                       <span className="hidden xs:inline">Search</span>
//                     </button>
//                     <button
//                       type="button"
//                       onClick={getCurrentLocation}
//                       className="flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-white rounded-lg hover:opacity-90 transition-colors flex items-center justify-center gap-1 sm:gap-2 cursor-pointer"
//                       style={{ background: "linear-gradient(135deg, #4CA1AF, #315169)" }}
//                     >
//                       <Crosshair className="w-3 h-3 sm:w-4 sm:h-4" />
//                       <span className="hidden xs:inline">My Location</span>
//                     </button>
//                   </div>
//                 </div>

//                 {/* Map Container - Responsive height */}
//                 <div
//                   ref={mapContainerRef}
//                   className="w-full rounded-lg border-2 border-gray-300 z-0"
//                   style={{ height: isMobile ? "250px" : "400px" }}
//                 />

//                 {/* Coordinates Display - Responsive grid */}
//                 <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4 mt-3 sm:mt-4">
//                   <div>
//                     <label className="block text-xs font-medium text-gray-700 mb-0.5 sm:mb-1">Latitude</label>
//                     <input type="text" value={formData.latitude} readOnly
//                       className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-100 border border-gray-300 rounded-lg text-xs sm:text-sm font-mono cursor-default" />
//                   </div>
//                   <div>
//                     <label className="block text-xs font-medium text-gray-700 mb-0.5 sm:mb-1">Longitude</label>
//                     <input type="text" value={formData.longitude} readOnly
//                       className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-100 border border-gray-300 rounded-lg text-xs sm:text-sm font-mono cursor-default" />
//                   </div>
//                   <div className="xs:col-span-2 sm:col-span-1">
//                     <label className="block text-xs font-medium text-gray-700 mb-0.5 sm:mb-1">Radius (meters)</label>
//                     <input
//                       type="number"
//                       name="radiusInMeters"
//                       value={formData.radiusInMeters}
//                       onChange={handleInputChange}
//                       min="10"
//                       max="1000"
//                       className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:border-transparent cursor-text bg-white/50 backdrop-blur-sm"
//                     />
//                   </div>
//                 </div>
//                 {formErrors.radius && <p className="text-xs text-red-600 mt-1">{formErrors.radius}</p>}

//                 {/* Attendance Window - Responsive */}
//                 <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
//                   <div>
//                     <DateTimePicker
//                       label="Attendance Window Start"
//                       value={formData.attendanceWindowStart}
//                       onChange={handleDateTimeChange("attendanceWindowStart")}
//                       minValue={formData.eventDate || undefined}
//                       placeholder="Select start time"
//                     />
//                   </div>
//                   <div>
//                     <DateTimePicker
//                       label="Attendance Window End"
//                       value={formData.attendanceWindowEnd}
//                       onChange={handleDateTimeChange("attendanceWindowEnd")}
//                       minValue={formData.attendanceWindowStart || formData.eventDate || undefined}
//                       placeholder="Select end time"
//                     />
//                   </div>
//                 </div>
//                 {formErrors.attendanceWindow && (
//                   <p className="text-xs text-red-600">{formErrors.attendanceWindow}</p>
//                 )}

//                 {/* QR Settings */}
//                 <div>
//                   <label className="block text-xs font-medium text-gray-700 mb-0.5 sm:mb-1">
//                     QR Refresh Interval (seconds)
//                   </label>
//                   <input
//                     type="number"
//                     name="qrRefreshIntervalSeconds"
//                     value={formData.qrRefreshIntervalSeconds}
//                     onChange={handleInputChange}
//                     min="30"
//                     max="300"
//                     className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:border-transparent cursor-text bg-white/50 backdrop-blur-sm"
//                   />
//                   <p className="mt-0.5 sm:mt-1 text-xs text-gray-500">Default: 120 seconds (2 minutes)</p>
//                 </div>

//                 {/* Map Instructions */}
//                 <div
//                   className="rounded-lg p-2 sm:p-3"
//                   style={{ backgroundColor: "rgba(76, 161, 175, 0.1)", borderColor: "#4CA1AF", borderWidth: "1px" }}
//                 >
//                   <p className="text-xs flex items-center gap-1.5 sm:gap-2" style={{ color: "#4CA1AF" }}>
//                     <Layers className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
//                     <span className="text-xs">
//                       {isMobile 
//                         ? "Click on map to set location. Drag marker to adjust."
//                         : "Click on the map to set the event location. Drag the marker to adjust. The circle shows the geofencing radius."}
//                     </span>
//                   </p>
//                 </div>
//                 {formErrors.location && <p className="text-xs text-red-600">{formErrors.location}</p>}
//               </div>
//             )}

//             {/* Form Actions - Responsive */}
//             <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 md:gap-4 pt-4 sm:pt-5 md:pt-6 border-t border-gray-200">
//               <button
//                 type="button"
//                 onClick={() => navigate(-1)}
//                 className="w-full xs:flex-1 px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors cursor-pointer bg-white/50 backdrop-blur-sm text-xs sm:text-sm"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="w-full xs:flex-1 px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 text-white rounded-lg font-medium hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer text-xs sm:text-sm"
//                 style={{ background: "linear-gradient(135deg, #4CA1AF, #315169)" }}
//               >
//                 {loading ? (
//                   <>
//                     <Loader className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
//                     <span>Creating...</span>
//                   </>
//                 ) : (
//                   <>
//                     <CalendarPlus className="w-3 h-3 sm:w-4 sm:h-4" />
//                     <span>Create Event</span>
//                   </>
//                 )}
//               </button>
//             </div>

//             <p className="text-xs text-gray-400 text-center">
//               Fields marked with <span className="text-red-500">*</span> are required
//             </p>
//           </form>
//         </div>

//         {/* Footer - Responsive */}
//         <div className="mt-4 sm:mt-6 md:mt-8 text-center">
//           <div className="inline-flex items-center space-x-1.5 sm:space-x-2 text-gray-500 text-xs sm:text-sm">
//             <Bell className="w-3 h-3 sm:w-4 sm:h-4" />
//             <span>{isMobile ? "Create amazing events!" : "Create an amazing event for your community!"}</span>
//             <Gift className="w-3 h-3 sm:w-4 sm:h-4" />
//           </div>
//         </div>
//       </div>

//       {/* Responsive Animations */}
//       <style jsx>{`
//         @keyframes blob {
//           0%   { transform: translate(0px, 0px) scale(1); }
//           33%  { transform: translate(30px, -50px) scale(1.1); }
//           66%  { transform: translate(-20px, 20px) scale(0.9); }
//           100% { transform: translate(0px, 0px) scale(1); }
//         }
//         .animate-blob { animation: blob 7s infinite; }
//         .animation-delay-2000 { animation-delay: 2s; }
//         .animation-delay-4000 { animation-delay: 4s; }
        
//         /* Responsive breakpoints */
//         @media (max-width: 480px) {
//           .xs\\:inline { display: inline; }
//           .xs\\:hidden { display: none; }
//           .xs\\:flex-row { flex-direction: row; }
//           .xs\\:flex-1 { flex: 1 1 0%; }
//           .xs\\:col-span-2 { grid-column: span 2 / span 2; }
//         }
//         @media (min-width: 481px) {
//           .xs\\:inline { display: inline; }
//           .xs\\:flex-row { flex-direction: row; }
//           .xs\\:flex-1 { flex: 1 1 0%; }
//           .xs\\:col-span-2 { grid-column: span 2 / span 2; }
//         }
//       `}</style>
//     </div>
//   );
// }


import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import CustomSelect from "../../components/CustomSelect";
import DateTimePicker from "../../components/Datetimepicker";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Building2,
  FileText,
  X,
  CalendarPlus,
  AlertCircle,
  CheckCircle,
  Loader,
  ChevronLeft,
  Globe,
  Map as MapIcon,
  QrCode,
  Mail,
  User,
  Hash,
  Check,
  Plus,
  Trash2,
  Crosshair,
  Layers,
  Sparkles,
  Bell,
  Gift,
  Home,
  Moon,
  Sun,
} from "lucide-react";

import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

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

// Responsive container classes
const responsiveClasses = {
  container: "w-full px-3 sm:px-4 md:px-6 lg:px-8",
  grid: "grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6",
  input: "w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base",
  button: "px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base",
  heading: "text-xl sm:text-2xl md:text-3xl font-bold",
  subheading: "text-base sm:text-lg md:text-xl font-semibold",
  card: "backdrop-blur-sm rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-5 md:p-6",
};

export default function CreateEvent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  // ── Theme state ───────────────────────────────────────────────────────────
  const [isDarkMode, setIsDarkMode] = useState(() =>
    localStorage.getItem("createEventTheme") === "dark"
  );

  // Get current theme colors
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

  // Save theme preference to localStorage
  useEffect(() => {
    localStorage.setItem("createEventTheme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const preSelectedClubId = searchParams.get("clubId");
  const preSelectedClubName = searchParams.get("clubName");

  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);
  const mapContainerRef = useRef(null);
  const mapInitializedRef = useRef(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    speakerName: "",
    eventDate: "",
    organizer: "",
    eventCreator: user?.username || "",
    venue: "",
    maxEnrollments: "",
    currEnrollments: 0,
    target: "GLOBAL",
    targetIds: preSelectedClubId ? [preSelectedClubId] : [],
    isCompleted: false,
    enrollmentDeadline: "",
    enrollmentStatus: "OPEN",
    contactEmail: user?.email || "",
    notificationType: "",
    latitude: "18.5204",
    longitude: "73.8567",
    radiusInMeters: 50,
    attendanceWindowStart: "",
    attendanceWindowEnd: "",
    qrRefreshIntervalSeconds: 120,
    attendanceEnabled: false,
    attendanceActive: false,
  });

  const [loading, setLoading] = useState(false);
  const [clubs, setClubs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [selectedTargets, setSelectedTargets] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [enableAttendance, setEnableAttendance] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchingLocation, setSearchingLocation] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle resize events
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (mapRef.current && enableAttendance) {
        setTimeout(() => mapRef.current.invalidateSize(), 100);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [enableAttendance]);

  useEffect(() => {
    if (preSelectedClubId && preSelectedClubName) {
      setSelectedTargets([{ id: preSelectedClubId, name: preSelectedClubName }]);
    }
  }, [preSelectedClubId, preSelectedClubName]);

  useEffect(() => {
    if (enableAttendance && mapContainerRef.current && !mapInitializedRef.current) {
      requestAnimationFrame(() => { initializeMap(); });
    }
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
        circleRef.current = null;
        mapInitializedRef.current = false;
      }
    };
  }, [enableAttendance]);

  const initializeMap = () => {
    if (!mapContainerRef.current || mapInitializedRef.current) return;

    const defaultLat = parseFloat(formData.latitude) || 18.5204;
    const defaultLng = parseFloat(formData.longitude) || 73.8567;

    try {
      mapRef.current = L.map(mapContainerRef.current).setView([defaultLat, defaultLng], 15);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(mapRef.current);

      markerRef.current = L.marker([defaultLat, defaultLng], { draggable: true, autoPan: true }).addTo(mapRef.current);

      circleRef.current = L.circle([defaultLat, defaultLng], {
        radius: formData.radiusInMeters,
        color: theme.primaryColor,
        fillColor: theme.primaryColor,
        fillOpacity: 0.2,
        weight: 2,
      }).addTo(mapRef.current);

      markerRef.current.on("dragend", function (e) {
        const position = e.target.getLatLng();
        updateCoordinates(position.lat, position.lng);
        if (circleRef.current) circleRef.current.setLatLng([position.lat, position.lng]);
      });

      mapRef.current.on("click", function (e) {
        const { lat, lng } = e.latlng;
        if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
        if (circleRef.current) circleRef.current.setLatLng([lat, lng]);
        updateCoordinates(lat, lng);
      });

      setTimeout(() => { 
        if (mapRef.current) {
          mapRef.current.invalidateSize();
        }
      }, 200);
      
      mapInitializedRef.current = true;
    } catch (error) {
      console.error("Error initializing map:", error);
    }
  };

  const updateCoordinates = (lat, lng) => {
    setFormData((prev) => ({ ...prev, latitude: lat.toFixed(6), longitude: lng.toFixed(6) }));
  };

  useEffect(() => {
    if (circleRef.current && formData.radiusInMeters) {
      circleRef.current.setRadius(parseInt(formData.radiusInMeters));
    }
  }, [formData.radiusInMeters]);

  const searchLocation = async () => {
    if (!searchQuery.trim()) return;
    try {
      setSearchingLocation(true);
      setMessage({ text: "Searching location...", type: "success" });
      const response = await axios.get(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(searchQuery)}&limit=1`
      );
      if (response.data?.features?.length > 0) {
        const [lon, lat] = response.data.features[0].geometry.coordinates;
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);
        if (mapRef.current) {
          mapRef.current.setView([latitude, longitude], 16);
          if (markerRef.current) markerRef.current.setLatLng([latitude, longitude]);
          if (circleRef.current) circleRef.current.setLatLng([latitude, longitude]);
        }
        updateCoordinates(latitude, longitude);
        setMessage({ text: "Location found!", type: "success" });
        setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      } else {
        setMessage({ text: "Location not found. Try a different search term.", type: "error" });
      }
    } catch (error) {
      console.error("Error searching location:", error);
      setMessage({ text: "Error searching location. Please try again.", type: "error" });
    } finally {
      setSearchingLocation(false);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setMessage({ text: "Geolocation is not supported by your browser", type: "error" });
      return;
    }
    setMessage({ text: "Getting your location...", type: "success" });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        if (mapRef.current) {
          mapRef.current.setView([latitude, longitude], 16);
          if (markerRef.current) markerRef.current.setLatLng([latitude, longitude]);
          if (circleRef.current) circleRef.current.setLatLng([latitude, longitude]);
        }
        updateCoordinates(latitude, longitude);
        setMessage({ text: "Location captured!", type: "success" });
        setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      },
      (error) => {
        const errorMessages = {
          1: "Permission denied — please allow location access in your browser settings and refresh.",
          2: "Position unavailable — your device couldn't determine location.",
          3: "Request timed out — try again.",
        };
        setMessage({ text: errorMessages[error.code] || "Unknown location error.", type: "error" });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const fetchTargetOptions = async () => {
    setLoadingOptions(true);
    try {
      const userRole = user?.role;
      let clubsEndpoint = `${BASE_URL}/api/clubs`;
      if (userRole === "TEACHER") clubsEndpoint = `${BASE_URL}/api/user-clubs/getMyClubs`;

      const clubsResponse = await axios.get(clubsEndpoint, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });

      if (clubsResponse.data.success && Array.isArray(clubsResponse.data.data)) {
        setClubs(clubsResponse.data.data);
      } else if (Array.isArray(clubsResponse.data)) {
        setClubs(clubsResponse.data);
      } else if (clubsResponse.data.data && Array.isArray(clubsResponse.data.data)) {
        setClubs(clubsResponse.data.data);
      } else {
        setClubs([]);
      }

      const deptResponse = await axios.get(`${BASE_URL}/api/department`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });

      if (deptResponse.data.success && Array.isArray(deptResponse.data.data)) {
        setDepartments(deptResponse.data.data.filter((dept) => dept.active === true));
      } else if (Array.isArray(deptResponse.data)) {
        setDepartments(deptResponse.data);
      } else {
        setDepartments([]);
      }
    } catch (error) {
      console.error("Error fetching options:", error);
      setMessage({ text: "Failed to load clubs/departments", type: "error" });
    } finally {
      setLoadingOptions(false);
    }
  };

  useEffect(() => { fetchTargetOptions(); }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleDateTimeChange = (field) => (value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) setFormErrors((prev) => ({ ...prev, [field]: null }));
  };

  const handleTargetTypeChange = (type) => {
    setFormData((prev) => ({ ...prev, target: type, targetIds: [] }));
    setSelectedTargets([]);
  };

  const toggleTargetSelection = (target) => {
    const exists = selectedTargets.some((t) => t.id === target.id);
    const updatedTargets = exists
      ? selectedTargets.filter((t) => t.id !== target.id)
      : [...selectedTargets, target];
    setSelectedTargets(updatedTargets);
    setFormData((prev) => ({ ...prev, targetIds: updatedTargets.map((t) => t.id) }));
    if (formErrors.targetIds) setFormErrors((prev) => ({ ...prev, targetIds: null }));
  };

  const removeTarget = (targetId) => {
    const updatedTargets = selectedTargets.filter((t) => t.id !== targetId);
    setSelectedTargets(updatedTargets);
    setFormData((prev) => ({ ...prev, targetIds: updatedTargets.map((t) => t.id) }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = "Title is required";
    if (!formData.organizer) errors.organizer = "Organizer is required";

    if (!formData.eventDate) {
      errors.eventDate = "Event Date is required";
    } else if (new Date(formData.eventDate) < new Date()) {
      errors.eventDate = "Event date must be in the future";
    }

    if (!formData.venue.trim()) errors.venue = "Venue is required";

    if (!formData.enrollmentDeadline) {
      errors.enrollmentDeadline = "Enrollment Deadline is required";
    } else {
      const deadlineDate = new Date(formData.enrollmentDeadline);
      const eventDate = new Date(formData.eventDate);
      if (deadlineDate < new Date()) {
        errors.enrollmentDeadline = "Deadline must be in the future";
      } else if (deadlineDate >= eventDate) {
        errors.enrollmentDeadline = "Deadline must be before the event date";
      }
    }

    if (!formData.contactEmail.trim()) {
      errors.contactEmail = "Contact email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) {
      errors.contactEmail = "Please enter a valid email address";
    }

    if (formData.target !== "GLOBAL" && formData.targetIds.length === 0) {
      errors.targetIds = `Please select at least one ${formData.target.toLowerCase()}`;
    }

    if (formData.maxEnrollments && parseInt(formData.maxEnrollments) < 1) {
      errors.maxEnrollments = "Max enrollments must be at least 1";
    }

    if (enableAttendance) {
      if (!formData.latitude || !formData.longitude)
        errors.location = "Please select a location on the map";
      if (!formData.attendanceWindowStart || !formData.attendanceWindowEnd)
        errors.attendanceWindow = "Attendance window is required";
      if (formData.radiusInMeters < 10 || formData.radiusInMeters > 1000)
        errors.radius = "Radius must be between 10 and 1000 meters";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const sendEventNotification = async (eventId, eventTitle) => {
    try {
      const autoTypeMap = {
        GLOBAL:     "GLOBAL",
        CLUB:       "CLUB_SPECIFIC",
        DEPARTMENT: "DEPARTMENT_SPECIFIC",
      };

      const resolvedType =
        formData.notificationType ||
        autoTypeMap[formData.target] ||
        "EVENT_SPECIFIC";

      const notificationPayload = {
        sourceType: "EVENT",
        sourceId: eventId ? Number(eventId) : null,
        notificationTitle: eventTitle,
        message: `You're invited to ${eventTitle}! Join us at ${formData.venue}. ${
          formData.description
            ? formData.description.slice(0, 120) +
              (formData.description.length > 120 ? "..." : "")
            : "Don't miss this exciting event."
        } Enroll before ${new Date(formData.enrollmentDeadline).toLocaleDateString(
          "en-IN",
          { dateStyle: "medium" }
        )}.`,
        notificationType: resolvedType,
        targetType: formData.target,
        targetedIds:
          formData.target === "GLOBAL" ? [] : formData.targetIds.map(Number),
        validUntil: formData.eventDate,
      };
      console.log("Sending event notification with payload:", notificationPayload);

      await axios.post(`${BASE_URL}/api/notification`, notificationPayload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Event notification sent:", resolvedType);
    } catch (err) {
      console.warn("Notification send failed (non-blocking):", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setMessage({ text: "Please fill all required fields", type: "error" });
      return;
    }

    setLoading(true);
    setMessage({ text: "", type: "" });

    const eventData = {
      title: formData.title,
      description: formData.description || null,
      speakerName: formData.speakerName || null,
      eventDate: formData.eventDate,
      organizer: formData.organizer,
      eventCreator: formData.eventCreator,
      venue: formData.venue,
      maxEnrollments: formData.maxEnrollments ? parseInt(formData.maxEnrollments) : null,
      currEnrollments: 0,
      target: formData.target,
      targetIds: formData.target === "GLOBAL" ? [] : formData.targetIds,
      isCompleted: false,
      enrollmentDeadline: formData.enrollmentDeadline,
      enrollmentStatus: "OPEN",
      contactEmail: formData.contactEmail,

      ...(enableAttendance && {
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        radiusInMeters: parseInt(formData.radiusInMeters),
        attendanceWindowStart: formData.attendanceWindowStart,
        attendanceWindowEnd: formData.attendanceWindowEnd,
        qrRefreshIntervalSeconds: parseInt(formData.qrRefreshIntervalSeconds),
        attendanceEnabled: true,
        attendanceActive: false,
      }),
    };

    try {
      const response = await axios.post(`${BASE_URL}/api/events/create`, eventData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });

      if (response.data.success) {
        const createdEventId =
          response.data.data?.eventId ||
          response.data.data?.id ||
          null;
        await sendEventNotification(createdEventId, formData.title);

        setMessage({ text: "Event created successfully!", type: "success" });
        setTimeout(() => navigate(-1), 1500);
      } else {
        setMessage({
          text: response.data.message || "Failed to create event",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error creating event:", error);
      setMessage({
        text: error.response?.data?.message || "Error creating event",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    now.setSeconds(0, 0);
    const pad = (n) => String(n).padStart(2, "0");
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  };

  const getNowDateTime = () => {
    const now = new Date();
    now.setSeconds(0, 0);
    const pad = (n) => String(n).padStart(2, "0");
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  };

  const getTargetOptions = () => {
    if (formData.target === "CLUB") {
      return clubs.map((item) => ({
        id: item.clubId || item.id,
        name: item.name || item.clubName || "Unnamed Club",
      }));
    } else if (formData.target === "DEPARTMENT") {
      return departments.map((item) => ({
        id: item.departmentId,
        name: item.name || "Unnamed Department",
      }));
    }
    return [];
  };

  const targetOptions = getTargetOptions();

  return (
    <div 
      className="min-h-screen transition-colors duration-300"
      style={{ background: theme.bgGradient }}
    >
      {/* Animated Background - only show in light mode */}
      {!isDarkMode && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-64 sm:w-80 h-64 sm:h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div
            className="absolute -bottom-40 -left-40 w-64 sm:w-80 h-64 sm:h-80 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"
            style={{ backgroundColor: theme.primaryColor }}
          ></div>
          <div className="absolute top-40 left-40 w-64 sm:w-80 h-64 sm:h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
      )}

      {/* Responsive Header */}
      <div 
        className="sticky top-0 z-10 backdrop-blur-sm border-b transition-colors duration-300"
        style={{ 
          background: isDarkMode ? 'rgba(32, 33, 35, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          borderColor: theme.borderColor
        }}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Back to Dashboard button */}
            <button
              onClick={() => navigate("/dashboard")}
              className="group flex items-center gap-1.5 sm:gap-2 font-medium rounded-full py-1.5 sm:py-2 px-3 sm:px-4 transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer"
              style={{ background: theme.primaryGradient, color: "white" }}
            >
              <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Create New Event title */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <CalendarPlus className="w-3.5 h-3.5 sm:w-5 sm:h-5" style={{ color: theme.primaryColor }} />
              <span className="text-xs sm:text-sm md:text-base font-semibold truncate max-w-[150px] sm:max-w-none" style={{ color: theme.textPrimary }}>
                {isMobile ? "New Event" : "Create New Event"}
              </span>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={() => setIsDarkMode((prev) => !prev)}
              className="p-1.5 sm:p-2 rounded-xl transition-colors cursor-pointer"
              style={{ background: theme.accentSoft, color: theme.textSecondary }}
              title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? <Sun size={isMobile ? 16 : 18} /> : <Moon size={isMobile ? 16 : 18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto py-4 sm:py-6 md:py-8 px-2 sm:px-4 md:px-6 lg:px-8">
        <div 
          className="backdrop-blur-sm rounded-lg sm:rounded-xl shadow-lg sm:shadow-xl border overflow-hidden transition-colors duration-300"
          style={{ 
            background: theme.bgCard, 
            borderColor: theme.borderColor 
          }}
        >

          {/* Responsive Form Header */}
          <div
            className="px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 border-b"
            style={{ 
              background: theme.primaryGradient,
              borderColor: theme.borderColor 
            }}
          >
            <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-white">Event Details</h1>
            <p className="text-xs sm:text-sm text-white/90 mt-0.5 sm:mt-1">
              {isMobile ? "Fill in the information below" : "Fill in the information below to create your event"}
            </p>
            {preSelectedClubName && (
              <p className="text-xs sm:text-sm mt-1 sm:mt-2 text-white/80">
                Creating event for:{" "}
                <span className="font-semibold text-white break-words">{preSelectedClubName}</span>
              </p>
            )}
          </div>

          {/* Status Message - Responsive */}
          {message.text && (
            <div
              className={`mx-3 sm:mx-4 md:mx-6 lg:mx-8 mt-4 sm:mt-5 md:mt-6 p-3 sm:p-4 rounded-lg flex items-center gap-2 ${
                message.type === "error"
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : "bg-green-50 text-green-700 border border-green-200"
              }`}
            >
              {message.type === "error" ? (
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              ) : (
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              )}
              <span className="text-xs sm:text-sm font-medium break-words">{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-8">

            {/* Responsive Grid Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
              {/* Title Field */}
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1" style={{ color: theme.textSecondary }}>
                  Event Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder={isMobile ? "e.g., Tech Symposium" : "e.g., Annual Tech Symposium"}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border rounded-lg focus:ring-2 focus:border-transparent transition-colors cursor-text ${
                    formErrors.title ? "border-red-300 bg-red-50" : ""
                  }`}
                  style={{ 
                    background: theme.accentSoft,
                    borderColor: formErrors.title ? '#fca5a5' : theme.borderColor,
                    color: theme.textPrimary
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = theme.primaryColor;
                    e.target.style.boxShadow = `0 0 0 2px ${theme.primaryColor}20`;
                  }}
                  onBlur={(e) => {
                    if (!formErrors.title) {
                      e.target.style.borderColor = theme.borderColor;
                    }
                    e.target.style.boxShadow = "";
                  }}
                />
                {formErrors.title && (
                  <p className="mt-0.5 sm:mt-1 text-xs text-red-600">{formErrors.title}</p>
                )}
              </div>

              {/* Speaker Name Field */}
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1" style={{ color: theme.textSecondary }}>
                  Speaker Name
                </label>
                <input
                  type="text"
                  name="speakerName"
                  value={formData.speakerName}
                  onChange={handleInputChange}
                  placeholder={isMobile ? "e.g., Dr. Smith" : "e.g., Dr. John Smith"}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border rounded-lg focus:ring-2 focus:border-transparent transition-colors cursor-text"
                  style={{ 
                    background: theme.accentSoft,
                    borderColor: theme.borderColor,
                    color: theme.textPrimary
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
            </div>

            {/* Description Field - Full Width */}
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1" style={{ color: theme.textSecondary }}>
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={isMobile ? "2" : "3"}
                placeholder={isMobile ? "Brief description..." : "Provide a detailed description of your event..."}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border rounded-lg focus:ring-2 focus:border-transparent transition-colors resize-none cursor-text"
                style={{ 
                  background: theme.accentSoft,
                  borderColor: theme.borderColor,
                  color: theme.textPrimary
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

            {/* Event Date & Enrollment Deadline - FIXED: DateTimePicker now receives theme */}
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
              <div>
                <DateTimePicker
                  label="Event Date & Time"
                  required
                  value={formData.eventDate}
                  onChange={handleDateTimeChange("eventDate")}
                  minValue={getMinDateTime()}
                  placeholder="Select event date & time"
                  theme={theme}
                />
                {formErrors.eventDate && (
                  <p className="mt-0.5 sm:mt-1 text-xs text-red-600">{formErrors.eventDate}</p>
                )}
              </div>

              <div>
                <DateTimePicker
                  label="Enrollment Deadline"
                  required
                  value={formData.enrollmentDeadline}
                  onChange={handleDateTimeChange("enrollmentDeadline")}
                  minValue={getNowDateTime()}
                  maxValue={formData.eventDate || undefined}
                  placeholder="Select enrollment deadline"
                  theme={theme}
                />
                {formErrors.enrollmentDeadline && (
                  <p className="mt-0.5 sm:mt-1 text-xs text-red-600">{formErrors.enrollmentDeadline}</p>
                )}
              </div>
            </div>

            {/* Venue & Max Enrollments */}
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1" style={{ color: theme.textSecondary }}>
                  Venue <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin
                    className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 z-10 pointer-events-none"
                    style={{ color: theme.primaryColor }}
                  />
                  <input
                    type="text"
                    name="venue"
                    value={formData.venue}
                    onChange={handleInputChange}
                    placeholder={isMobile ? "e.g., Main Hall" : "e.g., Main Auditorium"}
                    className={`w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm sm:text-base border rounded-lg focus:ring-2 focus:border-transparent transition-colors cursor-text ${
                      formErrors.venue ? "border-red-300 bg-red-50" : ""
                    }`}
                    style={{ 
                      background: theme.accentSoft,
                      borderColor: formErrors.venue ? '#fca5a5' : theme.borderColor,
                      color: theme.textPrimary
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = theme.primaryColor;
                      e.target.style.boxShadow = `0 0 0 2px ${theme.primaryColor}20`;
                    }}
                    onBlur={(e) => {
                      if (!formErrors.venue) {
                        e.target.style.borderColor = theme.borderColor;
                      }
                      e.target.style.boxShadow = "";
                    }}
                  />
                </div>
                {formErrors.venue && (
                  <p className="mt-0.5 sm:mt-1 text-xs text-red-600">{formErrors.venue}</p>
                )}
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1" style={{ color: theme.textSecondary }}>
                  Maximum Enrollments
                </label>
                <input
                  type="number"
                  name="maxEnrollments"
                  value={formData.maxEnrollments}
                  onChange={handleInputChange}
                  placeholder="Unlimited"
                  min="1"
                  className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border rounded-lg focus:ring-2 focus:border-transparent transition-colors cursor-text ${
                    formErrors.maxEnrollments ? "border-red-300 bg-red-50" : ""
                  }`}
                  style={{ 
                    background: theme.accentSoft,
                    borderColor: formErrors.maxEnrollments ? '#fca5a5' : theme.borderColor,
                    color: theme.textPrimary
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = theme.primaryColor;
                    e.target.style.boxShadow = `0 0 0 2px ${theme.primaryColor}20`;
                  }}
                  onBlur={(e) => {
                    if (!formErrors.maxEnrollments) {
                      e.target.style.borderColor = theme.borderColor;
                    }
                    e.target.style.boxShadow = "";
                  }}
                />
                {formErrors.maxEnrollments && (
                  <p className="mt-0.5 sm:mt-1 text-xs text-red-600">{formErrors.maxEnrollments}</p>
                )}
              </div>
            </div>

            {/* Contact Email */}
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1" style={{ color: theme.textSecondary }}>
                Contact Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 z-10 pointer-events-none"
                  style={{ color: theme.primaryColor }}
                />
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  placeholder={isMobile ? "e.g., organizer@college.edu" : "e.g., organizer@college.edu"}
                  className={`w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm sm:text-base border rounded-lg focus:ring-2 focus:border-transparent transition-colors cursor-text ${
                    formErrors.contactEmail ? "border-red-300 bg-red-50" : ""
                  }`}
                  style={{ 
                    background: theme.accentSoft,
                    borderColor: formErrors.contactEmail ? '#fca5a5' : theme.borderColor,
                    color: theme.textPrimary
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = theme.primaryColor;
                    e.target.style.boxShadow = `0 0 0 2px ${theme.primaryColor}20`;
                  }}
                  onBlur={(e) => {
                    if (!formErrors.contactEmail) {
                      e.target.style.borderColor = theme.borderColor;
                    }
                    e.target.style.boxShadow = "";
                  }}
                />
              </div>
              {formErrors.contactEmail && (
                <p className="mt-0.5 sm:mt-1 text-xs text-red-600">{formErrors.contactEmail}</p>
              )}
            </div>

            {/* Organizer */}
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1" style={{ color: theme.textSecondary }}>
                Organizer <span className="text-red-500">*</span>
              </label>
              <CustomSelect
                name="organizer"
                value={formData.organizer}
                onChange={handleInputChange}
                placeholder="Select organizer..."
                required
                options={[
                  { value: "Global", label: "Global" },
                  ...departments.map((dept) => ({
                    value: dept.name,
                    label: `Department: ${dept.name}`,
                  })),
                  ...clubs.map((club) => ({
                    value: club.clubName || club.name,
                    label: `Club: ${club.clubName || club.name}`,
                  })),
                ]}
                theme={theme}
              />
              {formErrors.organizer && (
                <p className="mt-0.5 sm:mt-1 text-xs text-red-600">{formErrors.organizer}</p>
              )}
            </div>

            {/* Target Audience - Responsive buttons */}
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-2 sm:mb-3" style={{ color: theme.textSecondary }}>
                Target Audience <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-col xs:flex-row flex-wrap gap-2 sm:gap-3">
                {[
                  { value: "GLOBAL",     icon: <Globe className="w-3 h-3 sm:w-4 sm:h-4" />,     label: isMobile ? "Global" : "Global (Everyone)" },
                  { value: "CLUB",       icon: <Users className="w-3 h-3 sm:w-4 sm:h-4" />,     label: isMobile ? "Clubs" : "Specific Clubs" },
                  { value: "DEPARTMENT", icon: <Building2 className="w-3 h-3 sm:w-4 sm:h-4" />, label: isMobile ? "Depts" : "Specific Departments" },
                ].map(({ value, icon, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleTargetTypeChange(value)}
                    className={`px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 rounded-lg border transition-colors flex items-center gap-1.5 sm:gap-2 cursor-pointer text-xs sm:text-sm ${
                      formData.target === value
                        ? "border-[#4CA1AF]"
                        : "hover:border-[#4CA1AF]"
                    }`}
                    style={{ 
                      borderColor: formData.target === value ? theme.primaryColor : theme.borderColor,
                      backgroundColor: formData.target === value ? theme.primaryLight : theme.accentSoft,
                      color: formData.target === value ? theme.primaryColor : theme.textSecondary
                    }}
                  >
                    {icon}
                    <span className="font-medium">{label}</span>
                    {formData.target === value && (
                      <Check className="w-3 h-3 sm:w-4 sm:h-4 ml-0.5 sm:ml-1" style={{ color: theme.primaryColor }} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Selection */}
            {formData.target !== "GLOBAL" && (
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2" style={{ color: theme.textSecondary }}>
                  Select {formData.target === "CLUB" ? "Clubs" : "Departments"}{" "}
                  <span className="text-red-500">*</span>
                </label>

                {selectedTargets.length > 0 && (
                  <div className="mb-2 sm:mb-3 flex flex-wrap gap-1.5 sm:gap-2">
                    {selectedTargets.map((target) => (
                      <span
                        key={target.id}
                        className="inline-flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm"
                        style={{ backgroundColor: theme.primaryLight, color: theme.primaryColor }}
                      >
                        <span className="max-w-[100px] sm:max-w-[150px] truncate">{target.name}</span>
                        <button
                          type="button"
                          onClick={() => removeTarget(target.id)}
                          className="hover:opacity-80 cursor-pointer flex-shrink-0"
                          style={{ color: theme.primaryColor }}
                        >
                          <X size={isMobile ? 12 : 14} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {loadingOptions ? (
                  <div className="flex items-center justify-center py-4 sm:py-6 md:py-8 rounded-lg" style={{ background: theme.accentSoft }}>
                    <Loader className="w-4 h-4 sm:w-5 sm:h-5 animate-spin mr-2" style={{ color: theme.primaryColor }} />
                    <span className="text-xs sm:text-sm" style={{ color: theme.textSecondary }}>Loading...</span>
                  </div>
                ) : (
                  <div 
                    className="border rounded-lg overflow-hidden"
                    style={{ borderColor: theme.borderColor, background: theme.accentSoft }}
                  >
                    <div className="max-h-48 sm:max-h-60 overflow-y-auto">
                      {targetOptions.length > 0 ? (
                        targetOptions.map((item) => {
                          const isSelected = selectedTargets.some((t) => t.id === item.id);
                          return (
                            <div
                              key={item.id}
                              onClick={() => toggleTargetSelection(item)}
                              className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 border-b last:border-0 cursor-pointer transition-colors"
                              style={{ 
                                borderColor: theme.borderColor,
                                backgroundColor: isSelected ? theme.primaryLight : 'transparent'
                              }}
                            >
                              <span className="text-xs sm:text-sm font-medium truncate pr-2" style={{ color: theme.textPrimary }}>{item.name}</span>
                              {isSelected && <Check className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" style={{ color: theme.primaryColor }} />}
                            </div>
                          );
                        })
                      ) : (
                        <div className="px-3 sm:px-4 py-4 sm:py-6 md:py-8 text-center text-xs sm:text-sm" style={{ color: theme.textMuted }}>
                          No {formData.target === "CLUB" ? "clubs" : "departments"} available
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {formErrors.targetIds && (
                  <p className="mt-1.5 sm:mt-2 text-xs text-red-600">{formErrors.targetIds}</p>
                )}
              </div>
            )}

            {/* Notification Type - Responsive */}
            <div 
              className="border rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 transition-colors duration-300"
              style={{ borderColor: theme.borderColor, background: theme.accentSoft }}
            >
              <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: theme.primaryColor }} />
                <label className="block text-xs sm:text-sm font-medium" style={{ color: theme.textSecondary }}>
                  Notification Type
                </label>
              </div>
              <p className="text-xs mb-2 sm:mb-3" style={{ color: theme.textMuted }}>
                {isMobile 
                  ? "Leave as Auto to detect from target audience"
                  : "Leave as Auto to detect from the target audience above, or manually override the notification type"}
              </p>

              {!formData.notificationType && (
                <div
                  className="inline-flex items-center gap-1 sm:gap-1.5 text-xs font-semibold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full mb-2 sm:mb-3"
                  style={{ backgroundColor: theme.primaryLight, color: theme.primaryColor }}
                >
                  <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  Auto →{" "}
                  {{
                    GLOBAL:     "GLOBAL",
                    CLUB:       "CLUB_SPECIFIC",
                    DEPARTMENT: "DEPARTMENT_SPECIFIC",
                  }[formData.target] || "EVENT_SPECIFIC"}
                </div>
              )}

              <CustomSelect
                name="notificationType"
                value={formData.notificationType}
                onChange={handleInputChange}
                placeholder="Auto (recommended)"
                options={[
                  { value: "",                    label: "Auto — detect from target audience" },
                  { value: "GLOBAL",              label: "Global" },
                  { value: "CLUB_SPECIFIC",       label: "Club Specific" },
                  { value: "DEPARTMENT_SPECIFIC", label: "Department Specific" },
                  { value: "YEAR_SPECIFIC",       label: "Year Specific" },
                  { value: "REMINDER",            label: "Reminder" },
                  { value: "EVENT_SPECIFIC",      label: "Event Specific" },
                ]}
                theme={theme}
              />
            </div>

            {/* Attendance Tracking Toggle */}
            <div className="border-t pt-4 sm:pt-5 md:pt-6" style={{ borderColor: theme.borderColor }}>
              <label className="flex items-center gap-2 sm:gap-3 cursor-pointer">
                <div className="relative flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={enableAttendance}
                    onChange={(e) => {
                      setEnableAttendance(e.target.checked);
                      if (!e.target.checked && mapRef.current) {
                        mapRef.current.remove();
                        mapRef.current = null;
                        markerRef.current = null;
                        circleRef.current = null;
                        mapInitializedRef.current = false;
                      }
                    }}
                    className="sr-only"
                  />
                  <div className={`w-8 sm:w-10 h-4 sm:h-6 rounded-full transition-colors ${enableAttendance ? "" : "bg-gray-300"}`}
                    style={{ backgroundColor: enableAttendance ? theme.primaryColor : (isDarkMode ? '#4B5563' : '#D1D5DB') }}>
                    <div className={`w-3 sm:w-4 h-3 sm:h-4 rounded-full bg-white transform transition-transform absolute top-0.5 sm:top-1 ${enableAttendance ? "translate-x-4 sm:translate-x-5" : "translate-x-1 sm:translate-x-1"}`} />
                  </div>
                </div>
                <span className="text-xs sm:text-sm font-medium" style={{ color: theme.textSecondary }}>
                  Enable Attendance Tracking with Geofencing
                </span>
              </label>
              <p className="mt-0.5 sm:mt-1 text-xs ml-8 sm:ml-13" style={{ color: theme.textMuted }}>
                Set up location-based attendance using map selection
              </p>
            </div>

            {/* Map and Attendance Fields */}
            {enableAttendance && (
              <div 
                className="space-y-4 sm:space-y-5 md:space-y-6 p-3 sm:p-4 md:p-5 lg:p-6 rounded-lg border transition-colors duration-300"
                style={{ background: theme.accentSoft, borderColor: theme.borderColor }}
              >
                <h3 className="text-xs sm:text-sm font-semibold" style={{ color: theme.textPrimary }}>
                  📍 Select Event Location on Map
                </h3>

                {/* Map Controls - Responsive */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && searchLocation()}
                      placeholder={isMobile ? "Search location..." : "Search for a location (e.g. Bharati Vidyapeeth, Pune)..."}
                      className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-lg focus:ring-2 focus:border-transparent cursor-text"
                      style={{ 
                        background: theme.accentSoft,
                        borderColor: theme.borderColor,
                        color: theme.textPrimary
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
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={searchLocation}
                      disabled={searchingLocation}
                      className="flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-white rounded-lg hover:opacity-90 transition-colors flex items-center justify-center gap-1 sm:gap-2 cursor-pointer disabled:opacity-60"
                      style={{ background: theme.primaryGradient }}
                    >
                      {searchingLocation ? <Loader className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" /> : <MapIcon className="w-3 h-3 sm:w-4 sm:h-4" />}
                      <span className="hidden xs:inline">Search</span>
                    </button>
                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      className="flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-white rounded-lg hover:opacity-90 transition-colors flex items-center justify-center gap-1 sm:gap-2 cursor-pointer"
                      style={{ background: theme.primaryGradient }}
                    >
                      <Crosshair className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden xs:inline">My Location</span>
                    </button>
                  </div>
                </div>

                {/* Map Container - Responsive height */}
                <div
                  ref={mapContainerRef}
                  className="w-full rounded-lg border-2 z-0"
                  style={{ 
                    height: isMobile ? "250px" : "400px",
                    borderColor: theme.borderColor 
                  }}
                />

                {/* Coordinates Display - Responsive grid */}
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4 mt-3 sm:mt-4">
                  <div>
                    <label className="block text-xs font-medium mb-0.5 sm:mb-1" style={{ color: theme.textSecondary }}>Latitude</label>
                    <input 
                      type="text" 
                      value={formData.latitude} 
                      readOnly
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border rounded-lg text-xs sm:text-sm font-mono cursor-default"
                      style={{ 
                        background: theme.accentSoft,
                        borderColor: theme.borderColor,
                        color: theme.textPrimary
                      }} 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-0.5 sm:mb-1" style={{ color: theme.textSecondary }}>Longitude</label>
                    <input 
                      type="text" 
                      value={formData.longitude} 
                      readOnly
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border rounded-lg text-xs sm:text-sm font-mono cursor-default"
                      style={{ 
                        background: theme.accentSoft,
                        borderColor: theme.borderColor,
                        color: theme.textPrimary
                      }} 
                    />
                  </div>
                  <div className="xs:col-span-2 sm:col-span-1">
                    <label className="block text-xs font-medium mb-0.5 sm:mb-1" style={{ color: theme.textSecondary }}>Radius (meters)</label>
                    <input
                      type="number"
                      name="radiusInMeters"
                      value={formData.radiusInMeters}
                      onChange={handleInputChange}
                      min="10"
                      max="1000"
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border rounded-lg text-xs sm:text-sm focus:ring-2 focus:border-transparent cursor-text"
                      style={{ 
                        background: theme.accentSoft,
                        borderColor: theme.borderColor,
                        color: theme.textPrimary
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
                </div>
                {formErrors.radius && <p className="text-xs text-red-600 mt-1">{formErrors.radius}</p>}

                {/* Attendance Window - Responsive */}
                <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <DateTimePicker
                      label="Attendance Window Start"
                      value={formData.attendanceWindowStart}
                      onChange={handleDateTimeChange("attendanceWindowStart")}
                      minValue={formData.eventDate || undefined}
                      placeholder="Select start time"
                      theme={theme}
                    />
                  </div>
                  <div>
                    <DateTimePicker
                      label="Attendance Window End"
                      value={formData.attendanceWindowEnd}
                      onChange={handleDateTimeChange("attendanceWindowEnd")}
                      minValue={formData.attendanceWindowStart || formData.eventDate || undefined}
                      placeholder="Select end time"
                      theme={theme}
                    />
                  </div>
                </div>
                {formErrors.attendanceWindow && (
                  <p className="text-xs text-red-600">{formErrors.attendanceWindow}</p>
                )}

                {/* QR Settings */}
                <div>
                  <label className="block text-xs font-medium mb-0.5 sm:mb-1" style={{ color: theme.textSecondary }}>
                    QR Refresh Interval (seconds)
                  </label>
                  <input
                    type="number"
                    name="qrRefreshIntervalSeconds"
                    value={formData.qrRefreshIntervalSeconds}
                    onChange={handleInputChange}
                    min="30"
                    max="300"
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border rounded-lg text-xs sm:text-sm focus:ring-2 focus:border-transparent cursor-text"
                    style={{ 
                      background: theme.accentSoft,
                      borderColor: theme.borderColor,
                      color: theme.textPrimary
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
                  <p className="mt-0.5 sm:mt-1 text-xs" style={{ color: theme.textMuted }}>Default: 120 seconds (2 minutes)</p>
                </div>

                {/* Map Instructions */}
                <div
                  className="rounded-lg p-2 sm:p-3"
                  style={{ backgroundColor: theme.primaryLight, borderColor: theme.primaryColor, borderWidth: "1px" }}
                >
                  <p className="text-xs flex items-center gap-1.5 sm:gap-2" style={{ color: theme.primaryColor }}>
                    <Layers className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="text-xs">
                      {isMobile 
                        ? "Click on map to set location. Drag marker to adjust."
                        : "Click on the map to set the event location. Drag the marker to adjust. The circle shows the geofencing radius."}
                    </span>
                  </p>
                </div>
                {formErrors.location && <p className="text-xs text-red-600">{formErrors.location}</p>}
              </div>
            )}

            {/* Form Actions - Responsive */}
            <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 md:gap-4 pt-4 sm:pt-5 md:pt-6 border-t" style={{ borderColor: theme.borderColor }}>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-full xs:flex-1 px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 border rounded-lg font-medium hover:bg-opacity-80 transition-colors cursor-pointer text-xs sm:text-sm"
                style={{ 
                  borderColor: theme.borderColor,
                  color: theme.textSecondary,
                  background: theme.accentSoft
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full xs:flex-1 px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 text-white rounded-lg font-medium hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer text-xs sm:text-sm"
                style={{ background: theme.primaryGradient }}
              >
                {loading ? (
                  <>
                    <Loader className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <CalendarPlus className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Create Event</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-center" style={{ color: theme.textMuted }}>
              Fields marked with <span className="text-red-500">*</span> are required
            </p>
          </form>
        </div>

        {/* Footer - Responsive */}
        <div className="mt-4 sm:mt-6 md:mt-8 text-center">
          <div className="inline-flex items-center space-x-1.5 sm:space-x-2 text-xs sm:text-sm" style={{ color: theme.textMuted }}>
            <Bell className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>{isMobile ? "Create amazing events!" : "Create an amazing event for your community!"}</span>
            <Gift className="w-3 h-3 sm:w-4 sm:h-4" />
          </div>
        </div>
      </div>

      {/* Responsive Animations */}
      <style>{`
        @keyframes blob {
          0%   { transform: translate(0px, 0px) scale(1); }
          33%  { transform: translate(30px, -50px) scale(1.1); }
          66%  { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        
        /* Responsive breakpoints */
        @media (max-width: 480px) {
          .xs\\:inline { display: inline; }
          .xs\\:hidden { display: none; }
          .xs\\:flex-row { flex-direction: row; }
          .xs\\:flex-1 { flex: 1 1 0%; }
          .xs\\:col-span-2 { grid-column: span 2 / span 2; }
        }
        @media (min-width: 481px) {
          .xs\\:inline { display: inline; }
          .xs\\:flex-row { flex-direction: row; }
          .xs\\:flex-1 { flex: 1 1 0%; }
          .xs\\:col-span-2 { grid-column: span 2 / span 2; }
        }
      `}</style>
    </div>
  );
}