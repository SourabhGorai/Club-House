import { useFilteredUsersCount } from './UserRemoveFromClub';
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
  Building2
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
  const [clubs, setClubs] = useState([]);
  const [error, setError] = useState(null);
  const assignedStudentsCount = useFilteredUsersCount();

  useEffect(() => {
    fetchUserProfile();
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (departments.length > 0 && profileData.departmentId && typeof profileData.departmentId === 'string' && isNaN(profileData.departmentId)) {
      const dept = departments.find(d => d.name === profileData.departmentId);
      if (dept) {
        setProfileData(prev => ({ ...prev, departmentId: dept.departmentId }));
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
          deptId = typeof response.data.data.department === 'object' ? response.data.data.department.departmentId : response.data.data.department;
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
    setProfileLoading(true);
    try {
      const requestData = {
        fullName: profileData.fullName,
        departmentId: parseInt(profileData.departmentId),
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
      setProfileLoading(false);
    }
  };

  const getDepartmentName = (id) => {
    if (typeof id === 'string' && isNaN(id)) return id;
    const dept = departments.find(d => d.departmentId === parseInt(id));
    return dept ? dept.name : "Not set";
  };

  useEffect(() => {
        fetchUserClubs();
    }, []);

    const fetchUserClubs = async () => {
        try {
            // Get token from localStorage
            const token = localStorage.getItem('token'); // or 'authToken' depending on your key name
            // or if using Bearer format
            // const token = localStorage.getItem('accessToken');

            if (!token) {
                setError('No authentication token found');
                
                return;
            }

            const response = await axios.get('http://localhost:8080/api/user-clubs/getMyClubs', {
                headers: {
                    'Authorization': `Bearer ${token}` // Adjust based on your token format
                }
            });

            if (response.data.success) {
                setClubs(response.data.data);
                setError(null);
            } else {
                setError('Failed to fetch clubs');
            }
        } catch (err) {
            console.error('Error fetching clubs:', err);
            setError(err.response?.data?.message || 'Error fetching clubs');
        } finally {
            
        }
    };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* SIDEBAR - Wide and Professional */}
      <aside className="w-96 bg-white border-r border-gray-100 flex flex-col p-8 sticky top-0 h-screen shadow-sm">
        <div className="flex items-center gap-3 mb-10">
          <div className="p-2 rounded-xl" style={{background: 'linear-gradient(135deg, #4CA1AF, #315169)'}}>
            <GraduationCap className="text-white w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Teacher<span style={{color: '#4CA1AF'}}>Hub</span></h1>
        </div>

        {/* Profile Section */}
        <div className="relative group mx-auto mb-6">
          <div className="w-44 h-44 rounded-[2.5rem] overflow-hidden border-8 border-gray-50 shadow-inner bg-gray-100">
            {profileImage ? (
              <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <User size={64} />
              </div>
            )}
          </div>
          <button 
            onClick={() => setShowProfileForm(true)}
            className="absolute bottom-2 right-2 bg-white p-3 rounded-2xl shadow-xl border border-gray-100 transition-transform hover:scale-110 cursor-pointer"
            style={{color: '#4CA1AF'}}
          >
            <Edit size={18} />
          </button>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight leading-tight">{profileData.fullName || user?.username}</h2>
          <span className="mt-2 inline-block text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest"
                style={{backgroundColor: 'rgba(76, 161, 175, 0.1)', color: '#4CA1AF'}}>
            {user?.role || "Professor"}
          </span>
        </div>

        {/* Info Boxes */}
        <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar pb-4">
          <SidebarInfoBox label="Full Name" value={profileData.fullName} />
          <SidebarInfoBox label="Username" value={user?.username} />
          <SidebarInfoBox label="PRN / Staff ID" value={profileData.prn} />
          <SidebarInfoBox label="Email Address" value={user?.email} />
          <SidebarInfoBox label="Department" value={getDepartmentName(profileData.departmentId)} />
          <SidebarInfoBox label="Phone Number" value={profileData.phoneNumber} />
        </div>

        <button 
          onClick={handleLogout}
          className="mt-4 flex items-center justify-center gap-3 text-red-500 font-bold py-4 hover:bg-red-50 rounded-[1.5rem] transition-all border border-transparent hover:border-red-100 cursor-pointer"
        >
          <LogOut size={20} /> Sign Out
        </button>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-10">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Dashboard Overview</h1>
            <p className="text-gray-500 mt-1">Hope, You had a good day <span className="font-semibold" style={{color: '#4CA1AF'}}>Prof. {user?.username}</span></p>
          </div>
          <div className="flex items-center gap-3 px-5 py-2.5 rounded-full border"
               style={{backgroundColor: 'rgba(76, 161, 175, 0.1)', color: '#4CA1AF', borderColor: 'rgba(76, 161, 175, 0.2)'}}>
            <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{backgroundColor: '#4CA1AF'}}></div>
            <span className="text-xs font-bold uppercase tracking-widest">Systems Active</span>
          </div>
        </header>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <StatCard icon={<Calendar className="w-6 h-6" />} label="Events Managed" value="0" color="blue" />
          <StatCard icon={<Trophy className="w-6 h-6" />} label="My Clubs" value={clubs.length.toString()} color="green" />
          <StatCard icon={<Users className="w-6 h-6" />} label="Assigned Students" value={assignedStudentsCount.toString()} color="orange" />
        </div>

{/* Clubs List Section */}

{clubs.length > 0 && (
  <section className="mt-12">
    <div className="flex items-center gap-4 mb-8">
      <h2 className="text-xl font-bold text-gray-800">My Clubs</h2>
      <div className="h-[1px] flex-1 bg-gray-100"></div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {clubs.map((club) => (
        <div 
          key={club.clubId} 
          className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-50 hover:shadow-md transition-all cursor-pointer hover:scale-[1.02]"
          onClick={() => navigate(`/club/${club.clubId}`)} // Add navigation or function here
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl" style={{backgroundColor: 'rgba(76, 161, 175, 0.1)'}}>
              <Trophy className="w-5 h-5" style={{color: '#4CA1AF'}} />
            </div>
            <h3 className="text-lg font-bold text-gray-800">{club.clubName}</h3>
          </div>
          
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{club.desc}</p>
          
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Users size={16} />
              <span>{club.memberCount} {club.memberCount === 1 ? 'Member' : 'Members'}</span>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering the parent click
                navigate(`/club/${club.clubId}/details`); // Different action for button
              }}
              className="text-sm font-semibold hover:underline cursor-pointer"
              style={{color: '#4CA1AF'}}
            >
              View Details →
            </button>
          </div>
        </div>
      ))}
    </div>
  </section>
)}

        {/* CONTROL CENTER */}
<section className="mt-12">
  <div className="flex items-center gap-3 mb-6">
    <div className="w-1 h-6 rounded-full" style={{background: 'linear-gradient(to bottom, #4CA1AF, #315169)'}}></div>
    <h2 className="text-xl font-bold text-gray-800">Professor Control Center</h2>
    
  </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <ActionCard icon={<Plus />} label="Create Event" color="blue" />
            <ActionCard icon={<Trash2 />} label="Delete Event" color="red" />
            <ActionCard 
              icon={<Users />} 
              label="Add Student" 
              color="teal" 
              onClick={() => navigate("/add-users-with-club")}
            />
            <ActionCard 
              icon={<Building2 />} 
              label="Club Association" 
              color="orange" 
              onClick={() => navigate("/remove-users-from-club")}
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
              <button onClick={() => setShowProfileForm(false)} className="bg-gray-50 p-2 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmitProfile} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <FormInput label="PRN / Staff ID" value={profileData.prn} readOnly />
                <FormInput 
                   label="Full Name" 
                   value={profileData.fullName} 
                   onChange={(e) => setProfileData({...profileData, fullName: e.target.value})} 
                   required 
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 ml-1 uppercase tracking-widest">Department</label>
                <select 
                  value={profileData.departmentId} 
                  onChange={(e) => setProfileData({...profileData, departmentId: e.target.value})}
                  className="w-full px-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 outline-none text-gray-700 font-medium cursor-pointer"
                  style={{focus: {ringColor: '#4CA1AF'}}}
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => <option key={dept.departmentId} value={dept.departmentId}>{dept.name}</option>)}
                </select>
              </div>

              <FormInput 
                 label="Phone Number" 
                 value={profileData.phoneNumber} 
                 onChange={(e) => setProfileData({...profileData, phoneNumber: e.target.value})} 
                 required 
              />

              <div className="bg-gray-50 p-6 rounded-2xl border-2 border-dashed border-gray-200 text-center hover:border-[#4CA1AF] transition-colors cursor-pointer">
                <input type="file" accept="image/*" onChange={(e) => setSelectedImage(e.target.files[0])} className="hidden" id="profile-upload" />
                <label htmlFor="profile-upload" className="cursor-pointer flex flex-col items-center gap-2 text-gray-500 hover:text-[#4CA1AF]">
                  <Upload size={24} />
                  <span className="text-sm font-semibold">{selectedImage ? selectedImage.name : "Update Photo"}</span>
                </label>
              </div>

              <button 
                type="submit" 
                disabled={profileLoading}
                className="w-full text-white py-4 rounded-2xl font-bold shadow-lg transition-all disabled:opacity-50 cursor-pointer"
                style={{background: 'linear-gradient(135deg, #4CA1AF, #315169)', boxShadow: '0 10px 15px -3px rgba(76, 161, 175, 0.2)'}}
              >
                {profileLoading ? "Processing..." : userProfile ? "Save Profile Changes" : "Create Professional Profile"}
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
    <div className="p-4 bg-gray-50/50 rounded-[1.2rem] border border-transparent transition-colors group cursor-pointer">
      <p className="text-[9px] uppercase font-black text-gray-400 mb-1 tracking-widest transition-colors group-hover:text-[#4CA1AF]">{label}</p>
      <p className="text-gray-700 font-bold text-sm truncate">{value || "Not set"}</p>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  const bgColors = { 
    blue: {bg: 'rgba(76, 161, 175, 0.1)', text: '#4CA1AF'}, 
    green: {bg: 'rgba(16, 185, 129, 0.1)', text: '#10B981'}, 
    orange: {bg: 'rgba(249, 115, 22, 0.1)', text: '#F97316'} 
  };
  return (
    <div className="bg-white p-7 rounded-[2.5rem] shadow-sm border border-gray-50 flex items-center gap-6 cursor-pointer hover:shadow-md transition-all">
      <div className="p-5 rounded-[1.5rem]" style={{backgroundColor: bgColors[color].bg, color: bgColors[color].text}}>{icon}</div>
      <div>
        <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">{label}</p>
        <h3 className="text-2xl font-black tracking-tight text-gray-800">{value}</h3>
      </div>
    </div>
  );
}

function ActionCard({ icon, label, color, onClick }) {
  const themes = {
    blue: {bg: 'rgba(76, 161, 175, 0.05)', hover: 'rgba(76, 161, 175, 0.1)', icon: '#4CA1AF'},
    red: {bg: 'rgba(239, 68, 68, 0.05)', hover: 'rgba(239, 68, 68, 0.1)', icon: '#EF4444'},
    teal: {bg: 'rgba(76, 161, 175, 0.05)', hover: 'rgba(76, 161, 175, 0.1)', icon: '#4CA1AF'},
    orange: {bg: 'rgba(249, 115, 22, 0.05)', hover: 'rgba(249, 115, 22, 0.1)', icon: '#F97316'}
  };
  return (
    <button 
      onClick={onClick}
      className="p-10 rounded-[2.5rem] border border-gray-50/50 transition-all hover:scale-[1.03] flex flex-col items-center justify-center gap-5 group shadow-sm cursor-pointer"
      style={{backgroundColor: themes[color].bg, hover: {backgroundColor: themes[color].hover}}}
    >
      <div className="p-5 bg-white rounded-2xl shadow-sm group-hover:shadow-md transition-all group-hover:-translate-y-1"
           style={{color: themes[color].icon}}>
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
        className="w-full px-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 outline-none text-gray-700 font-medium transition-all cursor-text"
        style={{focus: {ringColor: '#4CA1AF'}}}
        {...props} 
      />
    </div>
  );
}