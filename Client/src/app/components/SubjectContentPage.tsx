import { useState,useEffect } from "react";
import { X, Menu, ChevronRight, BookOpen, Video, ClipboardList } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Skeleton } from "@/app/components/ui/skeleton";


interface SubTopic {
  content: any;
  id: string;
  name: string;
}


interface SubjectContent {
  subjectId: string;
  subjectName: string;
  subTopics: SubTopic[];
  content: {
    notes: {
      [subTopicId: string]: string;
    };
    videoLectures: {
      [subTopicId: string]: any[];
    };
    mockTests: {
      [subTopicId: string]: any[];
    };
  };
}

interface SubjectContentPageProps {
  subjectContent: SubjectContent;
  loading?: boolean;
}

// Fixed tabs - these will always be the same
const FIXED_TABS = [
  { id: 'notes', name: 'Notes', icon: <BookOpen className="h-5 w-5" /> },
  { id: 'videoLectures', name: 'Video Lectures', icon: <Video className="h-5 w-5" /> },
  { id: 'mockTests', name: 'Mock Tests', icon: <ClipboardList className="h-5 w-5" /> }
];

export function SubjectContentPage({
  subjectContent,
  loading = false,
}: SubjectContentPageProps) {
  const [activeTab, setActiveTab] = useState('notes');
  const [activeSubTopic, setActiveSubTopic] = useState(
    subjectContent.subTopics[0]?.id || ""
  );
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);

  useEffect(() => {
    if (subjectContent.subTopics.length > 0) {
      setActiveSubTopic(subjectContent.subTopics[0].id);
    }
  }, [subjectContent]);

const activeSubTopicData = subjectContent.subTopics.find(
  (s) => s.id === activeSubTopic
);
  // Get current content based on active tab and subtopic
 const getCurrentContent = () => {
  if (!activeSubTopicData) return null;

  const content = activeSubTopicData.content;

  switch (activeTab) {
    case "notes":
      return content?.notes || "No notes available yet.";

    case "videoLectures":
      return content?.videoLectures || [];

    case "mockTests":
      return content?.mockTests || [];

    default:
      return null;
  }
};


  const currentContent = getCurrentContent();

  if (loading) {
    return (
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Skeleton */}
        <div className="hidden md:flex md:flex-col w-64 border-r bg-white">
          <div className="p-4 border-b">
            <Skeleton className="h-8 w-32" />
          </div>
          <div className="flex-1 overflow-auto p-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full mb-2" />
            ))}
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="flex-1 overflow-auto p-4 md:p-6">
          <Skeleton className="h-10 w-48 mb-4" />
          <Skeleton className="h-6 w-full mb-2" />
          <Skeleton className="h-6 w-full mb-2" />
          <Skeleton className="h-6 w-3/4 mb-4" />
        </div>

        {/* Right Skeleton */}
        <div className="hidden md:flex md:flex-col w-64 border-l bg-white">
          <div className="p-4 border-b">
            <Skeleton className="h-8 w-32" />
          </div>
          <div className="flex-1 overflow-auto p-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-full mb-2" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b bg-white flex-shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setLeftSidebarOpen(true)}
        >
          <Menu className="h-4 w-4 mr-2" />
          {FIXED_TABS.find((t) => t.id === activeTab)?.name}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setRightSidebarOpen(true)}
        >
          {subjectContent.subTopics.find((s) => s.id === activeSubTopic)?.name}
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Left Sidebar - Content Tabs */}
      <aside
        className={`
          fixed md:relative inset-y-0 left-0 z-40 w-64 bg-white
          transform transition-transform duration-300 ease-in-out
          ${leftSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:flex md:flex-col md:border-r
          h-full
        `}
      >
        {/* Mobile close button */}
        <div className="flex items-center justify-between p-4 border-b md:hidden flex-shrink-0">
          <h3 className="font-semibold">Content Type</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLeftSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Desktop header */}
        <div className="hidden md:flex items-center p-4 border-b flex-shrink-0">
          <h3 className="font-semibold text-gray-900">Content Type</h3>
        </div>

        {/* Fixed Tabs */}
        <div className="flex-1 overflow-y-auto p-2 sidebar-scroll">
          {FIXED_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setLeftSidebarOpen(false);
              }}
              className={`
                w-full flex items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors mb-1
                ${
                  activeTab === tab.id
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }
              `}
            >
              {tab.icon}
              <span>{tab.name}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-gray-50 content-scroll">
        <div className="p-4 md:p-6 max-w-4xl mx-auto custom-scroll overflow-y-auto">
  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
    {subjectContent.subTopics.find((s) => s.id === activeSubTopic)?.name || "Content"}
  </h2>

  {/* Notes Tab */}
  {activeTab === 'notes' && (
    <div className="prose prose-sm md:prose-base max-w-none">
      <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border">
        {typeof currentContent === 'string' && currentContent.split("\n").map((paragraph, idx) =>
          paragraph.trim() ? (
            <p key={idx} className="mb-4 text-gray-700 leading-relaxed">
              {paragraph}
            </p>
          ) : null
        )}
      </div>
    </div>
  )}

  {/* Video Lectures Tab */}
  {activeTab === 'videoLectures' && (
    <div className="space-y-4">
      {Array.isArray(currentContent) && currentContent.length > 0 ? (
        currentContent.map((video: any, idx: number) => (
          <div key={idx} className="bg-white rounded-lg p-4 shadow-sm border flex gap-4">
            <img 
              src={video.thumbnail} 
              alt={video.title}
              className="w-40 h-24 object-cover rounded"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">{video.title}</h3>
              <p className="text-sm text-gray-600">Duration: {video.duration}</p>
              <a 
                href={video.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-2 inline-block text-blue-600 hover:text-blue-800 font-medium"
              >
                Watch Video →
              </a>
            </div>
          </div>
        ))
      ) : (
        <div className="bg-white rounded-lg p-8 shadow-sm border text-center">
          <Video className="h-12 w-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-500">No video lectures available for this topic yet.</p>
        </div>
      )}
    </div>
  )}

  {/* Mock Tests Tab */}
  {activeTab === 'mockTests' && (
    <div className="space-y-4">
      {Array.isArray(currentContent) && currentContent.length > 0 ? (
        currentContent.map((test: any, idx: number) => (
          <div key={idx} className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="font-semibold text-xl mb-2">{test.title}</h3>
            <div className="flex gap-4 text-sm text-gray-600 mb-4">
              <span>⏱️ {test.duration} minutes</span>
              <span>📊 {test.totalMarks} marks</span>
              <span>❓ {test.questions?.length || 0} questions</span>
            </div>
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Start Test
            </button>
          </div>
        ))
      ) : (
        <div className="bg-white rounded-lg p-8 shadow-sm border text-center">
          <ClipboardList className="h-12 w-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-500">No mock tests available for this topic yet.</p>
        </div>
      )}
    </div>
  )}
</div>
      </main>

      {/* Right Sidebar - Sub Topics */}
      <aside
        className={`
          fixed md:relative inset-y-0 right-0 z-40 w-64 bg-white
          transform transition-transform duration-300 ease-in-out
          ${rightSidebarOpen ? "translate-x-0" : "translate-x-full"}
          md:translate-x-0 md:flex md:flex-col md:border-l
          h-full
        `}
      >
        {/* Mobile close button */}
        <div className="flex items-center justify-between p-4 border-b md:hidden flex-shrink-0">
          <h3 className="font-semibold">Sub Topics</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setRightSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Desktop header */}
        <div className="hidden md:flex items-center p-4 border-b flex-shrink-0">
          <h3 className="font-semibold text-gray-900">Sub Topics</h3>
        </div>

        {/* Sub Topics List */}
        <div className="flex-1 overflow-y-auto p-2 sidebar-scroll">
          {subjectContent.subTopics.map((subTopic) => (
            <button
              key={subTopic.id}
              onClick={() => {
                setActiveSubTopic(subTopic.id);
                setRightSidebarOpen(false);
              }}
              className={`
                w-full rounded-lg px-4 py-3 text-left text-sm transition-colors mb-1
                ${
                  activeSubTopic === subTopic.id
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }
              `}
            >
              {subTopic.name}
            </button>
          ))}
        </div>
      </aside>

      {/* Mobile Overlays */}
      {(leftSidebarOpen || rightSidebarOpen) && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => {
            setLeftSidebarOpen(false);
            setRightSidebarOpen(false);
          }}
        />
      )}
    </div>
  );
}