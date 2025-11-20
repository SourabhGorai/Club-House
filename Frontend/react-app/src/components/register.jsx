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
    role: "USERS",
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
   <div className="max-w-md mx-auto mt-10 p-8 bg-gradient-to-br from-white to-gray-50 shadow-2xl rounded-2xl border border-gray-100 transform transition-all duration-300 hover:shadow-2xl">
  <div className="text-center mb-8">
   
    <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Create Account</h2>
    <p className="text-gray-500 mt-2">Join our Club-Hub today</p>
  </div>

  <form onSubmit={handleSubmit} className="space-y-5">
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
        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl  focus:ring-orange-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
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
        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl  focus:ring-orange-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
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
        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl  focus:ring-orange-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
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
        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl  focus:ring-orange-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
        required
      />
    </div>

    <div className="relative">
      <select
        name="role"
        value={form.role}
        onChange={handleChange}
        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl  focus:ring-orange-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm appearance-none"
        required
      >
        <option value="USERS">Select Role</option>
        <option value="USERS">USERS</option>
        <option value="SUPER_ADMIN">SUPER_ADMIN</option>
        <option value="TEACHERS">TEACHERS</option>
        <option value="CLUB_ADMIN">CLUB_ADMIN</option>
      </select>
    </div>

    <button
      type="submit"
      className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] mt-2"
    >
      <span className="flex items-center justify-center">
        Create Account
        <i className="fas fa-arrow-right ml-2"></i>
      </span>
    </button>

<div className="text-center text-sm text-gray-500 mt-6">
  Already have an account? 
  <button 
    onClick={handleSignInClick}
    className="text-orange-500 cursor-pointer hover:text-orange-600 ml-1 font-medium transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-orange-300 rounded px-1"
  >
    Sign in
  </button>
</div>
  </form>
</div>
  );
}
