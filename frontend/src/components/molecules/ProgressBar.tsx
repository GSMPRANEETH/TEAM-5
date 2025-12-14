export interface ProgressStage {
  label: string;
  status: 'pending' | 'active' | 'complete' | 'error';
}

export interface ProgressBarProps {
  stages: ProgressStage[];
  className?: string;
}

export default function ProgressBar({ stages, className = '' }: ProgressBarProps) {
  const getStageIcon = (status: ProgressStage['status']) => {
    switch (status) {
      case 'complete':
        return '✓';
      case 'active':
        return '○';
      case 'error':
        return '✗';
      default:
        return '○';
    }
  };
  
  const getStageColor = (status: ProgressStage['status']) => {
    switch (status) {
      case 'complete':
        return 'text-green-600 border-green-600 bg-green-50 dark:bg-green-900/30';
      case 'active':
        return 'text-blue-600 border-blue-600 bg-blue-50 dark:bg-blue-900/30 animate-pulse';
      case 'error':
        return 'text-red-600 border-red-600 bg-red-50 dark:bg-red-900/30';
      default:
        return 'text-gray-400 border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600';
    }
  };
  
  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between">
        {stages.map((stage, index) => (
          <div key={index} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-8 h-8 rounded-full border-2 flex items-center justify-center
                  text-sm font-semibold transition-all duration-300
                  ${getStageColor(stage.status)}
                `}
              >
                {getStageIcon(stage.status)}
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400 mt-1 text-center max-w-[80px]">
                {stage.label}
              </span>
            </div>
            
            {index < stages.length - 1 && (
              <div className="flex-1 h-0.5 mx-2 bg-gray-200 dark:bg-gray-700 relative">
                <div
                  className={`
                    absolute top-0 left-0 h-full transition-all duration-500
                    ${stage.status === 'complete' ? 'bg-green-500 w-full' : 'w-0'}
                  `}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
