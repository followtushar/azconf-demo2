import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

interface Activity {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  status: string;
}

interface RecentActivityProps {
  activities: Activity[];
  isLoading: boolean;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({
  activities,
  isLoading,
}) => {
  const getActivityIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return CheckCircleIcon;
      case 'failed':
        return ExclamationTriangleIcon;
      case 'info':
        return InformationCircleIcon;
      default:
        return ClockIcon;
    }
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-success-600';
      case 'failed':
        return 'text-danger-600';
      case 'info':
        return 'text-primary-600';
      default:
        return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
        </div>
        <div className="card-body">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
      </div>
      <div className="card-body">
        <div className="flow-root">
          <ul className="-mb-8">
            {activities.map((activity, activityIdx) => {
              const Icon = getActivityIcon(activity.status);
              return (
                <li key={activity.id}>
                  <div className="relative pb-8">
                    {activityIdx !== activities.length - 1 ? (
                      <span
                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    ) : null}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center ring-8 ring-white">
                          <Icon
                            className={`h-5 w-5 ${getActivityColor(activity.status)}`}
                            aria-hidden="true"
                          />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-900">
                            {activity.message}
                          </p>
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                          <time dateTime={activity.timestamp}>
                            {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                          </time>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
        
        {activities.length === 0 && (
          <div className="text-center py-6">
            <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No recent activity</h3>
            <p className="mt-1 text-sm text-gray-500">
              Activity will appear here as you use the application.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};