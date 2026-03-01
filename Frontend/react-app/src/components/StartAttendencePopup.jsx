import React, { useState, useEffect } from "react";
import { X, Loader2, AlertCircle, MapPin, Clock } from "lucide-react";
import axios from "axios";

const BASE_URL = "http://localhost:8080";

const StartAttendancePopup = ({ isOpen, onClose, event, onSuccess, token }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [useNow, setUseNow] = useState(false);
  
  // Form state for manual entry
  const [formData, setFormData] = useState({
    latitude: "",
    longitude: "",
    radiusInMeters: 50,
    attendanceWindowStart: "",
    attendanceWindowEnd: ""
  });

  // Check if event has location fields
  const hasLocationFields = () => {
    return event?.latitude && event?.longitude && 
           event?.attendanceWindowStart && event?.attendanceWindowEnd;
  };

  // Initialize form when event changes
  useEffect(() => {
    if (event) {
      setUseNow(!hasLocationFields());
      
      // Pre-fill form with event data if available
      setFormData({
        latitude: event.latitude || "",
        longitude: event.longitude || "",
        radiusInMeters: event.radiusInMeters || 50,
        attendanceWindowStart: event.attendanceWindowStart ? 
          new Date(event.attendanceWindowStart).toISOString().slice(0, 16) : "",
        attendanceWindowEnd: event.attendanceWindowEnd ? 
          new Date(event.attendanceWindowEnd).toISOString().slice(0, 16) : ""
      });
    }
  }, [event]);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? "" : parseFloat(value)) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const authHeaders = { 
        Authorization: `Bearer ${token}`, 
        "Content-Type": "application/json" 
      };

      let url;
      let requestData;

      if (useNow) {
        // Use the /now endpoint with provided data
        url = `${BASE_URL}/api/attendance/start/${event.eventId}`;
        requestData = {
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
          radiusInMeters: parseInt(formData.radiusInMeters) || 50,
          attendanceWindowStart: formData.attendanceWindowStart,
          attendanceWindowEnd: formData.attendanceWindowEnd
        };
      } else {
        // Use the regular endpoint - event already has fields
        url = `${BASE_URL}/api/attendance/start/now/${event.eventId}`;
        requestData = {}; // No body needed as per API spec
      }

      const res = await axios.post(url, requestData, { headers: authHeaders });
      
      if (res.data?.success) {
        // Pass the full response including QR token data
        onSuccess?.(res.data);
        onClose();
      } else {
        setError(res.data?.message || "Failed to start attendance");
      }
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred while starting attendance");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold" style={{ 
                background: "linear-gradient(135deg, #4CA1AF, #2C3E50)", 
                WebkitBackgroundClip: "text", 
                WebkitTextFillColor: "transparent" 
              }}>
                Start Attendance - {event?.title}
              </h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Toggle between using event data or manual entry */}
            {hasLocationFields() && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={useNow}
                    onChange={(e) => setUseNow(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    Override location and time settings (use custom values)
                  </span>
                </label>
                {!useNow && (
                  <p className="mt-2 text-xs text-green-600 flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    Using event's predefined location settings
                  </p>
                )}
              </div>
            )}

            <div className="space-y-4">
              {/* Location Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Latitude * <span className="text-xs text-gray-500">(e.g., 18.5204)</span>
                  </label>
                  <input
                    type="number"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleInputChange}
                    required
                    step="any"
                    placeholder="Enter latitude"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA1AF] focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Longitude * <span className="text-xs text-gray-500">(e.g., 73.8567)</span>
                  </label>
                  <input
                    type="number"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleInputChange}
                    required
                    step="any"
                    placeholder="Enter longitude"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA1AF] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Radius (meters) <span className="text-xs text-gray-500">(default: 50m)</span>
                </label>
                <input
                  type="number"
                  name="radiusInMeters"
                  value={formData.radiusInMeters}
                  onChange={handleInputChange}
                  min="1"
                  placeholder="Enter radius in meters"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA1AF] focus:border-transparent transition-all"
                />
              </div>

              {/* Time Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Window Start Time *
                  </label>
                  <input
                    type="datetime-local"
                    name="attendanceWindowStart"
                    value={formData.attendanceWindowStart}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA1AF] focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Window End Time *
                  </label>
                  <input
                    type="datetime-local"
                    name="attendanceWindowEnd"
                    value={formData.attendanceWindowEnd}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA1AF] focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="text-xs text-gray-600">
                  <p className="font-medium mb-1">About Attendance Start:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Students must be within the specified radius to mark attendance</li>
                    <li>Attendance can only be marked during the specified time window</li>
                    <li>Once started, students can scan QR codes or use location-based check-in</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                style={{ background: "linear-gradient(135deg, #4CA1AF, #2C3E50)" }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Starting...</span>
                  </>
                ) : (
                  <>
                    <MapPin className="w-4 h-4" />
                    <span>Start Attendance</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};


export default StartAttendancePopup;