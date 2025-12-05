import { type PatientRiskData, type RiskScore } from '@/types/riskAssessment';

// Sarah Johnson - 52F, Diabetes, Hypertension
export const sarahJohnsonRisk: PatientRiskData = {
  currentRisk: {
    overallScore: 42,
    riskLevel: 'Moderate',
    primaryRiskType: 'Hospital Readmission Risk',
    factors: [
      {
        name: 'Blood Pressure Trending Upward',
        impact: 'High',
        contribution: 35
      },
      {
        name: 'Multiple Daily Medications',
        impact: 'Medium',
        contribution: 20
      },
      {
        name: 'Moderate Medication Adherence',
        impact: 'Medium',
        contribution: 20
      },
      {
        name: 'Age 52 with Comorbidities',
        impact: 'Medium',
        contribution: 15
      },
      {
        name: 'Good Social Support Network',
        impact: 'Low',
        contribution: 10 // Negative contribution (reduces risk)
      }
    ],
    timestamp: new Date().toISOString()
  },
  riskHistory: [
    {
      date: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
      score: 38
    },
    {
      date: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
      score: 40
    },
    {
      date: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
      score: 39
    },
    {
      date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      score: 43
    },
    {
      date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      score: 41
    },
    {
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      score: 42
    }
  ],
  riskType: 'Readmission'
};

// John Martinez - 65M, Congestive Heart Failure, Multiple Comorbidities
export const johnMartinezRisk: PatientRiskData = {
  currentRisk: {
    overallScore: 78,
    riskLevel: 'High',
    primaryRiskType: 'Hospital Readmission Risk',
    factors: [
      {
        name: 'Recent Hospitalization (3 months)',
        impact: 'High',
        contribution: 30
      },
      {
        name: 'Multiple Chronic Conditions (CHF, CKD, Diabetes)',
        impact: 'High',
        contribution: 28
      },
      {
        name: 'Lives Alone Without Caregiver Support',
        impact: 'High',
        contribution: 22
      },
      {
        name: 'Weight Gain Trending (5 lbs/month)',
        impact: 'High',
        contribution: 15
      },
      {
        name: 'Age 65 with Limited Mobility',
        impact: 'Medium',
        contribution: 5
      }
    ],
    timestamp: new Date().toISOString()
  },
  riskHistory: [
    {
      date: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
      score: 55
    },
    {
      date: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
      score: 62
    },
    {
      date: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
      score: 68
    },
    {
      date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      score: 72
    },
    {
      date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      score: 75
    },
    {
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      score: 78
    }
  ],
  riskType: 'Readmission'
};

// Emily Chen - 48F, Asthma, Well-Controlled
export const emilyChenRisk: PatientRiskData = {
  currentRisk: {
    overallScore: 18,
    riskLevel: 'Low',
    primaryRiskType: 'Exacerbation Risk',
    factors: [
      {
        name: 'Young Age (48 years)',
        impact: 'Low',
        contribution: 5
      },
      {
        name: 'Well-Controlled Asthma',
        impact: 'Low',
        contribution: 3
      },
      {
        name: 'Regular Medication Adherence',
        impact: 'Low',
        contribution: 2
      },
      {
        name: 'No Recent Exacerbations',
        impact: 'Low',
        contribution: 2
      },
      {
        name: 'Strong Social Support',
        impact: 'Low',
        contribution: 1
      },
      {
        name: 'Minimal Trigger Exposure',
        impact: 'Low',
        contribution: 5 // Negative contribution (reduces risk)
      }
    ],
    timestamp: new Date().toISOString()
  },
  riskHistory: [
    {
      date: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
      score: 20
    },
    {
      date: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
      score: 19
    },
    {
      date: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
      score: 18
    },
    {
      date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      score: 17
    },
    {
      date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      score: 18
    },
    {
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      score: 18
    }
  ],
  riskType: 'Exacerbation'
};

// Robert Williams - 71M, COPD, Smoker
export const robertWilliamsRisk: PatientRiskData = {
  currentRisk: {
    overallScore: 65,
    riskLevel: 'High',
    primaryRiskType: 'COPD Exacerbation Risk',
    factors: [
      {
        name: 'Current Smoker (20 cigarettes/day)',
        impact: 'High',
        contribution: 28
      },
      {
        name: 'Advanced Age (71 years)',
        impact: 'High',
        contribution: 18
      },
      {
        name: 'Severe COPD with Limited FEV1',
        impact: 'High',
        contribution: 25
      },
      {
        name: 'Recent Respiratory Infection',
        impact: 'Medium',
        contribution: 15
      },
      {
        name: 'Poor Medication Adherence',
        impact: 'High',
        contribution: 14
      }
    ],
    timestamp: new Date().toISOString()
  },
  riskHistory: [
    {
      date: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
      score: 58
    },
    {
      date: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
      score: 60
    },
    {
      date: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
      score: 61
    },
    {
      date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      score: 63
    },
    {
      date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      score: 64
    },
    {
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      score: 65
    }
  ],
  riskType: 'Exacerbation'
};

// Sample patient risk data map
export const patientRiskDataMap: Record<string, PatientRiskData> = {
  'sarah-johnson': sarahJohnsonRisk,
  'john-martinez': johnMartinezRisk,
  'emily-chen': emilyChenRisk,
  'robert-williams': robertWilliamsRisk
};
