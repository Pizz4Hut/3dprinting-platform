import React from 'react';
import { OrderStatus } from '@/lib/types';

interface Props {
  status: OrderStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const OrderStatusBadge: React.FC<Props> = ({ status, size = 'md' }) => {
  const configs: Record<
    OrderStatus,
    { label: string; bg: string; text: string; border: string; dot: string }
  > = {
    PENDING_PAYMENT: {
      label: 'PENDING PAYMENT',
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-300',
      dot: 'bg-amber-500',
    },
    PAYMENT_SUBMITTED: {
      label: 'SLIP SUBMITTED (VERIFYING)',
      bg: 'bg-blue-50',
      text: 'text-blue-800',
      border: 'border-blue-300',
      dot: 'bg-blue-500 animate-pulse',
    },
    PAYMENT_VERIFIED: {
      label: 'PAYMENT VERIFIED',
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-300',
      dot: 'bg-emerald-500',
    },
    PRINTING: {
      label: 'IN PRODUCTION (PRINTING)',
      bg: 'bg-indigo-50',
      text: 'text-indigo-800',
      border: 'border-indigo-300',
      dot: 'bg-indigo-600 animate-ping',
    },
    COMPLETED: {
      label: 'PRINT COMPLETED',
      bg: 'bg-teal-50',
      text: 'text-teal-800',
      border: 'border-teal-300',
      dot: 'bg-teal-500',
    },
    SHIPPED: {
      label: 'DISPATCHED / SHIPPED',
      bg: 'bg-slate-100',
      text: 'text-slate-800',
      border: 'border-slate-300',
      dot: 'bg-slate-600',
    },
    CANCELLED: {
      label: 'CANCELLED',
      bg: 'bg-rose-50',
      text: 'text-rose-800',
      border: 'border-rose-300',
      dot: 'bg-rose-500',
    },
  };

  const current = configs[status] || configs.PENDING_PAYMENT;
  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-[10px]'
      : size === 'lg'
      ? 'px-3.5 py-1.5 text-xs'
      : 'px-2.5 py-1 text-[11px]';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono uppercase tracking-wider font-semibold rounded border ${current.bg} ${current.text} ${current.border} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />
      {current.label}
    </span>
  );
};
