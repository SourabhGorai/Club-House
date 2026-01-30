import { useState, useEffect } from "react";
import axios from "axios";
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
} from "lucide-react";

export default function SuperAdminDashboard() {
  // Get user data from localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  
  const [currentUser] = useState({
    username: user?.username || "admin_user",
    email: user?.email || "admin@college.edu",
    role: user?.role || "SUPER_ADMIN",
    prn: user?.prn || "2021BCS001",
    verified: user?.verified || true
  });

  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [departments, setDepartments] = useState([]);
  
  // Profile states
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [profileData, setProfileData] = useState({
    prn: user?.prn || "",
    fullName: "",
    departmentId: "",
    year: "",
    phoneNumber: "",
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [userProfile, setUserProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    fetchAllData();
    fetchUserProfile();
    fetchDepartments();
  }, []);

  // Convert department name to ID after departments are loaded
  useEffect(() => {
    if (departments.length > 0 && profileData.departmentId && typeof profileData.departmentId === 'string' && isNaN(profileData.departmentId)) {
      // departmentId is actually a department name string, convert it to ID
      const dept = departments.find(d => d.name === profileData.departmentId);
      if (dept) {
        setProfileData(prev => ({
          ...prev,
          departmentId: dept.departmentId
        }));
      }
    }
  }, [departments, profileData.departmentId]);

  // Fetch all users and calculate stats
  const fetchAllData = async () => {
    try {
      const usersResponse = await axios.get(
        "http://localhost:8080/api/users/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setUsers(usersResponse.data);

      // Calculate stats from user roles
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

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/api/department",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      if (response.data && response.data.data) {
        setDepartments(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  // Fetch user profile data
  const fetchUserProfile = async () => {
    try {
      setIsLoadingProfile(true);
      const response = await axios.get(
        `http://localhost:8080/api/profiles/prn/${user?.prn}`,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
          }
        }
      );
      
      if (response.data) {
        setUserProfile(response.data);
        
        // Handle department - could be string (name) or object with departmentId
        let deptId = "";
        if (response.data.data.department) {
          if (typeof response.data.data.department === 'object' && response.data.data.department.departmentId) {
            // Department is an object with departmentId
            deptId = response.data.data.department.departmentId;
          } else if (typeof response.data.data.department === 'string') {
            // Department is a string (name), need to find ID from departments array
            // This will be set after departments are loaded
            deptId = response.data.data.department; // Store name temporarily
          }
        }
        
        setProfileData({
          prn: response.data.data.prn || user?.prn || '',
          fullName: response.data.data.fullName || '',
          departmentId: deptId,
          year: response.data.data.year || '',
          phoneNumber: response.data.data.phoneNumber || ''
        });
        
        // Fetch profile image
        fetchProfileImage();
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setUserProfile(null);
      // If profile doesn't exist, initialize with user PRN
      setProfileData(prev => ({
        ...prev,
        prn: user?.prn || ""
      }));
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const fetchProfileImage = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/profiles/${user?.prn}/image`,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
          },
          responseType: 'blob'
        }
      );
      
      if (response.data) {
        const imageUrl = URL.createObjectURL(response.data);
        setImagePreview(imageUrl);
      }
    } catch (error) {
      console.error('Error fetching profile image:', error);
      setImagePreview(null);
    }
  };

  const handleLogout = () => {
    if (confirm("Are you sure you want to log out?")) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  };

  const handleInputChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setMessage({ text: "", type: "" });

    // Validation
    if (!profileData.prn || !profileData.fullName || !profileData.departmentId || 
        !profileData.year || !profileData.phoneNumber) {
      setMessage({ text: "Please fill all required fields", type: "error" });
      setProfileLoading(false);
      return;
    }

    if (profileData.prn.length < 10) {
      setMessage({ text: "Please enter a valid PRN (minimum 10 characters)", type: "error" });
      setProfileLoading(false);
      return;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(profileData.phoneNumber)) {
      setMessage({ text: "Please enter a valid 10-digit phone number", type: "error" });
      setProfileLoading(false);
      return;
    }

    if (profileData.year < 1 || profileData.year > 4) {
      setMessage({ text: "Please select a valid year (1-4)", type: "error" });
      setProfileLoading(false);
      return;
    }

    try {
      // If profile exists, update it; otherwise create new
      if (userProfile) {
        // Update existing profile
        const requestData = {
          fullName: profileData.fullName,
          departmentId: parseInt(profileData.departmentId),
          year: profileData.year,
          phoneNumber: profileData.phoneNumber
        }
        await axios.put(
          `http://localhost:8080/api/profiles/${profileData.prn}`,
          requestData,
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        setMessage({ text: "Profile updated successfully!", type: "success" });
      } else {
        // Create new profile
        const requestData = {
          prn: profileData.prn,
          fullName: profileData.fullName,
          departmentId: parseInt(profileData.departmentId),
          year: profileData.year,
          phoneNumber: profileData.phoneNumber
        };
        await axios.post(
          "http://localhost:8080/api/profiles",
          requestData,
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        setMessage({ text: "Profile created successfully!", type: "success" });
      }

      // Upload image if selected
      if (selectedImage) {
        const formData = new FormData();
        formData.append('image', selectedImage);
        
        await axios.post(
          `http://localhost:8080/api/profiles/${profileData.prn}/image`,
          formData,
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      }

      // Refresh profile data
      await fetchUserProfile();

      setTimeout(() => {
        setShowProfileForm(false);
        setMessage({ text: "", type: "" });
      }, 1500);
    } catch (error) {
      console.error("Error saving profile:", error);
      setMessage({ text: "Error saving profile. Please try again.", type: "error" });
    } finally {
      setProfileLoading(false);
    }
  };

  // Helper function to get department name by ID
  const getDepartmentName = (departmentIdOrName) => {
    if (!departmentIdOrName) return "Not set";
    
    // If it's already a string name, return it
    if (typeof departmentIdOrName === 'string' && isNaN(departmentIdOrName)) {
      return departmentIdOrName;
    }
    
    // Otherwise look up by ID
    const dept = departments.find(d => d.departmentId === parseInt(departmentIdOrName));
    return dept ? dept.name : "Not set";
  };

  const StatCard = ({ title, count, color, icon: Icon }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer group">
      <div className={`p-4 rounded-xl bg-${color}-50 text-${color}-600 flex-shrink-0 transition-all duration-300 group-hover:scale-110`}>
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

  const BigActionButton = ({ label, color, icon: Icon, onClick }) => (
    <button
      onClick={onClick}
      className={`group flex flex-col items-center justify-center p-8 rounded-3xl transition-all duration-300 bg-white border-2 border-gray-100 hover:bg-${color}-50 hover:shadow-xl min-h-[160px] hover:-translate-y-2`}
    >
      <div className={`p-5 rounded-2xl bg-${color}-50 text-${color}-600 mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm`}>
        <Icon className="w-8 h-8" />
      </div>
      <span className={`text-lg font-bold text-gray-700 group-hover:text-${color}-700 transition-colors text-center px-2`}>
        {label}
      </span>
    </button>
  );

  if (loading || isLoadingProfile) {
    return (
      <div className="min-h-screen bg-[#fcfcfd] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfcfd] flex relative">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between z-50 shadow-sm">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 hover:scale-105"
        >
          <Menu size={24} className="text-gray-700" />
        </button>
        <div className="flex items-center space-x-2">
          <div className="bg-gradient-to-br from-purple-600 to-indigo-600 p-2 rounded-lg transition-transform hover:scale-105">
            <LayoutDashboard className="text-white w-5 h-5" />
          </div>
          <h2 className="text-xl font-black tracking-tight text-gray-800">
            Super<span className="text-purple-600">Admin</span>
          </h2>
        </div>
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-purple-100 transition-all hover:border-purple-300 hover:scale-105">
          <img
            src={imagePreview || `https://ui-avatars.com/api/?name=${profileData.fullName || currentUser.username}&background=7c3aed&color=fff`}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
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
          className="lg:hidden absolute top-4 right-4 p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 hover:rotate-90"
        >
          <X size={20} className="text-gray-500" />
        </button>

        <div className="flex items-center space-x-3 mb-10 group cursor-pointer">
          <div className="bg-gradient-to-br from-purple-600 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-purple-200 transition-all duration-300 group-hover:shadow-purple-300 group-hover:scale-105">
            <LayoutDashboard className="text-white" size={24} />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-gray-800">
            Super<span className="text-purple-600">Admin</span>
          </h2>
        </div>

        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative p-1 border-2 border-purple-100 rounded-3xl mb-4 transition-all duration-300 hover:border-purple-300 hover:shadow-lg hover:shadow-purple-100">
            <img
              src={imagePreview || `https://ui-avatars.com/api/?name=${profileData.fullName || currentUser.username}&background=7c3aed&color=fff`}
              alt="Profile"
              className="w-32 h-32 rounded-[2rem] object-cover shadow-inner"
            />
            <button
              onClick={() => setShowProfileForm(true)}
              className="absolute -bottom-1 -right-1 bg-white p-2 rounded-xl shadow-lg border border-gray-50 text-purple-600 hover:scale-110 hover:bg-purple-50 transition-all duration-200"
            >
              <Edit size={16} />
            </button>
          </div>
          <h3 className="font-bold text-gray-900 text-xl tracking-tight">
            {profileData.fullName || currentUser.username}
          </h3>
          <p className="text-[10px] font-black text-purple-700 bg-purple-50 px-3 py-1 rounded-full mt-2 uppercase tracking-[0.1em] hover:bg-purple-100 transition-colors cursor-pointer">
            {currentUser.role.replace("_", " ")}
          </p>
        </div>

        <nav className="space-y-2 flex-1 overflow-y-auto">
          <div className="p-6 bg-gray-50/50 rounded-2xl border border-gray-100 space-y-4 transition-all duration-300 hover:shadow-md hover:bg-gray-50">
            <div className="flex flex-col group cursor-pointer">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 group-hover:text-purple-600 transition-colors">
                Full Name
              </span>
              <span className="text-sm font-bold text-gray-700 break-words group-hover:text-gray-900 transition-colors">
                {profileData.fullName || "Not set"}
              </span>
            </div>
            <div className="flex flex-col group cursor-pointer">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 group-hover:text-purple-600 transition-colors">
                Username
              </span>
              <span className="text-sm font-bold text-gray-700 break-words group-hover:text-gray-900 transition-colors">
                {currentUser.username}
              </span>
            </div>
            <div className="flex flex-col group cursor-pointer">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 group-hover:text-purple-600 transition-colors">
                Email
              </span>
              <span className="text-sm font-bold text-gray-700 break-all group-hover:text-gray-900 transition-colors">
                {currentUser.email}
              </span>
            </div>
            <div className="flex flex-col group cursor-pointer">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 group-hover:text-purple-600 transition-colors">
                Phone
              </span>
              <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900 transition-colors">
                {profileData.phoneNumber || "Not set"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col group cursor-pointer">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 group-hover:text-purple-600 transition-colors">
                  PRN
                </span>
                <span className="text-sm font-bold text-gray-700 break-words group-hover:text-gray-900 transition-colors">
                  {profileData.prn || "Not set"}
                </span>
              </div>
              <div className="flex flex-col group cursor-pointer">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 group-hover:text-purple-600 transition-colors">
                  Year
                </span>
                <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900 transition-colors">
                  {profileData.year || "Not set"}
                </span>
              </div>
            </div>
            <div className="flex flex-col group cursor-pointer">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 group-hover:text-purple-600 transition-colors">
                Department
              </span>
              <span className="text-sm font-bold text-gray-700 break-words group-hover:text-gray-900 transition-colors">
                {profileData.departmentId ? getDepartmentName(profileData.departmentId) : "Not set"}
              </span>
            </div>
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between group cursor-pointer">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-purple-600 transition-colors">
                Status
              </span>
              <span className="flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md group-hover:bg-emerald-100 transition-all duration-200 group-hover:scale-105">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-pulse"></div>
                {currentUser.verified ? 'ACTIVE' : 'INACTIVE'}
              </span>
            </div>
          </div>
        </nav>

        <button
          onClick={handleLogout}
          className="mt-6 flex items-center justify-center space-x-3 w-full py-4 text-red-500 hover:bg-red-50 rounded-2xl transition-all duration-200 font-bold text-sm border border-transparent hover:border-red-100 hover:shadow-md hover:shadow-red-100/50"
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
                <span className="text-purple-600 font-bold">
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
            <StatCard title="Total Users" count={users.length} color="purple" icon={Users} />
            <StatCard title="Faculty" count={stats.TEACHERS || 0} color="blue" icon={Briefcase} />
            <StatCard title="Club Admins" count={stats.CLUB_ADMIN || 0} color="emerald" icon={ShieldCheck} />
            <StatCard title="Regular" count={stats.USERS || 0} color="orange" icon={User} />
          </div>

          {/* Control Center */}
          <section>
            <div className="flex items-center space-x-4 mb-8">
              <h3 className="text-2xl font-black text-gray-800 tracking-tight whitespace-nowrap">
                Control Center
              </h3>
              <div className="flex-1 h-[2px] bg-gradient-to-r from-gray-200 via-purple-200 to-gray-200 rounded-full"></div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <BigActionButton label="Manage Users" color="blue" icon={Users} onClick={() => window.location.href = "/manage-users"} />
              <BigActionButton label="Events" color="emerald" icon={CalendarDays} onClick={() => alert("Events feature")} />
              <BigActionButton label="Club Admins" color="purple" icon={ShieldAlert} onClick={() => alert("Club Admins feature")} />
              <BigActionButton label="Teachers" color="yellow" icon={Briefcase} onClick={() => alert("Teachers feature")} />
              <BigActionButton label="Manage Clubs" color="orange" icon={Database} onClick={() => window.location.href = "/manage-clubs"} />
              <BigActionButton label="Add Student" color="cyan" icon={UserPlus} onClick={() => window.location.href = "/add-users-with-club"} />
              <BigActionButton label="System Settings" color="pink" icon={Settings} onClick={() => alert("Settings feature")} />
              <BigActionButton label="Audit Logs" color="slate" icon={Database} onClick={() => alert("Audit Logs feature")} />
            </div>
          </section>
        </div>
      </main>

      {/* Profile Form Modal */}
      {showProfileForm && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center p-6 z-50 overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full my-8 overflow-hidden border border-white">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-8 text-white">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold">
                  {userProfile ? 'Edit Profile' : 'Complete Profile'}
                </h3>
                <button
                  onClick={() => {
                    setShowProfileForm(false);
                    setMessage({ text: "", type: "" });
                  }}
                  className="bg-white/20 p-2 rounded-xl hover:bg-white/30 transition-all duration-200 hover:rotate-90"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitProfile} className="p-8 space-y-5">
              {/* Profile Image Upload */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  <img
                    src={imagePreview || `https://ui-avatars.com/api/?name=${profileData.fullName || currentUser.username}&background=7c3aed&color=fff&size=128`}
                    alt="Profile Preview"
                    className="w-32 h-32 rounded-full object-cover border-4 border-purple-100"
                  />
                  <label className="absolute bottom-0 right-0 bg-purple-600 p-2 rounded-full cursor-pointer hover:bg-purple-700 transition-all shadow-lg">
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

              {/* PRN */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  PRN <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="prn"
                  value={profileData.prn}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                    userProfile ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  readOnly={!!userProfile}
                  placeholder="Enter your PRN"
                  required
                />
                {userProfile && (
                  <p className="text-xs text-gray-500 mt-1">PRN cannot be changed</p>
                )}
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={profileData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              {/* Department - Dropdown */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  name="departmentId"
                  value={profileData.departmentId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  required
                  disabled={departments.length === 0}
                >
                  <option value="">
                    {departments.length === 0 ? 'Loading departments...' : 'Select Department'}
                  </option>
                  {departments.map((dept) => (
                    <option key={dept.departmentId} value={dept.departmentId}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                {departments.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1 flex items-center">
                    <span className="animate-spin mr-2">⏳</span>
                    Loading departments from server...
                  </p>
                )}
              </div>

              {/* Year */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Year <span className="text-red-500">*</span>
                </label>
                <select
                  name="year"
                  value={profileData.year}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  required
                >
                  <option value="">Select Year</option>
                  <option value="1">First Year</option>
                  <option value="2">Second Year</option>
                  <option value="3">Third Year</option>
                  <option value="4">Fourth Year</option>
                </select>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={profileData.phoneNumber}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="10-digit phone number"
                  required
                />
              </div>

              {/* Message Display */}
              {message.text && (
                <div className={`p-4 rounded-xl ${
                  message.type === 'error' 
                    ? 'bg-red-50 text-red-700 border border-red-200' 
                    : 'bg-green-50 text-green-700 border border-green-200'
                }`}>
                  <p className="text-sm font-semibold">{message.text}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileForm(false);
                    setMessage({ text: "", type: "" });
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-xl font-bold transition-all duration-200 hover:scale-105"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3 rounded-xl font-bold transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {profileLoading ? 'Saving...' : (userProfile ? 'Update Profile' : 'Create Profile')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// // // ************************************************************************

// import { useState, useEffect } from "react";
// import axios from "axios";
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
// } from "lucide-react";

// export default function SuperAdminDashboard() {
//   // Get user data from localStorage
//   const user = JSON.parse(localStorage.getItem("user"));
//   const token = localStorage.getItem("token");
  
//   const [currentUser] = useState({
//     username: user?.username || "admin_user",
//     email: user?.email || "admin@college.edu",
//     role: user?.role || "SUPER_ADMIN",
//     prn: user?.prn || "2021BCS001",
//     verified: user?.verified || true
//   });

//   const [users, setUsers] = useState([]);
//   const [stats, setStats] = useState({});
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
//   });
//   const [selectedImage, setSelectedImage] = useState(null);
//   const [imagePreview, setImagePreview] = useState(null);
//   const [profileLoading, setProfileLoading] = useState(false);
//   const [message, setMessage] = useState({ text: "", type: "" });
//   const [userProfile, setUserProfile] = useState(null);
//   const [isLoadingProfile, setIsLoadingProfile] = useState(true);

//   useEffect(() => {
//     fetchAllData();
//     fetchUserProfile();
//   }, []);

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
//         }
//       );

//       setUsers(usersResponse.data);

//       // Calculate stats from user roles
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

//   // Fetch user profile data
//   const fetchUserProfile = async () => {
//     try {
//       setIsLoadingProfile(true);
//       const response = await axios.get(
//         `http://localhost:8080/api/profiles/prn/${user?.prn}`,
//         {
//           headers: { 
//             Authorization: `Bearer ${token}`,
//           }
//         }
//       );
      
//       if (response.data) {
//         setUserProfile(response.data);
//         setProfileData({
//           prn: response.data.data.prn || user?.prn || '',
//           fullName: response.data.data.fullName || '',
//           department: response.data.data.department || '',
//           year: response.data.data.year || '',
//           phoneNumber: response.data.data.phoneNumber || ''
//         });
        
//         // Fetch profile image
//         fetchProfileImage();
//       }
//     } catch (error) {
//       console.error("Error fetching profile:", error);
//       setUserProfile(null);
//       // If profile doesn't exist, initialize with user PRN
//       setProfileData(prev => ({
//         ...prev,
//         prn: user?.prn || ""
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
//           responseType: 'blob'
//         }
//       );
      
//       if (response.data) {
//         const imageUrl = URL.createObjectURL(response.data);
//         setImagePreview(imageUrl);
//       }
//     } catch (error) {
//       console.error('Error fetching profile image:', error);
//       setImagePreview(null);
//     }
//   };

//   const handleLogout = () => {
//     if (confirm("Are you sure you want to log out?")) {
//       localStorage.removeItem("user");
//       localStorage.removeItem("token");
//       window.location.href = "/login";
//     }
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
//     setMessage({ text: "", type: "" });

//     // Validation
//     if (!profileData.prn || !profileData.fullName || !profileData.department || 
//         !profileData.year || !profileData.phoneNumber) {
//       setMessage({ text: "Please fill all required fields", type: "error" });
//       setProfileLoading(false);
//       return;
//     }

//     if (profileData.prn.length < 10) {
//       setMessage({ text: "Please enter a valid PRN (minimum 10 characters)", type: "error" });
//       setProfileLoading(false);
//       return;
//     }

//     const phoneRegex = /^[0-9]{10}$/;
//     if (!phoneRegex.test(profileData.phoneNumber)) {
//       setMessage({ text: "Please enter a valid 10-digit phone number", type: "error" });
//       setProfileLoading(false);
//       return;
//     }

//     if (profileData.year < 1 || profileData.year > 4) {
//       setMessage({ text: "Please select a valid year (1-4)", type: "error" });
//       setProfileLoading(false);
//       return;
//     }

//     try {
//       // If profile exists, update it; otherwise create new
//       if (userProfile) {
//         // Update existing profile
//         const requestData = {
//           fullName: profileData.fullName,
//           department: profileData.department,
//           year: profileData.year,
//           phoneNumber: profileData.phoneNumber
//         }
//         await axios.put(
//           `http://localhost:8080/api/profiles/${profileData.prn}`,
//           requestData,
//           {
//             headers: { 
//               Authorization: `Bearer ${token}`,
//               'Content-Type': 'application/json'
//             }
//           }
//         );
//         setMessage({ text: "Profile updated successfully!", type: "success" });
//       } else {
//         // Create new profile
//         await axios.post(
//           "http://localhost:8080/api/profiles",
//           profileData,
//           {
//             headers: { 
//               Authorization: `Bearer ${token}`,
//               'Content-Type': 'application/json'
//             }
//           }
//         );
//         setMessage({ text: "Profile created successfully!", type: "success" });
//       }

//       // Upload image if selected
//       if (selectedImage) {
//         const formData = new FormData();
//         formData.append('image', selectedImage);
        
//         await axios.post(
//           `http://localhost:8080/api/profiles/${profileData.prn}/image`,
//           formData,
//           {
//             headers: { 
//               Authorization: `Bearer ${token}`,
//               'Content-Type': 'multipart/form-data'
//             }
//           }
//         );
//       }

//       // Refresh profile data
//       await fetchUserProfile();

//       setTimeout(() => {
//         setShowProfileForm(false);
//         setMessage({ text: "", type: "" });
//       }, 1500);
//     } catch (error) {
//       console.error("Error saving profile:", error);
//       setMessage({ text: "Error saving profile. Please try again.", type: "error" });
//     } finally {
//       setProfileLoading(false);
//     }
//   };

//   const StatCard = ({ title, count, color, icon: Icon }) => (
//     <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer group">
//       <div className={`p-4 rounded-xl bg-${color}-50 text-${color}-600 flex-shrink-0 transition-all duration-300 group-hover:scale-110`}>
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

//   const BigActionButton = ({ label, color, icon: Icon, onClick }) => (
//     <button
//       onClick={onClick}
//       className={`group flex flex-col items-center justify-center p-8 rounded-3xl transition-all duration-300 bg-white border-2 border-gray-100 hover:bg-${color}-50 hover:shadow-xl min-h-[160px] hover:-translate-y-2`}
//     >
//       <div className={`p-5 rounded-2xl bg-${color}-50 text-${color}-600 mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm`}>
//         <Icon className="w-8 h-8" />
//       </div>
//       <span className={`text-lg font-bold text-gray-700 group-hover:text-${color}-700 transition-colors text-center px-2`}>
//         {label}
//       </span>
//     </button>
//   );

//   if (loading || isLoadingProfile) {
//     return (
//       <div className="min-h-screen bg-[#fcfcfd] flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
//           <p className="text-gray-600 font-semibold">Loading dashboard...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-[#fcfcfd] flex relative">
//       {/* Mobile Header */}
//       <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between z-50 shadow-sm">
//         <button
//           onClick={() => setSidebarOpen(!sidebarOpen)}
//           className="p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 hover:scale-105"
//         >
//           <Menu size={24} className="text-gray-700" />
//         </button>
//         <div className="flex items-center space-x-2">
//           <div className="bg-gradient-to-br from-purple-600 to-indigo-600 p-2 rounded-lg transition-transform hover:scale-105">
//             <LayoutDashboard className="text-white w-5 h-5" />
//           </div>
//           <h2 className="text-xl font-black tracking-tight text-gray-800">
//             Super<span className="text-purple-600">Admin</span>
//           </h2>
//         </div>
//         <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-purple-100 transition-all hover:border-purple-300 hover:scale-105">
//           <img
//             src={imagePreview || `https://ui-avatars.com/api/?name=${profileData.fullName || currentUser.username}&background=7c3aed&color=fff`}
//             alt="Profile"
//             className="w-full h-full object-cover"
//           />
//         </div>
//       </div>

//       {/* Overlay for mobile sidebar */}
//       {sidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
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
//           className="lg:hidden absolute top-4 right-4 p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 hover:rotate-90"
//         >
//           <X size={20} className="text-gray-500" />
//         </button>

//         <div className="flex items-center space-x-3 mb-10 group cursor-pointer">
//           <div className="bg-gradient-to-br from-purple-600 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-purple-200 transition-all duration-300 group-hover:shadow-purple-300 group-hover:scale-105">
//             <LayoutDashboard className="text-white" size={24} />
//           </div>
//           <h2 className="text-2xl font-black tracking-tight text-gray-800">
//             Super<span className="text-purple-600">Admin</span>
//           </h2>
//         </div>

//         <div className="flex flex-col items-center text-center mb-8">
//           <div className="relative p-1 border-2 border-purple-100 rounded-3xl mb-4 transition-all duration-300 hover:border-purple-300 hover:shadow-lg hover:shadow-purple-100">
//             <img
//               src={imagePreview || `https://ui-avatars.com/api/?name=${profileData.fullName || currentUser.username}&background=7c3aed&color=fff`}
//               alt="Profile"
//               className="w-32 h-32 rounded-[2rem] object-cover shadow-inner"
//             />
//             <button
//               onClick={() => setShowProfileForm(true)}
//               className="absolute -bottom-1 -right-1 bg-white p-2 rounded-xl shadow-lg border border-gray-50 text-purple-600 hover:scale-110 hover:bg-purple-50 transition-all duration-200"
//             >
//               <Edit size={16} />
//             </button>
//           </div>
//           <h3 className="font-bold text-gray-900 text-xl tracking-tight">
//             {profileData.fullName || currentUser.username}
//           </h3>
//           <p className="text-[10px] font-black text-purple-700 bg-purple-50 px-3 py-1 rounded-full mt-2 uppercase tracking-[0.1em] hover:bg-purple-100 transition-colors cursor-pointer">
//             {currentUser.role.replace("_", " ")}
//           </p>
//         </div>

//         <nav className="space-y-2 flex-1 overflow-y-auto">
//           <div className="p-6 bg-gray-50/50 rounded-2xl border border-gray-100 space-y-4 transition-all duration-300 hover:shadow-md hover:bg-gray-50">
//             <div className="flex flex-col group cursor-pointer">
//               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 group-hover:text-purple-600 transition-colors">
//                 Full Name
//               </span>
//               <span className="text-sm font-bold text-gray-700 break-words group-hover:text-gray-900 transition-colors">
//                 {profileData.fullName || "Not set"}
//               </span>
//             </div>
//             <div className="flex flex-col group cursor-pointer">
//               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 group-hover:text-purple-600 transition-colors">
//                 Username
//               </span>
//               <span className="text-sm font-bold text-gray-700 break-words group-hover:text-gray-900 transition-colors">
//                 {currentUser.username}
//               </span>
//             </div>
//             <div className="flex flex-col group cursor-pointer">
//               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 group-hover:text-purple-600 transition-colors">
//                 Email
//               </span>
//               <span className="text-sm font-bold text-gray-700 break-all group-hover:text-gray-900 transition-colors">
//                 {currentUser.email}
//               </span>
//             </div>
//             <div className="flex flex-col group cursor-pointer">
//               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 group-hover:text-purple-600 transition-colors">
//                 Phone
//               </span>
//               <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900 transition-colors">
//                 {profileData.phoneNumber || "Not set"}
//               </span>
//             </div>
//             <div className="grid grid-cols-2 gap-4">
//               <div className="flex flex-col group cursor-pointer">
//                 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 group-hover:text-purple-600 transition-colors">
//                   PRN
//                 </span>
//                 <span className="text-sm font-bold text-gray-700 break-words group-hover:text-gray-900 transition-colors">
//                   {profileData.prn || "Not set"}
//                 </span>
//               </div>
//               <div className="flex flex-col group cursor-pointer">
//                 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 group-hover:text-purple-600 transition-colors">
//                   Year
//                 </span>
//                 <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900 transition-colors">
//                   {profileData.year || "Not set"}
//                 </span>
//               </div>
//             </div>
//             <div className="flex flex-col group cursor-pointer">
//               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 group-hover:text-purple-600 transition-colors">
//                 Department
//               </span>
//               <span className="text-sm font-bold text-gray-700 break-words group-hover:text-gray-900 transition-colors">
//                 {profileData.department || "Not set"}
//               </span>
//             </div>
//             <div className="pt-2 border-t border-gray-100 flex items-center justify-between group cursor-pointer">
//               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-purple-600 transition-colors">
//                 Status
//               </span>
//               <span className="flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md group-hover:bg-emerald-100 transition-all duration-200 group-hover:scale-105">
//                 <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-pulse"></div>
//                 {currentUser.verified ? 'ACTIVE' : 'INACTIVE'}
//               </span>
//             </div>
//           </div>
//         </nav>

//         <button
//           onClick={handleLogout}
//           className="mt-6 flex items-center justify-center space-x-3 w-full py-4 text-red-500 hover:bg-red-50 rounded-2xl transition-all duration-200 font-bold text-sm border border-transparent hover:border-red-100 hover:shadow-md hover:shadow-red-100/50"
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
//                 <span className="text-purple-600 font-bold">
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
//             <StatCard title="Total Users" count={users.length} color="purple" icon={Users} />
//             <StatCard title="Faculty" count={stats.TEACHERS || 0} color="blue" icon={Briefcase} />
//             <StatCard title="Club Admins" count={stats.CLUB_ADMIN || 0} color="emerald" icon={ShieldCheck} />
//             <StatCard title="Regular" count={stats.USERS || 0} color="orange" icon={User} />
//           </div>

//           {/* Control Center */}
//           <section>
//             <div className="flex items-center space-x-4 mb-8">
//               <h3 className="text-2xl font-black text-gray-800 tracking-tight whitespace-nowrap">
//                 Control Center
//               </h3>
//               <div className="flex-1 h-[2px] bg-gradient-to-r from-gray-200 via-purple-200 to-gray-200 rounded-full"></div>
//             </div>

//             <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//               <BigActionButton label="Manage Users" color="blue" icon={Users} onClick={() => window.location.href = "/manage-users"} />
//               <BigActionButton label="Events" color="emerald" icon={CalendarDays} onClick={() => alert("Events feature")} />
//               <BigActionButton label="Club Admins" color="purple" icon={ShieldAlert} onClick={() => alert("Club Admins feature")} />
//               <BigActionButton label="Teachers" color="yellow" icon={Briefcase} onClick={() => alert("Teachers feature")} />
//               <BigActionButton label="Manage Clubs" color="orange" icon={Database} onClick={() => window.location.href = "/manage-clubs"} />
//               <BigActionButton label="Add Student" color="cyan" icon={UserPlus} onClick={() => window.location.href = "/add-users-with-club"} />
//               <BigActionButton label="System Settings" color="pink" icon={Settings} onClick={() => alert("Settings feature")} />
//               <BigActionButton label="Audit Logs" color="slate" icon={Database} onClick={() => alert("Audit Logs feature")} />
//             </div>
//           </section>
//         </div>
//       </main>

//       {/* Profile Form Modal */}
//       {showProfileForm && (
//         <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center p-6 z-50 overflow-y-auto">
//           <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full my-8 overflow-hidden border border-white">
//             <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-8 text-white">
//               <div className="flex justify-between items-center">
//                 <h3 className="text-2xl font-bold">
//                   {userProfile ? 'Edit Profile' : 'Complete Profile'}
//                 </h3>
//                 <button
//                   onClick={() => {
//                     setShowProfileForm(false);
//                     setMessage({ text: "", type: "" });
//                   }}
//                   className="bg-white/20 p-2 rounded-xl hover:bg-white/30 transition-all duration-200 hover:rotate-90"
//                 >
//                   <X size={20} />
//                 </button>
//               </div>
//             </div>

//             <form onSubmit={handleSubmitProfile} className="p-8 space-y-5">
//               {/* Profile Image Upload */}
//               <div className="flex flex-col items-center mb-6">
//                 <div className="relative">
//                   <img
//                     src={imagePreview || `https://ui-avatars.com/api/?name=${profileData.fullName || currentUser.username}&background=7c3aed&color=fff&size=128`}
//                     alt="Profile Preview"
//                     className="w-32 h-32 rounded-full object-cover border-4 border-purple-100"
//                   />
//                   <label className="absolute bottom-0 right-0 bg-purple-600 p-2 rounded-full cursor-pointer hover:bg-purple-700 transition-all shadow-lg">
//                     <Camera size={20} className="text-white" />
//                     <input
//                       type="file"
//                       accept="image/*"
//                       onChange={handleImageChange}
//                       className="hidden"
//                     />
//                   </label>
//                 </div>
//                 <p className="text-sm text-gray-500 mt-2">Click camera to upload photo</p>
//               </div>

//               {/* PRN */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   PRN <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="prn"
//                   value={profileData.prn}
//                   onChange={handleInputChange}
//                   className={`w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
//                     userProfile ? 'bg-gray-100 cursor-not-allowed' : ''
//                   }`}
//                   readOnly={!!userProfile}
//                   placeholder="Enter your PRN"
//                   required
//                 />
//                 {userProfile && (
//                   <p className="text-xs text-gray-500 mt-1">PRN cannot be changed</p>
//                 )}
//               </div>

//               {/* Full Name */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Full Name <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="fullName"
//                   value={profileData.fullName}
//                   onChange={handleInputChange}
//                   className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
//                   placeholder="Enter your full name"
//                   required
//                 />
//               </div>

//               {/* Department */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Department <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="department"
//                   value={profileData.department}
//                   onChange={handleInputChange}
//                   className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
//                   placeholder="e.g., Computer Science"
//                   required
//                 />
//               </div>

//               {/* Year */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Year <span className="text-red-500">*</span>
//                 </label>
//                 <select
//                   name="year"
//                   value={profileData.year}
//                   onChange={handleInputChange}
//                   className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
//                   required
//                 >
//                   <option value="">Select Year</option>
//                   <option value="1">First Year</option>
//                   <option value="2">Second Year</option>
//                   <option value="3">Third Year</option>
//                   <option value="4">Fourth Year</option>
//                 </select>
//               </div>

//               {/* Phone Number */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Phone Number <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="tel"
//                   name="phoneNumber"
//                   value={profileData.phoneNumber}
//                   onChange={handleInputChange}
//                   className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
//                   placeholder="10-digit phone number"
//                   required
//                 />
//               </div>

//               {/* Message Display */}
//               {message.text && (
//                 <div className={`p-4 rounded-xl ${
//                   message.type === 'error' 
//                     ? 'bg-red-50 text-red-700 border border-red-200' 
//                     : 'bg-green-50 text-green-700 border border-green-200'
//                 }`}>
//                   <p className="text-sm font-semibold">{message.text}</p>
//                 </div>
//               )}

//               {/* Action Buttons */}
//               <div className="flex space-x-4 pt-4">
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setShowProfileForm(false);
//                     setMessage({ text: "", type: "" });
//                   }}
//                   className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-xl font-bold transition-all duration-200 hover:scale-105"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={profileLoading}
//                   className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3 rounded-xl font-bold transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
//                 >
//                   {profileLoading ? 'Saving...' : (userProfile ? 'Update Profile' : 'Create Profile')}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }