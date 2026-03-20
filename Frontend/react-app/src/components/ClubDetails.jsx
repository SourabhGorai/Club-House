

// import { useState, useEffect } from "react";
// import { useParams, useNavigate, useLocation } from "react-router-dom";
// import axios from "axios";
// import {
//   Trophy,
//   Users,
//   Calendar,
//   Mail,
//   User,
//   ArrowLeft,
//   GraduationCap,
//   BookOpen,
//   Clock,
//   Plus,
//   X,
//   Phone,
//   BadgeCheck,
// } from "lucide-react";

// // ─────────────────────────────────────────────────────────────────────────────
// // Members Modal
// // ─────────────────────────────────────────────────────────────────────────────
// const MembersModal = ({ isOpen, onClose, members, loading, clubName, profileImages }) => {
//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
//       <div className="bg-white rounded-2xl shadow-2xl w-full sm:w-11/12 max-w-4xl max-h-[90vh] sm:max-h-[80vh] flex flex-col overflow-hidden">

//         {/* Header */}
//         <div className="flex justify-between items-center p-4 sm:p-8 pb-3 sm:pb-4">
//           <h3 className="font-display text-lg sm:text-2xl font-bold" style={{ color: "#4CA1AF" }}>
//             Members of {clubName}
//           </h3>
//           <button
//             onClick={onClose}
//             className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 cursor-pointer"
//           >
//             <X size={20} />
//           </button>
//         </div>

//         {/* Scrollable list */}
//         <div className="flex-1 overflow-y-auto px-4 sm:px-8">
//           {loading ? (
//             <div className="text-center py-8">
//               <div
//                 className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto"
//                 style={{ borderColor: "#4CA1AF" }}
//               />
//               <p className="mt-2 text-gray-500">Loading members...</p>
//             </div>
//           ) : members.length === 0 ? (
//             <div className="text-center py-8 text-gray-500">
//               No members found for this club
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6">
//               {members.map((member) => {
//                 const blobUrl = profileImages?.[member.prn];
//                 return (
//                   <div
//                     key={member.userClubId}
//                     className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-white hover:shadow-md transition-all"
//                   >
//                     <div className="flex items-center gap-3">
//                       <div className="w-12 h-12 rounded-full flex-shrink-0 overflow-hidden border-2 border-white shadow-md">
//                         {blobUrl ? (
//                           <img
//                             src={blobUrl}
//                             alt={member.name}
//                             className="w-12 h-12 rounded-full object-cover"
//                           />
//                         ) : (
//                           <div
//                             className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg text-white"
//                             style={{ background: "linear-gradient(135deg, #4CA1AF, #315169)" }}
//                           >
//                             {member.name?.charAt(0)?.toUpperCase() || "U"}
//                           </div>
//                         )}
//                       </div>
//                       <div>
//                         <h4 className="font-bold text-gray-800">{member.name}</h4>
//                         <p className="text-xs text-gray-500">{member.prn}</p>
//                       </div>
//                     </div>

//                     <div className="mt-3 space-y-1">
//                       <div className="flex justify-between">
//                         <span className="text-xs text-gray-500">Role:</span>
//                         <span
//                           className={`text-xs font-bold uppercase ${
//                             member.role === "CLUB_ADMIN"
//                               ? "text-[#4CA1AF]"
//                               : member.role === "TEACHER" || member.role === "TEACHERS"
//                               ? "text-green-600"
//                               : "text-blue-600"
//                           }`}
//                         >
//                           {member.role?.replace(/_/g, " ")}
//                         </span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className="text-xs text-gray-500">Department:</span>
//                         <span className="text-xs font-bold">{member.department || "—"}</span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className="text-xs text-gray-500">Year:</span>
//                         <span className="text-xs font-bold">
//                           {member.year ? `Year ${member.year}` : "—"}
//                         </span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className="text-xs text-gray-500">Tenure:</span>
//                         <span className="text-xs font-bold">{member.tenure || "—"}</span>
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </div>

//         {/* Footer */}
//         <div className="px-4 sm:px-8 py-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 bg-gray-50">
//           <span className="text-sm text-gray-500">Total: {members.length} members</span>
//           <button
//             onClick={onClose}
//             className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 cursor-pointer w-full sm:w-auto"
//           >
//             Close
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // Shared: one labelled detail row
// // ─────────────────────────────────────────────────────────────────────────────
// const DetailRow = ({ icon: Icon, label, value, iconColor = "#4CA1AF", bgColor = "#4CA1AF1A" }) => {
//   if (!value) return null;
//   return (
//     <div className="flex items-start gap-3 py-2.5 border-b border-gray-100 last:border-0">
//       <div className="mt-0.5 p-1.5 rounded-lg flex-shrink-0" style={{ background: bgColor }}>
//         <Icon size={13} style={{ color: iconColor }} />
//       </div>
//       <div className="min-w-0">
//         <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 leading-none mb-0.5">
//           {label}
//         </p>
//         <p className="text-sm font-semibold text-gray-800 break-all leading-snug">{value}</p>
//       </div>
//     </div>
//   );
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // Shared: left avatar panel
// // ─────────────────────────────────────────────────────────────────────────────
// const AvatarPanel = ({ name, blobUrl, badgeLabel, count, activeIdx }) => (
//   <div
//     className="w-full sm:w-36 flex-shrink-0 flex flex-row sm:flex-col items-center justify-between sm:justify-center gap-3 p-4 sm:p-5 border-b sm:border-b-0 sm:border-r border-gray-100"
//     style={{
//       background:
//         "linear-gradient(160deg, rgba(76,161,175,0.09) 0%, rgba(49,81,105,0.06) 100%)",
//     }}
//   >
//     <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg ring-2 ring-[#4CA1AF]/20">
//       {blobUrl ? (
//         <img src={blobUrl} alt={name} className="w-full h-full object-cover" />
//       ) : (
//         <div
//           className="w-full h-full flex items-center justify-center text-2xl font-black text-white"
//           style={{ background: "linear-gradient(135deg, #4CA1AF, #315169)" }}
//         >
//           {name?.charAt(0)?.toUpperCase() || "?"}
//         </div>
//       )}
//     </div>

//     <span
//       className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white"
//       style={{ background: "linear-gradient(135deg, #4CA1AF, #315169)" }}
//     >
//       <BadgeCheck size={10} />
//       {badgeLabel}
//     </span>

//     {count > 1 && (
//       <p className="text-[10px] text-gray-400 font-medium">
//         {activeIdx + 1} / {count}
//       </p>
//     )}
//   </div>
// );

// // ─────────────────────────────────────────────────────────────────────────────
// // Teacher Card  (split layout, no flip)
// // ─────────────────────────────────────────────────────────────────────────────
// const TeacherCard = ({ adminData, profileImages }) => {
//   const hasTeacher = !!adminData?.teacherName;
//   const blobUrl = profileImages?.[adminData?.teacherPrn];

//   return (
//     <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
//       {/* Card header strip */}
//       <div
//         className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2"
//         style={{
//           background:
//             "linear-gradient(135deg, rgba(76,161,175,0.05), rgba(76,161,175,0.10))",
//         }}
//       >
//         <div className="p-1.5 rounded-lg bg-[#4CA1AF]/10">
//           <GraduationCap size={16} className="text-[#4CA1AF]" />
//         </div>
//         <h3 className="font-bold text-gray-700 text-sm uppercase tracking-widest">
//           Teacher Advisor
//         </h3>
//       </div>

//       {hasTeacher ? (
//         <div className="flex flex-col sm:flex-row">
//           {/* Left – avatar */}
//           <AvatarPanel
//             name={adminData.teacherName}
//             blobUrl={blobUrl}
//             badgeLabel="Advisor"
//             count={1}
//             activeIdx={0}
//           />

//           {/* Right – details */}
//           <div className="flex-1 p-5 min-w-0">
//             <h4 className="text-lg font-black text-gray-800 leading-tight mb-0.5">
//               {adminData.teacherName}
//             </h4>
//             <p className="text-xs text-[#4CA1AF] font-semibold mb-4">Teacher Advisor</p>

//             <DetailRow icon={User}          label="PRN"        value={adminData.teacherPrn} iconColor="#6366F1" bgColor="#EEF2FF" />
//             <DetailRow icon={Mail}          label="Email"      value={adminData.teacherEmail} iconColor="#F59E42" bgColor="#FFF7ED" />
//             <DetailRow icon={GraduationCap} label="Department" value={adminData.teacherDepartment} iconColor="#10B981" bgColor="#ECFDF5" />
//             <DetailRow icon={Phone}         label="Phone"      value={adminData.teacherPhone} iconColor="#F43F5E" bgColor="#FEF2F2" />
//           </div>
//         </div>
//       ) : (
//         <div className="flex flex-col items-center justify-center py-14 gap-3">
//           <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
//             <GraduationCap size={28} className="text-gray-300" />
//           </div>
//           <p className="text-sm text-gray-400 font-medium">No teacher advisor assigned</p>
//         </div>
//       )}
//     </div>
//   );
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // Club Admin Card  (split layout, no flip, tab pills for multiple admins)
// // ─────────────────────────────────────────────────────────────────────────────
// const ClubAdminCard = ({ adminData, profileImages }) => {
//   const admins = adminData?.clubAdmins || [];
//   const [activeIdx, setActiveIdx] = useState(0);

//   // Reset if admin list changes
//   useEffect(() => { setActiveIdx(0); }, [admins.length]);

//   const admin = admins[activeIdx];
//   const blobUrl = admin ? profileImages?.[admin.prn] : null;

//   return (
//     <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
//       {/* Card header strip */}
//       <div
//         className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between"
//         style={{
//           background:
//             "linear-gradient(135deg, rgba(76,161,175,0.05), rgba(76,161,175,0.10))",
//         }}
//       >
//         <div className="flex items-center gap-2">
//           <div className="p-1.5 rounded-lg bg-[#4CA1AF]/10">
//             <Users size={16} className="text-[#4CA1AF]" />
//           </div>
//           <h3 className="font-bold text-gray-700 text-sm uppercase tracking-widest">
//             Club Admins
//           </h3>
//         </div>

//         {/* Numbered tab pills when there are multiple admins */}
//         {admins.length > 1 && (
//           <div className="flex gap-1.5">
//             {admins.map((_, i) => (
//               <button
//                 key={i}
//                 onClick={() => setActiveIdx(i)}
//                 className="w-6 h-6 rounded-full text-[10px] font-bold transition-all"
//                 style={
//                   i === activeIdx
//                     ? { background: "linear-gradient(135deg, #4CA1AF, #315169)", color: "white" }
//                     : { background: "#f3f4f6", color: "#9ca3af" }
//                 }
//               >
//                 {i + 1}
//               </button>
//             ))}
//           </div>
//         )}
//       </div>

//       {admins.length > 0 && admin ? (
//         <div className="flex flex-col sm:flex-row">
//           {/* Left – avatar */}
//           <AvatarPanel
//             name={admin.name}
//             blobUrl={blobUrl}
//             badgeLabel="CLub Admin"
//             count={admins.length}
//             activeIdx={activeIdx}
//           />

//           {/* Right – details */}
//           <div className="flex-1 p-5 min-w-0">
//             <h4 className="text-lg font-black text-gray-800 leading-tight mb-0.5">
//               {admin.name}
//             </h4>
//             <p className="text-xs text-[#4CA1AF] font-semibold mb-4">Club Admin</p>

//             <DetailRow icon={User}          label="PRN"        value={admin.prn} iconColor="#6366F1" bgColor="#EEF2FF" />
//             <DetailRow icon={Mail}          label="Email"      value={admin.email !== "N/A" ? admin.email : null} iconColor="#F59E42" bgColor="#FFF7ED" />
//             <DetailRow icon={GraduationCap} label="Department" value={admin.department} iconColor="#10B981" bgColor="#ECFDF5" />
//             <DetailRow icon={Calendar}      label="Tenure"     value={admin.tenure} iconColor="#F59E42" bgColor="#FFF7ED" />
//             <DetailRow icon={BookOpen}      label="Year"       value={admin.year ? `Year ${admin.year}` : null} iconColor="#6366F1" bgColor="#EEF2FF" />
//           </div>
//         </div>
//       ) : (
//         <div className="flex flex-col items-center justify-center py-14 gap-3">
//           <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
//             <Users size={28} className="text-gray-300" />
//           </div>
//           <p className="text-sm text-gray-400 font-medium">No club admins assigned</p>
//         </div>
//       )}
//     </div>
//   );
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // Main Page Component
// // ─────────────────────────────────────────────────────────────────────────────
// const BASE_URL = import.meta.env.VITE_API_URL || "http://72.155.88.211:8080";
// export default function ClubDetails() {
//   const { clubName } = useParams();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const token = localStorage.getItem("token");
//   const user = JSON.parse(localStorage.getItem("user"));
//   const userRole = user?.role || location.state?.userRole || "USER";

//   const [clubDetails, setClubDetails] = useState(null);
//   const [clubMembers, setClubMembers] = useState([]);
//   const [adminData, setAdminData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [showMembersModal, setShowMembersModal] = useState(false);
//   const [membersLoading, setMembersLoading] = useState(false);
//   const [profileImages, setProfileImages] = useState({});
  
//   // State for event counts
//   const [upcomingCount, setUpcomingCount] = useState(0);
//   const [previousCount, setPreviousCount] = useState(0);
//   const [departmentUpcomingCount, setDepartmentUpcomingCount] = useState(0);
//   const [departmentPreviousCount, setDepartmentPreviousCount] = useState(0);

//   const isTeacher =
//     userRole?.toUpperCase() === "TEACHER" ||
//     userRole?.toUpperCase() === "TEACHERS";

//   // Cleanup all blob URLs on unmount
//   useEffect(() => {
//     return () => {
//       setProfileImages((prev) => {
//         Object.values(prev).forEach((url) => { if (url) URL.revokeObjectURL(url); });
//         return {};
//       });
//     };
//   }, []);

//   useEffect(() => { fetchClubDetails(); }, [clubName]);

//   // ── helpers ──────────────────────────────────────────────────────────────

//   const fetchProfileImages = async (membersList) => {
//     const withImages = membersList.filter((m) => m.hasProfileImage && m.imageUrl);
//     const results = await Promise.all(
//       withImages.map(async (member) => {
//         try {
//           const res = await axios.get(`${BASE_URL}${member.imageUrl}`, {
//             headers: { Authorization: `Bearer ${token}` },
//             responseType: "blob",
//           });
//           if (res.data?.size > 0)
//             return { prn: member.prn, blobUrl: URL.createObjectURL(res.data) };
//           return { prn: member.prn, blobUrl: null };
//         } catch {
//           return { prn: member.prn, blobUrl: null };
//         }
//       })
//     );
//     setProfileImages(
//       results.reduce((acc, r) => { if (r) acc[r.prn] = r.blobUrl; return acc; }, {})
//     );
//   };

//   // Function to fetch event counts from targetData endpoints
//   const fetchEventCounts = async (clubId, departmentName) => {
//     try {
//       // Fetch club target data
//       console.log(`Fetching club target data for ID: ${clubId}`);
//       const clubResponse = await axios.get(
//         `${BASE_URL}/api/events/targetData/CLUB/${clubId}`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
      
//       console.log("Club target data response:", clubResponse.data);
//       console.log("Club target data structure:", JSON.stringify(clubResponse.data, null, 2));
      
//       // Based on the actual response, the data is an array of events
//       if (clubResponse.data && clubResponse.data.success && Array.isArray(clubResponse.data.data)) {
//         const events = clubResponse.data.data;
        
//         // Split events into upcoming and past based on the 'completed' flag
//         const upcoming = events.filter(event => !event.completed);
//         const past = events.filter(event => event.completed);
        
//         setUpcomingCount(upcoming.length);
//         setPreviousCount(past.length);
        
//         console.log("Split events - Upcoming:", upcoming.length, "Past:", past.length);
//       } 
//       // Alternative structure if data is directly in the response
//       else if (Array.isArray(clubResponse.data)) {
//         const events = clubResponse.data;
//         const upcoming = events.filter(event => !event.completed);
//         const past = events.filter(event => event.completed);
        
//         setUpcomingCount(upcoming.length);
//         setPreviousCount(past.length);
        
//         console.log("Split events (direct array) - Upcoming:", upcoming.length, "Past:", past.length);
//       }
//       else {
//         console.log("Unexpected response structure, trying fallback...");
//         await fetchEventCountsFallback(clubId);
//       }
      
//       // Fetch department target data if department name exists
//       if (departmentName) {
//         try {
//           console.log(`Fetching department target data for: ${departmentName}`);
//           const departmentResponse = await axios.get(
//             `${BASE_URL}/api/events/targetData/DEPARTMENT/${encodeURIComponent(departmentName)}`,
//             { headers: { Authorization: `Bearer ${token}` } }
//           );
//           console.log("Department target data response:", departmentResponse.data);
          
//           if (departmentResponse.data && departmentResponse.data.success && Array.isArray(departmentResponse.data.data)) {
//             const deptEvents = departmentResponse.data.data;
//             const deptUpcoming = deptEvents.filter(event => !event.completed);
//             const deptPast = deptEvents.filter(event => event.completed);
            
//             setDepartmentUpcomingCount(deptUpcoming.length);
//             setDepartmentPreviousCount(deptPast.length);
            
//             console.log("Department events - Upcoming:", deptUpcoming.length, "Past:", deptPast.length);
//           }
//         } catch (deptErr) {
//           console.error("Error fetching department target data:", deptErr);
//         }
//       }
//     } catch (err) {
//       console.error("Error fetching event target data:", err);
//       // Fallback to regular events API to get counts
//       await fetchEventCountsFallback(clubId);
//     }
//   };

//   // Fallback function to get counts from regular events API
//   const fetchEventCountsFallback = async (clubId) => {
//     try {
//       console.log("Using fallback to fetch event counts from regular APIs");
      
//       // Fetch upcoming events and get count
//       const upcomingRes = await axios.get(
//         `${BASE_URL}/api/events/club/${clubId}/upcoming`,
//         { 
//           headers: { Authorization: `Bearer ${token}` }, 
//           params: { page: 0, size: 1 } // Just need count, so get minimal data
//         }
//       );
      
//       if (upcomingRes?.data?.success) {
//         const totalElements = upcomingRes.data.data?.totalElements || 
//                              upcomingRes.data.data?.length || 
//                              (Array.isArray(upcomingRes.data) ? upcomingRes.data.length : 0);
//         setUpcomingCount(totalElements);
//         console.log("Fallback upcoming count:", totalElements);
//       }
      
//       // Fetch previous events and get count
//       const previousRes = await axios.get(
//         `${BASE_URL}/api/events/club/${clubId}/previous`,
//         { 
//           headers: { Authorization: `Bearer ${token}` }, 
//           params: { page: 0, size: 1 } // Just need count
//         }
//       );
      
//       if (previousRes?.data?.success) {
//         const totalElements = previousRes.data.data?.totalElements || 
//                              previousRes.data.data?.length || 
//                              (Array.isArray(previousRes.data) ? previousRes.data.length : 0);
//         setPreviousCount(totalElements);
//         console.log("Fallback previous count:", totalElements);
//       }
//     } catch (fallbackErr) {
//       console.error("Error in fallback count fetch:", fallbackErr);
//     }
//   };

//   const fetchAdminEmail = async (prn) => {
//     try {
//       const r = await axios.get(`${BASE_URL}/api/users/${prn}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       return r?.data?.email || null;
//     } catch { return null; }
//   };

//   const fetchAdminData = async (clubId) => {
//     try {
//       const r = await axios.get(`${BASE_URL}/api/clubs/${clubId}/admin`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (r?.data?.success) {
//         const data = r.data.data || {};

//         // Fetch emails for all club admins
//         const adminsWithEmail = await Promise.all(
//           (data.clubAdmins || []).map(async (a) => {
//             const email = await fetchAdminEmail(a.prn);
//             return { ...a, email: email || "N/A" };
//           })
//         );

//         // Fetch teacher email separately
//         let teacherEmail = null;
//         if (data.teacherPrn) {
//           teacherEmail = await fetchAdminEmail(data.teacherPrn);
//         }

//         setAdminData({
//           ...data,
//           clubAdmins: adminsWithEmail,
//           teacherEmail: teacherEmail || null,
//         });
//       }
//     } catch (err) { console.error("Error fetching admin data:", err); }
//   };

//   const fetchMembersByClubName = async (name) => {
//     setMembersLoading(true);
//     // Revoke previous blob URLs
//     setProfileImages((prev) => {
//       Object.values(prev).forEach((url) => { if (url) URL.revokeObjectURL(url); });
//       return {};
//     });
//     try {
//       const r = await axios.get(
//         `${BASE_URL}/api/user-clubs/club/${encodeURIComponent(name)}`,
//         { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
//       );
//       if (r?.data?.success) {
//         const members = r.data.data || [];
//         setClubMembers(members);
//         await fetchProfileImages(members);
//       }
//     } catch (err) { console.error("Error fetching members:", err); }
//     finally { setMembersLoading(false); }
//   };

//   const fetchClubDetails = async () => {
//     try {
//       setLoading(true);
//       const decoded = decodeURIComponent(clubName);
//       const res = await axios.get(`${BASE_URL}/api/clubs`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
      
//       if (res?.data?.success) {
//         const current = (res.data.data || []).find((c) => c.clubName === decoded);
//         if (current) {
//           console.log("Club details found:", current);
//           setClubDetails(current);
          
//           // Fetch all data
//           await fetchAdminData(current.clubId);
//           await fetchMembersByClubName(decoded);
//           await fetchEventCounts(current.clubId, current.category);
          
//         } else {
//           setError("Club not found");
//         }
//       }
//     } catch (err) {
//       console.error("Error fetching club details:", err);
//       setError(err.response?.data?.message || "Error fetching club details");
//     } finally { setLoading(false); }
//   };

//   const formatDate = (ds) => {
//     if (!ds) return "N/A";
//     const d = new Date(ds);
//     return isNaN(d) ? ds : d.toLocaleDateString();
//   };

//   // ── Loading state ─────────────────────────────────────────────────────────
//   if (loading) {
//     return (
//       <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
//         <div className="text-center">
//           <div className="w-16 h-16 border-4 border-[#4CA1AF] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
//           <p className="text-gray-600">Loading club details...</p>
//         </div>
//       </div>
//     );
//   }

//   // ── Error state ───────────────────────────────────────────────────────────
//   if (error || !clubDetails) {
//     return (
//       <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
//         <div className="text-center max-w-md p-8 bg-white rounded-[2rem] shadow-sm">
//           <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
//             <X className="w-10 h-10 text-red-500" />
//           </div>
//           <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
//           <p className="text-gray-600 mb-6">{error || "Club not found"}</p>
//           <button
//             onClick={() => navigate(-1)}
//             className="px-6 py-3 bg-[#4CA1AF] text-white rounded-xl font-semibold hover:bg-[#3d8a98] transition-colors"
//           >
//             Go Back
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // ── Main render ───────────────────────────────────────────────────────────
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">

//       {/* Animated background blobs */}
//       <div className="fixed inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob" />
//         <div
//           className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-2000"
//           style={{ backgroundColor: "#4CA1AF" }}
//         />
//         <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000" />
//       </div>

//       {/* Sticky top nav */}
//       <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
//           {/* <button
//             onClick={() => navigate(-1)}
//             className="flex items-center gap-2 text-gray-600 hover:text-[#4CA1AF] transition-colors group"
//           >
//             <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
//             <span className="text-sm sm:text-base">Back to Dashboard</span>
//           </button> */}
//                 <button
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
//         </div>
//       </div>

//       {/* Page body */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 relative">

//         {/* ── Club header card ── */}
//         <div className="bg-white rounded-[2rem] p-4 sm:p-8 shadow-sm border border-gray-50 mb-8">
//           <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 sm:gap-6">
//             <div className="flex items-start sm:items-center gap-3 sm:gap-6 min-w-0">
//               <div
//                 className="p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem]"
//                 style={{ backgroundColor: "rgba(76, 161, 175, 0.1)" }}
//               >
//                 <Trophy className="w-8 h-8 sm:w-12 sm:h-12" style={{ color: "#F59E42" }} />
//               </div>
//               <div className="min-w-0">
//                 <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-2 break-words">
//                   {clubDetails.clubName}
//                 </h1>
//                 <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
//                   <span
//                     className="px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold"
//                     style={{ backgroundColor: "rgba(76, 161, 175, 0.1)", color: "#26727e" }}
//                   >
//                     {clubDetails.category || "Academic Club"}
//                   </span>
//                   <span className="flex items-center gap-1 text-sm sm:text-base text-gray-600">
//                     <Users size={18} style={{ color: "#10B981" }} /> {clubMembers.length} Members
//                   </span>
//                   <span className="flex items-center gap-1 text-sm sm:text-base text-gray-600">
//                     <Calendar size={18} style={{ color: "#6366F1" }} /> Added {formatDate(clubDetails.createdAt)}
//                   </span>
//                   <div
//                     className={`px-2 py-1 rounded-md flex items-center gap-1.5 ${
//                       clubDetails.isActive ? "bg-green-50" : "bg-gray-100"
//                     }`}
//                   >
//                     <span
//                       className={`w-1.5 h-1.5 rounded-full ${
//                         clubDetails.isActive ? "bg-green-500 animate-pulse" : "bg-gray-400"
//                       }`}
//                     />
//                     <span
//                       className={`text-xs font-bold uppercase ${
//                         clubDetails.isActive ? "text-green-600" : "text-gray-500"
//                       }`}
//                     >
//                       {clubDetails.isActive ? "Active" : "Inactive"}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>
            
//           </div>
//         </div>

//         {/* ── Stats row with event counts ── */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
//           <div
//             className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-50 shadow-sm hover:shadow-md transition-all cursor-pointer"
//             onClick={() => setShowMembersModal(true)}
//           >
//             <Users className="mb-3" size={24} style={{ color: "#10B981" }} />
//             <span className="text-3xl sm:text-4xl font-black" style={{ color: "#10B981" }}>{clubMembers.length}</span>
//             <p className="text-xs font-bold uppercase text-gray-400 mt-2">Total Members</p>
//           </div>

//           <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-50 shadow-sm">
//             <Calendar className="mb-3" size={24} style={{ color: "#6366F1" }} />
//             <span className="text-3xl sm:text-4xl font-black" style={{ color: "#6366F1" }}>
//               {upcomingCount}
//             </span>
//             <p className="text-xs font-bold uppercase text-gray-400 mt-2">Upcoming Events</p>
//             {departmentUpcomingCount > 0 && (
//               <p className="text-xs text-gray-400 mt-1">
//                 Dept: {departmentUpcomingCount} upcoming
//               </p>
//             )}
//           </div>

//           <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-50 shadow-sm">
//             <Clock className="mb-3" size={24} style={{ color: "#F43F5E" }} />
//             <span className="text-3xl sm:text-4xl font-black" style={{ color: "#F43F5E" }}>
//               {previousCount}
//             </span>
//             <p className="text-xs font-bold uppercase text-gray-400 mt-2">Past Events</p>
//             {departmentPreviousCount > 0 && (
//               <p className="text-xs text-gray-400 mt-1">
//                 Dept: {departmentPreviousCount} past
//               </p>
//             )}
//           </div>
//         </div>

//         {/* ── People cards ── */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <TeacherCard adminData={adminData} profileImages={profileImages} />
//           <ClubAdminCard adminData={adminData} profileImages={profileImages} />
//         </div>
//       </div>

//       {/* Global keyframe styles */}
//       <style jsx>{`
//         @keyframes blob {
//           0%   { transform: translate(0px,   0px)   scale(1);   }
//           33%  { transform: translate(30px,  -50px) scale(1.1); }
//           66%  { transform: translate(-20px,  20px) scale(0.9); }
//           100% { transform: translate(0px,   0px)   scale(1);   }
//         }
//         .animate-blob           { animation: blob 7s infinite; }
//         .animation-delay-2000   { animation-delay: 2s; }
//         .animation-delay-4000   { animation-delay: 4s; }
//       `}</style>

//       {/* Members modal */}
//       <MembersModal
//         isOpen={showMembersModal}
//         onClose={() => setShowMembersModal(false)}
//         members={clubMembers}
//         loading={membersLoading}
//         clubName={clubDetails.clubName}
//         profileImages={profileImages}
//       />
//     </div>
//   );
// }


import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  Trophy,
  Users,
  Calendar,
  Mail,
  User,
  ArrowLeft,
  GraduationCap,
  BookOpen,
  Clock,
  Plus,
  X,
  Phone,
  BadgeCheck,
  Moon,
  Sun,
} from "lucide-react";

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

// ─────────────────────────────────────────────────────────────────────────────
// Members Modal with theme support
// ─────────────────────────────────────────────────────────────────────────────
const MembersModal = ({ isOpen, onClose, members, loading, clubName, profileImages, theme }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
      <div 
        className="rounded-2xl shadow-2xl w-full sm:w-11/12 max-w-4xl max-h-[90vh] sm:max-h-[80vh] flex flex-col overflow-hidden transition-colors duration-300"
        style={{ background: theme.bgCard, border: `1px solid ${theme.borderColor}` }}
      >

        {/* Header */}
        <div className="flex justify-between items-center p-4 sm:p-8 pb-3 sm:pb-4">
          <h3 className="font-display text-lg sm:text-2xl font-bold" style={{ color: theme.primaryColor }}>
            Members of {clubName}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full transition-colors cursor-pointer"
            style={{ color: theme.textMuted, background: theme.accentSoft }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-8">
          {loading ? (
            <div className="text-center py-8">
              <div
                className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto"
                style={{ borderColor: theme.primaryColor }}
              />
              <p className="mt-2" style={{ color: theme.textMuted }}>Loading members...</p>
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-8" style={{ color: theme.textMuted }}>
              No members found for this club
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6">
              {members.map((member) => {
                const blobUrl = profileImages?.[member.prn];
                return (
                  <div
                    key={member.userClubId}
                    className="p-4 rounded-xl border transition-all hover:shadow-md"
                    style={{ 
                      background: theme.accentSoft, 
                      borderColor: theme.borderColor,
                      color: theme.textPrimary
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full flex-shrink-0 overflow-hidden border-2 border-white shadow-md">
                        {blobUrl ? (
                          <img
                            src={blobUrl}
                            alt={member.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg text-white"
                            style={{ background: theme.primaryGradient }}
                          >
                            {member.name?.charAt(0)?.toUpperCase() || "U"}
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold" style={{ color: theme.textPrimary }}>{member.name}</h4>
                        <p className="text-xs" style={{ color: theme.textMuted }}>{member.prn}</p>
                      </div>
                    </div>

                    <div className="mt-3 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-xs" style={{ color: theme.textMuted }}>Role:</span>
                        <span
                          className={`text-xs font-bold uppercase ${
                            member.role === "CLUB_ADMIN"
                              ? "text-[#4CA1AF]"
                              : member.role === "TEACHER" || member.role === "TEACHERS"
                              ? "text-green-600"
                              : "text-blue-600"
                          }`}
                        >
                          {member.role?.replace(/_/g, " ")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs" style={{ color: theme.textMuted }}>Department:</span>
                        <span className="text-xs font-bold" style={{ color: theme.textPrimary }}>{member.department || "—"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs" style={{ color: theme.textMuted }}>Year:</span>
                        <span className="text-xs font-bold" style={{ color: theme.textPrimary }}>
                          {member.year ? `Year ${member.year}` : "—"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs" style={{ color: theme.textMuted }}>Tenure:</span>
                        <span className="text-xs font-bold" style={{ color: theme.textPrimary }}>{member.tenure || "—"}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div 
          className="px-4 sm:px-8 py-4 border-t flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0"
          style={{ borderColor: theme.borderColor, background: theme.accentSoft }}
        >
          <span className="text-sm" style={{ color: theme.textMuted }}>Total: {members.length} members</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer w-full sm:w-auto"
            style={{ 
              background: theme.accentSoft,
              color: theme.textSecondary,
              border: `1px solid ${theme.borderColor}`
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Shared: one labelled detail row with theme support
// ─────────────────────────────────────────────────────────────────────────────
const DetailRow = ({ icon: Icon, label, value, iconColor = "#4CA1AF", bgColor = "#4CA1AF1A", theme }) => {
  if (!value) return null;
  const iconColorFinal = theme?.isDarkMode ? theme.primaryColor : iconColor;
  const bgColorFinal = theme?.isDarkMode ? theme.primaryLight : bgColor;
  
  return (
    <div className="flex items-start gap-3 py-2.5 border-b last:border-0" style={{ borderColor: theme?.borderColor }}>
      <div className="mt-0.5 p-1.5 rounded-lg flex-shrink-0" style={{ background: bgColorFinal }}>
        <Icon size={13} style={{ color: iconColorFinal }} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider leading-none mb-0.5" style={{ color: theme?.textMuted }}>
          {label}
        </p>
        <p className="text-sm font-semibold break-all leading-snug" style={{ color: theme?.textPrimary }}>{value}</p>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Shared: left avatar panel with theme support
// ─────────────────────────────────────────────────────────────────────────────
const AvatarPanel = ({ name, blobUrl, badgeLabel, count, activeIdx, theme }) => (
  <div
    className="w-full sm:w-36 flex-shrink-0 flex flex-row sm:flex-col items-center justify-between sm:justify-center gap-3 p-4 sm:p-5 border-b sm:border-b-0 sm:border-r"
    style={{
      background: theme.accentSoft,
      borderColor: theme.borderColor,
    }}
  >
    <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg ring-2" style={{ ringColor: `${theme.primaryColor}20` }}>
      {blobUrl ? (
        <img src={blobUrl} alt={name} className="w-full h-full object-cover" />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center text-2xl font-black text-white"
          style={{ background: theme.primaryGradient }}
        >
          {name?.charAt(0)?.toUpperCase() || "?"}
        </div>
      )}
    </div>

    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white"
      style={{ background: theme.primaryGradient }}
    >
      <BadgeCheck size={10} />
      {badgeLabel}
    </span>

    {count > 1 && (
      <p className="text-[10px] font-medium" style={{ color: theme.textMuted }}>
        {activeIdx + 1} / {count}
      </p>
    )}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Teacher Card with theme support
// ─────────────────────────────────────────────────────────────────────────────
const TeacherCard = ({ adminData, profileImages, theme }) => {
  const hasTeacher = !!adminData?.teacherName;
  const blobUrl = profileImages?.[adminData?.teacherPrn];

  return (
    <div 
      className="rounded-2xl border shadow-sm overflow-hidden transition-colors duration-300"
      style={{ background: theme.bgCard, borderColor: theme.borderColor }}
    >
      {/* Card header strip */}
      <div
        className="px-5 py-3.5 border-b flex items-center gap-2"
        style={{
          background: theme.accentSoft,
          borderColor: theme.borderColor,
        }}
      >
        <div className="p-1.5 rounded-lg" style={{ background: theme.primaryLight }}>
          <GraduationCap size={16} style={{ color: theme.primaryColor }} />
        </div>
        <h3 className="font-bold text-sm uppercase tracking-widest" style={{ color: theme.textSecondary }}>
          Teacher Advisor
        </h3>
      </div>

      {hasTeacher ? (
        <div className="flex flex-col sm:flex-row">
          {/* Left – avatar */}
          <AvatarPanel
            name={adminData.teacherName}
            blobUrl={blobUrl}
            badgeLabel="Advisor"
            count={1}
            activeIdx={0}
            theme={theme}
          />

          {/* Right – details */}
          <div className="flex-1 p-5 min-w-0">
            <h4 className="text-lg font-black leading-tight mb-0.5" style={{ color: theme.textPrimary }}>
              {adminData.teacherName}
            </h4>
            <p className="text-xs font-semibold mb-4" style={{ color: theme.primaryColor }}>Teacher Advisor</p>

            <DetailRow icon={User}          label="PRN"        value={adminData.teacherPrn} iconColor="#6366F1" bgColor="#EEF2FF" theme={theme} />
            <DetailRow icon={Mail}          label="Email"      value={adminData.teacherEmail} iconColor="#F59E42" bgColor="#FFF7ED" theme={theme} />
            <DetailRow icon={GraduationCap} label="Department" value={adminData.teacherDepartment} iconColor="#10B981" bgColor="#ECFDF5" theme={theme} />
            <DetailRow icon={Phone}         label="Phone"      value={adminData.teacherPhone} iconColor="#F43F5E" bgColor="#FEF2F2" theme={theme} />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-14 gap-3">
          <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: theme.accentSoft }}>
            <GraduationCap size={28} style={{ color: theme.textMuted }} />
          </div>
          <p className="text-sm font-medium" style={{ color: theme.textMuted }}>No teacher advisor assigned</p>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Club Admin Card with theme support
// ─────────────────────────────────────────────────────────────────────────────
const ClubAdminCard = ({ adminData, profileImages, theme }) => {
  const admins = adminData?.clubAdmins || [];
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => { setActiveIdx(0); }, [admins.length]);

  const admin = admins[activeIdx];
  const blobUrl = admin ? profileImages?.[admin.prn] : null;

  return (
    <div 
      className="rounded-2xl border shadow-sm overflow-hidden transition-colors duration-300"
      style={{ background: theme.bgCard, borderColor: theme.borderColor }}
    >
      {/* Card header strip */}
      <div
        className="px-5 py-3.5 border-b flex items-center justify-between"
        style={{
          background: theme.accentSoft,
          borderColor: theme.borderColor,
        }}
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg" style={{ background: theme.primaryLight }}>
            <Users size={16} style={{ color: theme.primaryColor }} />
          </div>
          <h3 className="font-bold text-sm uppercase tracking-widest" style={{ color: theme.textSecondary }}>
            Club Admins
          </h3>
        </div>

        {admins.length > 1 && (
          <div className="flex gap-1.5">
            {admins.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                className="w-6 h-6 rounded-full text-[10px] font-bold transition-all"
                style={
                  i === activeIdx
                    ? { background: theme.primaryGradient, color: "white" }
                    : { background: theme.accentSoft, color: theme.textMuted }
                }
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {admins.length > 0 && admin ? (
        <div className="flex flex-col sm:flex-row">
          {/* Left – avatar */}
          <AvatarPanel
            name={admin.name}
            blobUrl={blobUrl}
            badgeLabel="Club Admin"
            count={admins.length}
            activeIdx={activeIdx}
            theme={theme}
          />

          {/* Right – details */}
          <div className="flex-1 p-5 min-w-0">
            <h4 className="text-lg font-black leading-tight mb-0.5" style={{ color: theme.textPrimary }}>
              {admin.name}
            </h4>
            <p className="text-xs font-semibold mb-4" style={{ color: theme.primaryColor }}>Club Admin</p>

            <DetailRow icon={User}          label="PRN"        value={admin.prn} iconColor="#6366F1" bgColor="#EEF2FF" theme={theme} />
            <DetailRow icon={Mail}          label="Email"      value={admin.email !== "N/A" ? admin.email : null} iconColor="#F59E42" bgColor="#FFF7ED" theme={theme} />
            <DetailRow icon={GraduationCap} label="Department" value={admin.department} iconColor="#10B981" bgColor="#ECFDF5" theme={theme} />
            <DetailRow icon={Calendar}      label="Tenure"     value={admin.tenure} iconColor="#F59E42" bgColor="#FFF7ED" theme={theme} />
            <DetailRow icon={BookOpen}      label="Year"       value={admin.year ? `Year ${admin.year}` : null} iconColor="#6366F1" bgColor="#EEF2FF" theme={theme} />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-14 gap-3">
          <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: theme.accentSoft }}>
            <Users size={28} style={{ color: theme.textMuted }} />
          </div>
          <p className="text-sm font-medium" style={{ color: theme.textMuted }}>No club admins assigned</p>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Page Component
// ─────────────────────────────────────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_URL || "http://72.155.88.211:8080";
export default function ClubDetails() {
  const { clubName } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const userRole = user?.role || location.state?.userRole || "USER";

  // ── Theme state ───────────────────────────────────────────────────────────
  const [isDarkMode, setIsDarkMode] = useState(() =>
    localStorage.getItem("clubDetailsTheme") === "dark"
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
    localStorage.setItem("clubDetailsTheme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const [clubDetails, setClubDetails] = useState(null);
  const [clubMembers, setClubMembers] = useState([]);
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [membersLoading, setMembersLoading] = useState(false);
  const [profileImages, setProfileImages] = useState({});
  
  // State for event counts
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [previousCount, setPreviousCount] = useState(0);
  const [departmentUpcomingCount, setDepartmentUpcomingCount] = useState(0);
  const [departmentPreviousCount, setDepartmentPreviousCount] = useState(0);

  const isTeacher =
    userRole?.toUpperCase() === "TEACHER" ||
    userRole?.toUpperCase() === "TEACHERS";

  // Cleanup all blob URLs on unmount
  useEffect(() => {
    return () => {
      setProfileImages((prev) => {
        Object.values(prev).forEach((url) => { if (url) URL.revokeObjectURL(url); });
        return {};
      });
    };
  }, []);

  useEffect(() => { fetchClubDetails(); }, [clubName]);

  // ── helpers ──────────────────────────────────────────────────────────────

  const fetchProfileImages = async (membersList) => {
    const withImages = membersList.filter((m) => m.hasProfileImage && m.imageUrl);
    const results = await Promise.all(
      withImages.map(async (member) => {
        try {
          const res = await axios.get(`${BASE_URL}${member.imageUrl}`, {
            headers: { Authorization: `Bearer ${token}` },
            responseType: "blob",
          });
          if (res.data?.size > 0)
            return { prn: member.prn, blobUrl: URL.createObjectURL(res.data) };
          return { prn: member.prn, blobUrl: null };
        } catch {
          return { prn: member.prn, blobUrl: null };
        }
      })
    );
    setProfileImages(
      results.reduce((acc, r) => { if (r) acc[r.prn] = r.blobUrl; return acc; }, {})
    );
  };

  const fetchEventCounts = async (clubId, departmentName) => {
    try {
      console.log(`Fetching club target data for ID: ${clubId}`);
      const clubResponse = await axios.get(
        `${BASE_URL}/api/events/targetData/CLUB/${clubId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (clubResponse.data && clubResponse.data.success && Array.isArray(clubResponse.data.data)) {
        const events = clubResponse.data.data;
        const upcoming = events.filter(event => !event.completed);
        const past = events.filter(event => event.completed);
        
        setUpcomingCount(upcoming.length);
        setPreviousCount(past.length);
        
        console.log("Split events - Upcoming:", upcoming.length, "Past:", past.length);
      } 
      else if (Array.isArray(clubResponse.data)) {
        const events = clubResponse.data;
        const upcoming = events.filter(event => !event.completed);
        const past = events.filter(event => event.completed);
        
        setUpcomingCount(upcoming.length);
        setPreviousCount(past.length);
      }
      else {
        console.log("Unexpected response structure, trying fallback...");
        await fetchEventCountsFallback(clubId);
      }
      
      if (departmentName) {
        try {
          console.log(`Fetching department target data for: ${departmentName}`);
          const departmentResponse = await axios.get(
            `${BASE_URL}/api/events/targetData/DEPARTMENT/${encodeURIComponent(departmentName)}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          if (departmentResponse.data && departmentResponse.data.success && Array.isArray(departmentResponse.data.data)) {
            const deptEvents = departmentResponse.data.data;
            const deptUpcoming = deptEvents.filter(event => !event.completed);
            const deptPast = deptEvents.filter(event => event.completed);
            
            setDepartmentUpcomingCount(deptUpcoming.length);
            setDepartmentPreviousCount(deptPast.length);
          }
        } catch (deptErr) {
          console.error("Error fetching department target data:", deptErr);
        }
      }
    } catch (err) {
      console.error("Error fetching event target data:", err);
      await fetchEventCountsFallback(clubId);
    }
  };

  const fetchEventCountsFallback = async (clubId) => {
    try {
      console.log("Using fallback to fetch event counts from regular APIs");
      
      const upcomingRes = await axios.get(
        `${BASE_URL}/api/events/club/${clubId}/upcoming`,
        { 
          headers: { Authorization: `Bearer ${token}` }, 
          params: { page: 0, size: 1 }
        }
      );
      
      if (upcomingRes?.data?.success) {
        const totalElements = upcomingRes.data.data?.totalElements || 
                             upcomingRes.data.data?.length || 
                             (Array.isArray(upcomingRes.data) ? upcomingRes.data.length : 0);
        setUpcomingCount(totalElements);
      }
      
      const previousRes = await axios.get(
        `${BASE_URL}/api/events/club/${clubId}/previous`,
        { 
          headers: { Authorization: `Bearer ${token}` }, 
          params: { page: 0, size: 1 }
        }
      );
      
      if (previousRes?.data?.success) {
        const totalElements = previousRes.data.data?.totalElements || 
                             previousRes.data.data?.length || 
                             (Array.isArray(previousRes.data) ? previousRes.data.length : 0);
        setPreviousCount(totalElements);
      }
    } catch (fallbackErr) {
      console.error("Error in fallback count fetch:", fallbackErr);
    }
  };

  const fetchAdminEmail = async (prn) => {
    try {
      const r = await axios.get(`${BASE_URL}/api/users/${prn}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return r?.data?.email || null;
    } catch { return null; }
  };

  const fetchAdminData = async (clubId) => {
    try {
      const r = await axios.get(`${BASE_URL}/api/clubs/${clubId}/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (r?.data?.success) {
        const data = r.data.data || {};

        const adminsWithEmail = await Promise.all(
          (data.clubAdmins || []).map(async (a) => {
            const email = await fetchAdminEmail(a.prn);
            return { ...a, email: email || "N/A" };
          })
        );

        let teacherEmail = null;
        if (data.teacherPrn) {
          teacherEmail = await fetchAdminEmail(data.teacherPrn);
        }

        setAdminData({
          ...data,
          clubAdmins: adminsWithEmail,
          teacherEmail: teacherEmail || null,
        });
      }
    } catch (err) { console.error("Error fetching admin data:", err); }
  };

  const fetchMembersByClubName = async (name) => {
    setMembersLoading(true);
    setProfileImages((prev) => {
      Object.values(prev).forEach((url) => { if (url) URL.revokeObjectURL(url); });
      return {};
    });
    try {
      const r = await axios.get(
        `${BASE_URL}/api/user-clubs/club/${encodeURIComponent(name)}`,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      if (r?.data?.success) {
        const members = r.data.data || [];
        setClubMembers(members);
        await fetchProfileImages(members);
      }
    } catch (err) { console.error("Error fetching members:", err); }
    finally { setMembersLoading(false); }
  };

  const fetchClubDetails = async () => {
    try {
      setLoading(true);
      const decoded = decodeURIComponent(clubName);
      const res = await axios.get(`${BASE_URL}/api/clubs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res?.data?.success) {
        const current = (res.data.data || []).find((c) => c.clubName === decoded);
        if (current) {
          console.log("Club details found:", current);
          setClubDetails(current);
          await fetchAdminData(current.clubId);
          await fetchMembersByClubName(decoded);
          await fetchEventCounts(current.clubId, current.category);
        } else {
          setError("Club not found");
        }
      }
    } catch (err) {
      console.error("Error fetching club details:", err);
      setError(err.response?.data?.message || "Error fetching club details");
    } finally { setLoading(false); }
  };

  const formatDate = (ds) => {
    if (!ds) return "N/A";
    const d = new Date(ds);
    return isNaN(d) ? ds : d.toLocaleDateString();
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center transition-colors duration-300"
        style={{ background: theme.bgGradient }}
      >
        <div className="text-center">
          <div 
            className="w-16 h-16 border-4 rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: `${theme.primaryColor}20`, borderTopColor: theme.primaryColor }}
          />
          <p className="font-medium" style={{ color: theme.textSecondary }}>Loading club details...</p>
        </div>
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────
  if (error || !clubDetails) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center transition-colors duration-300"
        style={{ background: theme.bgGradient }}
      >
        <div 
          className="text-center max-w-md p-8 rounded-[2rem] shadow-sm"
          style={{ background: theme.bgCard, border: `1px solid ${theme.borderColor}` }}
        >
          <div 
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: `${theme.primaryColor}10` }}
          >
            <X className="w-10 h-10" style={{ color: "#ef4444" }} />
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: theme.textPrimary }}>Oops!</h2>
          <p className="mb-6" style={{ color: theme.textSecondary }}>{error || "Club not found"}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 rounded-xl font-semibold transition-colors text-white"
            style={{ background: theme.primaryGradient }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <div 
      className="min-h-screen relative transition-colors duration-300"
      style={{ background: theme.bgGradient }}
    >

      {/* Animated background blobs - only show in light mode */}
      {!isDarkMode && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob" />
          <div
            className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-2000"
            style={{ backgroundColor: theme.primaryColor }}
          />
          <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000" />
        </div>
      )}

      {/* Sticky top nav */}
      <div 
        className="sticky top-0 z-10 border-b backdrop-blur-sm transition-colors duration-300"
        style={{ 
          background: isDarkMode ? 'rgba(32, 33, 35, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          borderColor: theme.borderColor
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
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

            {/* Theme Toggle */}
            <button
              onClick={() => setIsDarkMode((prev) => !prev)}
              className="p-2 rounded-xl transition-colors cursor-pointer"
              style={{ background: theme.accentSoft, color: theme.textSecondary }}
              title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Page body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 relative">

        {/* ── Club header card ── */}
        <div 
          className="rounded-[2rem] p-4 sm:p-8 shadow-sm border mb-8 transition-colors duration-300"
          style={{ background: theme.bgCard, borderColor: theme.borderColor }}
        >
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 sm:gap-6">
            <div className="flex items-start sm:items-center gap-3 sm:gap-6 min-w-0">
              <div
                className="p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem]"
                style={{ backgroundColor: theme.primaryLight }}
              >
                <Trophy className="w-8 h-8 sm:w-12 sm:h-12" style={{ color: "#F59E42" }} />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-4xl font-bold mb-2 break-words" style={{ color: theme.textPrimary }}>
                  {clubDetails.clubName}
                </h1>
                <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                  <span
                    className="px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold"
                    style={{ backgroundColor: theme.primaryLight, color: theme.primaryColor }}
                  >
                    {clubDetails.category || "Academic Club"}
                  </span>
                  <span className="flex items-center gap-1 text-sm sm:text-base" style={{ color: theme.textSecondary }}>
                    <Users size={18} style={{ color: "#10B981" }} /> {clubMembers.length} Members
                  </span>
                  <span className="flex items-center gap-1 text-sm sm:text-base" style={{ color: theme.textSecondary }}>
                    <Calendar size={18} style={{ color: "#6366F1" }} /> Added {formatDate(clubDetails.createdAt)}
                  </span>
                  <div
                    className={`px-2 py-1 rounded-md flex items-center gap-1.5`}
                    style={{ background: clubDetails.isActive ? "rgba(16,185,129,0.1)" : theme.accentSoft }}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        clubDetails.isActive ? "bg-green-500 animate-pulse" : "bg-gray-400"
                      }`}
                    />
                    <span
                      className={`text-xs font-bold uppercase ${
                        clubDetails.isActive ? "text-green-600" : "text-gray-500"
                      }`}
                    >
                      {clubDetails.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>

        {/* ── Stats row with event counts ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <div
            className="p-4 sm:p-6 rounded-2xl border shadow-sm hover:shadow-md transition-all cursor-pointer"
            style={{ 
              background: theme.bgCard, 
              borderColor: theme.borderColor,
              boxShadow: isDarkMode ? '0 4px 6px -1px rgba(0,0,0,0.3)' : '0 1px 2px 0 rgba(0,0,0,0.05)'
            }}
            onClick={() => setShowMembersModal(true)}
          >
            <Users className="mb-3" size={24} style={{ color: "#10B981" }} />
            <span className="text-3xl sm:text-4xl font-black" style={{ color: "#10B981" }}>{clubMembers.length}</span>
            <p className="text-xs font-bold uppercase mt-2" style={{ color: theme.textMuted }}>Total Members</p>
          </div>

          <div 
            className="p-4 sm:p-6 rounded-2xl border shadow-sm"
            style={{ 
              background: theme.bgCard, 
              borderColor: theme.borderColor,
              boxShadow: isDarkMode ? '0 4px 6px -1px rgba(0,0,0,0.3)' : '0 1px 2px 0 rgba(0,0,0,0.05)'
            }}
          >
            <Calendar className="mb-3" size={24} style={{ color: "#6366F1" }} />
            <span className="text-3xl sm:text-4xl font-black" style={{ color: "#6366F1" }}>
              {upcomingCount}
            </span>
            <p className="text-xs font-bold uppercase mt-2" style={{ color: theme.textMuted }}>Upcoming Events</p>
            {departmentUpcomingCount > 0 && (
              <p className="text-xs mt-1" style={{ color: theme.textMuted }}>
                Dept: {departmentUpcomingCount} upcoming
              </p>
            )}
          </div>

          <div 
            className="p-4 sm:p-6 rounded-2xl border shadow-sm"
            style={{ 
              background: theme.bgCard, 
              borderColor: theme.borderColor,
              boxShadow: isDarkMode ? '0 4px 6px -1px rgba(0,0,0,0.3)' : '0 1px 2px 0 rgba(0,0,0,0.05)'
            }}
          >
            <Clock className="mb-3" size={24} style={{ color: "#F43F5E" }} />
            <span className="text-3xl sm:text-4xl font-black" style={{ color: "#F43F5E" }}>
              {previousCount}
            </span>
            <p className="text-xs font-bold uppercase mt-2" style={{ color: theme.textMuted }}>Past Events</p>
            {departmentPreviousCount > 0 && (
              <p className="text-xs mt-1" style={{ color: theme.textMuted }}>
                Dept: {departmentPreviousCount} past
              </p>
            )}
          </div>
        </div>

        {/* ── People cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TeacherCard adminData={adminData} profileImages={profileImages} theme={theme} />
          <ClubAdminCard adminData={adminData} profileImages={profileImages} theme={theme} />
        </div>
      </div>

      {/* Global keyframe styles */}
      <style>{`
        @keyframes blob {
          0%   { transform: translate(0px,   0px)   scale(1);   }
          33%  { transform: translate(30px,  -50px) scale(1.1); }
          66%  { transform: translate(-20px,  20px) scale(0.9); }
          100% { transform: translate(0px,   0px)   scale(1);   }
        }
        .animate-blob           { animation: blob 7s infinite; }
        .animation-delay-2000   { animation-delay: 2s; }
        .animation-delay-4000   { animation-delay: 4s; }
      `}</style>

      {/* Members modal */}
      <MembersModal
        isOpen={showMembersModal}
        onClose={() => setShowMembersModal(false)}
        members={clubMembers}
        loading={membersLoading}
        clubName={clubDetails.clubName}
        profileImages={profileImages}
        theme={theme}
      />
    </div>
  );
}