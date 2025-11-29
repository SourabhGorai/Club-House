import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [profileImages, setProfileImages] = useState({});
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      // Fetch users
      const usersResponse = await axios.get("http://localhost:8080/api/users/", {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setUsers(usersResponse.data);

      // Calculate stats
      const userStats = usersResponse.data.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {});
      setStats(userStats);
      
      // Fetch profile images for all users
      await fetchAllProfileImages(usersResponse.data);
      
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchAllProfileImages = async (usersList) => {
    const imagePromises = usersList.map(async (userItem) => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/profiles/${userItem.prn}/image`,
          {
            headers: { 
              Authorization: `Bearer ${token}`,
            },
            responseType: 'blob'
          }
        );
        
        if (response.data) {
          const imageUrl = URL.createObjectURL(response.data);
          return { userId: userItem.id, imageUrl };
        }
      } catch (error) {
        console.error(`Error fetching profile image for user ${userItem.prn}:`, error);
        return { userId: userItem.id, imageUrl: null };
      }
    });

    const imageResults = await Promise.all(imagePromises);
    const imagesMap = imageResults.reduce((acc, result) => {
      if (result) {
        acc[result.userId] = result.imageUrl;
      }
      return acc;
    }, {});
    
    setProfileImages(imagesMap);
  };

  const fetchProfileImage = async (prn, userId) => {
    try {
      const response = await axios.get(
        `http://localhost:8082/api/profiles/${prn}/image`,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
          },
          responseType: 'blob'
        }
      );
      
      if (response.data) {
        const imageUrl = URL.createObjectURL(response.data);
        setProfileImages(prev => ({
          ...prev,
          [userId]: imageUrl
        }));
      }
    } catch (error) {
      console.error('Error fetching profile image:', error);
    }
  };

  const handleEditUser = (userId) => {
    // Navigate to edit user page or open modal
    console.log('Edit user:', userId);
    // navigate(`/edit-user/${userId}`);
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`http://localhost:8080/api/users/${userId}`, {
          headers: { 
            Authorization: `Bearer ${token}`,
          }
        });
        // Remove user from state
        setUsers(users.filter(user => user.id !== userId));
        // Update stats
        const updatedStats = { ...stats };
        const deletedUser = users.find(user => user.id === userId);
        if (deletedUser && updatedStats[deletedUser.role]) {
          updatedStats[deletedUser.role]--;
          setStats(updatedStats);
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error deleting user');
      }
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'from-purple-500 to-pink-500';
      case 'TEACHER':
        return 'from-blue-500 to-cyan-500';
      case 'CLUB_ADMIN':
        return 'from-green-500 to-emerald-500';
      default:
        return 'from-orange-500 to-red-500';
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'TEACHER':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CLUB_ADMIN':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-orange-100 text-orange-800 border-orange-200';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return '👑';
      case 'TEACHER':
        return '👨‍🏫';
      case 'CLUB_ADMIN':
        return '🎯';
      default:
        return '👤';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            User Management
          </h1>
          <p className="text-gray-600 mt-3 text-lg">Manage all users and their permissions</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {Object.entries(stats).map(([role, count]) => (
            <div key={role} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 transform hover:scale-105 transition-transform duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{role.replace('_', ' ')}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{count}</p>
                </div>
                <div className={`p-4 rounded-2xl bg-gradient-to-r ${getRoleColor(role)}`}>
                  <span className="text-2xl text-white">{getRoleIcon(role)}</span>
                </div>
              </div>
            </div>
          ))}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{users.length}</p>
              </div>
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500">
                <span className="text-2xl text-white">👥</span>
              </div>
            </div>
          </div>
        </div>

        {/* Users Grid */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-200/50 bg-gradient-to-r from-gray-50 to-white">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <span className="mr-3">👥</span>
              All Users ({users.length})
            </h2>
          </div>
          
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {users.map((userItem) => (
                <div key={userItem.id} className="group bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  
                  {/* Profile Header with Image */}
                  <div className="relative">
                    <div className={`h-24 bg-gradient-to-r ${getRoleColor(userItem.role)} rounded-t-2xl`}></div>
                    <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                      <div className="w-24 h-24 bg-white rounded-full border-4 border-white shadow-2xl overflow-hidden group-hover:scale-110 transition-transform duration-300">
                        {profileImages[userItem.id] ? (
                          <img 
                            src={profileImages[userItem.id]} 
                            alt={`${userItem.username}'s profile`}
                            className="w-full h-full object-cover"
                            onError={() => fetchProfileImage(userItem.prn, userItem.id)}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                            <span className="text-2xl font-bold text-gray-600">
                              {userItem.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="pt-16 pb-6 px-6 text-center">
                    <h3 className="font-bold text-gray-900 text-xl mb-2 group-hover:text-blue-600 transition-colors duration-200">
                      {userItem.username}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 truncate">{userItem.email}</p>
                    
                    <div className="flex justify-center mb-4">
                      <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border-2 ${getRoleBadgeColor(userItem.role)} group-hover:shadow-lg transition-shadow duration-200`}>
                        <span className="mr-2 text-lg">{getRoleIcon(userItem.role)}</span>
                        {userItem.role.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Additional Info */}
                    <div className="bg-gray-50 rounded-xl p-4 mb-4">
                      <div className="text-xs text-gray-600 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">PRN:</span>
                          <span className="font-semibold">{userItem.prn || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium">User ID:</span>
                          <span className="font-mono text-xs">{userItem.id}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-center space-x-3">
                      <button
                        onClick={() => handleEditUser(userItem.id)}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25 flex items-center"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteUser(userItem.id)}
                        className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-red-500/25 flex items-center"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {users.length === 0 && (
              <div className="text-center py-16">
                <div className="text-gray-300 text-8xl mb-6">👥</div>
                <h3 className="text-2xl font-bold text-gray-600 mb-3">No Users Found</h3>
                <p className="text-gray-500 text-lg">There are no users to display at the moment.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;