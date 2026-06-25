//  Optional types non zod types : )
import { z } from 'zod';

export const signUpSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
});

export type signUpInput = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
export type signInInput = z.infer<typeof signInSchema>;
