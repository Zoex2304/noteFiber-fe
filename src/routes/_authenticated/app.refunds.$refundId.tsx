import { createFileRoute } from '@tanstack/react-router';
import { RefundDetail } from '@/pages/refunds/RefundDetail';

export const Route = createFileRoute('/_authenticated/app/refunds/$refundId')({
    component: RefundDetail,
});
