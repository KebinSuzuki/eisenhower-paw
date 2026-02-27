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
import { Loader2 } from "lucide-react";

interface PositionData {
  _id: string;
  idPosition: number;
  position: string;
}

export function PersonFormDialog({
  open,
  onOpenChange,
  positions,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  positions: PositionData[];
  onSubmit: (data: {
    name: string;
    lastName: string;
    idPosition: number;
  }) => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [positionId, setPositionId] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !lastName || !positionId) return;
    setLoading(true);
    try {
      await onSubmit({
        name,
        lastName,
        idPosition: Number(positionId),
      });
      setName("");
      setLastName("");
      setPositionId("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Person</DialogTitle>
          <DialogDescription>
            Add a new team member to your organization.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="person-name">First Name</Label>
              <Input
                id="person-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="person-last">Last Name</Label>
              <Input
                id="person-last"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                required
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Position</Label>
            <Select value={positionId} onValueChange={setPositionId}>
              <SelectTrigger>
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                {positions.map((p) => (
                  <SelectItem
                    key={p.idPosition}
                    value={String(p.idPosition)}
                  >
                    {p.position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={loading} className="mt-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Create Person
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
