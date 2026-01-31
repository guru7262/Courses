import { ArrowRight } from "lucide-react";
import { Skeleton } from "@/app/components/ui/skeleton";
import { Footer } from "@/app/components/Footer";
import React from 'react';

interface Subject {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  categoryId?: string;
}

interface Category {
  id: string;
  name: string;
  order: number;
  subjects: Subject[];
}

interface SubjectSelectionPageProps {
  categories: Category[];
  loading?: boolean;
  onSelectSubject: (subjectId: string) => void;
}

export function SubjectSelectionPage({
  categories,
  loading = false,
  onSelectSubject,
}: SubjectSelectionPageProps) {

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    card.style.setProperty('--x', `${x}px`);
    card.style.setProperty('--y', `${y}px`);
  };

  if (loading) {
    return (
      <div className="bg-background p-4 md:p-8 min-h-full">
        <div className="mx-auto max-w-6xl">
          <Skeleton className="h-10 w-48 mb-4" />
          <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-12">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-48 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Main content area expands to fill space */}
      <div className="bg-background p-4 md:p-8 flex-1">
        <div className="mx-auto max-w-6xl">
          {categories.map((category) => (
            <div key={category.id} className="mb-12">
              <div className="mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  {category.name}
                </h2>
                <div className="h-1 w-20 bg-primary rounded-full"></div>
              </div>

              <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {category.subjects.map((subject) => (
                  <button
                    key={subject.id}
                    onMouseMove={handleMouseMove}
                    onClick={() => onSelectSubject(subject.id)}
                    style={{ '--clr': subject.color } as React.CSSProperties}
                    className="glow-card group relative overflow-hidden rounded-lg border border-border bg-card p-6 text-left shadow-sm transition-all hover:shadow-lg hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <div className="relative z-10 pointer-events-none">
                      <div
                        className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg text-xl"
                        style={{ backgroundColor: `${subject.color}20` }}
                      >
                        {subject.icon}
                      </div>

                      <h3 className="text-xl font-medium text-foreground mb-2">
                        {subject.name}
                      </h3>

                      <p className="text-muted-foreground text-sm mb-4">
                        {subject.description}
                      </p>

                      <div
                        className="flex items-center gap-2 text-sm font-medium"
                        style={{ color: subject.color }}
                      >
                        Start Learning
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Footer stays at the bottom */}
      <Footer />
    </div>
  );
}