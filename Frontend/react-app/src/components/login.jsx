import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

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
      const response = await axios.post(`${API_BASE}/api/auth/login`, form);

      console.log("Response:", response.data);

      if (response.data && response.data.token && response.data.user) {
        console.log("Login successful ✔");
        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.setItem("token", response.data.token);
        window.location.href = "/dashboard";
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
    <div
      className="h-screen w-screen flex items-center justify-center p-3 overflow-hidden relative"
      style={{ background: "var(--primary-gradient)" }}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"
          style={{ backgroundColor: "var(--primary-color-1)" }}
        ></div>
        <div
          className="absolute top-1/3 -left-20 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"
          style={{ backgroundColor: "var(--primary-color-2)" }}
        ></div>
        <div
          className="absolute -bottom-40 left-1/3 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"
          style={{ backgroundColor: "var(--primary-color-1)" }}
        ></div>
      </div>

      <div className="w-full max-w-6xl h-full max-h-[98vh] mx-auto relative z-10 flex items-center">
        <div
          className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border w-full"
          style={{
            borderColor: "var(--primary-color-1)20",
            height: "min(95vh, 700px)",
          }}
        >
          <div className="flex flex-col md:flex-row h-full">
            {/* Left Side - Login Form */}
            <div className="w-full md:w-1/2 px-6 py-4 lg:px-10 lg:py-6 flex flex-col justify-center relative overflow-hidden">
              {/* Decorative corner accent */}
              <div
                className="absolute top-0 left-0 w-24 h-24 rounded-br-3xl -translate-x-2 -translate-y-2"
                style={{ background: "var(--primary-gradient)" }}
              ></div>
              <div
                className="absolute top-0 left-0 w-24 h-24 rounded-br-3xl opacity-10 blur-xl"
                style={{ background: "var(--primary-gradient)" }}
              ></div>

              <div className="relative z-10">
                {/* Logo/Brand */}
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "var(--primary-gradient)" }}
                  >
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-[#4CA1AF] to-[#315169] bg-clip-text text-transparent">
                    SecureLogin
                  </span>
                </div>

                <div className="mb-6 space-y-8">
                  <p
                    className="text-xs font-semibold tracking-wider uppercase"
                    style={{ color: "var(--primary-color-1)" }}
                  >
                    Welcome back !!!
                  </p>

                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                    Log In to Your{" "}
                    <span className="bg-gradient-to-r from-[#4CA1AF] to-[#315169] bg-clip-text text-transparent">
                      Account
                    </span>
                  </h1>

                  <p className="text-gray-500 text-xs">
                    Enter your credentials to access your dashboard
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                  {/* Username Field */}
                  <div>
                    <label
                      className="block text-xs font-semibold mb-1"
                      style={{ color: "var(--primary-color-1)" }}
                    >
                      Username
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg
                          className="w-4 h-4"
                          style={{ color: "var(--primary-color-1)" }}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <input
                        type="text"
                        name="username"
                        placeholder="Enter your username"
                        value={form.username}
                        onChange={handleChange}
                        className="w-full pl-9 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 transition-all duration-300 placeholder-gray-400 shadow-sm text-sm"
                        required
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label
                        className="block text-xs font-semibold"
                        style={{ color: "var(--primary-color-1)" }}
                      >
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => navigate("/reset-password")}
                        className="text-xs font-medium transition-colors"
                        style={{ color: "var(--primary-color-1)" }}
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg
                          className="w-4 h-4"
                          style={{ color: "var(--primary-color-1)" }}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Enter your password"
                        value={form.password}
                        onChange={handleChange}
                        className="w-full pl-9 pr-12 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 transition-all duration-300 placeholder-gray-400 shadow-sm text-sm"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <svg
                            className="w-4 h-4"
                            style={{ color: "var(--primary-color-1)" }}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-4 h-4"
                            style={{ color: "var(--primary-color-1)" }}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Login Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-5 rounded-2xl font-bold shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 group disabled:opacity-70 disabled:cursor-not-allowed mt-1"
                    style={{ background: "var(--primary-gradient)" }}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-white text-sm">
                          Signing in...
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-white text-sm tracking-wider">
                          LOGIN
                        </span>
                        <svg
                          className="w-4 h-4 text-white transform group-hover:translate-x-1 transition-transform"
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

                  {/* Sign Up Link */}
                  <p className="text-center text-xs text-gray-600 pt-2 border-t border-gray-100">
                    Don't have an account yet?{" "}
                    <button
                      onClick={handleSigninClick}
                      type="button"
                      className="font-semibold transition-colors hover:underline"
                      style={{ color: "var(--primary-color-1)" }}
                    >
                      Create an account
                    </button>
                  </p>
                </form>
              </div>
            </div>

            {/* Right Side - Visual */}
            <div
              className="hidden md:flex md:w-1/2 relative overflow-hidden"
              style={{ background: "var(--primary-gradient)" }}
            >
              {/* Floating blobs */}
              <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <div className="absolute bottom-20 left-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>

              <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-8">
                <div className="mb-6 text-center">
                  <h3 className="text-2xl lg:text-3xl font-bold text-white">
                    Welcome Back!
                  </h3>
                  <p className="text-white/80 mt-1 text-sm">
                    Access your personalized dashboard
                  </p>
                </div>

                <div className="relative w-full max-w-xs">
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/20 rounded-3xl rotate-12"></div>
                  <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/10 rounded-3xl -rotate-12"></div>

                  <div className="relative z-10 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm rounded-3xl p-6 border border-white/20">
                    <div className="flex items-center justify-center mb-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-white to-[#4CA1AF]/20 flex items-center justify-center shadow-2xl">
                        <svg
                          className="w-8 h-8"
                          style={{ color: "var(--primary-color-1)" }}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-2 bg-white/30 rounded-full w-3/4 mx-auto"></div>
                      <div className="h-2 bg-white/20 rounded-full w-2/3 mx-auto"></div>
                      <div className="h-2 bg-white/10 rounded-full w-1/2 mx-auto"></div>
                    </div>
                  </div>
                </div>

                {/* Features list */}
                <div className="grid grid-cols-2 gap-4 mt-8 w-full max-w-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-3.5 h-3.5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span className="text-white text-lg">Secure Login</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-3.5 h-3.5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span className="text-white text-xs">Fast Access</span>
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

// import { useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// export default function Login() {
//   const navigate = useNavigate();

//   const [form, setForm] = useState({
//     username: "",
//     password: "",
//   });

//   const [showPassword, setShowPassword] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

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
//     setIsLoading(true);
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
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen w-screen flex items-center justify-center p-4 overflow-hidden relative"
//          style={{background: 'var(--primary-gradient)'}}>
//       {/* Background decorative elements - updated to use your colors */}
//       <div className="absolute inset-0 overflow-hidden">
//         <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"
//              style={{backgroundColor: 'var(--primary-color-1)'}}></div>
//         <div className="absolute top-1/3 -left-20 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"
//              style={{backgroundColor: 'var(--primary-color-2)'}}></div>
//         <div className="absolute -bottom-40 left-1/3 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"
//              style={{backgroundColor: 'var(--primary-color-1)'}}></div>
//       </div>

//       <div className="w-full max-w-6xl mx-auto relative z-10">
//         <div className="bg-white/90 backdrop-blur-xl rounded-3xl md:rounded-[2.5rem] shadow-2xl overflow-hidden border"
//              style={{borderColor: 'var(--primary-color-1)20'}}>
//           <div className="flex flex-col md:flex-row min-h-[85vh]">
//             {/* Left Side - Login Form */}
//             <div className="w-full md:w-1/2 p-8 lg:p-12 flex flex-col justify-center relative">
//               {/* Decorative corner accent - updated to use your gradient */}
//               <div className="absolute top-0 left-0 w-32 h-32 rounded-br-3xl -translate-x-2 -translate-y-2"
//                    style={{background: 'var(--primary-gradient)'}}></div>
//               <div className="absolute top-0 left-0 w-32 h-32 rounded-br-3xl opacity-10 blur-xl"
//                    style={{background: 'var(--primary-gradient)'}}></div>

//               <div className="relative z-10">
//                 {/* Logo/Brand - updated to use your gradient */}
//                 <div className="flex items-center gap-3 mb-6">
//                   <div className="w-10 h-10 rounded-xl flex items-center justify-center"
//                        style={{background: 'var(--primary-gradient)'}}>
//                     <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
//                     </svg>
//                   </div>
//                   <span className="text-2xl font-bold bg-gradient-to-r from-[#4CA1AF] to-[#315169] bg-clip-text text-transparent">
//                     SecureLogin
//                   </span>
//                 </div>

//                 <div className="mb-9">
//                   <p className="text-sm font-semibold tracking-wider uppercase mt-8"
//                      style={{color: 'var(--primary-color-1)'}}>
//                     Welcome back !!!
//                   </p>
//                   <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mt-2">
//                     Log In to Your
//                     <span className="block bg-gradient-to-r from-[#4CA1AF] to-[#315169] bg-clip-text text-transparent">
//                       Account
//                     </span>
//                   </h1>
//                   <p className="text-gray-600 mt-3 text-sm">
//                     Enter your credentials to access your dashboard
//                   </p>
//                 </div>

//                 <form onSubmit={handleSubmit} className="space-y-6">
//                   {/* Username Field */}
//                   <div className="group">
//                     <label className="block text-sm font-semibold text-gray-700 mb-2 transition-colors"
//                            style={{color: 'var(--primary-color-1)'}}>
//                       Username
//                     </label>
//                     <div className="relative">
//                       <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                         <svg className="w-5 h-5 transition-colors"
//                              style={{color: 'var(--primary-color-1)'}}
//                              fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//                         </svg>
//                       </div>
//                       <input
//                         type="text"
//                         name="username"
//                         placeholder="Enter your username"
//                         value={form.username}
//                         onChange={handleChange}
//                         className="w-full pl-10 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 transition-all duration-300 placeholder-gray-400 shadow-sm"
//                         style={{focusRing: 'var(--primary-color-1)20'}}
//                         required
//                       />
//                     </div>
//                   </div>

//                   {/* Password Field */}
//                   <div className="group">
//                     <div className="flex justify-between items-center mb-2">
//                       <label className="block text-sm font-semibold text-gray-700 transition-colors"
//                              style={{color: 'var(--primary-color-1)'}}>
//                         Password
//                       </label>
//                       <button
//                         type="button"
//                         onClick={() => navigate("/reset-password")}
//                         className="text-xs font-medium transition-colors"
//                         style={{color: 'var(--primary-color-1)'}}
//                       >
//                         Forgot Password?
//                       </button>
//                     </div>
//                     <div className="relative">
//                       <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                         <svg className="w-5 h-5 transition-colors"
//                              style={{color: 'var(--primary-color-1)'}}
//                              fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
//                         </svg>
//                       </div>
//                       <input
//                         type={showPassword ? "text" : "password"}
//                         name="password"
//                         placeholder="Enter your password"
//                         value={form.password}
//                         onChange={handleChange}
//                         className="w-full pl-10 pr-12 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 transition-all duration-300 placeholder-gray-400 shadow-sm"
//                         style={{focusRing: 'var(--primary-color-1)20'}}
//                         required
//                       />
//                       <button
//                         type="button"
//                         onClick={() => setShowPassword(!showPassword)}
//                         className="absolute inset-y-0 right-0 pr-3 flex items-center"
//                       >
//                         {showPassword ? (
//                           <svg className="w-5 h-5 transition-colors"
//                                style={{color: 'var(--primary-color-1)'}}
//                                fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
//                           </svg>
//                         ) : (
//                           <svg className="w-5 h-5 transition-colors"
//                                style={{color: 'var(--primary-color-1)'}}
//                                fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
//                           </svg>
//                         )}
//                       </button>
//                     </div>
//                   </div>

//                   {/* Login Button - updated to use your gradient */}
//                   <button
//                     type="submit"
//                     disabled={isLoading}
//                     className="w-full py-4 px-5 rounded-2xl font-bold shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 group disabled:opacity-70 disabled:cursor-not-allowed"
//                     style={{
//                       background: 'var(--primary-gradient)',
//                     }}
//                   >
//                     {isLoading ? (
//                       <>
//                         <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                         <span className="text-white">Signing in...</span>
//                       </>
//                     ) : (
//                       <>
//                         <span className="text-white text-sm tracking-wider">LOGIN</span>
//                         <svg
//                           className="w-5 h-5 text-white transform group-hover:translate-x-1 transition-transform"
//                           fill="none"
//                           viewBox="0 0 24 24"
//                           stroke="currentColor"
//                         >
//                           <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             strokeWidth={2.5}
//                             d="M17 8l4 4m0 0l-4 4m4-4H3"
//                           />
//                         </svg>
//                       </>
//                     )}
//                   </button>

//                   {/* Divider */}
//                   <div className="relative my-6">
//                     <div className="absolute inset-0 flex items-center">
//                       <div className="w-full border-t border-gray-200"></div>
//                     </div>
//                     {/* <div className="relative flex justify-center">
//                       <span className="px-4 bg-white text-sm text-gray-500">
//                         or continue with
//                       </span>
//                     </div> */}
//                   </div>

//                   {/* Sign Up Link */}
//                   <p className="text-center text-sm text-gray-600 pt-4 border-t border-gray-100">
//                     Don't have an account yet?{" "}
//                     <button
//                       onClick={handleSigninClick}
//                       type="button"
//                       className="font-semibold transition-colors hover:underline"
//                       style={{color: 'var(--primary-color-1)'}}
//                     >
//                       Create an account
//                     </button>
//                   </p>
//                 </form>
//               </div>
//             </div>

//             {/* Right Side - Visual - updated to use your gradient */}
//             <div className="hidden md:flex md:w-1/2 relative overflow-hidden"
//                  style={{background: 'var(--primary-gradient)'}}>
//               {/* Floating elements */}
//               <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
//               <div className="absolute bottom-20 left-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>

//               {/* Main illustration */}
//               <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-12">
//                 <div className="mb-8">
//                   <h3 className="text-3xl font-bold text-white text-center">
//                     Welcome Back!
//                   </h3>
//                   <p className="text-white/80 text-center mt-2">
//                     Access your personalized dashboard
//                   </p>
//                 </div>

//                 <div className="relative w-full max-w-md">
//                   {/* Floating card elements */}
//                   <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/20 rounded-3xl rotate-12"></div>
//                   <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/10 rounded-3xl -rotate-12"></div>

//                   {/* Main illustration image */}
//                   <div className="relative z-10 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
//                     <div className="flex items-center justify-center mb-6">
//                       <div className="w-20 h-20 rounded-full bg-gradient-to-br from-white to-[#4CA1AF]/20 flex items-center justify-center shadow-2xl">
//                         <svg className="w-10 h-10" style={{color: 'var(--primary-color-1)'}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
//                         </svg>
//                       </div>
//                     </div>
//                     <div className="space-y-4">
//                       <div className="h-3 bg-white/30 rounded-full w-3/4 mx-auto"></div>
//                       <div className="h-3 bg-white/20 rounded-full w-2/3 mx-auto"></div>
//                       <div className="h-3 bg-white/10 rounded-full w-1/2 mx-auto"></div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Features list */}
//                 <div className="grid grid-cols-2 gap-6 mt-12 w-full max-w-md">
//                   <div className="flex items-center gap-3">
//                     <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
//                       <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                       </svg>
//                     </div>
//                     <span className="text-white text-sm">Secure Login</span>
//                   </div>
//                   <div className="flex items-center gap-3">
//                     <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
//                       <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                       </svg>
//                     </div>
//                     <span className="text-white text-sm">Fast Access</span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
