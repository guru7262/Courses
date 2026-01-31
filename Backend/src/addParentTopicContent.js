// addParentTopicContent.js
// This script adds content to parent topics like "Mechanics" that currently have no content

require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./models/Category');

const MONGODB_URI = 
  process.env.MONGODB_URI || 
  process.env.MONGO_URI || 
  process.env.DATABASE_URL ||
  'mongodb+srv://Vivek:Vivek7262@cluster.fl0v3nj.mongodb.net/example?appName=Cluster';

async function addParentContent() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('📝 Adding content to parent topics...');

    // Find 12th Physics
    const category = await Category.findOne({ id: '12th' });
    if (!category) {
      console.error('❌ 12th grade category not found');
      process.exit(1);
    }

    const physics = category.subjects.find(s => s.id === 'physics-12');
    if (!physics) {
      console.error('❌ Physics subject not found');
      process.exit(1);
    }

    const notesContentType = physics.contentTypes.find(ct => ct.id === 'notes');
    if (!notesContentType) {
      console.error('❌ Notes content type not found');
      process.exit(1);
    }

    // Add content to Mechanics
    const mechanics = notesContentType.subTopics.find(st => st.id === 'mechanics');
    if (mechanics && !mechanics.content) {
      mechanics.content = {
        type: 'notes',
        data: 'Mechanics is the branch of physics that deals with the motion of objects and the forces that cause motion.\n\nMain Topics:\n1. Kinematics - Study of motion without considering forces\n2. Dynamics - Study of motion and the forces causing it\n3. Statics - Study of objects at rest\n4. Work, Energy and Power - Energy transformations\n\nMechanics forms the foundation of classical physics and is essential for understanding how objects move and interact in our daily lives.\n\nClick on the subtopics in the right sidebar to explore each area in detail!'
      };
      console.log('✅ Added content to Mechanics');
    }

    // Add content to Thermodynamics
    const thermodynamics = notesContentType.subTopics.find(st => st.id === 'thermodynamics');
    if (thermodynamics && !thermodynamics.content) {
      thermodynamics.content = {
        type: 'notes',
        data: 'Thermodynamics is the branch of physics that deals with heat, temperature, and energy transfer.\n\nKey Concepts:\n1. Heat - Transfer of thermal energy\n2. Temperature - Measure of average kinetic energy\n3. Internal Energy - Total energy of a system\n4. Entropy - Measure of disorder\n\nLaws of Thermodynamics:\n- Zeroth Law: Thermal equilibrium\n- First Law: Conservation of energy\n- Second Law: Entropy always increases\n- Third Law: Absolute zero is unattainable\n\nThermodynamics helps us understand engines, refrigerators, and energy systems!'
      };
      console.log('✅ Added content to Thermodynamics');
    }

    // Add content to Electromagnetism
    const electromagnetism = notesContentType.subTopics.find(st => st.id === 'electromagnetism');
    if (electromagnetism && !electromagnetism.content) {
      electromagnetism.content = {
        type: 'notes',
        data: 'Electromagnetism is the study of electric and magnetic fields and their interactions.\n\nKey Topics:\n1. Electric Fields - Force fields around charges\n2. Magnetic Fields - Force fields around magnets and currents\n3. Electromagnetic Induction - Creating electricity from magnetism\n4. Maxwell\'s Equations - Fundamental laws of electromagnetism\n\nApplications:\n- Electric motors and generators\n- Radio and television broadcasting\n- Mobile phones and WiFi\n- MRI machines\n\nElectromagnetism is one of the four fundamental forces of nature!'
      };
      console.log('✅ Added content to Electromagnetism');
    }

    // Save the changes
    await category.save();
    console.log('💾 Changes saved to database');

    console.log('\n✨ Parent topic content added successfully!');
    console.log('🎯 Now "Mechanics", "Thermodynamics", and "Electromagnetism" will show content');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addParentContent();
