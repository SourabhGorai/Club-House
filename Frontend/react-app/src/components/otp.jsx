import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function OTP() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/verify-otp",
        { email, otp }
      );

      alert("OTP Verified Successfully!");

      navigate("/login");

      console.log(response.data);

    } catch (err) {
      alert("Invalid OTP ❌ Please try again!");
      console.error(err);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white shadow-xl rounded-xl">
      <h2 className="text-2xl font-bold text-center mb-5">Verify OTP</h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        <input
          type="email"
          placeholder="Enter Registered Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />

        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />

        <button
          type="submit"
          className="w-full bg-green-600 text-white p-2 rounded-lg cursor-pointer hover:bg-green-700"
        >
          Verify OTP
        </button>

      </form>
    </div>
  );
}
