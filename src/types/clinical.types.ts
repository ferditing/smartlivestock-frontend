export interface CreateClinicalRecordDTO {
  animalId: string;
  vetId: string;
  diseaseId?: string;
  mlDiagnosis: string;
  mlConfidence: number;
  vetDiagnosis?: string;
  notes?: string;
}

export interface UpdateClinicalRecordDTO {
  vetDiagnosis?: string;
  status?: 'pending' | 'under_treatment' | 'recovered' | 'deceased';
  notes?: string;
}

export interface CreateFollowUpDTO {
  scheduledDate: Date;
  notes?: string;
}

export interface ClinicalRecordResponse {
  id: string;
  animal: {
    id: string;
    name: string;
    type: string;
    breed: string;
  };
  vet: {
    id: string;
    name: string;
    email: string;
  };
  disease?: {
    id: string;
    name: string;
  };
  ml_diagnosis: string;
  ml_confidence: number;
  vet_diagnosis?: string;
  status: string;
  notes?: string;
  followUps: FollowUpResponse[];
  created_at: Date;
  updated_at: Date;
}

export interface FollowUpResponse {
  id: string;
  scheduledDate: Date;
  completedDate?: Date;
  notes?: string;
  status: string;
}