import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Subject, Category } from '../types';
import '../styles/App.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function EditCoursePage() {
  const { categoryId, subjectId } = useParams();
  const navigate = useNavigate();
  
  const [subject, setSubject] = useState<Subject | null>(null);
  const [originalSubject, setOriginalSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (categoryId && subjectId) {
      fetchSubject();
    }
  }, [categoryId, subjectId]);

  const fetchSubject = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/categories/subject/${subjectId}`);
      if (!response.ok) throw new Error('Failed to fetch subject');
      const data = await response.json();
      setSubject(data);
      setOriginalSubject(JSON.parse(JSON.stringify(data)));
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (!subject) return;
    setSubject({ ...subject, [field]: value });
    setHasChanges(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && subject) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSubject({ ...subject, banner: reader.result as string });
        setHasChanges(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveBasicInfo = async () => {
    if (!subject || !categoryId) return;

    try {
      setSaving(true);
      const response = await fetch(`${API_BASE_URL}/categories/${categoryId}/subject/${subject.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subject)
      });

      if (!response.ok) throw new Error('Failed to save');

      setOriginalSubject(JSON.parse(JSON.stringify(subject)));
      setHasChanges(false);
      alert('Basic information saved successfully!');
    } catch (err) {
      console.error('Error:', err);
      alert('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleEditContent = () => {
    if (hasChanges) {
      if (window.confirm('You have unsaved changes. Do you want to save them before editing content?')) {
        handleSaveBasicInfo().then(() => {
          navigate(`/edit-content/${categoryId}/${subjectId}`);
        });
      } else {
        navigate(`/edit-content/${categoryId}/${subjectId}`);
      }
    } else {
      navigate(`/edit-content/${categoryId}/${subjectId}`);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (window.confirm('You have unsaved changes. Discard them?')) {
        navigate('/manage-courses');
      }
    } else {
      navigate('/manage-courses');
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading">Loading course...</div>
      </>
    );
  }

  if (!subject) {
    return (
      <>
        <Navbar />
        <div className="container">
          <div className="empty-state">Course not found</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar hasUnsavedChanges={hasChanges} />
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Edit Course: {subject.name}</h1>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-secondary btn-small" onClick={handleCancel}>
              Cancel
            </button>
            <button 
              className="btn btn-success btn-small" 
              onClick={handleSaveBasicInfo}
              disabled={!hasChanges || saving}
            >
              {saving ? 'Saving...' : 'Save Basic Info'}
            </button>
            <button className="btn btn-primary btn-small" onClick={handleEditContent}>
              Edit Content →
            </button>
          </div>
        </div>

        <div className="content-form">
          <h2 style={{ marginBottom: '1.5rem' }}>Basic Information</h2>

          <div className="form-group">
            <label className="form-label">Course ID</label>
            <input
              type="text"
              className="form-input"
              value={subject.id}
              disabled
              style={{ background: '#f0f0f0' }}
            />
            <small style={{ color: '#666', fontSize: '0.85rem' }}>ID cannot be changed</small>
          </div>

          <div className="form-group">
            <label className="form-label">Course Name *</label>
            <input
              type="text"
              className="form-input"
              value={subject.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., Physics"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category *</label>
            <input
              type="text"
              className="form-input"
              value={categoryId || ''}
              disabled
              style={{ background: '#f0f0f0' }}
            />
            <small style={{ color: '#666', fontSize: '0.85rem' }}>Category cannot be changed</small>
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea
              className="form-textarea"
              value={subject.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Brief description of the course"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Color *</label>
            <div className="color-picker-wrapper">
              <input
                type="color"
                className="color-input"
                value={subject.color}
                onChange={(e) => handleInputChange('color', e.target.value)}
              />
              <input
                type="text"
                className="form-input"
                value={subject.color}
                onChange={(e) => handleInputChange('color', e.target.value)}
                placeholder="#3b82f6"
                style={{ flex: 1 }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Course Image (Optional)</label>
            <div className="image-upload" onClick={() => document.getElementById('banner-upload')?.click()}>
              {subject.banner ? (
                <img src={subject.banner} alt="Course image preview" className="image-preview" />
              ) : (
                <div>
                  <p>Click to upload course image</p>
                  <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
                    Recommended: 1200x400px or any banner size
                  </p>
                </div>
              )}
            </div>
            <input
              id="banner-upload"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageUpload}
            />
          </div>

          <div className="form-actions">
            <button className="btn btn-secondary btn-small" onClick={handleCancel}>
              Cancel
            </button>
            <button 
              className="btn btn-success btn-small" 
              onClick={handleSaveBasicInfo}
              disabled={!hasChanges || saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}