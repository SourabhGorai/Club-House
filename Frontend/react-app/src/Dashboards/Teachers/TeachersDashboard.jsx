import { Calendar,Trophy, Users, Target, Award} from 'lucide-react';
import { useNavigate } from "react-router-dom";


export default function TeachersDashboard() {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-blue-600">Teacher Dashboard 📚</h1>
            <p className="text-gray-600 mt-2">Club management and Event tracking</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              TEACHER
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-500 cursor-pointer hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-300"
            >
              Logout
            </button>
          </div>
        </div>
        {/* Welcome Message to professor */}
          <div className="bg-white rounded-xl shadow-lg p-6 my-6 md:col-span-2 lg:col-span-3">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Welcome, Professor {user?.username}!
            </h3>
            <p className="text-gray-600">
              yeah abhi random hai ignore it You have 3 new assignments to grade and 2 upcoming classes today. 
              Don't forget to submit the weekly attendance report.
            </p>
          </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Events Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-3 rounded-lg mr-4">
                <Calendar className="w-6 h-6 text-blue-600" />

              </div>
              <h3 className="text-xl font-semibold text-blue-800">My Events</h3>
            </div>
            <p className="text-3xl font-bold text-blue-600 mb-2"></p>
            <p className="text-gray-600"></p>
          </div>

          {/* Clubs Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="bg-green-100 p-3 rounded-lg mr-4">
                <Trophy className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-green-800">Clubs</h3>
            </div>
            <p className="text-3xl font-bold text-green-600 mb-2"></p>
            <p className="text-gray-600"></p>
          </div>

          {/* Students Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="bg-orange-100 p-3 rounded-lg mr-4">
                <Users className="w-6 h-6 text-orange-800" />
              </div>
              <h3 className="text-xl font-semibold text-orange-800">All Students</h3>
            </div>
            <p className="text-3xl font-bold text-orange-600 mb-2"></p>
            <p className="text-gray-600"></p>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-lg p-6 md:col-span-2 lg:col-span-3">
            <h3 className="text-2xl font-bold mb-4 text-gray-800">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="bg-blue-500 cursor-pointer hover:bg-blue-600 text-white py-3 rounded-lg transition duration-300">
                Create Event
              </button>
              <button className="bg-green-500 cursor-pointer hover:bg-green-600 text-white py-3 rounded-lg transition duration-300">
                Delete Event
              </button>
              <button onClick={() => navigate("/add-users-with-club")} className="bg-purple-500 cursor-pointer hover:bg-purple-600 text-white py-3 rounded-lg transition duration-300">
                Add Student
              </button>
              <button onClick={() => navigate("/remove-users-from-club")} className="bg-orange-500 cursor-pointer hover:bg-orange-600 text-white py-3 rounded-lg transition duration-300">
                Remove Student
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}