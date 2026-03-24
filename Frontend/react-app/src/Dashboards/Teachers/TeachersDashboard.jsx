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
import ThemedScrollbarStyles from "../../components/ThemedScrollbarStyles";

const BASE_URL = import.meta.env.VITE_API_URL || "http://72.155.88.211:8080";

export default function TeachersDashboard() {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Color palette for light mode (same as UsersDashboard)
  const LIGHT_PRIMARY_COLOR = "#4CA1AF";
  const LIGHT_PRIMARY_DARK = "#2d8391";
  const LIGHT_PRIMARY_LIGHT = "rgba(76, 161, 175, 0.1)";
  const LIGHT_PRIMARY_GRADIENT = "linear-gradient(135deg, #4CA1AF 0%, #2c7a8a 100%)";
  
  // Light mode background colors
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
    year: 0,
    phoneNumber: "",
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileExists, setProfileExists] = useState(false);
  const profileImageBlobRef = useRef(null);
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

  const assignedStudentsCount = useFilteredUsersCount();

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
  }, [departments]);

  useEffect(() => {
    if (!showProfileForm && token && user?.prn) {
      fetchProfileImage();
    }
  }, [showProfileForm]);

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

      if (response.data?.success && response.data?.data) {
        const profile = response.data.data;
        setProfileExists(true);

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
          year: profile.year != null ? Number(profile.year) : 0,
          phoneNumber: profile.phoneNumber || "",
        });

        fetchProfileImage();
      } else {
        setProfileExists(false);
        setProfileData((prev) => ({ ...prev, prn: user?.prn || "" }));
      }
    } catch (error) {
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
        year: profileData.year != null ? Number(profileData.year) : 0,
        phoneNumber: profileData.phoneNumber,
      };

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

      if (imagePreviewUrl) {
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
    if (typeof id === "string" && isNaN(Number(id))) return id;
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
        <div 
          className="lg:hidden fixed top-0 left-0 right-0 px-4 py-4 flex items-center justify-between z-50 shadow-sm backdrop-blur-sm transition-colors duration-300"
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
              <GraduationCap className="text-white w-5 h-5" />
            </div>
            <h2 className="text-xl font-black tracking-tight" style={{ color: theme.textPrimary }}>
              Teacher<span style={{ color: theme.primaryColor }}>Hub</span>
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDarkMode((prev) => !prev)}
              className="p-2 rounded-xl transition-colors cursor-pointer"
              style={{ background: theme.accentSoft, color: theme.textSecondary }}
              title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div
              className="w-10 h-10 rounded-full overflow-hidden border-2 cursor-pointer"
              style={{ borderColor: theme.primaryLight }}
              onClick={() => setShowProfileForm(true)}
            >
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ background: theme.accentSoft }}>
                  <User size={20} style={{ color: theme.textMuted }} />
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

        {/* ── Sidebar ── Matching SuperAdmin style */}
        <aside
          className={`
            fixed lg:sticky top-0 left-0 h-screen
            w-80 sm:w-96
            flex flex-col p-8
            transition-all duration-300 ease-in-out z-50
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            overflow-y-auto theme-scrollbar
          `}
          style={{ 
            background: theme.bgSidebar,
            borderRight: `1px solid ${theme.borderColor}`,
            boxShadow: isDarkMode ? 'none' : `4px 0 20px ${theme.primaryColor}10`
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
              <GraduationCap className="text-white" size={24} />
            </div>
            <h2 className="text-2xl font-black tracking-tight" style={{ color: theme.textPrimary }}>
              Teacher<span style={{ color: theme.primaryColor }}>Hub</span>
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
              {user?.role || "PROFESSOR"}
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
                      onClick={() => { setNewEmail(currentUser.email); setShowEmailEditModal(true); }}
                      className="p-1.5 rounded-lg transition-all duration-200 hover:scale-110 flex-shrink-0 cursor-pointer"
                      style={{ color: theme.primaryColor, background: `${theme.primaryColor}10` }}
                      title="Edit email"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={handleVerificationRedirect}
                      className={`p-1.5 rounded-lg transition-all duration-200 hover:scale-110 flex-shrink-0 cursor-pointer ${
                        currentUser.verified
                          ? "text-green-600 bg-green-50"
                          : "text-amber-600 bg-amber-50"
                      }`}
                      title={currentUser.verified ? "Verified" : "Click to verify"}
                    >
                      {currentUser.verified ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col group cursor-pointer">
                <span className="text-[10px] font-bold uppercase tracking-widest mb-1 transition-colors" style={{ color: theme.textMuted }}>
                  Staff ID
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

          {/* Sign out - Matching SuperAdmin style */}
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

        {/* ── Main content ── */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10 overflow-y-auto theme-scrollbar max-h-screen lg:mt-0 mt-16">

          {/* Profile incomplete deletion warning */}
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

          {/* Unverified banner */}
          {!currentUser.verified && (
            <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-amber-50 border border-amber-200 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 shadow-sm">
              <div className="flex items-start sm:items-center gap-3 w-full sm:w-auto">
                <div className="p-2 bg-amber-100 rounded-lg sm:rounded-xl flex-shrink-0">
                  <AlertCircle className="text-amber-600 w-4 h-4 sm:w-5 sm:h-5" />
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
                  Prof. {profileData.fullName || user?.username}
                </span>
                .{" "}
                {currentUser.verified
                  ? "System is healthy."
                  : "Please verify your account."}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsDarkMode((prev) => !prev)}
                className="px-3 py-2 rounded-full text-xs font-bold transition-colors cursor-pointer"
                style={{ 
                  background: theme.accentSoft,
                  color: theme.textSecondary,
                  border: `1px solid ${theme.borderColor}`
                }}
              >
                {isDarkMode ? "Light" : "Dark"}
              </button>
              <div
                className="flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-full border"
                style={{
                  background: currentUser.verified ? "rgba(16, 185, 129, 0.05)" : "rgba(245, 158, 11, 0.05)",
                  color: currentUser.verified ? "#10B981" : "#F59E0B",
                  borderColor: currentUser.verified ? "rgba(16, 185, 129, 0.1)" : "rgba(245, 158, 11, 0.1)"
                }}
              >
                <div
                  className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${currentUser.verified ? "bg-green-500 animate-pulse" : "bg-amber-400"}`}
                ></div>
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                  {currentUser.verified ? "Live" : "Pending"}
                </span>
              </div>
            </div>
          </header>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-10 md:mb-12">
            <StatCard 
              icon={<Calendar />} 
              label="Events Managed" 
              value={eventsManagedCount.toString()} 
              color="blue"
              theme={theme}
            />
            <StatCard 
              icon={<Trophy />} 
              label="My Clubs" 
              value={clubs.length.toString()} 
              color="green"
              theme={theme}
            />
            <StatCard 
              icon={<Users />} 
              label="Assigned Students" 
              value={assignedStudentsCount.toString()} 
              color="orange"
              theme={theme}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:gap-8">
            {/* Control center */}
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
                  Professor Control Center
                </h2>
              </div>

              <div className="relative">
                {!currentUser.verified && (
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

                <div className={`grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 ${!currentUser.verified ? "opacity-40 pointer-events-none select-none" : ""}`}>
                  <ActionCard 
                    icon={<CalendarPlus size={20} className="sm:w-6 sm:h-6" />} 
                    label="Events" 
                    color="blue" 
                    onClick={() => navigate("/events")} 
                    theme={theme}
                  />
                  <ActionCard 
                    icon={<Users size={20} className="sm:w-6 sm:h-6" />} 
                    label="Add Student" 
                    color="teal" 
                    onClick={() => navigate("/add-users-with-club")} 
                    theme={theme}
                  />
                  <ActionCard 
                    icon={<Building2 size={20} className="sm:w-6 sm:h-6" />} 
                    label="Club Association" 
                    color="orange" 
                    onClick={() => navigate("/remove-users-from-club")} 
                    theme={theme}
                  />
                  <ActionCard 
                    icon={<Trophy size={20} className="sm:w-6 sm:h-6" />} 
                    label="Clubs" 
                    color="teal" 
                    onClick={() => navigate("/manage-clubs")} 
                    theme={theme}
                  />
                  <button
                    onClick={() => navigate("/notifications")}
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

            {/* My clubs */}
            {(isLoadingClubs || error || clubs.length > 0) && (
              <section 
                className="rounded-2xl sm:rounded-3xl md:rounded-[2.5rem] p-4 sm:p-6 md:p-8 lg:p-10 shadow-sm transition-colors duration-300"
                style={{ background: theme.bgCard, border: `1px solid ${theme.borderColor}` }}
              >
                <div className="flex items-center justify-between mb-6 sm:mb-8">
                  <h2 className="text-xl sm:text-2xl font-bold" style={{ color: theme.textPrimary }}>My Clubs</h2>
                  <button
                    onClick={fetchUserClubs}
                    disabled={isLoadingClubs || !currentUser.verified}
                    className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 whitespace-nowrap"
                    style={{
                      color: theme.primaryColor,
                      backgroundColor: theme.primaryLight,
                    }}
                    title={!currentUser.verified ? "Verify your email to refresh clubs" : ""}
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

                {!currentUser.verified ? (
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
                ) : error ? (
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
                    <p className="text-red-500/70 text-sm sm:text-base mb-4 sm:mb-5">{error}</p>
                    <button
                      onClick={fetchUserClubs}
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
                ) : clubs.length === 0 ? (
                  <div className="py-10 sm:py-12 md:py-16 text-center border-2 border-dashed rounded-xl sm:rounded-2xl md:rounded-[2rem]"
                    style={{ borderColor: theme.borderColor, background: theme.accentSoft }}>
                    <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-5"
                      style={{ background: theme.accentSoft }}>
                      <Trophy style={{ color: theme.textMuted }} className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3" style={{ color: theme.textPrimary }}>
                      No Clubs Assigned Yet
                    </h3>
                    <p className="text-sm sm:text-base mb-6 sm:mb-8 px-4" style={{ color: theme.textSecondary }}>
                      You haven't been assigned to any clubs yet.
                    </p>
                    <button
                      onClick={() => navigate("/manage-clubs")}
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
                      {displayClubs.map((club) => (
                        <CompactClubCard
                          key={club.clubId}
                          club={club}
                          onViewDetails={handleViewClubDetails}
                          disabled={!currentUser.verified}
                          theme={theme}
                        />
                      ))}
                    </div>
                    {clubs.length > 4 && (
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
                              : `Show All (${clubs.length} Clubs)`}
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

        {/* ── Profile form modal ── */}
        {showProfileForm && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div 
              className="rounded-[2.5rem] shadow-2xl max-w-xl w-full p-8 transition-colors duration-300"
              style={{ background: theme.bgCard, border: `1px solid ${theme.borderColor}` }}
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold" style={{ color: theme.textPrimary }}>
                  {profileExists ? "Edit Profile" : "Complete Profile"}
                </h3>
                <button
                  onClick={() => { setShowProfileForm(false); setFormMessage({ text: "", type: "" }); setSelectedImage(null); setImagePreviewUrl(null); }}
                  className="p-2 rounded-full transition-colors cursor-pointer"
                  style={{ background: theme.accentSoft, color: theme.textSecondary }}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmitProfile} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    label="Staff ID (Read Only)"
                    value={profileData.prn}
                    readOnly
                    theme={theme}
                  />
                  <FormInput
                    label="Full Name"
                    value={profileData.fullName}
                    onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                    required
                    theme={theme}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black ml-1 uppercase tracking-widest" style={{ color: theme.textMuted }}>
                      Department
                    </label>
                    <CustomSelect
                      name="departmentId"
                      value={profileData.departmentId}
                      onChange={(e) => setProfileData({ ...profileData, departmentId: e.target.value })}
                      options={departments.map((dept) => ({ value: dept.departmentId, label: dept.name }))}
                      placeholder="Select Dept"
                      required
                    />
                  </div>
                  {/* <div className="space-y-1">
                    <label className="text-[10px] font-black ml-1 uppercase tracking-widest" style={{ color: theme.textMuted }}>
                      Year
                    </label>
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
                  </div> */}
                </div>

                <FormInput
                  label="Phone Number"
                  value={profileData.phoneNumber}
                  onChange={(e) => setProfileData({ ...profileData, phoneNumber: e.target.value })}
                  required
                  theme={theme}
                />

                {/* Image upload with preview */}
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
                      if (!file) return;
                      setSelectedImage(file);
                      const reader = new FileReader();
                      reader.onloadend = () => setImagePreviewUrl(reader.result);
                      reader.readAsDataURL(file);
                    }}
                    className="hidden"
                    id="profile-upload"
                  />
                  <label
                    htmlFor="profile-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                    style={{ color: theme.textSecondary }}
                  >
                    {imagePreviewUrl ? (
                      <img src={imagePreviewUrl} alt="Preview" className="w-20 h-20 rounded-2xl object-cover mx-auto mb-1" />
                    ) : (
                      <Upload size={24} style={{ color: theme.primaryColor }} />
                    )}
                    <span className="text-sm font-semibold">
                      {selectedImage ? selectedImage.name : "Upload Profile Photo"}
                    </span>
                  </label>
                </div>

                {formMessage.text && (
                  <div
                    className={`p-3 rounded-xl text-sm font-semibold ${
                      formMessage.type === "error" 
                        ? "bg-red-50 text-red-700 border border-red-200" 
                        : "bg-green-50 text-green-700 border border-green-200"
                    }`}
                  >
                    {formMessage.type === "error" ? "⚠ " : "✓ "}{formMessage.text}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={profileLoading}
                  className="w-full text-white py-4 rounded-2xl font-bold shadow-lg transition-all disabled:opacity-50 cursor-pointer"
                  style={{
                    background: theme.primaryGradient,
                  }}
                >
                  {profileLoading ? "Saving..." : profileExists ? "Update Profile" : "Complete Profile"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ── Email edit modal ── */}
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
                  style={{
                    background: theme.primaryGradient,
                  }}
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

/* ── Helper components ───────────────────────────────────────────────────────── */

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

function StatCard({ icon, label, value, color, theme }) {
  const bgColors = {
    blue: { bg: theme.primaryLight, text: theme.primaryColor },
    green: { bg: "rgba(16, 185, 129, 0.1)", text: "#10B981" },
    orange: { bg: "rgba(249, 115, 22, 0.1)", text: "#F97316" },
    purple: { bg: theme.primaryLight, text: theme.primaryColor },
    red: { bg: "rgba(239, 68, 68, 0.1)", text: "#EF4444" },
  };
  
  const bgColor = theme.isDarkMode 
    ? { bg: "rgba(255, 255, 255, 0.06)", text: theme.primaryColor }
    : (bgColors[color] || bgColors.blue);
    
  return (
    <div
      className="p-7 rounded-[2.5rem] shadow-sm flex items-center gap-6 transition-all hover:shadow-md cursor-pointer"
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
        <h3 className="text-2xl font-black tracking-tight" style={{ color: theme.textPrimary }}>
          {value}
        </h3>
      </div>
    </div>
  );
}

function CompactClubCard({ club, onViewDetails, disabled, theme }) {
  const clubName = club.clubName || "Unnamed Club";
  const clubDescription = club.desc || club.description || "No description available";
  const memberCount = club.memberCount ?? 0;
  const clubLogo = club.logo || null;

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
            <img src={clubLogo} alt={clubName} className="w-7 h-7 object-contain" />
          ) : (
            <Trophy className="w-6 h-6" style={{ color: bgColor.text }} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3
            className="font-extrabold text-lg truncate pr-2"
            style={{ color: theme.textPrimary }}
            title={clubName}
          >
            {clubName}
          </h3>
          <p className="text-sm line-clamp-2 mb-2" style={{ color: theme.textSecondary }} title={clubDescription}>
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

function ActionCard({ icon, label, color, onClick, theme }) {
  const themes = {
    blue: { bg: theme.primaryLight, icon: theme.primaryColor },
    red: { bg: "rgba(239, 68, 68, 0.05)", icon: "#EF4444" },
    teal: { bg: theme.primaryLight, icon: theme.primaryColor },
    orange: { bg: "rgba(249, 115, 22, 0.05)", icon: "#F97316" },
  };
  
  const themeConfig = theme.isDarkMode 
    ? { bg: "rgba(255, 255, 255, 0.03)", icon: theme.primaryColor }
    : (themes[color] || themes.blue);
    
  return (
    <button
      onClick={onClick}
      className={`p-8 rounded-2xl border transition-all hover:scale-[1.02] flex flex-col items-center justify-center gap-4 group shadow-sm cursor-pointer w-full`}
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