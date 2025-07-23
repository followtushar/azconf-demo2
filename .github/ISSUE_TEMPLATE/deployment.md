---
name: Deployment Request
about: Request a deployment to a specific environment
title: 'Deploy [VERSION] to [ENVIRONMENT]'
labels: ['deployment', 'ops']
assignees: []
---

## Deployment Details

**Environment:** <!-- dev/staging/prod -->
**Version/Tag:** <!-- e.g., v1.2.3 or main -->
**Deployment Type:** <!-- standard/hotfix/rollback -->

## Pre-deployment Checklist

- [ ] All tests are passing
- [ ] Security scan completed
- [ ] Database migrations reviewed (if any)
- [ ] Environment variables updated (if needed)
- [ ] Third-party service dependencies verified
- [ ] Rollback plan prepared

## Changes Included

<!-- Describe the main changes being deployed -->

### Breaking Changes
<!-- List any breaking changes that require special attention -->

### Database Changes
<!-- Describe any database schema changes or migrations -->

### Configuration Changes
<!-- List any new environment variables or configuration changes -->

## Deployment Plan

### Pre-deployment Steps
- [ ] Backup production data (if prod deployment)
- [ ] Notify stakeholders
- [ ] Schedule maintenance window (if needed)

### Deployment Steps
- [ ] Deploy infrastructure changes (if any)
- [ ] Deploy API service
- [ ] Deploy web application
- [ ] Run database migrations
- [ ] Verify health checks

### Post-deployment Steps
- [ ] Smoke test critical functionality
- [ ] Monitor error rates and performance
- [ ] Update documentation
- [ ] Notify stakeholders of completion

## Rollback Plan

**Trigger Conditions:**
<!-- When should we rollback? -->

**Rollback Steps:**
1. <!-- Step 1 -->
2. <!-- Step 2 -->
3. <!-- Step 3 -->

## Testing

### Pre-deployment Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Security tests pass

### Post-deployment Testing
- [ ] Health checks pass
- [ ] Critical user journeys tested
- [ ] Performance benchmarks met
- [ ] Error monitoring verified

## Risk Assessment

**Risk Level:** <!-- Low/Medium/High -->

**Potential Issues:**
<!-- List potential issues and mitigation strategies -->

## Additional Notes

<!-- Any additional information about this deployment -->

---

**Deployment Approval:**
- [ ] Technical Lead approval
- [ ] Product Owner approval (for prod)
- [ ] Security approval (for prod)