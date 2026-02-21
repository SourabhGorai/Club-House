import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  X
} from 'lucide-react';

const PreviousEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState('');
  const [userDept, setUserDept] = useState('');
  const [deptId, setDeptId] = useState(null);
  const [filterType, setFilterType] = useState('GLOBAL'); 
  const [userClubs, setUserClubs] = useState([]);
  const [selectedClubId, setSelectedClubId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('date');
  const [showClubDropdown, setShowClubDropdown] = useState(false);
  const [departments, setDepartments] = useState([]);

  const animations = {
    fadeIn: "animate-[fadeIn_0.5s_ease-in-out]",
    slideUp: "animate-[slideUp_0.5s_ease-out]",
    pulse: "animate-pulse",
    bounce: "animate-bounce",
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    const role = user?.role || 'user';
    setUserRole(role);

    if (!token) {
      setError('No authentication token found. Please login again.');
      setLoading(false);
      return;
    }

    // Only fetch data for users
    if (role === "USER" || role === "USERS") {
      fetchDepartments(token);
      fetchUserProfile(token);
      fetchUserClubs(token);
      fetchEvents(token, 'GLOBAL');
    } else {
      setError('This page is only accessible to users.');
      setLoading(false);
    }
  }, []);

  const fetchDepartments = async (token) => {
    try {
      const response = await axios.get('http://localhost:8080/api/department', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        setDepartments(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  const fetchUserProfile = async (token) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const prn = user?.prn;
      
      if (!prn) return;
      
      const response = await axios.get(`http://localhost:8080/api/profiles/prn/${prn}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        const profile = response.data.data;
        setUserDept(profile.department);
        fetchDepartmentId(token, profile.department);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };

  const fetchDepartmentId = async (token, deptName) => {
    try {
      const response = await axios.get('http://localhost:8080/api/department', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        const dept = response.data.data.find(d => d.name === deptName);
        if (dept) {
          setDeptId(dept.departmentId);
        }
      }
    } catch (err) {
      console.error('Error fetching department ID:', err);
    }
  };

  const fetchUserClubs = async (token) => {
    try {
      const response = await axios.get('http://localhost:8080/api/user-clubs/getMyClubs', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        setUserClubs(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching user clubs:', err);
    }
  };

  const fetchEvents = async (token, filter = 'GLOBAL', targetId = null) => {
    try {
      setLoading(true);
      console.log("FILTER:", filter, "TARGET ID:", targetId);

      let response;

      if (filter === 'DEPARTMENT' && targetId) {
        response = await axios.get(`http://localhost:8080/api/events/targetData/DEPARTMENT/${targetId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } else if (filter === 'CLUB' && targetId) {
        response = await axios.get(`http://localhost:8080/api/events/targetData/CLUB/${targetId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } else {
        response = await axios.get(`http://localhost:8080/api/events/getByTargetType/GLOBAL`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }

      if (response && response.data && response.data.success) {
        // Filter to show only CLOSED events
        const closedEvents = response.data.data.filter(
          event => event.enrollmentStatus?.toUpperCase() === 'CLOSED'
        );
        setEvents(closedEvents);
      } else {
        throw new Error(response?.data?.message || 'Failed to fetch events');
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err.message || 'An error occurred while fetching events');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredEvents = () => {
    let filtered = [...events];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(event => 
        event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.organizer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.creatorName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    switch(sortBy) {
      case 'date':
        filtered.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime)); // Most recent first
        break;
      case 'name':
        filtered.sort((a, b) => a.title?.localeCompare(b.title));
        break;
      default:
        break;
    }

    return filtered;
  };

  const handleFilterChange = async (newFilterType, targetId = null) => {
    setFilterType(newFilterType);
    const token = localStorage.getItem('token');
    
    if (newFilterType === 'DEPARTMENT' && deptId) {
      await fetchEvents(token, 'DEPARTMENT', deptId);
    } else if (newFilterType === 'CLUB') {
      if (targetId) {
        setSelectedClubId(targetId);
        await fetchEvents(token, 'CLUB', targetId);
        setShowClubDropdown(false);
      } else {
        setEvents([]);
        setShowClubDropdown(true);
      }
    } else {
      setSelectedClubId('');
      setShowClubDropdown(false);
      await fetchEvents(token, 'GLOBAL');
    }
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setFilterType('GLOBAL');
    setSelectedClubId('');
    setShowClubDropdown(false);
    const token = localStorage.getItem('token');
    fetchEvents(token, 'GLOBAL');
  };

  const getEventCategoryIcon = (title) => {
    const titleLower = title?.toLowerCase() || '';
    if (titleLower.includes('tech') || titleLower.includes('code')) return <Code className="w-5 h-5" />;
    if (titleLower.includes('music') || titleLower.includes('concert')) return <Music className="w-5 h-5" />;
    if (titleLower.includes('photo') || titleLower.includes('camera')) return <Camera className="w-5 h-5" />;
    if (titleLower.includes('sport') || titleLower.includes('game')) return <Trophy className="w-5 h-5" />;
    if (titleLower.includes('art') || titleLower.includes('creative')) return <Heart className="w-5 h-5" />;
    if (titleLower.includes('workshop') || titleLower.includes('learn')) return <BookOpen className="w-5 h-5" />;
    if (titleLower.includes('social') || titleLower.includes('meet')) return <Coffee className="w-5 h-5" />;
    return <Sparkles className="w-5 h-5" />;
  };

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return 'N/A';
    const date = new Date(dateTimeStr);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleRetry = () => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchEvents(token, filterType, 
        filterType === 'DEPARTMENT' ? deptId : 
        filterType === 'CLUB' ? selectedClubId : null
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
          <p className="text-white text-xl font-light animate-pulse">Loading previous events...</p>
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
          <h2 className="text-2xl font-bold text-white mb-2">Oops! Something went wrong</h2>
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
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-gray-600 via-gray-700 to-gray-800 bg-clip-text text-transparent">
              Previous Events
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Explore events that have concluded. Relive the memories and see what you missed!
          </p>
          
          {/* Stats Card */}
          <div className="inline-block">
            <div className="bg-white/80 backdrop-blur-sm px-8 py-4 rounded-2xl shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="bg-gray-100 p-3 rounded-xl">
                  <Calendar className="w-6 h-6 text-gray-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-gray-600">Total Previous Events</p>
                  <p className="text-3xl font-bold text-gray-800">{events.length}</p>
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
                  placeholder="Search previous events by title, description, or organizer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                />
              </div>

              {/* Filter Toggle and Sort Options */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl font-medium hover:from-gray-700 hover:to-gray-800 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 shadow-lg"
                >
                  <Filter className="w-5 h-5" />
                  <span>Filters</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
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
            {(filterType !== 'GLOBAL' || selectedClubId) && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-gray-600 mr-2">
                    Active Filters:
                  </span>

                  {filterType === 'DEPARTMENT' && userDept && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center">
                      Dept: {userDept}
                      <button onClick={() => handleFilterChange('GLOBAL')} className="ml-2 hover:text-green-900">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {filterType === 'CLUB' && selectedClubId && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center">
                      Club: {userClubs.find(c => c.clubId.toString() === selectedClubId.toString())?.clubName}
                      <button onClick={() => handleFilterChange('GLOBAL')} className="ml-2 hover:text-purple-900">
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
                    <span className="text-sm font-medium text-gray-600">Filter by:</span>
                    
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Global Events Filter */}
                      <button
                        onClick={() => handleFilterChange('GLOBAL')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                          filterType === 'GLOBAL' 
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg' 
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                        }`}
                      >
                        <Globe className="w-4 h-4 inline mr-2" />
                        Global Events
                      </button>
                      
                      {/* Department Filter */}
                      {userDept && (
                        <button
                          onClick={() => handleFilterChange('DEPARTMENT')}
                          className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                            filterType === 'DEPARTMENT' 
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg' 
                              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                          }`}
                        >
                          <Users className="w-4 h-4 inline mr-2" />
                          {userDept} Events
                        </button>
                      )}
                      
                      {/* Club Events Button */}
                      <button
                        onClick={() => setShowClubDropdown(!showClubDropdown)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
                          filterType === 'CLUB' 
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                        }`}
                      >
                        <Target className="w-4 h-4 mr-2" />
                        <span>Club Events</span>
                        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showClubDropdown ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Club Dropdown Section */}
                  {showClubDropdown && (
                    <div className="mt-2 border border-gray-200 rounded-xl bg-white shadow-lg overflow-hidden">
                      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                        <h3 className="font-semibold text-gray-700">SELECT A CLUB</h3>
                      </div>
                      
                      <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
                        {userClubs.length > 0 ? (
                          userClubs.map((club) => (
                            <button
                              key={club.clubId}
                              onClick={() => {
                                handleFilterChange('CLUB', club.clubId);
                                setShowClubDropdown(false);
                              }}
                              className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                                selectedClubId === club.clubId.toString() ? 'bg-purple-50' : ''
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-gray-800">{club.clubName}</span>
                                <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                                  {club.memberCount || '0'} members
                                </span>
                              </div>
                              {club.desc && (
                                <p className="text-sm text-gray-600">{club.desc}</p>
                              )}
                            </button>
                          ))
                        ) : (
                          <div className="p-6 text-center">
                            <p className="text-gray-500">You are not a member of any clubs yet.</p>
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
            Showing <span className="font-semibold">{filteredEvents.length}</span> of{" "}
            <span className="font-semibold">{events.length}</span> previous events
          </p>
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 max-w-md mx-auto border border-white/20">
              <div className="relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full opacity-20 animate-ping"></div>
                </div>
                <XCircle className="w-20 h-20 text-gray-400 mx-auto mb-4 relative z-10" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No Previous Events Found</h3>
              <p className="text-gray-600 mb-6">
                {filterType === 'CLUB' && !selectedClubId
                  ? "Please select a club from the dropdown to view its previous events."
                  : "There are no closed events available at the moment. Check back later!"}
              </p>
              {(filterType !== 'GLOBAL' || searchTerm) && (
                <button
                  onClick={clearAllFilters}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event, index) => {
              const categoryIcon = getEventCategoryIcon(event.title);
              
              return (
                <div
                  key={event.eventId}
                  className={`group bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-white/20 opacity-90 hover:opacity-100 ${animations.fadeIn}`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Event Header */}
                  <div className="relative h-32 bg-gradient-to-r from-gray-500 to-gray-600 p-4 overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute -top-12 -right-12 w-24 h-24 bg-white rounded-full"></div>
                      <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-white rounded-full"></div>
                    </div>

                    {/* Category Icon */}
                    <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                      {categoryIcon}
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-700 border border-gray-300">
                        CLOSED
                      </span>
                    </div>

                    {/* Title */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">{event.title}</h3>
                      <p className="text-sm text-white/80 line-clamp-1">{event.description}</p>
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="p-5 space-y-4">
                    {/* Date and Venue */}
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

                    {/* Creator Info */}
                    <div className="bg-purple-50 p-3 rounded-xl">
                      <p className="text-xs text-gray-500 mb-1">Created By</p>
                      <p className="text-sm font-semibold text-gray-800">{event.creatorName}</p>
                      <p className="text-xs text-gray-500">PRN: {event.creatorPrn}</p>
                    </div>

                    {/* Target Type */}
                    <div className="flex items-center space-x-2">
                      <Target className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-600">
                        Target: {event.targetType || 'N/A'}
                      </span>
                    </div>

                    {/* Attendance Window */}
                    {event.attendanceWindowStart && event.attendanceWindowEnd && (
                      <div className="bg-gray-50 p-3 rounded-xl">
                        <div className="flex items-center text-sm text-gray-600">
                          <CalendarClock className="w-4 h-4 mr-2 text-gray-500" />
                          <span>
                            Attendance: {new Date(event.attendanceWindowStart).toLocaleTimeString()} - {new Date(event.attendanceWindowEnd).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Location Info */}
                    {event.latitude && event.longitude && (
                      <div className="bg-blue-50 p-3 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Map className="w-4 h-4 text-blue-500 mr-2" />
                            <span className="text-sm text-blue-700">Location verified</span>
                          </div>
                          <span className="text-xs text-blue-600">{event.radiusInMeters}m radius</span>
                        </div>
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <div className="flex items-center justify-end">
                        <span className="text-xs font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-600">
                          {event.completed ? 'Completed' : 'Closed'}
                        </span>
                      </div>
                    </div>
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
            <span>Check back for more completed events!</span>
            <Gift className="w-4 h-4" />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
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




// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
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
//   XCircle
// } from 'lucide-react';

// const PreviousEvents = () => {
//   const [events, setEvents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [userRole, setUserRole] = useState('');
//   const [userDept, setUserDept] = useState('');
//   const [deptId, setDeptId] = useState(null);
//   const [filterType, setFilterType] = useState('GLOBAL'); 
//   const [userClubs, setUserClubs] = useState([]);
//   const [selectedClubId, setSelectedClubId] = useState('');

//   useEffect(() => {
//     const user = JSON.parse(localStorage.getItem("user"));
//     const token = localStorage.getItem("token");

//     const role = user?.role || 'user';
//     setUserRole(role);

//     if (!token) {
//       setError('No authentication token found. Please login again.');
//       setLoading(false);
//       return;
//     }

//     // Only fetch data for users
//     if (role === "USER" || role === "USERS") {
//       fetchUserProfile(token);
//       fetchUserClubs(token);
//       fetchEvents(token, 'GLOBAL');
//     } else {
//       setError('This page is only accessible to users.');
//       setLoading(false);
//     }
//   }, []);

//   const fetchUserProfile = async (token) => {
//     try {
//       const user = JSON.parse(localStorage.getItem("user"));
//       const prn = user?.prn;
      
//       if (!prn) return;
      
//       const response = await axios.get(`http://localhost:8080/api/profiles/prn/${prn}`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });
      
//       if (response.data.success) {
//         const profile = response.data.data;
//         setUserDept(profile.department);
//         fetchDepartmentId(token, profile.department);
//       }
//     } catch (err) {
//       console.error('Error fetching user profile:', err);
//     }
//   };

//   const fetchDepartmentId = async (token, deptName) => {
//     try {
//       const response = await axios.get('http://localhost:8080/api/department', {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });
      
//       if (response.data.success) {
//         const dept = response.data.data.find(d => d.name === deptName);
//         if (dept) {
//           setDeptId(dept.departmentId);
//         }
//       }
//     } catch (err) {
//       console.error('Error fetching department ID:', err);
//     }
//   };

//   const fetchUserClubs = async (token) => {
//     try {
//       const response = await axios.get('http://localhost:8080/api/user-clubs/getMyClubs', {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });
      
//       if (response.data.success) {
//         setUserClubs(response.data.data);
//       }
//     } catch (err) {
//       console.error('Error fetching user clubs:', err);
//     }
//   };

//   const fetchEvents = async (token, filter = 'GLOBAL', targetId = null) => {
//     try {
//       setLoading(true);
//       console.log("FILTER:", filter, "TARGET ID:", targetId);

//       let response;

//       if (filter === 'DEPARTMENT' && targetId) {
//         response = await axios.get(`http://localhost:8080/api/events/targetData/DEPARTMENT/${targetId}`, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             'Content-Type': 'application/json'
//           }
//         });
//       } else if (filter === 'CLUB' && targetId) {
//         response = await axios.get(`http://localhost:8080/api/events/targetData/CLUB/${targetId}`, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             'Content-Type': 'application/json'
//           }
//         });
//       } else {
//         response = await axios.get(`http://localhost:8080/api/events/getByTargetType/GLOBAL`, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             'Content-Type': 'application/json'
//           }
//         });
//       }

//       if (response && response.data && response.data.success) {
//         // Filter to show only CLOSED events
//         const closedEvents = response.data.data.filter(
//           event => event.enrollmentStatus?.toUpperCase() === 'CLOSED'
//         );
//         setEvents(closedEvents);
//       } else {
//         throw new Error(response?.data?.message || 'Failed to fetch events');
//       }
//     } catch (err) {
//       console.error('Error fetching events:', err);
//       setError(err.message || 'An error occurred while fetching events');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleFilterChange = async (newFilterType, targetId = null) => {
//     setFilterType(newFilterType);
//     const token = localStorage.getItem('token');
    
//     if (newFilterType === 'DEPARTMENT' && deptId) {
//       await fetchEvents(token, 'DEPARTMENT', deptId);
//     } else if (newFilterType === 'CLUB') {
//       if (targetId) {
//         setSelectedClubId(targetId);
//         await fetchEvents(token, 'CLUB', targetId);
//       } else {
//         setEvents([]);
//       }
//     } else {
//       setSelectedClubId('');
//       await fetchEvents(token, 'GLOBAL');
//     }
//   };

//   const getEnrollmentStatusColor = (status) => {
//     switch(status?.toLowerCase()) {
//       case 'closed':
//         return 'bg-gray-100 text-gray-800 border-gray-200';
//       default:
//         return 'bg-gray-100 text-gray-800 border-gray-200';
//     }
//   };

//   const getTargetTypeIcon = (type) => {
//     switch(type?.toLowerCase()) {
//       case 'global':
//         return <Globe className="w-4 h-4" />;
//       case 'club':
//         return <Users className="w-4 h-4" />;
//       default:
//         return <Target className="w-4 h-4" />;
//     }
//   };

//   const formatDateTime = (dateTimeStr) => {
//     if (!dateTimeStr) return 'N/A';
//     return dateTimeStr;
//   };

//   const handleRetry = () => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       fetchEvents(token, filterType, 
//         filterType === 'DEPARTMENT' ? deptId : 
//         filterType === 'CLUB' ? selectedClubId : null
//       );
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
//         <div className="text-center">
//           <Loader2 className="w-12 h-12 text-gray-600 animate-spin mx-auto mb-4" />
//           <p className="text-gray-600 text-lg">Loading previous events...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
//         <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
//           <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
//             <AlertCircle className="w-10 h-10 text-red-600" />
//           </div>
//           <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h2>
//           <p className="text-gray-600 mb-6">{error}</p>
//           <button 
//             onClick={handleRetry}
//             className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
//           >
//             Try Again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="text-center mb-12">
//           <h1 className="text-4xl font-bold text-gray-900 mb-4">
//             Previous Events
//           </h1>
//           <div className="flex items-center justify-center space-x-2">
//             <div className="bg-white px-4 py-2 rounded-full shadow-sm">
//               <span className="text-sm font-medium text-gray-600">
//                 Total Previous Events: 
//               </span>
//               <span className="ml-2 px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-sm font-semibold">
//                 {events.length}
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* Filter Options for Users */}
//         <div className="mb-8">
//           <div className="bg-white rounded-lg shadow-md p-4 max-w-3xl mx-auto">
//             <div className="flex flex-wrap items-center justify-center gap-4">
//               {/* Filter Type Buttons */}
//               <div className="flex space-x-2">
//                 <button
//                   onClick={() => handleFilterChange('GLOBAL')}
//                   className={`px-4 py-2 cursor-pointer rounded-lg font-medium transition-colors ${
//                     filterType === 'GLOBAL' 
//                       ? 'bg-gray-600 text-white' 
//                       : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                   }`}
//                 >
//                   <Globe className="w-4 h-4 inline mr-2" />
//                   Global Events
//                 </button>
                
//                 {userDept && (
//                   <button
//                     onClick={() => handleFilterChange('DEPARTMENT')}
//                     className={`px-4 py-2 cursor-pointer rounded-lg font-medium transition-colors ${
//                       filterType === 'DEPARTMENT' 
//                         ? 'bg-gray-600 text-white' 
//                         : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                     }`}
//                   >
//                     <Users className="w-4 h-4 inline mr-2" />
//                     {userDept} Events
//                   </button>
//                 )}
                
//                 {/* Club Button with Integrated Dropdown */}
//                 <div className="relative">
//                   <button
//                     onClick={() => {
//                       if (filterType !== 'CLUB') {
//                         handleFilterChange('CLUB');
//                       }
//                     }}
//                     className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center ${
//                       filterType === 'CLUB' 
//                         ? 'bg-gray-600 text-white' 
//                         : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                     }`}
//                   >
//                     <Target className="w-4 h-4 mr-2" />
//                     Club Events
//                     {filterType === 'CLUB' && (
//                       <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                       </svg>
//                     )}
//                   </button>
                  
//                   {/* Dropdown Menu */}
//                   {filterType === 'CLUB' && (
//                     <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-10">
//                       <div className="p-2">
//                         <p className="text-xs font-semibold text-gray-500 px-3 py-2 uppercase tracking-wider">
//                           Select a Club
//                         </p>
//                         {userClubs.length > 0 ? (
//                           userClubs.map((club) => (
//                             <button
//                               key={club.clubId}
//                               onClick={() => handleFilterChange('CLUB', club.clubId)}
//                               className={`w-full hover:bg-gray-100 cursor-pointer text-left px-3 py-2 rounded-md transition-colors ${
//                                 selectedClubId === club.clubId.toString()
//                                   ? 'bg-gray-50 text-gray-700'
//                                   : 'hover:bg-gray-50 text-gray-700'
//                               }`}
//                             >
//                               <div className="flex items-center justify-between">
//                                 <span className="font-medium">{club.clubName}</span>
//                                 <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
//                                   {club.memberCount}
//                                 </span>
//                               </div>
//                               {club.desc && (
//                                 <p className="text-xs text-gray-500 mt-1 line-clamp-1">{club.desc}</p>
//                               )}
//                             </button>
//                           ))
//                         ) : (
//                           <div className="px-3 py-4 text-center">
//                             <p className="text-sm text-gray-500">You are not a member of any clubs yet.</p>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
              
//               {/* Show current filter info */}
//               {filterType === 'DEPARTMENT' && userDept && (
//                 <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
//                   Showing previous events for {userDept} Department
//                 </div>
//               )}
              
//               {filterType === 'CLUB' && selectedClubId && (
//                 <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
//                   Showing previous events for {userClubs.find(c => c.clubId.toString() === selectedClubId.toString())?.clubName} Club
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Events Grid */}
//         {events.length === 0 ? (
//           <div className="text-center py-12">
//             <div className="bg-white rounded-xl shadow-lg p-12 max-w-md mx-auto">
//               <XCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
//               <h3 className="text-xl font-semibold text-gray-700 mb-2">No Previous Events</h3>
//               <p className="text-gray-500">There are no closed events available at the moment.</p>
//             </div>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {events.map((event) => (
//               <div
//                 key={event.eventId}
//                 className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 opacity-75 hover:opacity-100"
//               >
//                 {/* Event Header */}
//                 <div className="relative h-32 bg-gradient-to-r from-gray-500 to-gray-600 p-4">
//                   <div className="absolute top-4 right-4">
//                     <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getEnrollmentStatusColor(event.enrollmentStatus)}`}>
//                       {event.enrollmentStatus || 'CLOSED'}
//                     </span>
//                   </div>
//                   <div className="absolute bottom-4 left-4 text-white">
//                     <h3 className="text-xl font-bold mb-1 line-clamp-1">{event.title}</h3>
//                     <p className="text-sm opacity-90 line-clamp-1">{event.description}</p>
//                   </div>
//                 </div>

//                 {/* Event Details */}
//                 <div className="p-4 space-y-3">
//                   {/* Date and Time */}
//                   <div className="flex items-start space-x-2">
//                     <Calendar className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
//                     <div>
//                       <p className="text-sm font-medium text-gray-900">{event.day}</p>
//                       <p className="text-xs text-gray-500">{formatDateTime(event.dateTime)}</p>
//                     </div>
//                   </div>

//                   {/* Venue */}
//                   <div className="flex items-start space-x-2">
//                     <MapPin className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
//                     <div>
//                       <p className="text-sm text-gray-900">{event.venue}</p>
//                       {event.latitude && event.longitude && (
//                         <p className="text-xs text-gray-500">
//                           Coordinates: {event.latitude.toFixed(4)}, {event.longitude.toFixed(4)}
//                         </p>
//                       )}
//                     </div>
//                   </div>

//                   {/* Organizer and Speaker */}
//                   <div className="flex items-start space-x-2">
//                     <User className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
//                     <div className="flex-1">
//                       <p className="text-sm text-gray-900">
//                         <span className="font-medium">Organizer:</span> {event.organizer}
//                       </p>
//                       <p className="text-xs text-gray-600">
//                         <span className="font-medium">Speaker:</span> {event.speakerName}
//                       </p>
//                     </div>
//                   </div>

//                   {/* Creator Info */}
//                   <div className="flex items-start space-x-2">
//                     <User className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
//                     <div>
//                       <p className="text-sm text-gray-900">{event.creatorName}</p>
//                       <p className="text-xs text-gray-500">PRN: {event.creatorPrn}</p>
//                     </div>
//                   </div>

//                   {/* Target Type */}
//                   <div className="flex items-start space-x-2">
//                     {getTargetTypeIcon(event.targetType)}
//                     <div>
//                       <p className="text-sm text-gray-900">
//                         Target: {event.targetType || 'N/A'}
//                       </p>
//                       {event.targetIds && event.targetIds.length > 0 && (
//                         <p className="text-xs text-gray-500">
//                           IDs: {event.targetIds.join(', ')}
//                         </p>
//                       )}
//                     </div>
//                   </div>

//                   {/* Attendance Window */}
//                   <div className="flex items-start space-x-2">
//                     <CalendarClock className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
//                     <div>
//                       <p className="text-xs text-gray-600">
//                         Attendance: {new Date(event.attendanceWindowStart).toLocaleTimeString()} - {new Date(event.attendanceWindowEnd).toLocaleTimeString()}
//                       </p>
//                     </div>
//                   </div>

//                   {/* Status Badge */}
//                   <div className="mt-3 pt-3 border-t border-gray-100">
//                     <div className="flex items-center justify-between">
//                       <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600">
//                         {event.completed ? 'Completed' : 'Closed'}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default PreviousEvents;