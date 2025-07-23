// Entra Management Types

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = 'admin',
  COMPLIANCE_OFFICER = 'compliance_officer',
  VIEWER = 'viewer',
}

export enum ComplianceFramework {
  NIST_SP_800_53 = 'nist_sp_800_53',
  CIS_MICROSOFT_365 = 'cis_microsoft_365',
  ISO_27001 = 'iso_27001',
  GDPR = 'gdpr',
  HIPAA = 'hipaa',
  CUSTOM = 'custom',
}

export enum ControlStatus {
  PASSED = 'passed',
  FAILED = 'failed',
  NOT_CONFIGURED = 'not_configured',
  MANUAL_CONFIRMATION = 'manual_confirmation',
  FALSE_POSITIVE = 'false_positive',
}

export interface ComplianceControl {
  id: string;
  controlId: string; // e.g., "AC-2", "CIS-1.1.1"
  name: string;
  description: string;
  framework: ComplianceFramework;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: ControlStatus;
  lastChecked: Date;
  evidence?: ControlEvidence[];
  remediation?: RemediationAction;
  manualConfirmation?: ManualConfirmation;
  relatedEntraSettings: string[];
  tags: string[];
}

export interface ControlEvidence {
  id: string;
  type: 'api_response' | 'configuration' | 'log' | 'screenshot' | 'document';
  source: string;
  data: any;
  timestamp: Date;
  verified: boolean;
}

export interface RemediationAction {
  id: string;
  type: 'api_call' | 'powershell_script' | 'manual_guide' | 'configuration_template';
  title: string;
  description: string;
  steps: RemediationStep[];
  estimatedTime: number; // in minutes
  riskLevel: 'low' | 'medium' | 'high';
  requiresApproval: boolean;
  automatable: boolean;
}

export interface RemediationStep {
  order: number;
  title: string;
  description: string;
  type: 'action' | 'verification' | 'manual';
  command?: string;
  expectedResult?: string;
}

export interface ManualConfirmation {
  id: string;
  controlId: string;
  confirmedBy: string;
  confirmedAt: Date;
  justification: string;
  evidence?: string;
  expiresAt?: Date;
}

export interface ComplianceReport {
  id: string;
  name: string;
  frameworks: ComplianceFramework[];
  generatedAt: Date;
  generatedBy: string;
  summary: ComplianceSummary;
  controls: ComplianceControl[];
  exportFormat: 'pdf' | 'excel' | 'json';
}

export interface ComplianceSummary {
  totalControls: number;
  passedControls: number;
  failedControls: number;
  notConfiguredControls: number;
  manuallyConfirmedControls: number;
  falsePositiveControls: number;
  complianceScore: number; // percentage
  frameworkScores: Record<ComplianceFramework, number>;
}

export interface Dashboard {
  summary: ComplianceSummary;
  recentActivity: ActivityLog[];
  alerts: SecurityAlert[];
  trends: ComplianceTrend[];
}

export interface ActivityLog {
  id: string;
  type: 'control_check' | 'remediation' | 'manual_confirmation' | 'report_generation';
  description: string;
  userId: string;
  userName: string;
  timestamp: Date;
  metadata?: any;
}

export interface SecurityAlert {
  id: string;
  type: 'new_failure' | 'compliance_drop' | 'control_expired' | 'remediation_failed';
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  description: string;
  controlId?: string;
  createdAt: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}

export interface ComplianceTrend {
  date: Date;
  complianceScore: number;
  framework: ComplianceFramework;
  passedControls: number;
  failedControls: number;
  totalControls: number;
}

export interface NotificationSettings {
  id: string;
  userId: string;
  emailNotifications: boolean;
  teamsNotifications: boolean;
  weeklyDigest: boolean;
  thresholdAlerts: boolean;
  complianceThreshold: number; // percentage
  notificationTypes: NotificationType[];
}

export enum NotificationType {
  NEW_FAILURES = 'new_failures',
  COMPLIANCE_DROP = 'compliance_drop',
  REMEDIATION_SUCCESS = 'remediation_success',
  WEEKLY_DIGEST = 'weekly_digest',
  CONTROL_EXPIRY = 'control_expiry',
}

export interface Integration {
  id: string;
  type: 'defender_cloud' | 'compliance_manager' | 'log_analytics' | 'custom';
  name: string;
  enabled: boolean;
  configuration: any;
  lastSync?: Date;
  status: 'connected' | 'disconnected' | 'error';
}

export interface ControlMapping {
  id: string;
  sourceFramework: ComplianceFramework;
  targetFramework: ComplianceFramework;
  sourceControlId: string;
  targetControlId: string;
  mappingType: 'exact' | 'partial' | 'related';
  confidence: number; // 0-1
}

// API Request/Response Types
export interface GetControlsRequest {
  frameworks?: ComplianceFramework[];
  status?: ControlStatus[];
  categories?: string[];
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface GetControlsResponse {
  controls: ComplianceControl[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface RunComplianceCheckRequest {
  frameworks?: ComplianceFramework[];
  controlIds?: string[];
  forceRefresh?: boolean;
}

export interface RunComplianceCheckResponse {
  jobId: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  progress?: number;
  estimatedCompletion?: Date;
}

export interface RemediateControlRequest {
  controlId: string;
  remediationId: string;
  approvalToken?: string;
  dryRun?: boolean;
}

export interface RemediateControlResponse {
  success: boolean;
  jobId?: string;
  message: string;
  changes?: any[];
  rollbackAvailable?: boolean;
}

export interface GenerateReportRequest {
  name: string;
  frameworks: ComplianceFramework[];
  includeEvidence?: boolean;
  format: 'pdf' | 'excel' | 'json';
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    recipients: string[];
  };
}

export interface GenerateReportResponse {
  reportId: string;
  downloadUrl?: string;
  status: 'generating' | 'ready' | 'failed';
  estimatedCompletion?: Date;
}

// Microsoft Graph API Types
export interface EntraConfiguration {
  conditionalAccessPolicies: any[];
  securityDefaults: any;
  passwordPolicies: any;
  mfaSettings: any;
  privilegedAccessSettings: any;
  identityGovernance: any;
  riskPolicies: any;
}

export interface GraphApiError {
  code: string;
  message: string;
  innerError?: {
    code: string;
    message: string;
  };
}

// Audit and Compliance
export interface AuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  action: string;
  resourceType: string;
  resourceId: string;
  changes: AuditChange[];
  ipAddress: string;
  userAgent: string;
  result: 'success' | 'failure';
}

export interface AuditChange {
  property: string;
  oldValue: any;
  newValue: any;
}