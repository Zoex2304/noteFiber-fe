import { z } from 'zod';
import * as schemas from './auth.schemas';

// Request Types
export type LoginRequest = z.infer<typeof schemas.loginRequestSchema>;
export type RegisterRequest = z.infer<typeof schemas.registerRequestSchema>;
export type VerifyEmailRequest = z.infer<typeof schemas.verifyEmailRequestSchema>;
export type ForgotPasswordRequest = z.infer<typeof schemas.forgotPasswordRequestSchema>;
export type ResetPasswordRequest = z.infer<typeof schemas.resetPasswordRequestSchema>;

// Response DTOs
export type User = z.infer<typeof schemas.userSchema>;
export type LoginData = z.infer<typeof schemas.loginResponseSchema>;
export type RegisterData = z.infer<typeof schemas.registerResponseSchema>;

// No data response
export type VoidResponse = null;
