// client/src/components/ProtectedRoute.jsx

import React from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ token, children }) {
  if (!token) {
    // If no token, redirect to the admin login page
    return <Navigate to="/admin/login" replace />;
  }

  // If token exists, render the component passed as children
  return children;
}

export default ProtectedRoute;
  