
import { Routes, Route } from "react-router-dom";
import Register from "./components/register";
import OTP from "./components/otp";
import Login from "./components/login";
import "./App.css";
import Dashboard from "./components/dashboard";
import ClubAdminDashboard from "./components/ClubAdminDashboard";
import SuperAdminDashboard from "./components/SuperAdminDashboard";

export default function App() {
  return (
    <div>
      <Routes>
        <Route
          path="/"
          element={
            <h1 className="text-4xl font-bold text-blue-600">
              Tailwind is working! 💙✨
            </h1>
          }
        />
        <Route path="/mainregister" element={<Register />} />{" "}
        <Route path="/otp" className="p-5" element={<OTP />} />
        <Route path="/login" className="p-5" element={<Login />} />
        <Route path="/dashboard" className="p-5" element={<Dashboard />} />
        <Route path="/ca" className="p-5" element={<ClubAdminDashboard />} />
        <Route path="/sa" className="p-5" element={<SuperAdminDashboard />} />
      </Routes>
    </div>
  );
}
