"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { EisenhowerQuadrant } from "@/lib/models/project";
import { Loader2 } from "lucide-react";

interface PriorityData {
  _id: string;
  priorityId: number;
  titlePriority: string;
}

const QUADRANT_OPTIONS: { value: EisenhowerQuadrant; label: string }[] = [
  { value: "DO", label: "Do First (Urgent & Important)" },
  { value: "SCHEDULE", label: "Schedule (Not Urgent & Important)" },
  { value: "DELEGATE", label: "Delegate (Urgent & Not Important)" },
  { value: "ELIMINATE", label: "Eliminate (Not Urgent & Not Important)" },
];

export function ProjectFormDialog({
  open,
  onOpenChange,
  priorities,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  priorities: PriorityData[];
  onSubmit: (data: {
    title: string;
    fromDate: string;
    toDate: string;
    priorityId: number;
    eisenhowerQuadrant: EisenhowerQuadrant;
  }) => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [priorityId, setPriorityId] = useState<string>("");
  const [quadrant, setQuadrant] = useState<EisenhowerQuadrant>("SCHEDULE");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !fromDate || !toDate || !priorityId) return;
    setLoading(true);
    try {
      await onSubmit({
        title,
        fromDate,
        toDate,
        priorityId: Number(priorityId),
        eisenhowerQuadrant: quadrant,
      });
      setTitle("");
      setFromDate("");
      setToDate("");
      setPriorityId("");
      setQuadrant("SCHEDULE");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Project</DialogTitle>
          <DialogDescription>
            Add a project and place it on the Eisenhower matrix.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="project-title">Title</Label>
            <Input
              id="project-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Project name"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="from-date">Start Date</Label>
              <Input
                id="from-date"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="to-date">End Date</Label>
              <Input
                id="to-date"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Priority</Label>
            <Select value={priorityId} onValueChange={setPriorityId}>
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                {priorities.map((p) => (
                  <SelectItem key={p.priorityId} value={String(p.priorityId)}>
                    {p.titlePriority}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Eisenhower Quadrant</Label>
            <Select
              value={quadrant}
              onValueChange={(v) => setQuadrant(v as EisenhowerQuadrant)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {QUADRANT_OPTIONS.map((q) => (
                  <SelectItem key={q.value} value={q.value}>
                    {q.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={loading} className="mt-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Create Project
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
