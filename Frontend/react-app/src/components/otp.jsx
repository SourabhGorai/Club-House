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
      navigate("/");
      console.log(response.data);
    } catch (err) {
      alert("Invalid OTP ❌ Please try again!");
      console.error(err);
    }
  };

  return (
    <div
      className="h-screen w-screen flex items-center justify-center overflow-hidden"
      style={{
        background:
          "radial-gradient(circle at top left, #F2EEFF, #FDFCFE 60%, #F8F5FF)",
      }}
    >
      <div className="w-full h-full bg-white rounded-none md:rounded-[2.5rem] md:max-w-5xl md:h-[90vh] shadow-2xl overflow-visible flex relative mx-auto">
        {/* Left Side - OTP Form */}
        <div className="w-full md:w-3/5 p-8 lg:p-10 flex flex-col justify-center">
          <div className="mb-4">
            <p className="text-xs text-gray-600">
              <b>OTP Verification</b>
            </p>
          </div>

          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-5">
            Enter OTP
          </h2>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-[#8B5CF6] focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
                required
              />
            </div>

            {/* OTP Field */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                OTP Code
              </label>
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-[#8B5CF6] focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
                required
              />
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              className="w-full text-white cursor-pointer py-3 px-5 rounded-full font-bold shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-wide text-xs mt-4"
              style={{
                background:
                  "linear-gradient(90deg, #8B5CF6 0%, #A78BFA 100%)",
              }}
            >
              VERIFY OTP
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </button>

            {/* Resend OTP */}
            <div className="flex justify-center mt-4">
              <button
                type="button"
                className="text-xs text-gray-700 hover:text-[#8B5CF6] transition-colors"
              >
                Resend OTP
              </button>
            </div>
          </form>
        </div>

        {/* Right Side - Illustration */}
        <div
          className="hidden md:flex md:w-2/5 items-center justify-center relative overflow-visible rounded-r-[2.5rem]"
          style={{
            background: "linear-gradient(180deg, #8B5CF6 0%, #A78BFA 100%)",
          }}
        >
          <div className="absolute bottom-0 right-8 z-20">
            <img
              src="/src/assets/image.png"
              alt="Cactus decoration"
              className="w-28 h-auto object-contain drop-shadow-xl"
            />
          </div>
        </div>

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

// export default function OTP() {
//   const navigate = useNavigate();

//   const [email, setEmail] = useState("");
//   const [otp, setOtp] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       const response = await axios.post(
//         "http://localhost:8080/api/auth/verify-otp",
//         { email, otp }
//       );

//       alert("OTP Verified Successfully!");

//       navigate("/");
      
//       console.log(response.data);

//     } catch (err) {
//       alert("Invalid OTP ❌ Please try again!");
//       console.error(err);
//     }
//   };

//   return (
//     <div className="h-screen flex items-center justify-center" style={{
//       background: 'linear-gradient(135deg, #e8d5f2 0%, #a8c7e7 50%, #dab5d8 100%)'
//     }}>
//       <div className="w-full max-w-6xl h-[90vh] bg-white rounded-[2.5rem] shadow-2xl overflow-visible flex relative">
//         {/* Left Side - OTP Form */}
//         <div className="w-full md:w-3/5 pl-12 pr-4 py-8 flex flex-col justify-center">
//           <div className="mb-3">
//             <p className="text-sm text-gray-600 mt-1">Enter the code sent to your email</p>
//           </div>

//           <h2 className="text-4xl font-bold text-gray-900 mb-5">Verify OTP</h2>

//           <form onSubmit={handleSubmit} className="space-y-3 max-w-lg">
//             {/* Email Field */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1.5">
//                 Email
//               </label>
//               <input
//                 type="email"
//                 placeholder="Enter Registered Email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className="w-full px-4 py-3 bg-[#ffe4d6] border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all text-sm text-gray-700 placeholder:text-gray-400"
//                 required
//               />
//             </div>

//             {/* OTP Field */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1.5">
//                 OTP Code
//               </label>
//               <input
//                 type="text"
//                 placeholder="Enter OTP"
//                 value={otp}
//                 onChange={(e) => setOtp(e.target.value)}
//                 className="w-full px-4 py-3 bg-[#ffe4d6] border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all text-sm text-gray-700 placeholder:text-gray-400"
//                 required
//               />
//             </div>

//             {/* Verify Button */}
//             <button
//               type="submit"
//               className="w-full text-white py-3.5 px-6 rounded-full font-bold shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-wide text-sm mt-6"
//               style={{ background: 'linear-gradient(90deg, #ea580c 0%, #fb923c 100%)' }}
//             >
//               VERIFY OTP
//               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
//                 <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
//               </svg>
//             </button>

//             {/* Divider */}
//             <div className="relative my-5">
//               <div className="absolute inset-0 flex items-center">
//                 <div className="w-full border-t border-gray-200"></div>
//               </div>
//               <div className="relative flex justify-center text-xs">
//                 <span className="px-3 bg-white text-gray-500">or continue with</span>
//               </div>
//             </div>

//             {/* Social Login Buttons */}
//             {/* <div className="flex gap-3 justify-center">
//               <button
//                 type="button"
//                 className="flex-1 flex items-center justify-center py-2.5 px-3 border-2 border-gray-200 rounded-full hover:border-gray-300 hover:shadow-md transition-all bg-white"
//               >
//                 <svg className="w-5 h-5" viewBox="0 0 24 24">
//                   <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
//                   <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
//                   <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
//                   <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
//                 </svg>
//               </button>
//               <button
//                 type="button"
//                 className="flex-1 flex items-center justify-center py-2.5 px-3 border-2 border-gray-200 rounded-full hover:border-gray-300 hover:shadow-md transition-all bg-white"
//               >
//                 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
//                   <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
//                 </svg>
//               </button>
//               <button
//                 type="button"
//                 className="flex-1 flex items-center justify-center py-2.5 px-3 border-2 border-gray-200 rounded-full hover:border-gray-300 hover:shadow-md transition-all bg-white"
//               >
//                 <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
//                   <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
//                 </svg>
//               </button>
//             </div> */}

//             {/* Resend OTP Link */}
//             <p className="text-center text-sm text-gray-600 mt-4">
//               Didn't receive code?{" "}
//               <button 
//                 type="button"
//                 className="font-semibold transition-colors hover:opacity-80" 
//                 style={{ color: '#ea580c' }}
//               >
//                 Resend OTP
//               </button>
//             </p>
//           </form>
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