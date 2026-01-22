import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserRemoveFromClub = () => {
  const [userClubs, setUserClubs] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClub, setSelectedClub] = useState('');

  // Extract unique clubs from data
  const clubs = [...new Set(userClubs.map(item => ({ id: item.clubId, name: item.clubName })))];
  
  // Fetch all user-club associations
  const fetchUserClubs = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8080/api/user-clubs', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.success) {
        // Filter out users with TEACHER role (case insensitive)
        const nonTeacherUsers = response.data.data.filter(user => 
          user.role.toUpperCase() !== 'TEACHER'
        );
        setUserClubs(nonTeacherUsers);
        setFilteredUsers(nonTeacherUsers);
      }
    } catch (err) {
      setError('Failed to fetch user data. Please try again.');
      console.error('Error fetching user clubs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserClubs();
  }, []);

  // Filter users based on search term and selected club
  useEffect(() => {
    let filtered = userClubs;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(term) ||
        user.prn.toLowerCase().includes(term) ||
        user.department.toLowerCase().includes(term) ||
        user.role.toLowerCase().includes(term)
      );
    }
    
    if (selectedClub) {
      filtered = filtered.filter(user => 
        user.clubId.toString() === selectedClub
      );
    }
    
    setFilteredUsers(filtered);
  }, [searchTerm, selectedClub, userClubs]);

  // Remove user from club
// Remove user from club
const handleRemoveUser = async (user) => {
  const { prn, clubName, name, clubId, role, tenure } = user;
  
  if (!window.confirm(`Are you sure you want to remove ${name} from ${clubName}?`)) {
    return;
  }

  try {
    // DELETE endpoint with PRN and club name in URL
    const response = await axios.delete(
      `http://localhost:8080/api/user-clubs/user/${prn}/club/${clubName}`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        // Send required data in the request body
        data: {
          prn: prn,
          clubId: clubId, // From the user object
          role: role, // From the user object
          tenure: tenure // From the user object
        }
      }
    );

    if (response.data.success) {
      setSuccessMessage(`Successfully removed ${name} from ${clubName}`);
      
      // Refresh the list
      fetchUserClubs();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  } catch (err) {
    setError(`Failed to remove user. ${err.response?.data?.message || err.message}`);
    console.error('Error removing user:', err);
    console.error('Error details:', {
      url: `http://localhost:8080/api/user-clubs/user/${prn}/club/${clubName}`,
      body: { prn, clubId, role, tenure },
      status: err.response?.status,
      data: err.response?.data
    });
  }
};

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Remove User from Club</h1>
          <p className="text-gray-600 mt-2">Manage club memberships by removing users from clubs</p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search Input */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Users
              </label>
              <input
                type="text"
                id="search"
                placeholder="Search by name, PRN, department, or role..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Club Filter */}
            <div>
              <label htmlFor="clubFilter" className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Club
              </label>
              <select
                id="clubFilter"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={selectedClub}
                onChange={(e) => setSelectedClub(e.target.value)}
              >
                <option value="">All Clubs</option>
                {clubs.map((club, index) => (
                  <option key={index} value={club.id}>
                    {club.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700">Total Users</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">{filteredUsers.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700">Unique Clubs</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">{clubs.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700">Active Roles</h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              {[...new Set(filteredUsers.map(user => user.role))].length}
            </p>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || selectedClub ? 'Try adjusting your filters' : 'No users available to display'}
                </p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User Details
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Club & Role
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Academic Info
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.userClubId} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                        
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.prn}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-medium">{user.clubName}</div>
                        <div className="text-sm text-gray-500">Club ID: {user.clubId}</div>
                        <div className="mt-1">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            user.role === 'CLUB_ADMIN' 
                              ? 'bg-purple-100 text-purple-800'
                              : user.role === 'MEMBER'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.department}</div>
                        <div className="text-sm text-gray-500">Year: {user.year}</div>
                        <div className="text-sm text-gray-500">Tenure: {user.tenure}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
         <button
  onClick={() => handleRemoveUser(user)}
  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
>
  <svg className="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
  Remove
</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Showing {filteredUsers.length} of {userClubs.length} users (Teacher roles are filtered out)</p>
          <p className="mt-1">Only users with CLUB_ADMIN or MEMBER roles are displayed</p>
        </div>
      </div>
    </div>
  );
};

export default UserRemoveFromClub;