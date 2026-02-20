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

// Auth & Landing
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProviderProducts from "./pages/ProviderProducts";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Layout from "./components/Layout";

// Dashboards
import FarmerDashboard from "./dashboard/farmer/FarmerDashboard";
import FarmerInventory from "./dashboard/farmer/FarmerInventory";
import Marketplace from "./dashboard/farmer/Marketplace";
import Orders from "./dashboard/farmer/Orders";
import VetDashboard from "./dashboard/vet/VetDashboard";
import IncomingCases from "./dashboard/vet/IncomingCases";
import CaseDetails from "./dashboard/vet/CaseDetails";
import AgroDashboard from "./dashboard/agro/AgroDashboard";
import ProductCatalog from "./dashboard/agro/ProductCatalog";
import AgrovetOrders from "./dashboard/agro/AgrovetOrders";

// Admin
import AdminDashboard from "./dashboard/admin/AdminDashboard";
import AdminUsers from "./dashboard/admin/AdminUsers";
import AdminProviders from "./dashboard/admin/AdminProviders";
import AdminAnalytics from "./dashboard/admin/AdminAnalytics";
import AdminAuditLogs from "./dashboard/admin/AdminAuditLogs";
import AdminSettings from "./dashboard/admin/AdminSettings";
import AdminStaffManagement from "./dashboard/admin/AdminStaffManagement";
import SubAdminDashboard from "./dashboard/subadmin/SubAdminDashboard";
import SubAdminUsers from "./dashboard/subadmin/SubAdminUsers";
import SubAdminAnalytics from "./dashboard/subadmin/SubAdminAnalytics";
import SubAdminProviders from "./dashboard/subadmin/SubAdminProviders";
import SetPassword from "./pages/SetPassword";

// Profiles
import FarmerProfile from "./profile/FarmerProfile";
import VetProfile from "./profile/VetProfile";
import AgroProfile from "./profile/AgroProfile";
import SubAdminProfile from "./profile/SubAdminProfile";

export default function App() {
  return (
    <ToastProvider>
      <Routes>
      {/* ---------------- PUBLIC ---------------- */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/set-password" element={<SetPassword />} />

      {/* ---------------- FARMER ---------------- */}
      <Route
        path="/farmer/marketplace"
        element={
          <RequireRole role="farmer">
            <Marketplace />
          </RequireRole>
        }
      />
      <Route
        path="/farmer/orders"
        element={
          <RequireRole role="farmer">
            <Orders />
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
          </RequireRole>
        }
      />
      <Route
        path="/farmer"
        element={
          <RequireRole role="farmer">
            <FarmerDashboard />
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

      <Route
        path="/agrovet/orders"
        element={
          <RequireRole role="agrovet">
            <AgrovetOrders />
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
          <RequireRole role={["farmer", "vet"]}>
            <ClinicalRecordsList />
          </RequireRole>
        } 
      />
      <Route 
        path="/clinical-records/:recordId" 
        element={
          <RequireRole role={["farmer", "vet"]}>
            <ClinicalRecordDetail />
          </RequireRole>
        } 
      />
      <Route 
        path="/clinical-records/new" 
        element={
          <RequireRole role={["farmer", "vet"]}>
            <CreateClinicalRecord />
          </RequireRole>
        } 
      />
      <Route 
        path="/animals/:animalId/clinical-records/new" 
        element={
          <RequireRole role={["farmer", "vet"]}>
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

      {/* ---------------- ADMIN ---------------- */}
      <Route
        path="/admin"
        element={
          <RequireRole role="admin">
            <AdminDashboard />
          </RequireRole>
        }
      />
      <Route
        path="/admin/users"
        element={
          <RequireRole role="admin">
            <AdminUsers />
          </RequireRole>
        }
      />
      <Route
        path="/admin/providers"
        element={
          <RequireRole role="admin">
            <AdminProviders />
          </RequireRole>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <RequireRole role="admin">
            <AdminAnalytics />
          </RequireRole>
        }
      />
      <Route
        path="/admin/audit-logs"
        element={
          <RequireRole role="admin">
            <AdminAuditLogs />
          </RequireRole>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <RequireRole role="admin">
            <AdminSettings />
          </RequireRole>
        }
      />
      <Route
        path="/admin/staff"
        element={
          <RequireRole role="admin">
            <AdminStaffManagement />
          </RequireRole>
        }
      />

      {/* ---------------- SUBADMIN ---------------- */}
      <Route
        path="/subadmin"
        element={
          <RequireRole role="subadmin">
            <SubAdminDashboard />
          </RequireRole>
        }
      />
      <Route
        path="/subadmin/users"
        element={
          <RequireRole role="subadmin">
            <SubAdminUsers />
          </RequireRole>
        }
      />
      <Route
        path="/subadmin/profile"
        element={
          <RequireRole role="subadmin">
            <SubAdminProfile />
          </RequireRole>
        }
      />
      <Route
        path="/subadmin/analytics"
        element={
          <RequireRole role="subadmin">
            <SubAdminAnalytics />
          </RequireRole>
        }
      />
      <Route
        path="/subadmin/providers"
        element={
          <RequireRole role="subadmin">
            <SubAdminProviders />
          </RequireRole>
        }
      />

      {/* ---------------- FALLBACK ---------------- */}
      <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </ToastProvider>
  );
}
