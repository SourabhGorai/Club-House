import { useState, useEffect } from "react";
import axios from "axios";

export default function SuperAdminDashboard() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      // Fetch users
      const usersResponse = await axios.get("http://localhost:8080/api/users/", {
        headers: { Authorization: `Bearer ${token}` ,
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-purple-600">Super Admin Dashboard 👑</h1>
            <p className="text-gray-600 mt-2">Complete system control and management</p>
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
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <p className="text-xl text-gray-700">
            Welcome, <span className="font-semibold text-purple-600">{user?.username}</span>
          </p>
          <p className="text-gray-500">You have full system administration privileges</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-purple-500">
            <h3 className="font-semibold text-gray-600 mb-2">Total Users</h3>
            <p className="text-3xl font-bold text-purple-600">{users.length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
            <h3 className="font-semibold text-gray-600 mb-2">Teachers</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.TEACHERS || 0}</p>
          </div>
           <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-orange-500">
            <h3 className="font-semibold text-gray-600 mb-2">Total Clubs</h3>
            <p className="text-3xl font-bold text-orange-600">{stats.CLUBS || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500">
            <h3 className="font-semibold text-gray-600 mb-2">Club Admins</h3>
            <p className="text-3xl font-bold text-green-600">{stats.CLUB_ADMIN || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-orange-500">
            <h3 className="font-semibold text-gray-600 mb-2">Regular Users</h3>
            <p className="text-3xl font-bold text-orange-600">{stats.USERS || 0}</p>
          </div>
        </div>

        {/* User Management */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">User Management</h2>
          
          {loading ? (
            <p className="text-gray-500 text-center py-8">Loading users...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-gray-700 font-semibold">Username</th>
                    <th className="px-6 py-3 text-left text-gray-700 font-semibold">Email</th>
                    <th className="px-6 py-3 text-left text-gray-700 font-semibold">Role</th>
                    <th className="px-6 py-3 text-left text-gray-700 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((userItem) => (
                    <tr key={userItem.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4">{userItem.username}</td>
                      <td className="px-6 py-4">{userItem.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          userItem.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800' :
                          userItem.role === 'TEACHERS' ? 'bg-blue-100 text-blue-800' :
                          userItem.role === 'CLUB_ADMIN' ? 'bg-green-100 text-green-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {userItem.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm mr-2">
                          Edit
                        </button>
                        <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        
          {/* Quick Actions */}
          <div className="bg-white my-6 rounded-xl shadow-lg p-6 md:col-span-2 lg:col-span-3">
            <h3 className="text-2xl font-bold mb-4 text-gray-800">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="bg-blue-500 cursor-pointer hover:bg-blue-600 text-white py-3 rounded-lg transition duration-300">
                Manage Users
              </button>
              <button className="bg-green-500 cursor-pointer hover:bg-green-600 text-white py-3 rounded-lg transition duration-300">
                Manage Events
              </button>
              <button className="bg-purple-500 cursor-pointer hover:bg-purple-600 text-white py-3 rounded-lg transition duration-300">
                Manage Club Admins
              </button>
              <button className="bg-orange-500 cursor-pointer hover:bg-orange-600 text-white py-3 rounded-lg transition duration-300">
               Manage Teachers
              </button>
               <button className="bg-orange-500 cursor-pointer hover:bg-orange-600 text-white py-3 rounded-lg transition duration-300">
               Manage Team Members 
              </button>
               <button className="bg-orange-500 cursor-pointer hover:bg-orange-600 text-white py-3 rounded-lg transition duration-300">
               Manage Clubs
              </button>
            </div>
          </div>
      </div>
    </div>
  );
}