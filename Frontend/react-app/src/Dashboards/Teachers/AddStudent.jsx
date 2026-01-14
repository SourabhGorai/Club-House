import { useState,useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AddStudent() {
  const navigate = useNavigate();
  const [clubs, setClubs] = useState([]);
  const [loadingClubs, setLoadingClubs] = useState(false);
  
  const [form, setForm] = useState({
    prn: "",
    username: "",
    password: "",
    email: "",
    role: "USERS", // Default role for students
    fullName: "",
    department: "",
    year: "",
    phoneNumber: "",
    clubId:""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

    // Add this useEffect after your state declarations
  useEffect(() => {
    fetchClubs();
  }, []);

  // Add this function to fetch clubs from API
  const fetchClubs = async () => {
    try {
      setLoadingClubs(true);
      const response = await axios.get("http://localhost:8080/api/clubs", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      if (response.data.success) {
        setClubs(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching clubs:", error);
      alert("Failed to load clubs");
    } finally {
      setLoadingClubs(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Sending student data:", form);

      const res = await axios.post(
        "http://localhost:8080/api/auth/register",
        form,
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          },
        }
      );

      console.log("Student added successfully:", res.data);
      alert("Student added successfully!");
      
      // Reset form
      setForm({
        prn: "",
        username: "",
        password: "",
        email: "",
        role: "USERS",
        fullName: "",
        department: "",
        year: "",
        phoneNumber: "",
        club:""
      });
      
    } catch (err) {
      console.error("Error adding student:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data ||
        "Failed to add student!";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 overflow-auto"
      style={{
        background:
          "radial-gradient(circle at top left, #F2EEFF, #FDFCFE 60%, #F8F5FF)",
      }}
    >
      <div className="w-full max-w-6xl bg-white rounded-2xl md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row relative mx-auto my-4 md:my-8">
        {/* Left Side - Add Student Form */}
        <div className="w-full md:w-3/5 p-6 md:p-8 lg:p-10 flex flex-col">
          <div className="mb-6">
            <p className="text-sm md:text-base text-gray-600 font-medium">
              <b>Add New Student to Club-Hub</b>
            </p>
          </div>

          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
            Add Student
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
            {/* Row 1: PRN and Full Name (2 columns) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* PRN Field */}
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                  PRN *
                </label>
                <input
                  type="text"
                  name="prn"
                  placeholder="Enter student's PRN"
                  value={form.prn}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent transition-all duration-300 bg-white/50 text-sm md:text-base"
                  required
                />
              </div>

              {/* Full Name Field */}
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Enter student's full name"
                  value={form.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent transition-all duration-300 bg-white/50 text-sm md:text-base"
                  required
                />
              </div>
            </div>

            {/* Row 2: Username and Email (2 columns) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* Username Field */}
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                  Username *
                </label>
                <input
                  type="text"
                  name="username"
                  placeholder="Choose a username"
                  value={form.username}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent transition-all duration-300 bg-white/50 text-sm md:text-base"
                  required
                />
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="student.email@example.com"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent transition-all duration-300 bg-white/50 text-sm md:text-base"
                  required
                />
              </div>
            </div>

            {/* Row 3: Password (full width) */}
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Set initial password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent transition-all duration-300 bg-white/50 pr-10 text-sm md:text-base"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-sm font-medium px-2 py-1 rounded"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Row 4: Department and Year (2 columns) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* Department Field */}
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                  Department *
                </label>
                <select
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent transition-all duration-300 bg-white/50 text-sm md:text-base appearance-none cursor-pointer"
                  required
                >
                  <option value="" disabled>
                    Select Department
                  </option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Civil">Civil</option>
                  <option value="MBA">MBA</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Year Field */}
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                  Year *
                </label>
                <select
                  name="year"
                  value={form.year}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent transition-all duration-300 bg-white/50 text-sm md:text-base appearance-none cursor-pointer"
                  required
                >
                  <option value="" disabled>
                    Select Year
                  </option>
                  <option value="FE">First Year</option>
                  <option value="SE">Second Year</option>
                  <option value="TE">Third Year</option>
                  <option value="BE">Final Year</option>
                </select>
              </div>
            </div>

            {/* Row 5: Phone Number and Role (2 columns) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* Phone Number Field */}
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  placeholder="Enter phone number"
                  value={form.phoneNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent transition-all duration-300 bg-white/50 text-sm md:text-base"
                />
              </div>

              {/* Role Field (hidden/auto-set to USERS) */}
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <div className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-sm md:text-base text-gray-600">
                  Student (USERS)
                  <input type="hidden" name="role" value="USERS" />
                </div>
                <p className="text-xs text-gray-500 mt-1">Role automatically set to Student</p>
              </div>
            </div>

            {/* Row X: Club and Year (2 columns) */}
{/* Club Field */}
<div>
  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
    Club {loadingClubs && <span className="text-xs text-gray-500">(Loading...)</span>}
  </label>
  <select
    name="clubId"
    value={form.clubId}
    onChange={handleChange}
    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent transition-all duration-300 bg-white/50 text-sm md:text-base appearance-none cursor-pointer"
    disabled={loadingClubs}
  >
    <option value="">Select Club (Optional)</option>
    {clubs.map((club) => (
      <option key={club.clubId} value={club.clubId}>
        {club.clubName}
      </option>
    ))}
  </select>
  {clubs.length === 0 && !loadingClubs && (
    <p className="text-xs text-gray-500 mt-1">No clubs available</p>
  )}
</div>

            {/* Add Student Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`w-full text-white py-3 px-5 rounded-full font-bold shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-wide text-sm ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
                style={{
                  background: "linear-gradient(90deg, #10B981 0%, #34D399 100%)",
                }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    ADDING...
                  </>
                ) : (
                  <>
                    ADD STUDENT
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </>
                )}
              </button>
            </div>

            {/* Back to Dashboard Link */}
            <div className="pt-2">
              <button
                onClick={() => navigate(-1)}
                type="button"
                className="cursor-pointer w-full text-center text-sm font-semibold transition-colors hover:opacity-80 py-2 rounded-lg hover:bg-gray-50"
                style={{ color: "#8B5CF6" }}
              >
                ← Back to Dashboard
              </button>
            </div>
          </form>
        </div>

        {/* Right Side - Illustration */}
        <div
          className="hidden md:flex md:w-2/5 flex-col items-center justify-center relative overflow-hidden rounded-r-[2.5rem]"
          style={{
            background: "linear-gradient(135deg, #10B981 0%, #34D399 100%)",
          }}
        >
          <div className="text-center px-8">
            <div className="mb-6">
              <div className="w-24 h-24 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-6.65a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Add Student</h3>
              <p className="text-white/90 text-sm">
                Fill in the student details to add them to the system. All fields marked with * are required.
              </p>
            </div>

            <div className="mt-8 space-y-4 text-left">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-white text-sm">Student will receive login credentials</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-white text-sm">Access to Club-Hub features</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-white text-sm">Manage club memberships</span>
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-center">
            <div className="w-48 h-48 bg-white/10 rounded-full -mb-24"></div>
          </div>
          <div className="absolute bottom-4 right-4">
            <svg className="w-16 h-16 text-white/30" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* Mobile Illustration */}
        <div className="md:hidden w-full py-6 px-4 bg-gradient-to-r from-emerald-50 to-green-50">
          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-6.65a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
              </svg>
            </div>
            <div>
              <h3 className="cursor-pointer text-lg font-bold text-gray-800">Add Student</h3>
              <p className="text-sm text-gray-600">Fill all required fields to add a new student</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}