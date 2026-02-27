"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { updateProjectQuadrant, createProject, deleteProject } from "@/lib/actions";
import type { EisenhowerQuadrant } from "@/lib/models/project";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProjectFormDialog } from "@/components/project-form-dialog";
import {
  Flame,
  Clock,
  Users,
  Trash2,
  Plus,
  GripVertical,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

interface ProjectData {
  _id: string;
  title: string;
  fromDate: string;
  toDate: string;
  priorityId: number;
  eisenhowerQuadrant: EisenhowerQuadrant;
}

interface PriorityData {
  _id: string;
  priorityId: number;
  titlePriority: string;
}

const QUADRANTS: {
  id: EisenhowerQuadrant;
  label: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  border: string;
  headerBg: string;
}[] = [
  {
    id: "DO",
    label: "Do First",
    subtitle: "Urgent & Important",
    icon: <Flame className="h-4 w-4" />,
    color: "text-red-700",
    bg: "bg-red-50/60",
    border: "border-red-200/60",
    headerBg: "bg-red-100/60",
  },
  {
    id: "SCHEDULE",
    label: "Schedule",
    subtitle: "Not Urgent & Important",
    icon: <Clock className="h-4 w-4" />,
    color: "text-amber-700",
    bg: "bg-amber-50/60",
    border: "border-amber-200/60",
    headerBg: "bg-amber-100/60",
  },
  {
    id: "DELEGATE",
    label: "Delegate",
    subtitle: "Urgent & Not Important",
    icon: <Users className="h-4 w-4" />,
    color: "text-sky-700",
    bg: "bg-sky-50/60",
    border: "border-sky-200/60",
    headerBg: "bg-sky-100/60",
  },
  {
    id: "ELIMINATE",
    label: "Eliminate",
    subtitle: "Not Urgent & Not Important",
    icon: <Trash2 className="h-4 w-4" />,
    color: "text-slate-500",
    bg: "bg-slate-50/60",
    border: "border-slate-200/60",
    headerBg: "bg-slate-100/60",
  },
];

export function EisenhowerBoard({
  initialProjects,
  priorities,
}: {
  initialProjects: ProjectData[];
  priorities: PriorityData[];
}) {
  const [projects, setProjects] = useState<ProjectData[]>(initialProjects);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);

      if (!over) return;

      const projectId = active.id as string;
      const newQuadrant = over.id as EisenhowerQuadrant;

      const project = projects.find((p) => p._id === projectId);
      if (!project || project.eisenhowerQuadrant === newQuadrant) return;

      setProjects((prev) =>
        prev.map((p) =>
          p._id === projectId ? { ...p, eisenhowerQuadrant: newQuadrant } : p
        )
      );

      await updateProjectQuadrant(projectId, newQuadrant);
    },
    [projects]
  );

  const handleCreateProject = async (data: {
    title: string;
    fromDate: string;
    toDate: string;
    priorityId: number;
    eisenhowerQuadrant: EisenhowerQuadrant;
  }) => {
    const newProject = await createProject(data);
    setProjects((prev) => [...prev, newProject]);
    setDialogOpen(false);
  };

  const handleDeleteProject = async (id: string) => {
    setProjects((prev) => prev.filter((p) => p._id !== id));
    await deleteProject(id);
  };

  const activeProject = projects.find((p) => p._id === activeId);

  const getPriorityLabel = (priorityId: number) => {
    return (
      priorities.find((p) => p.priorityId === priorityId)?.titlePriority ??
      "Unknown"
    );
  };

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs font-medium bg-secondary text-secondary-foreground">
            {projects.length} project{projects.length !== 1 ? "s" : ""}
          </Badge>
        </div>
        <Button onClick={() => setDialogOpen(true)} size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {QUADRANTS.map((quadrant) => {
            const quadrantProjects = projects.filter(
              (p) => p.eisenhowerQuadrant === quadrant.id
            );
            return (
              <QuadrantDropZone
                key={quadrant.id}
                quadrant={quadrant}
                projects={quadrantProjects}
                getPriorityLabel={getPriorityLabel}
                onDelete={handleDeleteProject}
              />
            );
          })}
        </div>

        <DragOverlay dropAnimation={null}>
          {activeProject ? (
            <ProjectCardOverlay
              project={activeProject}
              priorityLabel={getPriorityLabel(activeProject.priorityId)}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      <ProjectFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        priorities={priorities}
        onSubmit={handleCreateProject}
      />
    </>
  );
}

function QuadrantDropZone({
  quadrant,
  projects,
  getPriorityLabel,
  onDelete,
}: {
  quadrant: (typeof QUADRANTS)[number];
  projects: ProjectData[];
  getPriorityLabel: (id: number) => string;
  onDelete: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: quadrant.id });

  return (
    <div
      ref={setNodeRef}
      className={`
        rounded-xl border-2 transition-all duration-200 min-h-[220px] flex flex-col
        ${quadrant.border} ${quadrant.bg}
        ${isOver ? "ring-2 ring-primary/30 scale-[1.01] shadow-lg" : ""}
      `}
    >
      <div
        className={`flex items-center gap-2 px-4 py-3 rounded-t-[10px] ${quadrant.headerBg}`}
      >
        <span className={quadrant.color}>{quadrant.icon}</span>
        <div>
          <h2 className={`text-sm font-semibold ${quadrant.color}`}>
            {quadrant.label}
          </h2>
          <p className="text-[11px] text-muted-foreground">
            {quadrant.subtitle}
          </p>
        </div>
        <Badge
          variant="secondary"
          className="ml-auto text-[10px] h-5 bg-background/60 text-muted-foreground"
        >
          {projects.length}
        </Badge>
      </div>
      <div className="flex-1 p-3 flex flex-col gap-2">
        {projects.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-xs text-muted-foreground/60">
              Drop projects here
            </p>
          </div>
        )}
        {projects.map((project) => (
          <DraggableProjectCard
            key={project._id}
            project={project}
            priorityLabel={getPriorityLabel(project.priorityId)}
            onDelete={() => onDelete(project._id)}
          />
        ))}
      </div>
    </div>
  );
}

function DraggableProjectCard({
  project,
  priorityLabel,
  onDelete,
}: {
  project: ProjectData;
  priorityLabel: string;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: project._id });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.3 : 1,
  };

  const fromDate = new Date(project.fromDate);
  const toDate = new Date(project.toDate);
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-start gap-2 rounded-lg border border-border/60 bg-card p-3 shadow-sm transition-shadow hover:shadow-md"
    >
      <button
        {...listeners}
        {...attributes}
        className="mt-0.5 cursor-grab touch-none text-muted-foreground/40 hover:text-muted-foreground"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Link
            href={`/projects/${project._id}`}
            className="text-sm font-medium text-foreground hover:text-primary truncate transition-colors"
          >
            {project.title}
          </Link>
          <Link
            href={`/projects/${project._id}`}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary"
            aria-label={`Open ${project.title}`}
          >
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
          <span>
            {fmt(fromDate)} - {fmt(toDate)}
          </span>
          <Badge
            variant="outline"
            className="text-[10px] h-4 px-1.5 bg-background/60"
          >
            {priorityLabel}
          </Badge>
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="opacity-0 group-hover:opacity-100 mt-0.5 text-muted-foreground/40 hover:text-destructive transition-all"
        aria-label={`Delete ${project.title}`}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function ProjectCardOverlay({
  project,
  priorityLabel,
}: {
  project: ProjectData;
  priorityLabel: string;
}) {
  const fromDate = new Date(project.fromDate);
  const toDate = new Date(project.toDate);
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <div className="flex items-start gap-2 rounded-lg border border-primary/30 bg-card p-3 shadow-xl rotate-2 scale-105">
      <GripVertical className="mt-0.5 h-4 w-4 text-muted-foreground/40" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {project.title}
        </p>
        <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
          <span>
            {fmt(fromDate)} - {fmt(toDate)}
          </span>
          <Badge
            variant="outline"
            className="text-[10px] h-4 px-1.5 bg-background/60"
          >
            {priorityLabel}
          </Badge>
        </div>
      </div>
    </div>
  );
}
