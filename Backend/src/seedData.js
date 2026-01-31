// Seed data for the new hierarchical structure
// Structure: Category > Subject > ContentType > SubTopics (with unlimited nesting) > Data

const seedData = [
  {
    id: "12th",
    name: "12th Grade",
    order: 1,
    subjects: [
      {
        id: "physics-12",
        name: "Physics",
        description: "Explore the fundamental laws of nature and universe",
        icon: "⚛️",
        color: "#3b82f6",
        contentTypes: [
          {
            id: "notes",
            name: "Notes",
            icon: "📝",
            type: "notes",
            order: 1,
            subTopics: [
              {
                id: "mechanics",
                name: "Mechanics",
                subTopics: [
                  {
                    id: "kinematics",
                    name: "Kinematics",
                    content: {
                      type: "notes",
                      data: "Kinematics is the branch of mechanics that deals with the motion of objects without considering the forces that cause the motion.\n\nKey Concepts:\n1. Displacement: Change in position of an object\n2. Velocity: Rate of change of displacement\n3. Acceleration: Rate of change of velocity\n\nEquations of Motion:\n- v = u + at\n- s = ut + (1/2)at²\n- v² = u² + 2as\n\nWhere:\nu = initial velocity\nv = final velocity\na = acceleration\nt = time\ns = displacement"
                    }
                  },
                  {
                    id: "newtons-laws",
                    name: "Newton's Laws",
                    content: {
                      type: "notes",
                      data: "Newton's Three Laws of Motion form the foundation of classical mechanics.\n\nFirst Law (Law of Inertia):\nAn object at rest stays at rest, and an object in motion stays in motion with the same speed and direction unless acted upon by an external force.\n\nSecond Law:\nThe acceleration of an object is directly proportional to the net force acting on it and inversely proportional to its mass.\nF = ma\n\nThird Law:\nFor every action, there is an equal and opposite reaction."
                    }
                  },
                  {
                    id: "work-energy",
                    name: "Work, Energy & Power",
                    content: {
                      type: "notes",
                      data: "Work is done when a force causes displacement.\n\nWork = Force × Displacement × cos(θ)\nW = F · s · cos(θ)\n\nEnergy:\n- Kinetic Energy: KE = (1/2)mv²\n- Potential Energy: PE = mgh\n\nPower:\nPower is the rate at which work is done.\nP = W/t = F·v"
                    }
                  }
                ]
              },
              {
                id: "thermodynamics",
                name: "Thermodynamics",
                subTopics: [
                  {
                    id: "heat-temperature",
                    name: "Heat and Temperature",
                    content: {
                      type: "notes",
                      data: "Temperature is a measure of the average kinetic energy of particles in a substance.\n\nHeat is the transfer of thermal energy between objects at different temperatures.\n\nMethods of Heat Transfer:\n1. Conduction: Direct contact\n2. Convection: Through fluid movement\n3. Radiation: Through electromagnetic waves\n\nSpecific Heat Capacity:\nQ = mcΔT\n\nWhere:\nQ = heat energy\nm = mass\nc = specific heat capacity\nΔT = change in temperature"
                    }
                  },
                  {
                    id: "laws-thermodynamics",
                    name: "Laws of Thermodynamics",
                    content: {
                      type: "notes",
                      data: "Zeroth Law:\nIf two systems are in thermal equilibrium with a third system, they are in thermal equilibrium with each other.\n\nFirst Law (Conservation of Energy):\nΔU = Q - W\nThe change in internal energy equals heat added minus work done by the system.\n\nSecond Law:\nHeat cannot spontaneously flow from a colder body to a hotter body.\nEntropy of an isolated system always increases.\n\nThird Law:\nAs temperature approaches absolute zero, the entropy of a system approaches a constant minimum."
                    }
                  }
                ]
              },
              {
                id: "electromagnetism",
                name: "Electromagnetism",
                subTopics: [
                  {
                    id: "electric-field",
                    name: "Electric Field & Potential",
                    content: {
                      type: "notes",
                      data: "Electric Field:\nThe electric field is the force per unit charge.\nE = F/q\n\nElectric Potential:\nWork done in bringing a unit positive charge from infinity to a point.\nV = W/q\n\nRelation between E and V:\nE = -dV/dx\n\nCoulomb's Law:\nF = k(q₁q₂)/r²\n\nWhere:\nk = 9 × 10⁹ Nm²/C² (Coulomb's constant)"
                    }
                  }
                ]
              }
            ]
          },
          {
            id: "videos",
            name: "Videos",
            icon: "🎥",
            type: "videos",
            order: 2,
            subTopics: [
              {
                id: "mechanics",
                name: "Mechanics",
                subTopics: [
                  {
                    id: "kinematics-videos",
                    name: "Kinematics",
                    content: {
                      type: "videos",
                      data: [
                        {
                          title: "Introduction to Kinematics",
                          url: "https://www.youtube.com/watch?v=example1",
                          thumbnail: "https://via.placeholder.com/320x180/3b82f6/ffffff?text=Kinematics+Intro",
                          duration: "15:30"
                        },
                        {
                          title: "Equations of Motion Explained",
                          url: "https://www.youtube.com/watch?v=example2",
                          thumbnail: "https://via.placeholder.com/320x180/3b82f6/ffffff?text=Equations+of+Motion",
                          duration: "22:45"
                        }
                      ]
                    }
                  },
                  {
                    id: "newtons-laws-videos",
                    name: "Newton's Laws",
                    content: {
                      type: "videos",
                      data: [
                        {
                          title: "Newton's Three Laws of Motion",
                          url: "https://www.youtube.com/watch?v=example3",
                          thumbnail: "https://via.placeholder.com/320x180/3b82f6/ffffff?text=Newton's+Laws",
                          duration: "18:20"
                        }
                      ]
                    }
                  }
                ]
              },
              {
                id: "thermodynamics",
                name: "Thermodynamics",
                subTopics: [
                  {
                    id: "heat-temp-videos",
                    name: "Heat and Temperature",
                    content: {
                      type: "videos",
                      data: [
                        {
                          title: "Understanding Heat Transfer",
                          url: "https://www.youtube.com/watch?v=example4",
                          thumbnail: "https://via.placeholder.com/320x180/ef4444/ffffff?text=Heat+Transfer",
                          duration: "12:15"
                        }
                      ]
                    }
                  }
                ]
              }
            ]
          },
          {
            id: "mock-tests",
            name: "Mock Tests",
            icon: "📋",
            type: "mockTests",
            order: 3,
            subTopics: [
              {
                id: "mechanics",
                name: "Mechanics",
                subTopics: [
                  {
                    id: "mechanics-test-1",
                    name: "Mechanics Test 1",
                    content: {
                      type: "mockTests",
                      data: [
                        {
                          title: "Kinematics and Motion",
                          duration: 60,
                          totalMarks: 100,
                          questions: [
                            {
                              question: "A car accelerates from rest at 2 m/s². What is its velocity after 10 seconds?",
                              type: "numerical"
                            }
                          ]
                        }
                      ]
                    }
                  }
                ]
              },
              {
                id: "full-syllabus",
                name: "Full Syllabus Tests",
                subTopics: [
                  {
                    id: "full-test-1",
                    name: "Full Syllabus Test 1",
                    content: {
                      type: "mockTests",
                      data: [
                        {
                          title: "Physics Complete Test",
                          duration: 180,
                          totalMarks: 300,
                          questions: []
                        }
                      ]
                    }
                  }
                ]
              }
            ]
          },
          {
            id: "mcqs",
            name: "MCQs",
            icon: "❓",
            type: "mcqs",
            order: 4,
            subTopics: [
              {
                id: "mechanics",
                name: "Mechanics",
                subTopics: [
                  {
                    id: "kinematics-mcqs",
                    name: "Kinematics MCQs",
                    content: {
                      type: "mcqs",
                      data: [
                        {
                          question: "What is the SI unit of acceleration?",
                          options: ["m/s", "m/s²", "m²/s", "m/s³"],
                          correctAnswer: 1
                        },
                        {
                          question: "Which equation represents displacement in uniformly accelerated motion?",
                          options: ["v = u + at", "s = ut + (1/2)at²", "v² = u² + 2as", "All of the above"],
                          correctAnswer: 3
                        }
                      ]
                    }
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        id: "mathematics-12",
        name: "Mathematics",
        description: "Master advanced mathematical concepts and problem-solving",
        icon: "🔢",
        color: "#10b981",
        contentTypes: [
          {
            id: "notes",
            name: "Notes",
            icon: "📝",
            type: "notes",
            order: 1,
            subTopics: [
              {
                id: "calculus",
                name: "Calculus",
                subTopics: [
                  {
                    id: "differentiation",
                    name: "Differentiation",
                    content: {
                      type: "notes",
                      data: "Differentiation is the process of finding the rate of change of a function.\n\nBasic Rules:\n1. Power Rule: d/dx(xⁿ) = nxⁿ⁻¹\n2. Product Rule: d/dx(uv) = u(dv/dx) + v(du/dx)\n3. Quotient Rule: d/dx(u/v) = [v(du/dx) - u(dv/dx)]/v²\n4. Chain Rule: d/dx[f(g(x))] = f'(g(x)) · g'(x)\n\nCommon Derivatives:\n- d/dx(sin x) = cos x\n- d/dx(cos x) = -sin x\n- d/dx(eˣ) = eˣ\n- d/dx(ln x) = 1/x"
                    }
                  },
                  {
                    id: "integration",
                    name: "Integration",
                    content: {
                      type: "notes",
                      data: "Integration is the reverse process of differentiation.\n\nBasic Rules:\n1. ∫xⁿ dx = xⁿ⁺¹/(n+1) + C (n ≠ -1)\n2. ∫eˣ dx = eˣ + C\n3. ∫(1/x) dx = ln|x| + C\n4. ∫sin x dx = -cos x + C\n5. ∫cos x dx = sin x + C\n\nMethods of Integration:\n- Substitution Method\n- Integration by Parts: ∫u dv = uv - ∫v du\n- Partial Fractions"
                    }
                  },
                  {
                    id: "applications",
                    name: "Applications of Calculus",
                    subTopics: [
                      {
                        id: "area-curves",
                        name: "Area Under Curves",
                        content: {
                          type: "notes",
                          data: "The definite integral can be used to find the area under a curve.\n\nArea = ∫ₐᵇ f(x) dx\n\nWhere:\n- f(x) is the function\n- [a, b] is the interval\n\nFor area between two curves:\nArea = ∫ₐᵇ [f(x) - g(x)] dx\n\nWhere f(x) ≥ g(x) on [a, b]"
                        }
                      },
                      {
                        id: "volumes",
                        name: "Volumes of Revolution",
                        content: {
                          type: "notes",
                          data: "When a region is rotated about an axis, we can find the volume using integration.\n\nDisk Method (rotation about x-axis):\nV = π∫ₐᵇ [f(x)]² dx\n\nShell Method:\nV = 2π∫ₐᵇ x·f(x) dx"
                        }
                      }
                    ]
                  }
                ]
              },
              {
                id: "algebra",
                name: "Algebra",
                subTopics: [
                  {
                    id: "matrices",
                    name: "Matrices",
                    content: {
                      type: "notes",
                      data: "A matrix is a rectangular array of numbers arranged in rows and columns.\n\nMatrix Operations:\n1. Addition: Add corresponding elements\n2. Multiplication: Row × Column\n\nProperties:\n- (AB)C = A(BC) - Associative\n- A(B + C) = AB + AC - Distributive\n- AB ≠ BA (generally) - Not commutative\n\nDeterminant of 2×2 matrix:\n|A| = ad - bc for matrix [a b; c d]\n\nInverse of matrix A:\nA⁻¹ exists if |A| ≠ 0"
                    }
                  }
                ]
              }
            ]
          },
          {
            id: "videos",
            name: "Videos",
            icon: "🎥",
            type: "videos",
            order: 2,
            subTopics: [
              {
                id: "calculus",
                name: "Calculus",
                subTopics: [
                  {
                    id: "differentiation-videos",
                    name: "Differentiation",
                    content: {
                      type: "videos",
                      data: [
                        {
                          title: "Introduction to Derivatives",
                          url: "https://www.youtube.com/watch?v=example5",
                          thumbnail: "https://via.placeholder.com/320x180/10b981/ffffff?text=Derivatives",
                          duration: "25:00"
                        }
                      ]
                    }
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        id: "chemistry-12",
        name: "Chemistry",
        description: "Discover the fascinating world of matter and reactions",
        icon: "🧪",
        color: "#f59e0b",
        contentTypes: [
          {
            id: "notes",
            name: "Notes",
            icon: "📝",
            type: "notes",
            order: 1,
            subTopics: [
              {
                id: "organic",
                name: "Organic Chemistry",
                subTopics: [
                  {
                    id: "hydrocarbons",
                    name: "Hydrocarbons",
                    content: {
                      type: "notes",
                      data: "Hydrocarbons are organic compounds consisting entirely of hydrogen and carbon.\n\nClassification:\n1. Alkanes (CₙH₂ₙ₊₂) - Single bonds\n2. Alkenes (CₙH₂ₙ) - One double bond\n3. Alkynes (CₙH₂ₙ₋₂) - One triple bond\n\nNomenclature Rules:\n- Identify the longest carbon chain\n- Number the chain from the end nearest to substituents\n- Name substituents with position numbers\n\nExample:\nCH₃-CH₂-CH₂-CH₃ = Butane"
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "11th",
    name: "11th Grade",
    order: 2,
    subjects: [
      {
        id: "physics-11",
        name: "Physics",
        description: "Build strong foundations in physics concepts",
        icon: "⚛️",
        color: "#3b82f6",
        contentTypes: [
          {
            id: "notes",
            name: "Notes",
            icon: "📝",
            type: "notes",
            order: 1,
            subTopics: [
              {
                id: "units-measurements",
                name: "Units and Measurements",
                content: {
                  type: "notes",
                  data: "Physical quantities are measured in specific units.\n\nSI Base Units:\n1. Length: meter (m)\n2. Mass: kilogram (kg)\n3. Time: second (s)\n4. Electric current: ampere (A)\n5. Temperature: kelvin (K)\n6. Amount of substance: mole (mol)\n7. Luminous intensity: candela (cd)\n\nDimensional Analysis:\nUsed to check the correctness of equations and derive relationships between physical quantities."
                }
              }
            ]
          }
        ]
      }
    ]
  }
];

module.exports = seedData;
