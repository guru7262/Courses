import { Book, ArrowRight } from "lucide-react";
import { Skeleton } from "@/app/components/ui/skeleton";
import { Footer } from "@/app/components/Footer";

interface Subject {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

interface SubjectSelectionPageProps {
  subjects: Subject[];
  loading?: boolean;
  onSelectSubject: (subjectId: string) => void;
}

export function SubjectSelectionPage({
  subjects,
  loading = false,
  onSelectSubject,
}: SubjectSelectionPageProps) {
  if (loading) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 p-4 md:p-8 overflow-y-auto">
        <div className="mx-auto max-w-6xl">
          <Skeleton className="h-12 w-64 mb-3" />
          <Skeleton className="h-6 w-96 mb-8" />
          <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-48 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              12th grade subjects
            </p>
          </div>

          {/* Subject Cards */}
          <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 content-scroll mb-8">
            {subjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => onSelectSubject(subject.id)}
                className="group relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 text-left shadow-sm transition-all hover:shadow-lg hover:-translate-y-1"
              >
                {/* Color accent bar */}
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: subject.color }}
                />

                {/* Icon */}
                <div
                  className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg text-2xl"
                  style={{ backgroundColor: `${subject.color}20` }}
                >
                  {subject.icon}
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {subject.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  {subject.description}
                </p>

                {/* Arrow */}
                <div className="flex items-center gap-2 text-sm font-medium" style={{ color: subject.color }}>
                  Start Learning
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer at the bottom - full width */}
      <Footer />
    </>
  );
}