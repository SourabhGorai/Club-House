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
import AddStudent from "./Dashboards/Teachers/AddStudent";
import UserRemoveFromClub from "./Dashboards/Teachers/UserRemoveFromClub";
import RemoveUsersFromAnyClub from "./Dashboards/SuperAdmin/RemoveUsersFromAnyClub";
import MyEvents from "./components/MyEvents";

import { ProtectedRoute, AuthRoute } from "./components/ProtectedRoutes";
import CreateEvent from "./Dashboards/SuperAdmin/createEvent"; 
import ClubAdminsManagement from "./Dashboards/SuperAdmin/Clubsadminmanagement";
import ClubDetails from "./components/ClubDetails";
import PreviousEvents from "./Dashboards/Users/PreviousEvents";
import MyEventsForSuperadmin from "./Dashboards/SuperAdmin/MyEventsForSuperadmin";
import SuperAdminDashboard from "./Dashboards/SuperAdmin/SuperAdminDashboard"; // Add this import

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
        
        {/* MODIFIED: Remove AuthRoute from OTP so logged-in users can access it */}
        <Route path="/otp" element={<OTP />} />
        
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

        {/* Add Super Admin Dashboard route */}
        <Route
          path="/super-admin-dashboard"
          element={
            <ProtectedRoute>
              <SuperAdminDashboard />
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
          path="/club-admins"
          element={
            <ProtectedRoute>
              <ClubAdminsManagement />
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

        <Route
          path="/add-users-with-club"
          element={
            <ProtectedRoute>
              <AddStudent />
            </ProtectedRoute>
          }
        />

        <Route
          path="/remove-users-from-club"
          element={
            <ProtectedRoute>
              <UserRemoveFromClub />
            </ProtectedRoute>
          }
        />

        <Route
          path="/remove-users-from-any-club"
          element={
            <ProtectedRoute>
              <RemoveUsersFromAnyClub />
            </ProtectedRoute>
          }
        />
        
        {/* Add the Create Event route */}
        <Route
          path="/create-event"
          element={
            <ProtectedRoute>
              <CreateEvent />
            </ProtectedRoute>
          }
        />
        
        <Route path="/club/:clubName/details" element={
          <ProtectedRoute>
            <ClubDetails />
          </ProtectedRoute>
        } />

        <Route
          path="/events"
          element={
            <ProtectedRoute>
              <MyEvents />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/events-superadmin"
          element={
            <ProtectedRoute>
              <MyEventsForSuperadmin />
            </ProtectedRoute>
          }
        />

        <Route
          path="/previous-events"
          element={
            <ProtectedRoute>
              <PreviousEvents />
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
