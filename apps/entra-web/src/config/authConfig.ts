import { Configuration, LogLevel } from '@azure/msal-browser';

// MSAL configuration
export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID || '',
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_TENANT_ID || 'common'}`,
    redirectUri: import.meta.env.VITE_REDIRECT_URI || window.location.origin,
    postLogoutRedirectUri: import.meta.env.VITE_POST_LOGOUT_REDIRECT_URI || window.location.origin,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Info:
            console.info(message);
            return;
          case LogLevel.Verbose:
            console.debug(message);
            return;
          case LogLevel.Warning:
            console.warn(message);
            return;
          default:
            return;
        }
      },
      logLevel: import.meta.env.DEV ? LogLevel.Verbose : LogLevel.Error,
    },
  },
};

// Add scopes here for ID token to be used at Microsoft Graph API endpoints.
export const loginRequest = {
  scopes: [
    'openid',
    'profile',
    'User.Read',
    'Directory.Read.All',
    'Policy.Read.All',
    'Policy.ReadWrite.ConditionalAccess',
    'RoleManagement.Read.Directory',
    'AuditLog.Read.All',
  ],
};

// Add the endpoints here for Microsoft Graph API services you'd like to use.
export const graphConfig = {
  graphMeEndpoint: 'https://graph.microsoft.com/v1.0/me',
  graphUsersEndpoint: 'https://graph.microsoft.com/v1.0/users',
  graphGroupsEndpoint: 'https://graph.microsoft.com/v1.0/groups',
  graphPoliciesEndpoint: 'https://graph.microsoft.com/v1.0/policies',
  graphConditionalAccessEndpoint: 'https://graph.microsoft.com/v1.0/identity/conditionalAccess',
  graphAuditLogsEndpoint: 'https://graph.microsoft.com/v1.0/auditLogs',
};

// Scopes for accessing Microsoft Graph API
export const graphScopes = {
  userRead: ['User.Read'],
  directoryRead: ['Directory.Read.All'],
  policyRead: ['Policy.Read.All'],
  policyWrite: ['Policy.ReadWrite.ConditionalAccess'],
  roleManagement: ['RoleManagement.Read.Directory'],
  auditLogs: ['AuditLog.Read.All'],
};

// API configuration
export const apiConfig = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002/api',
  timeout: 30000, // 30 seconds
};

// Application roles
export const appRoles = {
  ADMIN: 'admin',
  COMPLIANCE_OFFICER: 'compliance_officer',
  VIEWER: 'viewer',
} as const;

export type AppRole = typeof appRoles[keyof typeof appRoles];