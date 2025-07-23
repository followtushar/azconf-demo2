import { Client } from '@microsoft/microsoft-graph-client';
import { ClientSecretCredential } from '@azure/identity';
import { logger } from '../utils/logger';
import { CustomError } from '../middleware/errorHandler';

export interface GraphServiceConfig {
  tenantId: string;
  clientId: string;
  clientSecret: string;
}

export class GraphService {
  private client: Client;
  private credential: ClientSecretCredential;

  constructor(config: GraphServiceConfig) {
    this.credential = new ClientSecretCredential(
      config.tenantId,
      config.clientId,
      config.clientSecret
    );

    this.client = Client.initWithMiddleware({
      authProvider: {
        getAccessToken: async () => {
          const tokenResponse = await this.credential.getToken('https://graph.microsoft.com/.default');
          return tokenResponse?.token || '';
        },
      },
    });
  }

  // Conditional Access Policies
  async getConditionalAccessPolicies() {
    try {
      const response = await this.client.api('/identity/conditionalAccess/policies').get();
      logger.info('Retrieved conditional access policies', { count: response.value?.length });
      return response.value || [];
    } catch (error) {
      logger.error('Failed to get conditional access policies', { error: error.message });
      throw new CustomError('Failed to retrieve conditional access policies', 502);
    }
  }

  async getConditionalAccessPolicy(policyId: string) {
    try {
      return await this.client.api(`/identity/conditionalAccess/policies/${policyId}`).get();
    } catch (error) {
      logger.error('Failed to get conditional access policy', { policyId, error: error.message });
      throw new CustomError('Failed to retrieve conditional access policy', 502);
    }
  }

  // Security Defaults
  async getSecurityDefaults() {
    try {
      const response = await this.client.api('/policies/identitySecurityDefaultsEnforcementPolicy').get();
      logger.info('Retrieved security defaults policy');
      return response;
    } catch (error) {
      logger.error('Failed to get security defaults', { error: error.message });
      throw new CustomError('Failed to retrieve security defaults', 502);
    }
  }

  // Password Policies
  async getPasswordPolicies() {
    try {
      const response = await this.client.api('/policies/passwordPolicies').get();
      logger.info('Retrieved password policies', { count: response.value?.length });
      return response.value || [];
    } catch (error) {
      logger.error('Failed to get password policies', { error: error.message });
      throw new CustomError('Failed to retrieve password policies', 502);
    }
  }

  // MFA Settings
  async getMfaSettings() {
    try {
      const authenticationMethodsPolicy = await this.client
        .api('/policies/authenticationMethodsPolicy')
        .get();
      
      const authenticationStrengthPolicies = await this.client
        .api('/policies/authenticationStrengthPolicies')
        .get();

      logger.info('Retrieved MFA settings');
      return {
        authenticationMethodsPolicy,
        authenticationStrengthPolicies: authenticationStrengthPolicies.value || [],
      };
    } catch (error) {
      logger.error('Failed to get MFA settings', { error: error.message });
      throw new CustomError('Failed to retrieve MFA settings', 502);
    }
  }

  // Privileged Access Settings
  async getPrivilegedAccessSettings() {
    try {
      const roleManagementPolicies = await this.client
        .api('/policies/roleManagementPolicies')
        .get();

      const privilegedAccessGroupAssignmentSchedules = await this.client
        .api('/identityGovernance/privilegedAccess/group/assignmentSchedules')
        .get();

      logger.info('Retrieved privileged access settings');
      return {
        roleManagementPolicies: roleManagementPolicies.value || [],
        privilegedAccessGroupAssignmentSchedules: privilegedAccessGroupAssignmentSchedules.value || [],
      };
    } catch (error) {
      logger.error('Failed to get privileged access settings', { error: error.message });
      throw new CustomError('Failed to retrieve privileged access settings', 502);
    }
  }

  // Identity Governance
  async getIdentityGovernance() {
    try {
      const accessReviews = await this.client
        .api('/identityGovernance/accessReviews/definitions')
        .get();

      const entitlementManagement = await this.client
        .api('/identityGovernance/entitlementManagement/accessPackages')
        .get();

      logger.info('Retrieved identity governance settings');
      return {
        accessReviews: accessReviews.value || [],
        entitlementManagement: entitlementManagement.value || [],
      };
    } catch (error) {
      logger.error('Failed to get identity governance settings', { error: error.message });
      throw new CustomError('Failed to retrieve identity governance settings', 502);
    }
  }

  // Risk Policies
  async getRiskPolicies() {
    try {
      const userRiskPolicy = await this.client
        .api('/identity/conditionalAccess/policies')
        .filter("conditions/userRiskLevels/any(x:x eq 'high' or x eq 'medium' or x eq 'low')")
        .get();

      const signInRiskPolicy = await this.client
        .api('/identity/conditionalAccess/policies')
        .filter("conditions/signInRiskLevels/any(x:x eq 'high' or x eq 'medium' or x eq 'low')")
        .get();

      logger.info('Retrieved risk policies');
      return {
        userRiskPolicies: userRiskPolicy.value || [],
        signInRiskPolicies: signInRiskPolicy.value || [],
      };
    } catch (error) {
      logger.error('Failed to get risk policies', { error: error.message });
      throw new CustomError('Failed to retrieve risk policies', 502);
    }
  }

  // Directory Settings
  async getDirectorySettings() {
    try {
      const response = await this.client.api('/settings').get();
      logger.info('Retrieved directory settings', { count: response.value?.length });
      return response.value || [];
    } catch (error) {
      logger.error('Failed to get directory settings', { error: error.message });
      throw new CustomError('Failed to retrieve directory settings', 502);
    }
  }

  // Users and Groups
  async getUsers(filter?: string, top: number = 100) {
    try {
      let query = this.client.api('/users').top(top);
      if (filter) {
        query = query.filter(filter);
      }
      const response = await query.get();
      return response.value || [];
    } catch (error) {
      logger.error('Failed to get users', { error: error.message });
      throw new CustomError('Failed to retrieve users', 502);
    }
  }

  async getGroups(filter?: string, top: number = 100) {
    try {
      let query = this.client.api('/groups').top(top);
      if (filter) {
        query = query.filter(filter);
      }
      const response = await query.get();
      return response.value || [];
    } catch (error) {
      logger.error('Failed to get groups', { error: error.message });
      throw new CustomError('Failed to retrieve groups', 502);
    }
  }

  // Applications
  async getApplications(filter?: string, top: number = 100) {
    try {
      let query = this.client.api('/applications').top(top);
      if (filter) {
        query = query.filter(filter);
      }
      const response = await query.get();
      return response.value || [];
    } catch (error) {
      logger.error('Failed to get applications', { error: error.message });
      throw new CustomError('Failed to retrieve applications', 502);
    }
  }

  // Service Principals
  async getServicePrincipals(filter?: string, top: number = 100) {
    try {
      let query = this.client.api('/servicePrincipals').top(top);
      if (filter) {
        query = query.filter(filter);
      }
      const response = await query.get();
      return response.value || [];
    } catch (error) {
      logger.error('Failed to get service principals', { error: error.message });
      throw new CustomError('Failed to retrieve service principals', 502);
    }
  }

  // Audit Logs
  async getAuditLogs(startDate?: Date, endDate?: Date, top: number = 100) {
    try {
      let query = this.client.api('/auditLogs/directoryAudits').top(top);
      
      if (startDate && endDate) {
        const filter = `activityDateTime ge ${startDate.toISOString()} and activityDateTime le ${endDate.toISOString()}`;
        query = query.filter(filter);
      }
      
      const response = await query.get();
      return response.value || [];
    } catch (error) {
      logger.error('Failed to get audit logs', { error: error.message });
      throw new CustomError('Failed to retrieve audit logs', 502);
    }
  }

  async getSignInLogs(startDate?: Date, endDate?: Date, top: number = 100) {
    try {
      let query = this.client.api('/auditLogs/signIns').top(top);
      
      if (startDate && endDate) {
        const filter = `createdDateTime ge ${startDate.toISOString()} and createdDateTime le ${endDate.toISOString()}`;
        query = query.filter(filter);
      }
      
      const response = await query.get();
      return response.value || [];
    } catch (error) {
      logger.error('Failed to get sign-in logs', { error: error.message });
      throw new CustomError('Failed to retrieve sign-in logs', 502);
    }
  }

  // Organization Information
  async getOrganization() {
    try {
      const response = await this.client.api('/organization').get();
      logger.info('Retrieved organization information');
      return response.value?.[0] || null;
    } catch (error) {
      logger.error('Failed to get organization information', { error: error.message });
      throw new CustomError('Failed to retrieve organization information', 502);
    }
  }

  // Comprehensive Configuration Retrieval
  async getAllEntraConfiguration() {
    try {
      logger.info('Starting comprehensive Entra configuration retrieval');

      const [
        conditionalAccessPolicies,
        securityDefaults,
        passwordPolicies,
        mfaSettings,
        privilegedAccessSettings,
        identityGovernance,
        riskPolicies,
        directorySettings,
        organization,
      ] = await Promise.allSettled([
        this.getConditionalAccessPolicies(),
        this.getSecurityDefaults(),
        this.getPasswordPolicies(),
        this.getMfaSettings(),
        this.getPrivilegedAccessSettings(),
        this.getIdentityGovernance(),
        this.getRiskPolicies(),
        this.getDirectorySettings(),
        this.getOrganization(),
      ]);

      const configuration = {
        conditionalAccessPolicies: conditionalAccessPolicies.status === 'fulfilled' ? conditionalAccessPolicies.value : [],
        securityDefaults: securityDefaults.status === 'fulfilled' ? securityDefaults.value : null,
        passwordPolicies: passwordPolicies.status === 'fulfilled' ? passwordPolicies.value : [],
        mfaSettings: mfaSettings.status === 'fulfilled' ? mfaSettings.value : null,
        privilegedAccessSettings: privilegedAccessSettings.status === 'fulfilled' ? privilegedAccessSettings.value : null,
        identityGovernance: identityGovernance.status === 'fulfilled' ? identityGovernance.value : null,
        riskPolicies: riskPolicies.status === 'fulfilled' ? riskPolicies.value : null,
        directorySettings: directorySettings.status === 'fulfilled' ? directorySettings.value : [],
        organization: organization.status === 'fulfilled' ? organization.value : null,
        retrievedAt: new Date().toISOString(),
      };

      logger.info('Completed comprehensive Entra configuration retrieval');
      return configuration;
    } catch (error) {
      logger.error('Failed to get comprehensive Entra configuration', { error: error.message });
      throw new CustomError('Failed to retrieve Entra configuration', 502);
    }
  }
}

// Factory function to create GraphService instance
export const createGraphService = (tenantId: string): GraphService => {
  const config: GraphServiceConfig = {
    tenantId,
    clientId: process.env.AZURE_CLIENT_ID!,
    clientSecret: process.env.AZURE_CLIENT_SECRET!,
  };

  if (!config.clientId || !config.clientSecret) {
    throw new CustomError('Azure AD credentials not configured', 500);
  }

  return new GraphService(config);
};