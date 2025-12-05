import { useState } from 'react';
import { type Alert } from '@/types/alerts';
import { Button } from '@/components/ui/button';
import { AlertTriangle, AlertCircle, Info, ChevronDown, X } from 'lucide-react';

interface AlertCardProps {
  alert: Alert;
  onDismiss: (alertId: string) => void;
  onAddToPlan: (alert: Alert) => void;
  isNew?: boolean;
}

export default function AlertCard({
  alert,
  onDismiss,
  onAddToPlan,
  isNew = false
}: AlertCardProps) {
  const [expanded, setExpanded] = useState(false);

  const getAlertStyles = (level: string) => {
    switch (level) {
      case 'critical':
        return {
          bg: 'bg-red-50',
          border: 'border-red-300',
          icon: 'text-red-600',
          badge: 'bg-red-100 text-red-800',
          title: 'text-red-900',
          text: 'text-red-800'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-300',
          icon: 'text-yellow-600',
          badge: 'bg-yellow-100 text-yellow-800',
          title: 'text-yellow-900',
          text: 'text-yellow-800'
        };
      case 'info':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-300',
          icon: 'text-blue-600',
          badge: 'bg-blue-100 text-blue-800',
          title: 'text-blue-900',
          text: 'text-blue-800'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-300',
          icon: 'text-gray-600',
          badge: 'bg-gray-100 text-gray-800',
          title: 'text-gray-900',
          text: 'text-gray-800'
        };
    }
  };

  const getAlertIcon = (level: string) => {
    const iconProps = 'w-5 h-5';
    switch (level) {
      case 'critical':
        return <AlertTriangle className={iconProps} />;
      case 'warning':
        return <AlertTriangle className={iconProps} />;
      case 'info':
        return <AlertCircle className={iconProps} />;
      default:
        return <Info className={iconProps} />;
    }
  };

  const styles = getAlertStyles(alert.level);

  return (
    <div
      className={`
        ${styles.bg} ${styles.border}
        border rounded-lg p-4 space-y-3
        transition-all duration-300
        ${isNew ? 'animate-in fade-in slide-in-from-top-2' : ''}
        ${alert.addedToPlan ? 'opacity-75 grayscale-[0.3]' : ''}
      `}
    >
      {/* Header with icon, title, and close button */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={styles.icon}>
            {getAlertIcon(alert.level)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`font-bold text-sm ${styles.title}`}>
              {alert.title}
            </h3>
            <p className={`text-xs mt-1 ${styles.text} leading-snug`}>
              {alert.description}
            </p>
          </div>
        </div>
        <button
          onClick={() => onDismiss(alert.id)}
          className={`flex-shrink-0 p-1 hover:bg-white/50 rounded transition-colors ${styles.icon}`}
          title="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Risk factors */}
      <div className="ml-8 space-y-1">
        <p className={`text-xs font-semibold ${styles.text}`}>Risk Factors:</p>
        <ul className="space-y-1">
          {alert.riskFactors.map((factor, idx) => (
            <li
              key={idx}
              className={`text-xs ${styles.text} flex items-start gap-2`}
            >
              <span className="flex-shrink-0 mt-1">•</span>
              <span>{factor}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Recommended Actions - Collapsible */}
      <div className="ml-8 space-y-2">
        <button
          onClick={() => setExpanded(!expanded)}
          className={`flex items-center gap-2 text-xs font-semibold ${styles.text} hover:underline`}
        >
          Recommended Actions
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              expanded ? 'transform rotate-180' : ''
            }`}
          />
        </button>

        {expanded && (
          <ul className="space-y-2 animate-in fade-in">
            {alert.recommendedActions.map((action, idx) => (
              <li
                key={action.id}
                className={`text-xs ${styles.text} flex items-start gap-2 pl-4`}
              >
                <span className="flex-shrink-0 mt-1">✓</span>
                <span>{action.text}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 ml-8 pt-2 flex-wrap">
        <Button
          size="sm"
          variant="ghost"
          className={`h-7 text-xs ${styles.badge} hover:${styles.badge}`}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Hide' : 'Show'} Actions
        </Button>
        <Button
          size="sm"
          variant="default"
          className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white"
          onClick={() => onAddToPlan(alert)}
          disabled={alert.addedToPlan}
        >
          {alert.addedToPlan ? '✓ Added to Plan' : 'Add to Plan'}
        </Button>
      </div>

      {/* Status indicator */}
      {alert.addedToPlan && (
        <div className="ml-8 text-xs font-medium text-green-700">
          Actions added to care plan
        </div>
      )}
    </div>
  );
}
