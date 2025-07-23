import React from 'react';
import Link from 'next/link';
import {
  ShieldCheckIcon,
  DocumentTextIcon,
  CogIcon,
  PlayIcon,
} from '@heroicons/react/24/outline';

export const QuickActions: React.FC = () => {
  const actions = [
    {
      name: 'Run Compliance Check',
      description: 'Evaluate current compliance status',
      href: '/compliance',
      icon: ShieldCheckIcon,
      color: 'primary',
    },
    {
      name: 'Generate Report',
      description: 'Create compliance report',
      href: '/reports',
      icon: DocumentTextIcon,
      color: 'success',
    },
    {
      name: 'Review Controls',
      description: 'Manage security controls',
      href: '/controls',
      icon: CogIcon,
      color: 'warning',
    },
    {
      name: 'Start Remediation',
      description: 'Fix identified issues',
      href: '/compliance?action=remediate',
      icon: PlayIcon,
      color: 'danger',
    },
  ];

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
      </div>
      <div className="card-body">
        <div className="space-y-3">
          {actions.map((action) => (
            <Link
              key={action.name}
              href={action.href}
              className={`block p-4 rounded-lg border-2 border-dashed transition-colors hover:border-solid ${
                action.color === 'primary' ? 'border-primary-300 hover:border-primary-500 hover:bg-primary-50' :
                action.color === 'success' ? 'border-success-300 hover:border-success-500 hover:bg-success-50' :
                action.color === 'warning' ? 'border-warning-300 hover:border-warning-500 hover:bg-warning-50' :
                'border-danger-300 hover:border-danger-500 hover:bg-danger-50'
              }`}
            >
              <div className="flex items-center">
                <action.icon
                  className={`h-6 w-6 ${
                    action.color === 'primary' ? 'text-primary-600' :
                    action.color === 'success' ? 'text-success-600' :
                    action.color === 'warning' ? 'text-warning-600' :
                    'text-danger-600'
                  }`}
                />
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-gray-900">
                    {action.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {action.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};