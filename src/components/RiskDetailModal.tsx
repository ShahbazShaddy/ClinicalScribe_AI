import { type RiskScore } from '@/types/riskAssessment';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import RiskScoreCircle from './RiskScoreCircle';
import { AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';

interface RiskDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  riskScore: RiskScore;
  patientName?: string;
}

export default function RiskDetailModal({
  open,
  onOpenChange,
  riskScore,
  patientName = 'Patient'
}: RiskDetailModalProps) {
  const getImpactColor = (impact: 'High' | 'Medium' | 'Low') => {
    switch (impact) {
      case 'High':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low':
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getImpactIcon = (impact: 'High' | 'Medium' | 'Low') => {
    switch (impact) {
      case 'High':
        return <TrendingUp className="w-4 h-4 text-red-600" />;
      case 'Medium':
        return <TrendingUp className="w-4 h-4 text-yellow-600" />;
      case 'Low':
        return <TrendingDown className="w-4 h-4 text-green-600" />;
    }
  };

  const getRiskLevelDescription = (level: 'Low' | 'Moderate' | 'High') => {
    switch (level) {
      case 'Low':
        return 'Patient has a low risk of adverse outcomes. Continue routine monitoring and preventive care.';
      case 'Moderate':
        return 'Patient has a moderate risk. Increased monitoring and proactive intervention may be beneficial.';
      case 'High':
        return 'Patient has a high risk of adverse outcomes. Intensive monitoring and early intervention is recommended.';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Risk Assessment - {patientName}</DialogTitle>
          <DialogDescription>
            Detailed breakdown of patient risk factors and contributing elements
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Overall Risk Score */}
          <div className="flex flex-col items-center space-y-4 p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200">
            <RiskScoreCircle
              score={riskScore.overallScore}
              riskLevel={riskScore.riskLevel}
              riskType={riskScore.primaryRiskType}
              size="lg"
            />
            <div className="text-center space-y-2 max-w-sm">
              <p className="text-sm font-medium text-slate-600">
                {getRiskLevelDescription(riskScore.riskLevel)}
              </p>
              <p className="text-xs text-slate-500">
                Last updated: {new Date(riskScore.timestamp).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Risk Factors List */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Contributing Risk Factors</h3>

            {riskScore.factors && riskScore.factors.length > 0 ? (
              <div className="space-y-3">
                {riskScore.factors.map((factor, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 ${getImpactColor(factor.impact)}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 flex-1">
                        {getImpactIcon(factor.impact)}
                        <span className="font-medium">{factor.name}</span>
                      </div>
                      <Badge variant="outline" className={getImpactColor(factor.impact)}>
                        {factor.impact} Impact
                      </Badge>
                    </div>

                    {/* Contribution bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600">Contribution to Overall Risk</span>
                        <span className="font-semibold">{factor.contribution}%</span>
                      </div>
                      <Progress value={factor.contribution} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                <p className="text-sm text-slate-600">No specific risk factors identified</p>
              </div>
            )}
          </div>

          {/* Risk Level Info Banner */}
          <div className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium text-blue-900 text-sm">
                Clinical Recommendations
              </p>
              {riskScore.riskLevel === 'Low' && (
                <p className="text-sm text-blue-800">
                  Continue routine follow-ups and preventive care measures.
                </p>
              )}
              {riskScore.riskLevel === 'Moderate' && (
                <p className="text-sm text-blue-800">
                  Schedule more frequent check-ins, monitor vital trends, and reinforce medication adherence.
                </p>
              )}
              {riskScore.riskLevel === 'High' && (
                <p className="text-sm text-blue-800">
                  Implement intensive monitoring, consider specialist consultation, and develop detailed intervention plan.
                </p>
              )}
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
              <p className="text-xs text-slate-600 mb-1">Overall Score</p>
              <p className="text-2xl font-bold">{Math.round(riskScore.overallScore)}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
              <p className="text-xs text-slate-600 mb-1">Risk Level</p>
              <p className="text-lg font-semibold">{riskScore.riskLevel}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
              <p className="text-xs text-slate-600 mb-1">Risk Type</p>
              <p className="text-sm font-semibold line-clamp-2">{riskScore.primaryRiskType}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
