import { z } from 'zod';

export const signInSchema = z.object({
  email: z.string().email('Email is required'),
  password: z.string().min(6, 'Password is required'),
});


export const signUpSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 character long'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  confirmPassword: z.string().min(8, 'Password must be at least 8 characters long'),
})
.refine((data) => data.password === data.confirmPassword, {
  path: ['confirmPassword'],
  message: "Passwords don't match",
})
