import { Client } from '@microsoft/microsoft-graph-client';
import { ClientSecretCredential } from '@azure/identity';
import { logger } from '@/utils/logger';
import { createError } from '@/middleware/errorHandler';

export interface EntraConfiguration {
  conditionalAccessPolicies: any[];
  mfaSettings: any;
  passwordPolicies: any;
  userRiskPolicies: any[];
  signInRiskPolicies: any[];
  privilegedAccessSettings: any;
  auditLogs: any[];
}

export class GraphService {
  private client: Client;
  private credential: ClientSecretCredential;

  constructor() {
    if (!process.env.AZURE_CLIENT_ID || !process.env.AZURE_CLIENT_SECRET || !process.env.AZURE_TENANT_ID) {
      throw createError('Azure credentials not configured', 500, 'AZURE_CONFIG_ERROR');
    }

    this.credential = new ClientSecretCredential(
      process.env.AZURE_TENANT_ID,
      process.env.AZURE_CLIENT_ID,
      process.env.AZURE_CLIENT_SECRET
    );

    this.client = Client.initWithMiddleware({
      authProvider: {
        getAccessToken: async () => {
          const tokenResponse = await this.credential.getToken('https://graph.microsoft.com/.default');
          return tokenResponse?.token || '';
        }
      }
    });
  }

  async getConditionalAccessPolicies() {
    try {
      logger.info('Fetching conditional access policies');
      const response = await this.client.api('/identity/conditionalAccess/policies').get();
      return response.value || [];
    } catch (error) {
      logger.error('Error fetching conditional access policies:', error);
      throw createError('Failed to fetch conditional access policies', 500, 'GRAPH_API_ERROR');
    }
  }

  async getMfaSettings() {
    try {
      logger.info('Fetching MFA settings');
      const response = await this.client.api('/policies/authenticationMethodsPolicy').get();
      return response;
    } catch (error) {
      logger.error('Error fetching MFA settings:', error);
      throw createError('Failed to fetch MFA settings', 500, 'GRAPH_API_ERROR');
    }
  }

  async getPasswordPolicies() {
    try {
      logger.info('Fetching password policies');
      const response = await this.client.api('/policies/authorizationPolicy').get();
      return response;
    } catch (error) {
      logger.error('Error fetching password policies:', error);
      throw createError('Failed to fetch password policies', 500, 'GRAPH_API_ERROR');
    }
  }

  async getUserRiskPolicies() {
    try {
      logger.info('Fetching user risk policies');
      const response = await this.client.api('/identity/conditionalAccess/policies')
        .filter("conditions/userRiskLevels/any(x: x eq 'high' or x eq 'medium')")
        .get();
      return response.value || [];
    } catch (error) {
      logger.error('Error fetching user risk policies:', error);
      throw createError('Failed to fetch user risk policies', 500, 'GRAPH_API_ERROR');
    }
  }

  async getSignInRiskPolicies() {
    try {
      logger.info('Fetching sign-in risk policies');
      const response = await this.client.api('/identity/conditionalAccess/policies')
        .filter("conditions/signInRiskLevels/any(x: x eq 'high' or x eq 'medium')")
        .get();
      return response.value || [];
    } catch (error) {
      logger.error('Error fetching sign-in risk policies:', error);
      throw createError('Failed to fetch sign-in risk policies', 500, 'GRAPH_API_ERROR');
    }
  }

  async getPrivilegedAccessSettings() {
    try {
      logger.info('Fetching privileged access settings');
      const response = await this.client.api('/privilegedAccess/azureAD/roleSettings').get();
      return response.value || [];
    } catch (error) {
      logger.error('Error fetching privileged access settings:', error);
      // This might not be available in all tenants, so we'll return empty array
      return [];
    }
  }

  async getAuditLogs(days: number = 30) {
    try {
      logger.info(`Fetching audit logs for last ${days} days`);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const response = await this.client.api('/auditLogs/directoryAudits')
        .filter(`activityDateTime ge ${startDate.toISOString()}`)
        .top(1000)
        .get();
      return response.value || [];
    } catch (error) {
      logger.error('Error fetching audit logs:', error);
      throw createError('Failed to fetch audit logs', 500, 'GRAPH_API_ERROR');
    }
  }

  async getUsers(filter?: string) {
    try {
      logger.info('Fetching users');
      let query = this.client.api('/users').select('id,displayName,userPrincipalName,accountEnabled');
      
      if (filter) {
        query = query.filter(filter);
      }
      
      const response = await query.top(100).get();
      return response.value || [];
    } catch (error) {
      logger.error('Error fetching users:', error);
      throw createError('Failed to fetch users', 500, 'GRAPH_API_ERROR');
    }
  }

  async getGroups() {
    try {
      logger.info('Fetching groups');
      const response = await this.client.api('/groups')
        .select('id,displayName,description,groupTypes')
        .top(100)
        .get();
      return response.value || [];
    } catch (error) {
      logger.error('Error fetching groups:', error);
      throw createError('Failed to fetch groups', 500, 'GRAPH_API_ERROR');
    }
  }

  async getApplications() {
    try {
      logger.info('Fetching applications');
      const response = await this.client.api('/applications')
        .select('id,displayName,appId,createdDateTime')
        .top(100)
        .get();
      return response.value || [];
    } catch (error) {
      logger.error('Error fetching applications:', error);
      throw createError('Failed to fetch applications', 500, 'GRAPH_API_ERROR');
    }
  }

  async getComplianceConfiguration(): Promise<EntraConfiguration> {
    try {
      logger.info('Fetching complete Entra compliance configuration');
      
      const [
        conditionalAccessPolicies,
        mfaSettings,
        passwordPolicies,
        userRiskPolicies,
        signInRiskPolicies,
        privilegedAccessSettings,
        auditLogs
      ] = await Promise.all([
        this.getConditionalAccessPolicies(),
        this.getMfaSettings(),
        this.getPasswordPolicies(),
        this.getUserRiskPolicies(),
        this.getSignInRiskPolicies(),
        this.getPrivilegedAccessSettings(),
        this.getAuditLogs()
      ]);

      return {
        conditionalAccessPolicies,
        mfaSettings,
        passwordPolicies,
        userRiskPolicies,
        signInRiskPolicies,
        privilegedAccessSettings,
        auditLogs
      };
    } catch (error) {
      logger.error('Error fetching compliance configuration:', error);
      throw error;
    }
  }
}