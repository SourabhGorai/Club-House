// import { useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import ConfirmDialog from "./ConfirmDialog";

// export default function Login() {
//   const navigate = useNavigate();
//   const API_BASE = import.meta.env.VITE_API_URL || "http://72.155.88.211:8080";

//   const [form, setForm] = useState({
//     username: "",
//     password: "",
//   });

//   const [showPassword, setShowPassword] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [dialog, setDialog] = useState({
//     isOpen: false,
//     title: "",
//     message: "",
//     variant: "primary",
//     confirmText: "OK",
//     onConfirm: () => {},
//   });

//   const closeDialog = () =>
//     setDialog((prev) => ({
//       ...prev,
//       isOpen: false,
//     }));

//   const showDialog = ({
//     title,
//     message,
//     variant = "primary",
//     confirmText = "OK",
//     onConfirm,
//   }) => {
//     setDialog({
//       isOpen: true,
//       title,
//       message,
//       variant,
//       confirmText,
//       onConfirm: () => {
//         closeDialog();
//         if (onConfirm) onConfirm();
//       },
//     });
//   };

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
//       const response = await axios.post(`${API_BASE}/api/auth/login`, form);

//       console.log("Response:", response.data);

//       if (response.data && response.data.token && response.data.user) {
//         console.log("Login successful ✔");
//         localStorage.setItem("user", JSON.stringify(response.data.user));
//         localStorage.setItem("token", response.data.token);
//         window.location.href = "/dashboard";
//       } else {
//         showDialog({
//           title: "Login Failed",
//           message: "Invalid username or password!",
//           variant: "danger",
//         });
//       }
//     } catch (err) {
//       const errorData = err.response?.data;
//       const errorMessage = (typeof errorData === 'string' ? errorData : errorData?.message) || "Login Failed!";

//       showDialog({
//         title: "Login Failed",
//         message:
//           typeof errorMessage === "string"
//             ? errorMessage
//             : JSON.stringify(errorMessage),
//         variant: "danger",
//       });
//       console.error(err);

//       // If account is not verified, we might want to redirect to verification page
//       const msgStr = String(errorMessage).toLowerCase();
//       if (err.response?.status === 403 && (msgStr.includes("verify") || msgStr.includes("verification"))) {
//         // Try to get username/email from form to help with verification
//         localStorage.setItem("verificationEmail", form.username); // Assuming username could be email
//         navigate("/otp");
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <>
//       <div
//       className="min-h-screen w-screen flex items-center justify-center p-2 xs:p-3 sm:p-4 md:p-6 overflow-hidden relative"
//       style={{ background: "var(--primary-gradient)" }}
//     >
//       {/* Background decorative elements */}
//       <div className="absolute inset-0 overflow-hidden pointer-events-none">
//         <div
//           className="absolute -top-40 -right-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"
//           style={{ backgroundColor: "var(--primary-color-1)" }}
//         ></div>
//         <div
//           className="absolute top-1/3 -left-20 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"
//           style={{ backgroundColor: "var(--primary-color-2)" }}
//         ></div>
//         <div
//           className="absolute -bottom-40 left-1/3 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"
//           style={{ backgroundColor: "var(--primary-color-1)" }}
//         ></div>
//       </div>

//       <div className="w-full max-w-6xl mx-auto relative z-10">
//         <div
//           className="bg-white/90 backdrop-blur-xl rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-2xl overflow-hidden border w-full"
//           style={{ borderColor: "var(--primary-color-1)20" }}
//         >
//           <div className="flex flex-col lg:flex-row">
//             {/* Left Side - Login Form */}
//             <div className="w-full lg:w-1/2 px-4 xs:px-5 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-6 xs:py-8 sm:py-10 flex flex-col justify-center relative">
//               {/* Decorative corner accent */}
//               <div
//                 className="absolute top-0 left-0 w-24 h-24 rounded-br-3xl -translate-x-2 -translate-y-2"
//                 style={{ background: "var(--primary-gradient)" }}
//               ></div>
//               <div
//                 className="absolute top-0 left-0 w-24 h-24 rounded-br-3xl opacity-10 blur-xl"
//                 style={{ background: "var(--primary-gradient)" }}
//               ></div>

//               <div className="relative z-10 w-full max-w-xs sm:max-w-sm">
//                 {/* Logo/Brand */}
//                 <div className="flex items-center gap-2 xs:gap-2.5 sm:gap-3 mb-4 xs:mb-5 sm:mb-6">
//                   <div
//                     className="w-7 xs:w-8 sm:w-10 h-7 xs:h-8 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0"
//                     style={{ background: "var(--primary-gradient)" }}
//                   >
//                     <svg
//                       className="w-4 xs:w-5 sm:w-6 h-4 xs:h-5 sm:h-6 text-white"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                       stroke="currentColor"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
//                       />
//                     </svg>
//                   </div>
//                   <span className="text-lg xs:text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#4CA1AF] to-[#315169] bg-clip-text text-transparent truncate">
//                     SecureLogin
//                   </span>
//                 </div>

//                 <div className="mb-4 xs:mb-5 sm:mb-6 space-y-2 xs:space-y-2.5 sm:space-y-3">
//                   <p
//                     className="text-[9px] xs:text-[10px] sm:text-xs font-semibold tracking-wider uppercase"
//                     style={{ color: "var(--primary-color-1)" }}
//                   >
//                     Welcome back
//                   </p>

//                   <h1 className="text-base xs:text-lg sm:text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
//                     Log In to Your{" "}
//                     <span className="bg-gradient-to-r from-[#4CA1AF] to-[#315169] bg-clip-text text-transparent">
//                       Account
//                     </span>
//                   </h1>

//                   <p className="text-gray-500 text-[11px] xs:text-xs sm:text-sm">
//                     Enter your credentials to access your dashboard
//                   </p>
//                 </div>

//                 <form onSubmit={handleSubmit} className="space-y-3 xs:space-y-3.5 sm:space-y-4">
//                   {/* Username Field */}
//                   <div>
//                     <label
//                       className="block text-[11px] xs:text-xs sm:text-sm font-semibold mb-1.5 xs:mb-2"
//                       style={{ color: "var(--primary-color-1)" }}
//                     >
//                       Username
//                     </label>
//                     <div className="relative">
//                       <div className="absolute inset-y-0 left-0 pl-3 xs:pl-3.5 flex items-center pointer-events-none">
//                         <svg
//                           className="w-3.5 xs:w-4 sm:w-5 h-3.5 xs:h-4 sm:h-5"
//                           style={{ color: "var(--primary-color-1)" }}
//                           fill="none"
//                           viewBox="0 0 24 24"
//                           stroke="currentColor"
//                         >
//                           <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             strokeWidth={2}
//                             d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
//                           />
//                         </svg>
//                       </div>
//                       <input
//                         type="text"
//                         name="username"
//                         placeholder="Enter your username"
//                         value={form.username}
//                         onChange={handleChange}
//                         className="w-full pl-10 xs:pl-11 pr-3 xs:pr-4 py-2.5 xs:py-3 sm:py-3.5 bg-white border border-gray-200 rounded-lg xs:rounded-xl sm:rounded-2xl focus:outline-none focus:border-transparent focus:ring-2 transition-all duration-300 placeholder-gray-400 shadow-sm text-xs xs:text-sm"
//                         required
//                       />
//                     </div>
//                   </div>

//                   {/* Password Field */}
//                   <div>
//                     <div className="flex justify-between items-center mb-1.5 xs:mb-2">
//                       <label
//                         className="block text-[11px] xs:text-xs sm:text-sm font-semibold"
//                         style={{ color: "var(--primary-color-1)" }}
//                       >
//                         Password
//                       </label>
//                       <button
//                         type="button"
//                         onClick={() => navigate("/reset-password")}
//                         className="text-[9px] xs:text-[10px] sm:text-xs font-medium transition-colors hover:opacity-70"
//                         style={{ color: "var(--primary-color-1)" }}
//                       >
//                         Forgot?
//                       </button>
//                     </div>
//                     <div className="relative">
//                       <div className="absolute inset-y-0 left-0 pl-3 xs:pl-3.5 flex items-center pointer-events-none">
//                         <svg
//                           className="w-3.5 xs:w-4 sm:w-5 h-3.5 xs:h-4 sm:h-5"
//                           style={{ color: "var(--primary-color-1)" }}
//                           fill="none"
//                           viewBox="0 0 24 24"
//                           stroke="currentColor"
//                         >
//                           <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             strokeWidth={2}
//                             d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
//                           />
//                         </svg>
//                       </div>
//                       <input
//                         type={showPassword ? "text" : "password"}
//                         name="password"
//                         placeholder="Enter your password"
//                         value={form.password}
//                         onChange={handleChange}
//                         className="w-full pl-10 xs:pl-11 pr-10 xs:pr-11 sm:pr-12 py-2.5 xs:py-3 sm:py-3.5 bg-white border border-gray-200 rounded-lg xs:rounded-xl sm:rounded-2xl focus:outline-none focus:border-transparent focus:ring-2 transition-all duration-300 placeholder-gray-400 shadow-sm text-xs xs:text-sm"
//                         required
//                       />
//                       <button
//                         type="button"
//                         onClick={() => setShowPassword(!showPassword)}
//                         className="absolute inset-y-0 right-0 pr-3 xs:pr-3.5 flex items-center cursor-pointer"
//                       >
//                         {showPassword ? (
//                           <svg
//                             className="w-3.5 xs:w-4 sm:w-5 h-3.5 xs:h-4 sm:h-5"
//                             style={{ color: "var(--primary-color-1)" }}
//                             fill="none"
//                             viewBox="0 0 24 24"
//                             stroke="currentColor"
//                           >
//                             <path
//                               strokeLinecap="round"
//                               strokeLinejoin="round"
//                               strokeWidth={2}
//                               d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
//                             />
//                           </svg>
//                         ) : (
//                           <svg
//                             className="w-3.5 xs:w-4 sm:w-5 h-3.5 xs:h-4 sm:h-5"
//                             style={{ color: "var(--primary-color-1)" }}
//                             fill="none"
//                             viewBox="0 0 24 24"
//                             stroke="currentColor"
//                           >
//                             <path
//                               strokeLinecap="round"
//                               strokeLinejoin="round"
//                               strokeWidth={2}
//                               d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
//                             />
//                             <path
//                               strokeLinecap="round"
//                               strokeLinejoin="round"
//                               strokeWidth={2}
//                               d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
//                             />
//                           </svg>
//                         )}
//                       </button>
//                     </div>
//                   </div>

//                   {/* Login Button */}
//                   <button
//                     type="submit"
//                     disabled={isLoading}
//                     className="w-full py-2.5 xs:py-3 sm:py-3.5 px-4 xs:px-5 rounded-lg xs:rounded-xl sm:rounded-2xl font-bold shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed mt-3 xs:mt-3.5 sm:mt-4"
//                     style={{ background: "var(--primary-gradient)" }}
//                   >
//                     {isLoading ? (
//                       <>
//                         <div className="w-3 xs:w-3.5 sm:w-4 h-3 xs:h-3.5 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                         <span className="text-white text-xs xs:text-sm">
//                           Signing in...
//                         </span>
//                       </>
//                     ) : (
//                       <>
//                         <span className="text-white text-xs xs:text-sm tracking-wider">
//                           LOGIN
//                         </span>
//                         <svg
//                           className="w-3 xs:w-3.5 sm:w-4 h-3 xs:h-3.5 sm:h-4 text-white transform group-hover:translate-x-1 transition-transform"
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

//                   {/* Sign Up Link */}
//                   <p className="text-center text-[10px] xs:text-xs sm:text-sm text-gray-600 pt-3 xs:pt-3.5 sm:pt-4 border-t border-gray-100 mt-3 xs:mt-3.5 sm:mt-4">
//                     Don't have an account?{" "}
//                     <button
//                       onClick={handleSigninClick}
//                       type="button"
//                       className="font-semibold transition-colors hover:underline whitespace-nowrap"
//                       style={{ color: "var(--primary-color-1)" }}
//                     >
//                       Sign up
//                     </button>
//                   </p>
//                 </form>
//               </div>
//             </div>

//             {/* Right Side - Visual */}
//             <div
//               className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
//               style={{ background: "var(--primary-gradient)" }}
//             >
//               {/* Floating blobs */}
//               <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
//               <div className="absolute bottom-20 left-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>

//               <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-8">
//                 <div className="mb-6 text-center">
//                   <h3 className="text-2xl lg:text-3xl font-bold text-white">
//                     Welcome Back!
//                   </h3>
//                   <p className="text-white/80 mt-1 text-sm">
//                     Access your personalized dashboard
//                   </p>
//                 </div>

//                 <div className="relative w-full max-w-xs">
//                   <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/20 rounded-3xl rotate-12"></div>
//                   <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/10 rounded-3xl -rotate-12"></div>

//                   <div className="relative z-10 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm rounded-3xl p-6 border border-white/20">
//                     <div className="flex items-center justify-center mb-4">
//                       <div className="w-16 h-16 rounded-full bg-gradient-to-br from-white to-[#4CA1AF]/20 flex items-center justify-center shadow-2xl">
//                         <svg
//                           className="w-8 h-8"
//                           style={{ color: "var(--primary-color-1)" }}
//                           fill="none"
//                           viewBox="0 0 24 24"
//                           stroke="currentColor"
//                         >
//                           <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             strokeWidth={2}
//                             d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
//                           />
//                         </svg>
//                       </div>
//                     </div>
//                     <div className="space-y-3">
//                       <div className="h-2 bg-white/30 rounded-full w-3/4 mx-auto"></div>
//                       <div className="h-2 bg-white/20 rounded-full w-2/3 mx-auto"></div>
//                       <div className="h-2 bg-white/10 rounded-full w-1/2 mx-auto"></div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Features list */}
//                 <div className="grid grid-cols-2 gap-4 mt-8 w-full max-w-xs">
//                   <div className="flex items-center gap-2">
//                     <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
//                       <svg
//                         className="w-3.5 h-3.5 text-white"
//                         fill="none"
//                         viewBox="0 0 24 24"
//                         stroke="currentColor"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M5 13l4 4L19 7"
//                         />
//                       </svg>
//                     </div>
//                     <span className="text-white text-lg">Secure Login</span>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
//                       <svg
//                         className="w-3.5 h-3.5 text-white"
//                         fill="none"
//                         viewBox="0 0 24 24"
//                         stroke="currentColor"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M5 13l4 4L19 7"
//                         />
//                       </svg>
//                     </div>
//                     <span className="text-white text-xs">Fast Access</span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//       </div>

//       <ConfirmDialog
//         isOpen={dialog.isOpen}
//         title={dialog.title}
//         message={dialog.message}
//         variant={dialog.variant}
//         confirmText={dialog.confirmText}
//         cancelText="Close"
//         onConfirm={dialog.onConfirm}
//         onCancel={closeDialog}
//       />
//     </>
//   );
// }


import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ConfirmDialog from "./ConfirmDialog";

export default function Login() {
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_URL || "http://72.155.88.211:8080";

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dialog, setDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    variant: "primary",
    confirmText: "OK",
    onConfirm: () => {},
  });

  const closeDialog = () =>
    setDialog((prev) => ({
      ...prev,
      isOpen: false,
    }));

  const showDialog = ({
    title,
    message,
    variant = "primary",
    confirmText = "OK",
    onConfirm,
  }) => {
    setDialog({
      isOpen: true,
      title,
      message,
      variant,
      confirmText,
      onConfirm: () => {
        closeDialog();
        if (onConfirm) onConfirm();
      },
    });
  };

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
        showDialog({
          title: "Login Failed",
          message: "Invalid username or password!",
          variant: "danger",
        });
      }
    } catch (err) {
      const errorData = err.response?.data;
      const errorMessage = (typeof errorData === 'string' ? errorData : errorData?.message) || "Login Failed!";

      showDialog({
        title: "Login Failed",
        message:
          typeof errorMessage === "string"
            ? errorMessage
            : JSON.stringify(errorMessage),
        variant: "danger",
      });
      console.error(err);

      const msgStr = String(errorMessage).toLowerCase();
      if (err.response?.status === 403 && (msgStr.includes("verify") || msgStr.includes("verification"))) {
        localStorage.setItem("verificationEmail", form.username);
        navigate("/otp");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div
        className="min-h-screen w-full flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-hidden relative"
        style={{ background: "var(--primary-gradient)" }}
      >
        {/* Background decorative elements - optimized for mobile */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute -top-40 -right-40 w-64 sm:w-80 h-64 sm:h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-20 sm:opacity-30 animate-blob"
            style={{ backgroundColor: "var(--primary-color-1)" }}
          ></div>
          <div
            className="absolute top-1/3 -left-20 w-64 sm:w-80 h-64 sm:h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-20 sm:opacity-30 animate-blob animation-delay-2000"
            style={{ backgroundColor: "var(--primary-color-2)" }}
          ></div>
          <div
            className="absolute -bottom-40 left-1/3 w-64 sm:w-80 h-64 sm:h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-20 sm:opacity-30 animate-blob animation-delay-4000"
            style={{ backgroundColor: "var(--primary-color-1)" }}
          ></div>
        </div>

        <div className="w-full max-w-7xl mx-auto relative z-10">
          <div
            className="bg-white/90 backdrop-blur-xl rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-2xl overflow-hidden border w-full"
            style={{ borderColor: "var(--primary-color-1)20" }}
          >
            <div className="flex flex-col lg:flex-row min-h-[500px] lg:min-h-[600px]">
              {/* Left Side - Login Form */}
              <div className="w-full lg:w-1/2 px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-6 sm:py-8 md:py-10 flex flex-col justify-center relative order-2 lg:order-1">
                {/* Decorative corner accent - adjusted for mobile */}
                <div
                  className="absolute top-0 left-0 w-16 sm:w-20 lg:w-24 h-16 sm:h-20 lg:h-24 rounded-br-2xl lg:rounded-br-3xl -translate-x-2 -translate-y-2"
                  style={{ background: "var(--primary-gradient)" }}
                ></div>
                <div
                  className="absolute top-0 left-0 w-16 sm:w-20 lg:w-24 h-16 sm:h-20 lg:h-24 rounded-br-2xl lg:rounded-br-3xl opacity-10 blur-xl"
                  style={{ background: "var(--primary-gradient)" }}
                ></div>

                <div className="relative z-10 w-full max-w-md mx-auto lg:mx-0">
                  {/* Logo/Brand - responsive sizing */}
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5 md:mb-6">
                    <div
                      className="w-8 sm:w-9 md:w-10 h-8 sm:h-9 md:h-10 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "var(--primary-gradient)" }}
                    >
                      <svg
                        className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 text-white"
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
                    <span className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-[#4CA1AF] to-[#315169] bg-clip-text text-transparent">
                      SecureLogin
                    </span>
                  </div>

                  <div className="mb-4 sm:mb-5 md:mb-6 space-y-1 sm:space-y-2">
                    <p
                      className="text-[10px] sm:text-xs font-semibold tracking-wider uppercase"
                      style={{ color: "var(--primary-color-1)" }}
                    >
                      Welcome back
                    </p>

                    <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                      Log In to Your{" "}
                      <span className="block sm:inline bg-gradient-to-r from-[#4CA1AF] to-[#315169] bg-clip-text text-transparent">
                        Account
                      </span>
                    </h1>

                    <p className="text-gray-500 text-xs sm:text-sm">
                      Enter your credentials to access your dashboard
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                    {/* Username Field */}
                    <div>
                      <label
                        className="block text-xs sm:text-sm font-semibold mb-1.5 sm:mb-2"
                        style={{ color: "var(--primary-color-1)" }}
                      >
                        Username
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                          <svg
                            className="w-4 sm:w-5 h-4 sm:h-5"
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
                          className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-white border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:border-transparent focus:ring-2 transition-all duration-300 placeholder-gray-400 shadow-sm text-sm"
                          style={{ focusRing: "var(--primary-color-1)20" }}
                          required
                        />
                      </div>
                    </div>

                    {/* Password Field */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5 sm:mb-2">
                        <label
                          className="block text-xs sm:text-sm font-semibold"
                          style={{ color: "var(--primary-color-1)" }}
                        >
                          Password
                        </label>
                        <button
                          type="button"
                          onClick={() => navigate("/reset-password")}
                          className="text-xs sm:text-sm font-medium transition-colors hover:opacity-70"
                          style={{ color: "var(--primary-color-1)" }}
                        >
                          Forgot?
                        </button>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                          <svg
                            className="w-4 sm:w-5 h-4 sm:h-5"
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
                          className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 bg-white border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:border-transparent focus:ring-2 transition-all duration-300 placeholder-gray-400 shadow-sm text-sm"
                          style={{ focusRing: "var(--primary-color-1)20" }}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center"
                        >
                          {showPassword ? (
                            <svg
                              className="w-4 sm:w-5 h-4 sm:h-5"
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
                              className="w-4 sm:w-5 h-4 sm:h-5"
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
                      className="w-full py-2.5 sm:py-3 px-4 sm:px-5 rounded-lg sm:rounded-xl font-bold shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed mt-4 sm:mt-6"
                      style={{ background: "var(--primary-gradient)" }}
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 sm:w-5 h-4 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-white text-sm sm:text-base">
                            Signing in...
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-white text-sm sm:text-base tracking-wider">
                            LOGIN
                          </span>
                          <svg
                            className="w-4 sm:w-5 h-4 sm:h-5 text-white transform group-hover:translate-x-1 transition-transform"
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
                    <p className="text-center text-xs sm:text-sm text-gray-600 pt-3 sm:pt-4 border-t border-gray-100 mt-4 sm:mt-6">
                      Don't have an account?{" "}
                      <button
                        onClick={handleSigninClick}
                        type="button"
                        className="font-semibold transition-colors hover:underline"
                        style={{ color: "var(--primary-color-1)" }}
                      >
                        Sign up
                      </button>
                    </p>
                  </form>
                </div>
              </div>

              {/* Right Side - Visual (Hidden on mobile, shown on lg screens) */}
              <div
                className="hidden lg:flex lg:w-1/2 relative overflow-hidden order-1 lg:order-2"
                style={{ background: "var(--primary-gradient)" }}
              >
                {/* Floating blobs */}
                <div className="absolute top-10 right-10 w-24 lg:w-32 h-24 lg:h-32 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute bottom-20 left-10 w-32 lg:w-40 h-32 lg:h-40 bg-white/5 rounded-full blur-2xl"></div>

                <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-6 lg:p-8">
                  <div className="mb-4 lg:mb-6 text-center">
                    <h3 className="text-xl lg:text-2xl xl:text-3xl font-bold text-white">
                      Welcome Back!
                    </h3>
                    <p className="text-white/80 mt-1 text-sm lg:text-base">
                      Access your personalized dashboard
                    </p>
                  </div>

                  <div className="relative w-full max-w-xs">
                    <div className="absolute -top-4 -right-4 w-16 lg:w-20 h-16 lg:h-20 bg-white/20 rounded-2xl lg:rounded-3xl rotate-12"></div>
                    <div className="absolute -bottom-4 -left-4 w-16 lg:w-20 h-16 lg:h-20 bg-white/10 rounded-2xl lg:rounded-3xl -rotate-12"></div>

                    <div className="relative z-10 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm rounded-2xl lg:rounded-3xl p-4 lg:p-6 border border-white/20">
                      <div className="flex items-center justify-center mb-3 lg:mb-4">
                        <div className="w-12 lg:w-14 xl:w-16 h-12 lg:h-14 xl:h-16 rounded-full bg-gradient-to-br from-white to-[#4CA1AF]/20 flex items-center justify-center shadow-2xl">
                          <svg
                            className="w-6 lg:w-7 xl:w-8 h-6 lg:h-7 xl:h-8"
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
                      <div className="space-y-2 lg:space-y-3">
                        <div className="h-1.5 lg:h-2 bg-white/30 rounded-full w-3/4 mx-auto"></div>
                        <div className="h-1.5 lg:h-2 bg-white/20 rounded-full w-2/3 mx-auto"></div>
                        <div className="h-1.5 lg:h-2 bg-white/10 rounded-full w-1/2 mx-auto"></div>
                      </div>
                    </div>
                  </div>

                  {/* Features list - adjusted for better spacing */}
                  <div className="grid grid-cols-2 gap-3 lg:gap-4 mt-6 lg:mt-8 w-full max-w-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-5 lg:w-6 h-5 lg:h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-3 lg:w-3.5 h-3 lg:h-3.5 text-white"
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
                      <span className="text-white text-xs lg:text-sm">Secure Login</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-5 lg:w-6 h-5 lg:h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-3 lg:w-3.5 h-3 lg:h-3.5 text-white"
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
                      <span className="text-white text-xs lg:text-sm">Fast Access</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={dialog.isOpen}
        title={dialog.title}
        message={dialog.message}
        variant={dialog.variant}
        confirmText={dialog.confirmText}
        cancelText="Close"
        onConfirm={dialog.onConfirm}
        onCancel={closeDialog}
      />
    </>
  );
}