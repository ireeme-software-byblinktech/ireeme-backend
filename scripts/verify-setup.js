/**
 * Setup Verification Script
 * 
 * Verifies that all enterprise features are properly configured
 */

const fs = require('fs');
const path = require('path');

const checks = {
  passed: [],
  failed: [],
  warnings: []
};

function checkFile(filePath, description) {
  const fullPath = path.join(__dirname, '..', filePath);
  if (fs.existsSync(fullPath)) {
    checks.passed.push(`✓ ${description}`);
    return true;
  } else {
    checks.failed.push(`✗ ${description}`);
    return false;
  }
}

function checkEnvVar(varName, description) {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
  if (process.env[varName]) {
    checks.passed.push(`✓ ${description}`);
    return true;
  } else {
    checks.warnings.push(`⚠ ${description}`);
    return false;
  }
}

console.log('\n' + '='.repeat(60));
console.log('ENTERPRISE SETUP VERIFICATION');
console.log('='.repeat(60) + '\n');

// Check core service files
console.log('Checking Core Services...');
checkFile('src/common/services/cache.service.ts', 'Cache Service');
checkFile('src/common/services/circuit-breaker.service.ts', 'Circuit Breaker Service');
checkFile('src/common/services/metrics.service.ts', 'Metrics Service');

// Check security files
console.log('\nChecking Security Features...');
checkFile('src/common/guards/advanced-rate-limit.guard.ts', 'Advanced Rate Limiting');
checkFile('src/common/pipes/sanitize.pipe.ts', 'Input Sanitization');
checkFile('src/common/middleware/timeout.middleware.ts', 'Request Timeout');

// Check Kubernetes files
console.log('\nChecking Kubernetes Configuration...');
checkFile('k8s/deployment.yaml', 'K8s Deployment');
checkFile('k8s/configmap.yaml', 'K8s ConfigMap');
checkFile('k8s/redis-deployment.yaml', 'K8s Redis Deployment');

// Check Docker files
console.log('\nChecking Docker Configuration...');
checkFile('Dockerfile', 'Dockerfile');
checkFile('.dockerignore', 'Docker Ignore');

// Check documentation
console.log('\nChecking Documentation...');
checkFile('ENTERPRISE_UPGRADE_SUMMARY.md', 'Enterprise Upgrade Summary');
checkFile('ARCHITECTURE.md', 'Architecture Documentation');
checkFile('DEPLOYMENT.md', 'Deployment Guide');
checkFile('PRODUCTION_CHECKLIST.md', 'Production Checklist');

// Check environment variables
console.log('\nChecking Environment Configuration...');
checkEnvVar('DATABASE_URL', 'Database URL with connection pooling');
checkEnvVar('REDIS_HOST', 'Redis Host');
checkEnvVar('REQUEST_TIMEOUT', 'Request Timeout');
checkEnvVar('CACHE_DEFAULT_TTL', 'Cache TTL');
checkEnvVar('CORS_ALLOWED_ORIGINS', 'CORS Origins');

// Print results
console.log('\n' + '='.repeat(60));
console.log('RESULTS');
console.log('='.repeat(60) + '\n');

if (checks.passed.length > 0) {
  console.log('✓ PASSED (' + checks.passed.length + '):\n');
  checks.passed.forEach(check => console.log('  ' + check));
}

if (checks.warnings.length > 0) {
  console.log('\n⚠ WARNINGS (' + checks.warnings.length + '):\n');
  checks.warnings.forEach(check => console.log('  ' + check));
  console.log('\n  Note: Warnings are optional but recommended for production');
}

if (checks.failed.length > 0) {
  console.log('\n✗ FAILED (' + checks.failed.length + '):\n');
  checks.failed.forEach(check => console.log('  ' + check));
  console.log('\n  Please ensure all required files are present');
}

console.log('\n' + '='.repeat(60));

if (checks.failed.length === 0) {
  console.log('✓ ALL CHECKS PASSED - System is ready!');
  console.log('='.repeat(60) + '\n');
  
  console.log('Next Steps:');
  console.log('1. Run: npm run dev');
  console.log('2. Test: npm run health-check');
  console.log('3. Load test: npm run load-test');
  console.log('4. Deploy: npm run k8s:deploy\n');
  
  process.exit(0);
} else {
  console.log('✗ SETUP INCOMPLETE - Please fix failed checks');
  console.log('='.repeat(60) + '\n');
  process.exit(1);
}
