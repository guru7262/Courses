import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { X, Menu, ChevronRight, BookOpen, Video, ClipboardList, Link as LinkIcon, HelpCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Skeleton } from "@/app/components/ui/skeleton";
import { Footer } from "@/app/components/Footer";
import { PathwayBanner } from '@/app/components/PathwayBanner';
interface SubTopic {
  id: string;
  name: string;
  content?: {
    type?: 'notes' | 'videos' | 'links' | 'mockTests' | 'mcqs' | string;
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

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const getContentTypeIcon = (type: string) => {
  return null;
};

// Interactive MCQ renderer component
function McqRenderer({
  questions,
  onSubmitResult
}: {
  questions: { question: string; options: string[]; answer: string; explanation: string; topicId?: string }[],
  onSubmitResult?: (score: number, total: number, wrongTopicIds: string[]) => void
}) {
  const [selected, setSelected] = useState<(string | null)[]>(Array(questions.length).fill(null));
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (qIdx: number, letter: string) => {
    if (submitted) return;
    setSelected(prev => { const n = [...prev]; n[qIdx] = letter; return n; });
  };

  const score = questions.filter((q, i) => selected[i] === q.answer).length;
  const letters = ['A', 'B', 'C', 'D', 'E'];

  const reset = () => {
    setSelected(Array(questions.length).fill(null));
    setSubmitted(false);
  };

  return (
    <div className="space-y-6">
      {/* Score bar shown after submit */}
      {submitted && (
        <div className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="font-semibold text-lg">Score: {score} / {questions.length}</p>
            <p className="text-sm text-muted-foreground">
            </p>
          </div>
          <button onClick={reset} className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-accent transition">
            Try Again
          </button>
        </div>
      )}

      {questions.map((q, qIdx) => {
        const sel = selected[qIdx];
        const correct = q.answer;
        return (
          <div key={qIdx} className="bg-card border border-border rounded-lg p-5 shadow-sm">
            <p className="font-medium mb-4">Q{qIdx + 1}. {q.question}</p>
            <div className="space-y-2">
              {q.options.map((opt, oIdx) => {
                const letter = letters[oIdx];
                const isSelected = sel === letter;
                const isCorrect = letter === correct;
                let optClass = 'flex items-center gap-3 w-full px-4 py-3 rounded-lg border text-sm text-left transition-colors ';
                if (!submitted) {
                  optClass += isSelected
                    ? 'border-primary bg-primary/10 text-foreground'
                    : 'border-border hover:bg-accent text-foreground cursor-pointer';
                } else {
                  if (isCorrect) optClass += 'border-green-500 bg-green-500/10 text-green-700 dark:text-green-400';
                  else if (isSelected && !isCorrect) optClass += 'border-red-500 bg-red-500/10 text-red-700 dark:text-red-400';
                  else optClass += 'border-border text-muted-foreground';
                }
                return (
                  <button key={oIdx} className={optClass} onClick={() => handleSelect(qIdx, letter)} disabled={submitted}>
                    <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {letter}
                    </span>
                    {opt}
                    {submitted && isCorrect && <CheckCircle2 className="ml-auto h-4 w-4 text-green-500 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
            {submitted && q.explanation && (
              <p className="mt-3 text-sm text-muted-foreground bg-muted rounded-lg px-4 py-2">
                {q.explanation}
              </p>
            )}
          </div>
        );
      })}

      {!submitted && (
        <button
          onClick={() => {
            setSubmitted(true);
            if (onSubmitResult) {
              const wrongTopicIds = questions
                .map((q, i) => (selected[i] !== q.answer ? q.topicId : null))
                .filter(Boolean) as string[];
              onSubmitResult(score, questions.length, wrongTopicIds);
            }
          }}
          disabled={selected.some(s => s === null)}
          className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Submit Answers
        </button>
      )}
    </div>
  );
}

export function SubjectContentPage({
  subjectContent,
  loading = false,
}: SubjectContentPageProps) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tabFromUrl = searchParams.get('tab');
  const initialTab =
    (tabFromUrl && subjectContent?.contentTypes?.find(ct => ct.id === tabFromUrl)?.id) ||
    subjectContent?.contentTypes?.[0]?.id || "";

  const [activeContentType, setActiveContentType] = useState(initialTab);
  const [activeSubTopic, setActiveSubTopic] = useState("");

  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [expandedSubTopics, setExpandedSubTopics] = useState<string[]>([]);
  const [completedTopics, setCompletedTopics] = useState<string[]>([]);

  // Get current content type's subtopics
  const currentContentType = subjectContent?.contentTypes?.find(ct => ct.id === activeContentType);
  const currentSubTopics = currentContentType?.subTopics || [];

  // --- Progress tracking (localStorage) ---
  const progressKey = `progress_${subjectContent?.id}_${activeContentType}`;

  // Load completed topics from localStorage
  useEffect(() => {
    if (!subjectContent?.id || !activeContentType) return;
    try {
      const saved = localStorage.getItem(progressKey);
      if (saved) setCompletedTopics(JSON.parse(saved));
      else setCompletedTopics([]);
    } catch { setCompletedTopics([]); }
  }, [progressKey, subjectContent?.id, activeContentType]);

  const findTopicByNamePath = (topics: SubTopic[], namePath: string[]): SubTopic | null => {
    if (namePath.length === 0) return null;

    const [firstName, ...restPath] = namePath;
    const topic = topics.find(t => t.name === firstName);

    if (!topic) return null;
    if (restPath.length === 0) return topic;
    if (!topic.subTopics) return null;

    return findTopicByNamePath(topic.subTopics, restPath);
  };

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

  const findMatchingTopicByName = (topics: SubTopic[], currentTopicId: string): SubTopic | null => {
    const previousContentType = subjectContent?.contentTypes?.find(ct =>
      ct.subTopics.some(st => findSubTopic([st], currentTopicId))
    );
    if (!previousContentType) return null;
    const previousTopic = findSubTopic(previousContentType.subTopics, currentTopicId);
    if (!previousTopic) return null;

    const path = buildTopicPath(previousContentType.subTopics, currentTopicId);
    if (path.length === 0) return null;

    for (let i = path.length - 1; i >= 0; i--) {
      const matchedTopic = findTopicByNamePath(topics, path.slice(0, i + 1));
      if (matchedTopic) {
        if (matchedTopic.content) return matchedTopic;
        if (matchedTopic.subTopics) {
          const firstChild = findFirstTopicWithContent(matchedTopic.subTopics);
          if (firstChild) return firstChild;
        }
        return matchedTopic;
      }
    }
    return null;
  };

  // Flatten subtopic tree into ordered list of leaf nodes (topics with content)
  const flattenTopics = (topics: SubTopic[]): SubTopic[] => {
    const result: SubTopic[] = [];
    for (const topic of topics) {
      if (topic.content) result.push(topic);
      if (topic.subTopics) result.push(...flattenTopics(topic.subTopics));
    }
    return result;
  };

  const [pathway, setPathway] = useState<any>(null);
  const [pathwayLoading, setPathwayLoading] = useState(true);
  const [pathwayAdvancing, setPathwayAdvancing] = useState(false);

  // Fetch pathway from API, fall back to localStorage cache
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      try {
        const cached = localStorage.getItem('coursePathway');
        if (cached) setPathway(JSON.parse(cached));
      } catch { /* ignore */ }
      setPathwayLoading(false);
      return;
    }
    fetch(`${API_BASE_URL}/pathway`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => {
        if (r.status === 401) {
          localStorage.removeItem('token');
          navigate('/auth');
          return null;
        }
        return r.ok ? r.json() : null;
      })
      .then(d => {
        const pw = d?.pathway ?? null;
        setPathway(pw);
        if (pw) {
          try { localStorage.setItem('coursePathway', JSON.stringify(pw)); } catch { /* ignore */ }
        }
      })
      .catch(() => {
        try {
          const cached = localStorage.getItem('coursePathway');
          if (cached) setPathway(JSON.parse(cached));
        } catch { /* ignore */ }
      })
      .finally(() => setPathwayLoading(false));
  }, []);

  // ─── Pathway-aware helpers ───────────────────────────────────────────────
  const currentPathwayStep = pathway?.steps?.[pathway.currentStepIndex] ?? null;
  const currentSubjectBlock = currentPathwayStep?.subjectBlocks?.find(
    (b: any) => b.subjectId === subjectContent?.id
  ) ?? null;

  const currentSubjectBlockIndex = currentPathwayStep?.subjectBlocks?.findIndex(
    (b: any) => b.subjectId === subjectContent?.id
  ) ?? -1;
  const nextSubjectBlock = currentSubjectBlockIndex >= 0 && currentPathwayStep
    ? currentPathwayStep.subjectBlocks[currentSubjectBlockIndex + 1] ?? null
    : null;

  const allSubjectsStudied = currentPathwayStep?.subjectBlocks?.every(
    (b: any) => b.studyStatus === 'completed'
  ) ?? false;

  const isLastStep = pathway ? pathway.currentStepIndex >= pathway.steps.length - 1 : false;

  const flatList = flattenTopics(currentSubTopics);
  const currentIndex = flatList.findIndex(t => t.id === activeSubTopic);
  let nextTopic = currentIndex >= 0 && currentIndex < flatList.length - 1 ? flatList[currentIndex + 1] : null;

  // Pathway-aware restriction: if we are studying a pathway block, strict scope the "Next" button
  // so it doesn't bleed into other topics in this course.
  if (currentSubjectBlock?.topicId) {
    let pathwayNode = findSubTopic(currentSubTopics, currentSubjectBlock.topicId);

    // If we're on a different tab (like Mock Tests), the UUID won't match. Find by hierarchy instead.
    if (!pathwayNode) {
      pathwayNode = findMatchingTopicByName(currentSubTopics, currentSubjectBlock.topicId) || null;
    }

    if (pathwayNode) {
      const pathwayLeaves = flattenTopics([pathwayNode]);
      const isPathwayTopic = pathwayLeaves.some(leaf => leaf.id === activeSubTopic);
      if (isPathwayTopic && activeSubTopic === pathwayLeaves[pathwayLeaves.length - 1].id) {
        // This is the last leaf of the pathway block's required topic. Don't go to next global topic.
        nextTopic = null;
      }
    }
  }

  // Mark study-done on the backend for the current subject block
  const markPathwayStudyDone = async () => {
    if (!currentPathwayStep || !currentSubjectBlock) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/pathway/study-done`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          stepNumber: currentPathwayStep.stepNumber,
          subjectId: currentSubjectBlock.subjectId
        })
      });
      if (res.status === 401) {
        localStorage.removeItem('token');
        navigate('/auth');
        return;
      }
      if (res.ok) {
        const pwRes = await fetch(`${API_BASE_URL}/pathway`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (pwRes.ok) {
          const data = await pwRes.json();
          setPathway(data.pathway);
          try { localStorage.setItem('coursePathway', JSON.stringify(data.pathway)); } catch { /* ignore */ }
        }
      }
    } catch { /* ignore */ }
  };

  const markCompletedAndNext = async () => {
    if (!activeSubTopic) return;
    const updated = completedTopics.includes(activeSubTopic)
      ? completedTopics
      : [...completedTopics, activeSubTopic];
    setCompletedTopics(updated);
    try { localStorage.setItem(progressKey, JSON.stringify(updated)); } catch { }

    // Track note/study activity on the user's profile
    const token = localStorage.getItem('token');
    if (token) {
      fetch(`${API_BASE_URL}/profile/activity`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ event: 'note_read' })
      }).catch(() => { /* ignore – non-critical */ });
    }

    if (nextTopic) {
      setActiveSubTopic(nextTopic.id);
      const parentsToExpand = findParentChain(currentSubTopics, nextTopic.id);
      if (parentsToExpand.length > 0) {
        setExpandedSubTopics(prev => {
          const newSet = new Set([...prev, ...parentsToExpand]);
          return Array.from(newSet);
        });
      }
    } else {
      if (currentSubjectBlock && currentSubjectBlock.studyStatus !== 'completed') {
        await markPathwayStudyDone();
      }
    }
  };

  // Toggle a topic's completion off (uncomplete it)
  const toggleTopicCompletion = (topicId: string) => {
    if (!completedTopics.includes(topicId)) return;
    const updated = completedTopics.filter(id => id !== topicId);
    setCompletedTopics(updated);
    try { localStorage.setItem(progressKey, JSON.stringify(updated)); } catch { }
  };

  // Find all parent IDs for a given topic ID
  const findParentChain = (topics: SubTopic[], targetId: string, chain: string[] = []): string[] => {
    for (const topic of topics) {
      if (topic.id === targetId) return chain;
      if (topic.subTopics) {
        const found = findParentChain(topic.subTopics, targetId, [...chain, topic.id]);
        if (found.length > 0) return found;
      }
    }
    return [];
  };

  // Check if a topic is completed
  const isTopicCompleted = (topicId: string): boolean => completedTopics.includes(topicId);

  // Check if all leaf descendants of a parent topic are completed
  const areAllChildrenCompleted = (topic: SubTopic): boolean => {
    const leaves = flattenTopics(topic.subTopics || []);
    if (leaves.length === 0) return isTopicCompleted(topic.id);
    return leaves.every(leaf => completedTopics.includes(leaf.id));
  };

  // Advance to the next step in the pathway
  const handleAdvanceStep = async () => {
    const token = localStorage.getItem('token');
    if (!token || pathwayAdvancing) return;
    setPathwayAdvancing(true);
    try {
      const res = await fetch(`${API_BASE_URL}/pathway/next-step`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 401) {
        localStorage.removeItem('token');
        navigate('/auth');
        return;
      }
      if (res.ok) {
        // Refresh pathway
        const pwRes = await fetch(`${API_BASE_URL}/pathway`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (pwRes.ok) {
          const data = await pwRes.json();
          setPathway(data.pathway);
          try { localStorage.setItem('coursePathway', JSON.stringify(data.pathway)); } catch { /* ignore */ }
          // Navigate to the first subject of the new step
          const newStep = data.pathway?.steps?.[data.pathway.currentStepIndex];
          if (newStep?.subjectBlocks?.[0]) {
            const block = newStep.subjectBlocks[0];
            const targetTab = block.contentTypeIds?.find((id: string) => id !== block.mockTest?.contentTypeId) || block.contentTypeIds?.[0];
            navigate(`/subject/${block.subjectId}?topic=${block.topicId}${targetTab ? `&tab=${targetTab}` : ''}`);
          } else {
            navigate('/pathway');
          }
        }
      }
    } catch { /* ignore */ }
    setPathwayAdvancing(false);
  };

  // Navigate to the next subject in the current pathway step
  const navigateToNextSubject = () => {
    if (!nextSubjectBlock) return;
    const targetTab = nextSubjectBlock.contentTypeIds?.find((id: string) => id !== nextSubjectBlock.mockTest?.contentTypeId) || nextSubjectBlock.contentTypeIds?.[0];
    navigate(`/subject/${nextSubjectBlock.subjectId}?topic=${nextSubjectBlock.topicId}${targetTab ? `&tab=${targetTab}` : ''}`);
  };


  const [lastProcessedUrlParams, setLastProcessedUrlParams] = useState({
    topic: searchParams.get('topic'),
    tab: searchParams.get('tab')
  });

  // Set first subtopic when content type changes, or deep-link from ?topic= param
  useEffect(() => {
    const currentTopicFromUrl = searchParams.get('topic');
    const currentTabFromUrl = searchParams.get('tab');
    const urlChanged =
      currentTopicFromUrl !== lastProcessedUrlParams.topic ||
      currentTabFromUrl !== lastProcessedUrlParams.tab;

    if (urlChanged) {
      setLastProcessedUrlParams({ topic: currentTopicFromUrl, tab: currentTabFromUrl });

      if (currentTabFromUrl && subjectContent?.contentTypes?.some(ct => ct.id === currentTabFromUrl)) {
        setActiveContentType(currentTabFromUrl);
      }

      if (currentTopicFromUrl && currentSubTopics.length > 0) {
        const urlTopic = findSubTopic(currentSubTopics, currentTopicFromUrl);
        if (urlTopic) {
          setActiveSubTopic(urlTopic.id);
          // Auto-expand parent chain so the topic is visible in sidebar
          const parents = findParentChain(currentSubTopics, urlTopic.id);
          if (parents.length > 0) {
            setExpandedSubTopics(prev => Array.from(new Set([...prev, ...parents])));
          }
        }
      }
      // If we just handled a URL navigation, stop here to avoid overriding with fallback logic
      return;
    }

    if (currentSubTopics.length > 0) {
      // 2. Try to find matching topic in new content type based on current selection
      const currentTopic = activeSubTopic ? findSubTopic(currentSubTopics, activeSubTopic) : null;

      if (currentTopic) {
        // Already in the right topic, do nothing
        return;
      }

      // 3. Try to match by hierarchy: look for same name in current path
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
    return topics.map((subTopic) => {
      const hasChildren = subTopic.subTopics && subTopic.subTopics.length > 0;
      const completed = hasChildren
        ? areAllChildrenCompleted(subTopic)
        : isTopicCompleted(subTopic.id);

      return (
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
            {completed && (
              <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mr-2" />
            )}
            <span
              className="flex-1 cursor-pointer"
              onClick={() => {
                setActiveSubTopic(subTopic.id);
                setRightSidebarOpen(false);
                if (hasChildren) {
                  toggleSubTopicExpansion(subTopic.id);
                }
              }}
            >
              {subTopic.name}
            </span>
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSubTopicExpansion(subTopic.id);
                }}
                className="flex-shrink-0 p-1 hover:bg-sidebar-accent/30 rounded transition-colors"
                aria-label={expandedSubTopics.includes(subTopic.id) ? "Collapse" : "Expand"}
              >
                <ChevronRight
                  className={`h-4 w-4 transition-transform ${expandedSubTopics.includes(subTopic.id) ? 'rotate-90' : ''
                    }`}
                />
              </button>
            )}
          </div>
          {hasChildren &&
            expandedSubTopics.includes(subTopic.id) && (
              <div className="ml-2">
                {renderSubTopics(subTopic.subTopics!, level + 1)}
              </div>
            )}
        </div>
      );
    });
  };

  const renderPlainText = (data: any) => {
    const text = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    return (
      <div className="prose prose-sm md:prose-base max-w-none dark:prose-invert">
        <div className="bg-card text-card-foreground rounded-lg p-4 md:p-6 shadow-sm border border-border">
          {text.split("\n").map((paragraph: string, idx: number) =>
            paragraph.trim() ? (
              <p key={idx} className="mb-4 leading-relaxed">
                {paragraph}
              </p>
            ) : null
          )}
        </div>
      </div>
    );
  };

  // Parse plain text MCQ format into structured questions
  // Format:
  // Q: Question text
  // A) Option one
  // B) Option two
  // C) Option three
  // D) Option four
  // ANS: A
  // EXP: Optional explanation
  const parseMcqText = (text: string) => {
    const questions: { question: string; options: string[]; answer: string; explanation: string; topicId?: string }[] = [];
    const blocks = text.split(/\n\s*\n/).filter(b => b.trim());

    for (const block of blocks) {
      const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
      let question = '';
      const options: string[] = [];
      let answer = '';
      let explanation = '';

      for (const line of lines) {
        if (line.match(/^Q[:.)]\s*/i)) {
          question = line.replace(/^Q[:.)]\s*/i, '').trim();
        } else if (line.match(/^[A-D][.)]\s/)) {
          options.push(line.replace(/^[A-D][.)]\s/, '').trim());
        } else if (line.match(/^ANS[:.)]\s*/i)) {
          answer = line.replace(/^ANS[:.)]\s*/i, '').trim().toUpperCase();
        } else if (line.match(/^EXP[:.)]\s*/i)) {
          explanation = line.replace(/^EXP[:.)]\s*/i, '').trim();
        }
      }

      if (question && options.length > 0) {
        questions.push({ question, options, answer, explanation, topicId: activeSubTopic });
      }
    }

    return questions;
  };

  const handleMockSubmit = async (score: number, total: number, wrongTopicIds: string[]) => {
    const token = localStorage.getItem('token');

    // Track quiz activity on the user's profile (always, even outside a pathway)
    if (token) {
      fetch(`${API_BASE_URL}/profile/activity`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ event: 'quiz_taken', score, total })
      }).catch(() => { /* ignore – non-critical */ });
    }

    // If we're not inside a pathway step, nothing more to do
    if (!currentPathwayStep || !currentSubjectBlock) return;

    // Only process if this is the mock test content type
    const isMockTab = activeContentTypeData?.type === 'mock' ||
      activeContentTypeData?.name?.toLowerCase().includes('mock');
    if (!isMockTab) return;

    try {
      if (!token) return;

      const res = await fetch(`${API_BASE_URL}/pathway/mock-result`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          stepNumber: currentPathwayStep.stepNumber,
          subjectId: currentSubjectBlock.subjectId,
          totalQuestions: total,
          correctAnswers: score,
          timeTakenMinutes: 5, // mock time
          weakTopicIds: wrongTopicIds
        })
      });

      if (res.status === 401) {
        localStorage.removeItem('token');
        navigate('/auth');
        return;
      }

      if (res.ok) {
        const data = await res.json();

        // Remove weak topics from completed list so user has to re-study them
        if (wrongTopicIds.length > 0) {
          const updatedCompleted = completedTopics.filter(id => !wrongTopicIds.includes(id));
          setCompletedTopics(updatedCompleted);
          try { localStorage.setItem(progressKey, JSON.stringify(updatedCompleted)); } catch { }
        }

        // Refresh pathway data locally
        const pwRes = await fetch(`${API_BASE_URL}/pathway`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (pwRes.ok) {
          const pwData = await pwRes.json();
          setPathway(pwData.pathway);
          try { localStorage.setItem('coursePathway', JSON.stringify(pwData.pathway)); } catch { }
        }
      }
    } catch {
      console.error("Failed to submit mock result");
    }
  };

  const renderMcqs = (questions: { question: string; options: string[]; answer: string; explanation: string; topicId?: string }[]) => {
    return <McqRenderer questions={questions} key={activeSubTopic} onSubmitResult={handleMockSubmit} />;
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

    // Fallback: if content.type is missing/null in DB, infer from the active tab's type
    const resolvedType = type || currentContentType?.type || '';

    // If data is a plain string and looks like MCQ format, parse and render it
    if (typeof data === 'string' && data.match(/^Q[:.)]/im)) {
      const questions = parseMcqText(data);
      if (questions.length > 0) return renderMcqs(questions);
    }

    // If still no type, render as plain text
    if (!resolvedType || resolvedType === '') {
      return renderPlainText(data);
    }

    switch (resolvedType) {
      case 'notes':
        return renderPlainText(data);

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
      case 'mcqs': {
        // If data is a plain string, try to parse as MCQ text format
        if (typeof data === 'string') {
          const questions = parseMcqText(data);
          if (questions.length > 0) return renderMcqs(questions);
          return renderPlainText(data);
        }
        // If data is an array of MCQ objects
        if (Array.isArray(data) && data.length > 0) {
          const normalized = data.map((item: any) => ({
            question: item.question || item.title || '',
            options: item.options || [],
            answer: item.answer !== undefined ? String.fromCharCode(65 + item.answer) : item.ans || '',
            explanation: item.explanation || '',
          }));
          return renderMcqs(normalized);
        }
        return (
          <div className="bg-card text-card-foreground rounded-lg p-8 shadow-sm border border-border text-center">
            <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No questions available yet.</p>
          </div>
        );
      }

      default:
        return renderPlainText(data);
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
        onViewAll={() => navigate('/pathway')}
        onNavigate={(subjectId, topicId, contentTypeId) =>
          navigate(`/subject/${subjectId}?topic=${topicId}${contentTypeId ? `&tab=${contentTypeId}` : ''}`)
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

            {/* Next Button */}
            {activeSubTopicData?.content && (
              <div className="mt-8 flex flex-col gap-4 border-t border-border pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {isTopicCompleted(activeSubTopic) && (
                      <button
                        onClick={() => toggleTopicCompletion(activeSubTopic)}
                        className="flex items-center gap-1.5 text-green-500 hover:text-red-400 transition-colors cursor-pointer group"
                        title="Click to mark as incomplete"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="group-hover:line-through">Completed</span>
                      </button>
                    )}
                  </div>
                  <Button
                    onClick={markCompletedAndNext}
                    className="gap-2"
                    size="lg"
                  >
                    {nextTopic ? (
                      <>
                        Next: {nextTopic.name}
                        <ArrowRight className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        {isTopicCompleted(activeSubTopic) ? 'All Done!' : 'Mark Complete'}
                        <CheckCircle2 className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>

                {/* Pathway-aware navigation: show after finishing all topics in this content type */}
                {!nextTopic && isTopicCompleted(activeSubTopic) && currentPathwayStep && currentSubjectBlock && (
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                    {currentSubjectBlock.mockTest.contentTypeId &&
                      currentSubjectBlock.mockTest.status === 'pending' &&
                      activeContentType !== currentSubjectBlock.mockTest.contentTypeId ? (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {currentSubjectBlock.subjectName} study complete!
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Next up: Mock Test for this topic
                          </p>
                        </div>
                        <Button
                          onClick={() => setActiveContentType(currentSubjectBlock.mockTest.contentTypeId!)}
                          size="sm"
                          className="gap-1 bg-amber-500 hover:bg-amber-600 text-white"
                        >
                          Take Mock Test <ArrowRight className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : nextSubjectBlock ? (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {currentSubjectBlock.subjectName} study complete!
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Next up: {nextSubjectBlock.subjectName} — {nextSubjectBlock.topicName}
                          </p>
                        </div>
                        <Button onClick={navigateToNextSubject} size="sm" className="gap-1">
                          Continue <ArrowRight className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            All subjects in Step {currentPathwayStep.stepNumber} complete!
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {isLastStep ? 'This is the final step!' : 'Ready to unlock the next step.'}
                          </p>
                        </div>
                        <Button
                          onClick={handleAdvanceStep}
                          disabled={pathwayAdvancing}
                          size="sm"
                          className="gap-1 bg-emerald-500 hover:bg-emerald-600"
                        >
                          {pathwayAdvancing
                            ? 'Advancing…'
                            : isLastStep
                              ? 'Complete Pathway '
                              : 'Next Step →'
                          }
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
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