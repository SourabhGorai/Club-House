
// import { useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// export default function Register() {
//   const navigate = useNavigate();
// const handleSignInClick = () => {
//   navigate('/');
// };
//   const [form, setForm] = useState({
//     prn: "",
//     username: "",
//     password: "",
//     email: "",
//     role: "",
//   });

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   // const handleSubmit = async (e) => {
//   //   e.preventDefault();

//   //   try {

//   //     console.log(form.prn);
//   //     console.log(form.email);
//   //     console.log(form.password);
//   //     console.log(form.role);
//   //     const res = await axios.post(
//   //       "http://localhost:8080/api/auth/register",
//   //       form
//   //     );

//   //     alert("Registration Successful!");
//   //     navigate("/otp");
//   //     console.log(res.data);

//   //   } catch (err) {
//   //     alert("Registration Failed!");
//   //     console.error(err);
//   //   }
//   // };
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       console.log("Sending registration data:", form);

//       axios.interceptors.request.use((request) => {
//         console.log("REQUEST HEADERS:", request.headers);
//         return request;
//       });

//       const res = await axios.post(
//         "http://localhost:8080/api/auth/register",
//         form,
//         {
//           headers: {
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       console.log("Registration response:", res.data);
//       alert("Registration Successful!");
//       navigate("/otp");
//     } catch (err) {
//       console.error("Registration error:", err);
//       console.error("Error response:", err.response?.data);
//       console.error("Error status:", err.response?.status);

//       const errorMessage =
//         err.response?.data?.message ||
//         err.response?.data ||
//         "Registration Failed!";
//       alert(errorMessage);
//     }
//   };

//  return (
//     <div className="min-h-screen bg-gradient-to-br from-orange-100 via-rose-50 to-sky-100 flex items-center justify-center">
//       <div className="max-w-md w-full bg-white shadow-md rounded-2xl border border-gray-100 p-8">
//         <div className="text-center mb-6">
//           <h2 className="text-2xl font-semibold text-gray-800">
//             Create Account
//           </h2>
//           <p className="text-gray-500 mt-1">Join our Club-Hub today</p>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div className="relative">
//             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//               <i className="fas fa-id-card text-gray-400"></i>
//             </div>
//             <input
//               type="text"
//               name="prn"
//               placeholder="PRN"
//               value={form.prn}
//               onChange={handleChange}
//               className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 transition bg-white"
//               required
//             />
//           </div>

//           <div className="relative">
//             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//               <i className="fas fa-user text-gray-400"></i>
//             </div>
//             <input
//               type="text"
//               name="username"
//               placeholder="Username"
//               value={form.username}
//               onChange={handleChange}
//               className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 transition bg-white"
//               required
//             />
//           </div>

//           <div className="relative">
//             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//               <i className="fas fa-envelope text-gray-400"></i>
//             </div>
//             <input
//               type="email"
//               name="email"
//               placeholder="Email"
//               value={form.email}
//               onChange={handleChange}
//               className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 transition bg-white"
//               required
//             />
//           </div>

//           <div className="relative">
//             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//               <i className="fas fa-lock text-gray-400"></i>
//             </div>
//             <input
//               type="password"
//               name="password"
//               placeholder="Password"
//               value={form.password}
//               onChange={handleChange}
//               className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 transition bg-white"
//               required
//             />
//           </div>

//           <div className="relative">
//             <select
//               name="role"
//               value={form.role}
//               onChange={handleChange}
//               className="w-full pl-4 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-300 transition appearance-none"
//               required
//             >
//               <option value="" disabled>
//                 Select Role
//               </option>
//               <option value="USERS">USERS</option>
//               <option value="SUPER_ADMIN">SUPER_ADMIN</option>
//               <option value="TEACHERS">TEACHERS</option>
//               <option value="CLUB_ADMIN">CLUB_ADMIN</option>
//             </select>
//           </div>

//           <button
//             type="submit"
//             className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-medium shadow-sm transition transform hover:scale-[1.01] active:scale-[0.99]"
//           >
//             <span className="flex items-center justify-center gap-2">
//               Create Account
//               <i className="fas fa-arrow-right"></i>
//             </span>
//           </button>

//           <div className="text-center text-sm text-gray-500 mt-4">
//             Already have an account?
//             <button
//               onClick={handleSignInClick}
//               className="text-orange-500 hover:text-orange-600 ml-1 font-medium transition-colors duration-200 focus:outline-none"
//             >
//               Sign in
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const handleSignInClick = () => {
    navigate("/");
  };
  
  const [form, setForm] = useState({
    prn: "",
    username: "",
    password: "",
    email: "",
    role: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

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
    <div className="h-screen flex items-center justify-center" style={{
      background: 'linear-gradient(135deg, #e8d5f2 0%, #a8c7e7 50%, #dab5d8 100%)'
    }}>
      <div className="w-full max-w-6xl h-[95vh] bg-white rounded-[2.5rem] shadow-2xl overflow-visible flex relative">
        {/* Left Side - Register Form */}
        <div className="w-full md:w-3/5 pl-12 pr-4 flex flex-col justify-center">
          <div className="my-5">
            <p className="text-sm text-gray-600">Join our Club-Hub today</p>
          </div>

          <h2 className="text-4xl font-bold text-gray-900">Create Account</h2>

          <form onSubmit={handleSubmit} className="max-w-lg">
            {/* PRN Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                PRN
              </label>
              <input
                type="text"
                name="prn"
                placeholder="Enter your PRN"
                value={form.prn}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#ffe4d6] border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-300 transition-all text-sm text-gray-700 placeholder:text-gray-400"
                required
              />
            </div>

            {/* Username Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Username
              </label>
              <input
                type="text"
                name="username"
                placeholder="Choose a username"
                value={form.username}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#ffe4d6] border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-300 transition-all text-sm text-gray-700 placeholder:text-gray-400"
                required
              />
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="your.email@example.com"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#ffe4d6] border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-300 transition-all text-sm text-gray-700 placeholder:text-gray-400"
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                  <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[#ffe4d6] border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-300 transition-all pr-10 text-sm text-gray-700"
              required
            />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Role Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Role
              </label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#ffe4d6] border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-300 transition-all text-sm text-gray-700 appearance-none"
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

            {/* Register Button */}
            <button
              type="submit"
              className="w-full text-white py-3.5 px-6 rounded-full font-bold shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-wide text-sm mt-6"
              style={{ background: 'linear-gradient(90deg, #ea580c 0%, #fb923c 100%)' }}
            >
              CREATE ACCOUNT
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white text-gray-500">or continue with</span>
              </div>
            </div>


            {/* Sign In Link */}
            <p className="text-center text-sm text-gray-600 mt-4">
              Already have an account?{" "}
              <button
                onClick={handleSignInClick}
                type="button"
                className="font-semibold transition-colors hover:opacity-80" 
                style={{ color: '#ea580c' }}
              >
                <a href="#" className="font-semibold transition-colors hover:opacity-80" style={{ color: '#ea580c' }}>
                Sign in
                </a>
              </button>
            </p>
          </form>
        </div>

        {/* Right Side - Illustration */}
        <div className="hidden md:flex md:w-2/5 items-center justify-center relative overflow-visible rounded-r-[2.5rem]" style={{
          background: 'linear-gradient(180deg, #ffd4a3 0%, #ffdfb8 100%)'
        }}>
          
          {/* Cactus decoration - positioned at bottom right */}
          <div className="absolute bottom-0 right-8 z-20">
            <img 
              src="/src/assets/image.png" 
              alt="Cactus decoration" 
              className="w-28 h-auto object-contain drop-shadow-xl"
            />
          </div>
        </div>

        {/* Character Illustration - positioned outside/overlapping the blue section */}
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