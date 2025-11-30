import { Routes, Route } from "react-router-dom";
import Register from "./components/register";
import OTP from "./components/otp";
import Login from "./components/login";
import "./App.css";
import Dashboard from "./components/dashboard";
import ForgotPassword from "./components/forgetpassword";
import ManageClubs from "./Dashboards/SuperAdmin/ManageClub";
import SplashScreen from "./components/SplashScreen";
import UserManagement from "./Dashboards/SuperAdmin/ManageUsers";
import { ProtectedRoute, AuthRoute } from "./components/ProtectedRoutes";

export default function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        
        {/* Auth Routes - Only accessible when NOT logged in */}
        <Route 
          path="/mainregister" 
          element={
            <AuthRoute>
              <Register />
            </AuthRoute>
          } 
        />
        <Route 
          path="/otp" 
          element={
            <AuthRoute>
              <OTP />
            </AuthRoute>
          } 
        />
        <Route 
          path="/login" 
          element={
            <AuthRoute>
              <Login />
            </AuthRoute>
          } 
        />
        <Route 
          path="/reset-password" 
          element={
            <AuthRoute>
              <ForgotPassword />
            </AuthRoute>
          } 
        />

        {/* Protected Routes - Only accessible when logged in */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/manage-clubs" 
          element={
            <ProtectedRoute>
              <ManageClubs />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/manage-users" 
          element={
            <ProtectedRoute>
              <UserManagement />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </div>
  );
}
// import { Routes, Route } from "react-router-dom";
// import Register from "./components/register";
// import OTP from "./components/otp";
// import Login from "./components/login";
// import "./App.css";
// import Dashboard from "./components/dashboard";
// import ForgotPassword from "./components/forgetpassword";
// import ManageClubs from "./Dashboards/SuperAdmin/ManageClub";
// import SplashScreen from "./components/SplashScreen";
// import UserManagement from "./Dashboards/SuperAdmin/ManageUsers";

// export default function App() {
//   return (
//     <div>
//       <Routes>
//         <Route path="/" element={<SplashScreen />} />
//         <Route path="/mainregister" element={<Register />} />{" "}
//         <Route path="/otp" className="p-5" element={<OTP />} />
//         <Route path="/login" className="p-5" element={<Login />} />
//         <Route path="/dashboard" className="p-5" element={<Dashboard />} />
//         <Route path="/reset-password" className="p-5" element={<ForgotPassword />} />
//         <Route path="/manage-clubs" className="p-5" element={<ManageClubs />} />
//          <Route path="/manage-users" className="p-5" element={<UserManagement />} />
//       </Routes>
//     </div>
//   );
// }
