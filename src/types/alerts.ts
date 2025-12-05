/**
 * Alert Types and Interfaces
 */

export type AlertLevel = 'critical' | 'warning' | 'info';

export type AlertType = 
  | 'readmission-risk'
  | 'drug-interaction'
  | 'care-gap'
  | 'vital-trend'
  | 'early-deterioration';

export interface AlertAction {
  id: string;
  text: string;
  actionType: 'medication' | 'test' | 'referral' | 'education' | 'monitoring' | 'other';
}

export interface Alert {
  id: string;
  type: AlertType;
  level: AlertLevel;
  title: string;
  description: string;
  riskFactors: string[];
  recommendedActions: AlertAction[];
  timestamp: string;
  dismissed: boolean;
  addedToPlan: boolean;
  expandedActions: boolean;
}

export interface AlertSummary {
  totalAlerts: number;
  criticalCount: number;
  warningCount: number;
  infoCount: number;
  actionsAdded: string[];
  alertsDismissed: string[];
  timestamp: string;
}
