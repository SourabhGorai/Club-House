





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
// import CustomSelect from "../../components/CustomSelect"; // ← adjust path as needed

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

//   // Build options arrays for CustomSelect
//   const clubOptions = clubs.map((club) => ({
//     value: String(club.clubId),
//     label: club.clubName,
//   }));

//   const deptOptions = departments.map((dept) => ({
//     value: dept.name,
//     label: dept.name,
//   }));

//   const yearOptions = years.map((year) => ({
//     value: String(year),
//     label: `Year ${year}`,
//   }));

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
//             <CustomSelect
//               name="club"
//               value={selectedClub}
//               onChange={(e) => onClubChange(e.target.value)}
//               placeholder="All Clubs"
//               options={clubOptions}
//             />
//           </div>

//           {/* Department Filter */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Department
//             </label>
//             <CustomSelect
//               name="department"
//               value={selectedDept}
//               onChange={(e) => onDeptChange(e.target.value)}
//               placeholder="All Departments"
//               options={deptOptions}
//             />
//           </div>

//           {/* Year Filter */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Year
//             </label>
//             <CustomSelect
//               name="year"
//               value={selectedYear}
//               onChange={(e) => onYearChange(e.target.value)}
//               placeholder="All Years"
//               options={yearOptions}
//             />
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
//                     {clubs.find((c) => String(c.clubId) === String(selectedClub))
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
// const BASE_URL = import.meta.env.VITE_API_URL || "http://72.155.88.211:8080";
// const ClubAdminsManagement = () => {
//   const navigate = useNavigate();

//   const [clubAdmins, setClubAdmins] = useState([]);
//   const [filteredAdmins, setFilteredAdmins] = useState([]);

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
//   const [departments, setDepartments] = useState([]);
//   const [years] = useState([1, 2, 3, 4]);

//   const token = localStorage.getItem("token");

//   const handleGoBack = () => navigate("/dashboard");

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
//         axios.get(`${BASE_URL}/api/user-clubs/getAllByRole/CLUB_ADMIN`, {
//           headers: { Authorization: `Bearer ${token}` },
//         }),
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
//       setDepartments(deptsResponse.data.data || []);

//       await fetchProfileImages(adminEntries);
//     } catch (err) {
//       console.error("Error fetching data:", err);
//       setError("Failed to load club admin data.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchProfileImages = async (adminsList) => {
//     const adminsWithImages = adminsList.filter(
//       (admin) => admin.hasProfileImage && admin.imageUrl,
//     );

//     const results = await Promise.all(
//       adminsWithImages.map(async (admin) => {
//         try {
//           const response = await axios.get(
//             `${BASE_URL}${admin.imageUrl}`,
//             {
//               headers: { Authorization: `Bearer ${token}` },
//               responseType: "blob",
//             },
//           );
//           if (response.data && response.data.size > 0) {
//             return { prn: admin.prn, blobUrl: URL.createObjectURL(response.data) };
//           }
//           return { prn: admin.prn, blobUrl: null };
//         } catch {
//           return { prn: admin.prn, blobUrl: null };
//         }
//       }),
//     );

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
//       if (newClub) result = result.filter((a) => String(a.clubId) === String(newClub));
//       if (newDept) result = result.filter((a) => a.department === newDept);
//       if (newYear) result = result.filter((a) => a.year?.toString() === newYear);
//       setFilteredAdmins(result);
//     } catch (err) {
//       console.error("Error filtering:", err);
//     } finally {
//       setIsLoadingFilteredAdmins(false);
//     }
//   };

//   const handleClubChange = (v) => handleFilterChange(v, selectedDept, selectedYear);
//   const handleDeptChange = (v) => handleFilterChange(selectedClub, v, selectedYear);
//   const handleYearChange = (v) => handleFilterChange(selectedClub, selectedDept, v);

//   const resetFilters = () => {
//     setSelectedClub("");
//     setSelectedDept("");
//     setSelectedYear("");
//     setFilteredAdmins(clubAdmins);
//   };

//   const getClubName = (clubId) =>
//     clubs.find((c) => String(c.clubId) === String(clubId))?.clubName || "Unknown Club";

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
//     <div className="min-h-screen font-sans bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative">
//       <style dangerouslySetInnerHTML={{ __html: customStyles }} />

//       {/* Animated Background Blobs */}
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

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative" style={{ zIndex: 10 }}>
//         {/* Header */}
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
//               {selectedClub && (
//                 <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-orange-100 text-orange-800 border border-orange-200">
//                   Club: {getClubName(selectedClub)}
//                   <button onClick={() => handleClubChange("")} className="ml-2 cursor-pointer">
//                     <X className="w-3 h-3" />
//                   </button>
//                 </span>
//               )}
//               {selectedDept && (
//                 <span
//                   className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border"
//                   style={{ backgroundColor: "rgba(76, 161, 175, 0.1)", color: "#4CA1AF", borderColor: "rgba(76, 161, 175, 0.2)" }}
//                 >
//                   Dept: {selectedDept}
//                   <button onClick={() => handleDeptChange("")} className="ml-2 cursor-pointer" style={{ color: "#4CA1AF" }}>
//                     <X className="w-3 h-3" />
//                   </button>
//                 </span>
//               )}
//               {selectedYear && (
//                 <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
//                   Year: {selectedYear}
//                   <button onClick={() => handleYearChange("")} className="ml-2 cursor-pointer">
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
//                     {(selectedClub ? 1 : 0) + (selectedDept ? 1 : 0) + (selectedYear ? 1 : 0)}
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
//               <div className="text-2xl font-bold" style={{ color: "#4CA1AF" }}>{clubAdmins.length}</div>
//             </div>
//             <div className="bg-gray-50 p-3 rounded-xl">
//               <div className="text-xs text-gray-500">Currently Showing</div>
//               <div className="text-2xl font-bold" style={{ color: "#4CA1AF" }}>{filteredAdmins.length}</div>
//             </div>
//             <div className="bg-gray-50 p-3 rounded-xl">
//               <div className="text-xs text-gray-500">Total Clubs</div>
//               <div className="text-2xl font-bold text-[#10B981]">{clubs.length}</div>
//             </div>
//             <div className="bg-gray-50 p-3 rounded-xl">
//               <div className="text-xs text-gray-500">Active Filters</div>
//               <div className="text-2xl font-bold text-[#F59E0B]">
//                 {(selectedClub ? 1 : 0) + (selectedDept ? 1 : 0) + (selectedYear ? 1 : 0)}
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
//               <h3 className="text-xl font-semibold text-gray-700 mb-2">No club admins found</h3>
//               <p className="text-gray-500 mb-6">Try adjusting your filters to see more admins.</p>
//               <button onClick={resetFilters} className="btn-gradient px-6 py-2.5 cursor-pointer">
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
//                     onClick={() => setOpenOverlayFor(isFlipped ? null : admin.userClubId)}
//                   >
//                     <div className="user-card">
//                       {/* Front */}
//                       <div className="card-face bg-white border border-gray-200 flex flex-col items-center justify-center transition-all duration-300 hover:shadow-xl hover:border-[#4CA1AF]">
//                         <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl mb-4">
//                           {blobImageUrl ? (
//                             <img src={blobImageUrl} alt={admin.name} className="w-full h-full object-cover" />
//                           ) : (
//                             <div
//                               className="w-full h-full flex items-center justify-center"
//                               style={{ background: "linear-gradient(135deg, #4CA1AF, #315169)" }}
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
//                             style={{ background: "linear-gradient(135deg, #4CA1AF, #315169)" }}
//                           >
//                             CLUB ADMIN
//                           </span>
//                         </div>
//                       </div>

//                       {/* Back */}
//                       <div className="card-face card-back text-white p-6 flex flex-col justify-between">
//                         <div>
//                           <div className="flex items-center gap-3 mb-4">
//                             <User className="w-6 h-6" />
//                             <div className="font-display font-semibold text-2xl">{admin.prn || "N/A"}</div>
//                           </div>
//                           <div className="mt-4 text-sm space-y-3">
//                             <div className="flex items-center gap-3">
//                               <Layers className="w-4 h-4 text-[#2DD4BF]" />
//                               <span className="truncate">{admin.clubName || getClubName(admin.clubId)}</span>
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
import { useTheme } from "../../contexts/ThemeContext";
import {
  User,
  BookOpen,
  Calendar,
  Layers,
  Filter,
  X,
  ShieldCheck,
  Moon,
  Sun,
} from "lucide-react";
import CustomSelect from "../../components/CustomSelect"; // ← adjust path as needed
import ThemedScrollbarStyles from "../../components/ThemedScrollbarStyles";

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
  theme,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-lg transition-all duration-300">
      <div 
        className="rounded-xl shadow-lg p-6 w-11/12 max-w-md transform transition-all duration-300"
        style={{ background: theme.bgCard, border: `1px solid ${theme.borderColor}` }}
      >
        <div className="flex justify-between items-center mb-6">
          <h3
            className="font-bold text-xl flex items-center"
            style={{ color: theme.primaryColor }}
          >
            <Filter className="w-5 h-5 mr-2" />
            Filter Club Admins
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full transition-colors cursor-pointer"
            style={{ color: theme.textMuted, background: theme.accentSoft }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Club Filter */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: theme.textSecondary }}>
              Club
            </label>
            <CustomSelect
              name="club"
              value={selectedClub}
              onChange={(e) => onClubChange(e.target.value)}
              placeholder="All Clubs"
              options={clubOptions}
              theme={theme}
            />
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: theme.textSecondary }}>
              Department
            </label>
            <CustomSelect
              name="department"
              value={selectedDept}
              onChange={(e) => onDeptChange(e.target.value)}
              placeholder="All Departments"
              options={deptOptions}
              theme={theme}
            />
          </div>

          {/* Year Filter */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: theme.textSecondary }}>
              Year
            </label>
            <CustomSelect
              name="year"
              value={selectedYear}
              onChange={(e) => onYearChange(e.target.value)}
              placeholder="All Years"
              options={yearOptions}
              theme={theme}
            />
          </div>

          {/* Active Filters */}
          {(selectedClub || selectedDept || selectedYear) && (
            <div className="p-3 rounded-lg" style={{ background: theme.accentSoft }}>
              <p className="text-xs font-medium mb-2" style={{ color: theme.textSecondary }}>
                Active Filters:
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedClub && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                    style={{ background: "rgba(249, 115, 22, 0.1)", color: "#F97316" }}>
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
                      background: theme.primaryLight,
                      color: theme.primaryColor,
                    }}
                  >
                    Dept: {selectedDept}
                    <button
                      onClick={() => onDeptChange("")}
                      className="ml-1 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedYear && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                    style={{ background: "rgba(59, 130, 246, 0.1)", color: "#3B82F6" }}>
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
              className="px-4 py-2 text-sm font-medium rounded-full transition cursor-pointer"
              style={{ 
                background: theme.accentSoft,
                color: theme.textSecondary,
                border: `1px solid ${theme.borderColor}`
              }}
            >
              Reset All
            </button>
            <div className="space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium rounded-full transition cursor-pointer"
                style={{ 
                  background: theme.accentSoft,
                  color: theme.textSecondary,
                  border: `1px solid ${theme.borderColor}`
                }}
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
                  background: theme.primaryGradient,
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

  // ── Theme state ───────────────────────────────────────────────────────────
  const { isDarkMode } = useTheme();

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
    localStorage.setItem("clubAdminsTheme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

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

  const handleGoBack = () => navigate("/dashboard");

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
      <>
        <ThemedScrollbarStyles
          isDarkMode={isDarkMode}
          className="theme-scrollbar"
          includePageScrollbar
        />
        <div 
          className="min-h-screen flex items-center justify-center transition-colors duration-300"
          style={{ background: theme.bgGradient }}
        >
          <style dangerouslySetInnerHTML={{ __html: customStyles }} />
          <div className="text-center p-8 rounded-xl shadow-lg" style={{ background: theme.bgCard, border: `1px solid ${theme.borderColor}` }}>
            <div
              className="animate-spin rounded-full h-16 w-16 border-b-2 mx-auto mb-4 cursor-wait"
              style={{ borderColor: theme.primaryColor }}
            />
            <p className="mt-6 font-medium" style={{ color: theme.textSecondary }}>
              Loading club admins...
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ThemedScrollbarStyles
        isDarkMode={isDarkMode}
        className="theme-scrollbar"
        includePageScrollbar
      />
      <div 
        className="min-h-screen font-sans relative transition-colors duration-300"
        style={{ background: theme.bgGradient }}
      >
        <style dangerouslySetInnerHTML={{ __html: customStyles }} />

      {/* Animated Background Blobs - only show in light mode */}
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
        theme={theme}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative" style={{ zIndex: 10 }}>
        {/* Header - FIXED: Made text visible in both modes */}
        <div className="mb-8">
          <h1 className="font-display text-4xl font-extrabold tracking-tight">
            <span style={{ 
              color: theme.textPrimary,
              background: isDarkMode ? 'none' : theme.primaryGradient,
              WebkitBackgroundClip: isDarkMode ? 'unset' : 'text',
              WebkitTextFillColor: isDarkMode ? 'unset' : 'transparent'
            }}>
              Club Admins Management
            </span>
          </h1>
          <p className="mt-2 text-lg" style={{ color: theme.textSecondary }}>
            Manage all club administrators and their roles.
          </p>
        </div>

        {/* Stats + Filter Bar */}
        <div 
          className="mb-8 rounded-2xl shadow-lg p-6 border transition-colors duration-300"
          style={{ 
            background: theme.bgCard, 
            borderColor: theme.borderColor,
            boxShadow: isDarkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2
              className="text-xl font-semibold font-display flex items-center"
              style={{ color: theme.primaryColor }}
            >
              <Filter className="mr-3 w-5 h-5" style={{ color: theme.primaryColor }} />
              Active Club Admins ({filteredAdmins.length})
            </h2>

            <div className="flex flex-wrap items-center gap-3">
              {selectedClub && (
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium"
                  style={{ background: "rgba(249, 115, 22, 0.1)", color: "#F97316", border: `1px solid rgba(249, 115, 22, 0.2)` }}>
                  Club: {getClubName(selectedClub)}
                  <button onClick={() => handleClubChange("")} className="ml-2 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedDept && (
                <span
                  className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border"
                  style={{ background: theme.primaryLight, color: theme.primaryColor, borderColor: theme.borderColor }}
                >
                  Dept: {selectedDept}
                  <button onClick={() => handleDeptChange("")} className="ml-2 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedYear && (
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium"
                  style={{ background: "rgba(59, 130, 246, 0.1)", color: "#3B82F6", border: `1px solid rgba(59, 130, 246, 0.2)` }}>
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
                  className="cursor-pointer px-4 py-2.5 text-sm font-medium rounded-full transition flex items-center"
                  style={{ 
                    background: theme.accentSoft,
                    color: theme.textSecondary,
                    border: `1px solid ${theme.borderColor}`
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear All
                </button>
              )}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3 rounded-xl" style={{ background: theme.accentSoft }}>
              <div className="text-xs" style={{ color: theme.textMuted }}>Total Admins</div>
              <div className="text-2xl font-bold" style={{ color: theme.primaryColor }}>{clubAdmins.length}</div>
            </div>
            <div className="p-3 rounded-xl" style={{ background: theme.accentSoft }}>
              <div className="text-xs" style={{ color: theme.textMuted }}>Currently Showing</div>
              <div className="text-2xl font-bold" style={{ color: theme.primaryColor }}>{filteredAdmins.length}</div>
            </div>
            <div className="p-3 rounded-xl" style={{ background: theme.accentSoft }}>
              <div className="text-xs" style={{ color: theme.textMuted }}>Total Clubs</div>
              <div className="text-2xl font-bold" style={{ color: "#10B981" }}>{clubs.length}</div>
            </div>
            <div className="p-3 rounded-xl" style={{ background: theme.accentSoft }}>
              <div className="text-xs" style={{ color: theme.textMuted }}>Active Filters</div>
              <div className="text-2xl font-bold" style={{ color: "#F59E0B" }}>
                {(selectedClub ? 1 : 0) + (selectedDept ? 1 : 0) + (selectedYear ? 1 : 0)}
              </div>
            </div>
          </div>
        </div>

        {/* Admins Grid */}
        <div 
          className="backdrop-blur-sm rounded-3xl shadow-2xl p-6 sm:p-10 border transition-colors duration-300"
          style={{ 
            background: isDarkMode ? 'rgba(68, 70, 84, 0.8)' : 'rgba(255, 255, 255, 0.8)',
            borderColor: theme.borderColor 
          }}
        >
          {isLoadingFilteredAdmins ? (
            <div className="text-center py-12">
              <div
                className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-6 cursor-wait"
                style={{ borderColor: theme.primaryColor }}
              />
              <p style={{ color: theme.textSecondary }}>Applying filters...</p>
            </div>
          ) : filteredAdmins.length === 0 ? (
            <div className="text-center py-12">
              <div 
                className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center"
                style={{ background: theme.accentSoft }}
              >
                <Filter className="w-12 h-12" style={{ color: theme.textMuted }} />
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: theme.textPrimary }}>No club admins found</h3>
              <p className="mb-6" style={{ color: theme.textSecondary }}>Try adjusting your filters to see more admins.</p>
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
                      <div 
                        className="card-face border flex flex-col items-center justify-center transition-all duration-300 hover:shadow-xl"
                        style={{ 
                          background: theme.bgCard, 
                          borderColor: theme.borderColor 
                        }}
                      >
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl mb-4">
                          {blobImageUrl ? (
                            <img src={blobImageUrl} alt={admin.name} className="w-full h-full object-cover" />
                          ) : (
                            <div
                              className="w-full h-full flex items-center justify-center"
                              style={{ background: theme.primaryGradient }}
                            >
                              <span className="text-3xl font-display font-bold text-white">
                                {admin.name?.charAt(0)?.toUpperCase() ?? "?"}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-display font-semibold truncate max-w-[20rem]" style={{ color: theme.textPrimary }}>
                            {admin.name || "Unknown"}
                          </div>
                          <span
                            className="inline-block mt-2 px-3 py-1 text-xs rounded-full text-white font-bold shadow-md"
                            style={{ background: theme.primaryGradient }}
                          >
                            CLUB ADMIN
                          </span>
                        </div>
                      </div>

                      {/* Back */}
                      <div
                        className="card-face card-back text-white p-6 flex flex-col justify-between"
                        style={{
                          background: isDarkMode
                            ? "linear-gradient(135deg, #701A75, #3B0764)"
                            : "linear-gradient(135deg, #4CA1AF, #315169)",
                        }}
                      >
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
                                style={{ color: theme.primaryColor }}
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
    </>
  );
};

export default ClubAdminsManagement;