const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const verifyDatabase = async () => {
  console.log('\n🔍 Verifying Database Setup...\n');

  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Database connected successfully');

    // Get database stats
    const db = mongoose.connection.db;
    const stats = await db.stats();
    
    console.log('\n📊 Database Statistics:');
    console.log(`   Collections: ${stats.collections}`);
    console.log(`   Objects: ${stats.objects}`);
    console.log(`   Data Size: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Index Size: ${(stats.indexSize / 1024 / 1024).toFixed(2)} MB`);

    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('\n📁 Collections:');
    collections.forEach(col => {
      console.log(`   - ${col.name}`);
    });

    // Check indexes
    console.log('\n🔍 Index Verification:');
    const models = ['users', 'resumes', 'portfolios'];
    
    for (const model of models) {
      const indexes = await db.collection(model).indexes();
      console.log(`\n   ${model} indexes:`);
      indexes.forEach(idx => {
        console.log(`     - ${idx.name}: ${JSON.stringify(idx.key)}`);
      });
    }

    console.log('\n✅ Database verification complete!\n');
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  } finally {
    await mongoose.disconnect();
  }
};

verifyDatabase();