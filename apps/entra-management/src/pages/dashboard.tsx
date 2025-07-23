import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import { useAuth } from '@/lib/auth/AuthProvider';
import { MainLayout } from '@/components/Layout/MainLayout';
import { DashboardOverview } from '@/components/Dashboard/DashboardOverview';
import { ComplianceChart } from '@/components/Dashboard/ComplianceChart';
import { RecentActivity } from '@/components/Dashboard/RecentActivity';
import { SecurityAlerts } from '@/components/Dashboard/SecurityAlerts';
import { QuickActions } from '@/components/Dashboard/QuickActions';
import axios from 'axios';

interface DashboardData {
  overview: {
    totalFrameworks: number;
    overallComplianceScore: number;
    totalControls: number;
    passedControls: number;
    failedControls: number;
    notConfiguredControls: number;
  };
  frameworkSummaries: Array<{
    frameworkId: string;
    frameworkName: string;
    overallScore: number;
    totalControls: number;
    passedControls: number;
    failedControls: number;
    notConfiguredControls: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: string;
    message: string;
    timestamp: string;
    status: string;
  }>;
  securityAlerts: Array<{
    id: string;
    severity: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    affectedFrameworks: string[];
    timestamp: string;
  }>;
  lastUpdated: string;
}

export default function DashboardPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const { data: dashboardData, isLoading, error, refetch } = useQuery<DashboardData>(
    'dashboard-overview',
    async () => {
      const response = await axios.get('/api/dashboard/overview');
      return response.data.data;
    },
    {
      enabled: isAuthenticated,
      refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    }
  );

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <MainLayout title="Dashboard">
        <div className="bg-danger-50 border border-danger-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-danger-800">
                Error loading dashboard
              </h3>
              <div className="mt-2 text-sm text-danger-700">
                <p>Unable to load dashboard data. Please try refreshing the page.</p>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="btn-danger text-sm"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Dashboard">
      <div className="space-y-6">
        {/* Overview Stats */}
        {dashboardData && (
          <DashboardOverview 
            overview={dashboardData.overview}
            isLoading={isLoading}
          />
        )}

        {/* Charts and Quick Actions Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {dashboardData && (
              <ComplianceChart 
                frameworkSummaries={dashboardData.frameworkSummaries}
                isLoading={isLoading}
              />
            )}
          </div>
          <div>
            <QuickActions />
          </div>
        </div>

        {/* Activity and Alerts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            {dashboardData && (
              <RecentActivity 
                activities={dashboardData.recentActivity}
                isLoading={isLoading}
              />
            )}
          </div>
          <div>
            {dashboardData && (
              <SecurityAlerts 
                alerts={dashboardData.securityAlerts}
                isLoading={isLoading}
              />
            )}
          </div>
        </div>

        {/* Last Updated */}
        {dashboardData && (
          <div className="text-sm text-gray-500 text-center">
            Last updated: {new Date(dashboardData.lastUpdated).toLocaleString()}
          </div>
        )}
      </div>
    </MainLayout>
  );
}