import { Routes, Route, Navigate } from "react-router-dom";
import RequireRole from "./auth/RequireRole";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProviderProducts from "./pages/ProviderProducts";


// Dashboards
import FarmerDashboard from "./dashboard/farmer/FarmerDashboard";
import VetDashboard from "./dashboard/vet/VetDashboard";
import IncomingCases from "./dashboard/vet/IncomingCases";
import CaseDetails from "./dashboard/vet/CaseDetails";
import AgroDashboard from "./dashboard/agro/AgroDashboard";

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Farmer */}
      <Route
        path="/farmer"
        element={
          <RequireRole role="farmer">
            <FarmerDashboard />
          </RequireRole>
        }
      />

      {/* Vet */}
      <Route
        path="/vet"
        element={
          <RequireRole role="vet">
            <VetDashboard />
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

      {/* Agro-vet */}
      <Route
        path="/agrovet"
        element={
          <RequireRole role="agrovet">
            <AgroDashboard />
          </RequireRole>
        }
      />
      <Route
  path="/providers/:id"
  element={
    <RequireRole role="farmer">
      <ProviderProducts />
    </RequireRole>
  }
/>


      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}
