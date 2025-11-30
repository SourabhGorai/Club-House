import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  // Step 1: Request OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/forgot-password",
        { email }
      );

      alert("Password reset OTP sent to your email!");
      setOtpSent(true);
      console.log(response.data);

    } catch (err) {
      alert("Failed to send OTP! Please check your email and try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/reset-password",
        {
          email,
          otp,
          newPassword
        }
      );

      alert("Password reset successfully!");
      navigate("/login");
      
      console.log(response.data);

    } catch (err) {
      alert("Failed to reset password! Please check your OTP and try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="h-screen flex items-center justify-center overflow-hidden"
      style={{
        background:
          "radial-gradient(circle at top left, #F2EEFF, #FDFCFE 60%, #F8F5FF)",
      }}
    >
      <div className="w-full max-w-6xl h-[90vh] m-6 bg-white rounded-none md:rounded-[2.5rem] shadow-2xl overflow-visible flex relative">
        {/* Left Side - Form */}
        <div className="w-full md:w-3/5 pl-12 pr-4 py-8 flex flex-col justify-center">
          <div className="mb-3">
            <p className="text-sm text-gray-600 mt-1">
              {otpSent 
                ? "Enter OTP and new password to reset" 
                : "Enter your registered email to reset password"
              }
            </p>
          </div>

          <h2 className="text-4xl font-bold text-gray-900 mb-5">
            {otpSent ? "Reset Password" : "Forgot Password"}
          </h2>

          {!otpSent ? (
            <form onSubmit={handleRequestOTP} className="space-y-3 max-w-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Enter Registered Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-[#8B5CF6] focus:border-transparent transition-all duration-300 backdrop-blur-sm text-sm text-gray-700 placeholder:text-gray-400"
                  required
                />
              </div>

              {/* Send OTP Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full cursor-pointer text-white py-3.5 px-6 rounded-full font-bold shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-wide text-sm mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(90deg, #8B5CF6 0%, #A78BFA 100%)' }}
              >
                {isLoading ? "Sending OTP..." : "Send OTP"}
              </button>
            </form>
          ) : (
            // Step 2: OTP and new password form
            <form onSubmit={handleResetPassword} className="space-y-3 max-w-lg">
              {/* Email Field (read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="w-full px-4 py-3 bg-gray-100 border-0 rounded-2xl text-sm text-gray-500 cursor-not-allowed"
                />
              </div>

              {/* OTP Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  OTP Code
                </label>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-[#8B5CF6] focus:border-transparent transition-all duration-300 backdrop-blur-sm text-sm text-gray-700 placeholder:text-gray-400"
                  required
                />
              </div>

              {/* New Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-[#8B5CF6] focus:border-transparent transition-all duration-300 backdrop-blur-sm text-sm text-gray-700 placeholder:text-gray-400"
                  required
                />
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Confirm Password
                </label>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-[#8B5CF6] focus:border-transparent transition-all duration-300 backdrop-blur-sm text-sm text-gray-700 placeholder:text-gray-400"
                  required
                />
              </div>

              {/* Reset Password Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full cursor-pointer text-white py-3.5 px-6 rounded-full font-bold shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-wide text-sm mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(90deg, #8B5CF6 0%, #A78BFA 100%)' }}
              >
                {isLoading ? "Resetting..." : "Reset Password"}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </button>
            </form>
          )}

          {/* Back to Login */}
          <p className="text-center text-sm text-gray-600 mt-4">
            Remember your password?{" "}
            <button 
              type="button"
              onClick={() => navigate("/login")}
              className="cursor-pointer font-semibold transition-colors text-gray-600 hover:text-purple-600"
            >
              Back to Login
            </button>
          </p>
        </div>

        {/* Right Side - Illustration */}
        <div
          className="hidden md:flex md:w-2/5 items-center justify-center relative overflow-visible rounded-r-[2.5rem]"
          style={{
            background: "linear-gradient(180deg, #8B5CF6 0%, #A78BFA 100%)",
          }}
        >
          {/* Cactus decoration */}
          <div className="absolute bottom-0 right-8 z-20">
            <img
              src="/src/assets/image.png"
              alt="Cactus decoration"
              className="w-28 h-auto object-contain drop-shadow-xl"
            />
          </div>
        </div>

        {/* Character Illustration */}
        <div className="hidden md:block absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-8 z-30">
          <img
            src="/src/assets/image1.png"
            alt="Person working on laptop"
            className="w-[380px] h-auto object-contain drop-shadow-2xl"
          />
        </div>
      </div>
    </div>
  );
}


// import { useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// export default function ForgotPassword() {
//   const navigate = useNavigate();

//   const [email, setEmail] = useState("");
//   const [otp, setOtp] = useState("");
//   const [newPassword, setNewPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [otpSent, setOtpSent] = useState(false);

//   // Step 1: Request OTP
//   const handleRequestOTP = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);

//     try {
//       const response = await axios.post(
//         "http://localhost:8080/api/auth/forgot-password",
//         { email }
//       );

//       alert("Password reset OTP sent to your email!");
//       setOtpSent(true);
//       console.log(response.data);

//     } catch (err) {
//       alert("Failed to send OTP! Please check your email and try again.");
//       console.error(err);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleResetPassword = async (e) => {
//     e.preventDefault();
    
//     if (newPassword !== confirmPassword) {
//       alert("Passwords don't match!");
//       return;
//     }

//     setIsLoading(true);

//     try {
//       const response = await axios.post(
//         "http://localhost:8080/api/auth/reset-password",
//         {
//           email,
//           otp,
//           newPassword
//         }
//       );

//       alert("Password reset successfully!");
//       navigate("/");
      
//       console.log(response.data);

//     } catch (err) {
//       alert("Failed to reset password! Please check your OTP and try again.");
//       console.error(err);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="h-screen flex items-center justify-center" style={{
//       background: 'linear-gradient(135deg, #e8d5f2 0%, #a8c7e7 50%, #dab5d8 100%)'
//     }}>
//       <div className="w-full max-w-6xl h-[90vh] m-6 bg-white rounded-[2.5rem] shadow-2xl overflow-visible flex relative">
//         {/* Left Side - Form */}
//         <div className="w-full md:w-3/5 pl-12 pr-4 py-8 flex flex-col justify-center">
//           <div className="mb-3">
//             <p className="text-sm text-gray-600 mt-1">
//               {otpSent 
//                 ? "Enter OTP and new password to reset" 
//                 : "Enter your registered email to reset password"
//               }
//             </p>
//           </div>

//           <h2 className="text-4xl font-bold text-gray-900 mb-5">
//             {otpSent ? "Reset Password" : "Forgot Password"}
//           </h2>

//           {!otpSent ? (
//             <form onSubmit={handleRequestOTP} className="space-y-3 max-w-lg">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1.5">
//                   Email
//                 </label>
//                 <input
//                   type="email"
//                   placeholder="Enter Registered Email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   className="w-full px-4 py-3 bg-[#ffe4d6] border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all text-sm text-gray-700 placeholder:text-gray-400"
//                   required
//                 />
//               </div>

//               {/* Send OTP Button */}
//               <button
//                 type="submit"
//                 disabled={isLoading}
//                 className="w-full cursor-pointer text-white py-3.5 px-6 rounded-full font-bold shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-wide text-sm mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
//                 style={{ background: 'linear-gradient(90deg, #ea580c 0%, #fb923c 100%)' }}
//               >
//                 {isLoading ? "Sending OTP..." : "Send OTP"}
//               </button>
//             </form>
//           ) : (
//             // Step 2: OTP and new password form
//             <form onSubmit={handleResetPassword} className="space-y-3 max-w-lg">
//               {/* Email Field (read-only) */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1.5">
//                   Email
//                 </label>
//                 <input
//                   type="email"
//                   value={email}
//                   readOnly
//                   className="w-full px-4 py-3 bg-gray-100 border-0 rounded-2xl text-sm text-gray-500 cursor-not-allowed"
//                 />
//               </div>

//               {/* OTP Field */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1.5">
//                   OTP Code
//                 </label>
//                 <input
//                   type="text"
//                   placeholder="Enter OTP"
//                   value={otp}
//                   onChange={(e) => setOtp(e.target.value)}
//                   className="w-full px-4 py-3 bg-[#ffe4d6] border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all text-sm text-gray-700 placeholder:text-gray-400"
//                   required
//                 />
//               </div>

//               {/* New Password Field */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1.5">
//                   New Password
//                 </label>
//                 <input
//                   type="password"
//                   placeholder="Enter new password"
//                   value={newPassword}
//                   onChange={(e) => setNewPassword(e.target.value)}
//                   className="w-full px-4 py-3 bg-[#ffe4d6] border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all text-sm text-gray-700 placeholder:text-gray-400"
//                   required
//                 />
//               </div>

//               {/* Confirm Password Field */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1.5">
//                   Confirm Password
//                 </label>
//                 <input
//                   type="password"
//                   placeholder="Confirm new password"
//                   value={confirmPassword}
//                   onChange={(e) => setConfirmPassword(e.target.value)}
//                   className="w-full px-4 py-3 bg-[#ffe4d6] border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all text-sm text-gray-700 placeholder:text-gray-400"
//                   required
//                 />
//               </div>

//               {/* Reset Password Button */}
//               <button
//                 type="submit"
//                 disabled={isLoading}
//                 className="w-full cursor-pointer text-white py-3.5 px-6 rounded-full font-bold shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-wide text-sm mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
//                 style={{ background: 'linear-gradient(90deg, #ea580c 0%, #fb923c 100%)' }}
//               >
//                 {isLoading ? "Resetting..." : "Reset Password"}
//                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
//                   <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
//                 </svg>
//               </button>
//             </form>
//           )}

//           {/* Back to Login */}
//           <p className="text-center text-sm text-gray-600 mt-4">
//             Remember your password?{" "}
//             <button 
//               type="button"
//               onClick={() => navigate("/")}
//               className="cursor-pointer font-semibold transition-colors text-gray-600 hover:text-orange-600"
//             >
//               Back to Login
//             </button>
//           </p>
//         </div>

//         {/* Right Side - Illustration */}
//         <div className="hidden md:flex md:w-2/5 items-center justify-center relative overflow-visible rounded-r-[2.5rem]" style={{
//           background: 'linear-gradient(180deg, #ffd4a3 0%, #ffdfb8 100%)'
//         }}>
          
//           {/* Cactus decoration - positioned at bottom right */}
//           <div className="absolute bottom-0 right-8 z-20">
//             <img 
//               src="/src/assets/image.png" 
//               alt="Cactus decoration" 
//               className="w-28 h-auto object-contain drop-shadow-xl"
//             />
//           </div>
//         </div>

//         {/* Character Illustration - positioned outside/overlapping the blue section */}
//         <div className="hidden md:block absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-8 z-30">
//           <img 
//             src="/src/assets/image1.png" 
//             alt="Person working on laptop" 
//             className="w-[380px] h-auto object-contain drop-shadow-2xl"
//           />
//         </div>
//       </div>
//     </div>
//   );
// }