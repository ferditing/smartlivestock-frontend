import { Routes, Route } from "react-router-dom";
import RequireRole from "../auth/RequireRole";
import FarmerDashboard from "../dashboard/farmer/FarmerDashboard";
import VetDashboard from "../dashboard/vet/VetDashboard";
import AgroDashboard from "../dashboard/agro/AgroDashboard";
import Login from "../pages/Login";
import { ClinicalRecordDetail } from '../dashboard/ClinicalRecords/ClinicalRecordDetail';
import { CreateClinicalRecord } from '../dashboard/ClinicalRecords/CreateClinicalRecord';
import ClinicalRecordsList from '../dashboard/ClinicalRecords/ClinicalRecordsList';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/farmer" element={<RequireRole role="farmer"><FarmerDashboard /></RequireRole>} />
      <Route path="/vet" element={<RequireRole role="vet"><VetDashboard /></RequireRole>} />
      <Route path="/agrovet" element={<RequireRole role="agrovet"><AgroDashboard /></RequireRole>} />
      
    
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
    </Routes>
  );
}
