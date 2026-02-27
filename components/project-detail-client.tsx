"use client";

import { useState, useCallback } from "react";
import {
  createTask,
  deleteTask,
  addProjectMember,
  removeProjectMember,
  setTaskAssignment,
  createPerson,
} from "@/lib/actions";
import type { RACIRole } from "@/lib/models/task-assignment";
import { RaciMatrix } from "@/components/raci-matrix";
import { TaskFormDialog } from "@/components/task-form-dialog";
import { PersonFormDialog } from "@/components/person-form-dialog";
import { MemberSelector } from "@/components/member-selector";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  Trash2,
  CalendarDays,
  ListTodo,
  Users,
  LayoutGrid,
} from "lucide-react";

interface TaskData {
  _id: string;
  title: string;
  description: string;
  fromDate: string;
  endDate: string;
  priorityId: number;
}

interface PersonData {
  _id: string;
  name: string;
  lastName: string;
  idPosition: number;
}

interface AssignmentData {
  _id: string;
  taskId: string;
  personId: string;
  raciRole: RACIRole;
}

interface PriorityData {
  _id: string;
  priorityId: number;
  titlePriority: string;
}

interface PositionData {
  _id: string;
  idPosition: number;
  position: string;
}

export function ProjectDetailClient({
  project,
  initialTasks,
  initialMembers,
  initialAssignments,
  priorities,
  allPeople,
  positions,
}: {
  project: { _id: string; title: string };
  initialTasks: TaskData[];
  initialMembers: PersonData[];
  initialAssignments: AssignmentData[];
  priorities: PriorityData[];
  allPeople: PersonData[];
  positions: PositionData[];
}) {
  const [tasks, setTasks] = useState<TaskData[]>(initialTasks);
  const [members, setMembers] = useState<PersonData[]>(initialMembers);
  const [assignments, setAssignments] =
    useState<AssignmentData[]>(initialAssignments);
  const [people, setPeople] = useState<PersonData[]>(allPeople);

  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [personDialogOpen, setPersonDialogOpen] = useState(false);
  const [memberSelectorOpen, setMemberSelectorOpen] = useState(false);

  const handleCreateTask = async (data: {
    title: string;
    description: string;
    fromDate: string;
    endDate: string;
    priorityId: number;
  }) => {
    const newTask = await createTask(project._id, data);
    setTasks((prev) => [...prev, newTask]);
    setTaskDialogOpen(false);
  };

  const handleDeleteTask = async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t._id !== taskId));
    setAssignments((prev) => prev.filter((a) => a.taskId !== taskId));
    await deleteTask(project._id, taskId);
  };

  const handleAddMember = async (personId: string) => {
    const person = people.find((p) => p._id === personId);
    if (!person || members.some((m) => m._id === personId)) return;
    setMembers((prev) => [...prev, person]);
    await addProjectMember(project._id, personId);
  };

  const handleRemoveMember = async (personId: string) => {
    setMembers((prev) => prev.filter((m) => m._id !== personId));
    setAssignments((prev) => prev.filter((a) => a.personId !== personId));
    await removeProjectMember(project._id, personId);
  };

  const handleRaciChange = useCallback(
    async (taskId: string, personId: string, newRole: RACIRole) => {
      setAssignments((prev) => {
        const existing = prev.find(
          (a) => a.taskId === taskId && a.personId === personId
        );
        if (newRole === null) {
          return prev.filter(
            (a) => !(a.taskId === taskId && a.personId === personId)
          );
        }
        if (existing) {
          return prev.map((a) =>
            a.taskId === taskId && a.personId === personId
              ? { ...a, raciRole: newRole }
              : a
          );
        }
        return [
          ...prev,
          {
            _id: `temp-${Date.now()}`,
            taskId,
            personId,
            raciRole: newRole,
          },
        ];
      });
      await setTaskAssignment(taskId, personId, newRole, project._id);
    },
    [project._id]
  );

  const handleCreatePerson = async (data: {
    name: string;
    lastName: string;
    idPosition: number;
  }) => {
    const newPerson = await createPerson(data);
    setPeople((prev) => [...prev, newPerson]);
    setPersonDialogOpen(false);
  };

  const getPriorityLabel = (id: number) =>
    priorities.find((p) => p.priorityId === id)?.titlePriority ?? "Unknown";

  const getPositionLabel = (id: number) =>
    positions.find((p) => p.idPosition === id)?.position ?? "Unknown";

  return (
    <div className="flex flex-col gap-6">
      {/* Tasks Section */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ListTodo className="h-4.5 w-4.5 text-primary" />
              <CardTitle className="text-base">Tasks</CardTitle>
              <Badge variant="secondary" className="text-xs bg-secondary text-secondary-foreground">
                {tasks.length}
              </Badge>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setTaskDialogOpen(true)}
              className="gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Task
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <ListTodo className="h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">No tasks yet</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Add your first task to get started
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {tasks.map((task) => (
                <TaskRow
                  key={task._id}
                  task={task}
                  priorityLabel={getPriorityLabel(task.priorityId)}
                  onDelete={() => handleDeleteTask(task._id)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Team Members Section */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4.5 w-4.5 text-primary" />
              <CardTitle className="text-base">Team Members</CardTitle>
              <Badge variant="secondary" className="text-xs bg-secondary text-secondary-foreground">
                {members.length}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPersonDialogOpen(true)}
                className="gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                New Person
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setMemberSelectorOpen(true)}
                className="gap-1.5"
              >
                <Users className="h-3.5 w-3.5" />
                Assign Member
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Users className="h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">No members yet</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Add team members to assign RACI roles
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {members.map((member) => (
                <div
                  key={member._id}
                  className="group flex items-center gap-2 rounded-lg border border-border/60 bg-secondary/30 px-3 py-2 text-sm"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                    {member.name[0]}
                    {member.lastName[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground leading-tight">
                      {member.name} {member.lastName}
                    </p>
                    <p className="text-[11px] text-muted-foreground leading-tight">
                      {getPositionLabel(member.idPosition)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveMember(member._id)}
                    className="ml-1 opacity-0 group-hover:opacity-100 text-muted-foreground/40 hover:text-destructive transition-all"
                    aria-label={`Remove ${member.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* RACI Matrix Section */}
      {tasks.length > 0 && members.length > 0 && (
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <LayoutGrid className="h-4.5 w-4.5 text-primary" />
              <CardTitle className="text-base">RACI Matrix</CardTitle>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Click cells to cycle through roles: R (Responsible), A
              (Accountable), C (Consulted), I (Informed)
            </p>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <RaciMatrix
              tasks={tasks}
              members={members}
              assignments={assignments}
              onRaciChange={handleRaciChange}
            />
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <TaskFormDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        priorities={priorities}
        onSubmit={handleCreateTask}
      />
      <PersonFormDialog
        open={personDialogOpen}
        onOpenChange={setPersonDialogOpen}
        positions={positions}
        onSubmit={handleCreatePerson}
      />
      <MemberSelector
        open={memberSelectorOpen}
        onOpenChange={setMemberSelectorOpen}
        people={people}
        currentMembers={members}
        positions={positions}
        onSelect={handleAddMember}
      />
    </div>
  );
}

function TaskRow({
  task,
  priorityLabel,
  onDelete,
}: {
  task: TaskData;
  priorityLabel: string;
  onDelete: () => void;
}) {
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

  return (
    <div className="group flex items-center gap-3 rounded-lg border border-border/40 bg-card px-4 py-3 transition-colors hover:bg-accent/30">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground truncate">
            {task.title}
          </p>
          <Badge
            variant="outline"
            className="text-[10px] h-4 px-1.5 shrink-0"
          >
            {priorityLabel}
          </Badge>
        </div>
        {task.description && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {task.description}
          </p>
        )}
      </div>
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground shrink-0">
        <CalendarDays className="h-3 w-3" />
        {fmt(task.fromDate)} - {fmt(task.endDate)}
      </div>
      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 text-muted-foreground/40 hover:text-destructive transition-all"
        aria-label={`Delete ${task.title}`}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
