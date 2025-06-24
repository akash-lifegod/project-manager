import { z } from 'zod';

export const signInSchema = z.object({
  email: z.string().email('Email is required'),
  password: z.string().min(6, 'Password is required'),
});

