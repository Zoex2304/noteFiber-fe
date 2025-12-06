import { z } from 'zod';
import * as schemas from './payment.schemas';

export type Plan = z.infer<typeof schemas.planSchema>;
export type CheckoutRequest = z.infer<typeof schemas.checkoutRequestSchema>;
export type CheckoutResponse = z.infer<typeof schemas.checkoutResponseSchema>;
