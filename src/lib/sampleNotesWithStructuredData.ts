import type { Note } from '@/App';
import type { StructuredData } from '@/types/structuredData';

/**
 * Sample clinical notes with pre-populated structured data
 * Used for demonstrating the structured data panel functionality
 */

export const sampleNoteHTNFollowUp: Note = {
  id: 'sample-001',
  patientName: 'Robert Johnson',
  patientAge: '58',
  chiefComplaint: 'Blood pressure check, follow-up for hypertension',
  noteType: 'Progress',
  date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
  duration: 900, // 15 minutes
  content: {
    'interval_history': 'Patient reports compliance with antihypertensive regimen. States he has been taking Lisinopril as prescribed. Reports occasional mild headaches but no dizziness or chest pain. No significant changes in diet or lifestyle. Works stressful job but managing well with exercise.',
    'current_status': 'Vital Signs: BP 156/94 (elevated), HR 78 (normal), Temp 98.6°F, RR 16, SpO2 98% on room air. Weight 190 lbs (↑3 lbs from last visit). General: Alert and oriented, mild anxiety noted. Cardiovascular: Regular rate and rhythm, no murmurs noted.',
    'response_to_treatment': 'Blood pressure elevated despite current therapy. Patient reports good compliance with medications. May need medication adjustment or additional antihypertensive agent. Patient aware of need for better control.',
    'assessment_update': 'Uncontrolled hypertension (I10), likely secondary to inadequate medication regimen and possible dietary sodium intake. Recommend intensification of therapy.',
    'plan_modification': 'Increased Lisinopril from 10mg to 20mg daily. Added Amlodipine 5mg daily for additional blood pressure reduction. Referred patient to nutrition for low-sodium diet counseling. Scheduled follow-up in 4 weeks to reassess blood pressure. Patient instructed to monitor home blood pressures daily and report if consistently >150/90.',
    'icd10': 'I10 - Essential (primary) hypertension\nI11.9 - Hypertensive heart disease without heart failure',
    'cpt': '99214 - Office or other outpatient visit, established patient, level 4'
  },
  structuredData: {
    vitals: {
      bloodPressure: {
        systolic: 156,
        diastolic: 94,
        status: 'critical'
      },
      heartRate: {
        value: 78,
        status: 'normal'
      },
      temperature: {
        value: 98.6,
        unit: 'F',
        status: 'normal'
      },
      weight: {
        value: 190,
        unit: 'lbs',
        previousValue: 187,
        change: 3,
        status: 'gained'
      },
      o2Saturation: {
        value: 98,
        status: 'normal'
      }
    },
    clinicalInfo: {
      chiefComplaint: 'Blood pressure check, hypertension follow-up',
      diagnoses: ['Hypertension (Essential)', 'Type 2 Diabetes'],
      medicationsMentioned: [
        { name: 'Lisinopril', dosage: '10mg (increased to 20mg)', frequency: 'Daily', route: 'Oral' },
        { name: 'Amlodipine', dosage: '5mg', frequency: 'Daily', route: 'Oral' },
        { name: 'Metformin', dosage: '1000mg', frequency: 'BID', route: 'Oral' }
      ],
      allergies: ['Lisinopril (causes dry cough) - NKDA documented']
    },
    symptoms: [
      { name: 'Occasional mild headaches', severity: 'mild' },
      { name: 'No dizziness', severity: 'mild' },
      { name: 'No chest pain', severity: 'mild' }
    ],
    extractedAt: new Date().toISOString(),
    confidence: 92
  },
  previousVisitData: {
    vitals: {
      bloodPressure: {
        systolic: 142,
        diastolic: 88,
        status: 'high'
      },
      weight: {
        value: 187,
        unit: 'lbs'
      }
    }
  } as StructuredData
};

export const sampleNoteDiabeticReview: Note = {
  id: 'sample-002',
  patientName: 'Maria Garcia',
  patientAge: '62',
  chiefComplaint: 'Diabetes check, routine follow-up',
  noteType: 'Progress',
  date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks ago
  duration: 1200, // 20 minutes
  content: {
    'interval_history': 'Patient reports improved blood sugar control with current regimen. Using home glucose monitor twice daily. Reports no episodes of hypoglycemia. Denies neuropathic symptoms. Vision stable, no new visual complaints. Has been doing well with diet and regular exercise.',
    'current_status': 'Vital Signs: BP 132/82, HR 72, Temp 98.7°F, RR 14, SpO2 99% on room air. Weight 162 lbs (stable). General: Well-appearing, no acute distress. Skin: Feet examined, no ulcers or signs of neuropathy. Sensation intact to monofilament.',
    'response_to_treatment': 'Blood glucose readings have improved significantly. Latest HbA1c 6.8% (target <7%). Patient very compliant with medications and monitoring. No adverse medication effects reported.',
    'assessment_update': 'Type 2 diabetes mellitus - well-controlled on current regimen. HTN controlled. No evidence of diabetic complications at this time.',
    'plan_modification': 'Continue current medications as tolerated. Metformin 1000mg BID and Sitagliptin 100mg daily showing good efficacy. Continue glucose monitoring. Scheduled eye exam with optometry. Referred to endocrinology for optimization if needed (patient declined for now).',
    'icd10': 'E11.9 - Type 2 diabetes mellitus without complications\nE78.5 - Hyperlipidemia, unspecified',
    'cpt': '99215 - Office or other outpatient visit, established patient, level 5'
  },
  structuredData: {
    vitals: {
      bloodPressure: {
        systolic: 132,
        diastolic: 82,
        status: 'elevated'
      },
      heartRate: {
        value: 72,
        status: 'normal'
      },
      temperature: {
        value: 98.7,
        unit: 'F',
        status: 'normal'
      },
      weight: {
        value: 162,
        unit: 'lbs',
        previousValue: 162,
        change: 0,
        status: 'stable'
      },
      o2Saturation: {
        value: 99,
        status: 'normal'
      }
    },
    clinicalInfo: {
      chiefComplaint: 'Routine diabetes follow-up',
      diagnoses: ['Type 2 Diabetes Mellitus', 'Hypertension', 'Hyperlipidemia'],
      medicationsMentioned: [
        { name: 'Metformin', dosage: '1000mg', frequency: 'BID', route: 'Oral' },
        { name: 'Sitagliptin', dosage: '100mg', frequency: 'Daily', route: 'Oral' },
        { name: 'Lisinopril', dosage: '10mg', frequency: 'Daily', route: 'Oral' },
        { name: 'Atorvastatin', dosage: '20mg', frequency: 'Daily', route: 'Oral' }
      ],
      labValues: [
        { testName: 'HbA1c', value: '6.8', unit: '%', referenceRange: '<5.7%', status: 'normal' },
        { testName: 'Fasting Glucose', value: '118', unit: 'mg/dL', referenceRange: '<100 mg/dL', status: 'high' },
        { testName: 'Creatinine', value: '0.9', unit: 'mg/dL', referenceRange: '0.6-1.2', status: 'normal' }
      ],
      allergies: []
    },
    symptoms: [
      { name: 'No hypoglycemic episodes reported', severity: 'mild' },
      { name: 'No neuropathic symptoms', severity: 'mild' },
      { name: 'Vision stable', severity: 'mild' }
    ],
    extractedAt: new Date().toISOString(),
    confidence: 95
  },
  previousVisitData: {
    vitals: {
      bloodPressure: {
        systolic: 138,
        diastolic: 85,
        status: 'high'
      },
      weight: {
        value: 165,
        unit: 'lbs'
      }
    }
  } as StructuredData
};

export const sampleNoteAcuteIllness: Note = {
  id: 'sample-003',
  patientName: 'James Wilson',
  patientAge: '35',
  chiefComplaint: 'Acute respiratory infection',
  noteType: 'Flexible',
  date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
  duration: 1500, // 25 minutes
  content: {
    'chief_complaint': 'Patient presents with 5-day history of persistent cough, fever, and body aches.',
    'history_of_present_illness': 'Previously healthy 35-year-old male with acute onset of symptoms. Began 5 days ago with sore throat, progressed to productive cough with yellow sputum. Fever peaked at 102.1°F yesterday evening. Reports malaise, body aches, and mild headache. Denies shortness of breath or chest pain. Wife had similar symptoms 2 weeks ago (resolved without complications).',
    'physical_examination': 'Vital Signs: BP 120/76, HR 92, Temp 100.9°F, RR 18, SpO2 96% on room air. General: Mild distress due to coughing. HEENT: Erythematous pharynx, mild exudates noted. Lungs: Scattered crackles throughout lung fields, no consolidation appreciated. Heart: Regular rate and rhythm.',
    'assessment_and_plan': 'Likely viral upper respiratory infection with bronchitis component. Rapid strep negative. Viral culture not indicated. Start supportive care: hydration, rest, humidified air. Acetaminophen or ibuprofen for fever and body aches. Dextromethorphan for cough suppression. Honey may provide symptom relief. Avoid antibiotics at this time given likely viral etiology. Return sooner if develops dyspnea, high fever (>103°F), or signs of pneumonia.',
    'follow_up': 'Advised to rest and hydrate well. Follow up in 7-10 days or sooner if worsens. Provided written precautions to prevent transmission to others.'
  },
  structuredData: {
    vitals: {
      bloodPressure: {
        systolic: 120,
        diastolic: 76,
        status: 'normal'
      },
      heartRate: {
        value: 92,
        status: 'normal'
      },
      temperature: {
        value: 100.9,
        unit: 'F',
        status: 'fever'
      },
      o2Saturation: {
        value: 96,
        status: 'normal'
      },
      respiratoryRate: {
        value: 18,
        status: 'normal'
      }
    },
    clinicalInfo: {
      chiefComplaint: 'Acute respiratory infection - cough, fever, body aches',
      diagnoses: ['Viral Upper Respiratory Infection', 'Acute Bronchitis'],
      medicationsMentioned: [
        { name: 'Acetaminophen', dosage: '500-650mg', frequency: 'Q4-6H PRN', route: 'Oral' },
        { name: 'Ibuprofen', dosage: '400-600mg', frequency: 'Q6H PRN', route: 'Oral' },
        { name: 'Dextromethorphan', dosage: 'per OTC label', frequency: 'As directed', route: 'Oral' }
      ],
      labValues: [
        { testName: 'Rapid Strep', value: 'Negative', status: 'normal' }
      ]
    },
    symptoms: [
      { name: 'Persistent cough', severity: 'moderate', duration: '5 days' },
      { name: 'Productive cough with yellow sputum', severity: 'moderate' },
      { name: 'Fever', severity: 'moderate', duration: '5 days' },
      { name: 'Body aches', severity: 'moderate' },
      { name: 'Sore throat', severity: 'mild' },
      { name: 'Mild headache', severity: 'mild' },
      { name: 'Malaise', severity: 'moderate' }
    ],
    extractedAt: new Date().toISOString(),
    confidence: 88
  }
};

export const allSampleNotes: Note[] = [
  sampleNoteHTNFollowUp,
  sampleNoteDiabeticReview,
  sampleNoteAcuteIllness
];
