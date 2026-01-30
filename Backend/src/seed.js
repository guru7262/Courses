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
        subTopics: [
          {
            id: 'mechanics',
            name: 'Mechanics',
            content: {
              notes: `# Mechanics - Introduction

Newton's laws of motion describe the relationship between forces and motion.

## First Law (Law of Inertia)
An object at rest stays at rest and an object in motion stays in motion unless acted upon by an external force.

## Second Law
The acceleration of an object is directly proportional to the net force acting on it and inversely proportional to its mass.
Formula: F = ma

## Third Law
For every action, there is an equal and opposite reaction.`,
              videoLectures: [
                {
                  title: 'Introduction to Mechanics',
                  url: 'https://youtube.com/watch?v=example1',
                  duration: '15:30',
                  thumbnail: 'https://via.placeholder.com/320x180'
                }
              ],
              mockTests: [
                {
                  title: 'Mechanics Basics Test',
                  duration: 30,
                  totalMarks: 50,
                  questions: [
                    {
                      question: 'What is Newton\'s First Law of Motion?',
                      options: [
                        'F = ma',
                        'An object at rest stays at rest unless acted upon by a force',
                        'For every action there is an equal reaction',
                        'E = mc²'
                      ],
                      correctAnswer: 1,
                      explanation: 'Newton\'s First Law states that an object at rest stays at rest.'
                    }
                  ]
                }
              ]
            }
          },
          {
            id: 'electromagnetism',
            name: 'Electromagnetism',
            content: {
              notes: `# Electromagnetism

The study of electric and magnetic fields and their interactions.

## Electric Force
Coulomb's Law: F = k(q₁q₂)/r²`,
              videoLectures: [],
              mockTests: []
            }
          }
        ]
      },
      {
        id: 'chemistry-12',
        name: 'Chemistry',
        description: 'Study of matter, its properties, and transformations',
        icon: '🧪',
        color: '#10b981',
        subTopics: [
          {
            id: 'organic',
            name: 'Organic Chemistry',
            content: {
              notes: `# Organic Chemistry

Study of carbon-containing compounds.

## Hydrocarbons
- Alkanes (single bonds)
- Alkenes (double bonds)
- Alkynes (triple bonds)`,
              videoLectures: [],
              mockTests: []
            }
          },
          {
            id: 'inorganic',
            name: 'Inorganic Chemistry',
            content: {
              notes: `# Inorganic Chemistry

Study of all elements and compounds except most carbon compounds.`,
              videoLectures: [],
              mockTests: []
            }
          }
        ]
      },
      {
        id: 'mathematics-12',
        name: 'Mathematics',
        description: 'Study of numbers, quantities, shapes, and patterns',
        icon: '📐',
        color: '#f59e0b',
        subTopics: [
          {
            id: 'calculus',
            name: 'Calculus',
            content: {
              notes: `# Calculus

The mathematical study of continuous change.

## Differential Calculus
- Derivatives
- Rate of change`,
              videoLectures: [],
              mockTests: []
            }
          },
          {
            id: 'algebra',
            name: 'Algebra',
            content: {
              notes: `# Algebra

Study of mathematical symbols and rules.`,
              videoLectures: [],
              mockTests: []
            }
          }
        ]
      },
      {
        id: 'biology-12',
        name: 'Biology',
        description: 'Study of living organisms and life processes',
        icon: '🧬',
        color: '#8b5cf6',
        subTopics: [
          {
            id: 'genetics',
            name: 'Genetics',
            content: {
              notes: `# Genetics

Study of heredity and variation in organisms.

## DNA Structure
- Double helix
- Base pairs: A-T, G-C`,
              videoLectures: [],
              mockTests: []
            }
          }
        ]
      }
    ]
  },
  {
    id: '11th',
    name: '11th Standard',
    order: 2,
    subjects: [
      {
        id: 'physics-11',
        name: 'Physics',
        description: 'Fundamentals of matter and energy',
        icon: '⚛️',
        color: '#3b82f6',
        subTopics: [
          {
            id: 'motion',
            name: 'Motion in a Straight Line',
            content: {
              notes: `# Motion in a Straight Line

Basic concepts of kinematics.

## Speed and Velocity
- Speed: Distance/Time
- Velocity: Displacement/Time`,
              videoLectures: [],
              mockTests: []
            }
          },
          {
            id: 'waves',
            name: 'Waves',
            content: {
              notes: `# Waves

Study of wave motion and properties.`,
              videoLectures: [],
              mockTests: []
            }
          }
        ]
      },
      {
        id: 'chemistry-11',
        name: 'Chemistry',
        description: 'Basics of chemical science',
        icon: '🧪',
        color: '#10b981',
        subTopics: [
          {
            id: 'atomic-structure',
            name: 'Atomic Structure',
            content: {
              notes: `# Atomic Structure

Understanding atoms and their components.

## Subatomic Particles
- Protons
- Neutrons
- Electrons`,
              videoLectures: [],
              mockTests: []
            }
          }
        ]
      },
      {
        id: 'mathematics-11',
        name: 'Mathematics',
        description: 'Advanced mathematical concepts',
        icon: '📐',
        color: '#f59e0b',
        subTopics: [
          {
            id: 'sets',
            name: 'Sets and Functions',
            content: {
              notes: `# Sets and Functions

Basic set theory and function concepts.`,
              videoLectures: [],
              mockTests: []
            }
          }
        ]
      }
    ]
  },
  {
    id: '10th',
    name: '10th Standard',
    order: 3,
    subjects: [
      {
        id: 'science-10',
        name: 'Science',
        description: 'General science concepts',
        icon: '🔬',
        color: '#06b6d4',
        subTopics: [
          {
            id: 'light',
            name: 'Light - Reflection and Refraction',
            content: {
              notes: `# Light - Reflection and Refraction

Understanding how light behaves.

## Laws of Reflection
1. Angle of incidence = Angle of reflection
2. Incident ray, reflected ray, and normal lie in same plane`,
              videoLectures: [],
              mockTests: []
            }
          },
          {
            id: 'electricity',
            name: 'Electricity',
            content: {
              notes: `# Electricity

Basic electrical concepts and circuits.

## Ohm's Law
V = IR`,
              videoLectures: [],
              mockTests: []
            }
          }
        ]
      },
      {
        id: 'mathematics-10',
        name: 'Mathematics',
        description: 'Core mathematical principles',
        icon: '📐',
        color: '#f59e0b',
        subTopics: [
          {
            id: 'quadratic',
            name: 'Quadratic Equations',
            content: {
              notes: `# Quadratic Equations

Equations of the form ax² + bx + c = 0

## Quadratic Formula
x = (-b ± √(b² - 4ac)) / 2a`,
              videoLectures: [],
              mockTests: []
            }
          }
        ]
      },
      {
        id: 'social-10',
        name: 'Social Science',
        description: 'History, Geography, and Civics',
        icon: '🌍',
        color: '#ec4899',
        subTopics: [
          {
            id: 'history',
            name: 'History',
            content: {
              notes: `# History

World events and civilizations.`,
              videoLectures: [],
              mockTests: []
            }
          }
        ]
      }
    ]
  },
  {
    id: '9th',
    name: '9th Standard',
    order: 4,
    subjects: [
      {
        id: 'science-9',
        name: 'Science',
        description: 'Introduction to scientific concepts',
        icon: '🔬',
        color: '#06b6d4',
        subTopics: [
          {
            id: 'matter',
            name: 'Matter in Our Surroundings',
            content: {
              notes: `# Matter in Our Surroundings

Everything around us is made of matter.

## States of Matter
- Solid
- Liquid
- Gas`,
              videoLectures: [],
              mockTests: []
            }
          },
          {
            id: 'motion-9',
            name: 'Motion',
            content: {
              notes: `# Motion

Study of movement and change in position.

## Types of Motion
- Uniform motion
- Non-uniform motion`,
              videoLectures: [],
              mockTests: []
            }
          }
        ]
      },
      {
        id: 'mathematics-9',
        name: 'Mathematics',
        description: 'Fundamental mathematics',
        icon: '📐',
        color: '#f59e0b',
        subTopics: [
          {
            id: 'number-systems',
            name: 'Number Systems',
            content: {
              notes: `# Number Systems

Understanding different types of numbers.

## Types
- Natural numbers
- Whole numbers
- Integers
- Rational numbers
- Irrational numbers`,
              videoLectures: [],
              mockTests: []
            }
          }
        ]
      },
      {
        id: 'english-9',
        name: 'English',
        description: 'Language and literature',
        icon: '📚',
        color: '#f43f5e',
        subTopics: [
          {
            id: 'grammar',
            name: 'Grammar',
            content: {
              notes: `# Grammar

Rules of the English language.

## Parts of Speech
- Noun
- Verb
- Adjective
- Adverb`,
              videoLectures: [],
              mockTests: []
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
    
    console.log('Inserting sample categories...');
    await Category.insertMany(sampleCategories);
    
    console.log('✅ Database seeded successfully with', sampleCategories.length, 'categories');
    
    // Show summary
    sampleCategories.forEach(cat => {
      console.log(`  - ${cat.name}: ${cat.subjects.length} subjects`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding database:', err);
    process.exit(1);
  }
}

seedDatabase();