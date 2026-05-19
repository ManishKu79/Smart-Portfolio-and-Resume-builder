const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

console.log('🔍 Verifying Backend Setup...\n');

// Check environment variables
console.log('📝 Checking environment variables:');
const requiredEnv = ['PORT', 'MONGODB_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];
requiredEnv.forEach(env => {
  if (process.env[env]) {
    console.log(`✅ ${env} is set`);
  } else {
    console.log(`❌ ${env} is missing`);
  }
});

// Check MongoDB connection
console.log('\n🗄️  Checking MongoDB connection...');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connection successful');
    mongoose.connection.close();
  })
  .catch(err => {
    console.log('❌ MongoDB connection failed:', err.message);
  });

console.log('\n✅ Setup verification complete!');
console.log('\n📋 Next steps:');
console.log('1. Run: npm run dev');
console.log('2. Test API: curl http://localhost:5000/health');
console.log('3. Test registration: POST http://localhost:5000/api/auth/register');