"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bugSchema, Bug, Severity, Status } from "@/lib/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface BugFormProps {
  bug?: Bug;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (bug: Bug) => void;
}

export function BugForm({ bug, open, onOpenChange, onSubmit }: BugFormProps) {
  const isEditing = !!bug;

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<Bug>({
    resolver: zodResolver(bugSchema),
    defaultValues: bug || {
      id: crypto.randomUUID(),
      title: "",
      description: "",
      severity: "Medium",
      status: "Open",
      stepsToReproduce: "",
      createdAt: new Date().toISOString(),
    },
  });

  // Reset form when dialog opens/closes or bug changes
  if (open && bug && watch("id") !== bug.id) {
    reset(bug);
  } else if (open && !bug && watch("id") === "") {
    reset({
      id: crypto.randomUUID(),
      title: "",
      description: "",
      severity: "Medium",
      status: "Open",
      stepsToReproduce: "",
      createdAt: new Date().toISOString(),
    });
  }

  const handleFormSubmit = (data: Bug) => {
    onSubmit(data);
    onOpenChange(false);
    reset({ id: crypto.randomUUID(), title: "", description: "", severity: "Medium", status: "Open", stepsToReproduce: "", createdAt: new Date().toISOString() });
  };

  const severityValue = watch("severity");
  const statusValue = watch("status");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Bug" : "Report a Bug"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register("title")} placeholder="Short bug description" />
            {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register("description")} placeholder="Detailed description" />
            {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Severity</Label>
              <Select value={severityValue} onValueChange={(val) => setValue("severity", val as Severity)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectContent>
              </Select>
              {errors.severity && <p className="text-red-500 text-sm">{errors.severity.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusValue} onValueChange={(val) => setValue("status", val as Status)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && <p className="text-red-500 text-sm">{errors.status.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stepsToReproduce">Steps to Reproduce</Label>
            <Textarea id="stepsToReproduce" {...register("stepsToReproduce")} placeholder="1. Go to...&#10;2. Click on..." />
            {errors.stepsToReproduce && <p className="text-red-500 text-sm">{errors.stepsToReproduce.message}</p>}
          </div>

          <div className="flex justify-end pt-4">
            <Button type="button" variant="outline" className="mr-2" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">{isEditing ? "Save Changes" : "Submit Bug"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
