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
  XCircle
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
      fetchUserProfile(token);
      fetchUserClubs(token);
      fetchEvents(token, 'GLOBAL');
    } else {
      setError('This page is only accessible to users.');
      setLoading(false);
    }
  }, []);

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

  const handleFilterChange = async (newFilterType, targetId = null) => {
    setFilterType(newFilterType);
    const token = localStorage.getItem('token');
    
    if (newFilterType === 'DEPARTMENT' && deptId) {
      await fetchEvents(token, 'DEPARTMENT', deptId);
    } else if (newFilterType === 'CLUB') {
      if (targetId) {
        setSelectedClubId(targetId);
        await fetchEvents(token, 'CLUB', targetId);
      } else {
        setEvents([]);
      }
    } else {
      setSelectedClubId('');
      await fetchEvents(token, 'GLOBAL');
    }
  };

  const getEnrollmentStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'closed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTargetTypeIcon = (type) => {
    switch(type?.toLowerCase()) {
      case 'global':
        return <Globe className="w-4 h-4" />;
      case 'club':
        return <Users className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return 'N/A';
    return dateTimeStr;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-gray-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading previous events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={handleRetry}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Previous Events
          </h1>
          <div className="flex items-center justify-center space-x-2">
            <div className="bg-white px-4 py-2 rounded-full shadow-sm">
              <span className="text-sm font-medium text-gray-600">
                Total Previous Events: 
              </span>
              <span className="ml-2 px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-sm font-semibold">
                {events.length}
              </span>
            </div>
          </div>
        </div>

        {/* Filter Options for Users */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-md p-4 max-w-3xl mx-auto">
            <div className="flex flex-wrap items-center justify-center gap-4">
              {/* Filter Type Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={() => handleFilterChange('GLOBAL')}
                  className={`px-4 py-2 cursor-pointer rounded-lg font-medium transition-colors ${
                    filterType === 'GLOBAL' 
                      ? 'bg-gray-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Globe className="w-4 h-4 inline mr-2" />
                  Global Events
                </button>
                
                {userDept && (
                  <button
                    onClick={() => handleFilterChange('DEPARTMENT')}
                    className={`px-4 py-2 cursor-pointer rounded-lg font-medium transition-colors ${
                      filterType === 'DEPARTMENT' 
                        ? 'bg-gray-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Users className="w-4 h-4 inline mr-2" />
                    {userDept} Events
                  </button>
                )}
                
                {/* Club Button with Integrated Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      if (filterType !== 'CLUB') {
                        handleFilterChange('CLUB');
                      }
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center ${
                      filterType === 'CLUB' 
                        ? 'bg-gray-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Club Events
                    {filterType === 'CLUB' && (
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </button>
                  
                  {/* Dropdown Menu */}
                  {filterType === 'CLUB' && (
                    <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-10">
                      <div className="p-2">
                        <p className="text-xs font-semibold text-gray-500 px-3 py-2 uppercase tracking-wider">
                          Select a Club
                        </p>
                        {userClubs.length > 0 ? (
                          userClubs.map((club) => (
                            <button
                              key={club.clubId}
                              onClick={() => handleFilterChange('CLUB', club.clubId)}
                              className={`w-full hover:bg-gray-100 cursor-pointer text-left px-3 py-2 rounded-md transition-colors ${
                                selectedClubId === club.clubId.toString()
                                  ? 'bg-gray-50 text-gray-700'
                                  : 'hover:bg-gray-50 text-gray-700'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{club.clubName}</span>
                                <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                                  {club.memberCount}
                                </span>
                              </div>
                              {club.desc && (
                                <p className="text-xs text-gray-500 mt-1 line-clamp-1">{club.desc}</p>
                              )}
                            </button>
                          ))
                        ) : (
                          <div className="px-3 py-4 text-center">
                            <p className="text-sm text-gray-500">You are not a member of any clubs yet.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Show current filter info */}
              {filterType === 'DEPARTMENT' && userDept && (
                <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                  Showing previous events for {userDept} Department
                </div>
              )}
              
              {filterType === 'CLUB' && selectedClubId && (
                <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                  Showing previous events for {userClubs.find(c => c.clubId.toString() === selectedClubId.toString())?.clubName} Club
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Events Grid */}
        {events.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-xl shadow-lg p-12 max-w-md mx-auto">
              <XCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Previous Events</h3>
              <p className="text-gray-500">There are no closed events available at the moment.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div
                key={event.eventId}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 opacity-75 hover:opacity-100"
              >
                {/* Event Header */}
                <div className="relative h-32 bg-gradient-to-r from-gray-500 to-gray-600 p-4">
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getEnrollmentStatusColor(event.enrollmentStatus)}`}>
                      {event.enrollmentStatus || 'CLOSED'}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-xl font-bold mb-1 line-clamp-1">{event.title}</h3>
                    <p className="text-sm opacity-90 line-clamp-1">{event.description}</p>
                  </div>
                </div>

                {/* Event Details */}
                <div className="p-4 space-y-3">
                  {/* Date and Time */}
                  <div className="flex items-start space-x-2">
                    <Calendar className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{event.day}</p>
                      <p className="text-xs text-gray-500">{formatDateTime(event.dateTime)}</p>
                    </div>
                  </div>

                  {/* Venue */}
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-900">{event.venue}</p>
                      {event.latitude && event.longitude && (
                        <p className="text-xs text-gray-500">
                          Coordinates: {event.latitude.toFixed(4)}, {event.longitude.toFixed(4)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Organizer and Speaker */}
                  <div className="flex items-start space-x-2">
                    <User className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">Organizer:</span> {event.organizer}
                      </p>
                      <p className="text-xs text-gray-600">
                        <span className="font-medium">Speaker:</span> {event.speakerName}
                      </p>
                    </div>
                  </div>

                  {/* Creator Info */}
                  <div className="flex items-start space-x-2">
                    <User className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-900">{event.creatorName}</p>
                      <p className="text-xs text-gray-500">PRN: {event.creatorPrn}</p>
                    </div>
                  </div>

                  {/* Target Type */}
                  <div className="flex items-start space-x-2">
                    {getTargetTypeIcon(event.targetType)}
                    <div>
                      <p className="text-sm text-gray-900">
                        Target: {event.targetType || 'N/A'}
                      </p>
                      {event.targetIds && event.targetIds.length > 0 && (
                        <p className="text-xs text-gray-500">
                          IDs: {event.targetIds.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Attendance Window */}
                  <div className="flex items-start space-x-2">
                    <CalendarClock className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-600">
                        Attendance: {new Date(event.attendanceWindowStart).toLocaleTimeString()} - {new Date(event.attendanceWindowEnd).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                        {event.completed ? 'Completed' : 'Closed'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviousEvents;