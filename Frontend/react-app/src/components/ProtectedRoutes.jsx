import { Navigate } from "react-router-dom";

// Protected Route - Only accessible when logged in
export const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Auth Route - Only accessible when NOT logged in
export const AuthRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  
  if (token && user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};