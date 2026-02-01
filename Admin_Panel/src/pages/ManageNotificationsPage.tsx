import { Navbar } from '../components/Navbar';
import '../styles/App.css';

export function ManageNotificationsPage() {
  return (
    <>
      <Navbar />
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Manage Notifications</h1>
        </div>

        <div className="empty-state">
          <div className="empty-state-icon">🔔</div>
          <h2>Notifications Management</h2>
          <p style={{ marginTop: '1rem', color: '#666' }}>
            This feature will be implemented later.
          </p>
        </div>
      </div>
    </>
  );
}
