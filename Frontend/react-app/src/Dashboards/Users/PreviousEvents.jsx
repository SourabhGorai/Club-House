import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Users,
  User,
  Clock,
  Target,
  Globe,
  AlertCircle,
  Loader2,
  CalendarClock,
  Map,
  XCircle,
  Sparkles,
  Filter,
  ChevronDown,
  Search,
  Bell,
  Gift,
  Award,
  Briefcase,
  Star,
  BookOpen,
  Coffee,
  Music,
  Code,
  Camera,
  Heart,
  Zap,
  Trophy,
  CheckCircle,
  X,
  Edit,
  Trash2,
  ArrowLeft,
} from "lucide-react";

const PreviousEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState("");
  const [userDept, setUserDept] = useState("");
  const [deptId, setDeptId] = useState(null);
  const [filterType, setFilterType] = useState("GLOBAL");
  const [userClubs, setUserClubs] = useState([]);
  const [selectedClubId, setSelectedClubId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("date");
  const [showClubDropdown, setShowClubDropdown] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [userMap, setUserMap] = useState({}); // Cache for user names
  
  const navigate = useNavigate();

  const animations = {
    fadeIn: "animate-[fadeIn_0.5s_ease-in-out]",
    slideUp: "animate-[slideUp_0.5s_ease-out]",
    pulse: "animate-pulse",
    bounce: "animate-bounce",
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    const role = user?.role || "user";
    setUserRole(role);

    if (!token) {
      setError("No authentication token found. Please login again.");
      setLoading(false);
      return;
    }

    // Only fetch data for users
    if (role === "USER" || role === "USERS") {
      fetchDepartments(token);
      fetchUserProfile(token);
      fetchUserClubs(token);
      fetchEvents(token, "GLOBAL");
      fetchAllClubs(token);
    } else {
      setError("This page is only accessible to users.");
      setLoading(false);
    }
  }, []);

  // Fetch user name by PRN
  const fetchUserNameByPrn = async (token, prn) => {
    // Check cache first
    if (userMap[prn]) {
      return userMap[prn];
    }

    try {
      const response = await axios.get(
        `http://localhost:8080/api/profiles/prn/${prn}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        const profile = response.data.data;
        const name = profile.name || profile.fullName || prn;
        
        // Update cache
        setUserMap(prev => ({
          ...prev,
          [prn]: name
        }));
        
        return name;
      }
    } catch (err) {
      console.error(`Error fetching user for PRN ${prn}:`, err);
    }
    return prn;
  };

  const fetchDepartments = async (token) => {
    try {
      const response = await axios.get("http://localhost:8080/api/department", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data.success) {
        setDepartments(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching departments:", err);
    }
  };

  const fetchAllClubs = async (token) => {
    try {
      const response = await axios.get("http://localhost:8080/api/clubs", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data.success) {
        setClubs(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching clubs:", err);
    }
  };

  const fetchUserProfile = async (token) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const prn = user?.prn;

      if (!prn) return;

      const response = await axios.get(
        `http://localhost:8080/api/profiles/prn/${prn}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data.success) {
        const profile = response.data.data;
        setUserDept(profile.department);
        fetchDepartmentId(token, profile.department);
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
    }
  };

  const fetchDepartmentId = async (token, deptName) => {
    try {
      const response = await axios.get("http://localhost:8080/api/department", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data.success) {
        const dept = response.data.data.find((d) => d.name === deptName);
        if (dept) {
          setDeptId(dept.departmentId);
        }
      }
    } catch (err) {
      console.error("Error fetching department ID:", err);
    }
  };

  const fetchUserClubs = async (token) => {
    try {
      const response = await axios.get(
        "http://localhost:8080/api/user-clubs/getMyClubs",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data.success) {
        setUserClubs(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching user clubs:", err);
    }
  };

  const fetchEvents = async (token, filter = "GLOBAL", targetId = null) => {
    try {
      setLoading(true);
      console.log("FILTER:", filter, "TARGET ID:", targetId);

      let response;

      if (filter === "DEPARTMENT" && targetId) {
        response = await axios.get(
          `http://localhost:8080/api/events/targetData/DEPARTMENT/${targetId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );
      } else if (filter === "CLUB" && targetId) {
        response = await axios.get(
          `http://localhost:8080/api/events/targetData/CLUB/${targetId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );
      } else {
        response = await axios.get(
          `http://localhost:8080/api/events/getByTargetType/GLOBAL`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );
      }

      if (response && response.data && response.data.success) {
        // Filter to show only CLOSED events
        const closedEvents = response.data.data.filter(
          (event) => event.enrollmentStatus?.toUpperCase() === "CLOSED",
        );
        
        // Fetch creator names for closed events
        if (closedEvents.length > 0) {
          const eventsWithCreatorInfo = await Promise.all(
            closedEvents.map(async (event) => {
              // If creatorName is missing or looks like a PRN (numeric), fetch the actual name
              if (!event.creatorName || event.creatorName.match(/^\d+$/)) {
                const creatorName = await fetchUserNameByPrn(token, event.creatorPrn);
                return {
                  ...event,
                  creatorName: creatorName
                };
              }
              return event;
            })
          );
          setEvents(eventsWithCreatorInfo);
        } else {
          setEvents(closedEvents);
        }
      } else {
        throw new Error(response?.data?.message || "Failed to fetch events");
      }
    } catch (err) {
      console.error("Error fetching events:", err);
      setError(err.message || "An error occurred while fetching events");
    } finally {
      setLoading(false);
    }
  };

  const getFilteredEvents = () => {
    let filtered = [...events];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (event) =>
          event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.organizer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.creatorName?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Apply sorting
    switch (sortBy) {
      case "date":
        filtered.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime)); // Most recent first
        break;
      case "name":
        filtered.sort((a, b) => a.title?.localeCompare(b.title));
        break;
      default:
        break;
    }

    return filtered;
  };

  const handleFilterChange = async (newFilterType, targetId = null) => {
    setFilterType(newFilterType);
    const token = localStorage.getItem("token");

    if (newFilterType === "DEPARTMENT" && deptId) {
      await fetchEvents(token, "DEPARTMENT", deptId);
    } else if (newFilterType === "CLUB") {
      if (targetId) {
        setSelectedClubId(targetId);
        await fetchEvents(token, "CLUB", targetId);
        setShowClubDropdown(false);
      } else {
        setEvents([]);
        setShowClubDropdown(true);
      }
    } else {
      setSelectedClubId("");
      setShowClubDropdown(false);
      await fetchEvents(token, "GLOBAL");
    }
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setFilterType("GLOBAL");
    setSelectedClubId("");
    setShowClubDropdown(false);
    const token = localStorage.getItem("token");
    fetchEvents(token, "GLOBAL");
  };

  const getEventCategoryIcon = (title) => {
    const titleLower = title?.toLowerCase() || "";
    if (titleLower.includes("tech") || titleLower.includes("code"))
      return <Code className="w-5 h-5" />;
    if (titleLower.includes("music") || titleLower.includes("concert"))
      return <Music className="w-5 h-5" />;
    if (titleLower.includes("photo") || titleLower.includes("camera"))
      return <Camera className="w-5 h-5" />;
    if (titleLower.includes("sport") || titleLower.includes("game"))
      return <Trophy className="w-5 h-5" />;
    if (titleLower.includes("art") || titleLower.includes("creative"))
      return <Heart className="w-5 h-5" />;
    if (titleLower.includes("workshop") || titleLower.includes("learn"))
      return <BookOpen className="w-5 h-5" />;
    if (titleLower.includes("social") || titleLower.includes("meet"))
      return <Coffee className="w-5 h-5" />;
    return <Sparkles className="w-5 h-5" />;
  };

  const getCategoryColor = (title) => {
    const titleLower = title?.toLowerCase() || "";
    if (titleLower.includes("tech")) return "from-blue-500 to-cyan-500";
    if (titleLower.includes("music")) return "from-purple-500 to-pink-500";
    if (titleLower.includes("sport")) return "from-green-500 to-emerald-500";
    if (titleLower.includes("art")) return "from-orange-500 to-red-500";
    if (titleLower.includes("workshop")) return "from-indigo-500 to-purple-500";
    return "from-blue-600 to-indigo-600";
  };

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return "N/A";
    const date = new Date(dateTimeStr);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDaysUntil = (date) => {
    const today = new Date();
    const eventDate = new Date(date);
    const diffTime = eventDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getTargetTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "global":
        return <Globe className="w-4 h-4" />;
      case "club":
        return <Users className="w-4 h-4" />;
      case "department":
        return <Briefcase className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  const getTargetTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case "global":
        return "bg-blue-100 text-blue-700";
      case "club":
        return "bg-purple-100 text-purple-700";
      case "department":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const handleRetry = () => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchEvents(
        token,
        filterType,
        filterType === "DEPARTMENT"
          ? deptId
          : filterType === "CLUB"
            ? selectedClubId
            : null,
      );
    }
  };

  const filteredEvents = getFilteredEvents();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white animate-pulse" />
            </div>
          </div>
          <p className="text-white text-xl font-light animate-pulse">
            Loading previous events...
          </p>
          <p className="text-white/60 text-sm mt-2">Discover what happened!</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 max-w-md w-full text-center border border-white/20">
          <div className="bg-red-500/20 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-12 h-12 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-white/80 mb-8">{error}</p>
          <button
            onClick={handleRetry}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Sticky Back Button Bar - ClubDetails Style */}
      <div className="sticky top-0 z-50 w-full bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#4CA1AF] transition-colors group"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-2">
            <span
              className="bg-clip-text text-transparent"
              style={{
                background: "linear-gradient(135deg, #4CA1AF, #2C3E50)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Previous Events
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl">
            Explore events that have concluded. Relive the memories and see what
            you missed!
          </p>
        </div>

        {/* Stats Card */}
        <div className="flex justify-center mb-8">
          <div className="inline-block">
            <div className="bg-white/80 backdrop-blur-sm px-8 py-4 rounded-2xl shadow-lg">
              <div className="flex items-center space-x-3">
                <div
                  className="p-3 rounded-xl"
                  style={{
                    background: "linear-gradient(135deg, #4CA1AF20, #2C3E5020)",
                  }}
                >
                  <Calendar className="w-6 h-6" style={{ color: "#4CA1AF" }} />
                </div>
                <div className="text-left">
                  <p className="text-sm text-gray-600">Total Previous Events</p>
                  <p className="text-3xl font-bold text-gray-800">
                    {events.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 border border-white/20">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-700 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search previous events by title, description, organizer, or creator..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                />
              </div>

              {/* Filter Toggle and Sort Options */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-3 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 shadow-lg"
                  style={{
                    background: "linear-gradient(135deg, #4CA1AF, #2C3E50)",
                  }}
                >
                  <Filter className="w-5 h-5" />
                  <span>Filters</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-300 ${
                      showFilters ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                >
                  <option value="date">Sort by Date (Recent)</option>
                  <option value="name">Sort by Name</option>
                </select>
              </div>
            </div>

            {/* Active Filters Display */}
            {(filterType !== "GLOBAL" || selectedClubId) && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-gray-600 mr-2">
                    Active Filters:
                  </span>

                  {filterType === "DEPARTMENT" && userDept && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center">
                      Dept: {userDept}
                      <button
                        onClick={() => handleFilterChange("GLOBAL")}
                        className="ml-2 hover:text-green-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {filterType === "CLUB" && selectedClubId && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center">
                      Club:{" "}
                      {
                        userClubs.find(
                          (c) =>
                            c.clubId.toString() === selectedClubId.toString(),
                        )?.clubName
                      }
                      <button
                        onClick={() => handleFilterChange("GLOBAL")}
                        className="ml-2 hover:text-purple-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  <button
                    onClick={clearAllFilters}
                    className="px-3 py-1 text-red-600 hover:text-red-800 text-sm font-medium ml-auto"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            )}

            {/* Filter Options */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex flex-col space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm font-medium text-gray-600">
                      Filter by:
                    </span>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Global Events Filter */}
                      <button
                        onClick={() => handleFilterChange("GLOBAL")}
                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                          filterType === "GLOBAL"
                            ? "text-white shadow-lg"
                            : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                        }`}
                        style={
                          filterType === "GLOBAL"
                            ? {
                                background:
                                  "linear-gradient(135deg, #4CA1AF, #2C3E50)",
                              }
                            : {}
                        }
                      >
                        <Globe className="w-4 h-4 inline mr-2" />
                        Global Events
                      </button>

                      {/* Department Filter */}
                      {userDept && (
                        <button
                          onClick={() => handleFilterChange("DEPARTMENT")}
                          className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                            filterType === "DEPARTMENT"
                              ? "text-white shadow-lg"
                              : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                          }`}
                          style={
                            filterType === "DEPARTMENT"
                              ? {
                                  background:
                                    "linear-gradient(135deg, #4CA1AF, #2C3E50)",
                                }
                              : {}
                          }
                        >
                          <Users className="w-4 h-4 inline mr-2" />
                          {userDept} Events
                        </button>
                      )}

                      {/* Club Events Button */}
                      <button
                        onClick={() => setShowClubDropdown(!showClubDropdown)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
                          filterType === "CLUB"
                            ? "text-white shadow-lg"
                            : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                        }`}
                        style={
                          filterType === "CLUB"
                            ? {
                                background:
                                  "linear-gradient(135deg, #4CA1AF, #2C3E50)",
                              }
                            : {}
                        }
                      >
                        <Target className="w-4 h-4 mr-2" />
                        <span>Club Events</span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-300 ${showClubDropdown ? "rotate-180" : ""}`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Club Dropdown Section */}
                  {showClubDropdown && (
                    <div className="mt-2 border border-gray-200 rounded-xl bg-white shadow-lg overflow-hidden">
                      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                        <h3 className="font-semibold text-gray-700">
                          SELECT A CLUB
                        </h3>
                      </div>

                      <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
                        {userClubs.length > 0 ? (
                          userClubs.map((club) => (
                            <button
                              key={club.clubId}
                              onClick={() => {
                                handleFilterChange("CLUB", club.clubId);
                                setShowClubDropdown(false);
                              }}
                              className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                                selectedClubId === club.clubId.toString()
                                  ? "bg-purple-50"
                                  : ""
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-gray-800">
                                  {club.clubName}
                                </span>
                                <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                                  {club.memberCount || "0"} members
                                </span>
                              </div>
                              {club.desc && (
                                <p className="text-sm text-gray-600">
                                  {club.desc}
                                </p>
                              )}
                            </button>
                          ))
                        ) : (
                          <div className="p-6 text-center">
                            <p className="text-gray-500">
                              You are not a member of any clubs yet.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-4 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Showing{" "}
            <span className="font-semibold">{filteredEvents.length}</span> of{" "}
            <span className="font-semibold">{events.length}</span> previous
            events
          </p>
        </div>

        {/* Events Grid with Flip Cards */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 max-w-md mx-auto border border-white/20">
              <div className="relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full opacity-20 animate-ping"></div>
                </div>
                <XCircle className="w-20 h-20 text-gray-400 mx-auto mb-4 relative z-10" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                No Previous Events Found
              </h3>
              <p className="text-gray-600 mb-6">
                {filterType === "CLUB" && !selectedClubId
                  ? "Please select a club from the dropdown to view its previous events."
                  : "There are no closed events available at the moment. Check back later!"}
              </p>
              {(filterType !== "GLOBAL" || searchTerm) && (
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 shadow-lg"
                  style={{
                    background: "linear-gradient(135deg, #4CA1AF, #2C3E50)",
                  }}
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div
              className={`
        grid gap-4 w-full
        ${
          filteredEvents.length === 1
            ? "grid-cols-1 md:grid-cols-1 lg:grid-cols-1 max-w-sm mx-auto"
            : filteredEvents.length === 2
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-2 max-w-2xl mx-auto"
              : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        }
      `}
            >
              {filteredEvents.map((event, index) => {
                const daysUntil = getDaysUntil(event.dateTime);
                const categoryColor = getCategoryColor(event.title);
                const categoryIcon = getEventCategoryIcon(event.title);
                const targetTypeColor = getTargetTypeColor(event.targetType);
                const enrollmentPercentage = event.maxEnrollments
                  ? (event.currEnrollments / event.maxEnrollments) * 100
                  : 0;

                return (
                  <div
                    key={event.eventId}
                    className={`event-card-container ${animations.fadeIn}`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="event-card">
                      {/* Front of Card */}
                      <div className="card-face card-front bg-white/90 backdrop-blur-sm rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-500 border border-white/20">
                        {/* Event Header with Primary Color Gradient */}
                        <div
                          className="relative h-32 p-3 overflow-hidden"
                          style={{
                            background:
                              "linear-gradient(135deg, #4CA1AF, #2C3E50)",
                          }}
                        >
                          {/* Animated Background Pattern */}
                          <div className="absolute inset-0 opacity-10">
                            <div className="absolute -top-12 -right-12 w-24 h-24 bg-white rounded-full"></div>
                            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-white rounded-full"></div>
                          </div>

                          {/* Status Badge - CLOSED */}
                          <div className="absolute top-2 right-2">
                            <span className="px-2 py-1 rounded-full text-[10px] font-semibold bg-gray-200 text-red-700 border border-gray-300">
                              CLOSED
                            </span>
                          </div>

                          {/* Title */}
                          <div className="absolute bottom-2 right-2 text-right">
                            <h3 className="text-sm font-bold text-white mb-0.5 line-clamp-1">
                              {event.title}
                            </h3>
                            <p className="text-[10px] text-white/80 line-clamp-1">
                              {event.description}
                            </p>
                          </div>
                        </div>

                        {/* Quick Info Badges */}
                        <div className="p-3 space-y-2">
                          <div className="flex flex-wrap gap-1">
                            <div className="bg-blue-50 px-2 py-0.5 rounded-full text-[10px] font-medium text-blue-600 flex items-center">
                              <Calendar className="w-2.5 h-2.5 mr-1" />
                              {formatDateTime(event.dateTime)}
                            </div>
                            <div className="bg-green-50 px-2 py-0.5 rounded-full text-[10px] font-medium text-green-600 flex items-center">
                              <MapPin className="w-2.5 h-2.5 mr-1" />
                              {event.venue}
                            </div>
                          </div>

                          {/* Organizer and Speaker Info - Compact */}
                          <div className="grid grid-cols-2 gap-1">
                            <div className="bg-gray-50 p-1.5 rounded-lg">
                              <p className="text-[8px] text-gray-500">
                                Organizer
                              </p>
                              <p className="text-xs font-semibold text-gray-800 flex items-center truncate">
                                <User className="w-3 h-3 mr-0.5 text-blue-500 flex-shrink-0" />
                                <span className="truncate">
                                  {event.organizer}
                                </span>
                              </p>
                            </div>
                            <div className="bg-gray-50 p-1.5 rounded-lg">
                              <p className="text-[8px] text-gray-500">
                                Speaker
                              </p>
                              <p className="text-xs font-semibold text-gray-800 flex items-center truncate">
                                <Star className="w-3 h-3 mr-0.5 text-yellow-500 flex-shrink-0" />
                                <span className="truncate">
                                  {event.speaker || event.organizer}
                                </span>
                              </p>
                            </div>
                          </div>

                          {/* Target Type Badge */}
                          <div className="flex items-center justify-between">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${targetTypeColor} flex items-center`}
                            >
                              {getTargetTypeIcon(event.targetType)}
                              <span className="ml-1 capitalize text-xs">
                                {event.targetType || "N/A"}
                              </span>
                            </span>
                          </div>

                          {/* Flip Hint with Primary Color */}
                          <div
                            className="text-center text-[8px] mt-1 flex items-center justify-center"
                            style={{ color: "#4CA1AF" }}
                          >
                            <span className="animate-pulse mr-1 text-[6px]">
                              ●
                            </span>
                            Hover to view all details
                          </div>
                        </div>
                      </div>

                      {/* Back of Card - All Details with Primary Color */}
                      <div
                        className="card-face card-back rounded-xl shadow-md overflow-hidden p-3"
                        style={{
                          background:
                            "linear-gradient(135deg, #4CA1AF, #2C3E50)",
                        }}
                      >
                        <div className="h-full flex flex-col">
                          <h3 className="text-sm font-bold mb-2 line-clamp-1 text-white">
                            {event.title}
                          </h3>

                          <div className="space-y-1.5 overflow-y-auto flex-1 pr-1 custom-scrollbar text-xs">
                            {/* Date & Time */}
                            <div className="grid grid-cols-2 gap-1">
                              <div
                                className="p-1.5 rounded-lg"
                                style={{
                                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                                }}
                              >
                                <div className="flex items-center mb-0.5">
                                  <Calendar className="w-3 h-3 mr-1 text-white/80" />
                                  <p className="text-[10px] text-white/80">
                                    Date
                                  </p>
                                </div>
                                <p className="text-xs font-medium text-white">
                                  {formatDateTime(event.dateTime)}
                                </p>
                              </div>
                              <div
                                className="p-1.5 rounded-lg"
                                style={{
                                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                                }}
                              >
                                <div className="flex items-center mb-0.5">
                                  <Clock className="w-3 h-3 mr-1 text-white/80" />
                                  <p className="text-[10px] text-white/80">
                                    Deadline
                                  </p>
                                </div>
                                <p className="text-xs font-medium text-white">
                                  {new Date(
                                    event.enrollmentDeadline,
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            </div>

                            {/* Creator Name - Fixed to show actual name instead of PRN */}
                            <div
                              className="p-1.5 rounded-lg"
                              style={{
                                backgroundColor: "rgba(255, 255, 255, 0.1)",
                              }}
                            >
                              <p className="text-[10px] text-white/80 mb-1 flex items-center">
                                <Star className="w-2.5 h-2.5 mr-1" />
                                Created By
                              </p>
                              <p className="text-xs font-medium text-white flex items-center">
                                <span className="truncate">
                                  {event.creatorName || event.organizer || "Unknown"}
                                </span>
                              </p>
                            </div>

                            {/* Department Names */}
                            {event.targetType?.toUpperCase() === "DEPARTMENT" &&
                              event.targetIds?.length > 0 && (
                                <div
                                  className="p-1.5 rounded-lg"
                                  style={{
                                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                                  }}
                                >
                                  <p className="text-[10px] text-white/80 mb-1 flex items-center">
                                    <Briefcase className="w-2.5 h-2.5 mr-1" />
                                    Target Departments
                                  </p>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {event.targetIds.map((id) => {
                                      const dept = departments.find(
                                        (d) => d.departmentId === id,
                                      );
                                      return (
                                        <span
                                          key={id}
                                          className="px-1.5 py-0.5 rounded text-[8px] font-medium text-white"
                                          style={{
                                            backgroundColor:
                                              "rgba(255, 255, 255, 0.2)",
                                          }}
                                        >
                                          {dept?.name || `ID: ${id}`}
                                        </span>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                            {/* Club Names */}
                            {event.targetType?.toUpperCase() === "CLUB" &&
                              event.targetIds?.length > 0 && (
                                <div
                                  className="p-1.5 rounded-lg"
                                  style={{
                                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                                  }}
                                >
                                  <p className="text-[10px] text-white/80 mb-1 flex items-center">
                                    <Users className="w-2.5 h-2.5 mr-1" />
                                    Target Clubs
                                  </p>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {event.targetIds.map((id) => {
                                      const club = clubs.find(
                                        (c) => c.clubId === id,
                                      );
                                      return (
                                        <span
                                          key={id}
                                          className="px-1.5 py-0.5 rounded text-[8px] font-medium text-white"
                                          style={{
                                            backgroundColor:
                                              "rgba(255, 255, 255, 0.2)",
                                          }}
                                        >
                                          {club?.clubName || `ID: ${id}`}
                                        </span>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                          </div>

                          {/* Status Badges */}
                          <div className="mt-2 pt-1 border-t border-white/20 flex items-center justify-between">
                            <span
                              className={`text-[8px] font-medium px-1.5 py-0.5 rounded-full ${
                                event.enrollmentStatus?.toUpperCase() === "OPEN"
                                  ? "bg-green-500/30 text-green-100 border border-green-400/50"
                                  : event.enrollmentStatus?.toUpperCase() ===
                                      "CLOSED"
                                    ? "bg-red-500/30 text-red-100 border border-red-400/50"
                                    : "bg-yellow-500/30 text-yellow-100 border border-yellow-400/50"
                              }`}
                            >
                              {event.enrollmentStatus || "N/A"}
                            </span>

                            <span
                              className={`text-[8px] font-medium px-1.5 py-0.5 rounded-full ${
                                event.completed
                                  ? "bg-blue-500/30 text-blue-100"
                                  : "bg-gray-500/30 text-white"
                              }`}
                            >
                              {event.completed ? "Completed" : "Upcoming"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-2 text-gray-500 text-sm">
            <Bell className="w-4 h-4" />
            <span>Check back for more completed events!</span>
            <Gift className="w-4 h-4" />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        /* Flip Card Styles */
        .event-card-container {
          perspective: 1000px;
          height: 300px;
        }

        .event-card {
          transform-style: preserve-3d;
          transition: transform 0.5s ease-in-out;
          width: 100%;
          height: 100%;
          position: relative;
        }

        .event-card-container:hover .event-card {
          transform: rotateY(180deg);
        }

        .card-face {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          border-radius: 0.75rem;
          overflow: hidden;
        }

        .card-front {
          transform: rotateY(0deg);
        }

        .card-back {
          transform: rotateY(180deg);
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 2px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }

        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default PreviousEvents;



// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import {
//   Calendar,
//   MapPin,
//   Users,
//   User,
//   Clock,
//   Target,
//   Globe,
//   AlertCircle,
//   Loader2,
//   CalendarClock,
//   Map,
//   XCircle,
//   Sparkles,
//   Filter,
//   ChevronDown,
//   Search,
//   Bell,
//   Gift,
//   Award,
//   Briefcase,
//   Star,
//   BookOpen,
//   Coffee,
//   Music,
//   Code,
//   Camera,
//   Heart,
//   Zap,
//   Trophy,
//   CheckCircle,
//   X,
//   Edit,
//   Trash2,
// } from "lucide-react";

// const PreviousEvents = () => {
//   const [events, setEvents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [userRole, setUserRole] = useState("");
//   const [userDept, setUserDept] = useState("");
//   const [deptId, setDeptId] = useState(null);
//   const [filterType, setFilterType] = useState("GLOBAL");
//   const [userClubs, setUserClubs] = useState([]);
//   const [selectedClubId, setSelectedClubId] = useState("");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [showFilters, setShowFilters] = useState(false);
//   const [sortBy, setSortBy] = useState("date");
//   const [showClubDropdown, setShowClubDropdown] = useState(false);
//   const [departments, setDepartments] = useState([]);
//   const [clubs, setClubs] = useState([]);
  
//   const navigate = useNavigate();

//   const animations = {
//     fadeIn: "animate-[fadeIn_0.5s_ease-in-out]",
//     slideUp: "animate-[slideUp_0.5s_ease-out]",
//     pulse: "animate-pulse",
//     bounce: "animate-bounce",
//   };

//   useEffect(() => {
//     const user = JSON.parse(localStorage.getItem("user"));
//     const token = localStorage.getItem("token");

//     const role = user?.role || "user";
//     setUserRole(role);

//     if (!token) {
//       setError("No authentication token found. Please login again.");
//       setLoading(false);
//       return;
//     }

//     // Only fetch data for users
//     if (role === "USER" || role === "USERS") {
//       fetchDepartments(token);
//       fetchUserProfile(token);
//       fetchUserClubs(token);
//       fetchEvents(token, "GLOBAL");
//       fetchAllClubs(token);
//     } else {
//       setError("This page is only accessible to users.");
//       setLoading(false);
//     }
//   }, []);

//   const fetchDepartments = async (token) => {
//     try {
//       const response = await axios.get("http://localhost:8080/api/department", {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       });

//       if (response.data.success) {
//         setDepartments(response.data.data);
//       }
//     } catch (err) {
//       console.error("Error fetching departments:", err);
//     }
//   };

//   const fetchAllClubs = async (token) => {
//     try {
//       const response = await axios.get("http://localhost:8080/api/clubs", {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       });

//       if (response.data.success) {
//         setClubs(response.data.data);
//       }
//     } catch (err) {
//       console.error("Error fetching clubs:", err);
//     }
//   };

//   const fetchUserProfile = async (token) => {
//     try {
//       const user = JSON.parse(localStorage.getItem("user"));
//       const prn = user?.prn;

//       if (!prn) return;

//       const response = await axios.get(
//         `http://localhost:8080/api/profiles/prn/${prn}`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         },
//       );

//       if (response.data.success) {
//         const profile = response.data.data;
//         setUserDept(profile.department);
//         fetchDepartmentId(token, profile.department);
//       }
//     } catch (err) {
//       console.error("Error fetching user profile:", err);
//     }
//   };

//   const fetchDepartmentId = async (token, deptName) => {
//     try {
//       const response = await axios.get("http://localhost:8080/api/department", {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       });

//       if (response.data.success) {
//         const dept = response.data.data.find((d) => d.name === deptName);
//         if (dept) {
//           setDeptId(dept.departmentId);
//         }
//       }
//     } catch (err) {
//       console.error("Error fetching department ID:", err);
//     }
//   };

//   const fetchUserClubs = async (token) => {
//     try {
//       const response = await axios.get(
//         "http://localhost:8080/api/user-clubs/getMyClubs",
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         },
//       );

//       if (response.data.success) {
//         setUserClubs(response.data.data);
//       }
//     } catch (err) {
//       console.error("Error fetching user clubs:", err);
//     }
//   };

//   const fetchEvents = async (token, filter = "GLOBAL", targetId = null) => {
//     try {
//       setLoading(true);
//       console.log("FILTER:", filter, "TARGET ID:", targetId);

//       let response;

//       if (filter === "DEPARTMENT" && targetId) {
//         response = await axios.get(
//           `http://localhost:8080/api/events/targetData/DEPARTMENT/${targetId}`,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//               "Content-Type": "application/json",
//             },
//           },
//         );
//       } else if (filter === "CLUB" && targetId) {
//         response = await axios.get(
//           `http://localhost:8080/api/events/targetData/CLUB/${targetId}`,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//               "Content-Type": "application/json",
//             },
//           },
//         );
//       } else {
//         response = await axios.get(
//           `http://localhost:8080/api/events/getByTargetType/GLOBAL`,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//               "Content-Type": "application/json",
//             },
//           },
//         );
//       }

//       if (response && response.data && response.data.success) {
//         // Filter to show only CLOSED events
//         const closedEvents = response.data.data.filter(
//           (event) => event.enrollmentStatus?.toUpperCase() === "CLOSED",
//         );
//         setEvents(closedEvents);
//       } else {
//         throw new Error(response?.data?.message || "Failed to fetch events");
//       }
//     } catch (err) {
//       console.error("Error fetching events:", err);
//       setError(err.message || "An error occurred while fetching events");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getFilteredEvents = () => {
//     let filtered = [...events];

//     // Apply search filter
//     if (searchTerm) {
//       filtered = filtered.filter(
//         (event) =>
//           event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           event.organizer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           event.creatorName?.toLowerCase().includes(searchTerm.toLowerCase()),
//       );
//     }

//     // Apply sorting
//     switch (sortBy) {
//       case "date":
//         filtered.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime)); // Most recent first
//         break;
//       case "name":
//         filtered.sort((a, b) => a.title?.localeCompare(b.title));
//         break;
//       default:
//         break;
//     }

//     return filtered;
//   };

//   const handleFilterChange = async (newFilterType, targetId = null) => {
//     setFilterType(newFilterType);
//     const token = localStorage.getItem("token");

//     if (newFilterType === "DEPARTMENT" && deptId) {
//       await fetchEvents(token, "DEPARTMENT", deptId);
//     } else if (newFilterType === "CLUB") {
//       if (targetId) {
//         setSelectedClubId(targetId);
//         await fetchEvents(token, "CLUB", targetId);
//         setShowClubDropdown(false);
//       } else {
//         setEvents([]);
//         setShowClubDropdown(true);
//       }
//     } else {
//       setSelectedClubId("");
//       setShowClubDropdown(false);
//       await fetchEvents(token, "GLOBAL");
//     }
//   };

//   const clearAllFilters = () => {
//     setSearchTerm("");
//     setFilterType("GLOBAL");
//     setSelectedClubId("");
//     setShowClubDropdown(false);
//     const token = localStorage.getItem("token");
//     fetchEvents(token, "GLOBAL");
//   };

//   const getEventCategoryIcon = (title) => {
//     const titleLower = title?.toLowerCase() || "";
//     if (titleLower.includes("tech") || titleLower.includes("code"))
//       return <Code className="w-5 h-5" />;
//     if (titleLower.includes("music") || titleLower.includes("concert"))
//       return <Music className="w-5 h-5" />;
//     if (titleLower.includes("photo") || titleLower.includes("camera"))
//       return <Camera className="w-5 h-5" />;
//     if (titleLower.includes("sport") || titleLower.includes("game"))
//       return <Trophy className="w-5 h-5" />;
//     if (titleLower.includes("art") || titleLower.includes("creative"))
//       return <Heart className="w-5 h-5" />;
//     if (titleLower.includes("workshop") || titleLower.includes("learn"))
//       return <BookOpen className="w-5 h-5" />;
//     if (titleLower.includes("social") || titleLower.includes("meet"))
//       return <Coffee className="w-5 h-5" />;
//     return <Sparkles className="w-5 h-5" />;
//   };

//   const getCategoryColor = (title) => {
//     const titleLower = title?.toLowerCase() || "";
//     if (titleLower.includes("tech")) return "from-blue-500 to-cyan-500";
//     if (titleLower.includes("music")) return "from-purple-500 to-pink-500";
//     if (titleLower.includes("sport")) return "from-green-500 to-emerald-500";
//     if (titleLower.includes("art")) return "from-orange-500 to-red-500";
//     if (titleLower.includes("workshop")) return "from-indigo-500 to-purple-500";
//     return "from-blue-600 to-indigo-600";
//   };

//   const formatDateTime = (dateTimeStr) => {
//     if (!dateTimeStr) return "N/A";
//     const date = new Date(dateTimeStr);
//     return date.toLocaleString("en-US", {
//       month: "short",
//       day: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   const getDaysUntil = (date) => {
//     const today = new Date();
//     const eventDate = new Date(date);
//     const diffTime = eventDate - today;
//     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//     return diffDays;
//   };

//   const getTargetTypeIcon = (type) => {
//     switch (type?.toLowerCase()) {
//       case "global":
//         return <Globe className="w-4 h-4" />;
//       case "club":
//         return <Users className="w-4 h-4" />;
//       case "department":
//         return <Briefcase className="w-4 h-4" />;
//       default:
//         return <Target className="w-4 h-4" />;
//     }
//   };

//   const getTargetTypeColor = (type) => {
//     switch (type?.toLowerCase()) {
//       case "global":
//         return "bg-blue-100 text-blue-700";
//       case "club":
//         return "bg-purple-100 text-purple-700";
//       case "department":
//         return "bg-green-100 text-green-700";
//       default:
//         return "bg-gray-100 text-gray-700";
//     }
//   };

//   const handleRetry = () => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       fetchEvents(
//         token,
//         filterType,
//         filterType === "DEPARTMENT"
//           ? deptId
//           : filterType === "CLUB"
//             ? selectedClubId
//             : null,
//       );
//     }
//   };

//   const filteredEvents = getFilteredEvents();

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
//         <div className="text-center">
//           <div className="relative">
//             <div className="w-24 h-24 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-6"></div>
//             <div className="absolute inset-0 flex items-center justify-center">
//               <Sparkles className="w-8 h-8 text-white animate-pulse" />
//             </div>
//           </div>
//           <p className="text-white text-xl font-light animate-pulse">
//             Loading previous events...
//           </p>
//           <p className="text-white/60 text-sm mt-2">Discover what happened!</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
//         <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 max-w-md w-full text-center border border-white/20">
//           <div className="bg-red-500/20 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
//             <AlertCircle className="w-12 h-12 text-red-400" />
//           </div>
//           <h2 className="text-2xl font-bold text-white mb-2">
//             Oops! Something went wrong
//           </h2>
//           <p className="text-white/80 mb-8">{error}</p>
//           <button
//             onClick={handleRetry}
//             className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
//           >
//             Try Again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
//       {/* Animated Background */}
//       <div className="fixed inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
//         <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
//         <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
//       </div>

//       <div className="relative max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
//         {/* Header with Back Button */}
//         <div className="mb-8 flex items-center gap-6">
//           <button
//             onClick={() => navigate(-1)}
//             className="group flex items-center gap-3 border border-white/20 hover:border-white/40 font-medium rounded-full py-2.5 px-5 transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer"
//             style={{
//               background: "rgba(255,255,255,0.7)",
//               backdropFilter: "blur(8px)",
//               color: "#4CA1AF",
//             }}
//           >
//             <div
//               className="flex items-center justify-center w-6 h-6 rounded-full transition-all duration-300 group-hover:scale-110"
//               style={{ backgroundColor: "rgba(76, 161, 175, 0.1)" }}
//             >
//               <svg
//                 className="w-3.5 h-3.5"
//                 style={{ color: "#4CA1AF" }}
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2.5}
//                   d="M10 19l-7-7m0 0l7-7m-7 7h18"
//                 />
//               </svg>
//             </div>
//             {/* <span className="text-sm">Back</span> */}
//           </button>

//           <div className="flex-1">
//             <div className="inline-block mb-2">
//               <span
//                 className="text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg flex items-center"
//                 style={{
//                   background: "linear-gradient(135deg, #4CA1AF, #2C3E50)",
//                 }}
//               >
//                 <Award className="w-4 h-4 mr-2" />
//                 COMPLETED EVENTS
//               </span>
//             </div>

//             <h1 className="text-5xl font-bold mb-2">
//               <span
//                 className="bg-clip-text text-transparent"
//                 style={{
//                   background: "linear-gradient(135deg, #4CA1AF, #2C3E50)",
//                   WebkitBackgroundClip: "text",
//                   WebkitTextFillColor: "transparent",
//                 }}
//               >
//                 Previous Events
//               </span>
//             </h1>
//             <p className="text-xl text-gray-600 max-w-2xl">
//               Explore events that have concluded. Relive the memories and see what
//               you missed!
//             </p>
//           </div>
//         </div>

//         {/* Stats Card */}
//         <div className="flex justify-center mb-8">
//           <div className="inline-block">
//             <div className="bg-white/80 backdrop-blur-sm px-8 py-4 rounded-2xl shadow-lg">
//               <div className="flex items-center space-x-3">
//                 <div
//                   className="p-3 rounded-xl"
//                   style={{
//                     background: "linear-gradient(135deg, #4CA1AF20, #2C3E5020)",
//                   }}
//                 >
//                   <Calendar className="w-6 h-6" style={{ color: "#4CA1AF" }} />
//                 </div>
//                 <div className="text-left">
//                   <p className="text-sm text-gray-600">Total Previous Events</p>
//                   <p className="text-3xl font-bold text-gray-800">
//                     {events.length}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Search and Filter Bar */}
//         <div className="mb-8">
//           <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 border border-white/20">
//             <div className="flex flex-col lg:flex-row gap-4">
//               {/* Search Input */}
//               <div className="flex-1 relative">
//                 <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-700 w-5 h-5" />
//                 <input
//                   type="text"
//                   placeholder="Search previous events by title, description, or organizer..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all duration-300 bg-white/50 backdrop-blur-sm"
//                 />
//               </div>

//               {/* Filter Toggle and Sort Options */}
//               <div className="flex items-center gap-3">
//                 <button
//                   onClick={() => setShowFilters(!showFilters)}
//                   className="px-4 py-3 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 shadow-lg"
//                   style={{
//                     background: "linear-gradient(135deg, #4CA1AF, #2C3E50)",
//                   }}
//                 >
//                   <Filter className="w-5 h-5" />
//                   <span>Filters</span>
//                   <ChevronDown
//                     className={`w-4 h-4 transition-transform duration-300 ${
//                       showFilters ? "rotate-180" : ""
//                     }`}
//                   />
//                 </button>

//                 <select
//                   value={sortBy}
//                   onChange={(e) => setSortBy(e.target.value)}
//                   className="px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all duration-300 bg-white/50 backdrop-blur-sm"
//                 >
//                   <option value="date">Sort by Date (Recent)</option>
//                   <option value="name">Sort by Name</option>
//                 </select>
//               </div>
//             </div>

//             {/* Active Filters Display */}
//             {(filterType !== "GLOBAL" || selectedClubId) && (
//               <div className="mt-4 pt-4 border-t border-gray-200">
//                 <div className="flex flex-wrap items-center gap-2">
//                   <span className="text-sm font-medium text-gray-600 mr-2">
//                     Active Filters:
//                   </span>

//                   {filterType === "DEPARTMENT" && userDept && (
//                     <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center">
//                       Dept: {userDept}
//                       <button
//                         onClick={() => handleFilterChange("GLOBAL")}
//                         className="ml-2 hover:text-green-900"
//                       >
//                         <X className="w-3 h-3" />
//                       </button>
//                     </span>
//                   )}

//                   {filterType === "CLUB" && selectedClubId && (
//                     <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center">
//                       Club:{" "}
//                       {
//                         userClubs.find(
//                           (c) =>
//                             c.clubId.toString() === selectedClubId.toString(),
//                         )?.clubName
//                       }
//                       <button
//                         onClick={() => handleFilterChange("GLOBAL")}
//                         className="ml-2 hover:text-purple-900"
//                       >
//                         <X className="w-3 h-3" />
//                       </button>
//                     </span>
//                   )}

//                   <button
//                     onClick={clearAllFilters}
//                     className="px-3 py-1 text-red-600 hover:text-red-800 text-sm font-medium ml-auto"
//                   >
//                     Clear All
//                   </button>
//                 </div>
//               </div>
//             )}

//             {/* Filter Options */}
//             {showFilters && (
//               <div className="mt-4 pt-4 border-t border-gray-200">
//                 <div className="flex flex-col space-y-4">
//                   <div className="flex flex-wrap items-center gap-3">
//                     <span className="text-sm font-medium text-gray-600">
//                       Filter by:
//                     </span>

//                     <div className="flex flex-wrap items-center gap-2">
//                       {/* Global Events Filter */}
//                       <button
//                         onClick={() => handleFilterChange("GLOBAL")}
//                         className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
//                           filterType === "GLOBAL"
//                             ? "text-white shadow-lg"
//                             : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
//                         }`}
//                         style={
//                           filterType === "GLOBAL"
//                             ? {
//                                 background:
//                                   "linear-gradient(135deg, #4CA1AF, #2C3E50)",
//                               }
//                             : {}
//                         }
//                       >
//                         <Globe className="w-4 h-4 inline mr-2" />
//                         Global Events
//                       </button>

//                       {/* Department Filter */}
//                       {userDept && (
//                         <button
//                           onClick={() => handleFilterChange("DEPARTMENT")}
//                           className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
//                             filterType === "DEPARTMENT"
//                               ? "text-white shadow-lg"
//                               : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
//                           }`}
//                           style={
//                             filterType === "DEPARTMENT"
//                               ? {
//                                   background:
//                                     "linear-gradient(135deg, #4CA1AF, #2C3E50)",
//                                 }
//                               : {}
//                           }
//                         >
//                           <Users className="w-4 h-4 inline mr-2" />
//                           {userDept} Events
//                         </button>
//                       )}

//                       {/* Club Events Button */}
//                       <button
//                         onClick={() => setShowClubDropdown(!showClubDropdown)}
//                         className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
//                           filterType === "CLUB"
//                             ? "text-white shadow-lg"
//                             : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
//                         }`}
//                         style={
//                           filterType === "CLUB"
//                             ? {
//                                 background:
//                                   "linear-gradient(135deg, #4CA1AF, #2C3E50)",
//                               }
//                             : {}
//                         }
//                       >
//                         <Target className="w-4 h-4 mr-2" />
//                         <span>Club Events</span>
//                         <ChevronDown
//                           className={`w-4 h-4 transition-transform duration-300 ${showClubDropdown ? "rotate-180" : ""}`}
//                         />
//                       </button>
//                     </div>
//                   </div>

//                   {/* Club Dropdown Section */}
//                   {showClubDropdown && (
//                     <div className="mt-2 border border-gray-200 rounded-xl bg-white shadow-lg overflow-hidden">
//                       <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
//                         <h3 className="font-semibold text-gray-700">
//                           SELECT A CLUB
//                         </h3>
//                       </div>

//                       <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
//                         {userClubs.length > 0 ? (
//                           userClubs.map((club) => (
//                             <button
//                               key={club.clubId}
//                               onClick={() => {
//                                 handleFilterChange("CLUB", club.clubId);
//                                 setShowClubDropdown(false);
//                               }}
//                               className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
//                                 selectedClubId === club.clubId.toString()
//                                   ? "bg-purple-50"
//                                   : ""
//                               }`}
//                             >
//                               <div className="flex items-center justify-between mb-2">
//                                 <span className="font-semibold text-gray-800">
//                                   {club.clubName}
//                                 </span>
//                                 <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
//                                   {club.memberCount || "0"} members
//                                 </span>
//                               </div>
//                               {club.desc && (
//                                 <p className="text-sm text-gray-600">
//                                   {club.desc}
//                                 </p>
//                               )}
//                             </button>
//                           ))
//                         ) : (
//                           <div className="p-6 text-center">
//                             <p className="text-gray-500">
//                               You are not a member of any clubs yet.
//                             </p>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Results Summary */}
//         <div className="mb-4 flex justify-between items-center">
//           <p className="text-sm text-gray-600">
//             Showing{" "}
//             <span className="font-semibold">{filteredEvents.length}</span> of{" "}
//             <span className="font-semibold">{events.length}</span> previous
//             events
//           </p>
//         </div>

//         {/* Events Grid with Flip Cards */}
//         {filteredEvents.length === 0 ? (
//           <div className="text-center py-16">
//             <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 max-w-md mx-auto border border-white/20">
//               <div className="relative">
//                 <div className="absolute inset-0 flex items-center justify-center">
//                   <div className="w-32 h-32 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full opacity-20 animate-ping"></div>
//                 </div>
//                 <XCircle className="w-20 h-20 text-gray-400 mx-auto mb-4 relative z-10" />
//               </div>
//               <h3 className="text-2xl font-bold text-gray-800 mb-2">
//                 No Previous Events Found
//               </h3>
//               <p className="text-gray-600 mb-6">
//                 {filterType === "CLUB" && !selectedClubId
//                   ? "Please select a club from the dropdown to view its previous events."
//                   : "There are no closed events available at the moment. Check back later!"}
//               </p>
//               {(filterType !== "GLOBAL" || searchTerm) && (
//                 <button
//                   onClick={clearAllFilters}
//                   className="px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 shadow-lg"
//                   style={{
//                     background: "linear-gradient(135deg, #4CA1AF, #2C3E50)",
//                   }}
//                 >
//                   Clear All Filters
//                 </button>
//               )}
//             </div>
//           </div>
//         ) : (
//           <div className="flex justify-center">
//             <div
//               className={`
//         grid gap-4 w-full
//         ${
//           filteredEvents.length === 1
//             ? "grid-cols-1 md:grid-cols-1 lg:grid-cols-1 max-w-sm mx-auto"
//             : filteredEvents.length === 2
//               ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-2 max-w-2xl mx-auto"
//               : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
//         }
//       `}
//             >
//               {filteredEvents.map((event, index) => {
//                 const daysUntil = getDaysUntil(event.dateTime);
//                 const categoryColor = getCategoryColor(event.title);
//                 const categoryIcon = getEventCategoryIcon(event.title);
//                 const targetTypeColor = getTargetTypeColor(event.targetType);
//                 const enrollmentPercentage = event.maxEnrollments
//                   ? (event.currEnrollments / event.maxEnrollments) * 100
//                   : 0;

//                 return (
//                   <div
//                     key={event.eventId}
//                     className={`event-card-container ${animations.fadeIn}`}
//                     style={{ animationDelay: `${index * 100}ms` }}
//                   >
//                     <div className="event-card">
//                       {/* Front of Card */}
//                       <div className="card-face card-front bg-white/90 backdrop-blur-sm rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-500 border border-white/20">
//                         {/* Event Header with Primary Color Gradient */}
//                         <div
//                           className="relative h-32 p-3 overflow-hidden"
//                           style={{
//                             background:
//                               "linear-gradient(135deg, #4CA1AF, #2C3E50)",
//                           }}
//                         >
//                           {/* Animated Background Pattern */}
//                           <div className="absolute inset-0 opacity-10">
//                             <div className="absolute -top-12 -right-12 w-24 h-24 bg-white rounded-full"></div>
//                             <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-white rounded-full"></div>
//                           </div>

//                           {/* Status Badge - CLOSED */}
//                           <div className="absolute top-2 right-2">
//                             <span className="px-2 py-1 rounded-full text-[10px] font-semibold bg-gray-200 text-red-700 border border-gray-300">
//                               CLOSED
//                             </span>
//                           </div>

//                           {/* Title */}
//                           <div className="absolute bottom-2 right-2 text-right">
//                             <h3 className="text-sm font-bold text-white mb-0.5 line-clamp-1">
//                               {event.title}
//                             </h3>
//                             <p className="text-[10px] text-white/80 line-clamp-1">
//                               {event.description}
//                             </p>
//                           </div>
//                         </div>

//                         {/* Quick Info Badges */}
//                         <div className="p-3 space-y-2">
//                           <div className="flex flex-wrap gap-1">
//                             <div className="bg-blue-50 px-2 py-0.5 rounded-full text-[10px] font-medium text-blue-600 flex items-center">
//                               <Calendar className="w-2.5 h-2.5 mr-1" />
//                               {formatDateTime(event.dateTime)}
//                             </div>
//                             <div className="bg-green-50 px-2 py-0.5 rounded-full text-[10px] font-medium text-green-600 flex items-center">
//                               <MapPin className="w-2.5 h-2.5 mr-1" />
//                               {event.venue}
//                             </div>
//                           </div>

//                           {/* Organizer and Speaker Info - Compact */}
//                           <div className="grid grid-cols-2 gap-1">
//                             <div className="bg-gray-50 p-1.5 rounded-lg">
//                               <p className="text-[8px] text-gray-500">
//                                 Organizer
//                               </p>
//                               <p className="text-xs font-semibold text-gray-800 flex items-center truncate">
//                                 <User className="w-3 h-3 mr-0.5 text-blue-500 flex-shrink-0" />
//                                 <span className="truncate">
//                                   {event.organizer}
//                                 </span>
//                               </p>
//                             </div>
//                             <div className="bg-gray-50 p-1.5 rounded-lg">
//                               <p className="text-[8px] text-gray-500">
//                                 Speaker
//                               </p>
//                               <p className="text-xs font-semibold text-gray-800 flex items-center truncate">
//                                 <Star className="w-3 h-3 mr-0.5 text-yellow-500 flex-shrink-0" />
//                                 <span className="truncate">
//                                   {event.speakerName}
//                                 </span>
//                               </p>
//                             </div>
//                           </div>

//                           {/* Target Type Badge */}
//                           <div className="flex items-center justify-between">
//                             <span
//                               className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${targetTypeColor} flex items-center`}
//                             >
//                               {getTargetTypeIcon(event.targetType)}
//                               <span className="ml-1 capitalize text-xs">
//                                 {event.targetType || "N/A"}
//                               </span>
//                             </span>
//                           </div>

//                           {/* Flip Hint with Primary Color */}
//                           <div
//                             className="text-center text-[8px] mt-1 flex items-center justify-center"
//                             style={{ color: "#4CA1AF" }}
//                           >
//                             <span className="animate-pulse mr-1 text-[6px]">
//                               ●
//                             </span>
//                             Hover to view all details
//                           </div>
//                         </div>
//                       </div>

//                       {/* Back of Card - All Details with Primary Color */}
//                       <div
//                         className="card-face card-back rounded-xl shadow-md overflow-hidden p-3"
//                         style={{
//                           background:
//                             "linear-gradient(135deg, #4CA1AF, #2C3E50)",
//                         }}
//                       >
//                         <div className="h-full flex flex-col">
//                           <h3 className="text-sm font-bold mb-2 line-clamp-1 text-white">
//                             {event.title}
//                           </h3>

//                           <div className="space-y-1.5 overflow-y-auto flex-1 pr-1 custom-scrollbar text-xs">
//                             {/* Date & Time */}
//                             <div className="grid grid-cols-2 gap-1">
//                               <div
//                                 className="p-1.5 rounded-lg"
//                                 style={{
//                                   backgroundColor: "rgba(255, 255, 255, 0.1)",
//                                 }}
//                               >
//                                 <div className="flex items-center mb-0.5">
//                                   <Calendar className="w-3 h-3 mr-1 text-white/80" />
//                                   <p className="text-[10px] text-white/80">
//                                     Date
//                                   </p>
//                                 </div>
//                                 <p className="text-xs font-medium text-white">
//                                   {formatDateTime(event.dateTime)}
//                                 </p>
//                               </div>
//                               <div
//                                 className="p-1.5 rounded-lg"
//                                 style={{
//                                   backgroundColor: "rgba(255, 255, 255, 0.1)",
//                                 }}
//                               >
//                                 <div className="flex items-center mb-0.5">
//                                   <Clock className="w-3 h-3 mr-1 text-white/80" />
//                                   <p className="text-[10px] text-white/80">
//                                     Deadline
//                                   </p>
//                                 </div>
//                                 <p className="text-xs font-medium text-white">
//                                   {new Date(
//                                     event.enrollmentDeadline,
//                                   ).toLocaleDateString()}
//                                 </p>
//                               </div>
//                             </div>

//                             {/* Department Names */}
//                             {event.targetType?.toUpperCase() === "DEPARTMENT" &&
//                               event.targetIds?.length > 0 && (
//                                 <div
//                                   className="p-1.5 rounded-lg"
//                                   style={{
//                                     backgroundColor: "rgba(255, 255, 255, 0.1)",
//                                   }}
//                                 >
//                                   <p className="text-[10px] text-white/80 mb-1 flex items-center">
//                                     <Briefcase className="w-2.5 h-2.5 mr-1" />
//                                     Target Departments
//                                   </p>
//                                   <div className="flex flex-wrap gap-1 mt-1">
//                                     {event.targetIds.map((id) => {
//                                       const dept = departments.find(
//                                         (d) => d.departmentId === id,
//                                       );
//                                       return (
//                                         <span
//                                           key={id}
//                                           className="px-1.5 py-0.5 rounded text-[8px] font-medium text-white"
//                                           style={{
//                                             backgroundColor:
//                                               "rgba(255, 255, 255, 0.2)",
//                                           }}
//                                         >
//                                           {dept?.name || `ID: ${id}`}
//                                         </span>
//                                       );
//                                     })}
//                                   </div>
//                                 </div>
//                               )}

//                             {/* Club Names */}
//                             {event.targetType?.toUpperCase() === "CLUB" &&
//                               event.targetIds?.length > 0 && (
//                                 <div
//                                   className="p-1.5 rounded-lg"
//                                   style={{
//                                     backgroundColor: "rgba(255, 255, 255, 0.1)",
//                                   }}
//                                 >
//                                   <p className="text-[10px] text-white/80 mb-1 flex items-center">
//                                     <Users className="w-2.5 h-2.5 mr-1" />
//                                     Target Clubs
//                                   </p>
//                                   <div className="flex flex-wrap gap-1 mt-1">
//                                     {event.targetIds.map((id) => {
//                                       const club = clubs.find(
//                                         (c) => c.clubId === id,
//                                       );
//                                       return (
//                                         <span
//                                           key={id}
//                                           className="px-1.5 py-0.5 rounded text-[8px] font-medium text-white"
//                                           style={{
//                                             backgroundColor:
//                                               "rgba(255, 255, 255, 0.2)",
//                                           }}
//                                         >
//                                           {club?.clubName || `ID: ${id}`}
//                                         </span>
//                                       );
//                                     })}
//                                   </div>
//                                 </div>
//                               )}
//                           </div>

//                           {/* Status Badges */}
//                           <div className="mt-2 pt-1 border-t border-white/20 flex items-center justify-between">
//                             <span
//                               className={`text-[8px] font-medium px-1.5 py-0.5 rounded-full ${
//                                 event.enrollmentStatus?.toUpperCase() === "OPEN"
//                                   ? "bg-green-500/30 text-green-100 border border-green-400/50"
//                                   : event.enrollmentStatus?.toUpperCase() ===
//                                       "CLOSED"
//                                     ? "bg-red-500/30 text-red-100 border border-red-400/50"
//                                     : "bg-yellow-500/30 text-yellow-100 border border-yellow-400/50"
//                               }`}
//                             >
//                               {event.enrollmentStatus || "N/A"}
//                             </span>

//                             <span
//                               className={`text-[8px] font-medium px-1.5 py-0.5 rounded-full ${
//                                 event.completed
//                                   ? "bg-blue-500/30 text-blue-100"
//                                   : "bg-gray-500/30 text-white"
//                               }`}
//                             >
//                               {event.completed ? "Completed" : "Upcoming"}
//                             </span>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         )}
//         {/* Footer */}
//         <div className="mt-12 text-center">
//           <div className="inline-flex items-center space-x-2 text-gray-500 text-sm">
//             <Bell className="w-4 h-4" />
//             <span>Check back for more completed events!</span>
//             <Gift className="w-4 h-4" />
//           </div>
//         </div>
//       </div>

//       <style jsx>{`
//         @keyframes fadeIn {
//           from {
//             opacity: 0;
//             transform: translateY(20px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }

//         @keyframes slideUp {
//           from {
//             opacity: 0;
//             transform: translateY(40px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }

//         @keyframes blob {
//           0% {
//             transform: translate(0px, 0px) scale(1);
//           }
//           33% {
//             transform: translate(30px, -50px) scale(1.1);
//           }
//           66% {
//             transform: translate(-20px, 20px) scale(0.9);
//           }
//           100% {
//             transform: translate(0px, 0px) scale(1);
//           }
//         }

//         .animate-blob {
//           animation: blob 7s infinite;
//         }

//         .animation-delay-2000 {
//           animation-delay: 2s;
//         }

//         .animation-delay-4000 {
//           animation-delay: 4s;
//         }

//         /* Flip Card Styles */
//         .event-card-container {
//           perspective: 1000px;
//           height: 300px;
//         }

//         .event-card {
//           transform-style: preserve-3d;
//           transition: transform 0.5s ease-in-out;
//           width: 100%;
//           height: 100%;
//           position: relative;
//         }

//         .event-card-container:hover .event-card {
//           transform: rotateY(180deg);
//         }

//         .card-face {
//           position: absolute;
//           width: 100%;
//           height: 100%;
//           backface-visibility: hidden;
//           border-radius: 0.75rem;
//           overflow: hidden;
//         }

//         .card-front {
//           transform: rotateY(0deg);
//         }

//         .card-back {
//           transform: rotateY(180deg);
//         }

//         .custom-scrollbar::-webkit-scrollbar {
//           width: 2px;
//         }

//         .custom-scrollbar::-webkit-scrollbar-track {
//           background: rgba(255, 255, 255, 0.1);
//           border-radius: 10px;
//         }

//         .custom-scrollbar::-webkit-scrollbar-thumb {
//           background: rgba(255, 255, 255, 0.3);
//           border-radius: 10px;
//         }

//         .custom-scrollbar::-webkit-scrollbar-thumb:hover {
//           background: rgba(255, 255, 255, 0.5);
//         }

//         .line-clamp-1 {
//           display: -webkit-box;
//           -webkit-line-clamp: 1;
//           -webkit-box-orient: vertical;
//           overflow: hidden;
//         }

//         .line-clamp-2 {
//           display: -webkit-box;
//           -webkit-line-clamp: 2;
//           -webkit-box-orient: vertical;
//           overflow: hidden;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default PreviousEvents;