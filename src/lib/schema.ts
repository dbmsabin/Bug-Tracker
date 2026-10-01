import { z } from "zod";

export const bugSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  severity: z.enum(["Low", "Medium", "High", "Critical"]),
  status: z.enum(["Open", "In Progress", "Resolved", "Closed"]),
  stepsToReproduce: z.string().min(1, "Steps to reproduce are required"),
  createdAt: z.string(),
});

export type Bug = z.infer<typeof bugSchema>;
export type Severity = Bug["severity"];
export type Status = Bug["status"];
