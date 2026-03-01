// RIYA UPDATED CODE FOR CREATE EVENT
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import CustomSelect from "../../components/CustomSelect";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Building2,
  FileText,
  X,
  CalendarPlus,
  AlertCircle,
  CheckCircle,
  Loader,
  ChevronLeft,
  Globe,
  Map as MapIcon,
  QrCode,
  Mail,
  User,
  Hash,
  Check,
  Plus,
  Trash2,
  Crosshair,
  Layers,
  Sparkles,
  Bell,
  Gift,
} from "lucide-react";

// Import Leaflet CSS
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export default function CreateEvent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  // Get pre-selected club from URL params
  const preSelectedClubId = searchParams.get("clubId");
  const preSelectedClubName = searchParams.get("clubName");

  // Map references
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);
  const mapContainerRef = useRef(null);
  const mapInitializedRef = useRef(false);

  // Form state based on Events model
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    speakerName: "",
    eventDate: "",
    organizer: "",
    eventCreator: user?.username || "",
    venue: "",
    maxEnrollments: "",
    currEnrollments: 0,
    target: "GLOBAL",
    targetIds: preSelectedClubId ? [preSelectedClubId] : [],
    isCompleted: false,
    enrollmentDeadline: "",
    enrollmentStatus: "OPEN",
    contactEmail: user?.email || "",

    // Attendance fields
    latitude: "18.5204",
    longitude: "73.8567",
    radiusInMeters: 50,
    attendanceWindowStart: "",
    attendanceWindowEnd: "",
    qrRefreshIntervalSeconds: 120,
    attendanceEnabled: false,
    attendanceActive: false,
  });

  // UI States
  const [loading, setLoading] = useState(false);
  const [clubs, setClubs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [selectedTargets, setSelectedTargets] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [enableAttendance, setEnableAttendance] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchingLocation, setSearchingLocation] = useState(false);

  // Animation styles
  const animations = {
    fadeIn: "animate-[fadeIn_0.5s_ease-in-out]",
    slideUp: "animate-[slideUp_0.5s_ease-out]",
    pulse: "animate-pulse",
    bounce: "animate-bounce",
    gradient: "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600",
  };

  // Initialize selected targets from pre-selected club
  useEffect(() => {
    if (preSelectedClubId && preSelectedClubName) {
      setSelectedTargets([
        { id: preSelectedClubId, name: preSelectedClubName },
      ]);
    }
  }, [preSelectedClubId, preSelectedClubName]);

  // Initialize map when attendance is enabled
  useEffect(() => {
    if (
      enableAttendance &&
      mapContainerRef.current &&
      !mapInitializedRef.current
    ) {
      requestAnimationFrame(() => {
        initializeMap();
      });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
        circleRef.current = null;
        mapInitializedRef.current = false;
      }
    };
  }, [enableAttendance]);

  const initializeMap = () => {
    if (!mapContainerRef.current || mapInitializedRef.current) return;

    const defaultLat = parseFloat(formData.latitude) || 18.5204;
    const defaultLng = parseFloat(formData.longitude) || 73.8567;

    try {
      mapRef.current = L.map(mapContainerRef.current).setView(
        [defaultLat, defaultLng],
        15,
      );

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(mapRef.current);

      markerRef.current = L.marker([defaultLat, defaultLng], {
        draggable: true,
        autoPan: true,
      }).addTo(mapRef.current);

      circleRef.current = L.circle([defaultLat, defaultLng], {
        radius: formData.radiusInMeters,
        color: "#4CA1AF",
        fillColor: "#4CA1AF",
        fillOpacity: 0.2,
        weight: 2,
      }).addTo(mapRef.current);

      markerRef.current.on("dragend", function (e) {
        const position = e.target.getLatLng();
        updateCoordinates(position.lat, position.lng);
        if (circleRef.current) {
          circleRef.current.setLatLng([position.lat, position.lng]);
        }
      });

      mapRef.current.on("click", function (e) {
        const { lat, lng } = e.latlng;
        if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
        if (circleRef.current) circleRef.current.setLatLng([lat, lng]);
        updateCoordinates(lat, lng);
      });

      setTimeout(() => {
        if (mapRef.current) mapRef.current.invalidateSize();
      }, 100);

      mapInitializedRef.current = true;
    } catch (error) {
      console.error("Error initializing map:", error);
    }
  };

  const updateCoordinates = (lat, lng) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6),
    }));
  };

  // Update circle radius when radius changes
  useEffect(() => {
    if (circleRef.current && formData.radiusInMeters) {
      circleRef.current.setRadius(parseInt(formData.radiusInMeters));
    }
  }, [formData.radiusInMeters]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (mapRef.current && enableAttendance) {
        mapRef.current.invalidateSize();
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [enableAttendance]);

  // ✅ FIXED: Using Photon API (CORS-enabled) instead of Nominatim
  const searchLocation = async () => {
    if (!searchQuery.trim()) return;

    try {
      setSearchingLocation(true);
      setMessage({ text: "Searching location...", type: "success" });

      const response = await axios.get(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(searchQuery)}&limit=1`,
      );

      if (response.data?.features?.length > 0) {
        const [lon, lat] = response.data.features[0].geometry.coordinates;
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);

        if (mapRef.current) {
          mapRef.current.setView([latitude, longitude], 16);
          if (markerRef.current)
            markerRef.current.setLatLng([latitude, longitude]);
          if (circleRef.current)
            circleRef.current.setLatLng([latitude, longitude]);
        }

        updateCoordinates(latitude, longitude);
        setMessage({ text: "Location found!", type: "success" });
        setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      } else {
        setMessage({
          text: "Location not found. Try a different search term.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error searching location:", error);
      setMessage({
        text: "Error searching location. Please try again.",
        type: "error",
      });
    } finally {
      setSearchingLocation(false);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setMessage({
        text: "Geolocation is not supported by your browser",
        type: "error",
      });
      return;
    }

    setMessage({ text: "Getting your location...", type: "success" });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        if (mapRef.current) {
          mapRef.current.setView([latitude, longitude], 16);
          if (markerRef.current)
            markerRef.current.setLatLng([latitude, longitude]);
          if (circleRef.current)
            circleRef.current.setLatLng([latitude, longitude]);
        }

        updateCoordinates(latitude, longitude);
        setMessage({ text: "Location captured!", type: "success" });
        setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      },
      (error) => {
        console.error("Geolocation error:", error);
        const errorMessages = {
          1: "Permission denied — please allow location access in your browser settings and refresh.",
          2: "Position unavailable — your device couldn't determine location.",
          3: "Request timed out — try again.",
        };
        setMessage({
          text: errorMessages[error.code] || "Unknown location error.",
          type: "error",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  const fetchTargetOptions = async () => {
    setLoadingOptions(true);
    try {
      const userRole = user?.role;

      let clubsEndpoint = "http://localhost:8080/api/clubs";
      if (userRole === "TEACHER") {
        clubsEndpoint = "http://localhost:8080/api/user-clubs/getMyClubs";
      }

      const clubsResponse = await axios.get(clubsEndpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (
        clubsResponse.data.success &&
        Array.isArray(clubsResponse.data.data)
      ) {
        setClubs(clubsResponse.data.data);
      } else if (Array.isArray(clubsResponse.data)) {
        setClubs(clubsResponse.data);
      } else if (
        clubsResponse.data.data &&
        Array.isArray(clubsResponse.data.data)
      ) {
        setClubs(clubsResponse.data.data);
      } else {
        setClubs([]);
      }

      const deptResponse = await axios.get(
        "http://localhost:8080/api/department",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      // Handle the specific response structure you shared
      if (deptResponse.data.success && Array.isArray(deptResponse.data.data)) {
        // Filter only active departments
        const activeDepartments = deptResponse.data.data.filter(
          (dept) => dept.active === true,
        );
        setDepartments(activeDepartments);
      } else if (Array.isArray(deptResponse.data)) {
        setDepartments(deptResponse.data);
      } else {
        setDepartments([]);
      }
    } catch (error) {
      console.error("Error fetching options:", error);
      setMessage({ text: "Failed to load clubs/departments", type: "error" });
    } finally {
      setLoadingOptions(false);
    }
  };

  useEffect(() => {
    fetchTargetOptions();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleTargetTypeChange = (type) => {
    setFormData((prev) => ({ ...prev, target: type, targetIds: [] }));
    setSelectedTargets([]);
  };

  const toggleTargetSelection = (target) => {
    const exists = selectedTargets.some((t) => t.id === target.id);
    const updatedTargets = exists
      ? selectedTargets.filter((t) => t.id !== target.id)
      : [...selectedTargets, target];

    setSelectedTargets(updatedTargets);
    setFormData((prev) => ({
      ...prev,
      targetIds: updatedTargets.map((t) => t.id),
    }));
    if (formErrors.targetIds)
      setFormErrors((prev) => ({ ...prev, targetIds: null }));
  };

  const removeTarget = (targetId) => {
    const updatedTargets = selectedTargets.filter((t) => t.id !== targetId);
    setSelectedTargets(updatedTargets);
    setFormData((prev) => ({
      ...prev,
      targetIds: updatedTargets.map((t) => t.id),
    }));
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) errors.title = "Title is required";
    if (!formData.organizer) errors.organizer = "Organizer is required";

    if (!formData.eventDate) {
      errors.eventDate = "Event Date is required";
    } else if (new Date(formData.eventDate) < new Date()) {
      errors.eventDate = "Event date must be in the future";
    }

    if (!formData.venue.trim()) errors.venue = "Venue is required";

    if (!formData.enrollmentDeadline) {
      errors.enrollmentDeadline = "Enrollment Deadline is required";
    } else {
      const deadlineDate = new Date(formData.enrollmentDeadline);
      const eventDate = new Date(formData.eventDate);
      if (deadlineDate < new Date()) {
        errors.enrollmentDeadline = "Deadline must be in the future";
      } else if (deadlineDate >= eventDate) {
        errors.enrollmentDeadline = "Deadline must be before the event date";
      }
    }

    if (!formData.contactEmail.trim()) {
      errors.contactEmail = "Contact email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) {
      errors.contactEmail = "Please enter a valid email address";
    }

    if (formData.target !== "GLOBAL" && formData.targetIds.length === 0) {
      errors.targetIds = `Please select at least one ${formData.target.toLowerCase()}`;
    }

    if (formData.maxEnrollments && parseInt(formData.maxEnrollments) < 1) {
      errors.maxEnrollments = "Max enrollments must be at least 1";
    }

    if (enableAttendance) {
      if (!formData.latitude || !formData.longitude)
        errors.location = "Please select a location on the map";
      if (!formData.attendanceWindowStart || !formData.attendanceWindowEnd)
        errors.attendanceWindow = "Attendance window is required";
      if (formData.radiusInMeters < 10 || formData.radiusInMeters > 1000)
        errors.radius = "Radius must be between 10 and 1000 meters";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setMessage({ text: "Please fill all required fields", type: "error" });
      return;
    }

    setLoading(true);
    setMessage({ text: "", type: "" });

    const eventData = {
      title: formData.title,
      description: formData.description || null,
      speakerName: formData.speakerName || null,
      eventDate: formData.eventDate,
      organizer: formData.organizer,
      eventCreator: formData.eventCreator,
      venue: formData.venue,
      maxEnrollments: formData.maxEnrollments
        ? parseInt(formData.maxEnrollments)
        : null,
      currEnrollments: 0,
      target: formData.target,
      targetIds: formData.target === "GLOBAL" ? [] : formData.targetIds,
      isCompleted: false,
      enrollmentDeadline: formData.enrollmentDeadline,
      enrollmentStatus: "OPEN",
      contactEmail: formData.contactEmail,

      ...(enableAttendance && {
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        radiusInMeters: parseInt(formData.radiusInMeters),
        attendanceWindowStart: formData.attendanceWindowStart,
        attendanceWindowEnd: formData.attendanceWindowEnd,
        qrRefreshIntervalSeconds: parseInt(formData.qrRefreshIntervalSeconds),
        attendanceEnabled: true,
        attendanceActive: false,
      }),
    };

    try {
      console.log("Submitting event data:", eventData);
      const response = await axios.post(
        "http://localhost:8080/api/events/create",
        eventData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data.success) {
        setMessage({ text: "Event created successfully!", type: "success" });
        setTimeout(() => navigate(-1), 1500);
      } else {
        setMessage({
          text: response.data.message || "Failed to create event",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error creating event:", error);
      setMessage({
        text: error.response?.data?.message || "Error creating event",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const getTargetOptions = () => {
    if (formData.target === "CLUB") {
      return clubs.map((item) => ({
        id: item.clubId || item.id,
        name: item.name || item.clubName || "Unnamed Club",
      }));
    } else if (formData.target === "DEPARTMENT") {
      return departments.map((item) => ({
        id: item.departmentId, // Use departmentId specifically
        name: item.name || "Unnamed Department",
      }));
    }
    return [];
  };

  const targetOptions = getTargetOptions();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"
          style={{ backgroundColor: "#4CA1AF" }}
        ></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <div className="relative bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
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
            <div className="flex items-center gap-2">
              <CalendarPlus className="w-5 h-5" style={{ color: "#4CA1AF" }} />
              <span className="font-semibold text-gray-900">
                Create New Event
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl border border-white/20 overflow-hidden">
          {/* Form Header */}
          <div
            className="px-8 py-6 border-b border-gray-700/50"
            style={{
              background: "linear-gradient(135deg, #4CA1AF, #315169)",
            }}
          >
            <h1 className="text-2xl font-semibold text-white">Event Details</h1>
            <p className="text-sm text-white/90 mt-1">
              Fill in the information below to create your event
            </p>
            {preSelectedClubName && (
              <p className="text-sm mt-2 text-white/80">
                Creating event for:{" "}
                <span className="font-semibold text-white">
                  {preSelectedClubName}
                </span>
              </p>
            )}
          </div>

          {/* Status Message */}
          {message.text && (
            <div
              className={`mx-8 mt-6 p-4 rounded-lg flex items-center gap-2 ${
                message.type === "error"
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : "bg-green-50 text-green-700 border border-green-200"
              }`}
            >
              {message.type === "error" ? (
                <AlertCircle className="w-5 h-5" />
              ) : (
                <CheckCircle className="w-5 h-5" />
              )}
              <span className="text-sm font-medium">{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Row 1: Title & Speaker */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Annual Tech Symposium"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent transition-colors cursor-text bg-white/50 backdrop-blur-sm ${
                    formErrors.title
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }`}
                />
                {formErrors.title && (
                  <p className="mt-1 text-xs text-red-600">
                    {formErrors.title}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Speaker Name
                </label>
                <input
                  type="text"
                  name="speakerName"
                  value={formData.speakerName}
                  onChange={handleInputChange}
                  placeholder="e.g., Dr. John Smith"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors cursor-text bg-white/50 backdrop-blur-sm"
                />
              </div>
            </div>

            {/* Row 2: Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                placeholder="Provide a detailed description of your event..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors resize-none cursor-text bg-white/50 backdrop-blur-sm"
              />
            </div>

            {/* Row 3: Event Date & Enrollment Deadline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Date & Time <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 z-10 pointer-events-none"
                    style={{ color: "#4CA1AF" }}
                  />
                  <input
                    type="datetime-local"
                    name="eventDate"
                    value={formData.eventDate}
                    onChange={handleInputChange}
                    min={getMinDateTime()}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent transition-colors cursor-pointer bg-white/50 backdrop-blur-sm ${
                      formErrors.eventDate
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                  />
                </div>
                {formErrors.eventDate && (
                  <p className="mt-1 text-xs text-red-600">
                    {formErrors.eventDate}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enrollment Deadline <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  {/* <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" /> */}
                  <Clock
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 z-10 pointer-events-none"
                    style={{ color: "#4CA1AF" }}
                  />
                  <input
                    type="datetime-local"
                    name="enrollmentDeadline"
                    value={formData.enrollmentDeadline}
                    onChange={handleInputChange}
                    min={getCurrentDateTime()}
                    max={formData.eventDate}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent transition-colors cursor-pointer bg-white/50 backdrop-blur-sm ${
                      formErrors.enrollmentDeadline
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                  />
                </div>
                {formErrors.enrollmentDeadline && (
                  <p className="mt-1 text-xs text-red-600">
                    {formErrors.enrollmentDeadline}
                  </p>
                )}
              </div>
            </div>

            {/* Row 4: Venue & Max Enrollments */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Venue <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  {/* <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" /> */}
                  <MapPin
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 z-10 pointer-events-none"
                    style={{ color: "#4CA1AF" }}
                  />
                  <input
                    type="text"
                    name="venue"
                    value={formData.venue}
                    onChange={handleInputChange}
                    placeholder="e.g., Main Auditorium"
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent transition-colors cursor-text bg-white/50 backdrop-blur-sm ${
                      formErrors.venue
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                  />
                </div>
                {formErrors.venue && (
                  <p className="mt-1 text-xs text-red-600">
                    {formErrors.venue}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Enrollments
                </label>
                <input
                  type="number"
                  name="maxEnrollments"
                  value={formData.maxEnrollments}
                  onChange={handleInputChange}
                  placeholder="Unlimited"
                  min="1"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent transition-colors cursor-text bg-white/50 backdrop-blur-sm ${
                    formErrors.maxEnrollments
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }`}
                />
                {formErrors.maxEnrollments && (
                  <p className="mt-1 text-xs text-red-600">
                    {formErrors.maxEnrollments}
                  </p>
                )}
              </div>
            </div>

            {/* Row 5: Contact Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                {/* <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" /> */}
                <Mail
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 z-10 pointer-events-none"
                  style={{ color: "#4CA1AF" }}
                />
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  placeholder="e.g., organizer@college.edu"
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent transition-colors cursor-text bg-white/50 backdrop-blur-sm ${
                    formErrors.contactEmail
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }`}
                />
              </div>
              {formErrors.contactEmail && (
                <p className="mt-1 text-xs text-red-600">
                  {formErrors.contactEmail}
                </p>
              )}
            </div>

            {/* Row 5b: Organizer */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Organizer <span className="text-red-500">*</span>
              </label>
              <CustomSelect
                name="organizer"
                value={formData.organizer}
                onChange={handleInputChange}
                placeholder="Select organizer..."
                required
                options={[
                  { value: "Global", label: "Global" },
                  ...departments.map((dept) => ({
                    value: dept.name,
                    label: `Department: ${dept.name}`,
                  })),
                  ...clubs.map((club) => ({
                    value: club.clubName || club.name,
                    label: `Club: ${club.clubName || club.name}`,
                  })),
                ]}
              />
              {formErrors.organizer && (
                <p className="mt-1 text-xs text-red-600">{formErrors.organizer}</p>
              )}
            </div>

            {/* Row 6: Target Audience */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Target Audience <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => handleTargetTypeChange("GLOBAL")}
                  className={`px-5 py-2.5 rounded-lg border transition-colors flex items-center gap-2 cursor-pointer bg-white/50 backdrop-blur-sm ${
                    formData.target === "GLOBAL"
                      ? "border-[#4CA1AF] text-[#4CA1AF]"
                      : "border-gray-300 hover:border-[#4CA1AF] hover:bg-[#4CA1AF]/5"
                  }`}
                  style={
                    formData.target === "GLOBAL"
                      ? { backgroundColor: "rgba(76, 161, 175, 0.1)" }
                      : {}
                  }
                >
                  <Globe className="w-4 h-4" />
                  <span className="font-medium">Global (Everyone)</span>
                  {formData.target === "GLOBAL" && (
                    <Check
                      className="w-4 h-4 ml-1"
                      style={{ color: "#4CA1AF" }}
                    />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleTargetTypeChange("CLUB")}
                  className={`px-5 py-2.5 rounded-lg border transition-colors flex items-center gap-2 cursor-pointer bg-white/50 backdrop-blur-sm ${
                    formData.target === "CLUB"
                      ? "border-[#4CA1AF] text-[#4CA1AF]"
                      : "border-gray-300 hover:border-[#4CA1AF] hover:bg-[#4CA1AF]/5"
                  }`}
                  style={
                    formData.target === "CLUB"
                      ? { backgroundColor: "rgba(76, 161, 175, 0.1)" }
                      : {}
                  }
                >
                  <Users className="w-4 h-4" />
                  <span className="font-medium">Specific Clubs</span>
                  {formData.target === "CLUB" && (
                    <Check
                      className="w-4 h-4 ml-1"
                      style={{ color: "#4CA1AF" }}
                    />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleTargetTypeChange("DEPARTMENT")}
                  className={`px-5 py-2.5 rounded-lg border transition-colors flex items-center gap-2 cursor-pointer bg-white/50 backdrop-blur-sm ${
                    formData.target === "DEPARTMENT"
                      ? "border-[#4CA1AF] text-[#4CA1AF]"
                      : "border-gray-300 hover:border-[#4CA1AF] hover:bg-[#4CA1AF]/5"
                  }`}
                  style={
                    formData.target === "DEPARTMENT"
                      ? { backgroundColor: "rgba(76, 161, 175, 0.1)" }
                      : {}
                  }
                >
                  <Building2 className="w-4 h-4" />
                  <span className="font-medium">Specific Departments</span>
                  {formData.target === "DEPARTMENT" && (
                    <Check
                      className="w-4 h-4 ml-1"
                      style={{ color: "#4CA1AF" }}
                    />
                  )}
                </button>
              </div>
            </div>

            {/* Row 7: Target Selection */}
            {formData.target !== "GLOBAL" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select {formData.target === "CLUB" ? "Clubs" : "Departments"}{" "}
                  <span className="text-red-500">*</span>
                </label>

                {selectedTargets.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {selectedTargets.map((target) => (
                      <span
                        key={target.id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm"
                        style={{
                          backgroundColor: "rgba(76, 161, 175, 0.1)",
                          color: "#4CA1AF",
                        }}
                      >
                        {target.name}
                        <button
                          type="button"
                          onClick={() => removeTarget(target.id)}
                          className="hover:opacity-80 cursor-pointer"
                          style={{ color: "#4CA1AF" }}
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {loadingOptions ? (
                  <div className="flex items-center justify-center py-8 text-gray-500 bg-white/50 backdrop-blur-sm rounded-lg">
                    <Loader
                      className="w-5 h-5 animate-spin mr-2"
                      style={{ color: "#4CA1AF" }}
                    />
                    <span>Loading...</span>
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-lg overflow-hidden bg-white/50 backdrop-blur-sm">
                    <div className="max-h-60 overflow-y-auto">
                      {targetOptions.length > 0 ? (
                        targetOptions.map((item) => {
                          const isSelected = selectedTargets.some(
                            (t) => t.id === item.id,
                          );
                          return (
                            <div
                              key={item.id}
                              onClick={() => toggleTargetSelection(item)}
                              className="flex items-center justify-between px-4 py-3 border-b border-gray-100 last:border-0 cursor-pointer transition-colors"
                              style={
                                isSelected
                                  ? {
                                      backgroundColor:
                                        "rgba(76, 161, 175, 0.1)",
                                    }
                                  : {}
                              }
                            >
                              <span className="text-sm font-medium text-gray-700">
                                {item.name}
                              </span>
                              {isSelected && (
                                <Check
                                  className="w-4 h-4"
                                  style={{ color: "#4CA1AF" }}
                                />
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <div className="px-4 py-8 text-center text-gray-400">
                          No{" "}
                          {formData.target === "CLUB" ? "clubs" : "departments"}{" "}
                          available
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {formErrors.targetIds && (
                  <p className="mt-2 text-xs text-red-600">
                    {formErrors.targetIds}
                  </p>
                )}
              </div>
            )}

            {/* Row 8: Attendance Tracking Toggle */}
            <div className="border-t border-gray-200 pt-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={enableAttendance}
                    onChange={(e) => {
                      setEnableAttendance(e.target.checked);
                      if (!e.target.checked && mapRef.current) {
                        mapRef.current.remove();
                        mapRef.current = null;
                        markerRef.current = null;
                        circleRef.current = null;
                        mapInitializedRef.current = false;
                      }
                    }}
                    className="sr-only"
                  />
                  <div
                    className={`w-10 h-6 rounded-full transition-colors ${
                      enableAttendance ? "bg-[#4CA1AF]" : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transform transition-transform absolute top-1 ${
                        enableAttendance ? "translate-x-5" : "translate-x-1"
                      }`}
                    />
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  Enable Attendance Tracking with Geofencing
                </span>
              </label>
              <p className="mt-1 text-xs text-gray-500 ml-13">
                Set up location-based attendance using map selection
              </p>
            </div>

            {/* Row 9: Map and Attendance Fields */}
            {enableAttendance && (
              <div className="space-y-6 p-6 bg-white/50 backdrop-blur-sm rounded-lg border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900">
                  📍 Select Event Location on Map
                </h3>

                {/* Map Controls */}
                <div className="flex gap-3 mb-4">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && searchLocation()}
                      placeholder="Search for a location (e.g. Bharati Vidyapeeth, Pune)..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent cursor-text bg-white/50 backdrop-blur-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={searchLocation}
                    disabled={searchingLocation}
                    className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-60"
                    style={{
                      background: "linear-gradient(135deg, #4CA1AF, #315169)",
                    }}
                  >
                    {searchingLocation ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <MapIcon className="w-4 h-4" />
                    )}
                    Search
                  </button>
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors flex items-center gap-2 cursor-pointer"
                    style={{
                      background: "linear-gradient(135deg, #4CA1AF, #315169)",
                    }}
                  >
                    <Crosshair className="w-4 h-4" />
                    My Location
                  </button>
                </div>

                {/* Map Container */}
                <div
                  ref={mapContainerRef}
                  className="w-full rounded-lg border-2 border-gray-300 z-0"
                  style={{ height: "400px" }}
                />

                {/* Coordinates Display */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Latitude
                    </label>
                    <input
                      type="text"
                      value={formData.latitude}
                      readOnly
                      className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm font-mono cursor-default"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Longitude
                    </label>
                    <input
                      type="text"
                      value={formData.longitude}
                      readOnly
                      className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm font-mono cursor-default"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Radius (meters)
                    </label>
                    <input
                      type="number"
                      name="radiusInMeters"
                      value={formData.radiusInMeters}
                      onChange={handleInputChange}
                      min="10"
                      max="1000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:border-transparent cursor-text bg-white/50 backdrop-blur-sm"
                    />
                  </div>
                </div>
                {formErrors.radius && (
                  <p className="text-xs text-red-600">{formErrors.radius}</p>
                )}

                {/* Attendance Window */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Attendance Window Start
                    </label>
                    <input
                      type="datetime-local"
                      name="attendanceWindowStart"
                      value={formData.attendanceWindowStart}
                      onChange={handleInputChange}
                      min={formData.eventDate}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:border-transparent cursor-pointer bg-white/50 backdrop-blur-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Attendance Window End
                    </label>
                    <input
                      type="datetime-local"
                      name="attendanceWindowEnd"
                      value={formData.attendanceWindowEnd}
                      onChange={handleInputChange}
                      min={formData.attendanceWindowStart || formData.eventDate}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:border-transparent cursor-pointer bg-white/50 backdrop-blur-sm"
                    />
                  </div>
                </div>
                {formErrors.attendanceWindow && (
                  <p className="text-xs text-red-600">
                    {formErrors.attendanceWindow}
                  </p>
                )}

                {/* QR Settings */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    QR Refresh Interval (seconds)
                  </label>
                  <input
                    type="number"
                    name="qrRefreshIntervalSeconds"
                    value={formData.qrRefreshIntervalSeconds}
                    onChange={handleInputChange}
                    min="30"
                    max="300"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:border-transparent cursor-text bg-white/50 backdrop-blur-sm"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Default: 120 seconds (2 minutes)
                  </p>
                </div>

                {/* Map Instructions */}
                <div
                  className="rounded-lg p-3"
                  style={{
                    backgroundColor: "rgba(76, 161, 175, 0.1)",
                    borderColor: "#4CA1AF",
                    borderWidth: "1px",
                  }}
                >
                  <p
                    className="text-xs flex items-center gap-2"
                    style={{ color: "#4CA1AF" }}
                  >
                    <Layers className="w-4 h-4" />
                    <span>
                      Click on the map to set the event location. Drag the
                      marker to adjust. The circle shows the geofencing radius.
                    </span>
                  </p>
                </div>
                {formErrors.location && (
                  <p className="text-xs text-red-600">{formErrors.location}</p>
                )}
              </div>
            )}

            {/* Form Actions */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors cursor-pointer bg-white/50 backdrop-blur-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 text-white rounded-lg font-medium hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                style={{
                  background: "linear-gradient(135deg, #4CA1AF, #315169)",
                }}
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Creating Event...
                  </>
                ) : (
                  <>
                    <CalendarPlus className="w-4 h-4" />
                    Create Event
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-gray-400 text-center">
              Fields marked with <span className="text-red-500">*</span> are
              required
            </p>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-2 text-gray-500 text-sm">
            <Bell className="w-4 h-4" />
            <span>Create an amazing event for your community!</span>
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
}

// // RIYA UPDATED CODE FOR CREATE EVENT
// import { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import { useNavigate, useSearchParams } from "react-router-dom";
// import {
//   Calendar,
//   Clock,
//   MapPin,
//   Users,
//   Building2,
//   FileText,
//   X,
//   CalendarPlus,
//   AlertCircle,
//   CheckCircle,
//   Loader,
//   ChevronLeft,
//   Globe,
//   Map as MapIcon,
//   QrCode,
//   Mail,
//   User,
//   Hash,
//   Check,
//   Plus,
//   Trash2,
//   Crosshair,
//   Layers,
// } from "lucide-react";

// // Import Leaflet CSS
// import "leaflet/dist/leaflet.css";
// import L from "leaflet";

// // Fix Leaflet icon issue
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl:
//     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
//   iconUrl:
//     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
//   shadowUrl:
//     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
// });

// export default function CreateEvent() {
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();
//   const token = localStorage.getItem("token");
//   const user = JSON.parse(localStorage.getItem("user"));

//   // Get pre-selected club from URL params
//   const preSelectedClubId = searchParams.get("clubId");
//   const preSelectedClubName = searchParams.get("clubName");

//   // Map references
//   const mapRef = useRef(null);
//   const markerRef = useRef(null);
//   const circleRef = useRef(null);
//   const mapContainerRef = useRef(null);
//   const mapInitializedRef = useRef(false);

//   // Form state based on Events model
//   const [formData, setFormData] = useState({
//     title: "",
//     description: "",
//     speakerName: "",
//     eventDate: "",
//     organizer: user?.username || "CLICKZY",
//     eventCreator: user?.username || "",
//     venue: "",
//     maxEnrollments: "",
//     currEnrollments: 0,
//     target: "GLOBAL",
//     targetIds: preSelectedClubId ? [preSelectedClubId] : [],
//     isCompleted: false,
//     enrollmentDeadline: "",
//     enrollmentStatus: "OPEN",
//     contactEmail: user?.email || "",

//     // Attendance fields
//     latitude: "18.5204",
//     longitude: "73.8567",
//     radiusInMeters: 50,
//     attendanceWindowStart: "",
//     attendanceWindowEnd: "",
//     qrRefreshIntervalSeconds: 120,
//     attendanceEnabled: false,
//     attendanceActive: false,
//   });

//   // UI States
//   const [loading, setLoading] = useState(false);
//   const [clubs, setClubs] = useState([]);
//   const [departments, setDepartments] = useState([]);
//   const [loadingOptions, setLoadingOptions] = useState(false);
//   const [message, setMessage] = useState({ text: "", type: "" });
//   const [selectedTargets, setSelectedTargets] = useState([]);
//   const [formErrors, setFormErrors] = useState({});
//   const [enableAttendance, setEnableAttendance] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [searchingLocation, setSearchingLocation] = useState(false);

//   // Initialize selected targets from pre-selected club
//   useEffect(() => {
//     if (preSelectedClubId && preSelectedClubName) {
//       setSelectedTargets([
//         { id: preSelectedClubId, name: preSelectedClubName },
//       ]);
//     }
//   }, [preSelectedClubId, preSelectedClubName]);

//   // Initialize map when attendance is enabled
//   useEffect(() => {
//     if (
//       enableAttendance &&
//       mapContainerRef.current &&
//       !mapInitializedRef.current
//     ) {
//       requestAnimationFrame(() => {
//         initializeMap();
//       });
//     }

//     return () => {
//       if (mapRef.current) {
//         mapRef.current.remove();
//         mapRef.current = null;
//         markerRef.current = null;
//         circleRef.current = null;
//         mapInitializedRef.current = false;
//       }
//     };
//   }, [enableAttendance]);

//   const initializeMap = () => {
//     if (!mapContainerRef.current || mapInitializedRef.current) return;

//     const defaultLat = parseFloat(formData.latitude) || 18.5204;
//     const defaultLng = parseFloat(formData.longitude) || 73.8567;

//     try {
//       mapRef.current = L.map(mapContainerRef.current).setView(
//         [defaultLat, defaultLng],
//         15,
//       );

//       L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//         attribution:
//           '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
//         maxZoom: 19,
//       }).addTo(mapRef.current);

//       markerRef.current = L.marker([defaultLat, defaultLng], {
//         draggable: true,
//         autoPan: true,
//       }).addTo(mapRef.current);

//       circleRef.current = L.circle([defaultLat, defaultLng], {
//         radius: formData.radiusInMeters,
//         color: "#4CA1AF",
//         fillColor: "#4CA1AF",
//         fillOpacity: 0.2,
//         weight: 2,
//       }).addTo(mapRef.current);

//       markerRef.current.on("dragend", function (e) {
//         const position = e.target.getLatLng();
//         updateCoordinates(position.lat, position.lng);
//         if (circleRef.current) {
//           circleRef.current.setLatLng([position.lat, position.lng]);
//         }
//       });

//       mapRef.current.on("click", function (e) {
//         const { lat, lng } = e.latlng;
//         if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
//         if (circleRef.current) circleRef.current.setLatLng([lat, lng]);
//         updateCoordinates(lat, lng);
//       });

//       setTimeout(() => {
//         if (mapRef.current) mapRef.current.invalidateSize();
//       }, 100);

//       mapInitializedRef.current = true;
//     } catch (error) {
//       console.error("Error initializing map:", error);
//     }
//   };

//   const updateCoordinates = (lat, lng) => {
//     setFormData((prev) => ({
//       ...prev,
//       latitude: lat.toFixed(6),
//       longitude: lng.toFixed(6),
//     }));
//   };

//   // Update circle radius when radius changes
//   useEffect(() => {
//     if (circleRef.current && formData.radiusInMeters) {
//       circleRef.current.setRadius(parseInt(formData.radiusInMeters));
//     }
//   }, [formData.radiusInMeters]);

//   // Handle window resize
//   useEffect(() => {
//     const handleResize = () => {
//       if (mapRef.current && enableAttendance) {
//         mapRef.current.invalidateSize();
//       }
//     };
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, [enableAttendance]);

//   // ✅ FIXED: Using Photon API (CORS-enabled) instead of Nominatim
//   const searchLocation = async () => {
//     if (!searchQuery.trim()) return;

//     try {
//       setSearchingLocation(true);
//       setMessage({ text: "Searching location...", type: "success" });

//       const response = await axios.get(
//         `https://photon.komoot.io/api/?q=${encodeURIComponent(searchQuery)}&limit=1`,
//       );

//       if (response.data?.features?.length > 0) {
//         const [lon, lat] = response.data.features[0].geometry.coordinates;
//         const latitude = parseFloat(lat);
//         const longitude = parseFloat(lon);

//         if (mapRef.current) {
//           mapRef.current.setView([latitude, longitude], 16);
//           if (markerRef.current)
//             markerRef.current.setLatLng([latitude, longitude]);
//           if (circleRef.current)
//             circleRef.current.setLatLng([latitude, longitude]);
//         }

//         updateCoordinates(latitude, longitude);
//         setMessage({ text: "Location found!", type: "success" });
//         setTimeout(() => setMessage({ text: "", type: "" }), 3000);
//       } else {
//         setMessage({
//           text: "Location not found. Try a different search term.",
//           type: "error",
//         });
//       }
//     } catch (error) {
//       console.error("Error searching location:", error);
//       setMessage({
//         text: "Error searching location. Please try again.",
//         type: "error",
//       });
//     } finally {
//       setSearchingLocation(false);
//     }
//   };

//   const getCurrentLocation = () => {
//     if (!navigator.geolocation) {
//       setMessage({
//         text: "Geolocation is not supported by your browser",
//         type: "error",
//       });
//       return;
//     }

//     setMessage({ text: "Getting your location...", type: "success" });

//     navigator.geolocation.getCurrentPosition(
//       (position) => {
//         const { latitude, longitude } = position.coords;

//         if (mapRef.current) {
//           mapRef.current.setView([latitude, longitude], 16);
//           if (markerRef.current)
//             markerRef.current.setLatLng([latitude, longitude]);
//           if (circleRef.current)
//             circleRef.current.setLatLng([latitude, longitude]);
//         }

//         updateCoordinates(latitude, longitude);
//         setMessage({ text: "Location captured!", type: "success" });
//         setTimeout(() => setMessage({ text: "", type: "" }), 3000);
//       },
//       (error) => {
//         console.error("Geolocation error:", error);
//         const errorMessages = {
//           1: "Permission denied — please allow location access in your browser settings and refresh.",
//           2: "Position unavailable — your device couldn't determine location.",
//           3: "Request timed out — try again.",
//         };
//         setMessage({
//           text: errorMessages[error.code] || "Unknown location error.",
//           type: "error",
//         });
//       },
//       {
//         enableHighAccuracy: true,
//         timeout: 10000,
//         maximumAge: 0,
//       },
//     );
//   };

//   const fetchTargetOptions = async () => {
//     setLoadingOptions(true);
//     try {
//       const userRole = user?.role;

//       let clubsEndpoint = "http://localhost:8080/api/clubs";
//       if (userRole === "TEACHER") {
//         clubsEndpoint = "http://localhost:8080/api/user-clubs/getMyClubs";
//       }

//       const clubsResponse = await axios.get(clubsEndpoint, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       });

//       if (
//         clubsResponse.data.success &&
//         Array.isArray(clubsResponse.data.data)
//       ) {
//         setClubs(clubsResponse.data.data);
//       } else if (Array.isArray(clubsResponse.data)) {
//         setClubs(clubsResponse.data);
//       } else if (
//         clubsResponse.data.data &&
//         Array.isArray(clubsResponse.data.data)
//       ) {
//         setClubs(clubsResponse.data.data);
//       } else {
//         setClubs([]);
//       }

//   const deptResponse = await axios.get("http://localhost:8080/api/department", {
//     headers: {
//       Authorization: `Bearer ${token}`,
//       "Content-Type": "application/json",
//     },
//   });

//   // Handle the specific response structure you shared
//   if (deptResponse.data.success && Array.isArray(deptResponse.data.data)) {
//     // Filter only active departments
//     const activeDepartments = deptResponse.data.data.filter(dept => dept.active === true);
//     setDepartments(activeDepartments);
//   } else if (Array.isArray(deptResponse.data)) {
//     setDepartments(deptResponse.data);
//   } else {
//     setDepartments([]);
//   }

//     } catch (error) {
//       console.error("Error fetching options:", error);
//       setMessage({ text: "Failed to load clubs/departments", type: "error" });
//     } finally {
//       setLoadingOptions(false);
//     }
//   };

//   useEffect(() => {
//     fetchTargetOptions();
//   }, []);

//   const handleInputChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: type === "checkbox" ? checked : value,
//     }));
//     if (formErrors[name]) {
//       setFormErrors((prev) => ({ ...prev, [name]: null }));
//     }
//   };

//   const handleTargetTypeChange = (type) => {
//     setFormData((prev) => ({ ...prev, target: type, targetIds: [] }));
//     setSelectedTargets([]);
//   };

//   const toggleTargetSelection = (target) => {
//     const exists = selectedTargets.some((t) => t.id === target.id);
//     const updatedTargets = exists
//       ? selectedTargets.filter((t) => t.id !== target.id)
//       : [...selectedTargets, target];

//     setSelectedTargets(updatedTargets);
//     setFormData((prev) => ({
//       ...prev,
//       targetIds: updatedTargets.map((t) => t.id),
//     }));
//     if (formErrors.targetIds)
//       setFormErrors((prev) => ({ ...prev, targetIds: null }));
//   };

//   const removeTarget = (targetId) => {
//     const updatedTargets = selectedTargets.filter((t) => t.id !== targetId);
//     setSelectedTargets(updatedTargets);
//     setFormData((prev) => ({
//       ...prev,
//       targetIds: updatedTargets.map((t) => t.id),
//     }));
//   };

//   const validateForm = () => {
//     const errors = {};

//     if (!formData.title.trim()) errors.title = "Title is required";

//     if (!formData.eventDate) {
//       errors.eventDate = "Event Date is required";
//     } else if (new Date(formData.eventDate) < new Date()) {
//       errors.eventDate = "Event date must be in the future";
//     }

//     if (!formData.venue.trim()) errors.venue = "Venue is required";

//     if (!formData.enrollmentDeadline) {
//       errors.enrollmentDeadline = "Enrollment Deadline is required";
//     } else {
//       const deadlineDate = new Date(formData.enrollmentDeadline);
//       const eventDate = new Date(formData.eventDate);
//       if (deadlineDate < new Date()) {
//         errors.enrollmentDeadline = "Deadline must be in the future";
//       } else if (deadlineDate >= eventDate) {
//         errors.enrollmentDeadline = "Deadline must be before the event date";
//       }
//     }

//     if (!formData.contactEmail.trim()) {
//       errors.contactEmail = "Contact email is required";
//     } else if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) {
//       errors.contactEmail = "Please enter a valid email address";
//     }

//     if (formData.target !== "GLOBAL" && formData.targetIds.length === 0) {
//       errors.targetIds = `Please select at least one ${formData.target.toLowerCase()}`;
//     }

//     if (formData.maxEnrollments && parseInt(formData.maxEnrollments) < 1) {
//       errors.maxEnrollments = "Max enrollments must be at least 1";
//     }

//     if (enableAttendance) {
//       if (!formData.latitude || !formData.longitude)
//         errors.location = "Please select a location on the map";
//       if (!formData.attendanceWindowStart || !formData.attendanceWindowEnd)
//         errors.attendanceWindow = "Attendance window is required";
//       if (formData.radiusInMeters < 10 || formData.radiusInMeters > 1000)
//         errors.radius = "Radius must be between 10 and 1000 meters";
//     }

//     setFormErrors(errors);
//     return Object.keys(errors).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!validateForm()) {
//       setMessage({ text: "Please fill all required fields", type: "error" });
//       return;
//     }

//     setLoading(true);
//     setMessage({ text: "", type: "" });

//     const eventData = {
//       title: formData.title,
//       description: formData.description || null,
//       speakerName: formData.speakerName || null,
//       eventDate: formData.eventDate,
//       organizer: formData.organizer,
//       eventCreator: formData.eventCreator,
//       venue: formData.venue,
//       maxEnrollments: formData.maxEnrollments
//         ? parseInt(formData.maxEnrollments)
//         : null,
//       currEnrollments: 0,
//       target: formData.target,
//       targetIds: formData.target === "GLOBAL" ? [] : formData.targetIds,
//       isCompleted: false,
//       enrollmentDeadline: formData.enrollmentDeadline,
//       enrollmentStatus: "OPEN",
//       contactEmail: formData.contactEmail,

//       ...(enableAttendance && {
//         latitude: parseFloat(formData.latitude),
//         longitude: parseFloat(formData.longitude),
//         radiusInMeters: parseInt(formData.radiusInMeters),
//         attendanceWindowStart: formData.attendanceWindowStart,
//         attendanceWindowEnd: formData.attendanceWindowEnd,
//         qrRefreshIntervalSeconds: parseInt(formData.qrRefreshIntervalSeconds),
//         attendanceEnabled: true,
//         attendanceActive: false,
//       }),
//     };

//     try {
//       const response = await axios.post(
//         "http://localhost:8080/api/events/create",
//         eventData,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         },
//       );

//       if (response.data.success) {
//         setMessage({ text: "Event created successfully!", type: "success" });
//         setTimeout(() => navigate(-1), 1500);
//       } else {
//         setMessage({
//           text: response.data.message || "Failed to create event",
//           type: "error",
//         });
//       }
//     } catch (error) {
//       console.error("Error creating event:", error);
//       setMessage({
//         text: error.response?.data?.message || "Error creating event",
//         type: "error",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getCurrentDateTime = () => {
//     const now = new Date();
//     now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
//     return now.toISOString().slice(0, 16);
//   };

//   const getMinDateTime = () => {
//     const now = new Date();
//     now.setHours(now.getHours() + 1);
//     now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
//     return now.toISOString().slice(0, 16);
//   };

// const getTargetOptions = () => {
//   if (formData.target === "CLUB") {
//     return clubs.map(item => ({
//       id: item.clubId || item.id,
//       name: item.name || item.clubName || "Unnamed Club"
//     }));
//   } else if (formData.target === "DEPARTMENT") {
//     return departments.map(item => ({
//       id: item.departmentId, // Use departmentId specifically
//       name: item.name || "Unnamed Department"
//     }));
//   }
//   return [];
// };

//   const targetOptions = getTargetOptions();

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center h-16">
//             <button
//               onClick={() => navigate(-1)}
//               className="flex items-center gap-2 text-gray-600 hover:text-gray-900 cursor-pointer"
//             >
//               <ChevronLeft className="w-5 h-5" />
//               <span>Back</span>
//             </button>
//             <div className="flex items-center gap-2">
//               <CalendarPlus className="w-5 h-5" style={{ color: "#4CA1AF" }} />
//               <span className="font-semibold text-gray-900">
//                 Create New Event
//               </span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//           {/* Form Header */}
//           <div
//             className="px-8 py-6 border-b border-gray-200"
//             style={{
//               background:
//                 "linear-gradient(to right, rgba(76, 161, 175, 0.1), rgba(49, 81, 105, 0.1))",
//             }}
//           >
//             <h1 className="text-2xl font-semibold text-gray-900">
//               Event Details
//             </h1>
//             <p className="text-sm text-gray-600 mt-1">
//               Fill in the information below to create your event
//             </p>
//             {preSelectedClubName && (
//               <p className="text-sm mt-2" style={{ color: "#4CA1AF" }}>
//                 Creating event for:{" "}
//                 <span className="font-semibold">{preSelectedClubName}</span>
//               </p>
//             )}
//           </div>

//           {/* Status Message */}
//           {message.text && (
//             <div
//               className={`mx-8 mt-6 p-4 rounded-lg flex items-center gap-2 ${
//                 message.type === "error"
//                   ? "bg-red-50 text-red-700 border border-red-200"
//                   : "bg-green-50 text-green-700 border border-green-200"
//               }`}
//             >
//               {message.type === "error" ? (
//                 <AlertCircle className="w-5 h-5" />
//               ) : (
//                 <CheckCircle className="w-5 h-5" />
//               )}
//               <span className="text-sm font-medium">{message.text}</span>
//             </div>
//           )}

//           <form onSubmit={handleSubmit} className="p-8 space-y-8">
//             {/* Row 1: Title & Speaker */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Event Title <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="title"
//                   value={formData.title}
//                   onChange={handleInputChange}
//                   placeholder="e.g., Annual Tech Symposium"
//                   className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent transition-colors cursor-text ${
//                     formErrors.title
//                       ? "border-red-300 bg-red-50"
//                       : "border-gray-300"
//                   }`}
//                 />
//                 {formErrors.title && (
//                   <p className="mt-1 text-xs text-red-600">
//                     {formErrors.title}
//                   </p>
//                 )}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Speaker Name
//                 </label>
//                 <input
//                   type="text"
//                   name="speakerName"
//                   value={formData.speakerName}
//                   onChange={handleInputChange}
//                   placeholder="e.g., Dr. John Smith"
//                   className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors cursor-text"
//                 />
//               </div>
//             </div>

//             {/* Row 2: Description */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Description
//               </label>
//               <textarea
//                 name="description"
//                 value={formData.description}
//                 onChange={handleInputChange}
//                 rows="3"
//                 placeholder="Provide a detailed description of your event..."
//                 className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors resize-none cursor-text"
//               />
//             </div>

//             {/* Row 3: Event Date & Enrollment Deadline */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Event Date & Time <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                   <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                   <input
//                     type="datetime-local"
//                     name="eventDate"
//                     value={formData.eventDate}
//                     onChange={handleInputChange}
//                     min={getMinDateTime()}
//                     className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent transition-colors cursor-pointer ${
//                       formErrors.eventDate
//                         ? "border-red-300 bg-red-50"
//                         : "border-gray-300"
//                     }`}
//                   />
//                 </div>
//                 {formErrors.eventDate && (
//                   <p className="mt-1 text-xs text-red-600">
//                     {formErrors.eventDate}
//                   </p>
//                 )}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Enrollment Deadline <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                   <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                   <input
//                     type="datetime-local"
//                     name="enrollmentDeadline"
//                     value={formData.enrollmentDeadline}
//                     onChange={handleInputChange}
//                     min={getCurrentDateTime()}
//                     max={formData.eventDate}
//                     className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent transition-colors cursor-pointer ${
//                       formErrors.enrollmentDeadline
//                         ? "border-red-300 bg-red-50"
//                         : "border-gray-300"
//                     }`}
//                   />
//                 </div>
//                 {formErrors.enrollmentDeadline && (
//                   <p className="mt-1 text-xs text-red-600">
//                     {formErrors.enrollmentDeadline}
//                   </p>
//                 )}
//               </div>
//             </div>

//             {/* Row 4: Venue & Max Enrollments */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Venue <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                   <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                   <input
//                     type="text"
//                     name="venue"
//                     value={formData.venue}
//                     onChange={handleInputChange}
//                     placeholder="e.g., Main Auditorium"
//                     className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent transition-colors cursor-text ${
//                       formErrors.venue
//                         ? "border-red-300 bg-red-50"
//                         : "border-gray-300"
//                     }`}
//                   />
//                 </div>
//                 {formErrors.venue && (
//                   <p className="mt-1 text-xs text-red-600">
//                     {formErrors.venue}
//                   </p>
//                 )}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Maximum Enrollments
//                 </label>
//                 <input
//                   type="number"
//                   name="maxEnrollments"
//                   value={formData.maxEnrollments}
//                   onChange={handleInputChange}
//                   placeholder="Unlimited"
//                   min="1"
//                   className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent transition-colors cursor-text ${
//                     formErrors.maxEnrollments
//                       ? "border-red-300 bg-red-50"
//                       : "border-gray-300"
//                   }`}
//                 />
//                 {formErrors.maxEnrollments && (
//                   <p className="mt-1 text-xs text-red-600">
//                     {formErrors.maxEnrollments}
//                   </p>
//                 )}
//               </div>
//             </div>

//             {/* Row 5: Contact Email */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Contact Email <span className="text-red-500">*</span>
//               </label>
//               <div className="relative">
//                 <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                 <input
//                   type="email"
//                   name="contactEmail"
//                   value={formData.contactEmail}
//                   onChange={handleInputChange}
//                   placeholder="e.g., organizer@college.edu"
//                   className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent transition-colors cursor-text ${
//                     formErrors.contactEmail
//                       ? "border-red-300 bg-red-50"
//                       : "border-gray-300"
//                   }`}
//                 />
//               </div>
//               {formErrors.contactEmail && (
//                 <p className="mt-1 text-xs text-red-600">
//                   {formErrors.contactEmail}
//                 </p>
//               )}
//             </div>

//             {/* Row 6: Target Audience */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-3">
//                 Target Audience <span className="text-red-500">*</span>
//               </label>
//               <div className="flex flex-wrap gap-3">
//                 <button
//                   type="button"
//                   onClick={() => handleTargetTypeChange("GLOBAL")}
//                   className={`px-5 py-2.5 rounded-lg border transition-colors flex items-center gap-2 cursor-pointer ${
//                     formData.target === "GLOBAL"
//                       ? "border-[#4CA1AF] text-[#4CA1AF]"
//                       : "border-gray-300 hover:border-[#4CA1AF] hover:bg-[#4CA1AF]/5"
//                   }`}
//                   style={
//                     formData.target === "GLOBAL"
//                       ? { backgroundColor: "rgba(76, 161, 175, 0.1)" }
//                       : {}
//                   }
//                 >
//                   <Globe className="w-4 h-4" />
//                   <span className="font-medium">Global (Everyone)</span>
//                   {formData.target === "GLOBAL" && (
//                     <Check
//                       className="w-4 h-4 ml-1"
//                       style={{ color: "#4CA1AF" }}
//                     />
//                   )}
//                 </button>

//                 <button
//                   type="button"
//                   onClick={() => handleTargetTypeChange("CLUB")}
//                   className={`px-5 py-2.5 rounded-lg border transition-colors flex items-center gap-2 cursor-pointer ${
//                     formData.target === "CLUB"
//                       ? "border-[#4CA1AF] text-[#4CA1AF]"
//                       : "border-gray-300 hover:border-[#4CA1AF] hover:bg-[#4CA1AF]/5"
//                   }`}
//                   style={
//                     formData.target === "CLUB"
//                       ? { backgroundColor: "rgba(76, 161, 175, 0.1)" }
//                       : {}
//                   }
//                 >
//                   <Users className="w-4 h-4" />
//                   <span className="font-medium">Specific Clubs</span>
//                   {formData.target === "CLUB" && (
//                     <Check
//                       className="w-4 h-4 ml-1"
//                       style={{ color: "#4CA1AF" }}
//                     />
//                   )}
//                 </button>

//                   <button
//                     type="button"
//                     onClick={() => handleTargetTypeChange("DEPARTMENT")}
//                     className={`px-5 py-2.5 rounded-lg border transition-colors flex items-center gap-2 cursor-pointer ${
//                       formData.target === "DEPARTMENT"
//                         ? "border-[#4CA1AF] text-[#4CA1AF]"
//                         : "border-gray-300 hover:border-[#4CA1AF] hover:bg-[#4CA1AF]/5"
//                     }`}
//                     style={
//                       formData.target === "DEPARTMENT"
//                         ? { backgroundColor: "rgba(76, 161, 175, 0.1)" }
//                         : {}
//                     }
//                   >
//                     <Building2 className="w-4 h-4" />
//                     <span className="font-medium">Specific Departments</span>
//                     {formData.target === "DEPARTMENT" && (
//                       <Check
//                         className="w-4 h-4 ml-1"
//                         style={{ color: "#4CA1AF" }}
//                       />
//                     )}
//                   </button>
//               </div>
//             </div>

//             {/* Row 7: Target Selection */}
//             {formData.target !== "GLOBAL" && (
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Select {formData.target === "CLUB" ? "Clubs" : "Departments"}{" "}
//                   <span className="text-red-500">*</span>
//                 </label>

//                 {selectedTargets.length > 0 && (
//                   <div className="mb-3 flex flex-wrap gap-2">
//                     {selectedTargets.map((target) => (
//                       <span
//                         key={target.id}
//                         className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm"
//                         style={{
//                           backgroundColor: "rgba(76, 161, 175, 0.1)",
//                           color: "#4CA1AF",
//                         }}
//                       >
//                         {target.name}
//                         <button
//                           type="button"
//                           onClick={() => removeTarget(target.id)}
//                           className="hover:opacity-80 cursor-pointer"
//                           style={{ color: "#4CA1AF" }}
//                         >
//                           <X size={14} />
//                         </button>
//                       </span>
//                     ))}
//                   </div>
//                 )}

//                 {loadingOptions ? (
//                   <div className="flex items-center justify-center py-8 text-gray-500">
//                     <Loader
//                       className="w-5 h-5 animate-spin mr-2"
//                       style={{ color: "#4CA1AF" }}
//                     />
//                     <span>Loading...</span>
//                   </div>
//                 ) : (
//                   <div className="border border-gray-200 rounded-lg overflow-hidden">
//                     <div className="max-h-60 overflow-y-auto">
//                       {targetOptions.length > 0 ? (
//                         targetOptions.map((item) => {
//                           const isSelected = selectedTargets.some(
//                             (t) => t.id === item.id,
//                           );
//                           return (
//                             <div
//                               key={item.id}
//                               onClick={() => toggleTargetSelection(item)}
//                               className="flex items-center justify-between px-4 py-3 border-b border-gray-100 last:border-0 cursor-pointer transition-colors"
//                               style={
//                                 isSelected
//                                   ? {
//                                       backgroundColor:
//                                         "rgba(76, 161, 175, 0.1)",
//                                     }
//                                   : {}
//                               }
//                             >
//                               <span className="text-sm font-medium text-gray-700">
//                                 {item.name}
//                               </span>
//                               {isSelected && (
//                                 <Check
//                                   className="w-4 h-4"
//                                   style={{ color: "#4CA1AF" }}
//                                 />
//                               )}
//                             </div>
//                           );
//                         })
//                       ) : (
//                         <div className="px-4 py-8 text-center text-gray-400">
//                           No{" "}
//                           {formData.target === "CLUB" ? "clubs" : "departments"}{" "}
//                           available
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 )}

//                 {formErrors.targetIds && (
//                   <p className="mt-2 text-xs text-red-600">
//                     {formErrors.targetIds}
//                   </p>
//                 )}
//               </div>
//             )}

//             {/* Row 8: Attendance Tracking Toggle */}
//             <div className="border-t border-gray-200 pt-6">
//               <label className="flex items-center gap-3 cursor-pointer">
//                 <div className="relative">
//                   <input
//                     type="checkbox"
//                     checked={enableAttendance}
//                     onChange={(e) => {
//                       setEnableAttendance(e.target.checked);
//                       if (!e.target.checked && mapRef.current) {
//                         mapRef.current.remove();
//                         mapRef.current = null;
//                         markerRef.current = null;
//                         circleRef.current = null;
//                         mapInitializedRef.current = false;
//                       }
//                     }}
//                     className="sr-only"
//                   />
//                   <div
//                     className={`w-10 h-6 rounded-full transition-colors ${
//                       enableAttendance ? "bg-[#4CA1AF]" : "bg-gray-300"
//                     }`}
//                   >
//                     <div
//                       className={`w-4 h-4 rounded-full bg-white transform transition-transform absolute top-1 ${
//                         enableAttendance ? "translate-x-5" : "translate-x-1"
//                       }`}
//                     />
//                   </div>
//                 </div>
//                 <span className="text-sm font-medium text-gray-700">
//                   Enable Attendance Tracking with Geofencing
//                 </span>
//               </label>
//               <p className="mt-1 text-xs text-gray-500 ml-13">
//                 Set up location-based attendance using map selection
//               </p>
//             </div>

//             {/* Row 9: Map and Attendance Fields */}
//             {enableAttendance && (
//               <div className="space-y-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
//                 <h3 className="text-sm font-semibold text-gray-900">
//                   📍 Select Event Location on Map
//                 </h3>

//                 {/* Map Controls */}
//                 <div className="flex gap-3 mb-4">
//                   <div className="flex-1 relative">
//                     <input
//                       type="text"
//                       value={searchQuery}
//                       onChange={(e) => setSearchQuery(e.target.value)}
//                       onKeyPress={(e) => e.key === "Enter" && searchLocation()}
//                       placeholder="Search for a location (e.g. Bharati Vidyapeeth, Pune)..."
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent cursor-text"
//                     />
//                   </div>
//                   <button
//                     type="button"
//                     onClick={searchLocation}
//                     disabled={searchingLocation}
//                     className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-60"
//                     style={{
//                       background: "linear-gradient(135deg, #4CA1AF, #315169)",
//                     }}
//                   >
//                     {searchingLocation ? (
//                       <Loader className="w-4 h-4 animate-spin" />
//                     ) : (
//                       <MapIcon className="w-4 h-4" />
//                     )}
//                     Search
//                   </button>
//                   <button
//                     type="button"
//                     onClick={getCurrentLocation}
//                     className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors flex items-center gap-2 cursor-pointer"
//                     style={{
//                       background: "linear-gradient(135deg, #4CA1AF, #315169)",
//                     }}
//                   >
//                     <Crosshair className="w-4 h-4" />
//                     My Location
//                   </button>
//                 </div>

//                 {/* Map Container */}
//                 <div
//                   ref={mapContainerRef}
//                   className="w-full rounded-lg border-2 border-gray-300 z-0"
//                   style={{ height: "400px" }}
//                 />

//                 {/* Coordinates Display */}
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
//                   <div>
//                     <label className="block text-xs font-medium text-gray-700 mb-1">
//                       Latitude
//                     </label>
//                     <input
//                       type="text"
//                       value={formData.latitude}
//                       readOnly
//                       className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm font-mono cursor-default"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-xs font-medium text-gray-700 mb-1">
//                       Longitude
//                     </label>
//                     <input
//                       type="text"
//                       value={formData.longitude}
//                       readOnly
//                       className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm font-mono cursor-default"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-xs font-medium text-gray-700 mb-1">
//                       Radius (meters)
//                     </label>
//                     <input
//                       type="number"
//                       name="radiusInMeters"
//                       value={formData.radiusInMeters}
//                       onChange={handleInputChange}
//                       min="10"
//                       max="1000"
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:border-transparent cursor-text"
//                     />
//                   </div>
//                 </div>
//                 {formErrors.radius && (
//                   <p className="text-xs text-red-600">{formErrors.radius}</p>
//                 )}

//                 {/* Attendance Window */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-xs font-medium text-gray-700 mb-1">
//                       Attendance Window Start
//                     </label>
//                     <input
//                       type="datetime-local"
//                       name="attendanceWindowStart"
//                       value={formData.attendanceWindowStart}
//                       onChange={handleInputChange}
//                       min={formData.eventDate}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:border-transparent cursor-pointer"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-xs font-medium text-gray-700 mb-1">
//                       Attendance Window End
//                     </label>
//                     <input
//                       type="datetime-local"
//                       name="attendanceWindowEnd"
//                       value={formData.attendanceWindowEnd}
//                       onChange={handleInputChange}
//                       min={formData.attendanceWindowStart || formData.eventDate}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:border-transparent cursor-pointer"
//                     />
//                   </div>
//                 </div>
//                 {formErrors.attendanceWindow && (
//                   <p className="text-xs text-red-600">
//                     {formErrors.attendanceWindow}
//                   </p>
//                 )}

//                 {/* QR Settings */}
//                 <div>
//                   <label className="block text-xs font-medium text-gray-700 mb-1">
//                     QR Refresh Interval (seconds)
//                   </label>
//                   <input
//                     type="number"
//                     name="qrRefreshIntervalSeconds"
//                     value={formData.qrRefreshIntervalSeconds}
//                     onChange={handleInputChange}
//                     min="30"
//                     max="300"
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:border-transparent cursor-text"
//                   />
//                   <p className="mt-1 text-xs text-gray-500">
//                     Default: 120 seconds (2 minutes)
//                   </p>
//                 </div>

//                 {/* Map Instructions */}
//                 <div
//                   className="rounded-lg p-3"
//                   style={{
//                     backgroundColor: "rgba(76, 161, 175, 0.1)",
//                     borderColor: "#4CA1AF",
//                     borderWidth: "1px",
//                   }}
//                 >
//                   <p
//                     className="text-xs flex items-center gap-2"
//                     style={{ color: "#4CA1AF" }}
//                   >
//                     <Layers className="w-4 h-4" />
//                     <span>
//                       Click on the map to set the event location. Drag the
//                       marker to adjust. The circle shows the geofencing radius.
//                     </span>
//                   </p>
//                 </div>
//                 {formErrors.location && (
//                   <p className="text-xs text-red-600">{formErrors.location}</p>
//                 )}
//               </div>
//             )}

//             {/* Form Actions */}
//             <div className="flex gap-4 pt-6 border-t border-gray-200">
//               <button
//                 type="button"
//                 onClick={() => navigate(-1)}
//                 className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors cursor-pointer"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="flex-1 px-4 py-3 text-white rounded-lg font-medium hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
//                 style={{
//                   background: "linear-gradient(135deg, #4CA1AF, #315169)",
//                 }}
//               >
//                 {loading ? (
//                   <>
//                     <Loader className="w-4 h-4 animate-spin" />
//                     Creating Event...
//                   </>
//                 ) : (
//                   <>
//                     <CalendarPlus className="w-4 h-4" />
//                     Create Event
//                   </>
//                 )}
//               </button>
//             </div>

//             <p className="text-xs text-gray-400 text-center">
//               Fields marked with <span className="text-red-500">*</span> are
//               required
//             </p>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }
