import {
  Calendar,
  Trophy,
  Users,
  User,
  Plus,
  Upload,
  X,
  Edit,
  Camera,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

export default function TeachersDashboard() {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

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

  useEffect(() => {
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

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      console.log("Fetching departments...");
      const response = await axios.get(
        "http://localhost:8080/api/department",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      console.log("Departments response:", response.data);
      
      if (response.data && response.data.data) {
        console.log("Setting departments:", response.data.data);
        setDepartments(response.data.data);
      }
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
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
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
          prn: response.data.data.prn || user?.prn || "",
          fullName: response.data.data.fullName || "",
          departmentId: deptId,
          phoneNumber: response.data.data.phoneNumber || "",
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
          responseType: "blob",
        },
      );

      if (response.data) {
        const imageUrl = URL.createObjectURL(response.data);
        setProfileImage(imageUrl);
      }
    } catch (error) {
      console.error("Error fetching profile image:", error);
      setProfileImage(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  // Profile handlers
  const handleInputChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    setSelectedImage(e.target.files[0]);
  };

  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setMessage("");

    // Validate all required fields are filled
    if (
      !profileData.prn ||
      !profileData.fullName ||
      !profileData.departmentId ||
      !profileData.phoneNumber
    ) {
      setMessage("Please fill all required fields");
      setProfileLoading(false);
      return;
    }

    // Validate PRN format (if needed)
    if (profileData.prn.length < 10) {
      setMessage("Please enter a valid PRN");
      setProfileLoading(false);
      return;
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(profileData.phoneNumber)) {
      setMessage("Please enter a valid 10-digit phone number");
      setProfileLoading(false);
      return;
    }

    try {
      console.log("Profile data being sent:", profileData);

      // If profile exists, update it; otherwise create new
      if (userProfile) {
        // Update existing profile
        const requestData = {
          fullName: profileData.fullName,
          departmentId: parseInt(profileData.departmentId),
          phoneNumber: profileData.phoneNumber,
        }
        const updateResponse = await axios.put(
          `http://localhost:8080/api/profiles/${profileData.prn}`,
          requestData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );
        console.log("Update response:", updateResponse.data);
        setMessage("Profile updated successfully!");
      } else {
        // Create new profile
        const createData = {
          prn: profileData.prn,
          fullName: profileData.fullName,
          departmentId: parseInt(profileData.departmentId),
          phoneNumber: profileData.phoneNumber,
        };

        console.log("Creating with data:", createData);

        const createResponse = await axios.post(
          "http://localhost:8080/api/profiles",
          createData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );
        console.log("Create response:", createResponse.data);
        setMessage("Profile created successfully!");
      }

      // Upload image if selected
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

      // Refresh profile data
      await fetchUserProfile();
      
      setTimeout(() => {
        setShowProfileForm(false);
        setMessage("");
      }, 1500);
    } catch (error) {
      console.error("Full error details:", error);
      console.error("Error response data:", error.response?.data);
      console.error("Error status:", error.response?.status);

      if (error.response?.data?.message) {
        setMessage(`Error: ${error.response.data.message}`);
      } else if (error.response?.status === 500) {
        setMessage("Server error. Please check console for details.");
      } else {
        setMessage("Error saving profile. Please try again.");
      }
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

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-blue-600">
              Teacher Dashboard 📚
            </h1>
            <p className="text-gray-600 mt-2">
              Club management and Event tracking
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              TEACHER
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-500 cursor-pointer hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-300"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Profile and Welcome Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-3 rounded-lg mr-4">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-blue-800">
                My Profile
              </h3>
            </div>

            {/* Profile Image */}
            {profileImage && (
              <div className="flex justify-center mb-4">
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-blue-200"
                />
              </div>
            )}

            {isLoadingProfile ? (
              <div className="text-center py-4">
                <p className="text-gray-600">Loading profile...</p>
              </div>
            ) : userProfile ? (
              <div className="space-y-2">
                <p className="text-gray-700">
                  <strong>Full Name:</strong> {profileData.fullName}
                </p>
                <p className="text-gray-700">
                  <strong>Username:</strong> {user?.username}
                </p>
                <p className="text-gray-700">
                  <strong>PRN:</strong>{" "}
                  <span className="text-gray-600">{profileData.prn}</span>
                </p>
                <p className="text-gray-700">
                  <strong>Email:</strong>{" "}
                  <span className="text-gray-600">{user?.email}</span>
                </p>
                <p className="text-gray-700">
                  <strong>Department:</strong> {profileData.departmentId ? getDepartmentName(profileData.departmentId) : "Not set"}
                </p>
                <p className="text-gray-700">
                  <strong>Phone:</strong> {profileData.phoneNumber}
                </p>
                <p className="text-gray-700">
                  <strong>Role:</strong> {user?.role}
                </p>
                <p className="text-gray-700">
                  <strong>Status:</strong>
                  <span
                    className={`${user?.verified ? "text-green-600" : "text-red-600"}`}
                  >
                    {user?.verified ? " Active" : " Inactive"}
                  </span>
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-gray-700">
                  <strong>Username:</strong> {user?.username}
                </p>
                <p className="text-gray-700">
                  <strong>PRN:</strong>{" "}
                  <span className="text-gray-600">{user?.prn}</span>
                </p>
                <p className="text-gray-700">
                  <strong>Email:</strong>{" "}
                  <span className="text-gray-600">{user?.email}</span>
                </p>
                <p className="text-gray-700">
                  <strong>Role:</strong> {user?.role}
                </p>
                <p className="text-gray-700">
                  <strong>Status:</strong>
                  <span
                    className={`${user?.verified ? "text-green-600" : "text-red-600"}`}
                  >
                    {user?.verified ? " Active" : " Inactive"}
                  </span>
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                  <p className="text-yellow-800 text-sm">
                    <strong>Note:</strong> Complete your profile to access all
                    features.
                  </p>
                </div>
              </div>
            )}

            {/* Dynamic Button */}
            <button
              onClick={() => setShowProfileForm(true)}
              className={`mt-4 w-full text-white py-2 rounded-lg transition duration-300 flex items-center justify-center cursor-pointer ${
                userProfile
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                  : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
              }`}
            >
              {userProfile ? (
                <>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Complete Your Profile
                </>
              )}
            </button>
          </div>

          {/* Welcome Message */}
          <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-2">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Welcome, Professor {user?.username}!
            </h3>
            <p className="text-gray-600 mb-4">
              Manage your club activities, track student progress, and create
              events from this dashboard.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800">
                <strong>Teacher Dashboard:</strong> You have access to club
                management, event creation, and student tracking features.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Events Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-3 rounded-lg mr-4">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-blue-800">My Events</h3>
            </div>
            <p className="text-3xl font-bold text-blue-600 mb-2">0</p>
            <p className="text-gray-600">Upcoming events to manage</p>
          </div>

          {/* Clubs Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="bg-green-100 p-3 rounded-lg mr-4">
                <Trophy className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-green-800">Clubs</h3>
            </div>
            <p className="text-3xl font-bold text-green-600 mb-2">0</p>
            <p className="text-gray-600">Clubs you're advising</p>
          </div>

          {/* Students Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="bg-orange-100 p-3 rounded-lg mr-4">
                <Users className="w-6 h-6 text-orange-800" />
              </div>
              <h3 className="text-xl font-semibold text-orange-800">
                All Students
              </h3>
            </div>
            <p className="text-3xl font-bold text-orange-600 mb-2">0</p>
            <p className="text-gray-600">Students under your guidance</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6 md:col-span-2 lg:col-span-3">
          <h3 className="text-2xl font-bold mb-4 text-gray-800">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="bg-blue-500 cursor-pointer hover:bg-blue-600 text-white py-3 rounded-lg transition duration-300">
              Create Event
            </button>
            <button className="bg-green-500 cursor-pointer hover:bg-green-600 text-white py-3 rounded-lg transition duration-300">
              Delete Event
            </button>
            <button
              onClick={() => navigate("/add-users-with-club")}
              className="bg-purple-500 cursor-pointer hover:bg-purple-600 text-white py-3 rounded-lg transition duration-300"
            >
              Add Student
            </button>
            <button
              onClick={() => navigate("/remove-users-from-club")}
              className="bg-orange-500 cursor-pointer hover:bg-orange-600 text-white py-3 rounded-lg transition duration-300"
            >
              Remove Student
            </button>
          </div>
        </div>
      </div>

      {/* Profile Form Popup */}
      {showProfileForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-800">
                {userProfile ? "Edit Your Profile" : "Complete Your Profile"}
              </h3>
              <button
                onClick={() => {
                  setShowProfileForm(false);
                  setMessage("");
                }}
                className="text-gray-400 cursor-pointer hover:text-blue-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitProfile} className="p-6 space-y-4">
              {/* Debug info */}
              {console.log("Departments in form:", departments, "Length:", departments.length)}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PRN *
                </label>
                <input
                  type="text"
                  name="prn"
                  value={profileData.prn}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    userProfile ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                  readOnly={!!userProfile}
                  required
                />
                {userProfile && (
                  <p className="text-xs text-gray-500 mt-1">
                    PRN cannot be changed once profile is created
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={profileData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Department - Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department *
                </label>
                <select
                  name="departmentId"
                  value={profileData.departmentId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={profileData.phoneNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="10-digit phone number"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profile Photo
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Upload className="w-5 h-5 text-gray-400" />
                </div>
              </div>

              {message && (
                <div className={`p-3 rounded-lg ${
                  message.includes("Error") || message.includes("error")
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : "bg-green-50 text-green-700 border border-green-200"
                }`}>
                  <p className="text-sm font-semibold">{message}</p>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileForm(false);
                    setMessage("");
                  }}
                  className="flex-1 cursor-pointer bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg transition duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
    </div>
  );
}