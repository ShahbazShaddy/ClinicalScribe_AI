import { type Alert, type AlertSummary } from '@/types/alerts';
import { AlertTriangle, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface AlertSummaryPanelProps {
  alerts: Alert[];
  timestamp?: string;
}

export default function AlertSummaryPanel({
  alerts,
  timestamp
}: AlertSummaryPanelProps) {
  const activeAlerts = alerts.filter(a => !a.dismissed);
  const dismissedAlerts = alerts.filter(a => a.dismissed);
  const addedToPlanAlerts = alerts.filter(a => a.addedToPlan);

  const criticalCount = activeAlerts.filter(a => a.level === 'critical').length;
  const warningCount = activeAlerts.filter(a => a.level === 'warning').length;
  const infoCount = activeAlerts.filter(a => a.level === 'info').length;

  if (alerts.length === 0) {
    return null;
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 to-slate-50 border-slate-200">
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h3 className="text-base font-bold text-slate-900">Alert Summary</h3>
          {timestamp && (
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(timestamp).toLocaleTimeString()}
            </p>
          )}
        </div>

        {/* Alert Count Summary */}
        <div className="grid grid-cols-3 gap-3">
          {criticalCount > 0 && (
            <div className="p-3 bg-red-100 rounded-lg border border-red-200">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-xs font-semibold text-red-900">Critical</span>
              </div>
              <p className="text-lg font-bold text-red-700">{criticalCount}</p>
            </div>
          )}
          {warningCount > 0 && (
            <div className="p-3 bg-yellow-100 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <span className="text-xs font-semibold text-yellow-900">Warning</span>
              </div>
              <p className="text-lg font-bold text-yellow-700">{warningCount}</p>
            </div>
          )}
          {infoCount > 0 && (
            <div className="p-3 bg-blue-100 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-semibold text-blue-900">Info</span>
              </div>
              <p className="text-lg font-bold text-blue-700">{infoCount}</p>
            </div>
          )}
        </div>

        {/* Actions Added to Plan */}
        {addedToPlanAlerts.length > 0 && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-green-900 mb-2">
                  Actions Added to Care Plan
                </p>
                <ul className="space-y-1">
                  {addedToPlanAlerts.flatMap(alert =>
                    alert.recommendedActions.map(action => (
                      <li
                        key={`${alert.id}-${action.id}`}
                        className="text-xs text-green-800"
                      >
                        • {action.text}
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Dismissed Alerts */}
        {dismissedAlerts.length > 0 && (
          <div className="p-3 bg-slate-100 border border-slate-300 rounded-lg">
            <p className="text-xs font-semibold text-slate-900 mb-2">
              Dismissed Alerts: {dismissedAlerts.length}
            </p>
            <ul className="space-y-1">
              {dismissedAlerts.map(alert => (
                <li key={alert.id} className="text-xs text-slate-700">
                  • {alert.title}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendation */}
        {activeAlerts.length > 0 && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-900">
              <span className="font-semibold">Note:</span> Review all clinical alerts
              and add relevant actions to your care plan for comprehensive patient
              management.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
