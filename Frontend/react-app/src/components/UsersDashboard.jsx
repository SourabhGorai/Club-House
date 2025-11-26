// import { User,CalendarDays} from 'lucide-react';

// export default function UsersDashboard() {
//   const user = JSON.parse(localStorage.getItem("user"));

//   const handleLogout = () => {
//     localStorage.removeItem("user");
//     localStorage.removeItem("token");
//     window.location.href = "/login";
//   };

  
//   return (
//     <div className="min-h-screen bg-orange-50 p-6">
//       <div className="max-w-7xl mx-auto">
//         <div className="flex justify-between items-center mb-8">
//           <div>
//             <h1 className="text-4xl font-bold text-orange-600">User Dashboard 👋</h1>
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
//           <div className="bg-white my-6 rounded-xl shadow-lg p-6 md:col-span-2">
//             <h3 className="text-xl font-semibold mb-4 text-gray-800">
//               Welcome back, {user?.username}!
//             </h3>
//             <p className="text-gray-600 mb-4">
//               this is random again igmore change krna hai You have 2 new notifications and 1 upcoming assignment. 
//               Continue your learning journey with us!
//             </p>
//             <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
//               <p className="text-yellow-800">
//                 <i className="fas fa-bell mr-2"></i>
//                 <strong>Reminder:</strong> Complete the JavaScript fundamentals course by Friday.
//               </p>
//             </div>
//           </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           {/* Profile Card */}
//           <div className="bg-white rounded-xl shadow-lg p-6">
//             <div className="flex items-center mb-4">
//               <div className="bg-orange-100 p-3 rounded-lg mr-4">
//                 <User className="w-6 h-6 text-orange-600" />
//               </div>
//               <h3 className="text-xl font-semibold text-orange-800">My Profile</h3>
//             </div>
//             <p className="text-gray-700">
//               <strong>Username:</strong> {user?.username}
//             </p>
//             <p className="text-gray-700">
//               <strong>PRN:</strong> <span className="text-gray-600">{user?.prn}</span>
//             </p>
//              <p className="text-gray-700">
//               <strong>Email:</strong> <span className="text-gray-600">{user?.email}</span>
//             </p>
//             <p className="text-gray-700">
//               <strong>Role:</strong> {user?.role}
//             </p>
//            <p className="text-gray-700">
//   <strong>Status:</strong> 
//   <span className={`${user?.verified ? 'text-green-600' : 'text-red-600'}`}>
//     {user?.verified ? ' Active' : ' Inactive'}
//   </span>
// </p>
//           </div>

//           {/* Events */}
//           <div className="bg-white rounded-xl shadow-lg p-6">
//             <div className="flex items-center mb-4">
//               <div className="bg-blue-100 p-3 rounded-lg mr-4">
//                <CalendarDays className="w-6 h-6 text-blue-600" />
//               </div>
//               <h3 className="text-xl font-semibold text-blue-800">All Events</h3>
//             </div>
//             <p className="text-3xl font-bold text-blue-600 mb-2"></p>
//             <p className="text-gray-600"></p>
//           </div>

//           {/* Quick Actions */}
//           <div className="bg-white rounded-xl shadow-lg p-6 md:col-span-2">
//             <h3 className="text-2xl font-bold mb-4 text-gray-800">Quick Actions</h3>
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
//     </div>
//   );
// }













// with create profile code
import { User,Plus,Upload,X,CalendarDays} from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';

export default function UsersDashboard() {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
    const [showProfileForm, setShowProfileForm] = useState(false);
  const [profileData, setProfileData] = useState({
    prn: user?.prn || '',
    fullName: '',
    department: '',
    year: '',
    phoneNumber: ''
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');


  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

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
  setLoading(true);
  setMessage('');

  // Validate all required fields are filled
  if (!profileData.prn || !profileData.fullName || !profileData.department || !profileData.year || !profileData.phoneNumber) {
    setMessage('Please fill all required fields');
    setLoading(false);
    return;
  }

  // Validate PRN format (if needed)
  if (profileData.prn.length < 10) {
    setMessage('Please enter a valid PRN');
    setLoading(false);
    return;
  }

  // Validate phone number format (basic validation)
  const phoneRegex = /^[0-9]{10}$/;
  if (!phoneRegex.test(profileData.phoneNumber)) {
    setMessage('Please enter a valid 10-digit phone number');
    setLoading(false);
    return;
  }

  // Validate year is between 1-4
  if (profileData.year < 1 || profileData.year > 4) {
    setMessage('Please select a valid year (1-4)');
    setLoading(false);
    return;
  }

  try {
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

    setMessage('Profile created successfully!');
    setShowProfileForm(false);
    
  } catch (error) {
    console.error('Error creating profile:', error);
    setMessage('Error creating profile. Please try again.');
  } finally {
    setLoading(false);
  }
};
  
  return (
    <div className="min-h-screen bg-orange-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-orange-600">User Dashboard 👋</h1>
            <p className="text-gray-600 mt-2">Your Club and Event Management</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
              USER
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-500 cursor-pointer hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-300"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Welcome Message */}
          <div className="bg-white my-6 rounded-xl shadow-lg p-6 md:col-span-2">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Welcome back, {user?.username}!
            </h3>
            <p className="text-gray-600 mb-4">
              this is random again igmore change krna hai You have 2 new notifications and 1 upcoming assignment. 
              Continue your learning journey with us!
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800">
                <i className="fas fa-bell mr-2"></i>
                <strong>Reminder:</strong> Complete the JavaScript fundamentals course by Friday.
              </p>
            </div>
          </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Card */}
<div className="bg-white rounded-xl shadow-lg p-6">
  <div className="flex items-center mb-4">
    <div className="bg-orange-100 p-3 rounded-lg mr-4">
      <User className="w-6 h-6 text-orange-600" />
    </div>
    <h3 className="text-xl font-semibold text-orange-800">My Profile</h3>
  </div>
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
  
  {/* Add this button */}
  <button
    onClick={() => setShowProfileForm(true)}
    className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition duration-300 flex items-center justify-center cursor-pointer"
  >
    <Plus className="w-4 h-4 mr-2" />
    Complete Your Profile
  </button>
</div>

          {/* Events */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-3 rounded-lg mr-4">
               <CalendarDays className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-blue-800">All Events</h3>
            </div>
            <p className="text-3xl font-bold text-blue-600 mb-2"></p>
            <p className="text-gray-600"></p>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-lg p-6 md:col-span-2">
            <h3 className="text-2xl font-bold mb-4 text-gray-800">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="bg-orange-500 cursor-pointer hover:bg-orange-600 text-white py-3 rounded-lg transition duration-300">
                My Clubs
              </button>
              <button className="bg-blue-500 cursor-pointer hover:bg-blue-600 text-white py-3 rounded-lg transition duration-300">
                Previous Events History
              </button>
              <button className="bg-green-500 cursor-pointer hover:bg-green-600 text-white py-3 rounded-lg transition duration-300">
                Resources(nhi pata)
              </button>
              <button className="bg-purple-500 pointer hover:bg-purple-600 text-white py-3 rounded-lg transition duration-300">
                Settings(nhi pata)
              </button>
            </div>
          </div>


        </div>
      </div>

      {/* Profile Form Popup */}
{showProfileForm && (
  <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center p-6 border-b">
        <h3 className="text-xl font-semibold text-gray-800">Complete Your Profile</h3>
        <button
          onClick={() => setShowProfileForm(false)}
          className="text-gray-400 hover:text-gray-600"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            required
          />
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg transition duration-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Profile'}
          </button>
        </div>
      </form>
    </div>
  </div>
)}
    </div>
  );
}