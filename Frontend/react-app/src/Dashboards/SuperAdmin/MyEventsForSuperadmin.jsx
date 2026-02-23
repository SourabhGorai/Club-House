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
  Settings,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Download,
  Printer,
  Share2,
  Plus,
  Briefcase,
  X,
} from "lucide-react";

const MyEventsForSuperadmin = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("date");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedClub, setSelectedClub] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [departments, setDepartments] = useState([]);
  const [clubs, setClubs] = useState([]);
  const navigate = useNavigate();

  // Animation styles
  const animations = {
    fadeIn: "animate-[fadeIn_0.5s_ease-in-out]",
    slideUp: "animate-[slideUp_0.5s_ease-out]",
    pulse: "animate-pulse",
    bounce: "animate-bounce",
    gradient: "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600",
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    const role = user?.role;

    if (role !== "SUPER_ADMIN") {
      setError("Access denied. This page is only for Super Admins.");
      setLoading(false);
      return;
    }

    if (!token) {
      setError("No authentication token found. Please login again.");
      setLoading(false);
      return;
    }

    fetchDepartments(token);
    fetchAllClubs(token);
    fetchAllEvents(token);
  }, []);

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

  const fetchAllEvents = async (token) => {
    try {
      setLoading(true);

      const response = await axios.get("http://localhost:8080/api/events", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

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

    // Apply department filter
    if (selectedDepartment !== "all") {
      filtered = filtered.filter((event) => {
        if (
          event.targetType?.toUpperCase() === "DEPARTMENT" &&
          event.targetIds
        ) {
          return event.targetIds.includes(parseInt(selectedDepartment));
        }
        return false;
      });
    }

    // Apply club filter
    if (selectedClub !== "all") {
      filtered = filtered.filter((event) => {
        if (event.targetType?.toUpperCase() === "CLUB" && event.targetIds) {
          return event.targetIds.includes(parseInt(selectedClub));
        }
        return false;
      });
    }

    // Apply status filter
    if (selectedStatus !== "all") {
      filtered = filtered.filter(
        (event) =>
          event.enrollmentStatus?.toLowerCase() ===
          selectedStatus.toLowerCase(),
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

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`http://localhost:8080/api/events/${eventId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        fetchAllEvents(token);
      } catch (err) {
        console.error("Error deleting event:", err);
        alert("Failed to delete event");
      }
    }
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedDepartment("all");
    setSelectedClub("all");
    setSelectedStatus("all");
  };

  const removeDepartmentFilter = () => {
    setSelectedDepartment("all");
  };

  const removeClubFilter = () => {
    setSelectedClub("all");
  };

  const removeStatusFilter = () => {
    setSelectedStatus("all");
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

  const handleRetry = () => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchAllEvents(token);
    } else {
      setError("No authentication token found. Please login again.");
    }
  };

  const filteredEvents = getFilteredEvents();

  // Calculate statistics
  const totalEvents = events.length;
  const openEvents = events.filter(
    (e) => e.enrollmentStatus?.toLowerCase() === "open",
  ).length;
  const closedEvents = events.filter(
    (e) => e.enrollmentStatus?.toLowerCase() === "closed",
  ).length;
  const totalEnrollments = events.reduce(
    (sum, e) => sum + (e.currEnrollments || 0),
    0,
  );

  // Target type statistics
  const departmentEvents = events.filter(
    (e) => e.targetType?.toUpperCase() === "DEPARTMENT",
  ).length;
  const clubEvents = events.filter(
    (e) => e.targetType?.toUpperCase() === "CLUB",
  ).length;
  const globalEvents = events.filter(
    (e) => e.targetType?.toUpperCase() === "GLOBAL",
  ).length;

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
            Loading admin dashboard...
          </p>
          <p className="text-white/60 text-sm mt-2">Managing events for you</p>
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
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
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

      <div className="relative max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header with Back Button - Same as ClubAdminsManagement */}
        <div className="mb-8 flex items-center gap-6">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-3 border border-white/20 hover:border-white/40 font-medium rounded-full py-2.5 px-5 transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer"
            style={{
              background: "rgba(255,255,255,0.7)",
              backdropFilter: "blur(8px)",
              color: "#4CA1AF",
            }}
          >
            <div
              className="flex items-center justify-center w-6 h-6 rounded-full transition-all duration-300 group-hover:scale-110"
              style={{ backgroundColor: "rgba(76, 161, 175, 0.1)" }}
            >
              <svg
                className="w-3.5 h-3.5"
                style={{ color: "#4CA1AF" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </div>
          </button>

          <div>
            <h1 className="text-5xl font-bold mb-4">
              <span
                className="bg-clip-text text-transparent"
                style={{
                  background: "linear-gradient(135deg, #4CA1AF, #2C3E50)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Event Management
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl">
              Monitor, manage, and analyze all events across the platform
            </p>
          </div>
        </div>

        {/* Admin Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-5xl mx-auto mb-6">
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Events</p>
                <p className="text-3xl font-bold text-gray-800">
                  {totalEvents}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Open Events</p>
                <p className="text-3xl font-bold text-green-600">
                  {openEvents}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Closed Events</p>
                <p className="text-3xl font-bold text-red-600">
                  {closedEvents}
                </p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Enrollments</p>
                <p className="text-3xl font-bold text-purple-600">
                  {totalEnrollments}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Target Type Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-8">
          <div className="bg-blue-50/80 backdrop-blur-sm p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Globe className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-gray-600">
                  Global
                </span>
              </div>
              <span className="text-xl font-bold text-blue-600">
                {globalEvents}
              </span>
            </div>
          </div>
          <div className="bg-purple-50/80 backdrop-blur-sm p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Users className="w-5 h-5 text-purple-600 mr-2" />
                <span className="text-sm font-medium text-gray-600">
                  Club
                </span>
              </div>
              <span className="text-xl font-bold text-purple-600">
                {clubEvents}
              </span>
            </div>
          </div>
          <div className="bg-green-50/80 backdrop-blur-sm p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Briefcase className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-sm font-medium text-gray-600">
                  Department
                </span>
              </div>
              <span className="text-xl font-bold text-green-600">
                {departmentEvents}
              </span>
            </div>
          </div>
        </div>

        {/* Admin Actions Bar */}
        <div className="mb-6 flex justify-end space-x-3">
          <button
            className="px-4 py-2 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
            style={{
              background: "linear-gradient(135deg, #4CA1AF, #2C3E50)",
            }}
            onClick={() => navigate("/create-event")}
          >
            <Plus className="w-4 h-4" />
            <span>Create Event</span>
          </button>
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
                  placeholder="Search events by title, description, organizer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                />
              </div>

              {/* Filter Toggle and View Options */}
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
                  <option value="date">Sort by Date</option>
                  <option value="popularity">Sort by Popularity</option>
                  <option value="enrollment">Sort by Capacity</option>
                </select>
              </div>
            </div>

            {/* Active Filters Display */}
            {(selectedDepartment !== "all" ||
              selectedClub !== "all" ||
              selectedStatus !== "all") && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-gray-600 mr-2">
                    Active Filters:
                  </span>

                  {selectedDepartment !== "all" && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center">
                      Dept:{" "}
                      {departments.find(
                        (d) => d.departmentId === parseInt(selectedDepartment),
                      )?.name || selectedDepartment}
                      <button
                        onClick={removeDepartmentFilter}
                        className="ml-2 hover:text-green-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {selectedClub !== "all" && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center">
                      Club:{" "}
                      {clubs.find((c) => c.clubId === parseInt(selectedClub))
                        ?.clubName || selectedClub}
                      <button
                        onClick={removeClubFilter}
                        className="ml-2 hover:text-purple-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {selectedStatus !== "all" && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center">
                      Enrollment Status: {selectedStatus}
                      <button
                        onClick={removeStatusFilter}
                        className="ml-2 hover:text-blue-900"
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department
                    </label>
                    <select
                      value={selectedDepartment}
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200"
                    >
                      <option value="all">All Departments</option>
                      {departments.map((dept) => {
                        const count = events.filter(
                          (event) =>
                            event.targetType?.toUpperCase() === "DEPARTMENT" &&
                            event.targetIds?.includes(dept.departmentId),
                        ).length;

                        return (
                          <option
                            key={dept.departmentId}
                            value={dept.departmentId}
                          >
                            {dept.name} ({count} events)
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Club
                    </label>
                    <select
                      value={selectedClub}
                      onChange={(e) => setSelectedClub(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200"
                    >
                      <option value="all">All Clubs</option>
                      {clubs.map((club) => {
                        const count = events.filter(
                          (event) =>
                            event.targetType?.toUpperCase() === "CLUB" &&
                            event.targetIds?.includes(club.clubId),
                        ).length;

                        return (
                          <option key={club.clubId} value={club.clubId}>
                            {club.clubName} ({count} events)
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200"
                    >
                      <option value="all">All Status</option>
                      <option value="open">Open</option>
                      <option value="closed">Closed</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    onClick={clearAllFilters}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Apply Filters
                  </button>
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
            <span className="font-semibold">{events.length}</span> events
          </p>
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
                There are no events matching your criteria.
              </p>
              <button
                onClick={clearAllFilters}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div 
              className={`
                grid gap-4 w-full
                ${filteredEvents.length === 1 
                  ? 'grid-cols-1 md:grid-cols-1 lg:grid-cols-1 max-w-sm mx-auto' 
                  : filteredEvents.length === 2 
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2 max-w-2xl mx-auto' 
                    : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                }
              `}
            >
              {filteredEvents.map((event, index) => {
                const daysUntil = getDaysUntil(event.dateTime);
                const categoryColor = getCategoryColor(event.title);
                const categoryIcon = getEventCategoryIcon(event.title);
                const enrollmentPercentage =
                  (event.currEnrollments / event.maxEnrollments) * 100;
                const targetTypeColor = getTargetTypeColor(event.targetType);

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

                          {daysUntil > 0 && (
                            <div className="absolute top-2 left-2 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                              <span className="text-white text-xs font-semibold">
                                {daysUntil} days to go
                              </span>
                            </div>
                          )}

                          {/* Status Badge - Top Right */}
                          <div className="absolute top-2 right-2">
                            <span
                              className={`text-[10px] font-medium px-2 py-1 rounded-full ${
                                event.completed
                                  ? "bg-gray-100 text-gray-600"
                                  : "bg-green-100 text-green-600"
                              }`}
                            >
                              {event.completed ? "Completed" : "Upcoming"}
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

                          {/* Organizer and Creator Info - Compact */}
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
                                Created By
                              </p>
                              <p className="text-xs font-semibold text-gray-800 flex items-center truncate">
                                <Star className="w-3 h-3 mr-0.5 text-yellow-500 flex-shrink-0" />
                                <span className="truncate">
                                  {event.creatorName}
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
                          background: "linear-gradient(135deg, #4CA1AF, #2C3E50)",
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
                                    Enrollment Deadline
                                  </p>
                                </div>
                                <p className="text-xs font-medium text-white">
                                  {new Date(
                                    event.enrollmentDeadline,
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            </div>

                            {/* Target Info - Compact */}
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

                            {/* Enrollment Info - Compact */}
                            <div
                              className="p-1.5 rounded-lg"
                              style={{
                                backgroundColor: "rgba(255, 255, 255, 0.1)",
                              }}
                            >
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-[10px] text-white/80">
                                  Enrollment
                                </span>
                                <span className="text-xs text-white">
                                  {event.currEnrollments}/{event.maxEnrollments}
                                </span>
                              </div>
                              <div
                                className="w-full h-1.5 rounded-full overflow-hidden"
                                style={{
                                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                                }}
                              >
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${enrollmentPercentage}%`,
                                    backgroundColor: "#4CA1AF",
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>

                          {/* Status Badges - Compact */}
                          <div className="mt-2 pt-1 border-t border-white/20 flex items-center justify-between">
                            {/* Enrollment Status */}
                            <div className="flex items-center gap-1">
                              <span className="text-[9px] text-white/60 font-medium">
                                Enrollment Status:
                              </span>

                              <span
                                className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${
                                  event.enrollmentStatus?.toLowerCase() === "open"
                                    ? "bg-green-500/30 text-green-100"
                                    : event.enrollmentStatus?.toLowerCase() ===
                                        "closed"
                                      ? "bg-red-500/30 text-red-100"
                                      : "bg-yellow-500/30 text-yellow-100"
                                }`}
                              >
                                {event.enrollmentStatus || "N/A"}
                              </span>
                            </div>

                            {/* Event Completion Status */}
                            <span
                              className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${
                                event.completed
                                  ? "bg-gray-500/30 text-gray-100"
                                  : "bg-blue-500/30 text-blue-100"
                              }`}
                            >
                              {event.completed ? "Done" : "Upcoming"}
                            </span>
                          </div>

                          {/* Admin Actions - Compact */}
                          <div className="mt-1.5 flex gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/edit-event/${event.eventId}`);
                              }}
                              className="flex-1 px-1.5 py-1 rounded-lg text-[10px] font-medium transition flex items-center justify-center text-white"
                              style={{
                                backgroundColor: "rgba(255, 255, 255, 0.2)",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "rgba(255, 255, 255, 0.3)")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "rgba(255, 255, 255, 0.2)")
                              }
                            >
                              <Edit className="w-2.5 h-2.5 mr-0.5" />
                              Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteEvent(event.eventId);
                              }}
                              className="flex-1 px-1.5 py-1 rounded-lg text-[10px] font-medium transition flex items-center justify-center text-white"
                              style={{
                                backgroundColor: "rgba(239, 68, 68, 0.5)",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "rgba(239, 68, 68, 0.6)")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "rgba(239, 68, 68, 0.5)")
                              }
                            >
                              <Trash2 className="w-2.5 h-2.5 mr-0.5" />
                              Del
                            </button>
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
            <Settings className="w-4 h-4" />
            <span>
              Admin controls active • {filteredEvents.length} events displayed
            </span>
            <Share2 className="w-4 h-4" />
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

        /* Flip Card Styles */
        .event-card-container {
          perspective: 1000px;
          height: 280px;
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

        /* Line clamp utilities */
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

export default MyEventsForSuperadmin;





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
//   Lock,
//   AlertCircle,
//   CheckCircle,
//   XCircle,
//   Loader2,
//   CalendarClock,
//   Map,
//   Radio,
//   Sparkles,
//   Trophy,
//   TrendingUp,
//   Star,
//   BookOpen,
//   Coffee,
//   Music,
//   Code,
//   Camera,
//   Heart,
//   Zap,
//   Filter,
//   ChevronDown,
//   Search,
//   Bell,
//   Gift,
//   Award,
//   Settings,
//   Eye,
//   Edit,
//   Trash2,
//   MoreVertical,
//   Download,
//   Printer,
//   Share2,
//   Plus,
//   Briefcase,
//   X,
// } from "lucide-react";

// const MyEventsForSuperadmin = () => {
//   const [events, setEvents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [viewMode, setViewMode] = useState("grid");
//   const [showFilters, setShowFilters] = useState(false);
//   const [sortBy, setSortBy] = useState("date");
//   const [selectedDepartment, setSelectedDepartment] = useState("all");
//   const [selectedClub, setSelectedClub] = useState("all");
//   const [selectedStatus, setSelectedStatus] = useState("all");
//   const [departments, setDepartments] = useState([]);
//   const [clubs, setClubs] = useState([]);
//   const navigate = useNavigate();

//   // Animation styles
//   const animations = {
//     fadeIn: "animate-[fadeIn_0.5s_ease-in-out]",
//     slideUp: "animate-[slideUp_0.5s_ease-out]",
//     pulse: "animate-pulse",
//     bounce: "animate-bounce",
//     gradient: "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600",
//   };

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     const user = JSON.parse(localStorage.getItem("user"));
//     const role = user?.role;

//     if (role !== "SUPER_ADMIN") {
//       setError("Access denied. This page is only for Super Admins.");
//       setLoading(false);
//       return;
//     }

//     if (!token) {
//       setError("No authentication token found. Please login again.");
//       setLoading(false);
//       return;
//     }

//     fetchDepartments(token);
//     fetchAllClubs(token);
//     fetchAllEvents(token);
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

//   const fetchAllEvents = async (token) => {
//     try {
//       setLoading(true);

//       const response = await axios.get("http://localhost:8080/api/events", {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       });

//       if (response && response.data && response.data.success) {
//         setEvents(response.data.data);
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

//     // Apply department filter
//     if (selectedDepartment !== "all") {
//       filtered = filtered.filter((event) => {
//         if (
//           event.targetType?.toUpperCase() === "DEPARTMENT" &&
//           event.targetIds
//         ) {
//           return event.targetIds.includes(parseInt(selectedDepartment));
//         }
//         return false;
//       });
//     }

//     // Apply club filter
//     if (selectedClub !== "all") {
//       filtered = filtered.filter((event) => {
//         if (event.targetType?.toUpperCase() === "CLUB" && event.targetIds) {
//           return event.targetIds.includes(parseInt(selectedClub));
//         }
//         return false;
//       });
//     }

//     // Apply status filter
//     if (selectedStatus !== "all") {
//       filtered = filtered.filter(
//         (event) =>
//           event.enrollmentStatus?.toLowerCase() ===
//           selectedStatus.toLowerCase(),
//       );
//     }

//     // Apply sorting
//     switch (sortBy) {
//       case "date":
//         filtered.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
//         break;
//       case "popularity":
//         filtered.sort(
//           (a, b) => (b.currEnrollments || 0) - (a.currEnrollments || 0),
//         );
//         break;
//       case "enrollment":
//         filtered.sort(
//           (a, b) => (b.maxEnrollments || 0) - (a.maxEnrollments || 0),
//         );
//         break;
//       default:
//         break;
//     }

//     return filtered;
//   };

//   const handleDeleteEvent = async (eventId) => {
//     if (window.confirm("Are you sure you want to delete this event?")) {
//       try {
//         const token = localStorage.getItem("token");
//         await axios.delete(`http://localhost:8080/api/events/${eventId}`, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         });
//         fetchAllEvents(token);
//       } catch (err) {
//         console.error("Error deleting event:", err);
//         alert("Failed to delete event");
//       }
//     }
//   };

//   const clearAllFilters = () => {
//     setSearchTerm("");
//     setSelectedDepartment("all");
//     setSelectedClub("all");
//     setSelectedStatus("all");
//   };

//   const removeDepartmentFilter = () => {
//     setSelectedDepartment("all");
//   };

//   const removeClubFilter = () => {
//     setSelectedClub("all");
//   };

//   const removeStatusFilter = () => {
//     setSelectedStatus("all");
//   };

//   const getEnrollmentStatusColor = (status) => {
//     switch (status?.toLowerCase()) {
//       case "open":
//         return "bg-gradient-to-r from-green-400 to-emerald-500 text-white border-0 shadow-lg shadow-green-500/30";
//       case "closed":
//         return "bg-gradient-to-r from-red-400 to-rose-500 text-white border-0 shadow-lg shadow-red-500/30";
//       case "pending":
//         return "bg-gradient-to-r from-yellow-400 to-amber-500 text-white border-0 shadow-lg shadow-yellow-500/30";
//       default:
//         return "bg-gradient-to-r from-gray-400 to-gray-500 text-white border-0 shadow-lg shadow-gray-500/30";
//     }
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

//   const handleRetry = () => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       fetchAllEvents(token);
//     } else {
//       setError("No authentication token found. Please login again.");
//     }
//   };

//   const filteredEvents = getFilteredEvents();

//   // Calculate statistics
//   const totalEvents = events.length;
//   const openEvents = events.filter(
//     (e) => e.enrollmentStatus?.toLowerCase() === "open",
//   ).length;
//   const closedEvents = events.filter(
//     (e) => e.enrollmentStatus?.toLowerCase() === "closed",
//   ).length;
//   const totalEnrollments = events.reduce(
//     (sum, e) => sum + (e.currEnrollments || 0),
//     0,
//   );

//   // Target type statistics
//   const departmentEvents = events.filter(
//     (e) => e.targetType?.toUpperCase() === "DEPARTMENT",
//   ).length;
//   const clubEvents = events.filter(
//     (e) => e.targetType?.toUpperCase() === "CLUB",
//   ).length;
//   const globalEvents = events.filter(
//     (e) => e.targetType?.toUpperCase() === "GLOBAL",
//   ).length;

//   // Loading State
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
//             Loading admin dashboard...
//           </p>
//           <p className="text-white/60 text-sm mt-2">Managing events for you</p>
//         </div>
//       </div>
//     );
//   }

//   // Error State
//   if (error) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
//         <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 max-w-md w-full text-center border border-white/20">
//           <div className="bg-red-500/20 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
//             <AlertCircle className="w-12 h-12 text-red-400" />
//           </div>
//           <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
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
//         {/* Header with Admin Badge */}
//         <div className="text-center mb-12">
//           {/* <div className="inline-block mb-4">
//             <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg flex items-center">
//               <Award className="w-4 h-4 mr-2" />
//               SUPER ADMIN DASHBOARD
//             </span>
//           </div> */}

//           <h1 className="text-5xl font-bold mb-4">
//             <span
//               className="bg-clip-text text-transparent"
//               style={{
//                 background: "linear-gradient(135deg, #4CA1AF, #2C3E50)",
//                 WebkitBackgroundClip: "text",
//                 WebkitTextFillColor: "transparent",
//               }}
//             >
//               Event Management
//             </span>
//           </h1>

//           <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
//             Monitor, manage, and analyze all events across the platform
//           </p>

//           {/* Admin Stats Cards */}
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-5xl mx-auto mb-6">
//             <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-600">Total Events</p>
//                   <p className="text-3xl font-bold text-gray-800">
//                     {totalEvents}
//                   </p>
//                 </div>
//                 <div className="bg-blue-100 p-3 rounded-lg">
//                   <Calendar className="w-6 h-6 text-blue-600" />
//                 </div>
//               </div>
//             </div>

//             <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-600">Open Events</p>
//                   <p className="text-3xl font-bold text-green-600">
//                     {openEvents}
//                   </p>
//                 </div>
//                 <div className="bg-green-100 p-3 rounded-lg">
//                   <CheckCircle className="w-6 h-6 text-green-600" />
//                 </div>
//               </div>
//             </div>

//             <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-600">Closed Events</p>
//                   <p className="text-3xl font-bold text-red-600">
//                     {closedEvents}
//                   </p>
//                 </div>
//                 <div className="bg-red-100 p-3 rounded-lg">
//                   <XCircle className="w-6 h-6 text-red-600" />
//                 </div>
//               </div>
//             </div>

//             <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-600">Total Enrollments</p>
//                   <p className="text-3xl font-bold text-purple-600">
//                     {totalEnrollments}
//                   </p>
//                 </div>
//                 <div className="bg-purple-100 p-3 rounded-lg">
//                   <Users className="w-6 h-6 text-purple-600" />
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Target Type Stats */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
//             <div className="bg-blue-50/80 backdrop-blur-sm p-4 rounded-xl">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center">
//                   <Globe className="w-5 h-5 text-blue-600 mr-2" />
//                   <span className="text-sm font-medium text-gray-600">
//                     Global
//                   </span>
//                 </div>
//                 <span className="text-xl font-bold text-blue-600">
//                   {globalEvents}
//                 </span>
//               </div>
//             </div>
//             <div className="bg-purple-50/80 backdrop-blur-sm p-4 rounded-xl">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center">
//                   <Users className="w-5 h-5 text-purple-600 mr-2" />
//                   <span className="text-sm font-medium text-gray-600">
//                     Club
//                   </span>
//                 </div>
//                 <span className="text-xl font-bold text-purple-600">
//                   {clubEvents}
//                 </span>
//               </div>
//             </div>
//             <div className="bg-green-50/80 backdrop-blur-sm p-4 rounded-xl">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center">
//                   <Briefcase className="w-5 h-5 text-green-600 mr-2" />
//                   <span className="text-sm font-medium text-gray-600">
//                     Department
//                   </span>
//                 </div>
//                 <span className="text-xl font-bold text-green-600">
//                   {departmentEvents}
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Admin Actions Bar */}
//         <div className="mb-6 flex justify-end space-x-3">
//           <button
//             className="px-4 py-2 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
//             style={{
//               background: "linear-gradient(135deg, #4CA1AF, #2C3E50)",
//             }}
//             onClick={() => navigate("/create-event")}
//           >
//             <Plus className="w-4 h-4" />
//             <span>Create Event</span>
//           </button>
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
//                   placeholder="Search events by title, description, organizer..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all duration-300 bg-white/50 backdrop-blur-sm"
//                 />
//               </div>

//               {/* Filter Toggle and View Options */}
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
//                   <option value="date">Sort by Date</option>
//                   <option value="popularity">Sort by Popularity</option>
//                   <option value="enrollment">Sort by Capacity</option>
//                 </select>
//               </div>
//             </div>

//             {/* Active Filters Display */}
//             {(selectedDepartment !== "all" ||
//               selectedClub !== "all" ||
//               selectedStatus !== "all") && (
//               <div className="mt-4 pt-4 border-t border-gray-200">
//                 <div className="flex flex-wrap items-center gap-2">
//                   <span className="text-sm font-medium text-gray-600 mr-2">
//                     Active Filters:
//                   </span>

//                   {selectedDepartment !== "all" && (
//                     <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center">
//                       Dept:{" "}
//                       {departments.find(
//                         (d) => d.departmentId === parseInt(selectedDepartment),
//                       )?.name || selectedDepartment}
//                       <button
//                         onClick={removeDepartmentFilter}
//                         className="ml-2 hover:text-green-900"
//                       >
//                         <X className="w-3 h-3" />
//                       </button>
//                     </span>
//                   )}

//                   {selectedClub !== "all" && (
//                     <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center">
//                       Club:{" "}
//                       {clubs.find((c) => c.clubId === parseInt(selectedClub))
//                         ?.clubName || selectedClub}
//                       <button
//                         onClick={removeClubFilter}
//                         className="ml-2 hover:text-purple-900"
//                       >
//                         <X className="w-3 h-3" />
//                       </button>
//                     </span>
//                   )}

//                   {selectedStatus !== "all" && (
//                     <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center">
//                       Enrollment Status: {selectedStatus}
//                       <button
//                         onClick={removeStatusFilter}
//                         className="ml-2 hover:text-blue-900"
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
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Department
//                     </label>
//                     <select
//                       value={selectedDepartment}
//                       onChange={(e) => setSelectedDepartment(e.target.value)}
//                       className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200"
//                     >
//                       <option value="all">All Departments</option>
//                       {departments.map((dept) => {
//                         const count = events.filter(
//                           (event) =>
//                             event.targetType?.toUpperCase() === "DEPARTMENT" &&
//                             event.targetIds?.includes(dept.departmentId),
//                         ).length;

//                         return (
//                           <option
//                             key={dept.departmentId}
//                             value={dept.departmentId}
//                           >
//                             {dept.name} ({count} events)
//                           </option>
//                         );
//                       })}
//                     </select>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Club
//                     </label>
//                     <select
//                       value={selectedClub}
//                       onChange={(e) => setSelectedClub(e.target.value)}
//                       className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200"
//                     >
//                       <option value="all">All Clubs</option>
//                       {clubs.map((club) => {
//                         const count = events.filter(
//                           (event) =>
//                             event.targetType?.toUpperCase() === "CLUB" &&
//                             event.targetIds?.includes(club.clubId),
//                         ).length;

//                         return (
//                           <option key={club.clubId} value={club.clubId}>
//                             {club.clubName} ({count} events)
//                           </option>
//                         );
//                       })}
//                     </select>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Status
//                     </label>
//                     <select
//                       value={selectedStatus}
//                       onChange={(e) => setSelectedStatus(e.target.value)}
//                       className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200"
//                     >
//                       <option value="all">All Status</option>
//                       <option value="open">Open</option>
//                       <option value="closed">Closed</option>
//                       <option value="pending">Pending</option>
//                     </select>
//                   </div>
//                 </div>

//                 <div className="mt-4 flex justify-end space-x-2">
//                   <button
//                     onClick={clearAllFilters}
//                     className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
//                   >
//                     Clear All
//                   </button>
//                   <button
//                     onClick={() => setShowFilters(false)}
//                     className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
//                   >
//                     Apply Filters
//                   </button>
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
//             <span className="font-semibold">{events.length}</span> events
//           </p>
//         </div>

//         {/* Events Grid/List */}
// {/* Events Grid/List */}
// {filteredEvents.length === 0 ? (
//   <div className="text-center py-16">
//     <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 max-w-md mx-auto border border-white/20">
//       <div className="relative">
//         <div className="absolute inset-0 flex items-center justify-center">
//           <div className="w-32 h-32 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 animate-ping"></div>
//         </div>
//         <Calendar className="w-20 h-20 text-gray-400 mx-auto mb-4 relative z-10" />
//       </div>
//       <h3 className="text-2xl font-bold text-gray-800 mb-2">
//         No Events Found
//       </h3>
//       <p className="text-gray-600 mb-6">
//         There are no events matching your criteria.
//       </p>
//       <button
//         onClick={clearAllFilters}
//         className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
//       >
//         Clear All Filters
//       </button>
//     </div>
//   </div>
// ) : (
//   <div className="flex justify-center">
//     <div 
//       className={`
//         grid gap-4 w-full
//         ${filteredEvents.length === 1 
//           ? 'grid-cols-1 md:grid-cols-1 lg:grid-cols-1 max-w-sm mx-auto' 
//           : filteredEvents.length === 2 
//             ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2 max-w-2xl mx-auto' 
//             : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
//         }
//       `}
//     >
//       {filteredEvents.map((event, index) => {
//         const daysUntil = getDaysUntil(event.dateTime);
//         const categoryColor = getCategoryColor(event.title);
//         const categoryIcon = getEventCategoryIcon(event.title);
//         const enrollmentPercentage =
//           (event.currEnrollments / event.maxEnrollments) * 100;
//         const targetTypeColor = getTargetTypeColor(event.targetType);

//         return (
//           <div
//             key={event.eventId}
//             className={`event-card-container ${animations.fadeIn}`}
//             style={{ animationDelay: `${index * 100}ms` }}
//           >
//             <div className="event-card">
//               {/* Front of Card */}
//               <div className="card-face card-front bg-white/90 backdrop-blur-sm rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-500 border border-white/20">
//                 {/* Event Header with Primary Color Gradient */}
//                 <div
//                   className="relative h-32 p-3 overflow-hidden"
//                   style={{
//                     background:
//                       "linear-gradient(135deg, #4CA1AF, #2C3E50)",
//                   }}
//                 >
//                   {/* Animated Background Pattern */}
//                   <div className="absolute inset-0 opacity-10">
//                     <div className="absolute -top-12 -right-12 w-24 h-24 bg-white rounded-full"></div>
//                     <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-white rounded-full"></div>
//                   </div>

//                   {daysUntil > 0 && (
//                     <div className="absolute top-2 left-2 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
//                       <span className="text-white text-xs font-semibold">
//                         {daysUntil} days to go
//                       </span>
//                     </div>
//                   )}

//                   {/* Status Badge - Top Right */}
//                   <div className="absolute top-2 right-2">
//                     <span
//                       className={`text-[10px] font-medium px-2 py-1 rounded-full ${
//                         event.completed
//                           ? "bg-gray-100 text-gray-600"
//                           : "bg-green-100 text-green-600"
//                       }`}
//                     >
//                       {event.completed ? "Completed" : "Upcoming"}
//                     </span>
//                   </div>

//                   {/* Title */}
//                   <div className="absolute bottom-2 right-2 text-right">
//                     <h3 className="text-sm font-bold text-white mb-0.5 line-clamp-1">
//                       {event.title}
//                     </h3>
//                     <p className="text-[10px] text-white/80 line-clamp-1">
//                       {event.description}
//                     </p>
//                   </div>
//                 </div>

//                 {/* Quick Info Badges */}
//                 <div className="p-3 space-y-2">
//                   <div className="flex flex-wrap gap-1">
//                     <div className="bg-blue-50 px-2 py-0.5 rounded-full text-[10px] font-medium text-blue-600 flex items-center">
//                       <Calendar className="w-2.5 h-2.5 mr-1" />
//                       {formatDateTime(event.dateTime)}
//                     </div>
//                     <div className="bg-green-50 px-2 py-0.5 rounded-full text-[10px] font-medium text-green-600 flex items-center">
//                       <MapPin className="w-2.5 h-2.5 mr-1" />
//                       {event.venue}
//                     </div>
//                   </div>

//                   {/* Organizer and Creator Info - Compact */}
//                   <div className="grid grid-cols-2 gap-1">
//                     <div className="bg-gray-50 p-1.5 rounded-lg">
//                       <p className="text-[8px] text-gray-500">
//                         Organizer
//                       </p>
//                       <p className="text-xs font-semibold text-gray-800 flex items-center truncate">
//                         <User className="w-3 h-3 mr-0.5 text-blue-500 flex-shrink-0" />
//                         <span className="truncate">
//                           {event.organizer}
//                         </span>
//                       </p>
//                     </div>
//                     <div className="bg-gray-50 p-1.5 rounded-lg">
//                       <p className="text-[8px] text-gray-500">
//                         Created By
//                       </p>
//                       <p className="text-xs font-semibold text-gray-800 flex items-center truncate">
//                         <Star className="w-3 h-3 mr-0.5 text-yellow-500 flex-shrink-0" />
//                         <span className="truncate">
//                           {event.creatorName}
//                         </span>
//                       </p>
//                     </div>
//                   </div>

//                   {/* Target Type Badge */}
//                   <div className="flex items-center justify-between">
//                     <span
//                       className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${targetTypeColor} flex items-center`}
//                     >
//                       {getTargetTypeIcon(event.targetType)}
//                       <span className="ml-1 capitalize text-xs">
//                         {event.targetType || "N/A"}
//                       </span>
//                     </span>
//                   </div>

//                   {/* Flip Hint with Primary Color */}
//                   <div
//                     className="text-center text-[8px] mt-1 flex items-center justify-center"
//                     style={{ color: "#4CA1AF" }}
//                   >
//                     <span className="animate-pulse mr-1 text-[6px]">
//                       ●
//                     </span>
//                     Hover to view all details
//                   </div>
//                 </div>
//               </div>

//               {/* Back of Card - All Details with Primary Color */}
//               <div
//                 className="card-face card-back rounded-xl shadow-md overflow-hidden p-3"
//                 style={{
//                   background: "linear-gradient(135deg, #4CA1AF, #2C3E50)",
//                 }}
//               >
//                 <div className="h-full flex flex-col">
//                   <h3 className="text-sm font-bold mb-2 line-clamp-1 text-white">
//                     {event.title}
//                   </h3>

//                   <div className="space-y-1.5 overflow-y-auto flex-1 pr-1 custom-scrollbar text-xs">
//                     {/* Date & Time */}
//                     <div className="grid grid-cols-2 gap-1">
//                       <div
//                         className="p-1.5 rounded-lg"
//                         style={{
//                           backgroundColor: "rgba(255, 255, 255, 0.1)",
//                         }}
//                       >
//                         <div className="flex items-center mb-0.5">
//                           <Calendar className="w-3 h-3 mr-1 text-white/80" />
//                           <p className="text-[10px] text-white/80">
//                             Date
//                           </p>
//                         </div>
//                         <p className="text-xs font-medium text-white">
//                           {formatDateTime(event.dateTime)}
//                         </p>
//                       </div>
//                       <div
//                         className="p-1.5 rounded-lg"
//                         style={{
//                           backgroundColor: "rgba(255, 255, 255, 0.1)",
//                         }}
//                       >
//                         <div className="flex items-center mb-0.5">
//                           <Clock className="w-3 h-3 mr-1 text-white/80" />
//                           <p className="text-[10px] text-white/80">
//                             Enrollment Deadline
//                           </p>
//                         </div>
//                         <p className="text-xs font-medium text-white">
//                           {new Date(
//                             event.enrollmentDeadline,
//                           ).toLocaleDateString()}
//                         </p>
//                       </div>
//                     </div>

//                     {/* Target Info - Compact */}
//                     {event.targetType?.toUpperCase() === "DEPARTMENT" &&
//                       event.targetIds?.length > 0 && (
//                         <div
//                           className="p-1.5 rounded-lg"
//                           style={{
//                             backgroundColor: "rgba(255, 255, 255, 0.1)",
//                           }}
//                         >
//                           <p className="text-[10px] text-white/80 mb-1 flex items-center">
//                             <Briefcase className="w-2.5 h-2.5 mr-1" />
//                             Target Departments
//                           </p>
//                           <div className="flex flex-wrap gap-1 mt-1">
//                             {event.targetIds.map((id) => {
//                               const dept = departments.find(
//                                 (d) => d.departmentId === id,
//                               );
//                               return (
//                                 <span
//                                   key={id}
//                                   className="px-1.5 py-0.5 rounded text-[8px] font-medium text-white"
//                                   style={{
//                                     backgroundColor:
//                                       "rgba(255, 255, 255, 0.2)",
//                                   }}
//                                 >
//                                   {dept?.name || `ID: ${id}`}
//                                 </span>
//                               );
//                             })}
//                           </div>
//                         </div>
//                       )}

//                     {event.targetType?.toUpperCase() === "CLUB" &&
//                       event.targetIds?.length > 0 && (
//                         <div
//                           className="p-1.5 rounded-lg"
//                           style={{
//                             backgroundColor: "rgba(255, 255, 255, 0.1)",
//                           }}
//                         >
//                           <p className="text-[10px] text-white/80 mb-1 flex items-center">
//                             <Users className="w-2.5 h-2.5 mr-1" />
//                             Target Clubs
//                           </p>
//                           <div className="flex flex-wrap gap-1 mt-1">
//                             {event.targetIds.map((id) => {
//                               const club = clubs.find(
//                                 (c) => c.clubId === id,
//                               );
//                               return (
//                                 <span
//                                   key={id}
//                                   className="px-1.5 py-0.5 rounded text-[8px] font-medium text-white"
//                                   style={{
//                                     backgroundColor:
//                                       "rgba(255, 255, 255, 0.2)",
//                                   }}
//                                 >
//                                   {club?.clubName || `ID: ${id}`}
//                                 </span>
//                               );
//                             })}
//                           </div>
//                         </div>
//                       )}

//                     {/* Enrollment Info - Compact */}
//                     <div
//                       className="p-1.5 rounded-lg"
//                       style={{
//                         backgroundColor: "rgba(255, 255, 255, 0.1)",
//                       }}
//                     >
//                       <div className="flex justify-between items-center mb-1">
//                         <span className="text-[10px] text-white/80">
//                           Enrollment
//                         </span>
//                         <span className="text-xs text-white">
//                           {event.currEnrollments}/{event.maxEnrollments}
//                         </span>
//                       </div>
//                       <div
//                         className="w-full h-1.5 rounded-full overflow-hidden"
//                         style={{
//                           backgroundColor: "rgba(255, 255, 255, 0.2)",
//                         }}
//                       >
//                         <div
//                           className="h-full rounded-full"
//                           style={{
//                             width: `${enrollmentPercentage}%`,
//                             backgroundColor: "#4CA1AF",
//                           }}
//                         ></div>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Status Badges - Compact */}
//                   <div className="mt-2 pt-1 border-t border-white/20 flex items-center justify-between">
//                     {/* Enrollment Status */}
//                     <div className="flex items-center gap-1">
//                       <span className="text-[9px] text-white/60 font-medium">
//                         Enrollment Status:
//                       </span>

//                       <span
//                         className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${
//                           event.enrollmentStatus?.toLowerCase() === "open"
//                             ? "bg-green-500/30 text-green-100"
//                             : event.enrollmentStatus?.toLowerCase() ===
//                                 "closed"
//                               ? "bg-red-500/30 text-red-100"
//                               : "bg-yellow-500/30 text-yellow-100"
//                         }`}
//                       >
//                         {event.enrollmentStatus || "N/A"}
//                       </span>
//                     </div>

//                     {/* Event Completion Status */}
//                     <span
//                       className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${
//                         event.completed
//                           ? "bg-gray-500/30 text-gray-100"
//                           : "bg-blue-500/30 text-blue-100"
//                       }`}
//                     >
//                       {event.completed ? "Done" : "Upcoming"}
//                     </span>
//                   </div>

//                   {/* Admin Actions - Compact */}
//                   <div className="mt-1.5 flex gap-1">
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         navigate(`/edit-event/${event.eventId}`);
//                       }}
//                       className="flex-1 px-1.5 py-1 rounded-lg text-[10px] font-medium transition flex items-center justify-center text-white"
//                       style={{
//                         backgroundColor: "rgba(255, 255, 255, 0.2)",
//                       }}
//                       onMouseEnter={(e) =>
//                         (e.currentTarget.style.backgroundColor =
//                           "rgba(255, 255, 255, 0.3)")
//                       }
//                       onMouseLeave={(e) =>
//                         (e.currentTarget.style.backgroundColor =
//                           "rgba(255, 255, 255, 0.2)")
//                       }
//                     >
//                       <Edit className="w-2.5 h-2.5 mr-0.5" />
//                       Edit
//                     </button>
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         handleDeleteEvent(event.eventId);
//                       }}
//                       className="flex-1 px-1.5 py-1 rounded-lg text-[10px] font-medium transition flex items-center justify-center text-white"
//                       style={{
//                         backgroundColor: "rgba(239, 68, 68, 0.5)",
//                       }}
//                       onMouseEnter={(e) =>
//                         (e.currentTarget.style.backgroundColor =
//                           "rgba(239, 68, 68, 0.6)")
//                       }
//                       onMouseLeave={(e) =>
//                         (e.currentTarget.style.backgroundColor =
//                           "rgba(239, 68, 68, 0.5)")
//                       }
//                     >
//                       <Trash2 className="w-2.5 h-2.5 mr-0.5" />
//                       Del
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   </div>
// )}

//         {/* Footer */}
//         <div className="mt-12 text-center">
//           <div className="inline-flex items-center space-x-2 text-gray-500 text-sm">
//             <Settings className="w-4 h-4" />
//             <span>
//               Admin controls active • {filteredEvents.length} events displayed
//             </span>
//             <Share2 className="w-4 h-4" />
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

//         @keyframes slideDown {
//           from {
//             opacity: 0;
//             transform: translateY(-10px);
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
//           height: 280px;
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

//         /* Line clamp utilities */
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

// export default MyEventsForSuperadmin;
