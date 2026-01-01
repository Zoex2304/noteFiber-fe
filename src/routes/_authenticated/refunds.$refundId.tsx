import { createFileRoute } from '@tanstack/react-router';
import { RefundDetail } from '@/pages/refunds/RefundDetail';

export const Route = createFileRoute('/_authenticated/refunds/$refundId')({
    component: RefundDetail,
});
