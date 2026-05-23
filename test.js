const { execSync } = require('child_process');
const fs = require('fs');

console.log('========================================');
console.log('Starting Test Suite');
console.log('========================================\n');

// Backend tests
console.log('[1/3] Running Backend Tests...');
process.chdir('E:/Alpha/backend');

if (fs.existsSync('node_modules')) {
    try {
        execSync('npm run test:unit', { stdio: 'inherit' });
        execSync('npm run test:integration', { stdio: 'inherit' });
    } catch (error) {
        console.error('\nBackend tests failed!');
        process.exit(1);
    }
} else {
    console.error('Backend dependencies not installed. Run "npm install" first.');
    process.exit(1);
}

// Frontend tests
console.log('\n[2/3] Running Frontend Tests...');
process.chdir('E:/Alpha/frontend');

if (fs.existsSync('node_modules')) {
    try {
        execSync('npm run test', { stdio: 'inherit' });
    } catch (error) {
        console.error('\nFrontend tests failed!');
        process.exit(1);
    }
} else {
    console.error('Frontend dependencies not installed. Run "npm install" first.');
    process.exit(1);
}

console.log('\n========================================');
console.log('All tests completed successfully!');
console.log('========================================');