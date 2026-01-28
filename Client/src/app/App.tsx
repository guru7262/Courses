/// <reference types="vite/client" />

declare module "*.css";

import { useState, useEffect } from "react";
import { Navbar } from "@/app/components/Navbar";
import { Footer } from "@/app/components/Footer";
import { SubjectSelectionPage } from "@/app/components/SubjectSelectionPage";
import { SubjectContentPage } from "@/app/components/SubjectContentPage";

type AppView = "subjects" | "content";

const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || "http://localhost:5000/api";

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>("subjects");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // Changed to true initially
  const [subjects, setSubjects] = useState([]);
  const [subjectContent, setSubjectContent] = useState(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("=== App mounted ===");
    console.log("API URL:", API_BASE_URL);
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    console.log("🔄 Fetching subjects...");
    try {
      setLoading(true);
      setError(null);
      
      const url = `${API_BASE_URL}/subjects`;
      console.log("Fetching from:", url);
      
      const response = await fetch(url);
      console.log("Response received:", response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("✅ Subjects loaded:", data);
      setSubjects(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error("❌ Error fetching subjects:", err);
      setError(`Failed to load subjects: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

const fetchSubjectContent = async (subjectId: string) => {
    console.log("🔄 Fetching content for:", subjectId);
    try {
      setLoading(true);
      setError(null);
      
      const url = `${API_BASE_URL}/subjects/${subjectId}`;
      console.log("Fetching from:", url);
      
      const response = await fetch(url);
      console.log("Response received:", response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("✅ Content loaded:", data);
      
      const transformedContent = {
        subjectId: data.id,
        subjectName: data.name,
        tabs: data.tabs || [],
        subTopics: data.subTopics || [],
        content: data.content || {}
      };
      
      console.log("Transformed:", transformedContent);
      setSubjectContent(transformedContent);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error("❌ Error fetching content:", err);
      setError(`Failed to load content: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSubject = async (subjectId: string) => {
    console.log("📌 Subject selected:", subjectId);
    setSelectedSubject(subjectId);
    await fetchSubjectContent(subjectId);
    setCurrentView("content");
  };

  const handleBackToSubjects = () => {
    console.log("⬅️ Back to subjects");
    setCurrentView("subjects");
    setSelectedSubject(null);
    setSubjectContent(null);
  };

  // Debug render
  console.log("=== Render ===");
  console.log("Loading:", loading);
  console.log("Subjects count:", subjects.length);
  console.log("Error:", error);
  console.log("Current view:", currentView);

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Navbar
        onMenuClick={handleBackToSubjects}
        showMenuButton={currentView === "content"}
      />
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mx-4 mt-4 rounded">
          <p className="font-bold">Error</p>
          <p>{error}</p>
          <p className="text-sm mt-2">Check console (F12) for details</p>
          <button 
            onClick={() => {
              console.log("🔄 Retry clicked");
              fetchSubjects();
            }}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

       <div className="flex-1 overflow-y-auto">
    {currentView === "subjects" && (
      <SubjectSelectionPage
        subjects={subjects}
        loading={loading}
        onSelectSubject={handleSelectSubject}
      />
    )}

    {currentView === "content" && subjectContent && (
      <SubjectContentPage
        subjectContent={subjectContent}
        loading={loading}
      />
    )}
  </div>

      <Footer />
    </div>
  );
}