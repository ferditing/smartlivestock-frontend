import { Routes, Route, Navigate } from "react-router-dom";
import RequireRole from "./auth/RequireRole";

// Auth pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProviderProducts from "./pages/ProviderProducts";

// Dashboards
import FarmerDashboard from "./dashboard/farmer/FarmerDashboard";
import FarmerInventory from "./dashboard/farmer/FarmerInventory";
import VetDashboard from "./dashboard/vet/VetDashboard";
import IncomingCases from "./dashboard/vet/IncomingCases";
import CaseDetails from "./dashboard/vet/CaseDetails";
import AgroDashboard from "./dashboard/agro/AgroDashboard";

// Profiles
import FarmerProfile from "./profile/FarmerProfile";
import VetProfile from "./profile/VetProfile";
import AgroProfile from "./profile/AgroProfile";

export default function App() {
  return (
    <Routes>
      {/* ---------------- PUBLIC ---------------- */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ---------------- FARMER ---------------- */}
      <Route
        path="/farmer"
        element={
          <RequireRole role="farmer">
            <FarmerDashboard />
          </RequireRole>
        }
      />

      <Route
        path="/farmer/animals"
        element={
          <RequireRole role="farmer">
            <FarmerInventory />
          </RequireRole>
        }
      />

      <Route
        path="/farmer/profile"
        element={
          <RequireRole role="farmer">
            <FarmerProfile />
          </RequireRole>
        }
      />

      {/* ---------------- VET ---------------- */}
      <Route
        path="/vet"
        element={
          <RequireRole role="vet">
            <VetDashboard />
          </RequireRole>
        }
      />

      <Route
        path="/vet/profile"
        element={
          <RequireRole role="vet">
            <VetProfile />
          </RequireRole>
        }
      />

      <Route
        path="/vet/cases"
        element={
          <RequireRole role="vet">
            <IncomingCases />
          </RequireRole>
        }
      />

      <Route
        path="/vet/cases/:id"
        element={
          <RequireRole role="vet">
            <CaseDetails />
          </RequireRole>
        }
      />

      {/* ---------------- AGROVET ---------------- */}
      <Route
        path="/agrovet"
        element={
          <RequireRole role="agrovet">
            <AgroDashboard />
          </RequireRole>
        }
      />

      <Route
        path="/agrovet/profile"
        element={
          <RequireRole role="agrovet">
            <AgroProfile />
          </RequireRole>
        }
      />

      {/* ---------------- FARMER → PROVIDER PRODUCTS ---------------- */}
      <Route
        path="/providers/:id"
        element={
          <RequireRole role="farmer">
            <ProviderProducts />
          </RequireRole>
        }
      />

      {/* ---------------- FALLBACK ---------------- */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}
