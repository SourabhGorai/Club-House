// import { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import CustomSelect from "../../components/CustomSelect";
// import {
//   User, Mail, Phone, BookOpen, Calendar, Trash2,
//   Briefcase, Filter, X, ArrowLeft, ChevronLeft, ChevronRight,
// } from "lucide-react";

// // ----------------------------------------------------------------
// // CONSTANTS
// // ----------------------------------------------------------------
// const BASE_URL = "http://localhost:8080";
// const PAGE_SIZE = 15;

// const authHeaders = (token) => ({
//   Authorization: `Bearer ${token}`,
//   "Content-Type": "application/json",
// });

// // ----------------------------------------------------------------
// // STYLES
// // ----------------------------------------------------------------
// const customStyles = `
//   @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
//   @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@500;700;800&display=swap');

//   .font-sans { font-family: 'Poppins', sans-serif; }
//   .font-display { font-family: 'Outfit', sans-serif; }

//   .btn-gradient {
//     background-image: linear-gradient(135deg, #4CA1AF, #315169);
//     color: white; font-weight: 500; border-radius: 9999px;
//     padding: 0.5rem 1rem; transition: all 0.3s ease-out; cursor: pointer;
//     box-shadow: 0 5px 15px rgba(76,161,175,0.2);
//   }
//   .btn-gradient:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(76,161,175,0.3); }

//   .user-card-container { perspective: 1000px; height: 20rem; cursor: pointer; }
//   .user-card {
//     transform-style: preserve-3d; transition: transform 0.5s ease-in-out;
//     width: 100%; height: 100%; position: relative;
//   }
//   .user-card-container:hover .user-card,
//   .user-card-container.flipped .user-card { transform: rotateY(180deg); }

//   .card-face {
//     position: absolute; width: 100%; height: 100%;
//     backface-visibility: hidden; border-radius: 1rem;
//     box-shadow: 0 10px 30px rgba(0,0,0,0.05); padding: 1.5rem;
//   }
//   .card-face button { cursor: pointer; }
//   .card-back { transform: rotateY(180deg); background: linear-gradient(135deg, #4CA1AF, #315169); }

//   @keyframes blob {
//     0%   { transform: translate(0px,0px) scale(1); }
//     33%  { transform: translate(30px,-50px) scale(1.1); }
//     66%  { transform: translate(-20px,20px) scale(0.9); }
//     100% { transform: translate(0px,0px) scale(1); }
//   }
//   .animate-blob { animation: blob 7s infinite; }
//   .animation-delay-2000 { animation-delay: 2s; }
//   .animation-delay-4000 { animation-delay: 4s; }
// `;

// // ----------------------------------------------------------------
// // MODALS
// // ----------------------------------------------------------------
// const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
//   if (!isOpen) return null;
//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-md">
//       <div className="bg-white rounded-xl shadow-lg shadow-red-500/50 p-6 w-11/12 max-w-md">
//         <h3 className="font-bold text-xl text-red-600 mb-3">{title}</h3>
//         <p className="text-gray-700 mb-6">{message}</p>
//         <div className="flex justify-end space-x-3">
//           <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition cursor-pointer">
//             Cancel
//           </button>
//           <button onClick={onConfirm} className="px-6 py-2 text-sm font-medium rounded-full bg-red-600 text-white hover:bg-red-700 transition cursor-pointer">
//             Delete User
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// const FilterModal = ({ isOpen, onClose, departments, selectedDept, selectedYear, selectedRole, prnSearch, onDeptChange, onYearChange, onRoleChange, onPrnSearch, onResetFilters }) => {
//   if (!isOpen) return null;
//   const roles = [
//     { label: "Users", value: "USERS" },
//     { label: "Teachers", value: "TEACHERS" },
//     { label: "Super Admin", value: "SUPER_ADMIN" },
//   ];
//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-lg">
//       <div className="bg-white rounded-xl shadow-lg p-6 w-11/12 max-w-md">
//         <div className="flex justify-between items-center mb-6">
//           <h3 className="font-bold text-xl flex items-center" style={{ color: "#4CA1AF" }}>
//             <Filter className="w-5 h-5 mr-2" /> Filter Users
//           </h3>
//           <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 cursor-pointer">
//             <X className="w-5 h-5" />
//           </button>
//         </div>

//         <div className="space-y-5">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Search by PRN</label>
//             <div className="relative">
//               <input
//                 type="text"
//                 value={prnSearch}
//                 onChange={(e) => onPrnSearch(e.target.value)}
//                 placeholder="e.g. 2300140149"
//                 className="w-full px-4 py-2.5 pr-9 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent"
//                 style={{ focusRingColor: "#4CA1AF" }}
//               />
//               {prnSearch && (
//                 <button onClick={() => onPrnSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
//                   <X className="w-4 h-4" />
//                 </button>
//               )}
//             </div>
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">User Role</label>
//             <CustomSelect name="role" value={selectedRole} onChange={(e) => onRoleChange(e.target.value)} placeholder="All Roles"
//               options={[{ value: "", label: "All Roles" }, ...roles.map((r) => ({ value: r.value, label: r.label }))]} />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
//             <CustomSelect name="department" value={selectedDept} onChange={(e) => onDeptChange(e.target.value)} placeholder="All Departments"
//               options={[{ value: "", label: "All Departments" }, ...departments.map((d) => ({ value: d, label: d }))]} />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
//             {/* Year options use string values to match React <select> state */}
//             <CustomSelect name="year" value={selectedYear} onChange={(e) => onYearChange(e.target.value)} placeholder="All Years"
//               options={[{ value: "", label: "All Years" }, ...[1, 2, 3, 4].map((y) => ({ value: String(y), label: `Year ${y}` }))]} />
//           </div>

//           {(selectedDept || selectedYear || selectedRole) && (
//             <div className="bg-gray-50 p-3 rounded-lg">
//               <p className="text-xs font-medium text-gray-600 mb-2">Active Filters:</p>
//               <div className="flex flex-wrap gap-2">
//                 {prnSearch && (
//                   <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
//                     PRN: {prnSearch}
//                     <button onClick={() => onPrnSearch("")} className="ml-1 cursor-pointer"><X className="w-3 h-3" /></button>
//                   </span>
//                 )}
//                 {selectedRole && (
//                   <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
//                     Role: {selectedRole.replace("_", " ")}
//                     <button onClick={() => onRoleChange("")} className="ml-1 cursor-pointer"><X className="w-3 h-3" /></button>
//                   </span>
//                 )}
//                 {selectedDept && (
//                   <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: "rgba(76,161,175,0.1)", color: "#4CA1AF" }}>
//                     Dept: {selectedDept}
//                     <button onClick={() => onDeptChange("")} className="ml-1" style={{ color: "#4CA1AF" }}><X className="w-3 h-3" /></button>
//                   </span>
//                 )}
//                 {selectedYear && (
//                   <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
//                     Year: {selectedYear}
//                     <button onClick={() => onYearChange("")} className="ml-1 cursor-pointer"><X className="w-3 h-3" /></button>
//                   </span>
//                 )}
//               </div>
//             </div>
//           )}

//           <div className="flex justify-between pt-2">
//             <button onClick={() => { onResetFilters(); onClose(); }}
//               className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition cursor-pointer">
//               Reset All
//             </button>
//             <button onClick={onClose} className="px-6 py-2 text-sm font-medium rounded-full text-white cursor-pointer"
//               style={{ background: "linear-gradient(135deg, #4CA1AF, #315169)" }}>
//               Apply Filters
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ----------------------------------------------------------------
// // API HELPERS
// // ----------------------------------------------------------------

// /** GET /api/users/ */
// const fetchAllUsers = async (token) => {
//   const res = await axios.get(`${BASE_URL}/api/users/`, { headers: authHeaders(token) });
//   return res.data || [];
// };

// /**
//  * POST /api/profiles/prns
//  * ProfileResponse: { prn, fullName, department (string name), year (Integer), phoneNumber, hasProfileImage, imageUrl }
//  * Returns { prn -> ProfileResponse }
//  */
// const fetchProfilesForPrns = async (prns, token) => {
//   if (!prns.length) return {};
//   const res = await axios.post(`${BASE_URL}/api/profiles/prns`, prns, { headers: authHeaders(token) });
//   const profiles = res.data?.data || [];
//   return profiles.reduce((acc, p) => ({ ...acc, [p.prn]: p }), {});
// };

// /**
//  * Image fetching strategy:
//  * 1. POST /api/profiles/image-urls  → { prn -> "/api/profiles/{prn}/image" | null }
//  *    Tells us which PRNs actually have images without downloading them.
//  * 2. Parallel blob GETs (with auth) only for PRNs that have images.
//  *    <img src> cannot use auth headers directly, so we create objectURLs.
//  * Returns { prn -> objectURL | null }
//  */
// const fetchImagesForPrns = async (prns, token) => {
//   if (!prns.length) return {};

//   const urlRes = await axios.post(`${BASE_URL}/api/profiles/image-urls`, prns, { headers: authHeaders(token) });
//   const urlMap = urlRes.data?.data || {}; // { prn -> path | null }

//   const prnsWithImages = prns.filter((prn) => urlMap[prn] != null);

//   const blobResults = await Promise.all(
//     prnsWithImages.map(async (prn) => {
//       try {
//         const res = await axios.get(`${BASE_URL}/api/profiles/${prn}/image`, {
//           headers: { Authorization: `Bearer ${token}` },
//           responseType: "blob",
//         });
//         return { prn, url: res.data?.size > 0 ? URL.createObjectURL(res.data) : null };
//       } catch {
//         return { prn, url: null };
//       }
//     })
//   );

//   // All PRNs present in result — null means no image
//   const result = Object.fromEntries(prns.map((prn) => [prn, null]));
//   blobResults.forEach(({ prn, url }) => { result[prn] = url; });
//   return result;
// };

// /**
//  * GET /api/department
//  * DepartmentResponse: { departmentId, name, active }
//  * NOTE: Java primitive boolean `isActive` serializes to `active` in JSON (Jackson strips "is").
//  */
// const fetchDepartmentNames = async (token) => {
//   const res = await axios.get(`${BASE_URL}/api/department`, { headers: authHeaders(token) });
//   return (res.data?.data || [])
//     .filter((d) => d.active === true)
//     .map((d) => d.name)
//     .sort();
// };

// // ----------------------------------------------------------------
// // HELPERS
// // ----------------------------------------------------------------
// const getRoleBadgeClass = (role) => {
//   switch (role) {
//     case "SUPER_ADMIN": return "bg-purple-600 text-white font-bold shadow-md shadow-purple-500/30";
//     case "TEACHERS":    return "bg-teal-400 text-white font-bold shadow-md shadow-teal-400/30";
//     case "USERS":       return "bg-blue-400 text-white font-bold shadow-md shadow-blue-400/30";
//     default:            return "bg-gray-300 text-gray-700";
//   }
// };

// // ----------------------------------------------------------------
// // MAIN COMPONENT
// // ----------------------------------------------------------------
// const UserManagement = () => {
//   const navigate = useNavigate();
//   const token = localStorage.getItem("token");

//   // ── Core data ─────────────────────────────────────────────────
//   const [allUsers, setAllUsers]           = useState([]);  // full user list
//   const [userProfiles, setUserProfiles]   = useState({});  // { prn -> ProfileResponse } ALL loaded upfront
//   const [profileImages, setProfileImages] = useState({});  // { prn -> objectURL|null } lazy per page
//   const [departments, setDepartments]     = useState([]);  // active dept name strings

//   // ── UI ────────────────────────────────────────────────────────
//   const [loading, setLoading]                     = useState(true);
//   const [pageLoading, setPageLoading]             = useState(false);
//   const [error, setError]                         = useState(null);
//   const [openOverlayFor, setOpenOverlayFor]       = useState(null);
//   const [isModalOpen, setIsModalOpen]             = useState(false);
//   const [userToDelete, setUserToDelete]           = useState(null);
//   const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

//   // ── Filters — all stored as strings for <select> compatibility ─
//   const [selectedRole, setSelectedRole] = useState("");
//   const [selectedDept, setSelectedDept] = useState("");
//   const [selectedYear, setSelectedYear] = useState(""); // "" | "1" | "2" | "3" | "4"
//   const [prnSearch, setPrnSearch]       = useState(""); // partial PRN match (case-insensitive)

//   // ── Pagination ─────────────────────────────────────────────────
//   const [currentPage, setCurrentPage] = useState(0);

//   // ── Derived filtered list ──────────────────────────────────────
//   // ProfileResponse.department  = string name  (set by mapper from dept.getName())
//   // ProfileResponse.year        = Integer      (must compare as Number vs string selectedYear)
//   const filteredUsers = allUsers.filter((user) => {
//     // PRN search: case-insensitive partial match
//     if (prnSearch && !user.prn?.toLowerCase().includes(prnSearch.toLowerCase().trim())) return false;

//     if (selectedRole && user.role !== selectedRole) return false;

//     if (selectedDept || selectedYear) {
//       const profile = userProfiles[user.prn];
//       if (!profile) return false; // profiles still loading — exclude safely

//       if (selectedDept && profile.department !== selectedDept) return false;
//       if (selectedYear && profile.year !== Number(selectedYear)) return false;
//     }

//     return true;
//   });

//   const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
//   const safePage   = Math.min(currentPage, totalPages - 1);
//   const pagedUsers = filteredUsers.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

//   // ── Initial load ───────────────────────────────────────────────
//   useEffect(() => {
//     const init = async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         const [usersData, deptNames] = await Promise.all([
//           fetchAllUsers(token),
//           fetchDepartmentNames(token),
//         ]);

//         setAllUsers(usersData);
//         setDepartments(deptNames);

//         // Bulk-fetch ALL profiles in one call so department/year filters work
//         // across every page without waiting for page-by-page enrichment.
//         const allPrns = usersData.map((u) => u.prn).filter(Boolean);
//         const profilesMap = await fetchProfilesForPrns(allPrns, token);
//         setUserProfiles(profilesMap);

//         // Load images for page 0 only
//         const page0Prns = allPrns.slice(0, PAGE_SIZE);
//         await loadImages(page0Prns);
//       } catch (err) {
//         console.error("Init error:", err);
//         setError("Failed to load user data. Check API availability and authorization.");
//       } finally {
//         setLoading(false);
//       }
//     };
//     init();
//   }, []);

//   // ── Lazy image loading per page ────────────────────────────────
//   const fetchedImageKeysRef = useRef(new Set());

//   useEffect(() => {
//     if (loading || !pagedUsers.length) return;
//     const prns = pagedUsers.map((u) => u.prn).filter(Boolean);
//     const uncached = prns.filter((prn) => !(prn in profileImages));
//     if (!uncached.length) return;

//     const key = uncached.join("|");
//     if (fetchedImageKeysRef.current.has(key)) return;
//     fetchedImageKeysRef.current.add(key);

//     loadImages(uncached);
//   }, [pagedUsers.map((u) => u.prn).join("|"), loading]);

//   const loadImages = async (prns) => {
//     if (!prns.length) return;
//     setPageLoading(true);
//     try {
//       const map = await fetchImagesForPrns(prns, token);
//       setProfileImages((prev) => ({ ...prev, ...map }));
//     } catch (err) {
//       console.error("Image load error:", err);
//     } finally {
//       setPageLoading(false);
//     }
//   };

//   // ── Filter handlers ────────────────────────────────────────────
//   const handleRoleChange = (val) => { setSelectedRole(val); setCurrentPage(0); };
//   const handleDeptChange = (val) => { setSelectedDept(val); setCurrentPage(0); };
//   const handleYearChange = (val) => { setSelectedYear(val); setCurrentPage(0); };
//   const handlePrnSearch  = (val) => { setPrnSearch(val); setCurrentPage(0); };
//   const resetFilters     = ()    => { setSelectedRole(""); setSelectedDept(""); setSelectedYear(""); setPrnSearch(""); setCurrentPage(0); };

//   // ── Delete ─────────────────────────────────────────────────────
//   const confirmDelete = (user) => { setUserToDelete(user); setIsModalOpen(true); };

//   const executeDelete = async () => {
//     if (!userToDelete) return;
//     try {
//       await axios.delete(`${BASE_URL}/api/users/${userToDelete.prn}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const prn = userToDelete.prn;
//       setAllUsers((prev) => prev.filter((u) => u.prn !== prn));
//       setUserProfiles((prev) => { const n = { ...prev }; delete n[prn]; return n; });
//       setProfileImages((prev) => { const n = { ...prev }; delete n[prn]; return n; });
//       setIsModalOpen(false);
//       setUserToDelete(null);
//     } catch (err) {
//       console.error("Delete error:", err);
//       alert(err.response?.data?.message || "Error deleting user. Please try again.");
//     }
//   };

//   const activeFilterCount = (selectedRole ? 1 : 0) + (selectedDept ? 1 : 0) + (selectedYear ? 1 : 0) + (prnSearch ? 1 : 0);

//   // ── Loading / error screens ────────────────────────────────────
//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <style dangerouslySetInnerHTML={{ __html: customStyles }} />
//         <div className="text-center p-8 bg-white rounded-xl shadow-lg">
//           <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 mx-auto" style={{ borderColor: "#4CA1AF" }} />
//           <p className="mt-6 font-medium" style={{ color: "#4CA1AF" }}>Loading user profiles...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <style dangerouslySetInnerHTML={{ __html: customStyles }} />
//         <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
//           <p className="text-red-600 font-medium mb-4">{error}</p>
//           <button onClick={() => window.location.reload()} className="btn-gradient px-6 py-2">Retry</button>
//         </div>
//       </div>
//     );
//   }

//   // ── Main render ────────────────────────────────────────────────
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 font-sans">
//       <style dangerouslySetInnerHTML={{ __html: customStyles }} />

//       {/* Animated background */}
//       <div className="fixed inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
//         <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" style={{ backgroundColor: "#4CA1AF" }} />
//         <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
//       </div>

//       {/* Sticky back bar */}
//       <div className="sticky top-0 z-50 w-full bg-white border-b border-gray-100">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex items-center h-16">
//             <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#4CA1AF] transition-colors group">
//               <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
//               <span>Back to Dashboard</span>
//             </button>
//           </div>
//         </div>
//       </div>

//       <div className="relative py-8">
//         <ConfirmationModal
//           isOpen={isModalOpen}
//           title="Confirm User Deletion"
//           message={`You are about to delete user: ${userToDelete?.username || userToDelete?.prn || "N/A"}. This action is irreversible. Proceed?`}
//           onConfirm={executeDelete}
//           onCancel={() => setIsModalOpen(false)}
//         />

//         <FilterModal
//           isOpen={isFilterModalOpen}
//           onClose={() => setIsFilterModalOpen(false)}
//           departments={departments}
//           selectedDept={selectedDept}
//           selectedYear={selectedYear}
//           selectedRole={selectedRole}
//           onDeptChange={handleDeptChange}
//           onYearChange={handleYearChange}
//           onRoleChange={handleRoleChange}
//           prnSearch={prnSearch}
//           onPrnSearch={handlePrnSearch}
//           onResetFilters={resetFilters}
//         />

//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

//           {/* Header */}
//           <div className="mb-8">
//             <h1 className="font-display text-4xl font-extrabold tracking-tight bg-gradient-to-r from-[#4CA1AF] to-[#315169] bg-clip-text text-transparent mb-2">
//               User Directory & Access Control
//             </h1>
//             <p className="text-gray-500 text-lg">Manage all staff, teachers, and club administrators.</p>
//           </div>

//           {/* Stats & filter bar */}
//           <div className="mb-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
//             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//               <h2 className="text-xl font-semibold font-display flex items-center" style={{ color: "#2d8391" }}>
//                 <Filter className="mr-3 w-5 h-5" style={{ color: "#26727e" }} />
//                 Active Users ({filteredUsers.length})
//               </h2>

//               <div className="flex flex-wrap items-center gap-3">
//                 {selectedRole && (
//                   <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-orange-100 text-orange-800 border border-orange-200">
//                     Role: {selectedRole.replace("_", " ")}
//                     <button onClick={() => handleRoleChange("")} className="ml-2 cursor-pointer"><X className="w-3 h-3" /></button>
//                   </span>
//                 )}
//                 {selectedDept && (
//                   <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border"
//                     style={{ backgroundColor: "rgba(76,161,175,0.1)", color: "#377882", borderColor: "rgba(76,161,175,0.2)" }}>
//                     Dept: {selectedDept}
//                     <button onClick={() => handleDeptChange("")} className="ml-2" style={{ color: "#4CA1AF" }}><X className="w-3 h-3" /></button>
//                   </span>
//                 )}
//                 {selectedYear && (
//                   <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
//                     Year: {selectedYear}
//                     <button onClick={() => handleYearChange("")} className="ml-2 cursor-pointer"><X className="w-3 h-3" /></button>
//                   </span>
//                 )}
//                 {prnSearch && (
//                   <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
//                     PRN: {prnSearch}
//                     <button onClick={() => handlePrnSearch("")} className="ml-2 cursor-pointer"><X className="w-3 h-3" /></button>
//                   </span>
//                 )}

//                 <button onClick={() => setIsFilterModalOpen(true)} className="btn-gradient flex items-center px-4 py-2.5 rounded-xl">
//                   <Filter className="w-4 h-4 mr-2" />
//                   Filter
//                   {activeFilterCount > 0 && (
//                     <span className="ml-2 bg-white text-[#4CA1AF] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
//                       {activeFilterCount}
//                     </span>
//                   )}
//                 </button>

//                 {activeFilterCount > 0 && (
//                   <button onClick={resetFilters} className="cursor-pointer px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition flex items-center">
//                     <X className="w-4 h-4 mr-2" /> Clear All
//                   </button>
//                 )}
//               </div>
//             </div>

//             <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
//               {[
//                 { label: "Total Users",       value: allUsers.length,      color: "#4CA1AF" },
//                 { label: "Currently Showing", value: filteredUsers.length, color: "#4CA1AF" },
//                 { label: "Departments",        value: departments.length,   color: "#10B981" },
//                 { label: "Active Filters",     value: activeFilterCount,    color: "#F59E0B" },
//               ].map(({ label, value, color }) => (
//                 <div key={label} className="bg-gray-50 p-3 rounded-xl">
//                   <div className="text-xs text-gray-500">{label}</div>
//                   <div className="text-2xl font-bold" style={{ color }}>{value}</div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Users grid */}
//           <div className="bg-white bg-opacity-95 rounded-3xl shadow-2xl p-6 sm:p-10 border border-gray-100">
//             {filteredUsers.length === 0 ? (
//               <div className="text-center py-12">
//                 <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
//                   <Filter className="w-12 h-12 text-gray-400" />
//                 </div>
//                 <h3 className="text-xl font-semibold text-gray-700 mb-2">No users found</h3>
//                 <p className="text-gray-500 mb-6">Try adjusting your filters to see more users.</p>
//                 <button onClick={resetFilters} className="btn-gradient px-6 py-2.5">Clear All Filters</button>
//               </div>
//             ) : (
//               <>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
//                   {pagedUsers.map((userItem) => {
//                     const profile   = userProfiles[userItem.prn];
//                     const imageUrl  = profileImages[userItem.prn];
//                     const isFlipped = openOverlayFor === userItem.prn;

//                     return (
//                       <div
//                         key={userItem.prn || userItem.id}
//                         className={`user-card-container ${isFlipped ? "flipped" : ""}`}
//                         onClick={() => setOpenOverlayFor(isFlipped ? null : userItem.prn)}
//                       >
//                         <div className="user-card">
//                           {/* Card front */}
//                           <div className="card-face bg-white border border-gray-200 flex flex-col items-center justify-center hover:shadow-xl hover:border-[#4CA1AF] transition-all duration-300">
//                             <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl mb-4">
//                               {imageUrl ? (
//                                 <img src={imageUrl} alt={userItem.username} className="w-full h-full object-cover"
//                                   onError={(e) => { e.target.onerror = null; e.target.style.display = "none"; }} />
//                               ) : (
//                                 <div className="w-full h-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #4CA1AF, #315169)" }}>
//                                   <span className="text-3xl font-display font-bold text-white">
//                                     {userItem.username?.charAt(0)?.toUpperCase() ?? "?"}
//                                   </span>
//                                 </div>
//                               )}
//                             </div>
//                             <div className="text-center">
//                               <div className="text-xl font-display font-semibold text-gray-900 truncate max-w-[20rem]">
//                                 {profile?.fullName || userItem.username}
//                               </div>
//                               <span className={`inline-block mt-2 px-3 py-1 text-xs rounded-full ${getRoleBadgeClass(userItem.role)}`}>
//                                 {userItem.role?.replace("_", " ") || "STANDARD USER"}
//                               </span>
//                             </div>
//                           </div>

//                           {/* Card back */}
//                           <div className="card-face card-back text-white p-6 flex flex-col justify-between">
//                             <div>
//                               <div className="flex items-center gap-3 mb-4">
//                                 <User className="w-6 h-6" />
//                                 <span className="font-display font-semibold text-2xl">{userItem.prn || "N/A"}</span>
//                               </div>
//                               <div className="text-sm space-y-3">
//                                 <div className="flex items-center gap-3">
//                                   <Mail className="w-4 h-4 text-[#2DD4BF]" />
//                                   <span className="truncate">{userItem.email}</span>
//                                 </div>
//                                 <div className="flex items-center gap-3">
//                                   <Phone className="w-4 h-4 text-[#FB923C]" />
//                                   <span>{profile?.phoneNumber || "No contact info"}</span>
//                                 </div>
//                                 <div className="flex items-center gap-3">
//                                   <BookOpen className="w-4 h-4 text-white/90" />
//                                   <span>{profile?.department || "—"}</span>
//                                   <Calendar className="w-4 h-4 ml-4 text-white/90" />
//                                   <span>Year: {profile?.year || "—"}</span>
//                                 </div>
//                                 <div className="flex items-center gap-3 pt-2">
//                                   <Briefcase className="w-4 h-4 text-white/90" />
//                                   <span className="px-3 py-1 text-xs rounded-full bg-white font-semibold" style={{ color: "#4CA1AF" }}>
//                                     {userItem.role?.replace("_", " ") || "STANDARD USER"}
//                                   </span>
//                                 </div>
//                               </div>
//                             </div>
//                             <div className="flex justify-center mt-6">
//                               <button
//                                 onClick={(e) => { e.stopPropagation(); confirmDelete(userItem); }}
//                                 className="px-3 py-2 bg-red-500 text-white rounded-full text-sm font-medium hover:bg-red-600 transition flex items-center shadow-md shadow-red-500/30 min-w-[120px] justify-center cursor-pointer"
//                               >
//                                 <Trash2 className="w-4 h-4 mr-1" /> Remove
//                               </button>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>

//                 {/* Pagination */}
//                 {totalPages > 1 && (
//                   <div className="mt-10 flex flex-col items-center gap-3">
//                     <div className="flex items-center gap-2">
//                       <button
//                         onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
//                         disabled={safePage === 0}
//                         className="p-2 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
//                       >
//                         <ChevronLeft className="w-5 h-5" />
//                       </button>

//                       {Array.from({ length: totalPages }, (_, i) => i)
//                         .filter((i) => i === 0 || i === totalPages - 1 || Math.abs(i - safePage) <= 1)
//                         .reduce((acc, i, idx, arr) => {
//                           if (idx > 0 && i - arr[idx - 1] > 1) acc.push(`ellipsis-${i}`);
//                           acc.push(i);
//                           return acc;
//                         }, [])
//                         .map((item) =>
//                           typeof item === "string" ? (
//                             <span key={item} className="px-2 text-gray-400">…</span>
//                           ) : (
//                             <button
//                               key={item}
//                               onClick={() => setCurrentPage(item)}
//                               className={`w-9 h-9 rounded-full text-sm font-medium transition cursor-pointer border ${
//                                 safePage === item
//                                   ? "text-white border-transparent"
//                                   : "text-gray-600 border-gray-200 hover:bg-gray-50"
//                               }`}
//                               style={safePage === item ? { background: "linear-gradient(135deg, #4CA1AF, #315169)" } : {}}
//                             >
//                               {item + 1}
//                             </button>
//                           )
//                         )}

//                       <button
//                         onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
//                         disabled={safePage === totalPages - 1}
//                         className="p-2 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
//                       >
//                         <ChevronRight className="w-5 h-5" />
//                       </button>
//                     </div>

//                     <p className="text-xs text-gray-400">
//                       Page {safePage + 1} of {totalPages} — {filteredUsers.length} users total
//                       {pageLoading && <span className="ml-2 italic text-[#4CA1AF]">Loading images…</span>}
//                     </p>
//                   </div>
//                 )}
//               </>
//             )}
//           </div>

//         </div>
//       </div>
//     </div>
//   );
// };

// export default UserManagement;

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import CustomSelect from "../../components/CustomSelect";
import {
  User, Mail, Phone, BookOpen, Calendar, Trash2,
  Briefcase, Filter, X, ArrowLeft, ChevronLeft, ChevronRight,
} from "lucide-react";

// ----------------------------------------------------------------
// CONSTANTS
// ----------------------------------------------------------------
const BASE_URL = "http://localhost:8080";
const PAGE_SIZE = 15;

const authHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
});

// ----------------------------------------------------------------
// STYLES
// ----------------------------------------------------------------
const customStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@500;700;800&display=swap');

  .font-sans { font-family: 'Poppins', sans-serif; }
  .font-display { font-family: 'Outfit', sans-serif; }

  .btn-gradient {
    background-image: linear-gradient(135deg, #4CA1AF, #315169);
    color: white; font-weight: 500; border-radius: 9999px;
    padding: 0.5rem 1rem; transition: all 0.3s ease-out; cursor: pointer;
    box-shadow: 0 5px 15px rgba(76,161,175,0.2);
  }
  .btn-gradient:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(76,161,175,0.3); }

  .user-card-container { perspective: 1000px; height: 20rem; cursor: pointer; }
  .user-card {
    transform-style: preserve-3d; transition: transform 0.5s ease-in-out;
    width: 100%; height: 100%; position: relative;
  }
  .user-card-container:hover .user-card,
  .user-card-container.flipped .user-card { transform: rotateY(180deg); }

  .card-face {
    position: absolute; width: 100%; height: 100%;
    backface-visibility: hidden; border-radius: 1rem;
    box-shadow: 0 10px 30px rgba(0,0,0,0.05); padding: 1.5rem;
  }
  .card-face button { cursor: pointer; }
  .card-back { transform: rotateY(180deg); background: linear-gradient(135deg, #4CA1AF, #315169); }

  @keyframes blob {
    0%   { transform: translate(0px,0px) scale(1); }
    33%  { transform: translate(30px,-50px) scale(1.1); }
    66%  { transform: translate(-20px,20px) scale(0.9); }
    100% { transform: translate(0px,0px) scale(1); }
  }
  .animate-blob { animation: blob 7s infinite; }
  .animation-delay-2000 { animation-delay: 2s; }
  .animation-delay-4000 { animation-delay: 4s; }
`;

// ----------------------------------------------------------------
// MODALS
// ----------------------------------------------------------------
const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-md">
      <div className="bg-white rounded-xl shadow-lg shadow-red-500/50 p-6 w-11/12 max-w-md">
        <h3 className="font-bold text-xl text-red-600 mb-3">{title}</h3>
        <p className="text-gray-700 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition cursor-pointer">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-6 py-2 text-sm font-medium rounded-full bg-red-600 text-white hover:bg-red-700 transition cursor-pointer">
            Delete User
          </button>
        </div>
      </div>
    </div>
  );
};

// const RoleEditModal = ({ isOpen, onClose, user, currentRole, onSave, isUpdating }) => {
//   const [selectedRole, setSelectedRole] = useState(currentRole);
  
//   const roleOptions = [
//     { value: "USERS", label: "User", bgClass: "bg-blue-400" },
//     { value: "TEACHERS", label: "Teacher", bgClass: "bg-teal-400" },
//     // { value: "SUPER_ADMIN", label: "Super Admin", color: "bg-purple-600", bgClass: "bg-purple-600" },
//   ];

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-md">
//       <div className="bg-white rounded-xl shadow-lg shadow-[#4CA1AF]/30 p-6 w-11/12 max-w-md">
//         <h3 className="font-bold text-xl mb-3" style={{ color: "#4CA1AF" }}>
//           Change User Role
//         </h3>
        
//         <p className="text-gray-600 mb-4">
//           Changing role for: <span className="font-semibold">{user?.username || user?.prn}</span>
//         </p>

//         <div className="space-y-3 mb-6">
//           {roleOptions.map((role) => (
//             <label
//               key={role.value}
//               className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
//                 selectedRole === role.value
//                   ? "border-[#4CA1AF] bg-[#4CA1AF]/5"
//                   : "border-gray-200 hover:border-gray-300"
//               }`}
//             >
//               <input
//                 type="radio"
//                 name="role"
//                 value={role.value}
//                 checked={selectedRole === role.value}
//                 onChange={(e) => setSelectedRole(e.target.value)}
//                 className="w-4 h-4 text-[#4CA1AF] focus:ring-[#4CA1AF]"
//               />
//               <span className="ml-3 flex-1">
//                 <span className={`inline-block px-3 py-1 rounded-full text-white text-sm font-medium ${role.bgClass}`}>
//                   {role.label}
//                 </span>
//               </span>
//             </label>
//           ))}
//         </div>

//         <div className="flex justify-end space-x-3">
//           <button
//             onClick={onClose}
//             className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition cursor-pointer"
//             disabled={isUpdating}
//           >
//             Cancel
//           </button>
//           <button
//             onClick={() => onSave(selectedRole)}
//             disabled={selectedRole === currentRole || isUpdating}
//             className="px-6 py-2 text-sm font-medium rounded-full text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
//             style={{
//               background: "linear-gradient(135deg, #4CA1AF, #315169)",
//               opacity: selectedRole === currentRole || isUpdating ? 0.5 : 1
//             }}
//           >
//             {isUpdating ? "Updating..." : "Update Role"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };
const RoleEditModal = ({ isOpen, onClose, user, currentRole, onSave, isUpdating }) => {
  const [selectedRole, setSelectedRole] = useState(currentRole);
  
  // Filter out SUPER_ADMIN from role options
  const roleOptions = [
    { value: "USERS", label: "User", bgClass: "bg-blue-400" },
    { value: "TEACHERS", label: "Teacher", bgClass: "bg-teal-400" },
  ];

  // Set the selected role when currentRole changes
  useEffect(() => {
    if (currentRole) {
      setSelectedRole(currentRole);
    }
  }, [currentRole]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-md">
      <div className="bg-white rounded-xl shadow-lg shadow-[#4CA1AF]/30 p-6 w-11/12 max-w-md">
        <h3 className="font-bold text-xl mb-3" style={{ color: "#4CA1AF" }}>
          Change User Role
        </h3>
        
        <p className="text-gray-600 mb-4">
          Changing role for: <span className="font-semibold">{user?.username || user?.prn}</span>
        </p>

        <div className="space-y-3 mb-6">
          {roleOptions.map((role) => (
            <label
              key={role.value}
              className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                selectedRole === role.value
                  ? "border-[#4CA1AF] bg-[#4CA1AF]/5"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="role"
                value={role.value}
                checked={selectedRole === role.value}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-4 h-4 text-[#4CA1AF] focus:ring-[#4CA1AF]"
              />
              <span className="ml-3 flex-1">
                <span className={`inline-block px-3 py-1 rounded-full text-white text-sm font-medium ${role.bgClass}`}>
                  {role.label}
                </span>
              </span>
            </label>
          ))}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition cursor-pointer"
            disabled={isUpdating}
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(selectedRole)}
            disabled={selectedRole === currentRole || isUpdating}
            className="px-6 py-2 text-sm font-medium rounded-full text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(135deg, #4CA1AF, #315169)",
              opacity: selectedRole === currentRole || isUpdating ? 0.5 : 1
            }}
          >
            {isUpdating ? "Updating..." : "Update Role"}
          </button>
        </div>
      </div>
    </div>
  );
};
const FilterModal = ({ isOpen, onClose, departments, selectedDept, selectedYear, selectedRole, prnSearch, onDeptChange, onYearChange, onRoleChange, onPrnSearch, onResetFilters }) => {
  if (!isOpen) return null;
  const roles = [
    { label: "Users", value: "USERS" },
    { label: "Teachers", value: "TEACHERS" },
    { label: "Super Admin", value: "SUPER_ADMIN" },
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-lg">
      <div className="bg-white rounded-xl shadow-lg p-6 w-11/12 max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-xl flex items-center" style={{ color: "#4CA1AF" }}>
            <Filter className="w-5 h-5 mr-2" /> Filter Users
          </h3>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search by PRN</label>
            <div className="relative">
              <input
                type="text"
                value={prnSearch}
                onChange={(e) => onPrnSearch(e.target.value)}
                placeholder="e.g. 2300140149"
                className="w-full px-4 py-2.5 pr-9 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ focusRingColor: "#4CA1AF" }}
              />
              {prnSearch && (
                <button onClick={() => onPrnSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">User Role</label>
            <CustomSelect name="role" value={selectedRole} onChange={(e) => onRoleChange(e.target.value)} placeholder="All Roles"
              options={[{ value: "", label: "All Roles" }, ...roles.map((r) => ({ value: r.value, label: r.label }))]} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
            <CustomSelect name="department" value={selectedDept} onChange={(e) => onDeptChange(e.target.value)} placeholder="All Departments"
              options={[{ value: "", label: "All Departments" }, ...departments.map((d) => ({ value: d, label: d }))]} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
            {/* Year options use string values to match React <select> state */}
            <CustomSelect name="year" value={selectedYear} onChange={(e) => onYearChange(e.target.value)} placeholder="All Years"
              options={[{ value: "", label: "All Years" }, ...[1, 2, 3, 4].map((y) => ({ value: String(y), label: `Year ${y}` }))]} />
          </div>

          {(selectedDept || selectedYear || selectedRole) && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs font-medium text-gray-600 mb-2">Active Filters:</p>
              <div className="flex flex-wrap gap-2">
                {prnSearch && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    PRN: {prnSearch}
                    <button onClick={() => onPrnSearch("")} className="ml-1 cursor-pointer"><X className="w-3 h-3" /></button>
                  </span>
                )}
                {selectedRole && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    Role: {selectedRole.replace("_", " ")}
                    <button onClick={() => onRoleChange("")} className="ml-1 cursor-pointer"><X className="w-3 h-3" /></button>
                  </span>
                )}
                {selectedDept && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: "rgba(76,161,175,0.1)", color: "#4CA1AF" }}>
                    Dept: {selectedDept}
                    <button onClick={() => onDeptChange("")} className="ml-1" style={{ color: "#4CA1AF" }}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {selectedYear && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Year: {selectedYear}
                    <button onClick={() => onYearChange("")} className="ml-1 cursor-pointer"><X className="w-3 h-3" /></button>
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-between pt-2">
            <button onClick={() => { onResetFilters(); onClose(); }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition cursor-pointer">
              Reset All
            </button>
            <button onClick={onClose} className="px-6 py-2 text-sm font-medium rounded-full text-white cursor-pointer"
              style={{ background: "linear-gradient(135deg, #4CA1AF, #315169)" }}>
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------
// API HELPERS
// ----------------------------------------------------------------

/** GET /api/users/ */
const fetchAllUsers = async (token) => {
  const res = await axios.get(`${BASE_URL}/api/users/`, { headers: authHeaders(token) });
  return res.data || [];
};

/**
 * POST /api/profiles/prns
 * ProfileResponse: { prn, fullName, department (string name), year (Integer), phoneNumber, hasProfileImage, imageUrl }
 * Returns { prn -> ProfileResponse }
 */
const fetchProfilesForPrns = async (prns, token) => {
  if (!prns.length) return {};
  const res = await axios.post(`${BASE_URL}/api/profiles/prns`, prns, { headers: authHeaders(token) });
  const profiles = res.data?.data || [];
  return profiles.reduce((acc, p) => ({ ...acc, [p.prn]: p }), {});
};

/**
 * Image fetching strategy:
 * 1. POST /api/profiles/image-urls  → { prn -> "/api/profiles/{prn}/image" | null }
 *    Tells us which PRNs actually have images without downloading them.
 * 2. Parallel blob GETs (with auth) only for PRNs that have images.
 *    <img src> cannot use auth headers directly, so we create objectURLs.
 * Returns { prn -> objectURL | null }
 */
const fetchImagesForPrns = async (prns, token) => {
  if (!prns.length) return {};

  const urlRes = await axios.post(`${BASE_URL}/api/profiles/image-urls`, prns, { headers: authHeaders(token) });
  const urlMap = urlRes.data?.data || {}; // { prn -> path | null }

  const prnsWithImages = prns.filter((prn) => urlMap[prn] != null);

  const blobResults = await Promise.all(
    prnsWithImages.map(async (prn) => {
      try {
        const res = await axios.get(`${BASE_URL}/api/profiles/${prn}/image`, {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        });
        return { prn, url: res.data?.size > 0 ? URL.createObjectURL(res.data) : null };
      } catch {
        return { prn, url: null };
      }
    })
  );

  // All PRNs present in result — null means no image
  const result = Object.fromEntries(prns.map((prn) => [prn, null]));
  blobResults.forEach(({ prn, url }) => { result[prn] = url; });
  return result;
};

/**
 * GET /api/department
 * DepartmentResponse: { departmentId, name, active }
 * NOTE: Java primitive boolean `isActive` serializes to `active` in JSON (Jackson strips "is").
 */
const fetchDepartmentNames = async (token) => {
  const res = await axios.get(`${BASE_URL}/api/department`, { headers: authHeaders(token) });
  return (res.data?.data || [])
    .filter((d) => d.active === true)
    .map((d) => d.name)
    .sort();
};

// Add this to your API HELPERS section
const changeUserRole = async (prn, newRole, token) => {
  const response = await axios.put(
    `${BASE_URL}/api/users/changeRole/${prn}/${newRole}`,
    {}, // empty body for PUT request
    { headers: authHeaders(token) }
  );
  return response.data;
};

// ----------------------------------------------------------------
// HELPERS
// ----------------------------------------------------------------
const getRoleBadgeClass = (role) => {
  switch (role) {
    case "SUPER_ADMIN": return "bg-purple-600 text-white font-bold shadow-md shadow-purple-500/30";
    case "TEACHERS":    return "bg-teal-400 text-white font-bold shadow-md shadow-teal-400/30";
    case "USERS":       return "bg-blue-400 text-white font-bold shadow-md shadow-blue-400/30";
    default:            return "bg-gray-300 text-gray-700";
  }
};

// ----------------------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------------------
const UserManagement = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // ── Core data ─────────────────────────────────────────────────
  const [allUsers, setAllUsers]           = useState([]);  // full user list
  const [userProfiles, setUserProfiles]   = useState({});  // { prn -> ProfileResponse } ALL loaded upfront
  const [profileImages, setProfileImages] = useState({});  // { prn -> objectURL|null } lazy per page
  const [departments, setDepartments]     = useState([]);  // active dept name strings

  // ── UI ────────────────────────────────────────────────────────
  const [loading, setLoading]                     = useState(true);
  const [pageLoading, setPageLoading]             = useState(false);
  const [error, setError]                         = useState(null);
  const [openOverlayFor, setOpenOverlayFor]       = useState(null);
  const [isModalOpen, setIsModalOpen]             = useState(false);
  const [userToDelete, setUserToDelete]           = useState(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  
  // Add these state variables for role editing
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [selectedNewRole, setSelectedNewRole] = useState("");
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  // ── Filters — all stored as strings for <select> compatibility ─
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedYear, setSelectedYear] = useState(""); // "" | "1" | "2" | "3" | "4"
  const [prnSearch, setPrnSearch]       = useState(""); // partial PRN match (case-insensitive)

  // ── Pagination ─────────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(0);

  // ── Derived filtered list ──────────────────────────────────────
  // ProfileResponse.department  = string name  (set by mapper from dept.getName())
  // ProfileResponse.year        = Integer      (must compare as Number vs string selectedYear)
  const filteredUsers = allUsers.filter((user) => {
    // PRN search: case-insensitive partial match
    if (prnSearch && !user.prn?.toLowerCase().includes(prnSearch.toLowerCase().trim())) return false;

    if (selectedRole && user.role !== selectedRole) return false;

    if (selectedDept || selectedYear) {
      const profile = userProfiles[user.prn];
      if (!profile) return false; // profiles still loading — exclude safely

      if (selectedDept && profile.department !== selectedDept) return false;
      if (selectedYear && profile.year !== Number(selectedYear)) return false;
    }

    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const safePage   = Math.min(currentPage, totalPages - 1);
  const pagedUsers = filteredUsers.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  // ── Initial load ───────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      setError(null);
      try {
        const [usersData, deptNames] = await Promise.all([
          fetchAllUsers(token),
          fetchDepartmentNames(token),
        ]);

        setAllUsers(usersData);
        setDepartments(deptNames);

        // Bulk-fetch ALL profiles in one call so department/year filters work
        // across every page without waiting for page-by-page enrichment.
        const allPrns = usersData.map((u) => u.prn).filter(Boolean);
        const profilesMap = await fetchProfilesForPrns(allPrns, token);
        setUserProfiles(profilesMap);

        // Load images for page 0 only
        const page0Prns = allPrns.slice(0, PAGE_SIZE);
        await loadImages(page0Prns);
      } catch (err) {
        console.error("Init error:", err);
        setError("Failed to load user data. Check API availability and authorization.");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // ── Lazy image loading per page ────────────────────────────────
  const fetchedImageKeysRef = useRef(new Set());

  useEffect(() => {
    if (loading || !pagedUsers.length) return;
    const prns = pagedUsers.map((u) => u.prn).filter(Boolean);
    const uncached = prns.filter((prn) => !(prn in profileImages));
    if (!uncached.length) return;

    const key = uncached.join("|");
    if (fetchedImageKeysRef.current.has(key)) return;
    fetchedImageKeysRef.current.add(key);

    loadImages(uncached);
  }, [pagedUsers.map((u) => u.prn).join("|"), loading]);

  const loadImages = async (prns) => {
    if (!prns.length) return;
    setPageLoading(true);
    try {
      const map = await fetchImagesForPrns(prns, token);
      setProfileImages((prev) => ({ ...prev, ...map }));
    } catch (err) {
      console.error("Image load error:", err);
    } finally {
      setPageLoading(false);
    }
  };

  // ── Filter handlers ────────────────────────────────────────────
  const handleRoleChange = (val) => { setSelectedRole(val); setCurrentPage(0); };
  const handleDeptChange = (val) => { setSelectedDept(val); setCurrentPage(0); };
  const handleYearChange = (val) => { setSelectedYear(val); setCurrentPage(0); };
  const handlePrnSearch  = (val) => { setPrnSearch(val); setCurrentPage(0); };
  const resetFilters     = ()    => { setSelectedRole(""); setSelectedDept(""); setSelectedYear(""); setPrnSearch(""); setCurrentPage(0); };

  // ── Delete ─────────────────────────────────────────────────────
  const confirmDelete = (user) => { setUserToDelete(user); setIsModalOpen(true); };

  const executeDelete = async () => {
    if (!userToDelete) return;
    try {
      await axios.delete(`${BASE_URL}/api/users/${userToDelete.prn}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const prn = userToDelete.prn;
      setAllUsers((prev) => prev.filter((u) => u.prn !== prn));
      setUserProfiles((prev) => { const n = { ...prev }; delete n[prn]; return n; });
      setProfileImages((prev) => { const n = { ...prev }; delete n[prn]; return n; });
      setIsModalOpen(false);
      setUserToDelete(null);
    } catch (err) {
      console.error("Delete error:", err);
      alert(err.response?.data?.message || "Error deleting user. Please try again.");
    }
  };

  // Add role update handler function
  const handleRoleUpdate = async (newRole) => {
    if (!userToEdit || !newRole) return;
    
    setIsUpdatingRole(true);
    try {
      await changeUserRole(userToEdit.prn, newRole, token);
      
      // Update the user in the local state
      setAllUsers(prev => prev.map(user => 
        user.prn === userToEdit.prn ? { ...user, role: newRole } : user
      ));
      
      // Show success message
      alert(`Role updated successfully for ${userToEdit.username || userToEdit.prn}`);
      
      // Close modal and reset
      setIsRoleModalOpen(false);
      setUserToEdit(null);
      setSelectedNewRole("");
    } catch (err) {
      console.error("Role update error:", err);
      alert(err.response?.data?.message || "Error updating role. Please try again.");
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const activeFilterCount = (selectedRole ? 1 : 0) + (selectedDept ? 1 : 0) + (selectedYear ? 1 : 0) + (prnSearch ? 1 : 0);

  // ── Loading / error screens ────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <style dangerouslySetInnerHTML={{ __html: customStyles }} />
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 mx-auto" style={{ borderColor: "#4CA1AF" }} />
          <p className="mt-6 font-medium" style={{ color: "#4CA1AF" }}>Loading user profiles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <style dangerouslySetInnerHTML={{ __html: customStyles }} />
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
          <p className="text-red-600 font-medium mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-gradient px-6 py-2">Retry</button>
        </div>
      </div>
    );
  }

  // ── Main render ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 font-sans">
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />

      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" style={{ backgroundColor: "#4CA1AF" }} />
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
      </div>

      {/* Sticky back bar */}
      <div className="sticky top-0 z-50 w-full bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#4CA1AF] transition-colors group">
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>
      </div>

      <div className="relative py-8">
        <ConfirmationModal
          isOpen={isModalOpen}
          title="Confirm User Deletion"
          message={`You are about to delete user: ${userToDelete?.username || userToDelete?.prn || "N/A"}. This action is irreversible. Proceed?`}
          onConfirm={executeDelete}
          onCancel={() => setIsModalOpen(false)}
        />

        <RoleEditModal
          isOpen={isRoleModalOpen}
          onClose={() => {
            setIsRoleModalOpen(false);
            setUserToEdit(null);
            setSelectedNewRole("");
          }}
          user={userToEdit}
          currentRole={userToEdit?.role}
          onSave={handleRoleUpdate}
          isUpdating={isUpdatingRole}
        />

        <FilterModal
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          departments={departments}
          selectedDept={selectedDept}
          selectedYear={selectedYear}
          selectedRole={selectedRole}
          onDeptChange={handleDeptChange}
          onYearChange={handleYearChange}
          onRoleChange={handleRoleChange}
          prnSearch={prnSearch}
          onPrnSearch={handlePrnSearch}
          onResetFilters={resetFilters}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-4xl font-extrabold tracking-tight bg-gradient-to-r from-[#4CA1AF] to-[#315169] bg-clip-text text-transparent mb-2">
              User Directory & Access Control
            </h1>
            <p className="text-gray-500 text-lg">Manage all staff, teachers, and club administrators.</p>
          </div>

          {/* Stats & filter bar */}
          <div className="mb-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl font-semibold font-display flex items-center" style={{ color: "#2d8391" }}>
                <Filter className="mr-3 w-5 h-5" style={{ color: "#26727e" }} />
                Active Users ({filteredUsers.length})
              </h2>

              <div className="flex flex-wrap items-center gap-3">
                {selectedRole && (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-orange-100 text-orange-800 border border-orange-200">
                    Role: {selectedRole.replace("_", " ")}
                    <button onClick={() => handleRoleChange("")} className="ml-2 cursor-pointer"><X className="w-3 h-3" /></button>
                  </span>
                )}
                {selectedDept && (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border"
                    style={{ backgroundColor: "rgba(76,161,175,0.1)", color: "#377882", borderColor: "rgba(76,161,175,0.2)" }}>
                    Dept: {selectedDept}
                    <button onClick={() => handleDeptChange("")} className="ml-2" style={{ color: "#4CA1AF" }}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {selectedYear && (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                    Year: {selectedYear}
                    <button onClick={() => handleYearChange("")} className="ml-2 cursor-pointer"><X className="w-3 h-3" /></button>
                  </span>
                )}
                {prnSearch && (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                    PRN: {prnSearch}
                    <button onClick={() => handlePrnSearch("")} className="ml-2 cursor-pointer"><X className="w-3 h-3" /></button>
                  </span>
                )}

                <button onClick={() => setIsFilterModalOpen(true)} className="btn-gradient flex items-center px-4 py-2.5 rounded-xl">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                  {activeFilterCount > 0 && (
                    <span className="ml-2 bg-white text-[#4CA1AF] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                {activeFilterCount > 0 && (
                  <button onClick={resetFilters} className="cursor-pointer px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition flex items-center">
                    <X className="w-4 h-4 mr-2" /> Clear All
                  </button>
                )}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Users",       value: allUsers.length,      color: "#4CA1AF" },
                { label: "Currently Showing", value: filteredUsers.length, color: "#4CA1AF" },
                { label: "Departments",        value: departments.length,   color: "#10B981" },
                { label: "Active Filters",     value: activeFilterCount,    color: "#F59E0B" },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-gray-50 p-3 rounded-xl">
                  <div className="text-xs text-gray-500">{label}</div>
                  <div className="text-2xl font-bold" style={{ color }}>{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Users grid */}
          <div className="bg-white bg-opacity-95 rounded-3xl shadow-2xl p-6 sm:p-10 border border-gray-100">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <Filter className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No users found</h3>
                <p className="text-gray-500 mb-6">Try adjusting your filters to see more users.</p>
                <button onClick={resetFilters} className="btn-gradient px-6 py-2.5">Clear All Filters</button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {pagedUsers.map((userItem) => {
                    const profile   = userProfiles[userItem.prn];
                    const imageUrl  = profileImages[userItem.prn];
                    const isFlipped = openOverlayFor === userItem.prn;

                    return (
                      <div
                        key={userItem.prn || userItem.id}
                        className={`user-card-container ${isFlipped ? "flipped" : ""}`}
                        onClick={() => setOpenOverlayFor(isFlipped ? null : userItem.prn)}
                      >
                        <div className="user-card">
                          {/* Card front */}
                          <div className="card-face bg-white border border-gray-200 flex flex-col items-center justify-center hover:shadow-xl hover:border-[#4CA1AF] transition-all duration-300">
                            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl mb-4">
                              {imageUrl ? (
                                <img src={imageUrl} alt={userItem.username} className="w-full h-full object-cover"
                                  onError={(e) => { e.target.onerror = null; e.target.style.display = "none"; }} />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #4CA1AF, #315169)" }}>
                                  <span className="text-3xl font-display font-bold text-white">
                                    {userItem.username?.charAt(0)?.toUpperCase() ?? "?"}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="text-center">
                              <div className="text-xl font-display font-semibold text-gray-900 truncate max-w-[20rem]">
                                {profile?.fullName || userItem.username}
                              </div>
                              <span className={`inline-block mt-2 px-3 py-1 text-xs rounded-full ${getRoleBadgeClass(userItem.role)}`}>
                                {userItem.role?.replace("_", " ") || "STANDARD USER"}
                              </span>
                            </div>
                          </div>

                          {/* Card back
                          <div className="card-face card-back text-white p-6 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center gap-3 mb-4">
                                <User className="w-6 h-6" />
                                <span className="font-display font-semibold text-2xl">{userItem.prn || "N/A"}</span>
                              </div>
                              <div className="text-sm space-y-3">
                                <div className="flex items-center gap-3">
                                  <Mail className="w-4 h-4 text-[#2DD4BF]" />
                                  <span className="truncate">{userItem.email}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <Phone className="w-4 h-4 text-[#FB923C]" />
                                  <span>{profile?.phoneNumber || "No contact info"}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <BookOpen className="w-4 h-4 text-white/90" />
                                  <span>{profile?.department || "—"}</span>
                                  <Calendar className="w-4 h-4 ml-4 text-white/90" />
                                  <span>Year: {profile?.year || "—"}</span>
                                </div>
                                <div className="flex items-center gap-3 pt-2">
                                  <Briefcase className="w-4 h-4 text-white/90" />
                                  <span className="px-3 py-1 text-xs rounded-full bg-white font-semibold" style={{ color: "#4CA1AF" }}>
                                    {userItem.role?.replace("_", " ") || "STANDARD USER"}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex justify-center mt-6 gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setUserToEdit(userItem);
                                  setSelectedNewRole(userItem.role);
                                  setIsRoleModalOpen(true);
                                }}
                                className="px-3 py-2 bg-[#4CA1AF] text-white rounded-full text-sm font-medium hover:bg-[#3d8a97] transition flex items-center shadow-md shadow-[#4CA1AF]/30 min-w-[100px] justify-center cursor-pointer"
                              >
                                <User className="w-4 h-4 mr-1" /> Edit Role
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); confirmDelete(userItem); }}
                                className="px-3 py-2 bg-red-500 text-white rounded-full text-sm font-medium hover:bg-red-600 transition flex items-center shadow-md shadow-red-500/30 min-w-[100px] justify-center cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4 mr-1" /> Remove
                              </button>
                            </div>
                          </div> */}
                          {/* Card back */}
<div className="card-face card-back text-white p-6 flex flex-col justify-between">
  <div>
    <div className="flex items-center gap-3 mb-4">
      <User className="w-6 h-6" />
      <span className="font-display font-semibold text-2xl">{userItem.prn || "N/A"}</span>
    </div>
    <div className="text-sm space-y-3">
      <div className="flex items-center gap-3">
        <Mail className="w-4 h-4 text-[#2DD4BF]" />
        <span className="truncate">{userItem.email}</span>
      </div>
      <div className="flex items-center gap-3">
        <Phone className="w-4 h-4 text-[#FB923C]" />
        <span>{profile?.phoneNumber || "No contact info"}</span>
      </div>
      <div className="flex items-center gap-3">
        <BookOpen className="w-4 h-4 text-white/90" />
        <span>{profile?.department || "—"}</span>
        <Calendar className="w-4 h-4 ml-4 text-white/90" />
        <span>Year: {profile?.year || "—"}</span>
      </div>
      <div className="flex items-center gap-3 pt-2">
        <Briefcase className="w-4 h-4 text-white/90" />
        <span className="px-3 py-1 text-xs rounded-full bg-white font-semibold" style={{ color: "#4CA1AF" }}>
          {userItem.role?.replace("_", " ") || "STANDARD USER"}
        </span>
      </div>
    </div>
  </div>
  <div className="flex justify-center mt-6 gap-2">
    {/* Only show Edit Role button if user is NOT SUPER_ADMIN */}
    {userItem.role !== "SUPER_ADMIN" && (
      <button
        onClick={(e) => {
          e.stopPropagation();
          setUserToEdit(userItem);
          setSelectedNewRole(userItem.role);
          setIsRoleModalOpen(true);
        }}
        className="px-3 py-2 bg-[#4CA1AF] text-white rounded-full text-sm font-medium hover:bg-[#3d8a97] transition flex items-center shadow-md shadow-[#4CA1AF]/30 min-w-[100px] justify-center cursor-pointer"
      >
        <User className="w-4 h-4 mr-1" /> Edit Role
      </button>
    )}
    <button
      onClick={(e) => { e.stopPropagation(); confirmDelete(userItem); }}
      className="px-3 py-2 bg-red-500 text-white rounded-full text-sm font-medium hover:bg-red-600 transition flex items-center shadow-md shadow-red-500/30 min-w-[100px] justify-center cursor-pointer"
    >
      <Trash2 className="w-4 h-4 mr-1" /> Remove
    </button>
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
                        onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                        disabled={safePage === 0}
                        className="p-2 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => i)
                        .filter((i) => i === 0 || i === totalPages - 1 || Math.abs(i - safePage) <= 1)
                        .reduce((acc, i, idx, arr) => {
                          if (idx > 0 && i - arr[idx - 1] > 1) acc.push(`ellipsis-${i}`);
                          acc.push(i);
                          return acc;
                        }, [])
                        .map((item) =>
                          typeof item === "string" ? (
                            <span key={item} className="px-2 text-gray-400">…</span>
                          ) : (
                            <button
                              key={item}
                              onClick={() => setCurrentPage(item)}
                              className={`w-9 h-9 rounded-full text-sm font-medium transition cursor-pointer border ${
                                safePage === item
                                  ? "text-white border-transparent"
                                  : "text-gray-600 border-gray-200 hover:bg-gray-50"
                              }`}
                              style={safePage === item ? { background: "linear-gradient(135deg, #4CA1AF, #315169)" } : {}}
                            >
                              {item + 1}
                            </button>
                          )
                        )}

                      <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                        disabled={safePage === totalPages - 1}
                        className="p-2 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>

                    <p className="text-xs text-gray-400">
                      Page {safePage + 1} of {totalPages} — {filteredUsers.length} users total
                      {pageLoading && <span className="ml-2 italic text-[#4CA1AF]">Loading images…</span>}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default UserManagement;