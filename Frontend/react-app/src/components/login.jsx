
   import { useState } from "react";
   import axios from "axios";
   import { useNavigate } from "react-router-dom";
   
   export default function Login() {
     const navigate = useNavigate();
     const handleSigninClick = () => {
    navigate("/mainregister");
  };
   
     const [form, setForm] = useState({
       username: "",
       password: "",
     });
   
     const handleChange = (e) => {
       setForm({
         ...form,
         [e.target.name]: e.target.value,
       });
     };
   
     const handleSubmit = async (e) => {
       e.preventDefault();
   
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
       }
     };
   
     return (
    <div className="h-screen w-screen flex items-center justify-center overflow-hidden" style={{
      background: 'linear-gradient(135deg, #e8d5f2 0%, #a8c7e7 50%, #dab5d8 100%)'
    }}> 
  <div className="w-full h-full bg-white rounded-none md:rounded-[2.5rem] md:max-w-5xl md:h-[90vh] shadow-2xl overflow-visible flex relative mx-auto">

     
        {/* Left Side - Login Form */}
        <div className="w-full md:w-3/5 p-8 lg:p-10 flex flex-col justify-center">
          <div className="mb-4">
            {/* <h1 className="text-4xl lg:text-5xl font-bold mb-1" style={{ color: '#ec4899' }}>Logo Here</h1> */}
            <p className="text-xs text-gray-600"><b>Welcome back !!!</b></p>
          </div>

          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-5">Log In</h2>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                username
              </label>
              <input
                 type="text"
                 name="username"
                 placeholder="Username"
                 value={form.username}
                 onChange={handleChange}
                 className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl  focus:ring-orange-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
                 required
               />
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-medium text-gray-700">
                  Password
                </label>
                <a href="#" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <input
                  type= "password"
                  name="password"
                  placeholder="••••••••••••"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-[#ffe4d6] border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 transition-all pr-10 text-sm text-gray-700"
                  required
                />
                {/* <input
                 type="password"
                 name="password"
                 placeholder="Password"
                 value={form.password}
                 onChange={handleChange}
                 className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl  focus:ring-orange-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
                 required
               /> */}
                <button
                  type="button"
                  // onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {/* {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )} */}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full text-white py-3 px-5 rounded-full font-bold shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-wide text-xs mt-4"
              style={{ background: 'linear-gradient(90deg, #ea580c 0%, #fb923c 100%)' }}
            >
              LOGIN
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white text-gray-500">or continue with</span>
              </div>
            </div>

            {/* Sign Up Link */}
            <p className="text-center text-xs text-gray-600 mt-4">
              Don't have an account yet?{" "}
              <button
                onClick={handleSigninClick}
                type="button"
                className="font-semibold transition-colors hover:opacity-80" 
                style={{ color: '#ea580c' }}
              >

             <a href="#" className="font-semibold transition-colors hover:opacity-80" style={{ color: '#ea580c' }}>
                Sign up
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
   
