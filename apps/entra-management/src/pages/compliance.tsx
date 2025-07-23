import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '@/lib/auth/AuthProvider';
import { MainLayout } from '@/components/Layout/MainLayout';
import { FrameworkSelector } from '@/components/Compliance/FrameworkSelector';
import { ComplianceResults } from '@/components/Compliance/ComplianceResults';
import { LoadingSpinner } from '@/components/Common/LoadingSpinner';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Framework {
  id: string;
  name: string;
  version: string;
  description: string;
  category: string;
  controlCount: number;
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
  controlStatuses: Array<{
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
  }>;
  generatedAt: string;
}

export default function CompliancePage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedFrameworks, setSelectedFrameworks] = useState<string[]>([]);
  const [evaluationResults, setEvaluationResults] = useState<ComplianceReport[]>([]);

  // Fetch available frameworks
  const { data: frameworks, isLoading: frameworksLoading } = useQuery<Framework[]>(
    'compliance-frameworks',
    async () => {
      const response = await axios.get('/api/compliance/frameworks');
      return response.data.data;
    },
    {
      enabled: isAuthenticated,
    }
  );

  // Evaluate compliance mutation
  const evaluateComplianceMutation = useMutation(
    async (frameworkId: string) => {
      const response = await axios.post(`/api/compliance/evaluate/${frameworkId}`);
      return response.data.data;
    },
    {
      onSuccess: (data) => {
        setEvaluationResults(prev => {
          const existing = prev.findIndex(r => r.frameworkId === data.frameworkId);
          if (existing >= 0) {
            const updated = [...prev];
            updated[existing] = data;
            return updated;
          }
          return [...prev, data];
        });
        toast.success(`Compliance evaluation completed for ${data.frameworkName}`);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error?.message || 'Evaluation failed');
      },
    }
  );

  // Confirm control mutation
  const confirmControlMutation = useMutation(
    async ({ frameworkId, controlId, confirmed, justification }: {
      frameworkId: string;
      controlId: string;
      confirmed: boolean;
      justification?: string;
    }) => {
      const response = await axios.post(
        `/api/compliance/controls/${frameworkId}/${controlId}/confirm`,
        { confirmed, justification }
      );
      return response.data.data;
    },
    {
      onSuccess: (data, variables) => {
        // Update the evaluation results
        setEvaluationResults(prev => 
          prev.map(result => {
            if (result.frameworkId === variables.frameworkId) {
              return {
                ...result,
                controlStatuses: result.controlStatuses.map(control => 
                  control.controlId === variables.controlId ? data : control
                )
              };
            }
            return result;
          })
        );
        toast.success('Control status updated successfully');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error?.message || 'Failed to update control');
      },
    }
  );

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleFrameworkSelect = (frameworkIds: string[]) => {
    setSelectedFrameworks(frameworkIds);
  };

  const handleEvaluateCompliance = async () => {
    if (selectedFrameworks.length === 0) {
      toast.error('Please select at least one framework');
      return;
    }

    // Clear previous results
    setEvaluationResults([]);

    // Evaluate each framework
    for (const frameworkId of selectedFrameworks) {
      await evaluateComplianceMutation.mutateAsync(frameworkId);
    }
  };

  const handleConfirmControl = (
    frameworkId: string,
    controlId: string,
    confirmed: boolean,
    justification?: string
  ) => {
    confirmControlMutation.mutate({
      frameworkId,
      controlId,
      confirmed,
      justification,
    });
  };

  if (authLoading || !isAuthenticated) {
    return <LoadingSpinner />;
  }

  return (
    <MainLayout title="Compliance Check">
      <div className="space-y-6">
        {/* Framework Selection */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">
              Select Compliance Frameworks
            </h3>
            <p className="text-sm text-gray-500">
              Choose one or more frameworks to evaluate your Entra configuration against
            </p>
          </div>
          <div className="card-body">
            {frameworksLoading ? (
              <div className="animate-pulse space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded"></div>
                ))}
              </div>
            ) : (
              <FrameworkSelector
                frameworks={frameworks || []}
                selectedFrameworks={selectedFrameworks}
                onSelectionChange={handleFrameworkSelect}
              />
            )}
          </div>
        </div>

        {/* Evaluation Controls */}
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Compliance Evaluation
            </h3>
            <p className="text-sm text-gray-500">
              {selectedFrameworks.length > 0 
                ? `${selectedFrameworks.length} framework(s) selected`
                : 'No frameworks selected'
              }
            </p>
          </div>
          <button
            onClick={handleEvaluateCompliance}
            disabled={selectedFrameworks.length === 0 || evaluateComplianceMutation.isLoading}
            className="btn-primary"
          >
            {evaluateComplianceMutation.isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Evaluating...
              </div>
            ) : (
              'Run Compliance Check'
            )}
          </button>
        </div>

        {/* Evaluation Results */}
        {evaluationResults.length > 0 && (
          <ComplianceResults
            results={evaluationResults}
            onConfirmControl={handleConfirmControl}
            isConfirming={confirmControlMutation.isLoading}
          />
        )}

        {/* Empty State */}
        {evaluationResults.length === 0 && selectedFrameworks.length > 0 && !evaluateComplianceMutation.isLoading && (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Ready to evaluate</h3>
            <p className="mt-1 text-sm text-gray-500">
              Click "Run Compliance Check" to start evaluating the selected frameworks.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}