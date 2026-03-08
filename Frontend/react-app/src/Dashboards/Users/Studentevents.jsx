import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import CustomSelect from "../../components/CustomSelect";
import ConfirmDialog from "../../components/ConfirmDialog";
import MarkAttendancePopup from "../../components/MarkAttendancePopup";
import PaginationControls from "../../components/Paginationcontrols";
import {
  getTargetTypeIcon,
  getTargetTypeColor,
  formatDateTime,
  formatDateOnly,
  getDaysUntil,
  isEventVisibleToUser,
  sharedStyles,
} from "../../components/EventUtils";
import {
  Calendar,
  MapPin,
  Users,
  User,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  Radio,
  Sparkles,
  Star,
  Briefcase,
  X,
  Filter,
  ChevronDown,
  Search,
  Bell,
  Gift,
  ArrowLeft,
  CheckSquare,
  Camera,
} from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_URL || "http://72.155.88.211:8080";

// ─── StudentEvents ─────────────────────────────────────────────────────────────
const StudentEvents = () => {
  const navigate = useNavigate();

  // ── Core state ─────────────────────────────────────────────────
  const [events, setEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userPrn, setUserPrn] = useState("");
  const [userDept, setUserDept] = useState("");
  const [deptId, setDeptId] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [userClubs, setUserClubs] = useState([]);
  const [allClubs, setAllClubs] = useState([]);
  const [userMap, setUserMap] = useState({});

  // ── Filter / UI state ──────────────────────────────────────────
  const [filterType, setFilterType] = useState("GLOBAL");
  const [selectedClubId, setSelectedClubId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("date");
  const [showClubDropdown, setShowClubDropdown] = useState(false);
  const [showEnrolledEvents, setShowEnrolledEvents] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [completedFilter, setCompletedFilter] = useState("all");

  // ── Enrollment state ───────────────────────────────────────────
  const [enrolledEvents, setEnrolledEvents] = useState([]);
  const [enrollingEventId, setEnrollingEventId] = useState(null);
  const [revokingEventId, setRevokingEventId] = useState(null);
  const [enrollmentMessage, setEnrollmentMessage] = useState({
    show: false, eventId: null, success: false, message: "",
  });

  // ── Attendance state ───────────────────────────────────────────
  // activeAttendanceEvents: { [eventId]: { active, withinWindow, canMark, eventData } }
  const [activeAttendanceEvents, setActiveAttendanceEvents] = useState({});
  // markedAttendanceEvents: { [eventId]: true } — student already marked for this event
  const [markedAttendanceEvents, setMarkedAttendanceEvents] = useState({});
  const [markingAttendanceId, setMarkingAttendanceId] = useState(null);
  const [attendanceMessage, setAttendanceMessage] = useState({
    show: false, eventId: null, success: false, message: "",
  });
  const [showMarkAttendancePopup, setShowMarkAttendancePopup] = useState(false);
  const [selectedEventForMarking, setSelectedEventForMarking] = useState(null);

  // ── Pagination ──────────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(12);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // ── Confirm dialog ──────────────────────────────────────────────
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false, title: "", message: "", variant: "primary",
    confirmText: "Confirm", onConfirm: () => {},
  });
  const closeConfirm = () => setConfirmDialog((p) => ({ ...p, isOpen: false }));

  // ── CustomSelect option sets ────────────────────────────────────
  const enrollmentStatusOptions = [
    { value: "all",    label: "Enrollment Status" },
    { value: "open",   label: "Open"              },
    { value: "closed", label: "Closed"            },
  ];
  const completedStatusOptions = [
    { value: "all",          label: "Completed Status" },
    { value: "completed",    label: "Completed"        },
    { value: "notCompleted", label: "Not Completed"    },
  ];
  const sortOptions = [
    { value: "date",       label: "Sort by Date"       },
    { value: "popularity", label: "Sort by Popularity" },
    { value: "enrollment", label: "Sort by Capacity"   },
  ];

  // ── Init ────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      const user  = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found. Please login again.");
        setLoading(false);
        return;
      }
      const prn = user?.prn;
      if (prn) setUserPrn(prn);
      fetchDepartments(token);
      fetchUserProfile(token);
      fetchUserClubs(token);
      fetchAllClubs(token);
      if (prn) await fetchUserEnrollments(token, prn);
      fetchEventsPaged(token, "GLOBAL", null, 0, 12);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-check attendance status whenever enrolled events change
  useEffect(() => {
    if (enrolledEvents.length > 0) {
      checkAttendanceStatus();
    } else {
      setActiveAttendanceEvents({});
      setMarkedAttendanceEvents({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enrolledEvents]);

  // ── API helpers ─────────────────────────────────────────────────
  const fetchUserProfile = async (token) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const prn  = user?.prn;
      if (!prn) return;
      setUserPrn(prn);
      const response = await axios.get(
        `${BASE_URL}/api/profiles/prn/${prn}`,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } },
      );
      if (response.data.success) {
        const profile = response.data.data;
        setUserDept(profile.department);
        fetchDepartmentId(token, profile.department);
        fetchUserEnrollments(token, prn);
      }
    } catch (err) { console.error("Error fetching user profile:", err); }
  };

  const fetchDepartments = async (token) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/department`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (response.data.success) setDepartments(response.data.data);
    } catch (err) { console.error("Error fetching departments:", err); }
  };

  const fetchDepartmentId = async (token, deptName) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/department`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (response.data.success) {
        const dept = response.data.data.find((d) => d.name === deptName);
        if (dept) setDeptId(dept.departmentId);
      }
    } catch (err) { console.error("Error fetching department ID:", err); }
  };

  const fetchUserClubs = async (token) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/user-clubs/getMyClubs`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (response.data.success) setUserClubs(response.data.data);
    } catch (err) { console.error("Error fetching user clubs:", err); }
  };

  const fetchAllClubs = async (token) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/clubs`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (response.data.success) setAllClubs(response.data.data);
    } catch (err) { console.error("Error fetching all clubs:", err); }
  };

  const fetchUserNameByPrn = async (token, prn) => {
    if (userMap[prn]) return userMap[prn];
    try {
      const response = await axios.get(
        `${BASE_URL}/api/profiles/prn/${prn}`,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } },
      );
      if (response.data.success) {
        const name = response.data.data.name || response.data.data.fullName || prn;
        setUserMap((prev) => ({ ...prev, [prn]: name }));
        return name;
      }
    } catch (err) { console.error(`Error fetching user for PRN ${prn}:`, err); }
    return prn;
  };

  const enrichWithCreatorNames = async (token, list) => {
    if (!list.length) return list;
    return Promise.all(
      list.map(async (event) => {
        if (!event.creatorName || event.creatorName.match(/^\d+$/)) {
          const creatorName = await fetchUserNameByPrn(token, event.creatorPrn);
          return { ...event, creatorName };
        }
        return event;
      }),
    );
  };

  const applyPageResponse = (data) => {
    setTotalPages(data.totalPages ?? 0);
    setTotalElements(data.totalElements ?? 0);
    setCurrentPage(data.pageNumber ?? 0);
  };

  // ── Core paginated fetcher ─────────────────────────────────────
  const fetchEventsPaged = async (token, filter = "GLOBAL", targetId = null, page = 0, size = pageSize) => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
      const params  = { page, size };
      let response;

      if (filter === "DEPARTMENT" && targetId) {
        response = await axios.get(
          `${BASE_URL}/api/events/targetData/DEPARTMENT/${targetId}/paged`,
          { headers, params },
        );
      } else if (filter === "CLUB" && targetId) {
        response = await axios.get(
          `${BASE_URL}/api/events/targetData/CLUB/${targetId}/paged`,
          { headers, params },
        );
      } else {
        response = await axios.get(
          `${BASE_URL}/api/events/getByTargetType/GLOBAL/paged`,
          { headers, params },
        );
      }

      if (response?.data?.success) {
        const pageData = response.data.data;
        let fetched = pageData.content || [];
        fetched = await enrichWithCreatorNames(token, fetched);
        setEvents(fetched);
        setAllEvents(fetched);
        applyPageResponse(pageData);
      }
    } catch (err) {
      console.error("Error fetching events:", err);
      setError(err.message || "An error occurred while fetching events");
    } finally {
      setLoading(false);
    }
  };

  const fetchEventsByCompletedStatusPaged = async (completed, page = 0, size = pageSize) => {
    try {
      setLoading(true);
      const token      = localStorage.getItem("token");
      const user       = JSON.parse(localStorage.getItem("user"));
      const currentPrn = user?.prn || userPrn;
      const headers    = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
      const response   = await axios.get(
        `${BASE_URL}/api/events/endEvent/${completed}/paged`,
        { headers, params: { page, size } },
      );
      if (response.data.success) {
        const pageData = response.data.data;
        let fetched    = pageData.content || [];
        fetched = await enrichWithCreatorNames(token, fetched);
        fetched = fetched.filter((event) =>
          isEventVisibleToUser(event, deptId, userClubs, currentPrn, false),
        );
        setEvents(fetched);
        setAllEvents(fetched);
        applyPageResponse(pageData);
      }
    } catch (err) {
      console.error("Error fetching events by completed status:", err);
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const fetchEventsByDeadlinePaged = async (status, page = 0, size = pageSize) => {
    try {
      setLoading(true);
      const token      = localStorage.getItem("token");
      const user       = JSON.parse(localStorage.getItem("user"));
      const currentPrn = user?.prn || userPrn;
      const headers    = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
      const response   = await axios.get(
        `${BASE_URL}/api/events/enrollment/${status}/paged`,
        { headers, params: { page, size } },
      );
      if (response.data.success) {
        const pageData = response.data.data;
        let fetched    = pageData.content || [];
        fetched = await enrichWithCreatorNames(token, fetched);
        fetched = fetched.filter((event) =>
          isEventVisibleToUser(event, deptId, userClubs, currentPrn, false),
        );
        setEvents(fetched);
        setAllEvents(fetched);
        applyPageResponse(pageData);
      }
    } catch (err) {
      console.error("Error fetching events by deadline:", err);
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // ── Enrolled events (client-side pagination) ───────────────────
  const fetchEnrolledEvents = async () => {
    try {
      setLoading(true);
      const token    = localStorage.getItem("token");
      const response = await axios.get(
        `${BASE_URL}/api/enrollments/myEnrollments`,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } },
      );

      if (response.data.success) {
        const enrollmentData = response.data.data;
        const enrolledEventsList = Object.keys(enrollmentData)
          .map((key) => {
            try {
              const g = (rx) => { const m = key.match(rx); return m ? m[1].trim() : ""; };
              const eventIdMatch = key.match(/eventId=(\d+)/);
              const eventId      = eventIdMatch ? parseInt(eventIdMatch[1]) : null;
              let creatorName    = g(/creatorName=([^,\]]+)/);
              const creatorPrn   = g(/creatorPrn=([^,\]]+)/);
              if (!creatorName || creatorName.match(/^\d+$/)) creatorName = creatorPrn;
              const enrollmentDeadlineRaw = g(/enrollmentDeadline=([^,\]]+)/);
              const targetIdsRaw = key.match(/targetIds=\[([^\]]*)\]/);
              const targetIds    = targetIdsRaw
                ? targetIdsRaw[1].split(",").map((s) => parseInt(s.trim())).filter((n) => !isNaN(n))
                : [];
              return {
                eventId, title: g(/title=([^,]+)/), description: g(/description=([^,]+)/),
                dateTime: g(/dateTime=([^,]+)/), organizer: g(/organizer=([^,]+)/),
                speakerName: g(/speakerName=([^,]+)/), venue: g(/venue=([^,]+)/),
                maxEnrollments: parseInt(g(/maxEnrollments=(\d+)/) || 0),
                currEnrollments: parseInt(g(/currEnrollments=(\d+)/) || 0),
                enrollmentStatus: g(/enrollmentStatus=([^,\]]+)/),
                enrollmentDeadline: enrollmentDeadlineRaw || null,
                targetType: g(/targetType=([^,\]]+)/), targetIds,
                completed: g(/isCompleted=([^,\]]+)/) === "true",
                creatorPrn, creatorName,
              };
            } catch (e) { return null; }
          })
          .filter((e) => e !== null && e.eventId !== null);

        const enriched = await enrichWithCreatorNames(token, enrolledEventsList);
        const start    = currentPage * pageSize;
        const paged    = enriched.slice(start, start + pageSize);
        setEvents(paged);
        setAllEvents(enriched);
        setTotalElements(enriched.length);
        setTotalPages(Math.ceil(enriched.length / pageSize));
        setCurrentPage(0);
        setEnrolledEvents(enriched.map((e) => e.eventId));
        setFilterType("");
        setSelectedClubId("");
        setCompletedFilter("all");
        setSelectedStatus("all");
        setShowEnrolledEvents(true);
      }
    } catch (err) {
      console.error("Error fetching enrolled events:", err);
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserEnrollments = async (token, prn) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/enrollments/myEnrollments`,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } },
      );
      if (response.data.success) {
        const ids = Object.keys(response.data.data)
          .map((key) => { const m = key.match(/eventId=(\d+)/); return m ? Number(m[1]) : null; })
          .filter((id) => id !== null);
        setEnrolledEvents(ids);
      }
    } catch (err) { console.error("Error fetching user enrollments:", err); }
  };

  // ── Attendance status (event-level active + personal marked check) ──────────
  const checkAttendanceStatus = async () => {
    const token = localStorage.getItem("token");
    if (!token || !enrolledEvents.length) return;

    const activeMap = {};
    const markedMap = {};

    await Promise.all(
      enrolledEvents.map(async (eventId) => {
        try {
          // 1. Check if event-level attendance is active and window is open
          const eventRes = await axios.get(
            `${BASE_URL}/api/events/getById/${eventId}`,
            { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } },
          );
          if (eventRes.data.success && eventRes.data.data) {
            const event       = eventRes.data.data;
            const now         = new Date();
            const windowStart = event.attendanceWindowStart ? new Date(event.attendanceWindowStart) : null;
            const windowEnd   = event.attendanceWindowEnd   ? new Date(event.attendanceWindowEnd)   : null;
            const isWithinWindow = windowStart && windowEnd && now >= windowStart && now <= windowEnd;

            activeMap[eventId] = {
              active:       event.attendanceActive === true,
              withinWindow: isWithinWindow,
              canMark:      event.attendanceActive === true && isWithinWindow,
              eventData:    event,
            };
          }

          // 2. Check if THIS student has already marked attendance for this event
          try {
            const statusRes = await axios.get(
              `${BASE_URL}/api/attendance/status/${eventId}`,
              { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } },
            );
            // Mark as done if the response indicates the student is present
            // Handles both { data: { present: true } } and { data: { marked: true } } shapes
            const d = statusRes.data?.data;
            if (d) {
              markedMap[eventId] = d.status === "PRESENT" || d.present === true || d.marked === true || d.attended === true;
            }
          } catch (statusErr) {
            // 404 or similar means not marked yet — treat as false
            markedMap[eventId] = false;
          }
        } catch (err) {
          console.error(`Error checking attendance for event ${eventId}:`, err);
        }
      }),
    );

    setActiveAttendanceEvents(activeMap);
    setMarkedAttendanceEvents(markedMap);
  };

  const handleMarkAttendanceSuccess = () => {
    setAttendanceMessage({
      show: true, eventId: selectedEventForMarking?.eventId,
      success: true, message: "Attendance marked successfully!",
    });
    // Mark locally immediately so the button disappears right away
    setMarkedAttendanceEvents((prev) => ({
      ...prev,
      [selectedEventForMarking?.eventId]: true,
    }));
    // Then re-check from server to stay in sync
    checkAttendanceStatus();
    setShowMarkAttendancePopup(false);
    setSelectedEventForMarking(null);
    setTimeout(
      () => setAttendanceMessage({ show: false, eventId: null, success: false, message: "" }),
      3000,
    );
  };

  // ── Enroll / Revoke ────────────────────────────────────────────
  const handleEnroll = async (eventId) => {
    try {
      setEnrollingEventId(eventId);
      const token = localStorage.getItem("token");
      if (!token) { alert("Please login to enroll"); return; }
      const response = await axios.post(
        `${BASE_URL}/api/enrollments/${eventId}`, {},
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } },
      );
      if (response.data.success) {
        setEnrollmentMessage({ show: true, eventId, success: true, message: "Successfully enrolled in event!" });
        if (userPrn) await fetchUserEnrollments(token, userPrn);
        setEvents((prev) =>
          prev.map((e) => e.eventId === eventId ? { ...e, currEnrollments: (e.currEnrollments || 0) + 1 } : e),
        );
      } else {
        setEnrollmentMessage({ show: true, eventId, success: false, message: response.data.message || "Failed to enroll in event" });
      }
    } catch (err) {
      setEnrollmentMessage({ show: true, eventId, success: false, message: err.response?.data?.message || "Error enrolling. Please try again." });
    } finally {
      setEnrollingEventId(null);
      setTimeout(() => setEnrollmentMessage({ show: false, eventId: null, success: false, message: "" }), 3000);
    }
  };

  const handleRevokeEnrollment = async (eventId) => {
    try {
      setRevokingEventId(eventId);
      const token    = localStorage.getItem("token");
      const response = await axios.delete(
        `${BASE_URL}/api/enrollments/revokeEnrollment/${eventId}`,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } },
      );
      if (response.data.success) {
        setEnrolledEvents((prev) => prev.filter((id) => id !== eventId));
        setEvents((prev) =>
          prev.map((e) =>
            e.eventId === eventId ? { ...e, currEnrollments: Math.max((e.currEnrollments || 1) - 1, 0) } : e,
          ),
        );
        setEnrollmentMessage({ show: true, eventId, success: true, message: "Enrollment revoked successfully!" });
        if (enrolledEvents.length - 1 > 0) checkAttendanceStatus();
        else { setActiveAttendanceEvents({}); setMarkedAttendanceEvents({}); }
      } else {
        setEnrollmentMessage({ show: true, eventId, success: false, message: response.data.message || "Failed to revoke enrollment." });
      }
    } catch (err) {
      setEnrollmentMessage({ show: true, eventId, success: false, message: err.response?.data?.message || "Error revoking enrollment." });
    } finally {
      setRevokingEventId(null);
      setTimeout(() => setEnrollmentMessage({ show: false, eventId: null, success: false, message: "" }), 3000);
    }
  };

  // ── Page change ────────────────────────────────────────────────
  const handlePageChange = (newPage) => {
    if (newPage < 0 || newPage >= totalPages) return;
    setCurrentPage(newPage);
    const token = localStorage.getItem("token");

    if (showEnrolledEvents) {
      const start = newPage * pageSize;
      setEvents(allEvents.slice(start, start + pageSize));
      setCurrentPage(newPage);
      return;
    }

    if (completedFilter !== "all") {
      fetchEventsByCompletedStatusPaged(completedFilter === "completed", newPage, pageSize);
    } else if (selectedStatus !== "all") {
      fetchEventsByDeadlinePaged(selectedStatus.toUpperCase(), newPage, pageSize);
    } else {
      fetchEventsPaged(token, filterType, selectedClubId || deptId, newPage, pageSize);
    }
    window.scrollTo({ top: 400, behavior: "smooth" });
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(0);
    const token = localStorage.getItem("token");

    if (showEnrolledEvents) {
      setEvents(allEvents.slice(0, newSize));
      setTotalPages(Math.ceil(allEvents.length / newSize));
      return;
    }

    if (completedFilter !== "all") {
      fetchEventsByCompletedStatusPaged(completedFilter === "completed", 0, newSize);
    } else if (selectedStatus !== "all") {
      fetchEventsByDeadlinePaged(selectedStatus.toUpperCase(), 0, newSize);
    } else {
      fetchEventsPaged(token, filterType, selectedClubId || deptId, 0, newSize);
    }
  };

  // ── Filter handlers ────────────────────────────────────────────
  const handleFilterChange = async (newFilterType, targetId = null) => {
    const token = localStorage.getItem("token");
    setFilterType(newFilterType);
    setCurrentPage(0);

    const resetFilters = () => {
      setSelectedClubId("");
      setShowClubDropdown(false);
      setShowEnrolledEvents(false);
      setCompletedFilter("all");
      setSelectedStatus("all");
    };

    if (newFilterType === "CLUB") {
      if (targetId) { resetFilters(); setSelectedClubId(targetId); }
      else { setShowClubDropdown(true); return; }
    } else { resetFilters(); }

    await fetchEventsPaged(token, newFilterType, targetId || deptId, 0, pageSize);
  };

  const handleCompletedFilterChange = async (value) => {
    setCompletedFilter(value);
    setCurrentPage(0);
    if (value === "all") {
      const token = localStorage.getItem("token");
      await fetchEventsPaged(token, filterType, selectedClubId || deptId, 0, pageSize);
    } else {
      await fetchEventsByCompletedStatusPaged(value === "completed", 0, pageSize);
    }
  };

  const handleStatusFilterChange = async (value) => {
    setSelectedStatus(value);
    setCurrentPage(0);
    if (value === "all") {
      const token = localStorage.getItem("token");
      await fetchEventsPaged(token, filterType, selectedClubId || deptId, 0, pageSize);
    } else {
      await fetchEventsByDeadlinePaged(value.toUpperCase(), 0, pageSize);
    }
  };

  const handleEnrolledEventsClick = async () => {
    if (showEnrolledEvents) {
      setShowEnrolledEvents(false);
      setFilterType("GLOBAL");
      setCurrentPage(0);
      const token = localStorage.getItem("token");
      await fetchEventsPaged(token, "GLOBAL", null, 0, pageSize);
    } else {
      await fetchEnrolledEvents();
    }
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedStatus("all");
    setCompletedFilter("all");
    setFilterType("GLOBAL");
    setSelectedClubId("");
    setShowEnrolledEvents(false);
    setCurrentPage(0);
    const token = localStorage.getItem("token");
    fetchEventsPaged(token, "GLOBAL", null, 0, pageSize);
  };

  const removeStatusFilter = async () => {
    setSelectedStatus("all");
    setCurrentPage(0);
    const token = localStorage.getItem("token");
    await fetchEventsPaged(token, filterType, selectedClubId || deptId, 0, pageSize);
  };

  const removeCompletedFilter = () => {
    setCompletedFilter("all");
    setCurrentPage(0);
    const token = localStorage.getItem("token");
    fetchEventsPaged(token, filterType, selectedClubId || deptId, 0, pageSize);
  };

  const handleRetry = () => {
    const token = localStorage.getItem("token");
    if (token) fetchEventsPaged(token, "GLOBAL", null, 0, pageSize);
    else setError("No authentication token found. Please login again.");
  };

  // ── Client-side filter + sort ──────────────────────────────────
  const getFilteredEvents = () => {
    let filtered = [...events];
    if (searchTerm) {
      filtered = filtered.filter(
        (e) =>
          e.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.organizer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.creatorName?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }
    if (completedFilter !== "all") {
      filtered = filtered.filter((e) => e.completed === (completedFilter === "completed"));
    }
    switch (sortBy) {
      case "date":       filtered.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));          break;
      case "popularity": filtered.sort((a, b) => (b.currEnrollments || 0) - (a.currEnrollments || 0)); break;
      case "enrollment": filtered.sort((a, b) => (b.maxEnrollments  || 0) - (a.maxEnrollments  || 0)); break;
      default: break;
    }
    return filtered;
  };

  const filteredEvents = getFilteredEvents();

  // ── Stats ──────────────────────────────────────────────────────
  const totalEventsCount   = totalElements;
  const openEvents         = events.filter((e) => e.enrollmentStatus?.toLowerCase() === "open").length;
  const completedEvents    = events.filter((e) => e.completed === true).length;
  const notCompletedEvents = events.filter((e) => e.completed === false).length;

  // ── Loading / Error screens ────────────────────────────────────
  if (loading && events.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white animate-pulse" />
            </div>
          </div>
          <p className="text-white text-xl font-light animate-pulse">Loading amazing events...</p>
          <p className="text-white/60 text-sm mt-2">Get ready for something special!</p>
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

  // ── Render ─────────────────────────────────────────────────────
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        {/* Animated background blobs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"
            style={{ backgroundColor: "#4CA1AF" }}></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        {/* Sticky nav */}
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
          {/* Title */}
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4">
              <span className="bg-clip-text text-transparent"
                style={{ background: "linear-gradient(135deg, #4CA1AF, #2C3E50)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Upcoming Events
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Join exciting events, connect with amazing people, and create unforgettable memories
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-6">
            {[
              { label: "Total Events",  value: totalEventsCount,   colorClass: "text-gray-800",   bgClass: "bg-blue-100",   icon: <Calendar    className="w-6 h-6 text-blue-600"   /> },
              { label: "Open Events",   value: openEvents,         colorClass: "text-green-600",  bgClass: "bg-green-100",  icon: <CheckCircle  className="w-6 h-6 text-green-600" /> },
              { label: "Completed",     value: completedEvents,    colorClass: "text-purple-600", bgClass: "bg-purple-100", icon: <CheckSquare  className="w-6 h-6 text-purple-600"/> },
              { label: "Not Completed", value: notCompletedEvents, colorClass: "text-orange-600", bgClass: "bg-orange-100", icon: <CheckSquare  className="w-6 h-6 text-orange-600"/> },
            ].map(({ label, value, colorClass, bgClass, icon }) => (
              <div key={label} className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{label}</p>
                    <p className={`text-3xl font-bold ${colorClass}`}>{value}</p>
                  </div>
                  <div className={`${bgClass} p-3 rounded-lg`}>{icon}</div>
                </div>
              </div>
            ))}
          </div>

          {userDept && (
            <div className="mt-4 mb-8 text-center">
              <div className="inline-block bg-white/80 backdrop-blur-sm px-6 py-3 rounded-xl shadow-md">
                <div className="flex items-center space-x-2">
                  <div className="bg-green-100 p-2 rounded-lg"><Users className="w-4 h-4 text-green-600" /></div>
                  <span className="text-sm font-medium text-gray-600">Department:</span>
                  <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-sm font-semibold">{userDept}</span>
                </div>
              </div>
            </div>
          )}

          {/* ── Search & Filter Bar ── */}
          <div className="mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 border border-white/20">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search events by title, description, organizer, or creator..."
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
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showFilters ? "rotate-180" : ""}`} />
                  </button>
                  <div className="w-52">
                    <CustomSelect name="sortBy" value={sortBy} onChange={(e) => setSortBy(e.target.value)} options={sortOptions} placeholder="Sort by..." />
                  </div>
                </div>
              </div>

              {/* Active filter chips */}
              {(filterType !== "GLOBAL" || selectedStatus !== "all" || completedFilter !== "all" || selectedClubId || showEnrolledEvents) && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-gray-600 mr-2">Active Filters:</span>
                    {filterType === "DEPARTMENT" && userDept && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center">
                        Dept: {userDept}<button onClick={() => handleFilterChange("GLOBAL")} className="ml-2 hover:text-green-900"><X className="w-3 h-3" /></button>
                      </span>
                    )}
                    {filterType === "CLUB" && selectedClubId && (
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center">
                        Club: {userClubs.find((c) => c.clubId.toString() === selectedClubId.toString())?.clubName}
                        <button onClick={() => handleFilterChange("GLOBAL")} className="ml-2 hover:text-purple-900"><X className="w-3 h-3" /></button>
                      </span>
                    )}
                    {showEnrolledEvents && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center">
                        My Enrolled Events
                        <button onClick={() => { setShowEnrolledEvents(false); const token = localStorage.getItem("token"); fetchEventsPaged(token, filterType, selectedClubId || deptId, 0, pageSize); }}
                          className="ml-2 hover:text-green-900"><X className="w-3 h-3" /></button>
                      </span>
                    )}
                    {selectedStatus !== "all" && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center">
                        Enrollment: {selectedStatus}<button onClick={removeStatusFilter} className="ml-2 hover:text-blue-900"><X className="w-3 h-3" /></button>
                      </span>
                    )}
                    {completedFilter !== "all" && (
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center">
                        Completed: {completedFilter === "completed" ? "Yes" : "No"}
                        <button onClick={removeCompletedFilter} className="ml-2 hover:text-purple-900"><X className="w-3 h-3" /></button>
                      </span>
                    )}
                    <button onClick={clearAllFilters} className="px-3 py-1 text-red-600 hover:text-red-800 text-sm font-medium ml-auto">Clear All</button>
                  </div>
                </div>
              )}

              {/* Expanded filter panel */}
              {showFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex flex-col space-y-4">
                    <div className="flex flex-wrap items-start gap-3">
                      <span className="text-sm font-medium text-gray-600 pt-2.5">Filter by:</span>
                      <div className="flex flex-wrap items-center gap-2 flex-1">
                        <button
                          onClick={handleEnrolledEventsClick}
                          className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${showEnrolledEvents ? "bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg" : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"}`}
                        >My Enrolled Events</button>
                        <button
                          onClick={() => { handleFilterChange("GLOBAL"); setShowEnrolledEvents(false); }}
                          className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${filterType === "GLOBAL" && !showEnrolledEvents ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg" : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"}`}
                        >Global Events</button>
                        {userDept && (
                          <button
                            onClick={() => handleFilterChange("DEPARTMENT")}
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${filterType === "DEPARTMENT" ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg" : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"}`}
                          >{userDept} Events</button>
                        )}
                        <button
                          onClick={() => { setShowClubDropdown(!showClubDropdown); setShowEnrolledEvents(false); }}
                          className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${filterType === "CLUB" ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg" : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"}`}
                        >
                          <span>Club Events</span>
                          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showClubDropdown ? "rotate-180" : ""}`} />
                        </button>
                        <div className="w-48">
                          <CustomSelect name="selectedStatus" value={selectedStatus} onChange={(e) => handleStatusFilterChange(e.target.value)} options={enrollmentStatusOptions} placeholder="Enrollment Status" />
                        </div>
                        <div className="w-48">
                          <CustomSelect name="completedFilter" value={completedFilter} onChange={(e) => handleCompletedFilterChange(e.target.value)} options={completedStatusOptions} placeholder="Completed Status" />
                        </div>
                      </div>
                    </div>

                    {/* Club sub-list */}
                    {showClubDropdown && (
                      <div className="mt-2 border border-gray-200 rounded-xl bg-white shadow-lg overflow-hidden">
                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                          <h3 className="font-semibold text-gray-700">SELECT A CLUB</h3>
                        </div>
                        <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
                          {userClubs.length > 0 ? userClubs.map((club) => (
                            <button key={club.clubId} onClick={() => { handleFilterChange("CLUB", club.clubId); setShowClubDropdown(false); }}
                              className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${selectedClubId === club.clubId.toString() ? "bg-purple-50" : ""}`}>
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-gray-800">{club.clubName}</span>
                                <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">{club.memberCount || "0"} members</span>
                              </div>
                              {club.desc && <p className="text-sm text-gray-600">{club.desc}</p>}
                            </button>
                          )) : (
                            <div className="p-6 text-center"><p className="text-gray-500">No clubs available</p></div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Results count + enrollment badge */}
          <div className="mb-4 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold">{filteredEvents.length}</span> on this page
              {totalPages > 1 && (
                <> · Page <span className="font-semibold">{currentPage + 1}</span> of <span className="font-semibold">{totalPages}</span></>
              )}{" "}· <span className="font-semibold">{totalElements}</span> total
            </p>
            <div className="bg-green-50 px-3 py-1 rounded-full text-xs font-medium text-green-700 flex items-center">
              <CheckCircle className="w-3 h-3 mr-1" />
              Your Enrollments: {enrolledEvents.length}
            </div>
          </div>

          {/* Loading overlay */}
          {loading && events.length > 0 && (
            <div className="flex justify-center mb-4">
              <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow flex items-center gap-2 text-sm text-gray-600">
                <Loader2 className="w-4 h-4 animate-spin text-[#4CA1AF]" />
                Loading page {currentPage + 1}…
              </div>
            </div>
          )}

          {/* Events grid */}
          {filteredEvents.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 max-w-md mx-auto border border-white/20">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 animate-ping"></div>
                  </div>
                  <Calendar className="w-20 h-20 text-gray-400 mx-auto mb-4 relative z-10" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">No Events Found</h3>
                <p className="text-gray-600 mb-6">
                  {filterType === "CLUB" && !selectedClubId
                    ? "Please select a club from the dropdown to view its events."
                    : showEnrolledEvents
                      ? "You haven't enrolled in any events yet. Browse events and enroll to see them here!"
                      : completedFilter !== "all"
                        ? `No ${completedFilter === "completed" ? "completed" : "not completed"} events visible to you.`
                        : selectedStatus !== "all"
                          ? `No ${selectedStatus} enrollment events visible to you.`
                          : "There are no events available at the moment. Check back later!"}
                </p>
                {(filterType !== "GLOBAL" || searchTerm || selectedStatus !== "all" || completedFilter !== "all") && (
                  <button onClick={clearAllFilters} className="mt-4 px-6 py-3 text-purple-600 hover:text-purple-800 font-medium">
                    Clear All Filters
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-center">
                <div className={`grid gap-4 w-full ${filteredEvents.length === 1 ? "grid-cols-1 max-w-sm mx-auto" : filteredEvents.length === 2 ? "grid-cols-1 md:grid-cols-2 max-w-2xl mx-auto" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"}`}>
                  {filteredEvents.map((event, index) => {
                    const daysUntil       = getDaysUntil(event.dateTime);
                    const targetTypeColor = getTargetTypeColor(event.targetType);
                    const isEnrolled      = enrolledEvents.includes(Number(event.eventId));
                    const attendanceInfo  = activeAttendanceEvents[event.eventId];
                    const alreadyMarked   = markedAttendanceEvents[event.eventId] === true;

                    return (
                      <div key={event.eventId} className="event-card-container animate-[fadeIn_0.5s_ease-in-out]" style={{ animationDelay: `${index * 100}ms` }}>
                        <div className="event-card">
                          {/* ── FRONT ── */}
                          <div className="card-face card-front bg-white/90 backdrop-blur-sm rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-500 border border-white/20">
                            <div className="relative h-32 p-3 overflow-hidden" style={{ background: "linear-gradient(135deg, #4CA1AF, #2C3E50)" }}>
                              <div className="absolute inset-0 opacity-10">
                                <div className="absolute -top-12 -right-12 w-24 h-24 bg-white rounded-full"></div>
                                <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-white rounded-full"></div>
                              </div>
                              {daysUntil > 0 && !event.completed && (
                                <div className="absolute top-2 left-2 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                                  <span className="text-white text-xs font-semibold">{daysUntil} days to go</span>
                                </div>
                              )}
                              {event.completed && (
                                <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full flex items-center shadow-lg">
                                  <CheckSquare className="w-3 h-3 mr-1" /><span className="text-xs font-semibold">Completed</span>
                                </div>
                              )}
                              {isEnrolled && (
                                <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full flex items-center shadow-lg">
                                  <CheckCircle className="w-3 h-3 mr-1" /><span className="text-xs font-semibold">Enrolled</span>
                                </div>
                              )}
                              {/* Show "Attendance Active" badge only if NOT already marked */}
                              {isEnrolled && attendanceInfo?.canMark && !alreadyMarked && (
                                <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full flex items-center shadow-lg animate-pulse">
                                  <CheckCircle className="w-3 h-3 mr-1" /><span className="text-xs font-semibold">Attendance Active</span>
                                </div>
                              )}
                              {/* Show "Attendance Marked" badge if already done */}
                              {isEnrolled && alreadyMarked && (
                                <div className="absolute top-12 left-2 bg-blue-500 text-white px-2 py-1 rounded-full flex items-center shadow-lg">
                                  <CheckSquare className="w-3 h-3 mr-1" /><span className="text-xs font-semibold">Attended ✓</span>
                                </div>
                              )}
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
                                  {getTargetTypeIcon(event.targetType)}
                                  <span className="ml-1 capitalize text-xs">{event.targetType || "N/A"}</span>
                                </span>
                              </div>
                              <div className="text-center text-[8px] mt-1 flex items-center justify-center text-purple-600">
                                <span className="animate-pulse mr-1 text-[6px]">●</span>Hover to view all details
                              </div>
                            </div>
                          </div>

                          {/* ── BACK ── */}
                          <div className="card-face card-back rounded-xl shadow-md overflow-hidden p-3 bg-gradient-to-br from-[#4CA1AF] to-[#2C3E50]">
                            <div className="h-full flex flex-col">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-bold text-white line-clamp-1 flex-1">{event.title}</h3>
                                {event.completed && (
                                  <span className="bg-green-500 text-white px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center ml-1">
                                    <CheckSquare className="w-2.5 h-2.5 mr-0.5" />Completed
                                  </span>
                                )}
                                {isEnrolled && (
                                  <span className="bg-green-500 text-white px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center ml-1">
                                    <CheckCircle className="w-2.5 h-2.5 mr-0.5" />Enrolled
                                  </span>
                                )}
                              </div>

                              <div className="space-y-1.5 overflow-y-auto flex-1 pr-1 custom-scrollbar text-xs">
                                <div className="grid grid-cols-2 gap-1">
                                  <div className="p-1.5 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
                                    <div className="flex items-center mb-0.5"><Calendar className="w-3 h-3 mr-1 text-white/80" /><p className="text-[10px] text-white/80">Date</p></div>
                                    <p className="text-xs font-medium text-white">{formatDateTime(event.dateTime)}</p>
                                  </div>
                                  <div className="p-1.5 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
                                    <div className="flex items-center mb-0.5"><Clock className="w-3 h-3 mr-1 text-white/80" /><p className="text-[10px] text-white/80">Enrollment Deadline</p></div>
                                    <p className="text-xs font-medium text-white">{formatDateOnly(event.enrollmentDeadline)}</p>
                                  </div>
                                </div>

                                <div className="p-1.5 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
                                  <p className="text-[10px] text-white/80 mb-1 flex items-center"><Star className="w-2.5 h-2.5 mr-1" />Created By</p>
                                  <p className="text-xs font-medium text-white truncate">{event.creatorName || event.organizer || "Unknown"}</p>
                                </div>

                                {event.enrollmentStatus && (
                                  <div className="p-1.5 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
                                    <p className="text-[10px] text-white/80 mb-1 flex items-center"><Radio className="w-2.5 h-2.5 mr-1" />Enrollment Status</p>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${event.enrollmentStatus?.toUpperCase() === "OPEN" ? "bg-emerald-400/30 text-emerald-100" : "bg-red-400/30 text-red-100"}`}>
                                      {event.enrollmentStatus?.toUpperCase() === "OPEN" ? "Open" : "Closed"}
                                    </span>
                                  </div>
                                )}

                                {event.targetType?.toUpperCase() === "DEPARTMENT" && event.targetIds?.length > 0 && (
                                  <div className="p-1.5 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
                                    <p className="text-[10px] text-white/80 mb-1 flex items-center"><Briefcase className="w-2.5 h-2.5 mr-1" />Target Departments</p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {event.targetIds.map((id) => {
                                        const dept = departments.find((d) => Number(d.departmentId) === Number(id));
                                        return (
                                          <span key={id} className="px-1.5 py-0.5 rounded text-[8px] font-medium text-white" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
                                            {dept?.name || `Dept ${id}`}
                                          </span>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}

                                {event.targetType?.toUpperCase() === "CLUB" && event.targetIds?.length > 0 && (
                                  <div className="p-1.5 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
                                    <p className="text-[10px] text-white/80 mb-1 flex items-center"><Users className="w-2.5 h-2.5 mr-1" />Target Clubs</p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {event.targetIds.map((id) => {
                                        const club = allClubs.find((c) => Number(c.clubId) === Number(id)) || userClubs.find((c) => Number(c.clubId) === Number(id));
                                        return (
                                          <span key={id} className="px-1.5 py-0.5 rounded text-[8px] font-medium text-white" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
                                            {club?.clubName || `Club ${id}`}
                                          </span>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* ── Card action buttons — Student ── */}
                              <div className="mt-2 pt-1 border-t border-white/20">
                                {!event.completed ? (
                                  isEnrolled ? (
                                    <div className="relative">
                                      {/* Attendance feedback message */}
                                      {attendanceMessage.show && attendanceMessage.eventId === event.eventId && (
                                        <div className={`absolute bottom-full mb-2 left-0 right-0 text-center text-[10px] font-medium ${attendanceMessage.success ? "text-green-400" : "text-red-400"}`}>
                                          {attendanceMessage.message}
                                        </div>
                                      )}

                                      {/* ── Attendance button logic ── */}
                                      {alreadyMarked ? (
                                        // Already marked — show a non-interactive success pill
                                        <div className="w-full py-1.5 rounded-lg text-xs font-medium text-center bg-blue-500/60 text-white flex items-center justify-center mb-2">
                                          <CheckSquare className="w-3 h-3 mr-1" />Attendance Marked ✓
                                        </div>
                                      ) : attendanceInfo?.canMark ? (
                                        // Active window, not yet marked — show Scan QR button
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedEventForMarking(event);
                                            setShowMarkAttendancePopup(true);
                                          }}
                                          disabled={markingAttendanceId === event.eventId}
                                          className="w-full py-1.5 rounded-lg text-xs font-medium transition flex items-center justify-center bg-gradient-to-r from-green-500 to-teal-500 text-white hover:from-green-600 hover:to-teal-600 mb-2"
                                        >
                                          {markingAttendanceId === event.eventId ? (
                                            <><Loader2 className="w-3 h-3 mr-1 animate-spin" />Loading...</>
                                          ) : (
                                            <><Camera className="w-3 h-3 mr-1" />Scan QR Code</>
                                          )}
                                        </button>
                                      ) : attendanceInfo?.active && !attendanceInfo?.withinWindow ? (
                                        // Attendance active but outside window time
                                        <div className="w-full py-1.5 rounded-lg text-xs font-medium text-center bg-yellow-500/50 text-white mb-2">
                                          Outside Attendance Window
                                        </div>
                                      ) : null}

                                      {/* Enrollment message */}
                                      {enrollmentMessage.show && enrollmentMessage.eventId === event.eventId && (
                                        <div className={`absolute bottom-full mb-2 left-0 right-0 text-center text-[10px] font-medium ${enrollmentMessage.success ? "text-green-400" : "text-red-400"}`}>
                                          {enrollmentMessage.message}
                                        </div>
                                      )}

                                      {/* Revoke enrollment — hidden once deadline has passed */}
                                      {!event.enrollmentDeadline || new Date() < new Date(event.enrollmentDeadline) ? (
                                        <button
                                          onClick={() => setConfirmDialog({
                                            isOpen: true, title: "Revoke Enrollment",
                                            message: "Are you sure you want to revoke your enrollment for this event?",
                                            confirmText: "Revoke", variant: "danger",
                                            onConfirm: () => { closeConfirm(); handleRevokeEnrollment(event.eventId); },
                                          })}
                                          disabled={revokingEventId === event.eventId}
                                          className="w-full py-1.5 rounded-lg text-xs font-medium transition flex items-center justify-center bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700"
                                        >
                                          {revokingEventId === event.eventId ? (
                                            <><Loader2 className="w-3 h-3 mr-1 animate-spin" />Revoking...</>
                                          ) : (
                                            <><XCircle className="w-3 h-3 mr-1" />Revoke Enrollment</>
                                          )}
                                        </button>
                                      ) : (
                                        <div className="w-full py-1.5 rounded-lg text-xs font-medium text-center bg-white/20 text-white/70">
                                          Enrollment Deadline Passed
                                        </div>
                                      )}
                                    </div>
                                  ) : event.enrollmentStatus === "OPEN" ? (
                                    <div className="relative">
                                      {enrollmentMessage.show && enrollmentMessage.eventId === event.eventId && (
                                        <div className={`absolute bottom-full mb-2 left-0 right-0 text-center text-[10px] font-medium ${enrollmentMessage.success ? "text-green-400" : "text-red-400"}`}>
                                          {enrollmentMessage.message}
                                        </div>
                                      )}
                                      <button
                                        onClick={() => setConfirmDialog({
                                          isOpen: true, title: "Confirm Enrollment",
                                          message: "Are you sure you want to enroll in this event?",
                                          confirmText: "Enroll", variant: "primary",
                                          onConfirm: () => { closeConfirm(); handleEnroll(event.eventId); },
                                        })}
                                        disabled={enrollingEventId === event.eventId}
                                        className="w-full py-1.5 rounded-lg text-xs font-medium transition flex items-center justify-center bg-gradient-to-r from-[#4CA1AF] to-[#2C3E50] text-white hover:from-[#3d8a9c] hover:to-[#1f2f3f]"
                                      >
                                        {enrollingEventId === event.eventId ? (
                                          <><Loader2 className="w-3 h-3 mr-1 animate-spin" />Enrolling...</>
                                        ) : "Enroll Now"}
                                      </button>
                                    </div>
                                  ) : null
                                ) : (
                                  <div className="w-full py-1.5 rounded-lg text-xs font-medium text-center bg-gray-500/50 text-white">
                                    Event Completed
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {totalPages > 1 && (
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalElements={totalElements}
                  pageSize={pageSize}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                  loading={loading}
                />
              )}
            </>
          )}

          <div className="mt-12 text-center">
            <div className="inline-flex items-center space-x-2 text-gray-500 text-sm">
              <Bell className="w-4 h-4" />
              <span>Stay tuned for more exciting events!</span>
              <Gift className="w-4 h-4" />
            </div>
          </div>
        </div>

        <style jsx>{sharedStyles}</style>
      </div>

      <MarkAttendancePopup
        isOpen={showMarkAttendancePopup}
        onClose={() => { setShowMarkAttendancePopup(false); setSelectedEventForMarking(null); }}
        event={selectedEventForMarking}
        token={localStorage.getItem("token")}
        onSuccess={handleMarkAttendanceSuccess}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        variant={confirmDialog.variant}
        onConfirm={confirmDialog.onConfirm}
        onCancel={closeConfirm}
      />
    </>
  );
};

export default StudentEvents;

// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import CustomSelect from "../../components/CustomSelect";
// import ConfirmDialog from "../../components/ConfirmDialog";
// import MarkAttendancePopup from "../../components/MarkAttendancePopup";
// import PaginationControls from "../../components/Paginationcontrols";
// import {
//   getTargetTypeIcon,
//   getTargetTypeColor,
//   formatDateTime,
//   formatDateOnly,
//   getDaysUntil,
//   isEventVisibleToUser,
//   sharedStyles,
// } from "../../components/EventUtils";
// import {
//   Calendar,
//   MapPin,
//   Users,
//   User,
//   Clock,
//   AlertCircle,
//   CheckCircle,
//   XCircle,
//   Loader2,
//   Radio,
//   Sparkles,
//   Star,
//   Briefcase,
//   X,
//   Filter,
//   ChevronDown,
//   Search,
//   Bell,
//   Gift,
//   ArrowLeft,
//   CheckSquare,
//   Camera,
// } from "lucide-react";

// // ─── StudentEvents ─────────────────────────────────────────────────────────────
// const StudentEvents = () => {
//   const navigate = useNavigate();

//   // ── Core state ─────────────────────────────────────────────────
//   const [events, setEvents] = useState([]);
//   const [allEvents, setAllEvents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [userPrn, setUserPrn] = useState("");
//   const [userDept, setUserDept] = useState("");
//   const [deptId, setDeptId] = useState(null);
//   const [departments, setDepartments] = useState([]);
//   const [userClubs, setUserClubs] = useState([]);
//   const [allClubs, setAllClubs] = useState([]);
//   const [userMap, setUserMap] = useState({});

//   // ── Filter / UI state ──────────────────────────────────────────
//   const [filterType, setFilterType] = useState("GLOBAL");
//   const [selectedClubId, setSelectedClubId] = useState("");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [showFilters, setShowFilters] = useState(false);
//   const [sortBy, setSortBy] = useState("date");
//   const [showClubDropdown, setShowClubDropdown] = useState(false);
//   const [showEnrolledEvents, setShowEnrolledEvents] = useState(false);
//   const [selectedStatus, setSelectedStatus] = useState("all");
//   const [completedFilter, setCompletedFilter] = useState("all");

//   // ── Enrollment state ───────────────────────────────────────────
//   const [enrolledEvents, setEnrolledEvents] = useState([]);
//   const [enrollingEventId, setEnrollingEventId] = useState(null);
//   const [revokingEventId, setRevokingEventId] = useState(null);
//   const [enrollmentMessage, setEnrollmentMessage] = useState({
//     show: false,
//     eventId: null,
//     success: false,
//     message: "",
//   });

//   // ── Attendance state ───────────────────────────────────────────
//   const [activeAttendanceEvents, setActiveAttendanceEvents] = useState({});
//   const [markingAttendanceId, setMarkingAttendanceId] = useState(null);
//   const [attendanceMessage, setAttendanceMessage] = useState({
//     show: false,
//     eventId: null,
//     success: false,
//     message: "",
//   });
//   const [showMarkAttendancePopup, setShowMarkAttendancePopup] = useState(false);
//   const [selectedEventForMarking, setSelectedEventForMarking] = useState(null);

//   // ── Pagination ──────────────────────────────────────────────────
//   const [currentPage, setCurrentPage] = useState(0);
//   const [pageSize, setPageSize] = useState(12);
//   const [totalPages, setTotalPages] = useState(0);
//   const [totalElements, setTotalElements] = useState(0);

//   // ── Confirm dialog ──────────────────────────────────────────────
//   const [confirmDialog, setConfirmDialog] = useState({
//     isOpen: false,
//     title: "",
//     message: "",
//     variant: "primary",
//     confirmText: "Confirm",
//     onConfirm: () => {},
//   });
//   const closeConfirm = () => setConfirmDialog((p) => ({ ...p, isOpen: false }));

//   // ── CustomSelect option sets ────────────────────────────────────
//   const enrollmentStatusOptions = [
//     { value: "all", label: "Enrollment Status" },
//     { value: "open", label: "Open" },
//     { value: "closed", label: "Closed" },
//   ];
//   const completedStatusOptions = [
//     { value: "all", label: "Completed Status" },
//     { value: "completed", label: "Completed" },
//     { value: "notCompleted", label: "Not Completed" },
//   ];
//   const sortOptions = [
//     { value: "date", label: "Sort by Date" },
//     { value: "popularity", label: "Sort by Popularity" },
//     { value: "enrollment", label: "Sort by Capacity" },
//   ];

//   // ── Init ────────────────────────────────────────────────────────
//   useEffect(() => {
//     const init = async () => {
//       const user = JSON.parse(localStorage.getItem("user"));
//       const token = localStorage.getItem("token");
//       if (!token) {
//         setError("No authentication token found. Please login again.");
//         setLoading(false);
//         return;
//       }
//       const prn = user?.prn;
//       if (prn) setUserPrn(prn);
//       fetchDepartments(token);
//       fetchUserProfile(token);
//       fetchUserClubs(token);
//       fetchAllClubs(token);
//       if (prn) await fetchUserEnrollments(token, prn);
//       fetchEventsPaged(token, "GLOBAL", null, 0, 12);
//     };
//     init();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // Watch for enrolledEvents changes and check attendance status
//   useEffect(() => {
//     if (enrolledEvents.length > 0) {
//       checkAttendanceStatus();
//     } else {
//       setActiveAttendanceEvents({});
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [enrolledEvents]);

//   // ── API helpers ─────────────────────────────────────────────────
//   const fetchUserProfile = async (token) => {
//     try {
//       const user = JSON.parse(localStorage.getItem("user"));
//       const prn = user?.prn;
//       if (!prn) return;
//       setUserPrn(prn);
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
//         fetchUserEnrollments(token, prn);
//       }
//     } catch (err) {
//       console.error("Error fetching user profile:", err);
//     }
//   };

//   const fetchDepartments = async (token) => {
//     try {
//       const response = await axios.get("http://localhost:8080/api/department", {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       });
//       if (response.data.success) setDepartments(response.data.data);
//     } catch (err) {
//       console.error("Error fetching departments:", err);
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
//         if (dept) setDeptId(dept.departmentId);
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
//       if (response.data.success) setUserClubs(response.data.data);
//     } catch (err) {
//       console.error("Error fetching user clubs:", err);
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
//       if (response.data.success) setAllClubs(response.data.data);
//     } catch (err) {
//       console.error("Error fetching all clubs:", err);
//     }
//   };

//   const fetchUserNameByPrn = async (token, prn) => {
//     if (userMap[prn]) return userMap[prn];
//     try {
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
//         const name =
//           response.data.data.name || response.data.data.fullName || prn;
//         setUserMap((prev) => ({ ...prev, [prn]: name }));
//         return name;
//       }
//     } catch (err) {
//       console.error(`Error fetching user for PRN ${prn}:`, err);
//     }
//     return prn;
//   };

//   const enrichWithCreatorNames = async (token, list) => {
//     if (!list.length) return list;
//     return Promise.all(
//       list.map(async (event) => {
//         if (!event.creatorName || event.creatorName.match(/^\d+$/)) {
//           const creatorName = await fetchUserNameByPrn(token, event.creatorPrn);
//           return { ...event, creatorName };
//         }
//         return event;
//       }),
//     );
//   };

//   const applyPageResponse = (data) => {
//     setTotalPages(data.totalPages ?? 0);
//     setTotalElements(data.totalElements ?? 0);
//     setCurrentPage(data.pageNumber ?? 0);
//   };

//   // ── Core paginated fetcher ─────────────────────────────────────
//   const fetchEventsPaged = async (
//     token,
//     filter = "GLOBAL",
//     targetId = null,
//     page = 0,
//     size = pageSize,
//   ) => {
//     try {
//       setLoading(true);
//       const headers = {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       };
//       const params = { page, size };
//       let response;

//       if (filter === "DEPARTMENT" && targetId) {
//         response = await axios.get(
//           `http://localhost:8080/api/events/targetData/DEPARTMENT/${targetId}/paged`,
//           { headers, params },
//         );
//       } else if (filter === "CLUB" && targetId) {
//         response = await axios.get(
//           `http://localhost:8080/api/events/targetData/CLUB/${targetId}/paged`,
//           { headers, params },
//         );
//       } else {
//         response = await axios.get(
//           "http://localhost:8080/api/events/getByTargetType/GLOBAL/paged",
//           { headers, params },
//         );
//       }

//       if (response?.data?.success) {
//         const pageData = response.data.data;
//         let fetched = pageData.content || [];
//         fetched = await enrichWithCreatorNames(token, fetched);
//         setEvents(fetched);
//         setAllEvents(fetched);
//         applyPageResponse(pageData);
//       }
//     } catch (err) {
//       console.error("Error fetching events:", err);
//       setError(err.message || "An error occurred while fetching events");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchEventsByCompletedStatusPaged = async (
//     completed,
//     page = 0,
//     size = pageSize,
//   ) => {
//     try {
//       setLoading(true);
//       const token = localStorage.getItem("token");
//       const user = JSON.parse(localStorage.getItem("user"));
//       const currentPrn = user?.prn || userPrn;
//       const headers = {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       };
//       const response = await axios.get(
//         `http://localhost:8080/api/events/endEvent/${completed}/paged`,
//         { headers, params: { page, size } },
//       );
//       if (response.data.success) {
//         const pageData = response.data.data;
//         let fetched = pageData.content || [];
//         fetched = await enrichWithCreatorNames(token, fetched);
//         fetched = fetched.filter((event) =>
//           isEventVisibleToUser(event, deptId, userClubs, currentPrn, false),
//         );
//         setEvents(fetched);
//         setAllEvents(fetched);
//         applyPageResponse(pageData);
//       }
//     } catch (err) {
//       console.error("Error fetching events by completed status:", err);
//       setError(err.message || "An error occurred");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchEventsByDeadlinePaged = async (
//     status,
//     page = 0,
//     size = pageSize,
//   ) => {
//     try {
//       setLoading(true);
//       const token = localStorage.getItem("token");
//       const user = JSON.parse(localStorage.getItem("user"));
//       const currentPrn = user?.prn || userPrn;
//       const headers = {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       };
//       const response = await axios.get(
//         `http://localhost:8080/api/events/enrollment/${status}/paged`,
//         { headers, params: { page, size } },
//       );
//       if (response.data.success) {
//         const pageData = response.data.data;
//         let fetched = pageData.content || [];
//         fetched = await enrichWithCreatorNames(token, fetched);
//         fetched = fetched.filter((event) =>
//           isEventVisibleToUser(event, deptId, userClubs, currentPrn, false),
//         );
//         setEvents(fetched);
//         setAllEvents(fetched);
//         applyPageResponse(pageData);
//       }
//     } catch (err) {
//       console.error("Error fetching events by deadline:", err);
//       setError(err.message || "An error occurred");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ── Enrolled events (client-side pagination) ───────────────────
//   const fetchEnrolledEvents = async () => {
//     try {
//       setLoading(true);
//       const token = localStorage.getItem("token");
//       const response = await axios.get(
//         "http://localhost:8080/api/enrollments/myEnrollments",
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         },
//       );

//       if (response.data.success) {
//         const enrollmentData = response.data.data;
//         const enrolledEventsList = Object.keys(enrollmentData)
//           .map((key) => {
//             try {
//               const g = (rx) => {
//                 const m = key.match(rx);
//                 return m ? m[1].trim() : "";
//               };
//               const eventIdMatch = key.match(/eventId=(\d+)/);
//               const eventId = eventIdMatch ? parseInt(eventIdMatch[1]) : null;
//               let creatorName = g(/creatorName=([^,\]]+)/);
//               const creatorPrn = g(/creatorPrn=([^,\]]+)/);
//               if (!creatorName || creatorName.match(/^\d+$/))
//                 creatorName = creatorPrn;
//               const enrollmentDeadlineRaw = g(/enrollmentDeadline=([^,\]]+)/);
//               const targetIdsRaw = key.match(/targetIds=\[([^\]]*)\]/);
//               const targetIds = targetIdsRaw
//                 ? targetIdsRaw[1]
//                     .split(",")
//                     .map((s) => parseInt(s.trim()))
//                     .filter((n) => !isNaN(n))
//                 : [];
//               return {
//                 eventId,
//                 title: g(/title=([^,]+)/),
//                 description: g(/description=([^,]+)/),
//                 dateTime: g(/dateTime=([^,]+)/),
//                 organizer: g(/organizer=([^,]+)/),
//                 speakerName: g(/speakerName=([^,]+)/),
//                 venue: g(/venue=([^,]+)/),
//                 maxEnrollments: parseInt(g(/maxEnrollments=(\d+)/) || 0),
//                 currEnrollments: parseInt(g(/currEnrollments=(\d+)/) || 0),
//                 enrollmentStatus: g(/enrollmentStatus=([^,\]]+)/),
//                 enrollmentDeadline: enrollmentDeadlineRaw || null,
//                 targetType: g(/targetType=([^,\]]+)/),
//                 targetIds,
//                 completed: g(/isCompleted=([^,\]]+)/) === "true",
//                 creatorPrn,
//                 creatorName,
//               };
//             } catch (e) {
//               return null;
//             }
//           })
//           .filter((e) => e !== null && e.eventId !== null);

//         const enriched = await enrichWithCreatorNames(
//           token,
//           enrolledEventsList,
//         );
//         const start = currentPage * pageSize;
//         const paged = enriched.slice(start, start + pageSize);
//         setEvents(paged);
//         setAllEvents(enriched);
//         setTotalElements(enriched.length);
//         setTotalPages(Math.ceil(enriched.length / pageSize));
//         setCurrentPage(0);
//         setEnrolledEvents(enriched.map((e) => e.eventId));
//         setFilterType("");
//         setSelectedClubId("");
//         setCompletedFilter("all");
//         setSelectedStatus("all");
//         setShowEnrolledEvents(true);
//       }
//     } catch (err) {
//       console.error("Error fetching enrolled events:", err);
//       setError(err.message || "An error occurred");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchUserEnrollments = async (token, prn) => {
//     try {
//       const response = await axios.get(
//         "http://localhost:8080/api/enrollments/myEnrollments",
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         },
//       );
//       if (response.data.success) {
//         const ids = Object.keys(response.data.data)
//           .map((key) => {
//             const m = key.match(/eventId=(\d+)/);
//             return m ? Number(m[1]) : null;
//           })
//           .filter((id) => id !== null);
//         setEnrolledEvents(ids);
//         if (ids.length > 0) {
//           checkAttendanceStatus();
//         } else {
//           setActiveAttendanceEvents({});
//         }
//       }
//     } catch (err) {
//       console.error("Error fetching user enrollments:", err);
//     }
//   };

//   // ── Attendance ─────────────────────────────────────────────────
//   const checkAttendanceStatus = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       if (!token || !enrolledEvents.length) return;
//       const statusMap = {};
//       for (const eventId of enrolledEvents) {
//         try {
//           const response = await axios.get(
//             `http://localhost:8080/api/events/getById/${eventId}`,
//             {
//               headers: {
//                 Authorization: `Bearer ${token}`,
//                 "Content-Type": "application/json",
//               },
//             },
//           );
//           if (response.data.success && response.data.data) {
//             const event = response.data.data;
//             const now = new Date();
//             const windowStart = event.attendanceWindowStart
//               ? new Date(event.attendanceWindowStart)
//               : null;
//             const windowEnd = event.attendanceWindowEnd
//               ? new Date(event.attendanceWindowEnd)
//               : null;
//             const isWithinWindow =
//               windowStart &&
//               windowEnd &&
//               now >= windowStart &&
//               now <= windowEnd;
//             console.log(windowStart, windowEnd, now, isWithinWindow);
//             statusMap[eventId] = {
//               active: event.attendanceActive === true,
//               withinWindow: isWithinWindow,
//               canMark: event.attendanceActive === true && isWithinWindow,
//               eventData: event,
//             };
//           }
//         } catch (err) {
//           console.error(`Error checking attendance for event ${eventId}:`, err);
//         }
//       }
//       setActiveAttendanceEvents(statusMap);
//     } catch (err) {
//       console.error("Error checking attendance status:", err);
//     }
//   };

//   const handleMarkAttendanceSuccess = () => {
//     setAttendanceMessage({
//       show: true,
//       eventId: selectedEventForMarking?.eventId,
//       success: true,
//       message: "Attendance marked successfully!",
//     });
//     checkAttendanceStatus();
//     setShowMarkAttendancePopup(false);
//     setSelectedEventForMarking(null);
//   };

//   const handleMarkAttendance = async (eventId) => {
//     try {
//       setMarkingAttendanceId(eventId);
//       const token = localStorage.getItem("token");
//       const response = await axios.post(
//         `http://localhost:8080/api/attendance/mark/${eventId}`,
//         {},
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         },
//       );
//       if (response.data.success) {
//         setAttendanceMessage({
//           show: true,
//           eventId,
//           success: true,
//           message: "Attendance marked successfully!",
//         });
//         await checkAttendanceStatus();
//       } else {
//         setAttendanceMessage({
//           show: true,
//           eventId,
//           success: false,
//           message: response.data.message || "Failed to mark attendance",
//         });
//       }
//     } catch (err) {
//       setAttendanceMessage({
//         show: true,
//         eventId,
//         success: false,
//         message: err.response?.data?.message || "Error marking attendance",
//       });
//     } finally {
//       setMarkingAttendanceId(null);
//       setTimeout(
//         () =>
//           setAttendanceMessage({
//             show: false,
//             eventId: null,
//             success: false,
//             message: "",
//           }),
//         3000,
//       );
//     }
//   };

//   // ── Enroll / Revoke ────────────────────────────────────────────
//   const handleEnroll = async (eventId) => {
//     try {
//       setEnrollingEventId(eventId);
//       const token = localStorage.getItem("token");
//       if (!token) {
//         alert("Please login to enroll");
//         return;
//       }
//       const response = await axios.post(
//         `http://localhost:8080/api/enrollments/${eventId}`,
//         {},
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         },
//       );
//       if (response.data.success) {
//         setEnrollmentMessage({
//           show: true,
//           eventId,
//           success: true,
//           message: "Successfully enrolled in event!",
//         });
//         if (userPrn) await fetchUserEnrollments(token, userPrn);
//         setEvents((prev) =>
//           prev.map((e) =>
//             e.eventId === eventId
//               ? { ...e, currEnrollments: (e.currEnrollments || 0) + 1 }
//               : e,
//           ),
//         );
//       } else {
//         setEnrollmentMessage({
//           show: true,
//           eventId,
//           success: false,
//           message: response.data.message || "Failed to enroll in event",
//         });
//       }
//     } catch (err) {
//       setEnrollmentMessage({
//         show: true,
//         eventId,
//         success: false,
//         message:
//           err.response?.data?.message || "Error enrolling. Please try again.",
//       });
//     } finally {
//       setEnrollingEventId(null);
//       setTimeout(
//         () =>
//           setEnrollmentMessage({
//             show: false,
//             eventId: null,
//             success: false,
//             message: "",
//           }),
//         3000,
//       );
//     }
//   };

//   const handleRevokeEnrollment = async (eventId) => {
//     try {
//       setRevokingEventId(eventId);
//       const token = localStorage.getItem("token");
//       const response = await axios.delete(
//         `http://localhost:8080/api/enrollments/revokeEnrollment/${eventId}`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         },
//       );
//       if (response.data.success) {
//         setEnrolledEvents((prev) => prev.filter((id) => id !== eventId));
//         setEvents((prev) =>
//           prev.map((e) =>
//             e.eventId === eventId
//               ? {
//                   ...e,
//                   currEnrollments: Math.max((e.currEnrollments || 1) - 1, 0),
//                 }
//               : e,
//           ),
//         );
//         setEnrollmentMessage({
//           show: true,
//           eventId,
//           success: true,
//           message: "Enrollment revoked successfully!",
//         });
//         if (enrolledEvents.length - 1 > 0) {
//           checkAttendanceStatus();
//         } else {
//           setActiveAttendanceEvents({});
//         }
//       } else {
//         setEnrollmentMessage({
//           show: true,
//           eventId,
//           success: false,
//           message: response.data.message || "Failed to revoke enrollment.",
//         });
//       }
//     } catch (err) {
//       setEnrollmentMessage({
//         show: true,
//         eventId,
//         success: false,
//         message: err.response?.data?.message || "Error revoking enrollment.",
//       });
//     } finally {
//       setRevokingEventId(null);
//       setTimeout(
//         () =>
//           setEnrollmentMessage({
//             show: false,
//             eventId: null,
//             success: false,
//             message: "",
//           }),
//         3000,
//       );
//     }
//   };

//   // ── Page change ────────────────────────────────────────────────
//   const handlePageChange = (newPage) => {
//     if (newPage < 0 || newPage >= totalPages) return;
//     setCurrentPage(newPage);
//     const token = localStorage.getItem("token");

//     if (showEnrolledEvents) {
//       const start = newPage * pageSize;
//       setEvents(allEvents.slice(start, start + pageSize));
//       setCurrentPage(newPage);
//       return;
//     }

//     if (completedFilter !== "all") {
//       fetchEventsByCompletedStatusPaged(
//         completedFilter === "completed",
//         newPage,
//         pageSize,
//       );
//     } else if (selectedStatus !== "all") {
//       fetchEventsByDeadlinePaged(
//         selectedStatus.toUpperCase(),
//         newPage,
//         pageSize,
//       );
//     } else {
//       fetchEventsPaged(
//         token,
//         filterType,
//         selectedClubId || deptId,
//         newPage,
//         pageSize,
//       );
//     }
//     window.scrollTo({ top: 400, behavior: "smooth" });
//   };

//   const handlePageSizeChange = (newSize) => {
//     setPageSize(newSize);
//     setCurrentPage(0);
//     const token = localStorage.getItem("token");

//     if (showEnrolledEvents) {
//       setEvents(allEvents.slice(0, newSize));
//       setTotalPages(Math.ceil(allEvents.length / newSize));
//       return;
//     }

//     if (completedFilter !== "all") {
//       fetchEventsByCompletedStatusPaged(
//         completedFilter === "completed",
//         0,
//         newSize,
//       );
//     } else if (selectedStatus !== "all") {
//       fetchEventsByDeadlinePaged(selectedStatus.toUpperCase(), 0, newSize);
//     } else {
//       fetchEventsPaged(token, filterType, selectedClubId || deptId, 0, newSize);
//     }
//   };

//   // ── Filter handlers ────────────────────────────────────────────
//   const handleFilterChange = async (newFilterType, targetId = null) => {
//     const token = localStorage.getItem("token");
//     setFilterType(newFilterType);
//     setCurrentPage(0);

//     const resetFilters = () => {
//       setSelectedClubId("");
//       setShowClubDropdown(false);
//       setShowEnrolledEvents(false);
//       setCompletedFilter("all");
//       setSelectedStatus("all");
//     };

//     if (newFilterType === "CLUB") {
//       if (targetId) {
//         resetFilters();
//         setSelectedClubId(targetId);
//       } else {
//         setShowClubDropdown(true);
//         return;
//       }
//     } else {
//       resetFilters();
//     }
//     await fetchEventsPaged(
//       token,
//       newFilterType,
//       targetId || deptId,
//       0,
//       pageSize,
//     );
//   };

//   const handleCompletedFilterChange = async (value) => {
//     setCompletedFilter(value);
//     setCurrentPage(0);
//     if (value === "all") {
//       const token = localStorage.getItem("token");
//       await fetchEventsPaged(
//         token,
//         filterType,
//         selectedClubId || deptId,
//         0,
//         pageSize,
//       );
//     } else {
//       await fetchEventsByCompletedStatusPaged(
//         value === "completed",
//         0,
//         pageSize,
//       );
//     }
//   };

//   const handleStatusFilterChange = async (value) => {
//     setSelectedStatus(value);
//     setCurrentPage(0);
//     if (value === "all") {
//       const token = localStorage.getItem("token");
//       await fetchEventsPaged(
//         token,
//         filterType,
//         selectedClubId || deptId,
//         0,
//         pageSize,
//       );
//     } else {
//       await fetchEventsByDeadlinePaged(value.toUpperCase(), 0, pageSize);
//     }
//   };

//   const handleEnrolledEventsClick = async () => {
//     if (showEnrolledEvents) {
//       setShowEnrolledEvents(false);
//       setFilterType("GLOBAL");
//       setCurrentPage(0);
//       const token = localStorage.getItem("token");
//       await fetchEventsPaged(token, "GLOBAL", null, 0, pageSize);
//     } else {
//       await fetchEnrolledEvents();
//     }
//   };

//   const clearAllFilters = () => {
//     setSearchTerm("");
//     setSelectedStatus("all");
//     setCompletedFilter("all");
//     setFilterType("GLOBAL");
//     setSelectedClubId("");
//     setShowEnrolledEvents(false);
//     setCurrentPage(0);
//     const token = localStorage.getItem("token");
//     fetchEventsPaged(token, "GLOBAL", null, 0, pageSize);
//   };

//   const removeStatusFilter = async () => {
//     setSelectedStatus("all");
//     setCurrentPage(0);
//     const token = localStorage.getItem("token");
//     await fetchEventsPaged(
//       token,
//       filterType,
//       selectedClubId || deptId,
//       0,
//       pageSize,
//     );
//   };

//   const removeCompletedFilter = () => {
//     setCompletedFilter("all");
//     setCurrentPage(0);
//     const token = localStorage.getItem("token");
//     fetchEventsPaged(token, filterType, selectedClubId || deptId, 0, pageSize);
//   };

//   const handleRetry = () => {
//     const token = localStorage.getItem("token");
//     if (token) fetchEventsPaged(token, "GLOBAL", null, 0, pageSize);
//     else setError("No authentication token found. Please login again.");
//   };

//   // ── Client-side filter + sort ──────────────────────────────────
//   const getFilteredEvents = () => {
//     let filtered = [...events];
//     if (searchTerm) {
//       filtered = filtered.filter(
//         (e) =>
//           e.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           e.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           e.organizer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           e.creatorName?.toLowerCase().includes(searchTerm.toLowerCase()),
//       );
//     }
//     if (completedFilter !== "all") {
//       filtered = filtered.filter(
//         (e) => e.completed === (completedFilter === "completed"),
//       );
//     }
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

//   const filteredEvents = getFilteredEvents();

//   // ── Stats ──────────────────────────────────────────────────────
//   const totalEventsCount = totalElements;
//   const openEvents = events.filter(
//     (e) => e.enrollmentStatus?.toLowerCase() === "open",
//   ).length;
//   const completedEvents = events.filter((e) => e.completed === true).length;
//   const notCompletedEvents = events.filter((e) => e.completed === false).length;

//   // ── Loading / Error screens ────────────────────────────────────
//   if (loading && events.length === 0) {
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
//             Loading amazing events...
//           </p>
//           <p className="text-white/60 text-sm mt-2">
//             Get ready for something special!
//           </p>
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

//   // ── Render ─────────────────────────────────────────────────────
//   return (
//     <>
//       <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
//         {/* Animated background blobs */}
//         <div className="fixed inset-0 overflow-hidden pointer-events-none">
//           <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
//           <div
//             className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"
//             style={{ backgroundColor: "#4CA1AF" }}
//           ></div>
//           <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
//         </div>

//         {/* Sticky nav */}
//         <div className="sticky top-0 z-50 w-full bg-white border-b border-gray-100">
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//             <div className="flex items-center h-16">
//               <button
//                 onClick={() => navigate(-1)}
//                 className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#4CA1AF] transition-colors group"
//               >
//                 <ArrowLeft
//                   size={18}
//                   className="group-hover:-translate-x-1 transition-transform"
//                 />
//                 <span>Back to Dashboard</span>
//               </button>
//             </div>
//           </div>
//         </div>

//         <div className="relative max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
//           {/* Title */}
//           <div className="text-center">
//             <h1 className="text-5xl font-bold mb-4">
//               <span
//                 className="bg-clip-text text-transparent"
//                 style={{
//                   background: "linear-gradient(135deg, #4CA1AF, #2C3E50)",
//                   WebkitBackgroundClip: "text",
//                   WebkitTextFillColor: "transparent",
//                 }}
//               >
//                 Upcoming Events
//               </span>
//             </h1>
//             <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
//               Join exciting events, connect with amazing people, and create
//               unforgettable memories
//             </p>
//           </div>

//           {/* Stats */}
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-6">
//             {[
//               {
//                 label: "Total Events",
//                 value: totalEventsCount,
//                 colorClass: "text-gray-800",
//                 bgClass: "bg-blue-100",
//                 icon: <Calendar className="w-6 h-6 text-blue-600" />,
//               },
//               {
//                 label: "Open Events",
//                 value: openEvents,
//                 colorClass: "text-green-600",
//                 bgClass: "bg-green-100",
//                 icon: <CheckCircle className="w-6 h-6 text-green-600" />,
//               },
//               {
//                 label: "Completed",
//                 value: completedEvents,
//                 colorClass: "text-purple-600",
//                 bgClass: "bg-purple-100",
//                 icon: <CheckSquare className="w-6 h-6 text-purple-600" />,
//               },
//               {
//                 label: "Not Completed",
//                 value: notCompletedEvents,
//                 colorClass: "text-orange-600",
//                 bgClass: "bg-orange-100",
//                 icon: <CheckSquare className="w-6 h-6 text-orange-600" />,
//               },
//             ].map(({ label, value, colorClass, bgClass, icon }) => (
//               <div
//                 key={label}
//                 className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
//               >
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-sm text-gray-600">{label}</p>
//                     <p className={`text-3xl font-bold ${colorClass}`}>
//                       {value}
//                     </p>
//                   </div>
//                   <div className={`${bgClass} p-3 rounded-lg`}>{icon}</div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {userDept && (
//             <div className="mt-4 mb-8 text-center">
//               <div className="inline-block bg-white/80 backdrop-blur-sm px-6 py-3 rounded-xl shadow-md">
//                 <div className="flex items-center space-x-2">
//                   <div className="bg-green-100 p-2 rounded-lg">
//                     <Users className="w-4 h-4 text-green-600" />
//                   </div>
//                   <span className="text-sm font-medium text-gray-600">
//                     Department:
//                   </span>
//                   <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-sm font-semibold">
//                     {userDept}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* ── Search & Filter Bar ── */}
//           <div className="mb-8">
//             <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 border border-white/20">
//               <div className="flex flex-col lg:flex-row gap-4">
//                 <div className="flex-1 relative">
//                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 w-5 h-5" />
//                   <input
//                     type="text"
//                     placeholder="Search events by title, description, organizer, or creator..."
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all bg-white/50"
//                   />
//                 </div>
//                 <div className="flex items-center gap-3">
//                   <button
//                     onClick={() => setShowFilters(!showFilters)}
//                     className="px-4 py-3 text-white rounded-xl font-medium transition-all transform hover:scale-105 flex items-center space-x-2 shadow-lg"
//                     style={{
//                       background: "linear-gradient(135deg, #4CA1AF, #2C3E50)",
//                     }}
//                   >
//                     <Filter className="w-5 h-5" />
//                     <span>Filters</span>
//                     <ChevronDown
//                       className={`w-4 h-4 transition-transform duration-300 ${showFilters ? "rotate-180" : ""}`}
//                     />
//                   </button>
//                   <div className="w-52">
//                     <CustomSelect
//                       name="sortBy"
//                       value={sortBy}
//                       onChange={(e) => setSortBy(e.target.value)}
//                       options={sortOptions}
//                       placeholder="Sort by..."
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* Active filter chips */}
//               {(filterType !== "GLOBAL" ||
//                 selectedStatus !== "all" ||
//                 completedFilter !== "all" ||
//                 selectedClubId ||
//                 showEnrolledEvents) && (
//                 <div className="mt-4 pt-4 border-t border-gray-200">
//                   <div className="flex flex-wrap items-center gap-2">
//                     <span className="text-sm font-medium text-gray-600 mr-2">
//                       Active Filters:
//                     </span>
//                     {filterType === "DEPARTMENT" && userDept && (
//                       <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center">
//                         Dept: {userDept}
//                         <button
//                           onClick={() => handleFilterChange("GLOBAL")}
//                           className="ml-2 hover:text-green-900"
//                         >
//                           <X className="w-3 h-3" />
//                         </button>
//                       </span>
//                     )}
//                     {filterType === "CLUB" && selectedClubId && (
//                       <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center">
//                         Club:{" "}
//                         {
//                           userClubs.find(
//                             (c) =>
//                               c.clubId.toString() === selectedClubId.toString(),
//                           )?.clubName
//                         }
//                         <button
//                           onClick={() => handleFilterChange("GLOBAL")}
//                           className="ml-2 hover:text-purple-900"
//                         >
//                           <X className="w-3 h-3" />
//                         </button>
//                       </span>
//                     )}
//                     {showEnrolledEvents && (
//                       <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center">
//                         My Enrolled Events
//                         <button
//                           onClick={() => {
//                             setShowEnrolledEvents(false);
//                             const token = localStorage.getItem("token");
//                             fetchEventsPaged(
//                               token,
//                               filterType,
//                               selectedClubId || deptId,
//                               0,
//                               pageSize,
//                             );
//                           }}
//                           className="ml-2 hover:text-green-900"
//                         >
//                           <X className="w-3 h-3" />
//                         </button>
//                       </span>
//                     )}
//                     {selectedStatus !== "all" && (
//                       <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center">
//                         Enrollment: {selectedStatus}
//                         <button
//                           onClick={removeStatusFilter}
//                           className="ml-2 hover:text-blue-900"
//                         >
//                           <X className="w-3 h-3" />
//                         </button>
//                       </span>
//                     )}
//                     {completedFilter !== "all" && (
//                       <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center">
//                         Completed:{" "}
//                         {completedFilter === "completed" ? "Yes" : "No"}
//                         <button
//                           onClick={removeCompletedFilter}
//                           className="ml-2 hover:text-purple-900"
//                         >
//                           <X className="w-3 h-3" />
//                         </button>
//                       </span>
//                     )}
//                     <button
//                       onClick={clearAllFilters}
//                       className="px-3 py-1 text-red-600 hover:text-red-800 text-sm font-medium ml-auto"
//                     >
//                       Clear All
//                     </button>
//                   </div>
//                 </div>
//               )}

//               {/* Expanded filter panel */}
//               {showFilters && (
//                 <div className="mt-4 pt-4 border-t border-gray-200">
//                   <div className="flex flex-col space-y-4">
//                     <div className="flex flex-wrap items-start gap-3">
//                       <span className="text-sm font-medium text-gray-600 pt-2.5">
//                         Filter by:
//                       </span>
//                       <div className="flex flex-wrap items-center gap-2 flex-1">
//                         <button
//                           onClick={handleEnrolledEventsClick}
//                           className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${showEnrolledEvents ? "bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg" : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"}`}
//                         >
//                           My Enrolled Events
//                         </button>
//                         <button
//                           onClick={() => {
//                             handleFilterChange("GLOBAL");
//                             setShowEnrolledEvents(false);
//                           }}
//                           className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${filterType === "GLOBAL" && !showEnrolledEvents ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg" : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"}`}
//                         >
//                           Global Events
//                         </button>
//                         {userDept && (
//                           <button
//                             onClick={() => handleFilterChange("DEPARTMENT")}
//                             className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${filterType === "DEPARTMENT" ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg" : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"}`}
//                           >
//                             {userDept} Events
//                           </button>
//                         )}
//                         <button
//                           onClick={() => {
//                             setShowClubDropdown(!showClubDropdown);
//                             setShowEnrolledEvents(false);
//                           }}
//                           className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${filterType === "CLUB" ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg" : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"}`}
//                         >
//                           <span>Club Events</span>
//                           <ChevronDown
//                             className={`w-4 h-4 transition-transform duration-300 ${showClubDropdown ? "rotate-180" : ""}`}
//                           />
//                         </button>
//                         <div className="w-48">
//                           <CustomSelect
//                             name="selectedStatus"
//                             value={selectedStatus}
//                             onChange={(e) =>
//                               handleStatusFilterChange(e.target.value)
//                             }
//                             options={enrollmentStatusOptions}
//                             placeholder="Enrollment Status"
//                           />
//                         </div>
//                         <div className="w-48">
//                           <CustomSelect
//                             name="completedFilter"
//                             value={completedFilter}
//                             onChange={(e) =>
//                               handleCompletedFilterChange(e.target.value)
//                             }
//                             options={completedStatusOptions}
//                             placeholder="Completed Status"
//                           />
//                         </div>
//                       </div>
//                     </div>

//                     {/* Club sub-list */}
//                     {showClubDropdown && (
//                       <div className="mt-2 border border-gray-200 rounded-xl bg-white shadow-lg overflow-hidden">
//                         <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
//                           <h3 className="font-semibold text-gray-700">
//                             SELECT A CLUB
//                           </h3>
//                         </div>
//                         <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
//                           {userClubs.length > 0 ? (
//                             userClubs.map((club) => (
//                               <button
//                                 key={club.clubId}
//                                 onClick={() => {
//                                   handleFilterChange("CLUB", club.clubId);
//                                   setShowClubDropdown(false);
//                                 }}
//                                 className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${selectedClubId === club.clubId.toString() ? "bg-purple-50" : ""}`}
//                               >
//                                 <div className="flex items-center justify-between mb-2">
//                                   <span className="font-semibold text-gray-800">
//                                     {club.clubName}
//                                   </span>
//                                   <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
//                                     {club.memberCount || "0"} members
//                                   </span>
//                                 </div>
//                                 {club.desc && (
//                                   <p className="text-sm text-gray-600">
//                                     {club.desc}
//                                   </p>
//                                 )}
//                               </button>
//                             ))
//                           ) : (
//                             <div className="p-6 text-center">
//                               <p className="text-gray-500">
//                                 No clubs available
//                               </p>
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Results count + enrollment badge */}
//           <div className="mb-4 flex justify-between items-center">
//             <p className="text-sm text-gray-600">
//               Showing{" "}
//               <span className="font-semibold">{filteredEvents.length}</span> on
//               this page
//               {totalPages > 1 && (
//                 <>
//                   {" "}
//                   · Page{" "}
//                   <span className="font-semibold">
//                     {currentPage + 1}
//                   </span> of <span className="font-semibold">{totalPages}</span>
//                 </>
//               )}{" "}
//               · <span className="font-semibold">{totalElements}</span> total
//             </p>
//             <div className="bg-green-50 px-3 py-1 rounded-full text-xs font-medium text-green-700 flex items-center">
//               <CheckCircle className="w-3 h-3 mr-1" />
//               Your Enrollments: {enrolledEvents.length}
//             </div>
//           </div>

//           {/* Loading overlay */}
//           {loading && events.length > 0 && (
//             <div className="flex justify-center mb-4">
//               <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow flex items-center gap-2 text-sm text-gray-600">
//                 <Loader2 className="w-4 h-4 animate-spin text-[#4CA1AF]" />
//                 Loading page {currentPage + 1}…
//               </div>
//             </div>
//           )}

//           {/* Events grid */}
//           {filteredEvents.length === 0 ? (
//             <div className="text-center py-16">
//               <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 max-w-md mx-auto border border-white/20">
//                 <div className="relative">
//                   <div className="absolute inset-0 flex items-center justify-center">
//                     <div className="w-32 h-32 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 animate-ping"></div>
//                   </div>
//                   <Calendar className="w-20 h-20 text-gray-400 mx-auto mb-4 relative z-10" />
//                 </div>
//                 <h3 className="text-2xl font-bold text-gray-800 mb-2">
//                   No Events Found
//                 </h3>
//                 <p className="text-gray-600 mb-6">
//                   {filterType === "CLUB" && !selectedClubId
//                     ? "Please select a club from the dropdown to view its events."
//                     : showEnrolledEvents
//                       ? "You haven't enrolled in any events yet. Browse events and enroll to see them here!"
//                       : completedFilter !== "all"
//                         ? `No ${completedFilter === "completed" ? "completed" : "not completed"} events visible to you.`
//                         : selectedStatus !== "all"
//                           ? `No ${selectedStatus} enrollment events visible to you.`
//                           : "There are no events available at the moment. Check back later!"}
//                 </p>
//                 {(filterType !== "GLOBAL" ||
//                   searchTerm ||
//                   selectedStatus !== "all" ||
//                   completedFilter !== "all") && (
//                   <button
//                     onClick={clearAllFilters}
//                     className="mt-4 px-6 py-3 text-purple-600 hover:text-purple-800 font-medium"
//                   >
//                     Clear All Filters
//                   </button>
//                 )}
//               </div>
//             </div>
//           ) : (
//             <>
//               <div className="flex justify-center">
//                 <div
//                   className={`grid gap-4 w-full ${filteredEvents.length === 1 ? "grid-cols-1 max-w-sm mx-auto" : filteredEvents.length === 2 ? "grid-cols-1 md:grid-cols-2 max-w-2xl mx-auto" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"}`}
//                 >
//                   {filteredEvents.map((event, index) => {
//                     const daysUntil = getDaysUntil(event.dateTime);
//                     const targetTypeColor = getTargetTypeColor(
//                       event.targetType,
//                     );
//                     const isEnrolled = enrolledEvents.includes(
//                       Number(event.eventId),
//                     );

//                     return (
//                       <div
//                         key={event.eventId}
//                         className="event-card-container animate-[fadeIn_0.5s_ease-in-out]"
//                         style={{ animationDelay: `${index * 100}ms` }}
//                       >
//                         <div className="event-card">
//                           {/* ── FRONT ── */}
//                           <div className="card-face card-front bg-white/90 backdrop-blur-sm rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-500 border border-white/20">
//                             <div
//                               className="relative h-32 p-3 overflow-hidden"
//                               style={{
//                                 background:
//                                   "linear-gradient(135deg, #4CA1AF, #2C3E50)",
//                               }}
//                             >
//                               <div className="absolute inset-0 opacity-10">
//                                 <div className="absolute -top-12 -right-12 w-24 h-24 bg-white rounded-full"></div>
//                                 <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-white rounded-full"></div>
//                               </div>
//                               {daysUntil > 0 && !event.completed && (
//                                 <div className="absolute top-2 left-2 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
//                                   <span className="text-white text-xs font-semibold">
//                                     {daysUntil} days to go
//                                   </span>
//                                 </div>
//                               )}
//                               {event.completed && (
//                                 <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full flex items-center shadow-lg">
//                                   <CheckSquare className="w-3 h-3 mr-1" />
//                                   <span className="text-xs font-semibold">
//                                     Completed
//                                   </span>
//                                 </div>
//                               )}
//                               {isEnrolled && (
//                                 <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full flex items-center shadow-lg">
//                                   <CheckCircle className="w-3 h-3 mr-1" />
//                                   <span className="text-xs font-semibold">
//                                     Enrolled
//                                   </span>
//                                 </div>
//                               )}
//                               {isEnrolled &&
//                                 activeAttendanceEvents[event.eventId]
//                                   ?.canMark && (
//                                   <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full flex items-center shadow-lg animate-pulse">
//                                     <CheckCircle className="w-3 h-3 mr-1" />
//                                     <span className="text-xs font-semibold">
//                                       Attendance Active
//                                     </span>
//                                   </div>
//                                 )}
//                               <div className="absolute bottom-2 right-2 text-right">
//                                 <h3 className="text-sm font-bold text-white mb-0.5 line-clamp-1">
//                                   {event.title}
//                                 </h3>
//                                 <p className="text-[10px] text-white/80 line-clamp-1">
//                                   {event.description}
//                                 </p>
//                               </div>
//                             </div>

//                             <div className="p-3 space-y-2">
//                               <div className="flex flex-wrap gap-1">
//                                 <div className="bg-blue-50 px-2 py-0.5 rounded-full text-[10px] font-medium text-blue-600 flex items-center">
//                                   <Calendar className="w-2.5 h-2.5 mr-1" />
//                                   {formatDateTime(event.dateTime)}
//                                 </div>
//                                 <div className="bg-green-50 px-2 py-0.5 rounded-full text-[10px] font-medium text-green-600 flex items-center">
//                                   <MapPin className="w-2.5 h-2.5 mr-1" />
//                                   {event.venue}
//                                 </div>
//                               </div>
//                               <div className="grid grid-cols-2 gap-1">
//                                 <div className="bg-gray-50 p-1.5 rounded-lg">
//                                   <p className="text-[8px] text-gray-500">
//                                     Organizer
//                                   </p>
//                                   <p className="text-xs font-semibold text-gray-800 flex items-center truncate">
//                                     <User className="w-3 h-3 mr-0.5 text-blue-500 flex-shrink-0" />
//                                     <span className="truncate">
//                                       {event.organizer}
//                                     </span>
//                                   </p>
//                                 </div>
//                                 <div className="bg-gray-50 p-1.5 rounded-lg">
//                                   <p className="text-[8px] text-gray-500">
//                                     Speaker
//                                   </p>
//                                   <p className="text-xs font-semibold text-gray-800 flex items-center truncate">
//                                     <User className="w-3 h-3 mr-0.5 text-green-500 flex-shrink-0" />
//                                     <span className="truncate">
//                                       {event.speakerName || event.organizer}
//                                     </span>
//                                   </p>
//                                 </div>
//                               </div>
//                               <div className="flex items-center justify-between">
//                                 <span
//                                   className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${targetTypeColor} flex items-center`}
//                                 >
//                                   {getTargetTypeIcon(event.targetType)}
//                                   <span className="ml-1 capitalize text-xs">
//                                     {event.targetType || "N/A"}
//                                   </span>
//                                 </span>
//                               </div>
//                               <div className="text-center text-[8px] mt-1 flex items-center justify-center text-purple-600">
//                                 <span className="animate-pulse mr-1 text-[6px]">
//                                   ●
//                                 </span>
//                                 Hover to view all details
//                               </div>
//                             </div>
//                           </div>

//                           {/* ── BACK ── */}
//                           <div className="card-face card-back rounded-xl shadow-md overflow-hidden p-3 bg-gradient-to-br from-[#4CA1AF] to-[#2C3E50]">
//                             <div className="h-full flex flex-col">
//                               <div className="flex items-center justify-between mb-2">
//                                 <h3 className="text-sm font-bold text-white line-clamp-1 flex-1">
//                                   {event.title}
//                                 </h3>
//                                 {event.completed && (
//                                   <span className="bg-green-500 text-white px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center ml-1">
//                                     <CheckSquare className="w-2.5 h-2.5 mr-0.5" />
//                                     Completed
//                                   </span>
//                                 )}
//                                 {isEnrolled && (
//                                   <span className="bg-green-500 text-white px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center ml-1">
//                                     <CheckCircle className="w-2.5 h-2.5 mr-0.5" />
//                                     Enrolled
//                                   </span>
//                                 )}
//                               </div>

//                               <div className="space-y-1.5 overflow-y-auto flex-1 pr-1 custom-scrollbar text-xs">
//                                 <div className="grid grid-cols-2 gap-1">
//                                   <div
//                                     className="p-1.5 rounded-lg"
//                                     style={{
//                                       backgroundColor: "rgba(255,255,255,0.1)",
//                                     }}
//                                   >
//                                     <div className="flex items-center mb-0.5">
//                                       <Calendar className="w-3 h-3 mr-1 text-white/80" />
//                                       <p className="text-[10px] text-white/80">
//                                         Date
//                                       </p>
//                                     </div>
//                                     <p className="text-xs font-medium text-white">
//                                       {formatDateTime(event.dateTime)}
//                                     </p>
//                                   </div>
//                                   <div
//                                     className="p-1.5 rounded-lg"
//                                     style={{
//                                       backgroundColor: "rgba(255,255,255,0.1)",
//                                     }}
//                                   >
//                                     <div className="flex items-center mb-0.5">
//                                       <Clock className="w-3 h-3 mr-1 text-white/80" />
//                                       <p className="text-[10px] text-white/80">
//                                         Enrollment Deadline
//                                       </p>
//                                     </div>
//                                     <p className="text-xs font-medium text-white">
//                                       {formatDateOnly(event.enrollmentDeadline)}
//                                     </p>
//                                   </div>
//                                 </div>

//                                 <div
//                                   className="p-1.5 rounded-lg"
//                                   style={{
//                                     backgroundColor: "rgba(255,255,255,0.1)",
//                                   }}
//                                 >
//                                   <p className="text-[10px] text-white/80 mb-1 flex items-center">
//                                     <Star className="w-2.5 h-2.5 mr-1" />
//                                     Created By
//                                   </p>
//                                   <p className="text-xs font-medium text-white truncate">
//                                     {event.creatorName ||
//                                       event.organizer ||
//                                       "Unknown"}
//                                   </p>
//                                 </div>

//                                 {event.enrollmentStatus && (
//                                   <div
//                                     className="p-1.5 rounded-lg"
//                                     style={{
//                                       backgroundColor: "rgba(255,255,255,0.1)",
//                                     }}
//                                   >
//                                     <p className="text-[10px] text-white/80 mb-1 flex items-center">
//                                       <Radio className="w-2.5 h-2.5 mr-1" />
//                                       Enrollment Status
//                                     </p>
//                                     <span
//                                       className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${event.enrollmentStatus?.toUpperCase() === "OPEN" ? "bg-emerald-400/30 text-emerald-100" : "bg-red-400/30 text-red-100"}`}
//                                     >
//                                       {event.enrollmentStatus?.toUpperCase() ===
//                                       "OPEN"
//                                         ? "Open"
//                                         : "Closed"}
//                                     </span>
//                                   </div>
//                                 )}

//                                 {event.targetType?.toUpperCase() ===
//                                   "DEPARTMENT" &&
//                                   event.targetIds?.length > 0 && (
//                                     <div
//                                       className="p-1.5 rounded-lg"
//                                       style={{
//                                         backgroundColor:
//                                           "rgba(255,255,255,0.1)",
//                                       }}
//                                     >
//                                       <p className="text-[10px] text-white/80 mb-1 flex items-center">
//                                         <Briefcase className="w-2.5 h-2.5 mr-1" />
//                                         Target Departments
//                                       </p>
//                                       <div className="flex flex-wrap gap-1 mt-1">
//                                         {event.targetIds.map((id) => {
//                                           const dept = departments.find(
//                                             (d) =>
//                                               Number(d.departmentId) ===
//                                               Number(id),
//                                           );
//                                           return (
//                                             <span
//                                               key={id}
//                                               className="px-1.5 py-0.5 rounded text-[8px] font-medium text-white"
//                                               style={{
//                                                 backgroundColor:
//                                                   "rgba(255,255,255,0.2)",
//                                               }}
//                                             >
//                                               {dept?.name || `Dept ${id}`}
//                                             </span>
//                                           );
//                                         })}
//                                       </div>
//                                     </div>
//                                   )}

//                                 {event.targetType?.toUpperCase() === "CLUB" &&
//                                   event.targetIds?.length > 0 && (
//                                     <div
//                                       className="p-1.5 rounded-lg"
//                                       style={{
//                                         backgroundColor:
//                                           "rgba(255,255,255,0.1)",
//                                       }}
//                                     >
//                                       <p className="text-[10px] text-white/80 mb-1 flex items-center">
//                                         <Users className="w-2.5 h-2.5 mr-1" />
//                                         Target Clubs
//                                       </p>
//                                       <div className="flex flex-wrap gap-1 mt-1">
//                                         {event.targetIds.map((id) => {
//                                           const club =
//                                             allClubs.find(
//                                               (c) =>
//                                                 Number(c.clubId) === Number(id),
//                                             ) ||
//                                             userClubs.find(
//                                               (c) =>
//                                                 Number(c.clubId) === Number(id),
//                                             );
//                                           return (
//                                             <span
//                                               key={id}
//                                               className="px-1.5 py-0.5 rounded text-[8px] font-medium text-white"
//                                               style={{
//                                                 backgroundColor:
//                                                   "rgba(255,255,255,0.2)",
//                                               }}
//                                             >
//                                               {club?.clubName || `Club ${id}`}
//                                             </span>
//                                           );
//                                         })}
//                                       </div>
//                                     </div>
//                                   )}
//                               </div>

//                               {/* Card action buttons — Student */}
//                               <div className="mt-2 pt-1 border-t border-white/20">
//                                 {!event.completed ? (
//                                   isEnrolled ? (
//                                     <div className="relative">
//                                       {attendanceMessage.show &&
//                                         attendanceMessage.eventId ===
//                                           event.eventId && (
//                                           <div
//                                             className={`absolute bottom-full mb-2 left-0 right-0 text-center text-[10px] font-medium ${attendanceMessage.success ? "text-green-400" : "text-red-400"}`}
//                                           >
//                                             {attendanceMessage.message}
//                                           </div>
//                                         )}

//                                       {activeAttendanceEvents[event.eventId]
//                                         ?.canMark ? (
//                                         <button
//                                           onClick={(e) => {
//                                             e.stopPropagation();
//                                             setSelectedEventForMarking(event);
//                                             setShowMarkAttendancePopup(true);
//                                           }}
//                                           disabled={
//                                             markingAttendanceId ===
//                                             event.eventId
//                                           }
//                                           className="w-full py-1.5 rounded-lg text-xs font-medium transition flex items-center justify-center bg-gradient-to-r from-green-500 to-teal-500 text-white hover:from-green-600 hover:to-teal-600 mb-2"
//                                         >
//                                           {markingAttendanceId ===
//                                           event.eventId ? (
//                                             <>
//                                               <Loader2 className="w-3 h-3 mr-1 animate-spin" />
//                                               Loading...
//                                             </>
//                                           ) : (
//                                             <>
//                                               <Camera className="w-3 h-3 mr-1" />
//                                               Scan QR Code
//                                             </>
//                                           )}
//                                         </button>
//                                       ) : activeAttendanceEvents[event.eventId]
//                                           ?.active &&
//                                         !activeAttendanceEvents[event.eventId]
//                                           ?.withinWindow ? (
//                                         <div className="w-full py-1.5 rounded-lg text-xs font-medium text-center bg-yellow-500/50 text-white mb-2">
//                                           Outside Attendance Window
//                                         </div>
//                                       ) : null}

//                                       {enrollmentMessage.show &&
//                                         enrollmentMessage.eventId ===
//                                           event.eventId && (
//                                           <div
//                                             className={`absolute bottom-full mb-2 left-0 right-0 text-center text-[10px] font-medium ${enrollmentMessage.success ? "text-green-400" : "text-red-400"}`}
//                                           >
//                                             {enrollmentMessage.message}
//                                           </div>
//                                         )}
//                                       <button
//                                         onClick={() =>
//                                           setConfirmDialog({
//                                             isOpen: true,
//                                             title: "Revoke Enrollment",
//                                             message:
//                                               "Are you sure you want to revoke your enrollment for this event?",
//                                             confirmText: "Revoke",
//                                             variant: "danger",
//                                             onConfirm: () => {
//                                               closeConfirm();
//                                               handleRevokeEnrollment(
//                                                 event.eventId,
//                                               );
//                                             },
//                                           })
//                                         }
//                                         disabled={
//                                           revokingEventId === event.eventId
//                                         }
//                                         className="w-full py-1.5 rounded-lg text-xs font-medium transition flex items-center justify-center bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700"
//                                       >
//                                         {revokingEventId === event.eventId ? (
//                                           <>
//                                             <Loader2 className="w-3 h-3 mr-1 animate-spin" />
//                                             Revoking...
//                                           </>
//                                         ) : (
//                                           <>
//                                             <XCircle className="w-3 h-3 mr-1" />
//                                             Revoke Enrollment
//                                           </>
//                                         )}
//                                       </button>
//                                     </div>
//                                   ) : event.enrollmentStatus === "OPEN" ? (
//                                     <div className="relative">
//                                       {enrollmentMessage.show &&
//                                         enrollmentMessage.eventId ===
//                                           event.eventId && (
//                                           <div
//                                             className={`absolute bottom-full mb-2 left-0 right-0 text-center text-[10px] font-medium ${enrollmentMessage.success ? "text-green-400" : "text-red-400"}`}
//                                           >
//                                             {enrollmentMessage.message}
//                                           </div>
//                                         )}
//                                       <button
//                                         onClick={() =>
//                                           setConfirmDialog({
//                                             isOpen: true,
//                                             title: "Confirm Enrollment",
//                                             message:
//                                               "Are you sure you want to enroll in this event?",
//                                             confirmText: "Enroll",
//                                             variant: "primary",
//                                             onConfirm: () => {
//                                               closeConfirm();
//                                               handleEnroll(event.eventId);
//                                             },
//                                           })
//                                         }
//                                         disabled={
//                                           enrollingEventId === event.eventId
//                                         }
//                                         className="w-full py-1.5 rounded-lg text-xs font-medium transition flex items-center justify-center bg-gradient-to-r from-[#4CA1AF] to-[#2C3E50] text-white hover:from-[#3d8a9c] hover:to-[#1f2f3f]"
//                                       >
//                                         {enrollingEventId === event.eventId ? (
//                                           <>
//                                             <Loader2 className="w-3 h-3 mr-1 animate-spin" />
//                                             Enrolling...
//                                           </>
//                                         ) : (
//                                           "Enroll Now"
//                                         )}
//                                       </button>
//                                     </div>
//                                   ) : null
//                                 ) : (
//                                   <div className="w-full py-1.5 rounded-lg text-xs font-medium text-center bg-gray-500/50 text-white">
//                                     Event Completed
//                                   </div>
//                                 )}
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               </div>

//               {totalPages > 1 && (
//                 <PaginationControls
//                   currentPage={currentPage}
//                   totalPages={totalPages}
//                   totalElements={totalElements}
//                   pageSize={pageSize}
//                   onPageChange={handlePageChange}
//                   onPageSizeChange={handlePageSizeChange}
//                   loading={loading}
//                 />
//               )}
//             </>
//           )}

//           <div className="mt-12 text-center">
//             <div className="inline-flex items-center space-x-2 text-gray-500 text-sm">
//               <Bell className="w-4 h-4" />
//               <span>Stay tuned for more exciting events!</span>
//               <Gift className="w-4 h-4" />
//             </div>
//           </div>
//         </div>

//         <style jsx>{sharedStyles}</style>
//       </div>

//       <MarkAttendancePopup
//         isOpen={showMarkAttendancePopup}
//         onClose={() => {
//           setShowMarkAttendancePopup(false);
//           setSelectedEventForMarking(null);
//         }}
//         event={selectedEventForMarking}
//         token={localStorage.getItem("token")}
//         onSuccess={handleMarkAttendanceSuccess}
//       />

//       <ConfirmDialog
//         isOpen={confirmDialog.isOpen}
//         title={confirmDialog.title}
//         message={confirmDialog.message}
//         confirmText={confirmDialog.confirmText}
//         variant={confirmDialog.variant}
//         onConfirm={confirmDialog.onConfirm}
//         onCancel={closeConfirm}
//       />
//     </>
//   );
// };

// export default StudentEvents;
