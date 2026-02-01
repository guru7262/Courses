import { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import '../styles/App.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'announcement';
  priority: 'low' | 'medium' | 'high';
  link?: string | null;
  linkText?: string | null;
  icon?: string | null;
  expiresAt?: Date | null;
  isActive: boolean;
  targetAudience: 'all' | '12th' | '11th' | '10th' | '9th';
  bannerImage?: string | null;
  fullContent?: string | null;
  metadata?: {
    author?: string | null;
    category?: string | null;
    tags?: string[];
  };
  createdAt?: Date;
  updatedAt?: Date;
  order?: number;
}

export function ManageNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/notifications/all`);
      if (!response.ok) throw new Error('Failed to fetch notifications');
      const data = await response.json();
      // Sort by order field or creation date
      const sortedData = data.sort((a: Notification, b: Notification) => {
        if (a.order !== undefined && b.order !== undefined) {
          return a.order - b.order;
        }
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
      setNotifications(sortedData);
    } catch (err) {
      console.error('Error:', err);
      alert('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    const newNotification: Notification = {
      id: `notif-${Date.now()}`,
      title: '',
      message: '',
      type: 'info',
      priority: 'medium',
      link: null,
      linkText: null,
      icon: null,
      expiresAt: null,
      isActive: true,
      targetAudience: 'all',
      bannerImage: null,
      fullContent: null,
      metadata: {
        author: null,
        category: null,
        tags: []
      },
      order: 0
    };
    setSelectedNotification(newNotification);
    setIsEditing(true);
    setHasChanges(false);
  };

  const handleEdit = (notification: Notification) => {
    setSelectedNotification({ ...notification });
    setIsEditing(true);
    setHasChanges(false);
  };

  const handleInputChange = (field: string, value: any) => {
    if (!selectedNotification) return;
    
    if (field.startsWith('metadata.')) {
      const metadataField = field.split('.')[1];
      setSelectedNotification({
        ...selectedNotification,
        metadata: {
          ...selectedNotification.metadata,
          [metadataField]: value
        }
      });
    } else {
      setSelectedNotification({
        ...selectedNotification,
        [field]: value
      });
    }
    setHasChanges(true);
  };

  const handleImageUpload = (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedNotification) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleInputChange(field, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!selectedNotification) return;

    if (!selectedNotification.title || !selectedNotification.message) {
      alert('Title and message are required!');
      return;
    }

    try {
      const isNew = !notifications.find(n => n.id === selectedNotification.id);
      
      if (isNew) {
        // Reorder all notifications
        const updatedOrder = notifications.map((n, index) => ({
          ...n,
          order: index + 1
        }));
        
        const notificationToSave = {
          ...selectedNotification,
          order: 0
        };

        const response = await fetch(`${API_BASE_URL}/notifications`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(notificationToSave)
        });

        if (!response.ok) throw new Error('Failed to create notification');

        // Update order for existing notifications
        for (const notif of updatedOrder) {
          await fetch(`${API_BASE_URL}/notifications/${notif.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(notif)
          });
        }
      } else {
        const response = await fetch(`${API_BASE_URL}/notifications/${selectedNotification.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(selectedNotification)
        });

        if (!response.ok) throw new Error('Failed to update notification');
      }

      alert('Notification saved successfully!');
      setHasChanges(false);
      setIsEditing(false);
      setSelectedNotification(null);
      fetchNotifications();
    } catch (err) {
      console.error('Error:', err);
      alert('Failed to save notification');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this notification? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/notifications/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete notification');

      alert('Notification deleted successfully!');
      fetchNotifications();
    } catch (err) {
      console.error('Error:', err);
      alert('Failed to delete notification');
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;

    const newNotifications = [...notifications];
    [newNotifications[index - 1], newNotifications[index]] = [newNotifications[index], newNotifications[index - 1]];
    
    // Update order
    const updatedNotifications = newNotifications.map((n, i) => ({
      ...n,
      order: i
    }));

    setNotifications(updatedNotifications);

    // Save to backend
    try {
      for (const notif of updatedNotifications) {
        await fetch(`${API_BASE_URL}/notifications/${notif.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(notif)
        });
      }
    } catch (err) {
      console.error('Error updating order:', err);
      fetchNotifications(); // Revert on error
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index === notifications.length - 1) return;

    const newNotifications = [...notifications];
    [newNotifications[index], newNotifications[index + 1]] = [newNotifications[index + 1], newNotifications[index]];
    
    // Update order
    const updatedNotifications = newNotifications.map((n, i) => ({
      ...n,
      order: i
    }));

    setNotifications(updatedNotifications);

    // Save to backend
    try {
      for (const notif of updatedNotifications) {
        await fetch(`${API_BASE_URL}/notifications/${notif.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(notif)
        });
      }
    } catch (err) {
      console.error('Error updating order:', err);
      fetchNotifications(); // Revert on error
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (window.confirm('You have unsaved changes. Discard them?')) {
        setIsEditing(false);
        setSelectedNotification(null);
        setHasChanges(false);
      }
    } else {
      setIsEditing(false);
      setSelectedNotification(null);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading">Loading notifications...</div>
      </>
    );
  }

  return (
    <>
      <Navbar hasUnsavedChanges={hasChanges} />
      <div className="container">
        {!isEditing ? (
          <>
            <div className="page-header">
              <h1 className="page-title">Manage Notifications</h1>
              <button className="btn btn-primary btn-small" onClick={handleAddNew}>
                + Add New Notification
              </button>
            </div>

            <div className="notifications-list">
              {notifications.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">🔔</div>
                  <h2>No Notifications</h2>
                  <p style={{ marginTop: '1rem', color: '#666' }}>
                    Click "Add New Notification" to create your first notification.
                  </p>
                </div>
              ) : (
                notifications.map((notification, index) => (
                  <div key={notification.id} className="notification-item">
                    <div className="notification-content" onClick={() => handleEdit(notification)}>
                      <div className="notification-header">
                        <h3>{notification.title || 'Untitled'}</h3>
                        <div className="notification-badges">
                          <span className={`badge badge-${notification.type}`}>{notification.type}</span>
                          <span className={`badge badge-audience ${notification.isActive ? 'badge-active' : 'badge-inactive'}`}>{notification.isActive ? 'Active' : 'Inactive'}</span>
                        </div> 
                      </div>
                      <p className="notification-message">{notification.message}</p>
                      {notification.expiresAt && (
                        <p className="notification-expires">
                          Expires: {new Date(notification.expiresAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="notification-actions">
                      <button
                        className="icon-btn btn-small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveUp(index);
                        }}
                        disabled={index === 0}
                        title="Move up"
                      >
                        ↑
                      </button>
                      <button
                        className="icon-btn btn-small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveDown(index);
                        }}
                        disabled={index === notifications.length - 1}
                        title="Move down"
                      >
                        ↓
                      </button>
                      <button
                        className="icon-btn icon-btn-delete btn-small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(notification.id);
                        }}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <>
            <div className="page-header">
              <h1 className="page-title">
                {notifications.find(n => n.id === selectedNotification?.id) ? 'Edit Notification' : 'New Notification'}
              </h1>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn btn-secondary btn-small" onClick={handleCancel}>
                  Cancel
                </button>
                <button className="btn btn-success btn-small" onClick={handleSave}>
                  Save Notification
                </button>
              </div>
            </div>

            <div className="content-form">
              <h2 style={{ marginBottom: '1.5rem' }}>Basic Information</h2>

              <div className="form-group">
                <label className="form-label">Title *</label>
                <input
                  type="text"
                  className="form-input"
                  value={selectedNotification?.title || ''}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Notification title"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Message *</label>
                <textarea
                  className="form-textarea"
                  value={selectedNotification?.message || ''}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  placeholder="Short notification message"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Full Content (Optional)</label>
                <textarea
                  className="form-textarea"
                  value={selectedNotification?.fullContent || ''}
                  onChange={(e) => handleInputChange('fullContent', e.target.value)}
                  placeholder="Detailed content for expanded view"
                  rows={6}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Type *</label>
                  <select
                    className="form-select"
                    value={selectedNotification?.type || 'info'}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                  >
                    <option value="info">Info</option>
                    <option value="success">Success</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                    <option value="announcement">Announcement</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Priority *</label>
                  <select
                    className="form-select"
                    value={selectedNotification?.priority || 'medium'}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Target Audience *</label>
                <select
                  className="form-select"
                  value={selectedNotification?.targetAudience || 'all'}
                  onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="12th">12th Grade</option>
                  <option value="11th">11th Grade</option>
                  <option value="10th">10th Grade</option>
                  <option value="9th">9th Grade</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Link (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={selectedNotification?.link || ''}
                    onChange={(e) => handleInputChange('link', e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Link Text (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={selectedNotification?.linkText || ''}
                    onChange={(e) => handleInputChange('linkText', e.target.value)}
                    placeholder="Learn More"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Expiration Date (Optional)</label>
                <input
                  type="datetime-local"
                  className="form-input1"
                  value={
                    selectedNotification?.expiresAt
                      ? new Date(selectedNotification.expiresAt).toISOString().slice(0, 16)
                      : ''
                  }
                  onChange={(e) => handleInputChange('expiresAt', e.target.value ? new Date(e.target.value) : null)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Icon (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  value={selectedNotification?.icon || ''}
                  onChange={(e) => handleInputChange('icon', e.target.value)}
                  placeholder="📢 or emoji/icon"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Banner Image (Optional)</label>
                <div className="image-upload" onClick={() => document.getElementById('banner-upload')?.click()}>
                  {selectedNotification?.bannerImage ? (
                    <img src={selectedNotification.bannerImage} alt="Banner" className="image-preview" />
                  ) : (
                    <div>
                      <p>Click to upload banner image</p>
                      <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
                        Recommended: 1200x400px
                      </p>
                    </div>
                  )}
                </div>
                <input
                  id="banner-upload"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => handleImageUpload('bannerImage', e)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={selectedNotification?.isActive || false}
                    onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  />
                  Active
                </label>
              </div>

              <div className="form-actions">
                <button className="btn btn-secondary btn-small" onClick={handleCancel}>
                  Cancel
                </button>
                <button className="btn btn-success btn-small" onClick={handleSave}>
                  Save Notification
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}