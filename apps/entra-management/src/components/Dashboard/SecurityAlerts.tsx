import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ShieldExclamationIcon,
} from '@heroicons/react/24/outline';

interface SecurityAlert {
  id: string;
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  affectedFrameworks: string[];
  timestamp: string;
}

interface SecurityAlertsProps {
  alerts: SecurityAlert[];
  isLoading: boolean;
}

export const SecurityAlerts: React.FC<SecurityAlertsProps> = ({
  alerts,
  isLoading,
}) => {
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return ShieldExclamationIcon;
      case 'medium':
        return ExclamationTriangleIcon;
      default:
        return InformationCircleIcon;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-danger-600 bg-danger-50 border-danger-200';
      case 'medium':
        return 'text-warning-600 bg-warning-50 border-warning-200';
      default:
        return 'text-primary-600 bg-primary-50 border-primary-200';
    }
  };

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-danger-100 text-danger-800';
      case 'medium':
        return 'bg-warning-100 text-warning-800';
      default:
        return 'bg-primary-100 text-primary-800';
    }
  };

  if (isLoading) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Security Alerts</h3>
        </div>
        <div className="card-body">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-gray-200 rounded"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
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
        <h3 className="text-lg font-medium text-gray-900">Security Alerts</h3>
      </div>
      <div className="card-body">
        <div className="space-y-4">
          {alerts.map((alert) => {
            const Icon = getSeverityIcon(alert.severity);
            return (
              <div
                key={alert.id}
                className={`border rounded-lg p-4 ${getSeverityColor(alert.severity)}`}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900">
                        {alert.title}
                      </h4>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityBadgeColor(
                          alert.severity
                        )}`}
                      >
                        {alert.severity.toUpperCase()}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-700">
                      {alert.description}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {alert.affectedFrameworks.map((framework) => (
                          <span
                            key={framework}
                            className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {framework}
                          </span>
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {alerts.length === 0 && (
          <div className="text-center py-6">
            <ShieldExclamationIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No active alerts</h3>
            <p className="mt-1 text-sm text-gray-500">
              Security alerts will appear here when issues are detected.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};