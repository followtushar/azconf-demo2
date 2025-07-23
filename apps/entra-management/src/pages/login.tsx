import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/auth/AuthProvider';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

export default function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <ShieldCheckIcon className="h-12 w-12 text-primary-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Entra Management
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sign in to your Microsoft Entra account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Welcome to Entra Management
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                This application helps you manage Microsoft Entra compliance configurations, 
                check security controls, and ensure your organization meets various compliance frameworks.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                  </div>
                  <p className="text-sm text-gray-700">Multi-framework compliance checking</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                  </div>
                  <p className="text-sm text-gray-700">Real-time security control validation</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                  </div>
                  <p className="text-sm text-gray-700">Automated remediation guidance</p>
                </div>
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={login}
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign in with Microsoft'
                )}
              </button>
            </div>

            <div className="text-xs text-gray-500 text-center">
              <p>
                By signing in, you agree to our terms of service and privacy policy.
                This application requires Microsoft Entra ID authentication and appropriate permissions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}