import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { ManageCoursesPage } from './pages/ManageCoursesPage';
import { EditCoursePage } from './pages/EditCoursePage';
import { EditContentPage } from './pages/EditContentPage';
import { AddCoursePage } from './pages/AddCoursePage';
import { ManageNotificationsPage } from './pages/ManageNotificationsPage';
import './styles/App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/manage-courses" element={<ManageCoursesPage />} />
        <Route path="/edit-course/:categoryId/:subjectId" element={<EditCoursePage />} />
        <Route path="/edit-content/:categoryId/:subjectId" element={<EditContentPage />} />
        <Route path="/add-course" element={<AddCoursePage />} />
        <Route path="/manage-notifications" element={<ManageNotificationsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
