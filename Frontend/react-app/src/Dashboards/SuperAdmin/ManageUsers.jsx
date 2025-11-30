import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  User,
  Mail,
  Phone,
  BookOpen,
  Calendar,
  Edit,
  Trash2,
  MoreVertical,
  Briefcase,
  Layers,
} from 'lucide-react';

// ----------------------------------------------------------------
// 1. UI COMPONENTS (Modal & Custom Styles/Classes)
// ----------------------------------------------------------------

// Replaces window.confirm/alert
const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-70 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-lg shadow-red-500/50 p-6 w-11/12 max-w-md transform transition-all duration-300">
        <h3 className="font-bold text-xl text-red-600 mb-3">{title}</h3>
        <p className="text-gray-700 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 text-sm font-medium rounded-full bg-red-600 text-white hover:bg-red-700 transition"
          >
            Delete User
          </button>
        </div>
      </div>
    </div>
  );
};

// Custom Styles and Theme Setup
const customStyles = `
    /* Define Custom Fonts and Colors (matching previous component) */
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@500;700;800&display=swap');
    
    .font-sans { font-family: 'Poppins', sans-serif; }
    .font-display { font-family: 'Outfit', sans-serif; }

    /* Custom Gradient Button Class */
    .btn-gradient {
        background-image: linear-gradient(to right, #A78BFA, #8B5CF6);
        @apply text-white font-medium rounded-full py-2 px-4 transition-all duration-300 ease-out;
        box-shadow: 0 5px 15px rgba(139, 92, 246, 0.2);
    }
    .btn-gradient:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(139, 92, 246, 0.3);
    }

    /* Card Hover/Flip Effect for Delight */
    .user-card-container {
        perspective: 1000px;
        height: 20rem; /* Increased height for better visual balance and content space */
    }

    .user-card {
        transform-style: preserve-3d;
        transition: transform 0.5s ease-in-out;
        width: 100%;
        height: 100%;
        position: relative;
    }

    .user-card-container:hover .user-card, 
    .user-card-container.flipped .user-card {
        transform: rotateY(180deg);
    }

    .card-face {
        position: absolute;
        width: 100%;
        height: 100%;
        backface-visibility: hidden;
        border-radius: 1rem;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
        padding: 1.5rem;
    }

    .card-back {
        transform: rotateY(180deg);
        background: linear-gradient(135deg, #8B5CF6, #A78BFA); /* Violet Gradient */
    }
`;

// ----------------------------------------------------------------
// 2. MAIN COMPONENT
// ----------------------------------------------------------------

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [userProfiles, setUserProfiles] = useState({});
  const [profileImages, setProfileImages] = useState({});
  const [openOverlayFor, setOpenOverlayFor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchAllData();
  }, []);

  // --- API Calls (Refactored for cleaner flow) ---

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const usersResponse = await axios.get('http://localhost:8080/api/users/', {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });

      const usersData = usersResponse.data || [];
      setUsers(usersData);

      // Concurrent fetching of profiles and images
      const [profilesMap, imagesMap] = await Promise.all([
        fetchAllUserProfiles(usersData),
        fetchAllProfileImages(usersData),
      ]);

      setUserProfiles(profilesMap);
      setProfileImages(imagesMap);

    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load user data. Check API availability and authorization.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUserProfiles = async (usersList) => {
    const profilePromises = usersList.map(async (userItem) => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/profiles/prn/${userItem.prn}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        return { prn: userItem.prn, profile: response.data.data };
      } catch (error) {
        return { prn: userItem.prn, profile: null };
      }
    });
    const profileResults = await Promise.all(profilePromises);
    return profileResults.reduce((acc, result) => (result ? { ...acc, [result.prn]: result.profile } : acc), {});
  };

  const fetchAllProfileImages = async (usersList) => {
    const imagePromises = usersList.map(async (userItem) => {
      try {
        if (!userItem.prn) return { prn: userItem.prn, imageUrl: null };

        const response = await axios.get(
          `http://localhost:8080/api/profiles/${userItem.prn}/image`,
          { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' }
        );

        if (response.data && response.data.size > 0) {
          const imageUrl = URL.createObjectURL(response.data);
          return { prn: userItem.prn, imageUrl };
        } else {
          return { prn: userItem.prn, imageUrl: null };
        }
      } catch (error) {
        return { prn: userItem.prn, imageUrl: null };
      }
    });
    const imageResults = await Promise.all(imagePromises);
    return imageResults.reduce((acc, result) => (result ? { ...acc, [result.prn]: result.imageUrl } : acc), {});
  };

  // --- Handlers & Helpers ---

  const handleEditUser = (userId) => {
    // In a real app, this would navigate to the edit user route
    console.log('Edit user:', userId);
    alert(`Edit functionality for user ID ${userId} would open here!`);
  };

  const confirmDelete = (userItem) => {
    setUserToDelete(userItem);
    setIsModalOpen(true);
  };

  const executeDelete = async () => {
    if (!userToDelete) return;

    try {
      await axios.delete(`http://localhost:8080/api/users/${userToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Update the local state instantly
      setUsers(users.filter((user) => user.id !== userToDelete.id));
      // Close modal and reset
      setIsModalOpen(false);
      setUserToDelete(null);

    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user. Please try again.');
    }
  };

  function getRoleBadgeClass(role) {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-purple-600 text-white font-bold shadow-md shadow-purple-500/30';
      case 'TEACHER':
        return 'bg-teal-400 text-white font-bold shadow-md shadow-teal-400/30';
      case 'CLUB_ADMIN':
        return 'bg-orange-400 text-white font-bold shadow-md shadow-orange-400/30';
      default:
        return 'bg-gray-300 text-gray-700';
    }
  }

  // --- Render Functions ---

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <style dangerouslySetInnerHTML={{ __html: customStyles }} />
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#8B5CF6] mx-auto"></div>
          <p className="mt-6 font-medium text-[#4C1D95]">Loading user profiles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <p className="text-red-600 text-lg font-semibold">{error}</p>
          <button onClick={fetchAllData} className="mt-6 btn-gradient">
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans py-12" style={{ background: 'radial-gradient(circle at top left, #F2EEFF, #FDFCFE 60%, #F8F5FF)' }}>
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      <ConfirmationModal
        isOpen={isModalOpen}
        title="Confirm User Deletion"
        message={`You are about to delete user: ${userToDelete?.username || 'N/A'}. This action is irreversible. Proceed?`}
        onConfirm={executeDelete}
        onCancel={() => setIsModalOpen(false)}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h1 className="font-display text-4xl font-extrabold text-[#4C1D95] tracking-tight">
            User Directory & Access Control
          </h1>
          <p className="text-gray-500 mt-2 text-lg">
            Manage all staff, teachers, and club administrators. Hover over cards for details.
          </p>
        </div>

        <div className="bg-white bg-opacity-95 rounded-3xl shadow-2xl p-6 sm:p-10 border border-gray-100">
          <header className="px-3 py-4 border-b border-gray-200 mb-8">
            <h2 className="text-2xl font-semibold text-[#4C1D95] font-display flex items-center">
              <Layers className="mr-3 w-6 h-6 text-[#A78BFA]" />
              Total Active Users ({users.length})
            </h2>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {users.map((userItem) => {
              const userProfile = userProfiles[userItem.prn];
              const imageUrl = profileImages[userItem.prn];
              const isFlipped = openOverlayFor === userItem.prn;

              return (
                <div
                  key={userItem.prn || userItem.id}
                  className={`user-card-container ${isFlipped ? 'flipped' : ''}`}
                  onClick={() => setOpenOverlayFor(isFlipped ? null : userItem.prn)}
                >
                  <div className="user-card">
                    {/* CARD FRONT: Minimal Info */}
                    <div className="card-face bg-white border border-gray-200 flex flex-col items-center justify-center transition-all duration-300 hover:shadow-xl hover:border-[#A78BFA]">
                      <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl mb-4">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={userItem.username}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/100x100/A78BFA/ffffff?text=U"; }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <span className="text-3xl font-display font-bold text-gray-600">
                              {userItem.username?.charAt(0)?.toUpperCase() ?? "?"}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="text-center">
                        <div className="text-xl font-display font-semibold text-gray-900 truncate max-w-[10rem]">
                          {userProfile?.fullName || userItem.username}
                        </div>
                        <span className={`inline-block mt-2 px-3 py-1 text-xs rounded-full ${getRoleBadgeClass(userItem.role)}`}>
                            {userItem.role?.replace('_', ' ') || 'STANDARD USER'}
                        </span>
                      </div>
                    </div>

                    {/* CARD BACK: Detailed Info (Theme: Violet Gradient) */}
                    <div className="card-face card-back text-white p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center mb-4">
                            <div className='flex items-center gap-3'>
                                <User className="w-6 h-6" />
                                <div className="font-display font-semibold text-2xl">{userItem.prn || 'N/A'}</div>
                            </div>
                            {/* Mobile Toggle Button */}
                            <button
                                className="sm:hidden p-2 text-white/80 rounded-full bg-white/20 hover:bg-white/30"
                            >
                                <MoreVertical className='w-5 h-5' />
                            </button>
                        </div>
                        
                        <div className="mt-4 text-sm space-y-3">
                            {/* Email */}
                            <div className="flex items-center gap-3">
                                <Mail className="w-4 h-4 text-[#2DD4BF]" />
                                <span className="truncate">{userItem.email}</span>
                            </div>
                            
                            {/* Phone */}
                            <div className="flex items-center gap-3">
                                <Phone className="w-4 h-4 text-[#FB923C]" />
                                <span>{userProfile?.phoneNumber || 'No contact info'}</span>
                            </div>

                            {/* Department / Year */}
                            <div className="flex items-center gap-3">
                                <BookOpen className="w-4 h-4 text-white/90" />
                                <span>{userProfile?.department || '—'}</span>
                                <Calendar className="w-4 h-4 ml-4 text-white/90" />
                                <span>Year: {userProfile?.year || '—'}</span>
                            </div>
                            
                            {/* Role Badge (on back) */}
                            <div className="flex items-center gap-3 pt-2">
                                <Briefcase className='w-4 h-4 text-white/90'/>
                                <span className="px-3 py-1 text-xs rounded-full bg-white text-[#8B5CF6] font-semibold">
                                    {userItem.role?.replace('_', ' ') || 'STANDARD USER'}
                                </span>
                            </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-6 space-x-2"> {/* Added space-x-2 here */}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEditUser(userItem.id); }}
                          className="px-3 py-2 bg-white text-[#8B5CF6] rounded-full text-sm font-medium hover:bg-gray-100 transition flex items-center shadow-md flex-1 min-w-0" // Reduced px-4 to px-3 and added flex-1
                        >
                          <Edit className="w-4 h-4 mr-1" /> {/* Reduced margin */}
                          Manage
                        </button>

                        <button
                          onClick={(e) => { e.stopPropagation(); confirmDelete(userItem); }}
                          className="px-3 py-2 bg-red-500 text-white rounded-full text-sm font-medium hover:bg-red-600 transition flex items-center shadow-md shadow-red-500/30 flex-1 min-w-0" // Reduced px-4 to px-3 and added flex-1
                        >
                          <Trash2 className="w-4 h-4 mr-1" /> {/* Reduced margin */}
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;