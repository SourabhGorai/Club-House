import { User, Plus, Upload, X, CalendarDays, Edit, LogOut, LayoutDashboard, Settings, BookOpen, ShieldCheck, Mail, Phone, AtSign, Users, Club } from "lucide-react";
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
  
  // New state for clubs
  const [myClubs, setMyClubs] = useState([]);
  const [isLoadingClubs, setIsLoadingClubs] = useState(false);
  const [clubsError, setClubsError] = useState("");
  const [showAllClubs, setShowAllClubs] = useState(false);

  useEffect(() => {
    fetchUserProfile();
    fetchDepartments();
    fetchMyClubs(); // Fetch clubs on component mount
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

  // NEW FUNCTION: Fetch user's clubs from the API
  const fetchMyClubs = async () => {
    if (!token) {
      setClubsError("No authentication token found");
      return;
    }

    setIsLoadingClubs(true);
    setClubsError("");
    
    try {
      const response = await axios.get("http://localhost:8080/api/user-clubs/getMyClubs", {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
      
      console.log("Clubs API Response:", response.data);
      
      // Handle different response structures
      if (response.data) {
        if (Array.isArray(response.data)) {
          setMyClubs(response.data);
        } else if (response.data.data && Array.isArray(response.data.data)) {
          setMyClubs(response.data.data);
        } else if (response.data.clubs && Array.isArray(response.data.clubs)) {
          setMyClubs(response.data.clubs);
        } else {
          // If it's a single club object or other structure
          setMyClubs([response.data]);
        }
      }
    } catch (error) {
      console.error("Error fetching my clubs:", error);
      setClubsError(error.response?.data?.message || "Failed to fetch your clubs");
      setMyClubs([]);
    } finally {
      setIsLoadingClubs(false);
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

  // Get display clubs (limit to 3 if not showing all)
  const displayClubs = showAllClubs ? myClubs : myClubs.slice(0, 3);
  const joinedClubsCount = myClubs.length;

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
      <main className="flex-1 p-10 overflow-y-auto max-h-screen">
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
          <StatCard 
            icon={<CalendarDays />} 
            label="Joined Clubs" 
            value={joinedClubsCount.toString()} 
            color="blue" 
          />
          <StatCard 
            icon={<BookOpen />} 
            label="Total Events" 
            value="12" 
            color="orange" 
          />
          <StatCard 
            icon={<ShieldCheck />} 
            label="Verified Status" 
            value={user?.verified ? "Verified" : "Pending"} 
            color="purple" 
            isStatus 
          />
        </div>

        {/* My Clubs Section - Integrated from the API */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-gray-800">My Clubs</h2>
              <div className="h-[1px] w-20 bg-gray-100"></div>
            </div>
            <button 
              onClick={fetchMyClubs}
              className="text-xs font-bold text-[#7C3AED] bg-purple-50 px-4 py-2 rounded-full hover:bg-purple-100 transition-colors flex items-center gap-2"
              disabled={isLoadingClubs}
            >
              <svg className={`w-4 h-4 ${isLoadingClubs ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {isLoadingClubs ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          {/* Clubs Grid */}
          {isLoadingClubs ? (
            <div className="bg-white rounded-[2.5rem] p-12 text-center">
              <div className="animate-spin w-10 h-10 border-4 border-[#7C3AED] border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500 font-medium">Loading your clubs...</p>
            </div>
          ) : clubsError ? (
            <div className="bg-red-50 rounded-[2.5rem] p-8 text-center border border-red-100">
              <div className="text-red-500 mb-2">
                <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Unable to Load Clubs</h3>
              <p className="text-red-500/70 mb-4">{clubsError}</p>
              <button 
                onClick={fetchMyClubs}
                className="bg-white px-6 py-3 rounded-full text-sm font-bold text-[#7C3AED] border border-purple-200 hover:bg-purple-50 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : myClubs.length === 0 ? (
            <div className="bg-white rounded-[2.5rem] p-12 text-center border-2 border-dashed border-gray-200">
              <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-gray-400 w-10 h-10" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">No Clubs Joined Yet</h3>
              <p className="text-gray-500 mb-6">You haven't joined any clubs. Explore and join clubs to see them here.</p>
              <button className="bg-[#7C3AED] text-white px-8 py-3 rounded-full text-sm font-bold hover:bg-[#6D28D9] transition-colors shadow-lg shadow-purple-200">
                Browse Clubs
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayClubs.map((club, index) => (
                  <ClubCard key={club.clubId || club.id || index} club={club} />
                ))}
              </div>
              
              {/* Show More/Less Button */}
              {myClubs.length > 3 && (
                <div className="text-center mt-8">
                  <button
                    onClick={() => setShowAllClubs(!showAllClubs)}
                    className="bg-white px-6 py-3 rounded-full text-sm font-bold text-[#7C3AED] border border-purple-200 hover:bg-purple-50 transition-colors inline-flex items-center gap-2"
                  >
                    {showAllClubs ? 'Show Less' : `Show All (${myClubs.length} Clubs)`}
                    <svg className={`w-4 h-4 transition-transform ${showAllClubs ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        {/* Control Center Section */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-xl font-bold text-gray-800">Control Center</h2>
            <div className="h-[1px] flex-1 bg-gray-100"></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <ActionCard 
              icon={<CalendarDays className="text-blue-500" />} 
              label="Events" 
              color="blue" 
              onClick={() => window.location.href = "/events"}
            />
            <ActionCard 
              icon={<Users className="text-orange-500" />} 
              label="My Clubs" 
              color="orange" 
              onClick={() => document.getElementById('my-clubs-section')?.scrollIntoView({ behavior: 'smooth' })}
            />
            <ActionCard 
              icon={<BookOpen className="text-green-500" />} 
              label="Resources" 
              color="green" 
              onClick={() => window.location.href = "/resources"}
            />
            <ActionCard 
              icon={<Settings className="text-purple-500" />} 
              label="Settings" 
              color="purple" 
              onClick={() => window.location.href = "/settings"}
            />
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

// NEW COMPONENT: Club Card for displaying individual club information
function ClubCard({ club }) {
  // Extract club data with fallbacks for different API response structures
  const clubId = club.clubId || club.id || 'N/A';
  const clubName = club.clubName || club.name || 'Unnamed Club';
  const clubDescription = club.description || club.desc || 'No description available';
  const clubCategory = club.category || club.type || 'General';
  const memberCount = club.memberCount || club.members || club.memberCount || '0';
  const clubLogo = club.logo || club.image || club.logoUrl || null;
  
  // Generate a consistent color based on club name
  const colors = ['blue', 'orange', 'purple', 'green', 'red', 'indigo'];
  const colorIndex = (clubName.length % colors.length);
  const color = colors[colorIndex];
  
  const bgColors = {
    blue: 'bg-blue-50',
    orange: 'bg-orange-50',
    purple: 'bg-purple-50',
    green: 'bg-green-50',
    red: 'bg-red-50',
    indigo: 'bg-indigo-50'
  };

  const textColors = {
    blue: 'text-blue-600',
    orange: 'text-orange-600',
    purple: 'text-purple-600',
    green: 'text-green-600',
    red: 'text-red-600',
    indigo: 'text-indigo-600'
  };

  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-50 hover:shadow-xl transition-all group hover:scale-[1.02]">
      <div className="flex items-start gap-4">
        {/* Club Logo/Icon */}
        <div className={`${bgColors[color]} w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
          {clubLogo ? (
            <img src={clubLogo} alt={clubName} className="w-10 h-10 object-contain" />
          ) : (
            <Users className={`w-8 h-8 ${textColors[color]}`} />
          )}
        </div>
        
        {/* Club Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-extrabold text-gray-800 text-lg truncate" title={clubName}>
              {clubName}
            </h3>
            <span className="text-[10px] font-black bg-gray-100 px-3 py-1 rounded-full text-gray-600 uppercase tracking-wider whitespace-nowrap">
              {clubCategory}
            </span>
          </div>
          
          <p className="text-sm text-gray-500 mt-2 line-clamp-2" title={clubDescription}>
            {clubDescription}
          </p>
          
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-bold text-gray-600">{memberCount} Members</span>
            </div>
            <span className="text-xs text-gray-300">|</span>
            <span className="text-xs font-medium text-[#7C3AED] bg-purple-50 px-3 py-1 rounded-full">
              ID: {clubId}
            </span>
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex gap-2 mt-5 pt-4 border-t border-gray-50">
        <button className="flex-1 bg-gray-50 hover:bg-[#7C3AED] hover:text-white text-gray-700 font-bold text-xs py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2">
          <CalendarDays size={14} />
          Events
        </button>
        <button className="flex-1 bg-[#7C3AED]/5 hover:bg-[#7C3AED] hover:text-white text-[#7C3AED] font-bold text-xs py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2">
          <Users size={14} />
          View Club
        </button>
      </div>
    </div>
  );
}

function ActionCard({ icon, label, color, onClick }) {
  const themes = {
    blue: "bg-blue-50/40 hover:bg-blue-50",
    orange: "bg-orange-50/40 hover:bg-orange-50",
    green: "bg-green-50/40 hover:bg-green-50",
    purple: "bg-purple-50/40 hover:bg-purple-50"
  };
  return (
    <button 
      onClick={onClick}
      className={`${themes[color]} p-10 rounded-[2.5rem] border border-gray-50/50 transition-all hover:scale-[1.03] flex flex-col items-center justify-center gap-5 group shadow-sm`}
    >
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

// import { User, Plus, Upload, X, CalendarDays, Edit, LogOut, LayoutDashboard, Settings, BookOpen, ShieldCheck, Mail, Phone, AtSign } from "lucide-react";
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
//     if (departments.length > 0 && profileData.departmentId && typeof profileData.departmentId === "string" && isNaN(profileData.departmentId)) {
//       const dept = departments.find((d) => d.name === profileData.departmentId);
//       if (dept) {
//         setProfileData((prev) => ({ ...prev, departmentId: dept.departmentId }));
//       }
//     }
//   }, [departments, profileData.departmentId]);

//   const fetchDepartments = async () => {
//     try {
//       const response = await axios.get("http://localhost:8080/api/department", {
//         headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
//       });
//       if (response.data && response.data.data) setDepartments(response.data.data);
//     } catch (error) {
//       console.error("Error fetching departments:", error);
//     }
//   };

//   const fetchUserProfile = async () => {
//     try {
//       setIsLoadingProfile(true);
//       const response = await axios.get(`http://localhost:8080/api/profiles/prn/${user?.prn}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (response.data) {
//         setUserProfile(response.data);
//         let deptId = "";
//         if (response.data.data.department) {
//           deptId = typeof response.data.data.department === "object" ? response.data.data.department.departmentId : response.data.data.department;
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
//     } finally {
//       setIsLoadingProfile(false);
//     }
//   };

//   const fetchProfileImage = async () => {
//     try {
//       const response = await axios.get(`http://localhost:8080/api/profiles/${user?.prn}/image`, {
//         headers: { Authorization: `Bearer ${token}` },
//         responseType: "blob",
//       });
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
//     setLoading(true);
//     try {
//       const requestData = {
//         fullName: profileData.fullName,
//         departmentId: parseInt(profileData.departmentId),
//         year: profileData.year,
//         phoneNumber: profileData.phoneNumber,
//       };

//       if (userProfile) {
//         await axios.put(`http://localhost:8080/api/profiles/${profileData.prn}`, requestData, {
//           headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
//         });
//       } else {
//         await axios.post("http://localhost:8080/api/profiles", { ...requestData, prn: profileData.prn }, {
//           headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
//         });
//       }

//       if (selectedImage) {
//         const formData = new FormData();
//         formData.append("image", selectedImage);
//         await axios.post(`http://localhost:8080/api/profiles/${profileData.prn}/image`, formData, {
//           headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
//         });
//       }

//       fetchUserProfile();
//       setShowProfileForm(false);
//     } catch (error) {
//       setMessage("Error saving profile.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getDepartmentName = (id) => {
//     if (typeof id === "string" && isNaN(id)) return id;
//     const dept = departments.find((d) => d.departmentId === parseInt(id));
//     return dept ? dept.name : "Not set";
//   };

//   return (
//     <div className="flex min-h-screen bg-[#F8FAFC]">
//       {/* SIDEBAR - Wide and Detailed */}
//       <aside className="w-96 bg-white border-r border-gray-100 flex flex-col p-8 sticky top-0 h-screen shadow-sm">
//         <div className="flex items-center gap-3 mb-8">
//           <div className="bg-[#7C3AED] p-2 rounded-xl">
//             <LayoutDashboard className="text-white w-7 h-7" />
//           </div>
//           <h1 className="text-2xl font-bold text-gray-800 tracking-tight">User<span className="text-[#7C3AED]">Portal</span></h1>
//         </div>

//         {/* Profile Image Section */}
//         <div className="relative group mx-auto mb-6">
//           <div className="w-40 h-40 rounded-[2.5rem] overflow-hidden border-8 border-gray-50 shadow-inner bg-gray-100">
//             {profileImage ? (
//               <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
//             ) : (
//               <div className="w-full h-full flex items-center justify-center text-gray-400">
//                 <User size={48} />
//               </div>
//             )}
//           </div>
//           <button 
//             onClick={() => setShowProfileForm(true)}
//             className="absolute bottom-1 right-1 bg-white p-2.5 rounded-2xl shadow-xl border border-gray-100 text-[#7C3AED] hover:scale-110 transition-transform"
//           >
//             <Edit size={18} />
//           </button>
//         </div>

//         <div className="text-center mb-6">
//           <h2 className="text-2xl font-bold text-gray-800 tracking-tight leading-tight">{profileData.fullName || user?.username}</h2>
//           <span className="mt-2 inline-block text-[10px] font-black bg-[#7C3AED]/10 text-[#7C3AED] px-4 py-1.5 rounded-full uppercase tracking-widest">
//             {user?.role || "USERS"}
//           </span>
//         </div>

//         {/* DETAILED INFO LIST - Scrollable if content overflows */}
//         <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar pb-4">
//           <SidebarInfoBox label="Full Name" value={profileData.fullName} />
//           <SidebarInfoBox label="Username" value={user?.username} />
//           <SidebarInfoBox label="PRN / ID" value={profileData.prn} />
//           <SidebarInfoBox label="Email" value={user?.email} />
//           <SidebarInfoBox label="Department" value={getDepartmentName(profileData.departmentId)} />
//           <SidebarInfoBox label="Year" value={profileData.year} />
//           <SidebarInfoBox label="Phone" value={profileData.phoneNumber} />
//         </div>

//         {/* Sign Out Button */}
//         <button 
//           onClick={handleLogout}
//           className="mt-4 flex items-center justify-center gap-3 text-red-500 font-bold py-4 hover:bg-red-50 rounded-[1.5rem] transition-all border border-transparent hover:border-red-100"
//         >
//           <LogOut size={20} /> Sign Out
//         </button>
//       </aside>

//       {/* MAIN CONTENT AREA */}
//       <main className="flex-1 p-10">
//         <header className="flex justify-between items-center mb-10">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Dashboard</h1>
//             <p className="text-gray-500 mt-1">Welcome back, <span className="text-[#7C3AED] font-semibold">{user?.username}</span>. System is healthy.</p>
//           </div>
//           <div className="flex items-center gap-3 bg-green-50 text-green-600 px-5 py-2.5 rounded-full border border-green-100">
//             <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
//             <span className="text-xs font-bold uppercase tracking-widest">All Systems Live</span>
//           </div>
//         </header>

//         {/* Statistics Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
//           <StatCard icon={<CalendarDays />} label="Joined Clubs" value="0" color="blue" />
//           <StatCard icon={<BookOpen />} label="Total Events" value="12" color="orange" />
//           <StatCard icon={<ShieldCheck />} label="Verified Status" value={user?.verified ? "Verified" : "Pending"} color="purple" isStatus />
//         </div>

//         {/* Control Center Section */}
//         <section>
//           <div className="flex items-center gap-4 mb-8">
//             <h2 className="text-xl font-bold text-gray-800">Control Center</h2>
//             <div className="h-[1px] flex-1 bg-gray-100"></div>
//           </div>

//           <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
//             <ActionCard icon={<CalendarDays className="text-blue-500" />} label="Events" color="blue" />
//             <ActionCard icon={<User className="text-orange-500" />} label="My Clubs" color="orange" />
//             <ActionCard icon={<BookOpen className="text-green-500" />} label="Resources" color="green" />
//             <ActionCard icon={<Settings className="text-purple-500" />} label="Settings" color="purple" />
//           </div>
//         </section>
//       </main>

//       {/* Profile Form Modal */}
//       {showProfileForm && (
//         <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
//           <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-xl w-full p-8">
//             <div className="flex justify-between items-center mb-8">
//               <h3 className="text-2xl font-bold text-gray-800">{userProfile ? "Edit Profile" : "Complete Profile"}</h3>
//               <button onClick={() => setShowProfileForm(false)} className="bg-gray-50 p-2 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors">
//                 <X size={20} />
//               </button>
//             </div>
            
//             <form onSubmit={handleSubmitProfile} className="space-y-5">
//               <div className="grid grid-cols-2 gap-4">
//                 <FormInput label="PRN (Read Only)" value={profileData.prn} readOnly />
//                 <FormInput label="Full Name" value={profileData.fullName} onChange={(e) => setProfileData({...profileData, fullName: e.target.value})} required />
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-1">
//                   <label className="text-[10px] font-black text-gray-400 ml-1 uppercase tracking-widest">Department</label>
//                   <select 
//                     value={profileData.departmentId} 
//                     onChange={(e) => setProfileData({...profileData, departmentId: e.target.value})}
//                     className="w-full px-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#7C3AED] outline-none text-gray-700 font-medium"
//                     required
//                   >
//                     <option value="">Select Dept</option>
//                     {departments.map(dept => <option key={dept.departmentId} value={dept.departmentId}>{dept.name}</option>)}
//                   </select>
//                 </div>
//                 <div className="space-y-1">
//                   <label className="text-[10px] font-black text-gray-400 ml-1 uppercase tracking-widest">Year</label>
//                   <select 
//                     value={profileData.year} 
//                     onChange={(e) => setProfileData({...profileData, year: e.target.value})}
//                     className="w-full px-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#7C3AED] outline-none text-gray-700 font-medium"
//                     required
//                   >
//                     <option value="">Select Year</option>
//                     {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
//                   </select>
//                 </div>
//               </div>

//               <FormInput label="Phone Number" value={profileData.phoneNumber} onChange={(e) => setProfileData({...profileData, phoneNumber: e.target.value})} required />

//               <div className="bg-gray-50 p-6 rounded-2xl border-2 border-dashed border-gray-200 text-center hover:border-[#7C3AED]/30 transition-colors">
//                 <input type="file" accept="image/*" onChange={(e) => setSelectedImage(e.target.files[0])} className="hidden" id="profile-upload" />
//                 <label htmlFor="profile-upload" className="cursor-pointer flex flex-col items-center gap-2 text-gray-500 hover:text-[#7C3AED]">
//                   <Upload size={24} />
//                   <span className="text-sm font-semibold">{selectedImage ? selectedImage.name : "Upload Profile Photo"}</span>
//                 </label>
//               </div>

//               <button 
//                 type="submit" 
//                 disabled={loading}
//                 className="w-full bg-[#7C3AED] text-white py-4 rounded-2xl font-bold shadow-lg shadow-purple-100 hover:bg-[#6D28D9] transition-all disabled:opacity-50"
//               >
//                 {loading ? "Saving..." : userProfile ? "Update Profile" : "Complete Profile"}
//               </button>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// /* HELPER COMPONENTS */
// function SidebarInfoBox({ label, value }) {
//   return (
//     <div className="p-4 bg-gray-50/50 rounded-[1.2rem] border border-transparent hover:border-gray-100 transition-colors group">
//       <p className="text-[9px] uppercase font-black text-gray-400 mb-1 tracking-widest group-hover:text-[#7C3AED] transition-colors">{label}</p>
//       <p className="text-gray-700 font-bold text-sm truncate">{value || "Not set"}</p>
//     </div>
//   );
// }

// function StatCard({ icon, label, value, color, isStatus }) {
//   const bgColors = { blue: "bg-blue-50 text-blue-500", orange: "bg-orange-50 text-orange-500", purple: "bg-purple-50 text-purple-500" };
//   return (
//     <div className="bg-white p-7 rounded-[2.5rem] shadow-sm border border-gray-50 flex items-center gap-6">
//       <div className={`${bgColors[color]} p-5 rounded-[1.5rem]`}>{icon}</div>
//       <div>
//         <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">{label}</p>
//         <h3 className={`text-2xl font-black tracking-tight ${isStatus ? (value === "Verified" ? "text-green-500" : "text-amber-500") : "text-gray-800"}`}>
//           {value}
//         </h3>
//       </div>
//     </div>
//   );
// }

// function ActionCard({ icon, label, color }) {
//   const themes = {
//     blue: "bg-blue-50/40 hover:bg-blue-50",
//     orange: "bg-orange-50/40 hover:bg-orange-50",
//     green: "bg-green-50/40 hover:bg-green-50",
//     purple: "bg-purple-50/40 hover:bg-purple-50"
//   };
//   return (
//     <button className={`${themes[color]} p-10 rounded-[2.5rem] border border-gray-50/50 transition-all hover:scale-[1.03] flex flex-col items-center justify-center gap-5 group shadow-sm`}>
//       <div className="p-5 bg-white rounded-2xl shadow-sm group-hover:shadow-md transition-all group-hover:-translate-y-1">
//         {icon}
//       </div>
//       <span className="font-black text-gray-700 uppercase text-xs tracking-widest">{label}</span>
//     </button>
//   );
// }

// function FormInput({ label, ...props }) {
//   return (
//     <div className="space-y-1">
//       <label className="text-[10px] font-black text-gray-400 ml-1 uppercase tracking-widest">{label}</label>
//       <input 
//         className="w-full px-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#7C3AED] outline-none text-gray-700 font-medium transition-all"
//         {...props} 
//       />
//     </div>
//   );
// }