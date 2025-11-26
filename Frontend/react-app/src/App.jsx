import { Routes, Route } from "react-router-dom";
import Register from "./components/register";
import OTP from "./components/otp";
import Login from "./components/login";
import './App.css';
import Dashboard from "./components/dashboard";
import ClubAdminDashboard from "./components/ClubAdminDashboard";
import SuperAdminDashboard from "./components/SuperAdminDashboard";

export default function App() {
  return (
    <div className="p-5">
      <Routes>
        <Route path="/" element={
          <h1 className="text-4xl font-bold text-blue-600">
            Tailwind is working! 💙✨
          </h1>
        } />
        
        <Route path="/mainregister" element={<Register />} />
        <Route path="/otp" element={<OTP />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/ca" element={<ClubAdminDashboard />} />
        <Route path="/sa" element={<SuperAdminDashboard />} />
      </Routes>
    </div>
  );
}
