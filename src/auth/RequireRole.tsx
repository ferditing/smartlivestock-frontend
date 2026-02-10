import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

export default function RequireRole({
  role,
  children,
}: {
  role: string | string[] | null;
  children: ReactNode;
}) {
  const userRole = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  if (!token) {
    console.log("No token, redirecting to login");
    return <Navigate to="/login" />;
  }

  if (role === null || role === "any") {
    console.log("Role is 'any' or null, allowing access");
    return <>{children}</>;
  }

  // If role is an array, check if user's role is included
  if (Array.isArray(role)) {
    if (userRole && role.includes(userRole)) {
      console.log("Role matches (array), allowing access");
      return <>{children}</>;
    }
    console.log("Role doesn't match any in array, redirecting to login");
    return <Navigate to="/login" />;
  }

  // Role is a string
  if (userRole === role) {
    console.log("Role matches, allowing access");
    return <>{children}</>;
  }

  console.log("Role doesn't match, redirecting to login");
  return <Navigate to="/login" />;
}