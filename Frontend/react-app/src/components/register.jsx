import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

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
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-lg rounded-xl">
      <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="prn"
          placeholder="PRN"
          value={form.prn}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />

        <input
          type="text"
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />

        {/* ⭐ New Role Dropdown */}
        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        >
          <option value="USERS">Select Role</option>
          <option value="USERS">USERS</option>
          <option value="SUPER_ADMIN">SUPER_ADMIN</option>
          <option value="TEACHERS">TEACHERS</option>
          <option value="CLUB_ADMIN">CLUB_ADMIN</option>
        </select>

        <button
          type="submit"
          className="w-full bg-orange-600 text-white p-2 cursor-pointer rounded-lg"
        >
          Register
        </button>
      </form>
    </div>
  );
}
