import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Subject, ContentType, SubTopic } from '../types';
import '../styles/App.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function EditContentPage() {
  const { categoryId, subjectId } = useParams();
  const navigate = useNavigate();

  const [subject, setSubject] = useState<Subject | null>(null);
  const [originalSubject, setOriginalSubject] = useState<Subject | null>(null);
  const [activeContentType, setActiveContentType] = useState<string>('');
  const [activeSubTopic, setActiveSubTopic] = useState<string>('');
  const [expandedTopics, setExpandedTopics] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingContentType, setEditingContentType] = useState<string | null>(null);
  const [activeSubTopicActions, setActiveSubTopicActions] = useState<string>('');
  
  // Mobile sidebar states
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);

  useEffect(() => {
    if (subjectId) {
      fetchSubject();
    }
  }, [subjectId]);

  useEffect(() => {
    if (subject && subject.contentTypes.length > 0 && !activeContentType) {
      setActiveContentType(subject.contentTypes[0].id);
    }
  }, [subject]);

  const fetchSubject = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/categories/${categoryId}/subject/${subjectId}`);
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

  const getCurrentContentType = (): ContentType | undefined => {
    return subject?.contentTypes.find(ct => ct.id === activeContentType);
  };

  const findSubTopic = (topics: SubTopic[], id: string): SubTopic | null => {
    for (const topic of topics) {
      if (topic.id === id) return topic;
      if (topic.subTopics) {
        const found = findSubTopic(topic.subTopics, id);
        if (found) return found;
      }
    }
    return null;
  };

  const getCurrentSubTopic = (): SubTopic | null => {
    const contentType = getCurrentContentType();
    if (!contentType) return null;
    return findSubTopic(contentType.subTopics, activeSubTopic);
  };

  const toggleExpanded = (id: string) => {
    setExpandedTopics(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleAddContentType = () => {
    if (!subject) return;
    
    const name = prompt('Content Type Name (e.g., Notes, Videos):');
    if (!name) return;

    const newContentType: ContentType = {
      id: `content-${Date.now()}`,
      name,
      icon: '',
      type: '',
      order: subject.contentTypes.length,
      subTopics: []
    };

    setSubject({
      ...subject,
      contentTypes: [...subject.contentTypes, newContentType]
    });
    setHasChanges(true);
  };

  const handleEditContentType = (contentTypeId: string) => {
    if (!subject) return;
    
    const contentType = subject.contentTypes.find(ct => ct.id === contentTypeId);
    if (!contentType) return;

    const newName = prompt('Content Type Name:', contentType.name);
    if (!newName) return;

    const updatedContentTypes = subject.contentTypes.map(ct => 
      ct.id === contentTypeId 
        ? { ...ct, name: newName }
        : ct
    );

    setSubject({
      ...subject,
      contentTypes: updatedContentTypes
    });
    setHasChanges(true);
  };

  const handleDeleteContentType = (id: string) => {
    if (!subject) return;
    if (!window.confirm('Delete this content type and all its content?')) return;

    setSubject({
      ...subject,
      contentTypes: subject.contentTypes.filter(ct => ct.id !== id)
    });
    setHasChanges(true);

    if (activeContentType === id && subject.contentTypes.length > 0) {
      setActiveContentType(subject.contentTypes[0].id);
    }
  };

  const handleAddSubTopic = (parentId?: string) => {
    if (!subject) return;

    const name = prompt('Subtopic Name:');
    if (!name) return;

    const newSubTopic: SubTopic = {
      id: `topic-${Date.now()}`,
      name,
      subTopics: []
    };

    const contentTypeIndex = subject.contentTypes.findIndex(ct => ct.id === activeContentType);
    if (contentTypeIndex === -1) return;

    const updatedContentTypes = [...subject.contentTypes];
    const contentType = { ...updatedContentTypes[contentTypeIndex] };

    if (!parentId) {
      // Add to root
      contentType.subTopics = [...contentType.subTopics, newSubTopic];
    } else {
      // Add as child
      const addToParent = (topics: SubTopic[]): SubTopic[] => {
        return topics.map(topic => {
          if (topic.id === parentId) {
            return {
              ...topic,
              subTopics: [...(topic.subTopics || []), newSubTopic]
            };
          }
          if (topic.subTopics) {
            return {
              ...topic,
              subTopics: addToParent(topic.subTopics)
            };
          }
          return topic;
        });
      };
      contentType.subTopics = addToParent(contentType.subTopics);
    }

    updatedContentTypes[contentTypeIndex] = contentType;
    setSubject({ ...subject, contentTypes: updatedContentTypes });
    setHasChanges(true);
  };

  const handleDeleteSubTopic = (id: string) => {
    if (!subject) return;
    if (!window.confirm('Delete this topic and all its subtopics?')) return;

    const contentTypeIndex = subject.contentTypes.findIndex(ct => ct.id === activeContentType);
    if (contentTypeIndex === -1) return;

    const updatedContentTypes = [...subject.contentTypes];
    const contentType = { ...updatedContentTypes[contentTypeIndex] };

    const removeFromTopics = (topics: SubTopic[]): SubTopic[] => {
      return topics.filter(topic => topic.id !== id).map(topic => ({
        ...topic,
        subTopics: topic.subTopics ? removeFromTopics(topic.subTopics) : undefined
      }));
    };

    contentType.subTopics = removeFromTopics(contentType.subTopics);
    updatedContentTypes[contentTypeIndex] = contentType;
    setSubject({ ...subject, contentTypes: updatedContentTypes });
    setHasChanges(true);

    if (activeSubTopic === id) {
      setActiveSubTopic('');
    }
  };

  const handleUpdateSubTopicName = (id: string) => {
    if (!subject) return;

    const currentTopic = getCurrentSubTopic();
    if (!currentTopic) {
      const contentType = getCurrentContentType();
      if (!contentType) return;
      const topic = findSubTopic(contentType.subTopics, id);
      if (!topic) return;
      
      const newName = prompt('Topic Name:', topic.name);
      if (!newName) return;

      updateTopicName(id, newName);
    } else {
      const newName = prompt('Topic Name:', currentTopic.name);
      if (!newName) return;

      updateTopicName(id, newName);
    }
  };

  const updateTopicName = (id: string, newName: string) => {
    if (!subject) return;

    const contentTypeIndex = subject.contentTypes.findIndex(ct => ct.id === activeContentType);
    if (contentTypeIndex === -1) return;

    const updatedContentTypes = [...subject.contentTypes];
    const contentType = { ...updatedContentTypes[contentTypeIndex] };

    const updateInTopics = (topics: SubTopic[]): SubTopic[] => {
      return topics.map(topic => {
        if (topic.id === id) {
          return { ...topic, name: newName };
        }
        if (topic.subTopics) {
          return {
            ...topic,
            subTopics: updateInTopics(topic.subTopics)
          };
        }
        return topic;
      });
    };

    contentType.subTopics = updateInTopics(contentType.subTopics);
    updatedContentTypes[contentTypeIndex] = contentType;
    setSubject({ ...subject, contentTypes: updatedContentTypes });
    setHasChanges(true);
  };

  const handleUpdateContent = (field: string, value: any) => {
    if (!subject || !activeSubTopic) return;

    const contentTypeIndex = subject.contentTypes.findIndex(ct => ct.id === activeContentType);
    if (contentTypeIndex === -1) return;

    const updatedContentTypes = [...subject.contentTypes];
    const contentType = { ...updatedContentTypes[contentTypeIndex] };

    const updateInTopics = (topics: SubTopic[]): SubTopic[] => {
      return topics.map(topic => {
        if (topic.id === activeSubTopic) {
          return {
            ...topic,
            content: {
              ...topic.content,
              [field]: value
            }
          };
        }
        if (topic.subTopics) {
          return {
            ...topic,
            subTopics: updateInTopics(topic.subTopics)
          };
        }
        return topic;
      });
    };

    contentType.subTopics = updateInTopics(contentType.subTopics);
    updatedContentTypes[contentTypeIndex] = contentType;
    setSubject({ ...subject, contentTypes: updatedContentTypes });
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!subject || !hasChanges) return;

    try {
      setSaving(true);
      const response = await fetch(`${API_BASE_URL}/categories/${categoryId}/subject/${subjectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subject)
      });

      if (!response.ok) throw new Error('Failed to save');

      setOriginalSubject(JSON.parse(JSON.stringify(subject)));
      setHasChanges(false);
      alert('Changes saved successfully!');
    } catch (err) {
      console.error('Error:', err);
      alert('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (hasChanges) {
      if (!window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        return;
      }
    }
    navigate(`/category/${categoryId}`);
  };

  const renderSubTopics = (topics: SubTopic[], level: number = 0): JSX.Element => {
    return (
      <>
        {topics.map(topic => (
          <div key={topic.id} className="subtopic-item">
            <button
              className={`subtopic-button ${activeSubTopic === topic.id ? 'active' : ''} ${
                topic.subTopics && topic.subTopics.length > 0 ? 'has-children' : ''
              }`}
              onClick={() => {
                setActiveSubTopic(topic.id);
                setActiveSubTopicActions(topic.id === activeSubTopicActions ? '' : topic.id);
                // Close sidebar on mobile after selection
                setRightSidebarOpen(false);
              }}
            >
              <span>
                {topic.subTopics && topic.subTopics.length > 0 && (
                  <span 
                    className={`chevron ${expandedTopics.includes(topic.id) ? 'expanded' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpanded(topic.id);
                    }}
                  >
                    ▶
                  </span>
                )}
                {topic.name}
              </span>
            </button>
            {activeSubTopicActions === topic.id && (
              <div className="item-actions">
                <button className="icon-btn icon-btn-add btn-small" onClick={() => handleAddSubTopic(topic.id)}>
                  + Sub
                </button>
                <button className="icon-btn btn-small" onClick={() => handleUpdateSubTopicName(topic.id)}>
                  ✏️
                </button>
                <button className="icon-btn icon-btn-delete btn-small" onClick={() => handleDeleteSubTopic(topic.id)}>
                  🗑️
                </button>
              </div>
            )}
            {topic.subTopics && topic.subTopics.length > 0 && expandedTopics.includes(topic.id) && (
              <div className="subtopic-children">
                {renderSubTopics(topic.subTopics, level + 1)}
              </div>
            )}
          </div>
        ))}
      </>
    );
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading">Loading content editor...</div>
      </>
    );
  }

  if (!subject) {
    return (
      <>
        <Navbar />
        <div className="empty-state">Subject not found</div>
      </>
    );
  }

  const currentContentType = getCurrentContentType();
  const currentSubTopic = getCurrentSubTopic();

  return (
    <>
      <Navbar hasUnsavedChanges={hasChanges} />
      
      {/* Mobile Toggle Buttons */}
      <div className="mobile-sidebar-toggles">
        <button 
          className="mobile-toggle-btn"
          onClick={() => {
            setLeftSidebarOpen(!leftSidebarOpen);
            setRightSidebarOpen(false);
          }}
        >
          ☰ Content
        </button>
        <button 
          className="mobile-toggle-btn"
          onClick={() => {
            setRightSidebarOpen(!rightSidebarOpen);
            setLeftSidebarOpen(false);
          }}
        >
          ☰ Topics
        </button>
      </div>

      <div className="content-editor">
        {/* Left Sidebar - Content Types */}
        <div className={`editor-sidebar editor-sidebar-left ${leftSidebarOpen ? 'mobile-open' : ''}`}>
          <div className="editor-sidebar-header">
            <span>{subject.name}</span>
            <button 
              className="mobile-close-btn"
              onClick={() => setLeftSidebarOpen(false)}
            >
              ✕
            </button>
          </div>
          <div className="editor-sidebar-content">
            {subject.contentTypes.map(ct => (
              <div key={ct.id}>
                <div
                  className={`content-type-item ${activeContentType === ct.id ? 'active' : ''}`}
                  onClick={() => {
                    setActiveContentType(ct.id);
                    setLeftSidebarOpen(false); // Close on mobile after selection
                  }}
                >
                  {ct.icon && (
                    <img 
                      src={ct.icon} 
                      alt={ct.name}
                      style={{ 
                        width: '24px', 
                        height: '24px', 
                        objectFit: 'cover',
                        borderRadius: '4px',
                        marginRight: '0.5rem'
                      }}
                    />
                  )}
                  <span>{ct.name}</span>
                </div>
                {activeContentType === ct.id && (
                  <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                    <button 
                      className="icon-btn btn-small" 
                      onClick={() => handleEditContentType(ct.id)}
                      style={{ flex: 1 }}
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      className="icon-btn icon-btn-delete btn-small" 
                      onClick={() => handleDeleteContentType(ct.id)}
                      style={{ flex: 1 }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
            <button 
              className="btn btn-primary btn-small" 
              style={{ width: '100%', marginTop: '1rem' }}
              onClick={handleAddContentType}
            >
              + Add Content Type
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="editor-main">
          <div className="editor-main-header">
            <div>
              <h2 className="editor-title">
                {currentSubTopic?.name || 'Select a Topic'}
              </h2>
              <p style={{ color: '#666', marginTop: '0.5rem' }}>
                {currentContentType?.name || 'No content type selected'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn btn-secondary btn-small" onClick={handleBack}>
                ← Back
              </button>
              <button 
                className="btn btn-success btn-small" 
                onClick={handleSave}
                disabled={!hasChanges || saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          {currentSubTopic ? (
            <div className="content-form">
              
              <div className="form-group">
                <label className="form-label">Content Data</label>
                <textarea
                  className="form-textarea"
                  value={
                    typeof currentSubTopic.content?.data === 'string'
                      ? currentSubTopic.content.data
                      : JSON.stringify(currentSubTopic.content?.data || '', null, 2)
                  }
                  onChange={(e) => {
                    try {
                      // Try to parse as JSON if it looks like JSON
                      const value = e.target.value;
                      if (value.trim().startsWith('[') || value.trim().startsWith('{')) {
                        handleUpdateContent('data', JSON.parse(value));
                      } else {
                        handleUpdateContent('data', value);
                      }
                    } catch {
                      // If parsing fails, treat as string
                      handleUpdateContent('data', e.target.value);
                    }
                  }}
                  placeholder="Enter content here (text or JSON)"
                  style={{ minHeight: '100vh', fontFamily: 'monospace' }}
                />
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📝</div>
              <p>Select a topic from the right sidebar to edit its content</p>
            </div>
          )}
        </div>

        {/* Right Sidebar - Subtopics */}
        <div className={`editor-sidebar editor-sidebar-right ${rightSidebarOpen ? 'mobile-open' : ''}`}>
          <div className="editor-sidebar-header">
            <span>Topics</span>
            <button 
              className="mobile-close-btn"
              onClick={() => setRightSidebarOpen(false)}
            >
              ✕
            </button>
          </div>
          <div className="editor-sidebar-content">
            {currentContentType && currentContentType.subTopics.length > 0 ? (
              renderSubTopics(currentContentType.subTopics)
            ) : (
              <div className="empty-state">
                <p style={{ fontSize: '0.9rem' }}>No topics yet</p>
              </div>
            )}
            <button 
              className="btn btn-primary btn-small" 
              style={{ width: '100%', marginTop: '1rem' }}
              onClick={() => handleAddSubTopic()}
            >
              + Add Topic
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Overlay */}
      {(leftSidebarOpen || rightSidebarOpen) && (
        <div 
          className="mobile-overlay"
          onClick={() => {
            setLeftSidebarOpen(false);
            setRightSidebarOpen(false);
          }}
        />
      )}
    </>
  );
}