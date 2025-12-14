export interface ConfidenceScoreProps {
  score: number; // 0-1 or 0-100
  label?: string;
  showBar?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function ConfidenceScore({ 
  score, 
  label, 
  showBar = true, 
  size = 'md',
  className = '' 
}: ConfidenceScoreProps) {
  // Normalize score to 0-100
  const normalizedScore = score <= 1 ? score * 100 : score;
  
  // Determine color based on score
  const getColorClasses = () => {
    if (normalizedScore >= 80) return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
    if (normalizedScore >= 60) return 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400';
    return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
  };
  
  const getBarColorClass = () => {
    if (normalizedScore >= 80) return 'bg-green-500';
    if (normalizedScore >= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };
  
  const sizeStyles = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };
  
  return (
    <div className={`inline-flex flex-col gap-1 ${className}`}>
      <div className={`inline-flex items-center gap-2 ${sizeStyles[size]}`}>
        <span className={`font-semibold px-2 py-0.5 rounded ${getColorClasses()}`}>
          {normalizedScore.toFixed(0)}%
        </span>
        {label && <span className="text-gray-600 dark:text-gray-400">{label}</span>}
      </div>
      
      {showBar && (
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700">
          <div
            className={`h-full ${getBarColorClass()} transition-all duration-500 ease-out`}
            style={{ width: `${normalizedScore}%` }}
          />
        </div>
      )}
    </div>
  );
}
