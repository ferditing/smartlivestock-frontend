import { Routes, Route, Navigate } from "react-router-dom";
import RequireRole from "./auth/RequireRole";
import { ToastProvider } from "./context/ToastContext";
import ClinicalRecordsList from './dashboard/ClinicalRecords/ClinicalRecordsList';
import { ClinicalRecordDetail } from './dashboard/ClinicalRecords/ClinicalRecordDetail';
import { CreateClinicalRecord } from './dashboard/ClinicalRecords/CreateClinicalRecord';
import ViewAppointments from "./dashboard/ClinicalRecords/ViewAppointments";
import BookAppointment from "./dashboard/ClinicalRecords/BookAppointment";
// ...
// ...

// Auth pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProviderProducts from "./pages/ProviderProducts";
import Layout from "./components/Layout";

// Dashboards
import FarmerDashboard from "./dashboard/farmer/FarmerDashboard";
import FarmerInventory from "./dashboard/farmer/FarmerInventory";
import VetDashboard from "./dashboard/vet/VetDashboard";
import IncomingCases from "./dashboard/vet/IncomingCases";
import CaseDetails from "./dashboard/vet/CaseDetails";
import AgroDashboard from "./dashboard/agro/AgroDashboard";
import ProductCatalog from "./dashboard/agro/ProductCatalog";

// Profiles
import FarmerProfile from "./profile/FarmerProfile";
import VetProfile from "./profile/VetProfile";
import AgroProfile from "./profile/AgroProfile";

export default function App() {
  return (
    <ToastProvider>
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
      <Route 
      path="/farmer/appointments/new" 
      element={
      <RequireRole role="farmer">
        <BookAppointment />
        </RequireRole>} />

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
      path="/vet/appointments"
       element={
       <RequireRole role="vet">
        <ViewAppointments />
      </RequireRole>} />
      <Route
        path="/vet/appointments/new"
        element={
          <RequireRole role="vet">
            <BookAppointment />
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

      <Route 
        path="/clinical-records" 
        element={
          <RequireRole role="any">
            <ClinicalRecordsList />
          </RequireRole>
        } 
      />
      <Route 
        path="/clinical-records/:recordId" 
        element={
          <RequireRole role="any">
            <ClinicalRecordDetail />
          </RequireRole>
        } 
      />
      <Route 
        path="/clinical-records/new" 
        element={
          <RequireRole role="any">
            <CreateClinicalRecord />
          </RequireRole>
        } 
      />
      <Route 
        path="/animals/:animalId/clinical-records/new" 
        element={
          <RequireRole role="any">
            <CreateClinicalRecord />
          </RequireRole>
        } 
      />
      <Route 
        path="/agrovet/products" 
        element={
          <RequireRole role="agrovet">
            <Layout role="agrovet">
              <ProductCatalog isOwner={true} />
            </Layout>
          </RequireRole>
        } 
      />
      


      {/* ---------------- FALLBACK ---------------- */}
      <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </ToastProvider>
  );
}
