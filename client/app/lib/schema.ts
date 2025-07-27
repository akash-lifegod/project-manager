import { z } from 'zod';

export const signInSchema = z.object({
  email: z.string().email('Email is required'),
  password: z.string().min(8, 'Password is required'),
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


export const resetPasswordSchema = z.object({
  newPassword: z.string().min(8,"Password must be at least 8 characters long"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters long"),
})
.refine((data) => data.newPassword === data.confirmPassword, {
  path: ["confirmPassword"],
  message: "Passwords don't match",
});


export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})


export const workspaceSchema = z.object({
  name: z.string().min(3, 'Workspace name must be at least 3 characters long'),
  color: z.string().min(3, 'Color must be at least 3 characters long'),
  description: z.string().optional(),
});