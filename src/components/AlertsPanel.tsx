import { useState } from 'react';
import { type Alert, type AlertSummary } from '@/types/alerts';
import AlertCard from './AlertCard';
import { Button } from '@/components/ui/button';
import { ChevronRight, Bell, AlertTriangle, AlertCircle, Info, Trash2 } from 'lucide-react';

interface AlertsPanelProps {
  alerts: Alert[];
  onDismissAlert: (alertId: string) => void;
  onAddToPlan: (alert: Alert) => void;
  onClearAll: () => void;
  hasNewAlert?: boolean;
}

export default function AlertsPanel({
  alerts,
  onDismissAlert,
  onAddToPlan,
  onClearAll,
  hasNewAlert = false
}: AlertsPanelProps) {
  const [collapsed, setCollapsed] = useState(false);

  const activeAlerts = alerts.filter(a => !a.dismissed);
  const criticalCount = activeAlerts.filter(a => a.level === 'critical').length;
  const warningCount = activeAlerts.filter(a => a.level === 'warning').length;
  const infoCount = activeAlerts.filter(a => a.level === 'info').length;

  // Get the first new alert for notification
  const newAlert = alerts.find(a => !a.dismissed && a.addedToPlan === false);

  return (
    <div className="bg-white rounded-lg shadow-lg border border-slate-200 h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div
        className="bg-gradient-to-r from-slate-900 to-slate-800 px-4 py-3 flex items-center justify-between cursor-pointer hover:from-slate-800 hover:to-slate-700 transition-all"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="w-5 h-5 text-white" />
            {hasNewAlert && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            )}
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Clinical Alerts</h2>
            <p className="text-xs text-slate-300">
              {activeAlerts.length} active {activeAlerts.length === 1 ? 'alert' : 'alerts'}
            </p>
          </div>
        </div>
        <ChevronRight
          className={`w-5 h-5 text-white transition-transform ${
            collapsed ? '' : 'transform rotate-90'
          }`}
        />
      </div>

      {/* Alert Summary Badges */}
      {!collapsed && (
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex gap-2 flex-wrap">
          {criticalCount > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-red-100 text-red-700 rounded text-xs font-medium">
              <AlertTriangle className="w-3.5 h-3.5" />
              Critical: {criticalCount}
            </div>
          )}
          {warningCount > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">
              <AlertTriangle className="w-3.5 h-3.5" />
              Warning: {warningCount}
            </div>
          )}
          {infoCount > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              Info: {infoCount}
            </div>
          )}
          {activeAlerts.length === 0 && (
            <p className="text-xs text-slate-500">No active alerts</p>
          )}
        </div>
      )}

      {/* Alerts List */}
      {!collapsed && (
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {activeAlerts.length > 0 ? (
            activeAlerts.map(alert => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onDismiss={onDismissAlert}
                onAddToPlan={onAddToPlan}
                isNew={newAlert?.id === alert.id}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-sm text-slate-500">No clinical alerts</p>
              <p className="text-xs text-slate-400 mt-1">
                Alerts will appear as you record
              </p>
            </div>
          )}
        </div>
      )}

      {/* Footer Actions */}
      {!collapsed && activeAlerts.length > 0 && (
        <div className="border-t border-slate-200 px-4 py-3 bg-slate-50 flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 h-8 text-xs"
            onClick={onClearAll}
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            Dismiss All
          </Button>
        </div>
      )}
    </div>
  );
}
