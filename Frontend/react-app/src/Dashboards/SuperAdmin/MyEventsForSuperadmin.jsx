import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ConfirmDialog from "../../components/ConfirmDialog";
import CustomSelect from "../../components/CustomSelect";
import StartAttendancePopup from "../../components/StartAttendencePopup";

import {
  Calendar, MapPin, Users, User, Clock, Target, Globe,
  AlertCircle, CheckCircle, XCircle, Loader2, Sparkles,
  Trophy, Star, BookOpen, Coffee, Music, Code, Camera, Heart,
  Filter, ChevronDown, Search, Settings, Edit, Trash2,
  Share2, Plus, Briefcase, X, ArrowLeft, ChevronLeft, ChevronRight,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────
const BASE_URL = "http://localhost:8080";
const PAGE_SIZE = 9;
const authHeaders = (token) => ({ Authorization: `Bearer ${token}`, "Content-Type": "application/json" });

const fetchPagedEvents = async (serverFilter, page, token) => {
  let url;
  if (serverFilter === "all") {
    url = `${BASE_URL}/api/events/paged?page=${page}&size=${PAGE_SIZE}`;
  } else if (serverFilter.startsWith("enrollment:")) {
    const status = serverFilter.split(":")[1].toUpperCase();
    url = `${BASE_URL}/api/events/enrollment/${status}/paged?page=${page}&size=${PAGE_SIZE}`;
  } else if (serverFilter.startsWith("completed:")) {
    const val = serverFilter.split(":")[1];
    url = `${BASE_URL}/api/events/endEvent/${val}/paged?page=${page}&size=${PAGE_SIZE}`;
  }
  const res = await axios.get(url, { headers: authHeaders(token) });
  return res.data?.data;
};

const fetchAllForStats = async (token) => {
  const res = await axios.get(`${BASE_URL}/api/events`, { headers: authHeaders(token) });
  return res.data?.data || [];
};

const fetchDepartments = async (token) => {
  const res = await axios.get(`${BASE_URL}/api/department`, { headers: authHeaders(token) });
  return res.data?.data || [];
};

const fetchAllClubs = async (token) => {
  const res = await axios.get(`${BASE_URL}/api/clubs`, { headers: authHeaders(token) });
  return res.data?.data || [];
};

// ─── Pure helpers ──────────────────────────────────────────────────────────────
const formatDateTime = (dt) => {
  if (!dt) return "N/A";
  return new Date(dt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
};
const getDaysUntil = (date) => Math.ceil((new Date(date) - new Date()) / 86400000);

const getTargetTypeIcon  = (t) => ({ global: <Globe className="w-4 h-4" />, club: <Users className="w-4 h-4" />, department: <Briefcase className="w-4 h-4" /> }[t?.toLowerCase()] ?? <Target className="w-4 h-4" />);
const getTargetTypeColor = (t) => ({ global: "bg-blue-100 text-blue-700", club: "bg-purple-100 text-purple-700", department: "bg-green-100 text-green-700" }[t?.toLowerCase()] ?? "bg-gray-100 text-gray-700");

const getEventCategoryIcon = (title) => {
  const t = title?.toLowerCase() || "";
  if (t.includes("tech") || t.includes("code"))      return <Code className="w-5 h-5" />;
  if (t.includes("music") || t.includes("concert"))  return <Music className="w-5 h-5" />;
  if (t.includes("photo") || t.includes("camera"))   return <Camera className="w-5 h-5" />;
  if (t.includes("sport") || t.includes("game"))     return <Trophy className="w-5 h-5" />;
  if (t.includes("art")   || t.includes("creative")) return <Heart className="w-5 h-5" />;
  if (t.includes("workshop") || t.includes("learn")) return <BookOpen className="w-5 h-5" />;
  if (t.includes("social") || t.includes("meet"))    return <Coffee className="w-5 h-5" />;
  return <Sparkles className="w-5 h-5" />;
};

// ─── Component ────────────────────────────────────────────────────────────────
const MyEventsForSuperadmin = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // ── Server data ────────────────────────────────────────────────────────────
  const [pageData, setPageData] = useState({ content: [], pageNumber: 0, totalElements: 0, totalPages: 0, last: true });
  const [statsEvents, setStatsEvents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [clubs, setClubs]             = useState([]);

  // ── UI ─────────────────────────────────────────────────────────────────────
  const [loading, setLoading]         = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [error, setError]             = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy]           = useState("date");

  // ── Server-side filter ─────────────────────────────────────────────────────
  const [serverFilter, setServerFilter]             = useState("all");
  const [currentPage, setCurrentPage]               = useState(0);

  // ── Client-side filters ────────────────────────────────────────────────────
  const [filterType, setFilterType]                 = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedClub, setSelectedClub]             = useState("all");
  const [searchTerm, setSearchTerm]                 = useState("");
  const [selectedStatus, setSelectedStatus]         = useState("all");
  const [selectedCompleted, setSelectedCompleted]   = useState("all");

  // ── Modals ─────────────────────────────────────────────────────────────────
  const [showEditModal, setShowEditModal]   = useState(false);
  const [editingEvent, setEditingEvent]     = useState(null);
  const [updateLoading, setUpdateLoading]   = useState(false);
  const [updateError, setUpdateError]       = useState(null);

  const [showAttendancePopup, setShowAttendancePopup]             = useState(false);
  const [selectedEventForAttendance, setSelectedEventForAttendance] = useState(null);

  // ── QR Modal ───────────────────────────────────────────────────────────────
  const [showQRCodeModal, setShowQRCodeModal]   = useState(false);
  const [qrCodeEventId, setQrCodeEventId]       = useState(null);
  // FIX: Store the initial QR data returned by the start-attendance API
  // so QRCodeDisplay can use it directly without needing to re-fetch,
  // avoiding the "session ended" flash from a stale attendanceActive=false check.
  const [initialQRData, setInitialQRData]       = useState(null);

  const [activeAttendanceEvents, setActiveAttendanceEvents]   = useState({});
  const [loadingAttendanceStatus, setLoadingAttendanceStatus] = useState(false);

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false, title: "", message: "", variant: "primary", confirmText: "Confirm", onConfirm: () => {}
  });
  const closeConfirm = () => setConfirmDialog((p) => ({ ...p, isOpen: false }));

  // ── Init ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.role !== "SUPER_ADMIN") {
      setError("Access denied. This page is only for Super Admins.");
      setLoading(false);
      return;
    }
    if (!token) {
      setError("No authentication token found. Please login again.");
      setLoading(false);
      return;
    }
    initLoad();
  }, []);

  const initLoad = async () => {
    setLoading(true);
    try {
      const [page, allEvents, depts, clubList] = await Promise.all([
        fetchPagedEvents("all", 0, token),
        fetchAllForStats(token),
        fetchDepartments(token),
        fetchAllClubs(token),
      ]);
      setPageData(page);
      setStatsEvents(allEvents);
      setDepartments(depts);
      setClubs(clubList);
    } catch (err) {
      setError(err.message || "An error occurred while fetching events");
    } finally {
      setLoading(false);
    }
  };

  // ── Page loader ─────────────────────────────────────────────────────────────
  const loadPage = useCallback(async (filter, page) => {
    setPageLoading(true);
    try {
      const data = await fetchPagedEvents(filter, page, token);
      setPageData(data);
      setCurrentPage(page);
    } catch (err) {
      console.error("Page load error:", err);
    } finally {
      setPageLoading(false);
    }
  }, [token]);

  // ── Attendance status helpers ───────────────────────────────────────────────
  const checkAttendanceActive = async (eventId) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/events/getById/${eventId}`,
        { headers: authHeaders(token) }
      );
      return res.data?.data?.attendanceActive || false;
    } catch (err) {
      console.error(`Error checking attendance for event ${eventId}:`, err);
      return false;
    }
  };

  const checkAllEventsAttendance = useCallback(async () => {
    if (!pageData.content || pageData.content.length === 0) return;
    setLoadingAttendanceStatus(true);
    const statusMap = {};
    await Promise.all(
      pageData.content.map(async (event) => {
        statusMap[event.eventId] = await checkAttendanceActive(event.eventId);
      })
    );
    setActiveAttendanceEvents(statusMap);
    setLoadingAttendanceStatus(false);
  }, [pageData.content, token]);

  useEffect(() => {
    if (pageData.content && pageData.content.length > 0) {
      checkAllEventsAttendance();
    }
  }, [pageData.content, checkAllEventsAttendance]);

  // ── Filter handlers ─────────────────────────────────────────────────────────
  const applyServerFilter = (newFilter) => {
    setServerFilter(newFilter);
    loadPage(newFilter, 0);
  };

  const handleEnrollmentStatusChange = (value) => {
    setSelectedStatus(value);
    setSelectedCompleted("all");
    applyServerFilter(value === "all" ? "all" : `enrollment:${value}`);
  };

  const handleCompletedStatusChange = (value) => {
    setSelectedCompleted(value);
    setSelectedStatus("all");
    applyServerFilter(value === "all" ? "all" : `completed:${value === "completed" ? "true" : "false"}`);
  };

  const handleFilterTypeChange = (type) => {
    setFilterType(filterType === type ? "all" : type);
    setSelectedDepartment("all");
    setSelectedClub("all");
    setCurrentPage(0);
  };

  const clearAllFilters = async () => {
    setSearchTerm(""); setSelectedDepartment("all"); setSelectedClub("all");
    setSelectedStatus("all"); setSelectedCompleted("all"); setFilterType("all"); setServerFilter("all");
    await loadPage("all", 0);
  };

  // ── Stop attendance directly from card back ───────────────────────────────
  const handleStopAttendanceForEvent = async (eventId) => {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/attendance/stop/${eventId}`,
        {},
        { headers: authHeaders(token) }
      );
      if (res.data?.success) {
        checkAllEventsAttendance();
        loadPage(serverFilter, currentPage);
      } else {
        alert(res.data?.message || "Failed to stop attendance");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Error stopping attendance");
    }
  };

  // ── FIX: Attendance start success handler ──────────────────────────────────
  // The critical fix is here: we capture the QR data returned by the
  // start-attendance API and pass it straight to QRCodeDisplay.
  // This way the component never needs to re-fetch on mount (which was
  // racing with the backend's attendanceActive update and returning false,
  // causing the instant "session ended" flash).
  const handleAttendanceStartSuccess = (apiResponse) => {
    // apiResponse is the full Axios response body: { success, message, data: QRCodeResponse }
    const qrData = apiResponse?.data ?? null;

    if (selectedEventForAttendance) {
      setQrCodeEventId(selectedEventForAttendance.eventId);
      setInitialQRData(qrData);   // ← pass QR data so QRCodeDisplay skips its initial fetch
      setShowQRCodeModal(true);
    }

    // Update attendance badge on card and refresh page list in background
    checkAllEventsAttendance();
    loadPage(serverFilter, currentPage);
  };

  // ── Client-side filter on current page ─────────────────────────────────────
  const filteredEvents = (() => {
    let list = [...(pageData.content || [])];
    if (filterType !== "all") list = list.filter((e) => e.targetType?.toUpperCase() === filterType);
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter((e) =>
        e.title?.toLowerCase().includes(q) ||
        e.description?.toLowerCase().includes(q) ||
        e.organizer?.toLowerCase().includes(q) ||
        e.creatorName?.toLowerCase().includes(q)
      );
    }
    if (selectedDepartment !== "all")
      list = list.filter((e) => e.targetType?.toUpperCase() === "DEPARTMENT" && e.targetIds?.includes(parseInt(selectedDepartment)));
    if (selectedClub !== "all")
      list = list.filter((e) => e.targetType?.toUpperCase() === "CLUB" && e.targetIds?.includes(parseInt(selectedClub)));

    switch (sortBy) {
      case "date":       list.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime)); break;
      case "popularity": list.sort((a, b) => (b.currEnrollments || 0) - (a.currEnrollments || 0)); break;
      case "enrollment": list.sort((a, b) => (b.maxEnrollments  || 0) - (a.maxEnrollments  || 0)); break;
    }
    return list;
  })();

  // ── Edit / Delete ───────────────────────────────────────────────────────────
  const handleEditClick = (event) => {
    const fmt = (d) => d ? new Date(d).toISOString().slice(0, 16) : "";
    setEditingEvent({
      ...event,
      dateTime: fmt(event.dateTime),
      enrollmentDeadline: fmt(event.enrollmentDeadline),
      attendanceWindowStart: fmt(event.attendanceWindowStart),
      attendanceWindowEnd: fmt(event.attendanceWindowEnd),
    });
    setShowEditModal(true);
    setUpdateError(null);
  };

  const handleEditInputChange = (e) => {
    const { name, value, type } = e.target;
    if (type === "number") {
      setEditingEvent((p) => ({ ...p, [name]: value === "" ? "" : parseInt(value) }));
    } else if (name === "targetIds") {
      setEditingEvent((p) => ({
        ...p,
        [name]: value.split(",").map((id) => parseInt(id.trim())).filter((id) => !isNaN(id)),
      }));
    } else {
      setEditingEvent((p) => ({ ...p, [name]: value }));
    }
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    setUpdateError(null);
    try {
      const res = await axios.put(
        `${BASE_URL}/api/events/updateEvent/${editingEvent.eventId}`,
        editingEvent,
        { headers: authHeaders(token) }
      );
      if (res.data.success) {
        setShowEditModal(false);
        setEditingEvent(null);
        await loadPage(serverFilter, currentPage);
      } else {
        setUpdateError(res.data.message || "Failed to update event");
      }
    } catch (err) {
      setUpdateError(err.response?.data?.message || "An error occurred while updating the event");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      await axios.delete(`${BASE_URL}/api/events/deleteEvent/${eventId}`, { headers: authHeaders(token) });
      const targetPage = pageData.content.length === 1 && currentPage > 0 ? currentPage - 1 : currentPage;
      await Promise.all([loadPage(serverFilter, targetPage), fetchAllForStats(token).then(setStatsEvents)]);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete event");
    }
  };

  // ── Stats ───────────────────────────────────────────────────────────────────
  const stats = {
    total:       statsEvents.length,
    open:        statsEvents.filter((e) => e.enrollmentStatus?.toLowerCase() === "open").length,
    closed:      statsEvents.filter((e) => e.enrollmentStatus?.toLowerCase() === "closed").length,
    enrollments: statsEvents.reduce((s, e) => s + (e.currEnrollments || 0), 0),
    global:      statsEvents.filter((e) => e.targetType?.toUpperCase() === "GLOBAL").length,
    club:        statsEvents.filter((e) => e.targetType?.toUpperCase() === "CLUB").length,
    dept:        statsEvents.filter((e) => e.targetType?.toUpperCase() === "DEPARTMENT").length,
  };

  const hasAnyFilter = serverFilter !== "all" || filterType !== "all" || selectedDepartment !== "all" || selectedClub !== "all" || searchTerm;
  const totalPages   = pageData.totalPages || 0;

  // ── Loading / Error ─────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-6" />
          <div className="absolute inset-0 flex items-center justify-center"><Sparkles className="w-8 h-8 text-white animate-pulse" /></div>
        </div>
        <p className="text-white text-xl font-light animate-pulse">Loading admin dashboard...</p>
        <p className="text-white/60 text-sm mt-2">Managing events for you</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 max-w-md w-full text-center border border-white/20">
        <div className="bg-red-500/20 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6"><AlertCircle className="w-12 h-12 text-red-400" /></div>
        <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
        <p className="text-white/80 mb-8">{error}</p>
        <button onClick={initLoad} className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all transform hover:scale-105 shadow-lg">Try Again</button>
      </div>
    </div>
  );

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        {/* Animated background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
          <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
        </div>

        {/* Sticky back bar */}
        <div className="sticky top-0 z-50 w-full bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#4CA1AF] transition-colors group">
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /><span>Back to Dashboard</span>
              </button>
            </div>
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-5xl font-bold mb-4">
              <span className="bg-clip-text text-transparent" style={{ background: "linear-gradient(135deg, #4CA1AF, #2C3E50)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Event Management
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl">Monitor, manage, and analyze all events across the platform</p>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-5xl mx-auto mb-6">
            {[
              { label: "Total Events",      value: stats.total,       color: "text-gray-800",   bg: "bg-blue-100",   icon: <Calendar className="w-6 h-6 text-blue-600" /> },
              { label: "Open Events",       value: stats.open,        color: "text-green-600",  bg: "bg-green-100",  icon: <CheckCircle className="w-6 h-6 text-green-600" /> },
              { label: "Closed Events",     value: stats.closed,      color: "text-red-600",    bg: "bg-red-100",    icon: <XCircle className="w-6 h-6 text-red-600" /> },
              { label: "Total Enrollments", value: stats.enrollments, color: "text-purple-600", bg: "bg-purple-100", icon: <Users className="w-6 h-6 text-purple-600" /> },
            ].map(({ label, value, color, bg, icon }) => (
              <div key={label} className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div><p className="text-sm text-gray-600">{label}</p><p className={`text-3xl font-bold ${color}`}>{value}</p></div>
                  <div className={`${bg} p-3 rounded-lg`}>{icon}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Target type stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-8">
            {[
              { label: "Global",     value: stats.global, color: "text-blue-600",   bg: "bg-blue-50/80",   icon: <Globe className="w-5 h-5 text-blue-600 mr-2" /> },
              { label: "Club",       value: stats.club,   color: "text-purple-600", bg: "bg-purple-50/80", icon: <Users className="w-5 h-5 text-purple-600 mr-2" /> },
              { label: "Department", value: stats.dept,   color: "text-green-600",  bg: "bg-green-50/80",  icon: <Briefcase className="w-5 h-5 text-green-600 mr-2" /> },
            ].map(({ label, value, color, bg, icon }) => (
              <div key={label} className={`${bg} backdrop-blur-sm p-4 rounded-xl`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">{icon}<span className="text-sm font-medium text-gray-600">{label}</span></div>
                  <span className={`text-xl font-bold ${color}`}>{value}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Create button */}
          <div className="mb-6 flex justify-end">
            <button
              className="px-4 py-2 text-white rounded-lg shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
              style={{ background: "linear-gradient(135deg, #4CA1AF, #2C3E50)" }}
              onClick={() => navigate("/create-event")}
            >
              <Plus className="w-4 h-4" /><span>Create Event</span>
            </button>
          </div>

          {/* Search & Filter bar */}
          <div className="mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 border border-white/20">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search events by title, description, organizer..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all bg-white/50"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="px-4 py-3 text-white rounded-xl font-medium transition-all transform hover:scale-105 flex items-center space-x-2 shadow-lg"
                    style={{ background: "linear-gradient(135deg, #4CA1AF, #2C3E50)" }}
                  >
                    <Filter className="w-5 h-5" /><span>Filters</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
                  </button>
                  <CustomSelect
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    options={[
                      { value: "date",       label: "Sort by Date" },
                      { value: "popularity", label: "Sort by Popularity" },
                      { value: "enrollment", label: "Sort by Capacity" },
                    ]}
                  />
                </div>
              </div>

              {/* Active filter chips */}
              {hasAnyFilter && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-gray-600 mr-2">Active Filters:</span>
                    {filterType !== "all" && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center">
                        View: {filterType}<button onClick={() => setFilterType("all")} className="ml-2"><X className="w-3 h-3" /></button>
                      </span>
                    )}
                    {selectedDepartment !== "all" && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center">
                        Dept: {departments.find((d) => d.departmentId === parseInt(selectedDepartment))?.name || selectedDepartment}
                        <button onClick={() => setSelectedDepartment("all")} className="ml-2"><X className="w-3 h-3" /></button>
                      </span>
                    )}
                    {selectedClub !== "all" && (
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center">
                        Club: {clubs.find((c) => c.clubId === parseInt(selectedClub))?.clubName || selectedClub}
                        <button onClick={() => setSelectedClub("all")} className="ml-2"><X className="w-3 h-3" /></button>
                      </span>
                    )}
                    {selectedStatus !== "all" && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center">
                        Enrollment: {selectedStatus}
                        <button onClick={() => handleEnrollmentStatusChange("all")} className="ml-2"><X className="w-3 h-3" /></button>
                      </span>
                    )}
                    {selectedCompleted !== "all" && (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm flex items-center">
                        Completion: {selectedCompleted === "completed" ? "Completed" : "Not Completed"}
                        <button onClick={() => handleCompletedStatusChange("all")} className="ml-2"><X className="w-3 h-3" /></button>
                      </span>
                    )}
                    {searchTerm && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center">
                        Search: "{searchTerm}"<button onClick={() => setSearchTerm("")} className="ml-2"><X className="w-3 h-3" /></button>
                      </span>
                    )}
                    <button onClick={clearAllFilters} className="px-3 py-1 text-red-600 hover:text-red-800 text-sm font-medium ml-auto">Clear All</button>
                  </div>
                </div>
              )}

              {/* Filter panel */}
              {showFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm font-medium text-gray-600">View by:</span>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { key: "all",        label: "All Events",       grad: "linear-gradient(135deg,#6B7280,#374151)" },
                        { key: "GLOBAL",     label: "Global Events",    grad: "linear-gradient(135deg,#3B82F6,#06B6D4)" },
                        { key: "DEPARTMENT", label: "Department Events", grad: "linear-gradient(135deg,#10B981,#059669)" },
                        { key: "CLUB",       label: "Club Events",      grad: "linear-gradient(135deg,#8B5CF6,#EC4899)" },
                      ].map(({ key, label, grad }) => (
                        <button
                          key={key}
                          onClick={() => handleFilterTypeChange(key)}
                          className={`px-4 py-2 rounded-lg font-medium transition-all ${filterType === key ? "text-white shadow-lg" : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"}`}
                          style={filterType === key ? { background: grad } : {}}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                      <CustomSelect
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                        options={[
                          { value: "all", label: "All Departments" },
                          ...departments.map((d) => {
                            const cnt = (pageData.content || []).filter((ev) => ev.targetType?.toUpperCase() === "DEPARTMENT" && ev.targetIds?.includes(d.departmentId)).length;
                            return { value: String(d.departmentId), label: `${d.name} (${cnt})` };
                          }),
                        ]}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Club</label>
                      <CustomSelect
                        value={selectedClub}
                        onChange={(e) => setSelectedClub(e.target.value)}
                        options={[
                          { value: "all", label: "All Clubs" },
                          ...clubs.map((c) => {
                            const cnt = (pageData.content || []).filter((ev) => ev.targetType?.toUpperCase() === "CLUB" && ev.targetIds?.includes(c.clubId)).length;
                            return { value: String(c.clubId), label: `${c.clubName} (${cnt})` };
                          }),
                        ]}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Enrollment Status</label>
                      <CustomSelect
                        value={selectedStatus}
                        onChange={(e) => handleEnrollmentStatusChange(e.target.value)}
                        options={[{ value: "all", label: "All Status" }, { value: "open", label: "Open" }, { value: "closed", label: "Closed" }]}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Completion Status</label>
                      <CustomSelect
                        value={selectedCompleted}
                        onChange={(e) => handleCompletedStatusChange(e.target.value)}
                        options={[{ value: "all", label: "All Events" }, { value: "completed", label: "Completed" }, { value: "not-completed", label: "Not Completed" }]}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button onClick={clearAllFilters} className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium">Clear All</button>
                    <button onClick={() => setShowFilters(false)} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Done</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Results summary */}
          <div className="mb-4 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold">{filteredEvents.length}</span> on this page
              {" · "}Total <span className="font-semibold">{pageData.totalElements}</span> events
              {" · "}Page <span className="font-semibold">{currentPage + 1}</span> of <span className="font-semibold">{totalPages || 1}</span>
            </p>
            {pageLoading && <div className="flex items-center gap-2 text-sm text-gray-500"><Loader2 className="w-4 h-4 animate-spin" />Loading...</div>}
          </div>

          {/* Events grid */}
          {filteredEvents.length === 0 && !pageLoading ? (
            <div className="text-center py-16">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 max-w-md mx-auto border border-white/20">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 animate-ping" />
                  </div>
                  <Calendar className="w-20 h-20 text-gray-400 mx-auto mb-4 relative z-10" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">No Events Found</h3>
                <p className="text-gray-600 mb-6">There are no events matching your criteria.</p>
                <button onClick={clearAllFilters} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg">
                  Clear All Filters
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className={`grid gap-4 w-full ${filteredEvents.length === 1 ? "grid-cols-1 max-w-sm mx-auto" : filteredEvents.length === 2 ? "grid-cols-1 md:grid-cols-2 max-w-2xl mx-auto" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"}`}>
                {filteredEvents.map((event, index) => {
                  const daysUntil       = getDaysUntil(event.dateTime);
                  const targetTypeColor = getTargetTypeColor(event.targetType);
                  const enrollmentPct   = (event.currEnrollments / event.maxEnrollments) * 100;

                  return (
                    <div key={event.eventId} className="event-card-container" style={{ animationDelay: `${index * 80}ms` }}>
                      <div className="event-card">
                        {/* Front */}
                        <div className="card-face card-front bg-white/90 backdrop-blur-sm rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-500 border border-white/20">
                          <div className="relative h-32 p-3 overflow-hidden" style={{ background: "linear-gradient(135deg, #4CA1AF, #2C3E50)" }}>
                            <div className="absolute inset-0 opacity-10">
                              <div className="absolute -top-12 -right-12 w-24 h-24 bg-white rounded-full" />
                              <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-white rounded-full" />
                            </div>
                            {daysUntil > 0 && (
                              <div className="absolute top-2 left-2 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                                <span className="text-white text-xs font-semibold">{daysUntil} days to go</span>
                              </div>
                            )}
                            <div className="absolute top-2 right-2">
                              <span className={`text-[10px] font-medium px-2 py-1 rounded-full ${event.completed ? "bg-gray-100 text-gray-600" : "bg-green-100 text-green-600"}`}>
                                {event.completed ? "Completed" : "Upcoming"}
                              </span>
                            </div>
                            <div className="absolute bottom-2 right-2 text-right">
                              <h3 className="text-sm font-bold text-white mb-0.5 line-clamp-1">{event.title}</h3>
                              <p className="text-[10px] text-white/80 line-clamp-1">{event.description}</p>
                            </div>
                          </div>

                          <div className="p-3 space-y-2">
                            <div className="flex flex-wrap gap-1">
                              <div className="bg-blue-50 px-2 py-0.5 rounded-full text-[10px] font-medium text-blue-600 flex items-center">
                                <Calendar className="w-2.5 h-2.5 mr-1" />{formatDateTime(event.dateTime)}
                              </div>
                              <div className="bg-green-50 px-2 py-0.5 rounded-full text-[10px] font-medium text-green-600 flex items-center">
                                <MapPin className="w-2.5 h-2.5 mr-1" />{event.venue}
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-1">
                              <div className="bg-gray-50 p-1.5 rounded-lg">
                                <p className="text-[8px] text-gray-500">Organizer</p>
                                <p className="text-xs font-semibold text-gray-800 flex items-center truncate">
                                  <User className="w-3 h-3 mr-0.5 text-blue-500 flex-shrink-0" /><span className="truncate">{event.organizer}</span>
                                </p>
                              </div>
                              <div className="bg-gray-50 p-1.5 rounded-lg">
                                <p className="text-[8px] text-gray-500">Speaker</p>
                                <p className="text-xs font-semibold text-gray-800 flex items-center truncate">
                                  <User className="w-3 h-3 mr-0.5 text-green-500 flex-shrink-0" /><span className="truncate">{event.speakerName || event.organizer}</span>
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${targetTypeColor} flex items-center`}>
                                {getTargetTypeIcon(event.targetType)}<span className="ml-1 capitalize text-xs">{event.targetType || "N/A"}</span>
                              </span>
                            </div>
                            <div className="text-center text-[8px] mt-1 flex items-center justify-center" style={{ color: "#4CA1AF" }}>
                              <span className="animate-pulse mr-1 text-[6px]">●</span>Hover to view all details
                            </div>
                          </div>
                        </div>

                        {/* Back */}
                        <div className="card-face card-back rounded-xl shadow-md overflow-hidden p-3" style={{ background: "linear-gradient(135deg, #4CA1AF, #2C3E50)" }}>
                          <div className="h-full flex flex-col">
                            <h3 className="text-sm font-bold mb-2 line-clamp-1 text-white">{event.title}</h3>

                            <div className="space-y-1.5 overflow-y-auto flex-1 pr-1 custom-scrollbar text-xs">
                              <div className="grid grid-cols-2 gap-1">
                                <div className="p-1.5 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
                                  <div className="flex items-center mb-0.5"><Calendar className="w-3 h-3 mr-1 text-white/80" /><p className="text-[10px] text-white/80">Date</p></div>
                                  <p className="text-xs font-medium text-white">{formatDateTime(event.dateTime)}</p>
                                </div>
                                <div className="p-1.5 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
                                  <div className="flex items-center mb-0.5"><Clock className="w-3 h-3 mr-1 text-white/80" /><p className="text-[10px] text-white/80">Deadline</p></div>
                                  <p className="text-xs font-medium text-white">{new Date(event.enrollmentDeadline).toLocaleDateString()}</p>
                                </div>
                              </div>

                              <div className="p-1.5 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
                                <p className="text-[10px] text-white/80 mb-1 flex items-center"><Star className="w-2.5 h-2.5 mr-1" />Created By</p>
                                <p className="text-xs font-medium text-white truncate">{event.creatorName}</p>
                              </div>

                              {event.targetType?.toUpperCase() === "DEPARTMENT" && event.targetIds?.length > 0 && (
                                <div className="p-1.5 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
                                  <p className="text-[10px] text-white/80 mb-1 flex items-center"><Briefcase className="w-2.5 h-2.5 mr-1" />Target Departments</p>
                                  <div className="flex flex-wrap gap-1">
                                    {event.targetIds.map((id) => (
                                      <span key={id} className="px-1.5 py-0.5 rounded text-[8px] font-medium text-white" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
                                        {departments.find((d) => d.departmentId === id)?.name || `ID: ${id}`}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {event.targetType?.toUpperCase() === "CLUB" && event.targetIds?.length > 0 && (
                                <div className="p-1.5 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
                                  <p className="text-[10px] text-white/80 mb-1 flex items-center"><Users className="w-2.5 h-2.5 mr-1" />Target Clubs</p>
                                  <div className="flex flex-wrap gap-1">
                                    {event.targetIds.map((id) => (
                                      <span key={id} className="px-1.5 py-0.5 rounded text-[8px] font-medium text-white" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
                                        {clubs.find((c) => c.clubId === id)?.clubName || `ID: ${id}`}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div className="p-1.5 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-[10px] text-white/80">Enrollment</span>
                                  <span className="text-xs text-white">{event.currEnrollments}/{event.maxEnrollments}</span>
                                </div>
                                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
                                  <div className="h-full rounded-full" style={{ width: `${enrollmentPct}%`, backgroundColor: "#4CA1AF" }} />
                                </div>
                              </div>
                            </div>

                            <div className="mt-2 pt-1 border-t border-white/20 flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                <span className="text-[9px] text-white/60">Enrollment:</span>
                                <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${event.enrollmentStatus?.toLowerCase() === "open" ? "bg-green-500/30 text-green-100" : event.enrollmentStatus?.toLowerCase() === "closed" ? "bg-red-500/30 text-red-100" : "bg-yellow-500/30 text-yellow-100"}`}>
                                  {event.enrollmentStatus || "N/A"}
                                </span>
                              </div>
                              <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${event.completed ? "bg-gray-500/30 text-gray-100" : "bg-blue-500/30 text-blue-100"}`}>
                                {event.completed ? "Done" : "Upcoming"}
                              </span>
                            </div>

                            <div className="mt-1.5 flex gap-1">
                              {event.completed ? (
                                /* ── Completed event: no actions available ── */
                                <div className="flex-1 px-2 py-1.5 rounded-lg flex items-center justify-center gap-1"
                                  style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
                                  <CheckCircle className="w-3 h-3 text-gray-300" />
                                  <span className="text-[10px] text-gray-300 font-medium">Event Completed</span>
                                </div>
                              ) : (
                                <>
                                  {/* Attendance button — only for non-completed events */}
                                  {loadingAttendanceStatus ? (
                                    <div className="flex-1 px-1.5 py-1 rounded-lg text-[10px] font-medium flex items-center justify-center text-white bg-gray-400">
                                      <Loader2 className="w-2.5 h-2.5 mr-0.5 animate-spin" />Loading...
                                    </div>
                                  ) : activeAttendanceEvents[event.eventId] ? (
                                    /* Attendance is active → Stop + Show QR on back */
                                    <>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setConfirmDialog({
                                            isOpen: true,
                                            title: "Stop Attendance",
                                            message: "Are you sure you want to stop attendance for this event? Students will no longer be able to mark attendance.",
                                            confirmText: "Stop",
                                            variant: "danger",
                                            onConfirm: () => { closeConfirm(); handleStopAttendanceForEvent(event.eventId); },
                                          });
                                        }}
                                        className="flex-1 px-1.5 py-1 rounded-lg text-[10px] font-medium transition flex items-center justify-center text-white"
                                        style={{ backgroundColor: "rgba(239,68,68,0.6)" }}
                                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.8)")}
                                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.6)")}
                                      >
                                        <XCircle className="w-2.5 h-2.5 mr-0.5" />Stop
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setInitialQRData(null);
                                          setQrCodeEventId(event.eventId);
                                          setShowQRCodeModal(true);
                                        }}
                                        className="flex-1 px-1.5 py-1 rounded-lg text-[10px] font-medium transition flex items-center justify-center text-white"
                                        style={{ backgroundColor: "rgba(156,39,176,0.6)" }}
                                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(156,39,176,0.8)")}
                                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(156,39,176,0.6)")}
                                      >
                                        <svg className="w-2.5 h-2.5 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                        </svg>
                                        QR
                                      </button>
                                    </>
                                  ) : (
                                    /* Attendance not active → Start button */
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedEventForAttendance(event);
                                        setShowAttendancePopup(true);
                                      }}
                                      className="flex-1 px-1.5 py-1 rounded-lg text-[10px] font-medium transition flex items-center justify-center text-white"
                                      style={{ backgroundColor: "rgba(76, 175, 80, 0.5)" }}
                                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(76, 175, 80, 0.6)")}
                                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(76, 175, 80, 0.5)")}
                                    >
                                      <MapPin className="w-2.5 h-2.5 mr-0.5" />Start
                                    </button>
                                  )}

                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleEditClick(event); }}
                                    className="flex-1 px-1.5 py-1 rounded-lg text-[10px] font-medium transition flex items-center justify-center text-white"
                                    style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.3)")}
                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.2)")}
                                  >
                                    <Edit className="w-2.5 h-2.5 mr-0.5" />Edit
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setConfirmDialog({
                                        isOpen: true,
                                        title: "Delete Event",
                                        message: "Are you sure you want to delete this event? This action cannot be undone.",
                                        confirmText: "Delete",
                                        variant: "danger",
                                        onConfirm: () => { closeConfirm(); handleDeleteEvent(event.eventId); },
                                      });
                                    }}
                                    className="flex-1 px-1.5 py-1 rounded-lg text-[10px] font-medium transition flex items-center justify-center text-white"
                                    style={{ backgroundColor: "rgba(239,68,68,0.5)" }}
                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.6)")}
                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.5)")}
                                  >
                                    <Trash2 className="w-2.5 h-2.5 mr-0.5" />Delete
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-10 flex flex-col items-center gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => loadPage(serverFilter, currentPage - 1)}
                      disabled={currentPage === 0 || pageLoading}
                      className="p-2 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i)
                      .filter((i) => i === 0 || i === totalPages - 1 || Math.abs(i - currentPage) <= 1)
                      .reduce((acc, i, idx, arr) => {
                        if (idx > 0 && i - arr[idx - 1] > 1) acc.push(`e-${i}`);
                        acc.push(i);
                        return acc;
                      }, [])
                      .map((item) =>
                        typeof item === "string" ? (
                          <span key={item} className="px-2 text-gray-400">…</span>
                        ) : (
                          <button
                            key={item}
                            onClick={() => loadPage(serverFilter, item)}
                            disabled={pageLoading}
                            className={`w-9 h-9 rounded-full text-sm font-medium transition border disabled:cursor-not-allowed ${currentPage === item ? "text-white border-transparent" : "text-gray-600 border-gray-200 hover:bg-gray-50"}`}
                            style={currentPage === item ? { background: "linear-gradient(135deg, #4CA1AF, #2C3E50)" } : {}}
                          >
                            {item + 1}
                          </button>
                        )
                      )}

                    <button
                      onClick={() => loadPage(serverFilter, currentPage + 1)}
                      disabled={pageData.last || pageLoading}
                      className="p-2 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-400">Page {currentPage + 1} of {totalPages} — {pageData.totalElements} total events</p>
                </div>
              )}
            </>
          )}

          {/* Footer */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center space-x-2 text-gray-500 text-sm">
              <Settings className="w-4 h-4" />
              <span>Admin controls active · {pageData.totalElements} events total</span>
              <Share2 className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        {showEditModal && editingEvent && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowEditModal(false)} />
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl z-10">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold" style={{ background: "linear-gradient(135deg, #4CA1AF, #2C3E50)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Edit Event</h2>
                    <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
                  </div>
                </div>

                <form onSubmit={handleUpdateEvent} className="p-6">
                  {updateError && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" /><p className="text-sm text-red-600">{updateError}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      {[
                        { label: "Event Title *",  name: "title",     type: "text",           required: true, placeholder: "Enter event title" },
                        { label: "Venue *",        name: "venue",     type: "text",           required: true, placeholder: "Enter venue" },
                        { label: "Organizer *",    name: "organizer", type: "text",           required: true, placeholder: "Enter organizer name" },
                        { label: "Date & Time *",  name: "dateTime",  type: "datetime-local", required: true },
                      ].map(({ label, name, type, required, placeholder }) => (
                        <div key={name}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                          <input type={type} name={name} value={editingEvent[name]} onChange={handleEditInputChange} required={required} placeholder={placeholder}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA1AF] focus:border-transparent transition-all" />
                        </div>
                      ))}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                        <textarea name="description" value={editingEvent.description} onChange={handleEditInputChange} required rows="3" placeholder="Enter event description"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA1AF] focus:border-transparent transition-all" />
                      </div>
                    </div>

                    <div className="space-y-4">
                      {[
                        { label: "Speaker Name",          name: "speakerName",        type: "text",           placeholder: "Enter speaker name" },
                        { label: "Max Enrollments *",     name: "maxEnrollments",     type: "number",         required: true, min: 1 },
                        { label: "Enrollment Deadline *", name: "enrollmentDeadline", type: "datetime-local", required: true },
                      ].map(({ label, name, type, required, placeholder, min }) => (
                        <div key={name}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                          <input type={type} name={name} value={editingEvent[name]} onChange={handleEditInputChange} required={required} placeholder={placeholder} min={min}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA1AF] focus:border-transparent transition-all" />
                        </div>
                      ))}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Target Type *</label>
                        <CustomSelect name="targetType" value={editingEvent.targetType} onChange={handleEditInputChange} required
                          options={[{ value: "GLOBAL", label: "Global" }, { value: "CLUB", label: "Club" }, { value: "DEPARTMENT", label: "Department" }]} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Target IDs (comma-separated)</label>
                        <input type="text" name="targetIds" value={editingEvent.targetIds?.join(", ") || ""} onChange={handleEditInputChange} placeholder="e.g., 1, 2, 3"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA1AF] focus:border-transparent transition-all" />
                        <p className="text-xs text-gray-500 mt-1">Enter department or club IDs separated by commas</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Location Details (Optional)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { label: "Latitude",        name: "latitude",       placeholder: "e.g., 18.5204", step: "any" },
                        { label: "Longitude",       name: "longitude",      placeholder: "e.g., 73.8567", step: "any" },
                        { label: "Radius (meters)", name: "radiusInMeters", placeholder: "e.g., 100",     min: 0 },
                      ].map(({ label, name, placeholder, step, min }) => (
                        <div key={name}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                          <input type="number" name={name} value={editingEvent[name] || ""} onChange={handleEditInputChange} step={step} min={min} placeholder={placeholder}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA1AF] focus:border-transparent transition-all" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Attendance Settings (Optional)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Window Start</label>
                        <input type="datetime-local" name="attendanceWindowStart" value={editingEvent.attendanceWindowStart || ""} onChange={handleEditInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA1AF] focus:border-transparent transition-all" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Window End</label>
                        <input type="datetime-local" name="attendanceWindowEnd" value={editingEvent.attendanceWindowEnd || ""} onChange={handleEditInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA1AF] focus:border-transparent transition-all" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">QR Refresh Interval (sec)</label>
                        <input type="number" name="qrRefreshInterval" value={editingEvent.qrRefreshInterval || 0} onChange={handleEditInputChange} min="0" placeholder="e.g., 30"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA1AF] focus:border-transparent transition-all" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end gap-3">
                    <button type="button" onClick={() => setShowEditModal(false)} className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors">Cancel</button>
                    <button type="submit" disabled={updateLoading} className="px-6 py-2.5 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2" style={{ background: "linear-gradient(135deg, #4CA1AF, #2C3E50)" }}>
                      {updateLoading ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Updating...</span></> : <><Edit className="w-4 h-4" /><span>Update Event</span></>}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        <style jsx>{`
          @keyframes blob { 0%{transform:translate(0,0) scale(1)} 33%{transform:translate(30px,-50px) scale(1.1)} 66%{transform:translate(-20px,20px) scale(0.9)} 100%{transform:translate(0,0) scale(1)} }
          .animate-blob{animation:blob 7s infinite} .animation-delay-2000{animation-delay:2s} .animation-delay-4000{animation-delay:4s}
          .event-card-container{perspective:1000px;height:280px}
          .event-card{transform-style:preserve-3d;transition:transform 0.5s ease-in-out;width:100%;height:100%;position:relative}
          .event-card-container:hover .event-card{transform:rotateY(180deg)}
          .card-face{position:absolute;width:100%;height:100%;backface-visibility:hidden;border-radius:.75rem;overflow:hidden}
          .card-front{transform:rotateY(0deg)} .card-back{transform:rotateY(180deg)}
          .custom-scrollbar::-webkit-scrollbar{width:2px} .custom-scrollbar::-webkit-scrollbar-track{background:rgba(255,255,255,.1);border-radius:10px}
          .custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(255,255,255,.3);border-radius:10px}
          .line-clamp-1{display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden}
        `}</style>
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        variant={confirmDialog.variant}
        onConfirm={confirmDialog.onConfirm}
        onCancel={closeConfirm}
      />

      <StartAttendancePopup
        isOpen={showAttendancePopup}
        onClose={() => {
          setShowAttendancePopup(false);
          setSelectedEventForAttendance(null);
        }}
        event={selectedEventForAttendance}
        onSuccess={handleAttendanceStartSuccess}
        token={token}
      />

      {/* QR Code Modal — single overlay here, QRCodeDisplay renders content only */}
      {showQRCodeModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowQRCodeModal(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl">
              <QRCodeDisplay
                eventId={qrCodeEventId}
                token={token}
                initialQRData={initialQRData}
                onClose={() => {
                  setShowQRCodeModal(false);
                  setInitialQRData(null);
                  checkAllEventsAttendance();
                }}
                onAttendanceEnd={() => {
                  setShowQRCodeModal(false);
                  setInitialQRData(null);
                  checkAllEventsAttendance();
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ─── QRCodeDisplay ─────────────────────────────────────────────────────────────
// Accepts `initialQRData` (the QRCodeResponse from the start-attendance call).
// When provided it skips the initial active-check and uses the data directly,
// avoiding the race condition that caused the instant "session ended" flash.
const QRCodeDisplay = ({ eventId, token, initialQRData, onClose, onAttendanceEnd }) => {
  const [qrData, setQrData]               = useState(initialQRData ?? null);
  const [loading, setLoading]             = useState(!initialQRData);   // skip loading if we already have data
  const [error, setError]                 = useState(null);
  const [timeLeft, setTimeLeft]           = useState(initialQRData?.refreshInSeconds ?? 0);
  const [attendanceActive, setAttendanceActive] = useState(true);       // assume active on mount
  const [eventDetails, setEventDetails]   = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(initialQRData?.refreshInSeconds ?? 120);
  const [stopLoading, setStopLoading]     = useState(false);
  const [stopError, setStopError]         = useState(null);

  const qrTimerRef       = useRef(null);
  const statusCheckRef   = useRef(null);
  const countdownRef     = useRef(null);
  // Fires exactly when attendanceWindowEnd is reached so the modal closes
  // without waiting for the next 10-second status poll.
  const windowEndTimerRef = useRef(null);
  const isFirstCheckRef  = useRef(true);

  // ── Stop attendance ──────────────────────────────────────────────────────
  const handleStopAttendance = async () => {
    setStopLoading(true);
    setStopError(null);
    try {
      const res = await axios.post(
        `${BASE_URL}/api/attendance/stop/${eventId}`,
        {},
        { headers: authHeaders(token) }
      );
      if (res.data?.success) {
        if (qrTimerRef.current)        clearTimeout(qrTimerRef.current);
        if (statusCheckRef.current)    clearInterval(statusCheckRef.current);
        if (countdownRef.current)      clearInterval(countdownRef.current);
        if (windowEndTimerRef.current) clearTimeout(windowEndTimerRef.current);
        setAttendanceActive(false);
        if (onAttendanceEnd) onAttendanceEnd();
      } else {
        setStopError(res.data?.message || "Failed to stop attendance");
      }
    } catch (err) {
      setStopError(err.response?.data?.message || "Error stopping attendance");
    } finally {
      setStopLoading(false);
    }
  };

  // ── Fetch helpers ─────────────────────────────────────────────────────────
  // Schedule a one-shot timer that fires exactly when the attendance window
  // closes. This means the QR modal disappears the moment the window ends
  // rather than waiting up to 10 s for the next status poll.
  const scheduleWindowEndTimer = useCallback((windowEnd) => {
    if (windowEndTimerRef.current) clearTimeout(windowEndTimerRef.current);
    if (!windowEnd) return;
    const msUntilEnd = new Date(windowEnd) - Date.now();
    if (msUntilEnd <= 0) return; // already past — status poll will handle it
    windowEndTimerRef.current = setTimeout(() => {
      setAttendanceActive(false);
      if (qrTimerRef.current)     clearTimeout(qrTimerRef.current);
      if (statusCheckRef.current) clearInterval(statusCheckRef.current);
      if (countdownRef.current)   clearInterval(countdownRef.current);
      if (onAttendanceEnd) onAttendanceEnd();
    }, msUntilEnd);
  }, [onAttendanceEnd]);

  const fetchEventDetails = useCallback(async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/events/getById/${eventId}`,
        { headers: authHeaders(token) }
      );
      const data = res.data?.data;
      setEventDetails(data);
      // Re-arm the window-end timer every time we get fresh event details
      // (covers the case where the window was updated while modal is open).
      scheduleWindowEndTimer(data?.attendanceWindowEnd);
      return data?.attendanceActive ?? false;
    } catch (err) {
      console.error("Error fetching event details:", err);
      return true; // be optimistic on error — don't kill the session
    }
  }, [eventId, token, scheduleWindowEndTimer]);

  const fetchQRCode = useCallback(async () => {
    try {
      setError(null);
      const res = await axios.get(
        `${BASE_URL}/api/attendance/qr-code/${eventId}`,
        { headers: authHeaders(token) }
      );
      if (res.data?.success) {
        const newQr = res.data.data;
        setQrData(newQr);
        const secs = newQr.refreshInSeconds || 120;
        setRefreshInterval(secs);
        setTimeLeft(secs);

        if (qrTimerRef.current) clearTimeout(qrTimerRef.current);
        qrTimerRef.current = setTimeout(fetchQRCode, secs * 1000);
      } else {
        setError("Failed to fetch QR code");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching QR code");
    } finally {
      setLoading(false);
    }
  }, [eventId, token]);

  // ── Init ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      if (initialQRData) {
        // We already have fresh QR data from the start response —
        // schedule the first auto-refresh and skip the active check entirely.
        const secs = initialQRData.refreshInSeconds || 120;
        setRefreshInterval(secs);
        setTimeLeft(secs);
        if (qrTimerRef.current) clearTimeout(qrTimerRef.current);
        qrTimerRef.current = setTimeout(fetchQRCode, secs * 1000);
        // Fetch event details once in background to get attendanceWindowEnd
        // so we can arm the window-end timer, but don't block on the result.
        fetchEventDetails();
      } else {
        // Opened from "Show QR" on an already-active session.
        // Check active status first, THEN fetch QR.
        const isActive = await fetchEventDetails();
        isFirstCheckRef.current = false;
        if (!isActive) {
          if (mounted) {
            setAttendanceActive(false);
            setLoading(false);
          }
          return;
        }
        if (mounted) await fetchQRCode();
      }

      // Poll attendance status every 10 seconds.
      // Skip the very first result if we came from initialQRData
      // (give the backend 10 s before we trust a "false").
      statusCheckRef.current = setInterval(async () => {
        const isActive = await fetchEventDetails();
        if (!mounted) return;
        if (!isActive) {
          setAttendanceActive(false);
          if (qrTimerRef.current)     clearTimeout(qrTimerRef.current);
          if (statusCheckRef.current) clearInterval(statusCheckRef.current);
          if (countdownRef.current)   clearInterval(countdownRef.current);
          if (onAttendanceEnd) onAttendanceEnd();
        }
      }, 10000);
    };

    initialize();

    return () => {
      mounted = false;
      if (qrTimerRef.current)      clearTimeout(qrTimerRef.current);
      if (statusCheckRef.current)  clearInterval(statusCheckRef.current);
      if (countdownRef.current)    clearInterval(countdownRef.current);
      if (windowEndTimerRef.current) clearTimeout(windowEndTimerRef.current);
    };
  }, [eventId]); // intentionally omit helpers from deps to avoid re-running

  // ── Countdown ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    if (timeLeft <= 0) return;

    countdownRef.current = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? refreshInterval : prev - 1));
    }, 1000);

    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, [refreshInterval]);

  // Sync countdown when new QR data arrives
  useEffect(() => {
    if (qrData?.refreshInSeconds) {
      setRefreshInterval(qrData.refreshInSeconds);
      setTimeLeft(qrData.refreshInSeconds);
    }
  }, [qrData]);

  // ── Window time remaining ───────────────────────────────────────────────────
  const getWindowTimeRemaining = () => {
    if (!eventDetails?.attendanceWindowEnd) return null;
    const remaining = new Date(eventDetails.attendanceWindowEnd) - new Date();
    if (remaining <= 0) return null;
    const m = Math.floor(remaining / 60000);
    const s = Math.floor((remaining % 60000) / 1000);
    return `${m}m ${s}s`;
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  if (!attendanceActive) {
    return (
      <div className="text-center py-8 p-6">
        <div className="bg-yellow-50 rounded-lg p-6">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Attendance Session Ended</h3>
          <p className="text-gray-600 mb-4">The attendance session for this event is no longer active.</p>
          <button onClick={onClose} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">Close</button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12 p-6">
        <Loader2 className="w-12 h-12 animate-spin text-[#4CA1AF] mx-auto" />
        <p className="text-gray-600 mt-4">Loading QR code...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 p-6">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={() => { setLoading(true); fetchQRCode(); }} className="px-4 py-2 bg-[#4CA1AF] text-white rounded-lg hover:bg-[#3d8a9c]">Retry</button>
      </div>
    );
  }

  const windowTimeRemaining = getWindowTimeRemaining();

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-3 mb-6">
        <h2 className="text-lg font-semibold" style={{ background: "linear-gradient(135deg, #4CA1AF, #2C3E50)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Attendance QR Code
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Left — QR image */}
        <div className="md:col-span-3 text-center">
          <div className="p-4 rounded-lg mb-4 text-white flex justify-between items-center" style={{ background: "linear-gradient(135deg, #4CA1AF, #2C3E50)" }}>
            <span className="text-sm">Next QR refresh in:</span>
            <span className="text-2xl font-bold tabular-nums">{timeLeft}s</span>
          </div>

          {windowTimeRemaining && (
            <div className="mb-3 px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-700 flex items-center justify-center gap-2">
              <Clock className="w-4 h-4" />
              Window closes in: <span className="font-semibold">{windowTimeRemaining}</span>
            </div>
          )}

          {qrData?.qrToken && (
            <>
              <div className="bg-white p-4 rounded-xl shadow-md inline-block border border-gray-100">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(qrData.qrToken)}`}
                  className="w-60 h-60"
                  alt="Attendance QR Code"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Expires: {new Date(qrData.expiresAt).toLocaleTimeString()}
              </p>
            </>
          )}
        </div>

        {/* Right — Token + Instructions */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-2">Manual Entry Token:</p>
            <code className="bg-gray-800 text-green-400 p-3 rounded-lg block break-all text-xs leading-relaxed">
              {qrData?.qrToken}
            </code>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 text-sm">
            <p className="font-semibold text-blue-700 mb-2">Instructions</p>
            <ul className="space-y-1.5 text-blue-800 text-xs list-disc list-inside">
              <li>Students scan this QR code to mark attendance</li>
              <li>QR auto-refreshes every {refreshInterval}s for security</li>
              <li>Students must be within the geofence radius</li>
              <li>Attendance can only be marked during the active window</li>
            </ul>
          </div>

          <button onClick={onClose} className="mt-auto px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors self-end">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyEventsForSuperadmin;