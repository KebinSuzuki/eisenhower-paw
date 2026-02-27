"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserPlus, Check } from "lucide-react";

interface PersonData {
  _id: string;
  name: string;
  lastName: string;
  idPosition: number;
}

interface PositionData {
  _id: string;
  idPosition: number;
  position: string;
}

export function MemberSelector({
  open,
  onOpenChange,
  people,
  currentMembers,
  positions,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  people: PersonData[];
  currentMembers: PersonData[];
  positions: PositionData[];
  onSelect: (personId: string) => void;
}) {
  const memberIds = new Set(currentMembers.map((m) => m._id));
  const getPositionLabel = (id: number) =>
    positions.find((p) => p.idPosition === id)?.position ?? "Unknown";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
          <DialogDescription>
            Select a person to add to this project.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-1.5 mt-2 max-h-[320px] overflow-y-auto">
          {people.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No people available. Create a person first.
            </p>
          ) : (
            people.map((person) => {
              const isAdded = memberIds.has(person._id);
              return (
                <Button
                  key={person._id}
                  variant="ghost"
                  className="justify-start gap-3 h-auto py-2.5 px-3"
                  disabled={isAdded}
                  onClick={() => {
                    onSelect(person._id);
                    onOpenChange(false);
                  }}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary shrink-0">
                    {person.name[0]}
                    {person.lastName[0]}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">
                      {person.name} {person.lastName}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {getPositionLabel(person.idPosition)}
                    </p>
                  </div>
                  {isAdded ? (
                    <Check className="h-4 w-4 text-primary ml-auto" />
                  ) : (
                    <UserPlus className="h-4 w-4 text-muted-foreground/40 ml-auto" />
                  )}
                </Button>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
