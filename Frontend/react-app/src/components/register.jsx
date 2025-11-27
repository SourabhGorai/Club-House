
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
const handleSignInClick = () => {
  navigate('/login');
};
  const [form, setForm] = useState({
    prn: "",
    username: "",
    password: "",
    email: "",
    role: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   try {

  //     console.log(form.prn);
  //     console.log(form.email);
  //     console.log(form.password);
  //     console.log(form.role);
  //     const res = await axios.post(
  //       "http://localhost:8080/api/auth/register",
  //       form
  //     );

  //     alert("Registration Successful!");
  //     navigate("/otp");
  //     console.log(res.data);

  //   } catch (err) {
  //     alert("Registration Failed!");
  //     console.error(err);
  //   }
  // };
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      console.log("Sending registration data:", form);

      axios.interceptors.request.use((request) => {
        console.log("REQUEST HEADERS:", request.headers);
        return request;
      });

      const res = await axios.post(
        "http://localhost:8080/api/auth/register",
        form,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Registration response:", res.data);
      alert("Registration Successful!");
      navigate("/otp");
    } catch (err) {
      console.error("Registration error:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);

      const errorMessage =
        err.response?.data?.message ||
        err.response?.data ||
        "Registration Failed!";
      alert(errorMessage);
    }
  };

 return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-rose-50 to-sky-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white shadow-md rounded-2xl border border-gray-100 p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Create Account
          </h2>
          <p className="text-gray-500 mt-1">Join our Club-Hub today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="fas fa-id-card text-gray-400"></i>
            </div>
            <input
              type="text"
              name="prn"
              placeholder="PRN"
              value={form.prn}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 transition bg-white"
              required
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="fas fa-user text-gray-400"></i>
            </div>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 transition bg-white"
              required
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="fas fa-envelope text-gray-400"></i>
            </div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 transition bg-white"
              required
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="fas fa-lock text-gray-400"></i>
            </div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 transition bg-white"
              required
            />
          </div>

          <div className="relative">
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full pl-4 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-300 transition appearance-none"
              required
            >
              <option value="" disabled>
                Select Role
              </option>
              <option value="USERS">USERS</option>
              <option value="SUPER_ADMIN">SUPER_ADMIN</option>
              <option value="TEACHERS">TEACHERS</option>
              <option value="CLUB_ADMIN">CLUB_ADMIN</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-medium shadow-sm transition transform hover:scale-[1.01] active:scale-[0.99]"
          >
            <span className="flex items-center justify-center gap-2">
              Create Account
              <i className="fas fa-arrow-right"></i>
            </span>
          </button>

          <div className="text-center text-sm text-gray-500 mt-4">
            Already have an account?
            <button
              onClick={handleSignInClick}
              className="text-orange-500 hover:text-orange-600 ml-1 font-medium transition-colors duration-200 focus:outline-none"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
