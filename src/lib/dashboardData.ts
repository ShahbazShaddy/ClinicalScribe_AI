import { type PatientRiskData } from '@/types/riskAssessment';

export interface HighRiskPatient {
  id: string;
  name: string;
  age: number;
  gender: 'M' | 'F';
  riskScore: number;
  riskLevel: 'Low' | 'Moderate' | 'High';
  primaryConcern: string;
  topRiskFactors: string[];
  lastVisitDate: string;
  nextAppointment?: string;
  urgencyLevel: 'urgent' | 'warning' | 'monitor';
  riskData: PatientRiskData;
}

// 8 High-Risk Patients for Dashboard
export const highRiskPatients: HighRiskPatient[] = [
  {
    id: 'patient-1',
    name: 'John Martinez',
    age: 65,
    gender: 'M',
    riskScore: 78,
    riskLevel: 'High',
    primaryConcern: 'High Readmission Risk',
    topRiskFactors: [
      'Recent CHF hospitalization (3 weeks ago)',
      'Weight gain +7 lbs, increased edema'
    ],
    lastVisitDate: '2025-11-29',
    urgencyLevel: 'urgent',
    riskData: {
      currentRisk: {
        overallScore: 78,
        riskLevel: 'High',
        primaryRiskType: 'Hospital Readmission',
        factors: [
          { name: 'Recent hospitalization', impact: 'High', contribution: 30 },
          { name: 'Multiple comorbidities', impact: 'High', contribution: 25 },
          { name: 'Weight gain trend', impact: 'High', contribution: 20 },
          { name: 'Lives alone', impact: 'High', contribution: 23 }
        ],
        timestamp: new Date().toISOString()
      },
      riskHistory: [
        { date: '2025-09-01', score: 55 },
        { date: '2025-09-15', score: 62 },
        { date: '2025-10-01', score: 68 },
        { date: '2025-10-15', score: 72 },
        { date: '2025-11-01', score: 75 },
        { date: '2025-11-29', score: 78 }
      ],
      riskType: 'Readmission'
    }
  },
  {
    id: 'patient-2',
    name: 'Robert Williams',
    age: 71,
    gender: 'M',
    riskScore: 65,
    riskLevel: 'High',
    primaryConcern: 'COPD Exacerbation Risk',
    topRiskFactors: [
      'Current smoker, 20 cigarettes/day',
      'Recent respiratory infection'
    ],
    lastVisitDate: '2025-11-27',
    urgencyLevel: 'warning',
    riskData: {
      currentRisk: {
        overallScore: 65,
        riskLevel: 'High',
        primaryRiskType: 'COPD Exacerbation',
        factors: [
          { name: 'Current smoking', impact: 'High', contribution: 35 },
          { name: 'Advanced age', impact: 'Medium', contribution: 15 },
          { name: 'Recent infection', impact: 'High', contribution: 30 },
          { name: 'Poor adherence', impact: 'Medium', contribution: 20 }
        ],
        timestamp: new Date().toISOString()
      },
      riskHistory: [
        { date: '2025-09-01', score: 58 },
        { date: '2025-09-15', score: 60 },
        { date: '2025-10-01', score: 61 },
        { date: '2025-10-15', score: 63 },
        { date: '2025-11-01', score: 64 },
        { date: '2025-11-27', score: 65 }
      ],
      riskType: 'Exacerbation'
    }
  },
  {
    id: 'patient-3',
    name: 'Maria Garcia',
    age: 58,
    gender: 'F',
    riskScore: 71,
    riskLevel: 'High',
    primaryConcern: 'Diabetic Complications',
    topRiskFactors: [
      'Uncontrolled HbA1c at 8.2%',
      'Declining renal function'
    ],
    lastVisitDate: '2025-11-25',
    urgencyLevel: 'warning',
    riskData: {
      currentRisk: {
        overallScore: 71,
        riskLevel: 'High',
        primaryRiskType: 'Diabetic Complications',
        factors: [
          { name: 'Elevated HbA1c', impact: 'High', contribution: 35 },
          { name: 'Declining eGFR', impact: 'High', contribution: 30 },
          { name: 'Neuropathy developing', impact: 'Medium', contribution: 20 },
          { name: 'Poor dietary compliance', impact: 'Medium', contribution: 15 }
        ],
        timestamp: new Date().toISOString()
      },
      riskHistory: [
        { date: '2025-09-01', score: 52 },
        { date: '2025-09-15', score: 58 },
        { date: '2025-10-01', score: 62 },
        { date: '2025-10-15', score: 66 },
        { date: '2025-11-01', score: 69 },
        { date: '2025-11-25', score: 71 }
      ],
      riskType: 'Complications'
    }
  },
  {
    id: 'patient-4',
    name: 'Patricia Brown',
    age: 52,
    gender: 'F',
    riskScore: 68,
    riskLevel: 'High',
    primaryConcern: 'Post-surgical Infection Risk',
    topRiskFactors: [
      'Recent knee surgery (2 weeks)',
      'Elevated WBC and fever 99.2°F'
    ],
    lastVisitDate: '2025-11-30',
    nextAppointment: '2025-12-02',
    urgencyLevel: 'urgent',
    riskData: {
      currentRisk: {
        overallScore: 68,
        riskLevel: 'High',
        primaryRiskType: 'Surgical Site Infection',
        factors: [
          { name: 'Recent surgery', impact: 'High', contribution: 40 },
          { name: 'Fever present', impact: 'High', contribution: 35 },
          { name: 'Elevated WBC', impact: 'High', contribution: 25 }
        ],
        timestamp: new Date().toISOString()
      },
      riskHistory: [
        { date: '2025-11-16', score: 35 },
        { date: '2025-11-20', score: 45 },
        { date: '2025-11-25', score: 58 },
        { date: '2025-11-30', score: 68 }
      ],
      riskType: 'Infection'
    }
  },
  {
    id: 'patient-5',
    name: 'Michael Johnson',
    age: 67,
    gender: 'M',
    riskScore: 73,
    riskLevel: 'High',
    primaryConcern: 'Medication Non-adherence',
    topRiskFactors: [
      'Missing doses reported at last visit',
      'Complex medication regimen (8 medications)'
    ],
    lastVisitDate: '2025-11-28',
    urgencyLevel: 'warning',
    riskData: {
      currentRisk: {
        overallScore: 73,
        riskLevel: 'High',
        primaryRiskType: 'Non-adherence Risk',
        factors: [
          { name: 'Missed doses', impact: 'High', contribution: 40 },
          { name: 'Complex regimen', impact: 'High', contribution: 30 },
          { name: 'Cognitive decline', impact: 'Medium', contribution: 20 },
          { name: 'No caregiver', impact: 'Medium', contribution: 10 }
        ],
        timestamp: new Date().toISOString()
      },
      riskHistory: [
        { date: '2025-09-01', score: 48 },
        { date: '2025-09-15', score: 55 },
        { date: '2025-10-01', score: 61 },
        { date: '2025-10-15', score: 67 },
        { date: '2025-11-01', score: 70 },
        { date: '2025-11-28', score: 73 }
      ],
      riskType: 'Adherence'
    }
  },
  {
    id: 'patient-6',
    name: 'Linda Davis',
    age: 55,
    gender: 'F',
    riskScore: 62,
    riskLevel: 'High',
    primaryConcern: 'Uncontrolled Hypertension',
    topRiskFactors: [
      'BP consistently >160/100',
      'Not taking antihypertensives regularly'
    ],
    lastVisitDate: '2025-11-26',
    urgencyLevel: 'warning',
    riskData: {
      currentRisk: {
        overallScore: 62,
        riskLevel: 'High',
        primaryRiskType: 'Hypertensive Crisis Risk',
        factors: [
          { name: 'Elevated BP readings', impact: 'High', contribution: 45 },
          { name: 'Poor medication adherence', impact: 'High', contribution: 35 },
          { name: 'Stress reported', impact: 'Medium', contribution: 20 }
        ],
        timestamp: new Date().toISOString()
      },
      riskHistory: [
        { date: '2025-09-01', score: 48 },
        { date: '2025-09-15', score: 52 },
        { date: '2025-10-01', score: 54 },
        { date: '2025-10-15', score: 58 },
        { date: '2025-11-01', score: 60 },
        { date: '2025-11-26', score: 62 }
      ],
      riskType: 'Hypertension'
    }
  },
  {
    id: 'patient-7',
    name: 'James Wilson',
    age: 78,
    gender: 'M',
    riskScore: 69,
    riskLevel: 'High',
    primaryConcern: 'Fall Risk',
    topRiskFactors: [
      'On 10 medications with dizziness side effects',
      'Recent fall, already hospitalized once this year'
    ],
    lastVisitDate: '2025-11-24',
    urgencyLevel: 'warning',
    riskData: {
      currentRisk: {
        overallScore: 69,
        riskLevel: 'High',
        primaryRiskType: 'Fall Risk',
        factors: [
          { name: 'Polypharmacy', impact: 'High', contribution: 35 },
          { name: 'Recent fall', impact: 'High', contribution: 40 },
          { name: 'Cognitive changes', impact: 'Medium', contribution: 15 },
          { name: 'Vision problems', impact: 'Medium', contribution: 10 }
        ],
        timestamp: new Date().toISOString()
      },
      riskHistory: [
        { date: '2025-09-01', score: 52 },
        { date: '2025-09-15', score: 56 },
        { date: '2025-10-01', score: 60 },
        { date: '2025-10-15', score: 64 },
        { date: '2025-11-01', score: 67 },
        { date: '2025-11-24', score: 69 }
      ],
      riskType: 'Fall'
    }
  },
  {
    id: 'patient-8',
    name: 'Barbara Miller',
    age: 61,
    gender: 'F',
    riskScore: 66,
    riskLevel: 'High',
    primaryConcern: 'Early Heart Failure Signs',
    topRiskFactors: [
      'Elevated BNP, shortness of breath',
      'Recent weight gain 8 lbs in 3 weeks'
    ],
    lastVisitDate: '2025-11-30',
    nextAppointment: '2025-12-03',
    urgencyLevel: 'urgent',
    riskData: {
      currentRisk: {
        overallScore: 66,
        riskLevel: 'High',
        primaryRiskType: 'Heart Failure Risk',
        factors: [
          { name: 'Elevated BNP', impact: 'High', contribution: 40 },
          { name: 'Dyspnea on exertion', impact: 'High', contribution: 35 },
          { name: 'Weight gain trend', impact: 'Medium', contribution: 25 }
        ],
        timestamp: new Date().toISOString()
      },
      riskHistory: [
        { date: '2025-09-01', score: 35 },
        { date: '2025-09-15', score: 42 },
        { date: '2025-10-01', score: 48 },
        { date: '2025-10-15', score: 55 },
        { date: '2025-11-01', score: 61 },
        { date: '2025-11-30', score: 66 }
      ],
      riskType: 'Heart Failure'
    }
  }
];

export const getHighRiskPatientsByFilter = (
  filter: 'today' | 'week' | 'all'
): HighRiskPatient[] => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  return highRiskPatients.filter(patient => {
    const visitDate = new Date(patient.lastVisitDate);
    const visitDateOnly = new Date(visitDate.getFullYear(), visitDate.getMonth(), visitDate.getDate());

    if (filter === 'today') {
      return visitDateOnly.getTime() === today.getTime();
    } else if (filter === 'week') {
      return visitDateOnly >= weekAgo && visitDateOnly <= today;
    }
    return true; // 'all'
  });
};

export const getPracticeStatistics = () => {
  const urgentPatients = highRiskPatients.filter(p => p.urgencyLevel === 'urgent').length;
  const highRiskCount = highRiskPatients.length;

  return {
    patientsAtRisk: highRiskCount,
    urgentCount: urgentPatients,
    preventedReadmissions: 12,
    estimatedSaved: 180000,
    careGapsClosedThisWeek: 34,
    qualityScore: 94,
    alertResponseRate: 87,
    alertResponseTrend: 5
  };
};

export const getTodaysPriorityList = () => {
  return [
    {
      id: '1',
      text: '3 patients need follow-up calls',
      priority: 'high',
      patients: ['John Martinez', 'Patricia Brown', 'Barbara Miller']
    },
    {
      id: '2',
      text: '5 lab results pending review',
      priority: 'high',
      count: 5
    },
    {
      id: '3',
      text: '2 patients overdue for appointments',
      priority: 'medium',
      patients: ['Robert Williams', 'Linda Davis']
    },
    {
      id: '4',
      text: '4 medication refills expiring this week',
      priority: 'medium',
      count: 4
    }
  ];
};

export const getRiskTrendData = () => {
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const data = [];
  for (let i = 0; i < 30; i++) {
    const date = new Date(thirtyDaysAgo);
    date.setDate(date.getDate() + i);
    // Simulate declining average risk (improving trend)
    const baseScore = 58 - (i * 0.15);
    const randomVariance = (Math.random() - 0.5) * 3;
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      fullDate: date.toISOString(),
      averageRisk: Math.round(Math.max(50, baseScore + randomVariance))
    });
  }

  return data;
};
