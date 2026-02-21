/**
 * CoursePathwayPage.tsx
 *
 * Full-page view of the user's course pathway.
 * Shows every step as a card: completed, active, or locked.
 * Clicking Start/Continue on an active step navigates into SubjectContentPage.
 *
 * Route: /pathway
 *
 * Props:
 *   onNavigate – (subjectId, topicId, contentTypeId?) navigate to content page
 *   onSetupPathway – opens setup modal / page
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, ChevronRight, CheckCircle2, Lock,
  Flame, Target, Clock, BarChart2, ArrowLeft,
  RefreshCw, ChevronDown, ChevronUp, AlertCircle, Sparkles
} from 'lucide-react';
import { Footer } from '@/app/components/Footer';
import { Navbar } from "@/app/components/UpdatedNavbar";
const API_BASE_URL = import.meta.env.VITE_API_URL as string;

// ─── Types ────────────────────────────────────────────────────────────────────

interface MockResult {
  scorePercent: number;
  totalQuestions: number;
  correctAnswers: number;
  timeTakenMinutes: number;
  attemptedAt?: string;
}

interface SubjectBlock {
  subjectId: string;
  subjectName: string;
  topicId: string;
  topicName: string;
  breadcrumb: string[];          // e.g. ['Mechanics', 'Motion', 'Velocity']
  depth: number;                 // 0 = chapter, 1 = section, 2 = sub-section
  hasChildren: boolean;
  subTopics: any[];              // raw nested tree
  contentTypeIds: string[];
  studyStatus: 'pending' | 'in-progress' | 'completed';
  mockTest: {
    contentTypeId?: string;
    status: 'pending' | 'in-progress' | 'completed' | 'skipped';
    result?: MockResult;
  };
}

interface RevisionTopic {
  subjectId: string;
  subjectName: string;
  topicId: string;
  topicName: string;
  reason: string;
  revisited: boolean;
}

interface RevisionBlock {
  generatedAt: string;
  status: 'pending' | 'in-progress' | 'completed';
  topics: RevisionTopic[];
  revisionMock: { status: string; result?: MockResult };
}

interface PathwayStep {
  stepNumber: number;
  title: string;
  status: 'locked' | 'active' | 'completed';
  unlockedAt?: string;
  completedAt?: string;
  subjectBlocks: SubjectBlock[];
  revision?: RevisionBlock | null;
}

interface Pathway {
  _id: string;
  targets: {
    categoryId: string;
    categoryName: string;
    subjectsPerDay: number;
    mockTestsPerDay: number;
    hoursPerDay: number;
  };
  steps: PathwayStep[];
  currentStepIndex: number;
  totalSteps: number;
  overallProgressPercent: number;
  overallStatus: 'not-started' | 'in-progress' | 'completed' | 'paused';
  startedAt?: string;
  completedAt?: string;
}

interface CoursePathwayPageProps {
  onNavigate?: (subjectId: string, topicId: string, contentTypeId?: string) => void;
  onSetupPathway?: () => void;
}

// ─── Setup Modal (inline, lightweight) ───────────────────────────────────────

interface SetupModalProps {
  categories: { id: string; name: string }[];
  onSubmit: (data: {
    categoryId: string;
    subjectsPerDay: number;
    mockTestsPerDay: number;
    hoursPerDay: number;
  }) => void;
  onClose: () => void;
  loading: boolean;
}

function SetupModal({ categories, onSubmit, onClose, loading }: SetupModalProps) {
  const [categoryId, setCategoryId]       = useState(categories[0]?.id || '');
  const [subjectsPerDay, setSubjects]     = useState(2);
  const [mockTestsPerDay, setMocks]       = useState(1);
  const [hoursPerDay, setHours]           = useState(3);

  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      
      <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
        
          <div>
            <h2 className="text-lg font-bold text-foreground">Set Up Your Pathway</h2>
            <p className="text-xs text-muted-foreground">Personalise your daily study targets</p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Course */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Course / Category</label>
            <select
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Targets */}
          {[
            { label: 'Subjects per day',  val: subjectsPerDay,  set: setSubjects, min: 1, max: 6 },
            { label: 'Mock tests per day', val: mockTestsPerDay, set: setMocks,    min: 0, max: 6 },
            { label: 'Hours per day',  val: hoursPerDay,     set: setHours,    min: 1, max: 12 },
          ].map(({ label, icon, val, set, min, max }) => (
            <div key={label}>
              <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-1.5">
                {icon} {label}
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => set(Math.max(min, val - 1))}
                  className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-foreground hover:bg-muted transition-colors font-bold"
                >−</button>
                <span className="w-8 text-center font-semibold text-foreground tabular-nums">{val}</span>
                <button
                  onClick={() => set(Math.min(max, val + 1))}
                  className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-foreground hover:bg-muted transition-colors font-bold"
                >+</button>
                <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${((val - min) / (max - min)) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-7">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >Cancel</button>
          <button
            onClick={() => onSubmit({ categoryId, subjectsPerDay, mockTestsPerDay, hoursPerDay })}
            disabled={loading || !categoryId}
            className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Creating…' : 'Create Pathway'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Step Card ────────────────────────────────────────────────────────────────

interface StepCardProps {
  step: PathwayStep;
  isCurrent: boolean;
  onNavigate?: (subjectId: string, topicId: string, contentTypeId?: string) => void;
}

function StepCard({ step, isCurrent, onNavigate }: StepCardProps) {
  const [expanded, setExpanded] = useState(isCurrent);

  const isLocked    = step.status === 'locked';
  const isCompleted = step.status === 'completed';
  const isActive    = step.status === 'active';

  // Determine the overall phase of this step
  const studyBlocksDone = step.subjectBlocks.filter(b => b.studyStatus === 'completed').length;
  const mocksDone       = step.subjectBlocks.filter(b => b.mockTest.status === 'completed' || b.mockTest.status === 'skipped').length;
  const totalBlocks     = step.subjectBlocks.length;
  const allMocksDone    = mocksDone === totalBlocks;
  const inRevision      = allMocksDone && step.revision && step.revision.status !== 'completed';

  // Average score across completed mocks
  const completedMocks  = step.subjectBlocks.filter(b => b.mockTest.result);
  const avgScore        = completedMocks.length > 0
    ? Math.round(completedMocks.reduce((s, b) => s + (b.mockTest.result?.scorePercent || 0), 0) / completedMocks.length)
    : null;

  const handleBlockClick = (block: SubjectBlock) => {
    if (onNavigate) {
      onNavigate(block.subjectId, block.topicId, block.contentTypeIds[0]);
    }
  };

  // Status pill
  const statusPill = isLocked
    ? <span className="flex items-center gap-1 text-xs text-muted-foreground"><Lock className="h-3 w-3" /> Locked</span>
    : isCompleted
    ? <span className="flex items-center gap-1 text-xs text-emerald-500 font-medium"><CheckCircle2 className="h-3 w-3" /> Completed</span>
    : <span className="flex items-center gap-1 text-xs text-primary font-medium"> Active</span>;

  return (
    <div
      className={`
        rounded-2xl border transition-all duration-200
        ${isLocked    ? 'border-border bg-muted/30 opacity-60' : ''}
        ${isCompleted ? 'border-emerald-500/20 bg-emerald-500/5' : ''}
        ${isActive    ? 'border-primary/30 bg-card shadow-sm' : ''}
        ${isCurrent   ? 'ring-2 ring-primary/20' : ''}
      `}
    >
      {/* Card header */}
      <button
        className="w-full flex items-center justify-between px-5 py-4 text-left"
        onClick={() => !isLocked && setExpanded(e => !e)}
        disabled={isLocked}
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Step number circle */}
          <div className={`
            w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0
            ${isCompleted ? 'bg-emerald-500 text-white' : isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
          `}>
            {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : step.stepNumber}
          </div>

          <div className="min-w-0">
            <h3 className="font-semibold text-foreground text-sm leading-snug truncate">
              {step.title}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              {statusPill}
              {avgScore !== null && (
                <span className="text-xs text-muted-foreground">· Avg score: {avgScore}%</span>
              )}
              {inRevision && (
                <span className="text-xs text-amber-500 font-medium">· Revision pending</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
          {/* Mini progress bar */}
          {!isLocked && (
            <div className="hidden sm:flex items-center gap-1.5">
              <div className="w-16 h-1 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${isCompleted ? 'bg-emerald-500' : 'bg-primary'}`}
                  style={{ width: `${isCompleted ? 100 : Math.round((studyBlocksDone / Math.max(totalBlocks, 1)) * 100)}%` }}
                />
              </div>
            </div>
          )}
          {!isLocked && (
            expanded
              ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
              : <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
          {isLocked && <Lock className="h-4 w-4 text-muted-foreground" />}
        </div>
      </button>

      {/* Expanded body */}
      {expanded && !isLocked && (
        <div className="px-5 pb-5 space-y-3 border-t border-border/50 pt-4">
          
          {/* Subject blocks */}
          {step.subjectBlocks.map((block, idx) => {
            const studied   = block.studyStatus === 'completed';
            const mockDone  = block.mockTest.status === 'completed' || block.mockTest.status === 'skipped';
            const blockDone = studied && mockDone;

            return (
              <div
                key={`${block.subjectId}-${idx}`}
                className={`
                  rounded-xl border p-3.5 transition-colors
                  ${blockDone
                    ? 'border-emerald-500/20 bg-emerald-500/5'
                    : 'border-border bg-background hover:border-primary/30'
                  }
                `}
                style={{ marginLeft: `${block.depth * 12}px` }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    {/* Subject name + depth badge */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                        {block.subjectName}
                      </span>
                      {block.depth > 0 && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                          {'›'.repeat(block.depth)} depth {block.depth}
                        </span>
                      )}
                      {blockDone && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                    </div>

                    {/* Breadcrumb trail */}
                    {block.breadcrumb && block.breadcrumb.length > 1 && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {block.breadcrumb.slice(0, -1).join(' › ')}
                      </p>
                    )}

                    {/* Topic name */}
                    <p className="text-sm font-medium text-foreground mt-0.5 truncate">{block.topicName}</p>

                    {/* Has children note */}
                    {block.hasChildren && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Contains {block.subTopics?.length || 0} sub-topic{(block.subTopics?.length || 0) !== 1 ? 's' : ''}
                      </p>
                    )}

                    {/* Study + Mock status pills */}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium
                        ${studied ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground'}`}>
                        
                        {studied ? 'Studied' : 'Study'}
                      </span>
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium
                        ${mockDone ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground'}`}>
                        
                        {block.mockTest.result
                          ? `Mock: ${block.mockTest.result.scorePercent}%`
                          : 'Mock Test'
                        }
                      </span>
                    </div>
                  </div>

                  {/* Navigate button */}
                  {isActive && (
                    <button
                      onClick={() => handleBlockClick(block)}
                      className={`
                        flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                        ${!studied
                          ? 'bg-primary text-primary-foreground hover:opacity-90'
                          : !mockDone
                          ? 'bg-amber-500/10 text-amber-600 border border-amber-500/30 hover:bg-amber-500/20'
                          : 'bg-muted text-muted-foreground border border-border hover:bg-muted/80'
                        }
                      `}
                    >
                      {!studied ? 'Start' : !mockDone ? 'Mock' : 'Review'}
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  )}
                  {isCompleted && (
                    <button
                      onClick={() => handleBlockClick(block)}
                      className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:bg-muted transition-colors"
                    >
                      Review <ChevronRight className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Revision block */}
          {step.revision && (
            <div className={`
              rounded-xl border p-3.5
              ${step.revision.status === 'completed'
                ? 'border-emerald-500/20 bg-emerald-500/5'
                : 'border-amber-500/30 bg-amber-500/5'
              }
            `}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <RefreshCw className={`h-3.5 w-3.5 ${step.revision.status === 'completed' ? 'text-emerald-500' : 'text-amber-500'}`} />
                    <span className="text-xs font-semibold uppercase tracking-wide text-amber-600">
                      Revision
                    </span>
                    {step.revision.status === 'completed' && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                  </div>
                  <p className="text-sm text-foreground mt-0.5">
                    {step.revision.topics.length} weak topic{step.revision.topics.length !== 1 ? 's' : ''} to review
                  </p>
                  {step.revision.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {step.revision.topics.slice(0, 3).map(t => (
                        <span
                          key={t.topicId}
                          className={`text-xs px-2 py-0.5 rounded-full ${t.revisited ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground'}`}
                        >
                          {t.topicName}
                        </span>
                      ))}
                      {step.revision.topics.length > 3 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          +{step.revision.topics.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
                {step.revision.revisionMock?.result && (
                  <span className="text-xs font-semibold text-emerald-600">
                    {step.revision.revisionMock.result.scorePercent}%
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function CoursePathwayPage({
  onNavigate,
  onSetupPathway,
}: CoursePathwayPageProps) {
  const navigate  = useNavigate();
  const [pathway, setPathway]         = useState<Pathway | null>(null);
  const [categories, setCategories]   = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading]         = useState(true);
  const [showSetup, setShowSetup]     = useState(false);
  const [setupLoading, setSetupLoading] = useState(false);
  const [error, setError]             = useState<string | null>(null);

  useEffect(() => {
    fetchPathway();
    fetchCategories();
  }, []);

  const fetchPathway = async () => {
    try {
      const token = localStorage.getItem('token');
      const res   = await fetch(`${API_BASE_URL}/pathway`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPathway(data.pathway);
      } else if (res.status === 404) {
        setPathway(null); // no pathway yet
      } else {
        setError('Failed to load pathway.');
      }
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/categories`);
      if (res.ok) {
        const data = await res.json();
        // Adjust to your actual categories endpoint shape
        const cats = (data.categories || data).map((c: any) => ({ id: c.id, name: c.name }));
        setCategories(cats);
      }
    } catch {
      // silent – categories shown in setup modal
    }
  };

  const handleSetupSubmit = async (data: {
    categoryId: string;
    subjectsPerDay: number;
    mockTestsPerDay: number;
    hoursPerDay: number;
  }) => {
    setSetupLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res   = await fetch(`${API_BASE_URL}/pathway/init`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const json = await res.json();
        setPathway(json.pathway);
        setShowSetup(false);
      } else {
        const err = await res.json();
        setError(err.message || 'Failed to create pathway.');
      }
    } catch {
      setError('Network error.');
    } finally {
      setSetupLoading(false);
    }
  };

  const handleNavigate = (subjectId: string, topicId: string, contentTypeId?: string) => {
    if (onNavigate) {
      onNavigate(subjectId, topicId, contentTypeId);
    } else {
      // default: navigate to subject page with query params
      navigate(`/subject/${subjectId}?topic=${topicId}${contentTypeId ? `&tab=${contentTypeId}` : ''}`);
    }
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex flex-col min-h-full bg-background">
        <div className="flex-1 p-6 max-w-3xl mx-auto w-full">
          <div className="h-8 w-48 bg-muted rounded-lg animate-pulse mb-6" />
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-muted rounded-2xl mb-3 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // ── No pathway ──
  if (!pathway) {
    return (

      <div className="flex flex-col min-h-full bg-background">
        <Navbar/>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Target className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">No pathway yet</h2>
            <p className="text-muted-foreground mb-6">
              Set up your personalised course pathway to get a step-by-step study guide tailored to your daily targets.
            </p>
            <button
              onClick={() => {
                if (onSetupPathway) onSetupPathway();
                else setShowSetup(true);
              }}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-opacity"
            >
              Set Up Pathway
            </button>
          </div>
        </div>
        <Footer />
        {showSetup && (
          <SetupModal
            categories={categories}
            onSubmit={handleSetupSubmit}
            onClose={() => setShowSetup(false)}
            loading={setupLoading}
          />
        )}
      </div>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <div className="flex flex-col min-h-full bg-background">
        <Navbar/>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-3" />
            <p className="text-foreground font-medium">{error}</p>
            <button onClick={fetchPathway} className="mt-4 text-sm text-primary hover:underline">
              Try again
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const completedSteps = pathway.steps.filter(s => s.status === 'completed').length;

  return (
    <div className="flex flex-col min-h-full bg-background">
      <Navbar/>
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-6">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-5"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {pathway.targets.categoryName} Pathway
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {completedSteps} of {pathway.totalSteps} steps completed
            </p>
          </div>
          <button
            onClick={() => setShowSetup(true)}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
          >
            <Target className="h-3.5 w-3.5" /> Adjust Targets
          </button>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            {  label: 'Progress', value: `${pathway.overallProgressPercent}%` },
            { label: 'Subjects/day', value: pathway.targets.subjectsPerDay },
            {  label: 'Hours/day', value: `${pathway.targets.hoursPerDay}h` },
          ].map(({ icon, label, value }) => (
            <div key={label} className="rounded-xl border border-border bg-card p-3 text-center">
              <div className="flex justify-center text-primary mb-1">{icon}</div>
              <div className="text-lg font-bold text-foreground">{value}</div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>

        {/* Overall progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span>Overall progress</span>
            <span>{pathway.overallProgressPercent}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-700"
              style={{ width: `${pathway.overallProgressPercent}%` }}
            />
          </div>
        </div>

        {/* ── Step list ── */}
        <div className="space-y-3">
          {pathway.steps.map((step, idx) => (
            <StepCard
              key={step.stepNumber}
              step={step}
              isCurrent={idx === pathway.currentStepIndex && step.status === 'active'}
              onNavigate={handleNavigate}
            />
          ))}
        </div>

        {pathway.overallStatus === 'completed' && (
          <div className="mt-8 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
            <h3 className="text-lg font-bold text-foreground">Pathway Complete! </h3>
            <p className="text-sm text-muted-foreground mt-1">
              You've finished all {pathway.totalSteps} steps of your {pathway.targets.categoryName} pathway.
            </p>
          </div>
        )}
      </div>

      <Footer />

      {showSetup && (
        <SetupModal
          categories={categories}
          onSubmit={handleSetupSubmit}
          onClose={() => setShowSetup(false)}
          loading={setupLoading}
        />
      )}
    </div>
  );
}
