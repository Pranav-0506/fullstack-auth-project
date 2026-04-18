import React from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");

  // 🚫 Not logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // safe JSON parse
  let user = null;
  try {
    user = userStr ? JSON.parse(userStr) : null;
  } catch (err) {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }

  // 🚫 No user data
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ✅ IMPORTANT FIX:
  // If you don't have role system yet, DO NOT block users
  // (this was breaking your dashboard)

  return children;
}

export default ProtectedRoute;