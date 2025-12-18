import { type RiskScore } from '@/types/riskAssessment';

interface RiskScoreCircleProps {
  score?: number;
  riskLevel?: 'Low' | 'Moderate' | 'High';
  riskType?: string;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onClick?: () => void;
}

export default function RiskScoreCircle({
  score = 0,
  riskLevel = 'Low',
  riskType = 'Risk',
  size = 'md',
  interactive = false,
  onClick
}: RiskScoreCircleProps) {
  // Determine colors based on risk level
  const getColors = (level: string) => {
    switch (level) {
      case 'Low':
        return {
          bg: 'bg-gradient-to-br from-green-50 to-green-100',
          ring: 'ring-green-200',
          text: 'text-green-700',
          score: 'text-green-600',
          border: 'border-green-200'
        };
      case 'Moderate':
        return {
          bg: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
          ring: 'ring-yellow-200',
          text: 'text-yellow-700',
          score: 'text-yellow-600',
          border: 'border-yellow-200'
        };
      case 'High':
        return {
          bg: 'bg-gradient-to-br from-red-50 to-red-100',
          ring: 'ring-red-200',
          text: 'text-red-700',
          score: 'text-red-600',
          border: 'border-red-200'
        };
      default:
        return {
          bg: 'bg-gradient-to-br from-gray-50 to-gray-100',
          ring: 'ring-gray-200',
          text: 'text-gray-700',
          score: 'text-gray-600',
          border: 'border-gray-200'
        };
    }
  };

  const getSizeClasses = (s: string) => {
    switch (s) {
      case 'sm':
        return {
          container: 'w-24 h-24',
          score: 'text-2xl',
          label: 'text-xs',
          type: 'text-[10px]'
        };
      case 'md':
        return {
          container: 'w-32 h-32',
          score: 'text-4xl',
          label: 'text-sm',
          type: 'text-xs'
        };
      case 'lg':
        return {
          container: 'w-40 h-40',
          score: 'text-6xl',
          label: 'text-base',
          type: 'text-sm'
        };
      default:
        return {
          container: 'w-32 h-32',
          score: 'text-4xl',
          label: 'text-sm',
          type: 'text-xs'
        };
    }
  };

  const colors = getColors(riskLevel);
  const sizes = getSizeClasses(size);

  // Calculate circumference for progress circle (not used in current design but available)
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <button
      onClick={onClick}
      disabled={!interactive}
      className={`
        relative inline-flex items-center justify-center
        ${sizes.container}
        rounded-full
        ${colors.bg}
        ring-2 ${colors.ring}
        ${colors.border}
        transition-all duration-300
        ${interactive ? 'hover:shadow-lg hover:scale-105 cursor-pointer' : 'cursor-default'}
        focus:outline-none focus:ring-4 focus:ring-offset-2
      `}
    >
      <div className="flex flex-col items-center justify-center">
        <div className={`font-bold ${sizes.score} ${colors.score}`}>
          {Math.round(score)}
        </div>
        <div className={`font-semibold ${sizes.label} ${colors.text}`}>
          {riskLevel}
        </div>
        <div className={`${sizes.type} ${colors.text} mt-1 text-center px-1`}>
          {riskType}
        </div>
      </div>

      {/* Animated pulse for high risk */}
      {riskLevel === 'High' && (
        <div className="absolute inset-0 rounded-full animate-pulse">
          <div className={`w-full h-full rounded-full ring-2 ring-red-400 opacity-30`} />
        </div>
      )}

      {/* Interactive tooltip hint */}
      {interactive && (
        <div className="absolute -bottom-6 text-xs text-muted-foreground opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Click for details
        </div>
      )}
    </button>
  );
}
