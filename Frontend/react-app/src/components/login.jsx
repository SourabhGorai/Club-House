// import { useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// export default function Login() {
//   const navigate = useNavigate();
  
//   const [form, setForm] = useState({
//     username: "",
//     password: "",
//   });

//   // 1. State to handle password visibility
//   const [showPassword, setShowPassword] = useState(false);

//   const handleSigninClick = () => {
//     navigate("/mainregister");
//   };

//   const handleChange = (e) => {
//     setForm({
//       ...form,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await axios.post(
//         "http://localhost:8080/api/auth/login",
//         form
//       );

//       console.log("Response:", response.data);

//       if (response.data && response.data.user.username === form.username) {
//         console.log("Login successful ✔");
//         localStorage.setItem("user", JSON.stringify(response.data.user));
//         localStorage.setItem("token", response.data.token);
//         navigate("/dashboard");
//       } else {
//         alert("Invalid username or password!");
//       }
//     } catch (err) {
//       alert("Login Failed !");
//       console.error(err);
//     }
//   };

//   return (
//     <div
//       className="h-screen w-screen flex items-center justify-center overflow-hidden"
//       style={{
//         background:
//           "radial-gradient(circle at top left, #F2EEFF, #FDFCFE 60%, #F8F5FF)",
//       }}
//     >
//       <div className="w-full h-full bg-white rounded-none md:rounded-[2.5rem] md:max-w-5xl md:h-[90vh] shadow-2xl overflow-visible flex relative mx-auto">
//         {/* Left Side - Login Form */}
//         <div className="w-full md:w-3/5 p-8 lg:p-10 flex flex-col justify-center">
//           <div className="mb-4">
//             <p className="text-xs text-gray-600">
//               <b>Welcome back !!!</b>
//             </p>
//           </div>

//           <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-5">
//             Log In
//           </h2>

//           <form onSubmit={handleSubmit} className="space-y-3">
//             {/* Username Field */}
//             <div>
//               <label className="block text-xs font-medium text-gray-700 mb-1.5">
//                 Username
//               </label>
//               <input
//                 type="text"
//                 name="username"
//                 placeholder="Username"
//                 value={form.username}
//                 onChange={handleChange}
//                 className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-[#8B5CF6] focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
//                 required
//               />
//             </div>

//             {/* Password Field */}
//             <div>
//               <div className="flex justify-between items-center mb-1.5">
//                 <label className="block text-xs font-medium text-gray-700">
//                   Password
//                 </label>
//               </div>
//               <div className="relative flex items-center">
//                 <input
//                   // 2. Dynamic type switching
//                   type={showPassword ? "text" : "password"}
//                   name="password"
//                   placeholder="*************"
//                   value={form.password}
//                   onChange={handleChange}
//                   className="w-full px-4 py-3 bg-[#F2EEFF] border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A78BFA] transition-all pr-12 text-sm text-gray-700"
//                   required
//                 />
                
//                 {/* 3. Toggle Button with high z-index */}
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute right-3 z-50 p-1 text-gray-500 hover:text-[#8B5CF6] transition-colors focus:outline-none flex items-center justify-center"
//                 >
//                   {showPassword ? (
//                     /* Eye Slash Icon (Hide) */
//                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 pointer-events-none">
//                       <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
//                     </svg>
//                   ) : (
//                     /* Eye Icon (Show) */
//                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 pointer-events-none">
//                       <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.644C3.413 8.245 7.051 4.5 12 4.5c4.949 0 8.587 3.745 9.964 7.178.07.176.07.372 0 .548C20.587 15.755 16.949 19.5 12 19.5c-4.949 0-8.587-3.745-9.964-7.178z" />
//                       <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                     </svg>
//                   )}
//                 </button>
//               </div>
//             </div>

//             {/* Login Button */}
//             <button
//               type="submit"
//               className="w-full text-white cursor-pointer py-3 px-5 rounded-full font-bold shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-wide text-xs mt-4"
//               style={{
//                 background:
//                   "linear-gradient(90deg, #8B5CF6 0%, #A78BFA 100%)",
//               }}
//             >
//               LOGIN
//               <svg
//                 className="w-4 h-4"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//                 strokeWidth={2.5}
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   d="M17 8l4 4m0 0l-4 4m4-4H3"
//                 />
//               </svg>
//             </button>

//             {/* Forgot Password */}
//             <div className="flex justify-center mb-1.5">
//               <button
//                 type="button"
//                 onClick={() => {
//                   navigate("/reset-password");
//                 }}
//                 className="text-s cursor-pointer text-gray-700 hover:text-[#8B5CF6] transition-colors"
//               >
//                 Forgot Password?
//               </button>
//             </div>

//             {/* Divider */}
//             <div className="relative my-4">
//               <div className="absolute inset-0 flex items-center">
//                 <div className="w-full border-t border-gray-200"></div>
//               </div>
//               <div className="relative flex justify-center text-xs">
//                 <span className="px-3 bg-white text-gray-500">
//                   or continue with
//                 </span>
//               </div>
//             </div>

//             {/* Sign Up Link */}
//             <p className="text-center text-xs text-gray-600 mt-4">
//               Don't have an account yet?{" "}
//               <button
//                 onClick={handleSigninClick}
//                 type="button"
//                 className="font-semibold transition-colors hover:opacity-80"
//                 style={{ color: "#8B5CF6" }}
//               >
//                 Sign up
//               </button>
//             </p>
//           </form>
//         </div>

//         {/* Right Side - Illustration */}
//         <div
//           className="hidden md:flex md:w-2/5 items-center justify-center relative overflow-visible rounded-r-[2.5rem]"
//           style={{
//             background: "linear-gradient(180deg, #8B5CF6 0%, #A78BFA 100%)",
//           }}
//         >
//           <div className="absolute bottom-0 right-8 z-20">
//             <img
//               src="/src/assets/image.png"
//               alt="Cactus decoration"
//               className="w-28 h-auto object-contain drop-shadow-xl"
//             />
//           </div>
//         </div>

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

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//3rd option of the ui
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSigninClick = () => {
    navigate("/mainregister");
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/login",
        form
      );

      console.log("Response:", response.data);

      if (response.data && response.data.user.username === form.username) {
        console.log("Login successful ✔");
        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.setItem("token", response.data.token);
        navigate("/dashboard");
      } else {
        alert("Invalid username or password!");
      }
    } catch (err) {
      alert("Login Failed !");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center p-4 overflow-hidden relative bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-1/3 -left-20 w-80 h-80 bg-violet-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-40 left-1/3 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-6xl mx-auto relative z-10">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl md:rounded-[2.5rem] shadow-2xl overflow-hidden border border-purple-100/50">
          <div className="flex flex-col md:flex-row min-h-[85vh]">
            {/* Left Side - Login Form */}
            <div className="w-full md:w-1/2 p-8 lg:p-12 flex flex-col justify-center relative">
              {/* Decorative corner accent */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-purple-500 to-violet-500 rounded-br-3xl -translate-x-2 -translate-y-2"></div>
              <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-purple-500 to-violet-500 rounded-br-3xl opacity-10 blur-xl"></div>
              
              <div className="relative z-10">
                {/* Logo/Brand */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-violet-500 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-violet-500 bg-clip-text text-transparent">
                    SecureLogin
                  </span>
                </div>

                <div className="mb-6">
                  <p className="text-sm text-purple-600 font-semibold tracking-wider uppercase">
                    Welcome back !!!
                  </p>
                  <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mt-2">
                    Log In to Your
                    <span className="block bg-gradient-to-r from-purple-600 to-violet-500 bg-clip-text text-transparent">
                      Account
                    </span>
                  </h1>
                  <p className="text-gray-600 mt-3 text-sm">
                    Enter your credentials to access your dashboard
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Username Field */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-purple-600 transition-colors">
                      Username
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        name="username"
                        placeholder="Enter your username"
                        value={form.username}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-300 placeholder-gray-400 shadow-sm"
                        required
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="group">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-semibold text-gray-700 group-focus-within:text-purple-600 transition-colors">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => navigate("/reset-password")}
                        className="text-xs font-medium text-purple-600 hover:text-purple-700 transition-colors"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Enter your password"
                        value={form.password}
                        onChange={handleChange}
                        className="w-full pl-10 pr-12 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-300 placeholder-gray-400 shadow-sm"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <svg className="w-5 h-5 text-gray-500 hover:text-purple-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-gray-500 hover:text-purple-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Login Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 px-5 rounded-2xl font-bold shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 group disabled:opacity-70 disabled:cursor-not-allowed"
                    style={{
                      background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 50%, #6D28D9 100%)",
                    }}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-white">Signing in...</span>
                      </>
                    ) : (
                      <>
                        <span className="text-white text-sm tracking-wider">LOGIN</span>
                        <svg
                          className="w-5 h-5 text-white transform group-hover:translate-x-1 transition-transform"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M17 8l4 4m0 0l-4 4m4-4H3"
                          />
                        </svg>
                      </>
                    )}
                  </button>

                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="px-4 bg-white text-sm text-gray-500">
                        or continue with
                      </span>
                    </div>
                  </div>

                  {/* Social Login Buttons */}
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      className="p-3 border border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-all duration-300 flex items-center justify-center"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="p-3 border border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-all duration-300 flex items-center justify-center"
                    >
                      <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="p-3 border border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-all duration-300 flex items-center justify-center"
                    >
                      <svg className="w-5 h-5" fill="#1DA1F2" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.213c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                    </button>
                  </div>

                  {/* Sign Up Link */}
                  <p className="text-center text-sm text-gray-600 pt-4 border-t border-gray-100">
                    Don't have an account yet?{" "}
                    <button
                      onClick={handleSigninClick}
                      type="button"
                      className="font-semibold text-purple-600 hover:text-purple-700 transition-colors hover:underline"
                    >
                      Create an account
                    </button>
                  </p>
                </form>
              </div>
            </div>

            {/* Right Side - Visual */}
            <div className="hidden md:flex md:w-1/2 relative overflow-hidden bg-gradient-to-br from-purple-600 via-violet-500 to-indigo-600">
              {/* Floating elements */}
              <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <div className="absolute bottom-20 left-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
              
              {/* Main illustration */}
              <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-12">
                <div className="mb-8">
                  <h3 className="text-3xl font-bold text-white text-center">
                    Welcome Back!
                  </h3>
                  <p className="text-purple-100/80 text-center mt-2">
                    Access your personalized dashboard
                  </p>
                </div>
                
                <div className="relative w-full max-w-md">
                  {/* Floating card elements */}
                  <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/20 rounded-3xl rotate-12"></div>
                  <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/10 rounded-3xl -rotate-12"></div>
                  
                  {/* Main illustration image */}
                  <div className="relative z-10 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                    <div className="flex items-center justify-center mb-6">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-white to-purple-100 flex items-center justify-center shadow-2xl">
                        <svg className="w-10 h-10 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="h-3 bg-white/30 rounded-full w-3/4 mx-auto"></div>
                      <div className="h-3 bg-white/20 rounded-full w-2/3 mx-auto"></div>
                      <div className="h-3 bg-white/10 rounded-full w-1/2 mx-auto"></div>
                    </div>
                  </div>
                </div>

                {/* Features list */}
                <div className="grid grid-cols-2 gap-6 mt-12 w-full max-w-md">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-white text-sm">Secure Login</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-white text-sm">Fast Access</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
////////////////////////////////////////////////////////////////////////////
//2nd option for ui
// import { useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// export default function Login() {
//   const navigate = useNavigate();
//   const [form, setForm] = useState({ username: "", password: "" });
//   const [showPassword, setShowPassword] = useState(false);

//   const handleSigninClick = () => navigate("/mainregister");
//   const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await axios.post("http://localhost:8080/api/auth/login", form);
//       if (response.data && response.data.user.username === form.username) {
//         localStorage.setItem("user", JSON.stringify(response.data.user));
//         localStorage.setItem("token", response.data.token);
//         navigate("/dashboard");
//       } else {
//         alert("Invalid username or password!");
//       }
//     } catch (err) {
//       alert("Login Failed!");
//       console.error(err);
//     }
//   };

//   return (
//     <div className="h-screen w-screen flex items-center justify-center overflow-hidden bg-[#2D1B4E] relative">
//       {/* 1. Large Organic Background Shapes (Like the yellow circles in your image) */}
//       <div className="absolute top-[-10%] left-[-5%] w-[40vw] h-[40vw] bg-[#6D28D9] rounded-full opacity-40 blur-3xl animate-pulse"></div>
//       <div className="absolute bottom-[-15%] right-[-5%] w-[45vw] h-[45vw] bg-[#4C1D95] rounded-full opacity-50 blur-3xl"></div>

//       {/* 2. The Semi-Transparent Outer Container (Glass layer) */}
//       <div className="relative z-10 w-[90%] max-w-4xl h-[80vh] bg-white/10 backdrop-blur-md rounded-[3rem] border border-white/20 flex items-center justify-center shadow-2xl">
        
//         {/* 3. The Inner Solid Form Card */}
//         <div className="w-full max-w-md bg-[#3B2667] p-10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-white/10">
          
//           {/* Logo / Icon Area */}
//           <div className="flex justify-center mb-6">
//             <div className="w-12 h-12 bg-[#A78BFA] rounded-xl rotate-45 flex items-center justify-center shadow-lg">
//                 <div className="w-6 h-6 bg-white rounded-full -rotate-45"></div>
//             </div>
//           </div>

//           <h2 className="text-3xl font-bold text-white mb-8 text-left tracking-tight">Login</h2>

//           <form onSubmit={handleSubmit} className="space-y-6">
//             {/* Username */}
//             <div className="space-y-2">
//               <label className="block text-xs font-semibold text-purple-200 uppercase tracking-wider ml-1">
//                 Username
//               </label>
//               <input
//                 type="text"
//                 name="username"
//                 placeholder="Enter username"
//                 value={form.username}
//                 onChange={handleChange}
//                 className="w-full px-5 py-4 bg-[#EDE9FE] text-gray-800 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-500/30 transition-all placeholder-gray-400"
//                 required
//               />
//             </div>

//             {/* Password */}
//             <div className="space-y-2">
//               <label className="block text-xs font-semibold text-purple-200 uppercase tracking-wider ml-1">
//                 Password
//               </label>
//               <div className="relative">
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   name="password"
//                   placeholder="••••••"
//                   value={form.password}
//                   onChange={handleChange}
//                   className="w-full px-5 py-4 bg-[#EDE9FE] text-gray-800 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-500/30 transition-all placeholder-gray-400"
//                   required
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-purple-600 transition-colors"
//                 >
//                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
//                     <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.644C3.413 8.245 7.051 4.5 12 4.5c4.949 0 8.587 3.745 9.964 7.178.07.176.07.372 0 .548C20.587 15.755 16.949 19.5 12 19.5c-4.949 0-8.587-3.745-9.964-7.178z" />
//                   </svg>
//                 </button>
//               </div>
//             </div>

//             {/* Login Button */}
//             <button
//               type="submit"
//               className="w-full bg-[#FFD666] hover:bg-[#FFC833] text-[#2D1B4E] font-bold py-4 rounded-xl shadow-lg transform transition-all active:scale-95 text-sm uppercase tracking-widest mt-4"
//             >
//               Log In
//             </button>
//           </form>

//           {/* Footer Links */}
//           <div className="mt-8 flex flex-col items-center space-y-4">
//             <button
//               onClick={() => navigate("/reset-password")}
//               className="text-xs text-purple-300 hover:text-white transition-colors"
//             >
//               Forgot Password?
//             </button>
//             <p className="text-xs text-purple-200/60">
//               Don't have an account?{" "}
//               <button onClick={handleSigninClick} className="text-[#FFD666] font-bold hover:underline">
//                 Sign up
//               </button>
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }