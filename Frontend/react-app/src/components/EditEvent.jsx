import { useState, useEffect, useRef } from "react";
import axios from "axios";
import CustomSelect from "./CustomSelect";
import {
  X, Edit, Loader2, AlertCircle, CheckCircle,
  Calendar, Clock, MapPin, Users, Building2,
  Globe, Check, Map as MapIcon, Crosshair, Layers,
} from "lucide-react";

import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:       "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const BASE_URL = import.meta.env.VITE_API_URL || "http://72.155.88.211:8080";

/**
 * EditEvent — reusable modal for editing any event.
 *
 * Props:
 *   event      — the event object to edit (from the card)
 *   token      — JWT bearer token
 *   onClose    — called when the modal should close (no save)
 *   onSuccess  — called after a successful update
 */
export default function EditEvent({ event, token, onClose, onSuccess }) {
  // ── Helpers ────────────────────────────────────────────────────────────────
  // Preserve the local time from the backend string instead of converting to UTC.
  const fmt = (d) => {
    if (!d) return "";
    // If already an ISO-like string (e.g. "2026-03-07T15:00:00"), slice directly
    if (typeof d === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(d)) return d.slice(0, 16);
    // Fallback: format using local time components
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return "";
    const pad = (n) => String(n).padStart(2, "0");
    return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
  };
  const authHeaders = () => ({
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  });

  // ── Map refs ───────────────────────────────────────────────────────────────
  const mapRef            = useRef(null);
  const markerRef         = useRef(null);
  const circleRef         = useRef(null);
  const mapContainerRef   = useRef(null);
  const mapInitializedRef = useRef(false);

  // ── Form state seeded from the event prop ──────────────────────────────────
  const [formData, setFormData] = useState({
    title:                    event.title                 || "",
    description:              event.description           || "",
    speakerName:              event.speakerName           || "",
    organizer:                event.organizer             || "",
    venue:                    event.venue                 || "",
    maxEnrollments:           event.maxEnrollments        || "",
    dateTime:                 fmt(event.dateTime),
    enrollmentDeadline:       fmt(event.enrollmentDeadline),
    targetType:               event.targetType            || "GLOBAL",
    targetIds:                event.targetIds             || [],
    // Attendance / location
    latitude:                 event.latitude  != null ? String(event.latitude)  : "18.5204",
    longitude:                event.longitude != null ? String(event.longitude) : "73.8567",
    radiusInMeters:           event.radiusInMeters        ?? 50,
    attendanceWindowStart:    fmt(event.attendanceWindowStart),
    attendanceWindowEnd:      fmt(event.attendanceWindowEnd),
    qrRefreshIntervalSeconds: event.qrRefreshIntervalSeconds ?? event.qrRefreshInterval ?? 120,
  });

  // ── UI state ───────────────────────────────────────────────────────────────
  const [loading,           setLoading]           = useState(false);
  const [error,             setError]             = useState(null);
  const [clubs,             setClubs]             = useState([]);
  const [departments,       setDepartments]       = useState([]);
  const [loadingOptions,    setLoadingOptions]    = useState(false);
  const [selectedTargets,   setSelectedTargets]   = useState([]);
  const [formErrors,        setFormErrors]        = useState({});
  const [showMap,           setShowMap]           = useState(
    event.latitude != null && event.longitude != null
  );
  const [searchQuery,       setSearchQuery]       = useState("");
  const [searchingLocation, setSearchingLocation] = useState(false);
  const [searchMessage,     setSearchMessage]     = useState({ text: "", type: "" });

  // ── Fetch clubs + departments ──────────────────────────────────────────────
  useEffect(() => {
    const fetchOptions = async () => {
      setLoadingOptions(true);
      try {
        const [clubsRes, deptRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/clubs`,      { headers: authHeaders() }),
          axios.get(`${BASE_URL}/api/department`, { headers: authHeaders() }),
        ]);
        setClubs(
          clubsRes.data?.data ?? (Array.isArray(clubsRes.data) ? clubsRes.data : [])
        );
        const allDepts = deptRes.data?.data ?? (Array.isArray(deptRes.data) ? deptRes.data : []);
        setDepartments(allDepts.filter((d) => d.active !== false));
      } catch (e) {
        console.error("Error loading clubs/departments", e);
      } finally {
        setLoadingOptions(false);
      }
    };
    fetchOptions();
  }, []);

  // ── Pre-populate selectedTargets when clubs/depts load ────────────────────
  useEffect(() => {
    if (!event.targetIds?.length) return;
    if (formData.targetType === "CLUB" && clubs.length) {
      setSelectedTargets(
        clubs
          .filter((c) => event.targetIds.includes(c.clubId ?? c.id))
          .map((c) => ({ id: c.clubId ?? c.id, name: c.clubName ?? c.name }))
      );
    } else if (formData.targetType === "DEPARTMENT" && departments.length) {
      setSelectedTargets(
        departments
          .filter((d) => event.targetIds.includes(d.departmentId))
          .map((d) => ({ id: d.departmentId, name: d.name }))
      );
    }
  }, [clubs, departments]);

  // ── Map init / teardown ───────────────────────────────────────────────────
  useEffect(() => {
    if (showMap && mapContainerRef.current && !mapInitializedRef.current) {
      requestAnimationFrame(initializeMap);
    }
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current        = null;
        markerRef.current     = null;
        circleRef.current     = null;
        mapInitializedRef.current = false;
      }
    };
  }, [showMap]);

  const initializeMap = () => {
    if (!mapContainerRef.current || mapInitializedRef.current) return;

    const lat = parseFloat(formData.latitude) || 18.5204;
    const lng = parseFloat(formData.longitude) || 73.8567;

    try {
      mapRef.current = L.map(mapContainerRef.current).setView([lat, lng], 15);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(mapRef.current);

      markerRef.current = L.marker([lat, lng], { draggable: true, autoPan: true })
        .addTo(mapRef.current);

      circleRef.current = L.circle([lat, lng], {
        radius:      parseInt(formData.radiusInMeters) || 50,
        color:       "#4CA1AF",
        fillColor:   "#4CA1AF",
        fillOpacity: 0.2,
        weight:      2,
      }).addTo(mapRef.current);

      // Drag marker
      markerRef.current.on("dragend", (e) => {
        const { lat: la, lng: ln } = e.target.getLatLng();
        updateCoordinates(la, ln);
        circleRef.current?.setLatLng([la, ln]);
      });

      // Click on map
      mapRef.current.on("click", (e) => {
        const { lat: la, lng: ln } = e.latlng;
        markerRef.current?.setLatLng([la, ln]);
        circleRef.current?.setLatLng([la, ln]);
        updateCoordinates(la, ln);
      });

      setTimeout(() => mapRef.current?.invalidateSize(), 100);
      mapInitializedRef.current = true;
    } catch (err) {
      console.error("Map init error:", err);
    }
  };

  const updateCoordinates = (lat, lng) => {
    setFormData((prev) => ({
      ...prev,
      latitude:  lat.toFixed(6),
      longitude: lng.toFixed(6),
    }));
  };

  // Update circle when radius changes
  useEffect(() => {
    if (circleRef.current && formData.radiusInMeters) {
      circleRef.current.setRadius(parseInt(formData.radiusInMeters));
    }
  }, [formData.radiusInMeters]);

  // Handle resize
  useEffect(() => {
    const onResize = () => { if (mapRef.current && showMap) mapRef.current.invalidateSize(); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [showMap]);

  // ── Location search (Photon — CORS-safe, native fetch) ───────────────────
  const searchLocation = async () => {
    if (!searchQuery.trim()) return;
    try {
      setSearchingLocation(true);
      setSearchMessage({ text: "Searching location...", type: "success" });

      const res = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(searchQuery)}&limit=1`
      );

      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);

      const data = await res.json();

      if (data?.features?.length > 0) {
        const [lon, lat] = data.features[0].geometry.coordinates;
        const la = parseFloat(lat);
        const ln = parseFloat(lon);

        if (mapRef.current) {
          mapRef.current.setView([la, ln], 16);
          markerRef.current?.setLatLng([la, ln]);
          circleRef.current?.setLatLng([la, ln]);
        }
        updateCoordinates(la, ln);
        setSearchMessage({ text: "Location found!", type: "success" });
        setTimeout(() => setSearchMessage({ text: "", type: "" }), 3000);
      } else {
        setSearchMessage({ text: "Location not found. Try a different search term.", type: "error" });
      }
    } catch (e) {
      console.error("Error searching location:", e);
      setSearchMessage({ text: "Error searching location. Please try again.", type: "error" });
    } finally {
      setSearchingLocation(false);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setSearchMessage({ text: "Geolocation is not supported by your browser", type: "error" });
      return;
    }

    setSearchMessage({ text: "Getting your location...", type: "success" });

    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude: la, longitude: ln } }) => {
        if (mapRef.current) {
          mapRef.current.setView([la, ln], 16);
          markerRef.current?.setLatLng([la, ln]);
          circleRef.current?.setLatLng([la, ln]);
        }
        updateCoordinates(la, ln);
        setSearchMessage({ text: "Location captured!", type: "success" });
        setTimeout(() => setSearchMessage({ text: "", type: "" }), 3000);
      },
      (err) => {
        const msgs = {
          1: "Permission denied — please allow location access in your browser settings and refresh.",
          2: "Position unavailable — your device couldn't determine location.",
          3: "Request timed out — try again.",
        };
        setSearchMessage({ text: msgs[err.code] || "Unknown location error.", type: "error" });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // ── Target helpers ─────────────────────────────────────────────────────────
  const getTargetOptions = () => {
    if (formData.targetType === "CLUB")
      return clubs.map((c) => ({ id: c.clubId ?? c.id, name: c.clubName ?? c.name ?? "Unnamed" }));
    if (formData.targetType === "DEPARTMENT")
      return departments.map((d) => ({ id: d.departmentId, name: d.name ?? "Unnamed" }));
    return [];
  };

  const handleTargetTypeChange = (type) => {
    setFormData((prev) => ({ ...prev, targetType: type, targetIds: [] }));
    setSelectedTargets([]);
  };

  const toggleTarget = (target) => {
    const exists  = selectedTargets.some((t) => t.id === target.id);
    const updated = exists
      ? selectedTargets.filter((t) => t.id !== target.id)
      : [...selectedTargets, target];
    setSelectedTargets(updated);
    setFormData((prev) => ({ ...prev, targetIds: updated.map((t) => t.id) }));
  };

  // ── Input change ───────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? "" : Number(value)) : value,
    }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: null }));
  };

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = () => {
    const errors = {};
    if (!formData.title.trim())       errors.title       = "Title is required";
    if (!formData.organizer.trim())   errors.organizer   = "Organizer is required";
    if (!formData.venue.trim())       errors.venue       = "Venue is required";
    if (!formData.dateTime)           errors.dateTime    = "Event date is required";
    if (!formData.enrollmentDeadline) {
      errors.enrollmentDeadline = "Deadline is required";
    } else if (new Date(formData.enrollmentDeadline) >= new Date(formData.dateTime)) {
      errors.enrollmentDeadline = "Deadline must be before event date";
    }
    if (formData.targetType !== "GLOBAL" && formData.targetIds.length === 0)
      errors.targetIds = `Select at least one ${formData.targetType.toLowerCase()}`;
    if (showMap) {
      if (!formData.latitude || !formData.longitude)
        errors.location = "Select a location on the map";
      if (formData.radiusInMeters < 10 || formData.radiusInMeters > 1000)
        errors.radius = "Radius must be between 10 and 1000 meters";
      if (
        formData.attendanceWindowStart &&
        formData.attendanceWindowEnd &&
        new Date(formData.attendanceWindowStart) >= new Date(formData.attendanceWindowEnd)
      ) errors.attendanceWindow = "Window start must be before window end";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError(null);

    const payload = {
      title:              formData.title,
      description:        formData.description        || null,
      speakerName:        formData.speakerName        || null,
      organizer:          formData.organizer,
      venue:              formData.venue,
      maxEnrollments:     formData.maxEnrollments ? parseInt(formData.maxEnrollments) : null,
      eventDate:          formData.dateTime,
      enrollmentDeadline: formData.enrollmentDeadline,
      target:             formData.targetType,
      targetIds:          formData.targetType === "GLOBAL" ? [] : formData.targetIds,
      ...(showMap && {
        latitude:                 parseFloat(formData.latitude),
        longitude:                parseFloat(formData.longitude),
        radiusInMeters:           parseInt(formData.radiusInMeters),
        attendanceWindowStart:    formData.attendanceWindowStart || null,
        attendanceWindowEnd:      formData.attendanceWindowEnd   || null,
        qrRefreshInterval:        parseInt(formData.qrRefreshIntervalSeconds),
      }),
    };

    try {
      const res = await axios.put(
        `${BASE_URL}/api/events/updateEvent/${event.eventId}`,
        payload,
        { headers: authHeaders() }
      );
      if (res.data?.success) {
        onSuccess?.();
        onClose();
      } else {
        setError(res.data?.message || "Failed to update event");
      }
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred while updating");
    } finally {
      setLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto edit-event-scroll" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>

          <style>{`.edit-event-scroll::-webkit-scrollbar { display: none; }`}</style>

          {/* Header */}
          <div
            className="sticky top-0 border-b border-gray-200 px-6 py-4 rounded-t-2xl z-10 flex items-center justify-between"
            style={{ background: "linear-gradient(135deg, #4CA1AF, #2C3E50)" }}
          >
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Edit className="w-5 h-5" /> Edit Event
            </h2>
            <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">

            {/* Error banner */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* ── Row 1: Title + Speaker ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text" name="title" value={formData.title} onChange={handleChange}
                  placeholder="e.g., Annual Tech Symposium"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#4CA1AF] focus:border-transparent transition-all ${formErrors.title ? "border-red-300 bg-red-50" : "border-gray-300"}`}
                />
                {formErrors.title && <p className="mt-1 text-xs text-red-600">{formErrors.title}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Speaker Name</label>
                <input
                  type="text" name="speakerName" value={formData.speakerName} onChange={handleChange}
                  placeholder="e.g., Dr. John Smith"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA1AF] focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* ── Row 2: Description ── */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description" value={formData.description} onChange={handleChange}
                rows="3" placeholder="Event description..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA1AF] focus:border-transparent transition-all resize-none"
              />
            </div>

            {/* ── Row 3: Date + Deadline ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Date & Time <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "#4CA1AF" }} />
                  <input
                    type="datetime-local" name="dateTime" value={formData.dateTime} onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#4CA1AF] focus:border-transparent transition-all ${formErrors.dateTime ? "border-red-300 bg-red-50" : "border-gray-300"}`}
                  />
                </div>
                {formErrors.dateTime && <p className="mt-1 text-xs text-red-600">{formErrors.dateTime}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enrollment Deadline <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "#4CA1AF" }} />
                  <input
                    type="datetime-local" name="enrollmentDeadline" value={formData.enrollmentDeadline}
                    onChange={handleChange} max={formData.dateTime}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#4CA1AF] focus:border-transparent transition-all ${formErrors.enrollmentDeadline ? "border-red-300 bg-red-50" : "border-gray-300"}`}
                  />
                </div>
                {formErrors.enrollmentDeadline && <p className="mt-1 text-xs text-red-600">{formErrors.enrollmentDeadline}</p>}
              </div>
            </div>

            {/* ── Row 4: Venue + Max Enrollments ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Venue <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "#4CA1AF" }} />
                  <input
                    type="text" name="venue" value={formData.venue} onChange={handleChange}
                    placeholder="e.g., Main Auditorium"
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#4CA1AF] focus:border-transparent transition-all ${formErrors.venue ? "border-red-300 bg-red-50" : "border-gray-300"}`}
                  />
                </div>
                {formErrors.venue && <p className="mt-1 text-xs text-red-600">{formErrors.venue}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Enrollments</label>
                <input
                  type="number" name="maxEnrollments" value={formData.maxEnrollments}
                  onChange={handleChange} placeholder="Unlimited" min="1"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA1AF] focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* ── Row 5: Organizer ── */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Organizer <span className="text-red-500">*</span>
              </label>
              <CustomSelect
                name="organizer" value={formData.organizer} onChange={handleChange}
                placeholder="Select organizer..."
                options={[
                  { value: "Global", label: "Global" },
                  ...departments.map((d) => ({ value: d.name, label: `Department: ${d.name}` })),
                  ...clubs.map((c) => ({ value: c.clubName ?? c.name, label: `Club: ${c.clubName ?? c.name}` })),
                ]}
              />
              {formErrors.organizer && <p className="mt-1 text-xs text-red-600">{formErrors.organizer}</p>}
            </div>

            {/* ── Row 6: Target Audience ── */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Target Audience <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-3">
                {[
                  { key: "GLOBAL",     label: "Global (Everyone)",    Icon: Globe     },
                  { key: "CLUB",       label: "Specific Clubs",       Icon: Users     },
                  { key: "DEPARTMENT", label: "Specific Departments", Icon: Building2 },
                ].map(({ key, label, Icon }) => (
                  <button
                    key={key} type="button" onClick={() => handleTargetTypeChange(key)}
                    className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 ${formData.targetType === key ? "border-[#4CA1AF] text-[#4CA1AF]" : "border-gray-300 hover:border-[#4CA1AF]"}`}
                    style={formData.targetType === key ? { backgroundColor: "rgba(76,161,175,0.1)" } : {}}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium text-sm">{label}</span>
                    {formData.targetType === key && <Check className="w-4 h-4 ml-1" style={{ color: "#4CA1AF" }} />}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Row 7: Target selection list ── */}
            {formData.targetType !== "GLOBAL" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select {formData.targetType === "CLUB" ? "Clubs" : "Departments"}{" "}
                  <span className="text-red-500">*</span>
                </label>

                {selectedTargets.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {selectedTargets.map((t) => (
                      <span
                        key={t.id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm"
                        style={{ backgroundColor: "rgba(76,161,175,0.1)", color: "#4CA1AF" }}
                      >
                        {t.name}
                        <button type="button" onClick={() => toggleTarget(t)} className="hover:opacity-80">
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {loadingOptions ? (
                  <div className="flex items-center justify-center py-6 text-gray-400">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" style={{ color: "#4CA1AF" }} />
                    Loading...
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                    {getTargetOptions().map((item) => {
                      const selected = selectedTargets.some((t) => t.id === item.id);
                      return (
                        <div
                          key={item.id} onClick={() => toggleTarget(item)}
                          className="flex items-center justify-between px-4 py-3 border-b border-gray-100 last:border-0 cursor-pointer hover:bg-gray-50 transition-colors"
                          style={selected ? { backgroundColor: "rgba(76,161,175,0.08)" } : {}}
                        >
                          <span className="text-sm font-medium text-gray-700">{item.name}</span>
                          {selected && <Check className="w-4 h-4" style={{ color: "#4CA1AF" }} />}
                        </div>
                      );
                    })}
                  </div>
                )}
                {formErrors.targetIds && <p className="mt-1 text-xs text-red-600">{formErrors.targetIds}</p>}
              </div>
            )}

            {/* ── Row 8: Location / Attendance toggle ── */}
            <div className="border-t border-gray-200 pt-5">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <div className="relative">
                  <input
                    type="checkbox" checked={showMap}
                    onChange={(e) => {
                      setShowMap(e.target.checked);
                      if (!e.target.checked && mapRef.current) {
                        mapRef.current.remove();
                        mapRef.current        = null;
                        markerRef.current     = null;
                        circleRef.current     = null;
                        mapInitializedRef.current = false;
                      }
                    }}
                    className="sr-only"
                  />
                  <div className={`w-10 h-6 rounded-full transition-colors ${showMap ? "bg-[#4CA1AF]" : "bg-gray-300"}`}>
                    <div className={`w-4 h-4 rounded-full bg-white transform transition-transform absolute top-1 ${showMap ? "translate-x-5" : "translate-x-1"}`} />
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {showMap ? "Update Location & Attendance" : "Set / Update Location & Attendance"}
                </span>
              </label>
              <p className="mt-1 text-xs text-gray-500 ml-13">
                Pin the event location and configure geofencing for attendance
              </p>
            </div>

            {/* ── Row 9: Map + attendance fields ── */}
            {showMap && (
              <div className="space-y-5 p-5 bg-gray-50 rounded-xl border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900">📍 Select Event Location on Map</h3>

                {/* Search bar */}
                <div className="flex gap-3">
                  <div className="flex-1">
                    <input
                      type="text" value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && searchLocation()}
                      placeholder="Search for a location (e.g. Bharati Vidyapeeth, Pune)..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA1AF] focus:border-transparent bg-white"
                    />
                  </div>
                  <button
                    type="button" onClick={searchLocation} disabled={searchingLocation}
                    className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition flex items-center gap-2 disabled:opacity-60"
                    style={{ background: "linear-gradient(135deg, #4CA1AF, #315169)" }}
                  >
                    {searchingLocation
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <MapIcon className="w-4 h-4" />}
                    Search
                  </button>
                  <button
                    type="button" onClick={getCurrentLocation}
                    className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition flex items-center gap-2"
                    style={{ background: "linear-gradient(135deg, #4CA1AF, #315169)" }}
                  >
                    <Crosshair className="w-4 h-4" />
                    My Location
                  </button>
                </div>

                {/* Search message */}
                {searchMessage.text && (
                  <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${searchMessage.type === "error" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"}`}>
                    {searchMessage.type === "error"
                      ? <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      : <CheckCircle className="w-4 h-4 flex-shrink-0" />}
                    {searchMessage.text}
                  </div>
                )}

                {/* Map */}
                <div
                  ref={mapContainerRef}
                  className="w-full rounded-lg border-2 border-gray-300 z-0"
                  style={{ height: "400px" }}
                />

                {/* Coordinates (read-only, map-driven) + Radius */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Latitude</label>
                    <input
                      type="text" value={formData.latitude} readOnly
                      className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm font-mono cursor-default"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Longitude</label>
                    <input
                      type="text" value={formData.longitude} readOnly
                      className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm font-mono cursor-default"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Radius (meters)</label>
                    <input
                      type="number" name="radiusInMeters" value={formData.radiusInMeters}
                      onChange={handleChange} min="10" max="1000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#4CA1AF] focus:border-transparent bg-white"
                    />
                  </div>
                </div>
                {formErrors.radius && <p className="text-xs text-red-600">{formErrors.radius}</p>}

                {/* Attendance window */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Attendance Window Start</label>
                    <input
                      type="datetime-local" name="attendanceWindowStart"
                      value={formData.attendanceWindowStart} onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#4CA1AF] focus:border-transparent bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Attendance Window End</label>
                    <input
                      type="datetime-local" name="attendanceWindowEnd"
                      value={formData.attendanceWindowEnd} onChange={handleChange}
                      min={formData.attendanceWindowStart}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#4CA1AF] focus:border-transparent bg-white"
                    />
                  </div>
                </div>
                {formErrors.attendanceWindow && <p className="text-xs text-red-600">{formErrors.attendanceWindow}</p>}

                {/* QR Interval */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">QR Refresh Interval (seconds)</label>
                  <input
                    type="number" name="qrRefreshIntervalSeconds"
                    value={formData.qrRefreshIntervalSeconds} onChange={handleChange}
                    min="30" max="300"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#4CA1AF] focus:border-transparent bg-white"
                  />
                  <p className="mt-1 text-xs text-gray-500">Default: 120 seconds (2 minutes)</p>
                </div>

                {/* Tip */}
                <div
                  className="rounded-lg p-3"
                  style={{ backgroundColor: "rgba(76,161,175,0.1)", border: "1px solid #4CA1AF" }}
                >
                  <p className="text-xs flex items-center gap-2" style={{ color: "#4CA1AF" }}>
                    <Layers className="w-4 h-4 flex-shrink-0" />
                    Click on the map or drag the marker to set the event location.
                    The circle shows the geofencing radius.
                  </p>
                </div>
                {formErrors.location && <p className="text-xs text-red-600">{formErrors.location}</p>}
              </div>
            )}

            {/* ── Actions ── */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button" onClick={onClose}
                className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit" disabled={loading}
                className="px-6 py-2.5 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                style={{ background: "linear-gradient(135deg, #4CA1AF, #2C3E50)" }}
              >
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" />Updating...</>
                  : <><Edit className="w-4 h-4" />Update Event</>}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}