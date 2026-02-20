import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

export default function RequireRole({
  role,
  children,
}: {
  role: string | string[] | null;
  children: ReactNode;
}) {
  const userRole = (localStorage.getItem("role") || "").trim().toLowerCase();
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (role === null || role === "any") {
    return <>{children}</>;
  }

  // If role is an array, check if user's role is included (case-insensitive)
  if (Array.isArray(role)) {
    const roles = role.map((r) => String(r).toLowerCase());
    if (userRole && roles.includes(userRole)) {
      return <>{children}</>;
    }
    return <Navigate to="/login" replace />;
  }

  // Role is a string - case-insensitive comparison
  if (userRole === String(role).toLowerCase()) {
    return <>{children}</>;
  }

  return <Navigate to="/login" replace />;
}