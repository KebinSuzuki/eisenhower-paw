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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface PriorityData {
  _id: string;
  priorityId: number;
  titlePriority: string;
}

export function TaskFormDialog({
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
    description: string;
    fromDate: string;
    endDate: string;
    priorityId: number;
  }) => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [priorityId, setPriorityId] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !fromDate || !endDate || !priorityId) return;
    setLoading(true);
    try {
      await onSubmit({
        title,
        description,
        fromDate,
        endDate,
        priorityId: Number(priorityId),
      });
      setTitle("");
      setDescription("");
      setFromDate("");
      setEndDate("");
      setPriorityId("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Task</DialogTitle>
          <DialogDescription>
            Add a task to this project.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="task-title">Title</Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task name"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="task-desc">Description</Label>
            <Textarea
              id="task-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="task-from">Start Date</Label>
              <Input
                id="task-from"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="task-end">End Date</Label>
              <Input
                id="task-end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
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
          <Button type="submit" disabled={loading} className="mt-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Create Task
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
