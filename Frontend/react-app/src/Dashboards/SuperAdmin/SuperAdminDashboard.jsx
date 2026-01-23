// import { useState, useEffect } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// export default function SuperAdminDashboard() {
//   const [users, setUsers] = useState([]);
//   const [stats, setStats] = useState({});
//   const [loading, setLoading] = useState(true);
//   const user = JSON.parse(localStorage.getItem("user"));
//   const token = localStorage.getItem("token");
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchAllData();
//   }, []);

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

//   const handleLogout = () => {
//     localStorage.removeItem("user");
//     localStorage.removeItem("token");
//     window.location.href = "/login";
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="flex justify-between items-center mb-8">
//           <div>
//             <h1 className="text-4xl font-bold text-purple-600">
//               Super Admin Dashboard 👑
//             </h1>
//             <p className="text-gray-600 mt-2">
//               Complete system control and management
//             </p>
//           </div>

//           <div className="flex items-center space-x-4">
//             <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
//               SUPER_ADMIN
//             </span>
//             <button
//               onClick={handleLogout}
//               className="bg-red-500 cursor-pointer hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-300"
//             >
//               Logout
//             </button>
//           </div>
//         </div>

//         {/* Welcome Section */}
//         <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
//           <p className="text-xl text-gray-700">
//             Welcome,{" "}
//             <span className="font-semibold text-purple-600">
//               {user?.username}
//             </span>
//           </p>
//           <p className="text-gray-500">
//             You have full system administration privileges
//           </p>
//         </div>

//         {/* Statistics */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//           <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-purple-500">
//             <h3 className="font-semibold text-gray-600 mb-2">Total Users</h3>
//             <p className="text-3xl font-bold text-purple-600">{users.length}</p>
//           </div>

//           <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
//             <h3 className="font-semibold text-gray-600 mb-2">Teachers</h3>
//             <p className="text-3xl font-bold text-blue-600">
//               {stats.TEACHERS || 0}
//             </p>
//           </div>

//           <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-orange-500">
//             <h3 className="font-semibold text-gray-600 mb-2">Total Clubs</h3>
//             <p className="text-3xl font-bold text-orange-600">
//               {stats.CLUBS || 0}
//             </p>
//           </div>

//           <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500">
//             <h3 className="font-semibold text-gray-600 mb-2">Club Admins</h3>
//             <p className="text-3xl font-bold text-green-600">
//               {stats.CLUB_ADMIN || 0}
//             </p>
//           </div>

//           <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-orange-500">
//             <h3 className="font-semibold text-gray-600 mb-2">Regular Users</h3>
//             <p className="text-3xl font-bold text-orange-600">
//               {stats.USERS || 0}
//             </p>
//           </div>
//         </div>

//         {/* Quick Actions */}
//         <div className="bg-white my-6 rounded-xl shadow-lg p-6 md:col-span-2 lg:col-span-3">
//           <h3 className="text-2xl font-bold mb-4 text-gray-800">
//             Quick Actions
//           </h3>
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//             <button
//               onClick={() => navigate("/manage-users")}
//               className="bg-blue-500 cursor-pointer hover:bg-blue-600 text-white py-3 rounded-lg transition duration-300"
//             >
//               Manage Users
//             </button>

//             <button className="bg-green-500 cursor-pointer hover:bg-green-600 text-white py-3 rounded-lg transition duration-300">
//               Manage Events
//             </button>

//             <button className="bg-purple-500 cursor-pointer hover:bg-purple-600 text-white py-3 rounded-lg transition duration-300">
//               Manage Club Admins
//             </button>

//             <button className="bg-orange-500 cursor-pointer hover:bg-orange-600 text-white py-3 rounded-lg transition duration-300">
//               Manage Teachers
//             </button>

//             <button className="bg-orange-500 cursor-pointer hover:bg-orange-600 text-white py-3 rounded-lg transition duration-300">
//               Manage Team Members
//             </button>

//             <button
//               onClick={() => navigate("/manage-clubs")}
//               className="bg-orange-500 cursor-pointer hover:bg-orange-600 text-white py-3 rounded-lg transition duration-300"
//             >
//               Manage Clubs
//             </button>

//              <button
//               onClick={() => navigate("/add-users-with-club")}
//               className="bg-blue-500 cursor-pointer hover:bg-orange-600 text-white py-3 rounded-lg transition duration-300"
//             >
//               Add Students to Club
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }



import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { User, Plus, Upload, X, CalendarDays, Edit } from 'lucide-react';

export default function SuperAdminDashboard() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Profile states
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [profileData, setProfileData] = useState({
    prn: user?.prn || '',
    fullName: '',
    department: '',
    year: '',
    phoneNumber: ''
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    fetchAllData();
    fetchUserProfile();
  }, []);

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
        setProfileData({
          prn: response.data.data.prn || user?.prn || '',
          fullName: response.data.data.fullName || '',
          department: response.data.data.department || '',
          year: response.data.data.year || '',
          phoneNumber: response.data.data.phoneNumber || ''
        });
        
        // Fetch profile image
        fetchProfileImage();
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setUserProfile(null);
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
        setProfileImage(imageUrl);
      }
    } catch (error) {
      console.error('Error fetching profile image:', error);
      setProfileImage(null);
    }
  };

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

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  // Profile handlers
  const handleInputChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    setSelectedImage(e.target.files[0]);
  };

  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setMessage('');

    // Validate all required fields are filled
    if (!profileData.prn || !profileData.fullName || !profileData.department || !profileData.year || !profileData.phoneNumber) {
      setMessage('Please fill all required fields');
      setProfileLoading(false);
      return;
    }

    // Validate PRN format (if needed)
    if (profileData.prn.length < 10) {
      setMessage('Please enter a valid PRN');
      setProfileLoading(false);
      return;
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(profileData.phoneNumber)) {
      setMessage('Please enter a valid 10-digit phone number');
      setProfileLoading(false);
      return;
    }

    // Validate year is between 1-4
    if (profileData.year < 1 || profileData.year > 4) {
      setMessage('Please select a valid year (1-4)');
      setProfileLoading(false);
      return;
    }

    try {
      // If profile exists, update it; otherwise create new
      if (userProfile) {
        // Update existing profile
        const response = await axios.put(
          `http://localhost:8080/api/profiles/${userProfile.id}`,
          profileData,
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        setMessage('Profile updated successfully!');
      } else {
        // Create new profile
        const response = await axios.post(
          "http://localhost:8080/api/profiles",
          profileData,
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        setMessage('Profile created successfully!');
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
      setShowProfileForm(false);
      
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage('Error saving profile. Please try again.');
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-purple-600">
              Super Admin Dashboard 👑
            </h1>
            <p className="text-gray-600 mt-2">
              Complete system control and management
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
              SUPER_ADMIN
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-500 cursor-pointer hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-300"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="bg-purple-100 p-3 rounded-lg mr-4">
                <User className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-purple-800">My Profile</h3>
            </div>

            {/* Profile Image */}
            {profileImage && (
              <div className="flex justify-center mb-4">
                <img 
                  src={profileImage} 
                  alt="Profile" 
                  className="w-32 h-32 rounded-full object-cover border-4 border-purple-200"
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
                  <strong>PRN:</strong> <span className="text-gray-600">{profileData.prn}</span>
                </p>
                <p className="text-gray-700">
                  <strong>Email:</strong> <span className="text-gray-600">{user?.email}</span>
                </p>
                <p className="text-gray-700">
                  <strong>Department:</strong> {profileData.department}
                </p>
                <p className="text-gray-700">
                  <strong>Year:</strong> {profileData.year}
                </p>
                <p className="text-gray-700">
                  <strong>Phone:</strong> {profileData.phoneNumber}
                </p>
                <p className="text-gray-700">
                  <strong>Role:</strong> {user?.role}
                </p>
                <p className="text-gray-700">
                  <strong>Status:</strong> 
                  <span className={`${user?.verified ? 'text-green-600' : 'text-red-600'}`}>
                    {user?.verified ? ' Active' : ' Inactive'}
                  </span>
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-gray-700">
                  <strong>Username:</strong> {user?.username}
                </p>
                <p className="text-gray-700">
                  <strong>PRN:</strong> <span className="text-gray-600">{user?.prn}</span>
                </p>
                <p className="text-gray-700">
                  <strong>Email:</strong> <span className="text-gray-600">{user?.email}</span>
                </p>
                <p className="text-gray-700">
                  <strong>Role:</strong> {user?.role}
                </p>
                <p className="text-gray-700">
                  <strong>Status:</strong> 
                  <span className={`${user?.verified ? 'text-green-600' : 'text-red-600'}`}>
                    {user?.verified ? ' Active' : ' Inactive'}
                  </span>
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                  <p className="text-yellow-800 text-sm">
                    <strong>Note:</strong> Complete your profile to access all features.
                  </p>
                </div>
              </div>
            )}
            
            {/* Dynamic Button */}
            <button
              onClick={() => setShowProfileForm(true)}
              className={`mt-4 w-full text-white py-2 rounded-lg transition duration-300 flex items-center justify-center cursor-pointer ${
                userProfile 
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700' 
                  : 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700'
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
              Welcome back, {user?.username}!
            </h3>
            <p className="text-gray-600 mb-4">
              You have full system administration privileges. Manage users, clubs, events, and teachers from this dashboard.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800">
                <strong>System Status:</strong> All services are running normally. Total {users.length} users registered in the system.
              </p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-purple-500">
            <h3 className="font-semibold text-gray-600 mb-2">Total Users</h3>
            <p className="text-3xl font-bold text-purple-600">{users.length}</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
            <h3 className="font-semibold text-gray-600 mb-2">Teachers</h3>
            <p className="text-3xl font-bold text-blue-600">
              {stats.TEACHERS || 0}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500">
            <h3 className="font-semibold text-gray-600 mb-2">Club Admins</h3>
            <p className="text-3xl font-bold text-green-600">
              {stats.CLUB_ADMIN || 0}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-orange-500">
            <h3 className="font-semibold text-gray-600 mb-2">Regular Users</h3>
            <p className="text-3xl font-bold text-orange-600">
              {stats.USERS || 0}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-red-500">
            <h3 className="font-semibold text-gray-600 mb-2">Super Admins</h3>
            <p className="text-3xl font-bold text-red-600">
              {stats.SUPER_ADMIN || 0}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-2xl font-bold mb-4 text-gray-800">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <button
              onClick={() => navigate("/manage-users")}
              className="bg-blue-500 cursor-pointer hover:bg-blue-600 text-white py-3 rounded-lg transition duration-300"
            >
              Manage Users
            </button>

            <button className="bg-green-500 cursor-pointer hover:bg-green-600 text-white py-3 rounded-lg transition duration-300">
              Manage Events
            </button>

            <button className="bg-purple-500 cursor-pointer hover:bg-purple-600 text-white py-3 rounded-lg transition duration-300">
              Manage Club Admins
            </button>

            <button className="bg-yellow-500 cursor-pointer hover:bg-yellow-600 text-white py-3 rounded-lg transition duration-300">
              Manage Teachers
            </button>

            <button className="bg-indigo-500 cursor-pointer hover:bg-indigo-600 text-white py-3 rounded-lg transition duration-300">
              Manage Team Members
            </button>

            <button
              onClick={() => navigate("/manage-clubs")}
              className="bg-orange-500 cursor-pointer hover:bg-orange-600 text-white py-3 rounded-lg transition duration-300"
            >
              Manage Clubs
            </button>

            <button
              onClick={() => navigate("/add-users-with-club")}
              className="bg-teal-500 cursor-pointer hover:bg-teal-600 text-white py-3 rounded-lg transition duration-300"
            >
              Add Students to Club
            </button>

            <button className="bg-pink-500 cursor-pointer hover:bg-pink-600 text-white py-3 rounded-lg transition duration-300">
              System Settings
            </button>

            <button className="bg-gray-700 cursor-pointer hover:bg-gray-800 text-white py-3 rounded-lg transition duration-300">
              View Logs
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
                {userProfile ? 'Edit Your Profile' : 'Complete Your Profile'}
              </h3>
              <button
                onClick={() => setShowProfileForm(false)}
                className="text-gray-400 cursor-pointer hover:text-purple-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitProfile} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PRN *
                </label>
                <input
                  type="text"
                  name="prn"
                  value={profileData.prn}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    userProfile ? 'bg-gray-100 cursor-not-allowed' : ''
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department *
                </label>
                <input
                  type="text"
                  name="department"
                  value={profileData.department}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year *
                </label>
                <select
                  name="year"
                  value={profileData.year}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Year</option>
                  <option value="1">First Year</option>
                  <option value="2">Second Year</option>
                  <option value="3">Third Year</option>
                  <option value="4">Fourth Year</option>
                </select>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <Upload className="w-5 h-5 text-gray-400" />
                </div>
              </div>

              {message && (
                <p className={`text-sm ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
                  {message}
                </p>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowProfileForm(false)}
                  className="flex-1 cursor-pointer bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg transition duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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