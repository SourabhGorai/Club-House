// import { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import debounce from "lodash/debounce"; 

// export default function AddStudent() {
//   const navigate = useNavigate();
//   const [clubs, setClubs] = useState([]);
//   const [loadingClubs, setLoadingClubs] = useState(false);
//   const [loadingProfile, setLoadingProfile] = useState(false);
//   const [prnError, setPrnError] = useState("");
//   const [prnTouched, setPrnTouched] = useState(false);
//   const [autoFilled, setAutoFilled] = useState(false);
//   const [userRole, setUserRole] = useState(null); // To store current user's role
  
//   const [form, setForm] = useState({
//     prn: "",
//     username: "",
//     email: "",
//     role: "USERS",
//     fullName: "",
//     department: "",
//     year: "",
//     phoneNumber: "",
//     clubId: "",
//     tenure: ""
//   });

//   const [loading, setLoading] = useState(false);

//   // Refs for debouncing
//   const debouncedFetchProfileRef = useRef();

//   useEffect(() => {
//     // Get user role from token or localStorage
//     const role = localStorage.getItem("userRole");
//     setUserRole(role);
    
//     // Fetch clubs based on user role
//     if (role === "SUPER_ADMIN") {
//       fetchAllClubs(); // Super admin can access all clubs
//     } else {
//       fetchMyClubs(); // Teachers only get their assigned clubs
//     }
    
//     // Create debounced function
//     debouncedFetchProfileRef.current = debounce((prn) => {
//       if (prn && prn.trim().length > 0) {
//         fetchProfileByPRN(prn.trim());
//       }
//     }, 500); // 500ms delay

//     return () => {
//       if (debouncedFetchProfileRef.current) {
//         debouncedFetchProfileRef.current.cancel();
//       }
//     };
//   }, []);

//   // Fetch ALL clubs - for SUPER_ADMIN
//   const fetchAllClubs = async () => {
//     try {
//       setLoadingClubs(true);
//       const response = await axios.get("http://localhost:8080/api/clubs", {
//         headers: {
//           "Authorization": `Bearer ${localStorage.getItem("token")}`
//         }
//       });
      
//       console.log("All Clubs Response:", response.data);
      
//       if (response.data.success) {
//         setClubs(response.data.data || []);
//       }
//     } catch (error) {
//       console.error("Error fetching all clubs:", error);
      
//       if (error.response?.status === 403) {
//         alert("Access denied. Trying to fetch your assigned clubs...");
//         // Fallback to my clubs if super admin access fails
//         fetchMyClubs();
//       } else if (error.response?.status === 401) {
//         alert("Your session has expired. Please login again.");
//         navigate("/login");
//       } else {
//         alert("Failed to load clubs. Please try again.");
//       }
//     } finally {
//       setLoadingClubs(false);
//     }
//   };

//   // Fetch only teacher's assigned clubs - for TEACHER/COORDINATOR roles
//   const fetchMyClubs = async () => {
//     try {
//       setLoadingClubs(true);
//       const response = await axios.get("http://localhost:8080/api/user-clubs/getMyClubs", {
//         headers: {
//           "Authorization": `Bearer ${localStorage.getItem("token")}`
//         }
//       });
      
//       console.log("My Clubs Response:", response.data);
      
//       if (response.data.success) {
//         setClubs(response.data.data || []);
//       } else {
//         console.error("Failed to fetch clubs:", response.data.message);
//         setClubs([]);
//       }
//     } catch (error) {
//       console.error("Error fetching my clubs:", error);
      
//       if (error.response?.status === 403) {
//         alert("You don't have permission to access any clubs. Please contact administrator.");
//       } else if (error.response?.status === 401) {
//         alert("Your session has expired. Please login again.");
//         navigate("/login");
//       } else {
//         alert("Failed to load your clubs. Please try again.");
//       }
      
//       setClubs([]);
//     } finally {
//       setLoadingClubs(false);
//     }
//   };

//   const fetchProfileByPRN = async (prn) => {
//     if (!prn || prn.trim().length === 0) {
//       setPrnError("");
//       return;
//     }

//     // Validate PRN format
//     if (!/^\d{10}$/.test(prn)) {
//       setPrnError("PRN must be 10 digits");
//       return;
//     }

//     try {
//       setLoadingProfile(true);
//       setPrnError("");
//       setAutoFilled(false);
      
//       // Fetch user data
//       try {
//         const userResponse = await axios.get(
//           `http://localhost:8080/api/users/${prn}`,
//           {
//             headers: {
//               "Authorization": `Bearer ${localStorage.getItem("token")}`
//             }
//           }
//         );

//         const userData = userResponse.data;
        
//         console.log("User Data Response:", userResponse.data);
        
//         // Check if the user has the correct role (USERS)
//         if (userData.role !== "USERS") {
//           setPrnError(`This person has role: ${userData.role}. Only users with "USERS" role can be added to clubs.`);
//           resetAutoFilledFields();
//           setLoadingProfile(false);
//           return;
//         }
        
//         // Fetch profile data
//         const profileResponse = await axios.get(
//           `http://localhost:8080/api/profiles/prn/${prn}`,
//           {
//             headers: {
//               "Authorization": `Bearer ${localStorage.getItem("token")}`
//             }
//           }
//         );

//         if (profileResponse.data.success) {
//           const profileData = profileResponse.data.data;
          
//           setForm(prev => ({
//             ...prev,
//             username: userData.username || "",
//             email: userData.email || "",
//             fullName: profileData.fullName || "",
//             department: profileData.department || "",
//             year: profileData.year || "",
//             phoneNumber: profileData.phoneNumber || ""
//           }));
          
//           console.log("Form filled with:", {
//             username: userData.username,
//             email: userData.email,
//             role: userData.role,
//             fullName: profileData.fullName,
//             department: profileData.department,
//             year: mapYearNumberToCode(profileData.year),
//             phoneNumber: profileData.phoneNumber
//           });
          
//           setAutoFilled(true);
//         } else {
//           setPrnError("No profile found for this PRN");
//           resetAutoFilledFields();
//         }
        
//       } catch (userError) {
//         console.error("Error fetching user data:", userError);
        
//         if (userError.response?.status === 404) {
//           setPrnError("No user found with this PRN");
//         } else if (userError.response?.status === 403) {
//           setPrnError("Access denied to user data");
//         } else {
//           setPrnError("Failed to fetch user data");
//         }
        
//         resetAutoFilledFields();
//         setAutoFilled(false);
//       }
      
//     } catch (error) {
//       console.error("Error in fetchProfileByPRN:", error);
      
//       if (error.response?.status === 404) {
//         setPrnError("No profile found for this PRN");
//       } else if (error.response?.status === 400) {
//         setPrnError("Invalid PRN format");
//       } else {
//         setPrnError("Failed to fetch profile data");
//       }
      
//       resetAutoFilledFields();
//       setAutoFilled(false);
//     } finally {
//       setLoadingProfile(false);
//     }
//   };

//   // Helper function to map year number to code
//   const mapYearNumberToCode = (yearNumber) => {
//     const yearMap = {
//       1: "FE",
//       2: "SE", 
//       3: "TE",
//       4: "BE"
//     };
//     return yearMap[yearNumber] || "";
//   };

//   // Reset auto-filled fields
//   const resetAutoFilledFields = () => {
//     setForm(prev => ({
//       ...prev,
//       username: "",
//       email: "",
//       fullName: "",
//       department: "",
//       year: "",
//       phoneNumber: "",
//       tenure: "",
//     }));
//     setAutoFilled(false);
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
    
//     if (name === "prn") {
//       setPrnTouched(true);
//       setPrnError("");
//       setAutoFilled(false);
      
//       if (!value || value.trim().length === 0) {
//         resetAutoFilledFields();
//       }
      
//       setForm(prev => ({ ...prev, [name]: value }));

//       if (debouncedFetchProfileRef.current) {
//         debouncedFetchProfileRef.current(value);
//       }
//     } else if (name !== "department" && name !== "year") {
//       setForm(prev => ({ ...prev, [name]: value }));
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!form.prn || !form.clubId || !form.tenure) {
//       alert("Please fill all required fields: PRN, Club, and Tenure");
//       return;
//     }

//     if (prnError.includes('role')) {
//       alert("Cannot add student with this role. Please enter a PRN with 'USERS' role.");
//       return;
//     }

//     setLoading(true);

//     try {
//       console.log("Sending user-club association data:", {
//         prn: form.prn,
//         clubId: form.clubId,
//         role: "MEMBER",
//         tenure: form.tenure
//       });

//       const res = await axios.post(
//         "http://localhost:8080/api/user-clubs",
//         {
//           prn: form.prn,
//           clubId: parseInt(form.clubId),
//           role: "MEMBER",
//           tenure: form.tenure
//         },
//         {
//           headers: {
//             "Content-Type": "application/json",
//             "Authorization": `Bearer ${localStorage.getItem("token")}`
//           },
//         }
//       );

//       console.log("Student added to club successfully:", res.data);
      
//       if (res.data.success) {
//         alert("Student added to club successfully!");
        
//         setForm({
//           prn: "",
//           username: "",
//           email: "",
//           role: "USERS",
//           fullName: "",
//           department: "",
//           year: "",
//           phoneNumber: "",
//           clubId: "",
//           tenure: ""
//         });
//         setPrnTouched(false);
//         setPrnError("");
//         setAutoFilled(false);
//       } else {
//         alert(`Failed to add student: ${res.data.message || "Unknown error"}`);
//       }
      
//     } catch (err) {
//       console.error("Error adding student to club:", err);
      
//       if (err.response?.status === 403) {
//         alert("You don't have permission to add students to this club. Please contact administrator.");
//       } else if (err.response?.status === 401) {
//         alert("Your session has expired. Please login again.");
//         navigate("/login");
//       } else {
//         const errorMessage =
//           err.response?.data?.message ||
//           err.response?.data ||
//           "Failed to add student to club!";
//         alert(errorMessage);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const isSuperAdmin = userRole === "SUPER_ADMIN";
//   const hasNoClubs = !loadingClubs && clubs.length === 0 && !isSuperAdmin;
//   const showNoClubMessage = !loadingClubs && clubs.length === 0;

//   return (
//     <div
//       className="min-h-screen w-full flex items-center justify-center p-4 overflow-auto"
//       style={{
//         background:
//           "radial-gradient(circle at top left, #F2EEFF, #FDFCFE 60%, #F8F5FF)",
//       }}
//     >
//       <div className="w-full max-w-6xl bg-white rounded-2xl md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row relative mx-auto my-4 md:my-8">
//         {/* Left Side - Add Student Form */}
//         <div className="w-full md:w-3/5 p-6 md:p-8 lg:p-10 flex flex-col">
//           <div className="mb-6 flex justify-between items-center">
//             <p className="text-sm md:text-base text-gray-600 font-medium">
//               <b>{isSuperAdmin ? "Add Student to Club (Super Admin)" : "Add Student to Your Club"}</b>
//             </p>
//             {isSuperAdmin && (
//               <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
//                 Super Admin Access
//               </span>
//             )}
//           </div>

//           <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
//             Add Student to Club
//           </h2>

//           {/* Show message if teacher has no club access */}
//           {!isSuperAdmin && hasNoClubs && (
//             <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
//               <div className="flex items-start gap-3">
//                 <div className="flex-shrink-0">
//                   <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
//                   </svg>
//                 </div>
//                 <div>
//                   <h3 className="text-sm font-medium text-yellow-800">No Club Access</h3>
//                   <p className="text-sm text-yellow-700 mt-1">
//                     You don't have access to any clubs. Please contact the administrator to get access.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Show message if no clubs exist in system */}
//           {isSuperAdmin && showNoClubMessage && (
//             <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
//               <div className="flex items-start gap-3">
//                 <div className="flex-shrink-0">
//                   <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                   </svg>
//                 </div>
//                 <div>
//                   <h3 className="text-sm font-medium text-blue-800">No Clubs Available</h3>
//                   <p className="text-sm text-blue-700 mt-1">
//                     No clubs have been created in the system yet. Please create clubs first.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
//             {/* Row 1: PRN and Full Name (2 columns) */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
//               {/* PRN Field */}
//               <div>
//                 <div className="flex items-center justify-between mb-2">
//                   <label className="block text-xs md:text-sm font-medium text-gray-700">
//                     PRN *
//                   </label>
//                   {loadingProfile && (
//                     <span className="text-xs text-blue-600 animate-pulse">
//                       Fetching profile...
//                     </span>
//                   )}
//                 </div>
//                 <div className="relative">
//                   <input
//                     type="text"
//                     name="prn"
//                     placeholder="Enter 10-digit PRN"
//                     value={form.prn}
//                     onChange={handleChange}
//                     onBlur={() => setPrnTouched(true)}
//                     className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent transition-all duration-300 bg-white/50 text-sm md:text-base ${
//                       prnError && prnTouched
//                         ? "border-red-300"
//                         : "border-gray-200"
//                     }`}
//                     required
//                     pattern="\d{10}"
//                     maxLength={10}
//                     title="PRN must be exactly 10 digits"
//                   />
//                   {form.prn && (
//                     <button
//                       type="button"
//                       onClick={() => {
//                         setForm(prev => ({ ...prev, prn: "" }));
//                         resetAutoFilledFields();
//                         setPrnError("");
//                       }}
//                       className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                     >
//                       ✕
//                     </button>
//                   )}
//                 </div>
//                 {prnError && prnTouched && (
//                   <div className={`mt-1 ${prnError.includes('role') ? 'p-3 bg-red-50 border border-red-200 rounded-lg' : ''}`}>
//                     <p className={`text-xs ${prnError.includes('role') ? 'text-red-700 font-medium' : 'text-red-600'}`}>
//                       {prnError}
//                       {prnError.includes('role') && (
//                         <span className="block mt-1 text-red-600 text-xs">
//                           Please enter a PRN with "USERS" role to add as a student.
//                         </span>
//                       )}
//                     </p>
//                   </div>
//                 )}
//                 <p className="mt-1 text-xs text-gray-500">
//                   Enter PRN to auto-fill student details
//                 </p>
//               </div>

//               {/* Full Name Field */}
//               <div>
//                 <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
//                   Full Name
//                 </label>
//                 <input
//                   type="text"
//                   name="fullName"
//                   placeholder="Student's full name"
//                   value={form.fullName}
//                   onChange={handleChange}
//                   className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent transition-all duration-300 bg-white/50 text-sm md:text-base"
//                   disabled={loadingProfile || autoFilled}
//                 />
//                 {autoFilled && (
//                   <p className="mt-1 text-xs text-green-600">Auto-filled from profile</p>
//                 )}
//               </div>
//             </div>

//             {/* Auto-fill notification */}
//             {autoFilled && !loadingProfile && (
//               <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
//                 <div className="flex items-center gap-2 text-green-700 text-sm">
//                   <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
//                   </svg>
//                   <span>User verified with "USERS" role. All student data fetched from PRN.</span>
//                 </div>
//               </div>
//             )}

//             {/* Username Field */}
//             <div>
//               <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
//                 Username
//               </label>
//               <div className="relative">
//                 <input
//                   type="text"
//                   name="username"
//                   placeholder="Auto-generated username"
//                   value={form.username}
//                   onChange={handleChange}
//                   className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent transition-all duration-300 text-sm md:text-base ${
//                     autoFilled ? 'bg-gray-50 text-gray-700' : 'bg-white/50'
//                   }`}
//                   disabled={autoFilled}
//                 />
//                 {autoFilled && form.username && (
//                   <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
//                     From PRN
//                   </span>
//                 )}
//               </div>
//               {autoFilled && form.username && (
//                 <p className="mt-1 text-xs text-green-600">Fetched from user profile</p>
//               )}
//             </div>

//             {/* Email Field */}
//             <div>
//               <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
//                 Email
//               </label>
//               <div className="relative">
//                 <input
//                   type="email"
//                   name="email"
//                   placeholder="Auto-generated email"
//                   value={form.email}
//                   onChange={handleChange}
//                   className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent transition-all duration-300 text-sm md:text-base ${
//                     autoFilled ? 'bg-gray-50 text-gray-700' : 'bg-white/50'
//                   }`}
//                   disabled={autoFilled}
//                 />
//                 {autoFilled && form.email && (
//                   <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
//                     From PRN
//                   </span>
//                 )}
//               </div>
//               {autoFilled && form.email && (
//                 <p className="mt-1 text-xs text-green-600">Fetched from user profile</p>
//               )}
//             </div>

//             {/* Row 3: Department and Year (2 columns) */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
//               {/* Department Field - Display Only */}
//               <div>
//                 <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
//                   Department
//                 </label>
//                 <div className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-sm md:text-base text-gray-700">
//                   {form.department ? (
//                     <div className="flex items-center justify-between">
//                       <span>{form.department}</span>
//                       {autoFilled && (
//                         <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
//                           From PRN
//                         </span>
//                       )}
//                     </div>
//                   ) : (
//                     <span className="text-gray-400">
//                       {loadingProfile ? "Loading..." : "Enter PRN to load department"}
//                     </span>
//                   )}
//                 </div>
//               </div>

//               {/* Year Field - Display Only */}
//               <div>
//                 <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
//                   Year
//                 </label>
//                 <div className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-sm md:text-base text-gray-700">
//                   {form.year ? (
//                     <div className="flex items-center justify-between">
//                       <span>{form.year}</span>
//                       {autoFilled && (
//                         <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
//                           From PRN
//                         </span>
//                       )}
//                     </div>
//                   ) : (
//                     <span className="text-gray-400">
//                       {loadingProfile ? "Loading..." : "Enter PRN to load year"}
//                     </span>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* Row 4: Phone Number */}
//             <div>
//               <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
//                 Phone Number
//               </label>
//               <input
//                 type="tel"
//                 name="phoneNumber"
//                 placeholder="Phone number"
//                 value={form.phoneNumber}
//                 onChange={handleChange}
//                 className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent transition-all duration-300 bg-white/50 text-sm md:text-base"
//                 disabled={loadingProfile || autoFilled}
//               />
//               {autoFilled && form.phoneNumber && (
//                 <p className="mt-1 text-xs text-green-600">Auto-filled from profile</p>
//               )}
//             </div>

//             {/* Row 5: Club and Tenure Fields */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
//               {/* Club Field - Different based on role */}
//               <div>
//                 <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
//                   {isSuperAdmin ? "Select Club *" : "Your Clubs *"} 
//                   {loadingClubs && <span className="text-xs text-gray-500 ml-2">(Loading...)</span>}
//                 </label>
//                 <select
//                   name="clubId"
//                   value={form.clubId}
//                   onChange={handleChange}
//                   className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent transition-all duration-300 bg-white/50 text-sm md:text-base appearance-none cursor-pointer"
//                   disabled={loadingClubs || (!isSuperAdmin && hasNoClubs)}
//                   required
//                 >
//                   <option value="">
//                     {loadingClubs ? "Loading clubs..." : 
//                      isSuperAdmin ? "Select a club" : 
//                      hasNoClubs ? "No clubs assigned to you" : 
//                      "Select a club"}
//                   </option>
//                   {clubs.map((club) => (
//                     <option key={club.clubId} value={club.clubId}>
//                       {club.clubName}
//                     </option>
//                   ))}
//                 </select>
                
//                 {/* Loading indicator */}
//                 {loadingClubs && (
//                   <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
//                     <svg className="animate-spin h-3 w-3 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                     </svg>
//                     {isSuperAdmin ? "Loading all clubs..." : "Loading your assigned clubs..."}
//                   </p>
//                 )}
                
//                 {/* Club count message */}
//                 {!loadingClubs && clubs.length > 0 && (
//                   <p className="text-xs text-gray-500 mt-1">
//                     {isSuperAdmin 
//                       ? `Total ${clubs.length} ${clubs.length === 1 ? 'club' : 'clubs'} available` 
//                       : `You have access to ${clubs.length} ${clubs.length === 1 ? 'club' : 'clubs'}`}
//                   </p>
//                 )}
                
//                 {/* Super admin specific message when no clubs exist */}
//                 {isSuperAdmin && !loadingClubs && clubs.length === 0 && (
//                   <p className="text-xs text-red-500 mt-1">
//                     No clubs found in the system. Please create clubs first.
//                   </p>
//                 )}
//               </div>

//               {/* Tenure Field */}
//               <div>
//                 <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
//                   Tenure *
//                 </label>
//                 <select
//                   name="tenure"
//                   value={form.tenure}
//                   onChange={handleChange}
//                   className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent transition-all duration-300 bg-white/50 text-sm md:text-base appearance-none cursor-pointer"
//                   required
//                 >
//                   <option value="">Select Tenure</option>
//                   <option value="2023-2024">2023-2024</option>
//                   <option value="2024-2025">2024-2025</option>
//                   <option value="2025-2026">2025-2026</option>
//                   <option value="2026-2027">2026-2027</option>
//                 </select>
//               </div>
//             </div>

//             {/* Add Student Button */}
//             <div className="pt-4">
//               <button
//                 type="submit"
//                 disabled={
//                   loading || 
//                   loadingProfile || 
//                   !form.prn || 
//                   !form.clubId || 
//                   !form.tenure || 
//                   prnError.includes('role') || 
//                   (!isSuperAdmin && hasNoClubs) ||
//                   clubs.length === 0
//                 }
//                 className={`w-full text-white py-3 px-5 rounded-full font-bold shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-wide text-sm ${
//                   loading || 
//                   loadingProfile || 
//                   !form.prn || 
//                   !form.clubId || 
//                   !form.tenure || 
//                   prnError.includes('role') || 
//                   (!isSuperAdmin && hasNoClubs) ||
//                   clubs.length === 0
//                     ? "opacity-70 cursor-not-allowed" 
//                     : ""
//                 }`}
//                 style={{
//                   background: !form.prn || !form.clubId || !form.tenure || prnError.includes('role') || (!isSuperAdmin && hasNoClubs) || clubs.length === 0
//                     ? "linear-gradient(90deg, #9CA3AF 0%, #D1D5DB 100%)"
//                     : "linear-gradient(90deg, #10B981 0%, #34D399 100%)",
//                 }}
//               >
//                 {loading ? (
//                   <>
//                     <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                     </svg>
//                     ADDING...
//                   </>
//                 ) : (
//                   <>
//                     {clubs.length === 0 ? "NO CLUBS AVAILABLE" :
//                      !isSuperAdmin && hasNoClubs ? "NO CLUB ACCESS" : 
//                      !form.prn ? "ENTER PRN FIRST" : 
//                      !form.clubId ? "SELECT A CLUB" : 
//                      !form.tenure ? "SELECT TENURE" : 
//                      prnError.includes('role') ? "INVALID ROLE" : 
//                      "ADD STUDENT TO CLUB"}
//                     {!(clubs.length === 0 || (!isSuperAdmin && hasNoClubs) || !form.prn || !form.clubId || !form.tenure || prnError.includes('role')) && (
//                       <svg
//                         className="w-5 h-5"
//                         fill="none"
//                         stroke="currentColor"
//                         viewBox="0 0 24 24"
//                         strokeWidth={2.5}
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           d="M12 4v16m8-8H4"
//                         />
//                       </svg>
//                     )}
//                   </>
//                 )}
//               </button>
              
//               {/* Status messages */}
//               {clubs.length === 0 && !loadingClubs && (
//                 <p className="mt-2 text-xs text-center text-red-600 font-medium">
//                   {isSuperAdmin 
//                     ? "No clubs exist in the system. Please create clubs first." 
//                     : "No clubs available. Please contact administrator."}
//                 </p>
//               )}
//               {!isSuperAdmin && hasNoClubs && clubs.length === 0 && (
//                 <p className="mt-2 text-xs text-center text-yellow-600 font-medium">
//                   You don't have access to any clubs
//                 </p>
//               )}
//               {!hasNoClubs && clubs.length > 0 && (!form.prn || !form.clubId || !form.tenure) && !loadingProfile && !prnError.includes('role') && (
//                 <p className="mt-2 text-xs text-center text-gray-500">
//                   All fields marked with * are required
//                 </p>
//               )}
//               {prnError.includes('role') && (
//                 <p className="mt-2 text-xs text-center text-red-600 font-medium">
//                   This person has a different role and cannot be added to a club
//                 </p>
//               )}
//             </div>

//             {/* Back to Dashboard Link */}
//             <div className="pt-2">
//               <button
//                 onClick={() => navigate(-1)}
//                 type="button"
//                 className="cursor-pointer w-full text-center text-sm font-semibold transition-colors hover:opacity-80 py-2 rounded-lg hover:bg-gray-50"
//                 style={{ color: "#8B5CF6" }}
//               >
//                 ← Back to Dashboard
//               </button>
//             </div>
//           </form>
//         </div>

//         {/* Right Side - Illustration */}
//         <div
//           className="hidden md:flex md:w-2/5 flex-col items-center justify-center relative overflow-hidden rounded-r-[2.5rem]"
//           style={{
//             background: "linear-gradient(135deg, #10B981 0%, #34D399 100%)",
//           }}
//         >
//           <div className="text-center px-8">
//             <div className="mb-6">
//               <div className="w-24 h-24 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-4">
//                 <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
//                 </svg>
//               </div>
//               <h3 className="text-2xl font-bold text-white mb-2">
//                 {isSuperAdmin ? "Add Student to Any Club" : "Add Student to Your Club"}
//               </h3>
//               <p className="text-white/90 text-sm">
//                 {isSuperAdmin 
//                   ? "As Super Admin, you can add students to any club in the system."
//                   : "Enter student PRN to verify and add them to your assigned club with tenure."}
//               </p>
//             </div>

//             <div className="mt-8 space-y-4 text-left">
//               <div className="flex items-center gap-3">
//                 <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
//                   <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                   </svg>
//                 </div>
//                 <span className="text-white text-sm">Enter PRN to verify student</span>
//               </div>
//               <div className="flex items-center gap-3">
//                 <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
//                   <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                   </svg>
//                 </div>
//                 <span className="text-white text-sm">
//                   {isSuperAdmin ? "Select any club from the list" : "Select from your assigned clubs"}
//                 </span>
//               </div>
//               <div className="flex items-center gap-3">
//                 <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
//                   <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                   </svg>
//                 </div>
//                 <span className="text-white text-sm">Student will be added as MEMBER role</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import debounce from "lodash/debounce"; 

export default function AddStudent() {
  const navigate = useNavigate();
  const [clubs, setClubs] = useState([]);
  const [loadingClubs, setLoadingClubs] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [prnError, setPrnError] = useState("");
  const [prnTouched, setPrnTouched] = useState(false);
  const [autoFilled, setAutoFilled] = useState(false);
  const [userRole, setUserRole] = useState("");
const [teacherClubs, setTeacherClubs] = useState([]);
const [loadingTeacherClubs, setLoadingTeacherClubs] = useState(false);
  
  const [form, setForm] = useState({
    prn: "",
    username: "",
    email: "",
    role: "USERS",
    fullName: "",
    department: "",
    year: "",
    phoneNumber: "",
    clubId: "",
    tenure: ""
  });

  const [loading, setLoading] = useState(false);

  // Refs for debouncing
  const debouncedFetchProfileRef = useRef();

useEffect(() => {
  // Get user role from localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role || "";
  setUserRole(role);
  
  if (role === "SUPER_ADMIN") {
    fetchAllClubs(); // Fetch all clubs for super admin
  } else {
    fetchTeacherClubs(); // Fetch only teacher's clubs
  }
  
  // Create debounced function
  debouncedFetchProfileRef.current = debounce((prn) => {
    if (prn && prn.trim().length > 0) {
      fetchProfileByPRN(prn.trim());
    }
  }, 500);

  return () => {
    if (debouncedFetchProfileRef.current) {
      debouncedFetchProfileRef.current.cancel();
    }
  };
}, []);


const fetchTeacherClubs = async () => {
  try {
    setLoadingTeacherClubs(true);
    const response = await axios.get("http://localhost:8080/api/user-clubs/getMyClubs", {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      }
    });
    
    console.log("Teacher clubs response:", response.data);
    
    if (response.data.success) {
      setTeacherClubs(response.data.data);
    } else if (Array.isArray(response.data)) {
      setTeacherClubs(response.data);
    } else {
      setTeacherClubs([]);
    }
  } catch (error) {
    console.error("Error fetching teacher's clubs:", error);
    setTeacherClubs([]);
  } finally {
    setLoadingTeacherClubs(false);
  }
};
  const fetchAllClubs = async () => {
    try {
      setLoadingClubs(true);
      const response = await axios.get("http://localhost:8080/api/clubs", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      if (response.data.success) {
        setClubs(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching clubs:", error);
      alert("Failed to load clubs");
    } finally {
      setLoadingClubs(false);
    }
  };

  const fetchProfileByPRN = async (prn) => {
    if (!prn || prn.trim().length === 0) {
      setPrnError("");
      return;
    }

    // Validate PRN format (optional)
    if (!/^\d{10}$/.test(prn)) {
      setPrnError("PRN must be 10 digits");
      return;
    }

    try {
      setLoadingProfile(true);
      setPrnError("");
      setAutoFilled(false);
      
      // First, fetch user data (username, email, and role) from the users API
      try {
        const userResponse = await axios.get(
          `http://localhost:8080/api/users/${prn}`,
          {
            headers: {
              "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
          }
        );

        const userData = userResponse.data;
        
        console.log("User Data Response:", userResponse.data);
        
        // Check if the user has the correct role (USERS)
        if (userData.role !== "USERS") {
          setPrnError(`This person has role: ${userData.role}. Only users with "USERS" role can be added to clubs.`);
          resetAutoFilledFields();
          setLoadingProfile(false);
          return;
        }
        
        // If role is USERS, proceed to fetch profile data
        const profileResponse = await axios.get(
          `http://localhost:8080/api/profiles/prn/${prn}`,
          {
            headers: {
              "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
          }
        );

        if (profileResponse.data.success) {
          const profileData = profileResponse.data.data;
          
          // Auto-fill ALL the form data including username and email
          setForm(prev => ({
            ...prev,
            username: userData.username || "",
            email: userData.email || "",
            fullName: profileData.fullName || "",
            department: profileData.department || "",
            year: profileData.year || "",
            phoneNumber: profileData.phoneNumber || ""
          }));
          
          console.log("Form filled with:", {
            username: userData.username,
            email: userData.email,
            role: userData.role,
            fullName: profileData.fullName,
            department: profileData.department,
            year: mapYearNumberToCode(profileData.year),
            phoneNumber: profileData.phoneNumber
          });
          
          setAutoFilled(true);
        } else {
          setPrnError("No profile found for this PRN");
          resetAutoFilledFields();
        }
        
      } catch (userError) {
        console.error("Error fetching user data:", userError);
        
        if (userError.response?.status === 404) {
          setPrnError("No user found with this PRN");
        } else if (userError.response?.status === 403) {
          setPrnError("Access denied to user data");
        } else {
          setPrnError("Failed to fetch user data");
        }
        
        resetAutoFilledFields();
        setAutoFilled(false);
      }
      
    } catch (error) {
      console.error("Error in fetchProfileByPRN:", error);
      
      if (error.response?.status === 404) {
        setPrnError("No profile found for this PRN");
      } else if (error.response?.status === 400) {
        setPrnError("Invalid PRN format");
      } else {
        setPrnError("Failed to fetch profile data");
      }
      
      resetAutoFilledFields();
      setAutoFilled(false);
    } finally {
      setLoadingProfile(false);
    }
  };

  // Helper function to map year number to code
  const mapYearNumberToCode = (yearNumber) => {
    const yearMap = {
      1: "FE",
      2: "SE", 
      3: "TE",
      4: "BE"
    };
    return yearMap[yearNumber] || "";
  };

  // Reset auto-filled fields
  const resetAutoFilledFields = () => {
    setForm(prev => ({
      ...prev,
      username: "",
      email: "",
      fullName: "",
      department: "",
      year: "",
      phoneNumber: "",
      tenure: "",
    }));
    setAutoFilled(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "prn") {
      setPrnTouched(true);
      setPrnError("");
      setAutoFilled(false);
      
      if (!value || value.trim().length === 0) {
        resetAutoFilledFields();
      }
      
      setForm(prev => ({ ...prev, [name]: value }));

      if (debouncedFetchProfileRef.current) {
        debouncedFetchProfileRef.current(value);
      }
    } else if (name !== "department" && name !== "year") {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation checks
    if (!form.prn || !form.clubId || !form.tenure) {
      alert("Please fill all required fields: PRN, Club, and Tenure");
      return;
    }

    if (prnError.includes('role')) {
      alert("Cannot add student with this role. Please enter a PRN with 'USERS' role.");
      return;
    }

    setLoading(true);

    try {
      console.log("Sending user-club association data:", {
        prn: form.prn,
        clubId: form.clubId,
        role: "MEMBER",
        tenure: form.tenure
      });

      // Call the user-clubs API to add student to club
      const res = await axios.post(
        "http://localhost:8080/api/user-clubs",
        {
          prn: form.prn,
          clubId: parseInt(form.clubId),
          role: "MEMBER",
          tenure: form.tenure
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          },
        }
      );

      console.log("Student added to club successfully:", res.data);
      
      if (res.data.success) {
        alert("Student added to club successfully!");
        
        // Reset form
        setForm({
          prn: "",
          username: "",
          email: "",
          role: "USERS",
          fullName: "",
          department: "",
          year: "",
          phoneNumber: "",
          clubId: "",
          tenure: ""
        });
        setPrnTouched(false);
        setPrnError("");
        setAutoFilled(false);
      } else {
        alert(`Failed to add student: ${res.data.message || "Unknown error"}`);
      }
      
    } catch (err) {
      console.error("Error adding student to club:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data ||
        "Failed to add student to club!";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 overflow-auto"
      style={{
        background:
          "radial-gradient(circle at top left, #F2EEFF, #FDFCFE 60%, #F8F5FF)",
      }}
    >
      <div className="w-full max-w-6xl bg-white rounded-2xl md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row relative mx-auto my-4 md:my-8">
        {/* Left Side - Add Student Form */}
        <div className="w-full md:w-3/5 p-6 md:p-8 lg:p-10 flex flex-col">
          <div className="mb-6">
            <p className="text-sm md:text-base text-gray-600 font-medium">
              <b>Add Student to Club</b>
            </p>
          </div>

          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
            Add Student to Club
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
            {/* Row 1: PRN and Full Name (2 columns) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* PRN Field */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs md:text-sm font-medium text-gray-700">
                    PRN *
                  </label>
                  {loadingProfile && (
                    <span className="text-xs animate-pulse" style={{color: '#4CA1AF'}}>
                      Fetching profile...
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    name="prn"
                    placeholder="Enter 10-digit PRN"
                    value={form.prn}
                    onChange={handleChange}
                    onBlur={() => setPrnTouched(true)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent transition-all duration-300 bg-white/50 text-sm md:text-base cursor-text ${
                      prnError && prnTouched
                        ? "border-red-300"
                        : "border-gray-200"
                    }`}
                    style={{focus: {ringColor: '#4CA1AF'}}}
                    required
                    pattern="\d{10}"
                    maxLength={10}
                    title="PRN must be exactly 10 digits"
                  />
                  {form.prn && (
                    <button
                      type="button"
                      onClick={() => {
                        setForm(prev => ({ ...prev, prn: "" }));
                        resetAutoFilledFields();
                        setPrnError("");
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>
                {prnError && prnTouched && (
                  <div className={`mt-1 ${prnError.includes('role') ? 'p-3 bg-red-50 border border-red-200 rounded-lg' : ''}`}>
                    <p className={`text-xs ${prnError.includes('role') ? 'text-red-700 font-medium' : 'text-red-600'}`}>
                      {prnError}
                      {prnError.includes('role') && (
                        <span className="block mt-1 text-red-600 text-xs">
                          Please enter a PRN with "USERS" role to add as a student.
                        </span>
                      )}
                    </p>
                  </div>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Enter PRN to auto-fill student details
                </p>
              </div>

              {/* Full Name Field */}
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Student's full name"
                  value={form.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-300 bg-white/50 text-sm md:text-base cursor-text"
                  style={{focus: {ringColor: '#4CA1AF'}}}
                  disabled={loadingProfile || autoFilled}
                />
                {autoFilled && (
                  <p className="mt-1 text-xs" style={{color: '#4CA1AF'}}>Auto-filled from profile</p>
                )}
              </div>
            </div>

            {/* Auto-fill notification */}
            {autoFilled && !loadingProfile && (
              <div className="p-3 rounded-lg border" 
                   style={{backgroundColor: 'rgba(76, 161, 175, 0.1)', borderColor: '#4CA1AF'}}>
                <div className="flex items-center gap-2 text-sm" style={{color: '#4CA1AF'}}>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>User verified with "USERS" role. All student data fetched from PRN.</span>
                </div>
              </div>
            )}

            {/* Username Field */}
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="username"
                  placeholder="Auto-generated username"
                  value={form.username}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-300 text-sm md:text-base cursor-text ${
                    autoFilled ? 'bg-gray-50 text-gray-700' : 'bg-white/50'
                  }`}
                  style={{focus: {ringColor: '#4CA1AF'}}}
                  disabled={autoFilled}
                />
                {autoFilled && form.username && (
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs px-2 py-1 rounded"
                        style={{color: '#4CA1AF', backgroundColor: 'rgba(76, 161, 175, 0.1)'}}>
                    From PRN
                  </span>
                )}
              </div>
              {autoFilled && form.username && (
                <p className="mt-1 text-xs" style={{color: '#4CA1AF'}}>Fetched from user profile</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  placeholder="Auto-generated email"
                  value={form.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-300 text-sm md:text-base cursor-text ${
                    autoFilled ? 'bg-gray-50 text-gray-700' : 'bg-white/50'
                  }`}
                  style={{focus: {ringColor: '#4CA1AF'}}}
                  disabled={autoFilled}
                />
                {autoFilled && form.email && (
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs px-2 py-1 rounded"
                        style={{color: '#4CA1AF', backgroundColor: 'rgba(76, 161, 175, 0.1)'}}>
                    From PRN
                  </span>
                )}
              </div>
              {autoFilled && form.email && (
                <p className="mt-1 text-xs" style={{color: '#4CA1AF'}}>Fetched from user profile</p>
              )}
            </div>

            {/* Row 3: Department and Year (2 columns) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* Department Field - Display Only */}
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <div className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-sm md:text-base text-gray-700">
                  {form.department ? (
                    <div className="flex items-center justify-between">
                      <span>{form.department}</span>
                      {autoFilled && (
                        <span className="text-xs px-2 py-1 rounded"
                              style={{color: '#4CA1AF', backgroundColor: 'rgba(76, 161, 175, 0.1)'}}>
                          From PRN
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400">
                      {loadingProfile ? "Loading..." : "Enter PRN to load department"}
                    </span>
                  )}
                </div>
              </div>

              {/* Year Field - Display Only */}
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                  Year
                </label>
                <div className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-sm md:text-base text-gray-700">
                  {form.year ? (
                    <div className="flex items-center justify-between">
                      <span>{form.year}</span>
                      {autoFilled && (
                        <span className="text-xs px-2 py-1 rounded"
                              style={{color: '#4CA1AF', backgroundColor: 'rgba(76, 161, 175, 0.1)'}}>
                          From PRN
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400">
                      {loadingProfile ? "Loading..." : "Enter PRN to load year"}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Row 4: Phone Number */}
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phoneNumber"
                placeholder="Phone number"
                value={form.phoneNumber}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-300 bg-white/50 text-sm md:text-base cursor-text"
                style={{focus: {ringColor: '#4CA1AF'}}}
                disabled={loadingProfile || autoFilled}
              />
              {autoFilled && form.phoneNumber && (
                <p className="mt-1 text-xs" style={{color: '#4CA1AF'}}>Auto-filled from profile</p>
              )}
            </div>

            {/* Row 5: Club and Tenure Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* Club Field */}
<div>
  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
    Club * 
    {userRole === "SUPER_ADMIN" 
      ? (loadingClubs && <span className="text-xs text-gray-500 ml-2">(Loading all clubs...)</span>)
      : (loadingTeacherClubs && <span className="text-xs text-gray-500 ml-2">(Loading your clubs...)</span>)
    }
  </label>
  <select
    name="clubId"
    value={form.clubId}
    onChange={handleChange}
    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-300 bg-white/50 text-sm md:text-base appearance-none cursor-pointer"
    style={{focus: {ringColor: '#4CA1AF'}}}
    disabled={userRole === "SUPER_ADMIN" ? loadingClubs : loadingTeacherClubs}
    required
  >
    <option value="">
      {userRole === "SUPER_ADMIN" 
        ? "Select Club" 
        : "Select Your Club"
      }
    </option>
    {(userRole === "SUPER_ADMIN" ? clubs : teacherClubs).map((club) => (
      <option key={club.clubId} value={club.clubId}>
        {club.clubName}
      </option>
    ))}
  </select>
  {(userRole === "SUPER_ADMIN" ? clubs : teacherClubs).length === 0 
    && !(userRole === "SUPER_ADMIN" ? loadingClubs : loadingTeacherClubs) && (
    <p className="text-xs text-gray-500 mt-1">
      {userRole === "SUPER_ADMIN" 
        ? "No clubs available" 
        : "You don't have any clubs assigned"}
    </p>
  )}
</div>

              {/* Tenure Field */}
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                  Tenure *
                </label>
                <select
                  name="tenure"
                  value={form.tenure}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-300 bg-white/50 text-sm md:text-base appearance-none cursor-pointer"
                  style={{focus: {ringColor: '#4CA1AF'}}}
                  required
                >
                  <option value="">Select Tenure</option>
                  <option value="2023-2024">2023-2024</option>
                  <option value="2024-2025">2024-2025</option>
                  <option value="2025-2026">2025-2026</option>
                  <option value="2026-2027">2026-2027</option>
                </select>
              </div>
            </div>

            {/* Add Student Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading || loadingProfile || !form.prn || !form.clubId || !form.tenure || prnError.includes('role')}
                className={`w-full text-white py-3 px-5 rounded-full font-bold shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-wide text-sm cursor-pointer ${
                  loading || loadingProfile || !form.prn || !form.clubId || !form.tenure || prnError.includes('role') 
                    ? "opacity-70 cursor-not-allowed" 
                    : ""
                }`}
                style={{
                  background: !form.prn || !form.clubId || !form.tenure || prnError.includes('role')
                    ? "linear-gradient(90deg, #9CA3AF 0%, #D1D5DB 100%)"
                    : "linear-gradient(135deg, #4CA1AF, #315169)",
                }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    ADDING...
                  </>
                ) : (
                  <>
                    {!form.prn ? "ENTER PRN FIRST" : 
                     !form.clubId ? "SELECT A CLUB" : 
                     !form.tenure ? "SELECT TENURE" : 
                     prnError.includes('role') ? "INVALID ROLE" : 
                     "ADD STUDENT TO CLUB"}
                    {(!form.prn || !form.clubId || !form.tenure || prnError.includes('role')) ? null : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    )}
                  </>
                )}
              </button>
              {(!form.prn || !form.clubId || !form.tenure) && !loadingProfile && !prnError.includes('role') && (
                <p className="mt-2 text-xs text-center text-gray-500">
                  All fields marked with * are required
                </p>
              )}
              {prnError.includes('role') && (
                <p className="mt-2 text-xs text-center text-red-600 font-medium">
                  This person has a different role and cannot be added to a club
                </p>
              )}
            </div>

            {/* Back to Dashboard Link */}
            <div className="pt-2">
              <button
                onClick={() => navigate(-1)}
                type="button"
                className="cursor-pointer w-full text-center text-sm font-semibold transition-colors hover:opacity-80 py-2 rounded-lg hover:bg-gray-50"
                style={{ color: "#4CA1AF" }}
              >
                ← Back to Dashboard
              </button>
            </div>
          </form>
        </div>

        {/* Right Side - Illustration */}
        <div
          className="hidden md:flex md:w-2/5 flex-col items-center justify-center relative overflow-hidden rounded-r-[2.5rem]"
          style={{
            background: "linear-gradient(135deg, #4CA1AF, #315169)",
          }}
        >
          <div className="text-center px-8">
            <div className="mb-6">
              <div className="w-24 h-24 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Add Student to Club</h3>
              <p className="text-white/90 text-sm">
                Enter student PRN to verify and add them to the selected club with tenure.
              </p>
            </div>

            <div className="mt-8 space-y-4 text-left">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-white text-sm">Enter PRN to verify student</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-white text-sm">Select club and tenure period</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-white text-sm">Student will be added as MEMBER role</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}