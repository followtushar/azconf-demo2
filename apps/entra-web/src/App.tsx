import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react';

// Layout components
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';

// Page components
import { Dashboard } from './pages/Dashboard';
import { ComplianceCheck } from './pages/ComplianceCheck';
import { Controls } from './pages/Controls';
import { ControlDetail } from './pages/ControlDetail';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { Integrations } from './pages/Integrations';

// Hooks
import { useAuthStore } from './hooks/useAuthStore';

// Error boundary
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  const isAuthenticated = useIsAuthenticated();
  const { instance } = useMsal();
  const { initializeAuth } = useAuthStore();

  React.useEffect(() => {
    if (isAuthenticated) {
      const accounts = instance.getAllAccounts();
      if (accounts.length > 0) {
        initializeAuth(accounts[0]);
      }
    }
  }, [isAuthenticated, instance, initializeAuth]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <AuthenticatedTemplate>
          <Layout>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/compliance" element={<ComplianceCheck />} />
              <Route path="/controls" element={<Controls />} />
              <Route path="/controls/:controlId" element={<ControlDetail />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/integrations" element={<Integrations />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Layout>
        </AuthenticatedTemplate>

        <UnauthenticatedTemplate>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </UnauthenticatedTemplate>
      </div>
    </ErrorBoundary>
  );
}

export default App;