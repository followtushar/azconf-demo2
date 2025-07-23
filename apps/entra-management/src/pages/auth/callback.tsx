import { useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthProvider';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

export default function AuthCallbackPage() {
  const { isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <ShieldCheckIcon className="h-12 w-12 text-primary-600 animate-pulse" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Completing Sign In
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Please wait while we complete your authentication...
        </p>
        
        <div className="mt-8 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    </div>
  );
}