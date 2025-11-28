
import { Routes, Route } from "react-router-dom";
import Register from "./components/register";
import OTP from "./components/otp";
import Login from "./components/login";
import "./App.css";
import Dashboard from "./components/dashboard";

export default function App() {
  return (
    <div>
      <Routes>
        <Route path="/mainregister" element={<Register />} />{" "}
        <Route path="/otp" className="p-5" element={<OTP />} />
        <Route path="/" className="p-5" element={<Login />} />
        <Route path="/dashboard" className="p-5" element={<Dashboard />} />
      </Routes>
    </div>
  );
}
