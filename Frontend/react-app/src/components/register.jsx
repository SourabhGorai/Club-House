import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_URL || "http://72.155.88.211:8080";

export default function Register() {
  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    prn: "",
    username: "",
    password: "",
    email: "",
    role: "USERS",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignInClick = () => {
    navigate("/login");
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      console.log("Sending registration data:", form);
      
      const res = await axios.post(
        `${BASE_URL}/api/auth/register`,
        form,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      console.log("Registration response:", res.data);
      alert("Registration Successful!");
      localStorage.setItem("verificationEmail", form.email);
      navigate("/otp");
    } catch (err) {
      console.error("Registration error:", err);
      const errorMessage = err.response?.data?.message || err.response?.data || "Registration Failed!";
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center p-2 xs:p-3 sm:p-4 md:p-6 overflow-hidden relative" 
         style={{background: 'var(--primary-gradient)'}}>
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"
             style={{backgroundColor: 'var(--primary-color-1)'}}></div>
        <div className="absolute top-1/3 -left-20 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"
             style={{backgroundColor: 'var(--primary-color-2)'}}></div>
        <div className="absolute -bottom-40 left-1/3 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"
             style={{backgroundColor: 'var(--primary-color-1)'}}></div>
      </div>

      <div className="w-full max-w-6xl mx-auto relative z-10">
        <div className="bg-white/90 backdrop-blur-xl rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-2xl overflow-hidden border w-full"
             style={{borderColor: 'var(--primary-color-1)20'}}>
          <div className="flex flex-col lg:flex-row">
            {/* Left Side - Register Form */}
            <div className="w-full lg:w-1/2 px-4 xs:px-5 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-6 xs:py-8 sm:py-10 flex flex-col justify-center relative">
              {/* Decorative corner accent */}
              <div className="absolute top-0 left-0 w-32 h-32 rounded-br-3xl -translate-x-2 -translate-y-2"
                   style={{background: 'var(--primary-gradient)'}}></div>
              <div className="absolute top-0 left-0 w-32 h-32 rounded-br-3xl opacity-10 blur-xl"
                   style={{background: 'var(--primary-gradient)'}}></div>
              
              <div className="relative z-10">
                {/* Logo/Brand */}
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center"
                       style={{background: 'var(--primary-gradient)'}}>
                    <svg className="w-5 sm:w-6 h-5 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <span className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-[#4CA1AF] to-[#315169] bg-clip-text text-transparent">
                    SecureSignup
                  </span>
                </div>

                <div className="mb-4 sm:mb-6">
                  <p className="text-[10px] sm:text-sm font-semibold tracking-wider uppercase mt-4 sm:mt-6"
                     style={{color: 'var(--primary-color-1)'}}>
                    Create your account
                  </p>
                  <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mt-2 sm:mt-3">
                    Join Our
                    <span className="block bg-gradient-to-r from-[#4CA1AF] to-[#315169] bg-clip-text text-transparent">
                      Community
                    </span>
                  </h1>
                  <p className="text-gray-600 mt-3 text-sm">
                    Fill in your details to create a new account
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3 xs:space-y-3.5 sm:space-y-4">
                  {/* PRN Field */}
                  <div className="group">
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 xs:mb-2 transition-colors\"
                           style={{color: 'var(--primary-color-1)'}}>
                      PRN
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 transition-colors" 
                             style={{color: 'var(--primary-color-1)'}} 
                             fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        name="prn"
                        placeholder="Enter your PRN"
                        value={form.prn}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-4 transition-all duration-300 placeholder-gray-400 shadow-sm"
                        style={{focusRing: 'var(--primary-color-1)20'}}
                        required
                      />
                    </div>
                  </div>

                  {/* Username Field */}
                  <div className="group">
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 xs:mb-2 transition-colors\"
                           style={{color: 'var(--primary-color-1)'}}>
                      Username
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 transition-colors" 
                             style={{color: 'var(--primary-color-1)'}} 
                             fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        name="username"
                        placeholder="Choose a username"
                        value={form.username}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-4 transition-all duration-300 placeholder-gray-400 shadow-sm"
                        style={{focusRing: 'var(--primary-color-1)20'}}
                        required
                      />
                    </div>
                  </div>

                  {/* Email Field */}
                  <div className="group">
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 xs:mb-2 transition-colors\"
                           style={{color: 'var(--primary-color-1)'}}>
                      Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 transition-colors" 
                             style={{color: 'var(--primary-color-1)'}} 
                             fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <input
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-4 transition-all duration-300 placeholder-gray-400 shadow-sm"
                        style={{focusRing: 'var(--primary-color-1)20'}}
                        required
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="group">
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 xs:mb-2 transition-colors\"
                           style={{color: 'var(--primary-color-1)'}}>
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 transition-colors" 
                             style={{color: 'var(--primary-color-1)'}} 
                             fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Create a password"
                        value={form.password}
                        onChange={handleChange}
                        className="w-full pl-10 pr-12 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-4 transition-all duration-300 placeholder-gray-400 shadow-sm"
                        style={{focusRing: 'var(--primary-color-1)20'}}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <svg className="w-5 h-5 transition-colors" 
                               style={{color: 'var(--primary-color-1)'}} 
                               fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 transition-colors" 
                               style={{color: 'var(--primary-color-1)'}} 
                               fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Register Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 xs:py-3 sm:py-3.5 px-4 xs:px-5 rounded-lg xs:rounded-xl sm:rounded-2xl font-bold shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed mt-3 xs:mt-3.5 sm:mt-4"
                    style={{
                      background: 'var(--primary-gradient)',
                    }}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-white">Creating Account...</span>
                      </>
                    ) : (
                      <>
                        <span className="text-white text-sm tracking-wider">CREATE ACCOUNT</span>
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
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
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
                    {/* <div className="relative flex justify-center">
                      <span className="px-4 bg-white text-sm text-gray-500">
                        or
                      </span>
                    </div> */}
                  </div>

                  {/* Sign In Link */}
                  <p className="text-center text-sm text-gray-600 pt-4 border-t border-gray-100">
                    Already have an account?{" "}
                    <button
                      onClick={handleSignInClick}
                      type="button"
                      className="font-semibold transition-colors hover:underline"
                      style={{color: 'var(--primary-color-1)'}}
                    >
                      Sign in
                    </button>
                  </p>
                </form>
              </div>
            </div>

            {/* Right Side - Visual */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
                 style={{background: 'var(--primary-gradient)'}}>
              {/* Floating elements */}
              <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <div className="absolute bottom-20 left-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
              
              {/* Main illustration */}
              <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-12">
                <div className="mb-8">
                  <h3 className="text-3xl font-bold text-white text-center">
                    Join Us Today!
                  </h3>
                  <p className="text-white/80 text-center mt-2">
                    Create your account and unlock amazing features
                  </p>
                </div>
                
                <div className="relative w-full max-w-md">
                  {/* Floating card elements */}
                  <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/20 rounded-3xl rotate-12"></div>
                  <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/10 rounded-3xl -rotate-12"></div>
                  
                  {/* Main illustration image */}
                  <div className="relative z-10 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                    <div className="flex items-center justify-center mb-6">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-white to-[#4CA1AF]/20 flex items-center justify-center shadow-2xl">
                        <svg className="w-10 h-10" style={{color: 'var(--primary-color-1)'}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
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
                    <span className="text-white text-sm">Secure Account</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-white text-sm">Instant Access</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-white text-sm">Multiple Roles</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-white text-sm">Full Features</span>
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