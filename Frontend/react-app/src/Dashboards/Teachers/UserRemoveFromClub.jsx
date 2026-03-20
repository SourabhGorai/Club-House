// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import CustomSelect from "../../components/CustomSelect";
// import ConfirmDialog from "../../components/ConfirmDialog";
// import {
//   Users,
//   Search,
//   Filter,
//   ShieldCheck,
//   Building2,
//   AlertCircle,
//   CheckCircle2,
//   UserMinus,
//   Briefcase,
//   Layers,
//   Pencil,
//   X,
//   Check,
//   ChevronLeft,
//   ChevronRight,
// } from "lucide-react";

// const BASE_URL = import.meta.env.VITE_API_URL || "http://72.155.88.211:8080";

// export const useFilteredUsersCount = () => {
//   const [count, setCount] = useState(0);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const user = JSON.parse(localStorage.getItem("user"));
//         const token = localStorage.getItem("token");

//         if (user?.role === "TEACHERS") {
//           const clubsResponse = await axios.get(
//             `${BASE_URL}/api/user-clubs/user/${user.prn}`,
//             { headers: { Authorization: `Bearer ${token}` } },
//           );

//           if (clubsResponse.data.success) {
//             const teacherRoleClubs = clubsResponse.data.data.filter((club) =>
//               ["TEACHER", "TEACHERS"].includes(club.role.toUpperCase()),
//             );

//             let totalStudents = 0;
//             for (const club of teacherRoleClubs) {
//               const studentsResponse = await axios.get(
//                 `${BASE_URL}/api/user-clubs/club/${club.clubName}`,
//                 { headers: { Authorization: `Bearer ${token}` } },
//               );
//               if (studentsResponse.data.success) {
//                 const students = studentsResponse.data.data.filter((u) =>
//                   ["TEAM_MEMBER", "CLUB_ADMIN"].includes(u.role.toUpperCase()),
//                 );
//                 totalStudents += students.length;
//               }
//             }
//             setCount(totalStudents);
//           }
//         } else {
//           const response = await axios.get(
//             `${BASE_URL}/api/user-clubs`,
//             { headers: { Authorization: `Bearer ${token}` } },
//           );
//           if (response.data.success) {
//             const nonTeacherUsers = response.data.data.filter(
//               (u) => u.role.toUpperCase() !== "TEACHERS",
//             );
//             setCount(nonTeacherUsers.length);
//           }
//         }
//       } catch (err) {
//         console.error("Error fetching count:", err);
//         setCount(0);
//       }
//     };
//     fetchData();
//   }, []);

//   return count;
// };

// // ─── Edit Role Modal ───────────────────────────────────────────────────────────
// const EditRoleModal = ({ user, availableRoles, onClose, onSave, saving }) => {
//   const [selectedRole, setSelectedRole] = useState(user.role);

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
//       <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
//         {/* Modal header */}
//         <div
//           className="px-8 py-6 flex items-center justify-between"
//           style={{
//             background: "linear-gradient(135deg, rgba(76,161,175,0.08), rgba(49,81,105,0.06))",
//             borderBottom: "1px solid rgba(76,161,175,0.15)",
//           }}
//         >
//           <div>
//             <h3 className="text-lg font-black text-slate-800">Edit Role</h3>
//             <p className="text-sm text-slate-500 mt-0.5">
//               Change role for <span className="font-bold text-[#4CA1AF]">{user.name}</span> in{" "}
//               <span className="font-bold">{user.clubName}</span>
//             </p>
//           </div>
//           <button
//             onClick={onClose}
//             className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
//           >
//             <X size={18} />
//           </button>
//         </div>

//         {/* Modal body */}
//         <div className="px-8 py-6">
//           <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
//             Select New Role
//           </label>
//           <div className="flex flex-col gap-2">
//             {availableRoles.map((role) => (
//               <button
//                 key={role}
//                 onClick={() => setSelectedRole(role)}
//                 className={`w-full px-5 py-3.5 rounded-2xl text-sm font-bold text-left transition-all border-2 ${
//                   selectedRole === role
//                     ? "border-[#4CA1AF] text-[#4CA1AF]"
//                     : "border-slate-100 text-slate-600 hover:border-slate-200 hover:bg-slate-50"
//                 }`}
//                 style={
//                   selectedRole === role
//                     ? { backgroundColor: "rgba(76,161,175,0.08)" }
//                     : {}
//                 }
//               >
//                 <div className="flex items-center justify-between">
//                   <span>{role.replace(/_/g, " ")}</span>
//                   {selectedRole === role && (
//                     <span
//                       className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs"
//                       style={{ backgroundColor: "#4CA1AF" }}
//                     >
//                       <Check size={12} />
//                     </span>
//                   )}
//                 </div>
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Modal footer */}
//         <div className="px-8 pb-6 flex gap-3">
//           <button
//             onClick={onClose}
//             className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={() => onSave(selectedRole)}
//             disabled={saving || selectedRole === user.role}
//             className="flex-1 py-3 rounded-2xl text-white font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
//             style={{ background: "linear-gradient(135deg, #4CA1AF, #315169)" }}
//           >
//             {saving ? "Saving..." : "Save Role"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ─── Main Component ────────────────────────────────────────────────────────────
// const UserRemoveFromClub = () => {
//   const navigate = useNavigate();
//   const [userClubs, setUserClubs] = useState([]);
//   const [filteredUsers, setFilteredUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [successMessage, setSuccessMessage] = useState("");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedClub, setSelectedClub] = useState("");
//   const [teacherPrn, setTeacherPrn] = useState("");
//   const [teacherClubs, setTeacherClubs] = useState([]);
//   const [teacherStudents, setTeacherStudents] = useState([]);
//   const [loadingClubs, setLoadingClubs] = useState(false);

//   // Edit role state
//   const [editingUser, setEditingUser] = useState(null);
//   const [availableRoles, setAvailableRoles] = useState([]);
//   const [savingRole, setSavingRole] = useState(false);
//   const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: "", message: "", variant: "primary", confirmText: "Confirm", onConfirm: () => {} });
//   const closeConfirm = () => setConfirmDialog((prev) => ({ ...prev, isOpen: false }));

//   // Pagination state
//   const PAGE_SIZE = 10;
//   const [currentPage, setCurrentPage] = useState(0);
//   const pagedUsers = filteredUsers.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);
//   const [expandedMobileCard, setExpandedMobileCard] = useState(null);

//   // prn -> blob URL
//   const [profileImages, setProfileImages] = useState({});

//   const token = localStorage.getItem("token");

//   // Cleanup blob URLs on unmount
//   useEffect(() => {
//     return () => {
//       setProfileImages((prev) => {
//         Object.values(prev).forEach((url) => {
//           if (url) URL.revokeObjectURL(url);
//         });
//         return {};
//       });
//     };
//   }, []);

//   // Fetch available roles on mount
//   useEffect(() => {
//     const fetchRoles = async () => {
//       try {
//         const res = await axios.get(
//           `${BASE_URL}/api/user-clubs/getAllClubRoles`,
//           { headers: { Authorization: `Bearer ${token}` } },
//         );
//         if (res.data?.success) {
//           // Filter out teacher roles so only student-level roles are shown
//           const roles = (res.data.data || []).filter(
//             (r) => !["TEACHER", "TEACHERS"].includes(r.toUpperCase()),
//           );
//           setAvailableRoles(roles);
//         }
//       } catch (err) {
//         console.error("Error fetching roles:", err);
//         // Fallback
//         setAvailableRoles(["TEAM_MEMBER", "CLUB_ADMIN"]);
//       }
//     };
//     fetchRoles();
//   }, []);

//   const fetchProfileImages = async (userList) => {
//     const withImages = userList.filter((u) => u.hasProfileImage && u.imageUrl);
//     const results = await Promise.all(
//       withImages.map(async (user) => {
//         try {
//           const res = await axios.get(`${BASE_URL}${user.imageUrl}`, {
//             headers: { Authorization: `Bearer ${token}` },
//             responseType: "blob",
//           });
//           if (res.data && res.data.size > 0) {
//             return { prn: user.prn, blobUrl: URL.createObjectURL(res.data) };
//           }
//           return { prn: user.prn, blobUrl: null };
//         } catch {
//           return { prn: user.prn, blobUrl: null };
//         }
//       }),
//     );
//     const map = results.reduce((acc, r) => {
//       if (r) acc[r.prn] = r.blobUrl;
//       return acc;
//     }, {});
//     setProfileImages((prev) => ({ ...prev, ...map }));
//   };

//   // ── Teacher flow ──
//   useEffect(() => {
//     const user = JSON.parse(localStorage.getItem("user"));
//     if (user?.prn) {
//       setTeacherPrn(user.prn);
//       fetchTeacherClubs(user.prn);
//     }
//   }, []);

//   const fetchTeacherClubs = async (prn) => {
//     if (!prn) return;
//     setLoadingClubs(true);
//     try {
//       const response = await axios.get(
//         `${BASE_URL}/api/user-clubs/user/${prn}`,
//         { headers: { Authorization: `Bearer ${token}` } },
//       );
//       if (response.data.success) {
//         const teacherRoleClubs = response.data.data.filter((club) =>
//           ["TEACHER", "TEACHERS"].includes(club.role.toUpperCase()),
//         );
//         setTeacherClubs(teacherRoleClubs);
//         fetchStudentsFromClubs(teacherRoleClubs);
//       }
//     } catch (err) {
//       console.error("Error fetching teacher clubs:", err);
//       setTeacherClubs([]);
//     } finally {
//       setLoadingClubs(false);
//     }
//   };

//   const fetchStudentsFromClubs = async (clubs) => {
//     if (!clubs.length) return;
//     try {
//       const allStudents = [];
//       for (const club of clubs) {
//         const response = await axios.get(
//           `${BASE_URL}/api/user-clubs/club/${club.clubName}`,
//           { headers: { Authorization: `Bearer ${token}` } },
//         );
//         if (response.data.success) {
//           const students = response.data.data.filter((u) =>
//             ["TEAM_MEMBER", "CLUB_ADMIN"].includes(u.role.toUpperCase()),
//           );
//           allStudents.push(...students);
//         }
//       }
//       setTeacherStudents(allStudents);
//       await fetchProfileImages(allStudents);
//     } catch (err) {
//       console.error("Error fetching club students:", err);
//       setTeacherStudents([]);
//     }
//   };

//   // ── Non-teacher flow ──
//   const fetchUserClubs = async () => {
//     try {
//       setLoading(true);
//       const user = JSON.parse(localStorage.getItem("user"));

//       if (user?.role === "TEACHERS") {
//         await fetchTeacherClubs(user.prn);
//         setLoading(false);
//         return;
//       }

//       const response = await axios.get(`${BASE_URL}/api/user-clubs`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (response.data.success) {
//         const nonTeacherUsers = response.data.data.filter(
//           (u) => u.role.toUpperCase() !== "TEACHERS",
//         );
//         setUserClubs(nonTeacherUsers);
//         setFilteredUsers(nonTeacherUsers);
//         await fetchProfileImages(nonTeacherUsers);
//       }
//     } catch (err) {
//       setError("Failed to fetch user data. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchUserClubs();
//   }, []);

//   useEffect(() => {
//     let filtered = teacherStudents.length > 0 ? teacherStudents : userClubs;
//     if (searchTerm) {
//       const term = searchTerm.toLowerCase();
//       filtered = filtered.filter(
//         (user) =>
//           user.name.toLowerCase().includes(term) ||
//           user.prn.toLowerCase().includes(term) ||
//           (user.department && user.department.toLowerCase().includes(term)) ||
//           user.role.toLowerCase().includes(term),
//       );
//     }
//     if (selectedClub) {
//       const selectedClubKey = String(selectedClub);
//       filtered = filtered.filter(
//         (user) => {
//           const byClubId = user.clubId != null && String(user.clubId) === selectedClubKey;
//           const byClubName = user.clubName != null && String(user.clubName) === selectedClubKey;
//           return byClubId || byClubName;
//         },
//       );
//     }
//     setFilteredUsers(filtered);
//   }, [searchTerm, selectedClub, userClubs, teacherStudents]);

//   // Reset to first page whenever filters change
//   useEffect(() => {
//     setCurrentPage(0);
//   }, [searchTerm, selectedClub, userClubs, teacherStudents]);

//   useEffect(() => {
//     setExpandedMobileCard(null);
//   }, [currentPage, searchTerm, selectedClub]);

//   const handleRemoveUser = async (user) => {
//     const { prn, clubName, name, clubId, role, tenure } = user;
//     try {
//       const response = await axios.delete(
//         `${BASE_URL}/api/user-clubs/user/${prn}/club/${clubName}`,
//         {
//           headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
//           data: { prn, clubId, role, tenure },
//         },
//       );
//       if (response.data.success) {
//         setSuccessMessage(`Successfully removed ${name} from ${clubName}`);
//         fetchUserClubs();
//         setTimeout(() => setSuccessMessage(""), 3000);
//       }
//     } catch (err) {
//       setError(`Failed to remove user. ${err.response?.data?.message || err.message}`);
//     }
//   };

//   const handleSaveRole = async (newRole) => {
//     if (!editingUser || newRole === editingUser.role) return;
//     setSavingRole(true);
//     console.log(newRole, editingUser.prn, editingUser.clubId);
//     try {
//       const response = await axios.post(
//         `${BASE_URL}/api/user-clubs/changeClubRole`,
//         {
//           prn: editingUser.prn,
//           clubId: editingUser.clubId,
//           newRole,
//         },
//         {
//           headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
//         },
//       );
//       if (response.data?.success) {
//         setSuccessMessage(
//           `Role updated to ${newRole.replace(/_/g, " ")} for ${editingUser.name}`,
//         );
//         setEditingUser(null);
//         fetchUserClubs();
//         setTimeout(() => setSuccessMessage(""), 3000);
//       } else {
//         throw new Error(response.data?.message || "Failed to update role");
//       }
//     } catch (err) {
//       setError(`Failed to update role. ${err.response?.data?.message || err.message}`);
//     } finally {
//       setSavingRole(false);
//     }
//   };

//   if (loading || loadingClubs) {
//     return (
//       <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center">
//         <div
//           className="w-16 h-16 border-4 rounded-full animate-spin"
//           style={{ borderColor: "rgba(76, 161, 175, 0.1)", borderTopColor: "#4CA1AF" }}
//         ></div>
//         <p className="mt-4 font-medium text-slate-500 animate-pulse tracking-wide">
//           {teacherPrn ? "Loading teacher's students..." : "Synchronizing database..."}
//         </p>
//       </div>
//     );
//   }

//   return (
//     <>
//     <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 text-slate-900 font-sans antialiased relative">
//       <style jsx>{`
//         @keyframes blob {
//           0%   { transform: translate(0px, 0px)   scale(1);   }
//           33%  { transform: translate(30px, -50px) scale(1.1); }
//           66%  { transform: translate(-20px, 20px) scale(0.9); }
//           100% { transform: translate(0px, 0px)   scale(1);   }
//         }
//         .animate-blob          { animation: blob 7s infinite; }
//         .animation-delay-2000  { animation-delay: 2s; }
//         .animation-delay-4000  { animation-delay: 4s; }
//       `}</style>

//       {/* Edit Role Modal */}
//       {editingUser && (
//         <EditRoleModal
//           user={editingUser}
//           availableRoles={availableRoles}
//           onClose={() => setEditingUser(null)}
//           onSave={handleSaveRole}
//           saving={savingRole}
//         />
//       )}

//       {/* Animated Background */}
//       <div className="fixed inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob"></div>
//         <div
//           className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-2000"
//           style={{ backgroundColor: "#4CA1AF" }}
//         ></div>
//         <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-4000"></div>
//       </div>

//       {/* Sticky Back Button Bar */}
//       <div className="sticky top-0 z-50 w-full bg-white border-b border-gray-100">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex items-center h-16">
//             {/* <button
//               onClick={() => navigate("/dashboard")}
//               className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#4CA1AF] transition-colors group"
//             >
//               <svg
//                 className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform"
//                 style={{ color: "#4CA1AF" }}
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
//               </svg>
//               <span>Back to Dashboard</span>
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
//           </div>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 sm:px-6 lg:px-8 relative z-10">
//         {/* 1. Header */}
//         <div className="mb-8">
//           <div
//             className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4"
//             style={{ backgroundColor: "rgba(76, 161, 175, 0.1)", color: "#4CA1AF" }}
//           ></div>
//           <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight bg-gradient-to-r from-[#4CA1AF] to-[#162F38] bg-clip-text text-transparent">
//             User Club Association
//           </h1>
//           <p className="text-slate-500 mt-2 text-base sm:text-lg font-medium">
//             Refine your organization by managing club rosters and permissions.
//           </p>
//         </div>

//         {/* 2. Search & Filter */}
//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
//           <div className="lg:col-span-8 relative group">
//             <Search className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors" size={20} style={{ color: "#4CA1AF" }} />
//             <input
//               type="text"
//               placeholder="Search by name, PRN, or department..."
//               className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:border-transparent transition-all shadow-sm outline-none text-slate-700 font-medium cursor-text"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />
//           </div>
//           <div className="lg:col-span-4 relative group">
//             <CustomSelect
//               name="clubFilter"
//               value={selectedClub}
//               onChange={(e) => setSelectedClub(e.target.value)}
//               options={[
//                 { value: "", label: "All Clubs" },
//                 ...teacherClubs.map((club) => ({
//                   value: String(club.clubId),
//                   label: `${club.clubName} • ${club.role}`,
//                 })),
//               ]}
//               placeholder="All Clubs"
//             />
//           </div>
//         </div>

//         {/* 3. Stat Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
//           {[
//             { icon: <Users size={28} />, label: "Total Users",   value: filteredUsers.length,                                    bg: "rgba(59,130,246,0.12)",  color: "#3B82F6" },
//             { icon: <Building2 size={28} />, label: "Unique Clubs",  value: teacherClubs.length,                                     bg: "rgba(16,185,129,0.12)",  color: "#10B981" },
//             { icon: <Layers size={28} />, label: "Active Roles",  value: [...new Set(filteredUsers.map((u) => u.role))].length,   bg: "rgba(168,85,247,0.12)",  color: "#A855F7" },
//           ].map(({ icon, label, value, bg, color }) => (
//             <div key={label} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 flex items-center space-x-5 transition-transform hover:scale-[1.02] cursor-pointer">
//               <div className="p-4 rounded-2xl" style={{ backgroundColor: bg, color }}>{icon}</div>
//               <div>
//                 <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{label}</p>
//                 <h3 className="text-3xl font-black text-slate-900">{value}</h3>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Teacher Dashboard Banner */}
//         {teacherClubs.length > 0 && (
//           <div className="mb-6 p-4 sm:p-6 border rounded-[1.5rem] sm:rounded-[2rem] shadow-xl" style={{ background: "linear-gradient(to right, rgba(76,161,175,0.1), rgba(49,81,105,0.1))", borderColor: "rgba(76,161,175,0.2)" }}>
//               <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
//               <div className="flex items-center space-x-3">
//                 <div className="p-3 rounded-2xl" style={{ backgroundColor: "rgba(190,166,108,0.15)", color: "#ef9d0f" }}>
//                   <ShieldCheck size={24} />
//                 </div>
//                 <div>
//                     <h3 className="text-lg sm:text-xl font-black" style={{ color: "#26727e" }}>Teacher Dashboard Mode</h3>
//                   <p className="text-sm font-medium" style={{ color: "#26727e" }}>Showing students from your assigned clubs</p>
//                 </div>
//               </div>
//                 <div className="text-left sm:text-right">
//                 <p className="text-sm font-bold" style={{ color: "#26727e" }}>PRN: {teacherPrn}</p>
//                 <p className="text-xs" style={{ color: "#26727e" }}>{teacherClubs.length} clubs assigned</p>
//               </div>
//             </div>
//             <div className="mt-4">
//               <p className="text-sm font-bold mb-2" style={{ color: "#34757e" }}>Your Clubs:</p>
//               <div className="flex flex-wrap gap-2">
//                 {teacherClubs.map((club) => (
//                   <span key={club.clubId} className="px-4 py-2 bg-white text-sm font-bold rounded-full border shadow-sm hover:shadow-md transition-shadow" style={{ color: "#34757e", borderColor: "rgba(76,161,175,0.2)" }}>
//                     {club.clubName} • {club.role}
//                   </span>
//                 ))}
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Notifications */}
//         {error && (
//           <div className="mb-6 flex items-center p-4 bg-red-50 border-l-4 border-red-500 text-red-800 rounded-xl">
//             <AlertCircle className="mr-3 shrink-0" size={20} />
//             <p className="text-sm font-bold">{error}</p>
//           </div>
//         )}
//         {successMessage && (
//           <div className="mb-6 flex items-center p-4 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 rounded-xl">
//             <CheckCircle2 className="mr-3 shrink-0" size={20} />
//             <p className="text-sm font-bold">{successMessage}</p>
//           </div>
//         )}

//         {/* 4. Table */}
//         <div className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/60 overflow-hidden">
//           <div className="overflow-x-auto">
//             {filteredUsers.length === 0 ? (
//               <div className="py-24 text-center">
//                 <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
//                   <Search size={40} className="text-slate-300" />
//                 </div>
//                 <h3 className="text-xl font-black text-slate-900">No members match your criteria</h3>
//                 <p className="text-slate-500 font-medium">Try broadening your search or adjusting filters.</p>
//               </div>
//             ) : (
//               <>
//                 <div className="hidden lg:block">
//                   <table className="w-full text-left border-collapse">
//                     <thead>
//                       <tr className="bg-slate-50/50 border-b border-slate-100">
//                         <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Member</th>
//                         <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Club & Status</th>
//                         <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Education</th>
//                         <th className="px-10 py-6 text-right text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
//                       </tr>
//                     </thead>
//                     <tbody className="divide-y divide-slate-100">
//                       {pagedUsers.map((user) => {
//                         const blobUrl = profileImages[user.prn];
//                         return (
//                           <tr key={user.userClubId} className="group hover:bg-[#4CA1AF]/5 transition-all duration-300">
//                             <td className="px-10 py-6">
//                               <div className="flex items-center space-x-4">
//                                 <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
//                                   {blobUrl ? (
//                                     <img src={blobUrl} alt={user.name} className="w-14 h-14 object-cover rounded-2xl" />
//                                   ) : (
//                                     <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl" style={{ background: "linear-gradient(135deg, #4CA1AF, #315169)" }}>
//                                       {user.name.charAt(0).toUpperCase()}
//                                     </div>
//                                   )}
//                                 </div>
//                                 <div>
//                                   <p className="font-black text-slate-900 text-lg leading-tight transition-colors group-hover:text-[#4CA1AF]">{user.name}</p>
//                                   <p className="text-xs font-bold text-slate-400 mt-1">{user.prn}</p>
//                                 </div>
//                               </div>
//                             </td>

//                             <td className="px-10 py-6">
//                               <div className="flex flex-col space-y-2">
//                                 <span className="inline-flex items-center text-sm font-black text-slate-800">
//                                   <Building2 size={16} className="mr-2" style={{ color: "#4CA1AF" }} />
//                                   {user.clubName}
//                                 </span>
//                                 <div>
//                                   <span
//                                     className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm border ${
//                                       user.role === "CLUB_ADMIN" ? "text-purple-700 border-purple-100" : "text-blue-700 border-blue-100"
//                                     }`}
//                                     style={user.role === "CLUB_ADMIN" ? { backgroundColor: "rgba(76,161,175,0.1)" } : { backgroundColor: "rgba(59,130,246,0.1)" }}
//                                   >
//                                     {user.role.replace(/_/g, " ")}
//                                   </span>
//                                 </div>
//                               </div>
//                             </td>

//                             <td className="px-10 py-6">
//                               <div className="space-y-1">
//                                 <div className="flex items-center text-sm font-bold text-slate-700">
//                                   <Briefcase size={14} className="mr-2 text-slate-400" />
//                                   {user.department}
//                                 </div>
//                                 <p className="text-xs font-bold text-slate-400 ml-5">Year {user.year} • {user.tenure}</p>
//                               </div>
//                             </td>

//                             <td className="px-10 py-6">
//                               <div className="flex items-center justify-end gap-2">
//                                 <button
//                                   onClick={() => setEditingUser(user)}
//                                   className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-white hover:border-transparent hover:bg-[#4CA1AF] transition-all shadow-sm active:scale-90 cursor-pointer"
//                                   title="Edit role"
//                                 >
//                                   <Pencil size={18} />
//                                 </button>
//                                 <button
//                                   onClick={() => setConfirmDialog({ isOpen: true, title: "Remove from Club", message: `Are you sure you want to remove ${user.name} from ${user.clubName}?`, confirmText: "Remove", variant: "danger", onConfirm: () => { closeConfirm(); handleRemoveUser(user); } })}
//                                   className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-white hover:border-transparent hover:rotate-12 hover:bg-red-500 transition-all shadow-sm active:scale-90 cursor-pointer"
//                                   title="Remove from club"
//                                 >
//                                   <UserMinus size={22} />
//                                 </button>
//                               </div>
//                             </td>
//                           </tr>
//                         );
//                       })}
//                     </tbody>
//                   </table>
//                 </div>

//                 <div className="lg:hidden p-4 sm:p-6 space-y-3 sm:space-y-4">
//                   {pagedUsers.map((user) => {
//                     const blobUrl = profileImages[user.prn];
//                     const isExpanded = expandedMobileCard === user.userClubId;
//                     return (
//                       <div key={user.userClubId} className="rounded-2xl border border-slate-200 p-4 shadow-sm bg-white">
//                         <button
//                           type="button"
//                           onClick={() => setExpandedMobileCard((prev) => (prev === user.userClubId ? null : user.userClubId))}
//                           className="w-full flex items-center justify-between gap-3 text-left"
//                         >
//                           <div className="flex items-center gap-3 min-w-0">
//                             <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
//                               {blobUrl ? (
//                                 <img src={blobUrl} alt={user.name} className="w-11 h-11 object-cover rounded-xl" />
//                               ) : (
//                                 <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-black" style={{ background: "linear-gradient(135deg, #4CA1AF, #315169)" }}>
//                                   {user.name.charAt(0).toUpperCase()}
//                                 </div>
//                               )}
//                             </div>
//                             <div className="min-w-0">
//                               <p className="font-black text-slate-900 truncate">{user.name}</p>
//                               <p className="text-xs font-bold text-slate-400 mt-0.5">{user.prn}</p>
//                             </div>
//                           </div>
//                           <ChevronRight
//                             size={18}
//                             className={`text-slate-400 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
//                           />
//                         </button>

//                         {isExpanded && (
//                           <>
//                             <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
//                               <div className="flex items-center text-slate-700 font-bold">
//                                 <Building2 size={14} className="mr-2 text-[#4CA1AF]" />
//                                 <span className="truncate">{user.clubName}</span>
//                               </div>
//                               <div>
//                                 <span
//                                   className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border whitespace-nowrap ${
//                                     user.role === "CLUB_ADMIN" ? "text-purple-700 border-purple-100" : "text-blue-700 border-blue-100"
//                                   }`}
//                                   style={user.role === "CLUB_ADMIN" ? { backgroundColor: "rgba(76,161,175,0.1)" } : { backgroundColor: "rgba(59,130,246,0.1)" }}
//                                 >
//                                   {user.role.replace(/_/g, " ")}
//                                 </span>
//                               </div>
//                               <div className="flex items-center text-slate-700 font-bold sm:col-span-2">
//                                 <Briefcase size={14} className="mr-2 text-slate-400" />
//                                 <span className="truncate">{user.department}</span>
//                               </div>
//                               <div className="text-xs font-bold text-slate-400 sm:col-span-2">Year {user.year} • {user.tenure}</div>
//                             </div>

//                             <div className="mt-4 flex items-center justify-end gap-2">
//                               <button
//                                 onClick={() => setEditingUser(user)}
//                                 className="inline-flex items-center justify-center h-10 px-3 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-white hover:border-transparent hover:bg-[#4CA1AF] transition-all shadow-sm active:scale-95"
//                               >
//                                 <Pencil size={16} className="mr-1.5" /> Edit
//                               </button>
//                               <button
//                                 onClick={() => setConfirmDialog({ isOpen: true, title: "Remove from Club", message: `Are you sure you want to remove ${user.name} from ${user.clubName}?`, confirmText: "Remove", variant: "danger", onConfirm: () => { closeConfirm(); handleRemoveUser(user); } })}
//                                 className="inline-flex items-center justify-center h-10 px-3 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-white hover:border-transparent hover:bg-red-500 transition-all shadow-sm active:scale-95"
//                               >
//                                 <UserMinus size={16} className="mr-1.5" /> Remove
//                               </button>
//                             </div>
//                           </>
//                         )}
//                       </div>
//                     );
//                   })}
//                 </div>
//               </>
//             )}
//           </div>
//         </div>

//         {/* Pagination */}
//         {filteredUsers.length > PAGE_SIZE && (
//           <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
//             <p className="text-sm font-bold text-slate-500">
//               Showing{" "}
//               <span className="text-slate-800">{currentPage * PAGE_SIZE + 1}–{Math.min((currentPage + 1) * PAGE_SIZE, filteredUsers.length)}</span>
//               {" "}of{" "}
//               <span className="text-slate-800">{filteredUsers.length}</span> members
//             </p>
//             <div className="flex items-center gap-2">
//               <button
//                 onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
//                 disabled={currentPage === 0}
//                 className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-white hover:bg-[#4CA1AF] hover:border-[#4CA1AF] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
//               >
//                 <ChevronLeft size={18} />
//               </button>

//               {Array.from({ length: Math.ceil(filteredUsers.length / PAGE_SIZE) }, (_, i) => i)
//                 .filter((i) => i === 0 || i === Math.ceil(filteredUsers.length / PAGE_SIZE) - 1 || Math.abs(i - currentPage) <= 1)
//                 .reduce((acc, i, idx, arr) => {
//                   if (idx > 0 && i - arr[idx - 1] > 1) acc.push("...");
//                   acc.push(i);
//                   return acc;
//                 }, [])
//                 .map((item, idx) =>
//                   item === "..." ? (
//                     <span key={`ellipsis-${idx}`} className="px-1 text-slate-400 font-bold text-sm">…</span>
//                   ) : (
//                     <button
//                       key={item}
//                       onClick={() => setCurrentPage(item)}
//                       className={`w-10 h-10 rounded-xl text-sm font-black transition-all shadow-sm ${
//                         item === currentPage
//                           ? "text-white border-transparent"
//                           : "bg-white border border-slate-200 text-slate-600 hover:border-[#4CA1AF] hover:text-[#4CA1AF]"
//                       }`}
//                       style={item === currentPage ? { background: "linear-gradient(135deg, #4CA1AF, #315169)" } : {}}
//                     >
//                       {item + 1}
//                     </button>
//                   ),
//                 )}

//               <button
//                 onClick={() => setCurrentPage((p) => Math.min(Math.ceil(filteredUsers.length / PAGE_SIZE) - 1, p + 1))}
//                 disabled={currentPage >= Math.ceil(filteredUsers.length / PAGE_SIZE) - 1}
//                 className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-white hover:bg-[#4CA1AF] hover:border-[#4CA1AF] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
//               >
//                 <ChevronRight size={18} />
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Footer */}
//         <div className="mt-10 flex flex-col md:flex-row items-center justify-between text-slate-400 text-[10px] font-black uppercase tracking-[0.12em] sm:tracking-[0.2em] px-2 sm:px-6 opacity-60 gap-3">
//           <p>Database synchronization active • {filteredUsers.length} Users Listed</p>
//           <div className="flex items-center space-x-4 sm:space-x-6 md:mt-0">
//             <span className="flex items-center">
//               <span className="w-2.5 h-2.5 rounded-full mr-2 shadow-sm" style={{ backgroundColor: "#4CA1AF" }}></span>
//               Admin
//             </span>
//             <span className="flex items-center">
//               <span className="w-2.5 h-2.5 rounded-full bg-blue-500 mr-2 shadow-sm"></span>
//               Member
//             </span>
//           </div>
//         </div>
//       </div>
//     </div>

//     <ConfirmDialog
//       isOpen={confirmDialog.isOpen}
//       title={confirmDialog.title}
//       message={confirmDialog.message}
//       confirmText={confirmDialog.confirmText}
//       variant={confirmDialog.variant}
//       onConfirm={confirmDialog.onConfirm}
//       onCancel={closeConfirm}
//     />
//     </>
//   );
// };

// export default UserRemoveFromClub;



import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import CustomSelect from "../../components/CustomSelect";
import ConfirmDialog from "../../components/ConfirmDialog";
import {
  Users,
  Search,
  Filter,
  ShieldCheck,
  Building2,
  AlertCircle,
  CheckCircle2,
  UserMinus,
  Briefcase,
  Layers,
  Pencil,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
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

export const useFilteredUsersCount = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const token = localStorage.getItem("token");
        const theme = JSON.parse(localStorage.getItem("userRemoveFromClubTheme")) === "dark" ? DARK_PRIMARY_COLOR : LIGHT_PRIMARY_COLOR;

        if (user?.role === "TEACHERS") {
          const clubsResponse = await axios.get(
            `${BASE_URL}/api/user-clubs/user/${user.prn}`,
            { headers: { Authorization: `Bearer ${token}` } },
          );

          if (clubsResponse.data.success) {
            const teacherRoleClubs = clubsResponse.data.data.filter((club) =>
              ["TEACHER", "TEACHERS"].includes(club.role.toUpperCase()),
            );

            let totalStudents = 0;
            for (const club of teacherRoleClubs) {
              const studentsResponse = await axios.get(
                `${BASE_URL}/api/user-clubs/club/${club.clubName}`,
                { headers: { Authorization: `Bearer ${token}` } },
              );
              if (studentsResponse.data.success) {
                const students = studentsResponse.data.data.filter((u) =>
                  ["TEAM_MEMBER", "CLUB_ADMIN"].includes(u.role.toUpperCase()),
                );
                totalStudents += students.length;
              }
            }
            setCount(totalStudents);
          }
        } else {
          const response = await axios.get(
            `${BASE_URL}/api/user-clubs`,
            { headers: { Authorization: `Bearer ${token}` } },
          );
          if (response.data.success) {
            const nonTeacherUsers = response.data.data.filter(
              (u) => u.role.toUpperCase() !== "TEACHERS",
            );
            setCount(nonTeacherUsers.length);
          }
        }
      } catch (err) {
        console.error("Error fetching count:", err);
        setCount(0);
      }
    };
    fetchData();
  }, []);

  return count;
};

// ─── Edit Role Modal with theme ───────────────────────────────────────────────
const EditRoleModal = ({ user, availableRoles, onClose, onSave, saving, theme }) => {
  const [selectedRole, setSelectedRole] = useState(user.role);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
      <div 
        className="rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden transition-colors duration-300"
        style={{ background: theme.bgCard, border: `1px solid ${theme.borderColor}` }}
      >
        {/* Modal header */}
        <div
          className="px-8 py-6 flex items-center justify-between"
          style={{
            background: theme.accentSoft,
            borderBottom: `1px solid ${theme.borderColor}`,
          }}
        >
          <div>
            <h3 className="text-lg font-black" style={{ color: theme.textPrimary }}>Edit Role</h3>
            <p className="text-sm mt-0.5" style={{ color: theme.textMuted }}>
              Change role for <span className="font-bold" style={{ color: theme.primaryColor }}>{user.name}</span> in{" "}
              <span className="font-bold" style={{ color: theme.textPrimary }}>{user.clubName}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
            style={{ color: theme.textMuted, background: theme.accentSoft }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal body */}
        <div className="px-8 py-6">
          <label className="block text-xs font-black uppercase tracking-widest mb-3" style={{ color: theme.textMuted }}>
            Select New Role
          </label>
          <div className="flex flex-col gap-2">
            {availableRoles.map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`w-full px-5 py-3.5 rounded-2xl text-sm font-bold text-left transition-all border-2`}
                style={{
                  borderColor: selectedRole === role ? theme.primaryColor : theme.borderColor,
                  color: selectedRole === role ? theme.primaryColor : theme.textSecondary,
                  backgroundColor: selectedRole === role ? theme.primaryLight : theme.accentSoft,
                }}
              >
                <div className="flex items-center justify-between">
                  <span>{role.replace(/_/g, " ")}</span>
                  {selectedRole === role && (
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs"
                      style={{ backgroundColor: theme.primaryColor }}
                    >
                      <Check size={12} />
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Modal footer */}
        <div className="px-8 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl font-bold text-sm transition-all"
            style={{ 
              border: `1px solid ${theme.borderColor}`,
              color: theme.textSecondary,
              background: theme.accentSoft
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(selectedRole)}
            disabled={saving || selectedRole === user.role}
            className="flex-1 py-3 rounded-2xl text-white font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: theme.primaryGradient }}
          >
            {saving ? "Saving..." : "Save Role"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
const UserRemoveFromClub = () => {
  const navigate = useNavigate();

  // ── Theme state ───────────────────────────────────────────────────────────
  const [isDarkMode, setIsDarkMode] = useState(() =>
    localStorage.getItem("userRemoveFromClubTheme") === "dark"
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
    localStorage.setItem("userRemoveFromClubTheme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const [userClubs, setUserClubs] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClub, setSelectedClub] = useState("");
  const [teacherPrn, setTeacherPrn] = useState("");
  const [teacherClubs, setTeacherClubs] = useState([]);
  const [teacherStudents, setTeacherStudents] = useState([]);
  const [loadingClubs, setLoadingClubs] = useState(false);

  // Edit role state
  const [editingUser, setEditingUser] = useState(null);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [savingRole, setSavingRole] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: "", message: "", variant: "primary", confirmText: "Confirm", onConfirm: () => {} });
  const closeConfirm = () => setConfirmDialog((prev) => ({ ...prev, isOpen: false }));

  // Pagination state
  const PAGE_SIZE = 10;
  const [currentPage, setCurrentPage] = useState(0);
  const pagedUsers = filteredUsers.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);
  const [expandedMobileCard, setExpandedMobileCard] = useState(null);

  // prn -> blob URL
  const [profileImages, setProfileImages] = useState({});

  const token = localStorage.getItem("token");

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      setProfileImages((prev) => {
        Object.values(prev).forEach((url) => {
          if (url) URL.revokeObjectURL(url);
        });
        return {};
      });
    };
  }, []);

  // Fetch available roles on mount
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/api/user-clubs/getAllClubRoles`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (res.data?.success) {
          // Filter out teacher roles so only student-level roles are shown
          const roles = (res.data.data || []).filter(
            (r) => !["TEACHER", "TEACHERS"].includes(r.toUpperCase()),
          );
          setAvailableRoles(roles);
        }
      } catch (err) {
        console.error("Error fetching roles:", err);
        // Fallback
        setAvailableRoles(["TEAM_MEMBER", "CLUB_ADMIN"]);
      }
    };
    fetchRoles();
  }, []);

  const fetchProfileImages = async (userList) => {
    const withImages = userList.filter((u) => u.hasProfileImage && u.imageUrl);
    const results = await Promise.all(
      withImages.map(async (user) => {
        try {
          const res = await axios.get(`${BASE_URL}${user.imageUrl}`, {
            headers: { Authorization: `Bearer ${token}` },
            responseType: "blob",
          });
          if (res.data && res.data.size > 0) {
            return { prn: user.prn, blobUrl: URL.createObjectURL(res.data) };
          }
          return { prn: user.prn, blobUrl: null };
        } catch {
          return { prn: user.prn, blobUrl: null };
        }
      }),
    );
    const map = results.reduce((acc, r) => {
      if (r) acc[r.prn] = r.blobUrl;
      return acc;
    }, {});
    setProfileImages((prev) => ({ ...prev, ...map }));
  };

  // ── Teacher flow ──
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.prn) {
      setTeacherPrn(user.prn);
      fetchTeacherClubs(user.prn);
    }
  }, []);

  const fetchTeacherClubs = async (prn) => {
    if (!prn) return;
    setLoadingClubs(true);
    try {
      const response = await axios.get(
        `${BASE_URL}/api/user-clubs/user/${prn}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (response.data.success) {
        const teacherRoleClubs = response.data.data.filter((club) =>
          ["TEACHER", "TEACHERS"].includes(club.role.toUpperCase()),
        );
        setTeacherClubs(teacherRoleClubs);
        fetchStudentsFromClubs(teacherRoleClubs);
      }
    } catch (err) {
      console.error("Error fetching teacher clubs:", err);
      setTeacherClubs([]);
    } finally {
      setLoadingClubs(false);
    }
  };

  const fetchStudentsFromClubs = async (clubs) => {
    if (!clubs.length) return;
    try {
      const allStudents = [];
      for (const club of clubs) {
        const response = await axios.get(
          `${BASE_URL}/api/user-clubs/club/${club.clubName}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (response.data.success) {
          const students = response.data.data.filter((u) =>
            ["TEAM_MEMBER", "CLUB_ADMIN"].includes(u.role.toUpperCase()),
          );
          allStudents.push(...students);
        }
      }
      setTeacherStudents(allStudents);
      await fetchProfileImages(allStudents);
    } catch (err) {
      console.error("Error fetching club students:", err);
      setTeacherStudents([]);
    }
  };

  // ── Non-teacher flow ──
  const fetchUserClubs = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user"));

      if (user?.role === "TEACHERS") {
        await fetchTeacherClubs(user.prn);
        setLoading(false);
        return;
      }

      const response = await axios.get(`${BASE_URL}/api/user-clubs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        const nonTeacherUsers = response.data.data.filter(
          (u) => u.role.toUpperCase() !== "TEACHERS",
        );
        setUserClubs(nonTeacherUsers);
        setFilteredUsers(nonTeacherUsers);
        await fetchProfileImages(nonTeacherUsers);
      }
    } catch (err) {
      setError("Failed to fetch user data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserClubs();
  }, []);

  useEffect(() => {
    let filtered = teacherStudents.length > 0 ? teacherStudents : userClubs;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(term) ||
          user.prn.toLowerCase().includes(term) ||
          (user.department && user.department.toLowerCase().includes(term)) ||
          user.role.toLowerCase().includes(term),
      );
    }
    if (selectedClub) {
      const selectedClubKey = String(selectedClub);
      filtered = filtered.filter(
        (user) => {
          const byClubId = user.clubId != null && String(user.clubId) === selectedClubKey;
          const byClubName = user.clubName != null && String(user.clubName) === selectedClubKey;
          return byClubId || byClubName;
        },
      );
    }
    setFilteredUsers(filtered);
  }, [searchTerm, selectedClub, userClubs, teacherStudents]);

  // Reset to first page whenever filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm, selectedClub, userClubs, teacherStudents]);

  useEffect(() => {
    setExpandedMobileCard(null);
  }, [currentPage, searchTerm, selectedClub]);

  const handleRemoveUser = async (user) => {
    const { prn, clubName, name, clubId, role, tenure } = user;
    try {
      const response = await axios.delete(
        `${BASE_URL}/api/user-clubs/user/${prn}/club/${clubName}`,
        {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          data: { prn, clubId, role, tenure },
        },
      );
      if (response.data.success) {
        setSuccessMessage(`Successfully removed ${name} from ${clubName}`);
        fetchUserClubs();
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (err) {
      setError(`Failed to remove user. ${err.response?.data?.message || err.message}`);
    }
  };

  const handleSaveRole = async (newRole) => {
    if (!editingUser || newRole === editingUser.role) return;
    setSavingRole(true);
    console.log(newRole, editingUser.prn, editingUser.clubId);
    try {
      const response = await axios.post(
        `${BASE_URL}/api/user-clubs/changeClubRole`,
        {
          prn: editingUser.prn,
          clubId: editingUser.clubId,
          newRole,
        },
        {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        },
      );
      if (response.data?.success) {
        setSuccessMessage(
          `Role updated to ${newRole.replace(/_/g, " ")} for ${editingUser.name}`,
        );
        setEditingUser(null);
        fetchUserClubs();
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        throw new Error(response.data?.message || "Failed to update role");
      }
    } catch (err) {
      setError(`Failed to update role. ${err.response?.data?.message || err.message}`);
    } finally {
      setSavingRole(false);
    }
  };

  if (loading || loadingClubs) {
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center transition-colors duration-300"
        style={{ background: theme.bgGradient }}
      >
        <div
          className="w-16 h-16 border-4 rounded-full animate-spin"
          style={{ borderColor: `${theme.primaryColor}20`, borderTopColor: theme.primaryColor }}
        ></div>
        <p className="mt-4 font-medium animate-pulse tracking-wide" style={{ color: theme.textMuted }}>
          {teacherPrn ? "Loading teacher's students..." : "Synchronizing database..."}
        </p>
      </div>
    );
  }

  return (
    <>
    <div 
      className="min-h-screen relative font-sans antialiased transition-colors duration-300"
      style={{ background: theme.bgGradient }}
    >
      <style>{`
        @keyframes blob {
          0%   { transform: translate(0px, 0px)   scale(1);   }
          33%  { transform: translate(30px, -50px) scale(1.1); }
          66%  { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px)   scale(1);   }
        }
        .animate-blob          { animation: blob 7s infinite; }
        .animation-delay-2000  { animation-delay: 2s; }
        .animation-delay-4000  { animation-delay: 4s; }
      `}</style>

      {/* Edit Role Modal */}
      {editingUser && (
        <EditRoleModal
          user={editingUser}
          availableRoles={availableRoles}
          onClose={() => setEditingUser(null)}
          onSave={handleSaveRole}
          saving={savingRole}
          theme={theme}
        />
      )}

      {/* Animated Background - only show in light mode */}
      {!isDarkMode && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob"></div>
          <div
            className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-2000"
            style={{ backgroundColor: theme.primaryColor }}
          ></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-4000"></div>
        </div>
      )}

      {/* Sticky Back Button Bar */}
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

      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 sm:px-6 lg:px-8 relative z-10">
        {/* 1. Header - FIXED: Made text visible in both modes */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            <span style={{ 
              color: theme.textPrimary,
              background: isDarkMode ? 'none' : theme.primaryGradient,
              WebkitBackgroundClip: isDarkMode ? 'unset' : 'text',
              WebkitTextFillColor: isDarkMode ? 'unset' : 'transparent'
            }}>
              User Club Association
            </span>
          </h1>
          <p className="mt-2 text-base sm:text-lg font-medium" style={{ color: theme.textSecondary }}>
            Refine your organization by managing club rosters and permissions.
          </p>
        </div>

        {/* 2. Search & Filter */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
          <div className="lg:col-span-8 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors" size={20} style={{ color: theme.primaryColor }} />
            <input
              type="text"
              placeholder="Search by name, PRN, or department..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl focus:ring-4 focus:border-transparent transition-all shadow-sm outline-none font-medium cursor-text"
              style={{ 
                backgroundColor: theme.accentSoft,
                border: `1px solid ${theme.borderColor}`,
                color: theme.textPrimary
              }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
          <div className="lg:col-span-4 relative group">
            <CustomSelect
              name="clubFilter"
              value={selectedClub}
              onChange={(e) => setSelectedClub(e.target.value)}
              options={[
                { value: "", label: "All Clubs" },
                ...teacherClubs.map((club) => ({
                  value: String(club.clubId),
                  label: `${club.clubName} • ${club.role}`,
                })),
              ]}
              placeholder="All Clubs"
              theme={theme}
            />
          </div>
        </div>

        {/* 3. Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { icon: <Users size={28} />, label: "Total Users",   value: filteredUsers.length },
            { icon: <Building2 size={28} />, label: "Unique Clubs",  value: teacherClubs.length },
            { icon: <Layers size={28} />, label: "Active Roles",  value: [...new Set(filteredUsers.map((u) => u.role))].length },
          ].map(({ icon, label, value }) => (
            <div 
              key={label} 
              className="rounded-[2rem] border shadow-xl flex items-center space-x-5 transition-transform hover:scale-[1.02] cursor-pointer"
              style={{ 
                backgroundColor: theme.bgCard,
                borderColor: theme.borderColor,
                boxShadow: isDarkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                padding: '1.5rem'
              }}
            >
              <div className="p-4 rounded-2xl" style={{ backgroundColor: theme.primaryLight, color: theme.primaryColor }}>{icon}</div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest" style={{ color: theme.textMuted }}>{label}</p>
                <h3 className="text-3xl font-black" style={{ color: theme.textPrimary }}>{value}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* Teacher Dashboard Banner */}
        {teacherClubs.length > 0 && (
          <div 
            className="mb-6 p-4 sm:p-6 border rounded-[1.5rem] sm:rounded-[2rem] shadow-xl transition-colors duration-300"
            style={{ 
              background: theme.primaryLight,
              borderColor: theme.borderColor 
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-2xl" style={{ backgroundColor: "rgba(190,166,108,0.15)", color: "#ef9d0f" }}>
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black" style={{ color: theme.primaryColor }}>Teacher Dashboard Mode</h3>
                  <p className="text-sm font-medium" style={{ color: theme.primaryColor }}>Showing students from your assigned clubs</p>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-sm font-bold" style={{ color: theme.primaryColor }}>PRN: {teacherPrn}</p>
                <p className="text-xs" style={{ color: theme.primaryColor }}>{teacherClubs.length} clubs assigned</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-bold mb-2" style={{ color: theme.primaryColor }}>Your Clubs:</p>
              <div className="flex flex-wrap gap-2">
                {teacherClubs.map((club) => (
                  <span 
                    key={club.clubId} 
                    className="px-4 py-2 text-sm font-bold rounded-full border shadow-sm hover:shadow-md transition-shadow"
                    style={{ 
                      color: theme.primaryColor,
                      backgroundColor: theme.bgCard,
                      borderColor: theme.borderColor 
                    }}
                  >
                    {club.clubName} • {club.role}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Notifications */}
        {error && (
          <div className="mb-6 flex items-center p-4 border-l-4 rounded-xl" style={{ background: "rgba(239, 68, 68, 0.1)", borderLeftColor: "#ef4444", color: "#ef4444" }}>
            <AlertCircle className="mr-3 shrink-0" size={20} />
            <p className="text-sm font-bold">{error}</p>
          </div>
        )}
        {successMessage && (
          <div className="mb-6 flex items-center p-4 border-l-4 rounded-xl" style={{ background: "rgba(16, 185, 129, 0.1)", borderLeftColor: "#10b981", color: "#10b981" }}>
            <CheckCircle2 className="mr-3 shrink-0" size={20} />
            <p className="text-sm font-bold">{successMessage}</p>
          </div>
        )}

        {/* 4. Table */}
        <div 
          className="rounded-[1.5rem] sm:rounded-[2.5rem] border shadow-2xl overflow-hidden transition-colors duration-300"
          style={{ 
            backgroundColor: theme.bgCard,
            borderColor: theme.borderColor,
            boxShadow: isDarkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
        >
          <div className="overflow-x-auto">
            {filteredUsers.length === 0 ? (
              <div className="py-24 text-center">
                <div 
                  className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
                  style={{ background: theme.accentSoft }}
                >
                  <Search size={40} style={{ color: theme.textMuted }} />
                </div>
                <h3 className="text-xl font-black" style={{ color: theme.textPrimary }}>No members match your criteria</h3>
                <p className="font-medium" style={{ color: theme.textSecondary }}>Try broadening your search or adjusting filters.</p>
              </div>
            ) : (
              <>
                <div className="hidden lg:block">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b" style={{ borderColor: theme.borderColor, background: theme.accentSoft }}>
                        <th className="px-10 py-6 text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: theme.textMuted }}>Member</th>
                        <th className="px-10 py-6 text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: theme.textMuted }}>Club & Status</th>
                        <th className="px-10 py-6 text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: theme.textMuted }}>Education</th>
                        <th className="px-10 py-6 text-right text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: theme.textMuted }}>Actions</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: theme.borderColor }}>
                      {pagedUsers.map((user) => {
                        const blobUrl = profileImages[user.prn];
                        return (
                          <tr key={user.userClubId} className="group transition-all duration-300 hover:bg-opacity-5" style={{ hover: { backgroundColor: `${theme.primaryColor}10` } }}>
                            <td className="px-10 py-6">
                              <div className="flex items-center space-x-4">
                                <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                                  {blobUrl ? (
                                    <img src={blobUrl} alt={user.name} className="w-14 h-14 object-cover rounded-2xl" />
                                  ) : (
                                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl" style={{ background: theme.primaryGradient }}>
                                      {user.name.charAt(0).toUpperCase()}
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <p className="font-black text-lg leading-tight transition-colors" style={{ color: theme.textPrimary }}>{user.name}</p>
                                  <p className="text-xs font-bold mt-1" style={{ color: theme.textMuted }}>{user.prn}</p>
                                </div>
                              </div>
                              </td>

                            <td className="px-10 py-6">
                              <div className="flex flex-col space-y-2">
                                <span className="inline-flex items-center text-sm font-black" style={{ color: theme.textPrimary }}>
                                  <Building2 size={16} className="mr-2" style={{ color: theme.primaryColor }} />
                                  {user.clubName}
                                </span>
                                <div>
                                  <span
                                    className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm border ${
                                      user.role === "CLUB_ADMIN" ? "" : ""
                                    }`}
                                    style={
                                      user.role === "CLUB_ADMIN"
                                        ? { backgroundColor: theme.primaryLight, borderColor: theme.borderColor, color: theme.primaryColor }
                                        : { backgroundColor: "rgba(59,130,246,0.1)", borderColor: theme.borderColor, color: "#3B82F6" }
                                    }
                                  >
                                    {user.role.replace(/_/g, " ")}
                                  </span>
                                </div>
                              </div>
                              </td>

                            <td className="px-10 py-6">
                              <div className="space-y-1">
                                <div className="flex items-center text-sm font-bold" style={{ color: theme.textSecondary }}>
                                  <Briefcase size={14} className="mr-2" style={{ color: theme.textMuted }} />
                                  {user.department}
                                </div>
                                <p className="text-xs font-bold ml-5" style={{ color: theme.textMuted }}>Year {user.year} • {user.tenure}</p>
                              </div>
                              </td>

                            <td className="px-10 py-6">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => setEditingUser(user)}
                                  className="inline-flex items-center justify-center w-12 h-12 rounded-2xl border transition-all shadow-sm active:scale-90 cursor-pointer"
                                  style={{ 
                                    background: theme.accentSoft,
                                    borderColor: theme.borderColor,
                                    color: theme.textMuted
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = theme.primaryGradient;
                                    e.currentTarget.style.color = "white";
                                    e.currentTarget.style.borderColor = "transparent";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = theme.accentSoft;
                                    e.currentTarget.style.color = theme.textMuted;
                                    e.currentTarget.style.borderColor = theme.borderColor;
                                  }}
                                  title="Edit role"
                                >
                                  <Pencil size={18} />
                                </button>
                                <button
                                  onClick={() => setConfirmDialog({ isOpen: true, title: "Remove from Club", message: `Are you sure you want to remove ${user.name} from ${user.clubName}?`, confirmText: "Remove", variant: "danger", onConfirm: () => { closeConfirm(); handleRemoveUser(user); } })}
                                  className="inline-flex items-center justify-center w-12 h-12 rounded-2xl border transition-all shadow-sm active:scale-90 cursor-pointer"
                                  style={{ 
                                    background: theme.accentSoft,
                                    borderColor: theme.borderColor,
                                    color: theme.textMuted
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = "#ef4444";
                                    e.currentTarget.style.color = "white";
                                    e.currentTarget.style.borderColor = "transparent";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = theme.accentSoft;
                                    e.currentTarget.style.color = theme.textMuted;
                                    e.currentTarget.style.borderColor = theme.borderColor;
                                  }}
                                  title="Remove from club"
                                >
                                  <UserMinus size={22} />
                                </button>
                              </div>
                              </td>
                            </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="lg:hidden p-4 sm:p-6 space-y-3 sm:space-y-4">
                  {pagedUsers.map((user) => {
                    const blobUrl = profileImages[user.prn];
                    const isExpanded = expandedMobileCard === user.userClubId;
                    return (
                      <div 
                        key={user.userClubId} 
                        className="rounded-2xl border p-4 shadow-sm"
                        style={{ backgroundColor: theme.bgCard, borderColor: theme.borderColor }}
                      >
                        <button
                          type="button"
                          onClick={() => setExpandedMobileCard((prev) => (prev === user.userClubId ? null : user.userClubId))}
                          className="w-full flex items-center justify-between gap-3 text-left"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
                              {blobUrl ? (
                                <img src={blobUrl} alt={user.name} className="w-11 h-11 object-cover rounded-xl" />
                              ) : (
                                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-black" style={{ background: theme.primaryGradient }}>
                                  {user.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-black truncate" style={{ color: theme.textPrimary }}>{user.name}</p>
                              <p className="text-xs font-bold mt-0.5" style={{ color: theme.textMuted }}>{user.prn}</p>
                            </div>
                          </div>
                          <ChevronRight
                            size={18}
                            className={`transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
                            style={{ color: theme.textMuted }}
                          />
                        </button>

                        {isExpanded && (
                          <>
                            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center font-bold" style={{ color: theme.textSecondary }}>
                                <Building2 size={14} className="mr-2" style={{ color: theme.primaryColor }} />
                                <span className="truncate">{user.clubName}</span>
                              </div>
                              <div>
                                <span
                                  className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border whitespace-nowrap`}
                                  style={
                                    user.role === "CLUB_ADMIN"
                                      ? { backgroundColor: theme.primaryLight, borderColor: theme.borderColor, color: theme.primaryColor }
                                      : { backgroundColor: "rgba(59,130,246,0.1)", borderColor: theme.borderColor, color: "#3B82F6" }
                                  }
                                >
                                  {user.role.replace(/_/g, " ")}
                                </span>
                              </div>
                              <div className="flex items-center font-bold sm:col-span-2" style={{ color: theme.textSecondary }}>
                                <Briefcase size={14} className="mr-2" style={{ color: theme.textMuted }} />
                                <span className="truncate">{user.department}</span>
                              </div>
                              <div className="text-xs font-bold sm:col-span-2" style={{ color: theme.textMuted }}>Year {user.year} • {user.tenure}</div>
                            </div>

                            <div className="mt-4 flex items-center justify-end gap-2">
                              <button
                                onClick={() => setEditingUser(user)}
                                className="inline-flex items-center justify-center h-10 px-3 rounded-xl border transition-all shadow-sm active:scale-95"
                                style={{ 
                                  background: theme.accentSoft,
                                  borderColor: theme.borderColor,
                                  color: theme.textSecondary
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = theme.primaryGradient;
                                  e.currentTarget.style.color = "white";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = theme.accentSoft;
                                  e.currentTarget.style.color = theme.textSecondary;
                                }}
                              >
                                <Pencil size={16} className="mr-1.5" /> Edit
                              </button>
                              <button
                                onClick={() => setConfirmDialog({ isOpen: true, title: "Remove from Club", message: `Are you sure you want to remove ${user.name} from ${user.clubName}?`, confirmText: "Remove", variant: "danger", onConfirm: () => { closeConfirm(); handleRemoveUser(user); } })}
                                className="inline-flex items-center justify-center h-10 px-3 rounded-xl border transition-all shadow-sm active:scale-95"
                                style={{ 
                                  background: theme.accentSoft,
                                  borderColor: theme.borderColor,
                                  color: theme.textSecondary
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = "#ef4444";
                                  e.currentTarget.style.color = "white";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = theme.accentSoft;
                                  e.currentTarget.style.color = theme.textSecondary;
                                }}
                              >
                                <UserMinus size={16} className="mr-1.5" /> Remove
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Pagination */}
        {filteredUsers.length > PAGE_SIZE && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
            <p className="text-sm font-bold" style={{ color: theme.textMuted }}>
              Showing{" "}
              <span style={{ color: theme.textPrimary }}>{currentPage * PAGE_SIZE + 1}–{Math.min((currentPage + 1) * PAGE_SIZE, filteredUsers.length)}</span>
              {" "}of{" "}
              <span style={{ color: theme.textPrimary }}>{filteredUsers.length}</span> members
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className="w-10 h-10 rounded-xl border flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                style={{ 
                  borderColor: theme.borderColor,
                  color: theme.textMuted,
                  background: theme.accentSoft
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== 0) {
                    e.currentTarget.style.background = theme.primaryGradient;
                    e.currentTarget.style.color = "white";
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== 0) {
                    e.currentTarget.style.background = theme.accentSoft;
                    e.currentTarget.style.color = theme.textMuted;
                  }
                }}
              >
                <ChevronLeft size={18} />
              </button>

              {Array.from({ length: Math.ceil(filteredUsers.length / PAGE_SIZE) }, (_, i) => i)
                .filter((i) => i === 0 || i === Math.ceil(filteredUsers.length / PAGE_SIZE) - 1 || Math.abs(i - currentPage) <= 1)
                .reduce((acc, i, idx, arr) => {
                  if (idx > 0 && i - arr[idx - 1] > 1) acc.push("...");
                  acc.push(i);
                  return acc;
                }, [])
                .map((item, idx) =>
                  item === "..." ? (
                    <span key={`ellipsis-${idx}`} className="px-1 font-bold text-sm" style={{ color: theme.textMuted }}>…</span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setCurrentPage(item)}
                      className={`w-10 h-10 rounded-xl text-sm font-black transition-all shadow-sm ${
                        item === currentPage
                          ? "text-white border-transparent"
                          : ""
                      }`}
                      style={item === currentPage
                        ? { background: theme.primaryGradient }
                        : { 
                            background: theme.accentSoft,
                            border: `1px solid ${theme.borderColor}`,
                            color: theme.textSecondary
                          }}
                      onMouseEnter={(e) => {
                        if (item !== currentPage) {
                          e.currentTarget.style.borderColor = theme.primaryColor;
                          e.currentTarget.style.color = theme.primaryColor;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (item !== currentPage) {
                          e.currentTarget.style.borderColor = theme.borderColor;
                          e.currentTarget.style.color = theme.textSecondary;
                        }
                      }}
                    >
                      {item + 1}
                    </button>
                  ),
                )}

              <button
                onClick={() => setCurrentPage((p) => Math.min(Math.ceil(filteredUsers.length / PAGE_SIZE) - 1, p + 1))}
                disabled={currentPage >= Math.ceil(filteredUsers.length / PAGE_SIZE) - 1}
                className="w-10 h-10 rounded-xl border flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                style={{ 
                  borderColor: theme.borderColor,
                  color: theme.textMuted,
                  background: theme.accentSoft
                }}
                onMouseEnter={(e) => {
                  if (currentPage < Math.ceil(filteredUsers.length / PAGE_SIZE) - 1) {
                    e.currentTarget.style.background = theme.primaryGradient;
                    e.currentTarget.style.color = "white";
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage < Math.ceil(filteredUsers.length / PAGE_SIZE) - 1) {
                    e.currentTarget.style.background = theme.accentSoft;
                    e.currentTarget.style.color = theme.textMuted;
                  }
                }}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-10 flex flex-col md:flex-row items-center justify-between text-[10px] font-black uppercase tracking-[0.12em] sm:tracking-[0.2em] px-2 sm:px-6 opacity-60 gap-3" style={{ color: theme.textMuted }}>
          <p>Database synchronization active • {filteredUsers.length} Users Listed</p>
          <div className="flex items-center space-x-4 sm:space-x-6 md:mt-0">
            <span className="flex items-center">
              <span className="w-2.5 h-2.5 rounded-full mr-2 shadow-sm" style={{ backgroundColor: theme.primaryColor }}></span>
              Admin
            </span>
            <span className="flex items-center">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 mr-2 shadow-sm"></span>
              Member
            </span>
          </div>
        </div>
      </div>
    </div>

    <ConfirmDialog
      isOpen={confirmDialog.isOpen}
      title={confirmDialog.title}
      message={confirmDialog.message}
      confirmText={confirmDialog.confirmText}
      variant={confirmDialog.variant}
      onConfirm={confirmDialog.onConfirm}
      onCancel={closeConfirm}
      theme={theme}
    />
    </>
  );
};

export default UserRemoveFromClub;