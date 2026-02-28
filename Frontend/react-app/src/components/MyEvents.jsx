import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ConfirmDialog from "./ConfirmDialog";
import CustomSelect from "./CustomSelect";
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
  Briefcase,
  Plus,
  X,
  Edit,
  Trash2,
  Settings,
  Eye,
  CheckSquare,
  Square,
  ArrowLeft,
} from "lucide-react";

const MyEvents = () => {
  const [events, setEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
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
  const [allClubs, setAllClubs] = useState([]);
  const [selectedClubId, setSelectedClubId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("date");
  const [showClubDropdown, setShowClubDropdown] = useState(false);
  const [teacherClubs, setTeacherClubs] = useState([]);
  const [showCreatedEvents, setShowCreatedEvents] = useState(false);
  const navigate = useNavigate();
  const [enrollingEventId, setEnrollingEventId] = useState(null);
  const [enrolledEvents, setEnrolledEvents] = useState([]);
  const [revokingEventId, setRevokingEventId] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    variant: "primary",
    confirmText: "Confirm",
    onConfirm: () => {},
  });
  const closeConfirm = () =>
    setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
  const [enrollmentMessage, setEnrollmentMessage] = useState({
    show: false,
    eventId: null,
    success: false,
    message: "",
  });
  const [userPrn, setUserPrn] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [completedFilter, setCompletedFilter] = useState("all");
  const [deadlineFilter, setDeadlineFilter] = useState("all");
  const [showEnrolledEvents, setShowEnrolledEvents] = useState(false);
  const [userMap, setUserMap] = useState({});
  const isTeacher = userRole === "TEACHER" || userRole === "TEACHERS";
  const [completingEventId, setCompletingEventId] = useState(null);
  const [completionMessage, setCompletionMessage] = useState({
    show: false,
    eventId: null,
    success: false,
    message: "",
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  const primaryGradient = "bg-gradient-to-r from-[#4CA1AF] to-[#2C3E50]";

  const animations = {
    fadeIn: "animate-[fadeIn_0.5s_ease-in-out]",
    gradient: primaryGradient,
  };

  // ─── CustomSelect option sets ───────────────────────────────────
  const enrollmentStatusOptions = [
    { value: "all", label: "Enrollment Status" },
    { value: "open", label: "Open" },
    { value: "closed", label: "Closed" },
  ];

  const completedStatusOptions = [
    { value: "all", label: "Completed Status" },
    { value: "completed", label: "Completed" },
    { value: "notCompleted", label: "Not Completed" },
  ];

  const sortOptions = [
    { value: "date", label: "Sort by Date" },
    { value: "popularity", label: "Sort by Popularity" },
    { value: "enrollment", label: "Sort by Capacity" },
  ];

  const targetTypeOptions = [
    { value: "GLOBAL", label: "Global" },
    { value: "CLUB", label: "Club" },
    { value: "DEPARTMENT", label: "Department" },
  ];
  // ────────────────────────────────────────────────────────────────

  useEffect(() => {
    const init = async () => {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("token");
      const role = user?.role || "user";
      setUserRole(role);

      if (!token) {
        setError("No authentication token found. Please login again.");
        setLoading(false);
        return;
      }

      const prn = user?.prn;
      fetchTargetTypes(token);
      fetchDepartments(token);
      fetchUserProfile(token);
      fetchUserClubs(token);
      fetchAllClubs(token);

      if (prn) await fetchUserEnrollments(token, prn);

      fetchEvents(token, role, "GLOBAL");
    };

    init();
  }, []);

  // ─────────────────────────────────────────────────────────────────
  // VISIBILITY HELPER
  // Returns true when the current user is allowed to see this event.
  //
  //  Everyone → GLOBAL events
  //  User / Teacher → events targeting their DEPARTMENT
  //  User / Teacher → events targeting any of their CLUBs
  //  Teacher (extra) → ANY event they personally created
  // ─────────────────────────────────────────────────────────────────
  const isEventVisibleToUser = (
    event,
    currentDeptId,
    currentUserClubs,
    currentUserPrn,
    currentIsTeacher,
  ) => {
    const targetType = event.targetType?.toUpperCase();

    if (targetType === "GLOBAL") return true;

    if (targetType === "DEPARTMENT") {
      return (
        currentDeptId != null &&
        event.targetIds?.map(Number).includes(Number(currentDeptId))
      );
    }

    if (targetType === "CLUB") {
      const myClubIds = currentUserClubs.map((c) => Number(c.clubId));
      return event.targetIds?.map(Number).some((id) => myClubIds.includes(id));
    }

    // Teachers also see events they personally created, regardless of target type
    if (currentIsTeacher && event.creatorPrn === currentUserPrn) return true;

    return false;
  };

  // ── Edit modal helpers ──────────────────────────────────────────
  const handleEditClick = (event) => {
    const fmt = (d) => {
      if (!d) return "";
      return new Date(d).toISOString().slice(0, 16);
    };
    setEditingEvent({
      eventId: event.eventId,
      title: event.title || "",
      description: event.description || "",
      dateTime: fmt(event.dateTime),
      organizer: event.organizer || "",
      speakerName: event.speakerName || "",
      venue: event.venue || "",
      maxEnrollments: event.maxEnrollments || 0,
      enrollmentDeadline: fmt(event.enrollmentDeadline),
      targetType: event.targetType || "GLOBAL",
      targetIds: event.targetIds || [],
      latitude: event.latitude || null,
      longitude: event.longitude || null,
      radiusInMeters: event.radiusInMeters || null,
      attendanceWindowStart: fmt(event.attendanceWindowStart),
      attendanceWindowEnd: fmt(event.attendanceWindowEnd),
      qrRefreshInterval: event.qrRefreshInterval || 0,
    });
    setShowEditModal(true);
    setUpdateError(null);
  };

  const handleEditInputChange = (e) => {
    const { name, value, type } = e.target;
    if (type === "number") {
      setEditingEvent((prev) => ({
        ...prev,
        [name]: value === "" ? "" : parseInt(value),
      }));
    } else if (name === "targetIds") {
      const ids = value
        .split(",")
        .map((id) => parseInt(id.trim()))
        .filter((id) => !isNaN(id));
      setEditingEvent((prev) => ({ ...prev, [name]: ids }));
    } else {
      setEditingEvent((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    try {
      setUpdateLoading(true);
      setUpdateError(null);
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:8080/api/events/updateEvent/${editingEvent.eventId}`,
        editingEvent,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      if (response.data.success) {
        alert("Event updated successfully!");
        setShowEditModal(false);
        setEditingEvent(null);
        fetchEvents(token);
      } else {
        setUpdateError(response.data.message || "Failed to update event");
      }
    } catch (err) {
      setUpdateError(
        err.response?.data?.message ||
          "An error occurred while updating the event",
      );
    } finally {
      setUpdateLoading(false);
    }
  };

  // ── Profile / department / club fetchers ────────────────────────
  const fetchUserProfile = async (token) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const prn = user?.prn;
      if (!prn) return;
      setUserPrn(prn);
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
        fetchUserEnrollments(token, prn);
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
      if (response.data.success) setDepartments(response.data.data);
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
        if (dept) setDeptId(dept.departmentId);
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
        setTeacherClubs(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching user clubs:", err);
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
      if (response.data.success) setAllClubs(response.data.data);
    } catch (err) {
      console.error("Error fetching all clubs:", err);
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
      if (response.data.success) setTargetTypes(response.data.data);
    } catch (err) {
      console.error("Error fetching target types:", err);
    }
  };

  const fetchUserNameByPrn = async (token, prn) => {
    if (userMap[prn]) return userMap[prn];
    try {
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
        const name =
          response.data.data.name || response.data.data.fullName || prn;
        setUserMap((prev) => ({ ...prev, [prn]: name }));
        return name;
      }
    } catch (err) {
      console.error(`Error fetching user for PRN ${prn}:`, err);
    }
    return prn;
  };

  // Enriches a raw event list with resolved creator names
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

  // ── Main event fetcher (used for scope-based filters) ────────────
  const fetchEvents = async (
    token,
    role,
    filter = "GLOBAL",
    targetId = null,
  ) => {
    try {
      setLoading(true);
      let response;

      if (role === "TEACHER" || role === "TEACHERS") {
        if (filter === "GLOBAL") {
          response = await axios.get(
            "http://localhost:8080/api/events/getByTargetType/GLOBAL",
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            },
          );
        } else if (filter === "CREATED") {
          response = await axios.get(
            "http://localhost:8080/api/events/myEvents",
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            },
          );
        } else if (filter === "DEPARTMENT" && targetId) {
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
        }
      } else {
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
            "http://localhost:8080/api/events/getByTargetType/GLOBAL",
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            },
          );
        }
      }

      let fetched = (response?.data?.success ? response.data.data : []) || [];
      fetched = await enrichWithCreatorNames(token, fetched);
      setEvents(fetched);
      setAllEvents(fetched);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError(err.message || "An error occurred while fetching events");
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────
  // Fetch by completed status → then SCOPE to what this user may see
  // ─────────────────────────────────────────────────────────────────
  const fetchEventsByCompletedStatus = async (completed) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));
      const currentPrn = user?.prn || userPrn;
      const currentIsTeacher =
        user?.role === "TEACHER" || user?.role === "TEACHERS";

      const response = await axios.get(
        `http://localhost:8080/api/events/endEvent/${completed}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data.success) {
        let fetched = response.data.data || [];
        fetched = await enrichWithCreatorNames(token, fetched);

        // Keep only events the user is actually allowed to see
        fetched = fetched.filter((event) =>
          isEventVisibleToUser(
            event,
            deptId,
            userClubs,
            currentPrn,
            currentIsTeacher,
          ),
        );

        setEvents(fetched);
        setAllEvents(fetched);
      }
    } catch (err) {
      console.error("Error fetching events by completed status:", err);
      setError(err.message || "An error occurred while fetching events");
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────
  // Fetch by enrollment deadline → then SCOPE to what this user may see
  // ─────────────────────────────────────────────────────────────────
  const fetchEventsByDeadline = async (status) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));
      const currentPrn = user?.prn || userPrn;
      const currentIsTeacher =
        user?.role === "TEACHER" || user?.role === "TEACHERS";

      const response = await axios.get(
        `http://localhost:8080/api/events/enrollment/${status}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data.success) {
        let fetched = response.data.data || [];
        fetched = await enrichWithCreatorNames(token, fetched);

        // Keep only events the user is actually allowed to see
        fetched = fetched.filter((event) =>
          isEventVisibleToUser(
            event,
            deptId,
            userClubs,
            currentPrn,
            currentIsTeacher,
          ),
        );

        setEvents(fetched);
        setAllEvents(fetched);
      }
    } catch (err) {
      console.error("Error fetching events by deadline:", err);
      setError(err.message || "An error occurred while fetching events");
    } finally {
      setLoading(false);
    }
  };

  // ── Enrolled events fetcher ──────────────────────────────────────
  const fetchEnrolledEvents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:8080/api/enrollments/myEnrollments",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data.success) {
        const enrollmentData = response.data.data;
        const enrolledEventsList = Object.keys(enrollmentData)
          .map((key) => {
            try {
              const g = (rx) => {
                const m = key.match(rx);
                return m ? m[1].trim() : "";
              };
              const eventIdMatch = key.match(/eventId=(\d+)/);
              const eventId = eventIdMatch ? parseInt(eventIdMatch[1]) : null;
              let creatorName = g(/creatorName=([^,\]]+)/);
              const creatorPrn = g(/creatorPrn=([^,\]]+)/);
              if (!creatorName || creatorName.match(/^\d+$/))
                creatorName = creatorPrn;
              return {
                eventId,
                title: g(/title=([^,]+)/),
                description: g(/description=([^,]+)/),
                dateTime: g(/dateTime=([^,]+)/),
                organizer: g(/organizer=([^,]+)/),
                speakerName: g(/speakerName=([^,]+)/),
                venue: g(/venue=([^,]+)/),
                maxEnrollments: parseInt(g(/maxEnrollments=(\d+)/) || 0),
                currEnrollments: parseInt(g(/currEnrollments=(\d+)/) || 0),
                enrollmentStatus: g(/enrollmentStatus=([^,]+)/),
                targetType: g(/targetType=([^,]+)/),
                completed: g(/isCompleted=([^,]+)/) === "true",
                creatorPrn,
                creatorName,
              };
            } catch (e) {
              return null;
            }
          })
          .filter((e) => e !== null && e.eventId !== null);

        const enriched = await enrichWithCreatorNames(
          token,
          enrolledEventsList,
        );
        setEvents(enriched);
        setAllEvents(enriched);
        setEnrolledEvents(enriched.map((e) => e.eventId));
        setFilterType("");
        setShowCreatedEvents(false);
        setSelectedClubId("");
        setCompletedFilter("all");
        setSelectedStatus("all");
        setShowEnrolledEvents(true);
      }
    } catch (err) {
      console.error("Error fetching enrolled events:", err);
      setError(
        err.message || "An error occurred while fetching enrolled events",
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Filter change handlers ───────────────────────────────────────
  const handleCompletedFilterChange = async (value) => {
    setCompletedFilter(value);
    if (value === "all") {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));
      await fetchEvents(
        token,
        user?.role,
        filterType,
        selectedClubId || deptId,
      );
    } else {
      await fetchEventsByCompletedStatus(value === "completed");
    }
  };

  const handleStatusFilterChange = async (value) => {
    setSelectedStatus(value);
    if (value === "all") {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));
      await fetchEvents(
        token,
        user?.role,
        filterType,
        selectedClubId || deptId,
      );
    } else {
      await fetchEventsByDeadline(value.toUpperCase());
    }
  };

  // ── Enroll / revoke / delete / complete ─────────────────────────
  const handleEnroll = async (eventId) => {
    try {
      setEnrollingEventId(eventId);
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login to enroll");
        return;
      }
      const response = await axios.post(
        `http://localhost:8080/api/enrollments/${eventId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      if (response.data.success) {
        setEnrollmentMessage({
          show: true,
          eventId,
          success: true,
          message: "Successfully enrolled in event!",
        });
        if (userPrn) await fetchUserEnrollments(token, userPrn);
        setEvents((prev) =>
          prev.map((e) =>
            e.eventId === eventId
              ? { ...e, currEnrollments: (e.currEnrollments || 0) + 1 }
              : e,
          ),
        );
      } else {
        setEnrollmentMessage({
          show: true,
          eventId,
          success: false,
          message: response.data.message || "Failed to enroll in event",
        });
      }
    } catch (err) {
      setEnrollmentMessage({
        show: true,
        eventId,
        success: false,
        message:
          err.response?.data?.message || "Error enrolling. Please try again.",
      });
    } finally {
      setEnrollingEventId(null);
      setTimeout(
        () =>
          setEnrollmentMessage({
            show: false,
            eventId: null,
            success: false,
            message: "",
          }),
        3000,
      );
    }
  };

  const handleRevokeEnrollment = async (eventId) => {
    try {
      setRevokingEventId(eventId);
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `http://localhost:8080/api/enrollments/revokeEnrollment/${eventId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      if (response.data.success) {
        setEnrolledEvents((prev) => prev.filter((id) => id !== eventId));
        setEvents((prev) =>
          prev.map((e) =>
            e.eventId === eventId
              ? {
                  ...e,
                  currEnrollments: Math.max((e.currEnrollments || 1) - 1, 0),
                }
              : e,
          ),
        );
        setEnrollmentMessage({
          show: true,
          eventId,
          success: true,
          message: "Enrollment revoked successfully!",
        });
      } else {
        setEnrollmentMessage({
          show: true,
          eventId,
          success: false,
          message: response.data.message || "Failed to revoke enrollment.",
        });
      }
    } catch (err) {
      setEnrollmentMessage({
        show: true,
        eventId,
        success: false,
        message:
          err.response?.data?.message ||
          "Error revoking enrollment. Please try again.",
      });
    } finally {
      setRevokingEventId(null);
      setTimeout(
        () =>
          setEnrollmentMessage({
            show: false,
            eventId: null,
            success: false,
            message: "",
          }),
        3000,
      );
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));
      await axios.delete(
        `http://localhost:8080/api/events/deleteEvent/${eventId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      alert("Event deleted successfully!");
      fetchEvents(token, user?.role, "GLOBAL");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete event");
    }
  };

  const handleCompleteEvent = async (eventId) => {
    try {
      setCompletingEventId(eventId);
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:8080/api/events/completeEvent/${eventId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      if (response.data.success) {
        setEvents((prev) =>
          prev.map((e) =>
            e.eventId === eventId ? { ...e, completed: true } : e,
          ),
        );
        setAllEvents((prev) =>
          prev.map((e) =>
            e.eventId === eventId ? { ...e, completed: true } : e,
          ),
        );
        setCompletionMessage({
          show: true,
          eventId,
          success: true,
          message: "Event marked as completed successfully!",
        });
      } else {
        setCompletionMessage({
          show: true,
          eventId,
          success: false,
          message: response.data.message || "Failed to mark event as completed",
        });
      }
    } catch (err) {
      setCompletionMessage({
        show: true,
        eventId,
        success: false,
        message:
          err.response?.data?.message ||
          "Error completing event. Please try again.",
      });
    } finally {
      setCompletingEventId(null);
      setTimeout(
        () =>
          setCompletionMessage({
            show: false,
            eventId: null,
            success: false,
            message: "",
          }),
        3000,
      );
    }
  };

  const fetchUserEnrollments = async (token, prn) => {
    try {
      const response = await axios.get(
        "http://localhost:8080/api/enrollments/myEnrollments",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      if (response.data.success) {
        const ids = Object.keys(response.data.data)
          .map((key) => {
            const m = key.match(/eventId=(\d+)/);
            return m ? Number(m[1]) : null;
          })
          .filter((id) => id !== null);
        setEnrolledEvents(ids);
      }
    } catch (err) {
      console.error("Error fetching user enrollments:", err);
    }
  };

  const handleEnrolledEventsClick = async () => {
    if (showEnrolledEvents) {
      setShowEnrolledEvents(false);
      setFilterType("GLOBAL");
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));
      await fetchEvents(token, user?.role, "GLOBAL");
    } else {
      await fetchEnrolledEvents();
    }
  };

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

    // Safety-net client-side guard (API already filtered, but keeps UI consistent)
    if (completedFilter !== "all") {
      filtered = filtered.filter(
        (e) => e.completed === (completedFilter === "completed"),
      );
    }

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
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    const role = user?.role || "user";
    setFilterType(newFilterType);

    const resetFilters = () => {
      setShowCreatedEvents(false);
      setSelectedClubId("");
      setShowClubDropdown(false);
      setShowEnrolledEvents(false);
      setCompletedFilter("all");
      setSelectedStatus("all");
    };

    if (newFilterType === "CREATED") {
      resetFilters();
      setShowCreatedEvents(true);
    } else if (newFilterType === "CLUB") {
      if (targetId) {
        resetFilters();
        setSelectedClubId(targetId);
      } else {
        setShowClubDropdown(true);
        return;
      }
    } else {
      resetFilters();
    }

    await fetchEvents(token, role, newFilterType, targetId || deptId);
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedStatus("all");
    setCompletedFilter("all");
    setFilterType("GLOBAL");
    setSelectedClubId("");
    setShowCreatedEvents(false);
    setShowEnrolledEvents(false);
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    fetchEvents(token, user?.role, "GLOBAL");
  };

  const removeStatusFilter = async () => {
    setSelectedStatus("all");
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    await fetchEvents(token, user?.role, filterType, selectedClubId || deptId);
  };

  const removeCompletedFilter = () => {
    setCompletedFilter("all");
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    fetchEvents(token, user?.role, filterType, selectedClubId || deptId);
  };

  // ── UI helpers ───────────────────────────────────────────────────
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
    const t = title?.toLowerCase() || "";
    if (t.includes("tech") || t.includes("code"))
      return <Code className="w-5 h-5" />;
    if (t.includes("music") || t.includes("concert"))
      return <Music className="w-5 h-5" />;
    if (t.includes("photo") || t.includes("camera"))
      return <Camera className="w-5 h-5" />;
    if (t.includes("sport") || t.includes("game"))
      return <Trophy className="w-5 h-5" />;
    if (t.includes("art") || t.includes("creative"))
      return <Heart className="w-5 h-5" />;
    if (t.includes("workshop") || t.includes("learn"))
      return <BookOpen className="w-5 h-5" />;
    if (t.includes("social") || t.includes("meet"))
      return <Coffee className="w-5 h-5" />;
    return <Sparkles className="w-5 h-5" />;
  };

  const formatDateTime = (s) => {
    if (!s) return "N/A";
    return new Date(s).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDaysUntil = (date) =>
    Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));

  const handleRetry = () => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    if (token) fetchEvents(token, user?.role || "user", "GLOBAL");
    else setError("No authentication token found. Please login again.");
  };

  const filteredEvents = getFilteredEvents();

  // Stats
  const totalEvents = events.length;
  const openEvents = events.filter(
    (e) => e.enrollmentStatus?.toLowerCase() === "open",
  ).length;
  const totalEnrollments = events.reduce(
    (sum, e) => sum + (e.currEnrollments || 0),
    0,
  );
  const completedEvents = events.filter((e) => e.completed === true).length;
  const notCompletedEvents = events.filter((e) => e.completed === false).length;
  const departmentEvents = events.filter(
    (e) => e.targetType?.toUpperCase() === "DEPARTMENT",
  ).length;
  const clubEvents = events.filter(
    (e) => e.targetType?.toUpperCase() === "CLUB",
  ).length;
  const globalEvents = events.filter(
    (e) => e.targetType?.toUpperCase() === "GLOBAL",
  ).length;

  // ── Loading / Error screens ──────────────────────────────────────
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

  // ── Main render ──────────────────────────────────────────────────
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        {/* Animated background blobs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div
            className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"
            style={{ backgroundColor: "#4CA1AF" }}
          ></div>
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
                <ArrowLeft
                  size={18}
                  className="group-hover:-translate-x-1 transition-transform"
                />
                <span>Back to Dashboard</span>
              </button>
            </div>
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Title */}
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4">
              <span
                className="bg-clip-text text-transparent"
                style={{
                  background: "linear-gradient(135deg, #4CA1AF, #2C3E50)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {isTeacher ? "Events Dashboard" : "Upcoming Events"}
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              {isTeacher
                ? "Manage your created events and discover events from your clubs and department"
                : "Join exciting events, connect with amazing people, and create unforgettable memories"}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 max-w-5xl mx-auto mb-6">
            {[
              {
                label: "Total Events",
                value: totalEvents,
                colorClass: "text-gray-800",
                bgClass: "bg-blue-100",
                icon: <Calendar className="w-6 h-6 text-blue-600" />,
              },
              {
                label: "Open Events",
                value: openEvents,
                colorClass: "text-green-600",
                bgClass: "bg-green-100",
                icon: <CheckCircle className="w-6 h-6 text-green-600" />,
              },
              {
                label: "Completed",
                value: completedEvents,
                colorClass: "text-purple-600",
                bgClass: "bg-purple-100",
                icon: <CheckSquare className="w-6 h-6 text-purple-600" />,
              },
              {
                label: "Not Completed",
                value: notCompletedEvents,
                colorClass: "text-orange-600",
                bgClass: "bg-orange-100",
                icon: <Square className="w-6 h-6 text-orange-600" />,
              },
            ].map(({ label, value, colorClass, bgClass, icon }) => (
              <div
                key={label}
                className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{label}</p>
                    <p className={`text-3xl font-bold ${colorClass}`}>
                      {value}
                    </p>
                  </div>
                  <div className={`${bgClass} p-3 rounded-lg`}>{icon}</div>
                </div>
              </div>
            ))}
            {isTeacher && (
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
            )}
          </div>

          {/* Target type breakdown — Teachers only */}
          {isTeacher && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-6">
              {[
                {
                  icon: <Globe className="w-5 h-5 text-blue-600 mr-2" />,
                  label: "Global",
                  value: globalEvents,
                  color: "text-blue-600",
                  bg: "bg-blue-50/80",
                },
                {
                  icon: <Users className="w-5 h-5 text-purple-600 mr-2" />,
                  label: "Club",
                  value: clubEvents,
                  color: "text-purple-600",
                  bg: "bg-purple-50/80",
                },
                {
                  icon: <Briefcase className="w-5 h-5 text-green-600 mr-2" />,
                  label: "Department",
                  value: departmentEvents,
                  color: "text-green-600",
                  bg: "bg-green-50/80",
                },
              ].map(({ icon, label, value, color, bg }) => (
                <div
                  key={label}
                  className={`${bg} backdrop-blur-sm p-4 rounded-xl`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {icon}
                      <span className="text-sm font-medium text-gray-600">
                        {label}
                      </span>
                    </div>
                    <span className={`text-xl font-bold ${color}`}>
                      {value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {userDept && (
            <div className="mt-4 mb-8 text-center">
              <div className="inline-block bg-white/80 backdrop-blur-sm px-6 py-3 rounded-xl shadow-md">
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
            </div>
          )}

          {isTeacher && (
            <div className="mb-6 flex justify-end">
              <button
                onClick={() => navigate("/create-event")}
                className="px-4 py-2 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
                style={{
                  background: "linear-gradient(135deg, #4CA1AF, #2C3E50)",
                }}
              >
                <Plus className="w-4 h-4" />
                <span>Create Event</span>
              </button>
            </div>
          )}

          {/* ── Search & Filter Bar ── */}
          <div className="mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 border border-white/20">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search input */}
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
                    style={{
                      background: "linear-gradient(135deg, #4CA1AF, #2C3E50)",
                    }}
                  >
                    <Filter className="w-5 h-5" />
                    <span>Filters</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-300 ${showFilters ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* ── Sort CustomSelect ── */}
                  <div className="w-52">
                    <CustomSelect
                      name="sortBy"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      options={sortOptions}
                      placeholder="Sort by..."
                    />
                  </div>
                </div>
              </div>

              {/* Active filter chips */}
              {(filterType !== "GLOBAL" ||
                selectedStatus !== "all" ||
                completedFilter !== "all" ||
                selectedClubId ||
                showCreatedEvents ||
                showEnrolledEvents) && (
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
                    {isTeacher && showCreatedEvents && (
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm flex items-center">
                        My Created Events
                        <button
                          onClick={() => handleFilterChange("GLOBAL")}
                          className="ml-2 hover:text-orange-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {!isTeacher && showEnrolledEvents && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center">
                        My Enrolled Events
                        <button
                          onClick={() => {
                            setShowEnrolledEvents(false);
                            const token = localStorage.getItem("token");
                            const user = JSON.parse(
                              localStorage.getItem("user"),
                            );
                            fetchEvents(
                              token,
                              user?.role,
                              filterType,
                              selectedClubId || deptId,
                            );
                          }}
                          className="ml-2 hover:text-green-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {selectedStatus !== "all" && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center">
                        Enrollment: {selectedStatus}
                        <button
                          onClick={removeStatusFilter}
                          className="ml-2 hover:text-blue-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {completedFilter !== "all" && (
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center">
                        Completed:{" "}
                        {completedFilter === "completed" ? "Yes" : "No"}
                        <button
                          onClick={removeCompletedFilter}
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

              {/* Expanded filter panel */}
              {showFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex flex-col space-y-4">
                    <div className="flex flex-wrap items-start gap-3">
                      <span className="text-sm font-medium text-gray-600 pt-2.5">
                        Filter by:
                      </span>

                      <div className="flex flex-wrap items-center gap-2 flex-1">
                        {isTeacher && (
                          <button
                            onClick={() => {
                              handleFilterChange("CREATED");
                              setShowEnrolledEvents(false);
                            }}
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${showCreatedEvents ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg" : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"}`}
                          >
                            My Created Events
                          </button>
                        )}

                        {!isTeacher && (
                          <button
                            onClick={handleEnrolledEventsClick}
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${showEnrolledEvents ? "bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg" : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"}`}
                          >
                            My Enrolled Events
                          </button>
                        )}

                        <button
                          onClick={() => {
                            handleFilterChange("GLOBAL");
                            setShowEnrolledEvents(false);
                          }}
                          className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${filterType === "GLOBAL" && !showCreatedEvents && !showEnrolledEvents ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg" : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"}`}
                        >
                          Global Events
                        </button>

                        {userDept && (
                          <button
                            onClick={() => handleFilterChange("DEPARTMENT")}
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${filterType === "DEPARTMENT" ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg" : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"}`}
                          >
                            {userDept} Events
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setShowClubDropdown(!showClubDropdown);
                            setShowEnrolledEvents(false);
                          }}
                          className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${filterType === "CLUB" ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg" : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"}`}
                        >
                          <span>Club Events</span>
                          <ChevronDown
                            className={`w-4 h-4 transition-transform duration-300 ${showClubDropdown ? "rotate-180" : ""}`}
                          />
                        </button>

                        {/* ── Enrollment Status CustomSelect ── */}
                        <div className="w-48">
                          <CustomSelect
                            name="selectedStatus"
                            value={selectedStatus}
                            onChange={(e) =>
                              handleStatusFilterChange(e.target.value)
                            }
                            options={enrollmentStatusOptions}
                            placeholder="Enrollment Status"
                          />
                        </div>

                        {/* ── Completed Status CustomSelect ── */}
                        <div className="w-48">
                          <CustomSelect
                            name="completedFilter"
                            value={completedFilter}
                            onChange={(e) =>
                              handleCompletedFilterChange(e.target.value)
                            }
                            options={completedStatusOptions}
                            placeholder="Completed Status"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Club sub-list */}
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
                                className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${selectedClubId === club.clubId.toString() ? "bg-purple-50" : ""}`}
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
                                No clubs available
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

          {/* Results count */}
          <div className="mb-4 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing{" "}
              <span className="font-semibold">{filteredEvents.length}</span> of{" "}
              <span className="font-semibold">{events.length}</span> events
            </p>
            {!isTeacher && (
              <div className="bg-green-50 px-3 py-1 rounded-full text-xs font-medium text-green-700 flex items-center">
                <CheckCircle className="w-3 h-3 mr-1" />
                Your Enrollments: {enrolledEvents.length}
              </div>
            )}
          </div>

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
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  No Events Found
                </h3>
                <p className="text-gray-600 mb-6">
                  {filterType === "CLUB" && !selectedClubId
                    ? "Please select a club from the dropdown to view its events."
                    : showCreatedEvents && isTeacher
                      ? "You haven't created any events yet. Create your first event to get started!"
                      : !isTeacher && showEnrolledEvents
                        ? "You haven't enrolled in any events yet. Browse events and enroll to see them here!"
                        : completedFilter !== "all"
                          ? `No ${completedFilter === "completed" ? "completed" : "not completed"} events visible to you.`
                          : selectedStatus !== "all"
                            ? `No ${selectedStatus} enrollment events visible to you.`
                            : "There are no events available at the moment. Check back later!"}
                </p>
                {(showCreatedEvents || isTeacher) && (
                  <button
                    onClick={() => navigate("/create-event")}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg"
                  >
                    Create New Event
                  </button>
                )}
                {(filterType !== "GLOBAL" ||
                  searchTerm ||
                  selectedStatus !== "all" ||
                  completedFilter !== "all") && (
                  <button
                    onClick={clearAllFilters}
                    className="mt-4 px-6 py-3 text-purple-600 hover:text-purple-800 font-medium"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div
                className={`grid gap-4 w-full ${filteredEvents.length === 1 ? "grid-cols-1 max-w-sm mx-auto" : filteredEvents.length === 2 ? "grid-cols-1 md:grid-cols-2 max-w-2xl mx-auto" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"}`}
              >
                {filteredEvents.map((event, index) => {
                  const daysUntil = getDaysUntil(event.dateTime);
                  const targetTypeColor = getTargetTypeColor(event.targetType);
                  const isCreator = isTeacher && event.creatorPrn === userPrn;
                  const isEnrolled =
                    !isTeacher &&
                    enrolledEvents.includes(Number(event.eventId));

                  return (
                    <div
                      key={event.eventId}
                      className={`event-card-container ${animations.fadeIn}`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="event-card">
                        {/* ── FRONT ── */}
                        <div className="card-face card-front bg-white/90 backdrop-blur-sm rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-500 border border-white/20">
                          <div
                            className="relative h-32 p-3 overflow-hidden"
                            style={{
                              background:
                                "linear-gradient(135deg, #4CA1AF, #2C3E50)",
                            }}
                          >
                            <div className="absolute inset-0 opacity-10">
                              <div className="absolute -top-12 -right-12 w-24 h-24 bg-white rounded-full"></div>
                              <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-white rounded-full"></div>
                            </div>
                            {daysUntil > 0 && !event.completed && (
                              <div className="absolute top-2 left-2 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                                <span className="text-white text-xs font-semibold">
                                  {daysUntil} days to go
                                </span>
                              </div>
                            )}
                            {event.completed && (
                              <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full flex items-center shadow-lg">
                                <CheckSquare className="w-3 h-3 mr-1" />
                                <span className="text-xs font-semibold">
                                  Completed
                                </span>
                              </div>
                            )}
                            {!isTeacher && isEnrolled && (
                              <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full flex items-center shadow-lg">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                <span className="text-xs font-semibold">
                                  Enrolled
                                </span>
                              </div>
                            )}
                            <div className="absolute bottom-2 right-2 text-right">
                              <h3 className="text-sm font-bold text-white mb-0.5 line-clamp-1">
                                {event.title}
                              </h3>
                              <p className="text-[10px] text-white/80 line-clamp-1">
                                {event.description}
                              </p>
                            </div>
                          </div>

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
                                  <User className="w-3 h-3 mr-0.5 text-green-500 flex-shrink-0" />
                                  <span className="truncate">
                                    {event.speakerName || event.organizer}
                                  </span>
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${targetTypeColor} flex items-center`}
                              >
                                {getTargetTypeIcon(event.targetType)}
                                <span className="ml-1 capitalize text-xs">
                                  {event.targetType || "N/A"}
                                </span>
                              </span>
                              <div className="flex items-center gap-1">
                                {!isTeacher && isEnrolled && (
                                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700 flex items-center">
                                    <CheckCircle className="w-2.5 h-2.5 mr-0.5" />
                                    Enrolled
                                  </span>
                                )}
                                {event.completed && (
                                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 flex items-center">
                                    <CheckSquare className="w-2.5 h-2.5 mr-0.5" />
                                    Completed
                                  </span>
                                )}
                              </div>
                            </div>
                            {isTeacher && (
                              <div className="space-y-1">
                                <div className="flex justify-between text-[10px]">
                                  <span className="text-gray-600">
                                    Enrolled
                                  </span>
                                  <span className="font-semibold">
                                    {event.currEnrollments || 0}/
                                    {event.maxEnrollments || 0}
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div
                                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full transition-all duration-300"
                                    style={{
                                      width: `${Math.min((event.currEnrollments / event.maxEnrollments) * 100, 100)}%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            )}
                            <div className="text-center text-[8px] mt-1 flex items-center justify-center text-purple-600">
                              <span className="animate-pulse mr-1 text-[6px]">
                                ●
                              </span>
                              Hover to view all details
                            </div>
                          </div>
                        </div>

                        {/* ── BACK ── */}
                        <div className="card-face card-back rounded-xl shadow-md overflow-hidden p-3 bg-gradient-to-br from-[#4CA1AF] to-[#2C3E50]">
                          <div className="h-full flex flex-col">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-sm font-bold text-white line-clamp-1 flex-1">
                                {event.title}
                              </h3>
                              {event.completed && (
                                <span className="bg-green-500 text-white px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center ml-1">
                                  <CheckSquare className="w-2.5 h-2.5 mr-0.5" />
                                  Completed
                                </span>
                              )}
                              {!isTeacher && isEnrolled && (
                                <span className="bg-green-500 text-white px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center ml-1">
                                  <CheckCircle className="w-2.5 h-2.5 mr-0.5" />
                                  Enrolled
                                </span>
                              )}
                            </div>

                            <div className="space-y-1.5 overflow-y-auto flex-1 pr-1 custom-scrollbar text-xs">
                              <div className="grid grid-cols-2 gap-1">
                                <div
                                  className="p-1.5 rounded-lg"
                                  style={{
                                    backgroundColor: "rgba(255,255,255,0.1)",
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
                                    backgroundColor: "rgba(255,255,255,0.1)",
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

                              <div
                                className="p-1.5 rounded-lg"
                                style={{
                                  backgroundColor: "rgba(255,255,255,0.1)",
                                }}
                              >
                                <p className="text-[10px] text-white/80 mb-1 flex items-center">
                                  <Star className="w-2.5 h-2.5 mr-1" />
                                  Created By
                                </p>
                                <p className="text-xs font-medium text-white truncate">
                                  {event.creatorName ||
                                    event.organizer ||
                                    "Unknown"}
                                </p>
                              </div>

                              {event.targetType?.toUpperCase() ===
                                "DEPARTMENT" &&
                                event.targetIds?.length > 0 && (
                                  <div
                                    className="p-1.5 rounded-lg"
                                    style={{
                                      backgroundColor: "rgba(255,255,255,0.1)",
                                    }}
                                  >
                                    <p className="text-[10px] text-white/80 mb-1 flex items-center">
                                      <Briefcase className="w-2.5 h-2.5 mr-1" />
                                      Target Departments
                                    </p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {event.targetIds.map((id) => {
                                        const dept = departments.find(
                                          (d) =>
                                            Number(d.departmentId) ===
                                            Number(id),
                                        );
                                        return (
                                          <span
                                            key={id}
                                            className="px-1.5 py-0.5 rounded text-[8px] font-medium text-white"
                                            style={{
                                              backgroundColor:
                                                "rgba(255,255,255,0.2)",
                                            }}
                                          >
                                            {dept?.name || `Dept ${id}`}
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
                                      backgroundColor: "rgba(255,255,255,0.1)",
                                    }}
                                  >
                                    <p className="text-[10px] text-white/80 mb-1 flex items-center">
                                      <Users className="w-2.5 h-2.5 mr-1" />
                                      Target Clubs
                                    </p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {event.targetIds.map((id) => {
                                        const club =
                                          allClubs.find(
                                            (c) =>
                                              Number(c.clubId) === Number(id),
                                          ) ||
                                          userClubs.find(
                                            (c) =>
                                              Number(c.clubId) === Number(id),
                                          );
                                        return (
                                          <span
                                            key={id}
                                            className="px-1.5 py-0.5 rounded text-[8px] font-medium text-white"
                                            style={{
                                              backgroundColor:
                                                "rgba(255,255,255,0.2)",
                                            }}
                                          >
                                            {club?.clubName || `Club ${id}`}
                                          </span>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}

                              {isTeacher && (
                                <div
                                  className="p-1.5 rounded-lg"
                                  style={{
                                    backgroundColor: "rgba(255,255,255,0.1)",
                                  }}
                                >
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="text-[10px] text-white/80">
                                      Total Enrollments
                                    </span>
                                    <span className="text-xs text-white">
                                      {event.currEnrollments || 0}/
                                      {event.maxEnrollments || 0}
                                    </span>
                                  </div>
                                  <div
                                    className="w-full h-1.5 rounded-full overflow-hidden"
                                    style={{
                                      backgroundColor: "rgba(255,255,255,0.2)",
                                    }}
                                  >
                                    <div
                                      className="h-full rounded-full bg-white/60"
                                      style={{
                                        width: `${Math.min((event.currEnrollments / event.maxEnrollments) * 100, 100)}%`,
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* ── Card action buttons ── */}
                            <div className="mt-2 pt-1 border-t border-white/20">
                              {isCreator ? (
                                <div className="flex flex-col gap-1">
                                  {completionMessage.show &&
                                    completionMessage.eventId ===
                                      event.eventId && (
                                      <div
                                        className={`text-center text-[10px] font-medium ${completionMessage.success ? "text-green-400" : "text-red-400"}`}
                                      >
                                        {completionMessage.message}
                                      </div>
                                    )}
                                  <div className="flex gap-1">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditClick(event);
                                      }}
                                      className="flex-1 px-1.5 py-1 rounded-lg text-[10px] font-medium transition flex items-center justify-center text-white"
                                      style={{
                                        backgroundColor:
                                          "rgba(255,255,255,0.2)",
                                      }}
                                      onMouseEnter={(e) =>
                                        (e.currentTarget.style.backgroundColor =
                                          "rgba(255,255,255,0.3)")
                                      }
                                      onMouseLeave={(e) =>
                                        (e.currentTarget.style.backgroundColor =
                                          "rgba(255,255,255,0.2)")
                                      }
                                    >
                                      <Edit className="w-2.5 h-2.5 mr-0.5" />
                                      Edit
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setConfirmDialog({
                                          isOpen: true,
                                          title: "Delete Event",
                                          message:
                                            "Are you sure you want to delete this event? This action cannot be undone.",
                                          confirmText: "Delete",
                                          variant: "danger",
                                          onConfirm: () => {
                                            closeConfirm();
                                            handleDeleteEvent(event.eventId);
                                          },
                                        });
                                      }}
                                      className="flex-1 px-1.5 py-1 rounded-lg text-[10px] font-medium transition flex items-center justify-center text-white"
                                      style={{
                                        backgroundColor: "rgba(239,68,68,0.5)",
                                      }}
                                      onMouseEnter={(e) =>
                                        (e.currentTarget.style.backgroundColor =
                                          "rgba(239,68,68,0.6)")
                                      }
                                      onMouseLeave={(e) =>
                                        (e.currentTarget.style.backgroundColor =
                                          "rgba(239,68,68,0.5)")
                                      }
                                    >
                                      <Trash2 className="w-2.5 h-2.5 mr-0.5" />
                                      Delete
                                    </button>
                                  </div>
                                  {!event.completed ? (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCompleteEvent(event.eventId);
                                      }}
                                      disabled={
                                        completingEventId === event.eventId
                                      }
                                      className="w-full px-1.5 py-1 rounded-lg text-[10px] font-medium transition flex items-center justify-center text-white"
                                      style={{
                                        backgroundColor:
                                          completingEventId === event.eventId
                                            ? "rgba(255,255,255,0.1)"
                                            : "rgba(34,197,94,0.5)",
                                      }}
                                      onMouseEnter={(e) => {
                                        if (completingEventId !== event.eventId)
                                          e.currentTarget.style.backgroundColor =
                                            "rgba(34,197,94,0.6)";
                                      }}
                                      onMouseLeave={(e) => {
                                        if (completingEventId !== event.eventId)
                                          e.currentTarget.style.backgroundColor =
                                            "rgba(34,197,94,0.5)";
                                      }}
                                    >
                                      {completingEventId === event.eventId ? (
                                        <>
                                          <Loader2 className="w-2.5 h-2.5 mr-0.5 animate-spin" />
                                          Completing...
                                        </>
                                      ) : (
                                        <>
                                          <CheckSquare className="w-2.5 h-2.5 mr-0.5" />
                                          Complete Event
                                        </>
                                      )}
                                    </button>
                                  ) : (
                                    <div className="w-full py-1 rounded-lg text-[10px] font-medium text-center bg-green-500/50 text-white flex items-center justify-center">
                                      <CheckSquare className="w-2.5 h-2.5 mr-0.5" />
                                      Completed
                                    </div>
                                  )}
                                </div>
                              ) : !isTeacher && !event.completed ? (
                                isEnrolled ? (
                                  <div className="relative">
                                    {enrollmentMessage.show &&
                                      enrollmentMessage.eventId ===
                                        event.eventId && (
                                        <div
                                          className={`absolute bottom-full mb-2 left-0 right-0 text-center text-[10px] font-medium ${enrollmentMessage.success ? "text-green-400" : "text-red-400"}`}
                                        >
                                          {enrollmentMessage.message}
                                        </div>
                                      )}
                                    <button
                                      onClick={() =>
                                        setConfirmDialog({
                                          isOpen: true,
                                          title: "Revoke Enrollment",
                                          message:
                                            "Are you sure you want to revoke your enrollment for this event?",
                                          confirmText: "Revoke",
                                          variant: "danger",
                                          onConfirm: () => {
                                            closeConfirm();
                                            handleRevokeEnrollment(
                                              event.eventId,
                                            );
                                          },
                                        })
                                      }
                                      disabled={
                                        revokingEventId === event.eventId
                                      }
                                      className="w-full py-1.5 rounded-lg text-xs font-medium transition flex items-center justify-center bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700"
                                    >
                                      {revokingEventId === event.eventId ? (
                                        <>
                                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                          Revoking...
                                        </>
                                      ) : (
                                        <>
                                          <XCircle className="w-3 h-3 mr-1" />
                                          Revoke Enrollment
                                        </>
                                      )}
                                    </button>
                                  </div>
                                ) : event.enrollmentStatus === "OPEN" ? (
                                  <div className="relative">
                                    {enrollmentMessage.show &&
                                      enrollmentMessage.eventId ===
                                        event.eventId && (
                                        <div
                                          className={`absolute bottom-full mb-2 left-0 right-0 text-center text-[10px] font-medium ${enrollmentMessage.success ? "text-green-400" : "text-red-400"}`}
                                        >
                                          {enrollmentMessage.message}
                                        </div>
                                      )}
                                    <button
                                      onClick={() =>
                                        setConfirmDialog({
                                          isOpen: true,
                                          title: "Confirm Enrollment",
                                          message:
                                            "Are you sure you want to enroll in this event?",
                                          confirmText: "Enroll",
                                          variant: "primary",
                                          onConfirm: () => {
                                            closeConfirm();
                                            handleEnroll(event.eventId);
                                          },
                                        })
                                      }
                                      disabled={
                                        enrollingEventId === event.eventId
                                      }
                                      className="w-full py-1.5 rounded-lg text-xs font-medium transition flex items-center justify-center bg-gradient-to-r from-[#4CA1AF] to-[#2C3E50] text-white hover:from-[#3d8a9c] hover:to-[#1f2f3f]"
                                    >
                                      {enrollingEventId === event.eventId ? (
                                        <>
                                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                          Enrolling...
                                        </>
                                      ) : (
                                        "Enroll Now"
                                      )}
                                    </button>
                                  </div>
                                ) : null
                              ) : null}
                              {event.completed && !isCreator && (
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
          )}

          <div className="mt-12 text-center">
            <div className="inline-flex items-center space-x-2 text-gray-500 text-sm">
              <Bell className="w-4 h-4" />
              <span>Stay tuned for more exciting events!</span>
              <Gift className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* ── Edit Event Modal ── */}
        {showEditModal && editingEvent && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowEditModal(false)}
            ></div>
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl z-10">
                  <div className="flex items-center justify-between">
                    <h2
                      className="text-2xl font-bold"
                      style={{
                        background: "linear-gradient(135deg, #4CA1AF, #2C3E50)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      Edit Event
                    </h2>
                    <button
                      onClick={() => setShowEditModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <form onSubmit={handleUpdateEvent} className="p-6">
                  {updateError && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                      <p className="text-sm text-red-600">{updateError}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Event Title *
                        </label>
                        <input
                          type="text"
                          name="title"
                          value={editingEvent.title}
                          onChange={handleEditInputChange}
                          required
                          placeholder="Enter event title"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA1AF] focus:border-transparent transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description *
                        </label>
                        <textarea
                          name="description"
                          value={editingEvent.description}
                          onChange={handleEditInputChange}
                          required
                          rows="3"
                          placeholder="Enter event description"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA1AF] focus:border-transparent transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date & Time *
                        </label>
                        <input
                          type="datetime-local"
                          name="dateTime"
                          value={editingEvent.dateTime}
                          onChange={handleEditInputChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA1AF] focus:border-transparent transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Venue *
                        </label>
                        <input
                          type="text"
                          name="venue"
                          value={editingEvent.venue}
                          onChange={handleEditInputChange}
                          required
                          placeholder="Enter venue"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA1AF] focus:border-transparent transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Organizer *
                        </label>
                        <input
                          type="text"
                          name="organizer"
                          value={editingEvent.organizer}
                          onChange={handleEditInputChange}
                          required
                          placeholder="Enter organizer name"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA1AF] focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    {/* Right */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Speaker Name
                        </label>
                        <input
                          type="text"
                          name="speakerName"
                          value={editingEvent.speakerName}
                          onChange={handleEditInputChange}
                          placeholder="Enter speaker name"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA1AF] focus:border-transparent transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Max Enrollments *
                        </label>
                        <input
                          type="number"
                          name="maxEnrollments"
                          value={editingEvent.maxEnrollments}
                          onChange={handleEditInputChange}
                          required
                          min="1"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA1AF] focus:border-transparent transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Enrollment Deadline *
                        </label>
                        <input
                          type="datetime-local"
                          name="enrollmentDeadline"
                          value={editingEvent.enrollmentDeadline}
                          onChange={handleEditInputChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA1AF] focus:border-transparent transition-all"
                        />
                      </div>

                      {/* ── Target Type CustomSelect in modal ── */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Target Type *
                        </label>
                        <CustomSelect
                          name="targetType"
                          value={editingEvent.targetType}
                          onChange={handleEditInputChange}
                          options={targetTypeOptions}
                          placeholder="Select target type"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Target IDs (comma-separated)
                        </label>
                        <input
                          type="text"
                          name="targetIds"
                          value={editingEvent.targetIds?.join(", ") || ""}
                          onChange={handleEditInputChange}
                          placeholder="e.g., 1, 2, 3"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA1AF] focus:border-transparent transition-all"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Enter department or club IDs separated by commas
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Geo-location */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Location Details (Optional)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        {
                          label: "Latitude",
                          name: "latitude",
                          placeholder: "e.g., 18.5204",
                          step: "any",
                        },
                        {
                          label: "Longitude",
                          name: "longitude",
                          placeholder: "e.g., 73.8567",
                          step: "any",
                        },
                        {
                          label: "Radius (meters)",
                          name: "radiusInMeters",
                          placeholder: "e.g., 100",
                          min: "0",
                        },
                      ].map(({ label, name, placeholder, step, min }) => (
                        <div key={name}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {label}
                          </label>
                          <input
                            type="number"
                            name={name}
                            value={editingEvent[name] || ""}
                            onChange={handleEditInputChange}
                            step={step}
                            min={min}
                            placeholder={placeholder}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA1AF] focus:border-transparent transition-all"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Attendance window */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Attendance Settings (Optional)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Window Start
                        </label>
                        <input
                          type="datetime-local"
                          name="attendanceWindowStart"
                          value={editingEvent.attendanceWindowStart || ""}
                          onChange={handleEditInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA1AF] focus:border-transparent transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Window End
                        </label>
                        <input
                          type="datetime-local"
                          name="attendanceWindowEnd"
                          value={editingEvent.attendanceWindowEnd || ""}
                          onChange={handleEditInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA1AF] focus:border-transparent transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          QR Refresh Interval (sec)
                        </label>
                        <input
                          type="number"
                          name="qrRefreshInterval"
                          value={editingEvent.qrRefreshInterval || 0}
                          onChange={handleEditInputChange}
                          min="0"
                          placeholder="e.g., 30"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA1AF] focus:border-transparent transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updateLoading}
                      className="px-6 py-2.5 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      style={{
                        background: "linear-gradient(135deg, #4CA1AF, #2C3E50)",
                      }}
                    >
                      {updateLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Updating...</span>
                        </>
                      ) : (
                        <>
                          <Edit className="w-4 h-4" />
                          <span>Update Event</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

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
              transform: translate(0, 0) scale(1);
            }
            33% {
              transform: translate(30px, -50px) scale(1.1);
            }
            66% {
              transform: translate(-20px, 20px) scale(0.9);
            }
            100% {
              transform: translate(0, 0) scale(1);
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

export default MyEvents;




// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import ConfirmDialog from "./ConfirmDialog";
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
//   Briefcase,
//   Plus,
//   X,
//   Edit,
//   Trash2,
//   Settings,
//   Eye,
//   CheckSquare,
//   Square,
//   ArrowLeft,
// } from "lucide-react";

// const MyEvents = () => {
//   const [events, setEvents] = useState([]);
//   const [allEvents, setAllEvents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [userRole, setUserRole] = useState("");
//   const [targetTypes, setTargetTypes] = useState([]);
//   const [selectedTarget, setSelectedTarget] = useState("GLOBAL");
//   const [userDept, setUserDept] = useState("");
//   const [deptId, setDeptId] = useState(null);
//   const [departments, setDepartments] = useState([]);
//   const [filterType, setFilterType] = useState("GLOBAL");
//   const [userClubs, setUserClubs] = useState([]);
//   const [selectedClubId, setSelectedClubId] = useState("");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [viewMode, setViewMode] = useState("grid");
//   const [showFilters, setShowFilters] = useState(false);
//   const [sortBy, setSortBy] = useState("date");
//   const [showClubDropdown, setShowClubDropdown] = useState(false);
//   const [teacherClubs, setTeacherClubs] = useState([]);
//   const [showCreatedEvents, setShowCreatedEvents] = useState(false);
//   const navigate = useNavigate();
//   const [enrollingEventId, setEnrollingEventId] = useState(null);
//   const [enrolledEvents, setEnrolledEvents] = useState([]);
//   const [revokingEventId, setRevokingEventId] = useState(null);
//   const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: "", message: "", variant: "primary", confirmText: "Confirm", onConfirm: () => {} });
//   const closeConfirm = () => setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
//   const [enrollmentMessage, setEnrollmentMessage] = useState({
//     show: false,
//     eventId: null,
//     success: false,
//     message: "",
//   });
//   const [userPrn, setUserPrn] = useState("");
//   const [selectedStatus, setSelectedStatus] = useState("all");
//   const [completedFilter, setCompletedFilter] = useState("all");
//   const [deadlineFilter, setDeadlineFilter] = useState("all");
//   const [showEnrolledEvents, setShowEnrolledEvents] = useState(false);
//   const [userMap, setUserMap] = useState({}); // Cache for user names
//   const isTeacher = userRole === "TEACHER" || userRole === "TEACHERS";
//   const [completingEventId, setCompletingEventId] = useState(null);
// const [completionMessage, setCompletionMessage] = useState({
//   show: false,
//   eventId: null,
//   success: false,
//   message: "",
// });

// const [showEditModal, setShowEditModal] = useState(false);
// const [editingEvent, setEditingEvent] = useState(null);
// const [updateLoading, setUpdateLoading] = useState(false);
// const [updateError, setUpdateError] = useState(null);

//   // Super admin color scheme - only for flip cards
//   const primaryGradient = "bg-gradient-to-r from-[#4CA1AF] to-[#2C3E50]";
//   const primaryColor = "#4CA1AF";
//   const secondaryColor = "#2C3E50";

//   const animations = {
//     fadeIn: "animate-[fadeIn_0.5s_ease-in-out]",
//     slideUp: "animate-[slideUp_0.5s_ease-out]",
//     pulse: "animate-pulse",
//     bounce: "animate-bounce",
//     gradient: primaryGradient,
//   };

//   useEffect(() => {
//     const init = async () => {
//       const user = JSON.parse(localStorage.getItem("user"));
//       const token = localStorage.getItem("token");

//       const role = user?.role || "user";
//       setUserRole(role);

//       if (!token) {
//         setError("No authentication token found. Please login again.");
//         setLoading(false);
//         return;
//       }

//       const prn = user?.prn;

//       // Fire these in background - they don't affect the enroll button rendering
//       fetchTargetTypes(token);
//       fetchDepartments(token);
//       fetchUserProfile(token);
//       fetchUserClubs(token);

//       // IMPORTANT: Await enrollments FIRST so enrolledEvents state is populated
//       // before fetchEvents sets loading=false and renders the event cards.
//       // Without this await, events render before enrollments arrive → shows "Enroll"
//       // even if the user is already enrolled (the race condition on page refresh).
//       if (prn) {
//         await fetchUserEnrollments(token, prn);
//       }

//       // Now fetch events - when loading becomes false and cards render,
//       // enrolledEvents is already set so isEnrolled works correctly on first paint.
//       fetchEvents(token, role, "GLOBAL");
//     };

//     init();
//   }, []);

//   // UpdateEventRequest DTO based on your backend
// const UpdateEventRequest = {
//   title: '',
//   description: '',
//   dateTime: '',
//   organizer: '',
//   speakerName: '',
//   venue: '',
//   maxEnrollments: 0,
//   enrollmentDeadline: '',
//   targetType: '',
//   targetIds: [],
//   latitude: null,
//   longitude: null,
//   radiusInMeters: null,
//   attendanceWindowStart: '',
//   attendanceWindowEnd: '',
//   qrRefreshInterval: 0
// };

// const handleEditClick = (event) => {
//   // Format dates to datetime-local format
//   const formatDateForInput = (dateStr) => {
//     if (!dateStr) return '';
//     const date = new Date(dateStr);
//     return date.toISOString().slice(0, 16);
//   };

//   setEditingEvent({
//     eventId: event.eventId,
//     title: event.title || '',
//     description: event.description || '',
//     dateTime: formatDateForInput(event.dateTime),
//     organizer: event.organizer || '',
//     speakerName: event.speakerName || '',
//     venue: event.venue || '',
//     maxEnrollments: event.maxEnrollments || 0,
//     enrollmentDeadline: formatDateForInput(event.enrollmentDeadline),
//     targetType: event.targetType || 'GLOBAL',
//     targetIds: event.targetIds || [],
//     latitude: event.latitude || null,
//     longitude: event.longitude || null,
//     radiusInMeters: event.radiusInMeters || null,
//     attendanceWindowStart: formatDateForInput(event.attendanceWindowStart),
//     attendanceWindowEnd: formatDateForInput(event.attendanceWindowEnd),
//     qrRefreshInterval: event.qrRefreshInterval || 0
//   });
  
//   setShowEditModal(true);
//   setUpdateError(null);
// };

// const handleEditInputChange = (e) => {
//   const { name, value, type } = e.target;
  
//   // Handle number inputs
//   if (type === 'number') {
//     setEditingEvent(prev => ({
//       ...prev,
//       [name]: value === '' ? '' : parseInt(value)
//     }));
//   } 
//   // Handle targetIds (comma-separated string to array)
//   else if (name === 'targetIds') {
//     const idsArray = value.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
//     setEditingEvent(prev => ({
//       ...prev,
//       [name]: idsArray
//     }));
//   }
//   else {
//     setEditingEvent(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   }
// };

// const handleUpdateEvent = async (e) => {
//   e.preventDefault();
  
//   try {
//     setUpdateLoading(true);
//     setUpdateError(null);
    
//     const token = localStorage.getItem("token");
    
//     const response = await axios.put(
//       `http://localhost:8080/api/events/updateEvent/${editingEvent.eventId}`,
//       editingEvent,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     if (response.data.success) {
//       alert("Event updated successfully!");
//       setShowEditModal(false);
//       setEditingEvent(null);
//       // Refresh the events list
//       fetchEvents(token);
//     } else {
//       setUpdateError(response.data.message || "Failed to update event");
//     }
//   } catch (err) {
//     console.error("Error updating event:", err);
//     setUpdateError(err.response?.data?.message || "An error occurred while updating the event");
//   } finally {
//     setUpdateLoading(false);
//   }
// };


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
//         }
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

//       if (response.data.success) {
//         setDepartments(response.data.data);
//       }
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
//         }
//       );

//       if (response.data.success) {
//         setUserClubs(response.data.data);
//         setTeacherClubs(response.data.data);
//       }
//     } catch (err) {
//       console.error("Error fetching user clubs:", err);
//     }
//   };

//   const fetchTargetTypes = async (token) => {
//     try {
//       const response = await axios.get(
//         "http://localhost:8080/api/events/targetTypes",
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       if (response.data.success) {
//         setTargetTypes(response.data.data);
//       }
//     } catch (err) {
//       console.error("Error fetching target types:", err);
//     }
//   };

//   // Fetch user name by PRN
//   const fetchUserNameByPrn = async (token, prn) => {
//     // Check cache first
//     if (userMap[prn]) {
//       return userMap[prn];
//     }

//     try {
//       const response = await axios.get(
//         `http://localhost:8080/api/profiles/prn/${prn}`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       if (response.data.success) {
//         const profile = response.data.data;
//         const name = profile.name || profile.fullName || prn;
        
//         // Update cache
//         setUserMap(prev => ({
//           ...prev,
//           [prn]: name
//         }));
        
//         return name;
//       }
//     } catch (err) {
//       console.error(`Error fetching user for PRN ${prn}:`, err);
//     }
//     return prn;
//   };

//   const fetchEvents = async (
//     token,
//     role,
//     filter = "GLOBAL",
//     targetId = null,
//     completed = null
//   ) => {
//     try {
//       setLoading(true);
//       console.log("Fetching events with:", { role, filter, targetId, completed });

//       let response;
//       let fetchedEvents = [];

//       // First, fetch events based on target type
//       if (role === "TEACHER" || role === "TEACHERS") {
//         if (filter === "GLOBAL") {
//           console.log("Fetching global events for teacher...");
//           response = await axios.get(
//             "http://localhost:8080/api/events/getByTargetType/GLOBAL",
//             {
//               headers: {
//                 Authorization: `Bearer ${token}`,
//                 "Content-Type": "application/json",
//               },
//             }
//           );
//         } else if (filter === "CREATED") {
//           console.log("Fetching created events for teacher...");
//           response = await axios.get(
//             "http://localhost:8080/api/events/myEvents",
//             {
//               headers: {
//                 Authorization: `Bearer ${token}`,
//                 "Content-Type": "application/json",
//               },
//             }
//           );
//         } else if (filter === "DEPARTMENT" && targetId) {
//           console.log("Fetching department events for teacher...");
//           response = await axios.get(
//             `http://localhost:8080/api/events/targetData/DEPARTMENT/${targetId}`,
//             {
//               headers: {
//                 Authorization: `Bearer ${token}`,
//                 "Content-Type": "application/json",
//               },
//             }
//           );
//         } else if (filter === "CLUB" && targetId) {
//           console.log("Fetching club events for teacher...");
//           response = await axios.get(
//             `http://localhost:8080/api/events/targetData/CLUB/${targetId}`,
//             {
//               headers: {
//                 Authorization: `Bearer ${token}`,
//                 "Content-Type": "application/json",
//               },
//             }
//           );
//         }
//       } 
//       // For regular users
//       else {
//         if (filter === "DEPARTMENT" && targetId) {
//           console.log("Fetching department events for user...");
//           response = await axios.get(
//             `http://localhost:8080/api/events/targetData/DEPARTMENT/${targetId}`,
//             {
//               headers: {
//                 Authorization: `Bearer ${token}`,
//                 "Content-Type": "application/json",
//               },
//             }
//           );
//         } else if (filter === "CLUB" && targetId) {
//           console.log("Fetching club events for user...");
//           response = await axios.get(
//             `http://localhost:8080/api/events/targetData/CLUB/${targetId}`,
//             {
//               headers: {
//                 Authorization: `Bearer ${token}`,
//                 "Content-Type": "application/json",
//               },
//             }
//           );
//         } else {
//           console.log("Fetching global events for user...");
//           response = await axios.get(
//             "http://localhost:8080/api/events/getByTargetType/GLOBAL",
//             {
//               headers: {
//                 Authorization: `Bearer ${token}`,
//                 "Content-Type": "application/json",
//               },
//             }
//           );
//         }
//       }

//       if (response && response.data && response.data.success) {
//         fetchedEvents = response.data.data || [];
//         console.log("Raw fetched events:", fetchedEvents);
        
//         // For each event, fetch the creator's name if we only have PRN
//         if (fetchedEvents.length > 0) {
//           const eventsWithCreatorInfo = await Promise.all(
//             fetchedEvents.map(async (event) => {
//               // If creatorName is missing or looks like a PRN (numeric), fetch the actual name
//               if (!event.creatorName || event.creatorName.match(/^\d+$/)) {
//                 const creatorName = await fetchUserNameByPrn(token, event.creatorPrn);
//                 return {
//                   ...event,
//                   creatorName: creatorName
//                 };
//               }
//               return event;
//             })
//           );
          
//           fetchedEvents = eventsWithCreatorInfo;
//         }
        
//         // Apply completed filter if specified
//         if (completed !== null && completed !== "all") {
//           const completedBool = completed === "completed";
//           fetchedEvents = fetchedEvents.filter(event => event.completed === completedBool);
//           console.log(`After ${completed} filter:`, fetchedEvents.length);
//         }
//       } else {
//         console.log("No events fetched or API error");
//         fetchedEvents = [];
//       }

//       setEvents(fetchedEvents);
//       setAllEvents(fetchedEvents);
//     } catch (err) {
//       console.error("Error fetching events:", err);
//       setError(err.message || "An error occurred while fetching events");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // New function to fetch events by completed status
//   const fetchEventsByCompletedStatus = async (completed) => {
//     try {
//       setLoading(true);
//       const token = localStorage.getItem("token");
      
//       console.log(`Fetching ${completed ? "completed" : "not completed"} events...`);
      
//       const response = await axios.get(
//         `http://localhost:8080/api/events/endEvent/${completed}`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       if (response.data.success) {
//         let fetchedEvents = response.data.data || [];
//         console.log(`Fetched ${completed ? "completed" : "not completed"} events:`, fetchedEvents);
        
//         // Fetch creator names for events
//         if (fetchedEvents.length > 0) {
//           const eventsWithCreatorInfo = await Promise.all(
//             fetchedEvents.map(async (event) => {
//               if (!event.creatorName || event.creatorName.match(/^\d+$/)) {
//                 const creatorName = await fetchUserNameByPrn(token, event.creatorPrn);
//                 return {
//                   ...event,
//                   creatorName: creatorName
//                 };
//               }
//               return event;
//             })
//           );
//           fetchedEvents = eventsWithCreatorInfo;
//         }
        
//         setEvents(fetchedEvents);
//         setAllEvents(fetchedEvents);
//       }
//     } catch (err) {
//       console.error(`Error fetching ${completed ? "completed" : "not completed"} events:`, err);
//       setError(err.message || "An error occurred while fetching events");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // New function to fetch events by deadline status (OPEN/CLOSED)
//   const fetchEventsByDeadline = async (status) => {
//     try {
//       setLoading(true);
//       const token = localStorage.getItem("token");
      
//       console.log(`Fetching ${status} events by deadline...`);
      
//       const response = await axios.get(
//         `http://localhost:8080/api/events/enrollment/${status}`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       if (response.data.success) {
//         let fetchedEvents = response.data.data || [];
//         console.log(`Fetched ${status} events by deadline:`, fetchedEvents);
        
//         // Fetch creator names for events
//         if (fetchedEvents.length > 0) {
//           const eventsWithCreatorInfo = await Promise.all(
//             fetchedEvents.map(async (event) => {
//               if (!event.creatorName || event.creatorName.match(/^\d+$/)) {
//                 const creatorName = await fetchUserNameByPrn(token, event.creatorPrn);
//                 return {
//                   ...event,
//                   creatorName: creatorName
//                 };
//               }
//               return event;
//             })
//           );
//           fetchedEvents = eventsWithCreatorInfo;
//         }
        
//         setEvents(fetchedEvents);
//         setAllEvents(fetchedEvents);
//       }
//     } catch (err) {
//       console.error(`Error fetching ${status} events by deadline:`, err);
//       setError(err.message || "An error occurred while fetching events");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // New function to fetch user's enrolled events
//   const fetchEnrolledEvents = async () => {
//     try {
//       setLoading(true);
//       const token = localStorage.getItem("token");
      
//       console.log(`Fetching enrolled events...`);
      
//       const response = await axios.get(
//         `http://localhost:8080/api/enrollments/myEnrollments`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       console.log("Enrollment API response:", response.data);
//       if (response.data.success) {
//         // The API returns data with event objects as keys
//         const enrollmentData = response.data.data;
//         console.log("enrolled data", enrollmentData);
        
//         // Extract events from the object keys
//         const enrolledEventsList = Object.keys(enrollmentData).map(key => {
//           const eventStr = key;
          
//           try {
//             // Extract values using regex
//             const eventIdMatch = eventStr.match(/eventId=(\d+)/);
//             const eventId = eventIdMatch ? parseInt(eventIdMatch[1]) : null;
            
//             const titleMatch = eventStr.match(/title=([^,]+)/);
//             const title = titleMatch ? titleMatch[1].trim() : "";
            
//             const descMatch = eventStr.match(/description=([^,]+)/);
//             const description = descMatch ? descMatch[1].trim() : "";
            
//             const dateTimeMatch = eventStr.match(/dateTime=([^,]+)/);
//             const dateTime = dateTimeMatch ? dateTimeMatch[1].trim() : "";
            
//             const organizerMatch = eventStr.match(/organizer=([^,]+)/);
//             const organizer = organizerMatch ? organizerMatch[1].trim() : "";

//             const speakerNameMatch = eventStr.match(/speakerName=([^,]+)/);
//             const speakerName = speakerNameMatch ? speakerNameMatch[1].trim() : "";
            
//             const venueMatch = eventStr.match(/venue=([^,]+)/);
//             const venue = venueMatch ? venueMatch[1].trim() : "";
            
//             const maxEnrollmentsMatch = eventStr.match(/maxEnrollments=(\d+)/);
//             const maxEnrollments = maxEnrollmentsMatch ? parseInt(maxEnrollmentsMatch[1]) : 0;
            
//             const currEnrollmentsMatch = eventStr.match(/currEnrollments=(\d+)/);
//             const currEnrollments = currEnrollmentsMatch ? parseInt(currEnrollmentsMatch[1]) : 0;
            
//             const statusMatch = eventStr.match(/enrollmentStatus=([^,]+)/);
//             const enrollmentStatus = statusMatch ? statusMatch[1].trim() : "";
            
//             const targetTypeMatch = eventStr.match(/targetType=([^,]+)/);
//             const targetType = targetTypeMatch ? targetTypeMatch[1].trim() : "";
            
//             const completedMatch = eventStr.match(/isCompleted=([^,]+)/);
//             const completed = completedMatch ? completedMatch[1].trim() === "true" : false;
            
//             const creatorPrnMatch = eventStr.match(/creatorPrn=([^,\]]+)/);
//             const creatorPrn = creatorPrnMatch ? creatorPrnMatch[1].trim() : "";
            
//             const creatorNameMatch = eventStr.match(/creatorName=([^,\]]+)/);
//             let creatorName = creatorNameMatch ? creatorNameMatch[1].trim() : "";
            
//             // If creatorName is missing or numeric, we'll fetch it later
//             if (!creatorName || creatorName.match(/^\d+$/)) {
//               creatorName = creatorPrn; // Temporarily use PRN
//             }
            
//             return {
//               eventId,
//               title,
//               description,
//               dateTime,
//               organizer,
//               speakerName,
//               venue,
//               maxEnrollments,
//               currEnrollments,
//               enrollmentStatus,
//               targetType,
//               completed,
//               creatorPrn,
//               creatorName
//             };
//           } catch (e) {
//             console.error("Error parsing event:", e);
//             return null;
//           }
//         }).filter(event => event !== null && event.eventId !== null);
        
//         console.log("Parsed enrolled events:", enrolledEventsList);
        
//         // Fetch creator names for enrolled events
//         const token = localStorage.getItem("token");
//         const eventsWithCreatorInfo = await Promise.all(
//           enrolledEventsList.map(async (event) => {
//             if (!event.creatorName || event.creatorName.match(/^\d+$/)) {
//               const creatorName = await fetchUserNameByPrn(token, event.creatorPrn);
//               return {
//                 ...event,
//                 creatorName: creatorName
//               };
//             }
//             return event;
//           })
//         );
        
//         setEvents(eventsWithCreatorInfo);
//         setAllEvents(eventsWithCreatorInfo);
        
//         // Set enrolled events IDs for reference
//         const eventIds = eventsWithCreatorInfo.map(event => event.eventId);
//         setEnrolledEvents(eventIds);
        
//         // Set filter states
//         setFilterType("");
//         setShowCreatedEvents(false);
//         setSelectedClubId("");
//         setCompletedFilter("all");
//         setSelectedStatus("all");
        
//         // Show enrolled events
//         setShowEnrolledEvents(true);
//       }
//     } catch (err) {
//       console.error("Error fetching enrolled events:", err);
//       setError(err.message || "An error occurred while fetching enrolled events");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle completed filter change
//   const handleCompletedFilterChange = async (value) => {
//     setCompletedFilter(value);
    
//     if (value === "all") {
//       // Refetch based on current filter type
//       const token = localStorage.getItem("token");
//       const user = JSON.parse(localStorage.getItem("user"));
//       await fetchEvents(token, user?.role, filterType, selectedClubId || deptId);
//     } else {
//       // Fetch by completed status
//       await fetchEventsByCompletedStatus(value === "completed");
//     }
//   };

//   const handleEnroll = async (eventId) => {
//     try {
//       setEnrollingEventId(eventId);
//       const token = localStorage.getItem("token");
//       const user = JSON.parse(localStorage.getItem("user"));

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
//         }
//       );

//       if (response.data.success) {
//         setEnrollmentMessage({
//           show: true,
//           eventId: eventId,
//           success: true,
//           message: "Successfully enrolled in event!",
//         });

//         if (userPrn) {
//           await fetchUserEnrollments(token, userPrn);
//         }

//         setEvents((prevEvents) =>
//           prevEvents.map((event) =>
//             event.eventId === eventId
//               ? { ...event, currEnrollments: (event.currEnrollments || 0) + 1 }
//               : event
//           )
//         );

//         setTimeout(() => {
//           setEnrollmentMessage({
//             show: false,
//             eventId: null,
//             success: false,
//             message: "",
//           });
//         }, 3000);
//       } else {
//         setEnrollmentMessage({
//           show: true,
//           eventId: eventId,
//           success: false,
//           message: response.data.message || "Failed to enroll in event",
//         });

//         setTimeout(() => {
//           setEnrollmentMessage({
//             show: false,
//             eventId: null,
//             success: false,
//             message: "",
//           });
//         }, 3000);
//       }
//     } catch (err) {
//       console.error("Error enrolling in event:", err);

//       setEnrollmentMessage({
//         show: true,
//         eventId: eventId,
//         success: false,
//         message:
//           err.response?.data?.message ||
//           "Error enrolling in event. Please try again.",
//       });

//       setTimeout(() => {
//         setEnrollmentMessage({
//           show: false,
//           eventId: null,
//           success: false,
//           message: "",
//         });
//       }, 3000);
//     } finally {
//       setEnrollingEventId(null);
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
//         }
//       );

//       if (response.data.success) {
//         setEnrolledEvents((prev) => prev.filter((id) => id !== eventId));
//         setEvents((prevEvents) =>
//           prevEvents.map((e) =>
//             e.eventId === eventId
//               ? { ...e, currEnrollments: Math.max((e.currEnrollments || 1) - 1, 0) }
//               : e
//           )
//         );
//         setEnrollmentMessage({
//           show: true,
//           eventId: eventId,
//           success: true,
//           message: "Enrollment revoked successfully!",
//         });
//       } else {
//         setEnrollmentMessage({
//           show: true,
//           eventId: eventId,
//           success: false,
//           message: response.data.message || "Failed to revoke enrollment.",
//         });
//       }
//     } catch (err) {
//       console.error("Error revoking enrollment:", err);
//       setEnrollmentMessage({
//         show: true,
//         eventId: eventId,
//         success: false,
//         message: err.response?.data?.message || "Error revoking enrollment. Please try again.",
//       });
//     } finally {
//       setRevokingEventId(null);
//       setTimeout(() => setEnrollmentMessage({ show: false, eventId: null, success: false, message: "" }), 3000);
//     }
//   };
  
// const handleDeleteEvent = async (eventId) => {
//   try {
//     const token = localStorage.getItem("token");
//     const user = JSON.parse(localStorage.getItem("user"));
//     await axios.delete(`http://localhost:8080/api/events/deleteEvent/${eventId}`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//     });
//     alert("Event deleted successfully!");
//     fetchEvents(token, user?.role, "GLOBAL");
//   } catch (err) {
//     console.error("Error deleting event:", err);
//     alert(err.response?.data?.message || "Failed to delete event");
//   }
// };
// const handleCompleteEvent = async (eventId) => {
//   try {
//     setCompletingEventId(eventId);
//     const token = localStorage.getItem("token");

//     // IMPORTANT: Log the token and URL to debug
//     console.log("Token being sent:", token);
//     console.log("Complete Event URL:", `http://localhost:8080/api/events/completeEvent/${eventId}`);

//     const response = await axios.post(
//       `http://localhost:8080/api/events/completeEvent/${eventId}`,
//       {}, // Empty body
//       {
//         headers: {
//           'Authorization': `Bearer ${token}`, // Make sure this format is correct
//           'Content-Type': 'application/json',
//         },
//       }
//     );

//     console.log("Complete event response:", response.data);

//     if (response.data.success) {
//       // Update the event in the local state
//       setEvents(prevEvents =>
//         prevEvents.map(event =>
//           event.eventId === eventId
//             ? { ...event, completed: true }
//             : event
//         )
//       );
//       setAllEvents(prevEvents =>
//         prevEvents.map(event =>
//           event.eventId === eventId
//             ? { ...event, completed: true }
//             : event
//         )
//       );

//       setCompletionMessage({
//         show: true,
//         eventId: eventId,
//         success: true,
//         message: "Event marked as completed successfully!",
//       });

//       setTimeout(() => {
//         setCompletionMessage({
//           show: false,
//           eventId: null,
//           success: false,
//           message: "",
//         });
//       }, 3000);
//     } else {
//       setCompletionMessage({
//         show: true,
//         eventId: eventId,
//         success: false,
//         message: response.data.message || "Failed to mark event as completed",
//       });

//       setTimeout(() => {
//         setCompletionMessage({
//           show: false,
//           eventId: null,
//           success: false,
//           message: "",
//         });
//       }, 3000);
//     }
//   } catch (err) {
//     console.error("Error completing event:", err);
//     console.error("Error response:", err.response); // Log the full error response
//     console.error("Error status:", err.response?.status); // Log the status code
//     console.error("Error data:", err.response?.data); // Log the response data
    
//     setCompletionMessage({
//       show: true,
//       eventId: eventId,
//       success: false,
//       message: err.response?.data?.message || "Error completing event. Please try again.",
//     });

//     setTimeout(() => {
//       setCompletionMessage({
//         show: false,
//         eventId: null,
//         success: false,
//         message: "",
//       });
//     }, 3000);
//   } finally {
//     setCompletingEventId(null);
//   }
// };

//   const fetchUserEnrollments = async (token, prn) => {
//     try {
//       // Use /myEnrollments - the same endpoint used by the "My Enrolled Events"
//       // button, which is known to return correct data. The /user/${prn} endpoint
//       // was returning empty/incorrect data causing enrolledEvents to stay empty.
//       const response = await axios.get(
//         `http://localhost:8080/api/enrollments/myEnrollments`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       if (response.data.success) {
//         const enrollmentData = response.data.data;
//         const enrolledEventIds = Object.keys(enrollmentData)
//           .map((key) => {
//             const match = key.match(/eventId=(\d+)/);
//             return match ? Number(match[1]) : null;
//           })
//           .filter((id) => id !== null);

//         setEnrolledEvents(enrolledEventIds);
//         console.log("Updated enrolled events:", enrolledEventIds);
//       }
//     } catch (err) {
//       console.error("Error fetching user enrollments:", err);
//     }
//   };

//   const handleEnrolledEventsClick = async () => {
//     if (showEnrolledEvents) {
//       // If already showing enrolled events, go back to global view
//       setShowEnrolledEvents(false);
//       setFilterType("GLOBAL");
//       const token = localStorage.getItem("token");
//       const user = JSON.parse(localStorage.getItem("user"));
//       await fetchEvents(token, user?.role, "GLOBAL");
//     } else {
//       // Show enrolled events
//       await fetchEnrolledEvents();
//     }
//   };

//   const getFilteredEvents = () => {
//     let filtered = [...events];
//     console.log("Filtering events, initial count:", filtered.length);

//     if (searchTerm) {
//       filtered = filtered.filter(
//         (event) =>
//           event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           event.organizer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           event.creatorName?.toLowerCase().includes(searchTerm.toLowerCase())
//       );
//       console.log("After search filter:", filtered.length);
//     }

//     // Note: completed filter is now applied at the API level
//     // But we keep this as a safety measure
//     if (completedFilter !== "all") {
//       const completedBool = completedFilter === "completed";
//       filtered = filtered.filter(event => event.completed === completedBool);
//       console.log("After completed filter:", filtered.length);
//     }

//     switch (sortBy) {
//       case "date":
//         filtered.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
//         break;
//       case "popularity":
//         filtered.sort(
//           (a, b) => (b.currEnrollments || 0) - (a.currEnrollments || 0)
//         );
//         break;
//       case "enrollment":
//         filtered.sort(
//           (a, b) => (b.maxEnrollments || 0) - (a.maxEnrollments || 0)
//         );
//         break;
//       default:
//         break;
//     }

//     console.log("Final filtered events count:", filtered.length);
//     return filtered;
//   };

//   const handleFilterChange = async (newFilterType, targetId = null) => {
//     const token = localStorage.getItem("token");
//     const user = JSON.parse(localStorage.getItem("user"));
//     const role = user?.role || "user";

//     // Update filter states
//     setFilterType(newFilterType);
    
//     if (newFilterType === "CREATED") {
//       setShowCreatedEvents(true);
//       setSelectedClubId("");
//       setShowClubDropdown(false);
//       setShowEnrolledEvents(false);
//       setCompletedFilter("all");
//     } else if (newFilterType === "CLUB") {
//       if (targetId) {
//         setSelectedClubId(targetId);
//         setShowCreatedEvents(false);
//         setShowClubDropdown(false);
//         setShowEnrolledEvents(false);
//         setCompletedFilter("all");
//       } else {
//         setShowClubDropdown(true);
//         return;
//       }
//     } else if (newFilterType === "DEPARTMENT") {
//       setShowCreatedEvents(false);
//       setSelectedClubId("");
//       setShowClubDropdown(false);
//       setShowEnrolledEvents(false);
//       setCompletedFilter("all");
//     } else {
//       setShowCreatedEvents(false);
//       setSelectedClubId("");
//       setShowClubDropdown(false);
//       setShowEnrolledEvents(false);
//       setCompletedFilter("all");
//     }

//     await fetchEvents(token, role, newFilterType, targetId || deptId);
//   };

//   const clearAllFilters = () => {
//     setSearchTerm("");
//     setSelectedStatus("all");
//     setCompletedFilter("all");
//     setFilterType("GLOBAL");
//     setSelectedClubId("");
//     setShowCreatedEvents(false);
//     setShowEnrolledEvents(false);
//     const token = localStorage.getItem("token");
//     const user = JSON.parse(localStorage.getItem("user"));
//     fetchEvents(token, user?.role, "GLOBAL");
//   };

//   const removeStatusFilter = async () => {
//     setSelectedStatus("all");
//     const token = localStorage.getItem("token");
//     const user = JSON.parse(localStorage.getItem("user"));
//     await fetchEvents(token, user?.role, filterType, selectedClubId || deptId, completedFilter !== "all" ? completedFilter : null);
//   };

//   const removeCompletedFilter = () => {
//     setCompletedFilter("all");
//     const token = localStorage.getItem("token");
//     const user = JSON.parse(localStorage.getItem("user"));
//     fetchEvents(token, user?.role, filterType, selectedClubId || deptId);
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
//     const user = JSON.parse(localStorage.getItem("user"));
//     const role = user?.role || "user";

//     if (token) {
//       fetchEvents(token, role, "GLOBAL");
//     } else {
//       setError("No authentication token found. Please login again.");
//     }
//   };

//   const filteredEvents = getFilteredEvents();
//   console.log("Rendering with filteredEvents:", filteredEvents);

//   // Calculate statistics
//   const totalEvents = events.length;
//   const openEvents = events.filter(
//     (e) => e.enrollmentStatus?.toLowerCase() === "open"
//   ).length;
//   const totalEnrollments = events.reduce(
//     (sum, e) => sum + (e.currEnrollments || 0),
//     0
//   );
//   const completedEvents = events.filter((e) => e.completed === true).length;
//   const notCompletedEvents = events.filter((e) => e.completed === false).length;

//   // Target type statistics
//   const departmentEvents = events.filter(
//     (e) => e.targetType?.toUpperCase() === "DEPARTMENT"
//   ).length;
//   const clubEvents = events.filter(
//     (e) => e.targetType?.toUpperCase() === "CLUB"
//   ).length;
//   const globalEvents = events.filter(
//     (e) => e.targetType?.toUpperCase() === "GLOBAL"
//   ).length;

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

//   return (
//     <>
//     <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
//       {/* Animated Background */}
//       <div className="fixed inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
//         <div
//           className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"
//           style={{ backgroundColor: "#4CA1AF" }}
//         ></div>
//         <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
//       </div>

//       {/* Sticky Back Button Bar - ClubDetails Style */}
//       <div className="sticky top-0 z-50 w-full bg-white border-b border-gray-100">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex items-center h-16">
//             <button
//               onClick={() => navigate(-1)}
//               className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#4CA1AF] transition-colors group"
//             >
//               <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
//               <span>Back to Dashboard</span>
//             </button>
//           </div>
//         </div>
//       </div>

//       <div className="relative max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
//         {/* Title Section */}
//         <div className="text-center">
//           <h1 className="text-5xl font-bold mb-4">
//             <span
//               className="bg-clip-text text-transparent"
//               style={{
//                 background: "linear-gradient(135deg, #4CA1AF, #2C3E50)",
//                 WebkitBackgroundClip: "text",
//                 WebkitTextFillColor: "transparent",
//               }}
//             >
//               {isTeacher ? "Events Dashboard" : "Upcoming Events"}
//             </span>
//           </h1>

//           <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
//             {isTeacher
//               ? "Manage your created events and discover events from your clubs and department"
//               : "Join exciting events, connect with amazing people, and create unforgettable memories"}
//           </p>
//         </div>

//         {/* Stats Cards - Show different stats based on role */}
//         <div className="grid grid-cols-1 md:grid-cols-5 gap-4 max-w-5xl mx-auto mb-6">
//           <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-600">Total Events</p>
//                 <p className="text-3xl font-bold text-gray-800">
//                   {totalEvents}
//                 </p>
//               </div>
//               <div className="bg-blue-100 p-3 rounded-lg">
//                 <Calendar className="w-6 h-6 text-blue-600" />
//               </div>
//             </div>
//           </div>

//           <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-600">Open Events</p>
//                 <p className="text-3xl font-bold text-green-600">
//                   {openEvents}
//                 </p>
//               </div>
//               <div className="bg-green-100 p-3 rounded-lg">
//                 <CheckCircle className="w-6 h-6 text-green-600" />
//               </div>
//             </div>
//           </div>

//           <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-600">Completed</p>
//                 <p className="text-3xl font-bold text-purple-600">
//                   {completedEvents}
//                 </p>
//               </div>
//               <div className="bg-purple-100 p-3 rounded-lg">
//                 <CheckSquare className="w-6 h-6 text-purple-600" />
//               </div>
//             </div>
//           </div>

//           <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-600">Not Completed</p>
//                 <p className="text-3xl font-bold text-orange-600">
//                   {notCompletedEvents}
//                 </p>
//               </div>
//               <div className="bg-orange-100 p-3 rounded-lg">
//                 <Square className="w-6 h-6 text-orange-600" />
//               </div>
//             </div>
//           </div>

//           {/* Only show Total Enrollments for Teachers */}
//           {isTeacher && (
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
//           )}
//         </div>

//         {/* Target Type Stats - Only show for Teachers */}
//         {isTeacher && (
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-6">
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
//         )}

//         {userDept && (
//           <div className="mt-4 mb-8 text-center">
//             <div className="inline-block bg-white/80 backdrop-blur-sm px-6 py-3 rounded-xl shadow-md">
//               <div className="flex items-center space-x-2">
//                 <div className="bg-green-100 p-2 rounded-lg">
//                   <Users className="w-4 h-4 text-green-600" />
//                 </div>
//                 <span className="text-sm font-medium text-gray-600">
//                   Department:
//                 </span>
//                 <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-sm font-semibold">
//                   {userDept}
//                 </span>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Action Buttons - Only for Teachers */}
//         {isTeacher && (
//           <div className="mb-6 flex justify-end space-x-3">
//             <button
//               onClick={() => navigate("/create-event")}
//               className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
//             >
//               <Plus className="w-4 h-4" />
//               <span>Create Event</span>
//             </button>
//           </div>
//         )}

//         {/* Search and Filter Bar */}
//         <div className="mb-8">
//           <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 border border-white/20">
//             <div className="flex flex-col lg:flex-row gap-4">
//               {/* Search Input */}
//               <div className="flex-1 relative">
//                 <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-700 w-5 h-5" />
//                 <input
//                   type="text"
//                   placeholder="Search events by title, description, organizer, or creator..."
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
//                   <option value="date">Sort by Date</option>
//                   <option value="popularity">Sort by Popularity</option>
//                   <option value="enrollment">Sort by Capacity</option>
//                 </select>
//               </div>
//             </div>

//             {/* Active Filters Display */}
//             {(filterType !== "GLOBAL" ||
//               selectedStatus !== "all" ||
//               completedFilter !== "all" ||
//               selectedClubId ||
//               showCreatedEvents ||
//               showEnrolledEvents) && (
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
//                             c.clubId.toString() === selectedClubId.toString()
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

//                   {isTeacher && showCreatedEvents && (
//                     <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm flex items-center">
//                       My Created Events
//                       <button
//                         onClick={() => handleFilterChange("GLOBAL")}
//                         className="ml-2 hover:text-orange-900"
//                       >
//                         <X className="w-3 h-3" />
//                       </button>
//                     </span>
//                   )}

//                   {!isTeacher && showEnrolledEvents && (
//                     <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center">
//                       My Enrolled Events
//                       <button
//                         onClick={() => {
//                           setShowEnrolledEvents(false);
//                           const token = localStorage.getItem("token");
//                           const user = JSON.parse(localStorage.getItem("user"));
//                           fetchEvents(token, user?.role, filterType, selectedClubId || deptId);
//                         }}
//                         className="ml-2 hover:text-green-900"
//                       >
//                         <X className="w-3 h-3" />
//                       </button>
//                     </span>
//                   )}

//                   {selectedStatus !== "all" && (
//                     <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center">
//                       Status: {selectedStatus}
//                       <button
//                         onClick={removeStatusFilter}
//                         className="ml-2 hover:text-blue-900"
//                       >
//                         <X className="w-3 h-3" />
//                       </button>
//                     </span>
//                   )}

//                   {completedFilter !== "all" && (
//                     <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center">
//                       Completed: {completedFilter === "completed" ? "Yes" : "No"}
//                       <button
//                         onClick={removeCompletedFilter}
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
//                   {/* Filter by label and buttons row */}
//                   <div className="flex flex-wrap items-center gap-3">
//                     <span className="text-sm font-medium text-gray-600">
//                       Filter by:
//                     </span>

//                     {/* Filter Buttons */}
//                     <div className="flex flex-wrap items-center gap-2">
//                       {/* Created Events Filter - Only for Teachers */}
//                       {isTeacher && (
//                         <button
//                           onClick={() => {
//                             handleFilterChange("CREATED");
//                             setShowEnrolledEvents(false);
//                           }}
//                           className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
//                             showCreatedEvents
//                               ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg"
//                               : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
//                           }`}
//                         >
//                           My Created Events
//                         </button>
//                       )}

//                       {/* My Enrolled Events Filter - Only for Users */}
//                       {!isTeacher && (
//                         <button
//                           onClick={handleEnrolledEventsClick}
//                           className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
//                             showEnrolledEvents
//                               ? "bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg"
//                               : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
//                           }`}
//                         >
//                           My Enrolled Events
//                         </button>
//                       )}

//                       {/* Global Events Filter */}
//                       <button
//                         onClick={() => {
//                           handleFilterChange("GLOBAL");
//                           setShowEnrolledEvents(false);
//                         }}
//                         className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
//                           filterType === "GLOBAL" && !showCreatedEvents && !showEnrolledEvents
//                             ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg"
//                             : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
//                         }`}
//                       >
//                         Global Events
//                       </button>

//                       {/* Department Filter */}
//                       {userDept && (
//                         <button
//                           onClick={() => handleFilterChange("DEPARTMENT")}
//                           className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
//                             filterType === "DEPARTMENT"
//                               ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
//                               : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
//                           }`}
//                         >
//                           {userDept} Events
//                         </button>
//                       )}

//                       {/* Club Events Button */}
//                       <button
//                         onClick={() => {
//                           setShowClubDropdown(!showClubDropdown);
//                           setShowEnrolledEvents(false);
//                         }}
//                         className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
//                           filterType === "CLUB"
//                             ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
//                             : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
//                         }`}
//                       >
//                         <span>Club Events</span>
//                         <ChevronDown
//                           className={`w-4 h-4 transition-transform duration-300 ${
//                             showClubDropdown ? "rotate-180" : ""
//                           }`}
//                         />
//                       </button>

//                       {/* Status Filter */}
//                       <select
//                         value={selectedStatus}
//                         onChange={async (e) => {
//                           const value = e.target.value;
//                           setSelectedStatus(value);
                          
//                           if (value === "all") {
//                             const token = localStorage.getItem("token");
//                             const user = JSON.parse(localStorage.getItem("user"));
//                             await fetchEvents(token, user?.role, filterType, selectedClubId || deptId, completedFilter !== "all" ? completedFilter : null);
//                           } else {
//                             await fetchEventsByDeadline(value.toUpperCase());
//                           }
//                         }}
//                         className="px-4 py-2 rounded-lg border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 bg-white"
//                       >
//                         <option value="all">Enrollment Status</option>
//                         <option value="open">Open</option>
//                         <option value="closed">Closed</option>
//                       </select>

//                       {/* NEW: Completed Status Filter */}
//                       <select
//                         value={completedFilter}
//                         onChange={(e) => handleCompletedFilterChange(e.target.value)}
//                         className="px-4 py-2 rounded-lg border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 bg-white"
//                       >
//                         <option value="all">Completed Status</option>
//                         <option value="completed">Completed</option>
//                         <option value="notCompleted">Not Completed</option>
//                       </select>
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
//                             <p className="text-gray-500">No clubs available</p>
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
//             <span className="font-semibold">{events.length}</span> events
//           </p>
//           {!isTeacher && (
//             <div className="bg-green-50 px-3 py-1 rounded-full text-xs font-medium text-green-700 flex items-center">
//               <CheckCircle className="w-3 h-3 mr-1" />
//               Your Enrollments: {enrolledEvents.length}
//             </div>
//           )}
//         </div>

//         {/* Events Grid */}
//         {filteredEvents.length === 0 ? (
//           <div className="text-center py-16">
//             <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 max-w-md mx-auto border border-white/20">
//               <div className="relative">
//                 <div className="absolute inset-0 flex items-center justify-center">
//                   <div className="w-32 h-32 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 animate-ping"></div>
//                 </div>
//                 <Calendar className="w-20 h-20 text-gray-400 mx-auto mb-4 relative z-10" />
//               </div>
//               <h3 className="text-2xl font-bold text-gray-800 mb-2">
//                 No Events Found
//               </h3>
//               <p className="text-gray-600 mb-6">
//                 {filterType === "CLUB" && !selectedClubId
//                   ? "Please select a club from the dropdown to view its events."
//                   : showCreatedEvents && isTeacher
//                     ? "You haven't created any events yet. Create your first event to get started!"
//                       : !isTeacher && showEnrolledEvents
//               ? "You haven't enrolled in any events yet. Browse events and enroll to see them here!"
//                     : completedFilter !== "all"
//                       ? `No ${completedFilter === "completed" ? "completed" : "not completed"} events found.`
//                       : "There are no events available at the moment. Check back later for exciting new events!"}
//               </p>
//               {(showCreatedEvents || isTeacher) && (
//                 <button
//                   onClick={() => navigate("/create-event")}
//                   className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
//                 >
//                   Create New Event
//                 </button>
//               )}
//               {(filterType !== "GLOBAL" ||
//                 searchTerm ||
//                 selectedStatus !== "all" ||
//                 completedFilter !== "all") && (
//                 <button
//                   onClick={clearAllFilters}
//                   className="mt-4 px-6 py-3 text-purple-600 hover:text-purple-800 font-medium"
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
//                 grid gap-4 w-full
//                 ${filteredEvents.length === 1 
//                   ? 'grid-cols-1 md:grid-cols-1 lg:grid-cols-1 max-w-sm mx-auto' 
//                   : filteredEvents.length === 2 
//                     ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2 max-w-2xl mx-auto' 
//                     : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
//                 }
//               `}
//             >
//               {filteredEvents.map((event, index) => {
//                 const daysUntil = getDaysUntil(event.dateTime);
//                 const categoryIcon = getEventCategoryIcon(event.title);
//                 const targetTypeColor = getTargetTypeColor(event.targetType);
//                 const isCreator = isTeacher && event.creatorPrn === userPrn;
//                 const isEnrolled =
//                   !isTeacher && enrolledEvents.includes(Number(event.eventId));

//                 return (
//                   <div
//                     key={event.eventId}
//                     className={`event-card-container ${animations.fadeIn}`}
//                     style={{ animationDelay: `${index * 100}ms` }}
//                   >
//                     <div className="event-card">
//                       {/* Front of Card */}
//                       <div className="card-face card-front bg-white/90 backdrop-blur-sm rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-500 border border-white/20">
//                         {/* Event Header with Super Admin Gradient */}
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

//                           {daysUntil > 0 && !event.completed && (
//                             <div className="absolute top-2 left-2 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
//                               <span className="text-white text-xs font-semibold">
//                                 {daysUntil} days to go
//                               </span>
//                             </div>
//                           )}

//                           {/* Completed Badge */}
//                           {event.completed && (
//                             <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full flex items-center shadow-lg">
//                               <CheckSquare className="w-3 h-3 mr-1" />
//                               <span className="text-xs font-semibold">
//                                 Completed
//                               </span>
//                             </div>
//                           )}

//                           {/* Enrolled Badge - Only show for Users */}
//                           {!isTeacher && isEnrolled && (
//                             <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full flex items-center shadow-lg">
//                               <CheckCircle className="w-3 h-3 mr-1" />
//                               <span className="text-xs font-semibold">
//                                 Enrolled
//                               </span>
//                             </div>
//                           )}

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

//                           {/* Organizer and Creator Info */}
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
//                                 <User className="w-3 h-3 mr-0.5 text-green-500 flex-shrink-0" />
//                                 <span className="truncate">
//                                   {event.speakerName || event.organizer}
//                                 </span>
//                               </p>
//                             </div>
//                           </div>

//                           {/* Target Type Badge and Enrollment Status */}
//                           <div className="flex items-center justify-between">
//                             <span
//                               className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${targetTypeColor} flex items-center`}
//                             >
//                               {getTargetTypeIcon(event.targetType)}
//                               <span className="ml-1 capitalize text-xs">
//                                 {event.targetType || "N/A"}
//                               </span>
//                             </span>
//                             <div className="flex items-center gap-1">
//                               {!isTeacher && isEnrolled && (
//                                 <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700 flex items-center">
//                                   <CheckCircle className="w-2.5 h-2.5 mr-0.5" />
//                                   Enrolled
//                                 </span>
//                               )}
//                               {event.completed && (
//                                 <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 flex items-center">
//                                   <CheckSquare className="w-2.5 h-2.5 mr-0.5" />
//                                   Completed
//                                 </span>
//                               )}
//                             </div>
//                           </div>

//                           {/* Enrollment Progress - Only for Teachers */}
//                           {isTeacher && (
//                             <div className="space-y-1">
//                               <div className="flex justify-between text-[10px]">
//                                 <span className="text-gray-600">Enrolled</span>
//                                 <span className="font-semibold">
//                                   {event.currEnrollments || 0}/
//                                   {event.maxEnrollments || 0}
//                                 </span>
//                               </div>
//                               <div className="w-full bg-gray-200 rounded-full h-1.5">
//                                 <div
//                                   className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full transition-all duration-300"
//                                   style={{
//                                     width: `${Math.min(
//                                       (event.currEnrollments /
//                                         event.maxEnrollments) *
//                                         100,
//                                       100
//                                     )}%`,
//                                   }}
//                                 ></div>
//                               </div>
//                             </div>
//                           )}

//                           {/* Flip Hint */}
//                           <div className="text-center text-[8px] mt-1 flex items-center justify-center text-purple-600">
//                             <span className="animate-pulse mr-1 text-[6px]">
//                               ●
//                             </span>
//                             Hover to view all details
//                           </div>
//                         </div>
//                       </div>

//                       {/* Back of Card - All Details with super admin gradient */}
//                       <div className="card-face card-back rounded-xl shadow-md overflow-hidden p-3 bg-gradient-to-br from-[#4CA1AF] to-[#2C3E50]">
//                         <div className="h-full flex flex-col">
//                           <div className="flex items-center justify-between mb-2">
//                             <h3 className="text-sm font-bold text-white line-clamp-1 flex-1">
//                               {event.title}
//                             </h3>
//                             {event.completed && (
//                               <span className="bg-green-500 text-white px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center ml-1">
//                                 <CheckSquare className="w-2.5 h-2.5 mr-0.5" />
//                                 Completed
//                               </span>
//                             )}
//                             {!isTeacher && isEnrolled && (
//                               <span className="bg-green-500 text-white px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center ml-1">
//                                 <CheckCircle className="w-2.5 h-2.5 mr-0.5" />
//                                 Enrolled
//                               </span>
//                             )}
//                           </div>

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
//                                     Enrollment Deadline
//                                   </p>
//                                 </div>
//                                 <p className="text-xs font-medium text-white">
//                                   {new Date(
//                                     event.enrollmentDeadline
//                                   ).toLocaleDateString()}
//                                 </p>
//                               </div>
//                             </div>

//                             {/* Created By Info - Now on Back with proper name */}
//                             <div
//                               className="p-1.5 rounded-lg"
//                               style={{
//                                 backgroundColor: "rgba(255, 255, 255, 0.1)",
//                               }}
//                             >
//                               <p className="text-[10px] text-white/80 mb-1 flex items-center">
//                                 <Star className="w-2.5 h-2.5 mr-1" />
//                                 Created By
//                               </p>
//                               <p className="text-xs font-medium text-white flex items-center">
//                                 <span className="truncate">
//                                   {event.creatorName || event.organizer || "Unknown"}
//                                 </span>
//                               </p>
//                             </div>

//                             {/* Target Info */}
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
//                                         (d) => d.departmentId === id
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
//                                       const club = userClubs.find(
//                                         (c) => c.clubId === id
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

//                             {/* Enrollment Info - Only for Teachers */}
//                             {isTeacher && (
//                               <div
//                                 className="p-1.5 rounded-lg"
//                                 style={{
//                                   backgroundColor: "rgba(255, 255, 255, 0.1)",
//                                 }}
//                               >
//                                 <div className="flex justify-between items-center mb-1">
//                                   <span className="text-[10px] text-white/80">
//                                     Total Enrollments
//                                   </span>
//                                   <span className="text-xs text-white">
//                                     {event.currEnrollments || 0}/
//                                     {event.maxEnrollments || 0}
//                                   </span>
//                                 </div>
//                                 <div
//                                   className="w-full h-1.5 rounded-full overflow-hidden"
//                                   style={{
//                                     backgroundColor: "rgba(255, 255, 255, 0.2)",
//                                   }}
//                                 >
//                                   <div
//                                     className="h-full rounded-full bg-gradient-to-r from-[#4CA1AF] to-[#2C3E50]"
//                                     style={{
//                                       width: `${Math.min(
//                                         (event.currEnrollments /
//                                           event.maxEnrollments) *
//                                           100,
//                                         100
//                                       )}%`,
//                                     }}
//                                   ></div>
//                                 </div>
//                               </div>
//                             )}
//                           </div>

//                          {/* Action Buttons */}
// <div className="mt-2 pt-1 border-t border-white/20">
//   {isCreator ? (
//     <div className="flex flex-col gap-1">
//       {/* Completion Message */}
//       {completionMessage.show && completionMessage.eventId === event.eventId && (
//         <div className={`text-center text-[10px] font-medium ${
//           completionMessage.success ? "text-green-400" : "text-red-400"
//         }`}>
//           {completionMessage.message}
//         </div>
//       )}
      
//       <div className="flex gap-1">
//       <button
//   onClick={(e) => {
//     e.stopPropagation();
//     handleEditClick(event);
//   }}
//   className="flex-1 px-1.5 py-1 rounded-lg text-[10px] font-medium transition flex items-center justify-center text-white"
//   style={{
//     backgroundColor: "rgba(255, 255, 255, 0.2)",
//   }}
//   onMouseEnter={(e) =>
//     (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.3)")
//   }
//   onMouseLeave={(e) =>
//     (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.2)")
//   }
// >
//   <Edit className="w-2.5 h-2.5 mr-0.5" />
//   Edit
// </button>

//         <button
//           onClick={(e) => {
//             e.stopPropagation();
//             setConfirmDialog({ isOpen: true, title: "Delete Event", message: "Are you sure you want to delete this event? This action cannot be undone.", confirmText: "Delete", variant: "danger", onConfirm: () => { closeConfirm(); handleDeleteEvent(event.eventId); } });
//           }}
//           className="flex-1 px-1.5 py-1 rounded-lg text-[10px] font-medium transition flex items-center justify-center text-white"
//           style={{
//             backgroundColor: "rgba(239, 68, 68, 0.5)",
//           }}
//           onMouseEnter={(e) =>
//             (e.currentTarget.style.backgroundColor =
//               "rgba(239, 68, 68, 0.6)")
//           }
//           onMouseLeave={(e) =>
//             (e.currentTarget.style.backgroundColor =
//               "rgba(239, 68, 68, 0.5)")
//           }
//         >
//           <Trash2 className="w-2.5 h-2.5 mr-0.5" />
//           Delete
//         </button>
//       </div>
      
//       {/* Complete Event Button - Only show if event is not completed */}
//       {!event.completed && (
//         <button
//           onClick={(e) => {
//             e.stopPropagation();
//             handleCompleteEvent(event.eventId);
//           }}
//           disabled={completingEventId === event.eventId}
//           className="w-full px-1.5 py-1 rounded-lg text-[10px] font-medium transition flex items-center justify-center text-white"
//           style={{
//             backgroundColor: completingEventId === event.eventId 
//               ? "rgba(255, 255, 255, 0.1)" 
//               : "rgba(34, 197, 94, 0.5)",
//           }}
//           onMouseEnter={(e) => {
//             if (completingEventId !== event.eventId) {
//               e.currentTarget.style.backgroundColor = "rgba(34, 197, 94, 0.6)";
//             }
//           }}
//           onMouseLeave={(e) => {
//             if (completingEventId !== event.eventId) {
//               e.currentTarget.style.backgroundColor = "rgba(34, 197, 94, 0.5)";
//             }
//           }}
//         >
//           {completingEventId === event.eventId ? (
//             <>
//               <Loader2 className="w-2.5 h-2.5 mr-0.5 animate-spin" />
//               Completing...
//             </>
//           ) : (
//             <>
//               <CheckSquare className="w-2.5 h-2.5 mr-0.5" />
//               Complete Event
//             </>
//           )}
//         </button>
//       )}
      
//       {/* Show Completed badge if event is completed */}
//       {event.completed && (
//         <div className="w-full py-1 rounded-lg text-[10px] font-medium text-center bg-green-500/50 text-white flex items-center justify-center">
//           <CheckSquare className="w-2.5 h-2.5 mr-0.5" />
//           Completed
//         </div>
//       )}
//     </div>
//   ) : !isTeacher && !event.completed ? (
//     isEnrolled ? (
//       // Revoke button — user is enrolled and event is not completed
//       <div className="relative">
//         {enrollmentMessage.show && enrollmentMessage.eventId === event.eventId && (
//           <div
//             className={`absolute bottom-full mb-2 left-0 right-0 text-center text-[10px] font-medium ${
//               enrollmentMessage.success ? "text-green-400" : "text-red-400"
//             }`}
//           >
//             {enrollmentMessage.message}
//           </div>
//         )}
//         <button
//           onClick={() => setConfirmDialog({ isOpen: true, title: "Revoke Enrollment", message: "Are you sure you want to revoke your enrollment for this event?", confirmText: "Revoke", variant: "danger", onConfirm: () => { closeConfirm(); handleRevokeEnrollment(event.eventId); } })}
//           disabled={revokingEventId === event.eventId}
//           className="w-full py-1.5 rounded-lg text-xs font-medium transition flex items-center justify-center bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700"
//         >
//           {revokingEventId === event.eventId ? (
//             <>
//               <Loader2 className="w-3 h-3 mr-1 animate-spin" />
//               Revoking...
//             </>
//           ) : (
//             <>
//               <XCircle className="w-3 h-3 mr-1" />
//               Revoke Enrollment
//             </>
//           )}
//         </button>
//       </div>
//     ) : event.enrollmentStatus === "OPEN" ? (
//       // Enroll button — user is not enrolled and enrollment is open
//       <div className="relative">
//         {enrollmentMessage.show && enrollmentMessage.eventId === event.eventId && (
//           <div
//             className={`absolute bottom-full mb-2 left-0 right-0 text-center text-[10px] font-medium ${
//               enrollmentMessage.success ? "text-green-400" : "text-red-400"
//             }`}
//           >
//             {enrollmentMessage.message}
//           </div>
//         )}
//         <button
//           onClick={() => setConfirmDialog({ isOpen: true, title: "Confirm Enrollment", message: "Are you sure you want to enroll in this event?", confirmText: "Enroll", variant: "primary", onConfirm: () => { closeConfirm(); handleEnroll(event.eventId); } })}
//           disabled={enrollingEventId === event.eventId}
//           className="w-full py-1.5 rounded-lg text-xs font-medium transition flex items-center justify-center bg-gradient-to-r from-[#4CA1AF] to-[#2C3E50] text-white hover:from-[#3d8a9c] hover:to-[#1f2f3f]"
//         >
//           {enrollingEventId === event.eventId ? (
//             <>
//               <Loader2 className="w-3 h-3 mr-1 animate-spin" />
//               Enrolling...
//             </>
//           ) : (
//             "Enroll Now"
//           )}
//         </button>
//       </div>
//     ) : null
//   ) : null}
//   {event.completed && !isCreator && (
//     <div className="w-full py-1.5 rounded-lg text-xs font-medium text-center bg-gray-500/50 text-white">
//       Event Completed
//     </div>
//   )}
// </div>
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
//             <span>Stay tuned for more exciting events!</span>
//             <Gift className="w-4 h-4" />
//           </div>
//         </div>
//       </div>

// {/* Edit Event Modal */}
// {showEditModal && editingEvent && (
//   <div className="fixed inset-0 z-50 overflow-y-auto">
//     {/* Backdrop */}
//     <div 
//       className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
//       onClick={() => setShowEditModal(false)}
//     ></div>
    
//     {/* Modal Container - Responsive */}
//     <div className="flex min-h-full items-center justify-center p-4">
//       <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
//         {/* Modal Header */}
//         <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl z-10">
//           <div className="flex items-center justify-between">
//             <h2 className="text-2xl font-bold bg-clip-text text-transparent"
//               style={{
//                 background: "linear-gradient(135deg, #4CA1AF, #2C3E50)",
//                 WebkitBackgroundClip: "text",
//                 WebkitTextFillColor: "transparent",
//               }}
//             >
//               Edit Event
//             </h2>
//             <button
//               onClick={() => setShowEditModal(false)}
//               className="text-gray-400 hover:text-gray-600 transition-colors"
//             >
//               <X className="w-6 h-6" />
//             </button>
//           </div>
//         </div>
        
//         {/* Modal Body - Form */}
//         <form onSubmit={handleUpdateEvent} className="p-6">
//           {updateError && (
//             <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
//               <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
//               <p className="text-sm text-red-600">{updateError}</p>
//             </div>
//           )}
          
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {/* Left Column */}
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Event Title *
//                 </label>
//                 <input
//                   type="text"
//                   name="title"
//                   value={editingEvent.title}
//                   onChange={handleEditInputChange}
//                   required
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA1AF] focus:border-transparent transition-all"
//                   placeholder="Enter event title"
//                 />
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Description *
//                 </label>
//                 <textarea
//                   name="description"
//                   value={editingEvent.description}
//                   onChange={handleEditInputChange}
//                   required
//                   rows="3"
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA1AF] focus:border-transparent transition-all"
//                   placeholder="Enter event description"
//                 />
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Date & Time *
//                 </label>
//                 <input
//                   type="datetime-local"
//                   name="dateTime"
//                   value={editingEvent.dateTime}
//                   onChange={handleEditInputChange}
//                   required
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA1AF] focus:border-transparent transition-all"
//                 />
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Venue *
//                 </label>
//                 <input
//                   type="text"
//                   name="venue"
//                   value={editingEvent.venue}
//                   onChange={handleEditInputChange}
//                   required
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA1AF] focus:border-transparent transition-all"
//                   placeholder="Enter venue"
//                 />
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Organizer *
//                 </label>
//                 <input
//                   type="text"
//                   name="organizer"
//                   value={editingEvent.organizer}
//                   onChange={handleEditInputChange}
//                   required
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA1AF] focus:border-transparent transition-all"
//                   placeholder="Enter organizer name"
//                 />
//               </div>
//             </div>
            
//             {/* Right Column */}
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Speaker Name
//                 </label>
//                 <input
//                   type="text"
//                   name="speakerName"
//                   value={editingEvent.speakerName}
//                   onChange={handleEditInputChange}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA1AF] focus:border-transparent transition-all"
//                   placeholder="Enter speaker name"
//                 />
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Max Enrollments *
//                 </label>
//                 <input
//                   type="number"
//                   name="maxEnrollments"
//                   value={editingEvent.maxEnrollments}
//                   onChange={handleEditInputChange}
//                   required
//                   min="1"
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA1AF] focus:border-transparent transition-all"
//                 />
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Enrollment Deadline *
//                 </label>
//                 <input
//                   type="datetime-local"
//                   name="enrollmentDeadline"
//                   value={editingEvent.enrollmentDeadline}
//                   onChange={handleEditInputChange}
//                   required
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA1AF] focus:border-transparent transition-all"
//                 />
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Target Type *
//                 </label>
//                 <select
//                   name="targetType"
//                   value={editingEvent.targetType}
//                   onChange={handleEditInputChange}
//                   required
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA1AF] focus:border-transparent transition-all"
//                 >
//                   <option value="GLOBAL">Global</option>
//                   <option value="CLUB">Club</option>
//                   <option value="DEPARTMENT">Department</option>
//                 </select>
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Target IDs (comma-separated)
//                 </label>
//                 <input
//                   type="text"
//                   name="targetIds"
//                   value={editingEvent.targetIds?.join(', ') || ''}
//                   onChange={handleEditInputChange}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA1AF] focus:border-transparent transition-all"
//                   placeholder="e.g., 1, 2, 3"
//                 />
//                 <p className="text-xs text-gray-500 mt-1">
//                   Enter department or club IDs separated by commas
//                 </p>
//               </div>
//             </div>
//           </div>
          
//           {/* Geo-location Section */}
//           <div className="mt-6 pt-6 border-t border-gray-200">
//             <h3 className="text-lg font-semibold text-gray-800 mb-4">Location Details (Optional)</h3>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Latitude
//                 </label>
//                 <input
//                   type="number"
//                   name="latitude"
//                   value={editingEvent.latitude || ''}
//                   onChange={handleEditInputChange}
//                   step="any"
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA1AF] focus:border-transparent transition-all"
//                   placeholder="e.g., 18.5204"
//                 />
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Longitude
//                 </label>
//                 <input
//                   type="number"
//                   name="longitude"
//                   value={editingEvent.longitude || ''}
//                   onChange={handleEditInputChange}
//                   step="any"
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA1AF] focus:border-transparent transition-all"
//                   placeholder="e.g., 73.8567"
//                 />
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Radius (meters)
//                 </label>
//                 <input
//                   type="number"
//                   name="radiusInMeters"
//                   value={editingEvent.radiusInMeters || ''}
//                   onChange={handleEditInputChange}
//                   min="0"
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA1AF] focus:border-transparent transition-all"
//                   placeholder="e.g., 100"
//                 />
//               </div>
//             </div>
//           </div>
          
//           {/* Attendance Window Section */}
//           <div className="mt-6 pt-6 border-t border-gray-200">
//             <h3 className="text-lg font-semibold text-gray-800 mb-4">Attendance Settings (Optional)</h3>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Window Start
//                 </label>
//                 <input
//                   type="datetime-local"
//                   name="attendanceWindowStart"
//                   value={editingEvent.attendanceWindowStart || ''}
//                   onChange={handleEditInputChange}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA1AF] focus:border-transparent transition-all"
//                 />
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Window End
//                 </label>
//                 <input
//                   type="datetime-local"
//                   name="attendanceWindowEnd"
//                   value={editingEvent.attendanceWindowEnd || ''}
//                   onChange={handleEditInputChange}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA1AF] focus:border-transparent transition-all"
//                 />
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   QR Refresh Interval (sec)
//                 </label>
//                 <input
//                   type="number"
//                   name="qrRefreshInterval"
//                   value={editingEvent.qrRefreshInterval || 0}
//                   onChange={handleEditInputChange}
//                   min="0"
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA1AF] focus:border-transparent transition-all"
//                   placeholder="e.g., 30"
//                 />
//               </div>
//             </div>
//           </div>
          
//           {/* Modal Footer */}
//           <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end gap-3">
//             <button
//               type="button"
//               onClick={() => setShowEditModal(false)}
//               className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={updateLoading}
//               className="px-6 py-2.5 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
//               style={{
//                 background: "linear-gradient(135deg, #4CA1AF, #2C3E50)",
//               }}
//             >
//               {updateLoading ? (
//                 <>
//                   <Loader2 className="w-4 h-4 animate-spin" />
//                   <span>Updating...</span>
//                 </>
//               ) : (
//                 <>
//                   <Edit className="w-4 h-4" />
//                   <span>Update Event</span>
//                 </>
//               )}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   </div>
// )}
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

//     <ConfirmDialog
//       isOpen={confirmDialog.isOpen}
//       title={confirmDialog.title}
//       message={confirmDialog.message}
//       confirmText={confirmDialog.confirmText}
//       variant={confirmDialog.variant}
//       onConfirm={confirmDialog.onConfirm}
//       onCancel={closeConfirm}
//     />
//     </>
//   );
// };

// export default MyEvents;