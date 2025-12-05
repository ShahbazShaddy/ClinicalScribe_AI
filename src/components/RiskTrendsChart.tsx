import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingDown } from 'lucide-react';

interface RiskTrendData {
  date: string;
  fullDate: string;
  averageRisk: number;
}

interface RiskTrendsChartProps {
  data: RiskTrendData[];
  onViewAnalytics?: () => void;
}

export default function RiskTrendsChart({
  data,
  onViewAnalytics
}: RiskTrendsChartProps) {
  if (!data || data.length === 0) {
    return null;
  }

  const maxRisk = Math.max(...data.map(d => d.averageRisk), 70);
  const minRisk = Math.min(...data.map(d => d.averageRisk), 50);
  const range = maxRisk - minRisk;
  const currentRisk = data[data.length - 1].averageRisk;
  const previousRisk = data[data.length - 8]?.averageRisk || data[0].averageRisk;
  const trend = previousRisk - currentRisk;
  const trendPercent = ((trend / previousRisk) * 100).toFixed(1);

  // Show every 5th data point for x-axis labels
  const displayData = data.map((d, i) => ({
    ...d,
    showLabel: i % 5 === 0 || i === data.length - 1
  }));

  return (
    <Card className="border-slate-200 w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-green-600" />
              Risk Trends
            </CardTitle>
            <CardDescription>
              Average patient risk score over the last 30 days
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-slate-900">{currentRisk}</div>
            <p className="text-xs font-medium text-green-600 flex items-center justify-end gap-1 mt-1">
              <TrendingDown className="w-3 h-3" />
              {trendPercent}% improvement
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        {/* Simple line chart */}
        <div className="relative h-48 sm:h-64 bg-gradient-to-b from-slate-50 to-slate-100 rounded-lg p-4 flex flex-col">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-4 bottom-4 flex flex-col justify-between text-xs text-slate-500 font-medium w-10">
            <span>{Math.round(maxRisk)}</span>
            <span>{Math.round((maxRisk + minRisk) / 2)}</span>
            <span>{Math.round(minRisk)}</span>
          </div>

          {/* Chart area */}
          <div className="flex-1 relative ml-10 mr-2">
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              <div className="border-t border-slate-200"></div>
              <div className="border-t border-slate-200"></div>
              <div className="border-t border-slate-200"></div>
            </div>

            {/* SVG Line Chart */}
            <svg
              className="absolute inset-0 w-full h-full"
              preserveAspectRatio="none"
              viewBox={`0 0 ${displayData.length} ${range}`}
            >
              {/* Line path */}
              <polyline
                points={displayData
                  .map((d, i) => `${i},${maxRisk - d.averageRisk}`)
                  .join(' ')}
                fill="none"
                stroke="rgb(59, 130, 246)"
                strokeWidth={2}
                vectorEffect="non-scaling-stroke"
              />

              {/* Area under curve */}
              <polygon
                points={`0,${maxRisk - displayData[0].averageRisk} ${displayData
                  .map((d, i) => `${i},${maxRisk - d.averageRisk}`)
                  .join(' ')} ${displayData.length},${range}`}
                fill="url(#gradient)"
                opacity="0.2"
              />

              {/* Gradient definition */}
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Data points */}
              {displayData.map((d, i) => (
                <circle
                  key={i}
                  cx={i}
                  cy={maxRisk - d.averageRisk}
                  r={1}
                  fill={trend > 0 ? 'rgb(34, 197, 94)' : 'rgb(59, 130, 246)'}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </svg>
          </div>

          {/* X-axis labels */}
          <div className="flex justify-between text-xs text-slate-500 font-medium px-10 pt-2">
            {displayData.map((d, i) => (
              <span key={i} className={d.showLabel ? 'visible' : 'invisible'}>
                {d.date}
              </span>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-2">
          <div className="text-center">
            <p className="text-xs text-slate-600 mb-1">Starting Risk</p>
            <p className="text-lg font-bold text-slate-900">{data[0].averageRisk}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-600 mb-1">Current Risk</p>
            <p className="text-lg font-bold text-slate-900">{currentRisk}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-600 mb-1">Improvement</p>
            <p className="text-lg font-bold text-green-600">{trendPercent}%</p>
          </div>
        </div>

        {/* CTA Button */}
        <Button
          variant="outline"
          className="w-full"
          onClick={onViewAnalytics}
        >
          View Full Analytics
        </Button>
      </CardContent>
    </Card>
  );
}
