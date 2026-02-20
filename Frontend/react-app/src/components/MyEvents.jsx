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
  Lock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  CalendarClock,
  Map,
  Radio
} from 'lucide-react';

const MyEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState('');
  const [targetTypes, setTargetTypes] = useState([]);
  const [selectedTarget, setSelectedTarget] = useState('GLOBAL');
  const [userDept, setUserDept] = useState('');
const [deptId, setDeptId] = useState(null);
const [departments, setDepartments] = useState([]);
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

  // Fetch target types, user profile, and departments
  fetchTargetTypes(token);
  fetchUserProfile(token);
  fetchDepartments(token);
  fetchUserClubs(token);
  fetchEvents(token, role, 'GLOBAL'); 
}, []);


const fetchUserProfile = async (token) => {
  try {
    // You need to get PRN from localStorage or from user object
    const user = JSON.parse(localStorage.getItem("user"));
    const prn = user?.prn; // Make sure prn is stored in user object
    
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
      
      // After getting department, fetch department ID
      fetchDepartmentId(token, profile.department);
    }
  } catch (err) {
    console.error('Error fetching user profile:', err);
  }
};

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

  const fetchTargetTypes = async (token) => {
    try {
      const response = await axios.get('http://localhost:8080/api/events/targetTypes', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        setTargetTypes(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching target types:', err);
    }
  };

const fetchEvents = async (token, role, filter = 'GLOBAL', targetId = null) => {
  try {
    setLoading(true);
    console.log("ROLE:", role, "FILTER:", filter, "TARGET ID:", targetId);

    let response;

    if (role === "SUPER_ADMIN") {
      response = await axios.get('http://localhost:8080/api/events', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    } else if (role === "USER" || role === "USERS") {
      if (filter === 'DEPARTMENT' && targetId) {
        // Fetch department-specific events
        response = await axios.get(`http://localhost:8080/api/events/targetData/DEPARTMENT/${targetId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } else if (filter === 'CLUB' && targetId) {
        // Fetch club-specific events (assuming you have club IDs)
        response = await axios.get(`http://localhost:8080/api/events/targetData/CLUB/${targetId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } else {
        // Fetch global events
        response = await axios.get(`http://localhost:8080/api/events/getByTargetType/GLOBAL`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } else if (role === "TEACHER" || role === "TEACHERS") {
      response = await axios.get('http://localhost:8080/api/events/myEvents', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    }

    if (response && response.data && response.data.success) {
      setEvents(response.data.data);
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

  const handleTargetChange = async (e) => {
    const newTarget = e.target.value;
    setSelectedTarget(newTarget);
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem("user"));
    const role = user?.role || 'user';
    
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8080/api/events/getByTargetType/${newTarget}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
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
  // If user is SUPER_ADMIN, show all events
  if (userRole === "SUPER_ADMIN") {
    return events;
  }
  
  // For other users (USER, TEACHER, etc.), filter out CLOSED events
  return events.filter(event => event.enrollmentStatus?.toUpperCase() !== 'CLOSED');
};

const handleFilterChange = async (newFilterType, targetId = null) => {
  setFilterType(newFilterType);
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role || 'user';
  
  if (newFilterType === 'DEPARTMENT' && deptId) {
    await fetchEvents(token, role, 'DEPARTMENT', deptId);
  } else if (newFilterType === 'CLUB') {
    if (targetId) {
      // If a club is selected from dropdown
      setSelectedClubId(targetId);
      await fetchEvents(token, role, 'CLUB', targetId);
    } else {
      // If button is clicked without selection, reset to show no events or show prompt
      setEvents([]);
    }
  } else {
    setSelectedClubId(''); // Reset club selection
    await fetchEvents(token, role, 'GLOBAL');
  }
};

  const getEnrollmentStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'open':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'closed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
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

  const isDeadlinePassed = (deadline) => {
    return new Date(deadline) < new Date();
  };

  const handleRetry = () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem("user"));
    const role = user?.role || 'user';
    
    if (token) {
      fetchEvents(token, role);
    } else {
      setError('No authentication token found. Please login again.');
    }
  };

  const filteredEvents = getFilteredEvents();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={handleRetry}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Upcoming Events
          </h1>
          <div className="flex items-center justify-center space-x-2">
            <div className="bg-white px-4 py-2 rounded-full shadow-sm">
              <span className="text-sm font-medium text-gray-600">
                Role: 
              </span>
              <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                {userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1) : 'User'}
              </span>
            </div>
            <div className="bg-white px-4 py-2 rounded-full shadow-sm">
              <span className="text-sm font-medium text-gray-600">
                Total Events: 
              </span>
              <span className="ml-2 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold">
                {filteredEvents.length}
              </span>
            </div>
          </div>
        </div>

        {/* Target Type Selector for Users */}
       {/* Filter Options for Users */}
{(userRole === "USER" || userRole === "USERS") && (
  <div className="mb-8">
    <div className="bg-white rounded-lg shadow-md p-4 max-w-3xl mx-auto">
      <div className="flex flex-wrap items-center justify-center gap-4">
        {/* Filter Type Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={() => handleFilterChange('GLOBAL')}
            className={`px-4 py-2 cursor-pointer rounded-lg font-medium transition-colors ${
              filterType === 'GLOBAL' 
                ? 'bg-blue-600 text-white' 
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
                  ? 'bg-green-600 text-white' 
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
                  ? 'bg-purple-600 text-white' 
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
            
            {/* Dropdown Menu - Shows immediately when Club is selected */}
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
                            ? 'bg-purple-50 text-purple-700'
                            : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <div className=" flex items-center justify-between">
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
          <div className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-full">
            Showing events for {userDept} Department
          </div>
        )}
        
        {filterType === 'CLUB' && selectedClubId && (
          <div className="text-sm text-gray-600 bg-purple-50 px-3 py-1 rounded-full">
            Showing events for {userClubs.find(c => c.clubId.toString() === selectedClubId.toString())?.clubName} Club
          </div>
        )}
      </div>
    </div>
  </div>
)}

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-xl shadow-lg p-12 max-w-md mx-auto">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Events Found</h3>
              <p className="text-gray-500">There are no events available at the moment.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <div
                key={event.eventId}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1"
              >
                {/* Event Header */}
                <div className="relative h-32 bg-gradient-to-r from-blue-600 to-indigo-600 p-4">
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getEnrollmentStatusColor(event.enrollmentStatus)}`}>
                      {event.enrollmentStatus || 'N/A'}
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
                    <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{event.day}</p>
                      <p className="text-xs text-gray-500">{formatDateTime(event.dateTime)}</p>
                    </div>
                  </div>

                  {/* Venue */}
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
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
                    <User className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
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
                    <User className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-900">{event.creatorName}</p>
                      <p className="text-xs text-gray-500">PRN: {event.creatorPrn}</p>
                    </div>
                  </div>

                  {/* Enrollment Info */}
                 {(userRole === "SUPER_ADMIN") && (
  <div className="flex items-start space-x-2">
    <Users className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
    <div className="flex-1">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-900">
          {event.currEnrollments}/{event.maxEnrollments} Enrolled
        </p>
        <span className="text-xs text-gray-500">
          {Math.round((event.currEnrollments / event.maxEnrollments) * 100)}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
        <div 
          className="bg-blue-600 h-1.5 rounded-full"
          style={{ width: `${(event.currEnrollments / event.maxEnrollments) * 100}%` }}
        ></div>
      </div>
    </div>
  </div>
)}

                  {/* Deadline */}
                  <div className="flex items-start space-x-2">
                    <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-900">
                        Deadline: {new Date(event.enrollmentDeadline).toLocaleString()}
                      </p>
                      {isDeadlinePassed(event.enrollmentDeadline) && (
                        <p className="text-xs text-red-500">Deadline passed</p>
                      )}
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
                    <CalendarClock className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-600">
                        Attendance: {new Date(event.attendanceWindowStart).toLocaleTimeString()} - {new Date(event.attendanceWindowEnd).toLocaleTimeString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        QR Refresh: Every {event.qrRefreshInterval} seconds
                      </p>
                    </div>
                  </div>

                  {/* Location Radius */}
                  {event.radiusInMeters && (
                    <div className="flex items-start space-x-2">
                      <Map className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-600">
                        Check-in radius: {event.radiusInMeters}m
                      </p>
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        event.completed ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-600'
                      }`}>
                        {event.completed ? 'Completed' : 'Upcoming'}
                      </span>
                      {event.enrollmentStatus === 'OPEN' && !event.completed && (
                        <button className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                          Enroll Now
                        </button>
                      )}
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

export default MyEvents;