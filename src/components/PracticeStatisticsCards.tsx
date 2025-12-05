import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Heart, CheckCircle2, TrendingUp, Activity } from 'lucide-react';

interface PracticeStatisticsCardsProps {
  stats: {
    patientsAtRisk: number;
    preventedReadmissions: number;
    estimatedSaved: number;
    careGapsClosedThisWeek: number;
    qualityScore: number;
    alertResponseRate: number;
    alertResponseTrend: number;
  };
}

export default function PracticeStatisticsCards({
  stats
}: PracticeStatisticsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Patients at Risk */}
      <Card className="bg-gradient-to-br from-red-50 to-red-100/30 border-red-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-red-900">
              Patients at Risk
            </CardTitle>
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-3xl font-bold text-red-700">{stats.patientsAtRisk}</div>
          <p className="text-xs text-red-700">Requiring intervention this week</p>
          <p className="text-xs font-medium text-red-600 pt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            2 from last week
          </p>
        </CardContent>
      </Card>

      {/* Card 2: Prevented Readmissions */}
      <Card className="bg-gradient-to-br from-green-50 to-green-100/30 border-green-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-green-900">
              Prevented Readmissions
            </CardTitle>
            <Heart className="w-5 h-5 text-green-600" />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-3xl font-bold text-green-700">{stats.preventedReadmissions}</div>
          <p className="text-xs text-green-700">This month</p>
          <div className="text-xs font-medium text-green-600 pt-2">
            <p>Est. ${(stats.estimatedSaved / 1000).toFixed(0)}k saved</p>
            <p className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" />
              25% vs last month
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Card 3: Care Gaps Closed */}
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100/30 border-blue-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-blue-900">
              Care Gaps Closed
            </CardTitle>
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-3xl font-bold text-blue-700">
            {stats.careGapsClosedThisWeek}
          </div>
          <p className="text-xs text-blue-700">Preventive care completed</p>
          <p className="text-xs font-medium text-blue-600 pt-2">
            Quality score: {stats.qualityScore}%
          </p>
        </CardContent>
      </Card>

      {/* Card 4: Alert Response Rate */}
      <Card className="bg-gradient-to-br from-purple-50 to-purple-100/30 border-purple-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-purple-900">
              Alert Response Rate
            </CardTitle>
            <Activity className="w-5 h-5 text-purple-600" />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-3xl font-bold text-purple-700">
            {stats.alertResponseRate}%
          </div>
          <p className="text-xs text-purple-700">Alerts acted upon</p>
          <p className="text-xs font-medium text-purple-600 pt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {stats.alertResponseTrend}% from last month
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
