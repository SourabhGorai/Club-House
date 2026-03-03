import { useFilteredUsersCount } from "./UserRemoveFromClub";
import {
  Calendar,
  Trophy,
  Users,
  User,
  Plus,
  Upload,
  X,
  Edit,
  LogOut,
  LayoutDashboard,
  Settings,
  BookOpen,
  Trash2,
  Mail,
  GraduationCap,
  Building2,
  CalendarPlus,
  ChevronRight,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import ConfirmDialog from "../../components/ConfirmDialog";

export default function TeachersDashboard() {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Current user state
  const [currentUser, setCurrentUser] = useState({
    username: user?.username || "",
    email: user?.email || "",
    role: user?.role || "TEACHER",
    prn: user?.prn || "",
    verified: user?.verified || false,
  });

  // Email update states
  const [showEmailEditModal, setShowEmailEditModal] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailMessage, setEmailMessage] = useState({ text: "", type: "" });

  // Profile states
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [profileData, setProfileData] = useState({
    prn: user?.prn || "",
    fullName: "",
    departmentId: "",
    phoneNumber: "",
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [error, setError] = useState(null);
  const [isLoadingClubs, setIsLoadingClubs] = useState(false);
  const [showAllClubs, setShowAllClubs] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: "", message: "", variant: "primary", confirmText: "Confirm", onConfirm: () => {} });
  const closeConfirm = () => setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
  const assignedStudentsCount = useFilteredUsersCount();

  useEffect(() => {
    fetchUserProfile();
    fetchDepartments();
    fetchUserClubs();
  }, []);

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

  const fetchDepartments = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/department", {
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

  const fetchUserProfile = async () => {
    try {
      setIsLoadingProfile(true);
      const response = await axios.get(
        `http://localhost:8080/api/profiles/prn/${user?.prn}`,
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
      const response = await axios.get(
        `http://localhost:8080/api/profiles/${user?.prn}/image`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        },
      );
      if (response.data) setProfileImage(URL.createObjectURL(response.data));
    } catch (error) {
      setProfileImage(null);
    }
  };

  // Handle verification redirect
  const handleVerificationRedirect = () => {
    localStorage.setItem("verificationEmail", currentUser.email);
    localStorage.setItem("verificationPRN", currentUser.prn);
    navigate("/otp");
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/login";
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
      setMessage("Error saving profile.");
    } finally {
      setProfileLoading(false);
    }
  };

  const getDepartmentName = (id) => {
    if (typeof id === "string" && isNaN(id)) return id;
    const dept = departments.find((d) => d.departmentId === parseInt(id));
    return dept ? dept.name : "Not set";
  };

  const fetchUserClubs = async () => {
    setIsLoadingClubs(true);
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("No authentication token found");
        return;
      }

      const response = await axios.get(
        "http://localhost:8080/api/user-clubs/getMyClubs",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

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

  const displayClubs = showAllClubs ? clubs : clubs.slice(0, 4); // Show 4 clubs initially for better visibility

  return (
    <>
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <aside className="w-96 bg-white border-r border-gray-100 flex flex-col p-8 sticky top-0 h-screen shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div
            className="p-2 rounded-xl"
            style={{ background: "linear-gradient(135deg, #4CA1AF, #315169)" }}
          >
            <GraduationCap className="text-white w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
            Teacher<span style={{ color: "#4CA1AF" }}>Hub</span>
          </h1>
        </div>

        {/* Profile Image Section */}
        <div className="relative group mx-auto mb-6">
          <div className="w-40 h-40 rounded-[2.5rem] overflow-hidden border-8 border-gray-50 shadow-inner bg-gray-100">
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <User size={48} />
              </div>
            )}
          </div>
          <button
            onClick={() => setShowProfileForm(true)}
            className="absolute bottom-1 right-1 bg-white p-2.5 rounded-2xl shadow-xl border border-gray-100 transition-transform hover:scale-110 cursor-pointer"
            style={{ color: "#4CA1AF" }}
          >
            <Edit size={18} />
          </button>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight leading-tight">
            {profileData.fullName || user?.username}
          </h2>
          <span
            className="mt-2 inline-block text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest"
            style={{
              backgroundColor: "rgba(76, 161, 175, 0.1)",
              color: "#4CA1AF",
            }}
          >
            {user?.role || "PROFESSOR"}
          </span>
        </div>

        {/* Info Boxes */}
        <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar pb-4">
          <SidebarInfoBox label="Full Name" value={profileData.fullName} />
          <SidebarInfoBox label="Username" value={user?.username} />
          <SidebarInfoBox label="Staff ID" value={profileData.prn} />
          
          {/* Email field with edit and verify buttons */}
          <div className="p-4 bg-gray-50/50 rounded-[1.2rem] border border-transparent transition-colors group cursor-pointer">
            <p className="text-[9px] uppercase font-black text-gray-400 mb-1 tracking-widest transition-colors group-hover:text-[#4CA1AF]">Email</p>
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-bold text-sm truncate pr-2">{currentUser.email}</span>
              <div className="flex gap-1">
                {/* Edit button */}
                <button
                  onClick={() => {
                    setNewEmail(currentUser.email);
                    setShowEmailEditModal(true);
                  }}
                  className="p-1.5 rounded-lg hover:bg-gray-200 transition-all duration-200 hover:scale-110 flex-shrink-0 cursor-pointer"
                  style={{ color: "#4CA1AF" }}
                  title="Edit email"
                >
                  <Edit size={14} />
                </button>

                {/* Verify button */}
                <button
                  onClick={handleVerificationRedirect}
                  className={`p-1.5 rounded-lg transition-all duration-200 hover:scale-110 flex-shrink-0 cursor-pointer flex items-center gap-1 ${
                    currentUser.verified
                      ? "bg-green-50 text-green-600 hover:bg-green-100"
                      : "bg-amber-50 text-amber-600 hover:bg-amber-100"
                  }`}
                  title={currentUser.verified ? "Verified" : "Click to verify"}
                >
                  {currentUser.verified ? (
                    <CheckCircle size={14} />
                  ) : (
                    <AlertCircle size={14} />
                  )}
                </button>
              </div>
            </div>
          </div>

          <SidebarInfoBox
            label="Department"
            value={getDepartmentName(profileData.departmentId)}
          />
          <SidebarInfoBox label="Phone" value={profileData.phoneNumber} />
        </div>

        {/* Sign Out Button */}
        <button
          onClick={() => setConfirmDialog({ isOpen: true, title: "Sign Out", message: "Are you sure you want to sign out?", confirmText: "Sign Out", variant: "danger", onConfirm: () => { closeConfirm(); handleLogout(); } })}
          className="mt-4 flex items-center justify-center gap-3 text-red-500 font-bold py-4 hover:bg-red-50 rounded-[1.5rem] transition-all border border-transparent hover:border-red-100 cursor-pointer"
        >
          <LogOut size={20} /> Sign Out
        </button>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-10 overflow-y-auto max-h-screen">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
              Dashboard
            </h1>
            <p className="text-gray-500 mt-1">
              Welcome back,{" "}
              <span className="font-semibold" style={{ color: "#4CA1AF" }}>
                Prof. {profileData.fullName || user?.username}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-3 bg-green-50 text-green-600 px-5 py-2.5 rounded-full border border-green-100">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-bold uppercase tracking-widest">
              All Systems Live
            </span>
          </div>
        </header>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <StatCard
            icon={<Calendar />}
            label="Events Managed"
            value="0"
            color="blue"
          />
          <StatCard
            icon={<Trophy />}
            label="My Clubs"
            value={clubs.length.toString()}
            color="green"
          />
          <StatCard
            icon={<Users />}
            label="Assigned Students"
            value={assignedStudentsCount.toString()}
            color="orange"
          />
        </div>

        {/* Two Column Layout - Expanded boxes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT COLUMN - Professor Control Center - EXPANDED */}
          <section className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-50 h-fit">
            <div className="flex items-center gap-3 mb-10">
              <div
                className="w-1.5 h-10 rounded-full"
                style={{
                  background: "linear-gradient(to bottom, #4CA1AF, #315169)",
                }}
              ></div>
              <h2 className="text-2xl font-bold text-gray-800">
                Professor Control Center
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <ActionCard
                icon={<CalendarPlus size={24} />}
                label="Events"
                color="blue"
                onClick={() => navigate("/events")}
              />
              <ActionCard
                icon={<Trash2 size={24} />}
                label="Delete Event"
                color="red"
                onClick={() => {}}
              />
              <ActionCard
                icon={<Users size={24} />}
                label="Add Student"
                color="teal"
                onClick={() => navigate("/add-users-with-club")}
              />
              <ActionCard
                icon={<Building2 size={24} />}
                label="Club Association"
                color="orange"
                onClick={() => navigate("/remove-users-from-club")}
              />
            </div>
          </section>

          {/* RIGHT COLUMN - My Clubs Section - EXPANDED */}
          <section className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-50">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-800">My Clubs</h2>
                <div className="h-[1px] w-16 bg-gray-100"></div>
              </div>
              <button
                onClick={fetchUserClubs}
                className="text-xs font-bold px-5 py-2.5 rounded-full transition-colors flex items-center gap-2 cursor-pointer"
                style={{
                  color: "#4CA1AF",
                  backgroundColor: "rgba(76, 161, 175, 0.1)",
                }}
                disabled={isLoadingClubs}
              >
                <svg
                  className={`w-4 h-4 ${isLoadingClubs ? "animate-spin" : ""}`}
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
                {isLoadingClubs ? "Refreshing..." : "Refresh"}
              </button>
            </div>

            {/* Clubs Content - Expanded with more space */}
            {isLoadingClubs ? (
              <div className="py-16 text-center">
                <div
                  className="animate-spin w-12 h-12 border-4 rounded-full mx-auto mb-4"
                  style={{
                    borderColor: "rgba(76, 161, 175, 0.2)",
                    borderTopColor: "#4CA1AF",
                  }}
                ></div>
                <p className="text-gray-500 font-medium">Loading your clubs...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 rounded-[2rem] p-8 text-center border border-red-100">
                <div className="text-red-500 mb-3">
                  <svg
                    className="w-16 h-16 mx-auto"
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
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  Unable to Load Clubs
                </h3>
                <p className="text-red-500/70 mb-5">{error}</p>
                <button
                  onClick={fetchUserClubs}
                  className="bg-white px-8 py-3 rounded-full text-sm font-bold border transition-colors cursor-pointer"
                  style={{
                    color: "#4CA1AF",
                    borderColor: "rgba(76, 161, 175, 0.2)",
                  }}
                >
                  Try Again
                </button>
              </div>
            ) : clubs.length === 0 ? (
              <div className="py-16 text-center border-2 border-dashed border-gray-200 rounded-[2rem]">
                <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-5">
                  <Trophy className="text-gray-400 w-12 h-12" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  No Clubs Assigned Yet
                </h3>
                <p className="text-gray-500 mb-8">
                  You haven't been assigned to any clubs yet.
                </p>
                <button
                  className="text-white px-10 py-4 rounded-full text-sm font-bold shadow-lg transition-colors cursor-pointer"
                  style={{
                    background: "linear-gradient(135deg, #4CA1AF, #315169)",
                  }}
                >
                  Browse Clubs
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-5">
                  {displayClubs.map((club) => (
                    <CompactClubCard
                      key={club.clubId}
                      club={club}
                      onViewDetails={handleViewClubDetails}
                    />
                  ))}
                </div>

                {/* Show More/Less Button */}
                {clubs.length > 4 && (
                  <div className="text-center mt-8">
                    <button
                      onClick={() => setShowAllClubs(!showAllClubs)}
                      className="bg-white px-8 py-4 rounded-full text-sm font-bold border transition-colors inline-flex items-center gap-2 cursor-pointer"
                      style={{
                        color: "#4CA1AF",
                        borderColor: "rgba(76, 161, 175, 0.2)",
                      }}
                    >
                      {showAllClubs
                        ? "Show Less"
                        : `Show All (${clubs.length} Clubs)`}
                      <svg
                        className={`w-4 h-4 transition-transform ${
                          showAllClubs ? "rotate-180" : ""
                        }`}
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
        </div>
      </main>

      {/* Profile Form Modal */}
      {showProfileForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-xl w-full p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold text-gray-800">
                {userProfile ? "Edit Profile" : "Complete Profile"}
              </h3>
              <button
                onClick={() => setShowProfileForm(false)}
                className="bg-gray-50 p-2 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"
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
                />
                <FormInput
                  label="Full Name"
                  value={profileData.fullName}
                  onChange={(e) =>
                    setProfileData({ ...profileData, fullName: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 ml-1 uppercase tracking-widest">
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
                    className="w-full px-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 outline-none text-gray-700 font-medium cursor-pointer"
                    style={{ focus: { ringColor: "#4CA1AF" } }}
                    required
                  >
                    <option value="">Select Dept</option>
                    {departments.map((dept) => (
                      <option key={dept.departmentId} value={dept.departmentId}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 ml-1 uppercase tracking-widest">
                    Year
                  </label>
                  <select
                    value={profileData.year}
                    onChange={(e) =>
                      setProfileData({ ...profileData, year: e.target.value })
                    }
                    className="w-full px-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 outline-none text-gray-700 font-medium cursor-pointer"
                    style={{ focus: { ringColor: "#4CA1AF" } }}
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
              />

              <div
                className="bg-gray-50 p-6 rounded-2xl border-2 border-dashed border-gray-200 text-center transition-colors cursor-pointer"
                style={{ hover: { borderColor: "#4CA1AF" } }}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedImage(e.target.files[0])}
                  className="hidden"
                  id="profile-upload"
                />
                <label
                  htmlFor="profile-upload"
                  className="cursor-pointer flex flex-col items-center gap-2 text-gray-500 hover:text-[#4CA1AF]"
                >
                  <Upload size={24} />
                  <span className="text-sm font-semibold">
                    {selectedImage ? selectedImage.name : "Upload Profile Photo"}
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={profileLoading}
                className="w-full text-white py-4 rounded-2xl font-bold shadow-lg transition-all disabled:opacity-50 cursor-pointer"
                style={{
                  background: "linear-gradient(135deg, #4CA1AF, #315169)",
                }}
              >
                {profileLoading
                  ? "Saving..."
                  : userProfile
                  ? "Update Profile"
                  : "Complete Profile"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Email Edit Modal - with Update Email button that auto-sends OTP */}
      {showEmailEditModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full overflow-hidden border border-white">
            <div
              className="p-6 text-white"
              style={{
                background: `linear-gradient(135deg, #4CA1AF, #315169)`,
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                  style={{
                    outline: "none",
                    "--tw-ring-color": "#4CA1AF",
                  }}
                  onFocus={(e) =>
                    (e.target.style.boxShadow = `0 0 0 2px rgba(76, 161, 175, 0.2)`)
                  }
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

              <div className="flex space-x-4 pt-4">
                {/* Update Email Button - Update then Auto-send OTP and Verify */}
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
                      // Try updating via users endpoint with PUT
                      const response = await axios.put(
                        `http://localhost:8080/api/users/${currentUser.prn}`,
                        { 
                          email: newEmail,
                          username: currentUser.username,
                          role: currentUser.role 
                        },
                        {
                          headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                          },
                        }
                      );

                      if (response.data) {
                        // Update local storage and state with new email
                        const updatedUser = { ...currentUser, email: newEmail, verified: false };
                        localStorage.setItem("user", JSON.stringify(updatedUser));
                        setCurrentUser(updatedUser);
                        
                        // Show updating message
                        setEmailMessage({
                          text: "Email updated! Sending OTP to new email...",
                          type: "success",
                        });

                        // Automatically send OTP to the new email
                        try {
                          await axios.post(
                            "http://localhost:8080/api/auth/forgot-password",
                            { email: newEmail }
                          );
                          
                          // Store OTP verification data
                          localStorage.setItem("verificationEmail", newEmail);
                          localStorage.setItem("verificationOldEmail", currentUser.email);
                          localStorage.setItem("verificationPRN", currentUser.prn);
                          localStorage.setItem("verificationMode", "email_change");
                          localStorage.setItem("verificationReturnUrl", "/teachers-dashboard");
                          
                          // Close modal and navigate to OTP page
                          setTimeout(() => {
                            setShowEmailEditModal(false);
                            setEmailMessage({ text: "", type: "" });
                            setNewEmail("");
                            navigate("/otp");
                          }, 1500);
                        } catch (otpError) {
                          console.error("Error sending OTP:", otpError);
                          setEmailMessage({
                            text: "Email updated but failed to send OTP. Please try resending.",
                            type: "error",
                          });
                          setEmailLoading(false);
                        }
                      }
                    } catch (error) {
                      console.error("Error with PUT /api/users/{prn}:", error);
                      
                      // Try PATCH method as fallback
                      try {
                        const patchResponse = await axios.patch(
                          `http://localhost:8080/api/users/${currentUser.prn}`,
                          { email: newEmail },
                          {
                            headers: {
                              Authorization: `Bearer ${token}`,
                              "Content-Type": "application/json",
                            },
                          }
                        );

                        if (patchResponse.data) {
                          const updatedUser = { ...currentUser, email: newEmail, verified: false };
                          localStorage.setItem("user", JSON.stringify(updatedUser));
                          setCurrentUser(updatedUser);
                          
                          setEmailMessage({
                            text: "Email updated! Sending OTP to new email...",
                            type: "success",
                          });

                          // Automatically send OTP to the new email
                          try {
                            await axios.post(
                              "http://localhost:8080/api/auth/forgot-password",
                              { email: newEmail }
                            );
                            
                            localStorage.setItem("verificationEmail", newEmail);
                            localStorage.setItem("verificationOldEmail", currentUser.email);
                            localStorage.setItem("verificationPRN", currentUser.prn);
                            localStorage.setItem("verificationMode", "email_change");
                            localStorage.setItem("verificationReturnUrl", "/teachers-dashboard");
                            
                            setTimeout(() => {
                              setShowEmailEditModal(false);
                              setEmailMessage({ text: "", type: "" });
                              setNewEmail("");
                              navigate("/otp");
                            }, 1500);
                          } catch (otpError) {
                            console.error("Error sending OTP:", otpError);
                            setEmailMessage({
                              text: "Email updated but failed to send OTP. Please try resending.",
                              type: "error",
                            });
                            setEmailLoading(false);
                          }
                        }
                      } catch (patchError) {
                        console.error("Error with PATCH /api/users/{prn}:", patchError);
                        
                        // Try updating via auth/update endpoint
                        try {
                          const authResponse = await axios.post(
                            "http://localhost:8080/api/auth/update",
                            {
                              prn: currentUser.prn,
                              email: newEmail,
                              username: currentUser.username
                            },
                            {
                              headers: {
                                Authorization: `Bearer ${token}`,
                                "Content-Type": "application/json",
                              },
                            }
                          );

                          if (authResponse.data) {
                            const updatedUser = { ...currentUser, email: newEmail, verified: false };
                            localStorage.setItem("user", JSON.stringify(updatedUser));
                            setCurrentUser(updatedUser);
                            
                            setEmailMessage({
                              text: "Email updated! Sending OTP to new email...",
                              type: "success",
                            });

                            // Automatically send OTP to the new email
                            try {
                              await axios.post(
                                "http://localhost:8080/api/auth/forgot-password",
                                { email: newEmail }
                              );
                              
                              localStorage.setItem("verificationEmail", newEmail);
                              localStorage.setItem("verificationOldEmail", currentUser.email);
                              localStorage.setItem("verificationPRN", currentUser.prn);
                              localStorage.setItem("verificationMode", "email_change");
                              localStorage.setItem("verificationReturnUrl", "/teachers-dashboard");
                              
                              setTimeout(() => {
                                setShowEmailEditModal(false);
                                setEmailMessage({ text: "", type: "" });
                                setNewEmail("");
                                navigate("/otp");
                              }, 1500);
                            } catch (otpError) {
                              console.error("Error sending OTP:", otpError);
                              setEmailMessage({
                                text: "Email updated but failed to send OTP. Please try resending.",
                                type: "error",
                              });
                              setEmailLoading(false);
                            }
                          }
                        } catch (authError) {
                          console.error("Error with POST /api/auth/update:", authError);
                          
                          setEmailMessage({
                            text: "Unable to update email. Please check if you have permission or contact support.",
                            type: "error",
                          });
                        }
                      }
                    } finally {
                      setEmailLoading(false);
                    }
                  }}
                  disabled={emailLoading || !newEmail || newEmail === currentUser.email}
                  className="w-full text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                  style={{
                    background: `linear-gradient(135deg, #4CA1AF, #315169)`,
                  }}
                >
                  {emailLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Updating & Sending OTP...
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

/* HELPER COMPONENTS */

function SidebarInfoBox({ label, value }) {
  return (
    <div className="p-4 bg-gray-50/50 rounded-[1.2rem] border border-transparent transition-colors group cursor-pointer">
      <p className="text-[9px] uppercase font-black text-gray-400 mb-1 tracking-widest transition-colors group-hover:text-[#4CA1AF]">
        {label}
      </p>
      <p className="text-gray-700 font-bold text-sm truncate">
        {value || "Not set"}
      </p>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  const bgColors = {
    blue: { bg: "rgba(76, 161, 175, 0.1)", text: "#4CA1AF" },
    green: { bg: "rgba(16, 185, 129, 0.1)", text: "#10B981" },
    orange: { bg: "rgba(249, 115, 22, 0.1)", text: "#F97316" },
  };
  return (
    <div className="bg-white p-7 rounded-[2.5rem] shadow-sm border border-gray-50 flex items-center gap-6 cursor-pointer hover:shadow-md transition-all">
      <div
        className="p-5 rounded-[1.5rem]"
        style={{
          backgroundColor: bgColors[color].bg,
          color: bgColors[color].text,
        }}
      >
        {icon}
      </div>
      <div>
        <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">
          {label}
        </p>
        <h3 className="text-2xl font-black tracking-tight text-gray-800">
          {value}
        </h3>
      </div>
    </div>
  );
}

// Compact Club Card - Expanded version
function CompactClubCard({ club, onViewDetails }) {
  const clubName = club.clubName || "Unnamed Club";
  const clubDescription = club.desc || club.description || "No description available";
  const memberCount = club.memberCount || "0";
  const clubLogo = club.logo || null;

  // Generate a consistent color based on club name
  const colors = ["blue", "orange", "purple", "green", "red"];
  const colorIndex = clubName.length % colors.length;
  const color = colors[colorIndex];

  const bgColors = {
    blue: { bg: "rgba(76, 161, 175, 0.1)", text: "#4CA1AF" },
    orange: { bg: "rgba(249, 115, 22, 0.1)", text: "#F97316" },
    purple: { bg: "rgba(76, 161, 175, 0.1)", text: "#4CA1AF" },
    green: { bg: "rgba(16, 185, 129, 0.1)", text: "#10B981" },
    red: { bg: "rgba(239, 68, 68, 0.1)", text: "#EF4444" },
  };

  const handleCardClick = () => {
    onViewDetails(club);
  };

  return (
    <div
      className="bg-gray-50/50 rounded-2xl p-5 hover:bg-gray-50 transition-all cursor-pointer border border-transparent hover:border-gray-200"
      onClick={handleCardClick}
    >
      <div className="flex items-center gap-4">
        {/* Club Logo/Icon - Larger */}
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: bgColors[color].bg }}
        >
          {clubLogo ? (
            <img src={clubLogo} alt={clubName} className="w-7 h-7 object-contain" />
          ) : (
            <Trophy className="w-6 h-6" style={{ color: bgColors[color].text }} />
          )}
        </div>

        {/* Club Details - More spacing */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-extrabold text-gray-800 text-lg truncate pr-2" title={clubName}>
              {clubName}
            </h3>
            <span className="text-[9px] font-black bg-white px-3 py-1 rounded-full text-gray-600 uppercase tracking-wider whitespace-nowrap">
              CLUB
            </span>
          </div>

          <p className="text-sm text-gray-500 mt-1 line-clamp-2 mb-2" title={clubDescription}>
            {clubDescription}
          </p>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-bold text-gray-600">{memberCount} members</span>
            </div>
          </div>
        </div>
        
        {/* Chevron indicator */}
        <ChevronRight size={20} className="text-gray-300" />
      </div>
    </div>
  );
}

function ActionCard({ icon, label, color, onClick }) {
  const themes = {
    blue: {
      bg: "rgba(76, 161, 175, 0.05)",
      hover: "rgba(76, 161, 175, 0.1)",
      icon: "#4CA1AF",
    },
    red: {
      bg: "rgba(239, 68, 68, 0.05)",
      hover: "rgba(239, 68, 68, 0.1)",
      icon: "#EF4444",
    },
    teal: {
      bg: "rgba(76, 161, 175, 0.05)",
      hover: "rgba(76, 161, 175, 0.1)",
      icon: "#4CA1AF",
    },
    orange: {
      bg: "rgba(249, 115, 22, 0.05)",
      hover: "rgba(249, 115, 22, 0.1)",
      icon: "#F97316",
    },
  };
  return (
    <button
      onClick={onClick}
      className="p-8 rounded-2xl border border-gray-50/50 transition-all hover:scale-[1.02] flex flex-col items-center justify-center gap-4 group shadow-sm cursor-pointer w-full"
      style={{ backgroundColor: themes[color].bg }}
    >
      <div
        className="p-4 bg-white rounded-xl shadow-sm group-hover:shadow-md transition-all group-hover:-translate-y-1"
        style={{ color: themes[color].icon }}
      >
        {icon}
      </div>
      <span className="font-black text-gray-700 uppercase text-xs tracking-widest">
        {label}
      </span>
    </button>
  );
}

function FormInput({ label, ...props }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-black text-gray-400 ml-1 uppercase tracking-widest">
        {label}
      </label>
      <input
        className="w-full px-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 outline-none text-gray-700 font-medium transition-all cursor-text"
        style={{ focus: { ringColor: "#4CA1AF" } }}
        {...props}
      />
    </div>
  );
}


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
// } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import { useState, useEffect } from "react";
// import axios from "axios";
// import ConfirmDialog from "../../components/ConfirmDialog";

// export default function TeachersDashboard() {
//   const user = JSON.parse(localStorage.getItem("user"));
//   const token = localStorage.getItem("token");
//   const navigate = useNavigate();

//   // Profile states
//   const [showProfileForm, setShowProfileForm] = useState(false);
//   const [profileData, setProfileData] = useState({
//     prn: user?.prn || "",
//     fullName: "",
//     departmentId: "",
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
//   const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: "", message: "", variant: "primary", confirmText: "Confirm", onConfirm: () => {} });
//   const closeConfirm = () => setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
//   const assignedStudentsCount = useFilteredUsersCount();

//   useEffect(() => {
//     fetchUserProfile();
//     fetchDepartments();
//     fetchUserClubs();
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
//         `http://localhost:8080/api/profiles/prn/${user?.prn}`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         },
//       );

//       if (response.data) {
//         setUserProfile(response.data);
//         let deptId = "";
//         if (response.data.data.department) {
//           deptId =
//             typeof response.data.data.department === "object"
//               ? response.data.data.department.departmentId
//               : response.data.data.department;
//         }
//         setProfileData({
//           prn: response.data.data.prn || user?.prn || "",
//           fullName: response.data.data.fullName || "",
//           departmentId: deptId,
//           phoneNumber: response.data.data.phoneNumber || "",
//         });
//         fetchProfileImage();
//       }
//     } catch (error) {
//       console.error("Error fetching profile:", error);
//     } finally {
//       setIsLoadingProfile(false);
//     }
//   };

//   const fetchProfileImage = async () => {
//     try {
//       const response = await axios.get(
//         `http://localhost:8080/api/profiles/${user?.prn}/image`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//           responseType: "blob",
//         },
//       );
//       if (response.data) setProfileImage(URL.createObjectURL(response.data));
//     } catch (error) {
//       setProfileImage(null);
//     }
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
//         "http://localhost:8080/api/user-clubs/getMyClubs",
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         },
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

//   const displayClubs = showAllClubs ? clubs : clubs.slice(0, 4); // Show 4 clubs initially for better visibility

//   return (
//     <>
//     <div className="flex min-h-screen bg-[#F8FAFC]">
//       <aside className="w-96 bg-white border-r border-gray-100 flex flex-col p-8 sticky top-0 h-screen shadow-sm">
//         <div className="flex items-center gap-3 mb-8">
//           <div
//             className="p-2 rounded-xl"
//             style={{ background: "linear-gradient(135deg, #4CA1AF, #315169)" }}
//           >
//             <GraduationCap className="text-white w-7 h-7" />
//           </div>
//           <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
//             Teacher<span style={{ color: "#4CA1AF" }}>Hub</span>
//           </h1>
//         </div>

//         {/* Profile Image Section */}
//         <div className="relative group mx-auto mb-6">
//           <div className="w-40 h-40 rounded-[2.5rem] overflow-hidden border-8 border-gray-50 shadow-inner bg-gray-100">
//             {profileImage ? (
//               <img
//                 src={profileImage}
//                 alt="Profile"
//                 className="w-full h-full object-cover"
//               />
//             ) : (
//               <div className="w-full h-full flex items-center justify-center text-gray-400">
//                 <User size={48} />
//               </div>
//             )}
//           </div>
//           <button
//             onClick={() => setShowProfileForm(true)}
//             className="absolute bottom-1 right-1 bg-white p-2.5 rounded-2xl shadow-xl border border-gray-100 transition-transform hover:scale-110 cursor-pointer"
//             style={{ color: "#4CA1AF" }}
//           >
//             <Edit size={18} />
//           </button>
//         </div>

//         <div className="text-center mb-6">
//           <h2 className="text-2xl font-bold text-gray-800 tracking-tight leading-tight">
//             {profileData.fullName || user?.username}
//           </h2>
//           <span
//             className="mt-2 inline-block text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest"
//             style={{
//               backgroundColor: "rgba(76, 161, 175, 0.1)",
//               color: "#4CA1AF",
//             }}
//           >
//             {user?.role || "PROFESSOR"}
//           </span>
//         </div>

//         {/* Info Boxes */}
//         <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar pb-4">
//           <SidebarInfoBox label="Full Name" value={profileData.fullName} />
//           <SidebarInfoBox label="Username" value={user?.username} />
//           <SidebarInfoBox label="Staff ID" value={profileData.prn} />
//           <SidebarInfoBox label="Email" value={user?.email} />
//           <SidebarInfoBox
//             label="Department"
//             value={getDepartmentName(profileData.departmentId)}
//           />
//           <SidebarInfoBox label="Phone" value={profileData.phoneNumber} />
//         </div>

//         {/* Sign Out Button */}
//         <button
//           onClick={() => setConfirmDialog({ isOpen: true, title: "Sign Out", message: "Are you sure you want to sign out?", confirmText: "Sign Out", variant: "danger", onConfirm: () => { closeConfirm(); handleLogout(); } })}
//           className="mt-4 flex items-center justify-center gap-3 text-red-500 font-bold py-4 hover:bg-red-50 rounded-[1.5rem] transition-all border border-transparent hover:border-red-100 cursor-pointer"
//         >
//           <LogOut size={20} /> Sign Out
//         </button>
//       </aside>

//       {/* MAIN CONTENT AREA */}
//       <main className="flex-1 p-10 overflow-y-auto max-h-screen">
//         <header className="flex justify-between items-center mb-10">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
//               Dashboard
//             </h1>
//             <p className="text-gray-500 mt-1">
//               Welcome back,{" "}
//               <span className="font-semibold" style={{ color: "#4CA1AF" }}>
//                 Prof. {profileData.fullName || user?.username}
//               </span>
//             </p>
//           </div>
//           <div className="flex items-center gap-3 bg-green-50 text-green-600 px-5 py-2.5 rounded-full border border-green-100">
//             <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
//             <span className="text-xs font-bold uppercase tracking-widest">
//               All Systems Live
//             </span>
//           </div>
//         </header>

//         {/* Statistics Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
//           <StatCard
//             icon={<Calendar />}
//             label="Events Managed"
//             value="0"
//             color="blue"
//           />
//           <StatCard
//             icon={<Trophy />}
//             label="My Clubs"
//             value={clubs.length.toString()}
//             color="green"
//           />
//           <StatCard
//             icon={<Users />}
//             label="Assigned Students"
//             value={assignedStudentsCount.toString()}
//             color="orange"
//           />
//         </div>

//         {/* Two Column Layout - Expanded boxes */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//           {/* LEFT COLUMN - Professor Control Center - EXPANDED */}
//           <section className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-50 h-fit">
//             <div className="flex items-center gap-3 mb-10">
//               <div
//                 className="w-1.5 h-10 rounded-full"
//                 style={{
//                   background: "linear-gradient(to bottom, #4CA1AF, #315169)",
//                 }}
//               ></div>
//               <h2 className="text-2xl font-bold text-gray-800">
//                 Professor Control Center
//               </h2>
//             </div>

//             <div className="grid grid-cols-2 gap-8">
//               <ActionCard
//                 icon={<CalendarPlus size={24} />}
//                 label="Events"
//                 color="blue"
//                 onClick={() => navigate("/events")}
//               />
//               <ActionCard
//                 icon={<Trash2 size={24} />}
//                 label="Delete Event"
//                 color="red"
//                 onClick={() => {}}
//               />
//               <ActionCard
//                 icon={<Users size={24} />}
//                 label="Add Student"
//                 color="teal"
//                 onClick={() => navigate("/add-users-with-club")}
//               />
//               <ActionCard
//                 icon={<Building2 size={24} />}
//                 label="Club Association"
//                 color="orange"
//                 onClick={() => navigate("/remove-users-from-club")}
//               />
//             </div>
//           </section>

//           {/* RIGHT COLUMN - My Clubs Section - EXPANDED */}
//           <section className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-50">
//             <div className="flex items-center justify-between mb-8">
//               <div className="flex items-center gap-4">
//                 <h2 className="text-2xl font-bold text-gray-800">My Clubs</h2>
//                 <div className="h-[1px] w-16 bg-gray-100"></div>
//               </div>
//               <button
//                 onClick={fetchUserClubs}
//                 className="text-xs font-bold px-5 py-2.5 rounded-full transition-colors flex items-center gap-2 cursor-pointer"
//                 style={{
//                   color: "#4CA1AF",
//                   backgroundColor: "rgba(76, 161, 175, 0.1)",
//                 }}
//                 disabled={isLoadingClubs}
//               >
//                 <svg
//                   className={`w-4 h-4 ${isLoadingClubs ? "animate-spin" : ""}`}
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   stroke="currentColor"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
//                   />
//                 </svg>
//                 {isLoadingClubs ? "Refreshing..." : "Refresh"}
//               </button>
//             </div>

//             {/* Clubs Content - Expanded with more space */}
//             {isLoadingClubs ? (
//               <div className="py-16 text-center">
//                 <div
//                   className="animate-spin w-12 h-12 border-4 rounded-full mx-auto mb-4"
//                   style={{
//                     borderColor: "rgba(76, 161, 175, 0.2)",
//                     borderTopColor: "#4CA1AF",
//                   }}
//                 ></div>
//                 <p className="text-gray-500 font-medium">Loading your clubs...</p>
//               </div>
//             ) : error ? (
//               <div className="bg-red-50 rounded-[2rem] p-8 text-center border border-red-100">
//                 <div className="text-red-500 mb-3">
//                   <svg
//                     className="w-16 h-16 mx-auto"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                     stroke="currentColor"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//                     />
//                   </svg>
//                 </div>
//                 <h3 className="text-xl font-bold text-gray-800 mb-3">
//                   Unable to Load Clubs
//                 </h3>
//                 <p className="text-red-500/70 mb-5">{error}</p>
//                 <button
//                   onClick={fetchUserClubs}
//                   className="bg-white px-8 py-3 rounded-full text-sm font-bold border transition-colors cursor-pointer"
//                   style={{
//                     color: "#4CA1AF",
//                     borderColor: "rgba(76, 161, 175, 0.2)",
//                   }}
//                 >
//                   Try Again
//                 </button>
//               </div>
//             ) : clubs.length === 0 ? (
//               <div className="py-16 text-center border-2 border-dashed border-gray-200 rounded-[2rem]">
//                 <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-5">
//                   <Trophy className="text-gray-400 w-12 h-12" />
//                 </div>
//                 <h3 className="text-xl font-bold text-gray-800 mb-3">
//                   No Clubs Assigned Yet
//                 </h3>
//                 <p className="text-gray-500 mb-8">
//                   You haven't been assigned to any clubs yet.
//                 </p>
//                 <button
//                   className="text-white px-10 py-4 rounded-full text-sm font-bold shadow-lg transition-colors cursor-pointer"
//                   style={{
//                     background: "linear-gradient(135deg, #4CA1AF, #315169)",
//                   }}
//                 >
//                   Browse Clubs
//                 </button>
//               </div>
//             ) : (
//               <>
//                 <div className="space-y-5">
//                   {displayClubs.map((club) => (
//                     <CompactClubCard
//                       key={club.clubId}
//                       club={club}
//                       onViewDetails={handleViewClubDetails}
//                     />
//                   ))}
//                 </div>

//                 {/* Show More/Less Button */}
//                 {clubs.length > 4 && (
//                   <div className="text-center mt-8">
//                     <button
//                       onClick={() => setShowAllClubs(!showAllClubs)}
//                       className="bg-white px-8 py-4 rounded-full text-sm font-bold border transition-colors inline-flex items-center gap-2 cursor-pointer"
//                       style={{
//                         color: "#4CA1AF",
//                         borderColor: "rgba(76, 161, 175, 0.2)",
//                       }}
//                     >
//                       {showAllClubs
//                         ? "Show Less"
//                         : `Show All (${clubs.length} Clubs)`}
//                       <svg
//                         className={`w-4 h-4 transition-transform ${
//                           showAllClubs ? "rotate-180" : ""
//                         }`}
//                         fill="none"
//                         viewBox="0 0 24 24"
//                         stroke="currentColor"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M19 9l-7 7-7-7"
//                         />
//                       </svg>
//                     </button>
//                   </div>
//                 )}
//               </>
//             )}
//           </section>
//         </div>
//       </main>

//       {/* Profile Form Modal */}
//       {showProfileForm && (
//         <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
//           <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-xl w-full p-8">
//             <div className="flex justify-between items-center mb-8">
//               <h3 className="text-2xl font-bold text-gray-800">
//                 {userProfile ? "Edit Profile" : "Complete Profile"}
//               </h3>
//               <button
//                 onClick={() => setShowProfileForm(false)}
//                 className="bg-gray-50 p-2 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"
//               >
//                 <X size={20} />
//               </button>
//             </div>

//             <form onSubmit={handleSubmitProfile} className="space-y-5">
//               <div className="grid grid-cols-2 gap-4">
//                 <FormInput
//                   label="Staff ID (Read Only)"
//                   value={profileData.prn}
//                   readOnly
//                 />
//                 <FormInput
//                   label="Full Name"
//                   value={profileData.fullName}
//                   onChange={(e) =>
//                     setProfileData({ ...profileData, fullName: e.target.value })
//                   }
//                   required
//                 />
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-1">
//                   <label className="text-[10px] font-black text-gray-400 ml-1 uppercase tracking-widest">
//                     Department
//                   </label>
//                   <select
//                     value={profileData.departmentId}
//                     onChange={(e) =>
//                       setProfileData({
//                         ...profileData,
//                         departmentId: e.target.value,
//                       })
//                     }
//                     className="w-full px-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 outline-none text-gray-700 font-medium cursor-pointer"
//                     style={{ focus: { ringColor: "#4CA1AF" } }}
//                     required
//                   >
//                     <option value="">Select Dept</option>
//                     {departments.map((dept) => (
//                       <option key={dept.departmentId} value={dept.departmentId}>
//                         {dept.name}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//                 <div className="space-y-1">
//                   <label className="text-[10px] font-black text-gray-400 ml-1 uppercase tracking-widest">
//                     Year
//                   </label>
//                   <select
//                     value={profileData.year}
//                     onChange={(e) =>
//                       setProfileData({ ...profileData, year: e.target.value })
//                     }
//                     className="w-full px-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 outline-none text-gray-700 font-medium cursor-pointer"
//                     style={{ focus: { ringColor: "#4CA1AF" } }}
//                     required
//                   >
//                     <option value="">Select Year</option>
//                     {[1, 2, 3, 4].map((y) => (
//                       <option key={y} value={y}>
//                         Year {y}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               </div>

//               <FormInput
//                 label="Phone Number"
//                 value={profileData.phoneNumber}
//                 onChange={(e) =>
//                   setProfileData({
//                     ...profileData,
//                     phoneNumber: e.target.value,
//                   })
//                 }
//                 required
//               />

//               <div
//                 className="bg-gray-50 p-6 rounded-2xl border-2 border-dashed border-gray-200 text-center transition-colors cursor-pointer"
//                 style={{ hover: { borderColor: "#4CA1AF" } }}
//               >
//                 <input
//                   type="file"
//                   accept="image/*"
//                   onChange={(e) => setSelectedImage(e.target.files[0])}
//                   className="hidden"
//                   id="profile-upload"
//                 />
//                 <label
//                   htmlFor="profile-upload"
//                   className="cursor-pointer flex flex-col items-center gap-2 text-gray-500 hover:text-[#4CA1AF]"
//                 >
//                   <Upload size={24} />
//                   <span className="text-sm font-semibold">
//                     {selectedImage ? selectedImage.name : "Upload Profile Photo"}
//                   </span>
//                 </label>
//               </div>

//               <button
//                 type="submit"
//                 disabled={profileLoading}
//                 className="w-full text-white py-4 rounded-2xl font-bold shadow-lg transition-all disabled:opacity-50 cursor-pointer"
//                 style={{
//                   background: "linear-gradient(135deg, #4CA1AF, #315169)",
//                 }}
//               >
//                 {profileLoading
//                   ? "Saving..."
//                   : userProfile
//                   ? "Update Profile"
//                   : "Complete Profile"}
//               </button>
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

// /* HELPER COMPONENTS */

// function SidebarInfoBox({ label, value }) {
//   return (
//     <div className="p-4 bg-gray-50/50 rounded-[1.2rem] border border-transparent transition-colors group cursor-pointer">
//       <p className="text-[9px] uppercase font-black text-gray-400 mb-1 tracking-widest transition-colors group-hover:text-[#4CA1AF]">
//         {label}
//       </p>
//       <p className="text-gray-700 font-bold text-sm truncate">
//         {value || "Not set"}
//       </p>
//     </div>
//   );
// }

// function StatCard({ icon, label, value, color }) {
//   const bgColors = {
//     blue: { bg: "rgba(76, 161, 175, 0.1)", text: "#4CA1AF" },
//     green: { bg: "rgba(16, 185, 129, 0.1)", text: "#10B981" },
//     orange: { bg: "rgba(249, 115, 22, 0.1)", text: "#F97316" },
//   };
//   return (
//     <div className="bg-white p-7 rounded-[2.5rem] shadow-sm border border-gray-50 flex items-center gap-6 cursor-pointer hover:shadow-md transition-all">
//       <div
//         className="p-5 rounded-[1.5rem]"
//         style={{
//           backgroundColor: bgColors[color].bg,
//           color: bgColors[color].text,
//         }}
//       >
//         {icon}
//       </div>
//       <div>
//         <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">
//           {label}
//         </p>
//         <h3 className="text-2xl font-black tracking-tight text-gray-800">
//           {value}
//         </h3>
//       </div>
//     </div>
//   );
// }

// // Compact Club Card - Expanded version
// function CompactClubCard({ club, onViewDetails }) {
//   const clubName = club.clubName || "Unnamed Club";
//   const clubDescription = club.desc || club.description || "No description available";
//   const memberCount = club.memberCount || "0";
//   const clubLogo = club.logo || null;

//   // Generate a consistent color based on club name
//   const colors = ["blue", "orange", "purple", "green", "red"];
//   const colorIndex = clubName.length % colors.length;
//   const color = colors[colorIndex];

//   const bgColors = {
//     blue: { bg: "rgba(76, 161, 175, 0.1)", text: "#4CA1AF" },
//     orange: { bg: "rgba(249, 115, 22, 0.1)", text: "#F97316" },
//     purple: { bg: "rgba(76, 161, 175, 0.1)", text: "#4CA1AF" },
//     green: { bg: "rgba(16, 185, 129, 0.1)", text: "#10B981" },
//     red: { bg: "rgba(239, 68, 68, 0.1)", text: "#EF4444" },
//   };

//   const handleCardClick = () => {
//     onViewDetails(club);
//   };

//   return (
//     <div
//       className="bg-gray-50/50 rounded-2xl p-5 hover:bg-gray-50 transition-all cursor-pointer border border-transparent hover:border-gray-200"
//       onClick={handleCardClick}
//     >
//       <div className="flex items-center gap-4">
//         {/* Club Logo/Icon - Larger */}
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

//         {/* Club Details - More spacing */}
//         <div className="flex-1 min-w-0">
//           <div className="flex items-center justify-between mb-1">
//             <h3 className="font-extrabold text-gray-800 text-lg truncate pr-2" title={clubName}>
//               {clubName}
//             </h3>
//             <span className="text-[9px] font-black bg-white px-3 py-1 rounded-full text-gray-600 uppercase tracking-wider whitespace-nowrap">
//               CLUB
//             </span>
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
        
//         {/* Chevron indicator */}
//         <ChevronRight size={20} className="text-gray-300" />
//       </div>
//     </div>
//   );
// }

// function ActionCard({ icon, label, color, onClick }) {
//   const themes = {
//     blue: {
//       bg: "rgba(76, 161, 175, 0.05)",
//       hover: "rgba(76, 161, 175, 0.1)",
//       icon: "#4CA1AF",
//     },
//     red: {
//       bg: "rgba(239, 68, 68, 0.05)",
//       hover: "rgba(239, 68, 68, 0.1)",
//       icon: "#EF4444",
//     },
//     teal: {
//       bg: "rgba(76, 161, 175, 0.05)",
//       hover: "rgba(76, 161, 175, 0.1)",
//       icon: "#4CA1AF",
//     },
//     orange: {
//       bg: "rgba(249, 115, 22, 0.05)",
//       hover: "rgba(249, 115, 22, 0.1)",
//       icon: "#F97316",
//     },
//   };
//   return (
//     <button
//       onClick={onClick}
//       className="p-8 rounded-2xl border border-gray-50/50 transition-all hover:scale-[1.02] flex flex-col items-center justify-center gap-4 group shadow-sm cursor-pointer w-full"
//       style={{ backgroundColor: themes[color].bg }}
//     >
//       <div
//         className="p-4 bg-white rounded-xl shadow-sm group-hover:shadow-md transition-all group-hover:-translate-y-1"
//         style={{ color: themes[color].icon }}
//       >
//         {icon}
//       </div>
//       <span className="font-black text-gray-700 uppercase text-xs tracking-widest">
//         {label}
//       </span>
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
//         style={{ focus: { ringColor: "#4CA1AF" } }}
//         {...props}
//       />
//     </div>
//   );
// }