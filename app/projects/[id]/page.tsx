import { notFound } from "next/navigation";
import {
  getProjectById,
  getTasksByProject,
  getProjectMembers,
  getTaskAssignments,
  getPriorities,
  getPeople,
  getPositions,
} from "@/lib/actions";
import { ProjectDetailClient } from "@/components/project-detail-client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [project, tasks, members, priorities, allPeople, positions] =
    await Promise.all([
      getProjectById(id),
      getTasksByProject(id),
      getProjectMembers(id),
      getPriorities(),
      getPeople(),
      getPositions(),
    ]);

  if (!project) notFound();

  const taskIds = tasks.map((t: { _id: string }) => t._id);
  const assignments = taskIds.length > 0 ? await getTaskAssignments(taskIds) : [];

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card px-6 py-5">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Matrix
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground text-balance">
            {project.title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {new Date(project.fromDate).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}{" "}
            -{" "}
            {new Date(project.toDate).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-6 py-6">
        <ProjectDetailClient
          project={project}
          initialTasks={tasks}
          initialMembers={members}
          initialAssignments={assignments}
          priorities={priorities}
          allPeople={allPeople}
          positions={positions}
        />
      </div>
    </main>
  );
}
