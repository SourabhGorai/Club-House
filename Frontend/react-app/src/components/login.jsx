
   import { useState } from "react";
   import axios from "axios";
   import { useNavigate } from "react-router-dom";
   
   export default function Login() {
     const navigate = useNavigate();
   
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
       <div className="min-h-screen bg-gradient-to-br from-orange-100 via-rose-50 to-sky-100 flex items-center justify-center">
         <div className="max-w-md w-full mx-auto mt-12 p-8 bg-gradient-to-br from-white to-gray-50 shadow-2xl rounded-2xl border border-gray-100 transform transition-all duration-300 hover:shadow-2xl">
           <div className="text-center mb-8">
             <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
               Welcome Back
             </h2>
             <p className="text-gray-500 mt-2">Sign in to your account</p>
           </div>
   
           <form onSubmit={handleSubmit} className="space-y-6">
             <div className="relative">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                 <i className="fas fa-user text-gray-400"></i>
               </div>
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
   
             <div className="relative">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                 <i className="fas fa-lock text-gray-400"></i>
               </div>
               <input
                 type="password"
                 name="password"
                 placeholder="Password"
                 value={form.password}
                 onChange={handleChange}
                 className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl  focus:ring-orange-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
                 required
               />
             </div>
   
             <div className="flex items-center justify-between text-sm">
               <label className="flex items-center">
                 <input
                   type="checkbox"
                   className="rounded border-gray-300 text-orange-500 cursor-pointer focus:ring-orange-500"
                 />
                 <span className="ml-2 text-gray-600">Remember me</span>
               </label>
               <a
                 href="#"
                 className="text-orange-500 hover:text-orange-600 transition-colors duration-300 font-medium cursor-pointer"
               >
                 Forgot password?
               </a>
             </div>
   
             <button
               type="submit"
               className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl cursor-pointer font-semibold shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
             >
               <span className="flex items-center justify-center cursor-pointer">
                 Login
                 <i className="fas fa-arrow-right ml-2"></i>
               </span>
             </button>
           </form>
         </div>
       </div>
     );
   }
   


