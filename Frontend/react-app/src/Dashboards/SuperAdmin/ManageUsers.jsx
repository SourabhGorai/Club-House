import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
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
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
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
        console.error(`Error fetching profile image for user ${userItem.id}:`, error);
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
        `http://localhost:8080/api/profiles/${prn}/image`,
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">Manage all users and their permissions</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Object.entries(stats).map(([role, count]) => (
            <div key={role} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${getRoleColor(role).split(' ')[0]} ${getRoleColor(role).split(' ')[1]}`}>
                  <span className="text-2xl">{getRoleIcon(role)}</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{role.replace('_', ' ')}</p>
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                </div>
              </div>
            </div>
          ))}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-indigo-100 text-indigo-800">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Users Grid */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">All Users</h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {users.map((userItem) => (
                <div key={userItem.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                  {/* Profile Image */}
                  <div className="relative">
                    <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg"></div>
                    <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                      <div className="w-16 h-16 bg-white rounded-full border-4 border-white shadow-lg overflow-hidden">
                        {profileImages[userItem.id] ? (
                          <img 
                            src={profileImages[userItem.id]} 
                            alt={`${userItem.username}'s profile`}
                            className="w-full h-full object-cover"
                            onError={() => fetchProfileImage(userItem.prn, userItem.id)}
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
                            {userItem.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="pt-8 pb-4 px-4 text-center">
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">
                      {userItem.username}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 truncate">{userItem.email}</p>
                    
                    <div className="flex justify-center mb-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(userItem.role)}`}>
                        <span className="mr-1">{getRoleIcon(userItem.role)}</span>
                        {userItem.role.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Additional Info */}
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>PRN: {userItem.prn || 'N/A'}</p>
                      <p>ID: {userItem.id}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-center space-x-2 mt-4 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => handleEditUser(userItem.id)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteUser(userItem.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">👥</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                <p className="text-gray-500">There are no users to display at the moment.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;