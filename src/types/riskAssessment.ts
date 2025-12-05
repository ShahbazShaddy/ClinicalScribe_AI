/**
 * Risk Assessment Types and Interfaces
 */

export interface RiskFactor {
  name: string;
  impact: 'High' | 'Medium' | 'Low';
  contribution: number; // 0-100, percentage of overall risk
}

export interface RiskScore {
  overallScore: number; // 0-100
  riskLevel: 'Low' | 'Moderate' | 'High';
  primaryRiskType: string; // e.g., "Readmission Risk", "Sepsis Risk", "Fall Risk"
  factors: RiskFactor[];
  timestamp: string;
}

export interface RiskTrend {
  date: string;
  score: number;
}

export interface PatientRiskData {
  currentRisk: RiskScore;
  riskHistory: RiskTrend[];
  riskType: string; // e.g., "Readmission", "Exacerbation", "Falls"
}
