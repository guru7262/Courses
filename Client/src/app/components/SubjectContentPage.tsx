import { useState, useEffect } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { X, Menu, ChevronRight, BookOpen, Video, ClipboardList, Link as LinkIcon, HelpCircle } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Skeleton } from "@/app/components/ui/skeleton";
import { Footer } from "@/app/components/Footer";
import { PathwayBanner } from '@/app/components/PathwayBanner';
interface SubTopic {
  id: string;
  name: string;
  content?: {
    type: 'notes' | 'videos' | 'links' | 'mockTests' | 'mcqs' | string;
    data: any;
  };
  subTopics?: SubTopic[];
}

interface ContentType {
  id: string;
  name: string;
  icon?: string;
  type: 'notes' | 'videos' | 'links' | 'mockTests' | 'mcqs' | string;
  order: number;
  subTopics: SubTopic[]; // Each content type has its own subtopic tree
}

interface SubjectContent {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  contentTypes: ContentType[];
  category: {
    id: string;
    name: string;
  };
}

interface SubjectContentPageProps {
  subjectContent: SubjectContent;
  loading?: boolean;
}

const getContentTypeIcon = (type: string) => {
  switch (type) {
    case 'notes': return <BookOpen className="h-5 w-5" />;
    case 'videos': return <Video className="h-5 w-5" />;
    case 'links': return <LinkIcon className="h-5 w-5" />;
    case 'mockTests': return <ClipboardList className="h-5 w-5" />;
    case 'mcqs': return <HelpCircle className="h-5 w-5" />;
    default: return <BookOpen className="h-5 w-5" />;
  }
};

export function SubjectContentPage({
  subjectContent,
  loading = false,
}: SubjectContentPageProps) {
  const [searchParams] = useSearchParams();

  const [activeContentType, setActiveContentType] = useState(
    subjectContent?.contentTypes?.[0]?.id || ""
  );
  const [activeSubTopic, setActiveSubTopic] = useState("");
  
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [expandedSubTopics, setExpandedSubTopics] = useState<string[]>([]);

  // Get current content type's subtopics
  const currentContentType = subjectContent?.contentTypes?.find(ct => ct.id === activeContentType);
  const currentSubTopics = currentContentType?.subTopics || [];

const [pathway, setPathway] = useState(null);
   const [pathwayLoading, setPathwayLoading] = useState(true);

  // Sync state if subjectContent loads after initial render
  useEffect(() => {
    if (subjectContent?.contentTypes?.length > 0 && !activeContentType) {
      const tabFromUrl = searchParams.get('tab');
      const contentType = subjectContent.contentTypes.find(ct => ct.id === tabFromUrl);
      setActiveContentType(contentType ? (tabFromUrl as string) : subjectContent.contentTypes[0].id);
    }
  }, [subjectContent, searchParams, activeContentType]);

useEffect(() => {
     const token = localStorage.getItem('token');
     if (!token) { setPathwayLoading(false); return; }
     fetch(`${API_BASE_URL}/pathway`, {
       headers: { Authorization: `Bearer ${token}` }
     })
       .then(r => r.ok ? r.json() : null)
       .then(d => setPathway(d?.pathway ?? null))
       .finally(() => setPathwayLoading(false));
   }, []);


  // Set first subtopic when content type changes
  useEffect(() => {
    if (currentSubTopics.length > 0) {
      // Try to find matching topic in new content type based on current selection
      const currentTopic = activeSubTopic ? findSubTopic(currentSubTopics, activeSubTopic) : null;
      
      if (currentTopic) {
        // Already in the right topic, do nothing
        return;
      }
      
      // Try to match by hierarchy: look for same name in current path
      const matchedTopic = findMatchingTopicByName(currentSubTopics, activeSubTopic);
      
      if (matchedTopic) {
        setActiveSubTopic(matchedTopic.id);
      } else {
        // No match found, find first topic with content
        const firstTopicWithContent = findFirstTopicWithContent(currentSubTopics);
        if (firstTopicWithContent) {
          setActiveSubTopic(firstTopicWithContent.id);
        } else {
          setActiveSubTopic(currentSubTopics[0].id);
        }
      }
    } else {
      setActiveSubTopic("");
    }
  }, [activeContentType, currentSubTopics]);

  // Helper to find first topic with content
  const findFirstTopicWithContent = (topics: SubTopic[]): SubTopic | null => {
    for (const topic of topics) {
      if (topic.content) return topic;
      if (topic.subTopics) {
        const found = findFirstTopicWithContent(topic.subTopics);
        if (found) return found;
      }
    }
    return null;
  };

  // Helper to find matching topic by hierarchy path
  const findMatchingTopicByName = (topics: SubTopic[], currentTopicId: string): SubTopic | null => {
    // First, try to find the exact same topic by name in the previous content type
    const previousContentType = subjectContent?.contentTypes?.find(ct => 
      ct.subTopics.some(st => findSubTopic([st], currentTopicId))
    );
    
    if (!previousContentType) return null;
    
    const previousTopic = findSubTopic(previousContentType.subTopics, currentTopicId);
    if (!previousTopic) return null;
    
    // Build path of names from root to current topic
    const path = buildTopicPath(previousContentType.subTopics, currentTopicId);
    if (path.length === 0) return null;
    
    // Try to match the deepest level first, then work up
    for (let i = path.length - 1; i >= 0; i--) {
      const matchedTopic = findTopicByNamePath(topics, path.slice(0, i + 1));
      if (matchedTopic) {
        // If matched topic has content, use it
        if (matchedTopic.content) {
          return matchedTopic;
        }
        // Otherwise, try to find first child with content
        if (matchedTopic.subTopics) {
          const firstChild = findFirstTopicWithContent(matchedTopic.subTopics);
          if (firstChild) return firstChild;
        }
        // If no content in children, return the matched topic anyway
        return matchedTopic;
      }
    }
    
    return null;
  };
  
  // Build path of topic names from root to target
  const buildTopicPath = (topics: SubTopic[], targetId: string, currentPath: string[] = []): string[] => {
    for (const topic of topics) {
      const newPath = [...currentPath, topic.name];
      if (topic.id === targetId) {
        return newPath;
      }
      if (topic.subTopics) {
        const found = buildTopicPath(topic.subTopics, targetId, newPath);
        if (found.length > 0) return found;
      }
    }
    return [];
  };
  
  // Find topic by matching path of names
  const findTopicByNamePath = (topics: SubTopic[], namePath: string[]): SubTopic | null => {
    if (namePath.length === 0) return null;
    
    const [firstName, ...restPath] = namePath;
    const topic = topics.find(t => t.name === firstName);
    
    if (!topic) return null;
    if (restPath.length === 0) return topic;
    if (!topic.subTopics) return null;
    
    return findTopicByNamePath(topic.subTopics, restPath);
  };

  const findSubTopic = (topics: SubTopic[] = [], id: string): SubTopic | null => {
    for (const topic of topics) {
      if (topic.id === id) return topic;
      if (topic.subTopics) {
        const found = findSubTopic(topic.subTopics, id);
        if (found) return found;
      }
    }
    return null;
  };

  const activeSubTopicData = findSubTopic(currentSubTopics, activeSubTopic);
  const activeContentTypeData = currentContentType;

  const toggleSubTopicExpansion = (topicId: string) => {
    setExpandedSubTopics(prev =>
      prev.includes(topicId)
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  const renderSubTopics = (topics: SubTopic[] = [], level: number = 0) => {
    return topics.map((subTopic) => (
      <div key={subTopic.id}>
        <div
          className={`
            w-full rounded-lg px-4 py-3 text-left text-sm transition-colors mb-1 flex items-center justify-between
            ${activeSubTopic === subTopic.id
              ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
              : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50"
            }
          `}
          style={{ paddingLeft: `${16 + level * 16}px` }}
        >
          <span 
            className="flex-1 cursor-pointer"
            onClick={() => {
              setActiveSubTopic(subTopic.id);
              setRightSidebarOpen(false);
              // Also expand if it has subtopics
              if (subTopic.subTopics && subTopic.subTopics.length > 0) {
                toggleSubTopicExpansion(subTopic.id);
              }
            }}
          >
            {subTopic.name}
          </span>
          {subTopic.subTopics && subTopic.subTopics.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleSubTopicExpansion(subTopic.id);
              }}
              className="flex-shrink-0 p-1 hover:bg-sidebar-accent/30 rounded transition-colors"
              aria-label={expandedSubTopics.includes(subTopic.id) ? "Collapse" : "Expand"}
            >
              <ChevronRight
                className={`h-4 w-4 transition-transform ${
                  expandedSubTopics.includes(subTopic.id) ? 'rotate-90' : ''
                }`}
              />
            </button>
          )}
        </div>
        {subTopic.subTopics && 
         subTopic.subTopics.length > 0 && 
         expandedSubTopics.includes(subTopic.id) && (
          <div className="ml-2">
            {renderSubTopics(subTopic.subTopics, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  const renderContent = () => {
    if (!activeSubTopicData?.content) {
      return (
        <div className="bg-card text-card-foreground rounded-lg p-8 shadow-sm border border-border text-center">
          <p className="text-muted-foreground">No content available for this topic yet.</p>
        </div>
      );
    }

    const { type, data } = activeSubTopicData.content;

    switch (type) {
      case 'notes':
        return (
          <div className="prose prose-sm md:prose-base max-w-none dark:prose-invert">
            <div className="bg-card text-card-foreground rounded-lg p-4 md:p-6 shadow-sm border border-border">
              {typeof data === 'string' && data.split("\n").map((paragraph, idx) =>
                paragraph.trim() ? (
                  <p key={idx} className="mb-4 leading-relaxed">
                    {paragraph}
                  </p>
                ) : null
              )}
            </div>
          </div>
        );

      case 'videos':
        return (
          <div className="space-y-4">
            {Array.isArray(data) && data.length > 0 ? (
              data.map((video: any, idx: number) => (
                <div key={idx} className="bg-card text-card-foreground rounded-lg p-4 shadow-sm border border-border flex gap-4">
                  <img src={video.thumbnail} alt={video.title} className="w-40 h-24 object-cover rounded" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{video.title}</h3>
                    <p className="text-sm text-muted-foreground">Duration: {video.duration}</p>
                    <a href={video.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-primary hover:underline font-medium">
                      Watch Video →
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-card text-card-foreground rounded-lg p-8 shadow-sm border border-border text-center">
                <Video className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No videos available yet.</p>
              </div>
            )}
          </div>
        );

      case 'links':
        return (
          <div className="space-y-3">
            {Array.isArray(data) && data.length > 0 ? (
              data.map((link: any, idx: number) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-card text-card-foreground rounded-lg p-4 shadow-sm border border-border hover:shadow-md transition-shadow"
                >
                  <h4 className="font-medium text-foreground mb-1">{link.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{link.description}</p>
                  <span className="text-xs text-primary hover:underline">
                    {link.url} →
                  </span>
                </a>
              ))
            ) : (
              <div className="bg-card text-card-foreground rounded-lg p-8 shadow-sm border border-border text-center">
                <LinkIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No links available yet.</p>
              </div>
            )}
          </div>
        );

      case 'mockTests':
        return (
          <div className="space-y-4">
            {Array.isArray(data) && data.length > 0 ? (
              data.map((test: any, idx: number) => (
                <div key={idx} className="bg-card text-card-foreground rounded-lg p-6 shadow-sm border border-border">
                  <h3 className="font-semibold text-xl mb-2">{test.title}</h3>
                  <div className="flex gap-4 text-sm text-muted-foreground mb-4">
                    <span>⏱️ {test.duration} minutes</span>
                    <span>📊 {test.totalMarks} marks</span>
                    <span>❓ {test.questions?.length || 0} questions</span>
                  </div>
                  <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition">
                    Start Test
                  </button>
                </div>
              ))
            ) : (
              <div className="bg-card text-card-foreground rounded-lg p-8 shadow-sm border border-border text-center">
                <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No mock tests available yet.</p>
              </div>
            )}
          </div>
        );

      case 'mcqs':
        return (
          <div className="space-y-4">
            {Array.isArray(data) && data.length > 0 ? (
              data.map((mcq: any, idx: number) => (
                <div key={idx} className="bg-card text-card-foreground rounded-lg p-4 shadow-sm border border-border">
                  <h4 className="font-medium mb-3">Q{idx + 1}. {mcq.question}</h4>
                  <div className="space-y-2">
                    {mcq.options?.map((option: string, optIdx: number) => (
                      <div key={optIdx} className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full border border-border flex items-center justify-center text-xs">
                          {String.fromCharCode(65 + optIdx)}
                        </div>
                        <span className="text-sm">{option}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-card text-card-foreground rounded-lg p-8 shadow-sm border border-border text-center">
                <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No MCQs available yet.</p>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="bg-card text-card-foreground rounded-lg p-8 shadow-sm border border-border text-center">
            <p className="text-muted-foreground">Unsupported content type: {type}</p>
          </div>
        );
    }
  };

  // Skeleton guard
  if (loading || !subjectContent) {
    return (
      <>
        <div className="flex flex-col md:flex-row">
          <div className="hidden md:flex md:flex-col w-64 border-r border-border bg-background md:h-screen md:sticky md:top-0">
            <div className="p-4 border-b border-border">
              <Skeleton className="h-8 w-32" />
            </div>
            <div className="flex-1 overflow-auto p-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full mb-2" />
              ))}
            </div>
          </div>
          <div className="flex-1 p-4 md:p-6 bg-background">
            <Skeleton className="h-10 w-48 mb-4" />
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-6 w-3/4 mb-4" />
          </div>
          <div className="hidden md:flex md:flex-col w-64 border-l border-border bg-background md:h-screen md:sticky md:top-0">
            <div className="p-4 border-b border-border">
              <Skeleton className="h-8 w-32" />
            </div>
            <div className="flex-1 overflow-auto p-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full mb-2" />
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    
    <>
    <PathwayBanner
         pathway={pathway}
         loading={pathwayLoading}
         onViewAll={() => Navigate('/pathway')}
         onNavigate={(subjectId, topicId, contentTypeId) =>
           Navigate(`/subject/${subjectId}?topic=${topicId}${contentTypeId ? `&tab=${contentTypeId}` : ''}`)
         }
       />
      <div className="flex flex-col md:flex-row relative bg-background text-foreground">
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-background flex-shrink-0 sticky top-0 z-20">
          <Button variant="outline" size="sm" onClick={() => setLeftSidebarOpen(true)}>
            <Menu className="h-4 w-4 mr-2" />
            {activeContentTypeData?.name || 'Content'}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setRightSidebarOpen(true)}>
            {activeSubTopicData?.name || 'Topics'}
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        <aside
          className={`
            fixed md:sticky md:top-0 inset-y-0 left-0 z-40 w-64 bg-sidebar
            transform transition-transform duration-300 ease-in-out
            ${leftSidebarOpen ? "translate-x-0" : "-translate-x-full"}
            md:translate-x-0 md:flex md:flex-col md:border-r md:border-sidebar-border
            md:h-screen
          `}
        >
          <div className="flex items-center justify-between p-4 border-b border-sidebar-border md:hidden flex-shrink-0">
            <h3 className="font-semibold text-sidebar-foreground">{subjectContent.name}</h3>
            <Button variant="ghost" size="icon" onClick={() => setLeftSidebarOpen(false)}>
              <X className="h-5 w-5 text-sidebar-foreground" />
            </Button>
          </div>
          <div className="hidden md:flex items-center p-4 border-b border-sidebar-border flex-shrink-0">
            <h3 className="font-semibold text-sidebar-foreground">{subjectContent.name}</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2 sidebar-scroll">
            {subjectContent.contentTypes?.map((contentType) => (
              <button
                key={contentType.id}
                onClick={() => {
                  setActiveContentType(contentType.id);
                  setLeftSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors mb-1
                  ${activeContentType === contentType.id
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50"
                  }
                `}
              >
                {contentType.icon ? (
                  <span className="text-xl">{contentType.icon}</span>
                ) : (
                  getContentTypeIcon(contentType.type)
                )}
                <span>{contentType.name}</span>
              </button>
            ))}
          </div>
        </aside>

        <main className="flex-1 bg-background md:mt-0">
          <div className="p-4 md:p-6 max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
              {activeSubTopicData?.name || "Select a Topic"}
            </h2>
            {renderContent()}
          </div>
        </main>

        <aside
          className={`
            fixed md:sticky md:top-0 inset-y-0 right-0 z-40 w-64 bg-sidebar
            transform transition-transform duration-300 ease-in-out
            ${rightSidebarOpen ? "translate-x-0" : "translate-x-full"}
            md:translate-x-0 md:flex md:flex-col md:border-l md:border-sidebar-border
            md:h-screen
          `}
        >
          <div className="flex items-center justify-between p-4 border-b border-sidebar-border md:hidden flex-shrink-0">
            <h3 className="font-semibold text-sidebar-foreground">Topics</h3>
            <Button variant="ghost" size="icon" onClick={() => setRightSidebarOpen(false)}>
              <X className="h-5 w-5 text-sidebar-foreground" />
            </Button>
          </div>
          <div className="hidden md:flex items-center p-4 border-b border-sidebar-border flex-shrink-0">
            <h3 className="font-semibold text-sidebar-foreground">Topics</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2 sidebar-scroll">
            {currentSubTopics.length > 0 ? (
              renderSubTopics(currentSubTopics)
            ) : (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No topics available
              </div>
            )}
          </div>
        </aside>

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
      <Footer />
    </>
  );
}