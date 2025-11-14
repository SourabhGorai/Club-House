import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/login",
        form
      );

      console.log(form.username)
      console.log(response.data.username)
      console.log(response.data)
      console.log("Response:", response.data);
      if (response.data && response.data.user.username === form.username) {
        console.log("Login successful ✔");
        navigate("/dashboard");
      } else {
        alert("Invalid username or password!");
      }

    } catch (err) {
      alert("Login Failed !");
      console.error(err);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white shadow-xl rounded-xl">
      <h2 className="text-2xl font-bold text-center mb-5">Login</h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        <input
          type="text"
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          className="w-full p-2 border rounded-lg"
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full p-2 border rounded-lg"
          required
        />

        <button
          type="submit"
          className="w-full bg-orange-600 rounded-lg text-white p-2 rounded"
        >
          Login
        </button>

      </form>
    </div>
  );
}
