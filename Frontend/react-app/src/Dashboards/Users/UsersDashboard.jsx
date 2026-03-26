

import {
  User,
  Plus,
  Upload,
  X,
  CalendarDays,
  Edit,
  LogOut,
  LayoutDashboard,
  Settings,
  BookOpen,
  ShieldCheck,
  Mail,
  Phone,
  AtSign,
  Users,
  Club,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Menu,
  Bell,
  Moon,
  Sun,
} from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ConfirmDialog from "../../components/ConfirmDialog";
import ThemedScrollbarStyles from "../../components/ThemedScrollbarStyles";
import ThemeToggle from "../../components/ThemeToggle";
import { useTheme } from "../../contexts/ThemeContext";

const BASE_URL = import.meta.env.VITE_API_URL || "http://72.155.88.211:8080";

export default function UsersDashboard() {
  const navigate = useNavigate();
  
  // Light mode colors
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
  const DARK_BG_SIDEBAR = "#202123"; // ChatGPT sidebar (darker)
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

  const [showProfileForm, setShowProfileForm] = useState(false);
  const [profileData, setProfileData] = useState({
    prn: user?.prn || "",
    fullName: "",
    departmentId: "",
    year: "",
    phoneNumber: "",
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [departments, setDepartments] = useState([]);

  // Email update states
  const [showEmailEditModal, setShowEmailEditModal] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailMessage, setEmailMessage] = useState({ text: "", type: "" });

  // New state for clubs
  const [myClubs, setMyClubs] = useState([]);
  const [isLoadingClubs, setIsLoadingClubs] = useState(false);
  const [clubsError, setClubsError] = useState("");
  const [showAllClubs, setShowAllClubs] = useState(false);
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

  // Current user state
  const [currentUser, setCurrentUser] = useState({
    username: user?.username || "",
    email: user?.email || "",
    role: user?.role || "USER",
    prn: user?.prn || "",
    verified: user?.verified || false,
  });

  const isVerified = currentUser.verified;

  // Account data (profileCompleted + createdAt)
  const [userAccountData, setUserAccountData] = useState(null);

  // Save theme preference to localStorage
  useEffect(() => {
    localStorage.setItem("userDashboardTheme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const fetchUserAccountData = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/users/${user?.prn}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data) setUserAccountData(res.data);
    } catch {
      /* silent — banner simply won't show */
    }
  };

  const profileDeletionDaysRemaining = (() => {
    if (!userAccountData || userAccountData.profileCompleted) return null;
    const created = new Date(userAccountData.createdAt);
    const deadline = new Date(created);
    deadline.setDate(deadline.getDate() + 7);
    const remaining = Math.ceil((deadline - Date.now()) / (1000 * 60 * 60 * 24));
    return remaining;
  })();

  // Handler for disabled features — no-op since banner is always visible
  const handleRestrictedAction = (fn) => {
    if (!isVerified) return; // banner already visible, just block silently
    fn();
  };

  const [unreadCount, setUnreadCount] = useState(0);

  // inside fetchUserProfile or a separate useEffect:
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
      /* silent */
    }
  };

  useEffect(() => {
    fetchUserProfile();
    fetchDepartments();
    fetchMyClubs();
    fetchUnread();
    fetchUserAccountData();
  }, []);

  useEffect(() => {
    const handleFocus = () => {
      fetchUnread();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [token]);

  useEffect(() => {
    if (
      departments.length > 0 &&
      profileData.departmentId &&
      typeof profileData.departmentId === "string" &&
      isNaN(profileData.departmentId)
    ) {
      const dept = departments.find((d) => d.name === profileData.departmentId);
      if (dept) {
        setProfileData((prev) => ({
          ...prev,
          departmentId: dept.departmentId,
        }));
      }
    }
  }, [departments, profileData.departmentId]);

  // Refresh image when profile form is closed
  useEffect(() => {
    if (!showProfileForm && token && user?.prn) {
      fetchProfileImage();
    }
  }, [showProfileForm, token, user?.prn]);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/department`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (response.data && response.data.data)
        setDepartments(response.data.data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const fetchMyClubs = async () => {
    if (!token) {
      setClubsError("No authentication token found");
      return;
    }

    setIsLoadingClubs(true);
    setClubsError("");

    try {
      const response = await axios.get(
        `${BASE_URL}/api/user-clubs/getMyClubs`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data) {
        if (Array.isArray(response.data)) {
          setMyClubs(response.data);
        } else if (response.data.data && Array.isArray(response.data.data)) {
          setMyClubs(response.data.data);
        } else if (response.data.clubs && Array.isArray(response.data.clubs)) {
          setMyClubs(response.data.clubs);
        } else {
          setMyClubs([response.data]);
        }
      }
    } catch (error) {
      console.error("Error fetching my clubs:", error);
      setClubsError(
        error.response?.data?.message || "Failed to fetch your clubs",
      );
      setMyClubs([]);
    } finally {
      setIsLoadingClubs(false);
    }
  };

  const handleViewClubDetails = (club) => {
    if (!isVerified) return;
    const clubName = club.clubName || club.name || "Club";
    navigate(`/club/${encodeURIComponent(clubName)}/details`, {
      state: { userRole: user?.role },
    });
  };

  const fetchUserProfile = async () => {
    try {
      setIsLoadingProfile(true);
      const response = await axios.get(
        `${BASE_URL}/api/profiles/prn/${user?.prn}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.data) {
        setUserProfile(response.data);
        let deptId = "";
        if (response.data.data.department) {
          deptId =
            typeof response.data.data.department === "object"
              ? response.data.data.department.departmentId
              : response.data.data.department;
        }

        setProfileData({
          prn: response.data.data.prn || user?.prn || "",
          fullName: response.data.data.fullName || "",
          departmentId: deptId,
          year: response.data.data.year || "",
          phoneNumber: response.data.data.phoneNumber || "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const fetchProfileImage = async () => {
    if (!token || !user?.prn) return;

    try {
      const response = await axios.get(
        `${BASE_URL}/api/profiles/${user?.prn}/image`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        },
      );
      if (response.status === 200 && response.data) {
        if (profileImage) {
          URL.revokeObjectURL(profileImage);
        }
        setProfileImage(URL.createObjectURL(response.data));
      }
    } catch (error) {
      console.log("No profile image found");
      setProfileImage(null);
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
      setMessage("Error saving profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailUpdate = async () => {
    if (!newEmail.trim()) {
      setEmailMessage({ text: "Please enter a valid email", type: "error" });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      setEmailMessage({
        text: "Please enter a valid email address",
        type: "error",
      });
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
        },
      );

      if (response.data) {
        const updatedUser = {
          ...currentUser,
          email: newEmail,
          verified: false,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setCurrentUser(updatedUser);

        setEmailMessage({
          text: "Email updated! OTP sent to your new email...",
          type: "success",
        });

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
        text:
          error.response?.data?.message ||
          "Failed to update email. Please try again.",
        type: "error",
      });
    } finally {
      setEmailLoading(false);
    }
  };

  const getDepartmentName = (id) => {
    if (typeof id === "string" && isNaN(id)) return id;
    const dept = departments.find((d) => d.departmentId === parseInt(id));
    return dept ? dept.name : "Not set";
  };

  const displayClubs = showAllClubs ? myClubs : myClubs.slice(0, 4);
  const joinedClubsCount = myClubs.length;
  const statsCards = [
    {
      icon: <CalendarDays />,
      label: "Joined Clubs",
      value: joinedClubsCount.toString(),
      color: "blue",
      disabled: !isVerified,
    },
    {
      icon: <BookOpen />,
      label: "Total Events",
      value: "12",
      color: "orange",
      disabled: !isVerified,
    },
    {
      icon: <ShieldCheck />,
      label: "Verified Status",
      value: isVerified ? "Verified" : "Pending",
      color: "purple",
      isStatus: true,
      disabled: false,
    },
  ];

  if (isLoadingProfile) {
    return (
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
    );
  }

  return (
    <>
      <ThemedScrollbarStyles isDarkMode={isDarkMode} className="theme-scrollbar" />

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
              User<span style={{ color: theme.primaryColor }}>Portal</span>
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div
              className="w-10 h-10 rounded-full overflow-hidden border-2 transition-all hover:scale-105 cursor-pointer"
              style={{ borderColor: theme.primaryLight }}
              onClick={() => setShowProfileForm(true)}
            >
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ background: theme.accentSoft }}>
                  <User size={20} style={{ color: theme.textMuted }} />
                </div>
              )}
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

        {/* ===== SIDEBAR ===== - Matching SuperAdmin style */}
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

          <div className="flex items-center gap-3 mb-10 group cursor-pointer">
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
              User<span style={{ color: theme.primaryColor }}>Portal</span>
            </h2>
          </div>

          {/* Profile Image - Matching SuperAdmin style */}
          <div className="flex flex-col items-center text-center mb-8">
            <div
              className="relative p-1 rounded-3xl mb-4 transition-all duration-300 hover:shadow-lg cursor-pointer"
              style={{
                border: `2px solid ${theme.primaryLight}`,
                boxShadow: `0 10px 15px -3px ${theme.primaryColor}20`,
              }}
            >
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-32 h-32 rounded-[2rem] object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-[2rem] flex items-center justify-center" style={{ background: theme.accentSoft }}>
                  <User size={48} style={{ color: theme.textMuted }} />
                </div>
              )}
              <button
                onClick={() => setShowProfileForm(true)}
                className="absolute -bottom-1 -right-1 p-2 rounded-xl shadow-lg transition-all duration-200 hover:scale-110 cursor-pointer"
                style={{ background: theme.primaryColor, color: 'white' }}
              >
                <Edit size={16} />
              </button>
            </div>
            <h3 className="font-bold text-xl tracking-tight" style={{ color: theme.textPrimary }}>
              {profileData.fullName || user?.username}
            </h3>
            <p
              className="text-[10px] font-black px-3 py-1 rounded-full mt-2 uppercase tracking-[0.1em] transition-colors cursor-pointer"
              style={{ color: theme.primaryColor, backgroundColor: theme.primaryLight }}
            >
              {user?.role || "USER"}
            </p>
          </div>

          {/* Info Boxes - Matching SuperAdmin style */}
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
                  {user?.username}
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
                      disabled={isVerified}
                      className={`p-1.5 rounded-lg transition-all duration-200 flex-shrink-0 ${
                        isVerified
                          ? "text-green-600 bg-green-50 cursor-not-allowed opacity-70"
                          : "text-amber-600 bg-amber-50 hover:scale-110 cursor-pointer"
                      }`}
                      title={isVerified ? "Already verified" : "Click to verify"}
                    >
                      {isVerified ? (
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
                  PRN / ID
                </span>
                <span className="text-sm font-bold break-words transition-colors" style={{ color: theme.textPrimary }}>
                  {profileData.prn || "Not set"}
                </span>
              </div>

              <div className="flex flex-col group cursor-pointer">
                <span className="text-[10px] font-bold uppercase tracking-widest mb-1 transition-colors" style={{ color: theme.textMuted }}>
                  Department
                </span>
                <span className="text-sm font-bold break-words transition-colors" style={{ color: theme.textPrimary }}>
                  {getDepartmentName(profileData.departmentId) || "Not set"}
                </span>
              </div>

              <div className="flex flex-col group cursor-pointer">
                <span className="text-[10px] font-bold uppercase tracking-widest mb-1 transition-colors" style={{ color: theme.textMuted }}>
                  Year
                </span>
                <span className="text-sm font-bold break-words transition-colors" style={{ color: theme.textPrimary }}>
                  {profileData.year || "Not set"}
                </span>
              </div>

              <div className="flex flex-col group cursor-pointer">
                <span className="text-[10px] font-bold uppercase tracking-widest mb-1 transition-colors" style={{ color: theme.textMuted }}>
                  Phone
                </span>
                <span className="text-sm font-bold break-words transition-colors" style={{ color: theme.textPrimary }}>
                  {profileData.phoneNumber || "Not set"}
                </span>
              </div>

              <div className="pt-2 border-t flex items-center justify-between group cursor-pointer" style={{ borderColor: theme.borderColor }}>
                <span className="text-[10px] font-bold uppercase tracking-widest transition-colors" style={{ color: theme.textMuted }}>
                  Status
                </span>
                <span
                  className={`flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md group-hover:scale-105 transition-all duration-200 cursor-pointer ${
                    isVerified
                      ? "text-emerald-600 bg-emerald-50"
                      : "text-amber-600 bg-amber-50"
                  }`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isVerified ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`}
                  ></div>
                  {isVerified ? "ACTIVE" : "PENDING"}
                </span>
              </div>
            </div>
          </nav>

          {/* Sign Out Button - Matching SuperAdmin style */}
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

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10 overflow-y-auto max-h-screen mt-16 lg:mt-0 theme-scrollbar">
          {/* ── PROFILE INCOMPLETE / DELETION WARNING BANNER ── */}
          {profileDeletionDaysRemaining !== null && (
            <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-red-50 border border-red-200 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 shadow-sm">
              <div className="flex items-start sm:items-center gap-3 w-full sm:w-auto">
                <div className="p-2 bg-red-100 rounded-lg sm:rounded-xl flex-shrink-0">
                  <AlertTriangle className="text-red-600 w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-bold text-red-800">
                    Profile incomplete — account will be deleted
                  </p>
                  <p className="text-[10px] sm:text-xs text-red-600 mt-0.5">
                    {profileDeletionDaysRemaining > 0
                      ? `Complete your profile within ${
                          profileDeletionDaysRemaining === 1
                            ? "1 day"
                            : `${profileDeletionDaysRemaining} days`
                        } to keep your account.`
                      : "Your account is overdue for deletion. Complete your profile immediately."}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowProfileForm(true)}
                className="w-full sm:w-auto text-white text-[10px] sm:text-xs font-black px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl transition-all hover:opacity-90 hover:scale-105 cursor-pointer uppercase tracking-wider"
                style={{ background: "linear-gradient(135deg, #ef4444, #b91c1c)" }}
              >
                Complete Profile
              </button>
            </div>
          )}

          {/* ── UNVERIFIED BANNER ── */}
          {!isVerified && (
            <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-amber-50 border border-amber-200 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 shadow-sm">
              <div className="flex items-start sm:items-center gap-3 w-full sm:w-auto">
                <div className="p-2 bg-amber-100 rounded-lg sm:rounded-xl flex-shrink-0">
                  <AlertTriangle className="text-amber-600 w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-bold text-amber-800">
                    Your account is not verified
                  </p>
                  <p className="text-[10px] sm:text-xs text-amber-600 mt-0.5">
                    Features are disabled until you verify your email address.
                  </p>
                </div>
              </div>
              <button
                onClick={handleVerificationRedirect}
                className="w-full sm:w-auto text-white text-[10px] sm:text-xs font-black px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl transition-all hover:opacity-90 hover:scale-105 cursor-pointer uppercase tracking-wider"
                style={{
                  background: "linear-gradient(135deg, #f59e0b, #d97706)",
                }}
              >
                Verify Now
              </button>
            </div>
          )}

          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8 md:mb-10">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: theme.textPrimary }}>
                Dashboard
              </h1>
              <p className="text-sm sm:text-base mt-1" style={{ color: theme.textSecondary }}>
                Welcome back,{" "}
                <span className="font-semibold" style={{ color: theme.primaryColor }}>
                  {user?.username}
                </span>
                .{" "}
                {isVerified
                  ? "System is healthy."
                  : "Please verify your account."}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <div
                className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-full border ${
                  isVerified
                    ? "bg-green-50 text-green-600 border-green-100"
                    : "bg-amber-50 text-amber-600 border-amber-100"
                }`}
              >
                <div
                  className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${isVerified ? "bg-green-500 animate-pulse" : "bg-amber-400"}`}
                ></div>
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                  {isVerified ? "Live" : "Pending"}
                </span>
              </div>
            </div>
          </header>

          {/* Statistics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-10 md:mb-12">
            {statsCards.map((card) => (
              <StatCard
                key={card.label}
                icon={card.icon}
                label={card.label}
                value={card.value}
                color={card.color}
                isStatus={card.isStatus}
                disabled={card.disabled}
                theme={theme}
              />
            ))}
          </div>

          {/* Stacked Layout */}
          <div className="grid grid-cols-1 gap-6 sm:gap-8">
            {/* User Control Center */}
            <section 
              className="rounded-2xl sm:rounded-3xl md:rounded-[2.5rem] p-4 sm:p-6 md:p-8 lg:p-10 shadow-sm h-fit transition-colors duration-300"
              style={{ background: theme.bgCard, border: `1px solid ${theme.borderColor}` }}
            >
              <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8 md:mb-10">
                <div
                  className="w-1 h-8 sm:h-10 rounded-full"
                  style={{
                    background: theme.primaryGradient,
                  }}
                ></div>
                <h2 className="text-xl sm:text-2xl font-bold" style={{ color: theme.textPrimary }}>
                  User Control Center
                </h2>
              </div>

              {/* Locked overlay when unverified */}
              <div className="relative">
                {!isVerified && (
                  <div className="absolute inset-0 z-10 rounded-2xl backdrop-blur-[2px] flex flex-col items-center justify-center gap-3"
                    style={{ background: isDarkMode ? 'rgba(32, 33, 35, 0.9)' : 'rgba(255, 255, 255, 0.6)' }}
                  >
                    <div className="bg-amber-100 p-4 rounded-full">
                      <svg className="w-8 h-8 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="font-bold text-sm" style={{ color: theme.textSecondary }}>Verify your email to access these features</p>
                    <button
                      onClick={handleVerificationRedirect}
                      className="text-xs font-bold px-5 py-2 bg-amber-500 text-white rounded-full hover:bg-amber-600 transition-colors cursor-pointer"
                    >
                      Verify Now
                    </button>
                  </div>
                )}

                <div className={`grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 ${!isVerified ? "opacity-40 pointer-events-none select-none" : ""}`}>
                  <ActionCard
                    icon={<CalendarDays size={20} className="sm:w-6 sm:h-6" />}
                    label="Upcoming Events"
                    color="blue"
                    onClick={() =>
                      handleRestrictedAction(
                        () => (window.location.href = "/events"),
                      )
                    }
                    disabled={!isVerified}
                    theme={theme}
                  />

                  <ActionCard
                    icon={<Club size={20} className="sm:w-6 sm:h-6" />}
                    label="Clubs"
                    color="blue"
                    onClick={() =>
                      handleRestrictedAction(() => navigate("/manage-clubs"))
                    }
                    disabled={!isVerified}
                    theme={theme}
                  />
                  {/* <ActionCard
                    icon={<Settings size={24} />}
                    label="Settings"
                    color="purple"
                    onClick={() =>
                      handleRestrictedAction(
                      () => (window.location.href = "#"),
                      )
                  }
                  disabled={!isVerified}
                  theme={theme}
                /> */}
                  <button
                    onClick={() =>
                      handleRestrictedAction(() => navigate("/notifications"))
                    }
                    disabled={!isVerified}
                    className="p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl border transition-all hover:scale-[1.02] flex flex-col items-center justify-center gap-2 sm:gap-4 group shadow-sm w-full relative disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: theme.accentSoft, borderColor: theme.borderColor }}
                  >
                    <div
                      className="relative p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-sm group-hover:shadow-md transition-all group-hover:-translate-y-1"
                      style={{ background: theme.bgCard, color: theme.primaryColor }}
                    >
                      <Bell size={18} className="sm:w-5 sm:h-5 md:w-6 md:h-6" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-[8px] sm:text-[10px] font-black rounded-full flex items-center justify-center">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </div>
                    <span className="font-black uppercase text-[10px] sm:text-xs tracking-widest" style={{ color: theme.textPrimary }}>
                      Notifications
                    </span>
                  </button>
                </div>
              </div>
            </section>

            {/* My Clubs Section */}
            {(isLoadingClubs || clubsError || myClubs.length > 0) && (
            <section 
              className="rounded-2xl sm:rounded-3xl md:rounded-[2.5rem] p-4 sm:p-6 md:p-8 lg:p-10 shadow-sm transition-colors duration-300"
              style={{ background: theme.bgCard, border: `1px solid ${theme.borderColor}` }}
            >
              <div className="flex items-center justify-between mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-bold" style={{ color: theme.textPrimary }}>My Clubs</h2>
                <button
                  onClick={fetchMyClubs}
                  disabled={isLoadingClubs || !isVerified}
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 whitespace-nowrap"
                  style={{
                    color: theme.primaryColor,
                    backgroundColor: theme.primaryLight,
                  }}
                  title={!isVerified ? "Verify your email to refresh clubs" : ""}
                >
                  <svg
                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isLoadingClubs ? "animate-spin" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  <span className="hidden sm:inline">{isLoadingClubs ? "Refreshing..." : "Refresh"}</span>
                  <span className="sm:hidden">Refresh</span>
                </button>
              </div>

              {/* Clubs content */}
              {!isVerified ? (
                <div className="py-10 sm:py-12 md:py-16 text-center border-2 border-dashed rounded-xl sm:rounded-2xl md:rounded-[2rem]" 
                  style={{ borderColor: theme.borderColor, background: theme.accentSoft }}>
                  <div className="bg-amber-100 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 sm:w-9 sm:h-9 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: theme.textPrimary }}>Clubs Locked</h3>
                  <p className="text-sm mb-6 px-4" style={{ color: theme.textSecondary }}>
                    Verify your email address to view and manage your club memberships.
                  </p>
                  <button
                    onClick={handleVerificationRedirect}
                    className="text-white px-6 sm:px-8 py-2 sm:py-3 rounded-full text-xs sm:text-sm font-bold shadow-lg transition-colors cursor-pointer bg-amber-500 hover:bg-amber-600"
                  >
                    Verify Email
                  </button>
                </div>
              ) : isLoadingClubs ? (
                <div className="py-10 sm:py-12 md:py-16 text-center">
                  <div
                    className="animate-spin w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 border-4 rounded-full mx-auto mb-3 sm:mb-4"
                    style={{
                      borderColor: theme.primaryLight,
                      borderTopColor: theme.primaryColor,
                    }}
                  ></div>
                  <p className="text-sm sm:text-base font-medium" style={{ color: theme.textSecondary }}>
                    Loading your clubs...
                  </p>
                </div>
              ) : clubsError ? (
                <div className="rounded-xl sm:rounded-2xl md:rounded-[2rem] p-6 sm:p-8 text-center border" 
                  style={{ background: theme.accentSoft, borderColor: theme.borderColor }}>
                  <div className="text-red-500 mb-3">
                    <svg
                      className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3" style={{ color: theme.textPrimary }}>
                    Unable to Load Clubs
                  </h3>
                  <p className="text-red-500/70 text-sm sm:text-base mb-4 sm:mb-5">{clubsError}</p>
                  <button
                    onClick={fetchMyClubs}
                    className="px-6 sm:px-8 py-2 sm:py-3 rounded-full text-xs sm:text-sm font-bold border transition-colors cursor-pointer"
                    style={{
                      color: theme.primaryColor,
                      borderColor: theme.borderColorHover,
                      background: theme.bgCard
                    }}
                  >
                    Try Again
                  </button>
                </div>
              ) : myClubs.length === 0 ? (
                <div className="py-10 sm:py-12 md:py-16 text-center border-2 border-dashed rounded-xl sm:rounded-2xl md:rounded-[2rem]"
                  style={{ borderColor: theme.borderColor, background: theme.accentSoft }}>
                  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-5"
                    style={{ background: theme.accentSoft }}>
                    <Users style={{ color: theme.textMuted }} className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3" style={{ color: theme.textPrimary }}>
                    No Clubs Joined Yet
                  </h3>
                  <p className="text-sm sm:text-base mb-6 sm:mb-8 px-4" style={{ color: theme.textSecondary }}>
                    You haven't joined any clubs. Explore and join clubs to see
                    them here.
                  </p>
                  <button
                    className="text-white px-6 sm:px-8 md:px-10 py-2 sm:py-3 md:py-4 rounded-full text-xs sm:text-sm font-bold shadow-lg transition-colors cursor-pointer"
                    style={{
                      background: theme.primaryGradient,
                    }}
                  >
                    Browse Clubs
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-5">
                    {displayClubs.map((club, index) => (
                      <CompactClubCard
                        key={club.clubId || club.id || index}
                        club={club}
                        onViewDetails={handleViewClubDetails}
                        disabled={!isVerified}
                        theme={theme}
                      />
                    ))}
                  </div>

                  {myClubs.length > 4 && (
                    <div className="text-center mt-6 sm:mt-8">
                      <button
                        onClick={() => setShowAllClubs(!showAllClubs)}
                        className="px-6 sm:px-8 py-3 sm:py-4 rounded-full text-xs sm:text-sm font-bold border transition-colors inline-flex items-center gap-2 cursor-pointer"
                        style={{
                          color: theme.primaryColor,
                          borderColor: theme.borderColorHover,
                          background: theme.bgCard
                        }}
                      >
                        <span>
                          {showAllClubs
                            ? "Show Less"
                            : `Show All (${myClubs.length} Clubs)`}
                        </span>
                        <svg
                          className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${showAllClubs ? "rotate-180" : ""}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
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

        {/* Profile Form Modal */}
        {showProfileForm && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div 
              className="rounded-[2.5rem] shadow-2xl max-w-xl w-full p-8 transition-colors duration-300"
              style={{ background: theme.bgCard, border: `1px solid ${theme.borderColor}` }}
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold" style={{ color: theme.textPrimary }}>
                  {userProfile ? "Edit Profile" : "Complete Profile"}
                </h3>
                <button
                  onClick={() => setShowProfileForm(false)}
                  className="p-2 rounded-full transition-colors cursor-pointer"
                  style={{ background: theme.accentSoft, color: theme.textSecondary }}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmitProfile} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    label="PRN (Read Only)"
                    value={profileData.prn}
                    readOnly
                    theme={theme}
                  />
                  <FormInput
                    label="Full Name"
                    value={profileData.fullName}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        fullName: e.target.value,
                      })
                    }
                    required
                    theme={theme}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black ml-1 uppercase tracking-widest" style={{ color: theme.textMuted }}>
                      Department
                    </label>
                    <select
                      value={profileData.departmentId}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          departmentId: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3.5 rounded-2xl focus:ring-2 outline-none font-medium cursor-pointer"
                      style={{ 
                        background: theme.accentSoft,
                        border: `1px solid ${theme.borderColor}`,
                        color: theme.textPrimary
                      }}
                      required
                    >
                      <option value="">Select Dept</option>
                      {departments.map((dept) => (
                        <option
                          key={dept.departmentId}
                          value={dept.departmentId}
                        >
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black ml-1 uppercase tracking-widest" style={{ color: theme.textMuted }}>
                      Year
                    </label>
                    <select
                      value={profileData.year}
                      onChange={(e) =>
                        setProfileData({ ...profileData, year: e.target.value })
                      }
                      className="w-full px-4 py-3.5 rounded-2xl focus:ring-2 outline-none font-medium cursor-pointer"
                      style={{ 
                        background: theme.accentSoft,
                        border: `1px solid ${theme.borderColor}`,
                        color: theme.textPrimary
                      }}
                      required
                    >
                      <option value="">Select Year</option>
                      {[1, 2, 3, 4].map((y) => (
                        <option key={y} value={y}>
                          Year {y}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <FormInput
                  label="Phone Number"
                  value={profileData.phoneNumber}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      phoneNumber: e.target.value,
                    })
                  }
                  required
                  theme={theme}
                />

                <div 
                  className="p-6 rounded-2xl border-2 border-dashed text-center transition-colors cursor-pointer"
                  style={{ 
                    background: theme.accentSoft,
                    borderColor: theme.borderColor
                  }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setSelectedImage(file);
                        // Create preview
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          if (profileImage) {
                            URL.revokeObjectURL(profileImage);
                          }
                          setProfileImage(reader.result);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                    id="profile-upload"
                  />
                  <label
                    htmlFor="profile-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                    style={{ color: theme.textSecondary }}
                  >
                    <Upload size={24} style={{ color: theme.primaryColor }} />
                    <span className="text-sm font-semibold">
                      {selectedImage
                        ? selectedImage.name
                        : "Upload Profile Photo"}
                    </span>
                  </label>
                </div>

                {message && (
                  <div className="p-3 rounded-lg text-sm font-medium border bg-red-50 text-red-700 border-red-200">
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full text-white py-4 rounded-2xl font-bold shadow-lg transition-all disabled:opacity-50 cursor-pointer"
                  style={{
                    background: theme.primaryGradient,
                  }}
                >
                  {loading
                    ? "Saving..."
                    : userProfile
                      ? "Update Profile"
                      : "Complete Profile"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Email Edit Modal */}
        {showEmailEditModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-6 z-50">
            <div 
              className="rounded-[2.5rem] shadow-2xl max-w-md w-full overflow-hidden transition-colors duration-300"
              style={{ background: theme.bgCard, border: `1px solid ${theme.borderColor}` }}
            >
              <div
                className="p-6 text-white"
                style={{
                  background: theme.primaryGradient,
                }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Mail size={20} />
                      Update Email Address
                    </h3>
                    <p className="text-white/80 text-sm mt-1">
                      Enter your new email address
                    </p>
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
                    className={`p-3 rounded-xl ${
                      emailMessage.type === "error" 
                        ? "bg-red-50 text-red-700 border border-red-200" 
                        : "bg-green-50 text-green-700 border border-green-200"
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
                    disabled={
                      emailLoading ||
                      !newEmail ||
                      newEmail === currentUser.email
                    }
                    className="w-full text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                    style={{
                      background: theme.primaryGradient,
                    }}
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

/* HELPER COMPONENTS */

function SidebarInfoBox({ label, value, theme }) {
  return (
    <div 
      className="p-4 rounded-[1.2rem] transition-colors group cursor-pointer"
      style={{ background: theme.primaryLight, border: `1px solid ${theme.borderColor}` }}
    >
      <p className="text-[9px] uppercase font-black mb-1 tracking-widest transition-colors" style={{ color: theme.textSecondary }}>
        {label}
      </p>
      <p className="font-bold text-sm truncate" style={{ color: theme.textPrimary }}>
        {value || "Not set"}
      </p>
    </div>
  );
}

function StatCard({ icon, label, value, color, isStatus, disabled, theme }) {
  const bgColors = {
    blue: { bg: theme.primaryLight, text: theme.primaryColor },
    orange: { bg: "rgba(249, 115, 22, 0.1)", text: "#F97316" },
    purple: { bg: theme.primaryLight, text: theme.primaryColor },
    green: { bg: "rgba(16, 185, 129, 0.1)", text: "#10B981" },
    red: { bg: "rgba(239, 68, 68, 0.1)", text: "#EF4444" },
  };
  
  const bgColor = theme.isDarkMode 
    ? { bg: "rgba(255, 255, 255, 0.06)", text: theme.primaryColor }
    : (bgColors[color] || bgColors.blue);
    
  return (
    <div
      className={`p-7 rounded-[2.5rem] shadow-sm flex items-center gap-6 transition-all ${
        disabled
          ? "opacity-40 cursor-not-allowed"
          : "cursor-pointer hover:shadow-md"
      }`}
      style={{ background: theme.bgCard, border: `1px solid ${theme.borderColor}` }}
    >
      <div
        className="p-5 rounded-[1.5rem]"
        style={{
          backgroundColor: bgColor.bg,
          color: bgColor.text,
        }}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: theme.textMuted }}>
          {label}
        </p>
        <h3
          className={`text-2xl font-black tracking-tight ${
            isStatus
              ? value === "Verified"
                ? "text-green-500"
                : "text-amber-500"
              : ""
          }`}
          style={{ color: isStatus ? undefined : theme.textPrimary }}
        >
          {value}
        </h3>
      </div>
    </div>
  );
}

function CompactClubCard({ club, onViewDetails, disabled, theme }) {
  const clubName = club.clubName || club.name || "Unnamed Club";
  const clubDescription =
    club.description || club.desc || "No description available";
  const memberCount = club.memberCount || club.members || "0";
  const clubLogo = club.logo || club.image || club.logoUrl || null;

  const colors = ["blue", "orange", "purple", "green", "red"];
  const color = colors[clubName.length % colors.length];

  const bgColors = {
    blue: { bg: theme.primaryLight, text: theme.primaryColor },
    orange: { bg: "rgba(249, 115, 22, 0.1)", text: "#F97316" },
    purple: { bg: theme.primaryLight, text: theme.primaryColor },
    green: { bg: "rgba(16, 185, 129, 0.1)", text: "#10B981" },
    red: { bg: "rgba(239, 68, 68, 0.1)", text: "#EF4444" },
  };

  const bgColor = theme.isDarkMode 
    ? { bg: "rgba(255, 255, 255, 0.06)", text: theme.primaryColor }
    : (bgColors[color] || bgColors.blue);

  return (
    <div
      className={`rounded-2xl p-5 transition-all border ${
        disabled
          ? "opacity-50 cursor-not-allowed"
          : "hover:scale-[1.02] cursor-pointer"
      }`}
      style={{ 
        background: theme.accentSoft,
        borderColor: theme.borderColor 
      }}
      onClick={() => !disabled && onViewDetails(club)}
    >
      <div className="flex items-center gap-4">
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: bgColor.bg }}
        >
          {clubLogo ? (
            <img
              src={clubLogo}
              alt={clubName}
              className="w-7 h-7 object-contain"
            />
          ) : (
            <Users
              className="w-6 h-6"
              style={{ color: bgColor.text }}
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3
              className="font-extrabold text-lg truncate pr-2"
              style={{ color: theme.textPrimary }}
              title={clubName}
            >
              {clubName}
            </h3>
          </div>
          <p className="text-sm line-clamp-2 mb-2" style={{ color: theme.textSecondary }}>
            {clubDescription}
          </p>
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4" style={{ color: theme.textMuted }} />
            <span className="text-xs font-bold" style={{ color: theme.textSecondary }}>
              {memberCount} members
            </span>
          </div>
        </div>

        <ChevronRight size={20} style={{ color: theme.textMuted }} />
      </div>
    </div>
  );
}

function ActionCard({ icon, label, color, onClick, disabled, theme }) {
  const themes = {
    blue: { bg: theme.primaryLight, icon: theme.primaryColor },
    orange: { bg: "rgba(249, 115, 22, 0.05)", icon: "#F97316" },
    green: { bg: "rgba(16, 185, 129, 0.05)", icon: "#10B981" },
    purple: { bg: theme.primaryLight, icon: theme.primaryColor },
  };
  
  const themeConfig = theme.isDarkMode 
    ? { bg: "rgba(255, 255, 255, 0.03)", icon: theme.primaryColor }
    : (themes[color] || themes.blue);
    
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`p-8 rounded-2xl border transition-all flex flex-col items-center justify-center gap-4 group shadow-sm w-full ${
        disabled
          ? "opacity-40 cursor-not-allowed"
          : "hover:scale-[1.02] cursor-pointer"
      }`}
      style={{ background: themeConfig.bg, borderColor: theme.borderColor }}
    >
      <div
        className="p-4 rounded-xl shadow-sm group-hover:shadow-md transition-all group-hover:-translate-y-1"
        style={{ background: theme.bgCard, color: themeConfig.icon }}
      >
        {icon}
      </div>
      <span className="font-black uppercase text-xs tracking-widest" style={{ color: theme.textPrimary }}>
        {label}
      </span>
    </button>
  );
}

function FormInput({ label, theme, ...props }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-black ml-1 uppercase tracking-widest" style={{ color: theme.textMuted }}>
        {label}
      </label>
      <input
        className="w-full px-4 py-3.5 rounded-2xl focus:ring-2 outline-none font-medium transition-all cursor-text"
        style={{ 
          background: theme.accentSoft,
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
        {...props}
      />
    </div>
  );
}