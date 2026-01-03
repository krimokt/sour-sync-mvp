import { z } from 'zod';

export class ValidationError extends Error {
  issues: z.ZodIssue[];
  constructor(issues: z.ZodIssue[]) {
    super('Validation failed');
    this.issues = issues;
  }
}

export async function readJson<T = unknown>(req: Request): Promise<T | null> {
  try {
    return (await req.json()) as T;
  } catch {
    return null;
  }
}

export function parseWithSchema<T extends z.ZodTypeAny>(schema: T, data: unknown): z.infer<T> {
  const result = schema.safeParse(data);
  if (!result.success) throw new ValidationError(result.error.issues);
  return result.data;
}

export const slugSchema = z.string().min(1).max(100).regex(/^[a-z0-9-]+$/i);
export const uuidSchema = z.string().uuid();


