import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
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
  Lock,
  Eye,
  Award,
  Sparkles,
  Target,
  Hash,
  Type,
  AlignLeft,
  Home,
  Tags,
  Users2,
  PartyPopper,
  BookOpen,
  Mic2,
  Trophy,
  Code2,
  Palette,
  Briefcase,
} from "lucide-react";

export default function CreateEvent() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventDate: "",
    organizer: user?.username || "CLICKZY",
    venue: "",
    target: "CLUB",
    targetIds: [],
    enrollmentDeadline: "",
    eventType: "PUBLIC",
    maxParticipants: "",
    eventCategory: "ACADEMIC",
    bannerColor: "purple",
    hasCertificate: false,
    hasRefreshments: false,
    isPaid: false,
    entryFee: "",
    contactEmail: user?.email || "",
    contactPhone: "",
    prerequisites: "",
    schedule: "",
    tags: [],
  });

  // UI States
  const [loading, setLoading] = useState(false);
  const [clubs, setClubs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [selectedTargets, setSelectedTargets] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [tagInput, setTagInput] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  // Color themes
  const colorThemes = [
    { name: "purple", bg: "bg-purple-600", light: "bg-purple-50", text: "text-purple-600", border: "border-purple-200", gradient: "from-purple-600 to-indigo-600" },
    { name: "blue", bg: "bg-blue-600", light: "bg-blue-50", text: "text-blue-600", border: "border-blue-200", gradient: "from-blue-600 to-cyan-600" },
    { name: "green", bg: "bg-green-600", light: "bg-green-50", text: "text-green-600", border: "border-green-200", gradient: "from-green-600 to-emerald-600" },
    { name: "orange", bg: "bg-orange-600", light: "bg-orange-50", text: "text-orange-600", border: "border-orange-200", gradient: "from-orange-600 to-red-600" },
    { name: "pink", bg: "bg-pink-600", light: "bg-pink-50", text: "text-pink-600", border: "border-pink-200", gradient: "from-pink-600 to-rose-600" },
  ];

  const currentTheme = colorThemes.find(t => t.name === formData.bannerColor) || colorThemes[0];

  // Fetch clubs and departments on mount
  useEffect(() => {
    fetchTargetOptions();
  }, []);

  const fetchTargetOptions = async () => {
    setLoadingOptions(true);
    try {
      // Fetch clubs - Updated to handle the response correctly
      const clubsResponse = await axios.get("http://localhost:8080/api/clubs", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Clubs API Response:", clubsResponse.data); // Debug log

      // Handle different response structures
      if (Array.isArray(clubsResponse.data)) {
        // If response is directly an array
        setClubs(clubsResponse.data);
      } else if (clubsResponse.data.success && Array.isArray(clubsResponse.data.data)) {
        // If response has success and data properties
        setClubs(clubsResponse.data.data);
      } else if (clubsResponse.data.data && Array.isArray(clubsResponse.data.data)) {
        // If response has data property
        setClubs(clubsResponse.data.data);
      } else {
        console.error("Unexpected clubs response structure:", clubsResponse.data);
        setClubs([]);
      }

      // Fetch departments
      const deptResponse = await axios.get("http://localhost:8080/api/department", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Departments API Response:", deptResponse.data); // Debug log

      // Handle different response structures for departments
      if (Array.isArray(deptResponse.data)) {
        setDepartments(deptResponse.data);
      } else if (deptResponse.data.success && Array.isArray(deptResponse.data.data)) {
        setDepartments(deptResponse.data.data);
      } else if (deptResponse.data.data && Array.isArray(deptResponse.data.data)) {
        setDepartments(deptResponse.data.data);
      } else {
        console.error("Unexpected departments response structure:", deptResponse.data);
        setDepartments([]);
      }

    } catch (error) {
      console.error("Error fetching options:", error);
      setMessage({
        text: "Failed to load clubs/departments. Please try again.",
        type: "error",
      });
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const handleTargetSelection = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, (option) => ({
      id: parseInt(option.value),
      name: option.text,
    }));

    setSelectedTargets(selectedOptions);
    setFormData((prev) => ({
      ...prev,
      targetIds: selectedOptions.map((opt) => opt.id),
    }));

    if (formErrors.targetIds) {
      setFormErrors((prev) => ({
        ...prev,
        targetIds: null,
      }));
    }
  };

  const removeTarget = (targetId) => {
    const updatedTargets = selectedTargets.filter((t) => t.id !== targetId);
    setSelectedTargets(updatedTargets);
    setFormData((prev) => ({
      ...prev,
      targetIds: updatedTargets.map((t) => t.id),
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = "Event title is required";
    } else if (formData.title.length < 5) {
      errors.title = "Title must be at least 5 characters";
    }

    if (!formData.description.trim()) {
      errors.description = "Event description is required";
    } else if (formData.description.length < 20) {
      errors.description = "Description must be at least 20 characters";
    }

    if (!formData.eventDate) {
      errors.eventDate = "Event date is required";
    } else {
      const selectedDate = new Date(formData.eventDate);
      const now = new Date();
      if (selectedDate < now) {
        errors.eventDate = "Event date must be in the future";
      }
    }

    if (!formData.venue.trim()) {
      errors.venue = "Venue is required";
    }

    if (!formData.enrollmentDeadline) {
      errors.enrollmentDeadline = "Enrollment deadline is required";
    } else {
      const deadlineDate = new Date(formData.enrollmentDeadline);
      const eventDate = new Date(formData.eventDate);
      const now = new Date();

      if (deadlineDate < now) {
        errors.enrollmentDeadline = "Deadline must be in the future";
      } else if (deadlineDate >= eventDate) {
        errors.enrollmentDeadline = "Deadline must be before the event date";
      }
    }

    if (formData.targetIds.length === 0) {
      errors.targetIds = `Please select at least one ${formData.target.toLowerCase()}`;
    }

    if (formData.maxParticipants && parseInt(formData.maxParticipants) < 1) {
      errors.maxParticipants = "Maximum participants must be at least 1";
    }

    if (formData.isPaid && (!formData.entryFee || parseFloat(formData.entryFee) <= 0)) {
      errors.entryFee = "Please enter a valid entry fee";
    }

    if (formData.contactEmail && !/\S+@\S+\.\S+/.test(formData.contactEmail)) {
      errors.contactEmail = "Please enter a valid email";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setMessage({
        text: "Please fix the errors in the form",
        type: "error"
      });
      return;
    }

    setLoading(true);
    setMessage({ text: "", type: "" });

    // Prepare final data
    const eventData = {
      title: formData.title,
      description: formData.description,
      eventDate: formData.eventDate,
      organizer: formData.organizer,
      venue: formData.venue,
      target: formData.target,
      targetIds: formData.targetIds,
      enrollmentDeadline: formData.enrollmentDeadline,
      eventType: formData.eventType,
      maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null,
      eventCategory: formData.eventCategory,
      metadata: {
        bannerColor: formData.bannerColor,
        hasCertificate: formData.hasCertificate,
        hasRefreshments: formData.hasRefreshments,
        isPaid: formData.isPaid,
        entryFee: formData.entryFee ? parseFloat(formData.entryFee) : null,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        prerequisites: formData.prerequisites,
        schedule: formData.schedule,
        tags: formData.tags,
      }
    };

    try {
      const response = await axios.post(
        "http://localhost:8080/api/events/create",
        eventData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setMessage({
          text: "✨ Event created successfully! Redirecting to dashboard...",
          type: "success"
        });

        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      } else {
        setMessage({
          text: response.data.message || "Failed to create event",
          type: "error"
        });
      }
    } catch (error) {
      console.error("Error creating event:", error);
      setMessage({
        text: error.response?.data?.message || "Error creating event. Please try again.",
        type: "error"
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

  // Category icons
  const categoryIcons = {
    ACADEMIC: BookOpen,
    CULTURAL: Mic2,
    SPORTS: Trophy,
    TECHNICAL: Code2,
    WORKSHOP: Palette,
    OTHER: Briefcase,
  };

  const CategoryIcon = formData.eventCategory ? categoryIcons[formData.eventCategory] : Briefcase;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Navigation Bar */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-all group"
            >
              <div className="p-1.5 rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </div>
              <span className="font-medium">Dashboard</span>
            </button>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all text-sm font-medium"
              >
                <Eye className="w-4 h-4" />
                {showPreview ? "Hide Preview" : "Show Preview"}
              </button>
              
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${currentTheme.gradient} flex items-center justify-center`}>
                  <PartyPopper className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-gray-900">Create Event</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className={`grid ${showPreview ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'} gap-8`}>
          {/* Main Form */}
          <div className={showPreview ? 'lg:col-span-2' : 'col-span-1'}>
            {/* Header Section */}
            <div className="mb-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-600/10 to-indigo-600/10 border border-purple-200/50 mb-4">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">Create Amazing Experiences</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tight mb-2">
                Design Your <span className={`bg-gradient-to-r ${currentTheme.gradient} bg-clip-text text-transparent`}>Event</span>
              </h1>
              <p className="text-gray-600 text-lg">Fill in the details below to create an unforgettable event</p>
            </div>

            {/* Main Form Card */}
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden transition-all duration-300 hover:shadow-purple-100/50">
              <form onSubmit={handleSubmit}>
                {/* Status Message */}
                {message.text && (
                  <div className={`m-6 p-4 rounded-xl flex items-center gap-3 animate-slideDown ${
                    message.type === "error"
                      ? "bg-red-50 text-red-700 border border-red-200 shadow-lg shadow-red-100/50"
                      : "bg-green-50 text-green-700 border border-green-200 shadow-lg shadow-green-100/50"
                  }`}>
                    {message.type === "error" ? (
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    ) : (
                      <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    )}
                    <p className="text-sm font-medium">{message.text}</p>
                  </div>
                )}

                <div className="p-6 space-y-8">
                  {/* Section 1: Basic Information */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl bg-gradient-to-r ${currentTheme.gradient} shadow-lg`}>
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <h2 className="text-xl font-bold text-gray-900">Basic Information</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Title */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                          <Type className="w-4 h-4 text-gray-400" />
                          Event Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          placeholder="e.g., Photography Walk 2026"
                          className={`w-full px-5 py-4 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none text-lg ${
                            formErrors.title ? "border-red-300 bg-red-50/50" : "border-gray-200 hover:border-purple-200"
                          }`}
                        />
                        {formErrors.title && (
                          <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {formErrors.title}
                          </p>
                        )}
                      </div>

                      {/* Category */}
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                          <Tags className="w-4 h-4 text-gray-400" />
                          Category
                        </label>
                        <select
                          name="eventCategory"
                          value={formData.eventCategory}
                          onChange={handleInputChange}
                          className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none appearance-none bg-white"
                        >
                          {Object.keys(categoryIcons).map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>

                      {/* Banner Color */}
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                          <Palette className="w-4 h-4 text-gray-400" />
                          Theme Color
                        </label>
                        <div className="flex gap-2">
                          {colorThemes.map(theme => (
                            <button
                              key={theme.name}
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, bannerColor: theme.name }))}
                              className={`w-10 h-10 rounded-xl ${theme.bg} transition-all hover:scale-110 shadow-md ${
                                formData.bannerColor === theme.name ? 'ring-4 ring-offset-2 ring-purple-200' : ''
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <AlignLeft className="w-4 h-4 text-gray-400" />
                        Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Describe your event in detail. Include schedule, activities, requirements, and any other important information..."
                        rows="4"
                        className={`w-full px-5 py-4 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none resize-none ${
                          formErrors.description ? "border-red-300 bg-red-50/50" : "border-gray-200 hover:border-purple-200"
                        }`}
                      />
                      {formErrors.description && (
                        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {formErrors.description}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-gray-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Minimum 20 characters
                      </p>
                    </div>
                  </div>

                  {/* Section 2: Date & Location */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl bg-gradient-to-r ${currentTheme.gradient} shadow-lg`}>
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <h2 className="text-xl font-bold text-gray-900">Date & Location</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Event Date */}
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Event Date & Time <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="datetime-local"
                            name="eventDate"
                            value={formData.eventDate}
                            onChange={handleInputChange}
                            min={getMinDateTime()}
                            className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none ${
                              formErrors.eventDate ? "border-red-300 bg-red-50/50" : "border-gray-200 hover:border-purple-200"
                            }`}
                          />
                        </div>
                        {formErrors.eventDate && (
                          <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {formErrors.eventDate}
                          </p>
                        )}
                      </div>

                      {/* Enrollment Deadline */}
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Enrollment Deadline <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="datetime-local"
                            name="enrollmentDeadline"
                            value={formData.enrollmentDeadline}
                            onChange={handleInputChange}
                            min={getCurrentDateTime()}
                            max={formData.eventDate}
                            className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none ${
                              formErrors.enrollmentDeadline ? "border-red-300 bg-red-50/50" : "border-gray-200 hover:border-purple-200"
                            }`}
                          />
                        </div>
                        {formErrors.enrollmentDeadline && (
                          <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {formErrors.enrollmentDeadline}
                          </p>
                        )}
                      </div>

                      {/* Venue */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Venue <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="text"
                            name="venue"
                            value={formData.venue}
                            onChange={handleInputChange}
                            placeholder="e.g., College Main Gate, Auditorium, Online (Zoom)"
                            className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none ${
                              formErrors.venue ? "border-red-300 bg-red-50/50" : "border-gray-200 hover:border-purple-200"
                            }`}
                          />
                        </div>
                        {formErrors.venue && (
                          <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {formErrors.venue}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Target Audience */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl bg-gradient-to-r ${currentTheme.gradient} shadow-lg`}>
                        <Target className="w-5 h-5 text-white" />
                      </div>
                      <h2 className="text-xl font-bold text-gray-900">Target Audience</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Visibility */}
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Visibility
                        </label>
                        <div className="flex gap-2">
                          {[
                            { type: "PUBLIC", icon: Globe, label: "Public" },
                            { type: "RESTRICTED", icon: Eye, label: "Restricted" },
                            { type: "PRIVATE", icon: Lock, label: "Private" },
                          ].map(({ type, icon: Icon, label }) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, eventType: type }))}
                              className={`flex-1 p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                                formData.eventType === type
                                  ? `border-${currentTheme.name}-500 ${currentTheme.light} ${currentTheme.text}`
                                  : "border-gray-200 hover:border-purple-200 hover:bg-purple-50/50"
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                              <span className="text-xs font-medium">{label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Max Participants */}
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Max Participants
                        </label>
                        <input
                          type="number"
                          name="maxParticipants"
                          value={formData.maxParticipants}
                          onChange={handleInputChange}
                          placeholder="Unlimited"
                          min="1"
                          className={`w-full px-5 py-4 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none ${
                            formErrors.maxParticipants ? "border-red-300 bg-red-50/50" : "border-gray-200 hover:border-purple-200"
                          }`}
                        />
                        {formErrors.maxParticipants && (
                          <p className="mt-1 text-xs text-red-600">{formErrors.maxParticipants}</p>
                        )}
                      </div>
                    </div>

                    {/* Target Type */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Target Audience Type <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-3">
                        {[
                          { type: "CLUB", icon: Users, label: "Clubs" },
                          { type: "DEPARTMENT", icon: Building2, label: "Departments" },
                        ].map(({ type, icon: Icon, label }) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, target: type }));
                              setSelectedTargets([]);
                            }}
                            className={`flex-1 p-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
                              formData.target === type
                                ? `border-${currentTheme.name}-500 ${currentTheme.light} ${currentTheme.text}`
                                : "border-gray-200 hover:border-purple-200 hover:bg-purple-50/50"
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                            <span className="font-bold">{label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Target Selection */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Select {formData.target === "CLUB" ? "Clubs" : "Departments"} <span className="text-red-500">*</span>
                      </label>

                      {/* Selected Targets */}
                      {selectedTargets.length > 0 && (
                        <div className="mb-3 flex flex-wrap gap-2">
                          {selectedTargets.map((target) => (
                            <div
                              key={target.id}
                              className={`inline-flex items-center gap-1 px-3 py-1.5 ${currentTheme.light} ${currentTheme.text} rounded-lg text-sm font-medium`}
                            >
                              <span>{target.name}</span>
                              <button
                                type="button"
                                onClick={() => removeTarget(target.id)}
                                className="hover:opacity-70"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Loading State */}
                      {loadingOptions ? (
                        <div className="w-full px-5 py-8 border-2 border-gray-200 rounded-xl flex items-center justify-center gap-2 text-gray-500">
                          <Loader className="w-5 h-5 animate-spin" />
                          <span>Loading {formData.target === "CLUB" ? "clubs" : "departments"}...</span>
                        </div>
                      ) : (
                        <>
                          {/* Multi-select Dropdown */}
                          <select
                            multiple
                            value={selectedTargets.map(t => t.id)}
                            onChange={handleTargetSelection}
                            className={`w-full px-5 py-4 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none min-h-[140px] ${
                              formErrors.targetIds ? "border-red-300 bg-red-50/50" : "border-gray-200 hover:border-purple-200"
                            }`}
                            size="5"
                          >
                            {formData.target === "CLUB" ? (
                              clubs.length > 0 ? (
                                clubs.map((club) => {
                                  // Handle different possible club object structures
                                  const clubId = club.clubId || club.id;
                                  const clubName = club.name || club.clubName;
                                  return (
                                    <option key={clubId} value={clubId} className="py-2">
                                      {clubName || "Unnamed Club"}
                                    </option>
                                  );
                                })
                              ) : (
                                <option disabled className="py-2 text-gray-400">No clubs available</option>
                              )
                            ) : (
                              departments.length > 0 ? (
                                departments.map((dept) => {
                                  // Handle different possible department object structures
                                  const deptId = dept.departmentId || dept.id;
                                  const deptName = dept.name || dept.departmentName;
                                  return (
                                    <option key={deptId} value={deptId} className="py-2">
                                      {deptName || "Unnamed Department"}
                                    </option>
                                  );
                                })
                              ) : (
                                <option disabled className="py-2 text-gray-400">No departments available</option>
                              )
                            )}
                          </select>
                        </>
                      )}
                      
                      {formErrors.targetIds && (
                        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {formErrors.targetIds}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                        <Hash className="w-3 h-3" />
                        Hold Ctrl/Cmd to select multiple
                      </p>
                    </div>
                  </div>

                  {/* Section 4: Additional Details */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl bg-gradient-to-r ${currentTheme.gradient} shadow-lg`}>
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <h2 className="text-xl font-bold text-gray-900">Additional Details</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Tags */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Tags
                        </label>
                        <div className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                            placeholder="Add tags (e.g., workshop, seminar)"
                            className="flex-1 px-5 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                          />
                          <button
                            type="button"
                            onClick={addTag}
                            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all"
                          >
                            Add
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {formData.tags.map(tag => (
                            <span
                              key={tag}
                              className={`inline-flex items-center gap-1 px-3 py-1.5 ${currentTheme.light} ${currentTheme.text} rounded-lg text-sm`}
                            >
                              #{tag}
                              <button
                                type="button"
                                onClick={() => removeTag(tag)}
                                className="hover:opacity-70"
                              >
                                <X size={14} />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Contact Email */}
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Contact Email
                        </label>
                        <input
                          type="email"
                          name="contactEmail"
                          value={formData.contactEmail}
                          onChange={handleInputChange}
                          placeholder="event@college.edu"
                          className={`w-full px-5 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none ${
                            formErrors.contactEmail ? "border-red-300 bg-red-50/50" : "border-gray-200 hover:border-purple-200"
                          }`}
                        />
                        {formErrors.contactEmail && (
                          <p className="mt-1 text-xs text-red-600">{formErrors.contactEmail}</p>
                        )}
                      </div>

                      {/* Contact Phone */}
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Contact Phone
                        </label>
                        <input
                          type="tel"
                          name="contactPhone"
                          value={formData.contactPhone}
                          onChange={handleInputChange}
                          placeholder="+1234567890"
                          className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                        />
                      </div>
                    </div>

                    {/* Prerequisites */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Prerequisites
                      </label>
                      <textarea
                        name="prerequisites"
                        value={formData.prerequisites}
                        onChange={handleInputChange}
                        placeholder="What participants need to bring or know before attending..."
                        rows="2"
                        className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none resize-none"
                      />
                    </div>

                    {/* Schedule */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Schedule / Agenda
                      </label>
                      <textarea
                        name="schedule"
                        value={formData.schedule}
                        onChange={handleInputChange}
                        placeholder="10:00 AM - Inauguration\n11:00 AM - Main Session\n12:30 PM - Lunch Break\n02:00 PM - Workshop"
                        rows="3"
                        className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none resize-none font-mono text-sm"
                      />
                    </div>

                    {/* Options */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <label className="flex items-center gap-2 p-3 border-2 border-gray-200 rounded-xl hover:border-purple-200 transition-all cursor-pointer">
                        <input
                          type="checkbox"
                          name="hasCertificate"
                          checked={formData.hasCertificate}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <span className="text-sm font-medium">Certificate</span>
                      </label>
                      <label className="flex items-center gap-2 p-3 border-2 border-gray-200 rounded-xl hover:border-purple-200 transition-all cursor-pointer">
                        <input
                          type="checkbox"
                          name="hasRefreshments"
                          checked={formData.hasRefreshments}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <span className="text-sm font-medium">Refreshments</span>
                      </label>
                      <label className="flex items-center gap-2 p-3 border-2 border-gray-200 rounded-xl hover:border-purple-200 transition-all cursor-pointer">
                        <input
                          type="checkbox"
                          name="isPaid"
                          checked={formData.isPaid}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <span className="text-sm font-medium">Paid Event</span>
                      </label>
                    </div>

                    {/* Entry Fee (conditional) */}
                    {formData.isPaid && (
                      <div className="animate-slideDown">
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Entry Fee ($) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          name="entryFee"
                          value={formData.entryFee}
                          onChange={handleInputChange}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          className={`w-full px-5 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none ${
                            formErrors.entryFee ? "border-red-300 bg-red-50/50" : "border-gray-200 hover:border-purple-200"
                          }`}
                        />
                        {formErrors.entryFee && (
                          <p className="mt-1 text-xs text-red-600">{formErrors.entryFee}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-6 border-t-2 border-gray-100">
                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full bg-gradient-to-r ${currentTheme.gradient} text-white py-5 px-6 rounded-xl font-bold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group hover:shadow-xl hover:scale-[1.02]`}
                    >
                      {loading ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin" />
                          Creating Event...
                        </>
                      ) : (
                        <>
                          <CalendarPlus className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                          Create Event
                          <Sparkles className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </>
                      )}
                    </button>
                    
                    <p className="text-xs text-center text-gray-400 mt-4">
                      By creating an event, you agree to our event guidelines and code of conduct
                    </p>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Preview Panel */}
          {showPreview && (
            <div className="lg:col-span-1 animate-slideLeft">
              <div className="sticky top-24">
                <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
                  <div className={`bg-gradient-to-r ${currentTheme.gradient} px-6 py-8 text-white`}>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold uppercase tracking-wider opacity-80">
                        {formData.eventType}
                      </span>
                      <CategoryIcon className="w-5 h-5 opacity-80" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{formData.title || "Event Title"}</h3>
                    <p className="text-sm opacity-90 line-clamp-2">{formData.description || "Event description will appear here"}</p>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        {formData.eventDate ? new Date(formData.eventDate).toLocaleString() : "Date not set"}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        Deadline: {formData.enrollmentDeadline ? new Date(formData.enrollmentDeadline).toLocaleString() : "Not set"}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{formData.venue || "Venue not set"}</span>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        {selectedTargets.length} {formData.target === "CLUB" ? "clubs" : "departments"} selected
                      </span>
                    </div>

                    {formData.maxParticipants && (
                      <div className="flex items-center gap-3 text-sm">
                        <Users2 className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Max {formData.maxParticipants} participants</span>
                      </div>
                    )}

                    {formData.tags.length > 0 && (
                      <div className="pt-2">
                        <p className="text-xs font-bold text-gray-400 mb-2">TAGS</p>
                        <div className="flex flex-wrap gap-2">
                          {formData.tags.map(tag => (
                            <span key={tag} className={`px-2 py-1 ${currentTheme.light} ${currentTheme.text} rounded-lg text-xs`}>
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {(formData.hasCertificate || formData.hasRefreshments || formData.isPaid) && (
                      <div className="pt-2">
                        <p className="text-xs font-bold text-gray-400 mb-2">FEATURES</p>
                        <div className="flex flex-wrap gap-2">
                          {formData.hasCertificate && (
                            <span className={`px-2 py-1 ${currentTheme.light} ${currentTheme.text} rounded-lg text-xs`}>
                              🏆 Certificate
                            </span>
                          )}
                          {formData.hasRefreshments && (
                            <span className={`px-2 py-1 ${currentTheme.light} ${currentTheme.text} rounded-lg text-xs`}>
                              ☕ Refreshments
                            </span>
                          )}
                          {formData.isPaid && (
                            <span className={`px-2 py-1 ${currentTheme.light} ${currentTheme.text} rounded-lg text-xs`}>
                              💰 ${formData.entryFee || '0'} Entry
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-6 bg-gray-50/50 border-t border-gray-100">
                    <p className="text-xs text-gray-400 text-center">
                      Organized by {formData.organizer}
                    </p>
                  </div>
                </div>

                <div className="mt-4 text-center">
                  <button
                    onClick={() => setShowPreview(false)}
                    className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    Hide Preview
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
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
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
        @keyframes slideLeft {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slideLeft {
          animation: slideLeft 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}