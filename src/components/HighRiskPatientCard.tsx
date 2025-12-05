import { type HighRiskPatient } from '@/lib/dashboardData';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import RiskScoreCircle from './RiskScoreCircle';
import { Phone, User } from 'lucide-react';

interface HighRiskPatientCardProps {
  patient: HighRiskPatient;
  onViewPatient?: (patientId: string) => void;
  onContactPatient?: (patientName: string) => void;
}

const getUrgencyBadge = (level: string) => {
  switch (level) {
    case 'urgent':
      return { icon: '🔴', text: 'Urgent', color: 'text-red-700' };
    case 'warning':
      return { icon: '⚠️', text: 'Warning', color: 'text-yellow-700' };
    case 'monitor':
      return { icon: 'ℹ️', text: 'Monitor', color: 'text-blue-700' };
    default:
      return { icon: 'ℹ️', text: 'Monitor', color: 'text-blue-700' };
  }
};

export default function HighRiskPatientCard({
  patient,
  onViewPatient,
  onContactPatient
}: HighRiskPatientCardProps) {
  const urgency = getUrgencyBadge(patient.urgencyLevel);
  const daysAgoVisit = Math.floor(
    (Date.now() - new Date(patient.lastVisitDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Card className="min-w-64 sm:min-w-80 lg:min-w-0 w-full bg-white hover:shadow-lg transition-shadow flex-shrink-0 lg:flex-shrink snap-start border-slate-200">
      <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
        {/* Header with urgency badge */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm sm:text-lg truncate">
              {patient.name}, {patient.age}{patient.gender}
            </h3>
            <p className={`text-xs sm:text-sm font-semibold mt-1 ${urgency.color}`}>
              {urgency.icon} {urgency.text}
            </p>
          </div>
          <div className="transform scale-50 sm:scale-75 origin-top-right flex-shrink-0">
            <RiskScoreCircle
              score={patient.riskScore}
              riskLevel={patient.riskLevel}
              riskType="Risk Score"
              size="sm"
            />
          </div>
        </div>

        {/* Primary concern */}
        <div className="py-2 sm:py-3 border-t border-b border-slate-100">
          <p className="text-xs sm:text-sm font-semibold text-slate-900 mb-2 line-clamp-2">
            {patient.primaryConcern}
          </p>
          <ul className="space-y-1">
            {patient.topRiskFactors.map((factor, idx) => (
              <li key={idx} className="text-xs text-slate-600 flex items-start gap-2">
                <span className="flex-shrink-0 mt-0.5">•</span>
                <span className="line-clamp-1">{factor}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Visit information */}
        <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
          <div className="flex justify-between text-slate-600">
            <span>Last visit:</span>
            <span className="font-medium text-slate-900">
              {daysAgoVisit} days ago
            </span>
          </div>
          {patient.nextAppointment ? (
            <div className="flex justify-between text-slate-600">
              <span>Next appointment:</span>
              <span className="font-medium text-slate-900">
                {new Date(patient.nextAppointment).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>
          ) : (
            <div className="flex justify-between text-slate-600">
              <span>Next appointment:</span>
              <span className="font-medium text-red-700">Not scheduled</span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-1.5 sm:gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => onViewPatient?.(patient.id)}
          >
            <User className="w-3.5 h-3.5 mr-1.5" />
            View Patient
          </Button>
          <Button
            size="sm"
            className="flex-1"
            onClick={() => onContactPatient?.(patient.name)}
          >
            <Phone className="w-3.5 h-3.5 mr-1.5" />
            Contact
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
