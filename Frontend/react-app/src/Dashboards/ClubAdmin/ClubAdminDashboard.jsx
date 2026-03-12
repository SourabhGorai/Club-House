import {Users,CalendarRange,Calendar} from 'lucide-react';
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmDialog from "../../components/ConfirmDialog";


export default function ClubAdminDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: "", message: "", variant: "primary", confirmText: "Confirm", onConfirm: () => {} });
  const closeConfirm = () => setConfirmDialog((prev) => ({ ...prev, isOpen: false }));

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <>
    <div className="min-h-screen bg-green-50 p-2 sm:p-3 md:p-4 lg:p-6 safe-area-top safe-area-bottom">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 md:mb-8 gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-4xl font-bold text-green-600">Club Admin Dashboard 🎯</h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Club management and member coordination</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 w-full sm:w-auto flex-wrap">
            <span className="bg-green-100 text-green-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
              CLUB_ADMIN
            </span>
            <button
              onClick={() => setConfirmDialog({ isOpen: true, title: "Sign Out", message: "Are you sure you want to sign out?", confirmText: "Sign Out", variant: "danger", onConfirm: () => { closeConfirm(); handleLogout(); } })}
              className="bg-red-500 cursor-pointer hover:bg-red-600 text-white px-3 sm:px-4 py-2 rounded-lg transition duration-300 text-xs sm:text-sm whitespace-nowrap"
            >
              Logout
            </button>
          </div>
        </div>

         {/* Welcome Message */}
          <div className="bg-white my-3 sm:my-4 md:my-6 rounded-lg sm:rounded-xl shadow-md sm:shadow-lg p-3 sm:p-4 md:p-6">
            <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-2 sm:mb-3 md:mb-4 text-gray-800">
              Welcome back, {user?.username}!
            </h3>
            <p className="text-gray-600 mb-2 sm:mb-3 md:mb-4 text-xs sm:text-sm">
              this is random again ignore change krna hai You have 2 new notifications and 1 upcoming assignment. 
              Continue your learning journey with us!
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 sm:p-3 md:p-4">
              <p className="text-yellow-800 text-xs sm:text-sm">
                <i className="fas fa-bell mr-2"></i>
                <strong>Reminder:</strong> nonsence Complete the JavaScript fundamentals course by Friday.
              </p>
            </div>
          </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
          {/* Club Members */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-md sm:shadow-lg p-3 sm:p-4 md:p-6">
            <div className="flex items-center mb-3 sm:mb-4">
              <div className="bg-green-100 p-2 sm:p-3 rounded-lg mr-2 sm:mr-3 md:mr-4">
                <Users className="w-5 sm:w-6 h-5 sm:h-6 text-green-800" />
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-semibold text-green-800">Club Members</h3>
            </div>
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-600 mb-2">45</p>
            <p className="text-gray-600 text-xs sm:text-sm">Active members</p>
          </div>

          {/* Events */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-md sm:shadow-lg p-3 sm:p-4 md:p-6">
            <div className="flex items-center mb-3 sm:mb-4">
              <div className="bg-blue-100 p-2 sm:p-3 rounded-lg mr-2 sm:mr-3 md:mr-4">
               <Calendar className="w-5 sm:w-6 h-5 sm:h-6 text-blue-600" /> 
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-semibold text-blue-800">Upcoming Events</h3>
            </div>
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-600 mb-2">3</p>
            <p className="text-gray-600 text-xs sm:text-sm">This week</p>
          </div>

          {/* Previous Events */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-md sm:shadow-lg p-3 sm:p-4 md:p-6">
            <div className="flex items-center mb-3 sm:mb-4">
              <div className="bg-purple-100 p-2 sm:p-3 rounded-lg mr-2 sm:mr-3 md:mr-4">
                <CalendarRange className="w-5 sm:w-6 h-5 sm:h-6 text-purple-800" />
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-semibold text-purple-800">All Previous Events</h3>
            </div>
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-600 mb-2"></p>
            <p className="text-gray-600 text-xs sm:text-sm"></p>
          </div>

          {/* Club Management */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-md sm:shadow-lg p-3 sm:p-4 md:p-6 sm:col-span-2 lg:col-span-3">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 text-gray-800">Club Management</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                 <button 
                  onClick={() => navigate("/add-users-with-club")}
                  className="bg-green-500 cursor-pointer hover:bg-green-600 text-white py-2 sm:py-3 rounded-lg transition duration-300 text-xs sm:text-sm">
                Add Members
              </button>
               <button 
                  onClick={() => navigate("/remove-users-from-club")}
                  className="bg-green-500 cursor-pointer hover:bg-green-600 text-white py-2 sm:py-3 rounded-lg transition duration-300 text-xs sm:text-sm">
                Remove Members
              </button>
              <button 
                  onClick={() => navigate("/events")}
                  className="bg-blue-500 cursor-pointer hover:bg-blue-600 text-white py-2 sm:py-3 rounded-lg transition duration-300 text-xs sm:text-sm">
                Schedule Event
              </button>
              <button className="bg-purple-500 hover:bg-purple-600 text-white py-2 sm:py-3 rounded-lg transition duration-300 text-xs sm:text-sm">
                Create Notification/Alert
              </button>
              <button className="bg-orange-500 cursor-pointer hover:bg-orange-600 text-white py-2 sm:py-3 rounded-lg transition duration-300 text-xs sm:text-sm">
                Club Settings
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-md sm:shadow-lg p-3 sm:p-4 md:p-6 sm:col-span-2 lg:col-span-3">
            <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-3 sm:mb-4 text-gray-800">all nonsense Recent Club Activity</h3>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-2 sm:p-3 bg-gray-50 rounded-lg gap-2">
                <span className="text-xs sm:text-sm">New member registration - John Doe</span>
                <span className="text-xs text-gray-500 whitespace-nowrap">2 hours ago</span>
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-2 sm:p-3 bg-gray-50 rounded-lg gap-2">
                <span className="text-xs sm:text-sm">Weekly meeting scheduled</span>
                <span className="text-xs text-gray-500 whitespace-nowrap">1 day ago</span>
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-2 sm:p-3 bg-gray-50 rounded-lg gap-2">
                <span className="text-xs sm:text-sm">Budget approved for new equipment</span>
                <span className="text-xs text-gray-500 whitespace-nowrap">2 days ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ConfirmDialog
      isOpen={confirmDialog.isOpen}
      title={confirmDialog.title}
      message={confirmDialog.message}
      confirmText={confirmDialog.confirmText}
      variant={confirmDialog.variant}
      onConfirm={confirmDialog.onConfirm}
      onCancel={closeConfirm}
    />
    </>
  );
}