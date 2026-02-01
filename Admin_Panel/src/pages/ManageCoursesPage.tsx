import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Category } from '../types';
import '../styles/App.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function ManageCoursesPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

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
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditCourse = (categoryId: string, subjectId: string) => {
    navigate(`/edit-course/${categoryId}/${subjectId}`);
  };

  const handleDeleteCourse = async (categoryId: string, subjectId: string, subjectName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${subjectName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/categories/${categoryId}/subject/${subjectId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete');

      alert('Course deleted successfully!');
      // Refresh categories
      fetchCategories();
    } catch (err) {
      console.error('Error:', err);
      alert('Failed to delete course');
    }
  };

  const handleAddCourse = () => {
    navigate('/add-course');
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading">Loading courses...</div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Manage Courses</h1>
          <button className="btn btn-primary btn-small" onClick={handleAddCourse}>
            + Add New Course
          </button>
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
                    <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                      <button 
                        className="btn btn-primary btn-small"
                        onClick={() => handleEditCourse(category.id, subject.id)}
                      >
                        Edit Course
                      </button>
                      <button 
                        className="btn btn-danger btn-small"
                        onClick={() => handleDeleteCourse(category.id, subject.id, subject.name)}
                      >
                        Delete
                      </button>
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
