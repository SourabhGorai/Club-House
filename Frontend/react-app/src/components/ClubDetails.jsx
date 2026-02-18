// import { useParams, useNavigate } from "react-router-dom";
// import { useState, useEffect } from "react";
// import axios from "axios";
// import { ArrowLeft, Users, Trophy, Calendar, User, Mail, GraduationCap, Building2 } from "lucide-react";

// export default function ClubDetails() {
//   const { clubName } = useParams();
//   const navigate = useNavigate();
//   const token = localStorage.getItem("token");
  
//   const [clubDetails, setClubDetails] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     fetchClubDetails();
//   }, [clubName]);

//   const fetchClubDetails = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get(
//         `http://localhost:8080/api/user-clubs/club/${clubName}`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       if (response.data.success) {
//         setClubDetails(response.data.data);
//         setError(null);
//       } else {
//         setError("Failed to fetch club details");
//       }
//     } catch (err) {
//       console.error("Error fetching club details:", err);
//       setError(err.response?.data?.message || "Error fetching club details");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: "#4CA1AF" }}></div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
//         <div className="text-center">
//           <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
//           <p className="text-gray-600">{error}</p>
//           <button
//             onClick={() => navigate(-1)}
//             className="mt-4 px-6 py-2 bg-[#4CA1AF] text-white rounded-xl hover:bg-[#3d8a96]"
//           >
//             Go Back
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-[#F8FAFC]">
//       {/* Header */}
//       <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
//         <div className="max-w-7xl mx-auto px-6 py-4">
//           <button
//             onClick={() => navigate(-1)}
//             className="flex items-center gap-2 text-gray-600 hover:text-[#4CA1AF] transition-colors"
//           >
//             <ArrowLeft size={20} />
//             <span>Back to Dashboard</span>
//           </button>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="max-w-7xl mx-auto px-6 py-8">
//         {/* Club Header */}
//         <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-50 mb-8">
//           <div className="flex items-center gap-4 mb-4">
//             <div
//               className="p-4 rounded-xl"
//               style={{ backgroundColor: "rgba(76, 161, 175, 0.1)" }}
//             >
//               <Trophy className="w-8 h-8" style={{ color: "#4CA1AF" }} />
//             </div>
//             <div>
//               <h1 className="text-3xl font-bold text-gray-800">{clubName}</h1>
//               <p className="text-gray-500 mt-1">
//                 Total Members: {clubDetails.length}
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Members List */}
//         <div className="bg-white rounded-[2rem] shadow-sm border border-gray-50 overflow-hidden">
//           <div className="p-6 border-b border-gray-100">
//             <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
//               <Users size={20} style={{ color: "#4CA1AF" }} />
//               Club Members
//             </h2>
//           </div>

//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="text-left p-4 text-xs font-black text-gray-500 uppercase tracking-widest">Member</th>
//                   <th className="text-left p-4 text-xs font-black text-gray-500 uppercase tracking-widest">PRN</th>
//                   <th className="text-left p-4 text-xs font-black text-gray-500 uppercase tracking-widest">Department</th>
//                   <th className="text-left p-4 text-xs font-black text-gray-500 uppercase tracking-widest">Year</th>
//                   <th className="text-left p-4 text-xs font-black text-gray-500 uppercase tracking-widest">Role</th>
//                   <th className="text-left p-4 text-xs font-black text-gray-500 uppercase tracking-widest">Tenure</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {clubDetails.map((member, index) => (
//                   <tr key={member.userClubId || index} className="border-b border-gray-100 hover:bg-gray-50">
//                     <td className="p-4">
//                       <div className="flex items-center gap-3">
//                         <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
//                           {member.hasProfileImage ? (
//                             <img 
//                               src={`http://localhost:8080/api/profiles/${member.prn}/image`}
//                               alt={member.name}
//                               className="w-10 h-10 rounded-full object-cover"
//                               onError={(e) => {
//                                 e.target.onerror = null;
//                                 e.target.style.display = 'none';
//                               }}
//                             />
//                           ) : (
//                             <User size={18} className="text-gray-500" />
//                           )}
//                         </div>
//                         <div>
//                           <p className="font-medium text-gray-800">{member.name || 'N/A'}</p>
//                           <p className="text-xs text-gray-500">{member.email || 'No email'}</p>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="p-4 text-sm text-gray-600">{member.prn}</td>
//                     <td className="p-4 text-sm text-gray-600">{member.department || 'Not specified'}</td>
//                     <td className="p-4 text-sm text-gray-600">{member.year || 'N/A'}</td>
//                     <td className="p-4">
//                       <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
//                         member.role === 'TEACHER' ? 'bg-purple-100 text-purple-700' : 
//                         member.role === 'STUDENT' ? 'bg-green-100 text-green-700' : 
//                         'bg-blue-100 text-blue-700'
//                       }`}>
//                         {member.role || 'MEMBER'}
//                       </span>
//                     </td>
//                     <td className="p-4 text-sm text-gray-600">{member.tenure || 'Current'}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom"; // Add useLocation
import axios from "axios";
import {
  Trophy,
  Users,
  Calendar,
  Mail,
  User,
  ArrowLeft,
  GraduationCap,
  BookOpen,
  MapPin,
  Clock,
  Award,
  Edit,
  Trash2,
  Plus,
  X
} from "lucide-react";

// Members Modal Component
const MembersModal = ({ isOpen, onClose, members, loading, clubName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md">
      <div className="bg-white rounded-2xl shadow-2xl w-11/12 max-w-4xl max-h-[80vh] flex flex-col overflow-hidden">
        
        {/* HEADER */}
        <div className="flex justify-between items-center p-8 pb-4">
          <h3 className="font-display text-2xl font-bold" style={{color: '#4CA1AF'}}>
            Members of {clubName}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto px-8">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{borderColor: '#4CA1AF'}}></div>
              <p className="mt-2 text-gray-500">Loading members...</p>
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No members found for this club
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6">
              {members.map((member) => (
                <div
                  key={member.userClubId}
                  className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-white hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center"
                         style={{backgroundColor: 'rgba(76, 161, 175, 0.1)'}}>
                      {member.hasProfileImage ? (
                        <img 
                          src={`http://localhost:8080/api/profiles/${member.prn}/image`}
                          alt={member.name}
                          className="w-10 h-10 rounded-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <span className="font-bold" style={{color: '#4CA1AF'}}>
                          {member.name?.charAt(0) || 'U'}
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">{member.name}</h4>
                      <p className="text-xs text-gray-500">{member.prn}</p>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500">Role:</span>
                      <span
                        className={`text-xs font-bold uppercase ${
                          member.role === "CLUB_ADMIN"
                            ? "text-[#4CA1AF]"
                            : member.role === "TEACHER"
                            ? "text-green-600"
                            : "text-blue-600"
                        }`}
                      >
                        {member.role?.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500">Department:</span>
                      <span className="text-xs font-bold">
                        {member.department || 'Not specified'}
                      </span>
                    </div>

                    {member.year && (
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-500">Year:</span>
                        <span className="text-xs font-bold">
                          Year {member.year}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500">Tenure:</span>
                      <span className="text-xs font-bold">
                        {member.tenure || 'Current'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="px-8 py-4 border-t border-gray-200 flex justify-between items-center bg-gray-50">
          <span className="text-sm text-gray-500">
            Total: {members.length} members
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default function ClubDetails() {
  const { clubName } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); // Add this to get state from navigation
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  // Get user role from localStorage or from navigation state
  const userRole = user?.role || location.state?.userRole || "USER";

  const [clubDetails, setClubDetails] = useState(null);
  const [clubMembers, setClubMembers] = useState([]);
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [membersLoading, setMembersLoading] = useState(false);

  // Check if user is a teacher (case insensitive)
  const isTeacher = userRole?.toUpperCase() === "TEACHER" || userRole?.toUpperCase() === "TEACHERS";

  useEffect(() => {
    fetchClubDetails();
  }, [clubName]);

  const fetchClubDetails = async () => {
    try {
      setLoading(true);
      const decodedClubName = decodeURIComponent(clubName);
      
      // First, fetch club basic info
      const clubsResponse = await axios.get("http://localhost:8080/api/clubs", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (clubsResponse?.data?.success) {
        const allClubs = clubsResponse.data.data || [];
        const currentClub = allClubs.find(c => c.clubName === decodedClubName);
        
        if (currentClub) {
          setClubDetails(currentClub);
          // Fetch admin data for this club
          await fetchAdminData(currentClub.clubId);
          // Fetch members for this club
          await fetchMembersByClubName(decodedClubName);
        } else {
          setError("Club not found");
        }
      }
    } catch (err) {
      console.error("Error fetching club details:", err);
      setError(err.response?.data?.message || "Error fetching club details");
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminData = async (clubId) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/clubs/${clubId}/admin`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response?.data?.success) {
        const clubData = response.data.data || {};
        const adminsWithEmail = await Promise.all(
          (clubData.clubAdmins || []).map(async (admin) => {
            const email = await fetchAdminEmail(admin.prn);
            return { ...admin, email: email || "N/A" };
          })
        );
        setAdminData({ ...clubData, clubAdmins: adminsWithEmail });
      }
    } catch (err) {
      console.error("Error fetching admin data:", err);
    }
  };

  const fetchAdminEmail = async (prn) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/users/${prn}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response?.data?.email || null;
    } catch (err) {
      return null;
    }
  };

  const fetchMembersByClubName = async (clubName) => {
    setMembersLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:8080/api/user-clubs/club/${encodeURIComponent(clubName)}`,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response?.data?.success) {
        setClubMembers(response.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching members:", err);
    } finally {
      setMembersLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    return isNaN(d) ? dateString : d.toLocaleDateString();
  };

  const handleMembersClick = () => {
    setShowMembersModal(true);
  };

  const handleEditClub = () => {
    navigate(`/club/${clubName}/edit`);
  };

  const handleAddEvent = () => {
    // Navigate to create event page with club pre-selected
    navigate(`/create-event?clubId=${clubDetails.clubId}&clubName=${encodeURIComponent(clubDetails.clubName)}`);
  };

  const handleManageMembers = () => {
    navigate(`/club/${clubName}/members/manage`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#4CA1AF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading club details...</p>
        </div>
      </div>
    );
  }

  if (error || !clubDetails) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-white rounded-[2rem] shadow-sm">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-6">{error || "Club not found"}</p>
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-[#4CA1AF] text-white rounded-xl font-semibold hover:bg-[#3d8a98] transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header with Back Button */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-[#4CA1AF] transition-colors group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Club Header */}
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-50 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              <div
                className="p-6 rounded-[2rem]"
                style={{ backgroundColor: "rgba(76, 161, 175, 0.1)" }}
              >
                <Trophy className="w-12 h-12" style={{ color: "#4CA1AF" }} />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-800 mb-2">
                  {clubDetails.clubName}
                </h1>
                <div className="flex items-center gap-4 flex-wrap">
                  <span
                    className="px-4 py-1.5 rounded-full text-sm font-semibold"
                    style={{
                      backgroundColor: "rgba(76, 161, 175, 0.1)",
                      color: "#26727e",
                    }}
                  >
                    {clubDetails.category || "Academic Club"}
                  </span>
                  <span className="flex items-center gap-1 text-gray-600">
                    <Users size={18} />
                    {clubMembers.length} Members
                  </span>
                  <span className="flex items-center gap-1 text-gray-600">
                    <Calendar size={18} />
                    Added {formatDate(clubDetails.createdAt)}
                  </span>
                  <div className={`px-2 py-1 rounded-md flex items-center gap-1.5 ${clubDetails.isActive ? "bg-green-50" : "bg-gray-100"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${clubDetails.isActive ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}></span>
                    <span className={`text-xs font-bold uppercase ${clubDetails.isActive ? "text-green-600" : "text-gray-500"}`}>
                      {clubDetails.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons - Conditional rendering based on role */}
            {clubDetails.isActive && (
              <div className="flex gap-3">
                {/* Show Add Event button only for teachers */}
                {isTeacher && (
                  <button
                    onClick={handleAddEvent}
                    className="px-5 py-2.5 bg-[#4CA1AF] text-white rounded-xl font-semibold hover:bg-[#3d8a98] transition-colors flex items-center gap-2"
                  >
                    <Plus size={18} />
                    Add Event
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div 
            className="bg-white p-6 rounded-2xl border border-gray-50 shadow-sm hover:shadow-md transition-all cursor-pointer"
            onClick={handleMembersClick}
          >
            <Users className="text-[#5db2be] mb-3" size={24} />
            <span className="text-4xl font-black text-[#5db2be]">
              {clubMembers.length}
            </span>
            <p className="text-xs font-bold uppercase text-gray-400 mt-2">
              Total Members
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-50 shadow-sm">
            <GraduationCap className="text-[#5db2be] mb-3" size={24} />
            <span className="text-4xl font-black text-[#5db2be]">
              {adminData?.clubAdmins?.length || 0}
            </span>
            <p className="text-xs font-bold uppercase text-gray-400 mt-2">
              Club Admins
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-50 shadow-sm">
            <Award className="text-[#5db2be] mb-3" size={24} />
            <span className="text-4xl font-black text-[#5db2be]">
              {adminData?.teacherName ? 1 : 0}
            </span>
            <p className="text-xs font-bold uppercase text-gray-400 mt-2">
              Teacher Advisor
            </p>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-6 py-3 font-semibold transition-colors relative ${
              activeTab === "overview"
                ? "text-[#4CA1AF]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Overview
            {activeTab === "overview" && (
              <div
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ backgroundColor: "#4CA1AF" }}
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab("leadership")}
            className={`px-6 py-3 font-semibold transition-colors relative ${
              activeTab === "leadership"
                ? "text-[#4CA1AF]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Leadership
            {activeTab === "leadership" && (
              <div
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ backgroundColor: "#4CA1AF" }}
              />
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-50">
          {activeTab === "overview" && (
            <OverviewTab 
              clubDetails={clubDetails} 
              membersCount={clubMembers.length}
            />
          )}
          {activeTab === "leadership" && (
            <LeadershipTab 
              adminData={adminData}
              clubId={clubDetails.clubId}
              isActive={clubDetails.isActive}
            />
          )}
        </div>
      </div>

      {/* Members Modal */}
      <MembersModal 
        isOpen={showMembersModal}
        onClose={() => setShowMembersModal(false)}
        members={clubMembers}
        loading={membersLoading}
        clubName={clubDetails.clubName}
      />
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ clubDetails, membersCount }) {
  return (
    <div className="space-y-8">
      {/* Description */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-3">About the Club</h3>
        <p className="text-gray-600 leading-relaxed">
          {clubDetails.clubDesc || "No description available for this club."}
        </p>
      </div>

      {/* Club Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DetailCard
          icon={<Calendar />}
          label="Created On"
          value={new Date(clubDetails.createdAt).toLocaleDateString()}
        />
        <DetailCard
          icon={<Users />}
          label="Total Members"
          value={membersCount.toString()}
        />
        <DetailCard
          icon={<GraduationCap />}
          label="Category"
          value={clubDetails.category || "Not specified"}
        />
        <DetailCard
          icon={<Award />}
          label="Status"
          value={
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              clubDetails.isActive 
                ? "bg-green-100 text-green-700" 
                : "bg-gray-100 text-gray-500"
            }`}>
              {clubDetails.isActive ? "Active" : "Inactive"}
            </span>
          }
        />
      </div>
    </div>
  );
}

// Leadership Tab Component
function LeadershipTab({ adminData, clubId, isActive }) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
        <span className="w-1 h-6 rounded-full" style={{backgroundColor: '#4CA1AF'}}></span> 
        Leadership & Contact
      </h3>

      <div className="grid gap-4">
        {/* Club Admins */}
        <div className="flex flex-col sm:flex-row justify-between p-5 bg-white rounded-2xl border border-gray-100 shadow-sm items-center gap-4">
          <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">Club Admins:</span>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <span className="font-bold text-black text-center sm:text-left">
              {adminData?.clubAdmins?.map(a => a.name).join(", ") || "None Assigned"}
            </span>
          </div>
        </div>

        {/* Teacher Advisor */}
        <div className="flex flex-col sm:flex-row justify-between p-5 bg-white rounded-2xl border border-gray-100 shadow-sm items-center gap-4">
          <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">Teacher Advisor:</span>
          <div className="flex items-center gap-3">
            <span className="font-bold text-gray-700">
              {adminData?.teacherName && adminData.teacherName !== "Not Assigned" 
                ? adminData.teacherName 
                : <span className="text-gray-400 italic">Not Assigned</span>}
            </span>
          </div>
        </div>

        {/* Contact Email */}
        <div className="flex flex-col sm:flex-row justify-between p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">Contact Email:</span>
          <span className="font-bold text-black">
            {adminData?.clubAdmins?.map(a => a.email).join(", ") || "N/A"}
          </span>
        </div>

        {/* Admin PRNs */}
        <div className="flex flex-col sm:flex-row justify-between p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">Admin PRNs:</span>
          <span className="font-bold text-black">
            {adminData?.clubAdmins?.map(a => a.prn).join(", ") || "N/A"}
          </span>
        </div>
      </div>
    </div>
  );
}

// Detail Card Component
function DetailCard({ icon, label, value }) {
  return (
    <div className="p-5 bg-gray-50 rounded-xl">
      <div className="flex items-center gap-3 mb-2">
        <div className="text-[#4CA1AF]">{icon}</div>
        <p className="text-sm font-semibold text-gray-500">{label}</p>
      </div>
      <div className="text-gray-800 font-medium">{value}</div>
    </div>
  );
}