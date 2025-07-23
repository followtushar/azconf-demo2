import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

interface ControlStatus {
  controlId: string;
  frameworkId: string;
  status: 'passed' | 'failed' | 'not_configured' | 'manual_review';
  score: number;
  evidence?: any;
  lastChecked: string;
  recommendations?: string[];
  manuallyConfirmed?: boolean;
  confirmationDate?: string;
  confirmationBy?: string;
}

interface ComplianceReport {
  frameworkId: string;
  frameworkName: string;
  overallScore: number;
  totalControls: number;
  passedControls: number;
  failedControls: number;
  notConfiguredControls: number;
  manualReviewControls: number;
  controlStatuses: ControlStatus[];
  generatedAt: string;
}

interface ComplianceResultsProps {
  results: ComplianceReport[];
  onConfirmControl: (frameworkId: string, controlId: string, confirmed: boolean, justification?: string) => void;
  isConfirming: boolean;
}

export const ComplianceResults: React.FC<ComplianceResultsProps> = ({
  results,
  onConfirmControl,
  isConfirming,
}) => {
  const [expandedFrameworks, setExpandedFrameworks] = useState<string[]>([]);
  const [confirmationModal, setConfirmationModal] = useState<{
    frameworkId: string;
    controlId: string;
    show: boolean;
  } | null>(null);

  const toggleFramework = (frameworkId: string) => {
    setExpandedFrameworks(prev => 
      prev.includes(frameworkId)
        ? prev.filter(id => id !== frameworkId)
        : [...prev, frameworkId]
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return CheckCircleIcon;
      case 'failed':
        return XCircleIcon;
      case 'not_configured':
        return ClockIcon;
      case 'manual_review':
        return ExclamationTriangleIcon;
      default:
        return ClockIcon;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'text-success-600';
      case 'failed':
        return 'text-danger-600';
      case 'not_configured':
        return 'text-gray-600';
      case 'manual_review':
        return 'text-warning-600';
      default:
        return 'text-gray-600';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success-600';
    if (score >= 60) return 'text-warning-600';
    return 'text-danger-600';
  };

  const handleConfirmControl = (frameworkId: string, controlId: string, confirmed: boolean) => {
    const justification = confirmed ? 'Manually confirmed as compliant' : 'Manually marked as non-compliant';
    onConfirmControl(frameworkId, controlId, confirmed, justification);
    setConfirmationModal(null);
  };

  return (
    <div className="space-y-6">
      {results.map((result) => {
        const isExpanded = expandedFrameworks.includes(result.frameworkId);
        
        return (
          <div key={result.frameworkId} className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <button
                    onClick={() => toggleFramework(result.frameworkId)}
                    className="flex items-center text-left"
                  >
                    {isExpanded ? (
                      <ChevronDownIcon className="h-5 w-5 text-gray-400 mr-2" />
                    ) : (
                      <ChevronRightIcon className="h-5 w-5 text-gray-400 mr-2" />
                    )}
                    <h3 className="text-lg font-medium text-gray-900">
                      {result.frameworkName}
                    </h3>
                  </button>
                </div>
                <div className="flex items-center space-x-4">
                  <div className={`text-2xl font-bold ${getScoreColor(result.overallScore)}`}>
                    {result.overallScore}%
                  </div>
                  <div className="text-sm text-gray-500">
                    {result.passedControls} / {result.totalControls} passed
                  </div>
                </div>
              </div>
              
              {/* Summary Stats */}
              <div className="mt-4 grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-lg font-semibold text-success-600">
                    {result.passedControls}
                  </div>
                  <div className="text-xs text-gray-500">Passed</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-danger-600">
                    {result.failedControls}
                  </div>
                  <div className="text-xs text-gray-500">Failed</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-600">
                    {result.notConfiguredControls}
                  </div>
                  <div className="text-xs text-gray-500">Not Configured</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-warning-600">
                    {result.manualReviewControls}
                  </div>
                  <div className="text-xs text-gray-500">Manual Review</div>
                </div>
              </div>
            </div>

            {isExpanded && (
              <div className="card-body">
                <div className="space-y-4">
                  {result.controlStatuses.map((control) => {
                    const StatusIcon = getStatusIcon(control.status);
                    
                    return (
                      <div
                        key={control.controlId}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <StatusIcon className={`h-6 w-6 mt-0.5 ${getStatusColor(control.status)}`} />
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h4 className="text-sm font-medium text-gray-900">
                                  {control.controlId}
                                </h4>
                                <span className={`status-${control.status.replace('_', '-')}`}>
                                  {control.status.replace('_', ' ').toUpperCase()}
                                </span>
                              </div>
                              
                              <div className="mt-2">
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                  <span>Score: {control.score}%</span>
                                  <span>
                                    Last checked: {formatDistanceToNow(new Date(control.lastChecked), { addSuffix: true })}
                                  </span>
                                  {control.manuallyConfirmed && (
                                    <span className="text-primary-600">
                                      Manually confirmed by {control.confirmationBy}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {control.recommendations && control.recommendations.length > 0 && (
                                <div className="mt-3">
                                  <h5 className="text-sm font-medium text-gray-900 mb-2">
                                    Recommendations:
                                  </h5>
                                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                                    {control.recommendations.map((rec, idx) => (
                                      <li key={idx}>{rec}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleConfirmControl(result.frameworkId, control.controlId, true)}
                              disabled={isConfirming}
                              className="btn-success text-xs"
                            >
                              ✓ Confirm
                            </button>
                            <button
                              onClick={() => handleConfirmControl(result.frameworkId, control.controlId, false)}
                              disabled={isConfirming}
                              className="btn-danger text-xs"
                            >
                              ✗ Mark Failed
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-6 text-sm text-gray-500 text-center">
                  Generated {formatDistanceToNow(new Date(result.generatedAt), { addSuffix: true })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};