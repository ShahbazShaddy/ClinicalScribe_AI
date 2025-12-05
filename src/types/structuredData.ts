/**
 * Structured Data Types for Clinical Notes
 * Defines the shape of extracted vitals, clinical info, and symptoms
 */

export interface Vitals {
  bloodPressure?: {
    systolic?: number;
    diastolic?: number;
    status?: 'normal' | 'elevated' | 'high' | 'critical';
  };
  heartRate?: {
    value?: number;
    status?: 'normal' | 'low' | 'high';
  };
  temperature?: {
    value?: number;
    unit?: 'C' | 'F';
    status?: 'normal' | 'low' | 'fever' | 'high-fever';
  };
  weight?: {
    value?: number;
    unit?: 'lbs' | 'kg';
    previousValue?: number;
    change?: number;
    status?: 'stable' | 'gained' | 'lost';
  };
  o2Saturation?: {
    value?: number;
    status?: 'normal' | 'low' | 'critical';
  };
  respiratoryRate?: {
    value?: number;
    status?: 'normal' | 'low' | 'high';
  };
}

export interface ClinicalInfo {
  chiefComplaint?: string;
  diagnoses?: string[];
  medicationsMentioned?: Medication[];
  labValues?: LabValue[];
  allergies?: string[];
}

export interface Medication {
  name: string;
  dosage?: string;
  frequency?: string;
  route?: string;
}

export interface LabValue {
  testName: string;
  value?: string | number;
  unit?: string;
  referenceRange?: string;
  status?: 'normal' | 'high' | 'low' | 'critical';
}

export interface Symptom {
  name: string;
  severity?: 'mild' | 'moderate' | 'severe';
  duration?: string;
}

export interface StructuredData {
  vitals?: Vitals;
  clinicalInfo?: ClinicalInfo;
  symptoms?: Symptom[];
  extractedAt?: string;
  confidence?: number; // 0-100, how confident the extraction was
}

export interface NoteWithStructuredData {
  id: string;
  patientName: string;
  patientAge?: string;
  chiefComplaint?: string;
  noteType: string;
  date: string;
  duration: number;
  content: Record<string, string>;
  structuredData?: StructuredData;
  previousVisitData?: StructuredData; // For trend comparison
}
