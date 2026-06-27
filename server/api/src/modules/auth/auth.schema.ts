//  Optional types non zod types : )
import { z } from 'zod';

export const signUpSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
});

export type SignUpInput = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
export type SignInInput = z.infer<typeof signInSchema>;

export const resendVerificationTokenSchema = z.object({
  email: z.string().email(),
});

export type EmailInput = z.infer<typeof resendVerificationTokenSchema>;

export const verifyUserSchema = z.object({
  token: z.string().regex(/^[a-f0-9]{64}$/),
});

export type VerifyUserInput = z.infer<typeof verifyUserSchema>;
