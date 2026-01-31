const mongoose = require('mongoose');
const Category = require('./models/Category');
require('dotenv').config();

const sampleCategories = [
  {
    id: '12th',
    name: '12th Standard',
    order: 1,
    subjects: [
      {
        id: 'physics-12',
        name: 'Physics',
        description: 'Study of matter, energy, and their interactions',
        icon: '⚛️',
        color: '#3b82f6',
        // DYNAMIC CONTENT TYPES - Admin can add/remove these
        contentTypes: [
          {
            id: 'notes',
            name: 'Notes',
            icon: '📝',
            type: 'notes',
            order: 1
          },
          {
            id: 'video-lectures',
            name: 'Video Lectures',
            icon: '🎥',
            type: 'videos',
            order: 2
          },
          {
            id: 'practice-mcqs',
            name: 'Practice MCQs',
            icon: '❓',
            type: 'mcqs',
            order: 3
          },
          {
            id: 'mock-tests',
            name: 'Mock Tests',
            icon: '📋',
            type: 'mockTests',
            order: 4
          },
          {
            id: 'reference-links',
            name: 'Reference Links',
            icon: '🔗',
            type: 'links',
            order: 5
          }
        ],
        // NESTED SUBTOPICS - Can have unlimited nesting
        subTopics: [
          {
            id: 'mechanics',
            name: 'Mechanics',
            content: {
              type: 'notes',
              data: `# Mechanics - Introduction

Newton's laws of motion describe the relationship between forces and motion.

## First Law (Law of Inertia)
An object at rest stays at rest and an object in motion stays in motion unless acted upon by an external force.

## Second Law
The acceleration of an object is directly proportional to the net force acting on it.
Formula: F = ma

## Third Law
For every action, there is an equal and opposite reaction.`
            },
            // Nested subtopics example
            subTopics: [
              {
                id: 'newtons-laws',
                name: "Newton's Laws",
                content: {
                  type: 'videos',
                  data: [
                    {
                      title: "Newton's First Law Explained",
                      url: 'https://youtube.com/watch?v=example1',
                      duration: '10:30',
                      thumbnail: 'https://via.placeholder.com/320x180'
                    },
                    {
                      title: "Newton's Second Law",
                      url: 'https://youtube.com/watch?v=example2',
                      duration: '12:45',
                      thumbnail: 'https://via.placeholder.com/320x180'
                    }
                  ]
                }
              },
              {
                id: 'motion-equations',
                name: 'Equations of Motion',
                content: {
                  type: 'mcqs',
                  data: [
                    {
                      question: 'What is the SI unit of force?',
                      options: ['Joule', 'Newton', 'Watt', 'Pascal'],
                      correctAnswer: 1,
                      explanation: 'The SI unit of force is Newton (N).'
                    },
                    {
                      question: 'Which law states F = ma?',
                      options: ["Newton's First Law", "Newton's Second Law", "Newton's Third Law", 'Law of Gravitation'],
                      correctAnswer: 1,
                      explanation: "Newton's Second Law states that Force equals mass times acceleration."
                    }
                  ]
                }
              }
            ]
          },
          {
            id: 'thermodynamics',
            name: 'Thermodynamics',
            content: {
              type: 'notes',
              data: `# Thermodynamics

Study of heat, energy, and their transformations.

## Laws of Thermodynamics
1. Zeroth Law - Thermal equilibrium
2. First Law - Energy conservation
3. Second Law - Entropy always increases
4. Third Law - Absolute zero entropy`
            },
            subTopics: [
              {
                id: 'heat-transfer',
                name: 'Heat Transfer',
                content: {
                  type: 'links',
                  data: [
                    {
                      title: 'Khan Academy - Thermodynamics',
                      description: 'Comprehensive tutorial on thermodynamics concepts',
                      url: 'https://khanacademy.org/thermodynamics'
                    },
                    {
                      title: 'MIT OpenCourseWare',
                      description: 'Advanced thermodynamics lectures',
                      url: 'https://ocw.mit.edu/thermodynamics'
                    }
                  ]
                }
              }
            ]
          },
          {
            id: 'electromagnetism',
            name: 'Electromagnetism',
            content: {
              type: 'mockTests',
              data: [
                {
                  title: 'Electromagnetism Basics Test',
                  duration: 45,
                  totalMarks: 100,
                  questions: [
                    {
                      question: "What is Coulomb's Law?",
                      options: ['F = ma', 'F = k(q₁q₂)/r²', 'E = mc²', 'V = IR'],
                      correctAnswer: 1,
                      explanation: "Coulomb's Law describes the electric force between charged particles."
                    }
                  ]
                }
              ]
            }
          }
        ]
      },
      {
        id: 'chemistry-12',
        name: 'Chemistry',
        description: 'Study of matter and its transformations',
        icon: '🧪',
        color: '#10b981',
        contentTypes: [
          {
            id: 'notes',
            name: 'Study Notes',
            type: 'notes',
            order: 1
          },
          {
            id: 'experiments',
            name: 'Video Experiments',
            type: 'videos',
            order: 2
          }
        ],
        subTopics: [
          {
            id: 'organic',
            name: 'Organic Chemistry',
            content: {
              type: 'notes',
              data: `# Organic Chemistry

Study of carbon-containing compounds.

## Hydrocarbons
- Alkanes (single bonds)
- Alkenes (double bonds)
- Alkynes (triple bonds)`
            }
          }
        ]
      }
    ]
  }
];

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    console.log('Clearing existing categories...');
    await Category.deleteMany({});
    
    console.log('Inserting sample categories with dynamic content types...');
    await Category.insertMany(sampleCategories);
    
    console.log('✅ Database seeded successfully!');
    console.log('📊 Sample structure:');
    console.log('  - Dynamic content types (can be added/removed by admin)');
    console.log('  - Nested subtopics (unlimited depth)');
    console.log('  - Flexible content types: notes, videos, links, mockTests, mcqs');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding database:', err);
    process.exit(1);
  }
}

seedDatabase();