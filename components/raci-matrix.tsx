"use client";

import { useCallback } from "react";
import type { RACIRole } from "@/lib/models/task-assignment";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TaskData {
  _id: string;
  title: string;
}

interface PersonData {
  _id: string;
  name: string;
  lastName: string;
}

interface AssignmentData {
  taskId: string;
  personId: string;
  raciRole: RACIRole;
}

const RACI_CYCLE: (RACIRole)[] = [null, "R", "A", "C", "I"];

const RACI_STYLES: Record<string, { bg: string; text: string; label: string }> =
  {
    R: {
      bg: "bg-red-100 hover:bg-red-200",
      text: "text-red-700 font-semibold",
      label: "Responsible",
    },
    A: {
      bg: "bg-amber-100 hover:bg-amber-200",
      text: "text-amber-700 font-semibold",
      label: "Accountable",
    },
    C: {
      bg: "bg-sky-100 hover:bg-sky-200",
      text: "text-sky-700 font-semibold",
      label: "Consulted",
    },
    I: {
      bg: "bg-emerald-100 hover:bg-emerald-200",
      text: "text-emerald-700 font-semibold",
      label: "Informed",
    },
  };

export function RaciMatrix({
  tasks,
  members,
  assignments,
  onRaciChange,
}: {
  tasks: TaskData[];
  members: PersonData[];
  assignments: AssignmentData[];
  onRaciChange: (
    taskId: string,
    personId: string,
    newRole: RACIRole
  ) => void;
}) {
  const getRole = useCallback(
    (taskId: string, personId: string): RACIRole => {
      const assignment = assignments.find(
        (a) => a.taskId === taskId && a.personId === personId
      );
      return assignment?.raciRole ?? null;
    },
    [assignments]
  );

  const cycleRole = useCallback(
    (taskId: string, personId: string) => {
      const current = getRole(taskId, personId);
      const currentIndex = RACI_CYCLE.indexOf(current);
      const nextIndex = (currentIndex + 1) % RACI_CYCLE.length;
      onRaciChange(taskId, personId, RACI_CYCLE[nextIndex]);
    },
    [getRole, onRaciChange]
  );

  return (
    <TooltipProvider delayDuration={200}>
      <div className="rounded-lg border border-border/60 overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted/50">
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 border-b border-r border-border/40 min-w-[160px]">
                Task / Person
              </th>
              {members.map((member) => (
                <th
                  key={member._id}
                  className="text-center text-xs font-medium text-muted-foreground px-3 py-3 border-b border-r border-border/40 last:border-r-0 min-w-[80px]"
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-medium text-primary">
                      {member.name[0]}
                      {member.lastName[0]}
                    </div>
                    <span className="truncate max-w-[72px]">
                      {member.name}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tasks.map((task, rowIndex) => (
              <tr
                key={task._id}
                className={cn(
                  rowIndex % 2 === 0 ? "bg-card" : "bg-muted/20"
                )}
              >
                <td className="text-sm font-medium text-foreground px-4 py-2.5 border-r border-border/40 truncate max-w-[200px]">
                  {task.title}
                </td>
                {members.map((member) => {
                  const role = getRole(task._id, member._id);
                  const style = role ? RACI_STYLES[role] : null;
                  return (
                    <td
                      key={member._id}
                      className="text-center border-r border-border/40 last:border-r-0 p-1"
                    >
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => cycleRole(task._id, member._id)}
                            className={cn(
                              "w-full h-8 rounded-md text-xs transition-all duration-150 cursor-pointer",
                              style
                                ? `${style.bg} ${style.text}`
                                : "bg-transparent hover:bg-muted/40 text-muted-foreground/30"
                            )}
                            aria-label={`Set RACI role for ${task.title} and ${member.name} ${member.lastName}`}
                          >
                            {role ?? "-"}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                          {style ? (
                            <span>
                              <span className="font-semibold">
                                {style.label}
                              </span>{" "}
                              - Click to change
                            </span>
                          ) : (
                            "Click to assign role"
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center gap-4 flex-wrap">
        {Object.entries(RACI_STYLES).map(([key, style]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded text-[10px]",
                style.bg,
                style.text
              )}
            >
              {key}
            </div>
            <span className="text-xs text-muted-foreground">
              {style.label}
            </span>
          </div>
        ))}
      </div>
    </TooltipProvider>
  );
}
