const mongoose = require('mongoose');
const Subject = require('./models/Subject');
require('dotenv').config();

const sampleSubjects = [
  {
    id: 'physics',
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
For every action, there is an equal and opposite reaction.

## Key Concepts
- Velocity and Acceleration
- Force and Motion
- Work and Energy
- Momentum and Impulse`,
          videoLectures: [
            {
              title: 'Introduction to Mechanics',
              url: 'https://youtube.com/watch?v=example1',
              duration: '15:30',
              thumbnail: 'https://via.placeholder.com/320x180'
            },
            {
              title: 'Newton\'s Laws Explained',
              url: 'https://youtube.com/watch?v=example2',
              duration: '22:45',
              thumbnail: 'https://via.placeholder.com/320x180'
            },
            {
              title: 'Problem Solving in Mechanics',
              url: 'https://youtube.com/watch?v=example3',
              duration: '18:20',
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
                  explanation: 'Newton\'s First Law, also known as the Law of Inertia, states that an object at rest stays at rest and an object in motion stays in motion unless acted upon by an external force.'
                },
                {
                  question: 'If a car has a mass of 1000kg and accelerates at 2m/s², what force is applied?',
                  options: [
                    '500 N',
                    '1000 N',
                    '2000 N',
                    '4000 N'
                  ],
                  correctAnswer: 2,
                  explanation: 'Using F = ma, Force = 1000kg × 2m/s² = 2000N'
                }
              ]
            }
          ]
        }
      },
      {
        id: 'thermodynamics',
        name: 'Thermodynamics',
        content: {
          notes: `# Thermodynamics

Thermodynamics is the study of heat, energy, and their transformations.

## Laws of Thermodynamics

### Zeroth Law
If two systems are in thermal equilibrium with a third system, they are in thermal equilibrium with each other.

### First Law
Energy cannot be created or destroyed, only transformed.
ΔU = Q - W

### Second Law
Entropy of an isolated system always increases.

### Third Law
As temperature approaches absolute zero, entropy approaches a minimum value.`,
          videoLectures: [
            {
              title: 'Laws of Thermodynamics',
              url: 'https://youtube.com/watch?v=example4',
              duration: '25:00',
              thumbnail: 'https://via.placeholder.com/320x180'
            },
            {
              title: 'Heat and Temperature',
              url: 'https://youtube.com/watch?v=example5',
              duration: '20:15',
              thumbnail: 'https://via.placeholder.com/320x180'
            }
          ],
          mockTests: [
            {
              title: 'Thermodynamics Test',
              duration: 45,
              totalMarks: 100,
              questions: [
                {
                  question: 'What does the First Law of Thermodynamics state?',
                  options: [
                    'Energy can be created',
                    'Energy cannot be created or destroyed',
                    'Entropy always increases',
                    'Heat flows from cold to hot'
                  ],
                  correctAnswer: 1,
                  explanation: 'The First Law states that energy cannot be created or destroyed, only transformed from one form to another.'
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
Coulomb's Law: F = k(q₁q₂)/r²

## Magnetic Fields
Created by moving charges and electric currents.

## Maxwell's Equations
The fundamental equations that describe all electromagnetic phenomena.`,
          videoLectures: [
            {
              title: 'Introduction to Electromagnetism',
              url: 'https://youtube.com/watch?v=example6',
              duration: '30:00',
              thumbnail: 'https://via.placeholder.com/320x180'
            }
          ],
          mockTests: [
            {
              title: 'Electromagnetism Quiz',
              duration: 40,
              totalMarks: 80,
              questions: [
                {
                  question: 'What is Coulomb\'s Law used for?',
                  options: [
                    'Calculating magnetic fields',
                    'Calculating electric force between charges',
                    'Calculating velocity',
                    'Calculating heat transfer'
                  ],
                  correctAnswer: 1,
                  explanation: 'Coulomb\'s Law calculates the electric force between two point charges.'
                }
              ]
            }
          ]
        }
      }
    ]
  },
  {
    id: 'chemistry',
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
- Alkynes (triple bonds)

## Functional Groups
- Alcohols (-OH)
- Aldehydes (-CHO)
- Ketones (C=O)
- Carboxylic Acids (-COOH)`,
          videoLectures: [
            {
              title: 'Basics of Organic Chemistry',
              url: 'https://youtube.com/watch?v=example7',
              duration: '28:30',
              thumbnail: 'https://via.placeholder.com/320x180'
            }
          ],
          mockTests: [
            {
              title: 'Organic Chemistry Test',
              duration: 50,
              totalMarks: 100,
              questions: [
                {
                  question: 'What is the functional group of alcohols?',
                  options: ['-COOH', '-CHO', '-OH', '-NH₂'],
                  correctAnswer: 2,
                  explanation: 'Alcohols have the hydroxyl functional group (-OH).'
                }
              ]
            }
          ]
        }
      },
      {
        id: 'inorganic',
        name: 'Inorganic Chemistry',
        content: {
          notes: `# Inorganic Chemistry

Study of all elements and compounds except most carbon compounds.

## Topics
- Periodic Table
- Chemical Bonding
- Acids and Bases
- Redox Reactions`,
          videoLectures: [],
          mockTests: []
        }
      },
      {
        id: 'physical',
        name: 'Physical Chemistry',
        content: {
          notes: `# Physical Chemistry

Combines physics and chemistry to study matter at molecular level.

## Key Areas
- Thermodynamics
- Kinetics
- Quantum Mechanics
- Electrochemistry`,
          videoLectures: [],
          mockTests: []
        }
      }
    ]
  },
  {
    id: 'mathematics',
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
- Rate of change
- Tangent lines

## Integral Calculus
- Area under curves
- Accumulation
- Antiderivatives`,
          videoLectures: [
            {
              title: 'Introduction to Calculus',
              url: 'https://youtube.com/watch?v=example8',
              duration: '35:00',
              thumbnail: 'https://via.placeholder.com/320x180'
            }
          ],
          mockTests: []
        }
      },
      {
        id: 'algebra',
        name: 'Algebra',
        content: {
          notes: `# Algebra

Study of mathematical symbols and rules for manipulating them.

## Topics
- Linear Equations
- Quadratic Equations
- Polynomials
- Matrices`,
          videoLectures: [],
          mockTests: []
        }
      },
      {
        id: 'trigonometry',
        name: 'Trigonometry',
        content: {
          notes: `# Trigonometry

Study of relationships between side lengths and angles of triangles.

## Basic Ratios
- sin θ
- cos θ
- tan θ

## Identities
- sin²θ + cos²θ = 1
- tan θ = sin θ / cos θ`,
          videoLectures: [],
          mockTests: []
        }
      }
    ]
  }
];

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    console.log('Clearing existing data...');
    await Subject.deleteMany({});
    
    console.log('Inserting sample data...');
    await Subject.insertMany(sampleSubjects);
    
    console.log('✅ Database seeded successfully with', sampleSubjects.length, 'subjects');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding database:', err);
    process.exit(1);
  }
}

seedDatabase();