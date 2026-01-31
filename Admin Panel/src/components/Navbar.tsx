import { Link, useLocation } from 'react-router-dom';
import '../styles/App.css';

interface NavbarProps {
  hasUnsavedChanges?: boolean;
}

export function Navbar({ hasUnsavedChanges = false }: NavbarProps) {
  const location = useLocation();

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        EduLearn Admin
      </Link>
      <div className="navbar-links">
        {hasUnsavedChanges && (
          <span className="unsaved-badge">Unsaved Changes</span>
        )}
        <Link 
          to="/" 
          className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
        >
          Home
        </Link>
        <Link 
          to="/manage-courses" 
          className={`nav-link ${location.pathname.includes('manage-courses') ? 'active' : ''}`}
        >
          Manage Courses
        </Link>
        <Link 
          to="/manage-notifications" 
          className={`nav-link ${location.pathname === '/manage-notifications' ? 'active' : ''}`}
        >
          Manage Notifications
        </Link>
      </div>
    </nav>
  );
}
