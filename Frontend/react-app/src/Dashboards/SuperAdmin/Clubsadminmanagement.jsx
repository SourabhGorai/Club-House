// import { useState, useEffect } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import {
//   User,
//   BookOpen,
//   Calendar,
//   Layers,
//   Filter,
//   X,
//   ShieldCheck,
// } from "lucide-react";

// // ----------------------------------------------------------------
// // Filter Modal
// // ----------------------------------------------------------------
// const FilterModal = ({
//   isOpen,
//   onClose,
//   clubs,
//   departments,
//   years,
//   selectedClub,
//   selectedDept,
//   selectedYear,
//   onClubChange,
//   onDeptChange,
//   onYearChange,
//   onResetFilters,
//   onApplyFilters,
// }) => {
//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-lg transition-all duration-300">
//       <div className="bg-white rounded-xl shadow-lg p-6 w-11/12 max-w-md transform transition-all duration-300">
//         <div className="flex justify-between items-center mb-6">
//           <h3
//             className="font-bold text-xl flex items-center"
//             style={{ color: "#4CA1AF" }}
//           >
//             <Filter className="w-5 h-5 mr-2" />
//             Filter Club Admins
//           </h3>
//           <button
//             onClick={onClose}
//             className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 cursor-pointer"
//           >
//             <X className="w-5 h-5" />
//           </button>
//         </div>

//         <div className="space-y-6">
//           {/* Club Filter */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Club
//             </label>
//             <select
//               value={selectedClub}
//               onChange={(e) => onClubChange(e.target.value)}
//               className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-300 bg-white/50 text-sm cursor-pointer"
//               style={{ focus: { ringColor: "#4CA1AF" } }}
//             >
//               <option value="">All Clubs</option>
//               {clubs.map((club) => (
//                 <option key={club.clubId} value={club.clubId}>
//                   {club.clubName}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Department Filter */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Department
//             </label>
//             <select
//               value={selectedDept}
//               onChange={(e) => onDeptChange(e.target.value)}
//               className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-300 bg-white/50 text-sm cursor-pointer"
//               style={{ focus: { ringColor: "#4CA1AF" } }}
//             >
//               <option value="">All Departments</option>
//               {departments.map((dept) => (
//                 <option key={dept.departmentId} value={dept.name}>
//                   {dept.name}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Year Filter */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Year
//             </label>
//             <select
//               value={selectedYear}
//               onChange={(e) => onYearChange(e.target.value)}
//               className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-300 bg-white/50 text-sm cursor-pointer"
//               style={{ focus: { ringColor: "#4CA1AF" } }}
//             >
//               <option value="">All Years</option>
//               {years.map((year) => (
//                 <option key={year} value={year}>
//                   Year {year}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Active Filters */}
//           {(selectedClub || selectedDept || selectedYear) && (
//             <div className="bg-gray-50 p-3 rounded-lg">
//               <p className="text-xs font-medium text-gray-600 mb-2">
//                 Active Filters:
//               </p>
//               <div className="flex flex-wrap gap-2">
//                 {selectedClub && (
//                   <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
//                     Club:{" "}
//                     {clubs.find((c) => c.clubId === parseInt(selectedClub))
//                       ?.clubName || selectedClub}
//                     <button
//                       onClick={() => onClubChange("")}
//                       className="ml-1 cursor-pointer"
//                     >
//                       <X className="w-3 h-3" />
//                     </button>
//                   </span>
//                 )}
//                 {selectedDept && (
//                   <span
//                     className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
//                     style={{
//                       backgroundColor: "rgba(76, 161, 175, 0.1)",
//                       color: "#4CA1AF",
//                     }}
//                   >
//                     Dept: {selectedDept}
//                     <button
//                       onClick={() => onDeptChange("")}
//                       className="ml-1 cursor-pointer"
//                       style={{ color: "#4CA1AF" }}
//                     >
//                       <X className="w-3 h-3" />
//                     </button>
//                   </span>
//                 )}
//                 {selectedYear && (
//                   <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
//                     Year: {selectedYear}
//                     <button
//                       onClick={() => onYearChange("")}
//                       className="ml-1 cursor-pointer"
//                     >
//                       <X className="w-3 h-3" />
//                     </button>
//                   </span>
//                 )}
//               </div>
//             </div>
//           )}

//           <div className="flex justify-between pt-4">
//             <button
//               onClick={onResetFilters}
//               className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition cursor-pointer"
//             >
//               Reset All
//             </button>
//             <div className="space-x-3">
//               <button
//                 onClick={onClose}
//                 className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition cursor-pointer"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={() => {
//                   onApplyFilters();
//                   onClose();
//                 }}
//                 className="px-6 py-2 text-sm font-medium rounded-full text-white transition cursor-pointer"
//                 style={{
//                   background: "linear-gradient(135deg, #4CA1AF, #315169)",
//                 }}
//               >
//                 Apply Filters
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ----------------------------------------------------------------
// // Styles
// // ----------------------------------------------------------------
// const customStyles = `
//     @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
//     @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@500;700;800&display=swap');
    
//     .font-sans { font-family: 'Poppins', sans-serif; }
//     .font-display { font-family: 'Outfit', sans-serif; }

//     .btn-gradient {
//         background-image: linear-gradient(135deg, #4CA1AF, #315169);
//         color: white;
//         font-weight: 500;
//         border-radius: 9999px;
//         padding: 0.5rem 1rem;
//         transition: all 0.3s ease-out;
//         box-shadow: 0 5px 15px rgba(76, 161, 175, 0.2);
//         cursor: pointer;
//     }
//     .btn-gradient:hover {
//         transform: translateY(-2px);
//         box-shadow: 0 8px 20px rgba(76, 161, 175, 0.3);
//     }

//     .user-card-container {
//         perspective: 1000px;
//         height: 20rem;
//         cursor: pointer;
//     }

//     .user-card {
//         transform-style: preserve-3d;
//         transition: transform 0.5s ease-in-out;
//         width: 100%;
//         height: 100%;
//         position: relative;
//     }

//     .user-card-container:hover .user-card,
//     .user-card-container.flipped .user-card {
//         transform: rotateY(180deg);
//     }

//     .card-face {
//         position: absolute;
//         width: 100%;
//         height: 100%;
//         backface-visibility: hidden;
//         border-radius: 1rem;
//         box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
//         padding: 1.5rem;
//     }

//     .card-face button { cursor: pointer; }

//     .card-back {
//         transform: rotateY(180deg);
//         background: linear-gradient(135deg, #4CA1AF, #315169);
//     }
    
//     @keyframes blob {
//       0% {
//         transform: translate(0px, 0px) scale(1);
//       }
//       33% {
//         transform: translate(30px, -50px) scale(1.1);
//       }
//       66% {
//         transform: translate(-20px, 20px) scale(0.9);
//       }
//       100% {
//         transform: translate(0px, 0px) scale(1);
//       }
//     }

//     .animate-blob {
//       animation: blob 7s infinite;
//     }

//     .animation-delay-2000 {
//       animation-delay: 2s;
//     }

//     .animation-delay-4000 {
//       animation-delay: 4s;
//     }
// `;

// // ----------------------------------------------------------------
// // Main Component
// // ----------------------------------------------------------------
// const ClubAdminsManagement = () => {
//   const navigate = useNavigate();

//   const [clubAdmins, setClubAdmins] = useState([]);
//   const [filteredAdmins, setFilteredAdmins] = useState([]);

//   // prn -> authenticated blob URL (same pattern as UserManagement)
//   const [profileImages, setProfileImages] = useState({});

//   const [openOverlayFor, setOpenOverlayFor] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
//   const [isLoadingFilteredAdmins, setIsLoadingFilteredAdmins] = useState(false);

//   const [selectedClub, setSelectedClub] = useState("");
//   const [selectedDept, setSelectedDept] = useState("");
//   const [selectedYear, setSelectedYear] = useState("");
//   const [clubs, setClubs] = useState([]);

//   // Full department objects { departmentId, name, active } from /api/department
//   const [departments, setDepartments] = useState([]);
//   const [years] = useState([1, 2, 3, 4]);

//   const token = localStorage.getItem("token");

//   // Back button handler
//   const handleGoBack = () => {
//     navigate(-1);
//   };

//   useEffect(() => {
//     fetchAllData();

//     return () => {
//       setProfileImages((prev) => {
//         Object.values(prev).forEach((url) => {
//           if (url) URL.revokeObjectURL(url);
//         });
//         return {};
//       });
//     };
//   }, []);

//   const fetchAllData = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const [adminsResponse, clubsResponse, deptsResponse] = await Promise.all([
//         axios.get(
//           `${BASE_URL}/api/user-clubs/getAllByRole/CLUB_ADMIN`,
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           },
//         ),
//         axios.get(`${BASE_URL}/api/clubs`, {
//           headers: { Authorization: `Bearer ${token}` },
//         }),
//         axios.get(`${BASE_URL}/api/department`, {
//           headers: { Authorization: `Bearer ${token}` },
//         }),
//       ]);

//       const adminEntries = adminsResponse.data.data || [];
//       setClubAdmins(adminEntries);
//       setFilteredAdmins(adminEntries);
//       setClubs(clubsResponse.data.data || []);

//       // Store full dept objects — field is "name", NOT "departmentName"
//       // Response shape: { departmentId, name, active }
//       setDepartments(deptsResponse.data.data || []);

//       await fetchProfileImages(adminEntries);
//     } catch (err) {
//       console.error("Error fetching data:", err);
//       setError("Failed to load club admin data.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   /**
//    * Fetches images via authenticated axios (responseType: blob) and stores
//    * object URLs. Required because the image endpoint needs the Authorization
//    * header — a plain <img src="..."> tag cannot send it.
//    */
//   const fetchProfileImages = async (adminsList) => {
//     const adminsWithImages = adminsList.filter(
//       (admin) => admin.hasProfileImage && admin.imageUrl,
//     );

//     const imagePromises = adminsWithImages.map(async (admin) => {
//       try {
//         const response = await axios.get(
//           `${BASE_URL}${admin.imageUrl}`,
//           {
//             headers: { Authorization: `Bearer ${token}` },
//             responseType: "blob",
//           },
//         );
//         if (response.data && response.data.size > 0) {
//           return {
//             prn: admin.prn,
//             blobUrl: URL.createObjectURL(response.data),
//           };
//         }
//         return { prn: admin.prn, blobUrl: null };
//       } catch {
//         return { prn: admin.prn, blobUrl: null };
//       }
//     });

//     const results = await Promise.all(imagePromises);
//     const imagesMap = results.reduce((acc, r) => {
//       if (r) acc[r.prn] = r.blobUrl;
//       return acc;
//     }, {});

//     setProfileImages(imagesMap);
//   };

//   // ----------------------------------------------------------------
//   // Filtering
//   // ----------------------------------------------------------------
//   const handleFilterChange = (
//     newClub = selectedClub,
//     newDept = selectedDept,
//     newYear = selectedYear,
//   ) => {
//     setSelectedClub(newClub);
//     setSelectedDept(newDept);
//     setSelectedYear(newYear);

//     if (!newClub && !newDept && !newYear) {
//       setFilteredAdmins(clubAdmins);
//       return;
//     }

//     setIsLoadingFilteredAdmins(true);
//     try {
//       let result = [...clubAdmins];

//       if (newClub) {
//         result = result.filter((a) => a.clubId === parseInt(newClub));
//       }

//       if (newDept) {
//         // newDept is already the dept name string (that's what the <option value> stores)
//         // admin.department comes directly from the getAllByRole response
//         result = result.filter((a) => a.department === newDept);
//       }

//       if (newYear) {
//         result = result.filter((a) => a.year?.toString() === newYear);
//       }

//       setFilteredAdmins(result);
//     } catch (err) {
//       console.error("Error filtering:", err);
//     } finally {
//       setIsLoadingFilteredAdmins(false);
//     }
//   };

//   const handleClubChange = (v) =>
//     handleFilterChange(v, selectedDept, selectedYear);
//   const handleDeptChange = (v) =>
//     handleFilterChange(selectedClub, v, selectedYear);
//   const handleYearChange = (v) =>
//     handleFilterChange(selectedClub, selectedDept, v);

//   const resetFilters = () => {
//     setSelectedClub("");
//     setSelectedDept("");
//     setSelectedYear("");
//     setFilteredAdmins(clubAdmins);
//   };

//   const getClubName = (clubId) =>
//     clubs.find((c) => c.clubId === clubId)?.clubName || "Unknown Club";

//   // ----------------------------------------------------------------
//   // Render
//   // ----------------------------------------------------------------
//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <style dangerouslySetInnerHTML={{ __html: customStyles }} />
//         <div className="text-center p-8 bg-white rounded-xl shadow-lg">
//           <div
//             className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 mx-auto cursor-wait"
//             style={{ borderColor: "#4CA1AF" }}
//           />
//           <p className="mt-6 font-medium" style={{ color: "#4CA1AF" }}>
//             Loading club admins...
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen font-sans bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
//       <style dangerouslySetInnerHTML={{ __html: customStyles }} />

//       {/* Animated Background Blobs */}
//       <div className="fixed inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob"></div>
//         <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-2000" style={{ backgroundColor: "#4CA1AF" }}></div>
//         <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-4000"></div>
//       </div>

//       {/* Sticky Back Button Bar - ClubDetails Style */}
//       <div className="sticky top-0 z-50 w-full bg-white border-b border-gray-100">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex items-center h-16">
//             <button
//               onClick={handleGoBack}
//               className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#4CA1AF] transition-colors group"
//             >
//               <svg
//                 className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform"
//                 style={{ color: "#4CA1AF" }}
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2.5}
//                   d="M10 19l-7-7m0 0l7-7m-7 7h18"
//                 />
//               </svg>
//               <span>Back to Dashboard</span>
//             </button>
//           </div>
//         </div>
//       </div>

//       <FilterModal
//         isOpen={isFilterModalOpen}
//         onClose={() => setIsFilterModalOpen(false)}
//         clubs={clubs}
//         departments={departments}
//         years={years}
//         selectedClub={selectedClub}
//         selectedDept={selectedDept}
//         selectedYear={selectedYear}
//         onClubChange={handleClubChange}
//         onDeptChange={handleDeptChange}
//         onYearChange={handleYearChange}
//         onResetFilters={resetFilters}
//         onApplyFilters={() => handleFilterChange()}
//       />

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative" style={{zIndex: 10}}>
//         {/* Header Section */}
//         <div className="mb-8">
//           <h1 className="font-display text-4xl font-extrabold tracking-tight bg-gradient-to-r from-[#4CA1AF] to-[#315169] bg-clip-text text-transparent">
//             Club Admins Management
//           </h1>
//           <p className="text-gray-500 mt-2 text-lg">
//             Manage all club administrators and their roles.
//           </p>
//         </div>

//         {/* Stats + Filter Bar */}
//         <div className="mb-8 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
//           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//             <h2
//               className="text-xl font-semibold font-display flex items-center"
//               style={{ color: "#26727e" }}
//             >
//               <Filter className="mr-3 w-5 h-5" style={{ color: "#26727e" }} />
//               Active Club Admins ({filteredAdmins.length})
//             </h2>

//             <div className="flex flex-wrap items-center gap-3">
//               {/* Active filter chips */}
//               {selectedClub && (
//                 <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-orange-100 text-orange-800 border border-orange-200">
//                   Club: {getClubName(parseInt(selectedClub))}
//                   <button
//                     onClick={() => handleClubChange("")}
//                     className="ml-2 cursor-pointer"
//                   >
//                     <X className="w-3 h-3" />
//                   </button>
//                 </span>
//               )}
//               {selectedDept && (
//                 <span
//                   className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border"
//                   style={{
//                     backgroundColor: "rgba(76, 161, 175, 0.1)",
//                     color: "#4CA1AF",
//                     borderColor: "rgba(76, 161, 175, 0.2)",
//                   }}
//                 >
//                   Dept: {selectedDept}
//                   <button
//                     onClick={() => handleDeptChange("")}
//                     className="ml-2 cursor-pointer"
//                     style={{ color: "#4CA1AF" }}
//                   >
//                     <X className="w-3 h-3" />
//                   </button>
//                 </span>
//               )}
//               {selectedYear && (
//                 <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
//                   Year: {selectedYear}
//                   <button
//                     onClick={() => handleYearChange("")}
//                     className="ml-2 cursor-pointer"
//                   >
//                     <X className="w-3 h-3" />
//                   </button>
//                 </span>
//               )}

//               <button
//                 onClick={() => setIsFilterModalOpen(true)}
//                 className="cursor-pointer btn-gradient flex items-center px-4 py-2.5 rounded-xl"
//               >
//                 <Filter className="w-4 h-4 mr-2" />
//                 Filter
//                 {(selectedClub || selectedDept || selectedYear) && (
//                   <span className="ml-2 bg-white text-[#4CA1AF] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
//                     {(selectedClub ? 1 : 0) +
//                       (selectedDept ? 1 : 0) +
//                       (selectedYear ? 1 : 0)}
//                   </span>
//                 )}
//               </button>

//               {(selectedClub || selectedDept || selectedYear) && (
//                 <button
//                   onClick={resetFilters}
//                   className="cursor-pointer px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition flex items-center"
//                 >
//                   <X className="w-4 h-4 mr-2" />
//                   Clear All
//                 </button>
//               )}
//             </div>
//           </div>

//           <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//             <div className="bg-gray-50 p-3 rounded-xl">
//               <div className="text-xs text-gray-500">Total Admins</div>
//               <div className="text-2xl font-bold" style={{ color: "#4CA1AF" }}>
//                 {clubAdmins.length}
//               </div>
//             </div>
//             <div className="bg-gray-50 p-3 rounded-xl">
//               <div className="text-xs text-gray-500">Currently Showing</div>
//               <div className="text-2xl font-bold" style={{ color: "#4CA1AF" }}>
//                 {filteredAdmins.length}
//               </div>
//             </div>
//             <div className="bg-gray-50 p-3 rounded-xl">
//               <div className="text-xs text-gray-500">Total Clubs</div>
//               <div className="text-2xl font-bold text-[#10B981]">
//                 {clubs.length}
//               </div>
//             </div>
//             <div className="bg-gray-50 p-3 rounded-xl">
//               <div className="text-xs text-gray-500">Active Filters</div>
//               <div className="text-2xl font-bold text-[#F59E0B]">
//                 {(selectedClub ? 1 : 0) +
//                   (selectedDept ? 1 : 0) +
//                   (selectedYear ? 1 : 0)}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Admins Grid */}
//         <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-6 sm:p-10 border border-white/20">
//           {isLoadingFilteredAdmins ? (
//             <div className="text-center py-12">
//               <div
//                 className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 mx-auto mb-6 cursor-wait"
//                 style={{ borderColor: "#4CA1AF" }}
//               />
//               <p className="text-gray-600">Applying filters...</p>
//             </div>
//           ) : filteredAdmins.length === 0 ? (
//             <div className="text-center py-12">
//               <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
//                 <Filter className="w-12 h-12 text-gray-400" />
//               </div>
//               <h3 className="text-xl font-semibold text-gray-700 mb-2">
//                 No club admins found
//               </h3>
//               <p className="text-gray-500 mb-6">
//                 Try adjusting your filters to see more admins.
//               </p>
//               <button
//                 onClick={resetFilters}
//                 className="btn-gradient px-6 py-2.5 cursor-pointer"
//               >
//                 Clear All Filters
//               </button>
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
//               {filteredAdmins.map((admin) => {
//                 const isFlipped = openOverlayFor === admin.userClubId;
//                 const blobImageUrl = profileImages[admin.prn];

//                 return (
//                   <div
//                     key={admin.userClubId}
//                     className={`user-card-container ${isFlipped ? "flipped" : ""}`}
//                     onClick={() =>
//                       setOpenOverlayFor(isFlipped ? null : admin.userClubId)
//                     }
//                   >
//                     <div className="user-card">
//                       {/* Front of Card */}
//                       <div className="card-face bg-white border border-gray-200 flex flex-col items-center justify-center transition-all duration-300 hover:shadow-xl hover:border-[#4CA1AF]">
//                         <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl mb-4">
//                           {blobImageUrl ? (
//                             <img
//                               src={blobImageUrl}
//                               alt={admin.name}
//                               className="w-full h-full object-cover"
//                             />
//                           ) : (
//                             <div
//                               className="w-full h-full flex items-center justify-center"
//                               style={{
//                                 background:
//                                   "linear-gradient(135deg, #4CA1AF, #315169)",
//                               }}
//                             >
//                               <span className="text-3xl font-display font-bold text-white">
//                                 {admin.name?.charAt(0)?.toUpperCase() ?? "?"}
//                               </span>
//                             </div>
//                           )}
//                         </div>

//                         <div className="text-center">
//                           <div className="text-xl font-display font-semibold text-gray-900 truncate max-w-[20rem]">
//                             {admin.name || "Unknown"}
//                           </div>
//                           <span
//                             className="inline-block mt-2 px-3 py-1 text-xs rounded-full text-white font-bold shadow-md"
//                             style={{
//                               background:
//                                 "linear-gradient(135deg, #4CA1AF, #315169)",
//                             }}
//                           >
//                             CLUB ADMIN
//                           </span>
//                         </div>
//                       </div>

//                       {/* Back of Card */}
//                       <div className="card-face card-back text-white p-6 flex flex-col justify-between">
//                         <div>
//                           <div className="flex items-center gap-3 mb-4">
//                             <User className="w-6 h-6" />
//                             <div className="font-display font-semibold text-2xl">
//                               {admin.prn || "N/A"}
//                             </div>
//                           </div>

//                           <div className="mt-4 text-sm space-y-3">
//                             <div className="flex items-center gap-3">
//                               <Layers className="w-4 h-4 text-[#2DD4BF]" />
//                               <span className="truncate">
//                                 {admin.clubName || getClubName(admin.clubId)}
//                               </span>
//                             </div>
//                             <div className="flex items-center gap-3">
//                               <BookOpen className="w-4 h-4 text-white/90" />
//                               <span>{admin.department || "N/A"}</span>
//                             </div>
//                             <div className="flex items-center gap-3">
//                               <Calendar className="w-4 h-4 text-white/90" />
//                               <span>Year: {admin.year || "—"}</span>
//                             </div>
//                             <div className="flex items-center gap-3">
//                               <Calendar className="w-4 h-4 text-[#FB923C]" />
//                               <span>Tenure: {admin.tenure || "N/A"}</span>
//                             </div>
//                             <div className="flex items-center gap-3 pt-2">
//                               <ShieldCheck className="w-4 h-4 text-white/90" />
//                               <span
//                                 className="px-3 py-1 text-xs rounded-full bg-white font-semibold"
//                                 style={{ color: "#315169" }}
//                               >
//                                 CLUB ADMIN
//                               </span>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ClubAdminsManagement;





import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  User,
  BookOpen,
  Calendar,
  Layers,
  Filter,
  X,
  ShieldCheck,
} from "lucide-react";
import CustomSelect from "../../components/CustomSelect"; // ← adjust path as needed

// ----------------------------------------------------------------
// Filter Modal
// ----------------------------------------------------------------
const FilterModal = ({
  isOpen,
  onClose,
  clubs,
  departments,
  years,
  selectedClub,
  selectedDept,
  selectedYear,
  onClubChange,
  onDeptChange,
  onYearChange,
  onResetFilters,
  onApplyFilters,
}) => {
  if (!isOpen) return null;

  // Build options arrays for CustomSelect
  const clubOptions = clubs.map((club) => ({
    value: String(club.clubId),
    label: club.clubName,
  }));

  const deptOptions = departments.map((dept) => ({
    value: dept.name,
    label: dept.name,
  }));

  const yearOptions = years.map((year) => ({
    value: String(year),
    label: `Year ${year}`,
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-lg transition-all duration-300">
      <div className="bg-white rounded-xl shadow-lg p-6 w-11/12 max-w-md transform transition-all duration-300">
        <div className="flex justify-between items-center mb-6">
          <h3
            className="font-bold text-xl flex items-center"
            style={{ color: "#4CA1AF" }}
          >
            <Filter className="w-5 h-5 mr-2" />
            Filter Club Admins
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Club Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Club
            </label>
            <CustomSelect
              name="club"
              value={selectedClub}
              onChange={(e) => onClubChange(e.target.value)}
              placeholder="All Clubs"
              options={clubOptions}
            />
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department
            </label>
            <CustomSelect
              name="department"
              value={selectedDept}
              onChange={(e) => onDeptChange(e.target.value)}
              placeholder="All Departments"
              options={deptOptions}
            />
          </div>

          {/* Year Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Year
            </label>
            <CustomSelect
              name="year"
              value={selectedYear}
              onChange={(e) => onYearChange(e.target.value)}
              placeholder="All Years"
              options={yearOptions}
            />
          </div>

          {/* Active Filters */}
          {(selectedClub || selectedDept || selectedYear) && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs font-medium text-gray-600 mb-2">
                Active Filters:
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedClub && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    Club:{" "}
                    {clubs.find((c) => String(c.clubId) === String(selectedClub))
                      ?.clubName || selectedClub}
                    <button
                      onClick={() => onClubChange("")}
                      className="ml-1 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedDept && (
                  <span
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: "rgba(76, 161, 175, 0.1)",
                      color: "#4CA1AF",
                    }}
                  >
                    Dept: {selectedDept}
                    <button
                      onClick={() => onDeptChange("")}
                      className="ml-1 cursor-pointer"
                      style={{ color: "#4CA1AF" }}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedYear && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Year: {selectedYear}
                    <button
                      onClick={() => onYearChange("")}
                      className="ml-1 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4">
            <button
              onClick={onResetFilters}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition cursor-pointer"
            >
              Reset All
            </button>
            <div className="space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onApplyFilters();
                  onClose();
                }}
                className="px-6 py-2 text-sm font-medium rounded-full text-white transition cursor-pointer"
                style={{
                  background: "linear-gradient(135deg, #4CA1AF, #315169)",
                }}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------
// Styles
// ----------------------------------------------------------------
const customStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@500;700;800&display=swap');
    
    .font-sans { font-family: 'Poppins', sans-serif; }
    .font-display { font-family: 'Outfit', sans-serif; }

    .btn-gradient {
        background-image: linear-gradient(135deg, #4CA1AF, #315169);
        color: white;
        font-weight: 500;
        border-radius: 9999px;
        padding: 0.5rem 1rem;
        transition: all 0.3s ease-out;
        box-shadow: 0 5px 15px rgba(76, 161, 175, 0.2);
        cursor: pointer;
    }
    .btn-gradient:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(76, 161, 175, 0.3);
    }

    .user-card-container {
        perspective: 1000px;
        height: 20rem;
        cursor: pointer;
    }

    .user-card {
        transform-style: preserve-3d;
        transition: transform 0.5s ease-in-out;
        width: 100%;
        height: 100%;
        position: relative;
    }

    .user-card-container:hover .user-card,
    .user-card-container.flipped .user-card {
        transform: rotateY(180deg);
    }

    .card-face {
        position: absolute;
        width: 100%;
        height: 100%;
        backface-visibility: hidden;
        border-radius: 1rem;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
        padding: 1.5rem;
    }

    .card-face button { cursor: pointer; }

    .card-back {
        transform: rotateY(180deg);
        background: linear-gradient(135deg, #4CA1AF, #315169);
    }
    
    @keyframes blob {
      0% {
        transform: translate(0px, 0px) scale(1);
      }
      33% {
        transform: translate(30px, -50px) scale(1.1);
      }
      66% {
        transform: translate(-20px, 20px) scale(0.9);
      }
      100% {
        transform: translate(0px, 0px) scale(1);
      }
    }

    .animate-blob {
      animation: blob 7s infinite;
    }

    .animation-delay-2000 {
      animation-delay: 2s;
    }

    .animation-delay-4000 {
      animation-delay: 4s;
    }
`;

// ----------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------
const BASE_URL = import.meta.env.VITE_API_URL || "http://72.155.88.211:8080";
const ClubAdminsManagement = () => {
  const navigate = useNavigate();

  const [clubAdmins, setClubAdmins] = useState([]);
  const [filteredAdmins, setFilteredAdmins] = useState([]);

  const [profileImages, setProfileImages] = useState({});

  const [openOverlayFor, setOpenOverlayFor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isLoadingFilteredAdmins, setIsLoadingFilteredAdmins] = useState(false);

  const [selectedClub, setSelectedClub] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [clubs, setClubs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [years] = useState([1, 2, 3, 4]);

  const token = localStorage.getItem("token");

  const handleGoBack = () => navigate(-1);

  useEffect(() => {
    fetchAllData();
    return () => {
      setProfileImages((prev) => {
        Object.values(prev).forEach((url) => {
          if (url) URL.revokeObjectURL(url);
        });
        return {};
      });
    };
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [adminsResponse, clubsResponse, deptsResponse] = await Promise.all([
        axios.get(`${BASE_URL}/api/user-clubs/getAllByRole/CLUB_ADMIN`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${BASE_URL}/api/clubs`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${BASE_URL}/api/department`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const adminEntries = adminsResponse.data.data || [];
      setClubAdmins(adminEntries);
      setFilteredAdmins(adminEntries);
      setClubs(clubsResponse.data.data || []);
      setDepartments(deptsResponse.data.data || []);

      await fetchProfileImages(adminEntries);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load club admin data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchProfileImages = async (adminsList) => {
    const adminsWithImages = adminsList.filter(
      (admin) => admin.hasProfileImage && admin.imageUrl,
    );

    const results = await Promise.all(
      adminsWithImages.map(async (admin) => {
        try {
          const response = await axios.get(
            `${BASE_URL}${admin.imageUrl}`,
            {
              headers: { Authorization: `Bearer ${token}` },
              responseType: "blob",
            },
          );
          if (response.data && response.data.size > 0) {
            return { prn: admin.prn, blobUrl: URL.createObjectURL(response.data) };
          }
          return { prn: admin.prn, blobUrl: null };
        } catch {
          return { prn: admin.prn, blobUrl: null };
        }
      }),
    );

    const imagesMap = results.reduce((acc, r) => {
      if (r) acc[r.prn] = r.blobUrl;
      return acc;
    }, {});

    setProfileImages(imagesMap);
  };

  // ----------------------------------------------------------------
  // Filtering
  // ----------------------------------------------------------------
  const handleFilterChange = (
    newClub = selectedClub,
    newDept = selectedDept,
    newYear = selectedYear,
  ) => {
    setSelectedClub(newClub);
    setSelectedDept(newDept);
    setSelectedYear(newYear);

    if (!newClub && !newDept && !newYear) {
      setFilteredAdmins(clubAdmins);
      return;
    }

    setIsLoadingFilteredAdmins(true);
    try {
      let result = [...clubAdmins];
      if (newClub) result = result.filter((a) => String(a.clubId) === String(newClub));
      if (newDept) result = result.filter((a) => a.department === newDept);
      if (newYear) result = result.filter((a) => a.year?.toString() === newYear);
      setFilteredAdmins(result);
    } catch (err) {
      console.error("Error filtering:", err);
    } finally {
      setIsLoadingFilteredAdmins(false);
    }
  };

  const handleClubChange = (v) => handleFilterChange(v, selectedDept, selectedYear);
  const handleDeptChange = (v) => handleFilterChange(selectedClub, v, selectedYear);
  const handleYearChange = (v) => handleFilterChange(selectedClub, selectedDept, v);

  const resetFilters = () => {
    setSelectedClub("");
    setSelectedDept("");
    setSelectedYear("");
    setFilteredAdmins(clubAdmins);
  };

  const getClubName = (clubId) =>
    clubs.find((c) => String(c.clubId) === String(clubId))?.clubName || "Unknown Club";

  // ----------------------------------------------------------------
  // Render
  // ----------------------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <style dangerouslySetInnerHTML={{ __html: customStyles }} />
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <div
            className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 mx-auto cursor-wait"
            style={{ borderColor: "#4CA1AF" }}
          />
          <p className="mt-6 font-medium" style={{ color: "#4CA1AF" }}>
            Loading club admins...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />

      {/* Animated Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-2000"
          style={{ backgroundColor: "#4CA1AF" }}
        ></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-4000"></div>
      </div>

      {/* Sticky Back Button Bar */}
      <div className="sticky top-0 z-50 w-full bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={handleGoBack}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#4CA1AF] transition-colors group"
            >
              <svg
                className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform"
                style={{ color: "#4CA1AF" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>
      </div>

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        clubs={clubs}
        departments={departments}
        years={years}
        selectedClub={selectedClub}
        selectedDept={selectedDept}
        selectedYear={selectedYear}
        onClubChange={handleClubChange}
        onDeptChange={handleDeptChange}
        onYearChange={handleYearChange}
        onResetFilters={resetFilters}
        onApplyFilters={() => handleFilterChange()}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative" style={{ zIndex: 10 }}>
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-4xl font-extrabold tracking-tight bg-gradient-to-r from-[#4CA1AF] to-[#315169] bg-clip-text text-transparent">
            Club Admins Management
          </h1>
          <p className="text-gray-500 mt-2 text-lg">
            Manage all club administrators and their roles.
          </p>
        </div>

        {/* Stats + Filter Bar */}
        <div className="mb-8 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2
              className="text-xl font-semibold font-display flex items-center"
              style={{ color: "#26727e" }}
            >
              <Filter className="mr-3 w-5 h-5" style={{ color: "#26727e" }} />
              Active Club Admins ({filteredAdmins.length})
            </h2>

            <div className="flex flex-wrap items-center gap-3">
              {selectedClub && (
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-orange-100 text-orange-800 border border-orange-200">
                  Club: {getClubName(selectedClub)}
                  <button onClick={() => handleClubChange("")} className="ml-2 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedDept && (
                <span
                  className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border"
                  style={{ backgroundColor: "rgba(76, 161, 175, 0.1)", color: "#4CA1AF", borderColor: "rgba(76, 161, 175, 0.2)" }}
                >
                  Dept: {selectedDept}
                  <button onClick={() => handleDeptChange("")} className="ml-2 cursor-pointer" style={{ color: "#4CA1AF" }}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedYear && (
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                  Year: {selectedYear}
                  <button onClick={() => handleYearChange("")} className="ml-2 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              <button
                onClick={() => setIsFilterModalOpen(true)}
                className="cursor-pointer btn-gradient flex items-center px-4 py-2.5 rounded-xl"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filter
                {(selectedClub || selectedDept || selectedYear) && (
                  <span className="ml-2 bg-white text-[#4CA1AF] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {(selectedClub ? 1 : 0) + (selectedDept ? 1 : 0) + (selectedYear ? 1 : 0)}
                  </span>
                )}
              </button>

              {(selectedClub || selectedDept || selectedYear) && (
                <button
                  onClick={resetFilters}
                  className="cursor-pointer px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition flex items-center"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear All
                </button>
              )}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-3 rounded-xl">
              <div className="text-xs text-gray-500">Total Admins</div>
              <div className="text-2xl font-bold" style={{ color: "#4CA1AF" }}>{clubAdmins.length}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl">
              <div className="text-xs text-gray-500">Currently Showing</div>
              <div className="text-2xl font-bold" style={{ color: "#4CA1AF" }}>{filteredAdmins.length}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl">
              <div className="text-xs text-gray-500">Total Clubs</div>
              <div className="text-2xl font-bold text-[#10B981]">{clubs.length}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl">
              <div className="text-xs text-gray-500">Active Filters</div>
              <div className="text-2xl font-bold text-[#F59E0B]">
                {(selectedClub ? 1 : 0) + (selectedDept ? 1 : 0) + (selectedYear ? 1 : 0)}
              </div>
            </div>
          </div>
        </div>

        {/* Admins Grid */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-6 sm:p-10 border border-white/20">
          {isLoadingFilteredAdmins ? (
            <div className="text-center py-12">
              <div
                className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 mx-auto mb-6 cursor-wait"
                style={{ borderColor: "#4CA1AF" }}
              />
              <p className="text-gray-600">Applying filters...</p>
            </div>
          ) : filteredAdmins.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <Filter className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No club admins found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your filters to see more admins.</p>
              <button onClick={resetFilters} className="btn-gradient px-6 py-2.5 cursor-pointer">
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredAdmins.map((admin) => {
                const isFlipped = openOverlayFor === admin.userClubId;
                const blobImageUrl = profileImages[admin.prn];

                return (
                  <div
                    key={admin.userClubId}
                    className={`user-card-container ${isFlipped ? "flipped" : ""}`}
                    onClick={() => setOpenOverlayFor(isFlipped ? null : admin.userClubId)}
                  >
                    <div className="user-card">
                      {/* Front */}
                      <div className="card-face bg-white border border-gray-200 flex flex-col items-center justify-center transition-all duration-300 hover:shadow-xl hover:border-[#4CA1AF]">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl mb-4">
                          {blobImageUrl ? (
                            <img src={blobImageUrl} alt={admin.name} className="w-full h-full object-cover" />
                          ) : (
                            <div
                              className="w-full h-full flex items-center justify-center"
                              style={{ background: "linear-gradient(135deg, #4CA1AF, #315169)" }}
                            >
                              <span className="text-3xl font-display font-bold text-white">
                                {admin.name?.charAt(0)?.toUpperCase() ?? "?"}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-display font-semibold text-gray-900 truncate max-w-[20rem]">
                            {admin.name || "Unknown"}
                          </div>
                          <span
                            className="inline-block mt-2 px-3 py-1 text-xs rounded-full text-white font-bold shadow-md"
                            style={{ background: "linear-gradient(135deg, #4CA1AF, #315169)" }}
                          >
                            CLUB ADMIN
                          </span>
                        </div>
                      </div>

                      {/* Back */}
                      <div className="card-face card-back text-white p-6 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-3 mb-4">
                            <User className="w-6 h-6" />
                            <div className="font-display font-semibold text-2xl">{admin.prn || "N/A"}</div>
                          </div>
                          <div className="mt-4 text-sm space-y-3">
                            <div className="flex items-center gap-3">
                              <Layers className="w-4 h-4 text-[#2DD4BF]" />
                              <span className="truncate">{admin.clubName || getClubName(admin.clubId)}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <BookOpen className="w-4 h-4 text-white/90" />
                              <span>{admin.department || "N/A"}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Calendar className="w-4 h-4 text-white/90" />
                              <span>Year: {admin.year || "—"}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Calendar className="w-4 h-4 text-[#FB923C]" />
                              <span>Tenure: {admin.tenure || "N/A"}</span>
                            </div>
                            <div className="flex items-center gap-3 pt-2">
                              <ShieldCheck className="w-4 h-4 text-white/90" />
                              <span
                                className="px-3 py-1 text-xs rounded-full bg-white font-semibold"
                                style={{ color: "#315169" }}
                              >
                                CLUB ADMIN
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClubAdminsManagement;