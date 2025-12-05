import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface PriorityItem {
  id: string;
  text: string;
  priority: 'high' | 'medium' | 'low';
  patients?: string[];
  count?: number;
}

interface PriorityListPanelProps {
  items: PriorityItem[];
  onItemClick?: (itemId: string) => void;
}

export default function PriorityListPanel({
  items,
  onItemClick
}: PriorityListPanelProps) {
  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-primary" />
          Today's Priority List
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onItemClick?.(item.id)}
            className="w-full text-left p-4 rounded-lg border border-slate-100 hover:border-primary hover:bg-primary-50 transition-all group"
          >
            <div className="flex items-start gap-3">
              <div className="mt-1">
                {item.priority === 'high' ? (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-yellow-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 group-hover:text-primary">
                  {item.text}
                </p>
                {item.patients && item.patients.length > 0 && (
                  <p className="text-xs text-slate-500 mt-1">
                    {item.patients.join(', ')}
                  </p>
                )}
                {item.count && (
                  <p className="text-xs text-slate-500 mt-1">
                    {item.count} item{item.count !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
              <div className="text-xs font-semibold px-2 py-1 rounded bg-slate-100 text-slate-700 group-hover:bg-primary group-hover:text-white whitespace-nowrap">
                {item.priority === 'high' ? 'High' : 'Medium'}
              </div>
            </div>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}
