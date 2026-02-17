import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  BookOpen,
  Calendar,
  Edit,
  Trash2,
  MoreVertical,
  Briefcase,
  Layers,
  Filter,
  X,
  ShieldCheck
} from 'lucide-react';

// Filter Modal Component
const FilterModal = ({ 
  isOpen, 
  onClose, 
  clubs,
  departments, 
  years, 
  selectedClub,
  selectedDept, 
  selectedYear, 
  onClubChange,
  onDeptChange, 
  onYearChange,
  onResetFilters, 
  onApplyFilters 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-lg transition-all duration-300">
      <div className="bg-white rounded-xl shadow-lg p-6 w-11/12 max-w-md transform transition-all duration-300">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-xl text-[#4C1D95] flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filter Club Admins
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Club Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Club
            </label>
            <select
              value={selectedClub}
              onChange={(e) => onClubChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent transition-all duration-300 bg-white/50 text-sm"
            >
              <option value="">All Clubs</option>
              {clubs.map((club) => (
                <option key={club.clubId} value={club.clubId}>
                  {club.clubName}
                </option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department
            </label>
            <select
              value={selectedDept}
              onChange={(e) => onDeptChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent transition-all duration-300 bg-white/50 text-sm"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.departmentId} value={dept.departmentId}>
                  {dept.departmentName}
                </option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => onYearChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent transition-all duration-300 bg-white/50 text-sm"
            >
              <option value="">All Years</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  Year {year}
                </option>
              ))}
            </select>
          </div>

          {/* Active Filters Display */}
          {(selectedClub || selectedDept || selectedYear) && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs font-medium text-gray-600 mb-2">
                Active Filters:
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedClub && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    Club: {clubs.find(c => c.clubId === parseInt(selectedClub))?.clubName || selectedClub}
                    <button onClick={() => onClubChange('')} className="ml-1 text-orange-600 hover:text-orange-800">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedDept && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Dept: {departments.find(d => d.departmentId === parseInt(selectedDept))?.departmentName || selectedDept}
                    <button onClick={() => onDeptChange('')} className="ml-1 text-purple-600 hover:text-purple-800">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedYear && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Year: {selectedYear}
                    <button onClick={() => onYearChange('')} className="ml-1 text-blue-600 hover:text-blue-800">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4">
            <button
              onClick={onResetFilters}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition"
            >
              Reset All
            </button>
            <div className="space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onApplyFilters();
                  onClose();
                }}
                className="px-6 py-2 text-sm font-medium rounded-full bg-[#8B5CF6] text-white hover:bg-[#7C3AED] transition"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const customStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@500;700;800&display=swap');
    
    .font-sans { font-family: 'Poppins', sans-serif; }
    .font-display { font-family: 'Outfit', sans-serif; }

    .btn-gradient {
        background-image: linear-gradient(to right, #A78BFA, #8B5CF6);
        @apply text-white font-medium rounded-full py-2 px-4 transition-all duration-300 ease-out;
        box-shadow: 0 5px 15px rgba(139, 92, 246, 0.2);
    }
    .btn-gradient:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(139, 92, 246, 0.3);
    }

    .user-card-container {
        perspective: 1000px;
        height: 20rem;
        cursor: pointer;
    }

    .user-card {
        transform-style: preserve-3d;
        transition: transform 0.5s ease-in-out;
        width: 100%;
        height: 100%;
        position: relative;
    }

    .user-card-container:hover .user-card, 
    .user-card-container.flipped .user-card {
        transform: rotateY(180deg);
    }

    .card-face {
        position: absolute;
        width: 100%;
        height: 100%;
        backface-visibility: hidden;
        border-radius: 1rem;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
        padding: 1.5rem;
    }

    .card-face button {
        cursor: pointer;
    }

    .card-back {
        transform: rotateY(180deg);
        background: linear-gradient(135deg, #8B5CF6, #A78BFA);
    }
`;

const ClubAdminsManagement = () => {
  const navigate = useNavigate();
  
  const [clubAdmins, setClubAdmins] = useState([]);
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [openOverlayFor, setOpenOverlayFor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isLoadingFilteredAdmins, setIsLoadingFilteredAdmins] = useState(false);

  // Filter states
  const [selectedClub, setSelectedClub] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [clubs, setClubs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [years, setYears] = useState([1, 2, 3, 4]);

  const token = localStorage.getItem("token");

  const handleGoBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch club admins, clubs, and departments in parallel
      const [adminsResponse, clubsResponse, deptsResponse] = await Promise.all([
        axios.get("http://localhost:8080/api/user-clubs/getAll", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
        axios.get("http://localhost:8080/api/clubs", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
        axios.get("http://localhost:8080/api/department", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
      ]);

      const allUserClubs = adminsResponse.data.data || [];
      
      // Filter only CLUB_ADMIN entries
      const adminEntries = allUserClubs.filter(entry => entry.role === 'CLUB_ADMIN');
      
      setClubAdmins(adminEntries);
      setFilteredAdmins(adminEntries);

      // Set clubs and departments from API
      setClubs(clubsResponse.data.data || []);
      setDepartments(deptsResponse.data.data || []);

    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load club admin data. Check API availability and authorization.");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newClub = selectedClub, newDept = selectedDept, newYear = selectedYear) => {
    setSelectedClub(newClub);
    setSelectedDept(newDept);
    setSelectedYear(newYear);
    
    if (!newClub && !newDept && !newYear) {
      setFilteredAdmins(clubAdmins);
      return;
    }
    
    const applyImmediateFilters = () => {
      setIsLoadingFilteredAdmins(true);
      try {
        let adminsToFilter = [...clubAdmins];
        
        // Filter by Club
        if (newClub) {
          adminsToFilter = adminsToFilter.filter(admin => admin.clubId === parseInt(newClub));
        }

        // Filter by Department
        if (newDept) {
          adminsToFilter = adminsToFilter.filter(admin => admin.department === departments.find(d => d.departmentId === parseInt(newDept))?.departmentName);
        }
        
        // Filter by Year
        if (newYear) {
          adminsToFilter = adminsToFilter.filter(admin => admin.year?.toString() === newYear);
        }

        setFilteredAdmins(adminsToFilter);
      } catch (error) {
        console.error('Error filtering:', error);
      } finally {
        setIsLoadingFilteredAdmins(false);
      }
    };

    applyImmediateFilters();
  };

  const handleClubChange = (club) => handleFilterChange(club, selectedDept, selectedYear);
  const handleDeptChange = (dept) => handleFilterChange(selectedClub, dept, selectedYear);
  const handleYearChange = (year) => handleFilterChange(selectedClub, selectedDept, year);

  const resetFilters = () => {
    setSelectedClub('');
    setSelectedDept('');
    setSelectedYear('');
    setFilteredAdmins(clubAdmins);
  };

  const getClubName = (clubId) => {
    return clubs.find(c => c.clubId === clubId)?.clubName || 'Unknown Club';
  };

  const getDepartmentName = (deptName) => {
    return deptName || 'N/A';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <style dangerouslySetInnerHTML={{ __html: customStyles }} />
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#8B5CF6] mx-auto"></div>
          <p className="mt-6 font-medium text-[#4C1D95]">
            Loading club admins...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen font-sans py-12"
      style={{
        background:
          "radial-gradient(circle at top left, #F2EEFF, #FDFCFE 60%, #F8F5FF)",
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        clubs={clubs}
        departments={departments}
        years={years}
        selectedClub={selectedClub}
        selectedDept={selectedDept}
        selectedYear={selectedYear}
        onClubChange={handleClubChange}
        onDeptChange={handleDeptChange}
        onYearChange={handleYearChange}
        onResetFilters={resetFilters}
        onApplyFilters={() => handleFilterChange()} 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Back Button */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="flex items-center gap-6">
            <button
              onClick={handleGoBack}
              className="group flex items-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-lg border border-white/20 hover:border-white/40 text-[#4C1D95] font-medium rounded-full py-2.5 px-5 transition-all duration-300 shadow-lg hover:shadow-xl"
              style={{
                background: "rgba(255, 255, 255, 0.7)",
                backdropFilter: "blur(8px)"
              }}
            >
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#8B5CF6]/10 group-hover:bg-[#8B5CF6]/20 transition-all duration-300">
                <svg className="w-3.5 h-3.5 text-[#8B5CF6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </div>
            </button>
            
            <div className="text-left">
              <h1 className="font-display text-4xl font-extrabold text-[#4C1D95] tracking-tight">
                Club Admins Management
              </h1>
              <p className="text-gray-500 mt-2 text-lg">
                Manage all club administrators and their roles.
              </p>
            </div>
          </div>
        </div>

        {/* Stats and Filter Bar */}
        <div className="mb-8 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold text-[#4C1D95] font-display flex items-center">
                <Filter className="mr-3 w-5 h-5 text-[#A78BFA]" />
                Active Club Admins ({filteredAdmins.length})
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {(selectedClub || selectedDept || selectedYear) && (
                <div className="flex flex-wrap gap-2">
                  {selectedClub && (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-orange-100 text-orange-800 border border-orange-200">
                      Club: {getClubName(parseInt(selectedClub))}
                      <button onClick={() => handleClubChange('')} className="ml-2 text-orange-600 hover:text-orange-800">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {selectedDept && (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-purple-100 text-purple-800 border border-purple-200">
                      Dept: {departments.find(d => d.departmentId === parseInt(selectedDept))?.departmentName || selectedDept}
                      <button onClick={() => handleDeptChange('')} className="ml-2 text-purple-600 hover:text-purple-800">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {selectedYear && (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                      Year: {selectedYear}
                      <button onClick={() => handleYearChange('')} className="ml-2 text-blue-600 hover:text-blue-800">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>
              )}
              
              <button
                onClick={() => setIsFilterModalOpen(true)}
                className="cursor-pointer btn-gradient flex items-center px-4 py-2.5 rounded-xl"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filter
                {(selectedClub || selectedDept || selectedYear) && (
                  <span className="ml-2 bg-white text-[#8B5CF6] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {(selectedClub ? 1 : 0) + (selectedDept ? 1 : 0) + (selectedYear ? 1 : 0)}
                  </span>
                )}
              </button>
              
              {(selectedClub || selectedDept || selectedYear) && (
                <button
                  onClick={resetFilters}
                  className="cursor-pointer px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition flex items-center"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear All
                </button>
              )}
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-3 rounded-xl">
              <div className="text-xs text-gray-500">Total Admins</div>
              <div className="text-2xl font-bold text-[#4C1D95]">
                {clubAdmins.length}
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl">
              <div className="text-xs text-gray-500">Currently Showing</div>
              <div className="text-2xl font-bold text-[#8B5CF6]">
                {filteredAdmins.length}
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl">
              <div className="text-xs text-gray-500">Total Clubs</div>
              <div className="text-2xl font-bold text-[#10B981]">
                {clubs.length}
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl">
              <div className="text-xs text-gray-500">Active Filters</div>
              <div className="text-2xl font-bold text-[#F59E0B]">
                {(selectedClub ? 1 : 0) + (selectedDept ? 1 : 0) + (selectedYear ? 1 : 0)}
              </div>
            </div>
          </div>
        </div>

        {/* Admins Grid */}
        <div className="bg-white bg-opacity-95 rounded-3xl shadow-2xl p-6 sm:p-10 border border-gray-100">
          {isLoadingFilteredAdmins ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#8B5CF6] mx-auto mb-6"></div>
              <p className="text-gray-600">Applying filters...</p>
            </div>
          ) : filteredAdmins.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <Filter className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No club admins found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your filters to see more admins.</p>
              <button onClick={resetFilters} className="btn-gradient px-6 py-2.5">Clear All Filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredAdmins.map((admin) => {
                const isFlipped = openOverlayFor === admin.userClubId;

                return (
                  <div
                    key={admin.userClubId}
                    className={`user-card-container ${isFlipped ? "flipped" : ""}`}
                    onClick={() => setOpenOverlayFor(isFlipped ? null : admin.userClubId)}
                  >
                    <div className="user-card">
                      {/* Front of Card */}
                      <div className="card-face bg-white border border-gray-200 flex flex-col items-center justify-center transition-all duration-300 hover:shadow-xl hover:border-[#A78BFA]">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl mb-4">
                          {admin.hasProfileImage ? (
                            <img 
                              src={`http://localhost:8080/api/profiles/${admin.prn}/image`} 
                              alt={admin.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#8B5CF6] to-[#A78BFA] flex items-center justify-center">
                              <span className="text-3xl font-display font-bold text-white">
                                {admin.name?.charAt(0)?.toUpperCase() ?? "?"}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-display font-semibold text-gray-900 truncate max-w-[20rem]">
                            {admin.name || 'Unknown'}
                          </div>
                          <span className="inline-block mt-2 px-3 py-1 text-xs rounded-full bg-purple-600 text-white font-bold shadow-md shadow-purple-500/30">
                            CLUB ADMIN
                          </span>
                        </div>
                      </div>

                      {/* Back of Card */}
                      <div className="card-face card-back text-white p-6 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-3">
                              <User className="w-6 h-6" />
                              <div className="font-display font-semibold text-2xl">
                                {admin.prn || "N/A"}
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 text-sm space-y-3">
                            <div className="flex items-center gap-3">
                              <Layers className="w-4 h-4 text-[#2DD4BF]" />
                              <span className="truncate">{getClubName(admin.clubId)}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <BookOpen className="w-4 h-4 text-white/90" />
                              <span>{getDepartmentName(admin.department)}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Calendar className="w-4 h-4 text-white/90" />
                              <span>Year: {admin.year || '—'}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Calendar className="w-4 h-4 text-[#FB923C]" />
                              <span>Tenure: {admin.tenure || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-3 pt-2">
                              <ShieldCheck className='w-4 h-4 text-white/90'/>
                              <span className="px-3 py-1 text-xs rounded-full bg-white text-[#8B5CF6] font-semibold">
                                CLUB ADMIN
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClubAdminsManagement;