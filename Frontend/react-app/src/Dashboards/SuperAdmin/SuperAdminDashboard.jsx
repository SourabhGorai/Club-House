import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Add this import
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
} from "lucide-react";

export default function SuperAdminDashboard() {
   const navigate = useNavigate(); 
  // Get user data from localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const [currentUser] = useState({
    username: user?.username || "admin_user",
    email: user?.email || "admin@college.edu",
    role: user?.role || "SUPER_ADMIN",
    prn: user?.prn || "2021BCS001",
    verified: user?.verified || true,
  });

  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
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
  const [editingDept, setEditingDept] = useState(null); // null for create, {departmentId, name} for edit
  const [deptInput, setDeptInput] = useState("");
  const [deptMessage, setDeptMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    fetchAllData();
    fetchUserProfile();
  }, []);

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
        },
      );

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

  // Fetch departments
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

      if (response.data.success) {
        setDepartments(response.data.data || []);
      } else {
        setDeptMessage({
          text: response.data.message || "Failed to fetch departments",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
      setDeptMessage({ text: "Error fetching departments", type: "error" });
    } finally {
      setDeptLoading(false);
    }
  };

  // Handle department form submission (Create/Update)
  const handleDeptSubmit = async (e) => {
    e.preventDefault();
    if (!deptInput.trim()) {
      setDeptMessage({ text: "Please enter a department name", type: "error" });
      return;
    }

    try {
      if (editingDept) {
        // Update existing department
        const response = await axios.put(
          `http://localhost:8080/api/department/${editingDept.departmentId}`,
          {
            name: deptInput,
            active: true,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (response.data.success) {
          setDeptMessage({
            text: "Department updated successfully!",
            type: "success",
          });
        } else {
          setDeptMessage({
            text: response.data.message || "Failed to update department",
            type: "error",
          });
          return;
        }
      } else {
        // Create new department
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
          setDeptMessage({
            text: "Department added successfully!",
            type: "success",
          });
        } else {
          setDeptMessage({
            text: response.data.message || "Failed to add department",
            type: "error",
          });
          return;
        }
      }

      // Reset form and refresh list
      setDeptInput("");
      setEditingDept(null);
      setTimeout(() => {
        setDeptMessage({ text: "", type: "" });
      }, 3000);
      fetchDepartments();
    } catch (error) {
      console.error("Error saving department:", error);
      setDeptMessage({
        text: error.response?.data?.message || "Error saving department",
        type: "error",
      });
    }
  };

  // Delete department
  const deleteDepartment = async (departmentId) => {
    if (window.confirm("Are you sure you want to delete this department?")) {
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
          setDeptMessage({
            text: "Department deleted successfully!",
            type: "success",
          });
          fetchDepartments();
        } else {
          setDeptMessage({
            text: response.data.message || "Failed to delete department",
            type: "error",
          });
        }

        setTimeout(() => {
          setDeptMessage({ text: "", type: "" });
        }, 3000);
      } catch (error) {
        console.error("Error deleting department:", error);
        setDeptMessage({
          text: error.response?.data?.message || "Error deleting department",
          type: "error",
        });
      }
    }
  };

  // Toggle department active status
  const toggleDepartmentStatus = async (departmentId, currentStatus) => {
    try {
      const response = await axios.put(
        `http://localhost:8080/api/department/${departmentId}`,
        {
          active: !currentStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data.success) {
        setDeptMessage({
          text: `Department ${!currentStatus ? "activated" : "deactivated"} successfully!`,
          type: "success",
        });
        fetchDepartments();
      } else {
        setDeptMessage({
          text: response.data.message || "Failed to update status",
          type: "error",
        });
      }

      setTimeout(() => {
        setDeptMessage({ text: "", type: "" });
      }, 3000);
    } catch (error) {
      console.error("Error updating department status:", error);
      setDeptMessage({
        text: error.response?.data?.message || "Error updating status",
        type: "error",
      });
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
          },
        },
      );

      if (response.data) {
        setUserProfile(response.data);
        setProfileData({
          prn: response.data.data.prn || user?.prn || "",
          fullName: response.data.data.fullName || "",
          department: response.data.data.department || "",
          year: response.data.data.year || "",
          phoneNumber: response.data.data.phoneNumber || "",
        });

        fetchProfileImage();
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setUserProfile(null);
      setProfileData((prev) => ({
        ...prev,
        prn: user?.prn || "",
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
          responseType: "blob",
        },
      );

      if (response.data) {
        const imageUrl = URL.createObjectURL(response.data);
        setImagePreview(imageUrl);
      }
    } catch (error) {
      console.error("Error fetching profile image:", error);
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

  // const handleSubmitProfile = async (e) => {
  //   e.preventDefault();
  //   setProfileLoading(true);
  //   setMessage({ text: "", type: "" });

  //   // Validation
  //   if (!profileData.prn || !profileData.fullName || !profileData.department ||
  //       !profileData.year || !profileData.phoneNumber) {
  //     setMessage({ text: "Please fill all required fields", type: "error" });
  //     setProfileLoading(false);
  //     return;
  //   }

  //   try {
  //     if (userProfile) {
  //       const requestData = {
  //         fullName: profileData.fullName,
  //         department: profileData.department,
  //         year: profileData.year,
  //         phoneNumber: profileData.phoneNumber
  //       }
  //       await axios.put(
  //         `http://localhost:8080/api/profiles/${profileData.prn}`,
  //         requestData,
  //         {
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //             'Content-Type': 'application/json'
  //           }
  //         }
  //       );
  //       setMessage({ text: "Profile updated successfully!", type: "success" });
  //     } else {
  //       await axios.post(
  //         "http://localhost:8080/api/profiles",
  //         profileData,
  //         {
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //             'Content-Type': 'application/json'
  //           }
  //         }
  //       );
  //       setMessage({ text: "Profile created successfully!", type: "success" });
  //     }

  //     if (selectedImage) {
  //       const formData = new FormData();
  //       formData.append('image', selectedImage);

  //       await axios.post(
  //         `http://localhost:8080/api/profiles/${profileData.prn}/image`,
  //         formData,
  //         {
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //             'Content-Type': 'multipart/form-data'
  //           }
  //         }
  //       );
  //     }

  //     await fetchUserProfile();

  //     setTimeout(() => {
  //       setShowProfileForm(false);
  //       setMessage({ text: "", type: "" });
  //     }, 1500);
  //   } catch (error) {
  //     console.error("Error saving profile:", error);
  //     setMessage({ text: "Error saving profile. Please try again.", type: "error" });
  //   } finally {
  //     setProfileLoading(false);
  //   }
  // };
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
      setMessage("Error saving profile.");
    } finally {
      setProfileLoading(false);
    }
  };
  const StatCard = ({ title, count, color, icon: Icon }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer group">
      <div
        className={`p-4 rounded-xl bg-${color}-50 text-${color}-600 flex-shrink-0 transition-all duration-300 group-hover:scale-110`}
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

  const BigActionButton = ({ label, color, icon: Icon, onClick }) => (
    <button
      onClick={onClick}
      className={`group flex flex-col items-center justify-center p-8 rounded-3xl transition-all duration-300 bg-white border-2 border-gray-100 hover:bg-${color}-50 hover:shadow-xl min-h-[160px] hover:-translate-y-2`}
    >
      <div
        className={`p-5 rounded-2xl bg-${color}-50 text-${color}-600 mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm`}
      >
        <Icon className="w-8 h-8" />
      </div>
      <span
        className={`text-lg font-bold text-gray-700 group-hover:text-${color}-700 transition-colors text-center px-2`}
      >
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
            src={
              imagePreview ||
              `https://ui-avatars.com/api/?name=${profileData.fullName || currentUser.username}&background=7c3aed&color=fff`
            }
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
              src={
                imagePreview ||
                `https://ui-avatars.com/api/?name=${profileData.fullName || currentUser.username}&background=7c3aed&color=fff`
              }
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
              {/* <div className="flex flex-col group cursor-pointer">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 group-hover:text-purple-600 transition-colors">
                  Year
                </span>
                <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900 transition-colors">
                  {profileData.year || "Not set"}
                </span>
              </div> */}
            </div>
            <div className="flex flex-col group cursor-pointer">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 group-hover:text-purple-600 transition-colors">
                Department
              </span>
              <span className="text-sm font-bold text-gray-700 break-words group-hover:text-gray-900 transition-colors">
                {profileData.department || "Not set"}
              </span>
            </div>
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between group cursor-pointer">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-purple-600 transition-colors">
                Status
              </span>
              <span className="flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md group-hover:bg-emerald-100 transition-all duration-200 group-hover:scale-105">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-pulse"></div>
                {currentUser.verified ? "ACTIVE" : "INACTIVE"}
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
            <StatCard
              title="Total Users"
              count={users.length}
              color="purple"
              icon={Users}
            />
            <StatCard
              title="Faculty"
              count={stats.TEACHERS || 0}
              color="blue"
              icon={Briefcase}
            />
            <StatCard
              title="Club Admins"
              count={stats.CLUB_ADMIN || 0}
              color="emerald"
              icon={ShieldCheck}
            />
            <StatCard
              title="Regular"
              count={stats.USERS || 0}
              color="orange"
              icon={User}
            />
          </div>

          {/* Control Center */}
          {/* Control Center */}
<section>
  <div className="flex items-center space-x-4 mb-8">
    <h3 className="text-2xl font-black text-gray-800 tracking-tight whitespace-nowrap">
      Control Center
    </h3>
    <div className="flex-1 h-[2px] bg-gradient-to-r from-gray-200 via-purple-200 to-gray-200 rounded-full"></div>
  </div>

  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    <BigActionButton
      label="Manage Users"
      color="purple"
      icon={Users}
      onClick={() => (window.location.href = "/manage-users")}
    />
    <BigActionButton
      label="Events"
      color="emerald"
      icon={CalendarDays}
      onClick={() => alert("Events feature")}
    />

    {/* Create Event button - Updated */}
    <BigActionButton
      label="Create Event"
      color="indigo"
      icon={CalendarPlus}
      onClick={() => (window.location.href = "/create-event")}
    />

    {/* Department CRUD button */}
    <BigActionButton
      label="Departments"
      color="pink"
      icon={Database}
      onClick={() => {
        fetchDepartments();
        setShowDeptModal(true);
      }}
    />

    <BigActionButton
      label="Manage Clubs"
      color="cyan"
      icon={Database}
      onClick={() => (window.location.href = "/manage-clubs")}
    />
    <BigActionButton
      label="Club Admins"
      color="orange"
      icon={ShieldCheck}
      onClick={() => (window.location.href = "/club-admins")}
    />
    <BigActionButton
      label="Add Student"
      color="blue"
      icon={UserPlus}
      onClick={() => (window.location.href = "/add-users-with-club")}
    />
    <BigActionButton
      label="Club Association"
      color="cyan"
      icon={Building2}
      onClick={() =>
        (window.location.href = "/remove-users-from-any-club")
      }
    />
    <BigActionButton
      label="Audit Logs"
      color="slate"
      icon={Database}
      onClick={() => alert("Audit Logs feature")}
    />
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
                  {userProfile ? "Edit Profile" : "Complete Profile"}
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
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  <img
                    src={
                      imagePreview ||
                      `https://ui-avatars.com/api/?name=${profileData.fullName || currentUser.username}&background=7c3aed&color=fff&size=128`
                    }
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
                <p className="text-sm text-gray-500 mt-2">
                  Click camera to upload photo
                </p>
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
                  className={`w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${userProfile ? "bg-gray-100 cursor-not-allowed" : ""}`}
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Department <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="department"
                  value={profileData.department}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="e.g., Computer Science"
                  required
                />
              </div>

              {/* <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Year <span className="text-red-500">*</span></label>
                <select
                  name="year" value={profileData.year} onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  required
                >
                  <option value="">Select Year</option>
                  <option value="1">First Year</option>
                  <option value="2">Second Year</option>
                  <option value="3">Third Year</option>
                  <option value="4">Fourth Year</option>
                </select>
              </div> */}

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
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-xl font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50"
                >
                  {profileLoading
                    ? "Saving..."
                    : userProfile
                      ? "Update Profile"
                      : "Create Profile"}
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
            <div className="bg-purple-600 p-8 text-white flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold tracking-tight">
                  Department Management
                </h3>
                <p className="text-purple-100 text-sm opacity-90">
                  Add or remove academic departments
                </p>
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
              {/* Status message */}
              {deptMessage.text && (
                <div
                  className={`mb-6 p-4 rounded-xl ${deptMessage.type === "error" ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"}`}
                >
                  <p className="text-sm font-semibold flex items-center gap-2">
                    {deptMessage.type === "success" ? "✓" : "⚠"}{" "}
                    {deptMessage.text}
                  </p>
                </div>
              )}

              {/* Form to add/edit department */}
              <form onSubmit={handleDeptSubmit} className="mb-8">
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Enter department name..."
                    className="flex-1 px-4 py-3 border-2 border-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                    value={deptInput}
                    onChange={(e) => setDeptInput(e.target.value)}
                    required
                  />
                  <button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap shadow-lg shadow-purple-100 cursor-pointer"
                  >
                    {editingDept ? <Edit size={18} /> : <Plus size={18} />}
                    {editingDept ? "Update Dept" : "Add Dept"}
                  </button>
                </div>
                {editingDept && (
                  <div className="mt-2 text-sm text-gray-500 flex items-center gap-2">
                    <span>
                      Editing:{" "}
                      <span className="font-bold">{editingDept.name}</span>
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

              {/* List of departments */}
              {deptLoading ? (
                <div className="py-10 text-center text-gray-500 italic">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-3"></div>
                  Loading departments...
                </div>
              ) : (
                <div className="space-y-3">
                  {departments.length > 0 ? (
                    departments.map((dept) => (
                      <div
                        key={dept.departmentId}
                        className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50/30 transition-all group cursor-pointer"
                        onClick={() => {
                          // Optional: Add click handler if you want the whole card to be clickable
                          // For now, just to show the cursor
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-gray-700">
                            {dept.name}
                          </span>
                          <span
                            className={`text-xs font-bold px-2 py-1 rounded-full ${dept.active ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}
                          >
                            {dept.active ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent triggering the parent onClick
                              deleteDepartment(dept.departmentId);
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
                      <p className="text-gray-400 font-medium">
                        No departments found in system.
                      </p>
                      <p className="text-sm text-gray-300 mt-1">
                        Add a department using the form above
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                {departments.length} department
                {departments.length !== 1 ? "s" : ""}
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
    </div>
  );
}
