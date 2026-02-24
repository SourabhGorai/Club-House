// import { useState, useEffect } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// const MembersModal = ({ isOpen, onClose, members, loading, clubName }) => {
//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md">
      
//       <div className="bg-white rounded-2xl shadow-2xl w-11/12 max-w-4xl max-h-[80vh] flex flex-col overflow-hidden">
        
//         {/* HEADER */}
//         <div className="flex justify-between items-center p-8 pb-4">
//           <h3 className="font-display text-2xl font-bold text-[#4C1D95]">
//             Members of {clubName}
//           </h3>
//           <button
//             onClick={onClose}
//             className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
//           >
//             ✕
//           </button>
//         </div>

//         {/* SCROLLABLE CONTENT ONLY */}
//         <div className="flex-1 overflow-y-auto px-8">
//           {loading ? (
//             <div className="text-center py-8">
//               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
//               <p className="mt-2 text-gray-500">Loading members...</p>
//             </div>
//           ) : members.length === 0 ? (
//             <div className="text-center py-8 text-gray-500">
//               No members found for this club
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6">
//               {members.map((member) => (
//                 <div
//                   key={member.userClubId}
//                   className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-white hover:shadow-md transition-all"
//                 >
//                   <div className="flex items-center gap-3">
//                     <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
//                       <span className="font-bold text-purple-600">
//                         {member.name.charAt(0)}
//                       </span>
//                     </div>
//                     <div>
//                       <h4 className="font-bold text-gray-800">{member.name}</h4>
//                       <p className="text-xs text-gray-500">{member.prn}</p>
//                     </div>
//                   </div>

//                   <div className="mt-3 space-y-1">
//                     <div className="flex justify-between">
//                       <span className="text-xs text-gray-500">Role:</span>
//                       <span
//                         className={`text-xs font-bold uppercase ${
//                           member.role === "CLUB_ADMIN"
//                             ? "text-purple-600"
//                             : member.role === "TEACHERS"
//                             ? "text-green-600"
//                             : "text-blue-600"
//                         }`}
//                       >
//                         {member.role.replace(/_/g, ' ')}
//                       </span>
//                     </div>

//                     <div className="flex justify-between">
//                       <span className="text-xs text-gray-500">
//                         Department:
//                       </span>
//                       <span className="text-xs font-bold">
//                         {member.department}
//                       </span>
//                     </div>

//                     <div className="flex justify-between">
//                       <span className="text-xs text-gray-500">Year:</span>
//                       <span className="text-xs font-bold">
//                         Year {member.year}
//                       </span>
//                     </div>

//                     <div className="flex justify-between">
//                       <span className="text-xs text-gray-500">Tenure:</span>
//                       <span className="text-xs font-bold">
//                         {member.tenure}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* FOOTER */}
//         <div className="px-8 py-4 border-t border-gray-200 flex justify-between items-center bg-gray-50">
//           <span className="text-sm text-gray-500">
//             Total: {members.length} members
//           </span>
//           <button
//             onClick={onClose}
//             className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200"
//           >
//             Close
//           </button>
//         </div>

//       </div>
//     </div>
//   );
// };


// const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel, isLoading }) => {
//   if (!isOpen) return null;
//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md">
//       <div className="bg-white rounded-2xl shadow-2xl p-6 w-11/12 max-w-md transform transition-all border border-gray-200">
//         <h3 className="font-display text-xl font-bold text-gray-800 mb-3">{title}</h3>
//         <p className="text-gray-600 mb-6">{message}</p>
//         <div className="flex justify-end space-x-3">
//           <button 
//             onClick={onCancel} 
//             className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition"
//             disabled={isLoading}
//           >
//             Cancel
//           </button>
//           <button 
//             onClick={onConfirm} 
//             className="bg-gray-700 hover:bg-gray-800 text-white font-medium rounded-full py-2 px-6 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
//             disabled={isLoading}
//           >
//             {isLoading ? "Deleting..." : "Delete"}
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
//               className="px-6 py-2.5 bg-purple-700 text-white font-bold rounded-xl hover:bg-purple-800"
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
//               {teacherSearchResult.role} {teacherSearchResult.role !== "TEACHERS" && " (No Teacher with this prn)"}
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
//                 ? "bg-purple-700 hover:bg-purple-800"
//                 : "bg-purple-300 cursor-not-allowed shadow-none"
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
//               {(adminSearchResult.role !== "USERS" && adminSearchResult.role !== "STUDENT") && " (No user with this prn)"}
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

// // ----------------------------------------------------------------
// // 2. MAIN COMPONENT
// // ----------------------------------------------------------------

// export default function ManageClubs() {
//   const navigate = useNavigate();
  
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
//   const [showClubAdminModal, setShowClubAdminModal] = useState(false);
//   const [adminPrn, setAdminPrn] = useState("");
//   const [adminSearchResult, setAdminSearchResult] = useState(null);
//   const [adminSearchLoading, setAdminSearchLoading] = useState(false);
//   const [assignAdminLoading, setAssignAdminLoading] = useState(false);
//   const [membersData, setMembersData] = useState([]);
//   const [membersLoading, setMembersLoading] = useState(false);
//   const [showMembersModal, setShowMembersModal] = useState(false);
//   const [deleteLoading, setDeleteLoading] = useState(false);

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

//   // fetch users by club name
//   const fetchMembersByClubName = async (clubName) => {
//     if (!clubName) return;
    
//     setMembersLoading(true);
//     try {
//       const token = localStorage.getItem("token");
//       const response = await axios.get(
//         `http://localhost:8080/api/user-clubs/club/${clubName}`,
//         {
//           headers: { 
//             Authorization: `Bearer ${token}`,
//             'Content-Type': 'application/json'
//           }
//         }
//       );
      
//       if (response?.data?.success) {
//         setMembersData(response.data.data || []);
//       } else {
//         setMembersData([]);
//       }
//     } catch (err) {
//       console.error("Error fetching members:", err);
//       setMembersData([]);
//     } finally {
//       setMembersLoading(false);
//     }
//   };

//   const handleMembersClick = async () => {
//     if (selectedClub?.clubName) {
//       await fetchMembersByClubName(selectedClub.clubName);
//       setShowMembersModal(true);
//     }
//   };

//   // API Handlers
//   const fetchClubs = async () => {
//     setLoading(true);
//     try {
//       const token = localStorage.getItem("token");
//       const response = await axios.get("http://localhost:8080/api/clubs", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       console.log(response)
//       if (response?.data?.success) {
//         const fetchedClubs = response.data.data || [];
//         setClubs(fetchedClubs);
//         if (fetchedClubs.length > 0) {
//           const first = fetchedClubs[0];
//           setSelectedClub(first);
//           fetchAdminData(first.clubId);
//         } else {
//           setSelectedClub(null);
//           setAdminData(null);
//         }
//       }
//     } catch (err) { 
//       console.error("Failed to fetch clubs:", err);
//       setError("Failed to fetch clubs."); 
//     }
//     finally { setLoading(false); }
//   };

//   const fetchAdminData = async (clubId) => {
//     try {
//       const token = localStorage.getItem("token");
//       const response = await axios.get(`http://localhost:8080/api/clubs/${clubId}/admin`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       console.log(response)
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

//   // TEACHER ASSIGNMENT LOGIC
//   const handleOpenTeacherModal = () => {
//     setShowTeacherModal(true);
//     setTeacherPrn("");
//     setTeacherSearchResult(null);
//   };

// const handleSearchTeacher = async () => {
//   if (!teacherPrn.trim()) return;
//   setTeacherSearchLoading(true);
//   try {
//     const token = localStorage.getItem("token");
//     const response = await axios.get(`http://localhost:8080/api/users/${teacherPrn}`, {
//       headers: { Authorization: `Bearer ${token}` }
//     });
    
//     if (response?.data) {
//       // Check if the response actually contains user data
//       // You might need to adjust this condition based on your API response structure
//       if (response.data.message === "User not found" || !response.data.prn) {
//         setTeacherSearchResult({ notFound: true, message: "No such teacher found" });
//       } else {
//         setTeacherSearchResult(response.data);
//       }
//     } else {
//       setTeacherSearchResult({ notFound: true, message: "No such teacher found" });
//     }
//   } catch (err) {
//     console.error("Error searching teacher:", err);
//     // Handle 404 or other errors
//     if (err.response?.status === 404) {
//       setTeacherSearchResult({ notFound: true, message: "No such teacher found" });
//     } else {
//       setTeacherSearchResult({ notFound: true, message: "Error searching for teacher" });
//     }
//   } finally {
//     setTeacherSearchLoading(false);
//   }
// };

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
//         fetchAdminData(selectedClub.clubId);
//         setShowTeacherModal(false);
//       } else {
//         alert("Failed to assign teacher.");
//       }
//     } catch (err) {
//       console.error("Error assigning teacher:", err);
//       alert("Error during assignment. Check console.");
//     } finally {
//       setAssignTeacherLoading(false);
//     }
//   };

//   // club admin searches
//   const handleOpenClubAdminModal = () => {
//     setShowClubAdminModal(true);
//     setAdminPrn("");
//     setAdminSearchResult(null);
//   };

// const handleSearchAdmin = async () => {
//   if (!adminPrn.trim()) return;
//   setAdminSearchLoading(true);
//   try {
//     const token = localStorage.getItem("token");
//     const response = await axios.get(`http://localhost:8080/api/users/${adminPrn}`, {
//       headers: { Authorization: `Bearer ${token}` }
//     });
    
//     if (response?.data) {
//       // Check if the response actually contains user data
//       if (response.data.message === "User not found" || !response.data.prn) {
//         setAdminSearchResult({ notFound: true, message: "No such user found" });
//       } else {
//         setAdminSearchResult(response.data);
//       }
//     } else {
//       setAdminSearchResult({ notFound: true, message: "No such user found" });
//     }
//   } catch (err) {
//     console.error("Error searching user:", err);
//     // Handle 404 or other errors
//     if (err.response?.status === 404) {
//       setAdminSearchResult({ notFound: true, message: "No such user found" });
//     } else {
//       setAdminSearchResult({ notFound: true, message: "Error searching for user" });
//     }
//   } finally {
//     setAdminSearchLoading(false);
//   }
// };

//   const handleAssignClubAdmin = async () => {
//     if (!adminSearchResult || !selectedClub) return;
    
//     const isValidRole = adminSearchResult.role === "USERS" || adminSearchResult.role === "STUDENT";
//     if (!isValidRole) {
//       alert("Only regular users/students can be assigned as club admins");
//       return;
//     }

//     setAssignAdminLoading(true);
//     try {
//       const token = localStorage.getItem("token");
//       const currentYear = new Date().getFullYear();
//       const tenure = `${currentYear}-${currentYear + 1}`;

//       const payload = {
//         prn: adminPrn,
//         clubId: selectedClub.clubId,
//         role: "CLUB_ADMIN",
//         tenure: tenure
//       };

//       const response = await axios.post("http://localhost:8080/api/user-clubs", payload, {
//         headers: { Authorization: `Bearer ${token}` }
//       });

//       if (response?.data?.success) {
//         alert("Club admin assigned successfully!");
//         fetchAdminData(selectedClub.clubId);
//         setShowClubAdminModal(false);
//       } else {
//         alert("Failed to assign club admin.");
//       }
//     } catch (err) {
//       console.error("Assignment error:", err);
//       alert("Error during assignment. Check console.");
//     } finally {
//       setAssignAdminLoading(false);
//     }
//   };
  
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
//         await fetchClubs();
//       }
//     } catch (err) { 
//       console.error("Error creating club:", err);
//       alert("Error creating club"); 
//     }
//     finally { setAddClubLoading(false); }
//   };

//   const handleSelectClub = (club) => {
//     setSelectedClub(club);
//     fetchAdminData(club.clubId);
//   };

//   const handleGoBack = () => {
//     navigate(-1);
//   };

//   const handleDeleteClub = async () => {
//     if (!clubToDelete) return;
    
//     setDeleteLoading(true);
//     try {
//       const token = localStorage.getItem("token");
//       const response = await axios.delete("http://localhost:8080/api/clubs", {
//         headers: { 
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         },
//         params: { 
//           name: clubToDelete.clubName
//         }
//       });

//       if (response?.data?.success) {
//         alert(response.data.message || "Club deleted successfully");
        
//         await fetchClubs();
        
//         if (clubs.length > 1) {
//           const remainingClubs = clubs.filter(club => club.clubId !== clubToDelete.clubId);
//           if (remainingClubs.length > 0) {
//             setSelectedClub(remainingClubs[0]);
//             fetchAdminData(remainingClubs[0].clubId);
//           }
//         }
        
//         setIsModalOpen(false);
//         setClubToDelete(null);
//       }
//     } catch (err) {
//       console.error("Delete club error:", err);
//       const errorMessage = err.response?.data?.message || "Failed to delete club";
//       alert(`Delete failed: ${errorMessage}`);
//     } finally {
//       setDeleteLoading(false);
//     }
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
//               <input 
//                 type="text" 
//                 placeholder="Club Name" 
//                 value={newClub.name} 
//                 onChange={(e) => setNewClub({ ...newClub, name: e.target.value })} 
//                 className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-purple-400" 
//               />
//               <textarea 
//                 placeholder="Description" 
//                 value={newClub.clubDesc} 
//                 onChange={(e) => setNewClub({ ...newClub, clubDesc: e.target.value })} 
//                 className="w-full px-4 py-3 border rounded-xl h-32 outline-none focus:ring-2 focus:ring-purple-400" 
//               />
//             </div>
//             <div className="flex justify-end gap-3 mt-6">
//               <button 
//                 className="px-6 py-2 bg-gray-100 rounded-full font-medium" 
//                 onClick={() => setShowAddClubModal(false)}
//               >
//                 Cancel
//               </button>
//               <button 
//                 className="btn-gradient px-8" 
//                 onClick={handleAddClub} 
//                 disabled={addClubLoading}
//               >
//                 {addClubLoading ? "Creating..." : "Create Club"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       <ConfirmationModal 
//         isOpen={isModalOpen} 
//         title="Confirm Deletion" 
//         message={`Permanently delete "${clubToDelete?.clubName}"? This action cannot be undone.`} 
//         onConfirm={handleDeleteClub}
//         onCancel={() => {
//           setIsModalOpen(false);
//           setClubToDelete(null);
//         }} 
//         isLoading={deleteLoading}
//       />
      
//       <AssignTeacherModal 
//         isOpen={showTeacherModal} 
//         onClose={() => setShowTeacherModal(false)} 
//         onAssign={handleAssignTeacher}
//         teacherPrn={teacherPrn} 
//         setTeacherPrn={setTeacherPrn} 
//         teacherSearchResult={teacherSearchResult}
//         onSearchTeacher={handleSearchTeacher} 
//         teacherSearchLoading={teacherSearchLoading} 
//         assignTeacherLoading={assignTeacherLoading}
//       />

//       <AssignClubAdminModal 
//         isOpen={showClubAdminModal} 
//         onClose={() => setShowClubAdminModal(false)} 
//         onAssign={handleAssignClubAdmin}
//         adminPrn={adminPrn} 
//         setAdminPrn={setAdminPrn} 
//         adminSearchResult={adminSearchResult}
//         onSearchAdmin={handleSearchAdmin} 
//         adminSearchLoading={adminSearchLoading} 
//         assignAdminLoading={assignAdminLoading}
//       />

//       <MembersModal 
//         isOpen={showMembersModal}
//         onClose={() => setShowMembersModal(false)}
//         members={membersData}
//         loading={membersLoading}
//         clubName={selectedClub?.clubName || ""}
//       />

//       {/* DASHBOARD CONTAINER */}
//       <div className="w-full max-w-7xl bg-white bg-opacity-95 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-md">
//         <header className="p-8 border-b border-gray-100 bg-gradient-to-r from-[#A78BFA] to-[#8B5CF6] text-white rounded-t-3xl shadow-inner">
//           <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
//             <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 w-full lg:w-auto">
//               {/* Glassmorphism Back Button - Premium Style */}
//             <button
//               onClick={handleGoBack}
//               className="group flex items-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-lg border border-white/20 hover:border-white/40 text-[#4C1D95] font-medium rounded-full py-2.5 px-5 transition-all duration-300 shadow-lg hover:shadow-xl"
//               style={{
//                 background: "rgba(255, 255, 255, 0.7)",
//                 backdropFilter: "blur(8px)"
//               }}
//             >
//               <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#8B5CF6]/10 group-hover:bg-[#8B5CF6]/20 transition-all duration-300">
//                 <svg className="w-3.5 h-3.5 text-[#8B5CF6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
//                 </svg>
//               </div>
//               {/* <span className="text-sm font-semibold tracking-wide text-[#4C1D95]">Back to Dashboard</span> */}
//             </button>
              
//               <div className="text-left">
//                 <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight drop-shadow-md">
//                   ClubLink Stellar Dashboard
//                 </h1>
//                 <p className="mt-2 text-base sm:text-lg font-light opacity-90">
//                   Manage all college clubs with ease and style.
//                 </p>
//               </div>
//             </div>
            
//             <button 
//               className="flex-shrink-0 bg-white text-purple-700 font-bold rounded-full py-3 px-8 shadow-xl hover:bg-purple-50 hover:scale-105 transition-all duration-300 w-full sm:w-auto" 
//               onClick={() => setShowAddClubModal(true)}
//             >
//               + Add New Club
//             </button>
//           </div>
//         </header>

//         <div className="flex flex-col lg:flex-row min-h-[70vh]">
//           {/* LEFT PANEL */}
//           <div className="lg:w-1/3 border-r border-gray-100 flex flex-col p-6 bg-gray-50/20">
//             <h2 className="font-display text-2xl font-bold text-[#4C1D95] mb-2 px-2">Your Clubs</h2>
//             <div className="overflow-y-auto max-h-[60vh] lg:max-h-full space-y-2 pr-2">
//               {clubs.map((club) => (
//                 <div 
//                   key={club.clubId} 
//                   className={`club-item p-4 rounded-xl cursor-pointer ${selectedClub?.clubId === club.clubId ? "active" : "hover:bg-white"}`} 
//                   onClick={() => handleSelectClub(club)}
//                 >
//                   <div className="flex flex-col">
//                     <span className={`font-display text-lg font-bold ${selectedClub?.clubId === club.clubId ? "text-[#4C1D95]" : "text-gray-700 uppercase tracking-wide"}`}>
//                       {club.clubName}
//                     </span>
//                     <div className="mt-2 flex items-center">
//                       <div className={`px-2 py-0.5 rounded-md flex items-center gap-1.5 ${club.isActive ? "bg-green-50" : "bg-gray-100"}`}>
//                         <span className={`w-1.5 h-1.5 rounded-full ${club.isActive ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}></span>
//                         <span className={`text-[10px] font-bold uppercase ${club.isActive ? "text-green-600" : "text-gray-500"}`}>
//                           {club.isActive ? "Active" : "Inactive"}
//                         </span>
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
//                     <h2 className="text-5xl font-black text-[#8B5CF6] tracking-tight">{selectedClub.clubName}</h2>
//                     <p className="text-gray-400 mt-2 font-medium">Description: {selectedClub.clubDesc}</p>
//                     <p className="text-gray-400 mt-2 font-medium">Club Added on {formatDate(selectedClub.createdAt)}</p>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <button 
//                       onClick={() => { 
//                         setClubToDelete(selectedClub); 
//                         setIsModalOpen(true); 
//                       }} 
//                       className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-colors"
//                       disabled={deleteLoading}
//                     >
//                       <DeleteIcon />
//                     </button>
//                   </div>
//                 </div>

//                 {(() => {
//                   const details = generateRandomDetails(selectedClub);
//                   return (
//                     <div className="space-y-10">
//                       {/* STATS */}
//                       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                         <div 
//                           className="stat-card p-6 rounded-2xl cursor-pointer hover:shadow-xl transition-all duration-300 group"
//                           onClick={handleMembersClick}
//                         >
//                           <MembersIcon className="text-teal-600 mb-3 group-hover:scale-110 transition-transform" /> 
//                           <span className="text-4xl font-black text-teal-600 group-hover:text-teal-700">
//                             {adminData?.totalCount || 0}
//                           </span> 
//                           <p className="text-xs font-bold uppercase text-gray-400 group-hover:text-teal-400">
//                             Active Members
//                           </p>
//                         </div>
//                         <div className="stat-card p-6 rounded-2xl">
//                           <EventsIcon className="text-teal-500 mb-3" /> 
//                           <span className="text-4xl font-black text-teal-600">{details.upcomingEvents}</span> 
//                           <p className="text-xs font-bold uppercase text-gray-400">Planned Events</p>
//                         </div>
//                       </div>

//                       {/* LEADERSHIP */}
//                       <div className="space-y-6">
//                         <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
//                           <span className="w-1 h-6 bg-teal-500 rounded-full"></span> Leadership & Contact
//                         </h3>
//                         <div className="grid gap-4">
//                           <div className="flex flex-col sm:flex-row justify-between p-5 bg-white rounded-2xl border border-gray-100 shadow-sm items-center gap-4">
//                             <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">Club Admins:</span>
//                             <div className="flex flex-col sm:flex-row items-center gap-3">
//                               <span className="font-bold text-black text-center sm:text-left">
//                                 {adminData?.clubAdmins?.map(a => a.name).join(", ") || "None Assigned"}
//                               </span>
//                               {(!adminData?.clubAdmins || adminData.clubAdmins.length === 0) && (
//                                 <button 
//                                   onClick={handleOpenClubAdminModal} 
//                                   className="btn-gradient text-[10px] uppercase px-4 py-2 mt-2 sm:mt-0 whitespace-nowrap"
//                                 >
//                                   + Assign Admin
//                                 </button>
//                               )}
//                             </div>
//                           </div>

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
//                             <span className="font-bold text-black">{adminData?.clubAdmins?.map(a => a.email).join(", ") || "N/A"}</span>
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
import { useNavigate } from "react-router-dom";

// ----------------------------------------------------------------
// MembersModal — receives profileImages map (prn -> blobUrl)
// ----------------------------------------------------------------
const MembersModal = ({ isOpen, onClose, members, loading, clubName, profileImages }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md">
      <div className="bg-white rounded-2xl shadow-2xl w-11/12 max-w-4xl max-h-[80vh] flex flex-col overflow-hidden">

        {/* HEADER */}
        <div className="flex justify-between items-center p-8 pb-4">
          <h3 className="font-display text-2xl font-bold" style={{ color: '#4CA1AF' }}>
            Members of {clubName}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto px-8">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{ borderColor: '#4CA1AF' }}></div>
              <p className="mt-2 text-gray-500">Loading members...</p>
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No members found for this club
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6">
              {members.map((member) => {
                const blobUrl = profileImages[member.prn];
                return (
                  <div
                    key={member.userClubId}
                    className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-white hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-3">
                      {/* Profile Image Circle */}
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
                            style={{ background: 'linear-gradient(135deg, #4CA1AF, #315169)' }}
                          >
                            {member.name?.charAt(0)?.toUpperCase() || 'U'}
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
                        <span className={`text-xs font-bold uppercase ${
                          member.role === "CLUB_ADMIN"
                            ? "text-[#4CA1AF]"
                            : member.role === "TEACHERS"
                            ? "text-green-600"
                            : "text-blue-600"
                        }`}>
                          {member.role?.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-xs text-gray-500">Department:</span>
                        <span className="text-xs font-bold">{member.department || '—'}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-xs text-gray-500">Year:</span>
                        <span className="text-xs font-bold">
                          {member.year ? `Year ${member.year}` : '—'}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-xs text-gray-500">Tenure:</span>
                        <span className="text-xs font-bold">{member.tenure || '—'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* FOOTER */}
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

// ----------------------------------------------------------------
// Other Modals (unchanged)
// ----------------------------------------------------------------
const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel, isLoading }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-11/12 max-w-md transform transition-all border border-gray-200">
        <h3 className="font-display text-xl font-bold text-gray-800 mb-3">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition cursor-pointer" disabled={isLoading}>
            Cancel
          </button>
          <button onClick={onConfirm} className="text-white font-medium rounded-full py-2 px-6 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer" style={{ background: 'linear-gradient(135deg, #4CA1AF, #315169)' }} disabled={isLoading}>
            {isLoading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

const AssignTeacherModal = ({ isOpen, onClose, onAssign, teacherPrn, setTeacherPrn, teacherSearchResult, onSearchTeacher, teacherSearchLoading, assignTeacherLoading }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md transition-all duration-300">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-11/12 max-w-md transform transition-all animate-in fade-in zoom-in duration-200">
        <h3 className="font-display text-2xl font-bold mb-6" style={{ color: '#4CA1AF' }}>Assign Teacher Advisor</h3>
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-600 mb-2">Enter Teacher PRN</label>
          <div className="flex space-x-2">
            <input type="text" value={teacherPrn} onChange={(e) => setTeacherPrn(e.target.value)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl outline-none transition-all placeholder:text-gray-300 cursor-text" placeholder="e.g., 2214110270" />
            <button onClick={onSearchTeacher} disabled={teacherSearchLoading || !teacherPrn.trim()} className="px-6 py-2.5 text-white font-bold rounded-xl transition-colors disabled:opacity-50 cursor-pointer" style={{ background: 'linear-gradient(135deg, #4CA1AF, #315169)' }}>
              {teacherSearchLoading ? "..." : "Verify"}
            </button>
          </div>
        </div>
        {teacherSearchResult && (
          <div className={`mb-6 p-4 rounded-xl border ${teacherSearchResult.role === "TEACHERS" ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100"}`}>
            <p className="font-bold text-gray-800">{teacherSearchResult.username || teacherSearchResult.name}</p>
            <p className="text-xs text-gray-500 mb-2">{teacherSearchResult.email}</p>
            <p className={`text-xs font-black uppercase tracking-wider ${teacherSearchResult.role === "TEACHERS" ? "text-green-600" : "text-red-600"}`}>
              {teacherSearchResult.role} {teacherSearchResult.role !== "TEACHERS" && " (No Teacher with this prn)"}
            </p>
          </div>
        )}
        <div className="flex justify-end items-center space-x-3 mt-8">
          <button onClick={onClose} className="px-6 py-2.5 text-sm font-bold text-gray-500 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors cursor-pointer" disabled={assignTeacherLoading}>Cancel</button>
          <button onClick={onAssign} disabled={!teacherSearchResult || teacherSearchResult.role !== "TEACHERS" || assignTeacherLoading} className="px-8 py-2.5 text-sm font-bold text-white rounded-full transition-all shadow-lg cursor-pointer" style={{ background: 'linear-gradient(135deg, #4CA1AF, #315169)', opacity: (!teacherSearchResult || teacherSearchResult.role !== "TEACHERS" || assignTeacherLoading) ? 0.5 : 1 }}>
            {assignTeacherLoading ? "Assigning..." : "Assign Teacher"}
          </button>
        </div>
      </div>
    </div>
  );
};

const AssignClubAdminModal = ({ isOpen, onClose, onAssign, adminPrn, setAdminPrn, adminSearchResult, onSearchAdmin, adminSearchLoading, assignAdminLoading }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md transition-all duration-300">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-11/12 max-w-md transform transition-all animate-in fade-in zoom-in duration-200">
        <h3 className="font-display text-2xl font-bold mb-6" style={{ color: '#4CA1AF' }}>Assign Club Admin</h3>
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-600 mb-2">Enter User PRN</label>
          <div className="flex space-x-2">
            <input type="text" value={adminPrn} onChange={(e) => setAdminPrn(e.target.value)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl outline-none transition-all placeholder:text-gray-300 cursor-text" placeholder="e.g., 2214110270" />
            <button onClick={onSearchAdmin} disabled={adminSearchLoading || !adminPrn.trim()} className="px-6 py-2.5 text-white font-bold rounded-xl transition-colors disabled:opacity-50 cursor-pointer" style={{ background: 'linear-gradient(135deg, #4CA1AF, #315169)' }}>
              {adminSearchLoading ? "..." : "Verify"}
            </button>
          </div>
        </div>
        {adminSearchResult && (
          <div className={`mb-6 p-4 rounded-xl border ${adminSearchResult.role === "USERS" || adminSearchResult.role === "STUDENT" ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100"}`}>
            <p className="font-bold text-gray-800">{adminSearchResult.username || adminSearchResult.name}</p>
            <p className="text-xs text-gray-500 mb-2">{adminSearchResult.email}</p>
            <p className={`text-xs font-black uppercase tracking-wider ${adminSearchResult.role === "USERS" || adminSearchResult.role === "STUDENT" ? "text-green-600" : "text-red-600"}`}>
              {adminSearchResult.role} {(adminSearchResult.role !== "USERS" && adminSearchResult.role !== "STUDENT") && " (No user with this prn)"}
            </p>
          </div>
        )}
        <div className="flex justify-end items-center space-x-3 mt-8">
          <button onClick={onClose} className="px-6 py-2.5 text-sm font-bold text-gray-500 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors cursor-pointer" disabled={assignAdminLoading}>Cancel</button>
          <button onClick={onAssign} disabled={!adminSearchResult || (adminSearchResult.role !== "USERS" && adminSearchResult.role !== "STUDENT") || assignAdminLoading} className="px-8 py-2.5 text-sm font-bold text-white rounded-full transition-all shadow-lg cursor-pointer" style={{ background: 'linear-gradient(135deg, #4CA1AF, #315169)', opacity: (!adminSearchResult || (adminSearchResult.role !== "USERS" && adminSearchResult.role !== "STUDENT") || assignAdminLoading) ? 0.5 : 1 }}>
            {assignAdminLoading ? "Assigning..." : "Assign Admin"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Icons
const EditIcon = (props) => (<svg {...props} className={`w-5 h-5 transition duration-200 ${props.className || ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>);
const DeleteIcon = (props) => (<svg {...props} className={`w-5 h-5 transition duration-200 ${props.className || ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>);
const MembersIcon = (props) => (<svg {...props} className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.05-.97.13C16.51 14.15 18 15.35 18 16v3h5v-2.5c0-2.33-4.67-3.5-7-3.5z" /></svg>);
const EventsIcon = (props) => (<svg {...props} className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6a2 2 0 0 0-2-2zm0 16H5V9h14v11zM5 7V6h14v1H5z" /></svg>);
const ArrowLeftIcon = (props) => (<svg {...props} className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>);

// ----------------------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------------------
export default function ManageClubs() {
  const navigate = useNavigate();

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
  const [showClubAdminModal, setShowClubAdminModal] = useState(false);
  const [adminPrn, setAdminPrn] = useState("");
  const [adminSearchResult, setAdminSearchResult] = useState(null);
  const [adminSearchLoading, setAdminSearchLoading] = useState(false);
  const [assignAdminLoading, setAssignAdminLoading] = useState(false);
  const [membersData, setMembersData] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ── NEW: blob URL map for member profile images ──
  const [profileImages, setProfileImages] = useState({}); // prn -> blobUrl

  const token = localStorage.getItem("token");

  const customStyles = `
    .font-display { font-family: 'Outfit', sans-serif; }
    .btn-gradient {
        background-image: linear-gradient(135deg, #4CA1AF, #315169);
        color: white; font-weight: 500; border-radius: 9999px;
        padding: 0.5rem 1.5rem; transition: all 0.25s ease;
        box-shadow: 0 5px 15px rgba(76, 161, 175, 0.18); cursor: pointer;
    }
    .btn-gradient:hover { transform: translateY(-2px); }
    .club-item { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; }
    .club-item:hover { transform: translateX(8px); }
    .club-item.active {
        position: relative; background: white;
        box-shadow: 0 10px 25px rgba(76, 161, 175, 0.15);
    }
    .club-item.active::before {
        content: ''; position: absolute; top: 15%; bottom: 15%; left: 0;
        width: 4px; border-radius: 0 4px 4px 0; background: #4CA1AF;
    }
    .stat-card {
        transition: all 0.3s ease-out; background: white;
        border: 1px solid #f3f4f6; box-shadow: 0 4px 20px rgba(0,0,0,0.03); cursor: pointer;
    }
    .stat-card:hover { transform: translateY(-5px); box-shadow: 0 12px 30px rgba(76,161,175,0.1); }
    @keyframes blob {
      0% { transform: translate(0px, 0px) scale(1); }
      33% { transform: translate(30px, -50px) scale(1.1); }
      66% { transform: translate(-20px, 20px) scale(0.9); }
      100% { transform: translate(0px, 0px) scale(1); }
    }
    .animate-blob { animation: blob 7s infinite; }
    .animation-delay-2000 { animation-delay: 2s; }
    .animation-delay-4000 { animation-delay: 4s; }
  `;

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      setProfileImages((prev) => {
        Object.values(prev).forEach((url) => { if (url) URL.revokeObjectURL(url); });
        return {};
      });
    };
  }, []);

  // ── Fetch blob images for members (requires auth header) ──
  const fetchProfileImages = async (membersList) => {
    const withImages = membersList.filter(m => m.hasProfileImage && m.imageUrl);

    const results = await Promise.all(
      withImages.map(async (member) => {
        try {
          const res = await axios.get(
            `http://localhost:8080${member.imageUrl}`,
            { headers: { Authorization: `Bearer ${token}` }, responseType: "blob" }
          );
          if (res.data && res.data.size > 0) {
            return { prn: member.prn, blobUrl: URL.createObjectURL(res.data) };
          }
          return { prn: member.prn, blobUrl: null };
        } catch {
          return { prn: member.prn, blobUrl: null };
        }
      })
    );

    const map = results.reduce((acc, r) => {
      if (r) acc[r.prn] = r.blobUrl;
      return acc;
    }, {});

    setProfileImages(map);
  };

  // ── Fetch members + their images ──
  const fetchMembersByClubName = async (clubName) => {
    if (!clubName) return;
    setMembersLoading(true);
    // Revoke old blob URLs before fetching new ones
    setProfileImages((prev) => {
      Object.values(prev).forEach((url) => { if (url) URL.revokeObjectURL(url); });
      return {};
    });
    try {
      const response = await axios.get(
        `http://localhost:8080/api/user-clubs/club/${clubName}`,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      if (response?.data?.success) {
        const members = response.data.data || [];
        setMembersData(members);
        // Fetch blob images in parallel
        await fetchProfileImages(members);
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

  const handleMembersClick = async () => {
    if (selectedClub?.clubName) {
      await fetchMembersByClubName(selectedClub.clubName);
      setShowMembersModal(true);
    }
  };

  // ── Active/inactive ──
  const handleActivateClub = async (clubId) => {
    try {
      const response = await axios.patch(`http://localhost:8080/api/clubs/${clubId}/activate`, {}, { headers: { Authorization: `Bearer ${token}` } });
      if (response?.data?.success) { alert("Club activated successfully!"); await fetchClubs(); }
    } catch (err) {
      try {
        const clubToActivate = clubs.find(c => c.clubId === clubId);
        const response = await axios.put(`http://localhost:8080/api/clubs/${clubId}`, { ...clubToActivate, isActive: true }, { headers: { Authorization: `Bearer ${token}` } });
        if (response?.data?.success) { alert("Club activated successfully!"); await fetchClubs(); }
      } catch (err2) { alert("Failed to activate club."); }
    }
  };

  // ── Clubs ──
  const fetchClubs = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:8080/api/clubs", { headers: { Authorization: `Bearer ${token}` } });
      if (response?.data?.success) {
        const fetchedClubs = response.data.data || [];
        setClubs(fetchedClubs);
        if (fetchedClubs.length > 0) {
          const first = fetchedClubs[0];
          setSelectedClub(first);
          fetchAdminData(first.clubId);
        } else { setSelectedClub(null); setAdminData(null); }
      }
    } catch (err) { setError("Failed to fetch clubs."); }
    finally { setLoading(false); }
  };

  const fetchAdminData = async (clubId) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/clubs/${clubId}/admin`, { headers: { Authorization: `Bearer ${token}` } });
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
      const response = await axios.get(`http://localhost:8080/api/users/${prn}`, { headers: { Authorization: `Bearer ${token}` } });
      return response?.data?.email || null;
    } catch { return null; }
  };

  useEffect(() => { fetchClubs(); }, []);

  // ── Teacher ──
  const handleOpenTeacherModal = () => { setShowTeacherModal(true); setTeacherPrn(""); setTeacherSearchResult(null); };

  const handleSearchTeacher = async () => {
    if (!teacherPrn.trim()) return;
    setTeacherSearchLoading(true);
    try {
      const response = await axios.get(`http://localhost:8080/api/users/${teacherPrn}`, { headers: { Authorization: `Bearer ${token}` } });
      if (response?.data && response.data.prn) { setTeacherSearchResult(response.data); }
      else { setTeacherSearchResult({ notFound: true, message: "No such teacher found" }); }
    } catch (err) {
      setTeacherSearchResult({ notFound: true, message: err.response?.status === 404 ? "No such teacher found" : "Error searching for teacher" });
    } finally { setTeacherSearchLoading(false); }
  };

  const handleAssignTeacher = async () => {
    if (!teacherSearchResult || !selectedClub || teacherSearchResult.role !== "TEACHERS") return;
    setAssignTeacherLoading(true);
    try {
      const currentYear = new Date().getFullYear();
      const response = await axios.post("http://localhost:8080/api/user-clubs", { prn: teacherPrn, clubId: selectedClub.clubId, role: "TEACHERS", tenure: `${currentYear}-${currentYear + 1}` }, { headers: { Authorization: `Bearer ${token}` } });
      if (response?.data?.success) { alert("Teacher assigned successfully!"); fetchAdminData(selectedClub.clubId); setShowTeacherModal(false); }
      else { alert("Failed to assign teacher."); }
    } catch (err) { alert("Error during assignment."); }
    finally { setAssignTeacherLoading(false); }
  };

  // ── Club Admin ──
  const handleOpenClubAdminModal = () => { setShowClubAdminModal(true); setAdminPrn(""); setAdminSearchResult(null); };

  const handleSearchAdmin = async () => {
    if (!adminPrn.trim()) return;
    setAdminSearchLoading(true);
    try {
      const response = await axios.get(`http://localhost:8080/api/users/${adminPrn}`, { headers: { Authorization: `Bearer ${token}` } });
      if (response?.data && response.data.prn) { setAdminSearchResult(response.data); }
      else { setAdminSearchResult({ notFound: true, message: "No such user found" }); }
    } catch (err) {
      setAdminSearchResult({ notFound: true, message: err.response?.status === 404 ? "No such user found" : "Error searching for user" });
    } finally { setAdminSearchLoading(false); }
  };

  const handleAssignClubAdmin = async () => {
    if (!adminSearchResult || !selectedClub) return;
    const isValidRole = adminSearchResult.role === "USERS" || adminSearchResult.role === "STUDENT";
    if (!isValidRole) { alert("Only regular users/students can be assigned as club admins"); return; }
    setAssignAdminLoading(true);
    try {
      const currentYear = new Date().getFullYear();
      const response = await axios.post("http://localhost:8080/api/user-clubs", { prn: adminPrn, clubId: selectedClub.clubId, role: "CLUB_ADMIN", tenure: `${currentYear}-${currentYear + 1}` }, { headers: { Authorization: `Bearer ${token}` } });
      if (response?.data?.success) { alert("Club admin assigned successfully!"); fetchAdminData(selectedClub.clubId); setShowClubAdminModal(false); }
      else { alert("Failed to assign club admin."); }
    } catch (err) { alert("Error during assignment."); }
    finally { setAssignAdminLoading(false); }
  };

  // ── Add Club ──
  const handleAddClub = async () => {
    setAddClubLoading(true);
    try {
      const response = await axios.post("http://localhost:8080/api/clubs", newClub, { headers: { Authorization: `Bearer ${token}` } });
      if (response.data.success) { alert("Club created!"); setShowAddClubModal(false); setNewClub({ name: "", clubDesc: "" }); await fetchClubs(); }
    } catch (err) { alert("Error creating club"); }
    finally { setAddClubLoading(false); }
  };

  const handleSelectClub = (club) => { setSelectedClub(club); fetchAdminData(club.clubId); };
  const handleGoBack = () => navigate(-1);

  const handleDeleteClub = async () => {
    if (!clubToDelete) return;
    setDeleteLoading(true);
    try {
      const response = await axios.patch(`http://localhost:8080/api/clubs/${clubToDelete.clubId}/deactivate`, {}, { headers: { Authorization: `Bearer ${token}` } });
      if (response?.data?.success) { alert("Club deactivated successfully!"); await fetchClubs(); setIsModalOpen(false); setClubToDelete(null); }
    } catch (err) {
      try {
        const response = await axios.put(`http://localhost:8080/api/clubs/${clubToDelete.clubId}`, { ...clubToDelete, isActive: false }, { headers: { Authorization: `Bearer ${token}` } });
        if (response?.data?.success) { alert("Club deactivated successfully!"); await fetchClubs(); setIsModalOpen(false); setClubToDelete(null); }
      } catch (err2) { alert("Failed to deactivate club."); }
    } finally { setDeleteLoading(false); }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    return isNaN(d) ? dateString : d.toLocaleDateString();
  };

  const generateRandomDetails = (club) => ({
    description: club?.clubDesc || "A vibrant community of enthusiasts.",
    upcomingEvents: Math.floor(Math.random() * 8) + 3,
    established: club?.createdAt ? new Date(club.createdAt).getFullYear() : 2024,
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />

      {/* Animated Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-[#4CA1AF] rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Sticky Back Button Bar - ClubDetails Style */}
      <div className="sticky top-0 z-50 w-full bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={handleGoBack}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#4CA1AF] transition-colors group"
            >
              <ArrowLeftIcon className="group-hover:-translate-x-1 transition-transform" />
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>
      </div>

      {/* MODALS */}
      {showAddClubModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-2xl font-bold mb-6" style={{ color: '#4CA1AF' }}>Create New Club</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Club Name" value={newClub.name} onChange={(e) => setNewClub({ ...newClub, name: e.target.value })} className="w-full px-4 py-3 border rounded-xl outline-none cursor-text" />
              <textarea placeholder="Description" value={newClub.clubDesc} onChange={(e) => setNewClub({ ...newClub, clubDesc: e.target.value })} className="w-full px-4 py-3 border rounded-xl h-32 outline-none cursor-text" />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button className="px-6 py-2 bg-gray-100 rounded-full font-medium cursor-pointer hover:bg-gray-200" onClick={() => setShowAddClubModal(false)}>Cancel</button>
              <button className="btn-gradient px-8 cursor-pointer" onClick={handleAddClub} disabled={addClubLoading}>{addClubLoading ? "Creating..." : "Create Club"}</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal isOpen={isModalOpen} title="Confirm Deactivation" message={`Deactivate "${clubToDelete?.clubName}"? The club will become inactive.`} onConfirm={handleDeleteClub} onCancel={() => { setIsModalOpen(false); setClubToDelete(null); }} isLoading={deleteLoading} />
      <AssignTeacherModal isOpen={showTeacherModal} onClose={() => setShowTeacherModal(false)} onAssign={handleAssignTeacher} teacherPrn={teacherPrn} setTeacherPrn={setTeacherPrn} teacherSearchResult={teacherSearchResult} onSearchTeacher={handleSearchTeacher} teacherSearchLoading={teacherSearchLoading} assignTeacherLoading={assignTeacherLoading} />
      <AssignClubAdminModal isOpen={showClubAdminModal} onClose={() => setShowClubAdminModal(false)} onAssign={handleAssignClubAdmin} adminPrn={adminPrn} setAdminPrn={setAdminPrn} adminSearchResult={adminSearchResult} onSearchAdmin={handleSearchAdmin} adminSearchLoading={adminSearchLoading} assignAdminLoading={assignAdminLoading} />

      {/* MembersModal now receives profileImages */}
      <MembersModal
        isOpen={showMembersModal}
        onClose={() => setShowMembersModal(false)}
        members={membersData}
        loading={membersLoading}
        clubName={selectedClub?.clubName || ""}
        profileImages={profileImages}
      />

      {/* DASHBOARD CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/20">
          <header className="p-8 border-b border-gray-100 rounded-t-3xl shadow-inner" style={{ background: 'linear-gradient(135deg, #4CA1AF, #315169)' }}>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="text-left">
                <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white drop-shadow-md">
                  ClubLink Stellar Dashboard
                </h1>
                <p className="mt-2 text-base sm:text-lg font-light text-white/90">Manage all college clubs with ease and style.</p>
              </div>
              <button className="flex-shrink-0 bg-white font-bold rounded-full py-3 px-8 shadow-xl hover:scale-105 transition-all duration-300 w-full sm:w-auto cursor-pointer" style={{ color: '#4CA1AF' }} onClick={() => setShowAddClubModal(true)}>
                + Add New Club
              </button>
            </div>
          </header>

          <div className="flex flex-col lg:flex-row min-h-[70vh]">
            {/* LEFT PANEL */}
            <div className="lg:w-1/3 border-r border-gray-100 flex flex-col p-6 bg-gray-50/20">
              <h2 className="font-display text-2xl font-bold mb-2 px-2" style={{ color: '#2d8391' }}>Your Clubs</h2>
              <div className="overflow-y-auto max-h-[60vh] lg:max-h-full space-y-2 pr-2">
                {clubs.map((club) => (
                  <div key={club.clubId} className={`club-item p-4 rounded-xl cursor-pointer ${selectedClub?.clubId === club.clubId ? "active" : "hover:bg-white"}`} onClick={() => handleSelectClub(club)}>
                    <div className="flex flex-col">
                      <span className={`font-display text-lg font-bold ${selectedClub?.clubId === club.clubId ? "text-[#4CA1AF]" : "text-gray-700 uppercase tracking-wide"}`}>{club.clubName}</span>
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
                      <h2 className="text-5xl font-black tracking-tight" style={{ color: '#2d8391' }}>{selectedClub.clubName}</h2>
                      <p className="text-gray-400 mt-2 font-medium">Description: {selectedClub.clubDesc}</p>
                      <p className="text-gray-400 mt-2 font-medium">Club Added on {formatDate(selectedClub.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedClub?.isActive ? (
                        <button onClick={() => { setClubToDelete(selectedClub); setIsModalOpen(true); }} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-colors cursor-pointer" disabled={deleteLoading} title="Deactivate Club">
                          <DeleteIcon />
                        </button>
                      ) : (
                        <button onClick={() => handleActivateClub(selectedClub.clubId)} className="p-3 bg-green-50 text-green-500 rounded-xl hover:bg-green-500 hover:text-white transition-colors cursor-pointer" title="Activate Club">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        </button>
                      )}
                    </div>
                  </div>

                  {(() => {
                    const details = generateRandomDetails(selectedClub);
                    return (
                      <div className="space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div
                            className={`stat-card p-6 rounded-2xl ${selectedClub?.isActive ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'} hover:shadow-xl transition-all duration-300 group`}
                            onClick={selectedClub?.isActive ? handleMembersClick : null}
                          >
                            <MembersIcon className="text-[#5db2be] mb-3 group-hover:scale-110 transition-transform" />
                            <span className="text-4xl font-black text-[#5db2be] group-hover:text-[#315169]">{adminData?.totalCount || 0}</span>
                            <p className="text-xs font-bold uppercase text-gray-400 group-hover:text-[#5db2be]">Active Members</p>
                          </div>
                          <div className="stat-card p-6 rounded-2xl">
                            <EventsIcon className="text-[#5db2be] mb-3" />
                            <span className="text-4xl font-black text-[#5db2be]">{details.upcomingEvents}</span>
                            <p className="text-xs font-bold uppercase text-gray-400">Planned Events</p>
                          </div>
                        </div>

                        <div className="space-y-6">
                          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <span className="w-1 h-6 rounded-full" style={{ backgroundColor: '#4CA1AF' }}></span> Leadership & Contact
                          </h3>
                          <div className="grid gap-4">
                            <div className="flex flex-col sm:flex-row justify-between p-5 bg-white rounded-2xl border border-gray-100 shadow-sm items-center gap-4">
                              <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">Club Admins:</span>
                              <div className="flex flex-col sm:flex-row items-center gap-3">
                                <span className="font-bold text-black text-center sm:text-left">{adminData?.clubAdmins?.map(a => a.name).join(", ") || "None Assigned"}</span>
                                {(!adminData?.clubAdmins || adminData.clubAdmins.length === 0) && (
                                  <button onClick={handleOpenClubAdminModal} className={`text-[10px] uppercase px-4 py-2 mt-2 sm:mt-0 whitespace-nowrap rounded-full ${selectedClub?.isActive ? "btn-gradient cursor-pointer" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`} disabled={!selectedClub?.isActive}>
                                    + Assign Admin
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row justify-between p-5 bg-white rounded-2xl border border-gray-100 shadow-sm items-center gap-4">
                              <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">Teacher Advisor:</span>
                              <div className="flex items-center gap-3">
                                <span className="font-bold text-gray-700">{adminData?.teacherName && adminData.teacherName !== "Not Assigned" ? adminData.teacherName : <span className="text-gray-400 italic">Not Assigned</span>}</span>
                                {(!adminData?.teacherName || adminData.teacherName === "Not Assigned") && (
                                  <button onClick={handleOpenTeacherModal} className={`text-[10px] uppercase px-4 py-2 rounded-full ${selectedClub?.isActive ? "btn-gradient cursor-pointer" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`} disabled={!selectedClub?.isActive}>
                                    Assign Now
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row justify-between p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
                              <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">Contact Email:</span>
                              <span className="font-bold text-black">{adminData?.clubAdmins?.map(a => a.email).join(", ") || "N/A"}</span>
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
    </div>
  );
}