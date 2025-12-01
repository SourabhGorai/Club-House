import { useState, useEffect } from "react";
import axios from "axios";

// ----------------------------------------------------------------
// 1. UI COMPONENTS (Modal & Icons)
// ----------------------------------------------------------------

// Replaces window.confirm/alert
const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-70 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-neon-lg p-6 w-11/12 max-w-md transform transition-all duration-300 scale-100">
        <h3 className="font-display text-xl font-bold text-red-600 mb-3">
          {title}
        </h3>
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
            className="btn-gradient bg-red-500 from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium rounded-full py-2 px-6 transition-all duration-300 ease-out shadow-lg shadow-red-500/30"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// SVG Icon for Edit
const EditIcon = (props) => (
  <svg
    {...props}
    className={`w-4 h-4 icon transition duration-200 ${props.className || ""}`}
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
);

// SVG Icon for Delete
const DeleteIcon = (props) => (
  <svg
    {...props}
    className={`w-4 h-4 icon transition duration-200 ${props.className || ""}`}
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
);

// SVG Icon for Members (People)
const MembersIcon = (props) => (
  <svg {...props} className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.05-.97.13C16.51 14.15 18 15.35 18 16v3h5v-2.5c0-2.33-4.67-3.5-7-3.5z" />
  </svg>
);

// SVG Icon for Events (Calendar)
const EventsIcon = (props) => (
  <svg {...props} className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6a2 2 0 0 0-2-2zm0 16H5V9h14v11zM5 7V6h14v1H5z" />
  </svg>
);

// SVG Icon for Established (Trophy/Award)
const EstablishedIcon = (props) => (
  <svg {...props} className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2c-3.87 0-7 3.13-7 7v.55c0 .38.16.74.45 1l-.86.86C3.96 11.83 3 12.79 3 14v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4c0-1.21-.96-2.17-1.59-2.82l-.86-.86c.29-.26.45-.62.45-1V9c0-3.87-3.13-7-7-7zm-1 16H8c-.55 0-1-.45-1-1v-2c0-.55.45-1 1-1h3v4zm6-4h-3v4h3c.55 0 1-.45 1-1v-2c0-.55-.45-1-1-1zm-4-9c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z" />
  </svg>
);

// ----------------------------------------------------------------
// 2. MAIN COMPONENT
// ----------------------------------------------------------------

export default function ManageClubs() {
  const [clubs, setClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adminData, setAdminData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clubToDelete, setClubToDelete] = useState(null);

  // Plain CSS (no Tailwind @apply)
  const customStyles = `
    .font-display { font-family: 'Outfit', sans-serif; }
    .btn-gradient {
        background-image: linear-gradient(90deg, #A78BFA 0%, #8B5CF6 100%);
        color: white;
        font-weight: 500;
        border-radius: 9999px;
        padding: 0.5rem 1.5rem;
        transition: all 0.25s ease;
        box-shadow: 0 5px 15px rgba(139, 92, 246, 0.18);
    }
    .btn-gradient:hover { transform: translateY(-2px); }
    .club-item.active {
        position: relative;
        background: #FDFCFE;
        box-shadow: 0 5px 20px rgba(139, 92, 246, 0.12);
    }
    .club-item.active::before {
        content: '';
        position: absolute;
        top: 0; bottom: 0; left: 0;
        width: 6px;
        border-radius: 0.5rem 0 0 0.5rem;
        background: linear-gradient(to bottom, #A78BFA, #8B5CF6);
    }
    .stat-card {
        transition: all 0.3s ease-out;
        background: rgba(255, 255, 255, 0.85);
        backdrop-filter: blur(6px);
        border: 1px solid rgba(255, 255, 255, 0.45);
        box-shadow: 0 8px 30px rgba(139, 92, 246, 0.08);
    }
    .stat-card:hover {
        transform: translateY(-5px) scale(1.02);
        box-shadow: 0 10px 40px rgba(139, 92, 246, 0.18);
    }
  `;

  // Helper function to fetch admin data
  const fetchAdminData = async (clubId) => {
    if (!clubId) return;
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:8080/api/clubs/${clubId}/admin`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response?.data?.success) {
        const clubData = response.data.data || {};

        // --- Fetch email for each admin ---
        const adminsWithEmail = await Promise.all(
          (clubData.clubAdmins || []).map(async (admin) => {
            const email = await fetchAdminEmail(admin.prn);
            return {
              ...admin,
              email: email || "N/A",
            };
          })
        );

        setAdminData({
          ...clubData,
          clubAdmins: adminsWithEmail, // replace admins with enriched data
        });
      } else {
        setAdminData(null);
      }
    } catch (err) {
      console.error("Error fetching admin data:", err);
      setAdminData(null);
    }
  };

  const fetchAdminEmail = async (prn) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:8080/api/users/${prn}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response?.data?.email || null;
    } catch (err) {
      console.error("Email fetch failed:", err);
      return null;
    }
  };

  // Fetch clubs and select the first one
  const fetchClubs = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:8080/api/clubs", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response?.data?.success) {
        const fetchedClubs = response.data.data || [];
        setClubs(fetchedClubs);
        if (fetchedClubs.length > 0) {
          const firstClub = fetchedClubs[0];
          setSelectedClub(firstClub);
          // fetch admin data for the first club
          fetchAdminData(firstClub.clubId);
        } else {
          setSelectedClub(null);
          setAdminData(null);
        }
      } else {
        setError("Failed to fetch clubs: unexpected response.");
      }
    } catch (err) {
      setError(
        "Failed to fetch clubs. Please check the API and your authorization."
      );
      console.error("Error fetching clubs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubs();
  }, []);

  // Handlers for UI state and API calls
  const handleSelectClub = (club) => {
    setSelectedClub(club);
    fetchAdminData(club.clubId);
  };

  const handleEditClub = (club) => {
    console.log("Editing club:", club);
    alert(`Edit functionality for ${club.clubName} would open here!`);
  };

  // Custom logic to handle deletion using the Modal
  const confirmDelete = (club) => {
    setClubToDelete(club);
    setIsModalOpen(true);
  };

  const executeDelete = async () => {
    if (!clubToDelete) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:8080/api/clubs/${clubToDelete.clubId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Club deleted successfully!");

      // Refresh list; fetchClubs will set selectedClub to first club (if any)
      await fetchClubs();
    } catch (err) {
      alert("Failed to delete club.");
      console.error("Error deleting club:", err);
    } finally {
      setIsModalOpen(false);
      setClubToDelete(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      // Handle "28-11-2025 14:25:45" or ISO format
      if (dateString.includes("-") && dateString.split("-").length === 3) {
        const [datePart] = dateString.split(" ");
        const [day, month, year] = datePart.split("-");
        return `${day}/${month}/${year}`;
      } else {
        const d = new Date(dateString);
        if (isNaN(d)) return dateString;
        return `${String(d.getDate()).padStart(2, "0")}/${String(
          d.getMonth() + 1
        ).padStart(2, "0")}/${d.getFullYear()}`;
      }
    } catch (error) {
      return dateString;
    }
  };

  // Generate mock data for stats (since the original API only provided admin data)
  const generateRandomDetails = (club) => {
    const descriptions = [
      "A vibrant community of enthusiasts passionate about technology and innovation.",
      "Fostering creativity and collaboration among students with shared interests in the digital realm.",
      "Dedicated to organizing engaging events and workshops for skill development in software and hardware.",
      "Building a strong network of like-minded individuals for mutual growth and successful project execution.",
    ];

    return {
      description:
        club?.clubDesc ||
        descriptions[Math.floor(Math.random() * descriptions.length)],
      upcomingEvents: Math.floor(Math.random() * 8) + 3,
      established: `20${Math.floor(Math.random() * 10) + 15}`,
    };
  };

  // ----------------------------------------------------------------
  // 3. RENDER LOGIC (Loading, Error, Main UI)
  // ----------------------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <style dangerouslySetInnerHTML={{ __html: customStyles }} />
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-gradient-start mx-auto"></div>
          <p className="mt-6 font-medium text-primary-dark">
            Warping to dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <style dangerouslySetInnerHTML={{ __html: customStyles }} />
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <p className="text-red-600 text-lg font-semibold">{error}</p>
          <button onClick={fetchClubs} className="mt-6 btn-gradient">
            Retry Fetch
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-6 sm:p-10 flex items-start justify-center"
      style={{
        background:
          "radial-gradient(circle at top left, #F2EEFF, #FDFCFE 60%, #F8F5FF)",
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />

      <ConfirmationModal
        isOpen={isModalOpen}
        title="Confirm Deletion"
        message={`Are you sure you want to permanently delete the club "${
          clubToDelete?.clubName || "Selected Club"
        }"? This action cannot be undone.`}
        onConfirm={executeDelete}
        onCancel={() => setIsModalOpen(false)}
      />

      <div className="w-full max-w-7xl bg-white bg-opacity-95 rounded-3xl shadow-neon-lg overflow-hidden backdrop-blur-md">
        {/* Header Area */}
        <header className="p-8 text-center border-b border-gray-100 bg-gradient-to-r from-[#A78BFA] to-[#8B5CF6] text-white rounded-t-3xl shadow-inner">
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight drop-shadow-md">
            ClubLink Stellar Dashboard
          </h1>
          <p className="mt-2 text-lg font-light opacity-90">
            Manage all college clubs with ease and style.
          </p>
        </header>

        <div className="flex flex-col lg:flex-row min-h-[70vh]">
          {/* Left Side - Clubs List */}
          <div className="lg:w-1/3 border-r border-gray-100 flex flex-col p-6 space-y-4">
            <h2 className="font-display text-2xl font-bold text-[#4C1D95]">
              Your Clubs
            </h2>
            <p className="text-sm text-gray-500">
              {clubs.length} active communities thriving.
            </p>

            <div className="overflow-y-auto max-h-[60vh] lg:max-h-full space-y-2">
              {clubs.map((club) => {
                const isActive = club.isActive ?? true; // default true only if undefined/null
                const isSelected = selectedClub?.clubId === club.clubId;

                return (
                  <div
                    key={club.clubId}
                    className={`club-item p-4 rounded-xl flex justify-between items-center cursor-pointer transition-all duration-200 border-2 border-transparent ${
                      isSelected
                        ? "active"
                        : "hover:bg-violet-50/50 hover:shadow-neon-sm"
                    }`}
                    onClick={() => handleSelectClub(club)}
                  >
                    <div className="flex flex-col">
                      <span
                        className={`font-display text-xl font-bold ${
                          isSelected ? "text-[#4C1D95]" : "text-gray-800"
                        }`}
                      >
                        {club.clubName}
                      </span>
                      <span className="text-xs text-gray-500 mt-0.5 flex items-center">
                        <span
                          className={`w-2 h-2 rounded-full mr-1.5 ${
                            isActive
                              ? "bg-[#2DD4BF] animate-pulse"
                              : "bg-gray-400"
                          }`}
                        ></span>
                        {isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="flex space-x-3 text-gray-400 transition duration-200 opacity-100">
                      <EditIcon
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClub(club);
                        }}
                        className="hover:text-[#A78BFA]"
                        title="Edit Club"
                      />
                      <DeleteIcon
                        onClick={(e) => {
                          e.stopPropagation();
                          confirmDelete(club);
                        }}
                        className="hover:text-red-500"
                        title="Delete Club"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Side - Club Details */}
          <div className="lg:w-2/3 p-8 sm:p-10">
            {selectedClub ? (
              <>
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-8 border-b border-gray-100 mb-8">
                  <h2 className="font-display text-4xl sm:text-5xl font-extrabold text-[#4C1D95] flex items-center tracking-tight">
                    {selectedClub.clubName}
                    <span className="ml-4 px-4 py-1.5 text-base font-semibold rounded-full bg-[#2DD4BF]/15 text-[#2DD4BF] flex items-center shadow-sm">
                      <span
                        className={`w-2.5 h-2.5 rounded-full mr-2 ${
                          selectedClub.isActive
                            ? "bg-[#2DD4BF] animate-pulse"
                            : "bg-gray-400"
                        }`}
                      ></span>
                      {selectedClub.isActive ? "Active" : "Inactive"}
                    </span>
                  </h2>
                  <p className="text-sm text-gray-500 mt-3 sm:mt-0">
                    Founded:{" "}
                    <span className="font-semibold text-[#4C1D95]">
                      {formatDate(selectedClub.createdAt)}
                    </span>
                  </p>
                </header>

                {/* Club Details Content */}
                {(() => {
                  const details = generateRandomDetails(selectedClub);
                  const totalMembers = adminData?.totalCount ?? "N/A";
                  const clubAdmins =
                    adminData?.clubAdmins
                      ?.map((admin) => admin.name)
                      .join(", ") || "N/A";

                  return (
                    <div className="space-y-10">
                      {/* Stats Grid */}
                      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="stat-card p-6 rounded-2xl flex flex-col justify-between cursor-pointer">
                          <div className="flex justify-between items-center mb-3">
                            <MembersIcon className="text-[#A78BFA]" />
                            <span className="font-display text-5xl font-extrabold text-[#A78BFA] drop-shadow-sm">
                              {totalMembers}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-[#4C1D95]">
                            Total Members
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Active enrollment
                          </p>
                        </div>

                        <div className="stat-card p-6 rounded-2xl flex flex-col justify-between cursor-pointer">
                          <div className="flex justify-between items-center mb-3">
                            <EventsIcon className="text-[#2DD4BF]" />
                            <span className="font-display text-5xl font-extrabold text-[#2DD4BF] drop-shadow-sm">
                              {details.upcomingEvents}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-[#4C1D95]">
                            Upcoming Events
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Next quarter outlook
                          </p>
                        </div>

                        <div className="stat-card p-6 rounded-2xl flex flex-col justify-between cursor-pointer">
                          <div className="flex justify-between items-center mb-3">
                            <EstablishedIcon className="text-[#FB923C]" />
                            <span className="font-display text-5xl font-extrabold text-[#FB923C] drop-shadow-sm">
                              {details.established}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-[#4C1D95]">
                            Year Established
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Legacy of innovation
                          </p>
                        </div>
                      </section>

                      {/* About Section */}
                      <section>
                        <h3 className="font-display text-2xl font-bold text-[#4C1D95] mb-4">
                          About {selectedClub.clubName}
                        </h3>
                        <div className="p-6 bg-gradient-to-br from-violet-50 via-gray-50 to-white rounded-xl border border-gray-100 shadow-md">
                          <p className="text-gray-700 leading-relaxed">
                            {details.description}
                          </p>
                        </div>
                      </section>

                      {/* Leadership Section */}
                      <section>
                        <h3 className="font-display text-2xl font-bold text-[#4C1D95] mb-4">
                          Club Leadership
                        </h3>
                        <div className="space-y-4">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-3 px-4 rounded-xl bg-gray-50 border border-gray-100 shadow-sm">
                            <span className="text-gray-600 font-medium w-full sm:w-1/3 mb-1 sm:mb-0">
                              Club Admins:
                            </span>
                            <span className="text-[#4C1D95] font-semibold text-lg w-full sm:w-2/3 text-left sm:text-right">
                              {clubAdmins}
                            </span>
                          </div>

                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-3 px-4 rounded-xl bg-red-50 border border-red-100 shadow-sm">
                            <span className="text-gray-600 font-medium w-full sm:w-1/3 mb-1 sm:mb-0">
                              Teacher Advisor:
                            </span>

                            <span className="font-semibold text-lg w-full sm:w-2/3 text-left sm:text-right flex justify-start sm:justify-end items-center">
                              {adminData?.teacherName &&
                              adminData.teacherName !== "Not Assigned" ? (
                                <span className="text-red-600">
                                  {adminData.teacherName}
                                </span>
                              ) : (
                                <span className="text-gray-500">
                                  Not-assigned
                                </span>
                              )}

                              {(!adminData?.teacherName ||
                                adminData.teacherName === "Not Assigned") && (
                                <button className="ml-3 btn-gradient">
                                  Assign Now
                                </button>
                              )}
                            </span>
                          </div>

                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-3 px-4 rounded-xl bg-gray-50 border border-gray-100 shadow-sm">
                            <span className="text-gray-600 font-medium w-full sm:w-1/3 mb-2 sm:mb-0">
                              Contact Email:
                            </span>

                            <div className="w-full sm:w-2/3 text-left sm:text-right space-y-1">
                              {adminData?.clubAdmins?.length > 0 ? (
                                adminData.clubAdmins.map((admin, idx) => (
                                  <a
                                    key={idx}
                                    href={`mailto:${admin.email}`}
                                    className="block text-[#A78BFA] font-medium text-lg hover:underline"
                                  >
                                    {admin.email || "Not-available"}
                                  </a>
                                ))
                              ) : (
                                <span className="text-gray-500">
                                  Not-available
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </section>
                    </div>
                  );
                })()}
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 min-h-[50vh]">
                <div className="text-center">
                  <svg
                    className="w-16 h-16 mx-auto text-gray-300 mb-4"
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
                  <p className="mt-4 text-lg font-medium text-gray-500">
                    Select a club from the left panel to view its full details.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


// import { useState, useEffect } from "react";
// import axios from "axios";

// // ----------------------------------------------------------------
// // 1. UI COMPONENTS (Modal & Icons)
// // ----------------------------------------------------------------

// // Replaces window.confirm/alert
// const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-70 backdrop-blur-sm">
//       <div className="bg-white rounded-xl shadow-neon-lg p-6 w-11/12 max-w-md transform transition-all duration-300 scale-100">
//         <h3 className="font-display text-xl font-bold text-red-600 mb-3">{title}</h3>
//         <p className="text-gray-700 mb-6">{message}</p>
//         <div className="flex justify-end space-x-3">
//           <button
//             onClick={onCancel}
//             className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={onConfirm}
//             className="btn-gradient bg-red-500 from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium rounded-full py-2 px-6 transition-all duration-300 ease-out shadow-lg shadow-red-500/30"
//           >
//             Delete
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // SVG Icon for Edit
// const EditIcon = (props) => (
//   <svg {...props} className={`w-4 h-4 icon transition duration-200 ${props.className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
//   </svg>
// );

// // SVG Icon for Delete
// const DeleteIcon = (props) => (
//   <svg {...props} className={`w-4 h-4 icon transition duration-200 ${props.className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
//   </svg>
// );

// // SVG Icon for Members (People)
// const MembersIcon = (props) => (
//   <svg {...props} className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.05-.97.13C16.51 14.15 18 15.35 18 16v3h5v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
// );

// // SVG Icon for Events (Calendar)
// const EventsIcon = (props) => (
//   <svg {...props} className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6a2 2 0 0 0-2-2zm0 16H5V9h14v11zM5 7V6h14v1H5z"/></svg>
// );

// // SVG Icon for Established (Trophy/Award)
// const EstablishedIcon = (props) => (
//   <svg {...props} className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2c-3.87 0-7 3.13-7 7v.55c0 .38.16.74.45 1l-.86.86C3.96 11.83 3 12.79 3 14v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4c0-1.21-.96-2.17-1.59-2.82l-.86-.86c.29-.26.45-.62.45-1V9c0-3.87-3.13-7-7-7zm-1 16H8c-.55 0-1-.45-1-1v-2c0-.55.45-1 1-1h3v4zm6-4h-3v4h3c.55 0 1-.45 1-1v-2c0-.55-.45-1-1-1zm-4-9c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z"/></svg>
// );

// // ----------------------------------------------------------------
// // 2. MAIN COMPONENT
// // ----------------------------------------------------------------

// export default function ManageClubs() {
//   const [clubs, setClubs] = useState([]);
//   const [selectedClub, setSelectedClub] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [adminData, setAdminData] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [clubToDelete, setClubToDelete] = useState(null);

//   // Define custom colors and fonts (simulating the CSS block from HTML)
//   const customStyles = `
//     .font-display { font-family: 'Outfit', sans-serif; }
//     .btn-gradient {
//         background-image: linear-gradient(to right, var(--tw-gradient-stops));
//         @apply from-[#A78BFA] to-[#8B5CF6] text-white font-medium rounded-full py-2 px-6 transition-all duration-300 ease-out;
//         box-shadow: 0 5px 15px rgba(139, 92, 246, 0.2);
//     }
//     .club-item.active {
//         position: relative;
//         background: #FDFCFE; /* Very light background */
//         box-shadow: 0 5px 20px rgba(139, 92, 246, 0.15);
//     }
//     .club-item.active::before {
//         content: '';
//         position: absolute;
//         top: 0; bottom: 0; left: 0;
//         width: 4px;
//         border-radius: 0.5rem 0 0 0.5rem;
//         background: linear-gradient(to bottom, #A78BFA, #8B5CF6);
//     }
//     .stat-card {
//         transition: all 0.3s ease-out;
//         background: rgba(255, 255, 255, 0.8);
//         backdrop-filter: blur(10px);
//         border: 1px solid rgba(255, 255, 255, 0.5);
//         box-shadow: 0 8px 30px rgba(139, 92, 246, 0.1);
//     }
//     .stat-card:hover {
//         transform: translateY(-5px) scale(1.02);
//         box-shadow: 0 10px 40px rgba(139, 92, 246, 0.25);
//     }
//   `;

//   // Helper function to fetch admin data
//   const fetchAdminData = async (clubId) => {
//     try {
//       const token = localStorage.getItem("token");
//       const response = await axios.get(
//         `http://localhost:8080/api/clubs/${clubId}/admin`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//       if (response.data.success) {
//         setAdminData(response.data.data);
//       }
//     } catch (err) {
//       console.error("Error fetching admin data:", err);
//       setAdminData(null);
//     }
//   };

//   // Fetch clubs and select the first one
//   const fetchClubs = async () => {
//     setLoading(true);
//     try {
//       const token = localStorage.getItem("token");
//       const response = await axios.get("http://localhost:8080/api/clubs", {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       });

//       if (response.data.success) {
//         const fetchedClubs = response.data.data || [];
//         setClubs(fetchedClubs);
//         if (fetchedClubs.length > 0) {
//           const firstClub = fetchedClubs[0];
//           setSelectedClub(firstClub);
//           fetchAdminData(firstClub.clubId);
//         } else {
//           setSelectedClub(null);
//           setAdminData(null);
//         }
//       }
//     } catch (err) {
//       setError("Failed to fetch clubs. Please check the API and your authorization.");
//       console.error("Error fetching clubs:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchClubs();
//   }, []);

//   // Handlers for UI state and API calls
//   const handleSelectClub = (club) => {
//     setSelectedClub(club);
//     fetchAdminData(club.clubId);
//   };

//   const handleEditClub = (club) => {
//     // Replace with actual navigation to edit form
//     console.log("Editing club:", club);
//     // Using custom alert/message system in a real app
//     alert(`Edit functionality for ${club.clubName} would open here!`);
//   };
  
//   // Custom logic to handle deletion using the Modal
//   const confirmDelete = (club) => {
//     setClubToDelete(club);
//     setIsModalOpen(true);
//   };

//   const executeDelete = async () => {
//     if (!clubToDelete) return;

//     try {
//       const token = localStorage.getItem("token");
//       await axios.delete(`http://localhost:8080/api/clubs/${clubToDelete.clubId}`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       // Show success message (replace with a toast notification in a real app)
//       alert("Club deleted successfully!");
      
//       // Refresh list and clear selection if the deleted club was selected
//       fetchClubs(); 
//       if (selectedClub?.clubId === clubToDelete.clubId) {
//         setSelectedClub(null);
//       }
//     } catch (err) {
//       // Show error message
//       alert("Failed to delete club.");
//       console.error("Error deleting club:", err);
//     } finally {
//       setIsModalOpen(false);
//       setClubToDelete(null);
//     }
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return "N/A";
//     try {
//       // Handles "28-11-2025 14:25:45" format
//       const [datePart] = dateString.split(" ");
//       const [day, month, year] = datePart.split("-");
//       return `${day}/${month}/${year}`;
//     } catch (error) {
//       return dateString;
//     }
//   };

//   // Generate mock data for stats (since the original API only provided admin data)
//   const generateRandomDetails = (club) => {
//     const descriptions = [
//       "A vibrant community of enthusiasts passionate about technology and innovation.",
//       "Fostering creativity and collaboration among students with shared interests in the digital realm.",
//       "Dedicated to organizing engaging events and workshops for skill development in software and hardware.",
//       "Building a strong network of like-minded individuals for mutual growth and successful project execution.",
//     ];

//     return {
//       description: club.clubDesc || descriptions[Math.floor(Math.random() * descriptions.length)],
//       upcomingEvents: Math.floor(Math.random() * 8) + 3,
//       established: `20${Math.floor(Math.random() * 10) + 15}`,
//     };
//   };

//   // ----------------------------------------------------------------
//   // 3. RENDER LOGIC (Loading, Error, Main UI)
//   // ----------------------------------------------------------------

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <style dangerouslySetInnerHTML={{ __html: customStyles }} />
//         <div className="text-center p-8 bg-white rounded-xl shadow-lg">
//           <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-gradient-start mx-auto"></div>
//           <p className="mt-6 font-medium text-primary-dark">Warping to dashboard...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="text-center p-8 bg-white rounded-xl shadow-lg">
//           <p className="text-red-600 text-lg font-semibold">{error}</p>
//           <button
//             onClick={fetchClubs}
//             className="mt-6 btn-gradient from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
//           >
//             Retry Fetch
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen p-6 sm:p-10 flex items-start justify-center" style={{ background: 'radial-gradient(circle at top left, #F2EEFF, #FDFCFE 60%, #F8F5FF)' }}>
//         <style dangerouslySetInnerHTML={{ __html: customStyles }} />
        
//         <ConfirmationModal
//             isOpen={isModalOpen}
//             title="Confirm Deletion"
//             message={`Are you sure you want to permanently delete the club "${clubToDelete?.clubName || 'Selected Club'}"? This action cannot be undone.`}
//             onConfirm={executeDelete}
//             onCancel={() => setIsModalOpen(false)}
//         />

//         <div className="w-full max-w-7xl bg-white bg-opacity-95 rounded-3xl shadow-neon-lg overflow-hidden backdrop-blur-md">
            
//             {/* Header Area */}
//             <header className="p-8 text-center border-b border-gray-100 bg-gradient-to-r from-[#A78BFA] to-[#8B5CF6] text-white rounded-t-3xl shadow-inner">
//                 <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight drop-shadow-md">
//                     ClubLink Stellar Dashboard
//                 </h1>
//                 <p className="mt-2 text-lg font-light opacity-90">
//                     Manage all college clubs with ease and style.
//                 </p>
//             </header>

//             <div className="flex flex-col lg:flex-row min-h-[70vh]">
                
//                 {/* Left Side - Clubs List */}
//                 <div className="lg:w-1/3 border-r border-gray-100 flex flex-col p-6 space-y-4">
//                     <h2 className="font-display text-2xl font-bold text-[#4C1D95]">Your Clubs</h2>
//                     <p className="text-sm text-gray-500">{clubs.length} active communities thriving.</p>

//                     <div className="overflow-y-auto max-h-[60vh] lg:max-h-full space-y-2">
//                         {clubs.map((club) => {
//                             const isActive = club.isActive || true; // Assuming active by default if API doesn't specify
//                             const isSelected = selectedClub?.clubId === club.clubId;
                            
//                             return (
//                                 <div
//                                     key={club.clubId}
//                                     className={`club-item p-4 rounded-xl flex justify-between items-center cursor-pointer transition-all duration-200 border-2 border-transparent ${
//                                         isSelected ? 'active border-l-4 border-l-[#8B5CF6]' : 'hover:bg-violet-50/50 hover:shadow-neon-sm'
//                                     }`}
//                                     onClick={() => handleSelectClub(club)}
//                                 >
//                                     <div className="flex flex-col">
//                                         <span className={`font-display text-xl font-bold ${isSelected ? 'text-[#4C1D95]' : 'text-gray-800'}`}>
//                                             {club.clubName}
//                                         </span>
//                                         <span className="text-xs text-gray-500 mt-0.5 flex items-center">
//                                             <span className={`w-2 h-2 rounded-full mr-1.5 ${isActive ? 'bg-[#2DD4BF] animate-pulse' : 'bg-gray-400'}`}></span>
//                                             {isActive ? 'Active' : 'Inactive'}
//                                         </span>
//                                     </div>
//                                     <div className="flex space-x-3 text-gray-400 transition duration-200 opacity-100">
//                                         <EditIcon
//                                             onClick={(e) => { e.stopPropagation(); handleEditClub(club); }}
//                                             className="hover:text-[#A78BFA]"
//                                             title="Edit Club"
//                                         />
//                                         <DeleteIcon
//                                             onClick={(e) => { e.stopPropagation(); confirmDelete(club); }}
//                                             className="hover:text-red-500"
//                                             title="Delete Club"
//                                         />
//                                     </div>
//                                 </div>
//                             );
//                         })}
//                     </div>
//                 </div>

//                 {/* Right Side - Club Details */}
//                 <div className="lg:w-2/3 p-8 sm:p-10">
//                     {selectedClub ? (
//                         <>
//                             <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-8 border-b border-gray-100 mb-8">
//                                 <h2 className="font-display text-4xl sm:text-5xl font-extrabold text-[#4C1D95] flex items-center tracking-tight">
//                                     {selectedClub.clubName}
//                                     <span className="ml-4 px-4 py-1.5 text-base font-semibold rounded-full bg-[#2DD4BF]/15 text-[#2DD4BF] flex items-center shadow-sm">
//                                         <span className={`w-2.5 h-2.5 rounded-full mr-2 ${selectedClub.isActive ? 'bg-[#2DD4BF] animate-pulse' : 'bg-gray-400'}`}></span>
//                                         {selectedClub.isActive ? 'Active' : 'Inactive'}
//                                     </span>
//                                 </h2>
//                                 <p className="text-sm text-gray-500 mt-3 sm:mt-0">
//                                     Founded: <span className="font-semibold text-[#4C1D95]">{formatDate(selectedClub.createdAt)}</span>
//                                 </p>
//                             </header>

//                             {/* Club Details Content */}
//                             {(() => {
//                                 const details = generateRandomDetails(selectedClub);
//                                 const totalMembers = adminData?.totalCount || 'N/A';
//                                 const clubAdmins = adminData?.clubAdmins?.map((admin) => admin.name).join(", ") || "N/A";
                                
//                                 return (
//                                     <div className="space-y-10">
                                        
//                                         {/* Stats Grid */}
//                                         <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            
//                                             <div className="stat-card p-6 rounded-2xl flex flex-col justify-between cursor-pointer">
//                                                 <div className="flex justify-between items-center mb-3">
//                                                     <MembersIcon className="text-[#A78BFA]" />
//                                                     <span className="font-display text-5xl font-extrabold text-[#A78BFA] drop-shadow-sm">{totalMembers}</span>
//                                                 </div>
//                                                 <p className="text-sm font-semibold text-[#4C1D95]">Total Members</p>
//                                                 <p className="text-xs text-gray-500 mt-1">Active enrollment</p>
//                                             </div>

//                                             <div className="stat-card p-6 rounded-2xl flex flex-col justify-between cursor-pointer">
//                                                 <div className="flex justify-between items-center mb-3">
//                                                     <EventsIcon className="text-[#2DD4BF]" />
//                                                     <span className="font-display text-5xl font-extrabold text-[#2DD4BF] drop-shadow-sm">{details.upcomingEvents}</span>
//                                                 </div>
//                                                 <p className="text-sm font-semibold text-[#4C1D95]">Upcoming Events</p>
//                                                 <p className="text-xs text-gray-500 mt-1">Next quarter outlook</p>
//                                             </div>

//                                             <div className="stat-card p-6 rounded-2xl flex flex-col justify-between cursor-pointer">
//                                                 <div className="flex justify-between items-center mb-3">
//                                                     <EstablishedIcon className="text-[#FB923C]" />
//                                                     <span className="font-display text-5xl font-extrabold text-[#FB923C] drop-shadow-sm">{details.established}</span>
//                                                 </div>
//                                                 <p className="text-sm font-semibold text-[#4C1D95]">Year Established</p>
//                                                 <p className="text-xs text-gray-500 mt-1">Legacy of innovation</p>
//                                             </div>
//                                         </section>

//                                         {/* About Section */}
//                                         <section>
//                                             <h3 className="font-display text-2xl font-bold text-[#4C1D95] mb-4">About {selectedClub.clubName}</h3>
//                                             <div className="p-6 bg-gradient-to-br from-violet-50 via-gray-50 to-white rounded-xl border border-gray-100 shadow-md">
//                                                 <p className="text-gray-700 leading-relaxed">
//                                                     {details.description}
//                                                 </p>
//                                             </div>
//                                         </section>

//                                         {/* Leadership Section */}
//                                         <section>
//                                             <h3 className="font-display text-2xl font-bold text-[#4C1D95] mb-4">Club Leadership</h3>
//                                             <div className="space-y-4">
//                                                 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-3 px-4 rounded-xl bg-gray-50 border border-gray-100 shadow-sm">
//                                                     <span className="text-gray-600 font-medium w-full sm:w-1/3 mb-1 sm:mb-0">Club Admins:</span>
//                                                     <span className="text-[#4C1D95] font-semibold text-lg w-full sm:w-2/3 text-left sm:text-right">{clubAdmins}</span>
//                                                 </div>
                                                
//                                                 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-3 px-4 rounded-xl bg-red-50 border border-red-100 shadow-sm">
//                                                     <span className="text-gray-600 font-medium w-full sm:w-1/3 mb-1 sm:mb-0">Teacher Advisor:</span>
//                                                     <span className="text-red-600 font-semibold text-lg w-full sm:w-2/3 text-left sm:text-right flex justify-start sm:justify-end items-center">
//                                                         {adminData?.teacherName || "Not Assigned"} 
//                                                         {!adminData?.teacherName && <button className="ml-3 btn-gradient">Assign Now</button>}
//                                                     </span>
//                                                 </div>
                                                
//                                                 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-3 px-4 rounded-xl bg-gray-50 border border-gray-100 shadow-sm">
//                                                     <span className="text-gray-600 font-medium w-full sm:w-1/3 mb-1 sm:mb-0">Contact Email:</span>
//                                                     <span className="text-[#A78BFA] font-medium text-lg w-full sm:w-2/3 text-left sm:text-right">
//                                                         <a href={`mailto:${adminData?.email}`} className="hover:underline">{adminData?.email || "Not-available"}</a>
//                                                     </span>
//                                                 </div>
//                                             </div>
//                                         </section>
//                                     </div>
//                                 );
//                             })()}
//                         </>
//                     ) : (
//                         <div className="h-full flex items-center justify-center text-gray-500 min-h-[50vh]">
//                             <div className="text-center">
//                                 <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
//                                 </svg>
//                                 <p className="mt-4 text-lg font-medium text-gray-500">
//                                     Select a club from the left panel to view its full details.
//                                 </p>
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     </div>
//   );
// }