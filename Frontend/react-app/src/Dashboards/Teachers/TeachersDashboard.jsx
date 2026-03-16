// import { useFilteredUsersCount } from "./UserRemoveFromClub";
// import {
//   Calendar,
//   Trophy,
//   Users,
//   User,
//   Plus,
//   Upload,
//   X,
//   Edit,
//   LogOut,
//   LayoutDashboard,
//   Settings,
//   BookOpen,
//   Trash2,
//   Mail,
//   GraduationCap,
//   Building2,
//   CalendarPlus,
//   ChevronRight,
//   CheckCircle,
//   AlertCircle,
//   Menu,
//   Bell,
// } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import { useState, useEffect } from "react";
// import axios from "axios";
// import ConfirmDialog from "../../components/ConfirmDialog";
// import CustomSelect from "../../components/CustomSelect";

// const BASE_URL = import.meta.env.VITE_API_URL || "http://72.155.88.211:8080";

// export default function TeachersDashboard() {
//   const user = JSON.parse(localStorage.getItem("user"));
//   const token = localStorage.getItem("token");
//   const navigate = useNavigate();

//   const [currentUser, setCurrentUser] = useState({
//     username: user?.username || "",
//     email: user?.email || "",
//     role: user?.role || "TEACHER",
//     prn: user?.prn || "",
//     verified: user?.verified || false,
//   });

//   const [showEmailEditModal, setShowEmailEditModal] = useState(false);
//   const [newEmail, setNewEmail] = useState("");
//   const [emailLoading, setEmailLoading] = useState(false);
//   const [emailMessage, setEmailMessage] = useState({ text: "", type: "" });

//   const [showProfileForm, setShowProfileForm] = useState(false);
//   const [profileData, setProfileData] = useState({
//     prn: user?.prn || "",
//     fullName: "",
//     departmentId: "",
//     year: "",
//     phoneNumber: "",
//   });
//   const [selectedImage, setSelectedImage] = useState(null);
//   const [profileLoading, setProfileLoading] = useState(false);
//   const [message, setMessage] = useState("");
//   const [userProfile, setUserProfile] = useState(null);
//   const [profileImage, setProfileImage] = useState(null);
//   const [isLoadingProfile, setIsLoadingProfile] = useState(true);
//   const [departments, setDepartments] = useState([]);
//   const [clubs, setClubs] = useState([]);
//   const [error, setError] = useState(null);
//   const [isLoadingClubs, setIsLoadingClubs] = useState(false);
//   const [showAllClubs, setShowAllClubs] = useState(false);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [confirmDialog, setConfirmDialog] = useState({
//     isOpen: false,
//     title: "",
//     message: "",
//     variant: "primary",
//     confirmText: "Confirm",
//     onConfirm: () => {},
//   });
//   const closeConfirm = () =>
//     setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
//   const assignedStudentsCount = useFilteredUsersCount();

//   useEffect(() => {
//     fetchUserProfile();
//     fetchDepartments();
//     fetchUserClubs();
//     fetchUnread();
//   }, []);

//   useEffect(() => {
//     const handleFocus = () => {
//       fetchUnread();
//     };

//     window.addEventListener("focus", handleFocus);
//     return () => window.removeEventListener("focus", handleFocus);
//   }, [token]);

//   useEffect(() => {
//     if (
//       departments.length > 0 &&
//       profileData.departmentId &&
//       typeof profileData.departmentId === "string" &&
//       isNaN(profileData.departmentId)
//     ) {
//       const dept = departments.find((d) => d.name === profileData.departmentId);
//       if (dept) {
//         setProfileData((prev) => ({
//           ...prev,
//           departmentId: dept.departmentId,
//         }));
//       }
//     }
//   }, [departments, profileData.departmentId]);

//   const fetchDepartments = async () => {
//     try {
//       const response = await axios.get(`${BASE_URL}/api/department`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       });
//       if (response.data && response.data.data)
//         setDepartments(response.data.data);
//     } catch (error) {
//       console.error("Error fetching departments:", error);
//     }
//   };

//   const fetchUserProfile = async () => {
//     try {
//       setIsLoadingProfile(true);
//       const response = await axios.get(
//         `${BASE_URL}/api/profiles/prn/${user?.prn}`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
      
//       if (response.data && response.data.success && response.data.data) {
//         const profile = response.data.data;
//         setUserProfile(response.data);
        
//         let deptId = "";
//         if (profile.department) {
//           deptId =
//             typeof profile.department === "object"
//               ? profile.department.departmentId
//               : profile.department;
//         }
        
//         setProfileData({
//           prn: profile.prn || user?.prn || "",
//           fullName: profile.fullName || "",
//           departmentId: deptId,
//           year: profile.year || "",
//           phoneNumber: profile.phoneNumber || "",
//         });
//         fetchProfileImage();
//       } else {
//         // Handle the case where the profile doesn't exist yet
//         setProfileData(prev => ({
//           ...prev,
//           prn: user?.prn || ""
//         }));
//       }
//     } catch (error) {
//       console.error("Error fetching profile:", error);
//     } finally {
//       setIsLoadingProfile(false);
//     }
//   };

//   const fetchUnread = async () => {
//     if (!token) {
//       setUnreadCount(0);
//       return;
//     }

//     try {
//       const res = await axios.get(
//         `${BASE_URL}/api/notification/me/unread-count`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       const count =
//         typeof res.data === "number"
//           ? res.data
//           : (res.data?.data ?? res.data?.count ?? 0);

//       setUnreadCount(Number(count) || 0);
//     } catch {
//       setUnreadCount(0);
//     }
//   };

//   const fetchProfileImage = async () => {
//     try {
//       const response = await axios.get(
//         `${BASE_URL}/api/profiles/${user?.prn}/image`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//           responseType: "blob",
//         }
//       );
//       if (response.data) setProfileImage(URL.createObjectURL(response.data));
//     } catch (error) {
//       setProfileImage(null);
//     }
//   };

//   const handleVerificationRedirect = () => {
//     localStorage.setItem("verificationEmail", currentUser.email);
//     localStorage.setItem("verificationPRN", currentUser.prn);
//     navigate("/verifyotp");
//   };

//   const handleLogout = () => {
//     localStorage.removeItem("user");
//     localStorage.removeItem("token");
//     window.location.href = "/login";
//   };

//   const handleSubmitProfile = async (e) => {
//     e.preventDefault();
//     setProfileLoading(true);
//     try {
//       const requestData = {
//         fullName: profileData.fullName,
//         departmentId: parseInt(profileData.departmentId),
//         year: profileData.year,
//         phoneNumber: profileData.phoneNumber,
//       };

//       if (userProfile) {
//         await axios.put(
//           `${BASE_URL}/api/profiles/${profileData.prn}`,
//           requestData,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//               "Content-Type": "application/json",
//             },
//           }
//         );
//       } else {
//         await axios.post(
//           `${BASE_URL}/api/profiles`,
//           { ...requestData, prn: profileData.prn },
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//               "Content-Type": "application/json",
//             },
//           }
//         );
//       }

//       if (selectedImage) {
//         const formData = new FormData();
//         formData.append("image", selectedImage);
//         await axios.post(
//           `${BASE_URL}/api/profiles/${profileData.prn}/image`,
//           formData,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//               "Content-Type": "multipart/form-data",
//             },
//           }
//         );
//       }

//       fetchUserProfile();
//       setShowProfileForm(false);
//     } catch (error) {
//       setMessage("Error saving profile.");
//     } finally {
//       setProfileLoading(false);
//     }
//   };

//   const getDepartmentName = (id) => {
//     if (typeof id === "string" && isNaN(id)) return id;
//     const dept = departments.find((d) => d.departmentId === parseInt(id));
//     return dept ? dept.name : "Not set";
//   };

//   const fetchUserClubs = async () => {
//     setIsLoadingClubs(true);
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         setError("No authentication token found");
//         return;
//       }
//       const response = await axios.get(
//         `${BASE_URL}/api/user-clubs/getMyClubs`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       if (response.data.success) {
//         setClubs(response.data.data);
//         setError(null);
//       } else {
//         setError("Failed to fetch clubs");
//       }
//     } catch (err) {
//       console.error("Error fetching clubs:", err);
//       setError(err.response?.data?.message || "Error fetching clubs");
//     } finally {
//       setIsLoadingClubs(false);
//     }
//   };

//   const handleViewClubDetails = (club) => {
//     navigate(`/club/${club.clubName}/details`);
//   };

//   const displayClubs = showAllClubs ? clubs : clubs.slice(0, 4);

//   return (
//     <>
//       <div className="min-h-screen bg-[#F8FAFC] flex relative">
//         {/* Mobile Header */}
//         <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between z-50 shadow-sm">
//           <button
//             onClick={() => setSidebarOpen(!sidebarOpen)}
//             className="p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 hover:scale-105 cursor-pointer"
//           >
//             <Menu size={24} className="text-gray-700" />
//           </button>
//           <div className="flex items-center space-x-2">
//             <div
//               className="p-2 rounded-lg"
//               style={{ background: "linear-gradient(135deg, #4CA1AF, #315169)" }}
//             >
//               <GraduationCap className="text-white w-5 h-5" />
//             </div>
//             <h2 className="text-xl font-black tracking-tight text-gray-800">
//               Teacher<span style={{ color: "#4CA1AF" }}>Hub</span>
//             </h2>
//           </div>
//           <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-100"></div>
//         </div>

//         {/* Overlay for mobile sidebar */}
//         {sidebarOpen && (
//           <div
//             className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 cursor-pointer"
//             onClick={() => setSidebarOpen(false)}
//           />
//         )}

//         {/* ===== SIDEBAR ===== */}
//         <aside className={`
//           fixed lg:sticky top-0 left-0 h-screen
//           w-80 sm:w-96 bg-white border-r border-gray-100
//           flex flex-col p-8 shadow-lg lg:shadow-sm
//           transition-transform duration-300 ease-in-out z-50
//           ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
//           overflow-y-auto
//         `}>
//           <button
//             onClick={() => setSidebarOpen(false)}
//             className="lg:hidden absolute top-4 right-4 p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 hover:rotate-90 cursor-pointer"
//           >
//             <X size={20} className="text-gray-500" />
//           </button>

//           <div className="flex items-center gap-3 mb-8 group cursor-pointer">
//             <div
//               className="p-2 rounded-xl shadow-lg"
//               style={{ background: "linear-gradient(135deg, #4CA1AF, #315169)", boxShadow: "0 10px 15px -3px rgba(76, 161, 175, 0.2)" }}
//             >
//               <GraduationCap className="text-white w-7 h-7" />
//             </div>
//             <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
//               Teacher<span style={{ color: "#4CA1AF" }}>Hub</span>
//             </h1>
//           </div>

//           {/* Profile Image */}
//           <div className="relative group mx-auto mb-6">
//             <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-[2.5rem] overflow-hidden border-8 border-gray-50 shadow-inner bg-gray-100">
//               {profileImage ? (
//                 <img
//                   src={profileImage}
//                   alt="Profile"
//                   className="w-full h-full object-cover"
//                 />
//               ) : (
//                 <div className="w-full h-full flex items-center justify-center text-gray-400">
//                   <User size={48} />
//                 </div>
//               )}
//             </div>
//             <button
//               onClick={() => setShowProfileForm(true)}
//               className="absolute bottom-1 right-1 bg-white p-2.5 rounded-2xl shadow-xl border border-gray-100 transition-transform hover:scale-110 cursor-pointer"
//               style={{ color: "#4CA1AF" }}
//             >
//               <Edit size={18} />
//             </button>
//           </div>

//           <div className="text-center mb-6">
//             <h2 className="text-xl sm:text-2xl font-bold text-gray-800 tracking-tight leading-tight">
//               {profileData.fullName || user?.username}
//             </h2>
//             <span
//               className="mt-2 inline-block text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest"
//               style={{
//                 backgroundColor: "rgba(76, 161, 175, 0.1)",
//                 color: "#4CA1AF",
//               }}
//             >
//               {user?.role || "PROFESSOR"}
//             </span>
//           </div>

//           {/* Info Boxes */}
//           <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar pb-4">
//             <SidebarInfoBox label="Full Name" value={profileData.fullName} />
//             <SidebarInfoBox label="Username" value={user?.username} />
//             <SidebarInfoBox label="Staff ID" value={profileData.prn} />

//             {/* Email field */}
//             <div className="p-4 bg-gray-50/50 rounded-[1.2rem] border border-transparent transition-colors group cursor-pointer">
//               <p className="text-[9px] uppercase font-black text-gray-400 mb-1 tracking-widest transition-colors group-hover:text-[#4CA1AF]">
//                 Email
//               </p>
//               <div className="flex items-center justify-between">
//                 <span className="text-gray-700 font-bold text-sm truncate pr-2">
//                   {currentUser.email}
//                 </span>
//                 <div className="flex gap-1">
//                   <button
//                     onClick={() => {
//                       setNewEmail(currentUser.email);
//                       setShowEmailEditModal(true);
//                     }}
//                     className="p-1.5 rounded-lg hover:bg-gray-200 transition-all duration-200 hover:scale-110 flex-shrink-0 cursor-pointer"
//                     style={{ color: "#4CA1AF" }}
//                     title="Edit email"
//                   >
//                     <Edit size={14} />
//                   </button>
//                   <button
//                     onClick={handleVerificationRedirect}
//                     className={`p-1.5 rounded-lg transition-all duration-200 hover:scale-110 flex-shrink-0 cursor-pointer flex items-center gap-1 ${
//                       currentUser.verified
//                         ? "bg-green-50 text-green-600 hover:bg-green-100"
//                         : "bg-amber-50 text-amber-600 hover:bg-amber-100"
//                     }`}
//                     title={currentUser.verified ? "Verified" : "Click to verify"}
//                   >
//                     {currentUser.verified ? (
//                       <CheckCircle size={14} />
//                     ) : (
//                       <AlertCircle size={14} />
//                     )}
//                   </button>
//                 </div>
//               </div>
//             </div>

//             <SidebarInfoBox
//               label="Department"
//               value={getDepartmentName(profileData.departmentId)}
//             />
//             <SidebarInfoBox label="Phone" value={profileData.phoneNumber} />
//           </div>

//           {/* Sign Out */}
//           <button
//             onClick={() =>
//               setConfirmDialog({
//                 isOpen: true,
//                 title: "Sign Out",
//                 message: "Are you sure you want to sign out?",
//                 confirmText: "Sign Out",
//                 variant: "danger",
//                 onConfirm: () => {
//                   closeConfirm();
//                   handleLogout();
//                 },
//               })
//             }
//             className="mt-4 flex items-center justify-center gap-3 text-red-500 font-bold py-4 hover:bg-red-50 rounded-[1.5rem] transition-all border border-transparent hover:border-red-100 cursor-pointer"
//           >
//             <LogOut size={20} /> Sign Out
//           </button>
//         </aside>

//         {/* ===== MAIN CONTENT ===== */}
//         <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10 overflow-y-auto max-h-screen lg:mt-0 mt-16">

//           {/* ── Unverified banner ── */}
//           {!currentUser.verified && (
//             <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
//               <AlertCircle className="text-amber-500 flex-shrink-0" size={20} />
//               <div className="flex-1">
//                 <p className="text-amber-800 font-bold text-sm">
//                   Account not verified
//                 </p>
//                 <p className="text-amber-600 text-xs mt-0.5">
//                   Please verify your email to unlock all features.
//                 </p>
//               </div>
//               <button
//                 onClick={handleVerificationRedirect}
//                 className="text-xs font-bold px-4 py-2 bg-amber-500 text-white rounded-full hover:bg-amber-600 transition-colors cursor-pointer whitespace-nowrap"
//               >
//                 Verify Now
//               </button>
//             </div>
//           )}

//           <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6 sm:mb-10">
//             <div>
//               <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">
//                 Dashboard
//               </h1>
//               <p className="text-xs sm:text-sm text-gray-500 mt-1">
//                 Welcome back,{" "}
//                 <span className="font-semibold" style={{ color: "#4CA1AF" }}>
//                   Prof. {profileData.fullName || user?.username}
//                 </span>
//               </p>
//             </div>
//             <div className="flex items-center gap-2 sm:gap-3 bg-green-50 text-green-600 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full border border-green-100">
//               <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 bg-green-500 rounded-full animate-pulse"></div>
//               <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest">
//                 All Systems Live
//               </span>
//             </div>
//           </header>

//           {/* Stats */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
//             <StatCard icon={<Calendar />} label="Events Managed" value="0" color="blue" />
//             <StatCard icon={<Trophy />} label="My Clubs" value={clubs.length.toString()} color="green" />
//             <StatCard icon={<Users />} label="Assigned Students" value={assignedStudentsCount.toString()} color="orange" />
//           </div>

//           {/* Stacked layout */}
//           <div className="grid grid-cols-1 gap-8">

//             {/* Professor Control Center */}
//             <section className="bg-white rounded-[2.5rem] p-6 sm:p-10 shadow-sm border border-gray-50 h-fit">
//               <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-10">
//                 <div
//                   className="w-1.5 h-10 rounded-full"
//                   style={{ background: "linear-gradient(to bottom, #4CA1AF, #315169)" }}
//                 ></div>
//                 <h2 className="text-2xl font-bold text-gray-800">
//                   Professor Control Center
//                 </h2>
//               </div>

//               {/* Locked overlay when unverified */}
//               <div className="relative">
//                 {!currentUser.verified && (
//                   <div className="absolute inset-0 z-10 rounded-2xl bg-white/60 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3">
//                     <div className="bg-amber-100 p-4 rounded-full">
//                       <svg className="w-8 h-8 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
//                         <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
//                       </svg>
//                     </div>
//                     <p className="text-gray-700 font-bold text-sm">Verify your email to access these features</p>
//                     <button
//                       onClick={handleVerificationRedirect}
//                       className="text-xs font-bold px-5 py-2 bg-amber-500 text-white rounded-full hover:bg-amber-600 transition-colors cursor-pointer"
//                     >
//                       Verify Now
//                     </button>
//                   </div>
//                 )}

//                 <div className={`grid grid-cols-2 lg:grid-cols-3 gap-6 ${!currentUser.verified ? "opacity-40 pointer-events-none select-none" : ""}`}>
//                   <ActionCard
//                     icon={<CalendarPlus size={24} />}
//                     label="Events"
//                     color="blue"
//                     onClick={() => navigate("/events")}
//                   />
//                   {/* <ActionCard
//                     icon={<Trash2 size={24} />}
//                     label="Delete Event"
//                     color="red"
//                     onClick={() => {}}
//                   /> */}
//                   <ActionCard
//                     icon={<Users size={24} />}
//                     label="Add Student"
//                     color="teal"
//                     onClick={() => navigate("/add-users-with-club")}
//                   />
//                   <ActionCard
//                     icon={<Building2 size={24} />}
//                     label="Club Association"
//                     color="orange"
//                     onClick={() => navigate("/remove-users-from-club")}
//                   />
//                   <ActionCard
//                     icon={<Trophy size={24} />}
//                     label="Clubs"
//                     color="teal"
//                     onClick={() => navigate("/manage-clubs")}
//                   />
//                   <button
//                     onClick={() => navigate("/notifications")}
//                     className="p-8 rounded-2xl border border-gray-50/50 transition-all hover:scale-[1.02] flex flex-col items-center justify-center gap-4 group shadow-sm cursor-pointer w-full"
//                     style={{ backgroundColor: "rgba(76, 161, 175, 0.05)" }}
//                   >
//                     <div
//                       className="relative p-4 bg-white rounded-xl shadow-sm group-hover:shadow-md transition-all group-hover:-translate-y-1"
//                       style={{ color: "#4CA1AF" }}
//                     >
//                       <Bell size={24} />
//                       {unreadCount > 0 && (
//                         <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
//                           {unreadCount > 9 ? "9+" : unreadCount}
//                         </span>
//                       )}
//                     </div>
//                     <span className="font-black text-gray-700 uppercase text-xs tracking-widest">
//                       Notifications
//                     </span>
//                   </button>
//                 </div>
//               </div>
//             </section>

//             {/* My Clubs */}
//             {(isLoadingClubs || error || clubs.length > 0) && (
//             <section className="bg-white rounded-[2.5rem] p-6 sm:p-10 shadow-sm border border-gray-50">
//               <div className="flex items-center justify-between gap-3 mb-6 sm:mb-8">
//                 <div className="flex items-center gap-3 sm:gap-4">
//                   <h2 className="text-xl sm:text-2xl font-bold text-gray-800">My Clubs</h2>
//                   <div className="h-[1px] w-16 bg-gray-100"></div>
//                 </div>
//                 <button
//                   onClick={fetchUserClubs}
//                   disabled={isLoadingClubs || !currentUser.verified}
//                   className="text-xs font-bold px-5 py-2.5 rounded-full transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
//                   style={{ color: "#4CA1AF", backgroundColor: "rgba(76, 161, 175, 0.1)" }}
//                   title={!currentUser.verified ? "Verify your email to refresh clubs" : ""}
//                 >
//                   <svg
//                     className={`w-3 sm:w-4 h-3 sm:h-4 ${isLoadingClubs ? "animate-spin" : ""}`}
//                     fill="none"
//                     viewBox="0 0 24 24"
//                     stroke="currentColor"
//                   >
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
//                   </svg>
//                   {isLoadingClubs ? "Refreshing..." : "Refresh"}
//                 </button>
//               </div>

//               {/* Clubs content */}
//               {!currentUser.verified ? (
//                 <div className="py-16 text-center border-2 border-dashed border-amber-200 rounded-[2rem] bg-amber-50/30">
//                   <div className="bg-amber-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
//                     <svg className="w-9 h-9 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
//                       <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
//                     </svg>
//                   </div>
//                   <h3 className="text-lg font-bold text-gray-700 mb-2">Clubs Locked</h3>
//                   <p className="text-gray-500 text-sm mb-6 px-4">
//                     Verify your email address to view and manage your club memberships.
//                   </p>
//                   <button
//                     onClick={handleVerificationRedirect}
//                     className="text-white px-8 py-3 rounded-full text-sm font-bold shadow-lg transition-colors cursor-pointer bg-amber-500 hover:bg-amber-600"
//                   >
//                     Verify Email
//                   </button>
//                 </div>
//               ) : isLoadingClubs ? (
//                 <div className="py-16 text-center">
//                   <div
//                     className="animate-spin w-12 h-12 border-4 rounded-full mx-auto mb-4"
//                     style={{ borderColor: "rgba(76, 161, 175, 0.2)", borderTopColor: "#4CA1AF" }}
//                   ></div>
//                   <p className="text-gray-500 font-medium">Loading your clubs...</p>
//                 </div>
//               ) : error ? (
//                 <div className="bg-red-50 rounded-[2rem] p-8 text-center border border-red-100">
//                   <div className="text-red-500 mb-3">
//                     <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                     </svg>
//                   </div>
//                   <h3 className="text-xl font-bold text-gray-800 mb-3">Unable to Load Clubs</h3>
//                   <p className="text-red-500/70 mb-5">{error}</p>
//                   <button
//                     onClick={fetchUserClubs}
//                     className="bg-white px-8 py-3 rounded-full text-sm font-bold border transition-colors cursor-pointer"
//                     style={{ color: "#4CA1AF", borderColor: "rgba(76, 161, 175, 0.2)" }}
//                   >
//                     Try Again
//                   </button>
//                 </div>
//               ) : clubs.length === 0 ? (
//                 <div className="py-16 text-center border-2 border-dashed border-gray-200 rounded-[2rem]">
//                   <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-5">
//                     <Trophy className="text-gray-400 w-12 h-12" />
//                   </div>
//                   <h3 className="text-xl font-bold text-gray-800 mb-3">No Clubs Assigned Yet</h3>
//                   <p className="text-gray-500 mb-8">You haven't been assigned to any clubs yet.</p>
//                   <button
//                     onClick={() => navigate("/manage-clubs")}
//                     className="text-white px-10 py-4 rounded-full text-sm font-bold shadow-lg transition-colors cursor-pointer"
//                     style={{ background: "linear-gradient(135deg, #4CA1AF, #315169)" }}
//                   >
//                     Browse Clubs
//                   </button>
//                 </div>
//               ) : (
//                 <>
//                   {/* Clubs Cards View */}
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//                     {displayClubs.map((club) => (
//                       <CompactClubCard
//                         key={club.clubId}
//                         club={club}
//                         onViewDetails={handleViewClubDetails}
//                       />
//                     ))}
//                   </div>
                  
//                   {clubs.length > 4 && (
//                     <div className="text-center mt-8">
//                       <button
//                         onClick={() => setShowAllClubs(!showAllClubs)}
//                         className="bg-white px-8 py-4 rounded-full text-sm font-bold border transition-colors inline-flex items-center gap-2 cursor-pointer"
//                         style={{ color: "#4CA1AF", borderColor: "rgba(76, 161, 175, 0.2)" }}
//                       >
//                         {showAllClubs ? "Show Less" : `Show All (${clubs.length} Clubs)`}
//                         <svg
//                           className={`w-4 h-4 transition-transform ${showAllClubs ? "rotate-180" : ""}`}
//                           fill="none"
//                           viewBox="0 0 24 24"
//                           stroke="currentColor"
//                         >
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                         </svg>
//                       </button>
//                     </div>
//                   )}
//                 </>
//               )}
//             </section>
//             )}
//           </div>
//         </main>

//         {/* ===== PROFILE FORM MODAL ===== */}
//         {showProfileForm && (
//           <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
//             <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-xl w-full p-8">
//               <div className="flex justify-between items-center mb-8">
//                 <h3 className="text-2xl font-bold text-gray-800">
//                   {userProfile ? "Edit Profile" : "Complete Profile"}
//                 </h3>
//                 <button
//                   onClick={() => setShowProfileForm(false)}
//                   className="bg-gray-50 p-2 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"
//                 >
//                   <X size={20} />
//                 </button>
//               </div>

//               <form onSubmit={handleSubmitProfile} className="space-y-5">
//                 <div className="grid grid-cols-2 gap-4">
//                   <FormInput label="Staff ID (Read Only)" value={profileData.prn} readOnly />
//                   <FormInput
//                     label="Full Name"
//                     value={profileData.fullName}
//                     onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
//                     required
//                   />
//                 </div>

//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="space-y-1">
//                     <label className="text-[10px] font-black text-gray-400 ml-1 uppercase tracking-widest">
//                       Department
//                     </label>
//                     <CustomSelect
//                       name="departmentId"
//                       value={profileData.departmentId}
//                       onChange={(e) =>
//                         setProfileData({ ...profileData, departmentId: e.target.value })
//                       }
//                       options={departments.map((dept) => ({
//                         value: dept.departmentId,
//                         label: dept.name,
//                       }))}
//                       placeholder="Select Dept"
//                       required
//                     />
//                   </div>
//                   <div className="space-y-1">
//                     <label className="text-[10px] font-black text-gray-400 ml-1 uppercase tracking-widest">
//                       Year
//                     </label>
//                     <CustomSelect
//                       name="year"
//                       value={profileData.year}
//                       onChange={(e) =>
//                         setProfileData({ ...profileData, year: e.target.value })
//                       }
//                       options={[1, 2, 3, 4].map((y) => ({
//                         value: y,
//                         label: `Year ${y}`,
//                       }))}
//                       placeholder="Select Year"
//                       required
//                     />
//                   </div>
//                 </div>

//                 <FormInput
//                   label="Phone Number"
//                   value={profileData.phoneNumber}
//                   onChange={(e) => setProfileData({ ...profileData, phoneNumber: e.target.value })}
//                   required
//                 />

//                 <div className="bg-gray-50 p-6 rounded-2xl border-2 border-dashed border-gray-200 text-center transition-colors cursor-pointer">
//                   <input
//                     type="file"
//                     accept="image/*"
//                     onChange={(e) => setSelectedImage(e.target.files[0])}
//                     className="hidden"
//                     id="profile-upload"
//                   />
//                   <label
//                     htmlFor="profile-upload"
//                     className="cursor-pointer flex flex-col items-center gap-2 text-gray-500 hover:text-[#4CA1AF]"
//                   >
//                     <Upload size={24} />
//                     <span className="text-sm font-semibold">
//                       {selectedImage ? selectedImage.name : "Upload Profile Photo"}
//                     </span>
//                   </label>
//                 </div>

//                 <button
//                   type="submit"
//                   disabled={profileLoading}
//                   className="w-full text-white py-4 rounded-2xl font-bold shadow-lg transition-all disabled:opacity-50 cursor-pointer"
//                   style={{ background: "linear-gradient(135deg, #4CA1AF, #315169)" }}
//                 >
//                   {profileLoading ? "Saving..." : userProfile ? "Update Profile" : "Complete Profile"}
//                 </button>
//               </form>
//             </div>
//           </div>
//         )}

//         {/* ===== EMAIL EDIT MODAL ===== */}
//         {showEmailEditModal && (
//           <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center p-6 z-50">
//             <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full overflow-hidden border border-white">
//               <div
//                 className="p-6 text-white"
//                 style={{ background: "linear-gradient(135deg, #4CA1AF, #315169)" }}
//               >
//                 <div className="flex justify-between items-center">
//                   <div>
//                     <h3 className="text-xl font-bold flex items-center gap-2">
//                       <Mail size={20} />
//                       Update Email Address
//                     </h3>
//                     <p className="text-white/80 text-sm mt-1">Enter your new email address</p>
//                   </div>
//                   <button
//                     onClick={() => {
//                       setShowEmailEditModal(false);
//                       setEmailMessage({ text: "", type: "" });
//                       setNewEmail("");
//                     }}
//                     className="bg-white/20 p-2 rounded-xl hover:bg-white/30 transition-all duration-200 hover:rotate-90 cursor-pointer"
//                   >
//                     <X size={18} />
//                   </button>
//                 </div>
//               </div>

//               <div className="p-6 space-y-5">
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">Current Email</label>
//                   <input
//                     type="email"
//                     value={currentUser.email}
//                     className="w-full px-4 py-3 bg-gray-100 border-2 border-gray-200 rounded-xl text-gray-600 cursor-not-allowed"
//                     disabled
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     New Email <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="email"
//                     value={newEmail}
//                     onChange={(e) => setNewEmail(e.target.value)}
//                     className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none transition-all"
//                     onFocus={(e) => (e.target.style.boxShadow = "0 0 0 2px rgba(76, 161, 175, 0.2)")}
//                     onBlur={(e) => (e.target.style.boxShadow = "")}
//                     placeholder="Enter new email address"
//                     required
//                   />
//                 </div>

//                 {emailMessage.text && (
//                   <div
//                     className={`p-3 rounded-xl ${
//                       emailMessage.type === "error"
//                         ? "bg-red-50 text-red-700 border border-red-200"
//                         : "bg-green-50 text-green-700 border border-green-200"
//                     }`}
//                   >
//                     <p className="text-sm font-semibold flex items-center gap-2">
//                       {emailMessage.type === "success" ? "✓" : "⚠"} {emailMessage.text}
//                     </p>
//                   </div>
//                 )}

//                 <div className="flex space-x-4 pt-4">
//                   <button
//                     type="button"
//                     onClick={async () => {
//                       if (!newEmail.trim()) {
//                         setEmailMessage({ text: "Please enter a valid email", type: "error" });
//                         return;
//                       }
//                       const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//                       if (!emailRegex.test(newEmail)) {
//                         setEmailMessage({ text: "Please enter a valid email address", type: "error" });
//                         return;
//                       }
//                       setEmailLoading(true);
//                       setEmailMessage({ text: "", type: "" });
//                       try {
//                         const response = await axios.put(
//                           `${BASE_URL}/api/users/changeEmail/${currentUser.prn}/${encodeURIComponent(newEmail)}`,
//                           {},
//                           {
//                             headers: {
//                               Authorization: `Bearer ${token}`,
//                               "Content-Type": "application/json",
//                             },
//                           }
//                         );
//                         if (response.data) {
//                           const updatedUser = { ...currentUser, email: newEmail, verified: false };
//                           localStorage.setItem("user", JSON.stringify(updatedUser));
//                           setCurrentUser(updatedUser);
//                           setEmailMessage({ text: "Email updated! OTP sent to your new email...", type: "success" });
//                           localStorage.setItem("verificationEmail", newEmail);
//                           localStorage.setItem("verificationOldEmail", currentUser.email);
//                           localStorage.setItem("verificationPRN", currentUser.prn);
//                           localStorage.setItem("verificationMode", "email_change");
//                           localStorage.setItem("verificationReturnUrl", "/dashboard");
//                           setTimeout(() => {
//                             setShowEmailEditModal(false);
//                             setEmailMessage({ text: "", type: "" });
//                             setNewEmail("");
//                             navigate("/verifyotp");
//                           }, 1500);
//                         }
//                       } catch (error) {
//                         console.error("Error changing email:", error);
//                         setEmailMessage({
//                           text: error.response?.data?.message || "Failed to update email. Please try again.",
//                           type: "error",
//                         });
//                       } finally {
//                         setEmailLoading(false);
//                       }
//                     }}
//                     disabled={emailLoading || !newEmail || newEmail === currentUser.email}
//                     className="w-full text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
//                     style={{ background: "linear-gradient(135deg, #4CA1AF, #315169)" }}
//                   >
//                     {emailLoading ? (
//                       <div className="flex items-center justify-center gap-2">
//                         <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                         Updating & Sending OTP...
//                       </div>
//                     ) : (
//                       "Update Email"
//                     )}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       <ConfirmDialog
//         isOpen={confirmDialog.isOpen}
//         title={confirmDialog.title}
//         message={confirmDialog.message}
//         confirmText={confirmDialog.confirmText}
//         variant={confirmDialog.variant}
//         onConfirm={confirmDialog.onConfirm}
//         onCancel={closeConfirm}
//       />
//     </>
//   );
// }

// /* ===== HELPER COMPONENTS ===== */

// function SidebarInfoBox({ label, value }) {
//   return (
//     <div className="p-4 bg-gray-50/50 rounded-[1.2rem] border border-transparent transition-colors group cursor-pointer">
//       <p className="text-[9px] uppercase font-black text-gray-400 mb-1 tracking-widest transition-colors group-hover:text-[#4CA1AF]">
//         {label}
//       </p>
//       <p className="text-gray-700 font-bold text-sm truncate">{value || "Not set"}</p>
//     </div>
//   );
// }

// function StatCard({ icon, label, value, color }) {
//   const bgColors = {
//     blue:   { bg: "rgba(76, 161, 175, 0.1)",  text: "#4CA1AF" },
//     green:  { bg: "rgba(16, 185, 129, 0.1)",  text: "#10B981" },
//     orange: { bg: "rgba(249, 115, 22, 0.1)",  text: "#F97316" },
//     purple: { bg: "rgba(76, 161, 175, 0.1)",  text: "#4CA1AF" },
//     red:    { bg: "rgba(239, 68, 68, 0.1)",   text: "#EF4444" },
//   };
  
//   const theme = bgColors[color] || bgColors.blue;
  
//   return (
//     <div className="bg-white p-7 rounded-[2.5rem] shadow-sm border border-gray-50 flex items-center gap-6 cursor-pointer hover:shadow-md transition-all">
//       <div
//         className="p-5 rounded-[1.5rem]"
//         style={{ backgroundColor: theme.bg, color: theme.text }}
//       >
//         {icon}
//       </div>
//       <div>
//         <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">{label}</p>
//         <h3 className="text-2xl font-black tracking-tight text-gray-800">{value}</h3>
//       </div>
//     </div>
//   );
// }

// function CompactClubCard({ club, onViewDetails }) {
//   const clubName = club.clubName || "Unnamed Club";
//   const clubDescription = club.desc || club.description || "No description available";
//   const memberCount = club.memberCount || "0";
//   const clubLogo = club.logo || null;

//   const colors = ["blue", "orange", "purple", "green", "red"];
//   const colorIndex = clubName.length % colors.length;
//   const color = colors[colorIndex];

//   const bgColors = {
//     blue:   { bg: "rgba(76, 161, 175, 0.1)",  text: "#4CA1AF" },
//     orange: { bg: "rgba(249, 115, 22, 0.1)",  text: "#F97316" },
//     purple: { bg: "rgba(76, 161, 175, 0.1)",  text: "#4CA1AF" },
//     green:  { bg: "rgba(16, 185, 129, 0.1)",  text: "#10B981" },
//     red:    { bg: "rgba(239, 68, 68, 0.1)",   text: "#EF4444" },
//   };

//   return (
//     <div
//       className="bg-gray-50/50 rounded-2xl p-5 hover:bg-gray-50 transition-all cursor-pointer border border-transparent hover:border-gray-200"
//       onClick={() => onViewDetails(club)}
//     >
//       <div className="flex items-center gap-4">
//         <div
//           className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
//           style={{ backgroundColor: bgColors[color].bg }}
//         >
//           {clubLogo ? (
//             <img src={clubLogo} alt={clubName} className="w-7 h-7 object-contain" />
//           ) : (
//             <Trophy className="w-6 h-6" style={{ color: bgColors[color].text }} />
//           )}
//         </div>
//         <div className="flex-1 min-w-0">
//           <div className="flex items-center justify-between mb-1">
//             <h3 className="font-extrabold text-gray-800 text-lg truncate pr-2" title={clubName}>
//               {clubName}
//             </h3>
//             {/* <span className="text-[9px] font-black bg-white px-3 py-1 rounded-full text-gray-600 uppercase tracking-wider whitespace-nowrap">
//               CLUB
//             </span> */}
//           </div>
//           <p className="text-sm text-gray-500 mt-1 line-clamp-2 mb-2" title={clubDescription}>
//             {clubDescription}
//           </p>
//           <div className="flex items-center gap-3">
//             <div className="flex items-center gap-1.5">
//               <Users className="w-4 h-4 text-gray-400" />
//               <span className="text-xs font-bold text-gray-600">{memberCount} members</span>
//             </div>
//           </div>
//         </div>
//         <ChevronRight size={20} className="text-gray-300" />
//       </div>
//     </div>
//   );
// }

// function ActionCard({ icon, label, color, onClick }) {
//   const themes = {
//     blue:   { bg: "rgba(76, 161, 175, 0.05)",  icon: "#4CA1AF" },
//     red:    { bg: "rgba(239, 68, 68, 0.05)",   icon: "#EF4444" },
//     teal:   { bg: "rgba(76, 161, 175, 0.05)",  icon: "#4CA1AF" },
//     orange: { bg: "rgba(249, 115, 22, 0.05)",  icon: "#F97316" },
//   };
  
//   const theme = themes[color] || themes.blue;
  
//   return (
//     <button
//       onClick={onClick}
//       className="p-8 rounded-2xl border border-gray-50/50 transition-all hover:scale-[1.02] flex flex-col items-center justify-center gap-4 group shadow-sm cursor-pointer w-full"
//       style={{ backgroundColor: theme.bg }}
//     >
//       <div
//         className="p-4 bg-white rounded-xl shadow-sm group-hover:shadow-md transition-all group-hover:-translate-y-1"
//         style={{ color: theme.icon }}
//       >
//         {icon}
//       </div>
//       <span className="font-black text-gray-700 uppercase text-xs tracking-widest">{label}</span>
//     </button>
//   );
// }

// function FormInput({ label, ...props }) {
//   return (
//     <div className="space-y-1">
//       <label className="text-[10px] font-black text-gray-400 ml-1 uppercase tracking-widest">
//         {label}
//       </label>
//       <input
//         className="w-full px-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 outline-none text-gray-700 font-medium transition-all cursor-text"
//         {...props}
//       />
//     </div>
//   );
// }


import { useFilteredUsersCount } from "./UserRemoveFromClub";
import {
  Calendar,
  Trophy,
  Users,
  User,
  Upload,
  X,
  Edit,
  LogOut,
  GraduationCap,
  CalendarPlus,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Menu,
  Bell,
  Building2,
  Mail,
  Moon,
  Sun,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import ConfirmDialog from "../../components/ConfirmDialog";
import CustomSelect from "../../components/CustomSelect";

const BASE_URL = import.meta.env.VITE_API_URL || "http://72.155.88.211:8080";

export default function TeachersDashboard() {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState({
    username: user?.username || "",
    email: user?.email || "",
    role: user?.role || "TEACHER",
    prn: user?.prn || "",
    verified: user?.verified || false,
  });
  const [userAccountData, setUserAccountData] = useState(null);

  const [showEmailEditModal, setShowEmailEditModal] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailMessage, setEmailMessage] = useState({ text: "", type: "" });

  const [showProfileForm, setShowProfileForm] = useState(false);
  const [profileData, setProfileData] = useState({
    prn: user?.prn || "",
    fullName: "",
    departmentId: "",
    year: 0, // FIX: default to 0 (faculty) not ""
    phoneNumber: "",
  });

  const [selectedImage, setSelectedImage] = useState(null);
  // FIX: separate preview URL from the fetched blob URL to avoid wrong revocation
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileExists, setProfileExists] = useState(false); // FIX: replaced ambiguous userProfile with boolean
  const profileImageBlobRef = useRef(null); // FIX: track blob URL in ref for proper cleanup
  const [profileImage, setProfileImage] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [error, setError] = useState(null);
  const [isLoadingClubs, setIsLoadingClubs] = useState(false);
  const [showAllClubs, setShowAllClubs] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [eventsManagedCount, setEventsManagedCount] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem("teacherDashboardTheme") === "dark");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [formMessage, setFormMessage] = useState({ text: "", type: "" });
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    variant: "primary",
    confirmText: "Confirm",
    onConfirm: () => {},
  });

  const closeConfirm = () =>
    setConfirmDialog((prev) => ({ ...prev, isOpen: false }));

  const assignedStudentsCount = useFilteredUsersCount();

  // FIX: cleanup blob URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (profileImageBlobRef.current) {
        URL.revokeObjectURL(profileImageBlobRef.current);
      }
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("teacherDashboardTheme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  useEffect(() => {
    fetchUserProfile();
    fetchUserAccountData();
    fetchDepartments();
    fetchUserClubs();
    fetchUnread();
    fetchEventsManagedCount();
  }, []);

  useEffect(() => {
    const handleFocus = () => fetchUnread();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [token]);

  // FIX: resolve department name → ID only when departments load and value is still a name string
  useEffect(() => {
    if (
      departments.length > 0 &&
      profileData.departmentId &&
      typeof profileData.departmentId === "string" &&
      isNaN(Number(profileData.departmentId))
    ) {
      const dept = departments.find((d) => d.name === profileData.departmentId);
      if (dept) {
        setProfileData((prev) => ({ ...prev, departmentId: dept.departmentId }));
      }
    }
  }, [departments]); // FIX: removed profileData.departmentId from deps to avoid infinite loop

  // FIX: refresh image when profile form closes, but don't re-run fetchUserProfile unnecessarily
  useEffect(() => {
    if (!showProfileForm && token && user?.prn) {
      fetchProfileImage();
    }
  }, [showProfileForm]);

  // ─── Data fetchers ───────────────────────────────────────────────────────────

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/department`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (response.data?.data) setDepartments(response.data.data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const fetchUserProfile = async () => {
    try {
      setIsLoadingProfile(true);
      const response = await axios.get(`${BASE_URL}/api/profiles/prn/${user?.prn}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // FIX: check response.data.data (the actual profile), not response.data
      if (response.data?.success && response.data?.data) {
        const profile = response.data.data;
        setProfileExists(true); // FIX: use boolean flag, not the whole wrapper object

        // Resolve departmentId — could be an object or a plain ID
        let deptId = "";
        if (profile.department) {
          deptId =
            typeof profile.department === "object"
              ? profile.department.departmentId
              : profile.department;
        }

        setProfileData({
          prn: profile.prn || user?.prn || "",
          fullName: profile.fullName || "",
          departmentId: deptId,
          // FIX: coerce year to integer, default to 0 for faculty if missing
          year: profile.year != null ? Number(profile.year) : 0,
          phoneNumber: profile.phoneNumber || "",
        });

        fetchProfileImage();
      } else {
        setProfileExists(false);
        setProfileData((prev) => ({ ...prev, prn: user?.prn || "" }));
      }
    } catch (error) {
      // FIX: treat 404 as "no profile yet", propagate other errors
      if (error.response?.status === 404) {
        setProfileExists(false);
        setProfileData((prev) => ({ ...prev, prn: user?.prn || "" }));
      } else {
        console.error("Error fetching profile:", error);
      }
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const fetchUserAccountData = async () => {
    try {
      if (!token || !user?.prn) return;
      const response = await axios.get(
        `${BASE_URL}/api/users/${user.prn}`,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } },
      );
      if (response.data) {
        setUserAccountData(response.data);
      }
    } catch (error) {
      console.error("Error fetching user account data:", error);
    }
  };

  const fetchUnread = async () => {
    if (!token) { setUnreadCount(0); return; }
    try {
      const res = await axios.get(`${BASE_URL}/api/notification/me/unread-count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const count =
        typeof res.data === "number"
          ? res.data
          : (res.data?.data ?? res.data?.count ?? 0);
      setUnreadCount(Number(count) || 0);
    } catch {
      setUnreadCount(0);
    }
  };

  const fetchEventsManagedCount = async () => {
    if (!token) {
      setEventsManagedCount(0);
      return;
    }

    try {
      const response = await axios.get(`${BASE_URL}/api/events/myEvents/count`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const count =
        typeof response.data === "number"
          ? response.data
          : (response.data?.data ?? response.data?.count ?? 0);

      setEventsManagedCount(Number(count) || 0);
    } catch (error) {
      console.error("Error fetching managed events count:", error);
      setEventsManagedCount(0);
    }
  };

  const fetchProfileImage = async () => {
    if (!token || !user?.prn) return;
    try {
      const response = await axios.get(`${BASE_URL}/api/profiles/${user?.prn}/image`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      if (response.status === 200 && response.data) {
        // FIX: revoke the previous blob URL before creating a new one
        if (profileImageBlobRef.current) {
          URL.revokeObjectURL(profileImageBlobRef.current);
        }
        const url = URL.createObjectURL(response.data);
        profileImageBlobRef.current = url;
        setProfileImage(url);
      }
    } catch {
      setProfileImage(null);
    }
  };

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const handleVerificationRedirect = () => {
    localStorage.setItem("verificationEmail", currentUser.email);
    localStorage.setItem("verificationPRN", currentUser.prn);
    navigate("/verifyotp");
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    setFormMessage({ text: "", type: "" });

    // FIX: validate departmentId before parseInt to avoid sending NaN
    const deptId = parseInt(profileData.departmentId, 10);
    if (isNaN(deptId)) {
      setFormMessage({ text: "Please select a valid department.", type: "error" });
      return;
    }

    setProfileLoading(true);
    try {
      const requestData = {
        fullName: profileData.fullName,
        departmentId: deptId,
        // FIX: send year as integer; faculty default is 0
        year: profileData.year != null ? Number(profileData.year) : 0,
        phoneNumber: profileData.phoneNumber,
      };

      // FIX: use profileExists boolean instead of truthy-check on wrapper object
      if (profileExists) {
        await axios.put(
          `${BASE_URL}/api/profiles/${profileData.prn}`,
          requestData,
          { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
        );
      } else {
        await axios.post(
          `${BASE_URL}/api/profiles`,
          { ...requestData, prn: profileData.prn },
          { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
        );
      }

      if (selectedImage) {
        const formData = new FormData();
        formData.append("image", selectedImage);
        await axios.post(
          `${BASE_URL}/api/profiles/${profileData.prn}/image`,
          formData,
          { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
        );
      }

      // FIX: clean up form image preview blob URLs
      if (imagePreviewUrl) {
        // imagePreviewUrl is a data URL from FileReader — no revocation needed, just clear it
        setImagePreviewUrl(null);
      }
      setSelectedImage(null);

      await fetchUserProfile();
      setShowProfileForm(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      setFormMessage({
        text: error.response?.data?.message || "Error saving profile. Please try again.",
        type: "error",
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const getDepartmentName = (id) => {
    if (!id && id !== 0) return "Not set";
    if (typeof id === "string" && isNaN(Number(id))) return id; // already a name
    const dept = departments.find((d) => d.departmentId === parseInt(id, 10));
    return dept ? dept.name : "Not set";
  };

  const fetchUserClubs = async () => {
    setIsLoadingClubs(true);
    try {
      const response = await axios.get(`${BASE_URL}/api/user-clubs/getMyClubs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setClubs(response.data.data);
        setError(null);
      } else {
        setError("Failed to fetch clubs");
      }
    } catch (err) {
      console.error("Error fetching clubs:", err);
      setError(err.response?.data?.message || "Error fetching clubs");
    } finally {
      setIsLoadingClubs(false);
    }
  };

  const handleViewClubDetails = (club) => {
    navigate(`/club/${club.clubName}/details`);
  };

  const displayClubs = showAllClubs ? clubs : clubs.slice(0, 4);
  const profileDeletionDaysRemaining = (() => {
    if (!userAccountData || userAccountData.profileCompleted) return null;
    if (!userAccountData.createdAt) return null;

    const createdAt = new Date(userAccountData.createdAt);
    if (Number.isNaN(createdAt.getTime())) return null;

    const deletionDate = new Date(createdAt);
    deletionDate.setDate(deletionDate.getDate() + 7);
    return Math.ceil((deletionDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  })();

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      <div className={`min-h-screen flex relative ${isDarkMode ? "bg-zinc-950" : "bg-[#F8FAFC]"}`}>

        {/* Mobile Header */}
        <div className={`lg:hidden fixed top-0 left-0 right-0 px-4 py-4 flex items-center justify-between z-50 shadow-sm ${isDarkMode ? "bg-zinc-900 border-b border-zinc-800" : "bg-white border-b border-gray-100"}`}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-2 rounded-xl transition-all duration-200 hover:scale-105 cursor-pointer ${isDarkMode ? "hover:bg-zinc-800" : "hover:bg-gray-100"}`}
          >
            <Menu size={24} className={isDarkMode ? "text-zinc-100" : "text-gray-700"} />
          </button>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg" style={{ background: "linear-gradient(135deg, #4CA1AF, #315169)" }}>
              <GraduationCap className="text-white w-5 h-5" />
            </div>
            <h2 className={`text-xl font-black tracking-tight ${isDarkMode ? "text-zinc-100" : "text-gray-800"}`}>
              Teacher<span style={{ color: "#4CA1AF" }}>Hub</span>
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDarkMode((prev) => !prev)}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${isDarkMode ? "bg-zinc-800 text-zinc-100 hover:bg-zinc-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
              title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div
              className={`w-10 h-10 rounded-full overflow-hidden border-2 cursor-pointer ${isDarkMode ? "border-zinc-700" : "border-gray-100"}`}
              onClick={() => setShowProfileForm(true)}
            >
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className={`w-full h-full flex items-center justify-center ${isDarkMode ? "bg-zinc-800" : "bg-gray-100"}`}>
                  <User size={20} className={isDarkMode ? "text-zinc-400" : "text-gray-400"} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 cursor-pointer"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Sidebar ── */}
        <aside className={`
          fixed lg:sticky top-0 left-0 h-screen
          w-80 sm:w-96 ${isDarkMode ? "bg-zinc-900 border-r border-zinc-800" : "bg-white border-r border-gray-100"}
          flex flex-col p-8 shadow-lg lg:shadow-sm
          transition-transform duration-300 ease-in-out z-50
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          overflow-y-auto
        `}>
          <button
            onClick={() => setSidebarOpen(false)}
            className={`lg:hidden absolute top-4 right-4 p-2 rounded-xl transition-all duration-200 hover:rotate-90 cursor-pointer ${isDarkMode ? "hover:bg-zinc-800" : "hover:bg-gray-100"}`}
          >
            <X size={20} className={isDarkMode ? "text-zinc-400" : "text-gray-500"} />
          </button>

          <div className="flex items-center gap-3 mb-8 group cursor-pointer">
            <div
              className="p-2 rounded-xl shadow-lg"
              style={{ background: "linear-gradient(135deg, #4CA1AF, #315169)", boxShadow: "0 10px 15px -3px rgba(76, 161, 175, 0.2)" }}
            >
              <GraduationCap className="text-white w-7 h-7" />
            </div>
            <h1 className={`text-2xl font-bold tracking-tight ${isDarkMode ? "text-zinc-100" : "text-gray-800"}`}>
              Teacher<span style={{ color: "#4CA1AF" }}>Hub</span>
            </h1>
          </div>

          {/* Profile picture */}
          <div className="relative group mx-auto mb-6">
            <div className={`w-32 h-32 sm:w-40 sm:h-40 rounded-[2.5rem] overflow-hidden border-8 shadow-inner ${isDarkMode ? "border-zinc-800 bg-zinc-800" : "border-gray-50 bg-gray-100"}`}>
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className={`w-full h-full flex items-center justify-center ${isDarkMode ? "text-zinc-500" : "text-gray-400"}`}>
                  <User size={48} />
                </div>
              )}
            </div>
            <button
              onClick={() => setShowProfileForm(true)}
              className={`absolute bottom-1 right-1 p-2.5 rounded-2xl shadow-xl border transition-transform hover:scale-110 cursor-pointer ${isDarkMode ? "bg-zinc-800 border-zinc-700" : "bg-white border-gray-100"}`}
              style={{ color: "#4CA1AF" }}
            >
              <Edit size={18} />
            </button>
          </div>

          <div className="text-center mb-6">
            <h2 className={`text-xl sm:text-2xl font-bold tracking-tight leading-tight ${isDarkMode ? "text-zinc-100" : "text-gray-800"}`}>
              {profileData.fullName || user?.username}
            </h2>
            <span
              className="mt-2 inline-block text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest"
              style={{ backgroundColor: "rgba(76, 161, 175, 0.1)", color: "#4CA1AF" }}
            >
              {user?.role || "PROFESSOR"}
            </span>
          </div>

          {/* Info boxes */}
          <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar pb-4">
            <SidebarInfoBox label="Full Name" value={profileData.fullName} isDarkMode={isDarkMode} />
            <SidebarInfoBox label="Username" value={user?.username} isDarkMode={isDarkMode} />
            <SidebarInfoBox label="Staff ID" value={profileData.prn} isDarkMode={isDarkMode} />

            {/* Email with edit + verify */}
            <div className={`p-4 rounded-[1.2rem] border border-transparent transition-colors group cursor-pointer ${isDarkMode ? "bg-zinc-800/70" : "bg-gray-50/50"}`}>
              <p className={`text-[9px] uppercase font-black mb-1 tracking-widest transition-colors group-hover:text-[#4CA1AF] ${isDarkMode ? "text-zinc-500" : "text-gray-400"}`}>
                Email
              </p>
              <div className="flex items-center justify-between">
                <span className={`font-bold text-sm truncate pr-2 ${isDarkMode ? "text-zinc-100" : "text-gray-700"}`}>{currentUser.email}</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => { setNewEmail(currentUser.email); setShowEmailEditModal(true); }}
                    className={`p-1.5 rounded-lg transition-all duration-200 hover:scale-110 flex-shrink-0 cursor-pointer ${isDarkMode ? "hover:bg-zinc-700" : "hover:bg-gray-200"}`}
                    style={{ color: "#4CA1AF" }}
                    title="Edit email"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={handleVerificationRedirect}
                    className={`p-1.5 rounded-lg transition-all duration-200 hover:scale-110 flex-shrink-0 cursor-pointer ${
                      currentUser.verified
                        ? "bg-green-50 text-green-600 hover:bg-green-100"
                        : "bg-amber-50 text-amber-600 hover:bg-amber-100"
                    }`}
                    title={currentUser.verified ? "Verified" : "Click to verify"}
                  >
                    {currentUser.verified ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                  </button>
                </div>
              </div>
            </div>

            <SidebarInfoBox label="Department" value={getDepartmentName(profileData.departmentId)} isDarkMode={isDarkMode} />
            <SidebarInfoBox label="Phone" value={profileData.phoneNumber} isDarkMode={isDarkMode} />
          </div>

          {/* Sign out */}
          <button
            onClick={() =>
              setConfirmDialog({
                isOpen: true,
                title: "Sign Out",
                message: "Are you sure you want to sign out?",
                confirmText: "Sign Out",
                variant: "danger",
                onConfirm: () => { closeConfirm(); handleLogout(); },
              })
            }
            className={`mt-4 flex items-center justify-center gap-3 text-red-500 font-bold py-4 rounded-[1.5rem] transition-all border border-transparent cursor-pointer ${isDarkMode ? "hover:bg-red-500/10 hover:border-red-500/20" : "hover:bg-red-50 hover:border-red-100"}`}
          >
            <LogOut size={20} /> Sign Out
          </button>
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10 overflow-y-auto max-h-screen lg:mt-0 mt-16">

          {/* Profile incomplete deletion warning */}
          {profileDeletionDaysRemaining !== null && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <AlertTriangle className="text-red-500 flex-shrink-0" size={20} />
              <div className="flex-1">
                <p className="text-red-800 font-bold text-sm">
                  Profile incomplete - account scheduled for deletion
                </p>
                <p className="text-red-600 text-xs mt-0.5">
                  {profileDeletionDaysRemaining > 0
                    ? `Complete your profile within ${profileDeletionDaysRemaining === 1 ? "1 day" : `${profileDeletionDaysRemaining} days`} or your account will be deleted 7 days after registration.`
                    : "Your account is overdue for deletion. Complete your profile immediately to avoid losing access."}
                </p>
              </div>
              <button
                onClick={() => setShowProfileForm(true)}
                className="text-xs font-bold px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors cursor-pointer whitespace-nowrap"
              >
                Complete Profile
              </button>
            </div>
          )}

          {/* Unverified banner */}
          {!currentUser.verified && (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
              <AlertCircle className="text-amber-500 flex-shrink-0" size={20} />
              <div className="flex-1">
                <p className="text-amber-800 font-bold text-sm">Account not verified</p>
                <p className="text-amber-600 text-xs mt-0.5">Please verify your email to unlock all features.</p>
              </div>
              <button
                onClick={handleVerificationRedirect}
                className="text-xs font-bold px-4 py-2 bg-amber-500 text-white rounded-full hover:bg-amber-600 transition-colors cursor-pointer whitespace-nowrap"
              >
                Verify Now
              </button>
            </div>
          )}

          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6 sm:mb-10">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">Dashboard</h1>
              <p className={`text-xs sm:text-sm mt-1 ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>
                Welcome back,{" "}
                <span className="font-semibold" style={{ color: "#4CA1AF" }}>
                  Prof. {profileData.fullName || user?.username}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsDarkMode((prev) => !prev)}
                className={`px-3 py-2 rounded-full text-xs font-bold transition-colors cursor-pointer ${isDarkMode ? "bg-zinc-800 text-zinc-100 hover:bg-zinc-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
              >
                {isDarkMode ? "Light" : "Dark"}
              </button>
              <div className="flex items-center gap-2 sm:gap-3 bg-green-50 text-green-600 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full border border-green-100">
                <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest">All Systems Live</span>
              </div>
            </div>
          </header>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <StatCard icon={<Calendar />} label="Events Managed" value={eventsManagedCount.toString()} color="blue" isDarkMode={isDarkMode} />
            <StatCard icon={<Trophy />} label="My Clubs" value={clubs.length.toString()} color="green" isDarkMode={isDarkMode} />
            <StatCard icon={<Users />} label="Assigned Students" value={assignedStudentsCount.toString()} color="orange" isDarkMode={isDarkMode} />
          </div>

          <div className="grid grid-cols-1 gap-8">

            {/* Control center */}
            <section className={`rounded-[2.5rem] p-6 sm:p-10 shadow-sm border h-fit ${isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-50"}`}>
              <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-10">
                <div
                  className="w-1.5 h-10 rounded-full"
                  style={{ background: "linear-gradient(to bottom, #4CA1AF, #315169)" }}
                />
                <h2 className={`text-2xl font-bold ${isDarkMode ? "text-zinc-100" : "text-gray-800"}`}>Professor Control Center</h2>
              </div>

              <div className="relative">
                {!currentUser.verified && (
                  <div className={`absolute inset-0 z-10 rounded-2xl backdrop-blur-[2px] flex flex-col items-center justify-center gap-3 ${isDarkMode ? "bg-zinc-950/65" : "bg-white/60"}`}>
                    <div className="bg-amber-100 p-4 rounded-full">
                      <svg className="w-8 h-8 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className={`font-bold text-sm ${isDarkMode ? "text-zinc-100" : "text-gray-700"}`}>Verify your email to access these features</p>
                    <button
                      onClick={handleVerificationRedirect}
                      className="text-xs font-bold px-5 py-2 bg-amber-500 text-white rounded-full hover:bg-amber-600 transition-colors cursor-pointer"
                    >
                      Verify Now
                    </button>
                  </div>
                )}

                <div className={`grid grid-cols-2 lg:grid-cols-3 gap-6 ${!currentUser.verified ? "opacity-40 pointer-events-none select-none" : ""}`}>
                  <ActionCard icon={<CalendarPlus size={24} />} label="Events" color="blue" onClick={() => navigate("/events")} isDarkMode={isDarkMode} />
                  <ActionCard icon={<Users size={24} />} label="Add Student" color="teal" onClick={() => navigate("/add-users-with-club")} isDarkMode={isDarkMode} />
                  <ActionCard icon={<Building2 size={24} />} label="Club Association" color="orange" onClick={() => navigate("/remove-users-from-club")} isDarkMode={isDarkMode} />
                  <ActionCard icon={<Trophy size={24} />} label="Clubs" color="teal" onClick={() => navigate("/manage-clubs")} isDarkMode={isDarkMode} />
                  <button
                    onClick={() => navigate("/notifications")}
                    className={`p-8 rounded-2xl border transition-all hover:scale-[1.02] flex flex-col items-center justify-center gap-4 group shadow-sm cursor-pointer w-full ${isDarkMode ? "border-zinc-800" : "border-gray-50/50"}`}
                    style={{ backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.03)" : "rgba(76, 161, 175, 0.05)" }}
                  >
                    <div
                      className={`relative p-4 rounded-xl shadow-sm group-hover:shadow-md transition-all group-hover:-translate-y-1 ${isDarkMode ? "bg-zinc-800" : "bg-white"}`}
                      style={{ color: "#4CA1AF" }}
                    >
                      <Bell size={24} />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </div>
                    <span className={`font-black uppercase text-xs tracking-widest ${isDarkMode ? "text-zinc-100" : "text-gray-700"}`}>Notifications</span>
                  </button>
                </div>
              </div>
            </section>

            {/* My clubs */}
            {(isLoadingClubs || error || clubs.length > 0) && (
              <section className={`rounded-[2.5rem] p-6 sm:p-10 shadow-sm border ${isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-50"}`}>
                <div className="flex items-center justify-between gap-3 mb-6 sm:mb-8">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <h2 className={`text-xl sm:text-2xl font-bold ${isDarkMode ? "text-zinc-100" : "text-gray-800"}`}>My Clubs</h2>
                    <div className={`h-[1px] w-16 ${isDarkMode ? "bg-zinc-700" : "bg-gray-100"}`} />
                  </div>
                  <button
                    onClick={fetchUserClubs}
                    disabled={isLoadingClubs || !currentUser.verified}
                    className="text-xs font-bold px-5 py-2.5 rounded-full transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ color: "#4CA1AF", backgroundColor: "rgba(76, 161, 175, 0.1)" }}
                  >
                    <svg className={`w-3 sm:w-4 h-3 sm:h-4 ${isLoadingClubs ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {isLoadingClubs ? "Refreshing..." : "Refresh"}
                  </button>
                </div>

                {!currentUser.verified ? (
                  <div className="py-16 text-center border-2 border-dashed border-amber-200 rounded-[2rem] bg-amber-50/30">
                    <div className="bg-amber-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-9 h-9 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? "text-zinc-100" : "text-gray-700"}`}>Clubs Locked</h3>
                    <p className={`text-sm mb-6 px-4 ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>Verify your email address to view and manage your club memberships.</p>
                    <button onClick={handleVerificationRedirect} className="text-white px-8 py-3 rounded-full text-sm font-bold shadow-lg transition-colors cursor-pointer bg-amber-500 hover:bg-amber-600">
                      Verify Email
                    </button>
                  </div>
                ) : isLoadingClubs ? (
                  <div className="py-16 text-center">
                    <div className="animate-spin w-12 h-12 border-4 rounded-full mx-auto mb-4" style={{ borderColor: "rgba(76, 161, 175, 0.2)", borderTopColor: "#4CA1AF" }} />
                    <p className={`font-medium ${isDarkMode ? "text-zinc-300" : "text-gray-500"}`}>Loading your clubs...</p>
                  </div>
                ) : error ? (
                  <div className="bg-red-50 rounded-[2rem] p-8 text-center border border-red-100">
                    <div className="text-red-500 mb-3">
                      <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? "text-zinc-100" : "text-gray-800"}`}>Unable to Load Clubs</h3>
                    <p className="text-red-500/70 mb-5">{error}</p>
                    <button onClick={fetchUserClubs} className={`px-8 py-3 rounded-full text-sm font-bold border transition-colors cursor-pointer ${isDarkMode ? "bg-zinc-800" : "bg-white"}`} style={{ color: "#4CA1AF", borderColor: "rgba(76, 161, 175, 0.2)" }}>
                      Try Again
                    </button>
                  </div>
                ) : clubs.length === 0 ? (
                  <div className={`py-16 text-center border-2 border-dashed rounded-[2rem] ${isDarkMode ? "border-zinc-700" : "border-gray-200"}`}>
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-5 ${isDarkMode ? "bg-zinc-800" : "bg-gray-50"}`}>
                      <Trophy className="text-gray-400 w-12 h-12" />
                    </div>
                    <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? "text-zinc-100" : "text-gray-800"}`}>No Clubs Assigned Yet</h3>
                    <p className={`mb-8 ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>You haven't been assigned to any clubs yet.</p>
                    <button onClick={() => navigate("/manage-clubs")} className="text-white px-10 py-4 rounded-full text-sm font-bold shadow-lg transition-colors cursor-pointer" style={{ background: "linear-gradient(135deg, #4CA1AF, #315169)" }}>
                      Browse Clubs
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {displayClubs.map((club) => (
                        <CompactClubCard key={club.clubId} club={club} onViewDetails={handleViewClubDetails} isDarkMode={isDarkMode} />
                      ))}
                    </div>
                    {clubs.length > 4 && (
                      <div className="text-center mt-8">
                        <button
                          onClick={() => setShowAllClubs(!showAllClubs)}
                          className={`px-8 py-4 rounded-full text-sm font-bold border transition-colors inline-flex items-center gap-2 cursor-pointer ${isDarkMode ? "bg-zinc-800" : "bg-white"}`}
                          style={{ color: "#4CA1AF", borderColor: "rgba(76, 161, 175, 0.2)" }}
                        >
                          {showAllClubs ? "Show Less" : `Show All (${clubs.length} Clubs)`}
                          <svg className={`w-4 h-4 transition-transform ${showAllClubs ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </>
                )}
              </section>
            )}
          </div>
        </main>

        {/* ── Profile form modal ── */}
        {showProfileForm && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className={`rounded-[2.5rem] shadow-2xl max-w-xl w-full p-8 ${isDarkMode ? "bg-zinc-900" : "bg-white"}`}>
              <div className="flex justify-between items-center mb-8">
                <h3 className={`text-2xl font-bold ${isDarkMode ? "text-zinc-100" : "text-gray-800"}`}>
                  {profileExists ? "Edit Profile" : "Complete Profile"}
                </h3>
                <button
                  onClick={() => { setShowProfileForm(false); setFormMessage({ text: "", type: "" }); setSelectedImage(null); setImagePreviewUrl(null); }}
                  className={`p-2 rounded-full hover:text-red-500 transition-colors cursor-pointer ${isDarkMode ? "bg-zinc-800 hover:bg-zinc-700" : "bg-gray-50 hover:bg-red-50"}`}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmitProfile} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <FormInput label="Staff ID (Read Only)" value={profileData.prn} readOnly isDarkMode={isDarkMode} />
                  <FormInput
                    label="Full Name"
                    value={profileData.fullName}
                    onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                    isDarkMode={isDarkMode}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 ml-1 uppercase tracking-widest">Department</label>
                    <CustomSelect
                      name="departmentId"
                      value={profileData.departmentId}
                      onChange={(e) => setProfileData({ ...profileData, departmentId: e.target.value })}
                      options={departments.map((dept) => ({ value: dept.departmentId, label: dept.name }))}
                      placeholder="Select Dept"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    {/* FIX: year options include 0 = Faculty for teacher accounts */}
                    <label className="text-[10px] font-black text-gray-400 ml-1 uppercase tracking-widest">Year</label>
                    <CustomSelect
                      name="year"
                      value={profileData.year}
                      onChange={(e) => setProfileData({ ...profileData, year: Number(e.target.value) })}
                      options={[
                        { value: 0, label: "Faculty" },
                        { value: 1, label: "Year 1" },
                        { value: 2, label: "Year 2" },
                        { value: 3, label: "Year 3" },
                        { value: 4, label: "Year 4" },
                      ]}
                      placeholder="Select Year"
                      required
                    />
                  </div>
                </div>

                <FormInput
                  label="Phone Number"
                  value={profileData.phoneNumber}
                  onChange={(e) => setProfileData({ ...profileData, phoneNumber: e.target.value })}
                  isDarkMode={isDarkMode}
                  required
                />

                {/* Image upload with preview */}
                <div className={`p-6 rounded-2xl border-2 border-dashed text-center transition-colors cursor-pointer ${isDarkMode ? "bg-zinc-800 border-zinc-700" : "bg-gray-50 border-gray-200"}`}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      setSelectedImage(file);
                      // FIX: use FileReader for preview (data URL) — NOT URL.createObjectURL
                      // so we never accidentally call revokeObjectURL on a data: URL
                      const reader = new FileReader();
                      reader.onloadend = () => setImagePreviewUrl(reader.result);
                      reader.readAsDataURL(file);
                    }}
                    className="hidden"
                    id="profile-upload"
                  />
                  <label htmlFor="profile-upload" className={`cursor-pointer flex flex-col items-center gap-2 hover:text-[#4CA1AF] ${isDarkMode ? "text-zinc-300" : "text-gray-500"}`}>
                    {imagePreviewUrl ? (
                      <img src={imagePreviewUrl} alt="Preview" className="w-20 h-20 rounded-2xl object-cover mx-auto mb-1" />
                    ) : (
                      <Upload size={24} />
                    )}
                    <span className="text-sm font-semibold">
                      {selectedImage ? selectedImage.name : "Upload Profile Photo"}
                    </span>
                  </label>
                </div>

                {/* FIX: show form-level error/success messages */}
                {formMessage.text && (
                  <div className={`p-3 rounded-xl text-sm font-semibold ${formMessage.type === "error" ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"}`}>
                    {formMessage.type === "error" ? "⚠ " : "✓ "}{formMessage.text}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={profileLoading}
                  className="w-full text-white py-4 rounded-2xl font-bold shadow-lg transition-all disabled:opacity-50 cursor-pointer"
                  style={{ background: "linear-gradient(135deg, #4CA1AF, #315169)" }}
                >
                  {profileLoading ? "Saving..." : profileExists ? "Update Profile" : "Complete Profile"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ── Email edit modal ── */}
        {showEmailEditModal && (
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center p-6 z-50">
            <div className={`rounded-[2.5rem] shadow-2xl max-w-md w-full overflow-hidden border ${isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-white"}`}>
              <div className="p-6 text-white" style={{ background: "linear-gradient(135deg, #4CA1AF, #315169)" }}>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Mail size={20} /> Update Email Address
                    </h3>
                    <p className="text-white/80 text-sm mt-1">Enter your new email address</p>
                  </div>
                  <button
                    onClick={() => { setShowEmailEditModal(false); setEmailMessage({ text: "", type: "" }); setNewEmail(""); }}
                    className="bg-white/20 p-2 rounded-xl hover:bg-white/30 transition-all duration-200 hover:rotate-90 cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? "text-zinc-200" : "text-gray-700"}`}>Current Email</label>
                  <input type="email" value={currentUser.email} className={`w-full px-4 py-3 border-2 rounded-xl cursor-not-allowed ${isDarkMode ? "bg-zinc-800 border-zinc-700 text-zinc-300" : "bg-gray-100 border-gray-200 text-gray-600"}`} disabled />
                </div>
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? "text-zinc-200" : "text-gray-700"}`}>
                    New Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all ${isDarkMode ? "bg-zinc-800 border-zinc-700 text-zinc-100" : "border-gray-200"}`}
                    onFocus={(e) => (e.target.style.boxShadow = "0 0 0 2px rgba(76, 161, 175, 0.2)")}
                    onBlur={(e) => (e.target.style.boxShadow = "")}
                    placeholder="Enter new email address"
                    required
                  />
                </div>

                {emailMessage.text && (
                  <div className={`p-3 rounded-xl ${emailMessage.type === "error" ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"}`}>
                    <p className="text-sm font-semibold flex items-center gap-2">
                      {emailMessage.type === "success" ? "✓" : "⚠"} {emailMessage.text}
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={async () => {
                    if (!newEmail.trim()) {
                      setEmailMessage({ text: "Please enter a valid email", type: "error" });
                      return;
                    }
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(newEmail)) {
                      setEmailMessage({ text: "Please enter a valid email address", type: "error" });
                      return;
                    }
                    setEmailLoading(true);
                    setEmailMessage({ text: "", type: "" });
                    try {
                      const response = await axios.put(
                        `${BASE_URL}/api/users/changeEmail/${currentUser.prn}/${encodeURIComponent(newEmail)}`,
                        {},
                        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
                      );
                      if (response.data) {
                        const updatedUser = { ...currentUser, email: newEmail, verified: false };
                        localStorage.setItem("user", JSON.stringify(updatedUser));
                        setCurrentUser(updatedUser);
                        setEmailMessage({ text: "Email updated! OTP sent to your new email...", type: "success" });
                        localStorage.setItem("verificationEmail", newEmail);
                        localStorage.setItem("verificationOldEmail", currentUser.email);
                        localStorage.setItem("verificationPRN", currentUser.prn);
                        localStorage.setItem("verificationMode", "email_change");
                        localStorage.setItem("verificationReturnUrl", "/dashboard");
                        setTimeout(() => {
                          setShowEmailEditModal(false);
                          setEmailMessage({ text: "", type: "" });
                          setNewEmail("");
                          navigate("/verifyotp");
                        }, 1500);
                      }
                    } catch (error) {
                      console.error("Error changing email:", error);
                      setEmailMessage({
                        text: error.response?.data?.message || "Failed to update email. Please try again.",
                        type: "error",
                      });
                    } finally {
                      setEmailLoading(false);
                    }
                  }}
                  disabled={emailLoading || !newEmail || newEmail === currentUser.email}
                  className="w-full text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                  style={{ background: "linear-gradient(135deg, #4CA1AF, #315169)" }}
                >
                  {emailLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Updating & Sending OTP...
                    </div>
                  ) : (
                    "Update Email"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        variant={confirmDialog.variant}
        onConfirm={confirmDialog.onConfirm}
        onCancel={closeConfirm}
      />
    </>
  );
}

/* ── Helper components ───────────────────────────────────────────────────────── */

function SidebarInfoBox({ label, value, isDarkMode = false }) {
  return (
    <div className={`p-4 rounded-[1.2rem] border border-transparent transition-colors group cursor-pointer ${isDarkMode ? "bg-zinc-800/70" : "bg-gray-50/50"}`}>
      <p className={`text-[9px] uppercase font-black mb-1 tracking-widest transition-colors group-hover:text-[#4CA1AF] ${isDarkMode ? "text-zinc-500" : "text-gray-400"}`}>
        {label}
      </p>
      <p className={`font-bold text-sm truncate ${isDarkMode ? "text-zinc-100" : "text-gray-700"}`}>{value || "Not set"}</p>
    </div>
  );
}

function StatCard({ icon, label, value, color, isDarkMode = false }) {
  const bgColors = {
    blue:   { bg: "rgba(76, 161, 175, 0.1)", text: "#4CA1AF" },
    green:  { bg: "rgba(16, 185, 129, 0.1)", text: "#10B981" },
    orange: { bg: "rgba(249, 115, 22, 0.1)", text: "#F97316" },
    purple: { bg: "rgba(76, 161, 175, 0.1)", text: "#4CA1AF" },
    red:    { bg: "rgba(239, 68, 68, 0.1)",  text: "#EF4444" },
  };
  const theme = isDarkMode
    ? { bg: "rgba(255, 255, 255, 0.06)", text: "#E4E4E7" }
    : (bgColors[color] || bgColors.blue);
  return (
    <div className={`p-7 rounded-[2.5rem] shadow-sm border flex items-center gap-6 cursor-pointer hover:shadow-md transition-all ${isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-50"}`}>
      <div className="p-5 rounded-[1.5rem]" style={{ backgroundColor: theme.bg, color: theme.text }}>
        {icon}
      </div>
      <div>
        <p className={`text-xs font-black uppercase tracking-widest mb-1 ${isDarkMode ? "text-zinc-500" : "text-gray-400"}`}>{label}</p>
        <h3 className={`text-2xl font-black tracking-tight ${isDarkMode ? "text-zinc-100" : "text-gray-800"}`}>{value}</h3>
      </div>
    </div>
  );
}

function CompactClubCard({ club, onViewDetails, isDarkMode = false }) {
  const clubName = club.clubName || "Unnamed Club";
  const clubDescription = club.desc || club.description || "No description available";
  const memberCount = club.memberCount ?? 0;
  const clubLogo = club.logo || null;

  const colors = ["blue", "orange", "purple", "green", "red"];
  const color = colors[clubName.length % colors.length];

  const bgColors = isDarkMode
    ? {
        blue: { bg: "rgba(255, 255, 255, 0.06)", text: "#E4E4E7" },
        orange: { bg: "rgba(255, 255, 255, 0.06)", text: "#E4E4E7" },
        purple: { bg: "rgba(255, 255, 255, 0.06)", text: "#E4E4E7" },
        green: { bg: "rgba(255, 255, 255, 0.06)", text: "#E4E4E7" },
        red: { bg: "rgba(255, 255, 255, 0.06)", text: "#E4E4E7" },
      }
    : {
    blue:   { bg: "rgba(76, 161, 175, 0.1)", text: "#4CA1AF" },
    orange: { bg: "rgba(249, 115, 22, 0.1)", text: "#F97316" },
    purple: { bg: "rgba(76, 161, 175, 0.1)", text: "#4CA1AF" },
    green:  { bg: "rgba(16, 185, 129, 0.1)", text: "#10B981" },
    red:    { bg: "rgba(239, 68, 68, 0.1)",  text: "#EF4444" },
  };

  return (
    <div
      className={`rounded-2xl p-5 transition-all cursor-pointer border ${isDarkMode ? "bg-zinc-800/70 hover:bg-zinc-800 border-zinc-700" : "bg-gray-50/50 hover:bg-gray-50 border-transparent hover:border-gray-200"}`}
      onClick={() => onViewDetails(club)}
    >
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: bgColors[color].bg }}>
          {clubLogo ? (
            <img src={clubLogo} alt={clubName} className="w-7 h-7 object-contain" />
          ) : (
            <Trophy className="w-6 h-6" style={{ color: bgColors[color].text }} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`font-extrabold text-lg truncate pr-2 ${isDarkMode ? "text-zinc-100" : "text-gray-800"}`} title={clubName}>{clubName}</h3>
          <p className={`text-sm mt-1 line-clamp-2 mb-2 ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`} title={clubDescription}>{clubDescription}</p>
          <div className="flex items-center gap-1.5">
            <Users className={`w-4 h-4 ${isDarkMode ? "text-zinc-500" : "text-gray-400"}`} />
            <span className={`text-xs font-bold ${isDarkMode ? "text-zinc-300" : "text-gray-600"}`}>{memberCount} members</span>
          </div>
        </div>
        <ChevronRight size={20} className={isDarkMode ? "text-zinc-600" : "text-gray-300"} />
      </div>
    </div>
  );
}

function ActionCard({ icon, label, color, onClick, isDarkMode = false }) {
  const themes = isDarkMode
    ? {
        blue: { bg: "rgba(255, 255, 255, 0.03)", icon: "#E4E4E7" },
        red: { bg: "rgba(255, 255, 255, 0.03)", icon: "#E4E4E7" },
        teal: { bg: "rgba(255, 255, 255, 0.03)", icon: "#E4E4E7" },
        orange: { bg: "rgba(255, 255, 255, 0.03)", icon: "#E4E4E7" },
      }
    : {
        blue: { bg: "rgba(76, 161, 175, 0.05)", icon: "#4CA1AF" },
        red: { bg: "rgba(239, 68, 68, 0.05)", icon: "#EF4444" },
        teal: { bg: "rgba(76, 161, 175, 0.05)", icon: "#4CA1AF" },
        orange: { bg: "rgba(249, 115, 22, 0.05)", icon: "#F97316" },
      };
  const theme = themes[color] || themes.blue;
  return (
    <button
      onClick={onClick}
      className={`p-8 rounded-2xl border transition-all hover:scale-[1.02] flex flex-col items-center justify-center gap-4 group shadow-sm cursor-pointer w-full ${isDarkMode ? "border-zinc-800" : "border-gray-50/50"}`}
      style={{ backgroundColor: theme.bg }}
    >
      <div className={`p-4 rounded-xl shadow-sm group-hover:shadow-md transition-all group-hover:-translate-y-1 ${isDarkMode ? "bg-zinc-800" : "bg-white"}`} style={{ color: theme.icon }}>
        {icon}
      </div>
      <span className={`font-black uppercase text-xs tracking-widest ${isDarkMode ? "text-zinc-100" : "text-gray-700"}`}>{label}</span>
    </button>
  );
}

function FormInput({ label, isDarkMode = false, ...props }) {
  return (
    <div className="space-y-1">
      <label className={`text-[10px] font-black ml-1 uppercase tracking-widest ${isDarkMode ? "text-zinc-500" : "text-gray-400"}`}>{label}</label>
      <input
        className={`w-full px-4 py-3.5 border-none rounded-2xl focus:ring-2 outline-none font-medium transition-all cursor-text ${isDarkMode ? "bg-zinc-800 text-zinc-100" : "bg-gray-50 text-gray-700"}`}
        {...props}
      />
    </div>
  );
}