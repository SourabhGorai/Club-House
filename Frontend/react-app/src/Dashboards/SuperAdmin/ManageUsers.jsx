// // import { useState, useEffect } from 'react';
// // import axios from 'axios';
// // import {
// //   User,
// //   Mail,
// //   Phone,
// //   BookOpen,
// //   Calendar,
// //   Edit,
// //   Trash2,
// //   MoreVertical,
// //   Briefcase,
// //   Layers,
// // } from 'lucide-react';

// // // ----------------------------------------------------------------
// // // 1. UI COMPONENTS (Modal & Custom Styles/Classes)
// // // ----------------------------------------------------------------

// // // Replaces window.confirm/alert
// // const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
// //   if (!isOpen) return null;

// //   return (
// //     <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-70 backdrop-blur-sm">
// //       <div className="bg-white rounded-xl shadow-lg shadow-red-500/50 p-6 w-11/12 max-w-md transform transition-all duration-300">
// //         <h3 className="font-bold text-xl text-red-600 mb-3">{title}</h3>
// //         <p className="text-gray-700 mb-6">{message}</p>
// //         <div className="flex justify-end space-x-3">
// //           <button
// //             onClick={onCancel}
// //             className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition"
// //           >
// //             Cancel
// //           </button>
// //           <button
// //             onClick={onConfirm}
// //             className="px-6 py-2 text-sm font-medium rounded-full bg-red-600 text-white hover:bg-red-700 transition"
// //           >
// //             Delete User
// //           </button>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // // Custom Styles and Theme Setup
// // const customStyles = `
// //     /* Define Custom Fonts and Colors (matching previous component) */
// //     @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
// //     @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@500;700;800&display=swap');

// //     .font-sans { font-family: 'Poppins', sans-serif; }
// //     .font-display { font-family: 'Outfit', sans-serif; }

// //     /* Custom Gradient Button Class */
// //     .btn-gradient {
// //         background-image: linear-gradient(to right, #A78BFA, #8B5CF6);
// //         @apply text-white font-medium rounded-full py-2 px-4 transition-all duration-300 ease-out;
// //         box-shadow: 0 5px 15px rgba(139, 92, 246, 0.2);
// //     }
// //     .btn-gradient:hover {
// //         transform: translateY(-2px);
// //         box-shadow: 0 8px 20px rgba(139, 92, 246, 0.3);
// //     }

// //     /* Card Hover/Flip Effect for Delight */
// //     .user-card-container {
// //         perspective: 1000px;
// //         height: 20rem; /* Increased height for better visual balance and content space */
// //     }

// //     .user-card {
// //         transform-style: preserve-3d;
// //         transition: transform 0.5s ease-in-out;
// //         width: 100%;
// //         height: 100%;
// //         position: relative;
// //     }

// //     .user-card-container:hover .user-card,
// //     .user-card-container.flipped .user-card {
// //         transform: rotateY(180deg);
// //     }

// //     .card-face {
// //         position: absolute;
// //         width: 100%;
// //         height: 100%;
// //         backface-visibility: hidden;
// //         border-radius: 1rem;
// //         box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
// //         padding: 1.5rem;
// //     }

// //     .card-back {
// //         transform: rotateY(180deg);
// //         background: linear-gradient(135deg, #8B5CF6, #A78BFA); /* Violet Gradient */
// //     }
// // `;

// // // ----------------------------------------------------------------
// // // 2. MAIN COMPONENT
// // // ----------------------------------------------------------------

// // const UserManagement = () => {
// //   const [users, setUsers] = useState([]);
// //   const [userProfiles, setUserProfiles] = useState({});
// //   const [profileImages, setProfileImages] = useState({});
// //   const [openOverlayFor, setOpenOverlayFor] = useState(null);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState(null);
// //   const [isModalOpen, setIsModalOpen] = useState(false);
// //   const [userToDelete, setUserToDelete] = useState(null);

// //   const token = localStorage.getItem('token');

// //   useEffect(() => {
// //     fetchAllData();
// //   }, []);

// //   // --- API Calls (Refactored for cleaner flow) ---

// //   const fetchAllData = async () => {
// //     setLoading(true);
// //     setError(null);
// //     try {
// //       const usersResponse = await axios.get('http://localhost:8080/api/users/', {
// //         headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
// //       });

// //       const usersData = usersResponse.data || [];
// //       setUsers(usersData);

// //       // Concurrent fetching of profiles and images
// //       const [profilesMap, imagesMap] = await Promise.all([
// //         fetchAllUserProfiles(usersData),
// //         fetchAllProfileImages(usersData),
// //       ]);

// //       setUserProfiles(profilesMap);
// //       setProfileImages(imagesMap);

// //     } catch (err) {
// //       console.error('Error fetching data:', err);
// //       setError('Failed to load user data. Check API availability and authorization.');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const fetchAllUserProfiles = async (usersList) => {
// //     const profilePromises = usersList.map(async (userItem) => {
// //       try {
// //         const response = await axios.get(
// //           `http://localhost:8080/api/profiles/prn/${userItem.prn}`,
// //           { headers: { Authorization: `Bearer ${token}` } }
// //         );
// //         return { prn: userItem.prn, profile: response.data.data };
// //       } catch (error) {
// //         return { prn: userItem.prn, profile: null };
// //       }
// //     });
// //     const profileResults = await Promise.all(profilePromises);
// //     return profileResults.reduce((acc, result) => (result ? { ...acc, [result.prn]: result.profile } : acc), {});
// //   };

// //   const fetchAllProfileImages = async (usersList) => {
// //     const imagePromises = usersList.map(async (userItem) => {
// //       try {
// //         if (!userItem.prn) return { prn: userItem.prn, imageUrl: null };

// //         const response = await axios.get(
// //           `http://localhost:8080/api/profiles/${userItem.prn}/image`,
// //           { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' }
// //         );

// //         if (response.data && response.data.size > 0) {
// //           const imageUrl = URL.createObjectURL(response.data);
// //           return { prn: userItem.prn, imageUrl };
// //         } else {
// //           return { prn: userItem.prn, imageUrl: null };
// //         }
// //       } catch (error) {
// //         return { prn: userItem.prn, imageUrl: null };
// //       }
// //     });
// //     const imageResults = await Promise.all(imagePromises);
// //     return imageResults.reduce((acc, result) => (result ? { ...acc, [result.prn]: result.imageUrl } : acc), {});
// //   };

// //   // --- Handlers & Helpers ---

// //   const handleEditUser = (userId) => {
// //     // In a real app, this would navigate to the edit user route
// //     console.log('Edit user:', userId);
// //     alert(`Edit functionality for user ID ${userId} would open here!`);
// //   };

// //   const confirmDelete = (userItem) => {
// //     setUserToDelete(userItem);
// //     setIsModalOpen(true);
// //   };

// //   const executeDelete = async () => {
// //     if (!userToDelete) return;

// //     try {
// //       await axios.delete(`http://localhost:8080/api/users/${userToDelete.id}`, {
// //         headers: { Authorization: `Bearer ${token}` },
// //       });

// //       // Update the local state instantly
// //       setUsers(users.filter((user) => user.id !== userToDelete.id));
// //       // Close modal and reset
// //       setIsModalOpen(false);
// //       setUserToDelete(null);

// //     } catch (error) {
// //       console.error('Error deleting user:', error);
// //       alert('Error deleting user. Please try again.');
// //     }
// //   };

// //   function getRoleBadgeClass(role) {
// //     switch (role) {
// //       case 'SUPER_ADMIN':
// //         return 'bg-purple-600 text-white font-bold shadow-md shadow-purple-500/30';
// //       case 'TEACHER':
// //         return 'bg-teal-400 text-white font-bold shadow-md shadow-teal-400/30';
// //       case 'CLUB_ADMIN':
// //         return 'bg-orange-400 text-white font-bold shadow-md shadow-orange-400/30';
// //       default:
// //         return 'bg-gray-300 text-gray-700';
// //     }
// //   }

// //   // --- Render Functions ---

// //   if (loading) {
// //     return (
// //       <div className="min-h-screen flex items-center justify-center bg-gray-50">
// //         <style dangerouslySetInnerHTML={{ __html: customStyles }} />
// //         <div className="text-center p-8 bg-white rounded-xl shadow-lg">
// //           <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#8B5CF6] mx-auto"></div>
// //           <p className="mt-6 font-medium text-[#4C1D95]">Loading user profiles...</p>
// //         </div>
// //       </div>
// //     );
// //   }

// //   if (error) {
// //     return (
// //       <div className="min-h-screen flex items-center justify-center bg-gray-50">
// //         <div className="text-center p-8 bg-white rounded-xl shadow-lg">
// //           <p className="text-red-600 text-lg font-semibold">{error}</p>
// //           <button onClick={fetchAllData} className="mt-6 btn-gradient">
// //             Retry Loading
// //           </button>
// //         </div>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="min-h-screen font-sans py-12" style={{ background: 'radial-gradient(circle at top left, #F2EEFF, #FDFCFE 60%, #F8F5FF)' }}>
// //       <style dangerouslySetInnerHTML={{ __html: customStyles }} />
// //       <ConfirmationModal
// //         isOpen={isModalOpen}
// //         title="Confirm User Deletion"
// //         message={`You are about to delete user: ${userToDelete?.username || 'N/A'}. This action is irreversible. Proceed?`}
// //         onConfirm={executeDelete}
// //         onCancel={() => setIsModalOpen(false)}
// //       />

// //       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
// //         <div className="mb-10 text-center">
// //           <h1 className="font-display text-4xl font-extrabold text-[#4C1D95] tracking-tight">
// //             User Directory & Access Control
// //           </h1>
// //           <p className="text-gray-500 mt-2 text-lg">
// //             Manage all staff, teachers, and club administrators. Hover over cards for details.
// //           </p>
// //         </div>

// //         <div className="bg-white bg-opacity-95 rounded-3xl shadow-2xl p-6 sm:p-10 border border-gray-100">
// //           <header className="px-3 py-4 border-b border-gray-200 mb-8">
// //             <h2 className="text-2xl font-semibold text-[#4C1D95] font-display flex items-center">
// //               <Layers className="mr-3 w-6 h-6 text-[#A78BFA]" />
// //               Total Active Users ({users.length})
// //             </h2>
// //           </header>

// //           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
// //             {users.map((userItem) => {
// //               const userProfile = userProfiles[userItem.prn];
// //               const imageUrl = profileImages[userItem.prn];
// //               const isFlipped = openOverlayFor === userItem.prn;

// //               return (
// //                 <div
// //                   key={userItem.prn || userItem.id}
// //                   className={`user-card-container ${isFlipped ? 'flipped' : ''}`}
// //                   onClick={() => setOpenOverlayFor(isFlipped ? null : userItem.prn)}
// //                 >
// //                   <div className="user-card">
// //                     {/* CARD FRONT: Minimal Info */}
// //                     <div className="card-face bg-white border border-gray-200 flex flex-col items-center justify-center transition-all duration-300 hover:shadow-xl hover:border-[#A78BFA]">
// //                       <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl mb-4">
// //                         {imageUrl ? (
// //                           <img
// //                             src={imageUrl}
// //                             alt={userItem.username}
// //                             className="w-full h-full object-cover"
// //                             onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/100x100/A78BFA/ffffff?text=U"; }}
// //                           />
// //                         ) : (
// //                           <div className="w-full h-full bg-gray-200 flex items-center justify-center">
// //                             <span className="text-3xl font-display font-bold text-gray-600">
// //                               {userItem.username?.charAt(0)?.toUpperCase() ?? "?"}
// //                             </span>
// //                           </div>
// //                         )}
// //                       </div>

// //                       <div className="text-center">
// //                         <div className="text-xl font-display font-semibold text-gray-900 truncate max-w-[20rem]">
// //                           {userProfile?.fullName || userItem.username}
// //                         </div>
// //                         <span className={`inline-block mt-2 px-3 py-1 text-xs rounded-full ${getRoleBadgeClass(userItem.role)}`}>
// //                             {userItem.role?.replace('_', ' ') || 'STANDARD USER'}
// //                         </span>
// //                       </div>
// //                     </div>

// //                     {/* CARD BACK: Detailed Info (Theme: Violet Gradient) */}
// //                     <div className="card-face card-back text-white p-6 flex flex-col justify-between">
// //                       <div>
// //                         <div className="flex justify-between items-center mb-4">
// //                             <div className='flex items-center gap-3'>
// //                                 <User className="w-6 h-6" />
// //                                 <div className="font-display font-semibold text-2xl">{userItem.prn || 'N/A'}</div>
// //                             </div>
// //                             {/* Mobile Toggle Button */}
// //                             <button
// //                                 className="sm:hidden p-2 text-white/80 rounded-full bg-white/20 hover:bg-white/30"
// //                             >
// //                                 <MoreVertical className='w-5 h-5' />
// //                             </button>
// //                         </div>

// //                         <div className="mt-4 text-sm space-y-3">
// //                             {/* Email */}
// //                             <div className="flex items-center gap-3">
// //                                 <Mail className="w-4 h-4 text-[#2DD4BF]" />
// //                                 <span className="truncate">{userItem.email}</span>
// //                             </div>

// //                             {/* Phone */}
// //                             <div className="flex items-center gap-3">
// //                                 <Phone className="w-4 h-4 text-[#FB923C]" />
// //                                 <span>{userProfile?.phoneNumber || 'No contact info'}</span>
// //                             </div>

// //                             {/* Department / Year */}
// //                             <div className="flex items-center gap-3">
// //                                 <BookOpen className="w-4 h-4 text-white/90" />
// //                                 <span>{userProfile?.department || '—'}</span>
// //                                 <Calendar className="w-4 h-4 ml-4 text-white/90" />
// //                                 <span>Year: {userProfile?.year || '—'}</span>
// //                             </div>

// //                             {/* Role Badge (on back) */}
// //                             <div className="flex items-center gap-3 pt-2">
// //                                 <Briefcase className='w-4 h-4 text-white/90'/>
// //                                 <span className="px-3 py-1 text-xs rounded-full bg-white text-[#8B5CF6] font-semibold">
// //                                     {userItem.role?.replace('_', ' ') || 'STANDARD USER'}
// //                                 </span>
// //                             </div>
// //                         </div>
// //                       </div>

// //                       <div className="flex items-center justify-between mt-6 space-x-2"> {/* Added space-x-2 here */}
// //                         <button
// //                           onClick={(e) => { e.stopPropagation(); handleEditUser(userItem.id); }}
// //                           className="px-3 py-2 bg-white text-[#8B5CF6] rounded-full text-sm font-medium hover:bg-gray-100 transition flex items-center shadow-md flex-1 min-w-0" // Reduced px-4 to px-3 and added flex-1
// //                         >
// //                           <Edit className="w-4 h-4 mr-1" /> {/* Reduced margin */}
// //                           Manage
// //                         </button>

// //                         <button
// //                           onClick={(e) => { e.stopPropagation(); confirmDelete(userItem); }}
// //                           className="px-3 py-2 bg-red-500 text-white rounded-full text-sm font-medium hover:bg-red-600 transition flex items-center shadow-md shadow-red-500/30 flex-1 min-w-0" // Reduced px-4 to px-3 and added flex-1
// //                         >
// //                           <Trash2 className="w-4 h-4 mr-1" /> {/* Reduced margin */}
// //                           Remove
// //                         </button>
// //                       </div>
// //                     </div>
// //                   </div>
// //                 </div>
// //               );
// //             })}
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default UserManagement;

// import { useState, useEffect } from 'react';
// import axios from 'axios';
// import {
//   User,
//   Mail,
//   Phone,
//   BookOpen,
//   Calendar,
//   Edit,
//   Trash2,
//   MoreVertical,
//   Briefcase,
//   Layers,
//   Filter,
//   X
// } from 'lucide-react';

// // ----------------------------------------------------------------
// // 1. UI COMPONENTS (Modal & Custom Styles/Classes)
// // ----------------------------------------------------------------

// // Replaces window.confirm/alert
// const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-70 backdrop-blur-sm">
//       <div className="bg-white rounded-xl shadow-lg shadow-red-500/50 p-6 w-11/12 max-w-md transform transition-all duration-300">
//         <h3 className="font-bold text-xl text-red-600 mb-3">{title}</h3>
//         <p className="text-gray-700 mb-6">{message}</p>
//         <div className="flex justify-end space-x-3">
//           <button
//             onClick={onCancel}
//             className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={onConfirm}
//             className="px-6 py-2 text-sm font-medium rounded-full bg-red-600 text-white hover:bg-red-700 transition"
//           >
//             Delete User
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Filter Modal Component
// const FilterModal = ({ isOpen, onClose, departments, years, selectedDept, selectedYear, onDeptChange, onYearChange, onResetFilters, onApplyFilters }) => {
//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-70 backdrop-blur-sm">
//       <div className="bg-white rounded-xl shadow-lg p-6 w-11/12 max-w-md transform transition-all duration-300">
//         <div className="flex justify-between items-center mb-6">
//           <h3 className="font-bold text-xl text-[#4C1D95] flex items-center">
//             <Filter className="w-5 h-5 mr-2" />
//             Filter Users
//           </h3>
//           <button
//             onClick={onClose}
//             className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
//           >
//             <X className="w-5 h-5" />
//           </button>
//         </div>

//         <div className="space-y-6">
//           {/* Department Filter */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Department
//             </label>
//             <select
//               value={selectedDept}
//               onChange={(e) => onDeptChange(e.target.value)}
//               className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent transition-all duration-300 bg-white/50 text-sm"
//             >
//               <option value="">All Departments</option>
//               {departments.map((dept) => (
//                 <option key={dept} value={dept}>
//                   {dept}
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
//               className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent transition-all duration-300 bg-white/50 text-sm"
//             >
//               <option value="">All Years</option>
//               {years.map((year) => (
//                 <option key={year} value={year}>
//                   Year {year}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Active Filters Display */}
//           {(selectedDept || selectedYear) && (
//             <div className="bg-gray-50 p-3 rounded-lg">
//               <p className="text-xs font-medium text-gray-600 mb-2">Active Filters:</p>
//               <div className="flex flex-wrap gap-2">
//                 {selectedDept && (
//                   <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
//                     Dept: {selectedDept}
//                     <button
//                       onClick={() => onDeptChange('')}
//                       className="ml-1 text-purple-600 hover:text-purple-800"
//                     >
//                       <X className="w-3 h-3" />
//                     </button>
//                   </span>
//                 )}
//                 {selectedYear && (
//                   <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
//                     Year: {selectedYear}
//                     <button
//                       onClick={() => onYearChange('')}
//                       className="ml-1 text-blue-600 hover:text-blue-800"
//                     >
//                       <X className="w-3 h-3" />
//                     </button>
//                   </span>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* Action Buttons */}
//           <div className="flex justify-between pt-4">
//             <button
//               onClick={onResetFilters}
//               className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition"
//             >
//               Reset All
//             </button>
//             <div className="space-x-3">
//               <button
//                 onClick={onClose}
//                 className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={() => {
//                   onApplyFilters();
//                   onClose();
//                 }}
//                 className="px-6 py-2 text-sm font-medium rounded-full bg-[#8B5CF6] text-white hover:bg-[#7C3AED] transition"
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

// // Custom Styles and Theme Setup
// const customStyles = `
//     /* Define Custom Fonts and Colors (matching previous component) */
//     @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
//     @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@500;700;800&display=swap');

//     .font-sans { font-family: 'Poppins', sans-serif; }
//     .font-display { font-family: 'Outfit', sans-serif; }

//     /* Custom Gradient Button Class */
//     .btn-gradient {
//         background-image: linear-gradient(to right, #A78BFA, #8B5CF6);
//         @apply text-white font-medium rounded-full py-2 px-4 transition-all duration-300 ease-out;
//         box-shadow: 0 5px 15px rgba(139, 92, 246, 0.2);
//     }
//     .btn-gradient:hover {
//         transform: translateY(-2px);
//         box-shadow: 0 8px 20px rgba(139, 92, 246, 0.3);
//     }

//     /* Card Hover/Flip Effect for Delight */
//     .user-card-container {
//         perspective: 1000px;
//         height: 20rem; /* Increased height for better visual balance and content space */
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

//     .card-back {
//         transform: rotateY(180deg);
//         background: linear-gradient(135deg, #8B5CF6, #A78BFA); /* Violet Gradient */
//     }
// `;

// // ----------------------------------------------------------------
// // 2. MAIN COMPONENT
// // ----------------------------------------------------------------

// const UserManagement = () => {
//   // State management
//   const [users, setUsers] = useState([]);
//   const [filteredUsers, setFilteredUsers] = useState([]);
//   const [userProfiles, setUserProfiles] = useState({});
//   const [profileImages, setProfileImages] = useState({});
//   const [openOverlayFor, setOpenOverlayFor] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [userToDelete, setUserToDelete] = useState(null);

//   // Filter states
//   const [selectedDept, setSelectedDept] = useState('');
//   const [selectedYear, setSelectedYear] = useState('');
//   const [departments, setDepartments] = useState([]);
//   const [years, setYears] = useState([]);
//   const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
//   const [isLoadingFilteredUsers, setIsLoadingFilteredUsers] = useState(false);

//   const token = localStorage.getItem('token');

//   useEffect(() => {
//     fetchAllData();
//   }, []);

//   // --- API Calls ---

//   const fetchAllData = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const usersResponse = await axios.get('http://localhost:8080/api/users/', {
//         headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
//       });

//       const usersData = usersResponse.data || [];
//       setUsers(usersData);
//       setFilteredUsers(usersData); // Initially show all users

//       // Concurrent fetching of profiles and images
//       const [profilesMap, imagesMap] = await Promise.all([
//         fetchAllUserProfiles(usersData),
//         fetchAllProfileImages(usersData),
//       ]);

//       setUserProfiles(profilesMap);
//       setProfileImages(imagesMap);

//       // Extract unique departments and years from profiles
//       extractFiltersData(profilesMap);

//     } catch (err) {
//       console.error('Error fetching data:', err);
//       setError('Failed to load user data. Check API availability and authorization.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchAllUserProfiles = async (usersList) => {
//     const profilePromises = usersList.map(async (userItem) => {
//       try {
//         const response = await axios.get(
//           `http://localhost:8080/api/profiles/prn/${userItem.prn}`,
//           { headers: { Authorization: `Bearer ${token}` } }
//         );
//         return { prn: userItem.prn, profile: response.data.data };
//       } catch (error) {
//         return { prn: userItem.prn, profile: null };
//       }
//     });
//     const profileResults = await Promise.all(profilePromises);
//     return profileResults.reduce((acc, result) => (result ? { ...acc, [result.prn]: result.profile } : acc), {});
//   };

//   const fetchAllProfileImages = async (usersList) => {
//     const imagePromises = usersList.map(async (userItem) => {
//       try {
//         if (!userItem.prn) return { prn: userItem.prn, imageUrl: null };

//         const response = await axios.get(
//           `http://localhost:8080/api/profiles/${userItem.prn}/image`,
//           { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' }
//         );

//         if (response.data && response.data.size > 0) {
//           const imageUrl = URL.createObjectURL(response.data);
//           return { prn: userItem.prn, imageUrl };
//         } else {
//           return { prn: userItem.prn, imageUrl: null };
//         }
//       } catch (error) {
//         return { prn: userItem.prn, imageUrl: null };
//       }
//     });
//     const imageResults = await Promise.all(imagePromises);
//     return imageResults.reduce((acc, result) => (result ? { ...acc, [result.prn]: result.imageUrl } : acc), {});
//   };

//   // --- Filter Functions ---

// const extractFiltersData = (profilesMap) => {
//   const deptSet = new Set();
//   const yearSet = new Set([1, 2, 3, 4]); // Always include years 1-4

//   Object.values(profilesMap).forEach(profile => {
//     if (profile?.department) {
//       deptSet.add(profile.department);
//     }
//     if (profile?.year) {
//       yearSet.add(profile.year);
//     }
//   });

//   setDepartments(Array.from(deptSet).sort());
//   setYears(Array.from(yearSet).sort((a, b) => a - b));
// };

//   const applyFilters = async () => {
//     setIsLoadingFilteredUsers(true);

//     try {
//       let usersToFilter = [...users];

//       // Apply department filter if selected
//       if (selectedDept) {
//         usersToFilter = usersToFilter.filter(user => {
//           const profile = userProfiles[user.prn];
//           return profile?.department === selectedDept;
//         });
//       }

//       // Apply year filter if selected - using backend API
//       if (selectedYear) {
//         try {
//           const response = await axios.get(
//             `http://localhost:8080/api/profiles/year/${selectedYear}`,
//             {
//               headers: {
//                 Authorization: `Bearer ${token}`,
//                 'Content-Type': 'application/json'
//               }
//             }
//           );

//           // Extract PRNs from the year-filtered profiles
//           const yearFilteredPrns = response.data.data?.map(profile => profile.prn) || [];

//           // Filter users based on PRNs from year filter
//           usersToFilter = usersToFilter.filter(user =>
//             yearFilteredPrns.includes(user.prn)
//           );
//         } catch (yearError) {
//           console.error('Error filtering by year:', yearError);
//           // Fallback to client-side filtering if API fails
//           usersToFilter = usersToFilter.filter(user => {
//             const profile = userProfiles[user.prn];
//             return profile?.year?.toString() === selectedYear;
//           });
//         }
//       }

//       setFilteredUsers(usersToFilter);
//     } catch (error) {
//       console.error('Error applying filters:', error);
//       // Fallback to client-side filtering
//       let filtered = [...users];

//       if (selectedDept) {
//         filtered = filtered.filter(user => {
//           const profile = userProfiles[user.prn];
//           return profile?.department === selectedDept;
//         });
//       }

//       if (selectedYear) {
//         filtered = filtered.filter(user => {
//           const profile = userProfiles[user.prn];
//           return profile?.year?.toString() === selectedYear;
//         });
//       }

//       setFilteredUsers(filtered);
//     } finally {
//       setIsLoadingFilteredUsers(false);
//     }
//   };

//   const handleDeptChange = (dept) => {
//     setSelectedDept(dept);
//   };

//   const handleYearChange = (year) => {
//     setSelectedYear(year);
//   };

//   const resetFilters = () => {
//     setSelectedDept('');
//     setSelectedYear('');
//     setFilteredUsers(users);
//   };

//   // --- Handlers & Helpers ---

//   const handleEditUser = (userId) => {
//     console.log('Edit user:', userId);
//     alert(`Edit functionality for user ID ${userId} would open here!`);
//   };

//   const confirmDelete = (userItem) => {
//     setUserToDelete(userItem);
//     setIsModalOpen(true);
//   };

//   const executeDelete = async () => {
//     if (!userToDelete) return;

//     try {
//       await axios.delete(`http://localhost:8080/api/users/${userToDelete.id}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       // Update the local state
//       const updatedUsers = users.filter((user) => user.id !== userToDelete.id);
//       setUsers(updatedUsers);
//       setFilteredUsers(updatedUsers);

//       // Close modal and reset
//       setIsModalOpen(false);
//       setUserToDelete(null);

//     } catch (error) {
//       console.error('Error deleting user:', error);
//       alert('Error deleting user. Please try again.');
//     }
//   };

//   function getRoleBadgeClass(role) {
//     switch (role) {
//       case 'SUPER_ADMIN':
//         return 'bg-purple-600 text-white font-bold shadow-md shadow-purple-500/30';
//       case 'TEACHER':
//         return 'bg-teal-400 text-white font-bold shadow-md shadow-teal-400/30';
//       case 'CLUB_ADMIN':
//         return 'bg-orange-400 text-white font-bold shadow-md shadow-orange-400/30';
//       default:
//         return 'bg-gray-300 text-gray-700';
//     }
//   }

//   // --- Render Functions ---

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <style dangerouslySetInnerHTML={{ __html: customStyles }} />
//         <div className="text-center p-8 bg-white rounded-xl shadow-lg">
//           <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#8B5CF6] mx-auto"></div>
//           <p className="mt-6 font-medium text-[#4C1D95]">Loading user profiles...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="text-center p-8 bg-white rounded-xl shadow-lg">
//           <p className="text-red-600 text-lg font-semibold">{error}</p>
//           <button onClick={fetchAllData} className="mt-6 btn-gradient">
//             Retry Loading
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen font-sans py-12" style={{ background: 'radial-gradient(circle at top left, #F2EEFF, #FDFCFE 60%, #F8F5FF)' }}>
//       <style dangerouslySetInnerHTML={{ __html: customStyles }} />

//       {/* Modals */}
//       <ConfirmationModal
//         isOpen={isModalOpen}
//         title="Confirm User Deletion"
//         message={`You are about to delete user: ${userToDelete?.username || 'N/A'}. This action is irreversible. Proceed?`}
//         onConfirm={executeDelete}
//         onCancel={() => setIsModalOpen(false)}
//       />

//       <FilterModal
//         isOpen={isFilterModalOpen}
//         onClose={() => setIsFilterModalOpen(false)}
//         departments={departments}
//         years={years}
//         selectedDept={selectedDept}
//         selectedYear={selectedYear}
//         onDeptChange={handleDeptChange}
//         onYearChange={handleYearChange}
//         onResetFilters={resetFilters}
//         onApplyFilters={applyFilters}
//       />

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="mb-10 text-center">
//           <h1 className="font-display text-4xl font-extrabold text-[#4C1D95] tracking-tight">
//             User Directory & Access Control
//           </h1>
//           <p className="text-gray-500 mt-2 text-lg">
//             Manage all staff, teachers, and club administrators. Hover over cards for details.
//           </p>
//         </div>

//         {/* Filter Section */}
//         <div className="mb-8 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
//           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//             <div>
//               <h2 className="text-xl font-semibold text-[#4C1D95] font-display flex items-center">
//                 <Filter className="mr-3 w-5 h-5 text-[#A78BFA]" />
//                 Active Users ({filteredUsers.length})
//                 {users.length !== filteredUsers.length && (
//                   <span className="ml-2 text-sm font-normal text-gray-500">
//                     (Filtered from {users.length})
//                   </span>
//                 )}
//                 {isLoadingFilteredUsers && (
//                   <span className="ml-2 text-sm font-normal text-[#8B5CF6]">
//                     <span className="animate-pulse">Loading...</span>
//                   </span>
//                 )}
//               </h2>
//             </div>

//             <div className="flex flex-wrap items-center gap-3">
//               {/* Active Filters Display */}
//               {(selectedDept || selectedYear) && (
//                 <div className="flex flex-wrap gap-2">
//                   {selectedDept && (
//                     <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-purple-100 text-purple-800 border border-purple-200">
//                       Dept: {selectedDept}
//                       <button
//                         onClick={() => handleDeptChange('')}
//                         className="ml-2 text-purple-600 hover:text-purple-800"
//                       >
//                         <X className="w-3 h-3" />
//                       </button>
//                     </span>
//                   )}
//                   {selectedYear && (
//                     <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
//                       Year: {selectedYear}
//                       <button
//                         onClick={() => handleYearChange('')}
//                         className="ml-2 text-blue-600 hover:text-blue-800"
//                       >
//                         <X className="w-3 h-3" />
//                       </button>
//                     </span>
//                   )}
//                 </div>
//               )}

//               {/* Filter Button */}
//               <button
//                 onClick={() => setIsFilterModalOpen(true)}
//                 className="cursor-pointer btn-gradient flex items-center px-4 py-2.5"
//               >
//                 <Filter className="w-4 h-4 mr-2" />
//                 Filter
//                 {(selectedDept || selectedYear) && (
//                   <span className="ml-2 bg-white text-[#8B5CF6] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
//                     {(selectedDept ? 1 : 0) + (selectedYear ? 1 : 0)}
//                   </span>
//                 )}
//               </button>

//               {/* Reset Filter Button */}
//               {(selectedDept || selectedYear) && (
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

//           {/* Quick Filter Stats */}
//           <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//             <div className="bg-gray-50 p-3 rounded-xl">
//               <div className="text-xs text-gray-500">Total Users</div>
//               <div className="text-2xl font-bold text-[#4C1D95]">{users.length}</div>
//             </div>
//             <div className="bg-gray-50 p-3 rounded-xl">
//               <div className="text-xs text-gray-500">Currently Showing</div>
//               <div className="text-2xl font-bold text-[#8B5CF6]">{filteredUsers.length}</div>
//             </div>
//             <div className="bg-gray-50 p-3 rounded-xl">
//               <div className="text-xs text-gray-500">Departments</div>
//               <div className="text-2xl font-bold text-[#10B981]">{departments.length}</div>
//             </div>
//             <div className="bg-gray-50 p-3 rounded-xl">
//               <div className="text-xs text-gray-500">Active Filters</div>
//               <div className="text-2xl font-bold text-[#F59E0B]">
//                 {(selectedDept ? 1 : 0) + (selectedYear ? 1 : 0)}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Users Grid */}
//         <div className="bg-white bg-opacity-95 rounded-3xl shadow-2xl p-6 sm:p-10 border border-gray-100">
//           {isLoadingFilteredUsers ? (
//             <div className="text-center py-12">
//               <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#8B5CF6] mx-auto mb-6"></div>
//               <p className="text-gray-600">Applying filters...</p>
//             </div>
//           ) : filteredUsers.length === 0 ? (
//             <div className="text-center py-12">
//               <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
//                 <Filter className="w-12 h-12 text-gray-400" />
//               </div>
//               <h3 className="text-xl font-semibold text-gray-700 mb-2">No users found</h3>
//               <p className="text-gray-500 mb-6">
//                 {selectedDept || selectedYear
//                   ? "Try adjusting your filters to see more users."
//                   : "No users available in the system."}
//               </p>
//               {(selectedDept || selectedYear) && (
//                 <button
//                   onClick={resetFilters}
//                   className="btn-gradient px-6 py-2.5"
//                 >
//                   Clear All Filters
//                 </button>
//               )}
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
//               {filteredUsers.map((userItem) => {
//                 const userProfile = userProfiles[userItem.prn];
//                 const imageUrl = profileImages[userItem.prn];
//                 const isFlipped = openOverlayFor === userItem.prn;

//                 return (
//                   <div
//                     key={userItem.prn || userItem.id}
//                     className={`user-card-container ${isFlipped ? 'flipped' : ''}`}
//                     onClick={() => setOpenOverlayFor(isFlipped ? null : userItem.prn)}
//                   >
//                     <div className="user-card">
//                       {/* CARD FRONT: Minimal Info */}
//                       <div className="card-face bg-white border border-gray-200 flex flex-col items-center justify-center transition-all duration-300 hover:shadow-xl hover:border-[#A78BFA]">
//                         <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl mb-4">
//                           {imageUrl ? (
//                             <img
//                               src={imageUrl}
//                               alt={userItem.username}
//                               className="w-full h-full object-cover"
//                               onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/100x100/A78BFA/ffffff?text=U"; }}
//                             />
//                           ) : (
//                             <div className="w-full h-full bg-gray-200 flex items-center justify-center">
//                               <span className="text-3xl font-display font-bold text-gray-600">
//                                 {userItem.username?.charAt(0)?.toUpperCase() ?? "?"}
//                               </span>
//                             </div>
//                           )}
//                         </div>

//                         <div className="text-center">
//                           <div className="text-xl font-display font-semibold text-gray-900 truncate max-w-[20rem]">
//                             {userProfile?.fullName || userItem.username}
//                           </div>
//                           <span className={`inline-block mt-2 px-3 py-1 text-xs rounded-full ${getRoleBadgeClass(userItem.role)}`}>
//                               {userItem.role?.replace('_', ' ') || 'STANDARD USER'}
//                           </span>
//                           {/* Quick Department/Year info on front */}
//                           <div className="mt-2 text-xs text-gray-500 space-x-2">
//                             {userProfile?.department && (
//                               <span className="inline-block px-2 py-0.5 bg-gray-100 rounded">
//                                 {userProfile.department}
//                               </span>
//                             )}
//                             {userProfile?.year && (
//                               <span className="inline-block px-2 py-0.5 bg-gray-100 rounded">
//                                 Year {userProfile.year}
//                               </span>
//                             )}
//                           </div>
//                         </div>
//                       </div>

//                       {/* CARD BACK: Detailed Info */}
//                       <div className="card-face card-back text-white p-6 flex flex-col justify-between">
//                         <div>
//                           <div className="flex justify-between items-center mb-4">
//                               <div className='flex items-center gap-3'>
//                                   <User className="w-6 h-6" />
//                                   <div className="font-display font-semibold text-2xl">{userItem.prn || 'N/A'}</div>
//                               </div>
//                               <button
//                                   className="sm:hidden p-2 text-white/80 rounded-full bg-white/20 hover:bg-white/30"
//                               >
//                                   <MoreVertical className='w-5 h-5' />
//                               </button>
//                           </div>

//                           <div className="mt-4 text-sm space-y-3">
//                               {/* Email */}
//                               <div className="flex items-center gap-3">
//                                   <Mail className="w-4 h-4 text-[#2DD4BF]" />
//                                   <span className="truncate">{userItem.email}</span>
//                               </div>

//                               {/* Phone */}
//                               <div className="flex items-center gap-3">
//                                   <Phone className="w-4 h-4 text-[#FB923C]" />
//                                   <span>{userProfile?.phoneNumber || 'No contact info'}</span>
//                               </div>

//                               {/* Department / Year */}
//                               <div className="flex items-center gap-3">
//                                   <BookOpen className="w-4 h-4 text-white/90" />
//                                   <span>{userProfile?.department || '—'}</span>
//                                   <Calendar className="w-4 h-4 ml-4 text-white/90" />
//                                   <span>Year: {userProfile?.year || '—'}</span>
//                               </div>

//                               {/* Role Badge */}
//                               <div className="flex items-center gap-3 pt-2">
//                                   <Briefcase className='w-4 h-4 text-white/90'/>
//                                   <span className="px-3 py-1 text-xs rounded-full bg-white text-[#8B5CF6] font-semibold">
//                                       {userItem.role?.replace('_', ' ') || 'STANDARD USER'}
//                                   </span>
//                               </div>
//                           </div>
//                         </div>

//                         <div className="flex items-center justify-between mt-6 space-x-2">
//                           <button
//                             onClick={(e) => { e.stopPropagation(); handleEditUser(userItem.id); }}
//                             className="px-3 py-2 bg-white text-[#8B5CF6] rounded-full text-sm font-medium hover:bg-gray-100 transition flex items-center shadow-md flex-1 min-w-0"
//                           >
//                             <Edit className="w-4 h-4 mr-1" />
//                             Manage
//                           </button>

//                           <button
//                             onClick={(e) => { e.stopPropagation(); confirmDelete(userItem); }}
//                             className="px-3 py-2 bg-red-500 text-white rounded-full text-sm font-medium hover:bg-red-600 transition flex items-center shadow-md shadow-red-500/30 flex-1 min-w-0"
//                           >
//                             <Trash2 className="w-4 h-4 mr-1" />
//                             Remove
//                           </button>
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

// export default UserManagement;

import { useState, useEffect } from "react";
import axios from "axios";
import {
  User,
  Mail,
  Phone,
  BookOpen,
  Calendar,
  Edit,
  Trash2,
  MoreVertical,
  Briefcase,
  Layers,
  Filter,
  X,
} from "lucide-react";

// ----------------------------------------------------------------
// 1. UI COMPONENTS (Modal & Custom Styles/Classes)
// ----------------------------------------------------------------

// Replaces window.confirm/alert
const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-70 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-lg shadow-red-500/50 p-6 w-11/12 max-w-md transform transition-all duration-300">
        <h3 className="font-bold text-xl text-red-600 mb-3">{title}</h3>
        <p className="text-gray-700 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 text-sm font-medium rounded-full bg-red-600 text-white hover:bg-red-700 transition"
          >
            Delete User
          </button>
        </div>
      </div>
    </div>
  );
};

// Filter Modal Component
const FilterModal = ({
  isOpen,
  onClose,
  departments,
  years,
  selectedDept,
  selectedYear,
  onDeptChange,
  onYearChange,
  onResetFilters,
  onApplyFilters,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-70 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-lg p-6 w-11/12 max-w-md transform transition-all duration-300">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-xl text-[#4C1D95] flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filter Users
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Department Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department
            </label>
            <select
              value={selectedDept}
              onChange={(e) => onDeptChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent transition-all duration-300 bg-white/50 text-sm"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => onYearChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent transition-all duration-300 bg-white/50 text-sm"
            >
              <option value="">All Years</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  Year {year}
                </option>
              ))}
            </select>
          </div>

          {/* Active Filters Display */}
          {(selectedDept || selectedYear) && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs font-medium text-gray-600 mb-2">
                Active Filters:
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedDept && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Dept: {selectedDept}
                    <button
                      onClick={() => onDeptChange("")}
                      className="ml-1 text-purple-600 hover:text-purple-800"
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
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <button
              onClick={onResetFilters}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition"
            >
              Reset All
            </button>
            <div className="space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onApplyFilters();
                  onClose();
                }}
                className="px-6 py-2 text-sm font-medium rounded-full bg-[#8B5CF6] text-white hover:bg-[#7C3AED] transition"
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

// Custom Styles and Theme Setup
const customStyles = `
    /* Define Custom Fonts and Colors (matching previous component) */
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@500;700;800&display=swap');
    
    .font-sans { font-family: 'Poppins', sans-serif; }
    .font-display { font-family: 'Outfit', sans-serif; }

    /* Custom Gradient Button Class */
    .btn-gradient {
        background-image: linear-gradient(to right, #A78BFA, #8B5CF6);
        @apply text-white font-medium rounded-full py-2 px-4 transition-all duration-300 ease-out;
        box-shadow: 0 5px 15px rgba(139, 92, 246, 0.2);
    }
    .btn-gradient:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(139, 92, 246, 0.3);
    }

    /* Card Hover/Flip Effect for Delight */
    .user-card-container {
        perspective: 1000px;
        height: 20rem; /* Increased height for better visual balance and content space */
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

    .card-back {
        transform: rotateY(180deg);
        background: linear-gradient(135deg, #8B5CF6, #A78BFA); /* Violet Gradient */
    }
`;

// ----------------------------------------------------------------
// 2. MAIN COMPONENT
// ----------------------------------------------------------------

const UserManagement = () => {
  // State management
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [userProfiles, setUserProfiles] = useState({});
  const [profileImages, setProfileImages] = useState({});
  const [openOverlayFor, setOpenOverlayFor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Filter states
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [departments, setDepartments] = useState([]);
  const [years, setYears] = useState([]);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isLoadingFilteredUsers, setIsLoadingFilteredUsers] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchAllData();
  }, []);

  // --- API Calls ---

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const usersResponse = await axios.get(
        "http://localhost:8080/api/users/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const usersData = usersResponse.data || [];
      setUsers(usersData);
      setFilteredUsers(usersData); // Initially show all users

      // Concurrent fetching of profiles and images
      const [profilesMap, imagesMap] = await Promise.all([
        fetchAllUserProfiles(usersData),
        fetchAllProfileImages(usersData),
      ]);

      setUserProfiles(profilesMap);
      setProfileImages(imagesMap);

      // Extract unique departments and years from profiles
      extractFiltersData(profilesMap);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(
        "Failed to load user data. Check API availability and authorization.",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUserProfiles = async (usersList) => {
    const profilePromises = usersList.map(async (userItem) => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/profiles/prn/${userItem.prn}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        return { prn: userItem.prn, profile: response.data.data };
      } catch (error) {
        return { prn: userItem.prn, profile: null };
      }
    });
    const profileResults = await Promise.all(profilePromises);
    return profileResults.reduce(
      (acc, result) =>
        result ? { ...acc, [result.prn]: result.profile } : acc,
      {},
    );
  };

  const fetchAllProfileImages = async (usersList) => {
    const imagePromises = usersList.map(async (userItem) => {
      try {
        if (!userItem.prn) return { prn: userItem.prn, imageUrl: null };

        const response = await axios.get(
          `http://localhost:8080/api/profiles/${userItem.prn}/image`,
          {
            headers: { Authorization: `Bearer ${token}` },
            responseType: "blob",
          },
        );

        if (response.data && response.data.size > 0) {
          const imageUrl = URL.createObjectURL(response.data);
          return { prn: userItem.prn, imageUrl };
        } else {
          return { prn: userItem.prn, imageUrl: null };
        }
      } catch (error) {
        return { prn: userItem.prn, imageUrl: null };
      }
    });
    const imageResults = await Promise.all(imagePromises);
    return imageResults.reduce(
      (acc, result) =>
        result ? { ...acc, [result.prn]: result.imageUrl } : acc,
      {},
    );
  };

  // --- Filter Functions ---

  const extractFiltersData = (profilesMap) => {
    const deptSet = new Set();
    const yearSet = new Set([1, 2, 3, 4]); // Always include years 1-4

    Object.values(profilesMap).forEach((profile) => {
      if (profile?.department) {
        deptSet.add(profile.department);
      }
      if (profile?.year) {
        yearSet.add(profile.year);
      }
    });

    setDepartments(Array.from(deptSet).sort());
    setYears(Array.from(yearSet).sort((a, b) => a - b));
  };

  const applyFilters = async () => {
    setIsLoadingFilteredUsers(true);

    try {
      let usersToFilter = [...users];

      // Apply department filter if selected
      if (selectedDept) {
        usersToFilter = usersToFilter.filter((user) => {
          const profile = userProfiles[user.prn];
          return profile?.department === selectedDept;
        });
      }

      // Apply year filter if selected
      if (selectedYear) {
        try {
          const response = await axios.get(
            `http://localhost:8080/api/profiles/year/${selectedYear}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            },
          );

          // Extract PRNs from the year-filtered profiles
          const yearFilteredPrns =
            response.data.data?.map((profile) => profile.prn) || [];

          // Filter users based on PRNs from year filter
          if (selectedDept) {
            // If department is also selected, combine both filters
            usersToFilter = usersToFilter.filter((user) =>
              yearFilteredPrns.includes(user.prn),
            );
          } else {
            // If only year filter is selected
            usersToFilter = users.filter((user) =>
              yearFilteredPrns.includes(user.prn),
            );
          }
        } catch (yearError) {
          console.error("Error filtering by year:", yearError);
          // Fallback to client-side filtering if API fails
          usersToFilter = usersToFilter.filter((user) => {
            const profile = userProfiles[user.prn];
            return profile?.year?.toString() === selectedYear;
          });
        }
      }

      setFilteredUsers(usersToFilter);
    } catch (error) {
      console.error("Error applying filters:", error);
      // Fallback to client-side filtering
      applyClientSideFilters();
    } finally {
      setIsLoadingFilteredUsers(false);
    }
  };

  const applyClientSideFilters = () => {
    let filtered = [...users];

    if (selectedDept) {
      filtered = filtered.filter((user) => {
        const profile = userProfiles[user.prn];
        return profile?.department === selectedDept;
      });
    }

    if (selectedYear) {
      filtered = filtered.filter((user) => {
        const profile = userProfiles[user.prn];
        return profile?.year?.toString() === selectedYear;
      });
    }

    setFilteredUsers(filtered);
  };

  // New function to handle filter changes immediately
  const handleFilterChange = (
    newDept = selectedDept,
    newYear = selectedYear,
  ) => {
    setSelectedDept(newDept);
    setSelectedYear(newYear);

    // If no filters are active, show all users immediately
    if (!newDept && !newYear) {
      setFilteredUsers(users);
      return;
    }

    // Apply filters with new values
    const applyImmediateFilters = async () => {
      setIsLoadingFilteredUsers(true);

      try {
        let usersToFilter = [...users];

        // Apply department filter if selected
        if (newDept) {
          usersToFilter = usersToFilter.filter((user) => {
            const profile = userProfiles[user.prn];
            return profile?.department === newDept;
          });
        }

        // Apply year filter if selected
        if (newYear) {
          try {
            const response = await axios.get(
              `http://localhost:8080/api/profiles/year/${newYear}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              },
            );

            const yearFilteredPrns =
              response.data.data?.map((profile) => profile.prn) || [];

            if (newDept) {
              // Combine both filters
              usersToFilter = usersToFilter.filter((user) =>
                yearFilteredPrns.includes(user.prn),
              );
            } else {
              // Only year filter
              usersToFilter = users.filter((user) =>
                yearFilteredPrns.includes(user.prn),
              );
            }
          } catch (yearError) {
            console.error("Error filtering by year:", yearError);
            // Fallback to client-side
            usersToFilter = usersToFilter.filter((user) => {
              const profile = userProfiles[user.prn];
              return profile?.year?.toString() === newYear;
            });
          }
        }

        setFilteredUsers(usersToFilter);
      } catch (error) {
        console.error("Error applying immediate filters:", error);
        applyClientSideFiltersWithValues(newDept, newYear);
      } finally {
        setIsLoadingFilteredUsers(false);
      }
    };

    applyImmediateFilters();
  };

  const applyClientSideFiltersWithValues = (dept, year) => {
    let filtered = [...users];

    if (dept) {
      filtered = filtered.filter((user) => {
        const profile = userProfiles[user.prn];
        return profile?.department === dept;
      });
    }

    if (year) {
      filtered = filtered.filter((user) => {
        const profile = userProfiles[user.prn];
        return profile?.year?.toString() === year;
      });
    }

    setFilteredUsers(filtered);
  };

  const handleDeptChange = (dept) => {
    handleFilterChange(dept, selectedYear);
  };

  const handleYearChange = (year) => {
    handleFilterChange(selectedDept, year);
  };

  const handleRemoveDeptFilter = () => {
    handleFilterChange("", selectedYear);
  };

  const handleRemoveYearFilter = () => {
    handleFilterChange(selectedDept, "");
  };

  const resetFilters = () => {
    setSelectedDept("");
    setSelectedYear("");
    setFilteredUsers(users);
  };

  // --- Handlers & Helpers ---

  const handleEditUser = (userId) => {
    console.log("Edit user:", userId);
    alert(`Edit functionality for user ID ${userId} would open here!`);
  };

  const confirmDelete = (userItem) => {
    setUserToDelete(userItem);
    setIsModalOpen(true);
  };

  const executeDelete = async () => {
    if (!userToDelete) return;

    try {
      await axios.delete(`http://localhost:8080/api/users/${userToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update the local state
      const updatedUsers = users.filter((user) => user.id !== userToDelete.id);
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);

      // Close modal and reset
      setIsModalOpen(false);
      setUserToDelete(null);
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Error deleting user. Please try again.");
    }
  };

  function getRoleBadgeClass(role) {
    switch (role) {
      case "SUPER_ADMIN":
        return "bg-purple-600 text-white font-bold shadow-md shadow-purple-500/30";
      case "TEACHER":
        return "bg-teal-400 text-white font-bold shadow-md shadow-teal-400/30";
      case "CLUB_ADMIN":
        return "bg-orange-400 text-white font-bold shadow-md shadow-orange-400/30";
      default:
        return "bg-gray-300 text-gray-700";
    }
  }

  // --- Render Functions ---

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <style dangerouslySetInnerHTML={{ __html: customStyles }} />
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#8B5CF6] mx-auto"></div>
          <p className="mt-6 font-medium text-[#4C1D95]">
            Loading user profiles...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <p className="text-red-600 text-lg font-semibold">{error}</p>
          <button onClick={fetchAllData} className="mt-6 btn-gradient">
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen font-sans py-12"
      style={{
        background:
          "radial-gradient(circle at top left, #F2EEFF, #FDFCFE 60%, #F8F5FF)",
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />

      {/* Modals */}
      <ConfirmationModal
        isOpen={isModalOpen}
        title="Confirm User Deletion"
        message={`You are about to delete user: ${userToDelete?.username || "N/A"}. This action is irreversible. Proceed?`}
        onConfirm={executeDelete}
        onCancel={() => setIsModalOpen(false)}
      />

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        departments={departments}
        years={years}
        selectedDept={selectedDept}
        selectedYear={selectedYear}
        onDeptChange={handleDeptChange}
        onYearChange={handleYearChange}
        onResetFilters={resetFilters}
        onApplyFilters={applyFilters}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h1 className="font-display text-4xl font-extrabold text-[#4C1D95] tracking-tight">
            User Directory & Access Control
          </h1>
          <p className="text-gray-500 mt-2 text-lg">
            Manage all staff, teachers, and club administrators. Hover over
            cards for details.
          </p>
        </div>

        {/* Filter Section */}
        <div className="mb-8 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold text-[#4C1D95] font-display flex items-center">
                <Filter className="mr-3 w-5 h-5 text-[#A78BFA]" />
                Active Users ({filteredUsers.length})
                {users.length !== filteredUsers.length && (
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    (Filtered from {users.length})
                  </span>
                )}
                {isLoadingFilteredUsers && (
                  <span className="ml-2 text-sm font-normal text-[#8B5CF6]">
                    <span className="animate-pulse">Loading...</span>
                  </span>
                )}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Active Filters Display */}
              {(selectedDept || selectedYear) && (
                <div className="flex flex-wrap gap-2">
                  {selectedDept && (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-purple-100 text-purple-800 border border-purple-200">
                      Dept: {selectedDept}
                      <button
                        onClick={handleRemoveDeptFilter}
                        className="ml-2 text-purple-600 hover:text-purple-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {selectedYear && (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                      Year: {selectedYear}
                      <button
                        onClick={handleRemoveYearFilter}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>
              )}

              {/* Filter Button */}
              <button
                onClick={() => setIsFilterModalOpen(true)}
                className="cursor-pointer btn-gradient flex items-center px-4 py-2.5 rounded-full"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filter
                {(selectedDept || selectedYear) && (
                  <span className="ml-2 bg-white text-[#8B5CF6] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {(selectedDept ? 1 : 0) + (selectedYear ? 1 : 0)}
                  </span>
                )}
              </button>

              {/* Reset Filter Button */}
              {(selectedDept || selectedYear) && (
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

          {/* Quick Filter Stats */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-3 rounded-xl">
              <div className="text-xs text-gray-500">Total Users</div>
              <div className="text-2xl font-bold text-[#4C1D95]">
                {users.length}
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl">
              <div className="text-xs text-gray-500">Currently Showing</div>
              <div className="text-2xl font-bold text-[#8B5CF6]">
                {filteredUsers.length}
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl">
              <div className="text-xs text-gray-500">Departments</div>
              <div className="text-2xl font-bold text-[#10B981]">
                {departments.length}
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl">
              <div className="text-xs text-gray-500">Active Filters</div>
              <div className="text-2xl font-bold text-[#F59E0B]">
                {(selectedDept ? 1 : 0) + (selectedYear ? 1 : 0)}
              </div>
            </div>
          </div>
        </div>

        {/* Users Grid */}
        <div className="bg-white bg-opacity-95 rounded-3xl shadow-2xl p-6 sm:p-10 border border-gray-100">
          {isLoadingFilteredUsers ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#8B5CF6] mx-auto mb-6"></div>
              <p className="text-gray-600">Applying filters...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <Filter className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No users found
              </h3>
              <p className="text-gray-500 mb-6">
                {selectedDept || selectedYear
                  ? "Try adjusting your filters to see more users."
                  : "No users available in the system."}
              </p>
              {(selectedDept || selectedYear) && (
                <button
                  onClick={resetFilters}
                  className="btn-gradient px-6 py-2.5"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredUsers.map((userItem) => {
                const userProfile = userProfiles[userItem.prn];
                const imageUrl = profileImages[userItem.prn];
                const isFlipped = openOverlayFor === userItem.prn;

                return (
                  <div
                    key={userItem.prn || userItem.id}
                    className={`user-card-container ${isFlipped ? "flipped" : ""}`}
                    onClick={() =>
                      setOpenOverlayFor(isFlipped ? null : userItem.prn)
                    }
                  >
                    <div className="user-card">
                      {/* CARD FRONT: Minimal Info */}
                      <div className="card-face bg-white border border-gray-200 flex flex-col items-center justify-center transition-all duration-300 hover:shadow-xl hover:border-[#A78BFA]">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl mb-4">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={userItem.username}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src =
                                  "https://placehold.co/100x100/A78BFA/ffffff?text=U";
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <span className="text-3xl font-display font-bold text-gray-600">
                                {userItem.username?.charAt(0)?.toUpperCase() ??
                                  "?"}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="text-center">
                          <div className="text-xl font-display font-semibold text-gray-900 truncate max-w-[20rem]">
                            {userProfile?.fullName || userItem.username}
                          </div>
                          <span
                            className={`inline-block mt-2 px-3 py-1 text-xs rounded-full ${getRoleBadgeClass(userItem.role)}`}
                          >
                            {userItem.role?.replace("_", " ") ||
                              "STANDARD USER"}
                          </span>
                          {/* Quick Department/Year info on front */}
                          <div className="mt-2 text-xs text-gray-500 space-x-2">
                            {userProfile?.department && (
                              <span className="inline-block px-2 py-0.5 bg-gray-100 rounded">
                                {userProfile.department}
                              </span>
                            )}
                            {userProfile?.year && (
                              <span className="inline-block px-2 py-0.5 bg-gray-100 rounded">
                                Year {userProfile.year}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* CARD BACK: Detailed Info */}
                      <div className="card-face card-back text-white p-6 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-3">
                              <User className="w-6 h-6" />
                              <div className="font-display font-semibold text-2xl">
                                {userItem.prn || "N/A"}
                              </div>
                            </div>
                            <button className="sm:hidden p-2 text-white/80 rounded-full bg-white/20 hover:bg-white/30">
                              <MoreVertical className="w-5 h-5" />
                            </button>
                          </div>

                          <div className="mt-4 text-sm space-y-3">
                            {/* Email */}
                            <div className="flex items-center gap-3">
                              <Mail className="w-4 h-4 text-[#2DD4BF]" />
                              <span className="truncate">{userItem.email}</span>
                            </div>

                            {/* Phone */}
                            <div className="flex items-center gap-3">
                              <Phone className="w-4 h-4 text-[#FB923C]" />
                              <span>
                                {userProfile?.phoneNumber || "No contact info"}
                              </span>
                            </div>

                            {/* Department / Year */}
                            <div className="flex items-center gap-3">
                              <BookOpen className="w-4 h-4 text-white/90" />
                              <span>{userProfile?.department || "—"}</span>
                              <Calendar className="w-4 h-4 ml-4 text-white/90" />
                              <span>Year: {userProfile?.year || "—"}</span>
                            </div>

                            {/* Role Badge */}
                            <div className="flex items-center gap-3 pt-2">
                              <Briefcase className="w-4 h-4 text-white/90" />
                              <span className="px-3 py-1 text-xs rounded-full bg-white text-[#8B5CF6] font-semibold">
                                {userItem.role?.replace("_", " ") ||
                                  "STANDARD USER"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-6 space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditUser(userItem.id);
                            }}
                            className="px-3 py-2 bg-white text-[#8B5CF6] rounded-full text-sm font-medium hover:bg-gray-100 transition flex items-center shadow-md flex-1 min-w-0"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Manage
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              confirmDelete(userItem);
                            }}
                            className="px-3 py-2 bg-red-500 text-white rounded-full text-sm font-medium hover:bg-red-600 transition flex items-center shadow-md shadow-red-500/30 flex-1 min-w-0"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Remove
                          </button>
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

export default UserManagement;
