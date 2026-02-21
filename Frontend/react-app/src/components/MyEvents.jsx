import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Calendar,
  MapPin,
  Users,
  User,
  Clock,
  Target,
  Globe,
  Lock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  CalendarClock,
  Map,
  Radio,
  Sparkles,
  Trophy,
  TrendingUp,
  Star,
  BookOpen,
  Coffee,
  Music,
  Code,
  Camera,
  Heart,
  Zap,
  Filter,
  ChevronDown,
  Search,
  Bell,
  Gift,
  Award,
} from "lucide-react";

const MyEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState("");
  const [targetTypes, setTargetTypes] = useState([]);
  const [selectedTarget, setSelectedTarget] = useState("GLOBAL");
  const [userDept, setUserDept] = useState("");
  const [deptId, setDeptId] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [filterType, setFilterType] = useState("GLOBAL");
  const [userClubs, setUserClubs] = useState([]);
  const [selectedClubId, setSelectedClubId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("date"); // 'date', 'popularity', 'enrollment'

  // Animation styles
  const animations = {
    fadeIn: "animate-[fadeIn_0.5s_ease-in-out]",
    slideUp: "animate-[slideUp_0.5s_ease-out]",
    pulse: "animate-pulse",
    bounce: "animate-bounce",
    gradient: "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600",
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

    fetchTargetTypes(token);
    fetchUserProfile(token);
    fetchDepartments(token);
    fetchUserClubs(token);
    fetchEvents(token, role, "GLOBAL");
  }, []);

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

  const fetchTargetTypes = async (token) => {
    try {
      const response = await axios.get(
        "http://localhost:8080/api/events/targetTypes",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data.success) {
        setTargetTypes(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching target types:", err);
    }
  };

  const fetchEvents = async (
    token,
    role,
    filter = "GLOBAL",
    targetId = null,
  ) => {
    try {
      setLoading(true);
      console.log("ROLE:", role, "FILTER:", filter, "TARGET ID:", targetId);

      let response;

      if (role === "SUPER_ADMIN") {
        response = await axios.get("http://localhost:8080/api/events", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      } else if (role === "USER" || role === "USERS") {
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
      } else if (role === "TEACHER" || role === "TEACHERS") {
        response = await axios.get(
          "http://localhost:8080/api/events/myEvents",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );
      }

      if (response && response.data && response.data.success) {
        setEvents(response.data.data);
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

  const handleTargetChange = async (e) => {
    const newTarget = e.target.value;
    setSelectedTarget(newTarget);
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    const role = user?.role || "user";

    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:8080/api/events/getByTargetType/${newTarget}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      if (response.data.success) {
        setEvents(response.data.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredEvents = () => {
    let filtered =
      userRole === "SUPER_ADMIN"
        ? events
        : events.filter(
            (event) => event.enrollmentStatus?.toUpperCase() !== "CLOSED",
          );

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (event) =>
          event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.organizer?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Apply sorting
    switch (sortBy) {
      case "date":
        filtered.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
        break;
      case "popularity":
        filtered.sort(
          (a, b) => (b.currEnrollments || 0) - (a.currEnrollments || 0),
        );
        break;
      case "enrollment":
        filtered.sort(
          (a, b) => (b.maxEnrollments || 0) - (a.maxEnrollments || 0),
        );
        break;
      default:
        break;
    }

    return filtered;
  };

  const handleFilterChange = async (newFilterType, targetId = null) => {
    setFilterType(newFilterType);
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    const role = user?.role || "user";

    if (newFilterType === "DEPARTMENT" && deptId) {
      await fetchEvents(token, role, "DEPARTMENT", deptId);
    } else if (newFilterType === "CLUB") {
      if (targetId) {
        setSelectedClubId(targetId);
        await fetchEvents(token, role, "CLUB", targetId);
      } else {
        setEvents([]);
      }
    } else {
      setSelectedClubId("");
      await fetchEvents(token, role, "GLOBAL");
    }
  };

  const getEnrollmentStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "open":
        return "bg-gradient-to-r from-green-400 to-emerald-500 text-white border-0 shadow-lg shadow-green-500/30";
      case "closed":
        return "bg-gradient-to-r from-red-400 to-rose-500 text-white border-0 shadow-lg shadow-red-500/30";
      case "pending":
        return "bg-gradient-to-r from-yellow-400 to-amber-500 text-white border-0 shadow-lg shadow-yellow-500/30";
      default:
        return "bg-gradient-to-r from-gray-400 to-gray-500 text-white border-0 shadow-lg shadow-gray-500/30";
    }
  };

  const getTargetTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "global":
        return <Globe className="w-4 h-4" />;
      case "club":
        return <Users className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
    }
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

  const isDeadlinePassed = (deadline) => {
    return new Date(deadline) < new Date();
  };

  const getDaysUntil = (date) => {
    const today = new Date();
    const eventDate = new Date(date);
    const diffTime = eventDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleRetry = () => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    const role = user?.role || "user";

    if (token) {
      fetchEvents(token, role);
    } else {
      setError("No authentication token found. Please login again.");
    }
  };

  const filteredEvents = getFilteredEvents();

  // Loading State
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
            Loading amazing events...
          </p>
          <p className="text-white/60 text-sm mt-2">
            Get ready for something special!
          </p>
        </div>
      </div>
    );
  }

  // Error State
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
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header with Gradient */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg">
              <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
              <span className="text-sm font-medium bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Discover Your Next Experience
              </span>
              <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
            </div>
          </div>

          <h1 className="text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Upcoming Events
            </span>
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Join exciting events, connect with amazing people, and create
            unforgettable memories
          </p>

          {/* Stats Cards */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="bg-white/80 backdrop-blur-sm px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center space-x-2">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-600">Role:</span>
                <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-sm font-semibold">
                  {userRole
                    ? userRole.charAt(0).toUpperCase() + userRole.slice(1)
                    : "User"}
                </span>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center space-x-2">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Calendar className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-gray-600">
                  Total Events:
                </span>
                <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-sm font-semibold">
                  {filteredEvents.length}
                </span>
              </div>
            </div>

            {userDept && (
              <div className="bg-white/80 backdrop-blur-sm px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center space-x-2">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Users className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">
                    Department:
                  </span>
                  <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-sm font-semibold">
                    {userDept}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 border border-white/20">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search events by title, description, or organizer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                />
              </div>

              {/* Filter Toggle and View Options */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 shadow-lg"
                >
                  <Filter className="w-5 h-5" />
                  <span>Filters</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-300 ${showFilters ? "rotate-180" : ""}`}
                  />
                </button>

                <div className="flex bg-gray-100 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                      viewMode === "grid"
                        ? "bg-white text-purple-600 shadow-md"
                        : "text-gray-600 hover:text-purple-600"
                    }`}
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                      viewMode === "list"
                        ? "bg-white text-purple-600 shadow-md"
                        : "text-gray-600 hover:text-purple-600"
                    }`}
                  >
                    List
                  </button>
                </div>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                >
                  <option value="date">Sort by Date</option>
                  <option value="popularity">Sort by Popularity</option>
                  <option value="enrollment">Sort by Capacity</option>
                </select>
              </div>
            </div>

            {/* Filter Options */}
            {showFilters && (userRole === "USER" || userRole === "USERS") && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm font-medium text-gray-600">
                    Filter by:
                  </span>

                  <button
                    onClick={() => handleFilterChange("GLOBAL")}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 ${
                      filterType === "GLOBAL"
                        ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg"
                        : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                    }`}
                  >
                    <Globe className="w-4 h-4" />
                    <span>Global Events</span>
                  </button>

                  {userDept && (
                    <button
                      onClick={() => handleFilterChange("DEPARTMENT")}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 ${
                        filterType === "DEPARTMENT"
                          ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
                          : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      <span>{userDept} Events</span>
                    </button>
                  )}

                  {/* Club Filter Dropdown */}
                  <div className="relative group">
                    <button
                      onClick={() => handleFilterChange("CLUB")}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 ${
                        filterType === "CLUB"
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                          : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                      }`}
                    >
                      <Target className="w-4 h-4" />
                      <span>Club Events</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>

                    {filterType === "CLUB" && (
                      <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 z-20 overflow-hidden animate-[slideDown_0.3s_ease-out]">
                        <div className="p-2">
                          <p className="text-xs font-semibold text-gray-500 px-3 py-2 uppercase tracking-wider">
                            Select a Club
                          </p>
                          {userClubs.length > 0 ? (
                            userClubs.map((club) => (
                              <button
                                key={club.clubId}
                                onClick={() =>
                                  handleFilterChange("CLUB", club.clubId)
                                }
                                className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-300 ${
                                  selectedClubId === club.clubId.toString()
                                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                                    : "hover:bg-gray-50 text-gray-700"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">
                                    {club.clubName}
                                  </span>
                                  <span
                                    className={`text-xs px-2 py-1 rounded-full ${
                                      selectedClubId === club.clubId.toString()
                                        ? "bg-white/20 text-white"
                                        : "bg-gray-200 text-gray-700"
                                    }`}
                                  >
                                    {club.memberCount}
                                  </span>
                                </div>
                                {club.desc && (
                                  <p className="text-xs mt-1 opacity-80 line-clamp-1">
                                    {club.desc}
                                  </p>
                                )}
                              </button>
                            ))
                          ) : (
                            <div className="px-3 py-6 text-center">
                              <p className="text-sm text-gray-500">
                                You are not a member of any clubs yet.
                              </p>
                              <button className="mt-2 text-sm text-purple-600 hover:text-purple-700 font-medium">
                                Browse Clubs
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Events Grid/List */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 max-w-md mx-auto border border-white/20">
              <div className="relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 animate-ping"></div>
                </div>
                <Calendar className="w-20 h-20 text-gray-400 mx-auto mb-4 relative z-10" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                No Events Found
              </h3>
              <p className="text-gray-600 mb-6">
                There are no events available at the moment. Check back later
                for exciting new events!
              </p>
              <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg">
                Notify Me When New Events Arrive
              </button>
            </div>
          </div>
        ) : (
          <div
            className={`grid ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"} gap-6`}
          >
            {filteredEvents.map((event, index) => {
              const daysUntil = getDaysUntil(event.dateTime);
              const categoryColor = getCategoryColor(event.title);
              const categoryIcon = getEventCategoryIcon(event.title);
              const enrollmentPercentage =
                (event.currEnrollments / event.maxEnrollments) * 100;

              return (
                <div
                  key={event.eventId}
                  className={`group bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-white/20 ${animations.fadeIn}`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Event Header with Gradient */}
                  <div
                    className={`relative h-48 bg-gradient-to-r ${categoryColor} p-6 overflow-hidden`}
                  >
                    {/* Animated Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute -top-12 -right-12 w-24 h-24 bg-white rounded-full"></div>
                      <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-white rounded-full"></div>
                    </div>

                    {/* Category Icon */}
                    <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                      {categoryIcon}
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      <span
                        className={`px-4 py-2 rounded-full text-xs font-semibold border-0 shadow-lg ${getEnrollmentStatusColor(event.enrollmentStatus)}`}
                      >
                        {event.enrollmentStatus || "N/A"}
                      </span>
                    </div>

                    {/* Days Until Badge */}
                    {daysUntil > 0 && (
                      <div className="absolute bottom-4 left-4 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                        <span className="text-white font-semibold">
                          {daysUntil} days to go
                        </span>
                      </div>
                    )}

                    {/* Title */}
                    <div className="absolute bottom-4 right-4 text-right">
                      <h3 className="text-2xl font-bold text-white mb-1 line-clamp-2">
                        {event.title}
                      </h3>
                      <p className="text-sm text-white/80 line-clamp-1">
                        {event.description}
                      </p>
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="p-6 space-y-4">
                    {/* Quick Info Badges */}
                    <div className="flex flex-wrap gap-2">
                      <div className="bg-blue-50 px-3 py-1 rounded-full text-xs font-medium text-blue-600 flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDateTime(event.dateTime)}
                      </div>
                      <div className="bg-green-50 px-3 py-1 rounded-full text-xs font-medium text-green-600 flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {event.venue}
                      </div>
                    </div>

                    {/* Organizer and Speaker */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 p-3 rounded-xl">
                        <p className="text-xs text-gray-500 mb-1">Organizer</p>
                        <p className="text-sm font-semibold text-gray-800 flex items-center">
                          <User className="w-4 h-4 mr-1 text-blue-500" />
                          {event.organizer}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-xl">
                        <p className="text-xs text-gray-500 mb-1">Speaker</p>
                        <p className="text-sm font-semibold text-gray-800 flex items-center">
                          <Star className="w-4 h-4 mr-1 text-yellow-500" />
                          {event.speakerName}
                        </p>
                      </div>
                    </div>

                    {/* Enrollment Progress */}
                    {userRole === "SUPER_ADMIN" && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-600 flex items-center">
                            <Users className="w-4 h-4 mr-1 text-purple-500" />
                            Enrollment Progress
                          </span>
                          <span className="text-sm font-bold text-gray-800">
                            {event.currEnrollments}/{event.maxEnrollments}
                          </span>
                        </div>
                        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500`}
                            style={{ width: `${enrollmentPercentage}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 text-right">
                          {Math.round(enrollmentPercentage)}% filled
                        </p>
                      </div>
                    )}

                    {/* Additional Info */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-1 text-yellow-500" />
                        <span>
                          Deadline:{" "}
                          {new Date(
                            event.enrollmentDeadline,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        {getTargetTypeIcon(event.targetType)}
                        <span className="ml-1">
                          Target: {event.targetType || "N/A"}
                        </span>
                      </div>
                    </div>

                    {/* Location Info */}
                    {event.latitude && event.longitude && (
                      <div className="bg-blue-50 p-3 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Map className="w-4 h-4 text-blue-500 mr-2" />
                            <span className="text-sm text-blue-700">
                              Location verified
                            </span>
                          </div>
                          <span className="text-xs text-blue-600">
                            {event.radiusInMeters}m radius
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
                          <span
                            className={`text-xs font-medium px-3 py-1 rounded-full ${
                              event.completed
                                ? "bg-gray-100 text-gray-600"
                                : "bg-green-100 text-green-600"
                            }`}
                          >
                            {event.completed ? "Completed" : "Upcoming"}
                          </span>
                        </div>

                        {event.enrollmentStatus === "OPEN" &&
                          !event.completed && (
                            <button className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2.5 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                              <span className="relative z-10">Enroll Now</span>
                              <div className="absolute inset-0 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left opacity-20"></div>
                            </button>
                          )}
                      </div>
                    </div>

                    {/* Hover Effect Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-2 text-gray-500 text-sm">
            <Bell className="w-4 h-4" />
            <span>Stay tuned for more exciting events!</span>
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

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
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
      `}</style>
    </div>
  );
};

export default MyEvents;
