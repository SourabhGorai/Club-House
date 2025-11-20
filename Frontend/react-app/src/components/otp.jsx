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
   <div className="max-w-md mx-auto mt-12 p-8 bg-gradient-to-br from-white to-gray-50 shadow-2xl rounded-2xl border border-gray-100 transform transition-all duration-300 hover:shadow-2xl">
  <div className="text-center mb-8">
   
    <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Verify OTP</h2>
    <p className="text-gray-500 mt-2">Enter the code sent to your email</p>
  </div>

  <form onSubmit={handleSubmit} className="space-y-6">
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <i className="fas fa-envelope text-gray-400"></i>
      </div>
      <input
        type="email"
        placeholder="Enter Registered Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl  focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
        required
      />
    </div>

    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <i className="fas fa-key text-gray-400"></i>
      </div>
      <input
        type="text"
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
        required
      />
    </div>

    <button
      type="submit"
      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl cursor-pointer font-semibold shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
    >
      <span className="flex items-center justify-center">
        Verify OTP
        <i className="fas fa-check-circle ml-2"></i>
      </span>
    </button>

    <div className="text-center text-sm text-gray-500 mt-6">
      Didn't receive code? 
      <button 
        type="button"
        className="text-green-500 hover:text-green-600 ml-1 cursor-pointer font-medium transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-300 rounded px-1"
      >
        Resend OTP
      </button>
    </div>
  </form>
</div>
  );
}
