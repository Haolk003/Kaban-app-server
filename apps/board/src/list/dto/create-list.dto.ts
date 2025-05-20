import { z } from 'zod';


export interface CreateListDto {
  name: string;
  boardId: string;
  description?: string;
  color?: string;
  icon?: string;
}

export const createListSchema = z.object({
  name: z
    .string()
    .min(1, 'List name is required')
    .max(100, 'List name must be less than 100 characters'),
  boardId: z.string().cuid('Invalid board ID'),
  description: z.string().max(500).optional(),
  color: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .optional(),
  icon: z.string().optional(),
});

