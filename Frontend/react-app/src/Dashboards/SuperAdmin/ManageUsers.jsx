import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Mail, Phone, BookOpen, Calendar, Edit, Trash2, MapPin } from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [userProfiles, setUserProfiles] = useState({});
  const [profileImages, setProfileImages] = useState({});
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const usersResponse = await axios.get("http://localhost:8080/api/users/", {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const usersData = usersResponse.data;
      setUsers(usersData);

      await fetchAllUserProfiles(usersData);
      await fetchAllProfileImages(usersData);

    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchAllUserProfiles = async (usersList) => {
    const profilePromises = usersList.map(async (userItem) => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/profiles/prn/${userItem.prn}`,
          {
            headers: { 
              Authorization: `Bearer ${token}`,
            }
          }
        );

        if (response.data) {
          return { prn: userItem.prn, profile: response.data.data };
        }
      } catch (error) {
        console.error(`Error fetching profile for user ${userItem.prn}:`, error);
        return { prn: userItem.prn, profile: null };
      }
    });

    const profileResults = await Promise.all(profilePromises);
    const profilesMap = profileResults.reduce((acc, result) => {
      if (result) acc[result.prn] = result.profile;
      return acc;
    }, {});

    setUserProfiles(profilesMap);
  };

  const fetchAllProfileImages = async (usersList) => {
    const imagePromises = usersList.map(async (userItem) => {
      try {
        if (!userItem.prn) {
          return { prn: userItem.prn, imageUrl: null };
        }

        const response = await axios.get(
          `http://localhost:8080/api/profiles/${userItem.prn}/image`,
          {
            headers: { 
              Authorization: `Bearer ${token}`,
            },
            responseType: 'blob'
          }
        );

        if (response.data && response.data.size > 0) {
          const imageUrl = URL.createObjectURL(response.data);
          return { prn: userItem.prn, imageUrl };
        } else {
          return { prn: userItem.prn, imageUrl: null };
        }
      } catch (error) {
        console.error(`Error fetching profile image for PRN ${userItem.prn}:`, error);
        return { prn: userItem.prn, imageUrl: null };
      }
    });

    const imageResults = await Promise.all(imagePromises);
    const imagesMap = imageResults.reduce((acc, result) => {
      if (result) acc[result.prn] = result.imageUrl;
      return acc;
    }, {});

    setProfileImages(imagesMap);
  };

  const handleEditUser = (userId) => {
    console.log("Edit user:", userId);
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`http://localhost:8080/api/users/${userId}`, {
          headers: { 
            Authorization: `Bearer ${token}`,
          }
        });
        setUsers(users.filter(user => user.id !== userId));
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Error deleting user");
      }
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
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">Manage all users in the system</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-white">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <User className="mr-3 w-5 h-5" />
              All Users ({users.length})
            </h2>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {users.map((userItem) => {
                const userProfile = userProfiles[userItem.prn];
                const hasProfile = !!userProfile;

                return (
                  <div 
                    key={userItem.prn} 
                    className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
                  >

                    <div className="relative">
                      <div className="h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-t-lg"></div>
                      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 p-2">
                        <div className="w-30 h-30 bg-white rounded-full border-4 border-white shadow-lg overflow-hidden">
                          {profileImages[userItem.prn] ? (
                            <img 
                              src={profileImages[userItem.prn]} 
                              alt={`${userItem.username}'s profile`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <span className="text-lg font-bold text-gray-600">
                                {userItem.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="pt-10 pb-4 px-4">
                      <div className="text-center mb-4">
                        <h3 className="font-semibold text-gray-900 text-lg mb-1">
                          {userItem.username}
                        </h3>
                        <p className="text-gray-600 text-sm flex items-center justify-center">
                          <Mail className="w-3 h-3 mr-1" />
                          {userItem.email}
                        </p>
                      </div>

                      <div className="flex justify-center mb-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(userItem.role)}`}>
                          {userItem.role.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500">PRN:</span>
                          <span className="font-medium">{userItem.prn || "N/A"}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500">Status:</span>
                          <span className={`font-medium ${userItem.verified ? 'text-green-600' : 'text-red-600'}`}>
                            {userItem.verified ? "Verified" : "Not Verified"}
                          </span>
                        </div>
                      </div>

                      {hasProfile && (
                        <div className="bg-gray-50 rounded-lg p-3 mb-4 space-y-2">
                          <h4 className="font-medium text-gray-800 text-sm mb-2 flex items-center">
                            <User className="w-3 h-3 mr-1" />
                            Profile Details
                          </h4>
                          <div className="space-y-1">
                            <div className="flex items-center text-sm">
                              <span className="text-gray-600 w-20">Name:</span>
                              <span className="font-medium">{userProfile.fullName}</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <BookOpen className="w-3 h-3 mr-1 text-gray-500" />
                              <span className="text-gray-600 w-20">Dept:</span>
                              <span className="font-medium">{userProfile.department}</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <Calendar className="w-3 h-3 mr-1 text-gray-500" />
                              <span className="text-gray-600 w-20">Year:</span>
                              <span className="font-medium">{userProfile.year}</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <Phone className="w-3 h-3 mr-1 text-gray-500" />
                              <span className="text-gray-600 w-20">Phone:</span>
                              <span className="font-medium">{userProfile.phoneNumber}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {!hasProfile && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                          <p className="text-yellow-800 text-xs text-center">
                            Profile not completed
                          </p>
                        </div>
                      )}

                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => handleEditUser(userItem.id)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </button>

                        <button
                          onClick={() => handleDeleteUser(userItem.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })}

            </div>

            {users.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-300 text-6xl mb-4">👥</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Users Found</h3>
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
