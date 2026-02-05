
// // with create profile code
// import { User, Plus, Upload, X, CalendarDays, Edit } from "lucide-react";
// import { useState, useEffect } from "react";
// import axios from "axios";

// export default function UsersDashboard() {
//   const user = JSON.parse(localStorage.getItem("user"));
//   const token = localStorage.getItem("token");
//   const [showProfileForm, setShowProfileForm] = useState(false);
//   const [profileData, setProfileData] = useState({
//     prn: user?.prn || "",
//     fullName: "",
//     departmentId: "",
//     year: "",
//     phoneNumber: "",
//   });
//   const [selectedImage, setSelectedImage] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");
//   const [userProfile, setUserProfile] = useState(null);
//   const [profileImage, setProfileImage] = useState(null);
//   const [isLoadingProfile, setIsLoadingProfile] = useState(true);
//   const [departments, setDepartments] = useState([]);

//   useEffect(() => {
//     fetchUserProfile();
//     fetchDepartments();
//   }, []);

//   // Convert department name to ID after departments are loaded
//   useEffect(() => {
//     if (
//       departments.length > 0 &&
//       profileData.departmentId &&
//       typeof profileData.departmentId === "string" &&
//       isNaN(profileData.departmentId)
//     ) {
//       // departmentId is actually a department name string, convert it to ID
//       const dept = departments.find((d) => d.name === profileData.departmentId);
//       if (dept) {
//         setProfileData((prev) => ({
//           ...prev,
//           departmentId: dept.departmentId,
//         }));
//       }
//     }
//   }, [departments, profileData.departmentId]);

//   // Fetch departments
//   const fetchDepartments = async () => {
//     try {
//       console.log("Fetching departments...");
//       const response = await axios.get("http://localhost:8080/api/department", {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       });

//       console.log("Departments response:", response.data);

//       if (response.data && response.data.data) {
//         console.log("Setting departments:", response.data.data);
//         setDepartments(response.data.data);
//       }
//     } catch (error) {
//       console.error("Error fetching departments:", error);
//     }
//   };

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

//         // Handle department - could be string (name) or object with departmentId
//         let deptId = "";
//         if (response.data.data.department) {
//           if (
//             typeof response.data.data.department === "object" &&
//             response.data.data.department.departmentId
//           ) {
//             // Department is an object with departmentId
//             deptId = response.data.data.department.departmentId;
//           } else if (typeof response.data.data.department === "string") {
//             // Department is a string (name), need to find ID from departments array
//             // This will be set after departments are loaded
//             deptId = response.data.data.department; // Store name temporarily
//           }
//         }

//         setProfileData({
//           prn: response.data.data.prn || user?.prn || "",
//           fullName: response.data.data.fullName || "",
//           departmentId: deptId,
//           year: response.data.data.year || "",
//           phoneNumber: response.data.data.phoneNumber || "",
//         });

//         // Fetch profile image
//         fetchProfileImage();
//       }
//     } catch (error) {
//       console.error("Error fetching profile:", error);
//       setUserProfile(null);
//       // If profile doesn't exist, initialize with user PRN
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
//         setProfileImage(imageUrl);
//       }
//     } catch (error) {
//       console.error("Error fetching profile image:", error);
//       setProfileImage(null);
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
//     setSelectedImage(e.target.files[0]);
//   };

//   const handleSubmitProfile = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setMessage("");

//     // Validate all required fields are filled
//     if (
//       !profileData.prn ||
//       !profileData.fullName ||
//       !profileData.departmentId ||
//       !profileData.year ||
//       !profileData.phoneNumber
//     ) {
//       setMessage("Please fill all required fields");
//       setLoading(false);
//       return;
//     }

//     // Validate PRN format (if needed)
//     if (profileData.prn.length < 10) {
//       setMessage("Please enter a valid PRN");
//       setLoading(false);
//       return;
//     }

//     // Validate phone number format (basic validation)
//     const phoneRegex = /^[0-9]{10}$/;
//     if (!phoneRegex.test(profileData.phoneNumber)) {
//       setMessage("Please enter a valid 10-digit phone number");
//       setLoading(false);
//       return;
//     }

//     // Validate year is between 1-4
//     if (profileData.year < 1 || profileData.year > 4) {
//       setMessage("Please select a valid year (1-4)");
//       setLoading(false);
//       return;
//     }

//     try {
//       let currentPrn = profileData.prn; // ✅ Store PRN for use after if/else blocks

//       // If profile exists, update it; otherwise create new
//       if (userProfile) {
//         // Update existing profile
//         console.log(profileData);
//         const requestData = {
//           fullName: profileData.fullName,
//           departmentId: parseInt(profileData.departmentId),
//           year: profileData.year,
//           phoneNumber: profileData.phoneNumber,
//         };

//         const response = await axios.put(
//           `http://localhost:8080/api/profiles/${profileData.prn}`,
//           requestData,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//               "Content-Type": "application/json",
//             },
//           },
//         );
//         console.log(response);
//         setMessage("Profile updated successfully!");
//       } else {
//         // Create new profile
//         const createData = {
//           prn: profileData.prn,
//           fullName: profileData.fullName,
//           departmentId: parseInt(profileData.departmentId),
//           year: profileData.year,
//           phoneNumber: profileData.phoneNumber,
//         };

//         const response = await axios.post(
//           "http://localhost:8080/api/profiles",
//           createData,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//               "Content-Type": "application/json",
//             },
//           },
//         );
//         console.log(response);
//         setMessage("Profile created successfully!");
//       }

//       // Upload image if selected (using currentPrn instead of createData.prn)
//       if (selectedImage) {
//         const formData = new FormData();
//         formData.append("image", selectedImage);

//         await axios.post(
//           `http://localhost:8080/api/profiles/${currentPrn}/image`, // ✅ Fixed: use currentPrn
//           formData,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//               "Content-Type": "multipart/form-data",
//             },
//           },
//         );
//       }

//       // Refresh profile data
//       await fetchUserProfile();

//       setTimeout(() => {
//         setShowProfileForm(false);
//         setMessage("");
//       }, 1500);
//     } catch (error) {
//       console.error("Error saving profile:", error);
//       setMessage("Error saving profile. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Helper function to get department name by ID
//   const getDepartmentName = (departmentIdOrName) => {
//     if (!departmentIdOrName) return "Not set";

//     // If it's already a string name, return it
//     if (typeof departmentIdOrName === "string" && isNaN(departmentIdOrName)) {
//       return departmentIdOrName;
//     }

//     // Otherwise look up by ID
//     const dept = departments.find(
//       (d) => d.departmentId === parseInt(departmentIdOrName),
//     );
//     return dept ? dept.name : "Not set";
//   };

//   return (
//     <div className="min-h-screen bg-orange-50 p-6">
//       <div className="max-w-7xl mx-auto">
//         <div className="flex justify-between items-center mb-8">
//           <div>
//             <h1 className="text-4xl font-bold text-orange-600">
//               User Dashboard 👋
//             </h1>
//             <p className="text-gray-600 mt-2">Your Club and Event Management</p>
//           </div>
//           <div className="flex items-center space-x-4">
//             <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
//               USER
//             </span>
//             <button
//               onClick={handleLogout}
//               className="bg-red-500 cursor-pointer hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-300"
//             >
//               Logout
//             </button>
//           </div>
//         </div>

//         {/* Welcome Message */}
//         <div className="bg-white my-6 rounded-xl shadow-lg p-6 md:col-span-2">
//           <h3 className="text-xl font-semibold mb-4 text-gray-800">
//             Welcome back, {user?.username}!
//           </h3>
//           <p className="text-gray-600 mb-4">
//             this is random again igmore change krna hai You have 2 new
//             notifications and 1 upcoming assignment. Continue your learning
//             journey with us!
//           </p>
//           <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
//             <p className="text-yellow-800">
//               <i className="fas fa-bell mr-2"></i>
//               <strong>Reminder:</strong> Complete the JavaScript fundamentals
//               course by Friday.
//             </p>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           {/* Profile Card */}
//           <div className="bg-white rounded-xl shadow-lg p-6">
//             <div className="flex items-center mb-4">
//               <div className="bg-orange-100 p-3 rounded-lg mr-4">
//                 <User className="w-6 h-6 text-orange-600" />
//               </div>
//               <h3 className="text-xl font-semibold text-orange-800">
//                 My Profile
//               </h3>
//             </div>

//             {/* Profile Image */}
//             {profileImage && (
//               <div className="flex justify-center mb-4">
//                 <img
//                   src={profileImage}
//                   alt="Profile"
//                   className="w-80 h-80 rounded-full object-cover border-4 border-orange-200"
//                 />
//               </div>
//             )}

//             {isLoadingProfile ? (
//               <div className="text-center py-4">
//                 <p className="text-gray-600"></p>
//               </div>
//             ) : userProfile ? (
//               <div className="space-y-2">
//                 <p className="text-gray-700">
//                   <strong>Full Name:</strong> {profileData.fullName}
//                 </p>
//                 <p className="text-gray-700">
//                   <strong>Username:</strong> {user?.username}
//                 </p>
//                 <p className="text-gray-700">
//                   <strong>PRN:</strong>{" "}
//                   <span className="text-gray-600">{profileData.prn}</span>
//                 </p>
//                 <p className="text-gray-700">
//                   <strong>Email:</strong>{" "}
//                   <span className="text-gray-600">{user?.email}</span>
//                 </p>
//                 <p className="text-gray-700">
//                   <strong>Department:</strong>{" "}
//                   {profileData.departmentId
//                     ? getDepartmentName(profileData.departmentId)
//                     : "Not set"}
//                 </p>
//                 <p className="text-gray-700">
//                   <strong>Year:</strong> {profileData.year}
//                 </p>
//                 <p className="text-gray-700">
//                   <strong>Phone:</strong> {profileData.phoneNumber}
//                 </p>
//                 <p className="text-gray-700">
//                   <strong>Role:</strong> {user?.role}
//                 </p>
//                 <p className="text-gray-700">
//                   <strong>Status:</strong>
//                   <span
//                     className={`${user?.verified ? "text-green-600" : "text-red-600"}`}
//                   >
//                     {user?.verified ? " Active" : " Inactive"}
//                   </span>
//                 </p>
//               </div>
//             ) : (
//               /* Display Basic Info when no profile exists */
//               <div className="space-y-2">
//                 <p className="text-gray-700">
//                   <strong>Username:</strong> {user?.username}
//                 </p>
//                 <p className="text-gray-700">
//                   <strong>PRN:</strong>{" "}
//                   <span className="text-gray-600">{user?.prn}</span>
//                 </p>
//                 <p className="text-gray-700">
//                   <strong>Email:</strong>{" "}
//                   <span className="text-gray-600">{user?.email}</span>
//                 </p>
//                 <p className="text-gray-700">
//                   <strong>Role:</strong> {user?.role}
//                 </p>
//                 <p className="text-gray-700">
//                   <strong>Status:</strong>
//                   <span
//                     className={`${user?.verified ? "text-green-600" : "text-red-600"}`}
//                   >
//                     {user?.verified ? " Active" : " Inactive"}
//                   </span>
//                 </p>
//                 <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
//                   <p className="text-yellow-800 text-sm">
//                     <strong>Note:</strong> Complete your profile to access all
//                     features.
//                   </p>
//                 </div>
//               </div>
//             )}

//             {/* Dynamic Button */}
//             <button
//               onClick={() => setShowProfileForm(true)}
//               className={`mt-4 w-full text-white py-2 rounded-lg transition duration-300 flex items-center justify-center cursor-pointer ${
//                 userProfile
//                   ? "bg-gradient-to-r from-orange-500 to-red-500 hover:bg-orange-100"
//                   : "bg-gradient-to-r from-orange-500 to-red-500 hover:bg-orange-100"
//               }`}
//             >
//               {userProfile ? (
//                 <>
//                   <Edit className="w-4 h-4 mr-2" />
//                   Edit Profile
//                 </>
//               ) : (
//                 <>
//                   <Plus className="w-4 h-4 mr-2" />
//                   Complete Your Profile
//                 </>
//               )}
//             </button>
//           </div>

//           {/* Events */}
//           <div className="bg-white rounded-xl shadow-lg p-6">
//             <div className="flex items-center mb-4">
//               <div className="bg-blue-100 p-3 rounded-lg mr-4">
//                 <CalendarDays className="w-6 h-6 text-blue-600" />
//               </div>
//               <h3 className="text-xl font-semibold text-blue-800">
//                 All Events
//               </h3>
//             </div>
//             <p className="text-3xl font-bold text-blue-600 mb-2"></p>
//             <p className="text-gray-600"></p>
//           </div>

//           {/* Quick Actions */}
//           <div className="bg-white rounded-xl shadow-lg p-6 md:col-span-2">
//             <h3 className="text-2xl font-bold mb-4 text-gray-800">
//               Quick Actions
//             </h3>
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//               <button className="bg-orange-500 cursor-pointer hover:bg-orange-600 text-white py-3 rounded-lg transition duration-300">
//                 My Clubs
//               </button>
//               <button className="bg-blue-500 cursor-pointer hover:bg-blue-600 text-white py-3 rounded-lg transition duration-300">
//                 Previous Events History
//               </button>
//               <button className="bg-green-500 cursor-pointer hover:bg-green-600 text-white py-3 rounded-lg transition duration-300">
//                 Resources(nhi pata)
//               </button>
//               <button className="bg-purple-500 pointer hover:bg-purple-600 text-white py-3 rounded-lg transition duration-300">
//                 Settings(nhi pata)
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Profile Form Popup */}
//       {showProfileForm && (
//         <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
//             <div className="flex justify-between items-center p-6 border-b">
//               <h3 className="text-xl font-semibold text-gray-800">
//                 {userProfile ? "Edit Your Profile" : "Complete Your Profile"}
//               </h3>
//               <button
//                 onClick={() => {
//                   setShowProfileForm(false);
//                   setMessage("");
//                 }}
//                 className="text-gray-400 cursor-pointer hover:text-orange-600"
//               >
//                 <X className="w-6 h-6" />
//               </button>
//             </div>

//             <form onSubmit={handleSubmitProfile} className="p-6 space-y-4">
//               {/* Debug info */}
//               {console.log(
//                 "Departments in form:",
//                 departments,
//                 "Length:",
//                 departments.length,
//               )}

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   PRN *
//                 </label>
//                 <input
//                   type="text"
//                   name="prn"
//                   value={profileData.prn}
//                   onChange={handleInputChange}
//                   className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
//                     userProfile ? "bg-gray-100 cursor-not-allowed" : ""
//                   }`}
//                   readOnly={!!userProfile}
//                   required
//                 />
//                 {userProfile && (
//                   <p className="text-xs text-gray-500 mt-1">
//                     PRN cannot be changed once profile is created
//                   </p>
//                 )}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Full Name *
//                 </label>
//                 <input
//                   type="text"
//                   name="fullName"
//                   value={profileData.fullName}
//                   onChange={handleInputChange}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
//                   required
//                 />
//               </div>

//               {/* Department - Dropdown */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Department *
//                 </label>
//                 <select
//                   name="departmentId"
//                   value={profileData.departmentId}
//                   onChange={handleInputChange}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
//                   required
//                   disabled={departments.length === 0}
//                 >
//                   <option value="">
//                     {departments.length === 0
//                       ? "Loading departments..."
//                       : "Select Department"}
//                   </option>
//                   {departments.map((dept) => (
//                     <option key={dept.departmentId} value={dept.departmentId}>
//                       {dept.name}
//                     </option>
//                   ))}
//                 </select>
//                 {departments.length === 0 && (
//                   <p className="text-xs text-amber-600 mt-1 flex items-center">
//                     <span className="animate-spin mr-2">⏳</span>
//                     Loading departments from server...
//                   </p>
//                 )}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Year *
//                 </label>
//                 <select
//                   name="year"
//                   value={profileData.year}
//                   onChange={handleInputChange}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
//                   required
//                 >
//                   <option value="">Select Year</option>
//                   <option value="1">First Year</option>
//                   <option value="2">Second Year</option>
//                   <option value="3">Third Year</option>
//                   <option value="4">Fourth Year</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Phone Number *
//                 </label>
//                 <input
//                   type="tel"
//                   name="phoneNumber"
//                   value={profileData.phoneNumber}
//                   onChange={handleInputChange}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
//                   placeholder="10-digit phone number"
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Profile Photo
//                 </label>
//                 <div className="flex items-center space-x-4">
//                   <input
//                     type="file"
//                     accept="image/*"
//                     onChange={handleImageChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
//                   />
//                   <Upload className="w-5 h-5 text-gray-400" />
//                 </div>
//               </div>

//               {message && (
//                 <div
//                   className={`p-3 rounded-lg ${
//                     message.includes("Error") || message.includes("error")
//                       ? "bg-red-50 text-red-700 border border-red-200"
//                       : "bg-green-50 text-green-700 border border-green-200"
//                   }`}
//                 >
//                   <p className="text-sm font-semibold">{message}</p>
//                 </div>
//               )}

//               <div className="flex space-x-3 pt-4">
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setShowProfileForm(false);
//                     setMessage("");
//                   }}
//                   className="flex-1 cursor-pointer bg-gray-300 hover:bg-orange-600 text-gray-800 py-2 rounded-lg transition duration-300"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={loading}
//                   className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   {loading
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
//     </div>
//   );
// }

// import { User, Plus, Upload, X, CalendarDays, Edit, LogOut, LayoutDashboard, Settings, History, Layers } from "lucide-react";
// import { useState, useEffect } from "react";
// import axios from "axios";

// export default function UsersDashboard() {
//   const user = JSON.parse(localStorage.getItem("user"));
//   const token = localStorage.getItem("token");
//   const [showProfileForm, setShowProfileForm] = useState(false);
//   const [profileData, setProfileData] = useState({
//     prn: user?.prn || "",
//     fullName: "",
//     departmentId: "",
//     year: "",
//     phoneNumber: "",
//   });
//   const [selectedImage, setSelectedImage] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");
//   const [userProfile, setUserProfile] = useState(null);
//   const [profileImage, setProfileImage] = useState(null);
//   const [isLoadingProfile, setIsLoadingProfile] = useState(true);
//   const [departments, setDepartments] = useState([]);

//   useEffect(() => {
//     fetchUserProfile();
//     fetchDepartments();
//   }, []);

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
//       const response = await axios.get("http://localhost:8080/api/department", {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       });
//       if (response.data && response.data.data) {
//         setDepartments(response.data.data);
//       }
//     } catch (error) {
//       console.error("Error fetching departments:", error);
//     }
//   };

//   const fetchUserProfile = async () => {
//     try {
//       setIsLoadingProfile(true);
//       const response = await axios.get(
//         `http://localhost:8080/api/profiles/prn/${user?.prn}`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       if (response.data) {
//         setUserProfile(response.data);
//         let deptId = "";
//         if (response.data.data.department) {
//           if (typeof response.data.data.department === "object" && response.data.data.department.departmentId) {
//             deptId = response.data.data.department.departmentId;
//           } else if (typeof response.data.data.department === "string") {
//             deptId = response.data.data.department;
//           }
//         }

//         setProfileData({
//           prn: response.data.data.prn || user?.prn || "",
//           fullName: response.data.data.fullName || "",
//           departmentId: deptId,
//           year: response.data.data.year || "",
//           phoneNumber: response.data.data.phoneNumber || "",
//         });
//         fetchProfileImage();
//       }
//     } catch (error) {
//       console.error("Error fetching profile:", error);
//       setUserProfile(null);
//       setProfileData((prev) => ({ ...prev, prn: user?.prn || "" }));
//     } finally {
//       setIsLoadingProfile(false);
//     }
//   };

//   const fetchProfileImage = async () => {
//     try {
//       const response = await axios.get(
//         `http://localhost:8080/api/profiles/${user?.prn}/image`,
//         { headers: { Authorization: `Bearer ${token}` }, responseType: "blob" }
//       );
//       if (response.data) {
//         const imageUrl = URL.createObjectURL(response.data);
//         setProfileImage(imageUrl);
//       }
//     } catch (error) {
//       setProfileImage(null);
//     }
//   };

//   const handleLogout = () => {
//     localStorage.removeItem("user");
//     localStorage.removeItem("token");
//     window.location.href = "/login";
//   };

//   const handleInputChange = (e) => {
//     setProfileData({ ...profileData, [e.target.name]: e.target.value });
//   };

//   const handleImageChange = (e) => {
//     setSelectedImage(e.target.files[0]);
//   };

//   const handleSubmitProfile = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setMessage("");

//     if (!profileData.prn || !profileData.fullName || !profileData.departmentId || !profileData.year || !profileData.phoneNumber) {
//       setMessage("Please fill all required fields");
//       setLoading(false);
//       return;
//     }

//     try {
//       let currentPrn = profileData.prn;
//       const payload = {
//         fullName: profileData.fullName,
//         departmentId: parseInt(profileData.departmentId),
//         year: profileData.year,
//         phoneNumber: profileData.phoneNumber,
//       };

//       if (userProfile) {
//         await axios.put(`http://localhost:8080/api/profiles/${profileData.prn}`, payload, {
//           headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
//         });
//         setMessage("Profile updated successfully!");
//       } else {
//         await axios.post("http://localhost:8080/api/profiles", { ...payload, prn: profileData.prn }, {
//           headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
//         });
//         setMessage("Profile created successfully!");
//       }

//       if (selectedImage) {
//         const formData = new FormData();
//         formData.append("image", selectedImage);
//         await axios.post(`http://localhost:8080/api/profiles/${currentPrn}/image`, formData, {
//           headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
//         });
//       }

//       await fetchUserProfile();
//       setTimeout(() => {
//         setShowProfileForm(false);
//         setMessage("");
//       }, 1500);
//     } catch (error) {
//       setMessage("Error saving profile. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getDepartmentName = (id) => {
//     if (!id) return "Not set";
//     if (typeof id === "string" && isNaN(id)) return id;
//     const dept = departments.find((d) => d.departmentId === parseInt(id));
//     return dept ? dept.name : "Not set";
//   };

//   return (
//     <div className="min-h-screen bg-slate-50 flex">
//       {/* Sidebar */}
//       <aside className="w-64 bg-slate-900 hidden md:flex flex-col sticky top-0 h-screen text-slate-300">
//         <div className="p-6">
//           <h2 className="text-2xl font-bold text-orange-500 flex items-center gap-2">
//             <LayoutDashboard className="w-6 h-6" /> Hub
//           </h2>
//         </div>
//         <nav className="flex-1 px-4 space-y-2">
//           <a href="#" className="flex items-center gap-3 p-3 bg-slate-800 text-white rounded-lg">
//             <User className="w-5 h-5" /> Dashboard
//           </a>
//           <a href="#" className="flex items-center gap-3 p-3 hover:bg-slate-800 rounded-lg transition">
//             <Layers className="w-5 h-5" /> My Clubs
//           </a>
//           <a href="#" className="flex items-center gap-3 p-3 hover:bg-slate-800 rounded-lg transition">
//             <History className="w-5 h-5" /> Event History
//           </a>
//           <a href="#" className="flex items-center gap-3 p-3 hover:bg-slate-800 rounded-lg transition">
//             <Settings className="w-5 h-5" /> Settings
//           </a>
//         </nav>
//         <div className="p-4 border-t border-slate-800">
//           <button onClick={handleLogout} className="flex items-center gap-3 w-full p-3 text-red-400 hover:bg-red-500/10 rounded-lg transition">
//             <LogOut className="w-5 h-5" /> Logout
//           </button>
//         </div>
//       </aside>

//       {/* Main Content */}
//       <main className="flex-1 p-4 md:p-10">
//         <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
//           <div>
//             <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">User Dashboard</h1>
//             <p className="text-slate-500">Welcome back, <span className="text-orange-600 font-semibold">{user?.username}</span></p>
//           </div>
//           <div className="flex gap-3">
//              <span className="bg-orange-100 text-orange-700 px-4 py-1.5 rounded-full text-sm font-bold border border-orange-200 uppercase tracking-wider">
//                Student Portal
//              </span>
//           </div>
//         </header>

//         {/* Info Grid */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
//           {/* Profile Section */}
//           <section className="lg:col-span-1 space-y-6">
//             <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 overflow-hidden border border-slate-100">
//               <div className="bg-slate-900 h-24 relative">
//                 <button 
//                   onClick={() => setShowProfileForm(true)}
//                   className="absolute right-4 bottom-[-20px] bg-orange-500 text-white p-3 rounded-full shadow-lg hover:bg-orange-600 transition hover:scale-110 z-10"
//                 >
//                   <Edit className="w-5 h-5" />
//                 </button>
//               </div>
//               <div className="px-6 pb-8 text-center -mt-12">
//                 <div className="inline-block relative">
//                   <img
//                     src={profileImage || "https://ui-avatars.com/api/?name=" + user?.username + "&background=f97316&color=fff"}
//                     alt="Profile"
//                     className="w-32 h-32 rounded-3xl object-cover border-4 border-white shadow-xl bg-white"
//                   />
//                   <div className={`absolute bottom-2 right-2 w-4 h-4 rounded-full border-2 border-white ${user?.verified ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
//                 </div>
                
//                 <h2 className="text-xl font-bold text-slate-900 mt-4">{profileData.fullName || user?.username}</h2>
//                 <p className="text-slate-500 text-sm mb-6">{getDepartmentName(profileData.departmentId)} • Year {profileData.year || 'N/A'}</p>

//                 <div className="space-y-4 text-left bg-slate-50 p-4 rounded-2xl border border-slate-100">
//                   <div className="flex justify-between text-sm">
//                     <span className="text-slate-400">PRN</span>
//                     <span className="font-mono font-bold text-slate-700">{profileData.prn}</span>
//                   </div>
//                   <div className="flex justify-between text-sm">
//                     <span className="text-slate-400">Email</span>
//                     <span className="font-semibold text-slate-700">{user?.email}</span>
//                   </div>
//                   <div className="flex justify-between text-sm">
//                     <span className="text-slate-400">Phone</span>
//                     <span className="font-semibold text-slate-700">{profileData.phoneNumber || 'Not linked'}</span>
//                   </div>
//                 </div>

//                 {!userProfile && (
//                   <button 
//                     onClick={() => setShowProfileForm(true)}
//                     className="mt-6 w-full flex items-center justify-center gap-2 bg-orange-50 text-orange-600 font-bold py-3 rounded-xl border border-orange-200 hover:bg-orange-100 transition"
//                   >
//                     <Plus className="w-4 h-4" /> Complete Profile
//                   </button>
//                 )}
//               </div>
//             </div>
//           </section>

//           {/* Activity Section */}
//           <section className="lg:col-span-2 space-y-8">
//             {/* Welcome Card */}
//             <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl p-8 text-white shadow-2xl shadow-orange-200">
//               <h3 className="text-2xl font-bold mb-2">Continue your learning journey!</h3>
//               <p className="opacity-90 mb-6">You have 1 upcoming assignment and 2 new notifications in your clubs.</p>
//               <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center gap-4">
//                 <div className="bg-white/20 p-2 rounded-lg">
//                   <CalendarDays className="w-6 h-6" />
//                 </div>
//                 <p className="text-sm font-medium">Next Event: <span className="font-bold">JavaScript Workshop</span> • Friday, 4:00 PM</p>
//               </div>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               {/* Event Stats */}
//               <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5">
//                 <div className="bg-blue-50 p-4 rounded-2xl">
//                   <CalendarDays className="w-8 h-8 text-blue-600" />
//                 </div>
//                 <div>
//                   <h4 className="text-slate-400 text-sm font-medium">Participated Events</h4>
//                   <p className="text-3xl font-bold text-slate-900">12</p>
//                 </div>
//               </div>

//               {/* Club Stats */}
//               <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5">
//                 <div className="bg-purple-50 p-4 rounded-2xl">
//                   <Layers className="w-8 h-8 text-purple-600" />
//                 </div>
//                 <div>
//                   <h4 className="text-slate-400 text-sm font-medium">Active Clubs</h4>
//                   <p className="text-3xl font-bold text-slate-900">04</p>
//                 </div>
//               </div>
//             </div>

//             {/* Quick Actions Grid */}
//             <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
//               <h3 className="text-xl font-bold text-slate-800 mb-6">Quick Actions</h3>
//               <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
//                 {[
//                   { name: 'My Clubs', color: 'bg-orange-500', icon: Layers },
//                   { name: 'History', color: 'bg-blue-500', icon: History },
//                   { name: 'Resources', color: 'bg-green-500', icon: Plus },
//                   { name: 'Settings', color: 'bg-purple-500', icon: Settings },
//                 ].map((action) => (
//                   <button key={action.name} className="flex flex-col items-center gap-3 p-4 rounded-2xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100">
//                     <div className={`${action.color} text-white p-3 rounded-xl shadow-lg`}>
//                       <action.icon className="w-5 h-5" />
//                     </div>
//                     <span className="text-xs font-bold text-slate-600 uppercase tracking-tighter">{action.name}</span>
//                   </button>
//                 ))}
//               </div>
//             </div>
//           </section>
//         </div>
//       </main>

//       {/* Modal Overlay */}
//       {showProfileForm && (
//         <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
//           <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-100 animate-in fade-in zoom-in duration-200">
            
//             <div className="flex justify-between items-center p-8 border-b border-slate-50 bg-slate-50/50">
//               <div>
//                 <h3 className="text-2xl font-bold text-slate-900">
//                   {userProfile ? "Update Profile" : "Complete Profile"}
//                 </h3>
//                 <p className="text-slate-500 text-sm">Fill in your details to stay updated</p>
//               </div>
//               <button onClick={() => setShowProfileForm(false)} className="p-2 hover:bg-white rounded-full transition shadow-sm border border-slate-200">
//                 <X className="w-6 h-6 text-slate-400" />
//               </button>
//             </div>

//             <form onSubmit={handleSubmitProfile} className="p-8 overflow-y-auto custom-scrollbar">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
//                 {/* PRN Field */}
//                 <div className="space-y-2">
//                   <label className="text-sm font-bold text-slate-700 ml-1">PRN (Permanent Reg. No.)</label>
//                   <input
//                     type="text"
//                     name="prn"
//                     value={profileData.prn}
//                     onChange={handleInputChange}
//                     className={`w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all outline-none ${userProfile ? "bg-slate-50 cursor-not-allowed text-slate-400" : ""}`}
//                     readOnly={!!userProfile}
//                     required
//                   />
//                 </div>

//                 {/* Name Field */}
//                 <div className="space-y-2">
//                   <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
//                   <input
//                     type="text"
//                     name="fullName"
//                     value={profileData.fullName}
//                     onChange={handleInputChange}
//                     className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all outline-none"
//                     placeholder="Enter your full name"
//                     required
//                   />
//                 </div>

//                 {/* Department */}
//                 <div className="space-y-2">
//                   <label className="text-sm font-bold text-slate-700 ml-1">Department</label>
//                   <select
//                     name="departmentId"
//                     value={profileData.departmentId}
//                     onChange={handleInputChange}
//                     className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all outline-none bg-white appearance-none"
//                     required
//                     disabled={departments.length === 0}
//                   >
//                     <option value="">{departments.length === 0 ? "Loading..." : "Select Department"}</option>
//                     {departments.map((dept) => (
//                       <option key={dept.departmentId} value={dept.departmentId}>{dept.name}</option>
//                     ))}
//                   </select>
//                 </div>

//                 {/* Year Selection */}
//                 <div className="space-y-2">
//                   <label className="text-sm font-bold text-slate-700 ml-1">Current Year</label>
//                   <select
//                     name="year"
//                     value={profileData.year}
//                     onChange={handleInputChange}
//                     className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all outline-none bg-white"
//                     required
//                   >
//                     <option value="">Select Year</option>
//                     {[1, 2, 3, 4].map(y => <option key={y} value={y}>{y === 1 ? '1st' : y === 2 ? '2nd' : y === 3 ? '3rd' : '4th'} Year</option>)}
//                   </select>
//                 </div>

//                 {/* Phone */}
//                 <div className="space-y-2">
//                   <label className="text-sm font-bold text-slate-700 ml-1">Phone Number</label>
//                   <input
//                     type="tel"
//                     name="phoneNumber"
//                     value={profileData.phoneNumber}
//                     onChange={handleInputChange}
//                     className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all outline-none"
//                     placeholder="10-digit number"
//                     required
//                   />
//                 </div>

//                 {/* Profile Photo Upload */}
//                 <div className="space-y-2">
//                   <label className="text-sm font-bold text-slate-700 ml-1">Profile Photo</label>
//                   <div className="relative">
//                     <input
//                       type="file"
//                       accept="image/*"
//                       onChange={handleImageChange}
//                       className="absolute inset-0 opacity-0 cursor-pointer z-20"
//                     />
//                     <div className="w-full px-4 py-3 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center gap-3 text-slate-500 group-hover:border-orange-500 transition">
//                       <Upload className="w-5 h-5" />
//                       <span className="text-sm font-medium">{selectedImage ? selectedImage.name : "Click to upload image"}</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {message && (
//                 <div className={`mt-6 p-4 rounded-2xl flex items-center gap-3 ${message.includes("Error") ? "bg-red-50 text-red-700 border border-red-100" : "bg-green-50 text-green-700 border border-green-100"}`}>
//                   <div className={`w-2 h-2 rounded-full ${message.includes("Error") ? "bg-red-500" : "bg-green-500"}`}></div>
//                   <p className="text-sm font-bold">{message}</p>
//                 </div>
//               )}

//               <div className="flex gap-4 mt-10">
//                 <button
//                   type="button"
//                   onClick={() => setShowProfileForm(false)}
//                   className="flex-1 px-6 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition"
//                 >
//                   Discard
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={loading}
//                   className="flex-[2] bg-slate-900 text-white px-6 py-4 rounded-2xl font-bold hover:bg-slate-800 transition disabled:opacity-50 shadow-xl shadow-slate-200"
//                 >
//                   {loading ? "Processing..." : userProfile ? "Save Changes" : "Create Account"}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
      
//       <style dangerouslySetInnerHTML={{ __html: `
//         .custom-scrollbar::-webkit-scrollbar { width: 6px; }
//         .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
//         .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
//         .no-scrollbar::-webkit-scrollbar { display: none; }
//       `}} />
//     </div>
//   );
// }

import { User, Plus, Upload, X, CalendarDays, Edit, LogOut, LayoutDashboard, Settings, BookOpen, ShieldCheck, Mail, Phone, AtSign } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";

export default function UsersDashboard() {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [profileData, setProfileData] = useState({
    prn: user?.prn || "",
    fullName: "",
    departmentId: "",
    year: "",
    phoneNumber: "",
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    fetchUserProfile();
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (departments.length > 0 && profileData.departmentId && typeof profileData.departmentId === "string" && isNaN(profileData.departmentId)) {
      const dept = departments.find((d) => d.name === profileData.departmentId);
      if (dept) {
        setProfileData((prev) => ({ ...prev, departmentId: dept.departmentId }));
      }
    }
  }, [departments, profileData.departmentId]);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/department", {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (response.data && response.data.data) setDepartments(response.data.data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const fetchUserProfile = async () => {
    try {
      setIsLoadingProfile(true);
      const response = await axios.get(`http://localhost:8080/api/profiles/prn/${user?.prn}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data) {
        setUserProfile(response.data);
        let deptId = "";
        if (response.data.data.department) {
          deptId = typeof response.data.data.department === "object" ? response.data.data.department.departmentId : response.data.data.department;
        }

        setProfileData({
          prn: response.data.data.prn || user?.prn || "",
          fullName: response.data.data.fullName || "",
          departmentId: deptId,
          year: response.data.data.year || "",
          phoneNumber: response.data.data.phoneNumber || "",
        });
        fetchProfileImage();
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const fetchProfileImage = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/profiles/${user?.prn}/image`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      if (response.data) setProfileImage(URL.createObjectURL(response.data));
    } catch (error) {
      setProfileImage(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const requestData = {
        fullName: profileData.fullName,
        departmentId: parseInt(profileData.departmentId),
        year: profileData.year,
        phoneNumber: profileData.phoneNumber,
      };

      if (userProfile) {
        await axios.put(`http://localhost:8080/api/profiles/${profileData.prn}`, requestData, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
      } else {
        await axios.post("http://localhost:8080/api/profiles", { ...requestData, prn: profileData.prn }, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
      }

      if (selectedImage) {
        const formData = new FormData();
        formData.append("image", selectedImage);
        await axios.post(`http://localhost:8080/api/profiles/${profileData.prn}/image`, formData, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        });
      }

      fetchUserProfile();
      setShowProfileForm(false);
    } catch (error) {
      setMessage("Error saving profile.");
    } finally {
      setLoading(false);
    }
  };

  const getDepartmentName = (id) => {
    if (typeof id === "string" && isNaN(id)) return id;
    const dept = departments.find((d) => d.departmentId === parseInt(id));
    return dept ? dept.name : "Not set";
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* SIDEBAR - Wide and Detailed */}
      <aside className="w-96 bg-white border-r border-gray-100 flex flex-col p-8 sticky top-0 h-screen shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-[#7C3AED] p-2 rounded-xl">
            <LayoutDashboard className="text-white w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">User<span className="text-[#7C3AED]">Portal</span></h1>
        </div>

        {/* Profile Image Section */}
        <div className="relative group mx-auto mb-6">
          <div className="w-40 h-40 rounded-[2.5rem] overflow-hidden border-8 border-gray-50 shadow-inner bg-gray-100">
            {profileImage ? (
              <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <User size={48} />
              </div>
            )}
          </div>
          <button 
            onClick={() => setShowProfileForm(true)}
            className="absolute bottom-1 right-1 bg-white p-2.5 rounded-2xl shadow-xl border border-gray-100 text-[#7C3AED] hover:scale-110 transition-transform"
          >
            <Edit size={18} />
          </button>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight leading-tight">{profileData.fullName || user?.username}</h2>
          <span className="mt-2 inline-block text-[10px] font-black bg-[#7C3AED]/10 text-[#7C3AED] px-4 py-1.5 rounded-full uppercase tracking-widest">
            {user?.role || "USERS"}
          </span>
        </div>

        {/* DETAILED INFO LIST - Scrollable if content overflows */}
        <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar pb-4">
          <SidebarInfoBox label="Full Name" value={profileData.fullName} />
          <SidebarInfoBox label="Username" value={user?.username} />
          <SidebarInfoBox label="PRN / ID" value={profileData.prn} />
          <SidebarInfoBox label="Email" value={user?.email} />
          <SidebarInfoBox label="Department" value={getDepartmentName(profileData.departmentId)} />
          <SidebarInfoBox label="Year" value={profileData.year} />
          <SidebarInfoBox label="Phone" value={profileData.phoneNumber} />
        </div>

        {/* Sign Out Button */}
        <button 
          onClick={handleLogout}
          className="mt-4 flex items-center justify-center gap-3 text-red-500 font-bold py-4 hover:bg-red-50 rounded-[1.5rem] transition-all border border-transparent hover:border-red-100"
        >
          <LogOut size={20} /> Sign Out
        </button>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-10">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Dashboard</h1>
            <p className="text-gray-500 mt-1">Welcome back, <span className="text-[#7C3AED] font-semibold">{user?.username}</span>. System is healthy.</p>
          </div>
          <div className="flex items-center gap-3 bg-green-50 text-green-600 px-5 py-2.5 rounded-full border border-green-100">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-bold uppercase tracking-widest">All Systems Live</span>
          </div>
        </header>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <StatCard icon={<CalendarDays />} label="Joined Clubs" value="0" color="blue" />
          <StatCard icon={<BookOpen />} label="Total Events" value="12" color="orange" />
          <StatCard icon={<ShieldCheck />} label="Verified Status" value={user?.verified ? "Verified" : "Pending"} color="purple" isStatus />
        </div>

        {/* Control Center Section */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-xl font-bold text-gray-800">Control Center</h2>
            <div className="h-[1px] flex-1 bg-gray-100"></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <ActionCard icon={<CalendarDays className="text-blue-500" />} label="Events" color="blue" />
            <ActionCard icon={<User className="text-orange-500" />} label="My Clubs" color="orange" />
            <ActionCard icon={<BookOpen className="text-green-500" />} label="Resources" color="green" />
            <ActionCard icon={<Settings className="text-purple-500" />} label="Settings" color="purple" />
          </div>
        </section>
      </main>

      {/* Profile Form Modal */}
      {showProfileForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-xl w-full p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold text-gray-800">{userProfile ? "Edit Profile" : "Complete Profile"}</h3>
              <button onClick={() => setShowProfileForm(false)} className="bg-gray-50 p-2 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmitProfile} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <FormInput label="PRN (Read Only)" value={profileData.prn} readOnly />
                <FormInput label="Full Name" value={profileData.fullName} onChange={(e) => setProfileData({...profileData, fullName: e.target.value})} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 ml-1 uppercase tracking-widest">Department</label>
                  <select 
                    value={profileData.departmentId} 
                    onChange={(e) => setProfileData({...profileData, departmentId: e.target.value})}
                    className="w-full px-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#7C3AED] outline-none text-gray-700 font-medium"
                    required
                  >
                    <option value="">Select Dept</option>
                    {departments.map(dept => <option key={dept.departmentId} value={dept.departmentId}>{dept.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 ml-1 uppercase tracking-widest">Year</label>
                  <select 
                    value={profileData.year} 
                    onChange={(e) => setProfileData({...profileData, year: e.target.value})}
                    className="w-full px-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#7C3AED] outline-none text-gray-700 font-medium"
                    required
                  >
                    <option value="">Select Year</option>
                    {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
                  </select>
                </div>
              </div>

              <FormInput label="Phone Number" value={profileData.phoneNumber} onChange={(e) => setProfileData({...profileData, phoneNumber: e.target.value})} required />

              <div className="bg-gray-50 p-6 rounded-2xl border-2 border-dashed border-gray-200 text-center hover:border-[#7C3AED]/30 transition-colors">
                <input type="file" accept="image/*" onChange={(e) => setSelectedImage(e.target.files[0])} className="hidden" id="profile-upload" />
                <label htmlFor="profile-upload" className="cursor-pointer flex flex-col items-center gap-2 text-gray-500 hover:text-[#7C3AED]">
                  <Upload size={24} />
                  <span className="text-sm font-semibold">{selectedImage ? selectedImage.name : "Upload Profile Photo"}</span>
                </label>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#7C3AED] text-white py-4 rounded-2xl font-bold shadow-lg shadow-purple-100 hover:bg-[#6D28D9] transition-all disabled:opacity-50"
              >
                {loading ? "Saving..." : userProfile ? "Update Profile" : "Complete Profile"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* HELPER COMPONENTS */
function SidebarInfoBox({ label, value }) {
  return (
    <div className="p-4 bg-gray-50/50 rounded-[1.2rem] border border-transparent hover:border-gray-100 transition-colors group">
      <p className="text-[9px] uppercase font-black text-gray-400 mb-1 tracking-widest group-hover:text-[#7C3AED] transition-colors">{label}</p>
      <p className="text-gray-700 font-bold text-sm truncate">{value || "Not set"}</p>
    </div>
  );
}

function StatCard({ icon, label, value, color, isStatus }) {
  const bgColors = { blue: "bg-blue-50 text-blue-500", orange: "bg-orange-50 text-orange-500", purple: "bg-purple-50 text-purple-500" };
  return (
    <div className="bg-white p-7 rounded-[2.5rem] shadow-sm border border-gray-50 flex items-center gap-6">
      <div className={`${bgColors[color]} p-5 rounded-[1.5rem]`}>{icon}</div>
      <div>
        <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">{label}</p>
        <h3 className={`text-2xl font-black tracking-tight ${isStatus ? (value === "Verified" ? "text-green-500" : "text-amber-500") : "text-gray-800"}`}>
          {value}
        </h3>
      </div>
    </div>
  );
}

function ActionCard({ icon, label, color }) {
  const themes = {
    blue: "bg-blue-50/40 hover:bg-blue-50",
    orange: "bg-orange-50/40 hover:bg-orange-50",
    green: "bg-green-50/40 hover:bg-green-50",
    purple: "bg-purple-50/40 hover:bg-purple-50"
  };
  return (
    <button className={`${themes[color]} p-10 rounded-[2.5rem] border border-gray-50/50 transition-all hover:scale-[1.03] flex flex-col items-center justify-center gap-5 group shadow-sm`}>
      <div className="p-5 bg-white rounded-2xl shadow-sm group-hover:shadow-md transition-all group-hover:-translate-y-1">
        {icon}
      </div>
      <span className="font-black text-gray-700 uppercase text-xs tracking-widest">{label}</span>
    </button>
  );
}

function FormInput({ label, ...props }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-black text-gray-400 ml-1 uppercase tracking-widest">{label}</label>
      <input 
        className="w-full px-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#7C3AED] outline-none text-gray-700 font-medium transition-all"
        {...props} 
      />
    </div>
  );
}