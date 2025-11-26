import {Users,CalendarRange,Calendar} from 'lucide-react';


export default function ClubAdminDashboard() {
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-green-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-green-600">Club Admin Dashboard 🎯</h1>
            <p className="text-gray-600 mt-2">Club management and member coordination</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              CLUB_ADMIN
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
                <strong>Reminder:</strong> nonsence Complete the JavaScript fundamentals course by Friday.
              </p>
            </div>
          </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Club Members */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="bg-green-100 p-3 rounded-lg mr-4">
                <Users className="w-6 h-6 text-green-800" />
              </div>
              <h3 className="text-xl font-semibold text-green-800">Club Members</h3>
            </div>
            <p className="text-3xl font-bold text-green-600 mb-2">45</p>
            <p className="text-gray-600">Active members</p>
          </div>

          {/* Events */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-3 rounded-lg mr-4">
               <Calendar className="w-6 h-6 text-blue-600" /> 
              </div>
              <h3 className="text-xl font-semibold text-blue-800">Upcoming Events</h3>
            </div>
            <p className="text-3xl font-bold text-blue-600 mb-2">3</p>
            <p className="text-gray-600">This week</p>
          </div>

          {/* Previous Events */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="bg-purple-100 p-3 rounded-lg mr-4">
                <CalendarRange className="w-6 h-6 text-purple-800" />
              </div>
              <h3 className="text-xl font-semibold text-purple-800">All Previous Events</h3>
            </div>
            <p className="text-3xl font-bold text-purple-600 mb-2"></p>
            <p className="text-gray-600"></p>
          </div>

          {/* Club Management */}
          <div className="bg-white rounded-xl shadow-lg p-6 md:col-span-2 lg:col-span-3">
            <h3 className="text-2xl font-bold mb-4 text-gray-800">Club Management</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <button className="bg-green-500 cursor-pointer hover:bg-green-600 text-white py-3 rounded-lg transition duration-300">
                Add Members
              </button>
               <button className="bg-green-500 cursor-pointer hover:bg-green-600 text-white py-3 rounded-lg transition duration-300">
                Remove Members
              </button>
              <button className="bg-blue-500 cursor-pointer hover:bg-blue-600 text-white py-3 rounded-lg transition duration-300">
                Schedule Event
              </button>
              <button className="bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-lg transition duration-300">
                Create Notification/Alert
              </button>
              <button className="bg-orange-500 cursor-pointer hover:bg-orange-600 text-white py-3 rounded-lg transition duration-300">
                Club Settings
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-lg p-6 md:col-span-2 lg:col-span-3">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">all nonsense Recent Club Activity</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span>New member registration - John Doe</span>
                <span className="text-sm text-gray-500">2 hours ago</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span>Weekly meeting scheduled</span>
                <span className="text-sm text-gray-500">1 day ago</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span>Budget approved for new equipment</span>
                <span className="text-sm text-gray-500">2 days ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}