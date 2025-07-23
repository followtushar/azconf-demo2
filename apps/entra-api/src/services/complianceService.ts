import { GraphService, EntraConfiguration } from './graphService';
import { logger } from '@/utils/logger';
import frameworksConfig from '@/config/frameworks.json';

export interface ControlStatus {
  controlId: string;
  frameworkId: string;
  status: 'passed' | 'failed' | 'not_configured' | 'manual_review';
  score: number; // 0-100
  evidence?: any;
  lastChecked: Date;
  recommendations?: string[];
  manuallyConfirmed?: boolean;
  confirmationDate?: Date;
  confirmationBy?: string;
}

export interface ComplianceReport {
  frameworkId: string;
  frameworkName: string;
  overallScore: number;
  totalControls: number;
  passedControls: number;
  failedControls: number;
  notConfiguredControls: number;
  manualReviewControls: number;
  controlStatuses: ControlStatus[];
  generatedAt: Date;
}

export class ComplianceService {
  private graphService: GraphService;

  constructor() {
    this.graphService = new GraphService();
  }

  async evaluateFrameworkCompliance(frameworkId: string): Promise<ComplianceReport> {
    logger.info(`Evaluating compliance for framework: ${frameworkId}`);

    const framework = frameworksConfig.frameworks.find(f => f.id === frameworkId);
    if (!framework) {
      throw new Error(`Framework ${frameworkId} not found`);
    }

    const entraConfig = await this.graphService.getComplianceConfiguration();
    const controlStatuses: ControlStatus[] = [];

    for (const control of framework.controls) {
      const status = await this.evaluateControl(frameworkId, control, entraConfig);
      controlStatuses.push(status);
    }

    const passedControls = controlStatuses.filter(c => c.status === 'passed').length;
    const failedControls = controlStatuses.filter(c => c.status === 'failed').length;
    const notConfiguredControls = controlStatuses.filter(c => c.status === 'not_configured').length;
    const manualReviewControls = controlStatuses.filter(c => c.status === 'manual_review').length;

    const overallScore = Math.round(
      (controlStatuses.reduce((sum, control) => sum + control.score, 0) / controlStatuses.length)
    );

    return {
      frameworkId,
      frameworkName: framework.name,
      overallScore,
      totalControls: framework.controls.length,
      passedControls,
      failedControls,
      notConfiguredControls,
      manualReviewControls,
      controlStatuses,
      generatedAt: new Date()
    };
  }

  private async evaluateControl(
    frameworkId: string,
    control: any,
    entraConfig: EntraConfiguration
  ): Promise<ControlStatus> {
    logger.info(`Evaluating control ${control.id} for framework ${frameworkId}`);

    let status: 'passed' | 'failed' | 'not_configured' | 'manual_review' = 'not_configured';
    let score = 0;
    let evidence: any = {};
    let recommendations: string[] = [];

    try {
      // Evaluate based on control mappings
      if (control.mappings?.entra) {
        const evaluationResults = await Promise.all(
          control.mappings.entra.map((mapping: string) => 
            this.evaluateEntraMapping(mapping, entraConfig)
          )
        );

        const passedMappings = evaluationResults.filter(r => r.passed).length;
        const totalMappings = evaluationResults.length;

        score = Math.round((passedMappings / totalMappings) * 100);
        
        if (score >= 80) {
          status = 'passed';
        } else if (score >= 50) {
          status = 'manual_review';
          recommendations.push('Some requirements are met, but manual review is needed');
        } else if (score > 0) {
          status = 'failed';
          recommendations.push('Configuration partially meets requirements but needs improvement');
        } else {
          status = 'not_configured';
          recommendations.push('Control requirements are not configured');
        }

        evidence = {
          mappingResults: evaluationResults,
          configurationSnapshot: this.getRelevantConfiguration(control.mappings.entra, entraConfig)
        };

        // Add specific recommendations based on failed mappings
        evaluationResults.forEach(result => {
          if (!result.passed && result.recommendations) {
            recommendations.push(...result.recommendations);
          }
        });
      }
    } catch (error) {
      logger.error(`Error evaluating control ${control.id}:`, error);
      status = 'manual_review';
      recommendations.push('Error occurred during evaluation - manual review required');
    }

    return {
      controlId: control.id,
      frameworkId,
      status,
      score,
      evidence,
      lastChecked: new Date(),
      recommendations: recommendations.slice(0, 5) // Limit recommendations
    };
  }

  private async evaluateEntraMapping(
    mapping: string,
    entraConfig: EntraConfiguration
  ): Promise<{ passed: boolean; details: any; recommendations?: string[] }> {
    const recommendations: string[] = [];

    switch (mapping) {
      case 'conditionalAccess':
        const caPolicies = entraConfig.conditionalAccessPolicies;
        const hasActivePolicies = caPolicies.some(policy => policy.state === 'enabled');
        
        if (!hasActivePolicies) {
          recommendations.push('Enable at least one conditional access policy');
        }

        return {
          passed: hasActivePolicies,
          details: { activePolicies: caPolicies.filter(p => p.state === 'enabled').length },
          recommendations: hasActivePolicies ? undefined : recommendations
        };

      case 'mfaSettings':
        const mfaEnabled = entraConfig.mfaSettings?.authenticationMethodConfigurations?.some(
          (config: any) => config.state === 'enabled'
        );
        
        if (!mfaEnabled) {
          recommendations.push('Enable multi-factor authentication methods');
        }

        return {
          passed: mfaEnabled || false,
          details: { mfaConfiguration: entraConfig.mfaSettings },
          recommendations: mfaEnabled ? undefined : recommendations
        };

      case 'passwordPolicies':
        const hasPasswordPolicy = entraConfig.passwordPolicies?.defaultUserRolePermissions !== undefined;
        
        if (!hasPasswordPolicy) {
          recommendations.push('Configure password policies');
        }

        return {
          passed: hasPasswordPolicy,
          details: { passwordSettings: entraConfig.passwordPolicies },
          recommendations: hasPasswordPolicy ? undefined : recommendations
        };

      case 'auditLogs':
        const hasRecentAuditLogs = entraConfig.auditLogs.length > 0;
        
        if (!hasRecentAuditLogs) {
          recommendations.push('Ensure audit logging is enabled and functioning');
        }

        return {
          passed: hasRecentAuditLogs,
          details: { recentLogCount: entraConfig.auditLogs.length },
          recommendations: hasRecentAuditLogs ? undefined : recommendations
        };

      case 'userRiskPolicies':
        const hasUserRiskPolicies = entraConfig.userRiskPolicies.length > 0;
        
        if (!hasUserRiskPolicies) {
          recommendations.push('Configure user risk-based conditional access policies');
        }

        return {
          passed: hasUserRiskPolicies,
          details: { userRiskPolicyCount: entraConfig.userRiskPolicies.length },
          recommendations: hasUserRiskPolicies ? undefined : recommendations
        };

      case 'signInRiskPolicies':
        const hasSignInRiskPolicies = entraConfig.signInRiskPolicies.length > 0;
        
        if (!hasSignInRiskPolicies) {
          recommendations.push('Configure sign-in risk-based conditional access policies');
        }

        return {
          passed: hasSignInRiskPolicies,
          details: { signInRiskPolicyCount: entraConfig.signInRiskPolicies.length },
          recommendations: hasSignInRiskPolicies ? undefined : recommendations
        };

      case 'privilegedAccess':
        const hasPrivilegedAccessSettings = entraConfig.privilegedAccessSettings.length > 0;
        
        if (!hasPrivilegedAccessSettings) {
          recommendations.push('Configure privileged access management settings');
        }

        return {
          passed: hasPrivilegedAccessSettings,
          details: { privilegedAccessSettings: entraConfig.privilegedAccessSettings.length },
          recommendations: hasPrivilegedAccessSettings ? undefined : recommendations
        };

      default:
        logger.warn(`Unknown mapping: ${mapping}`);
        return {
          passed: false,
          details: { error: 'Unknown mapping type' },
          recommendations: ['Manual review required for this control mapping']
        };
    }
  }

  private getRelevantConfiguration(mappings: string[], entraConfig: EntraConfiguration): any {
    const relevantConfig: any = {};

    mappings.forEach(mapping => {
      switch (mapping) {
        case 'conditionalAccess':
          relevantConfig.conditionalAccessPolicies = entraConfig.conditionalAccessPolicies;
          break;
        case 'mfaSettings':
          relevantConfig.mfaSettings = entraConfig.mfaSettings;
          break;
        case 'passwordPolicies':
          relevantConfig.passwordPolicies = entraConfig.passwordPolicies;
          break;
        case 'auditLogs':
          relevantConfig.auditLogCount = entraConfig.auditLogs.length;
          break;
        case 'userRiskPolicies':
          relevantConfig.userRiskPolicies = entraConfig.userRiskPolicies;
          break;
        case 'signInRiskPolicies':
          relevantConfig.signInRiskPolicies = entraConfig.signInRiskPolicies;
          break;
        case 'privilegedAccess':
          relevantConfig.privilegedAccessSettings = entraConfig.privilegedAccessSettings;
          break;
      }
    });

    return relevantConfig;
  }

  async getAvailableFrameworks() {
    return frameworksConfig.frameworks.map(framework => ({
      id: framework.id,
      name: framework.name,
      version: framework.version,
      description: framework.description,
      category: framework.category,
      controlCount: framework.controls.length
    }));
  }

  async getFrameworkControls(frameworkId: string) {
    const framework = frameworksConfig.frameworks.find(f => f.id === frameworkId);
    if (!framework) {
      throw new Error(`Framework ${frameworkId} not found`);
    }
    return framework.controls;
  }

  async confirmControl(
    frameworkId: string,
    controlId: string,
    confirmed: boolean,
    confirmedBy: string,
    justification?: string
  ): Promise<ControlStatus> {
    // In a real implementation, this would update a database
    // For now, we'll return a mock confirmed status
    return {
      controlId,
      frameworkId,
      status: confirmed ? 'passed' : 'failed',
      score: confirmed ? 100 : 0,
      lastChecked: new Date(),
      manuallyConfirmed: true,
      confirmationDate: new Date(),
      confirmationBy: confirmedBy,
      evidence: {
        manualConfirmation: {
          confirmed,
          justification,
          confirmedBy,
          confirmationDate: new Date()
        }
      }
    };
  }
}