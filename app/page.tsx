import { getProjects, getPriorities } from "@/lib/actions";
import { EisenhowerBoard } from "@/components/eisenhower-board";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [projects, priorities] = await Promise.all([
    getProjects(),
    getPriorities(),
  ]);

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card px-6 py-5">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground text-balance">
              Eisenhower Matrix
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Drag projects between quadrants to reprioritize
            </p>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-6 py-6">
        <Suspense fallback={<BoardSkeleton />}>
          <EisenhowerBoard
            initialProjects={projects}
            priorities={priorities}
          />
        </Suspense>
      </div>
    </main>
  );
}

function BoardSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 aspect-[4/3]">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-border bg-card animate-pulse"
        />
      ))}
    </div>
  );
}
