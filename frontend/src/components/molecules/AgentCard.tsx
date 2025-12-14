import Badge from '../atoms/Badge';

export interface AgentStatus {
  id: string;
  name: string;
  status: 'pending' | 'active' | 'complete' | 'error';
  specialization?: string;
  progress?: number;
  result?: string;
  timestamp?: string;
}

export interface AgentCardProps {
  agent: AgentStatus;
  onClick?: () => void;
  className?: string;
}

export default function AgentCard({ agent, onClick, className = '' }: AgentCardProps) {
  const statusConfig = {
    pending: {
      icon: '⏳',
      label: 'Waiting',
      variant: 'neutral' as const,
      bgColor: 'bg-gray-50 dark:bg-gray-800/50',
    },
    active: {
      icon: '🔄',
      label: 'Investigating',
      variant: 'info' as const,
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    complete: {
      icon: '✅',
      label: 'Complete',
      variant: 'success' as const,
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    error: {
      icon: '⚠️',
      label: 'Error',
      variant: 'error' as const,
      bgColor: 'bg-red-50 dark:bg-red-900/20',
    },
  };
  
  const config = statusConfig[agent.status];
  
  return (
    <div
      className={`
        ${config.bgColor}
        border border-gray-200 dark:border-gray-700
        rounded-lg p-4
        ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}
        ${className}
      `}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={agent.status === 'active' ? 'animate-spin-slow' : ''}>
            {config.icon}
          </span>
          <h4 className="font-semibold text-gray-900 dark:text-gray-100">
            {agent.name}
          </h4>
        </div>
        <Badge variant={config.variant} size="sm">
          {config.label}
        </Badge>
      </div>
      
      {agent.specialization && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          {agent.specialization}
        </p>
      )}
      
      {agent.progress !== undefined && agent.status === 'active' && (
        <div className="mb-2">
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
            <span>Progress</span>
            <span>{agent.progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${agent.progress}%` }}
            />
          </div>
        </div>
      )}
      
      {agent.result && agent.status === 'complete' && (
        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
          {agent.result}
        </p>
      )}
      
      {agent.timestamp && (
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
          {agent.timestamp}
        </p>
      )}
    </div>
  );
}
