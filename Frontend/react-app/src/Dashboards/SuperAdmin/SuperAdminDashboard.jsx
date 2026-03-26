

import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ConfirmDialog from "../../components/ConfirmDialog";
import ThemedScrollbarStyles from "../../components/ThemedScrollbarStyles";
import ThemeToggle from "../../components/ThemeToggle";
import { useTheme } from "../../contexts/ThemeContext";
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
  Bell,
  Moon,
  Sun,
} from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_URL || "http://72.155.88.211:8080";

export default function SuperAdminDashboard() {
  const navigate = useNavigate();

  // Light mode colors (existing)
  const LIGHT_PRIMARY_COLOR = "#4CA1AF";
  const LIGHT_PRIMARY_DARK = "#2d8391";
  const LIGHT_PRIMARY_LIGHT = "rgba(76, 161, 175, 0.1)";
  const LIGHT_PRIMARY_GRADIENT = "linear-gradient(135deg, #4CA1AF 0%, #2c7a8a 100%)";
  
  const LIGHT_BG_MAIN = "#f5faff";
  const LIGHT_BG_GRADIENT = "linear-gradient(135deg, #f5faff 0%, #f0f8ff 100%)";
  const LIGHT_BG_SIDEBAR = "#ffffff";
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
  
  const DARK_BG_MAIN = "#343541"; // ChatGPT main bg
  const DARK_BG_GRADIENT = "linear-gradient(135deg, #343541 0%, #2A2B36 100%)";
  const DARK_BG_SIDEBAR = "#202123"; // ChatGPT sidebar
  const DARK_BG_CARD = "#444654"; // ChatGPT card bg
  const DARK_BORDER_COLOR = "#4D4F5E";
  const DARK_BORDER_COLOR_HOVER = "#5E5F70";
  const DARK_TEXT_PRIMARY = "#ECECF1"; // ChatGPT primary text
  const DARK_TEXT_SECONDARY = "#C5C5D2"; // ChatGPT secondary text
  const DARK_TEXT_MUTED = "#9B9CA9"; // ChatGPT muted text
  const DARK_ACCENT_SOFT = "rgba(255, 255, 255, 0.05)";

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const { isDarkMode } = useTheme();

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
  const [clubAdmins, setCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
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

  // Get current theme colors
  const theme = {
    primaryColor: isDarkMode ? DARK_PRIMARY_COLOR : LIGHT_PRIMARY_COLOR,
    primaryDark: isDarkMode ? DARK_PRIMARY_DARK : LIGHT_PRIMARY_DARK,
    primaryLight: isDarkMode ? DARK_PRIMARY_LIGHT : LIGHT_PRIMARY_LIGHT,
    primaryGradient: isDarkMode ? DARK_PRIMARY_GRADIENT : LIGHT_PRIMARY_GRADIENT,
    bgMain: isDarkMode ? DARK_BG_MAIN : LIGHT_BG_MAIN,
    bgGradient: isDarkMode ? DARK_BG_GRADIENT : LIGHT_BG_GRADIENT,
    bgSidebar: isDarkMode ? DARK_BG_SIDEBAR : LIGHT_BG_SIDEBAR,
    bgCard: isDarkMode ? DARK_BG_CARD : LIGHT_BG_CARD,
    borderColor: isDarkMode ? DARK_BORDER_COLOR : LIGHT_BORDER_COLOR,
    borderColorHover: isDarkMode ? DARK_BORDER_COLOR_HOVER : LIGHT_BORDER_COLOR_HOVER,
    textPrimary: isDarkMode ? DARK_TEXT_PRIMARY : LIGHT_TEXT_PRIMARY,
    textSecondary: isDarkMode ? DARK_TEXT_SECONDARY : LIGHT_TEXT_SECONDARY,
    textMuted: isDarkMode ? DARK_TEXT_MUTED : LIGHT_TEXT_MUTED,
    accentSoft: isDarkMode ? DARK_ACCENT_SOFT : LIGHT_ACCENT_SOFT,
    isDarkMode: isDarkMode,
  };

  const closeConfirm = () =>
    setConfirmDialog((prev) => ({ ...prev, isOpen: false }));

  // Save theme preference to localStorage
  useEffect(() => {
    localStorage.setItem("superAdminDashboardTheme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  useEffect(() => {
    if(token){
      fetchUserCount();
      fetchAllData();
      fetchUserProfile();
      fetchUnread();
      fetchProfileImage();
    }
  }, [token]);

  useEffect(() => {
    const handleFocus = () => {
      fetchUnread();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [token]);

  // Refresh image when profile form is closed
  useEffect(() => {
    if (!showProfileForm && token && user?.prn) {
      fetchProfileImage();
    }
  }, [showProfileForm, token, user?.prn]);

  const fetchUserCount = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/user-clubs/getAllByRole/CLUB_ADMIN`,
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

  const fetchUnread = async () => {
    if (!token) {
      setUnreadCount(0);
      return;
    }

    try {
      const res = await axios.get(
        `${BASE_URL}/api/notification/me/unread-count`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const count =
        typeof res.data === "number"
          ? res.data
          : (res.data?.data ?? res.data?.count ?? 0);

      setUnreadCount(Number(count) || 0);
    } catch {
      setUnreadCount(0);
    }
  };

  const fetchAllData = async () => {
    try {
      const usersResponse = await axios.get(`${BASE_URL}/api/users/`, {
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
      const response = await axios.get(`${BASE_URL}/api/department`, {
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
          `${BASE_URL}/api/department/${editingDept.departmentId}`,
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
          `${BASE_URL}/api/department/${deptInput}`,
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
        `${BASE_URL}/api/department/${departmentId}`,
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
        `${BASE_URL}/api/profiles/prn/${user?.prn}`,
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
    if (!token || !user?.prn) {
      console.log("No token or PRN available");
      return;
    }

    try {
      const response = await axios.get(
        `${BASE_URL}/api/profiles/${user.prn}/image`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
        }
      );

      if (response.status === 200 && response.data) {
        // Clean up previous object URL to prevent memory leaks
        if (imagePreview) {
          URL.revokeObjectURL(imagePreview);
        }
        
        const imageUrl = URL.createObjectURL(response.data);
        setImagePreview(imageUrl);
      }

    } catch (error) {
      console.log("Error fetching profile image:", error.message);
      
      if (error.response?.status === 404) {
        console.log("No profile image uploaded yet");
      } else if (error.response?.status === 401) {
        console.log("Unauthorized request. Token missing or expired.");
      }
      
      setImagePreview(null);
    }
  };

  const handleVerificationRedirect = () => {
    localStorage.setItem("verificationEmail", currentUser.email);
    localStorage.setItem("verificationPRN", currentUser.prn);
    navigate("/verifyotp");
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
          `${BASE_URL}/api/profiles/${profileData.prn}`,
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
          `${BASE_URL}/api/profiles`,
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
          `${BASE_URL}/api/profiles/${profileData.prn}/image`,
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
        `${BASE_URL}/api/users/changeEmail/${currentUser.prn}/${encodeURIComponent(newEmail)}`,
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
  };

  const StatCard = ({ title, count, icon: Icon, bgColor, iconColor }) => (
    <div 
      className="p-6 rounded-2xl flex items-center space-x-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer group"
      style={{ 
        background: theme.bgCard,
        border: `1px solid ${theme.borderColor}`,
        boxShadow: isDarkMode ? 'none' : "0 4px 12px rgba(76, 161, 175, 0.05)"
      }}
    >
      <div
        className="p-4 rounded-xl flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
        style={{ backgroundColor: isDarkMode ? theme.accentSoft : (bgColor || theme.primaryLight), color: iconColor || theme.primaryColor }}
      >
        <Icon className="w-7 h-7" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold uppercase tracking-wider truncate" style={{ color: theme.textSecondary }}>
          {title}
        </p>
        <p className="text-3xl font-bold" style={{ color: theme.textPrimary }}>{count}</p>
      </div>
    </div>
  );

  const BigActionButton = ({ label, icon: Icon, onClick, bgColor, iconColor }) => (
    <button
      onClick={onClick}
      className="group flex flex-col items-center justify-center p-8 rounded-3xl transition-all duration-300 min-h-[160px] hover:-translate-y-2 hover:shadow-xl cursor-pointer w-full"
      style={{ 
        background: theme.bgCard,
        border: `1px solid ${theme.borderColor}`,
        boxShadow: isDarkMode ? 'none' : "0 4px 12px rgba(76, 161, 175, 0.03)"
      }}
    >
      <div
        className="p-5 rounded-2xl mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
        style={{ backgroundColor: isDarkMode ? theme.accentSoft : (bgColor || theme.primaryLight), color: iconColor || theme.primaryColor }}
      >
        <Icon className="w-8 h-8" />
      </div>
      <span className="text-lg font-bold transition-colors text-center px-2" style={{ color: theme.textPrimary }}>
        {label}
      </span>
    </button>
  );

  const NotificationActionButton = () => (
    <button
      onClick={() => navigate("/notifications")}
      className="group flex flex-col items-center justify-center p-8 rounded-3xl transition-all duration-300 min-h-[160px] hover:-translate-y-2 hover:shadow-xl cursor-pointer relative w-full"
      style={{ 
        background: theme.bgCard,
        border: `1px solid ${theme.borderColor}`,
        boxShadow: isDarkMode ? 'none' : "0 4px 12px rgba(76, 161, 175, 0.03)"
      }}
    >
      <div
        className="relative p-5 rounded-2xl mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
        style={{ backgroundColor: isDarkMode ? theme.accentSoft : theme.primaryLight, color: theme.primaryColor }}
      >
        <Bell className="w-8 h-8" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-md">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </div>
      <span className="text-lg font-bold transition-colors text-center px-2" style={{ color: theme.textPrimary }}>
        Notifications
      </span>
    </button>
  );

  if (loading || isLoadingProfile) {
    return (
      <>
        <ThemedScrollbarStyles isDarkMode={isDarkMode} className="theme-scrollbar" includePageScrollbar />
        <div 
          className="min-h-screen flex items-center justify-center transition-colors duration-300"
          style={{ background: theme.bgGradient }}
        >
          <div className="text-center p-8 rounded-2xl" style={{ background: theme.bgCard, border: `1px solid ${theme.borderColor}` }}>
            <div
              className="animate-spin rounded-full h-16 w-16 border-b-2 mx-auto mb-4 cursor-wait"
              style={{ borderColor: theme.primaryColor }}
            ></div>
            <p className="font-semibold" style={{ color: theme.textSecondary }}>Loading dashboard...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ThemedScrollbarStyles isDarkMode={isDarkMode} className="theme-scrollbar" includePageScrollbar />
      <div 
        className="min-h-screen flex relative transition-colors duration-300"
        style={{ background: theme.bgGradient }}
      >
        {/* Decorative light elements - only show in light mode */}
        {!isDarkMode && (
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-64 h-64 bg-white/40 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/40 rounded-full blur-3xl"></div>
          </div>
        )}

        {/* Mobile Header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-50 px-4 py-4 flex items-center justify-between shadow-sm backdrop-blur-sm"
          style={{ 
            background: isDarkMode ? 'rgba(32, 33, 35, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            borderBottom: `1px solid ${theme.borderColor}`
          }}
        >
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl transition-all duration-200 hover:scale-105 cursor-pointer"
            style={{ color: theme.textSecondary }}
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center space-x-2">
            <div
              className="p-2 rounded-lg transition-transform hover:scale-105 cursor-pointer"
              style={{ background: theme.primaryGradient }}
            >
              <LayoutDashboard className="text-white w-5 h-5" />
            </div>
            <h2 className="text-xl font-black tracking-tight" style={{ color: theme.textPrimary }}>
              Super<span style={{ color: theme.primaryColor }}>Admin</span>
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div
              className="w-10 h-10 rounded-full overflow-hidden border-2 transition-all hover:scale-105 cursor-pointer"
              style={{ borderColor: theme.primaryLight }}
              onClick={() => setShowProfileForm(true)}
            >
              <img
                src={
                  imagePreview ||
                  `https://ui-avatars.com/api/?name=${
                    encodeURIComponent(profileData.fullName || currentUser.username || 'User')
                  }&background=${isDarkMode ? '10A37F' : '4CA1AF'}&color=fff&size=128&bold=true&length=2&font-size=0.50`
                }
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.username || 'User')}&background=${isDarkMode ? '10A37F' : '4CA1AF'}&color=fff&size=128&bold=true&length=2&font-size=0.50`;
                }}
                alt={profileData.fullName || currentUser.username || "Profile"}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 cursor-pointer"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed lg:sticky top-0 left-0 h-screen
            w-80 sm:w-96
            flex flex-col p-8
            transition-transform duration-300 ease-in-out z-50
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            overflow-y-auto theme-scrollbar
          `}
          style={{ 
            background: theme.bgSidebar,
            borderRight: `1px solid ${theme.borderColor}`,
            boxShadow: isDarkMode ? 'none' : "4px 0 20px rgba(76, 161, 175, 0.05)"
          }}
        >
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden absolute top-4 right-4 p-2 rounded-xl transition-all duration-200 hover:rotate-90 cursor-pointer"
            style={{ color: theme.textSecondary }}
          >
            <X size={20} />
          </button>

          <div className="flex items-center space-x-3 mb-10 group cursor-pointer">
            <div
              className="p-2.5 rounded-xl shadow-lg transition-all duration-300 group-hover:scale-105 cursor-pointer"
              style={{
                background: theme.primaryGradient,
                boxShadow: `0 10px 15px -3px ${theme.primaryColor}30`,
              }}
            >
              <LayoutDashboard className="text-white" size={24} />
            </div>
            <h2 className="text-2xl font-black tracking-tight" style={{ color: theme.textPrimary }}>
              Super<span style={{ color: theme.primaryColor }}>Admin</span>
            </h2>
          </div>

          <div className="flex flex-col items-center text-center mb-8">
            <div
              className="relative p-1 rounded-3xl mb-4 transition-all duration-300 hover:shadow-lg cursor-pointer"
              style={{
                border: `2px solid ${theme.primaryLight}`,
                boxShadow: `0 10px 15px -3px ${theme.primaryColor}20`,
              }}
            >
              <img
                src={
                  imagePreview ||
                  `https://ui-avatars.com/api/?name=${
                    encodeURIComponent(profileData.fullName || currentUser.username || 'User')
                  }&background=${isDarkMode ? '10A37F' : '4CA1AF'}&color=fff&size=128&bold=true&length=2&font-size=0.50`
                }
                alt="Profile"
                className="w-32 h-32 rounded-[2rem] object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.username || 'User')}&background=${isDarkMode ? '10A37F' : '4CA1AF'}&color=fff&size=128&bold=true&length=2&font-size=0.50`;
                }}
              />
              <button
                onClick={() => setShowProfileForm(true)}
                className="absolute -bottom-1 -right-1 p-2 rounded-xl shadow-lg transition-all duration-200 hover:scale-110 cursor-pointer"
                style={{ background: theme.primaryColor, color: 'white' }}
              >
                <Edit size={16} />
              </button>
            </div>
            <h3 className="font-bold text-xl tracking-tight" style={{ color: theme.textPrimary }}>
              {profileData.fullName || currentUser.username}
            </h3>
            <p
              className="text-[10px] font-black px-3 py-1 rounded-full mt-2 uppercase tracking-[0.1em] transition-colors cursor-pointer"
              style={{ color: theme.primaryColor, backgroundColor: theme.primaryLight }}
            >
              {currentUser.role.replace("_", " ")}
            </p>
          </div>

          <nav className="space-y-2 flex-1 overflow-y-auto theme-scrollbar">
            <div 
              className="p-6 rounded-2xl space-y-4 transition-all duration-300 hover:shadow-md"
              style={{ 
                background: theme.accentSoft,
                border: `1px solid ${theme.borderColor}`,
              }}
            >
              <div className="flex flex-col group cursor-pointer">
                <span className="text-[10px] font-bold uppercase tracking-widest mb-1 transition-colors" style={{ color: theme.textMuted }}>
                  Full Name
                </span>
                <span className="text-sm font-bold break-words transition-colors" style={{ color: theme.textPrimary }}>
                  {profileData.fullName || "Not set"}
                </span>
              </div>
              <div className="flex flex-col group cursor-pointer">
                <span className="text-[10px] font-bold uppercase tracking-widest mb-1 transition-colors" style={{ color: theme.textMuted }}>
                  Username
                </span>
                <span className="text-sm font-bold break-words transition-colors" style={{ color: theme.textPrimary }}>
                  {currentUser.username}
                </span>
              </div>

              {/* Email field with both edit and verify buttons */}
              <div className="flex flex-col group cursor-pointer relative">
                <span className="text-[10px] font-bold uppercase tracking-widest mb-1 transition-colors" style={{ color: theme.textMuted }}>
                  Email
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold break-all pr-2" style={{ color: theme.textPrimary }}>
                    {currentUser.email}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setNewEmail(currentUser.email);
                        setShowEmailEditModal(true);
                      }}
                      className="p-1.5 rounded-lg transition-all duration-200 hover:scale-110 flex-shrink-0 cursor-pointer"
                      style={{ color: theme.primaryColor, background: `${theme.primaryColor}10` }}
                      title="Edit email"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={handleVerificationRedirect}
                      disabled={verificationStatus}
                      className={`p-1.5 rounded-lg transition-all duration-200 flex-shrink-0 flex items-center gap-1 ${
                        verificationStatus
                          ? "text-green-600 bg-green-50 cursor-not-allowed opacity-70"
                          : "text-amber-600 bg-amber-50 hover:scale-110 cursor-pointer"
                      }`}
                      title={verificationStatus ? "Already verified" : "Click to verify"}
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
                <span className="text-[10px] font-bold uppercase tracking-widest mb-1 transition-colors" style={{ color: theme.textMuted }}>
                  Phone
                </span>
                <span className="text-sm font-bold transition-colors" style={{ color: theme.textPrimary }}>
                  {profileData.phoneNumber || "Not set"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col group cursor-pointer">
                  <span className="text-[10px] font-bold uppercase tracking-widest mb-1 transition-colors" style={{ color: theme.textMuted }}>
                    PRN
                  </span>
                  <span className="text-sm font-bold break-words transition-colors" style={{ color: theme.textPrimary }}>
                    {profileData.prn || "Not set"}
                  </span>
                </div>
              </div>
              <div className="pt-2 border-t flex items-center justify-between group cursor-pointer" style={{ borderColor: theme.borderColor }}>
                <span className="text-[10px] font-bold uppercase tracking-widest transition-colors" style={{ color: theme.textMuted }}>
                  Status
                </span>
                <span
                  className={`flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md group-hover:scale-105 transition-all duration-200 cursor-pointer ${
                    currentUser.verified
                      ? "text-emerald-600 bg-emerald-50"
                      : "text-amber-600 bg-amber-50"
                  }`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full mr-1.5 ${currentUser.verified ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`}
                  ></div>
                  {currentUser.verified ? "ACTIVE" : "PENDING"}
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
            className="mt-6 flex items-center justify-center space-x-3 w-full py-4 rounded-2xl transition-all duration-200 font-bold text-sm border hover:shadow-md hover:scale-[1.02] cursor-pointer"
            style={{ 
              color: '#ef4444',
              background: theme.bgCard,
              borderColor: theme.borderColor,
            }}
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 w-full pt-20 lg:pt-0 px-6 lg:px-10 pb-10 relative z-10">
          <div className="max-w-7xl mx-auto">
            <header className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-12 pt-10">
              <div>
                <h1 className="text-4xl font-black tracking-tight mb-2" style={{ color: theme.textPrimary }}>
                  Dashboard
                </h1>
                <p className="text-base font-medium" style={{ color: theme.textSecondary }}>
                  Welcome back,{" "}
                  <span className="font-bold" style={{ color: theme.primaryColor }}>
                    {currentUser.username}
                  </span>
                  . System is healthy.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <div
                  className="flex items-center space-x-3 px-5 py-2.5 rounded-2xl border shadow-sm self-start transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
                  style={{ 
                    background: isDarkMode ? theme.accentSoft : '#ecfdf5',
                    borderColor: isDarkMode ? theme.borderColor : '#bbf7d0',
                    color: isDarkMode ? theme.textSecondary : '#059669'
                  }}
                >
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-black uppercase tracking-wider">
                    All Systems Live
                  </span>
                </div>
              </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-16">
              <StatCard
                title="Total Users"
                count={users.length}
                icon={Users}
                bgColor={theme.primaryLight}
                iconColor={theme.primaryColor}
              />
              <StatCard
                title="Faculty"
                count={stats.FACULTY || 0}
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
                <h3 className="text-2xl font-black tracking-tight whitespace-nowrap" style={{ color: theme.textPrimary }}>
                  Control Center
                </h3>
                <div
                  className="flex-1 h-[2px] rounded-full"
                  style={{
                    background: `linear-gradient(to right, ${theme.borderColor}, ${theme.primaryColor}, ${theme.borderColor})`,
                  }}
                ></div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <BigActionButton
                  label="Manage Users"
                  icon={Users}
                  onClick={() => navigate("/manage-users")}
                  bgColor={theme.primaryLight}
                  iconColor={theme.primaryColor}
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
                <NotificationActionButton />
              </div>
            </section>
          </div>
        </main>

        {/* Profile Form Modal */}
        {showProfileForm && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto theme-scrollbar">
            <div className="rounded-2xl shadow-2xl w-full max-w-md overflow-hidden my-4"
              style={{ background: theme.bgCard, border: `1px solid ${theme.borderColor}` }}
            >
              {/* Header */}
              <div
                className="p-6 text-white flex items-center justify-between"
                style={{ background: theme.primaryGradient }}
              >
                <h2 className="text-xl font-bold">
                  {userProfile ? "Edit Profile" : "Complete Profile"}
                </h2>
                <button
                  onClick={() => {
                    setShowProfileForm(false);
                    setMessage({ text: "", type: "" });
                  }}
                  className="p-1 hover:bg-white/20 rounded-lg transition-all cursor-pointer"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmitProfile} className="p-6 space-y-5">
                {/* Photo Upload */}
                <div className="text-center mb-6">
                  <div className="relative inline-block group">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 shadow-md transition-transform group-hover:scale-105"
                      style={{ borderColor: theme.primaryLight }}
                    >
                      <img
                        src={
                          imagePreview ||
                          `https://ui-avatars.com/api/?name=${
                            encodeURIComponent(profileData.fullName || currentUser.username || 'User')
                          }&background=${isDarkMode ? '10A37F' : '4CA1AF'}&color=fff&size=128&bold=true&length=2&font-size=0.50`
                        }
                        alt="Profile"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.username || 'User')}&background=${isDarkMode ? '10A37F' : '4CA1AF'}&color=fff&size=128&bold=true&length=2&font-size=0.50`;
                        }}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <label
                      className="absolute bottom-0 right-0 p-2 rounded-full shadow-lg cursor-pointer hover:shadow-xl transition-all"
                      style={{ background: theme.primaryColor, color: 'white' }}
                      title="Change photo"
                    >
                      <Camera size={16} />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-xs mt-2" style={{ color: theme.textMuted }}>Upload photo</p>
                </div>

                {/* PRN Field */}
                <div>
                  <label className="block text-xs font-semibold mb-1.5 uppercase" style={{ color: theme.textSecondary }}>PRN</label>
                  <input
                    type="text"
                    value={profileData.prn}
                    readOnly
                    className="w-full px-3 py-2 rounded-lg text-sm cursor-not-allowed"
                    style={{ 
                      background: theme.accentSoft,
                      border: `1px solid ${theme.borderColor}`,
                      color: theme.textSecondary
                    }}
                  />
                </div>

                {/* Full Name Field */}
                <div>
                  <label className="block text-xs font-semibold mb-1.5 uppercase" style={{ color: theme.textSecondary }}>Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={profileData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your name"
                    className="w-full px-3 py-2 rounded-lg text-sm transition-all"
                    style={{ 
                      background: theme.bgCard,
                      border: `1px solid ${theme.borderColor}`,
                      color: theme.textPrimary
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = theme.primaryColor;
                      e.target.style.boxShadow = `0 0 0 3px ${theme.primaryColor}20`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = theme.borderColor;
                      e.target.style.boxShadow = "none";
                    }}
                    required
                  />
                </div>

                {/* Phone Field */}
                <div>
                  <label className="block text-xs font-semibold mb-1.5 uppercase" style={{ color: theme.textSecondary }}>Phone *</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={profileData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="9876543210"
                    className="w-full px-3 py-2 rounded-lg text-sm transition-all"
                    style={{ 
                      background: theme.bgCard,
                      border: `1px solid ${theme.borderColor}`,
                      color: theme.textPrimary
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = theme.primaryColor;
                      e.target.style.boxShadow = `0 0 0 3px ${theme.primaryColor}20`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = theme.borderColor;
                      e.target.style.boxShadow = "none";
                    }}
                    required
                  />
                </div>

                {/* Message */}
                {message.text && (
                  <div
                    className={`p-3 rounded-lg text-sm font-medium border ${
                      message.type === "error"
                        ? "bg-red-50 text-red-700 border-red-200"
                        : "bg-green-50 text-green-700 border-green-200"
                    }`}
                  >
                    {message.text}
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileForm(false);
                      setMessage({ text: "", type: "" });
                    }}
                    className="flex-1 px-4 py-2 rounded-lg font-semibold text-sm transition-colors cursor-pointer"
                    style={{ 
                      background: theme.accentSoft,
                      border: `1px solid ${theme.borderColor}`,
                      color: theme.textSecondary
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="flex-1 px-4 py-2 text-white rounded-lg font-semibold text-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: profileLoading ? `${theme.primaryColor}80` : theme.primaryColor }}
                  >
                    {profileLoading ? "Saving..." : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Department CRUD Modal */}
        {showDeptModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 z-50">
            <div className="rounded-2xl sm:rounded-[2.5rem] shadow-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[85vh] overflow-hidden flex flex-col"
              style={{ background: theme.bgCard, border: `1px solid ${theme.borderColor}` }}
            >
              <div
                className="p-5 sm:p-8 text-white flex justify-between items-center"
                style={{ background: theme.primaryGradient }}
              >
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight truncate">Department Management</h3>
                  <p className="text-white/80 text-xs sm:text-sm truncate">Add or remove academic departments</p>
                </div>
                <button
                  onClick={() => {
                    setShowDeptModal(false);
                    setEditingDept(null);
                    setDeptInput("");
                    setDeptMessage({ text: "", type: "" });
                  }}
                  className="bg-white/20 p-1.5 sm:p-2 rounded-xl hover:bg-white/30 transition-all duration-200 hover:rotate-90 cursor-pointer flex-shrink-0"
                >
                  <X size={18} className="sm:w-5 sm:h-5" />
                </button>
              </div>

              <div className="p-4 sm:p-8 flex-1 overflow-y-auto theme-scrollbar">
                {deptMessage.text && (
                  <div
                    className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl border ${
                      deptMessage.type === "error" 
                        ? "bg-red-50 text-red-700 border-red-200" 
                        : "bg-green-50 text-green-700 border-green-200"
                    }`}
                  >
                    <p className="text-xs sm:text-sm font-semibold flex items-center gap-2">
                      {deptMessage.type === "success" ? "✓" : "⚠"} {deptMessage.text}
                    </p>
                  </div>
                )}

                <form onSubmit={handleDeptSubmit} className="mb-6 sm:mb-8">
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <input
                      type="text"
                      placeholder="Enter department name..."
                      className="w-full px-4 py-3 rounded-xl transition-all text-sm sm:text-base"
                      style={{ 
                        background: theme.bgCard,
                        border: `2px solid ${theme.borderColor}`,
                        color: theme.textPrimary
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = theme.primaryColor;
                        e.target.style.boxShadow = `0 0 0 2px ${theme.primaryColor}20`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = theme.borderColor;
                        e.target.style.boxShadow = "";
                      }}
                      value={deptInput}
                      onChange={(e) => setDeptInput(e.target.value)}
                      required
                    />
                    <button
                      type="submit"
                      className="w-full sm:w-auto text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap shadow-lg cursor-pointer text-sm sm:text-base"
                      style={{
                        background: theme.primaryGradient,
                        boxShadow: `0 10px 15px -3px ${theme.primaryColor}40`,
                      }}
                    >
                      {editingDept ? <Edit size={16} className="sm:w-[18px] sm:h-[18px]" /> : <Plus size={16} className="sm:w-[18px] sm:h-[18px]" />}
                      {editingDept ? "Update" : "Add Dept"}
                    </button>
                  </div>
                  {editingDept && (
                    <div className="mt-2 text-xs sm:text-sm flex items-center gap-2" style={{ color: theme.textSecondary }}>
                      <span className="truncate">
                        Editing: <span className="font-bold" style={{ color: theme.primaryColor }}>{editingDept.name}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingDept(null);
                          setDeptInput("");
                        }}
                        className="text-xs text-red-500 hover:text-red-700 underline cursor-pointer flex-shrink-0"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </form>

                {deptLoading ? (
                  <div className="py-8 sm:py-10 text-center italic" style={{ color: theme.textMuted }}>
                    <div
                      className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 mx-auto mb-3 cursor-wait"
                      style={{ borderColor: theme.primaryColor }}
                    ></div>
                    <p className="text-sm sm:text-base">Loading departments...</p>
                  </div>
                ) : (
                  <div className="space-y-2 sm:space-y-3">
                    {departments.length > 0 ? (
                      departments.map((dept) => (
                        <div
                          key={dept.departmentId}
                          className="flex items-center justify-between p-3 sm:p-4 rounded-xl sm:rounded-2xl transition-all group cursor-pointer hover:scale-[1.01]"
                          style={{ 
                            background: theme.accentSoft,
                            border: `1px solid ${theme.borderColor}`,
                          }}
                        >
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                            <span className="font-bold text-sm sm:text-base truncate" style={{ color: theme.textPrimary }}>{dept.name}</span>
                            <span
                              className={`text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full flex-shrink-0 ${
                                dept.active 
                                  ? "bg-green-50 text-green-700" 
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {dept.active ? "Active" : "Inactive"}
                            </span>
                          </div>
                          <div className="flex gap-1 sm:gap-2 flex-shrink-0">
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
                              className="p-1.5 sm:p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 size={14} className="sm:w-4 sm:h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 sm:py-10">
                        <Database className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3" style={{ color: theme.textMuted }} />
                        <p className="text-sm sm:text-base font-medium" style={{ color: theme.textSecondary }}>No departments found in system.</p>
                        <p className="text-xs sm:text-sm mt-1" style={{ color: theme.textMuted }}>Add a department using the form above</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="px-4 sm:px-8 py-3 sm:py-4 border-t flex justify-between items-center" style={{ borderColor: theme.borderColor, background: theme.accentSoft }}>
                <div className="text-xs sm:text-sm" style={{ color: theme.textSecondary }}>
                  {departments.length} department{departments.length !== 1 ? "s" : ""}
                </div>
                <button
                  onClick={() => setShowDeptModal(false)}
                  className="text-xs sm:text-sm font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors cursor-pointer"
                  style={{ color: theme.textSecondary }}
                >
                  Close Manager
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Email Edit Modal */}
        {showEmailEditModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 z-50">
            <div className="rounded-[2.5rem] shadow-2xl max-w-md w-full overflow-hidden"
              style={{ background: theme.bgCard, border: `1px solid ${theme.borderColor}` }}
            >
              <div
                className="p-6 text-white"
                style={{ background: theme.primaryGradient }}
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
                  <label className="block text-sm font-semibold mb-2" style={{ color: theme.textSecondary }}>
                    Current Email
                  </label>
                  <input
                    type="email"
                    value={currentUser.email}
                    className="w-full px-4 py-3 rounded-xl cursor-not-allowed"
                    style={{ 
                      background: theme.accentSoft,
                      border: `1px solid ${theme.borderColor}`,
                      color: theme.textSecondary
                    }}
                    disabled
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: theme.textSecondary }}>
                    New Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl transition-all"
                    style={{ 
                      background: theme.bgCard,
                      border: `1px solid ${theme.borderColor}`,
                      color: theme.textPrimary
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = theme.primaryColor;
                      e.target.style.boxShadow = `0 0 0 2px ${theme.primaryColor}20`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = theme.borderColor;
                      e.target.style.boxShadow = "";
                    }}
                    placeholder="Enter new email address"
                    required
                  />
                </div>

                {emailMessage.text && (
                  <div
                    className={`p-3 rounded-xl border ${
                      emailMessage.type === "error" 
                        ? "bg-red-50 text-red-700 border-red-200" 
                        : "bg-green-50 text-green-700 border-green-200"
                    }`}
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
                    style={{ background: theme.primaryGradient }}
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
        isDarkMode={isDarkMode}
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