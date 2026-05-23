const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('========================================');
console.log('Running Backend Tests');
console.log('========================================\n');

// Check if .env.test exists
const envTestPath = path.join(__dirname, '.env.test');
if (!fs.existsSync(envTestPath)) {
  console.error('❌ .env.test file not found!');
  console.error('Please create .env.test with JWT secrets');
  process.exit(1);
}

// Set environment
process.env.NODE_ENV = 'test';

// Run tests
try {
  execSync('npx jest --testPathPattern=__tests__ --verbose --forceExit', {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'test' }
  });
  console.log('\n========================================');
  console.log('✅ All tests passed!');
  console.log('========================================');
} catch (error) {
  console.error('\n========================================');
  console.error('❌ Tests failed!');
  console.error('========================================');
  process.exit(1);
}