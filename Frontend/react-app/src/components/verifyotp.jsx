import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_URL || "http://72.155.88.211:8080";

export default function OTP() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [verificationMode, setVerificationMode] = useState(""); // "email_change" or "regular"
  const [prn, setPrn] = useState("");
  const [oldEmail, setOldEmail] = useState("");
  const [returnUrl, setReturnUrl] = useState("/dashboard");

  useEffect(() => {
    // Get stored verification data from localStorage
    const storedEmail = localStorage.getItem("verificationEmail");
    const storedPRN = localStorage.getItem("verificationPRN");
    const storedOldEmail = localStorage.getItem("verificationOldEmail");
    const storedMode = localStorage.getItem("verificationMode");
    const storedReturnUrl = localStorage.getItem("verificationReturnUrl");

    if (storedEmail) {
      setEmail(storedEmail);
    }
    if (storedPRN) {
      setPrn(storedPRN);
    }
    if (storedOldEmail) {
      setOldEmail(storedOldEmail);
    }
    if (storedMode) {
      setVerificationMode(storedMode);
    }
    if (storedReturnUrl) {
      setReturnUrl(storedReturnUrl);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${BASE_URL}/api/auth/verify-otp`,
        { email, otp }
      );

      if (response.data) {
        // If this is an email change verification
        if (verificationMode === "email_change") {
          // Update the user in the database with the new email
          try {
            // Get current user from localStorage
            const userStr = localStorage.getItem("user");
            if (userStr) {
              const currentUser = JSON.parse(userStr);
              
              // Update user email in backend
              await axios.put(
                `${BASE_URL}/api/users/${prn}`,
                { 
                  email: email,
                  username: currentUser.username,
                  role: currentUser.role 
                },
                {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json",
                  },
                }
              );

              // Update user in localStorage with verified status
              const updatedUser = { ...currentUser, email: email, verified: true };
              localStorage.setItem("user", JSON.stringify(updatedUser));
            }
          } catch (updateError) {
            console.error("Error updating user after verification:", updateError);
          }
        } else {
          // Regular verification - update user verified status
          try {
            const userStr = localStorage.getItem("user");
            if (userStr) {
              const currentUser = JSON.parse(userStr);
              const updatedUser = { ...currentUser, verified: true };
              localStorage.setItem("user", JSON.stringify(updatedUser));
            }
          } catch (updateError) {
            console.error("Error updating user verification status:", updateError);
          }
        }

        // Clear verification data from localStorage
        localStorage.removeItem("verificationEmail");
        localStorage.removeItem("verificationPRN");
        localStorage.removeItem("verificationOldEmail");
        localStorage.removeItem("verificationMode");
        localStorage.removeItem("verificationReturnUrl");

        alert("OTP Verified Successfully!");
        
        // If the response contains user and token (e.g. from initial login/register), update them
        if (response.data && response.data.token && response.data.user) {
          localStorage.setItem("user", JSON.stringify(response.data.user));
          localStorage.setItem("token", response.data.token);
        }

        // Navigate to the return URL or default dashboard
        navigate(returnUrl);
        console.log(response.data);
      }
    } catch (err) {
      alert("Invalid OTP ❌ Please try again!");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email) {
      alert("Please enter your email first");
      return;
    }

    setResendLoading(true);
    try {
      const response = await axios.post(
        `${BASE_URL}/api/auth/forgot-password`,
        { email }
      );
      alert("OTP resent successfully!");
      console.log(response.data);
    } catch (err) {
      alert("Failed to resend OTP! Please try again.");
      console.error(err);
    } finally {
      setResendLoading(false);
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
            {/* Left Side - OTP Form */}
            <div className="w-full md:w-1/2 p-8 lg:p-12 flex flex-col justify-center relative">
              {/* Decorative corner accent */}
              <div className="absolute top-0 left-0 w-32 h-32 rounded-br-3xl -translate-x-2 -translate-y-2"
                   style={{background: 'var(--primary-gradient)'}}></div>
              <div className="absolute top-0 left-0 w-32 h-32 rounded-br-3xl opacity-10 blur-xl"
                   style={{background: 'var(--primary-gradient)'}}></div>

              <div className="relative z-10">
                {/* Logo/Brand */}
                <div className="flex items-center gap-3 mb-6 mt-15">
                  <span className="text-3xl font-bold bg-gradient-to-r from-[#4CA1AF] to-[#315169] bg-clip-text text-transparent">
                    {verificationMode === "email_change" ? "Verify New Email" : "Verify OTP"}
                  </span>
                </div>

                <div className="mb-9">
                  <p className="text-sm font-semibold tracking-wider uppercase mt-8"
                     style={{color: 'var(--primary-color-1)'}}>
                    {verificationMode === "email_change" ? "Email Change Verification" : "Verification Required"}
                  </p>
                  <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mt-2">
                    Enter
                    <span className="block bg-gradient-to-r from-[#4CA1AF] to-[#315169] bg-clip-text text-transparent">
                      Verification Code
                    </span>
                  </h1>
                  {/* <p className="text-gray-600 mt-3 text-sm">
                    {verificationMode === "email_change" 
                      ? `We've sent a verification code to ${email}` 
                      : "We've sent a verification code to your email"}
                  </p> */}
                  {oldEmail && verificationMode === "email_change" && (
                    <p className="text-amber-600 mt-2 text-sm font-medium">
                      Note: Your email will be updated from {oldEmail} to {email} after verification
                    </p>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email Field - Hidden since we already have it from localStorage */}
                  <input type="hidden" value={email} />

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
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full pl-10 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 transition-all duration-300 placeholder-gray-400 shadow-sm"
                        style={{focusRing: 'var(--primary-color-1)20'}}
                        maxLength={6}
                        required
                      />
                    </div>
                  </div>

                  {/* Verify Button */}
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
                        <span className="text-white">Verifying...</span>
                      </>
                    ) : (
                      <>
                        <span className="text-white text-sm tracking-wider">
                          {verificationMode === "email_change" ? "VERIFY & UPDATE EMAIL" : "VERIFY OTP"}
                        </span>
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

                  {/* Resend OTP */}
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <span className="text-sm text-gray-500">Didn't receive code?</span>
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={resendLoading}
                      className="text-sm font-semibold transition-colors hover:underline disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      style={{color: 'var(--primary-color-1)'}}
                    >
                      {resendLoading ? "Resending..." : "Resend OTP"}
                    </button>
                  </div>
                </form>
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
                    {verificationMode === "email_change" ? "Verify Your New Email" : "Verify Your Identity"}
                  </h3>
                  <p className="text-white/80 text-center mt-2">
                    {verificationMode === "email_change" 
                      ? "Secure OTP verification for email change" 
                      : "Secure OTP verification for your account"}
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
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
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
                    <span className="text-white text-sm">6-Digit Code</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-white text-sm">Secure Access</span>
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