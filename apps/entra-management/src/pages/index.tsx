import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/auth/AuthProvider';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading spinner while determining auth state
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <ShieldCheckIcon className="h-12 w-12 text-primary-600 animate-pulse" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Entra Management
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Loading...
        </p>
      </div>
    </div>
  );
}