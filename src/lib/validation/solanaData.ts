import { z } from "zod";

export const createSolanaDataSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  content: z.string().optional(),
});

export type CreateSolanaDataSchema = z.infer<typeof createSolanaDataSchema>;

export const updateSolanaDataSchema = createSolanaDataSchema.extend({
  id: z.string().min(1),
});

export const deleteSolanaDataSchema = z.object({
  id: z.string().min(1),
});

export const createAutomationSolanaDataSchema = z.object({
  key: z.string().min(1, { message: "Key is required" }),
  title: z.string().min(1, { message: "Title is required" }),
  content: z.string().optional(),
});
