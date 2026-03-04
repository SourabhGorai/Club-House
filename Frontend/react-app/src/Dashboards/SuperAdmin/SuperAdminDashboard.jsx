// import { useState, useEffect } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import ConfirmDialog from "../../components/ConfirmDialog";
// import {
//   User,
//   Upload,
//   X,
//   CalendarDays,
//   Edit,
//   Users,
//   Briefcase,
//   ShieldCheck,
//   Settings,
//   Database,
//   LogOut,
//   LayoutDashboard,
//   UserPlus,
//   ShieldAlert,
//   Menu,
//   Camera,
//   Trash2,
//   Plus,
//   Building2,
//   CalendarPlus,
// } from "lucide-react";

// export default function SuperAdminDashboard() {
//   const navigate = useNavigate();
  
//   // Define the primary color as a constant for consistency
//   const PRIMARY_COLOR = "#4CA1AF";
//   const PRIMARY_DARK = "#2d8391";
//   const PRIMARY_LIGHT = "rgba(76, 161, 175, 0.1)";
  
//   // Get user data from localStorage
//   const user = JSON.parse(localStorage.getItem("user"));
//   const token = localStorage.getItem("token");

//   const [currentUser] = useState({
//     username: user?.username || "admin_user",
//     email: user?.email || "admin@college.edu",
//     role: user?.role || "SUPER_ADMIN",
//     prn: user?.prn || "2021BCS001",
//     verified: user?.verified || true,
//   });
//   console.log(user);

//   const [users, setUsers] = useState([]);
//   const [stats, setStats] = useState({});
//   const [clubAdmins, setCount] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   // Profile states
//   const [showProfileForm, setShowProfileForm] = useState(false);
//   const [profileData, setProfileData] = useState({
//     prn: user?.prn || "",
//     fullName: "",
//     department: "",
//     year: "",
//     phoneNumber: "",
//     departmentId: "",
//   });
//   const [selectedImage, setSelectedImage] = useState(null);
//   const [imagePreview, setImagePreview] = useState(null);
//   const [profileLoading, setProfileLoading] = useState(false);
//   const [message, setMessage] = useState({ text: "", type: "" });
//   const [userProfile, setUserProfile] = useState(null);
//   const [isLoadingProfile, setIsLoadingProfile] = useState(true);

//   // Department CRUD States
//   const [showDeptModal, setShowDeptModal] = useState(false);
//   const [departments, setDepartments] = useState([]);
//   const [deptLoading, setDeptLoading] = useState(false);
//   const [editingDept, setEditingDept] = useState(null);
//   const [deptInput, setDeptInput] = useState("");
//   const [deptMessage, setDeptMessage] = useState({ text: "", type: "" });
//   const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: "", message: "", variant: "primary", confirmText: "Confirm", onConfirm: () => {} });
//   const closeConfirm = () => setConfirmDialog((prev) => ({ ...prev, isOpen: false }));

//   useEffect(() => {
//     fetchUserCount();
//     fetchAllData();
//     fetchUserProfile();
//   }, []);

//   const fetchUserCount = async () => {
//     try {
//       const response = await axios.get(
//         "http://localhost:8080/api/user-clubs/getAllByRole/CLUB_ADMIN",
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         },
//       );
//       setCount(response.data.data.length);
//     } catch (error) {
//       console.error("Error fetching club admin count:", error);
//     }
//   };

//   // Fetch all users and calculate stats
//   const fetchAllData = async () => {
//     try {
//       const usersResponse = await axios.get(
//         "http://localhost:8080/api/users/",
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         },
//       );

//       setUsers(usersResponse.data);

//       const userStats = usersResponse.data.reduce((acc, user) => {
//         acc[user.role] = (acc[user.role] || 0) + 1;
//         return acc;
//       }, {});

//       setStats(userStats);
//       setLoading(false);
//     } catch (error) {
//       console.error("Error fetching data:", error);
//       setLoading(false);
//     }
//   };

//   const fetchDepartments = async () => {
//     setDeptLoading(true);
//     setDeptMessage({ text: "", type: "" });
//     try {
//       const response = await axios.get("http://localhost:8080/api/department", {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       });

//       console.log("Departments fetched:", response.data.data);

//       if (response.data.success && response.data.data) {
//         setDepartments(response.data.data);
//       } else {
//         setDepartments([]);
//         setDeptMessage({
//           text: response.data.message || "No departments found",
//           type: "error",
//         });
//       }
//     } catch (error) {
//       console.error("Error fetching departments:", error);
//       setDepartments([]);
//       setDeptMessage({ text: "Error fetching departments", type: "error" });
//     } finally {
//       setDeptLoading(false);
//     }
//   };

//   // Handle department form submission (Create/Update)
//   const handleDeptSubmit = async (e) => {
//     e.preventDefault();
//     if (!deptInput.trim()) {
//       setDeptMessage({ text: "Please enter a department name", type: "error" });
//       return;
//     }

//     try {
//       if (editingDept) {
//         const response = await axios.put(
//           `http://localhost:8080/api/department/${editingDept.departmentId}`,
//           {
//             name: deptInput,
//             active: true,
//           },
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//               "Content-Type": "application/json",
//             },
//           },
//         );

//         if (response.data.success) {
//           setDeptMessage({
//             text: "Department updated successfully!",
//             type: "success",
//           });
//         } else {
//           setDeptMessage({
//             text: response.data.message || "Failed to update department",
//             type: "error",
//           });
//           return;
//         }
//       } else {
//         const response = await axios.post(
//           `http://localhost:8080/api/department/${deptInput}`,
//           null,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//               "Content-Type": "application/json",
//             },
//           },
//         );

//         if (response.data.success) {
//           setDeptMessage({
//             text: "Department added successfully!",
//             type: "success",
//           });
//         } else {
//           setDeptMessage({
//             text: response.data.message || "Failed to add department",
//             type: "error",
//           });
//           return;
//         }
//       }

//       setDeptInput("");
//       setEditingDept(null);
//       setTimeout(() => {
//         setDeptMessage({ text: "", type: "" });
//       }, 3000);
//       fetchDepartments();
//     } catch (error) {
//       console.error("Error saving department:", error);
//       setDeptMessage({
//         text: error.response?.data?.message || "Error saving department",
//         type: "error",
//       });
//     }
//   };

//   // Delete department
//   const deleteDepartment = async (departmentId) => {
//     try {
//       const response = await axios.delete(
//         `http://localhost:8080/api/department/${departmentId}`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         },
//       );

//       if (response.data.success) {
//         setDeptMessage({
//           text: "Department deleted successfully!",
//           type: "success",
//         });
//         fetchDepartments();
//       } else {
//         setDeptMessage({
//           text: response.data.message || "Failed to delete department",
//           type: "error",
//         });
//       }

//       setTimeout(() => {
//         setDeptMessage({ text: "", type: "" });
//       }, 3000);
//     } catch (error) {
//       console.error("Error deleting department:", error);
//       setDeptMessage({
//         text: error.response?.data?.message || "Error deleting department",
//         type: "error",
//       });
//     }
//   };

//   // Fetch user profile data
//   const fetchUserProfile = async () => {
//     try {
//       setIsLoadingProfile(true);
//       const response = await axios.get(
//         `http://localhost:8080/api/profiles/prn/${user?.prn}`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         },
//       );

//       if (response.data) {
//         setUserProfile(response.data);
//         setProfileData({
//           prn: response.data.data.prn || user?.prn || "",
//           fullName: response.data.data.fullName || "",
//           department: response.data.data.department || "",
//           year: response.data.data.year || "",
//           phoneNumber: response.data.data.phoneNumber || "",
//           departmentId: response.data.data.departmentId || "",
//         });

//         fetchProfileImage();
//       }
//     } catch (error) {
//       console.error("Error fetching profile:", error);
//       setUserProfile(null);
//       setProfileData((prev) => ({
//         ...prev,
//         prn: user?.prn || "",
//       }));
//     } finally {
//       setIsLoadingProfile(false);
//     }
//   };

//   const fetchProfileImage = async () => {
//     try {
//       const response = await axios.get(
//         `http://localhost:8080/api/profiles/${user?.prn}/image`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//           responseType: "blob",
//         },
//       );

//       if (response.data) {
//         const imageUrl = URL.createObjectURL(response.data);
//         setImagePreview(imageUrl);
//       }
//     } catch (error) {
//       console.error("Error fetching profile image:", error);
//       setImagePreview(null);
//     }
//   };

//   const handleLogout = () => {
//     localStorage.removeItem("user");
//     localStorage.removeItem("token");
//     window.location.href = "/login";
//   };

//   const handleInputChange = (e) => {
//     setProfileData({
//       ...profileData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setSelectedImage(file);
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setImagePreview(reader.result);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleSubmitProfile = async (e) => {
//     e.preventDefault();
//     setProfileLoading(true);
//     try {
//       const requestData = {
//         fullName: profileData.fullName,
//         departmentId: parseInt(profileData.departmentId),
//         phoneNumber: profileData.phoneNumber,
//       };

//       if (userProfile) {
//         await axios.put(
//           `http://localhost:8080/api/profiles/${profileData.prn}`,
//           requestData,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//               "Content-Type": "application/json",
//             },
//           },
//         );
//       } else {
//         await axios.post(
//           "http://localhost:8080/api/profiles",
//           { ...requestData, prn: profileData.prn },
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//               "Content-Type": "application/json",
//             },
//           },
//         );
//       }

//       if (selectedImage) {
//         const formData = new FormData();
//         formData.append("image", selectedImage);
//         await axios.post(
//           `http://localhost:8080/api/profiles/${profileData.prn}/image`,
//           formData,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//               "Content-Type": "multipart/form-data",
//             },
//           },
//         );
//       }

//       fetchUserProfile();
//       setShowProfileForm(false);
//     } catch (error) {
//       setMessage({ text: "Error saving profile.", type: "error" });
//     } finally {
//       setProfileLoading(false);
//     }
//   };

//   const StatCard = ({ title, count, icon: Icon, bgColor, iconColor }) => (
//     <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer group">
//       <div
//         className="p-4 rounded-xl flex-shrink-0 transition-all duration-300 group-hover:scale-110"
//         style={{ backgroundColor: bgColor || PRIMARY_LIGHT, color: iconColor || PRIMARY_COLOR }}
//       >
//         <Icon className="w-7 h-7" />
//       </div>
//       <div className="min-w-0">
//         <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider truncate group-hover:text-gray-700 transition-colors">
//           {title}
//         </p>
//         <p className="text-3xl font-bold text-gray-900">{count}</p>
//       </div>
//     </div>
//   );

//   const BigActionButton = ({ label, icon: Icon, onClick, bgColor, iconColor }) => (
//     <button
//       onClick={onClick}
//       className="group flex flex-col items-center justify-center p-8 rounded-3xl transition-all duration-300 bg-white border-2 border-gray-100 hover:shadow-xl min-h-[160px] hover:-translate-y-2 cursor-pointer"
//     >
//       <div
//         className="p-5 rounded-2xl mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm"
//         style={{ backgroundColor: bgColor || PRIMARY_LIGHT, color: iconColor || PRIMARY_COLOR }}
//       >
//         <Icon className="w-8 h-8" />
//       </div>
//       <span className="text-lg font-bold text-gray-700 transition-colors text-center px-2">
//         {label}
//       </span>
//     </button>
//   );

//   if (loading || isLoadingProfile) {
//     return (
//       <div className="min-h-screen bg-[#fcfcfd] flex items-center justify-center">
//         <div className="text-center">
//           <div 
//             className="animate-spin rounded-full h-16 w-16 border-b-2 mx-auto mb-4 cursor-wait" 
//             style={{ borderColor: PRIMARY_DARK }}
//           ></div>
//           <p className="text-gray-600 font-semibold">Loading dashboard...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <>
//     <div className="min-h-screen bg-[#fcfcfd] flex relative">
//       {/* Mobile Header */}
//       <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between z-50 shadow-sm">
//         <button
//           onClick={() => setSidebarOpen(!sidebarOpen)}
//           className="p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 hover:scale-105 cursor-pointer"
//         >
//           <Menu size={24} className="text-gray-700" />
//         </button>
//         <div className="flex items-center space-x-2">
//           <div 
//             className="p-2 rounded-lg transition-transform hover:scale-105 cursor-pointer" 
//             style={{ background: `linear-gradient(135deg, ${PRIMARY_COLOR}, #315169)` }}
//           >
//             <LayoutDashboard className="text-white w-5 h-5" />
//           </div>
//           <h2 className="text-xl font-black tracking-tight text-gray-800">
//             Super<span style={{ color: PRIMARY_COLOR }}>Admin</span>
//           </h2>
//         </div>
//         <div 
//           className="w-10 h-10 rounded-full overflow-hidden border-2 transition-all hover:scale-105 cursor-pointer" 
//           style={{ borderColor: PRIMARY_LIGHT }}
//         >
//           <img
//             src={
//               imagePreview ||
//               `https://ui-avatars.com/api/?name=${profileData.fullName || currentUser.username}&background=4CA1AF&color=fff`
//             }
//             alt="Profile"
//             className="w-full h-full object-cover"
//           />
//         </div>
//       </div>

//       {/* Overlay for mobile sidebar */}
//       {sidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 cursor-pointer"
//           onClick={() => setSidebarOpen(false)}
//         />
//       )}

//       {/* Sidebar */}
//       <aside
//         className={`
//           fixed lg:sticky top-0 left-0 h-screen
//           w-80 sm:w-96 bg-white border-r border-gray-100 
//           flex flex-col p-8 shadow-lg lg:shadow-sm
//           transition-transform duration-300 ease-in-out z-50
//           ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
//           overflow-y-auto
//         `}
//       >
//         <button
//           onClick={() => setSidebarOpen(false)}
//           className="lg:hidden absolute top-4 right-4 p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 hover:rotate-90 cursor-pointer"
//         >
//           <X size={20} className="text-gray-500" />
//         </button>

//         <div className="flex items-center space-x-3 mb-10 group cursor-pointer">
//           <div 
//             className="p-2.5 rounded-xl shadow-lg transition-all duration-300 group-hover:scale-105 cursor-pointer" 
//             style={{ 
//               background: `linear-gradient(135deg, ${PRIMARY_COLOR}, #315169)`, 
//               boxShadow: '0 10px 15px -3px rgba(76, 161, 175, 0.2)' 
//             }}
//           >
//             <LayoutDashboard className="text-white" size={24} />
//           </div>
//           <h2 className="text-2xl font-black tracking-tight text-gray-800">
//             Super<span style={{ color: PRIMARY_DARK }}>Admin</span>
//           </h2>
//         </div>

//         <div className="flex flex-col items-center text-center mb-8">
//           <div 
//             className="relative p-1 border-2 rounded-3xl mb-4 transition-all duration-300 hover:shadow-lg cursor-pointer" 
//             style={{ 
//               borderColor: PRIMARY_LIGHT, 
//               boxShadow: '0 10px 15px -3px rgba(76, 161, 175, 0.1)' 
//             }}
//           >
//             <img
//               src={
//                 imagePreview ||
//                 `https://ui-avatars.com/api/?name=${profileData.fullName || currentUser.username}&background=4CA1AF&color=fff`
//               }
//               alt="Profile"
//               className="w-32 h-32 rounded-[2rem] object-cover shadow-inner"
//             />
//             <button
//               onClick={() => setShowProfileForm(true)}
//               className="absolute -bottom-1 -right-1 bg-white p-2 rounded-xl shadow-lg border border-gray-50 transition-all duration-200 hover:scale-110 cursor-pointer"
//               style={{ color: PRIMARY_DARK }}
//             >
//               <Edit size={16} />
//             </button>
//           </div>
//           <h3 className="font-bold text-gray-900 text-xl tracking-tight">
//             {profileData.fullName || currentUser.username}
//           </h3>
//           <p 
//             className="text-[10px] font-black px-3 py-1 rounded-full mt-2 uppercase tracking-[0.1em] transition-colors cursor-pointer"
//             style={{ color: PRIMARY_DARK, backgroundColor: PRIMARY_LIGHT }}
//           >
//             {currentUser.role.replace("_", " ")}
//           </p>
//         </div>

//         <nav className="space-y-2 flex-1 overflow-y-auto">
//           <div className="p-6 bg-gray-50/50 rounded-2xl border border-gray-100 space-y-4 transition-all duration-300 hover:shadow-md hover:bg-gray-50">
//             <div className="flex flex-col group cursor-pointer">
//               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 transition-colors group-hover:text-[#4CA1AF]">
//                 Full Name
//               </span>
//               <span className="text-sm font-bold text-gray-700 break-words group-hover:text-gray-900 transition-colors">
//                 {profileData.fullName || "Not set"}
//               </span>
//             </div>
//             <div className="flex flex-col group cursor-pointer">
//               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 transition-colors group-hover:text-[#4CA1AF]">
//                 Username
//               </span>
//               <span className="text-sm font-bold text-gray-700 break-words group-hover:text-gray-900 transition-colors">
//                 {currentUser.username}
//               </span>
//             </div>
//             <div className="flex flex-col group cursor-pointer">
//               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 transition-colors group-hover:text-[#4CA1AF]">
//                 Email
//               </span>
//               <span className="text-sm font-bold text-gray-700 break-all group-hover:text-gray-900 transition-colors">
//                 {currentUser.email}
//               </span>
//             </div>
//             <div className="flex flex-col group cursor-pointer">
//               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 transition-colors group-hover:text-[#4CA1AF]">
//                 Phone
//               </span>
//               <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900 transition-colors">
//                 {profileData.phoneNumber || "Not set"}
//               </span>
//             </div>
//             <div className="grid grid-cols-2 gap-4">
//               <div className="flex flex-col group cursor-pointer">
//                 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 transition-colors group-hover:text-[#4CA1AF]">
//                   PRN
//                 </span>
//                 <span className="text-sm font-bold text-gray-700 break-words group-hover:text-gray-900 transition-colors">
//                   {profileData.prn || "Not set"}
//                 </span>
//               </div>
//             </div>
//             <div className="flex flex-col group cursor-pointer">
//               {/* <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 transition-colors group-hover:text-[#4CA1AF]">
//                 Department
//               </span> */}
//               <span className="text-sm font-bold text-gray-700 break-words group-hover:text-gray-900 transition-colors">
//                 {profileData.department || "Not set"}
//               </span>
//             </div>
//             <div className="pt-2 border-t border-gray-100 flex items-center justify-between group cursor-pointer">
//               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest transition-colors group-hover:text-[#4CA1AF]">
//                 Status
//               </span>
//               <span className="flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md group-hover:bg-emerald-100 transition-all duration-200 group-hover:scale-105 cursor-pointer">
//                 <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-pulse"></div>
//                 {currentUser.verified ? "ACTIVE" : "INACTIVE"}
//               </span>
//             </div>
//           </div>
//         </nav>

//         <button
//           onClick={() => setConfirmDialog({ isOpen: true, title: "Sign Out", message: "Are you sure you want to sign out?", confirmText: "Sign Out", variant: "danger", onConfirm: () => { closeConfirm(); handleLogout(); } })}
//           className="mt-6 flex items-center justify-center space-x-3 w-full py-4 text-red-500 hover:bg-red-50 rounded-2xl transition-all duration-200 font-bold text-sm border border-transparent hover:border-red-100 hover:shadow-md hover:shadow-red-100/50 cursor-pointer"
//         >
//           <LogOut size={20} />
//           <span>Sign Out</span>
//         </button>
//       </aside>

//       {/* Main Content */}
//       <main className="flex-1 w-full pt-20 lg:pt-0 px-6 lg:px-10 pb-10">
//         <div className="max-w-7xl mx-auto">
//           <header className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-12 pt-10">
//             <div>
//               <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">
//                 Dashboard
//               </h1>
//               <p className="text-base text-gray-500 font-medium">
//                 Welcome back,{" "}
//                 <span className="font-bold" style={{ color: PRIMARY_COLOR }}>
//                   {currentUser.username}
//                 </span>
//                 . System is healthy.
//               </p>
//             </div>
//             <div className="flex items-center space-x-3 bg-emerald-50 text-emerald-700 px-5 py-2.5 rounded-2xl border border-emerald-100 shadow-sm shadow-emerald-50 self-start transition-all duration-300 hover:bg-emerald-100 hover:shadow-md hover:shadow-emerald-100/50 hover:-translate-y-0.5 cursor-pointer">
//               <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
//               <span className="text-sm font-black uppercase tracking-wider">
//                 All Systems Live
//               </span>
//             </div>
//           </header>

//           {/* Stats Grid */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-16">
//             <StatCard
//               title="Total Users"
//               count={users.length}
//               icon={Users}
//               bgColor={PRIMARY_LIGHT}
//               iconColor={PRIMARY_COLOR}
//             />
//             <StatCard
//               title="Faculty"
//               count={stats.TEACHERS || 0}
//               icon={Briefcase}
//               bgColor="rgba(59, 130, 246, 0.1)"
//               iconColor="#3B82F6"
//             />
//             <StatCard
//               title="Club Admins"
//               count={clubAdmins || 0}
//               icon={ShieldCheck}
//               bgColor="rgba(16, 185, 129, 0.1)"
//               iconColor="#10B981"
//             />
//             <StatCard
//               title="Regular"
//               count={stats.USERS || 0}
//               icon={User}
//               bgColor="rgba(249, 115, 22, 0.1)"
//               iconColor="#F97316"
//             />
//           </div>

//           {/* Control Center */}
//           <section>
//             <div className="flex items-center space-x-4 mb-8">
//               <h3 className="text-2xl font-black text-gray-800 tracking-tight whitespace-nowrap">
//                 Control Center
//               </h3>
//               <div 
//                 className="flex-1 h-[2px] bg-gradient-to-r from-gray-200 via-gray-200 to-gray-200 rounded-full"
//                 style={{ backgroundImage: `linear-gradient(to right, #e5e7eb, ${PRIMARY_COLOR}, #e5e7eb)` }}
//               ></div>
//             </div>

//             <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//               <BigActionButton
//                 label="Manage Users"
//                 icon={Users}
//                 onClick={() => (window.location.href = "/manage-users")}
//                 bgColor={PRIMARY_LIGHT}
//                 iconColor={PRIMARY_COLOR}
//               />
//               <BigActionButton
//                 label="Events"
//                 icon={CalendarDays}
//                 onClick={() => (window.location.href = "/events-superadmin")}
//                 bgColor="rgba(16, 185, 129, 0.1)"
//                 iconColor="#10B981"
//               />
//               <BigActionButton
//                 label="Departments"
//                 icon={Database}
//                 onClick={() => {
//                   fetchDepartments();
//                   setShowDeptModal(true);
//                 }}
//                 bgColor="rgba(236, 72, 153, 0.1)"
//                 iconColor="#EC4899"
//               />
//               <BigActionButton
//                 label="Manage Clubs"
//                 icon={Database}
//                 onClick={() => (window.location.href = "/manage-clubs")}
//                 bgColor="rgba(6, 182, 212, 0.1)"
//                 iconColor="#06B6D4"
//               />
//               <BigActionButton
//                 label="Club Admins"
//                 icon={ShieldCheck}
//                 onClick={() => (window.location.href = "/club-admins")}
//                 bgColor="rgba(249, 115, 22, 0.1)"
//                 iconColor="#F97316"
//               />
//               <BigActionButton
//                 label="Add Student"
//                 icon={UserPlus}
//                 onClick={() => (window.location.href = "/add-users-with-club")}
//                 bgColor="rgba(59, 130, 246, 0.1)"
//                 iconColor="#3B82F6"
//               />
//               <BigActionButton
//                 label="Club Association"
//                 icon={Building2}
//                 onClick={() =>
//                   (window.location.href = "/remove-users-from-any-club")
//                 }
//                 bgColor="rgba(6, 182, 212, 0.1)"
//                 iconColor="#06B6D4"
//               />
//               <BigActionButton
//                 label="Audit Logs"
//                 icon={Database}
//                 onClick={() => alert("Audit Logs feature")}
//                 bgColor="rgba(100, 116, 139, 0.1)"
//                 iconColor="#64748B"
//               />
//             </div>
//           </section>
//         </div>
//       </main>

//       {/* Profile Form Modal */}
//       {showProfileForm && (
//         <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center p-6 z-50 overflow-y-auto">
//           <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full my-8 overflow-hidden border border-white">
//             <div 
//               className="p-8 text-white" 
//               style={{ background: `linear-gradient(135deg, ${PRIMARY_COLOR}, #315169)` }}
//             >
//               <div className="flex justify-between items-center">
//                 <h3 className="text-2xl font-bold">
//                   {userProfile ? "Edit Profile" : "Complete Profile"}
//                 </h3>
//                 <button
//                   onClick={() => {
//                     setShowProfileForm(false);
//                     setMessage({ text: "", type: "" });
//                   }}
//                   className="bg-white/20 p-2 rounded-xl hover:bg-white/30 transition-all duration-200 hover:rotate-90 cursor-pointer"
//                 >
//                   <X size={20} />
//                 </button>
//               </div>
//             </div>

//             <form onSubmit={handleSubmitProfile} className="p-8 space-y-5">
//               <div className="flex flex-col items-center mb-6">
//                 <div className="relative">
//                   <img
//                     src={
//                       imagePreview ||
//                       `https://ui-avatars.com/api/?name=${profileData.fullName || currentUser.username}&background=4CA1AF&color=fff&size=128`
//                     }
//                     alt="Profile Preview"
//                     className="w-32 h-32 rounded-full object-cover border-4"
//                     style={{ borderColor: PRIMARY_LIGHT }}
//                   />
//                   <label 
//                     className="absolute bottom-0 right-0 p-2 rounded-full cursor-pointer hover:scale-110 transition-all shadow-lg"
//                     style={{ backgroundColor: PRIMARY_COLOR }}
//                   >
//                     <Camera size={20} className="text-white" />
//                     <input
//                       type="file"
//                       accept="image/*"
//                       onChange={handleImageChange}
//                       className="hidden"
//                     />
//                   </label>
//                 </div>
//                 <p className="text-sm text-gray-500 mt-2">
//                   Click camera to upload photo
//                 </p>
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   PRN <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="prn"
//                   value={profileData.prn}
//                   onChange={handleInputChange}
//                   className={`w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all ${userProfile ? "bg-gray-100 cursor-not-allowed" : ""}`}
//                   style={{ 
//                     outline: 'none',
//                     '--tw-ring-color': PRIMARY_COLOR
//                   }}
//                   onFocus={(e) => e.target.style.boxShadow = `0 0 0 2px ${PRIMARY_COLOR}20`}
//                   onBlur={(e) => e.target.style.boxShadow = ''}
//                   readOnly={!!userProfile}
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Full Name <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="fullName"
//                   value={profileData.fullName}
//                   onChange={handleInputChange}
//                   className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all"
//                   style={{ 
//                     outline: 'none',
//                     '--tw-ring-color': PRIMARY_COLOR
//                   }}
//                   onFocus={(e) => e.target.style.boxShadow = `0 0 0 2px ${PRIMARY_COLOR}20`}
//                   onBlur={(e) => e.target.style.boxShadow = ''}
//                   placeholder="Enter your full name"
//                   required
//                 />
//               </div>

//               {/* <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Department <span className="text-red-500">*</span>
//                 </label>
//                 <select
//                   name="departmentId"
//                   value={profileData.departmentId}
//                   onChange={handleInputChange}
//                   className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all"
//                   style={{ 
//                     outline: 'none',
//                     '--tw-ring-color': PRIMARY_COLOR
//                   }}
//                   onFocus={(e) => e.target.style.boxShadow = `0 0 0 2px ${PRIMARY_COLOR}20`}
//                   onBlur={(e) => e.target.style.boxShadow = ''}
//                   required
//                 >
//                   <option value="">Select Department</option>
//                   {departments.map(dept => (
//                     <option key={dept.departmentId} value={dept.departmentId}>
//                       {dept.name}
//                     </option>
//                   ))}
//                 </select>
//               </div> */}

//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Phone Number <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="tel"
//                   name="phoneNumber"
//                   value={profileData.phoneNumber}
//                   onChange={handleInputChange}
//                   className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all"
//                   style={{ 
//                     outline: 'none',
//                     '--tw-ring-color': PRIMARY_COLOR
//                   }}
//                   onFocus={(e) => e.target.style.boxShadow = `0 0 0 2px ${PRIMARY_COLOR}20`}
//                   onBlur={(e) => e.target.style.boxShadow = ''}
//                   placeholder="10-digit phone number"
//                   required
//                 />
//               </div>

//               {message.text && (
//                 <div
//                   className={`p-4 rounded-xl ${message.type === "error" ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"}`}
//                 >
//                   <p className="text-sm font-semibold">{message.text}</p>
//                 </div>
//               )}

//               <div className="flex space-x-4 pt-4">
//                 <button
//                   type="button"
//                   onClick={() => setShowProfileForm(false)}
//                   className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-xl font-bold transition-all cursor-pointer"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={profileLoading}
//                   className="flex-1 text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
//                   style={{ background: `linear-gradient(135deg, ${PRIMARY_COLOR}, #315169)` }}
//                 >
//                   {profileLoading
//                     ? "Saving..."
//                     : userProfile
//                       ? "Update Profile"
//                       : "Create Profile"}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* Department CRUD Modal */}
//       {showDeptModal && (
//         <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center p-6 z-50">
//           <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden border border-white flex flex-col">
//             <div 
//               className="p-8 text-white flex justify-between items-center"
//               style={{ background: `linear-gradient(135deg, ${PRIMARY_COLOR}, #315169)` }}
//             >
//               <div>
//                 <h3 className="text-2xl font-bold tracking-tight">
//                   Department Management
//                 </h3>
//                 <p className="text-white/80 text-sm">
//                   Add or remove academic departments
//                 </p>
//               </div>
//               <button
//                 onClick={() => {
//                   setShowDeptModal(false);
//                   setEditingDept(null);
//                   setDeptInput("");
//                   setDeptMessage({ text: "", type: "" });
//                 }}
//                 className="bg-white/20 p-2 rounded-xl hover:bg-white/30 transition-all duration-200 hover:rotate-90 cursor-pointer"
//               >
//                 <X size={20} />
//               </button>
//             </div>

//             <div className="p-8 flex-1 overflow-y-auto">
//               {/* Status message */}
//               {deptMessage.text && (
//                 <div
//                   className={`mb-6 p-4 rounded-xl ${deptMessage.type === "error" ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"}`}
//                 >
//                   <p className="text-sm font-semibold flex items-center gap-2">
//                     {deptMessage.type === "success" ? "✓" : "⚠"}{" "}
//                     {deptMessage.text}
//                   </p>
//                 </div>
//               )}

//               {/* Form to add/edit department */}
//               <form onSubmit={handleDeptSubmit} className="mb-8">
//                 <div className="flex gap-3">
//                   <input
//                     type="text"
//                     placeholder="Enter department name..."
//                     className="flex-1 px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all"
//                     style={{ 
//                       outline: 'none',
//                       '--tw-ring-color': PRIMARY_COLOR
//                     }}
//                     onFocus={(e) => e.target.style.boxShadow = `0 0 0 2px ${PRIMARY_COLOR}20`}
//                     onBlur={(e) => e.target.style.boxShadow = ''}
//                     value={deptInput}
//                     onChange={(e) => setDeptInput(e.target.value)}
//                     required
//                   />
//                   <button
//                     type="submit"
//                     className="text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap shadow-lg cursor-pointer"
//                     style={{ 
//                       background: `linear-gradient(135deg, ${PRIMARY_COLOR}, #315169)`, 
//                       boxShadow: '0 10px 15px -3px rgba(76, 161, 175, 0.2)' 
//                     }}
//                   >
//                     {editingDept ? <Edit size={18} /> : <Plus size={18} />}
//                     {editingDept ? "Update Dept" : "Add Dept"}
//                   </button>
//                 </div>
//                 {editingDept && (
//                   <div className="mt-2 text-sm text-gray-500 flex items-center gap-2">
//                     <span>
//                       Editing:{" "}
//                       <span className="font-bold">{editingDept.name}</span>
//                     </span>
//                     <button
//                       type="button"
//                       onClick={() => {
//                         setEditingDept(null);
//                         setDeptInput("");
//                       }}
//                       className="text-xs text-red-500 hover:text-red-700 underline cursor-pointer"
//                     >
//                       Cancel
//                     </button>
//                   </div>
//                 )}
//               </form>

//               {/* List of departments */}
//               {deptLoading ? (
//                 <div className="py-10 text-center text-gray-500 italic">
//                   <div 
//                     className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-3 cursor-wait" 
//                     style={{ borderColor: PRIMARY_COLOR }}
//                   ></div>
//                   Loading departments...
//                 </div>
//               ) : (
//                 <div className="space-y-3">
//                   {departments.length > 0 ? (
//                     departments.map((dept) => (
//                       <div
//                         key={dept.departmentId}
//                         className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100 transition-all group cursor-pointer hover:border-[#4CA1AF]"
//                       >
//                         <div className="flex items-center gap-3">
//                           <span className="font-bold text-gray-700">
//                             {dept.name}
//                           </span>
//                           <span
//                             className={`text-xs font-bold px-2 py-1 rounded-full ${dept.active ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}
//                           >
//                             {dept.active ? "Active" : "Inactive"}
//                           </span>
//                         </div>
//                         <div className="flex gap-2">
//                           <button
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               setConfirmDialog({ isOpen: true, title: "Delete Department", message: "Are you sure you want to delete this department? This action cannot be undone.", confirmText: "Delete", variant: "danger", onConfirm: () => { closeConfirm(); deleteDepartment(dept.departmentId); } });
//                             }}
//                             className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
//                             title="Delete"
//                           >
//                             <Trash2 size={16} />
//                           </button>
//                         </div>
//                       </div>
//                     ))
//                   ) : (
//                     <div className="text-center py-10">
//                       <Database className="w-12 h-12 text-gray-200 mx-auto mb-3" />
//                       <p className="text-gray-400 font-medium">
//                         No departments found in system.
//                       </p>
//                       <p className="text-sm text-gray-300 mt-1">
//                         Add a department using the form above
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>

//             <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
//               <div className="text-sm text-gray-500">
//                 {departments.length} department
//                 {departments.length !== 1 ? "s" : ""}
//               </div>
//               <button
//                 onClick={() => setShowDeptModal(false)}
//                 className="text-sm font-bold text-gray-500 hover:text-gray-700 px-4 py-2 cursor-pointer"
//               >
//                 Close Manager
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
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
// }



// import { useState, useEffect } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import ConfirmDialog from "../../components/ConfirmDialog";
// import {
//   User,
//   Upload,
//   X,
//   CalendarDays,
//   Edit,
//   Users,
//   Briefcase,
//   ShieldCheck,
//   Settings,
//   Database,
//   LogOut,
//   LayoutDashboard,
//   UserPlus,
//   ShieldAlert,
//   Menu,
//   Camera,
//   Trash2,
//   Plus,
//   Building2,
//   CalendarPlus,
//   Mail,
// } from "lucide-react";

// export default function SuperAdminDashboard() {
//   const navigate = useNavigate();
  
//   // Define the primary color as a constant for consistency
//   const PRIMARY_COLOR = "#4CA1AF";
//   const PRIMARY_DARK = "#2d8391";
//   const PRIMARY_LIGHT = "rgba(76, 161, 175, 0.1)";
  
//   // Get user data from localStorage
//   const user = JSON.parse(localStorage.getItem("user"));
//   const token = localStorage.getItem("token");

//   const [currentUser, setCurrentUser] = useState({
//     username: user?.username || "admin_user",
//     email: user?.email || "admin@college.edu",
//     role: user?.role || "SUPER_ADMIN",
//     prn: user?.prn || "2021BCS001",
//     verified: user?.verified || true,
//   });
  
//   // Email update states
//   const [showEmailEditModal, setShowEmailEditModal] = useState(false);
//   const [newEmail, setNewEmail] = useState("");
//   const [emailLoading, setEmailLoading] = useState(false);
//   const [emailMessage, setEmailMessage] = useState({ text: "", type: "" });
  
//   console.log(user);

//   const [users, setUsers] = useState([]);
//   const [stats, setStats] = useState({});
//   const [clubAdmins, setCount] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   // Profile states
//   const [showProfileForm, setShowProfileForm] = useState(false);
//   const [profileData, setProfileData] = useState({
//     prn: user?.prn || "",
//     fullName: "",
//     department: "",
//     year: "",
//     phoneNumber: "",
//     departmentId: "",
//   });
//   const [selectedImage, setSelectedImage] = useState(null);
//   const [imagePreview, setImagePreview] = useState(null);
//   const [profileLoading, setProfileLoading] = useState(false);
//   const [message, setMessage] = useState({ text: "", type: "" });
//   const [userProfile, setUserProfile] = useState(null);
//   const [isLoadingProfile, setIsLoadingProfile] = useState(true);

//   // Department CRUD States
//   const [showDeptModal, setShowDeptModal] = useState(false);
//   const [departments, setDepartments] = useState([]);
//   const [deptLoading, setDeptLoading] = useState(false);
//   const [editingDept, setEditingDept] = useState(null);
//   const [deptInput, setDeptInput] = useState("");
//   const [deptMessage, setDeptMessage] = useState({ text: "", type: "" });
//   const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: "", message: "", variant: "primary", confirmText: "Confirm", onConfirm: () => {} });
//   const closeConfirm = () => setConfirmDialog((prev) => ({ ...prev, isOpen: false }));

//   useEffect(() => {
//     fetchUserCount();
//     fetchAllData();
//     fetchUserProfile();
//   }, []);

//   const fetchUserCount = async () => {
//     try {
//       const response = await axios.get(
//         "http://localhost:8080/api/user-clubs/getAllByRole/CLUB_ADMIN",
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         },
//       );
//       setCount(response.data.data.length);
//     } catch (error) {
//       console.error("Error fetching club admin count:", error);
//     }
//   };

//   // Fetch all users and calculate stats
//   const fetchAllData = async () => {
//     try {
//       const usersResponse = await axios.get(
//         "http://localhost:8080/api/users/",
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         },
//       );

//       setUsers(usersResponse.data);

//       const userStats = usersResponse.data.reduce((acc, user) => {
//         acc[user.role] = (acc[user.role] || 0) + 1;
//         return acc;
//       }, {});

//       setStats(userStats);
//       setLoading(false);
//     } catch (error) {
//       console.error("Error fetching data:", error);
//       setLoading(false);
//     }
//   };

//   const fetchDepartments = async () => {
//     setDeptLoading(true);
//     setDeptMessage({ text: "", type: "" });
//     try {
//       const response = await axios.get("http://localhost:8080/api/department", {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       });

//       console.log("Departments fetched:", response.data.data);

//       if (response.data.success && response.data.data) {
//         setDepartments(response.data.data);
//       } else {
//         setDepartments([]);
//         setDeptMessage({
//           text: response.data.message || "No departments found",
//           type: "error",
//         });
//       }
//     } catch (error) {
//       console.error("Error fetching departments:", error);
//       setDepartments([]);
//       setDeptMessage({ text: "Error fetching departments", type: "error" });
//     } finally {
//       setDeptLoading(false);
//     }
//   };

//   // Handle department form submission (Create/Update)
//   const handleDeptSubmit = async (e) => {
//     e.preventDefault();
//     if (!deptInput.trim()) {
//       setDeptMessage({ text: "Please enter a department name", type: "error" });
//       return;
//     }

//     try {
//       if (editingDept) {
//         const response = await axios.put(
//           `http://localhost:8080/api/department/${editingDept.departmentId}`,
//           {
//             name: deptInput,
//             active: true,
//           },
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//               "Content-Type": "application/json",
//             },
//           },
//         );

//         if (response.data.success) {
//           setDeptMessage({
//             text: "Department updated successfully!",
//             type: "success",
//           });
//         } else {
//           setDeptMessage({
//             text: response.data.message || "Failed to update department",
//             type: "error",
//           });
//           return;
//         }
//       } else {
//         const response = await axios.post(
//           `http://localhost:8080/api/department/${deptInput}`,
//           null,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//               "Content-Type": "application/json",
//             },
//           },
//         );

//         if (response.data.success) {
//           setDeptMessage({
//             text: "Department added successfully!",
//             type: "success",
//           });
//         } else {
//           setDeptMessage({
//             text: response.data.message || "Failed to add department",
//             type: "error",
//           });
//           return;
//         }
//       }

//       setDeptInput("");
//       setEditingDept(null);
//       setTimeout(() => {
//         setDeptMessage({ text: "", type: "" });
//       }, 3000);
//       fetchDepartments();
//     } catch (error) {
//       console.error("Error saving department:", error);
//       setDeptMessage({
//         text: error.response?.data?.message || "Error saving department",
//         type: "error",
//       });
//     }
//   };

//   // Delete department
//   const deleteDepartment = async (departmentId) => {
//     try {
//       const response = await axios.delete(
//         `http://localhost:8080/api/department/${departmentId}`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         },
//       );

//       if (response.data.success) {
//         setDeptMessage({
//           text: "Department deleted successfully!",
//           type: "success",
//         });
//         fetchDepartments();
//       } else {
//         setDeptMessage({
//           text: response.data.message || "Failed to delete department",
//           type: "error",
//         });
//       }

//       setTimeout(() => {
//         setDeptMessage({ text: "", type: "" });
//       }, 3000);
//     } catch (error) {
//       console.error("Error deleting department:", error);
//       setDeptMessage({
//         text: error.response?.data?.message || "Error deleting department",
//         type: "error",
//       });
//     }
//   };

//   // Fetch user profile data
//   const fetchUserProfile = async () => {
//     try {
//       setIsLoadingProfile(true);
//       const response = await axios.get(
//         `http://localhost:8080/api/profiles/prn/${user?.prn}`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         },
//       );

//       if (response.data) {
//         setUserProfile(response.data);
//         setProfileData({
//           prn: response.data.data.prn || user?.prn || "",
//           fullName: response.data.data.fullName || "",
//           department: response.data.data.department || "",
//           year: response.data.data.year || "",
//           phoneNumber: response.data.data.phoneNumber || "",
//           departmentId: response.data.data.departmentId || "",
//         });

//         fetchProfileImage();
//       }
//     } catch (error) {
//       console.error("Error fetching profile:", error);
//       setUserProfile(null);
//       setProfileData((prev) => ({
//         ...prev,
//         prn: user?.prn || "",
//       }));
//     } finally {
//       setIsLoadingProfile(false);
//     }
//   };

//   const fetchProfileImage = async () => {
//     try {
//       const response = await axios.get(
//         `http://localhost:8080/api/profiles/${user?.prn}/image`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//           responseType: "blob",
//         },
//       );

//       if (response.data) {
//         const imageUrl = URL.createObjectURL(response.data);
//         setImagePreview(imageUrl);
//       }
//     } catch (error) {
//       console.error("Error fetching profile image:", error);
//       setImagePreview(null);
//     }
//   };

//   // Email update function
//   // Email update function
// const handleEmailUpdate = async (e) => {
//   e.preventDefault();
  
//   if (!newEmail.trim()) {
//     setEmailMessage({ text: "Please enter a valid email", type: "error" });
//     return;
//   }

//   // Basic email validation
//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   if (!emailRegex.test(newEmail)) {
//     setEmailMessage({ text: "Please enter a valid email address", type: "error" });
//     return;
//   }

//   setEmailLoading(true);
//   setEmailMessage({ text: "", type: "" });

//   try {
//     // Try updating via users endpoint with PUT
//     const response = await axios.put(
//       `http://localhost:8080/api/users/${currentUser.prn}`,
//       { 
//         email: newEmail,
//         username: currentUser.username,
//         role: currentUser.role 
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     if (response.data) {
//       // Update local storage and state
//       const updatedUser = { ...currentUser, email: newEmail };
//       localStorage.setItem("user", JSON.stringify(updatedUser));
//       setCurrentUser(updatedUser);
      
//       setEmailMessage({
//         text: "Email updated successfully!",
//         type: "success",
//       });
      
//       setTimeout(() => {
//         setShowEmailEditModal(false);
//         setEmailMessage({ text: "", type: "" });
//         setNewEmail("");
//       }, 1500);
//     }
//   } catch (error) {
//     console.error("Error with PUT /api/users/{prn}:", error);
    
//     // Try PATCH method as fallback
//     try {
//       const patchResponse = await axios.patch(
//         `http://localhost:8080/api/users/${currentUser.prn}`,
//         { email: newEmail },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       if (patchResponse.data) {
//         const updatedUser = { ...currentUser, email: newEmail };
//         localStorage.setItem("user", JSON.stringify(updatedUser));
//         setCurrentUser(updatedUser);
        
//         setEmailMessage({
//           text: "Email updated successfully!",
//           type: "success",
//         });
        
//         setTimeout(() => {
//           setShowEmailEditModal(false);
//           setEmailMessage({ text: "", type: "" });
//           setNewEmail("");
//         }, 1500);
//       }
//     } catch (patchError) {
//       console.error("Error with PATCH /api/users/{prn}:", patchError);
      
//       // Try updating via auth/update endpoint
//       try {
//         const authResponse = await axios.post(
//           "http://localhost:8080/api/auth/update",
//           {
//             prn: currentUser.prn,
//             email: newEmail,
//             username: currentUser.username
//           },
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//               "Content-Type": "application/json",
//             },
//           }
//         );

//         if (authResponse.data) {
//           const updatedUser = { ...currentUser, email: newEmail };
//           localStorage.setItem("user", JSON.stringify(updatedUser));
//           setCurrentUser(updatedUser);
          
//           setEmailMessage({
//             text: "Email updated successfully!",
//             type: "success",
//           });
          
//           setTimeout(() => {
//             setShowEmailEditModal(false);
//             setEmailMessage({ text: "", type: "" });
//             setNewEmail("");
//           }, 1500);
//         }
//       } catch (authError) {
//         console.error("Error with POST /api/auth/update:", authError);
        
//         setEmailMessage({
//           text: "Unable to update email. Please check if you have permission or contact support.",
//           type: "error",
//         });
//       }
//     }
//   } finally {
//     setEmailLoading(false);
//   }
// };

//   const handleLogout = () => {
//     localStorage.removeItem("user");
//     localStorage.removeItem("token");
//     window.location.href = "/login";
//   };

//   const handleInputChange = (e) => {
//     setProfileData({
//       ...profileData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setSelectedImage(file);
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setImagePreview(reader.result);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleSubmitProfile = async (e) => {
//     e.preventDefault();
//     setProfileLoading(true);
//     try {
//       const requestData = {
//         fullName: profileData.fullName,
//         departmentId: parseInt(profileData.departmentId),
//         phoneNumber: profileData.phoneNumber,
//       };

//       if (userProfile) {
//         await axios.put(
//           `http://localhost:8080/api/profiles/${profileData.prn}`,
//           requestData,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//               "Content-Type": "application/json",
//             },
//           },
//         );
//       } else {
//         await axios.post(
//           "http://localhost:8080/api/profiles",
//           { ...requestData, prn: profileData.prn },
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//               "Content-Type": "application/json",
//             },
//           },
//         );
//       }

//       if (selectedImage) {
//         const formData = new FormData();
//         formData.append("image", selectedImage);
//         await axios.post(
//           `http://localhost:8080/api/profiles/${profileData.prn}/image`,
//           formData,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//               "Content-Type": "multipart/form-data",
//             },
//           },
//         );
//       }

//       fetchUserProfile();
//       setShowProfileForm(false);
//     } catch (error) {
//       setMessage({ text: "Error saving profile.", type: "error" });
//     } finally {
//       setProfileLoading(false);
//     }
//   };

//   const StatCard = ({ title, count, icon: Icon, bgColor, iconColor }) => (
//     <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer group">
//       <div
//         className="p-4 rounded-xl flex-shrink-0 transition-all duration-300 group-hover:scale-110"
//         style={{ backgroundColor: bgColor || PRIMARY_LIGHT, color: iconColor || PRIMARY_COLOR }}
//       >
//         <Icon className="w-7 h-7" />
//       </div>
//       <div className="min-w-0">
//         <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider truncate group-hover:text-gray-700 transition-colors">
//           {title}
//         </p>
//         <p className="text-3xl font-bold text-gray-900">{count}</p>
//       </div>
//     </div>
//   );

//   const BigActionButton = ({ label, icon: Icon, onClick, bgColor, iconColor }) => (
//     <button
//       onClick={onClick}
//       className="group flex flex-col items-center justify-center p-8 rounded-3xl transition-all duration-300 bg-white border-2 border-gray-100 hover:shadow-xl min-h-[160px] hover:-translate-y-2 cursor-pointer"
//     >
//       <div
//         className="p-5 rounded-2xl mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm"
//         style={{ backgroundColor: bgColor || PRIMARY_LIGHT, color: iconColor || PRIMARY_COLOR }}
//       >
//         <Icon className="w-8 h-8" />
//       </div>
//       <span className="text-lg font-bold text-gray-700 transition-colors text-center px-2">
//         {label}
//       </span>
//     </button>
//   );

//   if (loading || isLoadingProfile) {
//     return (
//       <div className="min-h-screen bg-[#fcfcfd] flex items-center justify-center">
//         <div className="text-center">
//           <div 
//             className="animate-spin rounded-full h-16 w-16 border-b-2 mx-auto mb-4 cursor-wait" 
//             style={{ borderColor: PRIMARY_DARK }}
//           ></div>
//           <p className="text-gray-600 font-semibold">Loading dashboard...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <>
//     <div className="min-h-screen bg-[#fcfcfd] flex relative">
//       {/* Mobile Header */}
//       <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between z-50 shadow-sm">
//         <button
//           onClick={() => setSidebarOpen(!sidebarOpen)}
//           className="p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 hover:scale-105 cursor-pointer"
//         >
//           <Menu size={24} className="text-gray-700" />
//         </button>
//         <div className="flex items-center space-x-2">
//           <div 
//             className="p-2 rounded-lg transition-transform hover:scale-105 cursor-pointer" 
//             style={{ background: `linear-gradient(135deg, ${PRIMARY_COLOR}, #315169)` }}
//           >
//             <LayoutDashboard className="text-white w-5 h-5" />
//           </div>
//           <h2 className="text-xl font-black tracking-tight text-gray-800">
//             Super<span style={{ color: PRIMARY_COLOR }}>Admin</span>
//           </h2>
//         </div>
//         <div 
//           className="w-10 h-10 rounded-full overflow-hidden border-2 transition-all hover:scale-105 cursor-pointer" 
//           style={{ borderColor: PRIMARY_LIGHT }}
//         >
//           <img
//             src={
//               imagePreview ||
//               `https://ui-avatars.com/api/?name=${profileData.fullName || currentUser.username}&background=4CA1AF&color=fff`
//             }
//             alt="Profile"
//             className="w-full h-full object-cover"
//           />
//         </div>
//       </div>

//       {/* Overlay for mobile sidebar */}
//       {sidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 cursor-pointer"
//           onClick={() => setSidebarOpen(false)}
//         />
//       )}

//       {/* Sidebar */}
//       <aside
//         className={`
//           fixed lg:sticky top-0 left-0 h-screen
//           w-80 sm:w-96 bg-white border-r border-gray-100 
//           flex flex-col p-8 shadow-lg lg:shadow-sm
//           transition-transform duration-300 ease-in-out z-50
//           ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
//           overflow-y-auto
//         `}
//       >
//         <button
//           onClick={() => setSidebarOpen(false)}
//           className="lg:hidden absolute top-4 right-4 p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 hover:rotate-90 cursor-pointer"
//         >
//           <X size={20} className="text-gray-500" />
//         </button>

//         <div className="flex items-center space-x-3 mb-10 group cursor-pointer">
//           <div 
//             className="p-2.5 rounded-xl shadow-lg transition-all duration-300 group-hover:scale-105 cursor-pointer" 
//             style={{ 
//               background: `linear-gradient(135deg, ${PRIMARY_COLOR}, #315169)`, 
//               boxShadow: '0 10px 15px -3px rgba(76, 161, 175, 0.2)' 
//             }}
//           >
//             <LayoutDashboard className="text-white" size={24} />
//           </div>
//           <h2 className="text-2xl font-black tracking-tight text-gray-800">
//             Super<span style={{ color: PRIMARY_DARK }}>Admin</span>
//           </h2>
//         </div>

//         <div className="flex flex-col items-center text-center mb-8">
//           <div 
//             className="relative p-1 border-2 rounded-3xl mb-4 transition-all duration-300 hover:shadow-lg cursor-pointer" 
//             style={{ 
//               borderColor: PRIMARY_LIGHT, 
//               boxShadow: '0 10px 15px -3px rgba(76, 161, 175, 0.1)' 
//             }}
//           >
//             <img
//               src={
//                 imagePreview ||
//                 `https://ui-avatars.com/api/?name=${profileData.fullName || currentUser.username}&background=4CA1AF&color=fff`
//               }
//               alt="Profile"
//               className="w-32 h-32 rounded-[2rem] object-cover shadow-inner"
//             />
//             <button
//               onClick={() => setShowProfileForm(true)}
//               className="absolute -bottom-1 -right-1 bg-white p-2 rounded-xl shadow-lg border border-gray-50 transition-all duration-200 hover:scale-110 cursor-pointer"
//               style={{ color: PRIMARY_DARK }}
//             >
//               <Edit size={16} />
//             </button>
//           </div>
//           <h3 className="font-bold text-gray-900 text-xl tracking-tight">
//             {profileData.fullName || currentUser.username}
//           </h3>
//           <p 
//             className="text-[10px] font-black px-3 py-1 rounded-full mt-2 uppercase tracking-[0.1em] transition-colors cursor-pointer"
//             style={{ color: PRIMARY_DARK, backgroundColor: PRIMARY_LIGHT }}
//           >
//             {currentUser.role.replace("_", " ")}
//           </p>
//         </div>

//         <nav className="space-y-2 flex-1 overflow-y-auto">
//           <div className="p-6 bg-gray-50/50 rounded-2xl border border-gray-100 space-y-4 transition-all duration-300 hover:shadow-md hover:bg-gray-50">
//             <div className="flex flex-col group cursor-pointer">
//               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 transition-colors group-hover:text-[#4CA1AF]">
//                 Full Name
//               </span>
//               <span className="text-sm font-bold text-gray-700 break-words group-hover:text-gray-900 transition-colors">
//                 {profileData.fullName || "Not set"}
//               </span>
//             </div>
//             <div className="flex flex-col group cursor-pointer">
//               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 transition-colors group-hover:text-[#4CA1AF]">
//                 Username
//               </span>
//               <span className="text-sm font-bold text-gray-700 break-words group-hover:text-gray-900 transition-colors">
//                 {currentUser.username}
//               </span>
//             </div>
            
//             {/* Email field with edit button */}
//             <div className="flex flex-col group cursor-pointer relative">
//               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 transition-colors group-hover:text-[#4CA1AF]">
//                 Email
//               </span>
//               <div className="flex items-center justify-between">
//                 <span className="text-sm font-bold text-gray-700 break-all group-hover:text-gray-900 transition-colors pr-2">
//                   {currentUser.email}
//                 </span>
//                 <button
//                   onClick={() => {
//                     setNewEmail(currentUser.email);
//                     setShowEmailEditModal(true);
//                   }}
//                   className="p-1.5 rounded-lg hover:bg-gray-200 transition-all duration-200 hover:scale-110 flex-shrink-0 cursor-pointer"
//                   style={{ color: PRIMARY_COLOR }}
//                   title="Edit email"
//                 >
//                   <Edit size={14} />
//                 </button>
//               </div>
//             </div>
            
//             <div className="flex flex-col group cursor-pointer">
//               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 transition-colors group-hover:text-[#4CA1AF]">
//                 Phone
//               </span>
//               <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900 transition-colors">
//                 {profileData.phoneNumber || "Not set"}
//               </span>
//             </div>
//             <div className="grid grid-cols-2 gap-4">
//               <div className="flex flex-col group cursor-pointer">
//                 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 transition-colors group-hover:text-[#4CA1AF]">
//                   PRN
//                 </span>
//                 <span className="text-sm font-bold text-gray-700 break-words group-hover:text-gray-900 transition-colors">
//                   {profileData.prn || "Not set"}
//                 </span>
//               </div>
//             </div>
//             <div className="flex flex-col group cursor-pointer">
//               {/* <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 transition-colors group-hover:text-[#4CA1AF]">
//                 Department
//               </span> */}
//               <span className="text-sm font-bold text-gray-700 break-words group-hover:text-gray-900 transition-colors">
//                 {profileData.department || "Not set"}
//               </span>
//             </div>
//             <div className="pt-2 border-t border-gray-100 flex items-center justify-between group cursor-pointer">
//               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest transition-colors group-hover:text-[#4CA1AF]">
//                 Status
//               </span>
//               <span className="flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md group-hover:bg-emerald-100 transition-all duration-200 group-hover:scale-105 cursor-pointer">
//                 <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-pulse"></div>
//                 {currentUser.verified ? "ACTIVE" : "INACTIVE"}
//               </span>
//             </div>
//           </div>
//         </nav>

//         <button
//           onClick={() => setConfirmDialog({ isOpen: true, title: "Sign Out", message: "Are you sure you want to sign out?", confirmText: "Sign Out", variant: "danger", onConfirm: () => { closeConfirm(); handleLogout(); } })}
//           className="mt-6 flex items-center justify-center space-x-3 w-full py-4 text-red-500 hover:bg-red-50 rounded-2xl transition-all duration-200 font-bold text-sm border border-transparent hover:border-red-100 hover:shadow-md hover:shadow-red-100/50 cursor-pointer"
//         >
//           <LogOut size={20} />
//           <span>Sign Out</span>
//         </button>
//       </aside>

//       {/* Main Content */}
//       <main className="flex-1 w-full pt-20 lg:pt-0 px-6 lg:px-10 pb-10">
//         <div className="max-w-7xl mx-auto">
//           <header className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-12 pt-10">
//             <div>
//               <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">
//                 Dashboard
//               </h1>
//               <p className="text-base text-gray-500 font-medium">
//                 Welcome back,{" "}
//                 <span className="font-bold" style={{ color: PRIMARY_COLOR }}>
//                   {currentUser.username}
//                 </span>
//                 . System is healthy.
//               </p>
//             </div>
//             <div className="flex items-center space-x-3 bg-emerald-50 text-emerald-700 px-5 py-2.5 rounded-2xl border border-emerald-100 shadow-sm shadow-emerald-50 self-start transition-all duration-300 hover:bg-emerald-100 hover:shadow-md hover:shadow-emerald-100/50 hover:-translate-y-0.5 cursor-pointer">
//               <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
//               <span className="text-sm font-black uppercase tracking-wider">
//                 All Systems Live
//               </span>
//             </div>
//           </header>

//           {/* Stats Grid */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-16">
//             <StatCard
//               title="Total Users"
//               count={users.length}
//               icon={Users}
//               bgColor={PRIMARY_LIGHT}
//               iconColor={PRIMARY_COLOR}
//             />
//             <StatCard
//               title="Faculty"
//               count={stats.TEACHERS || 0}
//               icon={Briefcase}
//               bgColor="rgba(59, 130, 246, 0.1)"
//               iconColor="#3B82F6"
//             />
//             <StatCard
//               title="Club Admins"
//               count={clubAdmins || 0}
//               icon={ShieldCheck}
//               bgColor="rgba(16, 185, 129, 0.1)"
//               iconColor="#10B981"
//             />
//             <StatCard
//               title="Regular"
//               count={stats.USERS || 0}
//               icon={User}
//               bgColor="rgba(249, 115, 22, 0.1)"
//               iconColor="#F97316"
//             />
//           </div>

//           {/* Control Center */}
//           <section>
//             <div className="flex items-center space-x-4 mb-8">
//               <h3 className="text-2xl font-black text-gray-800 tracking-tight whitespace-nowrap">
//                 Control Center
//               </h3>
//               <div 
//                 className="flex-1 h-[2px] bg-gradient-to-r from-gray-200 via-gray-200 to-gray-200 rounded-full"
//                 style={{ backgroundImage: `linear-gradient(to right, #e5e7eb, ${PRIMARY_COLOR}, #e5e7eb)` }}
//               ></div>
//             </div>

//             <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//               <BigActionButton
//                 label="Manage Users"
//                 icon={Users}
//                 onClick={() => (window.location.href = "/manage-users")}
//                 bgColor={PRIMARY_LIGHT}
//                 iconColor={PRIMARY_COLOR}
//               />
//               <BigActionButton
//                 label="Events"
//                 icon={CalendarDays}
//                 onClick={() => (window.location.href = "/events-superadmin")}
//                 bgColor="rgba(16, 185, 129, 0.1)"
//                 iconColor="#10B981"
//               />
//               <BigActionButton
//                 label="Departments"
//                 icon={Database}
//                 onClick={() => {
//                   fetchDepartments();
//                   setShowDeptModal(true);
//                 }}
//                 bgColor="rgba(236, 72, 153, 0.1)"
//                 iconColor="#EC4899"
//               />
//               <BigActionButton
//                 label="Manage Clubs"
//                 icon={Database}
//                 onClick={() => (window.location.href = "/manage-clubs")}
//                 bgColor="rgba(6, 182, 212, 0.1)"
//                 iconColor="#06B6D4"
//               />
//               <BigActionButton
//                 label="Club Admins"
//                 icon={ShieldCheck}
//                 onClick={() => (window.location.href = "/club-admins")}
//                 bgColor="rgba(249, 115, 22, 0.1)"
//                 iconColor="#F97316"
//               />
//               <BigActionButton
//                 label="Add Student"
//                 icon={UserPlus}
//                 onClick={() => (window.location.href = "/add-users-with-club")}
//                 bgColor="rgba(59, 130, 246, 0.1)"
//                 iconColor="#3B82F6"
//               />
//               <BigActionButton
//                 label="Club Association"
//                 icon={Building2}
//                 onClick={() =>
//                   (window.location.href = "/remove-users-from-any-club")
//                 }
//                 bgColor="rgba(6, 182, 212, 0.1)"
//                 iconColor="#06B6D4"
//               />
//               <BigActionButton
//                 label="Audit Logs"
//                 icon={Database}
//                 onClick={() => alert("Audit Logs feature")}
//                 bgColor="rgba(100, 116, 139, 0.1)"
//                 iconColor="#64748B"
//               />
//             </div>
//           </section>
//         </div>
//       </main>

//       {/* Profile Form Modal */}
//       {showProfileForm && (
//         <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center p-6 z-50 overflow-y-auto">
//           <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full my-8 overflow-hidden border border-white">
//             <div 
//               className="p-8 text-white" 
//               style={{ background: `linear-gradient(135deg, ${PRIMARY_COLOR}, #315169)` }}
//             >
//               <div className="flex justify-between items-center">
//                 <h3 className="text-2xl font-bold">
//                   {userProfile ? "Edit Profile" : "Complete Profile"}
//                 </h3>
//                 <button
//                   onClick={() => {
//                     setShowProfileForm(false);
//                     setMessage({ text: "", type: "" });
//                   }}
//                   className="bg-white/20 p-2 rounded-xl hover:bg-white/30 transition-all duration-200 hover:rotate-90 cursor-pointer"
//                 >
//                   <X size={20} />
//                 </button>
//               </div>
//             </div>

//             <form onSubmit={handleSubmitProfile} className="p-8 space-y-5">
//               <div className="flex flex-col items-center mb-6">
//                 <div className="relative">
//                   <img
//                     src={
//                       imagePreview ||
//                       `https://ui-avatars.com/api/?name=${profileData.fullName || currentUser.username}&background=4CA1AF&color=fff&size=128`
//                     }
//                     alt="Profile Preview"
//                     className="w-32 h-32 rounded-full object-cover border-4"
//                     style={{ borderColor: PRIMARY_LIGHT }}
//                   />
//                   <label 
//                     className="absolute bottom-0 right-0 p-2 rounded-full cursor-pointer hover:scale-110 transition-all shadow-lg"
//                     style={{ backgroundColor: PRIMARY_COLOR }}
//                   >
//                     <Camera size={20} className="text-white" />
//                     <input
//                       type="file"
//                       accept="image/*"
//                       onChange={handleImageChange}
//                       className="hidden"
//                     />
//                   </label>
//                 </div>
//                 <p className="text-sm text-gray-500 mt-2">
//                   Click camera to upload photo
//                 </p>
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   PRN <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="prn"
//                   value={profileData.prn}
//                   onChange={handleInputChange}
//                   className={`w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all ${userProfile ? "bg-gray-100 cursor-not-allowed" : ""}`}
//                   style={{ 
//                     outline: 'none',
//                     '--tw-ring-color': PRIMARY_COLOR
//                   }}
//                   onFocus={(e) => e.target.style.boxShadow = `0 0 0 2px ${PRIMARY_COLOR}20`}
//                   onBlur={(e) => e.target.style.boxShadow = ''}
//                   readOnly={!!userProfile}
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Full Name <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="fullName"
//                   value={profileData.fullName}
//                   onChange={handleInputChange}
//                   className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all"
//                   style={{ 
//                     outline: 'none',
//                     '--tw-ring-color': PRIMARY_COLOR
//                   }}
//                   onFocus={(e) => e.target.style.boxShadow = `0 0 0 2px ${PRIMARY_COLOR}20`}
//                   onBlur={(e) => e.target.style.boxShadow = ''}
//                   placeholder="Enter your full name"
//                   required
//                 />
//               </div>

//               {/* <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Department <span className="text-red-500">*</span>
//                 </label>
//                 <select
//                   name="departmentId"
//                   value={profileData.departmentId}
//                   onChange={handleInputChange}
//                   className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all"
//                   style={{ 
//                     outline: 'none',
//                     '--tw-ring-color': PRIMARY_COLOR
//                   }}
//                   onFocus={(e) => e.target.style.boxShadow = `0 0 0 2px ${PRIMARY_COLOR}20`}
//                   onBlur={(e) => e.target.style.boxShadow = ''}
//                   required
//                 >
//                   <option value="">Select Department</option>
//                   {departments.map(dept => (
//                     <option key={dept.departmentId} value={dept.departmentId}>
//                       {dept.name}
//                     </option>
//                   ))}
//                 </select>
//               </div> */}

//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Phone Number <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="tel"
//                   name="phoneNumber"
//                   value={profileData.phoneNumber}
//                   onChange={handleInputChange}
//                   className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all"
//                   style={{ 
//                     outline: 'none',
//                     '--tw-ring-color': PRIMARY_COLOR
//                   }}
//                   onFocus={(e) => e.target.style.boxShadow = `0 0 0 2px ${PRIMARY_COLOR}20`}
//                   onBlur={(e) => e.target.style.boxShadow = ''}
//                   placeholder="10-digit phone number"
//                   required
//                 />
//               </div>

//               {message.text && (
//                 <div
//                   className={`p-4 rounded-xl ${message.type === "error" ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"}`}
//                 >
//                   <p className="text-sm font-semibold">{message.text}</p>
//                 </div>
//               )}

//               <div className="flex space-x-4 pt-4">
//                 <button
//                   type="button"
//                   onClick={() => setShowProfileForm(false)}
//                   className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-xl font-bold transition-all cursor-pointer"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={profileLoading}
//                   className="flex-1 text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
//                   style={{ background: `linear-gradient(135deg, ${PRIMARY_COLOR}, #315169)` }}
//                 >
//                   {profileLoading
//                     ? "Saving..."
//                     : userProfile
//                       ? "Update Profile"
//                       : "Create Profile"}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* Department CRUD Modal */}
//       {showDeptModal && (
//         <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center p-6 z-50">
//           <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden border border-white flex flex-col">
//             <div 
//               className="p-8 text-white flex justify-between items-center"
//               style={{ background: `linear-gradient(135deg, ${PRIMARY_COLOR}, #315169)` }}
//             >
//               <div>
//                 <h3 className="text-2xl font-bold tracking-tight">
//                   Department Management
//                 </h3>
//                 <p className="text-white/80 text-sm">
//                   Add or remove academic departments
//                 </p>
//               </div>
//               <button
//                 onClick={() => {
//                   setShowDeptModal(false);
//                   setEditingDept(null);
//                   setDeptInput("");
//                   setDeptMessage({ text: "", type: "" });
//                 }}
//                 className="bg-white/20 p-2 rounded-xl hover:bg-white/30 transition-all duration-200 hover:rotate-90 cursor-pointer"
//               >
//                 <X size={20} />
//               </button>
//             </div>

//             <div className="p-8 flex-1 overflow-y-auto">
//               {/* Status message */}
//               {deptMessage.text && (
//                 <div
//                   className={`mb-6 p-4 rounded-xl ${deptMessage.type === "error" ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"}`}
//                 >
//                   <p className="text-sm font-semibold flex items-center gap-2">
//                     {deptMessage.type === "success" ? "✓" : "⚠"}{" "}
//                     {deptMessage.text}
//                   </p>
//                 </div>
//               )}

//               {/* Form to add/edit department */}
//               <form onSubmit={handleDeptSubmit} className="mb-8">
//                 <div className="flex gap-3">
//                   <input
//                     type="text"
//                     placeholder="Enter department name..."
//                     className="flex-1 px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all"
//                     style={{ 
//                       outline: 'none',
//                       '--tw-ring-color': PRIMARY_COLOR
//                     }}
//                     onFocus={(e) => e.target.style.boxShadow = `0 0 0 2px ${PRIMARY_COLOR}20`}
//                     onBlur={(e) => e.target.style.boxShadow = ''}
//                     value={deptInput}
//                     onChange={(e) => setDeptInput(e.target.value)}
//                     required
//                   />
//                   <button
//                     type="submit"
//                     className="text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap shadow-lg cursor-pointer"
//                     style={{ 
//                       background: `linear-gradient(135deg, ${PRIMARY_COLOR}, #315169)`, 
//                       boxShadow: '0 10px 15px -3px rgba(76, 161, 175, 0.2)' 
//                     }}
//                   >
//                     {editingDept ? <Edit size={18} /> : <Plus size={18} />}
//                     {editingDept ? "Update Dept" : "Add Dept"}
//                   </button>
//                 </div>
//                 {editingDept && (
//                   <div className="mt-2 text-sm text-gray-500 flex items-center gap-2">
//                     <span>
//                       Editing:{" "}
//                       <span className="font-bold">{editingDept.name}</span>
//                     </span>
//                     <button
//                       type="button"
//                       onClick={() => {
//                         setEditingDept(null);
//                         setDeptInput("");
//                       }}
//                       className="text-xs text-red-500 hover:text-red-700 underline cursor-pointer"
//                     >
//                       Cancel
//                     </button>
//                   </div>
//                 )}
//               </form>

//               {/* List of departments */}
//               {deptLoading ? (
//                 <div className="py-10 text-center text-gray-500 italic">
//                   <div 
//                     className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-3 cursor-wait" 
//                     style={{ borderColor: PRIMARY_COLOR }}
//                   ></div>
//                   Loading departments...
//                 </div>
//               ) : (
//                 <div className="space-y-3">
//                   {departments.length > 0 ? (
//                     departments.map((dept) => (
//                       <div
//                         key={dept.departmentId}
//                         className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100 transition-all group cursor-pointer hover:border-[#4CA1AF]"
//                       >
//                         <div className="flex items-center gap-3">
//                           <span className="font-bold text-gray-700">
//                             {dept.name}
//                           </span>
//                           <span
//                             className={`text-xs font-bold px-2 py-1 rounded-full ${dept.active ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}
//                           >
//                             {dept.active ? "Active" : "Inactive"}
//                           </span>
//                         </div>
//                         <div className="flex gap-2">
//                           <button
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               setConfirmDialog({ isOpen: true, title: "Delete Department", message: "Are you sure you want to delete this department? This action cannot be undone.", confirmText: "Delete", variant: "danger", onConfirm: () => { closeConfirm(); deleteDepartment(dept.departmentId); } });
//                             }}
//                             className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
//                             title="Delete"
//                           >
//                             <Trash2 size={16} />
//                           </button>
//                         </div>
//                       </div>
//                     ))
//                   ) : (
//                     <div className="text-center py-10">
//                       <Database className="w-12 h-12 text-gray-200 mx-auto mb-3" />
//                       <p className="text-gray-400 font-medium">
//                         No departments found in system.
//                       </p>
//                       <p className="text-sm text-gray-300 mt-1">
//                         Add a department using the form above
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>

//             <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
//               <div className="text-sm text-gray-500">
//                 {departments.length} department
//                 {departments.length !== 1 ? "s" : ""}
//               </div>
//               <button
//                 onClick={() => setShowDeptModal(false)}
//                 className="text-sm font-bold text-gray-500 hover:text-gray-700 px-4 py-2 cursor-pointer"
//               >
//                 Close Manager
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Email Edit Modal */}
//       {showEmailEditModal && (
//         <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center p-6 z-50">
//           <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full overflow-hidden border border-white">
//             <div 
//               className="p-6 text-white" 
//               style={{ background: `linear-gradient(135deg, ${PRIMARY_COLOR}, #315169)` }}
//             >
//               <div className="flex justify-between items-center">
//                 <div>
//                   <h3 className="text-xl font-bold flex items-center gap-2">
//                     <Mail size={20} />
//                     Update Email Address
//                   </h3>
//                   <p className="text-white/80 text-sm mt-1">
//                     Enter your new email address
//                   </p>
//                 </div>
//                 <button
//                   onClick={() => {
//                     setShowEmailEditModal(false);
//                     setEmailMessage({ text: "", type: "" });
//                     setNewEmail("");
//                   }}
//                   className="bg-white/20 p-2 rounded-xl hover:bg-white/30 transition-all duration-200 hover:rotate-90 cursor-pointer"
//                 >
//                   <X size={18} />
//                 </button>
//               </div>
//             </div>

//             <form onSubmit={handleEmailUpdate} className="p-6 space-y-5">
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Current Email
//                 </label>
//                 <input
//                   type="email"
//                   value={currentUser.email}
//                   className="w-full px-4 py-3 bg-gray-100 border-2 border-gray-200 rounded-xl text-gray-600 cursor-not-allowed"
//                   disabled
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   New Email <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="email"
//                   value={newEmail}
//                   onChange={(e) => setNewEmail(e.target.value)}
//                   className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all"
//                   style={{ 
//                     outline: 'none',
//                     '--tw-ring-color': PRIMARY_COLOR
//                   }}
//                   onFocus={(e) => e.target.style.boxShadow = `0 0 0 2px ${PRIMARY_COLOR}20`}
//                   onBlur={(e) => e.target.style.boxShadow = ''}
//                   placeholder="Enter new email address"
//                   required
//                 />
//               </div>

//               {emailMessage.text && (
//                 <div
//                   className={`p-3 rounded-xl ${emailMessage.type === "error" ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"}`}
//                 >
//                   <p className="text-sm font-semibold flex items-center gap-2">
//                     {emailMessage.type === "success" ? "✓" : "⚠"} {emailMessage.text}
//                   </p>
//                 </div>
//               )}

//               <div className="flex space-x-4 pt-4">
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setShowEmailEditModal(false);
//                     setEmailMessage({ text: "", type: "" });
//                     setNewEmail("");
//                   }}
//                   className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-xl font-bold transition-all cursor-pointer"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={emailLoading || newEmail === currentUser.email}
//                   className="flex-1 text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
//                   style={{ background: `linear-gradient(135deg, ${PRIMARY_COLOR}, #315169)` }}
//                 >
//                   {emailLoading ? (
//                     <div className="flex items-center justify-center gap-2">
//                       <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                       Updating...
//                     </div>
//                   ) : (
//                     "Update Email"
//                   )}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
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
// }


import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ConfirmDialog from "../../components/ConfirmDialog";
import {
  User,
  Upload,
  X,
  CalendarDays,
  Edit,
  Users,
  Briefcase,
  ShieldCheck,
  Settings,
  Database,
  LogOut,
  LayoutDashboard,
  UserPlus,
  ShieldAlert,
  Menu,
  Camera,
  Trash2,
  Plus,
  Building2,
  CalendarPlus,
  Mail,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export default function SuperAdminDashboard() {
  const navigate = useNavigate();

  const PRIMARY_COLOR = "#4CA1AF";
  const PRIMARY_DARK = "#2d8391";
  const PRIMARY_LIGHT = "rgba(76, 161, 175, 0.1)";

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const [currentUser, setCurrentUser] = useState({
    username: user?.username || "admin_user",
    email: user?.email || "admin@college.edu",
    role: user?.role || "SUPER_ADMIN",
    prn: user?.prn || "2021BCS001",
    verified: user?.verified || false,
  });

  // Email update states
  const [showEmailEditModal, setShowEmailEditModal] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailMessage, setEmailMessage] = useState({ text: "", type: "" });

  // Verification state
  const [verificationStatus, setVerificationStatus] = useState(currentUser.verified);

  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [clubAdmins, setCount] = useState({});
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Profile states
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [profileData, setProfileData] = useState({
    prn: user?.prn || "",
    fullName: "",
    department: "",
    year: "",
    phoneNumber: "",
    departmentId: "",
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [userProfile, setUserProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Department CRUD States
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [deptLoading, setDeptLoading] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [deptInput, setDeptInput] = useState("");
  const [deptMessage, setDeptMessage] = useState({ text: "", type: "" });
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

  useEffect(() => {
    fetchUserCount();
    fetchAllData();
    fetchUserProfile();
  }, []);

  const fetchUserCount = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/api/user-clubs/getAllByRole/CLUB_ADMIN",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      setCount(response.data.data.length);
    } catch (error) {
      console.error("Error fetching club admin count:", error);
    }
  };

  const fetchAllData = async () => {
    try {
      const usersResponse = await axios.get("http://localhost:8080/api/users/", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setUsers(usersResponse.data);

      const userStats = usersResponse.data.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {});

      setStats(userStats);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    setDeptLoading(true);
    setDeptMessage({ text: "", type: "" });
    try {
      const response = await axios.get("http://localhost:8080/api/department", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data.success && response.data.data) {
        setDepartments(response.data.data);
      } else {
        setDepartments([]);
        setDeptMessage({
          text: response.data.message || "No departments found",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
      setDepartments([]);
      setDeptMessage({ text: "Error fetching departments", type: "error" });
    } finally {
      setDeptLoading(false);
    }
  };

  const handleDeptSubmit = async (e) => {
    e.preventDefault();
    if (!deptInput.trim()) {
      setDeptMessage({ text: "Please enter a department name", type: "error" });
      return;
    }

    try {
      if (editingDept) {
        const response = await axios.put(
          `http://localhost:8080/api/department/${editingDept.departmentId}`,
          { name: deptInput, active: true },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (response.data.success) {
          setDeptMessage({ text: "Department updated successfully!", type: "success" });
        } else {
          setDeptMessage({
            text: response.data.message || "Failed to update department",
            type: "error",
          });
          return;
        }
      } else {
        const response = await axios.post(
          `http://localhost:8080/api/department/${deptInput}`,
          null,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (response.data.success) {
          setDeptMessage({ text: "Department added successfully!", type: "success" });
        } else {
          setDeptMessage({
            text: response.data.message || "Failed to add department",
            type: "error",
          });
          return;
        }
      }

      setDeptInput("");
      setEditingDept(null);
      setTimeout(() => setDeptMessage({ text: "", type: "" }), 3000);
      fetchDepartments();
    } catch (error) {
      console.error("Error saving department:", error);
      setDeptMessage({
        text: error.response?.data?.message || "Error saving department",
        type: "error",
      });
    }
  };

  const deleteDepartment = async (departmentId) => {
    try {
      const response = await axios.delete(
        `http://localhost:8080/api/department/${departmentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data.success) {
        setDeptMessage({ text: "Department deleted successfully!", type: "success" });
        fetchDepartments();
      } else {
        setDeptMessage({
          text: response.data.message || "Failed to delete department",
          type: "error",
        });
      }

      setTimeout(() => setDeptMessage({ text: "", type: "" }), 3000);
    } catch (error) {
      console.error("Error deleting department:", error);
      setDeptMessage({
        text: error.response?.data?.message || "Error deleting department",
        type: "error",
      });
    }
  };

  const fetchUserProfile = async () => {
    try {
      setIsLoadingProfile(true);
      const response = await axios.get(
        `http://localhost:8080/api/profiles/prn/${user?.prn}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data) {
        setUserProfile(response.data);
        setProfileData({
          prn: response.data.data.prn || user?.prn || "",
          fullName: response.data.data.fullName || "",
          department: response.data.data.department || "",
          year: response.data.data.year || "",
          phoneNumber: response.data.data.phoneNumber || "",
          departmentId: response.data.data.departmentId || "",
        });
        fetchProfileImage();
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setUserProfile(null);
      setProfileData((prev) => ({ ...prev, prn: user?.prn || "" }));
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const fetchProfileImage = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/profiles/${user?.prn}/image`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        },
      );
      if (response.data) {
        setImagePreview(URL.createObjectURL(response.data));
      }
    } catch (error) {
      console.error("Error fetching profile image:", error);
      setImagePreview(null);
    }
  };

  const handleVerificationRedirect = () => {
    localStorage.setItem("verificationEmail", currentUser.email);
    localStorage.setItem("verificationPRN", currentUser.prn);
    navigate("/otp");
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleInputChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const requestData = {
        fullName: profileData.fullName,
        departmentId: parseInt(profileData.departmentId),
        phoneNumber: profileData.phoneNumber,
      };

      if (userProfile) {
        await axios.put(
          `http://localhost:8080/api/profiles/${profileData.prn}`,
          requestData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );
      } else {
        await axios.post(
          "http://localhost:8080/api/profiles",
          { ...requestData, prn: profileData.prn },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );
      }

      if (selectedImage) {
        const formData = new FormData();
        formData.append("image", selectedImage);
        await axios.post(
          `http://localhost:8080/api/profiles/${profileData.prn}/image`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          },
        );
      }

      fetchUserProfile();
      setShowProfileForm(false);
    } catch (error) {
      setMessage({ text: "Error saving profile.", type: "error" });
    } finally {
      setProfileLoading(false);
    }
  };

  // Clean single API call for email change
  const handleEmailUpdate = async () => {
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
        `http://localhost:8080/api/users/changeEmail/${currentUser.prn}/${encodeURIComponent(newEmail)}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data) {
        const updatedUser = { ...currentUser, email: newEmail, verified: false };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setCurrentUser(updatedUser);
        setVerificationStatus(false);

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
          navigate("/otp");
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
  };

  const StatCard = ({ title, count, icon: Icon, bgColor, iconColor }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer group">
      <div
        className="p-4 rounded-xl flex-shrink-0 transition-all duration-300 group-hover:scale-110"
        style={{ backgroundColor: bgColor || PRIMARY_LIGHT, color: iconColor || PRIMARY_COLOR }}
      >
        <Icon className="w-7 h-7" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider truncate group-hover:text-gray-700 transition-colors">
          {title}
        </p>
        <p className="text-3xl font-bold text-gray-900">{count}</p>
      </div>
    </div>
  );

  const BigActionButton = ({ label, icon: Icon, onClick, bgColor, iconColor }) => (
    <button
      onClick={onClick}
      className="group flex flex-col items-center justify-center p-8 rounded-3xl transition-all duration-300 bg-white border-2 border-gray-100 hover:shadow-xl min-h-[160px] hover:-translate-y-2 cursor-pointer"
    >
      <div
        className="p-5 rounded-2xl mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm"
        style={{ backgroundColor: bgColor || PRIMARY_LIGHT, color: iconColor || PRIMARY_COLOR }}
      >
        <Icon className="w-8 h-8" />
      </div>
      <span className="text-lg font-bold text-gray-700 transition-colors text-center px-2">
        {label}
      </span>
    </button>
  );

  if (loading || isLoadingProfile) {
    return (
      <div className="min-h-screen bg-[#fcfcfd] flex items-center justify-center">
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-16 w-16 border-b-2 mx-auto mb-4 cursor-wait"
            style={{ borderColor: PRIMARY_DARK }}
          ></div>
          <p className="text-gray-600 font-semibold">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#fcfcfd] flex relative">
        {/* Mobile Header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between z-50 shadow-sm">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 hover:scale-105 cursor-pointer"
          >
            <Menu size={24} className="text-gray-700" />
          </button>
          <div className="flex items-center space-x-2">
            <div
              className="p-2 rounded-lg transition-transform hover:scale-105 cursor-pointer"
              style={{ background: `linear-gradient(135deg, ${PRIMARY_COLOR}, #315169)` }}
            >
              <LayoutDashboard className="text-white w-5 h-5" />
            </div>
            <h2 className="text-xl font-black tracking-tight text-gray-800">
              Super<span style={{ color: PRIMARY_COLOR }}>Admin</span>
            </h2>
          </div>
          <div
            className="w-10 h-10 rounded-full overflow-hidden border-2 transition-all hover:scale-105 cursor-pointer"
            style={{ borderColor: PRIMARY_LIGHT }}
          >
            <img
              src={
                imagePreview ||
                `https://ui-avatars.com/api/?name=${profileData.fullName || currentUser.username}&background=4CA1AF&color=fff`
              }
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 cursor-pointer"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed lg:sticky top-0 left-0 h-screen
            w-80 sm:w-96 bg-white border-r border-gray-100 
            flex flex-col p-8 shadow-lg lg:shadow-sm
            transition-transform duration-300 ease-in-out z-50
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            overflow-y-auto
          `}
        >
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden absolute top-4 right-4 p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 hover:rotate-90 cursor-pointer"
          >
            <X size={20} className="text-gray-500" />
          </button>

          <div className="flex items-center space-x-3 mb-10 group cursor-pointer">
            <div
              className="p-2.5 rounded-xl shadow-lg transition-all duration-300 group-hover:scale-105 cursor-pointer"
              style={{
                background: `linear-gradient(135deg, ${PRIMARY_COLOR}, #315169)`,
                boxShadow: "0 10px 15px -3px rgba(76, 161, 175, 0.2)",
              }}
            >
              <LayoutDashboard className="text-white" size={24} />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-gray-800">
              Super<span style={{ color: PRIMARY_DARK }}>Admin</span>
            </h2>
          </div>

          <div className="flex flex-col items-center text-center mb-8">
            <div
              className="relative p-1 border-2 rounded-3xl mb-4 transition-all duration-300 hover:shadow-lg cursor-pointer"
              style={{
                borderColor: PRIMARY_LIGHT,
                boxShadow: "0 10px 15px -3px rgba(76, 161, 175, 0.1)",
              }}
            >
              <img
                src={
                  imagePreview ||
                  `https://ui-avatars.com/api/?name=${profileData.fullName || currentUser.username}&background=4CA1AF&color=fff`
                }
                alt="Profile"
                className="w-32 h-32 rounded-[2rem] object-cover shadow-inner"
              />
              <button
                onClick={() => setShowProfileForm(true)}
                className="absolute -bottom-1 -right-1 bg-white p-2 rounded-xl shadow-lg border border-gray-50 transition-all duration-200 hover:scale-110 cursor-pointer"
                style={{ color: PRIMARY_DARK }}
              >
                <Edit size={16} />
              </button>
            </div>
            <h3 className="font-bold text-gray-900 text-xl tracking-tight">
              {profileData.fullName || currentUser.username}
            </h3>
            <p
              className="text-[10px] font-black px-3 py-1 rounded-full mt-2 uppercase tracking-[0.1em] transition-colors cursor-pointer"
              style={{ color: PRIMARY_DARK, backgroundColor: PRIMARY_LIGHT }}
            >
              {currentUser.role.replace("_", " ")}
            </p>
          </div>

          <nav className="space-y-2 flex-1 overflow-y-auto">
            <div className="p-6 bg-gray-50/50 rounded-2xl border border-gray-100 space-y-4 transition-all duration-300 hover:shadow-md hover:bg-gray-50">
              <div className="flex flex-col group cursor-pointer">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 transition-colors group-hover:text-[#4CA1AF]">
                  Full Name
                </span>
                <span className="text-sm font-bold text-gray-700 break-words group-hover:text-gray-900 transition-colors">
                  {profileData.fullName || "Not set"}
                </span>
              </div>
              <div className="flex flex-col group cursor-pointer">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 transition-colors group-hover:text-[#4CA1AF]">
                  Username
                </span>
                <span className="text-sm font-bold text-gray-700 break-words group-hover:text-gray-900 transition-colors">
                  {currentUser.username}
                </span>
              </div>

              {/* Email field with both edit and verify buttons */}
              <div className="flex flex-col group cursor-pointer relative">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 transition-colors group-hover:text-[#4CA1AF]">
                  Email
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-700 break-all group-hover:text-gray-900 transition-colors pr-2">
                    {currentUser.email}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setNewEmail(currentUser.email);
                        setShowEmailEditModal(true);
                      }}
                      className="p-1.5 rounded-lg hover:bg-gray-200 transition-all duration-200 hover:scale-110 flex-shrink-0 cursor-pointer"
                      style={{ color: PRIMARY_COLOR }}
                      title="Edit email"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={handleVerificationRedirect}
                      className={`p-1.5 rounded-lg transition-all duration-200 hover:scale-110 flex-shrink-0 cursor-pointer flex items-center gap-1 ${
                        verificationStatus
                          ? "bg-green-50 text-green-600 hover:bg-green-100"
                          : "bg-amber-50 text-amber-600 hover:bg-amber-100"
                      }`}
                      title={verificationStatus ? "Verified" : "Click to verify"}
                    >
                      {verificationStatus ? (
                        <CheckCircle size={14} />
                      ) : (
                        <AlertCircle size={14} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col group cursor-pointer">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 transition-colors group-hover:text-[#4CA1AF]">
                  Phone
                </span>
                <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900 transition-colors">
                  {profileData.phoneNumber || "Not set"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col group cursor-pointer">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 transition-colors group-hover:text-[#4CA1AF]">
                    PRN
                  </span>
                  <span className="text-sm font-bold text-gray-700 break-words group-hover:text-gray-900 transition-colors">
                    {profileData.prn || "Not set"}
                  </span>
                </div>
              </div>
              <div className="flex flex-col group cursor-pointer">
                <span className="text-sm font-bold text-gray-700 break-words group-hover:text-gray-900 transition-colors">
                  {profileData.department || "Not set"}
                </span>
              </div>
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between group cursor-pointer">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest transition-colors group-hover:text-[#4CA1AF]">
                  Status
                </span>
                <span
                  className={`flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md group-hover:scale-105 transition-all duration-200 cursor-pointer ${
                    currentUser.verified
                      ? "text-emerald-600 bg-emerald-50 group-hover:bg-emerald-100"
                      : "text-amber-600 bg-amber-50 group-hover:bg-amber-100"
                  }`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full mr-1.5 ${currentUser.verified ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`}
                  ></div>
                  {currentUser.verified ? "ACTIVE" : "PENDING VERIFICATION"}
                </span>
              </div>
            </div>
          </nav>

          <button
            onClick={() =>
              setConfirmDialog({
                isOpen: true,
                title: "Sign Out",
                message: "Are you sure you want to sign out?",
                confirmText: "Sign Out",
                variant: "danger",
                onConfirm: () => {
                  closeConfirm();
                  handleLogout();
                },
              })
            }
            className="mt-6 flex items-center justify-center space-x-3 w-full py-4 text-red-500 hover:bg-red-50 rounded-2xl transition-all duration-200 font-bold text-sm border border-transparent hover:border-red-100 hover:shadow-md hover:shadow-red-100/50 cursor-pointer"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 w-full pt-20 lg:pt-0 px-6 lg:px-10 pb-10">
          <div className="max-w-7xl mx-auto">
            <header className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-12 pt-10">
              <div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">
                  Dashboard
                </h1>
                <p className="text-base text-gray-500 font-medium">
                  Welcome back,{" "}
                  <span className="font-bold" style={{ color: PRIMARY_COLOR }}>
                    {currentUser.username}
                  </span>
                  . System is healthy.
                </p>
              </div>
              <div className="flex items-center space-x-3 bg-emerald-50 text-emerald-700 px-5 py-2.5 rounded-2xl border border-emerald-100 shadow-sm shadow-emerald-50 self-start transition-all duration-300 hover:bg-emerald-100 hover:shadow-md hover:shadow-emerald-100/50 hover:-translate-y-0.5 cursor-pointer">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-black uppercase tracking-wider">
                  All Systems Live
                </span>
              </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-16">
              <StatCard
                title="Total Users"
                count={users.length}
                icon={Users}
                bgColor={PRIMARY_LIGHT}
                iconColor={PRIMARY_COLOR}
              />
              <StatCard
                title="Faculty"
                count={stats.TEACHERS || 0}
                icon={Briefcase}
                bgColor="rgba(59, 130, 246, 0.1)"
                iconColor="#3B82F6"
              />
              <StatCard
                title="Club Admins"
                count={clubAdmins || 0}
                icon={ShieldCheck}
                bgColor="rgba(16, 185, 129, 0.1)"
                iconColor="#10B981"
              />
              <StatCard
                title="Regular"
                count={stats.USERS || 0}
                icon={User}
                bgColor="rgba(249, 115, 22, 0.1)"
                iconColor="#F97316"
              />
            </div>

            {/* Control Center */}
            <section>
              <div className="flex items-center space-x-4 mb-8">
                <h3 className="text-2xl font-black text-gray-800 tracking-tight whitespace-nowrap">
                  Control Center
                </h3>
                <div
                  className="flex-1 h-[2px] bg-gradient-to-r from-gray-200 via-gray-200 to-gray-200 rounded-full"
                  style={{
                    backgroundImage: `linear-gradient(to right, #e5e7eb, ${PRIMARY_COLOR}, #e5e7eb)`,
                  }}
                ></div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <BigActionButton
                  label="Manage Users"
                  icon={Users}
                  onClick={() => navigate("/manage-users")}
                  bgColor={PRIMARY_LIGHT}
                  iconColor={PRIMARY_COLOR}
                />
                <BigActionButton
                  label="Events"
                  icon={CalendarDays}
                  onClick={() => navigate("/events-superadmin")}
                  bgColor="rgba(16, 185, 129, 0.1)"
                  iconColor="#10B981"
                />
                <BigActionButton
                  label="Departments"
                  icon={Database}
                  onClick={() => {
                    fetchDepartments();
                    setShowDeptModal(true);
                  }}
                  bgColor="rgba(236, 72, 153, 0.1)"
                  iconColor="#EC4899"
                />
                <BigActionButton
                  label="Manage Clubs"
                  icon={Database}
                  onClick={() => navigate("/manage-clubs")}
                  bgColor="rgba(6, 182, 212, 0.1)"
                  iconColor="#06B6D4"
                />
                <BigActionButton
                  label="Club Admins"
                  icon={ShieldCheck}
                  onClick={() => navigate("/club-admins")}
                  bgColor="rgba(249, 115, 22, 0.1)"
                  iconColor="#F97316"
                />
                <BigActionButton
                  label="Add Student"
                  icon={UserPlus}
                  onClick={() => navigate("/add-users-with-club")}
                  bgColor="rgba(59, 130, 246, 0.1)"
                  iconColor="#3B82F6"
                />
                <BigActionButton
                  label="Club Association"
                  icon={Building2}
                  onClick={() => navigate("/remove-users-from-any-club")}
                  bgColor="rgba(6, 182, 212, 0.1)"
                  iconColor="#06B6D4"
                />
                <BigActionButton
                  label="Create Event"
                  icon={CalendarPlus}
                  onClick={() => navigate("/create-event")}
                  bgColor="rgba(147, 51, 234, 0.1)"
                  iconColor="#9333EA"
                />
              </div>
            </section>
          </div>
        </main>

        {/* Profile Form Modal */}
        {showProfileForm && (
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center p-6 z-50 overflow-y-auto">
            <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full my-8 overflow-hidden border border-white">
              <div
                className="p-8 text-white"
                style={{ background: `linear-gradient(135deg, ${PRIMARY_COLOR}, #315169)` }}
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold">
                    {userProfile ? "Edit Profile" : "Complete Profile"}
                  </h3>
                  <button
                    onClick={() => {
                      setShowProfileForm(false);
                      setMessage({ text: "", type: "" });
                    }}
                    className="bg-white/20 p-2 rounded-xl hover:bg-white/30 transition-all duration-200 hover:rotate-90 cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmitProfile} className="p-8 space-y-5">
                <div className="flex flex-col items-center mb-6">
                  <div className="relative">
                    <img
                      src={
                        imagePreview ||
                        `https://ui-avatars.com/api/?name=${profileData.fullName || currentUser.username}&background=4CA1AF&color=fff&size=128`
                      }
                      alt="Profile Preview"
                      className="w-32 h-32 rounded-full object-cover border-4"
                      style={{ borderColor: PRIMARY_LIGHT }}
                    />
                    <label
                      className="absolute bottom-0 right-0 p-2 rounded-full cursor-pointer hover:scale-110 transition-all shadow-lg"
                      style={{ backgroundColor: PRIMARY_COLOR }}
                    >
                      <Camera size={20} className="text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Click camera to upload photo</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    PRN <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="prn"
                    value={profileData.prn}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none transition-all ${userProfile ? "bg-gray-100 cursor-not-allowed" : ""}`}
                    onFocus={(e) => (e.target.style.boxShadow = `0 0 0 2px ${PRIMARY_COLOR}20`)}
                    onBlur={(e) => (e.target.style.boxShadow = "")}
                    readOnly={!!userProfile}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={profileData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none transition-all"
                    onFocus={(e) => (e.target.style.boxShadow = `0 0 0 2px ${PRIMARY_COLOR}20`)}
                    onBlur={(e) => (e.target.style.boxShadow = "")}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={profileData.phoneNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none transition-all"
                    onFocus={(e) => (e.target.style.boxShadow = `0 0 0 2px ${PRIMARY_COLOR}20`)}
                    onBlur={(e) => (e.target.style.boxShadow = "")}
                    placeholder="10-digit phone number"
                    required
                  />
                </div>

                {message.text && (
                  <div
                    className={`p-4 rounded-xl ${message.type === "error" ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"}`}
                  >
                    <p className="text-sm font-semibold">{message.text}</p>
                  </div>
                )}

                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowProfileForm(false)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-xl font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="flex-1 text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                    style={{ background: `linear-gradient(135deg, ${PRIMARY_COLOR}, #315169)` }}
                  >
                    {profileLoading ? "Saving..." : userProfile ? "Update Profile" : "Create Profile"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Department CRUD Modal */}
        {showDeptModal && (
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center p-6 z-50">
            <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden border border-white flex flex-col">
              <div
                className="p-8 text-white flex justify-between items-center"
                style={{ background: `linear-gradient(135deg, ${PRIMARY_COLOR}, #315169)` }}
              >
                <div>
                  <h3 className="text-2xl font-bold tracking-tight">Department Management</h3>
                  <p className="text-white/80 text-sm">Add or remove academic departments</p>
                </div>
                <button
                  onClick={() => {
                    setShowDeptModal(false);
                    setEditingDept(null);
                    setDeptInput("");
                    setDeptMessage({ text: "", type: "" });
                  }}
                  className="bg-white/20 p-2 rounded-xl hover:bg-white/30 transition-all duration-200 hover:rotate-90 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 flex-1 overflow-y-auto">
                {deptMessage.text && (
                  <div
                    className={`mb-6 p-4 rounded-xl ${deptMessage.type === "error" ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"}`}
                  >
                    <p className="text-sm font-semibold flex items-center gap-2">
                      {deptMessage.type === "success" ? "✓" : "⚠"} {deptMessage.text}
                    </p>
                  </div>
                )}

                <form onSubmit={handleDeptSubmit} className="mb-8">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Enter department name..."
                      className="flex-1 px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none transition-all"
                      onFocus={(e) => (e.target.style.boxShadow = `0 0 0 2px ${PRIMARY_COLOR}20`)}
                      onBlur={(e) => (e.target.style.boxShadow = "")}
                      value={deptInput}
                      onChange={(e) => setDeptInput(e.target.value)}
                      required
                    />
                    <button
                      type="submit"
                      className="text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap shadow-lg cursor-pointer"
                      style={{
                        background: `linear-gradient(135deg, ${PRIMARY_COLOR}, #315169)`,
                        boxShadow: "0 10px 15px -3px rgba(76, 161, 175, 0.2)",
                      }}
                    >
                      {editingDept ? <Edit size={18} /> : <Plus size={18} />}
                      {editingDept ? "Update Dept" : "Add Dept"}
                    </button>
                  </div>
                  {editingDept && (
                    <div className="mt-2 text-sm text-gray-500 flex items-center gap-2">
                      <span>
                        Editing: <span className="font-bold">{editingDept.name}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingDept(null);
                          setDeptInput("");
                        }}
                        className="text-xs text-red-500 hover:text-red-700 underline cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </form>

                {deptLoading ? (
                  <div className="py-10 text-center text-gray-500 italic">
                    <div
                      className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-3 cursor-wait"
                      style={{ borderColor: PRIMARY_COLOR }}
                    ></div>
                    Loading departments...
                  </div>
                ) : (
                  <div className="space-y-3">
                    {departments.length > 0 ? (
                      departments.map((dept) => (
                        <div
                          key={dept.departmentId}
                          className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100 transition-all group cursor-pointer hover:border-[#4CA1AF]"
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-gray-700">{dept.name}</span>
                            <span
                              className={`text-xs font-bold px-2 py-1 rounded-full ${dept.active ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}
                            >
                              {dept.active ? "Active" : "Inactive"}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmDialog({
                                  isOpen: true,
                                  title: "Delete Department",
                                  message:
                                    "Are you sure you want to delete this department? This action cannot be undone.",
                                  confirmText: "Delete",
                                  variant: "danger",
                                  onConfirm: () => {
                                    closeConfirm();
                                    deleteDepartment(dept.departmentId);
                                  },
                                });
                              }}
                              className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10">
                        <Database className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                        <p className="text-gray-400 font-medium">No departments found in system.</p>
                        <p className="text-sm text-gray-300 mt-1">Add a department using the form above</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  {departments.length} department{departments.length !== 1 ? "s" : ""}
                </div>
                <button
                  onClick={() => setShowDeptModal(false)}
                  className="text-sm font-bold text-gray-500 hover:text-gray-700 px-4 py-2 cursor-pointer"
                >
                  Close Manager
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Email Edit Modal */}
        {showEmailEditModal && (
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center p-6 z-50">
            <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full overflow-hidden border border-white">
              <div
                className="p-6 text-white"
                style={{ background: `linear-gradient(135deg, ${PRIMARY_COLOR}, #315169)` }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Mail size={20} />
                      Update Email Address
                    </h3>
                    <p className="text-white/80 text-sm mt-1">Enter your new email address</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowEmailEditModal(false);
                      setEmailMessage({ text: "", type: "" });
                      setNewEmail("");
                    }}
                    className="bg-white/20 p-2 rounded-xl hover:bg-white/30 transition-all duration-200 hover:rotate-90 cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Current Email
                  </label>
                  <input
                    type="email"
                    value={currentUser.email}
                    className="w-full px-4 py-3 bg-gray-100 border-2 border-gray-200 rounded-xl text-gray-600 cursor-not-allowed"
                    disabled
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    New Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none transition-all"
                    onFocus={(e) => (e.target.style.boxShadow = `0 0 0 2px ${PRIMARY_COLOR}20`)}
                    onBlur={(e) => (e.target.style.boxShadow = "")}
                    placeholder="Enter new email address"
                    required
                  />
                </div>

                {emailMessage.text && (
                  <div
                    className={`p-3 rounded-xl ${emailMessage.type === "error" ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"}`}
                  >
                    <p className="text-sm font-semibold flex items-center gap-2">
                      {emailMessage.type === "success" ? "✓" : "⚠"} {emailMessage.text}
                    </p>
                  </div>
                )}

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={handleEmailUpdate}
                    disabled={emailLoading || !newEmail || newEmail === currentUser.email}
                    className="w-full text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                    style={{ background: `linear-gradient(135deg, ${PRIMARY_COLOR}, #315169)` }}
                  >
                    {emailLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Updating...
                      </div>
                    ) : (
                      "Update Email"
                    )}
                  </button>
                </div>
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