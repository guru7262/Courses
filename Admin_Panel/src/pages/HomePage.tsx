import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Category } from '../types';
import '../styles/App.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function HomePage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/categories`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectClick = (categoryId: string, subjectId: string) => {
    navigate(`/edit-course/${categoryId}/${subjectId}`);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading">Loading courses...</div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="container">
          <div className="empty-state">
            <div className="empty-state-icon">⚠️</div>
            <h2>Error Loading Courses</h2>
            <p>{error}</p>
            <button className="btn btn-primary btn-small" onClick={fetchCategories}>
              Retry
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Course Overview</h1>
        </div>

        <div className="categories-grid">
          {categories.map((category) => (
            <div key={category.id} className="category-section">
              <h2 className="category-header">{category.name}</h2>
              <div className="subjects-grid">
                {category.subjects.map((subject) => (
                  <div
                    key={subject.id}
                    className="subject-card"
                    style={{ '--subject-color': subject.color } as React.CSSProperties}
                    onClick={() => handleSubjectClick(category.id, subject.id)}
                  >
                    {subject.banner && (
                      <div 
                        style={{ 
                          width: '100%',
                          height: '150px',
                          overflow: 'hidden',
                          borderRadius: '8px 8px 0 0',
                          marginBottom: '1rem'
                        }}
                      >
                        <img 
                          src={subject.banner} 
                          alt={subject.name}
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover'
                          }}
                        />
                      </div>
                    )}
                    <h3 className="subject-name">{subject.name}</h3>
                    <p className="subject-description">{subject.description}</p>
                    <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#666' }}>
                      {subject.contentTypes.length} content types
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}