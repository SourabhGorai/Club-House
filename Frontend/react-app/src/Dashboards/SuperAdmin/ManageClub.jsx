import { useState, useEffect } from "react";
import axios from "axios";

export default function ManageClubs() {
  const [clubs, setClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adminData, setAdminData] = useState(null);

  // Fetch clubs with authorization
  const fetchClubs = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:8080/api/clubs", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data.success) {
        console.log(response.data.data);
        setClubs(response.data.data);
        if (response.data.data.length > 0) {
          setSelectedClub(response.data.data[0]);
          fetchAdminData(response.data.data[0].clubId); // Add this line
        }
      }
    } catch (err) {
      setError("Failed to fetch clubs");
      console.error("Error fetching clubs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubs();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    try {
      // If date is in "28-11-2025 14:25:45" format
      const [datePart] = dateString.split(" ");
      const [day, month, year] = datePart.split("-");
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString; // Return original if formatting fails
    }
  };
  const fetchAdminData = async (clubId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:8080/api/clubs/${clubId}/admin`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        console.log(response.data.data);
        setAdminData(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching admin data:", err);
      setAdminData(null);
    }
  };

  // Handle club deletion
  const handleDeleteClub = async (clubId) => {
    if (!window.confirm("Are you sure you want to delete this club?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8080/api/clubs/${clubId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Club deleted successfully!");
      fetchClubs(); // Refresh the list
      if (selectedClub?.clubId === clubId) {
        setSelectedClub(null);
      }
    } catch (err) {
      alert("Failed to delete club");
      console.error("Error deleting club:", err);
    }
  };

  // Handle club edit
  const handleEditClub = (club) => {
    // For now, just log and show alert
    console.log("Editing club:", club);
    alert(`Edit functionality for ${club.clubName} would open here`);
  };

  // Generate random club details
  const generateRandomDetails = (club) => {
    const members = Math.floor(Math.random() * 100) + 20;
    const events = Math.floor(Math.random() * 20) + 5;
    const descriptions = [
      "A vibrant community of enthusiasts passionate about technology and innovation.",
      "Fostering creativity and collaboration among students with shared interests.",
      "Dedicated to organizing engaging events and workshops for skill development.",
      "Building a strong network of like-minded individuals for mutual growth.",
    ];

    return {
      description:
        descriptions[Math.floor(Math.random() * descriptions.length)],
      totalMembers: members,
      upcomingEvents: events,
      president: `Student ${Math.floor(Math.random() * 1000)}`,
      contactEmail: `${club.clubName.toLowerCase()}@college.edu`,
      established: `20${Math.floor(Math.random() * 10) + 15}`,
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading clubs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-100">
        <div className="text-center">
          <p className="text-red-500 text-lg">{error}</p>
          <button
            onClick={fetchClubs}
            className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Club Management
          </h1>
          <p className="text-gray-600">
            Manage all college clubs and their activities
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="flex flex-col lg:flex-row ">
            {/* Left Side - Clubs List */}
            <div className="lg:w-2/5 border-r border-gray-200">
              <div
                className="p-6 text-white"
                style={{
                  background:
                    "linear-gradient(90deg, #ea580c 0%, #fb923c 100%)",
                }}
              >
                <h2 className="text-2xl font-bold">All Clubs</h2>
                <p className="text-blue-100">{clubs.length} clubs found</p>
              </div>

              <div className="overflow-y-auto h-[calc(100%-80px)]">
                {clubs.map((club) => (
                  <div
                    key={club.clubId}
                    className={`border-b border-gray-100 p-4 cursor-pointer transition-all hover:bg-blue-50 ${
                      selectedClub?.clubId === club.clubId
                        ? "bg-blue-50 border-l-4 border-l-orange-500"
                        : ""
                    }`}
                    onClick={() => {
                      setSelectedClub(club);
                      fetchAdminData(club.clubId);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            club.isActive ? "bg-green-500" : "bg-red-500"
                          }`}
                        ></div>
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {club.clubName}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Created: {formatDate(club.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClub(club);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Edit Club"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClub(club.clubId);
                          }}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="Delete Club"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {!club.isActive && (
                      <span className="inline-block mt-2 px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">
                        Inactive
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side - Club Details */}
            <div className="lg:w-3/5">
              {selectedClub ? (
                <div className="p-8 h-full overflow-y-auto">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-800">
                        {selectedClub.clubName}
                      </h2>
                      <p className="text-gray-600">
                        •
                        <span
                          className={`ml-2 ${
                            selectedClub.isActive
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {selectedClub.isActive ? "Active" : "Inactive"}
                        </span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Created</p>
                      <p className="text-gray-700 font-semibold">
                        {formatDate(selectedClub.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Random Club Details */}
                  {(() => {
                    const details = generateRandomDetails(selectedClub);
                    return (
                      <div className="space-y-6">
                        {/* Description */}
                        <div className="bg-blue-50 rounded-xl p-6">
                          <h3 className="text-lg font-semibold text-gray-800 mb-3">
                            About
                          </h3>
                          <p className="text-gray-700 leading-relaxed">
                            {selectedClub.clubDesc}
                          </p>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {adminData?.totalCount}
                            </div>
                            <div className="text-sm text-gray-600">
                              Total Members
                            </div>
                          </div>
                          <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {details.upcomingEvents}
                            </div>
                            <div className="text-sm text-gray-600">
                              Upcoming Events
                            </div>
                          </div>
                          <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold text-purple-600">
                              {details.established}
                            </div>
                            <div className="text-sm text-gray-600">
                              Established
                            </div>
                          </div>
                        </div>

                        {/* Additional Info */}
                        <div className="grid grid-cols-1  gap-6">
                          <div className="bg-gray-50 rounded-xl p-5">
                            <h4 className="font-semibold text-gray-800 mb-3">
                              Leadership
                            </h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-gray-600">
                                  Club Admins:
                                </span>
                                <span className="font-medium">
                                  {adminData?.clubAdmins?.length > 0
                                    ? adminData.clubAdmins
                                        .map((admin) => admin.name)
                                        .join(", ")
                                    : "N/A"}
                                </span>
                              </div>

                              <div className="flex justify-between">
                                <span className="text-gray-600">Teacher:</span>
                                <span className="font-medium">
                                  {adminData?.teacherName || "Not Assigned"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Contact:</span>
                                <span className="font-medium text-blue-600">
                                  {adminData?.email || "Mot-available"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <svg
                      className="w-16 h-16 mx-auto text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                    <p className="mt-4 text-lg">
                      Select a club to view details
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}













