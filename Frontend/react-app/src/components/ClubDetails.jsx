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
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md">
//       <div className="bg-white rounded-2xl shadow-2xl w-11/12 max-w-4xl max-h-[80vh] flex flex-col overflow-hidden">

//         {/* Header */}
//         <div className="flex justify-between items-center p-8 pb-4">
//           <h3 className="font-display text-2xl font-bold" style={{ color: "#4CA1AF" }}>
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
//         <div className="flex-1 overflow-y-auto px-8">
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
//         <div className="px-8 py-4 border-t border-gray-200 flex justify-between items-center bg-gray-50">
//           <span className="text-sm text-gray-500">Total: {members.length} members</span>
//           <button
//             onClick={onClose}
//             className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 cursor-pointer"
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
//     className="w-36 flex-shrink-0 flex flex-col items-center justify-center gap-3 p-5 border-r border-gray-100"
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
//         <div className="flex">
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
//         <div className="flex">
//           {/* Left – avatar */}
//           <AvatarPanel
//             name={admin.name}
//             blobUrl={blobUrl}
//             badgeLabel="Admin"
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
// export default function ClubDetails() {
//   const { clubName } = useParams();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const token = localStorage.getItem("token");
//   const user = JSON.parse(localStorage.getItem("user"));
//   const userRole = user?.role || location.state?.userRole || "USER";

//   const [clubDetails,      setClubDetails]      = useState(null);
//   const [clubMembers,      setClubMembers]       = useState([]);
//   const [adminData,        setAdminData]         = useState(null);
//   const [loading,          setLoading]           = useState(true);
//   const [error,            setError]             = useState(null);
//   const [showMembersModal, setShowMembersModal]  = useState(false);
//   const [membersLoading,   setMembersLoading]    = useState(false);
//   const [profileImages,    setProfileImages]     = useState({}); // prn -> blobUrl
//   const [upcomingEvents,   setUpcomingEvents]    = useState([]);
//   const [previousEvents,   setPreviousEvents]    = useState([]);

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
//           const res = await axios.get(`http://localhost:8080${member.imageUrl}`, {
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

//   const fetchUpcomingEvents = async (clubId) => {
//     try {
//       const r = await axios.get(
//         `http://localhost:8080/api/events/club/${clubId}/upcoming`,
//         { headers: { Authorization: `Bearer ${token}` }, params: { page: 0, size: 5, sort: "startDate,asc" } }
//       );
//       if (r?.data?.success) setUpcomingEvents(r.data.data.content || []);
//     } catch { setUpcomingEvents([]); }
//   };

//   const fetchPreviousEvents = async (clubId) => {
//     try {
//       const r = await axios.get(
//         `http://localhost:8080/api/events/club/${clubId}/previous`,
//         { headers: { Authorization: `Bearer ${token}` }, params: { page: 0, size: 5, sort: "startDate,desc" } }
//       );
//       if (r?.data?.success) setPreviousEvents(r.data.data.content || []);
//     } catch { setPreviousEvents([]); }
//   };

//   const fetchAdminEmail = async (prn) => {
//     try {
//       const r = await axios.get(`http://localhost:8080/api/users/${prn}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       return r?.data?.email || null;
//     } catch { return null; }
//   };

//   const fetchAdminData = async (clubId) => {
//     try {
//       const r = await axios.get(`http://localhost:8080/api/clubs/${clubId}/admin`, {
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

//         // Fetch teacher email separately (not included in AdminResponse DTO)
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
//         `http://localhost:8080/api/user-clubs/club/${encodeURIComponent(name)}`,
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
//       const res = await axios.get("http://localhost:8080/api/clubs", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (res?.data?.success) {
//         const current = (res.data.data || []).find((c) => c.clubName === decoded);
//         if (current) {
//           setClubDetails(current);
//           await fetchAdminData(current.clubId);
//           await fetchMembersByClubName(decoded);
//           await fetchUpcomingEvents(current.clubId);
//           await fetchPreviousEvents(current.clubId);
//         } else {
//           setError("Club not found");
//         }
//       }
//     } catch (err) {
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
//         <div className="max-w-7xl mx-auto px-6 py-4">
//           <button
//             onClick={() => navigate(-1)}
//             className="flex items-center gap-2 text-gray-600 hover:text-[#4CA1AF] transition-colors group"
//           >
//             <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
//             <span>Back to Dashboard</span>
//           </button>
//         </div>
//       </div>

//       {/* Page body */}
//       <div className="max-w-7xl mx-auto px-6 py-8 relative">

//         {/* ── Club header card ── */}
//         <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-50 mb-8">
//           <div className="flex items-start justify-between">
//             <div className="flex items-center gap-6">
//               <div
//                 className="p-6 rounded-[2rem]"
//                 style={{ backgroundColor: "rgba(76, 161, 175, 0.1)" }}
//               >
//                 <Trophy className="w-12 h-12" style={{ color: "#F59E42" }} />
//               </div>
//               <div>
//                 <h1 className="text-4xl font-bold text-gray-800 mb-2">
//                   {clubDetails.clubName}
//                 </h1>
//                 <div className="flex items-center gap-4 flex-wrap">
//                   <span
//                     className="px-4 py-1.5 rounded-full text-sm font-semibold"
//                     style={{ backgroundColor: "rgba(76, 161, 175, 0.1)", color: "#26727e" }}
//                   >
//                     {clubDetails.category || "Academic Club"}
//                   </span>
//                   <span className="flex items-center gap-1 text-gray-600">
//                     <Users size={18} style={{ color: "#10B981" }} /> {clubMembers.length} Members
//                   </span>
//                   <span className="flex items-center gap-1 text-gray-600">
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

//             {clubDetails.isActive && isTeacher && (
//               <button
//                 onClick={() =>
//                   navigate(
//                     `/create-event?clubId=${clubDetails.clubId}&clubName=${encodeURIComponent(clubDetails.clubName)}`
//                   )
//                 }
//                 className="px-5 py-2.5 bg-[#4CA1AF] text-white rounded-xl font-semibold hover:bg-[#3d8a98] transition-colors flex items-center gap-2"
//               >
//                 <Plus size={18} /> Add Event
//               </button>
//             )}
//           </div>
//         </div>

//         {/* ── Stats row ── */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//           <div
//             className="bg-white p-6 rounded-2xl border border-gray-50 shadow-sm hover:shadow-md transition-all cursor-pointer"
//             onClick={() => setShowMembersModal(true)}
//           >
//             <Users className="mb-3" size={24} style={{ color: "#10B981" }} />
//             <span className="text-4xl font-black" style={{ color: "#10B981" }}>{clubMembers.length}</span>
//             <p className="text-xs font-bold uppercase text-gray-400 mt-2">Total Members</p>
//           </div>

//           <div className="bg-white p-6 rounded-2xl border border-gray-50 shadow-sm">
//             <Calendar className="mb-3" size={24} style={{ color: "#6366F1" }} />
//             <span className="text-4xl font-black" style={{ color: "#6366F1" }}>{upcomingEvents.length}</span>
//             <p className="text-xs font-bold uppercase text-gray-400 mt-2">Upcoming Events</p>
//           </div>

//           <div className="bg-white p-6 rounded-2xl border border-gray-50 shadow-sm">
//             <Clock className="mb-3" size={24} style={{ color: "#F43F5E" }} />
//             <span className="text-4xl font-black" style={{ color: "#F43F5E" }}>{previousEvents.length}</span>
//             <p className="text-xs font-bold uppercase text-gray-400 mt-2">Past Events</p>
//           </div>
//         </div>

//         {/* ── People cards (split layout, no flip) ── */}
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
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Members Modal
// ─────────────────────────────────────────────────────────────────────────────
const MembersModal = ({ isOpen, onClose, members, loading, clubName, profileImages }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md">
      <div className="bg-white rounded-2xl shadow-2xl w-11/12 max-w-4xl max-h-[80vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex justify-between items-center p-8 pb-4">
          <h3 className="font-display text-2xl font-bold" style={{ color: "#4CA1AF" }}>
            Members of {clubName}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto px-8">
          {loading ? (
            <div className="text-center py-8">
              <div
                className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto"
                style={{ borderColor: "#4CA1AF" }}
              />
              <p className="mt-2 text-gray-500">Loading members...</p>
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No members found for this club
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6">
              {members.map((member) => {
                const blobUrl = profileImages?.[member.prn];
                return (
                  <div
                    key={member.userClubId}
                    className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-white hover:shadow-md transition-all"
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
                            style={{ background: "linear-gradient(135deg, #4CA1AF, #315169)" }}
                          >
                            {member.name?.charAt(0)?.toUpperCase() || "U"}
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800">{member.name}</h4>
                        <p className="text-xs text-gray-500">{member.prn}</p>
                      </div>
                    </div>

                    <div className="mt-3 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-500">Role:</span>
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
                        <span className="text-xs text-gray-500">Department:</span>
                        <span className="text-xs font-bold">{member.department || "—"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-500">Year:</span>
                        <span className="text-xs font-bold">
                          {member.year ? `Year ${member.year}` : "—"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-500">Tenure:</span>
                        <span className="text-xs font-bold">{member.tenure || "—"}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-gray-200 flex justify-between items-center bg-gray-50">
          <span className="text-sm text-gray-500">Total: {members.length} members</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Shared: one labelled detail row
// ─────────────────────────────────────────────────────────────────────────────
const DetailRow = ({ icon: Icon, label, value, iconColor = "#4CA1AF", bgColor = "#4CA1AF1A" }) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-100 last:border-0">
      <div className="mt-0.5 p-1.5 rounded-lg flex-shrink-0" style={{ background: bgColor }}>
        <Icon size={13} style={{ color: iconColor }} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 leading-none mb-0.5">
          {label}
        </p>
        <p className="text-sm font-semibold text-gray-800 break-all leading-snug">{value}</p>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Shared: left avatar panel
// ─────────────────────────────────────────────────────────────────────────────
const AvatarPanel = ({ name, blobUrl, badgeLabel, count, activeIdx }) => (
  <div
    className="w-36 flex-shrink-0 flex flex-col items-center justify-center gap-3 p-5 border-r border-gray-100"
    style={{
      background:
        "linear-gradient(160deg, rgba(76,161,175,0.09) 0%, rgba(49,81,105,0.06) 100%)",
    }}
  >
    <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg ring-2 ring-[#4CA1AF]/20">
      {blobUrl ? (
        <img src={blobUrl} alt={name} className="w-full h-full object-cover" />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center text-2xl font-black text-white"
          style={{ background: "linear-gradient(135deg, #4CA1AF, #315169)" }}
        >
          {name?.charAt(0)?.toUpperCase() || "?"}
        </div>
      )}
    </div>

    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white"
      style={{ background: "linear-gradient(135deg, #4CA1AF, #315169)" }}
    >
      <BadgeCheck size={10} />
      {badgeLabel}
    </span>

    {count > 1 && (
      <p className="text-[10px] text-gray-400 font-medium">
        {activeIdx + 1} / {count}
      </p>
    )}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Teacher Card  (split layout, no flip)
// ─────────────────────────────────────────────────────────────────────────────
const TeacherCard = ({ adminData, profileImages }) => {
  const hasTeacher = !!adminData?.teacherName;
  const blobUrl = profileImages?.[adminData?.teacherPrn];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Card header strip */}
      <div
        className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2"
        style={{
          background:
            "linear-gradient(135deg, rgba(76,161,175,0.05), rgba(76,161,175,0.10))",
        }}
      >
        <div className="p-1.5 rounded-lg bg-[#4CA1AF]/10">
          <GraduationCap size={16} className="text-[#4CA1AF]" />
        </div>
        <h3 className="font-bold text-gray-700 text-sm uppercase tracking-widest">
          Teacher Advisor
        </h3>
      </div>

      {hasTeacher ? (
        <div className="flex">
          {/* Left – avatar */}
          <AvatarPanel
            name={adminData.teacherName}
            blobUrl={blobUrl}
            badgeLabel="Advisor"
            count={1}
            activeIdx={0}
          />

          {/* Right – details */}
          <div className="flex-1 p-5 min-w-0">
            <h4 className="text-lg font-black text-gray-800 leading-tight mb-0.5">
              {adminData.teacherName}
            </h4>
            <p className="text-xs text-[#4CA1AF] font-semibold mb-4">Teacher Advisor</p>

            <DetailRow icon={User}          label="PRN"        value={adminData.teacherPrn} iconColor="#6366F1" bgColor="#EEF2FF" />
            <DetailRow icon={Mail}          label="Email"      value={adminData.teacherEmail} iconColor="#F59E42" bgColor="#FFF7ED" />
            <DetailRow icon={GraduationCap} label="Department" value={adminData.teacherDepartment} iconColor="#10B981" bgColor="#ECFDF5" />
            <DetailRow icon={Phone}         label="Phone"      value={adminData.teacherPhone} iconColor="#F43F5E" bgColor="#FEF2F2" />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-14 gap-3">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
            <GraduationCap size={28} className="text-gray-300" />
          </div>
          <p className="text-sm text-gray-400 font-medium">No teacher advisor assigned</p>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Club Admin Card  (split layout, no flip, tab pills for multiple admins)
// ─────────────────────────────────────────────────────────────────────────────
const ClubAdminCard = ({ adminData, profileImages }) => {
  const admins = adminData?.clubAdmins || [];
  const [activeIdx, setActiveIdx] = useState(0);

  // Reset if admin list changes
  useEffect(() => { setActiveIdx(0); }, [admins.length]);

  const admin = admins[activeIdx];
  const blobUrl = admin ? profileImages?.[admin.prn] : null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Card header strip */}
      <div
        className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between"
        style={{
          background:
            "linear-gradient(135deg, rgba(76,161,175,0.05), rgba(76,161,175,0.10))",
        }}
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#4CA1AF]/10">
            <Users size={16} className="text-[#4CA1AF]" />
          </div>
          <h3 className="font-bold text-gray-700 text-sm uppercase tracking-widest">
            Club Admins
          </h3>
        </div>

        {/* Numbered tab pills when there are multiple admins */}
        {admins.length > 1 && (
          <div className="flex gap-1.5">
            {admins.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                className="w-6 h-6 rounded-full text-[10px] font-bold transition-all"
                style={
                  i === activeIdx
                    ? { background: "linear-gradient(135deg, #4CA1AF, #315169)", color: "white" }
                    : { background: "#f3f4f6", color: "#9ca3af" }
                }
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {admins.length > 0 && admin ? (
        <div className="flex">
          {/* Left – avatar */}
          <AvatarPanel
            name={admin.name}
            blobUrl={blobUrl}
            badgeLabel="Admin"
            count={admins.length}
            activeIdx={activeIdx}
          />

          {/* Right – details */}
          <div className="flex-1 p-5 min-w-0">
            <h4 className="text-lg font-black text-gray-800 leading-tight mb-0.5">
              {admin.name}
            </h4>
            <p className="text-xs text-[#4CA1AF] font-semibold mb-4">Club Admin</p>

            <DetailRow icon={User}          label="PRN"        value={admin.prn} iconColor="#6366F1" bgColor="#EEF2FF" />
            <DetailRow icon={Mail}          label="Email"      value={admin.email !== "N/A" ? admin.email : null} iconColor="#F59E42" bgColor="#FFF7ED" />
            <DetailRow icon={GraduationCap} label="Department" value={admin.department} iconColor="#10B981" bgColor="#ECFDF5" />
            <DetailRow icon={Calendar}      label="Tenure"     value={admin.tenure} iconColor="#F59E42" bgColor="#FFF7ED" />
            <DetailRow icon={BookOpen}      label="Year"       value={admin.year ? `Year ${admin.year}` : null} iconColor="#6366F1" bgColor="#EEF2FF" />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-14 gap-3">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
            <Users size={28} className="text-gray-300" />
          </div>
          <p className="text-sm text-gray-400 font-medium">No club admins assigned</p>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Page Component
// ─────────────────────────────────────────────────────────────────────────────
export default function ClubDetails() {
  const { clubName } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const userRole = user?.role || location.state?.userRole || "USER";

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
          const res = await axios.get(`http://localhost:8080${member.imageUrl}`, {
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

  // Function to fetch event counts from targetData endpoints
  const fetchEventCounts = async (clubId, departmentName) => {
    try {
      // Fetch club target data
      console.log(`Fetching club target data for ID: ${clubId}`);
      const clubResponse = await axios.get(
        `http://localhost:8080/api/events/targetData/CLUB/${clubId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log("Club target data response:", clubResponse.data);
      console.log("Club target data structure:", JSON.stringify(clubResponse.data, null, 2));
      
      // Based on the actual response, the data is an array of events
      if (clubResponse.data && clubResponse.data.success && Array.isArray(clubResponse.data.data)) {
        const events = clubResponse.data.data;
        
        // Split events into upcoming and past based on the 'completed' flag
        const upcoming = events.filter(event => !event.completed);
        const past = events.filter(event => event.completed);
        
        setUpcomingCount(upcoming.length);
        setPreviousCount(past.length);
        
        console.log("Split events - Upcoming:", upcoming.length, "Past:", past.length);
      } 
      // Alternative structure if data is directly in the response
      else if (Array.isArray(clubResponse.data)) {
        const events = clubResponse.data;
        const upcoming = events.filter(event => !event.completed);
        const past = events.filter(event => event.completed);
        
        setUpcomingCount(upcoming.length);
        setPreviousCount(past.length);
        
        console.log("Split events (direct array) - Upcoming:", upcoming.length, "Past:", past.length);
      }
      else {
        console.log("Unexpected response structure, trying fallback...");
        await fetchEventCountsFallback(clubId);
      }
      
      // Fetch department target data if department name exists
      if (departmentName) {
        try {
          console.log(`Fetching department target data for: ${departmentName}`);
          const departmentResponse = await axios.get(
            `http://localhost:8080/api/events/targetData/DEPARTMENT/${encodeURIComponent(departmentName)}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          console.log("Department target data response:", departmentResponse.data);
          
          if (departmentResponse.data && departmentResponse.data.success && Array.isArray(departmentResponse.data.data)) {
            const deptEvents = departmentResponse.data.data;
            const deptUpcoming = deptEvents.filter(event => !event.completed);
            const deptPast = deptEvents.filter(event => event.completed);
            
            setDepartmentUpcomingCount(deptUpcoming.length);
            setDepartmentPreviousCount(deptPast.length);
            
            console.log("Department events - Upcoming:", deptUpcoming.length, "Past:", deptPast.length);
          }
        } catch (deptErr) {
          console.error("Error fetching department target data:", deptErr);
        }
      }
    } catch (err) {
      console.error("Error fetching event target data:", err);
      // Fallback to regular events API to get counts
      await fetchEventCountsFallback(clubId);
    }
  };

  // Fallback function to get counts from regular events API
  const fetchEventCountsFallback = async (clubId) => {
    try {
      console.log("Using fallback to fetch event counts from regular APIs");
      
      // Fetch upcoming events and get count
      const upcomingRes = await axios.get(
        `http://localhost:8080/api/events/club/${clubId}/upcoming`,
        { 
          headers: { Authorization: `Bearer ${token}` }, 
          params: { page: 0, size: 1 } // Just need count, so get minimal data
        }
      );
      
      if (upcomingRes?.data?.success) {
        const totalElements = upcomingRes.data.data?.totalElements || 
                             upcomingRes.data.data?.length || 
                             (Array.isArray(upcomingRes.data) ? upcomingRes.data.length : 0);
        setUpcomingCount(totalElements);
        console.log("Fallback upcoming count:", totalElements);
      }
      
      // Fetch previous events and get count
      const previousRes = await axios.get(
        `http://localhost:8080/api/events/club/${clubId}/previous`,
        { 
          headers: { Authorization: `Bearer ${token}` }, 
          params: { page: 0, size: 1 } // Just need count
        }
      );
      
      if (previousRes?.data?.success) {
        const totalElements = previousRes.data.data?.totalElements || 
                             previousRes.data.data?.length || 
                             (Array.isArray(previousRes.data) ? previousRes.data.length : 0);
        setPreviousCount(totalElements);
        console.log("Fallback previous count:", totalElements);
      }
    } catch (fallbackErr) {
      console.error("Error in fallback count fetch:", fallbackErr);
    }
  };

  const fetchAdminEmail = async (prn) => {
    try {
      const r = await axios.get(`http://localhost:8080/api/users/${prn}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return r?.data?.email || null;
    } catch { return null; }
  };

  const fetchAdminData = async (clubId) => {
    try {
      const r = await axios.get(`http://localhost:8080/api/clubs/${clubId}/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (r?.data?.success) {
        const data = r.data.data || {};

        // Fetch emails for all club admins
        const adminsWithEmail = await Promise.all(
          (data.clubAdmins || []).map(async (a) => {
            const email = await fetchAdminEmail(a.prn);
            return { ...a, email: email || "N/A" };
          })
        );

        // Fetch teacher email separately
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
    // Revoke previous blob URLs
    setProfileImages((prev) => {
      Object.values(prev).forEach((url) => { if (url) URL.revokeObjectURL(url); });
      return {};
    });
    try {
      const r = await axios.get(
        `http://localhost:8080/api/user-clubs/club/${encodeURIComponent(name)}`,
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
      const res = await axios.get("http://localhost:8080/api/clubs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res?.data?.success) {
        const current = (res.data.data || []).find((c) => c.clubName === decoded);
        if (current) {
          console.log("Club details found:", current);
          setClubDetails(current);
          
          // Fetch all data
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
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#4CA1AF] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading club details...</p>
        </div>
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────
  if (error || !clubDetails) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-white rounded-[2rem] shadow-sm">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-6">{error || "Club not found"}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-[#4CA1AF] text-white rounded-xl font-semibold hover:bg-[#3d8a98] transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">

      {/* Animated background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob" />
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-2000"
          style={{ backgroundColor: "#4CA1AF" }}
        />
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000" />
      </div>

      {/* Sticky top nav */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-[#4CA1AF] transition-colors group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </div>

      {/* Page body */}
      <div className="max-w-7xl mx-auto px-6 py-8 relative">

        {/* ── Club header card ── */}
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-50 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              <div
                className="p-6 rounded-[2rem]"
                style={{ backgroundColor: "rgba(76, 161, 175, 0.1)" }}
              >
                <Trophy className="w-12 h-12" style={{ color: "#F59E42" }} />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-800 mb-2">
                  {clubDetails.clubName}
                </h1>
                <div className="flex items-center gap-4 flex-wrap">
                  <span
                    className="px-4 py-1.5 rounded-full text-sm font-semibold"
                    style={{ backgroundColor: "rgba(76, 161, 175, 0.1)", color: "#26727e" }}
                  >
                    {clubDetails.category || "Academic Club"}
                  </span>
                  <span className="flex items-center gap-1 text-gray-600">
                    <Users size={18} style={{ color: "#10B981" }} /> {clubMembers.length} Members
                  </span>
                  <span className="flex items-center gap-1 text-gray-600">
                    <Calendar size={18} style={{ color: "#6366F1" }} /> Added {formatDate(clubDetails.createdAt)}
                  </span>
                  <div
                    className={`px-2 py-1 rounded-md flex items-center gap-1.5 ${
                      clubDetails.isActive ? "bg-green-50" : "bg-gray-100"
                    }`}
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

            {clubDetails.isActive && isTeacher && (
              <button
                onClick={() =>
                  navigate(
                    `/create-event?clubId=${clubDetails.clubId}&clubName=${encodeURIComponent(clubDetails.clubName)}`
                  )
                }
                className="px-5 py-2.5 bg-[#4CA1AF] text-white rounded-xl font-semibold hover:bg-[#3d8a98] transition-colors flex items-center gap-2"
              >
                <Plus size={18} /> Add Event
              </button>
            )}
          </div>
        </div>

        {/* ── Stats row with event counts ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div
            className="bg-white p-6 rounded-2xl border border-gray-50 shadow-sm hover:shadow-md transition-all cursor-pointer"
            onClick={() => setShowMembersModal(true)}
          >
            <Users className="mb-3" size={24} style={{ color: "#10B981" }} />
            <span className="text-4xl font-black" style={{ color: "#10B981" }}>{clubMembers.length}</span>
            <p className="text-xs font-bold uppercase text-gray-400 mt-2">Total Members</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-50 shadow-sm">
            <Calendar className="mb-3" size={24} style={{ color: "#6366F1" }} />
            <span className="text-4xl font-black" style={{ color: "#6366F1" }}>
              {upcomingCount}
            </span>
            <p className="text-xs font-bold uppercase text-gray-400 mt-2">Upcoming Events</p>
            {departmentUpcomingCount > 0 && (
              <p className="text-xs text-gray-400 mt-1">
                Dept: {departmentUpcomingCount} upcoming
              </p>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-50 shadow-sm">
            <Clock className="mb-3" size={24} style={{ color: "#F43F5E" }} />
            <span className="text-4xl font-black" style={{ color: "#F43F5E" }}>
              {previousCount}
            </span>
            <p className="text-xs font-bold uppercase text-gray-400 mt-2">Past Events</p>
            {departmentPreviousCount > 0 && (
              <p className="text-xs text-gray-400 mt-1">
                Dept: {departmentPreviousCount} past
              </p>
            )}
          </div>
        </div>

        {/* ── People cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TeacherCard adminData={adminData} profileImages={profileImages} />
          <ClubAdminCard adminData={adminData} profileImages={profileImages} />
        </div>
      </div>

      {/* Global keyframe styles */}
      <style jsx>{`
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
      />
    </div>
  );
}