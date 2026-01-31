// seedDatabase.js
// Script to populate MongoDB with seed data
// Run with: node seedDatabase.js

const mongoose = require('mongoose');
const Category = require('./models/Category');
const seedData = require('./seedData');

// Replace with your MongoDB connection string
const MONGODB_URI = 'mongodb+srv://Vivek:Vivek7262@cluster.fl0v3nj.mongodb.net/example?appName=Cluster' || process.env.MONGODB_URI;

async function seedDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('🗑️  Clearing existing data...');
    await Category.deleteMany({});
    console.log('✅ Existing data cleared');

    console.log('📝 Inserting seed data...');
    await Category.insertMany(seedData);
    console.log('✅ Seed data inserted successfully');

    console.log('\n📊 Database Summary:');
    const categories = await Category.find();
    categories.forEach(cat => {
      console.log(`\n📁 ${cat.name} (${cat.id})`);
      cat.subjects.forEach(subject => {
        console.log(`  📚 ${subject.name}`);
        console.log(`     Content Types: ${subject.contentTypes.length}`);
        subject.contentTypes.forEach(ct => {
          console.log(`       - ${ct.name}: ${ct.subTopics.length} top-level topics`);
        });
      });
    });

    console.log('\n✨ Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
