import React from 'react';
import {
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

interface OverviewData {
  totalFrameworks: number;
  overallComplianceScore: number;
  totalControls: number;
  passedControls: number;
  failedControls: number;
  notConfiguredControls: number;
}

interface DashboardOverviewProps {
  overview: OverviewData;
  isLoading: boolean;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  overview,
  isLoading,
}) => {
  const stats = [
    {
      name: 'Overall Compliance Score',
      value: `${overview.overallComplianceScore}%`,
      icon: ShieldCheckIcon,
      color: overview.overallComplianceScore >= 80 ? 'success' : 
             overview.overallComplianceScore >= 60 ? 'warning' : 'danger',
      change: '+2.1%',
      changeType: 'increase' as const,
    },
    {
      name: 'Passed Controls',
      value: overview.passedControls.toString(),
      icon: CheckCircleIcon,
      color: 'success' as const,
      subtitle: `of ${overview.totalControls} total`,
    },
    {
      name: 'Failed Controls',
      value: overview.failedControls.toString(),
      icon: ExclamationTriangleIcon,
      color: 'danger' as const,
      subtitle: 'Need attention',
    },
    {
      name: 'Not Configured',
      value: overview.notConfiguredControls.toString(),
      icon: ClockIcon,
      color: 'warning' as const,
      subtitle: 'Pending setup',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card">
            <div className="card-body">
              <div className="animate-pulse">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                  <div className="ml-3 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2 mt-2"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.name} className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <stat.icon
                  className={`h-8 w-8 ${
                    stat.color === 'success' ? 'text-success-600' :
                    stat.color === 'warning' ? 'text-warning-600' :
                    stat.color === 'danger' ? 'text-danger-600' :
                    'text-gray-600'
                  }`}
                />
              </div>
              <div className="ml-3 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {stat.name}
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stat.value}
                    </div>
                    {stat.change && (
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        stat.changeType === 'increase' ? 'text-success-600' : 'text-danger-600'
                      }`}>
                        {stat.change}
                      </div>
                    )}
                  </dd>
                  {stat.subtitle && (
                    <dd className="text-sm text-gray-500">
                      {stat.subtitle}
                    </dd>
                  )}
                </dl>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};