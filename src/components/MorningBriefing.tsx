import { useState } from 'react';
import { AlertTriangle, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MorningBriefingProps {
  doctorName: string;
  urgentPatients: number;
  pendingLabResults: number;
  overdueAppointments: number;
  onStartDay?: () => void;
  onDismiss?: () => void;
}

export default function MorningBriefing({
  doctorName,
  urgentPatients,
  pendingLabResults,
  overdueAppointments,
  onStartDay,
  onDismiss
}: MorningBriefingProps) {
  const [expanded, setExpanded] = useState(true);

  if (!expanded) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5" />
              <h2 className="text-lg font-bold">
                Good morning, Dr. {doctorName.split(' ').pop()}!
              </h2>
            </div>
            <p className="text-blue-100 text-sm">
              Here's what needs attention today:
            </p>
          </div>
          <button
            onClick={() => setExpanded(false)}
            className="text-blue-200 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Priority Items */}
        <div className="bg-blue-500/30 rounded-lg p-4 space-y-2">
          {urgentPatients > 0 && (
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-red-400"></div>
              <span className="text-sm">
                <strong>{urgentPatients}</strong> patient{urgentPatients !== 1 ? 's' : ''} requiring urgent follow-up
              </span>
            </div>
          )}
          {pendingLabResults > 0 && (
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
              <span className="text-sm">
                <strong>{pendingLabResults}</strong> lab result{pendingLabResults !== 1 ? 's' : ''} awaiting review
              </span>
            </div>
          )}
          {overdueAppointments > 0 && (
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-orange-400"></div>
              <span className="text-sm">
                <strong>{overdueAppointments}</strong> patient{overdueAppointments !== 1 ? 's' : ''} overdue for appointments
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button
            onClick={onStartDay}
            size="sm"
            className="bg-white text-blue-600 hover:bg-blue-50 font-medium"
          >
            Start My Day
          </Button>
          <p className="text-xs text-blue-100">
            Review the high-risk patients below and prioritize your morning
          </p>
        </div>
      </div>
    </div>
  );
}
