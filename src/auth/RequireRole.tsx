import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

export default function RequireRole({
  role,
  children,
}: {
  role: string | null;
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

  if (userRole === role) {
    console.log("Role matches, allowing access");
    return <>{children}</>;
  }
  
  console.log("Role doesn't match, redirecting to login");
  return <Navigate to="/login" />;
}