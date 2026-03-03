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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    <div className="min-h-screen w-screen flex items-center justify-center p-4 overflow-hidden relative"
         style={{background: 'var(--primary-gradient)'}}>
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"
             style={{backgroundColor: 'var(--primary-color-1)'}}></div>
        <div className="absolute top-1/3 -left-20 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"
             style={{backgroundColor: 'var(--primary-color-2)'}}></div>
        <div className="absolute -bottom-40 left-1/3 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"
             style={{backgroundColor: 'var(--primary-color-1)'}}></div>
      </div>

      <div className="w-full max-w-6xl mx-auto relative z-10">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl md:rounded-[2.5rem] shadow-2xl overflow-hidden border"
             style={{borderColor: 'var(--primary-color-1)20'}}>
          <div className="flex flex-col md:flex-row min-h-[85vh]">
            {/* Left Side - Form */}
            <div className="w-full md:w-1/2 p-8 lg:p-12 flex flex-col justify-center relative">
              {/* Decorative corner accent */}
              <div className="absolute top-0 left-0 w-32 h-32 rounded-br-3xl -translate-x-2 -translate-y-2"
                   style={{background: 'var(--primary-gradient)'}}></div>
              <div className="absolute top-0 left-0 w-32 h-32 rounded-br-3xl opacity-10 blur-xl"
                   style={{background: 'var(--primary-gradient)'}}></div>
              
              <div className="relative z-10">
                {/* Logo/Brand */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                       style={{background: 'var(--primary-gradient)'}}>
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-[#4CA1AF] to-[#315169] bg-clip-text text-transparent">
                    Reset Password
                  </span>
                </div>

                <div className="mb-9">
                  <p className="text-sm font-semibold tracking-wider uppercase mt-8"
                     style={{color: 'var(--primary-color-1)'}}>
                    {otpSent ? "Reset Your Password" : "Forgot Password"}
                  </p>
                  <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mt-2">
                    {otpSent ? "Create New" : "Reset Your"}
                    <span className="block bg-gradient-to-r from-[#4CA1AF] to-[#315169] bg-clip-text text-transparent">
                      {otpSent ? "Password" : "Account"}
                    </span>
                  </h1>
                  <p className="text-gray-600 mt-3 text-sm">
                    {otpSent 
                      ? "Enter OTP and create a new password" 
                      : "Enter your registered email to reset password"}
                  </p>
                </div>

                {!otpSent ? (
                  <form onSubmit={handleRequestOTP} className="space-y-6">
                    {/* Email Field */}
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 transition-colors"
                             style={{color: 'var(--primary-color-1)'}}>
                        Email Address
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
                          placeholder="Enter your registered email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 transition-all duration-300 placeholder-gray-400 shadow-sm"
                          style={{focusRing: 'var(--primary-color-1)20'}}
                          required
                        />
                      </div>
                    </div>

                    {/* Send OTP Button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-4 px-5 rounded-2xl font-bold shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 group disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                      style={{
                        background: 'var(--primary-gradient)',
                      }}
                    >
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-white">Sending OTP...</span>
                        </>
                      ) : (
                        <>
                          <span className="text-white text-sm tracking-wider">SEND OTP</span>
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
                  </form>
                ) : (
                  <form onSubmit={handleResetPassword} className="space-y-6">
                    {/* Email Field (read-only) */}
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 transition-colors"
                             style={{color: 'var(--primary-color-1)'}}>
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <input
                          type="email"
                          value={email}
                          readOnly
                          className="w-full pl-10 pr-4 py-4 bg-gray-100 border border-gray-200 rounded-2xl text-gray-700 shadow-sm cursor-not-allowed"
                        />
                      </div>
                    </div>

                    {/* OTP Field */}
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 transition-colors"
                             style={{color: 'var(--primary-color-1)'}}>
                        OTP Code
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="w-5 h-5 transition-colors" 
                               style={{color: 'var(--primary-color-1)'}} 
                               fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          placeholder="Enter OTP"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          className="w-full pl-10 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 transition-all duration-300 placeholder-gray-400 shadow-sm"
                          style={{focusRing: 'var(--primary-color-1)20'}}
                          required
                        />
                      </div>
                    </div>

                    {/* New Password Field */}
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 transition-colors"
                             style={{color: 'var(--primary-color-1)'}}>
                        New Password
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
                          placeholder="Enter new password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full pl-10 pr-12 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 transition-all duration-300 placeholder-gray-400 shadow-sm"
                          style={{focusRing: 'var(--primary-color-1)20'}}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
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

                    {/* Confirm Password Field */}
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 transition-colors"
                             style={{color: 'var(--primary-color-1)'}}>
                        Confirm Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="w-5 h-5 transition-colors" 
                               style={{color: 'var(--primary-color-1)'}} 
                               fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm new password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full pl-10 pr-12 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 transition-all duration-300 placeholder-gray-400 shadow-sm"
                          style={{focusRing: 'var(--primary-color-1)20'}}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                        >
                          {showConfirmPassword ? (
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

                    {/* Reset Password Button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-4 px-5 rounded-2xl font-bold shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 group disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                      style={{
                        background: 'var(--primary-gradient)',
                      }}
                    >
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-white">Resetting...</span>
                        </>
                      ) : (
                        <>
                          <span className="text-white text-sm tracking-wider">RESET PASSWORD</span>
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
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center">
                    {/* <span className="px-4 bg-white text-sm text-gray-500">
                      or
                    </span> */}
                  </div>
                </div>

                {/* Back to Login Link */}
                <p className="text-center text-sm text-gray-600 pt-4 border-t border-gray-100">
                  Remember your password?{" "}
                  <button
                    onClick={() => navigate("/login")}
                    type="button"
                    className="font-semibold transition-colors hover:underline cursor-pointer"
                    style={{color: 'var(--primary-color-1)'}}
                  >
                    Back to Login
                  </button>
                </p>
              </div>
            </div>

            {/* Right Side - Visual */}
            <div className="hidden md:flex md:w-1/2 relative overflow-hidden"
                 style={{background: 'var(--primary-gradient)'}}>
              {/* Floating elements */}
              <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <div className="absolute bottom-20 left-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
              
              {/* Main illustration */}
              <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-12">
                <div className="mb-8">
                  <h3 className="text-3xl font-bold text-white text-center">
                    Reset Your Password
                  </h3>
                  <p className="text-white/80 text-center mt-2">
                    Secure and easy password recovery
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
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
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
                    <span className="text-white text-sm">OTP Verification</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-white text-sm">Secure Reset</span>
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