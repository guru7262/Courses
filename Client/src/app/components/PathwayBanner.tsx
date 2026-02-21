/**
 * PathwayBanner.tsx
 *
 * A slim persistent banner shown just below the Navbar on every page.
 * Shows the current active step and lets the user jump to the full pathway page.
 *
 * Props:
 *   pathway  – the CoursePathway object returned by GET /api/pathway
 *   onViewAll – callback → navigate to /pathway (CoursePathwayPage)
 *   onNavigate – (subjectId, topicId, contentTypeId?) → navigate into SubjectContentPage
 */

import { useNavigate } from 'react-router-dom';
import {
  ChevronRight, BookOpen, Flame, MapPin, CheckCircle2, Loader2
} from 'lucide-react';

// ─── Types (mirror your backend model) ───────────────────────────────────────

interface MockResult {
  scorePercent: number;
  totalQuestions: number;
  correctAnswers: number;
  timeTakenMinutes: number;
}

interface SubjectBlock {
  subjectId: string;
  subjectName: string;
  topicId: string;
  topicName: string;
  breadcrumb: string[];        // full path e.g. ['Mechanics', 'Motion', 'Velocity']
  depth: number;               // 0 = chapter, 1 = section, 2 = sub-section
  hasChildren: boolean;
  subTopics: any[];
  contentTypeIds: string[];
  studyStatus: 'pending' | 'in-progress' | 'completed';
  mockTest: {
    contentTypeId?: string;
    status: 'pending' | 'in-progress' | 'completed' | 'skipped';
    result?: MockResult;
  };
}

interface RevisionBlock {
  status: 'pending' | 'in-progress' | 'completed';
  topics: { topicId: string; topicName: string; revisited: boolean }[];
  revisionMock: { status: string; result?: MockResult };
}

interface PathwayStep {
  stepNumber: number;
  title: string;
  status: 'locked' | 'active' | 'completed';
  subjectBlocks: SubjectBlock[];
  revision?: RevisionBlock | null;
}

interface Pathway {
  targets: {
    categoryName: string;
    categoryId: string;
    subjectsPerDay: number;
    hoursPerDay: number;
  };
  steps: PathwayStep[];
  currentStepIndex: number;
  totalSteps: number;
  overallProgressPercent: number;
  overallStatus: string;
}

interface PathwayBannerProps {
  pathway: Pathway | null;
  loading?: boolean;
  onViewAll?: () => void;
  onNavigate?: (subjectId: string, topicId: string, contentTypeId?: string) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStepLabel(step: PathwayStep): string {
  if (!step) return '';
  const allMocksDone = step.subjectBlocks.every(
    b => b.mockTest.status === 'completed' || b.mockTest.status === 'skipped'
  );
  if (allMocksDone && step.revision && step.revision.status !== 'completed') {
    return `${step.title} · Revision`;
  }
  // Find first incomplete block
  const pending = step.subjectBlocks.find(
    b => b.studyStatus !== 'completed' || b.mockTest.status === 'pending'
  );
  if (pending) {
    const studyDone  = pending.studyStatus === 'completed';
    // Use full breadcrumb trail if available, otherwise just the topic name
    const topicLabel = pending.breadcrumb && pending.breadcrumb.length > 0
      ? pending.breadcrumb.join(' › ')
      : pending.topicName;
    return `${pending.subjectName}: ${studyDone ? 'Mock – ' : ''}${topicLabel}`;
  }
  return step.title;
}

function getStepAction(step: PathwayStep): string {
  if (step.status === 'completed') return 'Review';
  const allStudied = step.subjectBlocks.every(b => b.studyStatus === 'completed');
  const allMocked  = step.subjectBlocks.every(b => b.mockTest.status === 'completed' || b.mockTest.status === 'skipped');
  if (!allStudied) return 'Study';
  if (!allMocked)  return 'Mock Test';
  if (step.revision && step.revision.status !== 'completed') return 'Revise';
  return 'Continue';
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PathwayBanner({
  pathway,
  loading = false,
  onViewAll,
  onNavigate,
}: PathwayBannerProps) {
  const navigate = useNavigate();

  const handleViewAll = () => {
    if (onViewAll) onViewAll();
    else navigate('/pathway');
  };

  // ── Loading state ──
  if (loading) {
    return (
      <div className="w-full bg-card border-b border-border px-4 py-2.5 flex items-center gap-3">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Loading pathway…</span>
      </div>
    );
  }

  // ── No pathway yet ──
  if (!pathway) {
    return (
      <div className="w-full bg-card border-b border-border px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>No course pathway set up yet.</span>
        </div>
        <button
          onClick={handleViewAll}
          className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
        >
          Set up pathway <ChevronRight className="h-3 w-3" />
        </button>
      </div>
    );
  }

  // ── Completed ──
  if (pathway.overallStatus === 'completed') {
    return (
      <div className="w-full bg-emerald-500/10 border-b border-emerald-500/20 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
            {pathway.targets.categoryName} pathway complete! 🎉
          </span>
        </div>
        <button
          onClick={handleViewAll}
          className="text-xs font-medium text-emerald-600 hover:underline flex items-center gap-1"
        >
          View summary <ChevronRight className="h-3 w-3" />
        </button>
      </div>
    );
  }

  const currentStep = pathway.steps[pathway.currentStepIndex];
  if (!currentStep) return null;

  const label  = getStepLabel(currentStep);
  const action = getStepAction(currentStep);
  const pct    = pathway.overallProgressPercent;

  // Find the first actionable block to deep-link into
  const actionableBlock = currentStep.subjectBlocks.find(
    b => b.studyStatus !== 'completed'
  ) || currentStep.subjectBlocks[0];

  const handleStart = () => {
    if (onNavigate && actionableBlock) {
      onNavigate(
        actionableBlock.subjectId,
        actionableBlock.topicId,
        actionableBlock.contentTypeIds[0]
      );
    }
  };

  return (
    <div className="w-full bg-card border-b border-border px-4 py-0" style={{ minHeight: '44px' }}>
      <div className="max-w-7xl mx-auto flex items-center gap-3 h-[44px]">

        {/* Left: icon + label */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="flex-shrink-0 flex items-center gap-1.5 text-primary">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden sm:inline">
              Pathway
            </span>
          </div>

          {/* Divider */}
          <div className="h-4 w-px bg-border flex-shrink-0" />

          {/* Step label */}
          <span className="text-sm font-medium text-foreground truncate">
            {label}
          </span>
        </div>

        {/* Middle: progress bar */}
        <div className="hidden md:flex items-center gap-2 flex-shrink-0">
          <div className="w-28 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground tabular-nums">{pct}%</span>
        </div>

        {/* Streak pill */}
        {pathway.currentStepIndex > 0 && (
          <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 text-xs font-medium flex-shrink-0">
            <Flame className="h-3 w-3" />
            <span>Step {pathway.currentStepIndex + 1}/{pathway.totalSteps}</span>
          </div>
        )}

        {/* Right: action buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleStart}
            className="px-3 py-1 text-xs font-semibold rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            {action}
          </button>
          <button
            onClick={handleViewAll}
            className="px-3 py-1 text-xs font-medium rounded-md border border-border text-foreground hover:bg-muted transition-colors"
          >
            All Steps
          </button>
        </div>
      </div>
    </div>
  );
}
