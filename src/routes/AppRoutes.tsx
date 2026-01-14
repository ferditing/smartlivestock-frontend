import { Routes, Route } from "react-router-dom";
import RequireRole from "../auth/RequireRole";
import FarmerDashboard from "../dashboard/farmer/FarmerDashboard";
import VetDashboard from "../dashboard/vet/VetDashboard";
import AgroDashboard from "../dashboard/agro/AgroDashboard";
import Login from "../pages/Login";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/farmer" element={<RequireRole role="farmer"><FarmerDashboard /></RequireRole>} />
      <Route path="/vet" element={<RequireRole role="vet"><VetDashboard /></RequireRole>} />
      <Route path="/agro" element={<RequireRole role="agro"><AgroDashboard /></RequireRole>} />
    </Routes>
  );
}
