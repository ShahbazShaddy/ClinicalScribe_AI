import { type Alert, type AlertType } from '@/types/alerts';

/**
 * Alert Type 1: High Readmission Risk
 */
export const createReadmissionRiskAlert = (): Alert => ({
  id: `alert-readmission-${Date.now()}`,
  type: 'readmission-risk',
  level: 'critical',
  title: 'HIGH READMISSION RISK DETECTED',
  description: 'This patient has 73% probability of readmission in next 30 days',
  riskFactors: [
    'Recent hospitalization (CHF exacerbation, 3 weeks ago)',
    'Weight gain: +7 lbs in 2 weeks',
    'Patient reports: "Ankles more swollen"',
    'Missed medication doses mentioned'
  ],
  recommendedActions: [
    { id: '1', text: 'Order BNP level today', actionType: 'test' },
    { id: '2', text: 'Increase Lasix dose', actionType: 'medication' },
    { id: '3', text: 'Schedule nurse follow-up call (48-72 hours)', actionType: 'monitoring' },
    { id: '4', text: 'Consider CHF clinic referral', actionType: 'referral' },
    { id: '5', text: 'Home health evaluation', actionType: 'other' }
  ],
  timestamp: new Date().toISOString(),
  dismissed: false,
  addedToPlan: false,
  expandedActions: false
});

/**
 * Alert Type 2: Medication Interaction
 */
export const createDrugInteractionAlert = (): Alert => ({
  id: `alert-interaction-${Date.now()}`,
  type: 'drug-interaction',
  level: 'critical',
  title: 'POTENTIAL DRUG INTERACTION',
  description: 'Patient mentions taking ibuprofen regularly with current ACE inhibitor',
  riskFactors: [
    'Patient taking ibuprofen regularly',
    'Current medications include Lisinopril',
    'NSAIDs can reduce ACE inhibitor effectiveness and increase kidney risk'
  ],
  recommendedActions: [
    { id: '1', text: 'Discuss alternative pain management', actionType: 'education' },
    { id: '2', text: 'Consider acetaminophen instead', actionType: 'medication' },
    { id: '3', text: 'Order creatinine if NSAID use continues', actionType: 'test' },
    { id: '4', text: 'Patient education on interaction', actionType: 'education' }
  ],
  timestamp: new Date().toISOString(),
  dismissed: false,
  addedToPlan: false,
  expandedActions: false
});

/**
 * Alert Type 3: Care Gap Detected
 */
export const createCareGapAlert = (): Alert => ({
  id: `alert-care-gap-${Date.now()}`,
  type: 'care-gap',
  level: 'warning',
  title: 'PREVENTIVE CARE OVERDUE',
  description: 'Diabetic patient overdue for essential preventive screenings',
  riskFactors: [
    'Annual eye exam (last: 14 months ago)',
    'A1C check (last: 5 months ago)',
    'Foot exam (last: 8 months ago)',
    'Annual microalbumin (last: 16 months ago)'
  ],
  recommendedActions: [
    { id: '1', text: 'Order A1C today', actionType: 'test' },
    { id: '2', text: 'Refer to ophthalmology', actionType: 'referral' },
    { id: '3', text: 'Schedule podiatry visit', actionType: 'referral' },
    { id: '4', text: 'Order urine microalbumin', actionType: 'test' }
  ],
  timestamp: new Date().toISOString(),
  dismissed: false,
  addedToPlan: false,
  expandedActions: false
});

/**
 * Alert Type 4: Vital Trend Warning
 */
export const createVitalTrendAlert = (): Alert => ({
  id: `alert-vital-trend-${Date.now()}`,
  type: 'vital-trend',
  level: 'warning',
  title: 'CONCERNING VITAL TREND',
  description: 'Blood Pressure trending upward over recent visits',
  riskFactors: [
    '6 months ago: 128/78',
    '3 months ago: 138/84',
    'Today: 156/94',
    'Patient on Lisinopril 10mg daily'
  ],
  recommendedActions: [
    { id: '1', text: 'Consider medication adjustment (increase to 20mg)', actionType: 'medication' },
    { id: '2', text: 'Review medication adherence', actionType: 'education' },
    { id: '3', text: 'Dietary counseling (sodium reduction)', actionType: 'education' },
    { id: '4', text: 'Recheck BP in 2 weeks', actionType: 'monitoring' }
  ],
  timestamp: new Date().toISOString(),
  dismissed: false,
  addedToPlan: false,
  expandedActions: false
});

/**
 * Alert Type 5: Early Deterioration Signs
 */
export const createEarlyDeteriorationAlert = (): Alert => ({
  id: `alert-deterioration-${Date.now()}`,
  type: 'early-deterioration',
  level: 'critical',
  title: 'EARLY WARNING SIGNS',
  description: 'Pattern suggests possible infection/sepsis risk',
  riskFactors: [
    'Patient reports: Increased fatigue (3 days)',
    'Mild fever mentioned (99.8°F)',
    'Recent hospitalization (2 weeks ago)',
    'Immunosuppressed (on prednisone)'
  ],
  recommendedActions: [
    { id: '1', text: 'Check vital signs carefully', actionType: 'monitoring' },
    { id: '2', text: 'Consider CBC and urinalysis', actionType: 'test' },
    { id: '3', text: 'Lower threshold for further workup', actionType: 'other' },
    { id: '4', text: 'Patient education on warning signs', actionType: 'education' },
    { id: '5', text: 'Ensure 24-hour contact availability', actionType: 'other' }
  ],
  timestamp: new Date().toISOString(),
  dismissed: false,
  addedToPlan: false,
  expandedActions: false
});

/**
 * Generate random alerts for simulation (1-3 per note)
 */
export const generateSimulatedAlerts = (): Alert[] => {
  const alertGenerators = [
    createReadmissionRiskAlert,
    createDrugInteractionAlert,
    createCareGapAlert,
    createVitalTrendAlert,
    createEarlyDeteriorationAlert
  ];

  const numAlerts = Math.floor(Math.random() * 3) + 1; // 1-3 alerts
  const selectedIndices = new Set<number>();

  while (selectedIndices.size < Math.min(numAlerts, alertGenerators.length)) {
    selectedIndices.add(Math.floor(Math.random() * alertGenerators.length));
  }

  return Array.from(selectedIndices).map(i => alertGenerators[i]());
};
