// import { useState, useEffect } from "react";
// import axios from "axios";


// const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
//   if (!isOpen) return null;
//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-70 backdrop-blur-sm">
//       <div className="bg-white rounded-2xl shadow-2xl p-6 w-11/12 max-w-md transform transition-all">
//         <h3 className="font-display text-xl font-bold text-red-600 mb-3">{title}</h3>
//         <p className="text-gray-700 mb-6">{message}</p>
//         <div className="flex justify-end space-x-3">
//           <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition">
//             Cancel
//           </button>
//           <button onClick={onConfirm} className="bg-red-500 hover:bg-red-600 text-white font-medium rounded-full py-2 px-6 transition-all shadow-lg shadow-red-500/30">
//             Delete
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// const AssignTeacherModal = ({
//   isOpen,
//   onClose,
//   onAssign,
//   teacherPrn,
//   setTeacherPrn,
//   teacherSearchResult,
//   onSearchTeacher,
//   teacherSearchLoading,
//   assignTeacherLoading,
// }) => {
//   if (!isOpen) return null;

//   return (
//     // The "backdrop-blur-sm" class handles the blurring of the background
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md transition-all duration-300">
//       <div className="bg-white rounded-2xl shadow-2xl p-8 w-11/12 max-w-md transform transition-all animate-in fade-in zoom-in duration-200">
//         <h3 className="font-display text-2xl font-bold text-[#4C1D95] mb-6">
//           Assign Teacher Advisor
//         </h3>

//         <div className="mb-6">
//           <label className="block text-sm font-semibold text-gray-600 mb-2">
//             Enter Teacher PRN
//           </label>
//           <div className="flex space-x-2">
//             <input
//               type="text"
//               value={teacherPrn}
//               onChange={(e) => setTeacherPrn(e.target.value)}
//               className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 outline-none transition-all placeholder:text-gray-300"
//               placeholder="e.g., 2214110270"
//             />
//             <button
//               onClick={onSearchTeacher}
//               disabled={teacherSearchLoading || !teacherPrn.trim()}
//               className="px-6 py-2.5 bg-purple-700 text-white font-bold rounded-xl hover:bg-purple-700 "
//             >
//               {teacherSearchLoading ? "..." : "Verify"}
//             </button>
//           </div>
//         </div>

//         {/* Search Result Display */}
//         {teacherSearchResult && (
//           <div className={`mb-6 p-4 rounded-xl border ${
//             teacherSearchResult.role === "TEACHERS" 
//               ? "bg-green-50 border-green-100" 
//               : "bg-red-50 border-red-100"
//           }`}>
//             <p className="font-bold text-gray-800">{teacherSearchResult.username || teacherSearchResult.name}</p>
//             <p className="text-xs text-gray-500 mb-2">{teacherSearchResult.email}</p>
//             <p className={`text-xs font-black uppercase tracking-wider ${
//               teacherSearchResult.role === "TEACHERS" ? "text-green-600" : "text-red-600"
//             }`}>
//               {teacherSearchResult.role} {teacherSearchResult.role !== "TEACHERS" && " (Invalid Role)"}
//             </p>
//           </div>
//         )}

//         <div className="flex justify-end items-center space-x-3 mt-8">
//           <button
//             onClick={onClose}
//             className="px-6 py-2.5 text-sm font-bold text-gray-500 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
//             disabled={assignTeacherLoading}
//           >
//             Cancel
//           </button>
//           <button
//             onClick={onAssign}
//             disabled={!teacherSearchResult || teacherSearchResult.role !== "TEACHERS" || assignTeacherLoading}
//             className={`px-8 py-2.5 text-sm font-bold text-white rounded-full transition-all shadow-lg ${
//               teacherSearchResult?.role === "TEACHERS" && !assignTeacherLoading
//                 ? "bg-purple-700 "
//                 : "bg-purple-700 cursor-not-allowed shadow-none"
//             }`}
//           >
//             {assignTeacherLoading ? "Assigning..." : "Assign Teacher"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// const AssignClubAdminModal = ({
//   isOpen,
//   onClose,
//   onAssign,
//   adminPrn,
//   setAdminPrn,
//   adminSearchResult,
//   onSearchAdmin,
//   adminSearchLoading,
//   assignAdminLoading,
// }) => {
//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md transition-all duration-300">
//       <div className="bg-white rounded-2xl shadow-2xl p-8 w-11/12 max-w-md transform transition-all animate-in fade-in zoom-in duration-200">
//         <h3 className="font-display text-2xl font-bold text-[#8B5CF6] mb-6">
//           Assign Club Admin
//         </h3>

//         <div className="mb-6">
//           <label className="block text-sm font-semibold text-gray-600 mb-2">
//             Enter User PRN
//           </label>
//           <div className="flex space-x-2">
//             <input
//               type="text"
//               value={adminPrn}
//               onChange={(e) => setAdminPrn(e.target.value)}
//               className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none transition-all placeholder:text-gray-300"
//               placeholder="e.g., 2214110270"
//             />
//             <button
//               onClick={onSearchAdmin}
//               disabled={adminSearchLoading || !adminPrn.trim()}
//               className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
//             >
//               {adminSearchLoading ? "..." : "Verify"}
//             </button>
//           </div>
//         </div>

//         {/* Search Result Display */}
//         {adminSearchResult && (
//           <div className={`mb-6 p-4 rounded-xl border ${
//             adminSearchResult.role === "USERS" || adminSearchResult.role === "STUDENT"
//               ? "bg-green-50 border-green-100" 
//               : "bg-red-50 border-red-100"
//           }`}>
//             <p className="font-bold text-gray-800">{adminSearchResult.username || adminSearchResult.name}</p>
//             <p className="text-xs text-gray-500 mb-2">{adminSearchResult.email}</p>
//             <p className={`text-xs font-black uppercase tracking-wider ${
//               adminSearchResult.role === "USERS" || adminSearchResult.role === "STUDENT" 
//                 ? "text-green-600" 
//                 : "text-red-600"
//             }`}>
//               {adminSearchResult.role} 
//               {(adminSearchResult.role !== "USERS" && adminSearchResult.role !== "STUDENT") && " (Invalid Role - Must be Student/User)"}
//             </p>
//           </div>
//         )}

//         <div className="flex justify-end items-center space-x-3 mt-8">
//           <button
//             onClick={onClose}
//             className="px-6 py-2.5 text-sm font-bold text-gray-500 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
//             disabled={assignAdminLoading}
//           >
//             Cancel
//           </button>
//           <button
//             onClick={onAssign}
//             disabled={
//               !adminSearchResult || 
//               (adminSearchResult.role !== "USERS" && adminSearchResult.role !== "STUDENT") || 
//               assignAdminLoading
//             }
//             className={`px-8 py-2.5 text-sm font-bold text-white rounded-full transition-all shadow-lg ${
//               (adminSearchResult?.role === "USERS" || adminSearchResult?.role === "STUDENT") && !assignAdminLoading
//                 ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30"
//                 : "bg-indigo-300 cursor-not-allowed shadow-none"
//             }`}
//           >
//             {assignAdminLoading ? "Assigning..." : "Assign Admin"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Icons
// const EditIcon = (props) => (
//   <svg {...props} className={`w-5 h-5 transition duration-200 ${props.className || ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
//   </svg>
// );
// const DeleteIcon = (props) => (
//   <svg {...props} className={`w-5 h-5 transition duration-200 ${props.className || ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//   </svg>
// );
// const MembersIcon = (props) => (
//   <svg {...props} className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
//     <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.05-.97.13C16.51 14.15 18 15.35 18 16v3h5v-2.5c0-2.33-4.67-3.5-7-3.5z" />
//   </svg>
// );
// const EventsIcon = (props) => (
//   <svg {...props} className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
//     <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6a2 2 0 0 0-2-2zm0 16H5V9h14v11zM5 7V6h14v1H5z" />
//   </svg>
// );
// const EstablishedIcon = (props) => (
//   <svg {...props} className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
//     <path d="M12 2c-3.87 0-7 3.13-7 7v.55c0 .38.16.74.45 1l-.86.86C3.96 11.83 3 12.79 3 14v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4c0-1.21-.96-2.17-1.59-2.82l-.86-.86c.29-.26.45-.62.45-1V9c0-3.87-3.13-7-7-7zm-1 16H8c-.55 0-1-.45-1-1v-2c0-.55.45-1 1-1h3v4zm6-4h-3v4h3c.55 0 1-.45 1-1v-2c0-.55-.45-1-1-1zm-4-9c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z" />
//   </svg>
// );

// // ----------------------------------------------------------------
// // 2. MAIN COMPONENT
// // ----------------------------------------------------------------

// export default function ManageClubs() {
//   const [clubs, setClubs] = useState([]);
//   const [selectedClub, setSelectedClub] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [adminData, setAdminData] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [clubToDelete, setClubToDelete] = useState(null);
//   const [showTeacherModal, setShowTeacherModal] = useState(false);
//   const [teacherPrn, setTeacherPrn] = useState("");
//   const [teacherSearchResult, setTeacherSearchResult] = useState(null);
//   const [teacherSearchLoading, setTeacherSearchLoading] = useState(false);
//   const [assignTeacherLoading, setAssignTeacherLoading] = useState(false);
//   const [showAddClubModal, setShowAddClubModal] = useState(false);
//   const [newClub, setNewClub] = useState({ name: "", clubDesc: "" });
//   const [addClubLoading, setAddClubLoading] = useState(false);
//   // Add these state variables
// const [showClubAdminModal, setShowClubAdminModal] = useState(false);
// const [adminPrn, setAdminPrn] = useState("");
// const [adminSearchResult, setAdminSearchResult] = useState(null);
// const [adminSearchLoading, setAdminSearchLoading] = useState(false);
// const [assignAdminLoading, setAssignAdminLoading] = useState(false);

//   const customStyles = `
//     .font-display { font-family: 'Outfit', sans-serif; }
//     .btn-gradient {
//         background-image: linear-gradient(90deg, #A78BFA 0%, #8B5CF6 100%);
//         color: white;
//         font-weight: 500;
//         border-radius: 9999px;
//         padding: 0.5rem 1.5rem;
//         transition: all 0.25s ease;
//         box-shadow: 0 5px 15px rgba(139, 92, 246, 0.18);
//     }
//     .btn-gradient:hover { transform: translateY(-2px); }
//     .club-item { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
//     .club-item:hover { transform: translateX(8px); }
//     .club-item.active {
//         position: relative;
//         background: white;
//         box-shadow: 0 10px 25px rgba(139, 92, 246, 0.15);
//     }
//     .club-item.active::before {
//         content: '';
//         position: absolute;
//         top: 15%; bottom: 15%; left: 0;
//         width: 4px;
//         border-radius: 0 4px 4px 0;
//         background: #8B5CF6;
//     }
//     .stat-card {
//         transition: all 0.3s ease-out;
//         background: white;
//         border: 1px solid #f3f4f6;
//         box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
//     }
//     .stat-card:hover {
//         transform: translateY(-5px);
//         box-shadow: 0 12px 30px rgba(139, 92, 246, 0.1);
//     }
//   `;

//   // API Handlers
//   const fetchClubs = async () => {
//     setLoading(true);
//     try {
//       const token = localStorage.getItem("token");
//       const response = await axios.get("http://localhost:8080/api/clubs", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (response?.data?.success) {
//         const fetchedClubs = response.data.data || [];
//         setClubs(fetchedClubs);
//         if (fetchedClubs.length > 0) {
//           const first = fetchedClubs[0];
//           setSelectedClub(first);
//           fetchAdminData(first.clubId);
//         }
//       }
//     } catch (err) { setError("Failed to fetch clubs."); }
//     finally { setLoading(false); }
//   };

//   const fetchAdminData = async (clubId) => {
//     try {
//       const token = localStorage.getItem("token");
//       const response = await axios.get(`http://localhost:8080/api/clubs/${clubId}/admin`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       if (response?.data?.success) {
//         const clubData = response.data.data || {};
//         const adminsWithEmail = await Promise.all(
//           (clubData.clubAdmins || []).map(async (admin) => {
//             const email = await fetchAdminEmail(admin.prn);
//             return { ...admin, email: email || "N/A" };
//           })
//         );
//         setAdminData({ ...clubData, clubAdmins: adminsWithEmail });
//       }
//     } catch (err) { console.error(err); }
//   };

//   const fetchAdminEmail = async (prn) => {
//     try {
//       const token = localStorage.getItem("token");
//       const response = await axios.get(`http://localhost:8080/api/users/${prn}`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       return response?.data?.email || null;
//     } catch (err) { return null; }
//   };

//   useEffect(() => { fetchClubs(); }, []);

//   // ----------------------------------------------------------------
//   // TEACHER ASSIGNMENT LOGIC (MERGED FROM YOUR CODE)
//   // ----------------------------------------------------------------
//   const handleOpenTeacherModal = () => {
//     setShowTeacherModal(true);
//     setTeacherPrn("");
//     setTeacherSearchResult(null);
//   };

//   const handleSearchTeacher = async () => {
//     if (!teacherPrn.trim()) return;
//     setTeacherSearchLoading(true);
//     try {
//       const token = localStorage.getItem("token");
//       const response = await axios.get(`http://localhost:8080/api/users/${teacherPrn}`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       if (response?.data) {
//         setTeacherSearchResult(response.data);
//       } else {
//         setTeacherSearchResult(null);
//       }
//     } catch (err) {
//       console.error("Error searching teacher:", err);
//       setTeacherSearchResult(null);
//     } finally {
//       setTeacherSearchLoading(false);
//     }
//   };

//   const handleAssignTeacher = async () => {
//     if (!teacherSearchResult || !selectedClub || teacherSearchResult.role !== "TEACHERS") return;

//     setAssignTeacherLoading(true);
//     try {
//       const token = localStorage.getItem("token");
//       const currentYear = new Date().getFullYear();
//       const tenure = `${currentYear}-${currentYear + 1}`;

//       const payload = {
//         prn: teacherPrn,
//         clubId: selectedClub.clubId,
//         role: "TEACHERS",
//         tenure: tenure
//       };

//       const response = await axios.post("http://localhost:8080/api/user-clubs", payload, {
//         headers: { Authorization: `Bearer ${token}` }
//       });

//       if (response?.data?.success) {
//         alert("Teacher assigned successfully!");
//         fetchAdminData(selectedClub.clubId); // Refresh UI
//         setShowTeacherModal(false);
//       } else {
//         alert("Failed to assign teacher.");
//       }
//     } catch (err) {
//       alert("Error during assignment. Check console.");
//     } finally {
//       setAssignTeacherLoading(false);
//     }
//   };


//   // club admin searches
//   const handleOpenClubAdminModal = () => {
//   setShowClubAdminModal(true);
//   setAdminPrn("");
//   setAdminSearchResult(null);
// };

// const handleSearchAdmin = async () => {
//   if (!adminPrn.trim()) return;
//   setAdminSearchLoading(true);
//   try {
//     const token = localStorage.getItem("token");
//     const response = await axios.get(`http://localhost:8080/api/users/${adminPrn}`, {
//       headers: { Authorization: `Bearer ${token}` }
//     });
//     if (response?.data) {
//       setAdminSearchResult(response.data);
//     } else {
//       setAdminSearchResult(null);
//     }
//   } catch (err) {
//     console.error("Error searching user:", err);
//     setAdminSearchResult(null);
//   } finally {
//     setAdminSearchLoading(false);
//   }
// };

// const handleAssignClubAdmin = async () => {
//   if (!adminSearchResult || !selectedClub) return;
  
//   // Check if user role is valid for club admin
//   const isValidRole = adminSearchResult.role === "USERS" || adminSearchResult.role === "STUDENT";
//   if (!isValidRole) {
//     alert("Only regular users/students can be assigned as club admins");
//     return;
//   }

//   setAssignAdminLoading(true);
//   try {
//     const token = localStorage.getItem("token");
//     const currentYear = new Date().getFullYear();
//     const tenure = `${currentYear}-${currentYear + 1}`;

//     const payload = {
//       prn: adminPrn,
//       clubId: selectedClub.clubId,
//       role: "CLUB_ADMIN", // This is the key difference from teacher assignment
//       tenure: tenure
//     };

//     const response = await axios.post("http://localhost:8080/api/user-clubs", payload, {
//       headers: { Authorization: `Bearer ${token}` }
//     });

//     if (response?.data?.success) {
//       alert("Club admin assigned successfully!");
//       fetchAdminData(selectedClub.clubId); // Refresh UI
//       setShowClubAdminModal(false);
//     } else {
//       alert("Failed to assign club admin.");
//     }
//   } catch (err) {
//     console.error("Assignment error:", err);
//     alert("Error during assignment. Check console.");
//   } finally {
//     setAssignAdminLoading(false);
//   }
// };
//   // Club Handlers
//   const handleAddClub = async () => {
//     setAddClubLoading(true);
//     try {
//       const token = localStorage.getItem("token");
//       const response = await axios.post("http://localhost:8080/api/clubs", newClub, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       if (response.data.success) {
//         alert("Club created!");
//         setShowAddClubModal(false);
//         setNewClub({ name: "", clubDesc: "" });
//         fetchClubs();
//       }
//     } catch (err) { alert("Error creating club"); }
//     finally { setAddClubLoading(false); }
//   };

//   const handleSelectClub = (club) => {
//     setSelectedClub(club);
//     fetchAdminData(club.clubId);
//   };

//   const executeDelete = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       await axios.delete(`http://localhost:8080/api/clubs/${clubToDelete.clubId}`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       alert("Deleted!");
//       fetchClubs();
//     } catch (err) { alert("Delete failed"); }
//     finally { setIsModalOpen(false); }
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return "N/A";
//     const d = new Date(dateString);
//     return isNaN(d) ? dateString : d.toLocaleDateString();
//   };

//   const generateRandomDetails = (club) => ({
//     description: club?.clubDesc || "A vibrant community of enthusiasts passionate about technology and innovation.",
//     upcomingEvents: Math.floor(Math.random() * 8) + 3,
//     established: club?.createdAt ? new Date(club.createdAt).getFullYear() : 2024,
//   });

//   if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading Dashboard...</div>;

//   return (
//     <div className="min-h-screen p-6 sm:p-10 flex items-start justify-center" style={{ background: "radial-gradient(circle at top left, #F2EEFF, #FDFCFE 60%, #F8F5FF)" }}>
//       <style dangerouslySetInnerHTML={{ __html: customStyles }} />

//       {/* MODALS */}
//       {showAddClubModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
//           <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
//             <h3 className="text-2xl font-bold text-[#4C1D95] mb-6">Create New Club</h3>
//             <div className="space-y-4">
//               <input type="text" placeholder="Club Name" value={newClub.name} onChange={(e) => setNewClub({ ...newClub, name: e.target.value })} className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-purple-400" />
//               <textarea placeholder="Description" value={newClub.clubDesc} onChange={(e) => setNewClub({ ...newClub, clubDesc: e.target.value })} className="w-full px-4 py-3 border rounded-xl h-32 outline-none focus:ring-2 focus:ring-purple-400" />
//             </div>
//             <div className="flex justify-end gap-3 mt-6">
//               <button className="px-6 py-2 bg-gray-100 rounded-full font-medium" onClick={() => setShowAddClubModal(false)}>Cancel</button>
//               <button className="btn-gradient px-8" onClick={handleAddClub} disabled={addClubLoading}>{addClubLoading ? "Creating..." : "Create Club"}</button>
//             </div>
//           </div>
//         </div>
//       )}

//       <ConfirmationModal isOpen={isModalOpen} title="Confirm Deletion" message={`Permanently delete "${clubToDelete?.clubName}"?`} onConfirm={executeDelete} onCancel={() => setIsModalOpen(false)} />
      
//       <AssignTeacherModal 
//         isOpen={showTeacherModal} onClose={() => setShowTeacherModal(false)} onAssign={handleAssignTeacher}
//         teacherPrn={teacherPrn} setTeacherPrn={setTeacherPrn} teacherSearchResult={teacherSearchResult}
//         onSearchTeacher={handleSearchTeacher} teacherSearchLoading={teacherSearchLoading} assignTeacherLoading={assignTeacherLoading}
//       />

//       <AssignClubAdminModal 
//   isOpen={showClubAdminModal} 
//   onClose={() => setShowClubAdminModal(false)} 
//   onAssign={handleAssignClubAdmin}
//   adminPrn={adminPrn} 
//   setAdminPrn={setAdminPrn} 
//   adminSearchResult={adminSearchResult}
//   onSearchAdmin={handleSearchAdmin} 
//   adminSearchLoading={adminSearchLoading} 
//   assignAdminLoading={assignAdminLoading}
// />

//       {/* DASHBOARD CONTAINER */}
//       <div className="w-full max-w-7xl bg-white bg-opacity-95 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-md">
//         <header className="p-8 border-b border-gray-100 bg-gradient-to-r from-[#A78BFA] to-[#8B5CF6] text-white rounded-t-3xl shadow-inner">
//           <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
//             <div className="text-left w-full sm:w-auto">
//               <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight drop-shadow-md">ClubLink Stellar Dashboard</h1>
//               <p className="mt-2 text-lg font-light opacity-90">Manage all college clubs with ease and style.</p>
//             </div>
//             <button className="flex-shrink-0 bg-white text-purple-700 font-bold rounded-full py-3 px-8 shadow-xl hover:bg-purple-50 hover:scale-105 transition-all duration-300" onClick={() => setShowAddClubModal(true)}>+ Add New Club</button>
//           </div>
//         </header>

//         <div className="flex flex-col lg:flex-row min-h-[70vh]">
//           {/* LEFT PANEL */}
//           <div className="lg:w-1/3 border-r border-gray-100 flex flex-col p-6 bg-gray-50/20">
//             <h2 className="font-display text-2xl font-bold text-[#4C1D95] mb-2 px-2">Your Clubs</h2>
//             <div className="overflow-y-auto max-h-[60vh] lg:max-h-full space-y-2 pr-2">
//               {clubs.map((club) => (
//                 <div key={club.clubId} className={`club-item p-4 rounded-xl cursor-pointer ${selectedClub?.clubId === club.clubId ? "active" : "hover:bg-white"}`} onClick={() => handleSelectClub(club)}>
//                   <div className="flex flex-col">
//                     <span className={`font-display text-lg font-bold ${selectedClub?.clubId === club.clubId ? "text-[#4C1D95]" : "text-gray-700 uppercase tracking-wide"}`}>{club.clubName}</span>
//                     <div className="mt-2 flex items-center">
//                       <div className={`px-2 py-0.5 rounded-md flex items-center gap-1.5 ${club.isActive ? "bg-green-50" : "bg-gray-100"}`}>
//                         <span className={`w-1.5 h-1.5 rounded-full ${club.isActive ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}></span>
//                         <span className={`text-[10px] font-bold uppercase ${club.isActive ? "text-green-600" : "text-gray-500"}`}>{club.isActive ? "Active" : "Inactive"}</span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* RIGHT PANEL */}
//           <div className="lg:w-2/3 p-8 sm:p-12">
//             {selectedClub ? (
//               <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
//                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-8 mb-8 gap-4">
//                   <div>
//                     <h2 className="text-5xl font-black text-[#4C1D95] tracking-tight">{selectedClub.clubName}</h2>
//                     <p className="text-gray-400 mt-2 font-medium">Dashboard Overview • Founded {formatDate(selectedClub.createdAt)}</p>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <button onClick={() => alert("Edit feature coming soon!")} className="p-3 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-600 hover:text-white transition-colors"><EditIcon /></button>
//                     <button onClick={() => { setClubToDelete(selectedClub); setIsModalOpen(true); }} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-colors"><DeleteIcon /></button>
//                   </div>
//                 </div>

//                 {(() => {
//                   const details = generateRandomDetails(selectedClub);
//                   return (
//                     <div className="space-y-10">
//                       {/* STATS */}
//                       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                         <div className="stat-card p-6 rounded-2xl"><MembersIcon className="text-purple-500 mb-3" /> <span className="text-4xl font-black text-purple-600">{adminData?.totalCount || 0}</span> <p className="text-xs font-bold uppercase text-gray-400">Active Members</p></div>
//                         <div className="stat-card p-6 rounded-2xl"><EventsIcon className="text-teal-500 mb-3" /> <span className="text-4xl font-black text-teal-600">{details.upcomingEvents}</span> <p className="text-xs font-bold uppercase text-gray-400">Planned Events</p></div>
//                       </div>

//                       {/* LEADERSHIP */}
//                       <div className="space-y-6">
//                         <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2"><span className="w-1 h-6 bg-teal-500 rounded-full"></span> Leadership & Contact</h3>
//                         <div className="grid gap-4">
//                <div className="flex flex-col sm:flex-row justify-between p-5 bg-white rounded-2xl border border-gray-100 shadow-sm items-center gap-4">
//   <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">Club Admins:</span>
//   <div className="flex flex-col sm:flex-row items-center gap-3">
//     <span className="font-bold text-[#4C1D95] text-center sm:text-left">
//       {adminData?.clubAdmins?.map(a => a.name).join(", ") || "None Assigned"}
//     </span>
//     {/* Show button only if NO club admins are assigned */}
//     {(!adminData?.clubAdmins || adminData.clubAdmins.length === 0) && (
//       <button 
//         onClick={handleOpenClubAdminModal} 
//         className="btn-gradient text-[10px] uppercase px-4 py-2 mt-2 sm:mt-0 whitespace-nowrap"
//       >
//         + Assign Admin
//       </button>
//     )}
//   </div>
// </div>

//                           <div className="flex flex-col sm:flex-row justify-between p-5 bg-white rounded-2xl border border-gray-100 shadow-sm items-center gap-4">
//                             <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">Teacher Advisor:</span>
//                             <div className="flex items-center gap-3">
//                               <span className="font-bold text-gray-700">
//                                 {adminData?.teacherName && adminData.teacherName !== "Not Assigned" ? adminData.teacherName : <span className="text-gray-400 italic">Not Assigned</span>}
//                               </span>
//                               {(!adminData?.teacherName || adminData.teacherName === "Not Assigned") && (
//                                 <button onClick={handleOpenTeacherModal} className="btn-gradient text-[10px] uppercase px-4 py-2">Assign Now</button>
//                               )}
//                             </div>
//                           </div>

//                           <div className="flex flex-col sm:flex-row justify-between p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
//                             <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">Contact Email:</span>
//                             <span className="font-bold text-purple-400">{adminData?.clubAdmins?.map(a => a.email).join(", ") || "N/A"}</span>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })()}
//               </div>
//             ) : (
//               <div className="h-full flex flex-col items-center justify-center text-gray-300">
//                 <MembersIcon className="w-12 h-12 mb-4" />
//                 <p className="font-bold uppercase tracking-widest text-sm">Select a club to manage</p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }




import { useState, useEffect } from "react";
import axios from "axios";

// members of club
const MembersModal = ({ isOpen, onClose, members, loading, clubName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-11/12 max-w-4xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-display text-2xl font-bold text-[#4C1D95]">
            Members of {clubName}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading members...</p>
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No members found for this club
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {members.map((member) => (
              <div
                key={member.userClubId}
                className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-white hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="font-bold text-purple-600">
                      {member.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">{member.name}</h4>
                    <p className="text-xs text-gray-500">{member.prn}</p>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">Role:</span>
                    <span className={`text-xs font-bold uppercase ${
                      member.role === 'CLUB_ADMIN' ? 'text-purple-600' :
                      member.role === 'TEACHERS' ? 'text-green-600' :
                      'text-blue-600'
                    }`}>
                      {member.role}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">Department:</span>
                    <span className="text-xs font-bold">{member.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">Year:</span>
                    <span className="text-xs font-bold">Year {member.year}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">Tenure:</span>
                    <span className="text-xs font-bold">{member.tenure}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-6 pt-6 border-t border-gray-200 flex justify-between items-center">
          <span className="text-sm text-gray-500">
            Total: {members.length} members
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};


const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-70 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-11/12 max-w-md transform transition-all">
        <h3 className="font-display text-xl font-bold text-red-600 mb-3">{title}</h3>
        <p className="text-gray-700 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition">
            Cancel
          </button>
          <button onClick={onConfirm} className="bg-red-500 hover:bg-red-600 text-white font-medium rounded-full py-2 px-6 transition-all shadow-lg shadow-red-500/30">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const AssignTeacherModal = ({
  isOpen,
  onClose,
  onAssign,
  teacherPrn,
  setTeacherPrn,
  teacherSearchResult,
  onSearchTeacher,
  teacherSearchLoading,
  assignTeacherLoading,
}) => {
  if (!isOpen) return null;

  return (
    // The "backdrop-blur-sm" class handles the blurring of the background
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md transition-all duration-300">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-11/12 max-w-md transform transition-all animate-in fade-in zoom-in duration-200">
        <h3 className="font-display text-2xl font-bold text-[#4C1D95] mb-6">
          Assign Teacher Advisor
        </h3>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-600 mb-2">
            Enter Teacher PRN
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={teacherPrn}
              onChange={(e) => setTeacherPrn(e.target.value)}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 outline-none transition-all placeholder:text-gray-300"
              placeholder="e.g., 2214110270"
            />
            <button
              onClick={onSearchTeacher}
              disabled={teacherSearchLoading || !teacherPrn.trim()}
              className="px-6 py-2.5 bg-purple-700 text-white font-bold rounded-xl hover:bg-purple-700 "
            >
              {teacherSearchLoading ? "..." : "Verify"}
            </button>
          </div>
        </div>

        {/* Search Result Display */}
        {teacherSearchResult && (
          <div className={`mb-6 p-4 rounded-xl border ${
            teacherSearchResult.role === "TEACHERS" 
              ? "bg-green-50 border-green-100" 
              : "bg-red-50 border-red-100"
          }`}>
            <p className="font-bold text-gray-800">{teacherSearchResult.username || teacherSearchResult.name}</p>
            <p className="text-xs text-gray-500 mb-2">{teacherSearchResult.email}</p>
            <p className={`text-xs font-black uppercase tracking-wider ${
              teacherSearchResult.role === "TEACHERS" ? "text-green-600" : "text-red-600"
            }`}>
              {teacherSearchResult.role} {teacherSearchResult.role !== "TEACHERS" && " (Invalid Role)"}
            </p>
          </div>
        )}

        <div className="flex justify-end items-center space-x-3 mt-8">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-bold text-gray-500 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            disabled={assignTeacherLoading}
          >
            Cancel
          </button>
          <button
            onClick={onAssign}
            disabled={!teacherSearchResult || teacherSearchResult.role !== "TEACHERS" || assignTeacherLoading}
            className={`px-8 py-2.5 text-sm font-bold text-white rounded-full transition-all shadow-lg ${
              teacherSearchResult?.role === "TEACHERS" && !assignTeacherLoading
                ? "bg-purple-700 "
                : "bg-purple-700 cursor-not-allowed shadow-none"
            }`}
          >
            {assignTeacherLoading ? "Assigning..." : "Assign Teacher"}
          </button>
        </div>
      </div>
    </div>
  );
};

const AssignClubAdminModal = ({
  isOpen,
  onClose,
  onAssign,
  adminPrn,
  setAdminPrn,
  adminSearchResult,
  onSearchAdmin,
  adminSearchLoading,
  assignAdminLoading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md transition-all duration-300">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-11/12 max-w-md transform transition-all animate-in fade-in zoom-in duration-200">
        <h3 className="font-display text-2xl font-bold text-[#8B5CF6] mb-6">
          Assign Club Admin
        </h3>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-600 mb-2">
            Enter User PRN
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={adminPrn}
              onChange={(e) => setAdminPrn(e.target.value)}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none transition-all placeholder:text-gray-300"
              placeholder="e.g., 2214110270"
            />
            <button
              onClick={onSearchAdmin}
              disabled={adminSearchLoading || !adminPrn.trim()}
              className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {adminSearchLoading ? "..." : "Verify"}
            </button>
          </div>
        </div>

        {/* Search Result Display */}
        {adminSearchResult && (
          <div className={`mb-6 p-4 rounded-xl border ${
            adminSearchResult.role === "USERS" || adminSearchResult.role === "STUDENT"
              ? "bg-green-50 border-green-100" 
              : "bg-red-50 border-red-100"
          }`}>
            <p className="font-bold text-gray-800">{adminSearchResult.username || adminSearchResult.name}</p>
            <p className="text-xs text-gray-500 mb-2">{adminSearchResult.email}</p>
            <p className={`text-xs font-black uppercase tracking-wider ${
              adminSearchResult.role === "USERS" || adminSearchResult.role === "STUDENT" 
                ? "text-green-600" 
                : "text-red-600"
            }`}>
              {adminSearchResult.role} 
              {(adminSearchResult.role !== "USERS" && adminSearchResult.role !== "STUDENT") && " (Invalid Role - Must be Student/User)"}
            </p>
          </div>
        )}

        <div className="flex justify-end items-center space-x-3 mt-8">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-bold text-gray-500 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            disabled={assignAdminLoading}
          >
            Cancel
          </button>
          <button
            onClick={onAssign}
            disabled={
              !adminSearchResult || 
              (adminSearchResult.role !== "USERS" && adminSearchResult.role !== "STUDENT") || 
              assignAdminLoading
            }
            className={`px-8 py-2.5 text-sm font-bold text-white rounded-full transition-all shadow-lg ${
              (adminSearchResult?.role === "USERS" || adminSearchResult?.role === "STUDENT") && !assignAdminLoading
                ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30"
                : "bg-indigo-300 cursor-not-allowed shadow-none"
            }`}
          >
            {assignAdminLoading ? "Assigning..." : "Assign Admin"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Icons
const EditIcon = (props) => (
  <svg {...props} className={`w-5 h-5 transition duration-200 ${props.className || ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);
const DeleteIcon = (props) => (
  <svg {...props} className={`w-5 h-5 transition duration-200 ${props.className || ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);
const MembersIcon = (props) => (
  <svg {...props} className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.05-.97.13C16.51 14.15 18 15.35 18 16v3h5v-2.5c0-2.33-4.67-3.5-7-3.5z" />
  </svg>
);
const EventsIcon = (props) => (
  <svg {...props} className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6a2 2 0 0 0-2-2zm0 16H5V9h14v11zM5 7V6h14v1H5z" />
  </svg>
);
const EstablishedIcon = (props) => (
  <svg {...props} className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2c-3.87 0-7 3.13-7 7v.55c0 .38.16.74.45 1l-.86.86C3.96 11.83 3 12.79 3 14v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4c0-1.21-.96-2.17-1.59-2.82l-.86-.86c.29-.26.45-.62.45-1V9c0-3.87-3.13-7-7-7zm-1 16H8c-.55 0-1-.45-1-1v-2c0-.55.45-1 1-1h3v4zm6-4h-3v4h3c.55 0 1-.45 1-1v-2c0-.55-.45-1-1-1zm-4-9c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z" />
  </svg>
);

// ----------------------------------------------------------------
// 2. MAIN COMPONENT
// ----------------------------------------------------------------

export default function ManageClubs() {
  const [clubs, setClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adminData, setAdminData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clubToDelete, setClubToDelete] = useState(null);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [teacherPrn, setTeacherPrn] = useState("");
  const [teacherSearchResult, setTeacherSearchResult] = useState(null);
  const [teacherSearchLoading, setTeacherSearchLoading] = useState(false);
  const [assignTeacherLoading, setAssignTeacherLoading] = useState(false);
  const [showAddClubModal, setShowAddClubModal] = useState(false);
  const [newClub, setNewClub] = useState({ name: "", clubDesc: "" });
  const [addClubLoading, setAddClubLoading] = useState(false);
  // Add these state variables
const [showClubAdminModal, setShowClubAdminModal] = useState(false);
const [adminPrn, setAdminPrn] = useState("");
const [adminSearchResult, setAdminSearchResult] = useState(null);
const [adminSearchLoading, setAdminSearchLoading] = useState(false);
const [assignAdminLoading, setAssignAdminLoading] = useState(false);
const [membersData, setMembersData] = useState([]);
const [membersLoading, setMembersLoading] = useState(false);
const [showMembersModal, setShowMembersModal] = useState(false);

  const customStyles = `
    .font-display { font-family: 'Outfit', sans-serif; }
    .btn-gradient {
        background-image: linear-gradient(90deg, #A78BFA 0%, #8B5CF6 100%);
        color: white;
        font-weight: 500;
        border-radius: 9999px;
        padding: 0.5rem 1.5rem;
        transition: all 0.25s ease;
        box-shadow: 0 5px 15px rgba(139, 92, 246, 0.18);
    }
    .btn-gradient:hover { transform: translateY(-2px); }
    .club-item { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
    .club-item:hover { transform: translateX(8px); }
    .club-item.active {
        position: relative;
        background: white;
        box-shadow: 0 10px 25px rgba(139, 92, 246, 0.15);
    }
    .club-item.active::before {
        content: '';
        position: absolute;
        top: 15%; bottom: 15%; left: 0;
        width: 4px;
        border-radius: 0 4px 4px 0;
        background: #8B5CF6;
    }
    .stat-card {
        transition: all 0.3s ease-out;
        background: white;
        border: 1px solid #f3f4f6;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
    }
    .stat-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 12px 30px rgba(139, 92, 246, 0.1);
    }
  `;


  // fetch users by club name
  const fetchMembersByClubName = async (clubName) => {
  if (!clubName) return;
  
  setMembersLoading(true);
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(
      `http://localhost:8080/api/user-clubs/club/${clubName}`,
      {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response?.data?.success) {
      setMembersData(response.data.data || []);
    } else {
      setMembersData([]);
    }
  } catch (err) {
    console.error("Error fetching members:", err);
    setMembersData([]);
  } finally {
    setMembersLoading(false);
  }
};

const handleMembersHover = async () => {
  if (selectedClub?.clubName) {
    await fetchMembersByClubName(selectedClub.clubName);
    setShowMembersModal(true);
  }
};


  // API Handlers
  const fetchClubs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:8080/api/clubs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response?.data?.success) {
        const fetchedClubs = response.data.data || [];
        setClubs(fetchedClubs);
        if (fetchedClubs.length > 0) {
          const first = fetchedClubs[0];
          setSelectedClub(first);
          fetchAdminData(first.clubId);
        }
      }
    } catch (err) { setError("Failed to fetch clubs."); }
    finally { setLoading(false); }
  };

  const fetchAdminData = async (clubId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://localhost:8080/api/clubs/${clubId}/admin`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response?.data?.success) {
        const clubData = response.data.data || {};
        const adminsWithEmail = await Promise.all(
          (clubData.clubAdmins || []).map(async (admin) => {
            const email = await fetchAdminEmail(admin.prn);
            return { ...admin, email: email || "N/A" };
          })
        );
        setAdminData({ ...clubData, clubAdmins: adminsWithEmail });
      }
    } catch (err) { console.error(err); }
  };

  const fetchAdminEmail = async (prn) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://localhost:8080/api/users/${prn}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response?.data?.email || null;
    } catch (err) { return null; }
  };

  useEffect(() => { fetchClubs(); }, []);

  // ----------------------------------------------------------------
  // TEACHER ASSIGNMENT LOGIC (MERGED FROM YOUR CODE)
  // ----------------------------------------------------------------
  const handleOpenTeacherModal = () => {
    setShowTeacherModal(true);
    setTeacherPrn("");
    setTeacherSearchResult(null);
  };

  const handleSearchTeacher = async () => {
    if (!teacherPrn.trim()) return;
    setTeacherSearchLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://localhost:8080/api/users/${teacherPrn}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response?.data) {
        setTeacherSearchResult(response.data);
      } else {
        setTeacherSearchResult(null);
      }
    } catch (err) {
      console.error("Error searching teacher:", err);
      setTeacherSearchResult(null);
    } finally {
      setTeacherSearchLoading(false);
    }
  };

  const handleAssignTeacher = async () => {
    if (!teacherSearchResult || !selectedClub || teacherSearchResult.role !== "TEACHERS") return;

    setAssignTeacherLoading(true);
    try {
      const token = localStorage.getItem("token");
      const currentYear = new Date().getFullYear();
      const tenure = `${currentYear}-${currentYear + 1}`;

      const payload = {
        prn: teacherPrn,
        clubId: selectedClub.clubId,
        role: "TEACHERS",
        tenure: tenure
      };

      const response = await axios.post("http://localhost:8080/api/user-clubs", payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response?.data?.success) {
        alert("Teacher assigned successfully!");
        fetchAdminData(selectedClub.clubId); // Refresh UI
        setShowTeacherModal(false);
      } else {
        alert("Failed to assign teacher.");
      }
    } catch (err) {
      alert("Error during assignment. Check console.");
    } finally {
      setAssignTeacherLoading(false);
    }
  };


  // club admin searches
  const handleOpenClubAdminModal = () => {
  setShowClubAdminModal(true);
  setAdminPrn("");
  setAdminSearchResult(null);
};

const handleSearchAdmin = async () => {
  if (!adminPrn.trim()) return;
  setAdminSearchLoading(true);
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`http://localhost:8080/api/users/${adminPrn}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (response?.data) {
      setAdminSearchResult(response.data);
    } else {
      setAdminSearchResult(null);
    }
  } catch (err) {
    console.error("Error searching user:", err);
    setAdminSearchResult(null);
  } finally {
    setAdminSearchLoading(false);
  }
};

const handleAssignClubAdmin = async () => {
  if (!adminSearchResult || !selectedClub) return;
  
  // Check if user role is valid for club admin
  const isValidRole = adminSearchResult.role === "USERS" || adminSearchResult.role === "STUDENT";
  if (!isValidRole) {
    alert("Only regular users/students can be assigned as club admins");
    return;
  }

  setAssignAdminLoading(true);
  try {
    const token = localStorage.getItem("token");
    const currentYear = new Date().getFullYear();
    const tenure = `${currentYear}-${currentYear + 1}`;

    const payload = {
      prn: adminPrn,
      clubId: selectedClub.clubId,
      role: "CLUB_ADMIN", // This is the key difference from teacher assignment
      tenure: tenure
    };

    const response = await axios.post("http://localhost:8080/api/user-clubs", payload, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response?.data?.success) {
      alert("Club admin assigned successfully!");
      fetchAdminData(selectedClub.clubId); // Refresh UI
      setShowClubAdminModal(false);
    } else {
      alert("Failed to assign club admin.");
    }
  } catch (err) {
    console.error("Assignment error:", err);
    alert("Error during assignment. Check console.");
  } finally {
    setAssignAdminLoading(false);
  }
};
  // Club Handlers
  const handleAddClub = async () => {
    setAddClubLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post("http://localhost:8080/api/clubs", newClub, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        alert("Club created!");
        setShowAddClubModal(false);
        setNewClub({ name: "", clubDesc: "" });
        fetchClubs();
      }
    } catch (err) { alert("Error creating club"); }
    finally { setAddClubLoading(false); }
  };

  const handleSelectClub = (club) => {
    setSelectedClub(club);
    fetchAdminData(club.clubId);
  };

  const executeDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8080/api/clubs/${clubToDelete.clubId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Deleted!");
      fetchClubs();
    } catch (err) { alert("Delete failed"); }
    finally { setIsModalOpen(false); }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    return isNaN(d) ? dateString : d.toLocaleDateString();
  };

  const generateRandomDetails = (club) => ({
    description: club?.clubDesc || "A vibrant community of enthusiasts passionate about technology and innovation.",
    upcomingEvents: Math.floor(Math.random() * 8) + 3,
    established: club?.createdAt ? new Date(club.createdAt).getFullYear() : 2024,
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen p-6 sm:p-10 flex items-start justify-center" style={{ background: "radial-gradient(circle at top left, #F2EEFF, #FDFCFE 60%, #F8F5FF)" }}>
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />

      {/* MODALS */}
      {showAddClubModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-2xl font-bold text-[#4C1D95] mb-6">Create New Club</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Club Name" value={newClub.name} onChange={(e) => setNewClub({ ...newClub, name: e.target.value })} className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-purple-400" />
              <textarea placeholder="Description" value={newClub.clubDesc} onChange={(e) => setNewClub({ ...newClub, clubDesc: e.target.value })} className="w-full px-4 py-3 border rounded-xl h-32 outline-none focus:ring-2 focus:ring-purple-400" />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button className="px-6 py-2 bg-gray-100 rounded-full font-medium" onClick={() => setShowAddClubModal(false)}>Cancel</button>
              <button className="btn-gradient px-8" onClick={handleAddClub} disabled={addClubLoading}>{addClubLoading ? "Creating..." : "Create Club"}</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal isOpen={isModalOpen} title="Confirm Deletion" message={`Permanently delete "${clubToDelete?.clubName}"?`} onConfirm={executeDelete} onCancel={() => setIsModalOpen(false)} />
      
      <AssignTeacherModal 
        isOpen={showTeacherModal} onClose={() => setShowTeacherModal(false)} onAssign={handleAssignTeacher}
        teacherPrn={teacherPrn} setTeacherPrn={setTeacherPrn} teacherSearchResult={teacherSearchResult}
        onSearchTeacher={handleSearchTeacher} teacherSearchLoading={teacherSearchLoading} assignTeacherLoading={assignTeacherLoading}
      />

      <AssignClubAdminModal 
  isOpen={showClubAdminModal} 
  onClose={() => setShowClubAdminModal(false)} 
  onAssign={handleAssignClubAdmin}
  adminPrn={adminPrn} 
  setAdminPrn={setAdminPrn} 
  adminSearchResult={adminSearchResult}
  onSearchAdmin={handleSearchAdmin} 
  adminSearchLoading={adminSearchLoading} 
  assignAdminLoading={assignAdminLoading}
/>

{/* members of club modal */}
<MembersModal 
  isOpen={showMembersModal}
  onClose={() => setShowMembersModal(false)}
  members={membersData}
  loading={membersLoading}
  clubName={selectedClub?.clubName || ""}
/>

      {/* DASHBOARD CONTAINER */}
      <div className="w-full max-w-7xl bg-white bg-opacity-95 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-md">
        <header className="p-8 border-b border-gray-100 bg-gradient-to-r from-[#A78BFA] to-[#8B5CF6] text-white rounded-t-3xl shadow-inner">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="text-left w-full sm:w-auto">
              <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight drop-shadow-md">ClubLink Stellar Dashboard</h1>
              <p className="mt-2 text-lg font-light opacity-90">Manage all college clubs with ease and style.</p>
            </div>
            <button className="flex-shrink-0 bg-white text-purple-700 font-bold rounded-full py-3 px-8 shadow-xl hover:bg-purple-50 hover:scale-105 transition-all duration-300" onClick={() => setShowAddClubModal(true)}>+ Add New Club</button>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row min-h-[70vh]">
          {/* LEFT PANEL */}
          <div className="lg:w-1/3 border-r border-gray-100 flex flex-col p-6 bg-gray-50/20">
            <h2 className="font-display text-2xl font-bold text-[#4C1D95] mb-2 px-2">Your Clubs</h2>
            <div className="overflow-y-auto max-h-[60vh] lg:max-h-full space-y-2 pr-2">
              {clubs.map((club) => (
                <div key={club.clubId} className={`club-item p-4 rounded-xl cursor-pointer ${selectedClub?.clubId === club.clubId ? "active" : "hover:bg-white"}`} onClick={() => handleSelectClub(club)}>
                  <div className="flex flex-col">
                    <span className={`font-display text-lg font-bold ${selectedClub?.clubId === club.clubId ? "text-[#4C1D95]" : "text-gray-700 uppercase tracking-wide"}`}>{club.clubName}</span>
                    <div className="mt-2 flex items-center">
                      <div className={`px-2 py-0.5 rounded-md flex items-center gap-1.5 ${club.isActive ? "bg-green-50" : "bg-gray-100"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${club.isActive ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}></span>
                        <span className={`text-[10px] font-bold uppercase ${club.isActive ? "text-green-600" : "text-gray-500"}`}>{club.isActive ? "Active" : "Inactive"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="lg:w-2/3 p-8 sm:p-12">
            {selectedClub ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-8 mb-8 gap-4">
                  <div>
                    <h2 className="text-5xl font-black text-[#4C1D95] tracking-tight">{selectedClub.clubName}</h2>
                    <p className="text-gray-400 mt-2 font-medium">Dashboard Overview • Founded {formatDate(selectedClub.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => alert("Edit feature coming soon!")} className="p-3 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-600 hover:text-white transition-colors"><EditIcon /></button>
                    <button onClick={() => { setClubToDelete(selectedClub); setIsModalOpen(true); }} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-colors"><DeleteIcon /></button>
                  </div>
                </div>

                {(() => {
                  const details = generateRandomDetails(selectedClub);
                  return (
                    <div className="space-y-10">
                      {/* STATS */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
  className="stat-card p-6 rounded-2xl cursor-pointer hover:shadow-xl transition-all duration-300 group relative"
  onMouseEnter={handleMembersHover}
  onClick={() => setShowMembersModal(true)}
  title="Click or hover to view members"
>
  <MembersIcon className="text-purple-500 mb-3 group-hover:scale-110 transition-transform" /> 
  <span className="text-4xl font-black text-purple-600 group-hover:text-purple-700">
    {adminData?.totalCount || 0}
  </span> 
  <p className="text-xs font-bold uppercase text-gray-400 group-hover:text-purple-400">
    Active Members
  </p>
  {/* Hover indicator */}
  <div className="absolute inset-0 border-2 border-transparent group-hover:border-purple-200 rounded-2xl pointer-events-none"></div>
</div>
                        <div className="stat-card p-6 rounded-2xl"><EventsIcon className="text-teal-500 mb-3" /> <span className="text-4xl font-black text-teal-600">{details.upcomingEvents}</span> <p className="text-xs font-bold uppercase text-gray-400">Planned Events</p></div>
                      </div>

                      {/* LEADERSHIP */}
                      <div className="space-y-6">
                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2"><span className="w-1 h-6 bg-teal-500 rounded-full"></span> Leadership & Contact</h3>
                        <div className="grid gap-4">
               <div className="flex flex-col sm:flex-row justify-between p-5 bg-white rounded-2xl border border-gray-100 shadow-sm items-center gap-4">
  <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">Club Admins:</span>
  <div className="flex flex-col sm:flex-row items-center gap-3">
    <span className="font-bold text-[#4C1D95] text-center sm:text-left">
      {adminData?.clubAdmins?.map(a => a.name).join(", ") || "None Assigned"}
    </span>
    {/* Show button only if NO club admins are assigned */}
    {(!adminData?.clubAdmins || adminData.clubAdmins.length === 0) && (
      <button 
        onClick={handleOpenClubAdminModal} 
        className="btn-gradient text-[10px] uppercase px-4 py-2 mt-2 sm:mt-0 whitespace-nowrap"
      >
        + Assign Admin
      </button>
    )}
  </div>
</div>

                          <div className="flex flex-col sm:flex-row justify-between p-5 bg-white rounded-2xl border border-gray-100 shadow-sm items-center gap-4">
                            <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">Teacher Advisor:</span>
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-gray-700">
                                {adminData?.teacherName && adminData.teacherName !== "Not Assigned" ? adminData.teacherName : <span className="text-gray-400 italic">Not Assigned</span>}
                              </span>
                              {(!adminData?.teacherName || adminData.teacherName === "Not Assigned") && (
                                <button onClick={handleOpenTeacherModal} className="btn-gradient text-[10px] uppercase px-4 py-2">Assign Now</button>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row justify-between p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">Contact Email:</span>
                            <span className="font-bold text-purple-400">{adminData?.clubAdmins?.map(a => a.email).join(", ") || "N/A"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-300">
                <MembersIcon className="w-12 h-12 mb-4" />
                <p className="font-bold uppercase tracking-widest text-sm">Select a club to manage</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}