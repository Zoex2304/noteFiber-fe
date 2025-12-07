import { z } from 'zod';
import { planSchema, checkoutRequestSchema, checkoutResponseSchema } from './payment.schemas';

export type Plan = z.infer<typeof planSchema>;
export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;
export type CheckoutResponse = z.infer<typeof checkoutResponseSchema>;
