import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

export default function RequireRole({
  role,
  children,
}: {
  role: string;
  children: ReactNode;
}) {
  return localStorage.getItem("role") === role
    ? children
    : <Navigate to="/login" />;
}
