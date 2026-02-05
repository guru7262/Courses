/// <reference types="vite/client" />

declare module "*.css";

import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useParams } from "react-router-dom";
import { Navbar } from "@/app/components/Navbar";
import { Footer } from "@/app/components/Footer";
import { SubjectSelectionPage } from "@/app/components/SubjectSelectionPage";
import { SubjectContentPage } from "@/app/components/SubjectContentPage";
import { ThemeProvider } from "@/app/components/ThemeProvider";
import { NotificationBanner } from "@/app/components/notifications/NotificationBanner";
import { NotificationsPage } from "@/app/components/notifications/NotificationsPage";

// Auth components
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import { ForgotPassword } from "./components/ForgotPassword";
import { ResetPassword } from "./components/ResetPassword";
import { VerifyEmail } from "./components/VerifyEmail";

const API_BASE_URL = (import.meta.env.VITE_API_URL as string)

function SubjectsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("=== SubjectsPage mounted ===");
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    console.log("📄 Fetching categories...");
    try {
      setLoading(true);
      setError(null);
      
      const url = `${API_BASE_URL}/categories`;
      console.log("Fetching from:", url);
      
      const response = await fetch(url);
      console.log("Response received:", response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("✅ Categories loaded:", data);
      setCategories(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error("❌ Error fetching categories:", err);
      setError(`Failed to load categories: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSubject = (subjectId: string) => {
    console.log("📌 Subject selected:", subjectId);
    
    // Check if user clicked Notes/Videos/Mock Tests in navbar
    const selectedContentType = localStorage.getItem('selectedContentType');
    
    if (selectedContentType) {
      console.log("🎯 Content type selected:", selectedContentType);
      // Navigate with the tab parameter
      navigate(`/subject/${subjectId}?tab=${selectedContentType}`);
      // Clear the stored content type after use
      localStorage.removeItem('selectedContentType');
    } else {
      // Normal navigation without tab parameter
      navigate(`/subject/${subjectId}`);
    }
  };

  return (
    <>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mx-4 mt-4 rounded">
          <p className="font-bold">Error</p>
          <p>{error}</p>
          <p className="text-sm mt-2">Check console (F12) for details</p>
          <button 
            onClick={() => {
              console.log("🔄 Retry clicked");
              fetchCategories();
            }}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      <SubjectSelectionPage
        categories={categories}
        loading={loading}
        onSelectSubject={handleSelectSubject}
      />
    </>
  );
}

function SubjectDetailPage() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subjectContent, setSubjectContent] = useState(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("=== SubjectDetailPage mounted ===");
    console.log("Subject ID from URL:", subjectId);
    if (subjectId) {
      fetchSubjectContent(subjectId);
    }
  }, [subjectId]);

  const fetchSubjectContent = async (id: string) => {
    console.log("📄 Fetching content for:", id);
    try {
      setLoading(true);
      setError(null);
      
      const url = `${API_BASE_URL}/categories/subject/${id}`;
      console.log("Fetching from:", url);
      
      const response = await fetch(url);
      console.log("Response received:", response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("✅ Content loaded:", data);
      
      // Data is now in the correct format - no transformation needed
      setSubjectContent(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error("❌ Error fetching content:", err);
      setError(`Failed to load content: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToSubjects = () => {
    console.log("⬅️ Back to subjects");
    navigate('/');
  };

  return (
    <>
      <Navbar
        onMenuClick={handleBackToSubjects}
        showMenuButton={true}
      />

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mx-4 mt-4 rounded">
          <p className="font-bold">Error</p>
          <p>{error}</p>
          <p className="text-sm mt-2">Check console (F12) for details</p>
          <button 
            onClick={() => {
              console.log("🔄 Retry clicked");
              if (subjectId) fetchSubjectContent(subjectId);
            }}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {subjectContent && (
          <SubjectContentPage
            subjectContent={subjectContent}
            loading={loading}
          />
        )}
      </div>
    </>
  );
}

export default function App() {
  console.log("=== App Component Rendered ===");
  console.log("API URL:", API_BASE_URL);

  return (
    <ThemeProvider defaultTheme="light" storageKey="edulearn-theme">
      <AuthProvider>
        <BrowserRouter>
          <div className="flex h-screen flex-col overflow-hidden">
            <Routes>
              {/* Public Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/verify-email" element={<VerifyEmail />} />

              {/* Protected Routes */}
              <Route 
                path="/" 
                element={
                    <>
                      <Navbar showMenuButton={false} />
                      <NotificationBanner apiUrl={API_BASE_URL} />
                      <div className="flex-1 overflow-y-auto">
                        <SubjectsPage />
                      </div>
                    </>
                  
                } 
              />
              
              <Route 
                path="/subject/:subjectId" 
                element={
                
                    <SubjectDetailPage />
                  
                } 
              />
              
              <Route 
                path="/notifications" 
                element={
                  
                    <>
                      <Navbar showMenuButton={false} />
                      <div className="flex-1 overflow-y-auto">
                        <NotificationsPage apiUrl={API_BASE_URL} />
                      </div>
                    </>
                  
                } 
              />
            </Routes>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
