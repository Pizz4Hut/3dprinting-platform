'use client';

import React, { useState } from 'react';
import { OrderItem, OrderStatus } from '@/lib/types';
import { OrderStatusBadge } from './OrderStatusBadge';
import {
  X,
  Download,
  CheckCircle,
  Clock,
  Printer,
  Truck,
  FileText,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Save,
  Eye,
} from 'lucide-react';

interface Props {
  order: OrderItem | null;
  onClose: () => void;
  onStatusUpdated: (updatedOrder: OrderItem) => void;
}

export const AdminOrderDrawer: React.FC<Props> = ({
  order,
  onClose,
  onStatusUpdated,
}) => {
  if (!order) return null;

  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(order.status);
  const [trackingNumber, setTrackingNumber] = useState<string>(order.trackingNumber || '');
  const [staffNotes, setStaffNotes] = useState<string>(order.staffNotes || '');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [slipModalOpen, setSlipModalOpen] = useState<boolean>(false);
  const [successNotice, setSuccessNotice] = useState<string>('');

  const handleUpdate = async (newStatus?: OrderStatus) => {
    setIsUpdating(true);
    setSuccessNotice('');
    try {
      const targetStatus = newStatus || currentStatus;
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: targetStatus,
          trackingNumber,
          staffNotes,
        }),
      });

      if (!res.ok) throw new Error('Failed to update order');
      const data = await res.json();
      setCurrentStatus(targetStatus);
      onStatusUpdated(data.order);
      setSuccessNotice('อัปเดตสถานะเรียบร้อยแล้ว');
      setTimeout(() => setSuccessNotice(''), 3000);
    } catch (err: any) {
      alert(err.message || 'Error updating order');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-900">
                INSPECTION TELEMETRY: {order.id}
              </span>
              <OrderStatusBadge status={currentStatus} size="sm" />
            </div>
            <p className="text-[11px] font-mono text-slate-500 mt-0.5">
              Ordered: {new Date(order.createdAt).toLocaleString('th-TH')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {successNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* 1. STL File & Staff Download Action */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block">
                  CUSTOMER 3D STL MODEL
                </span>
                <span className="text-sm font-mono font-bold text-slate-900">
                  {order.fileName}
                </span>
                <span className="text-xs text-slate-500 font-mono ml-2">
                  ({(order.fileSize / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
              <a
                href={`/api/orders/${order.id}/download`}
                download
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-mono font-bold shadow-sm transition-all"
              >
                <Download className="w-4 h-4" />
                <span>โหลดไฟล์ STL สำหรับ Slicer</span>
              </a>
            </div>

            {/* Model Dimensions */}
            <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-200 text-xs font-mono">
              <div>
                <span className="text-slate-400 text-[10px] block">DIMENSIONS</span>
                <span className="font-semibold text-slate-800">
                  {order.metrics.dimensionsMm.x}×{order.metrics.dimensionsMm.y}×{order.metrics.dimensionsMm.z} mm
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">VOLUME</span>
                <span className="font-semibold text-slate-800">{order.metrics.volumeCm3} cm³</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">NET WEIGHT</span>
                <span className="font-semibold text-slate-800">
                  {order.estimation.weightGrams} g (×{order.config.quantity} pcs)
                </span>
              </div>
            </div>
          </div>

          {/* 2. Print Configuration Selected by Customer */}
          <div className="border border-slate-200 rounded-lg p-4 space-y-3">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">
              FABRICATION SPECIFICATIONS (ช่างพิมพ์ต้องตั้งค่าตามนี้)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                <span className="text-slate-400 text-[10px] block">MATERIAL</span>
                <span className="font-bold text-slate-900">{order.config.material}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                <span className="text-slate-400 text-[10px] block">COLOR</span>
                <span className="font-bold text-slate-900">{order.config.color}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                <span className="text-slate-400 text-[10px] block">LAYER HEIGHT</span>
                <span className="font-bold text-slate-900">{order.config.quality}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                <span className="text-slate-400 text-[10px] block">INFILL DENSITY</span>
                <span className="font-bold text-slate-900">
                  {order.config.infillPercent}% ({order.config.infillPattern})
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                <span className="text-slate-400 text-[10px] block">SUPPORTS</span>
                <span className="font-bold text-slate-900">
                  {order.config.supports ? 'YES (ต้องการ)' : 'NO (ไม่ต้องใช้)'}
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                <span className="text-slate-400 text-[10px] block">QUANTITY</span>
                <span className="font-bold text-blue-600">{order.config.quantity} ชิ้น</span>
              </div>
            </div>

            {order.config.specialInstructions && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs">
                <span className="font-semibold text-amber-900 block font-mono">
                  หมายเหตุจากลูกค้า:
                </span>
                <p className="text-amber-800 mt-1">{order.config.specialInstructions}</p>
              </div>
            )}
          </div>

          {/* 3. Payment Verification & Slip Inspector */}
          <div className="border border-slate-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold">
                PAYMENT AUDIT (ยอดเงิน: ฿{order.estimation.totalPrice.toLocaleString()} THB)
              </span>
              <span className="text-xs font-mono font-bold text-slate-700">
                {order.payment.method}
              </span>
            </div>

            {order.payment.slipUrl ? (
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-200">
                <div className="flex items-center gap-3">
                  <img
                    src={order.payment.slipUrl}
                    alt="Payment Slip"
                    className="w-16 h-16 rounded object-cover border border-slate-300 shadow-sm cursor-pointer"
                    onClick={() => setSlipModalOpen(true)}
                  />
                  <div>
                    <span className="text-xs font-mono font-bold text-slate-800 block">
                      มีหลักฐานสลิปโอนเงิน
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      โอนเมื่อ: {order.payment.paidAt ? new Date(order.payment.paidAt).toLocaleTimeString('th-TH') : '-'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSlipModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-100 text-xs font-mono font-semibold text-slate-700 shadow-sm"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>ซูมดูสลิป</span>
                </button>
              </div>
            ) : (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded font-mono">
                ยังไม่มีการแนบสลิปโอนเงินสำหรับออเดอร์นี้
              </div>
            )}
          </div>

          {/* 4. Customer Information */}
          <div className="border border-slate-200 rounded-lg p-4 space-y-2 text-xs font-mono">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">
              DELIVERY DESTINATION
            </span>
            <div className="text-slate-800">
              <span className="text-slate-400">ผู้รับ:</span> {order.customer.name} ({order.customer.phone})
            </div>
            <div className="text-slate-800">
              <span className="text-slate-400">อีเมล:</span> {order.customer.email}
            </div>
            <div className="text-slate-800">
              <span className="text-slate-400">ที่อยู่จัดส่ง:</span> {order.customer.address}
            </div>
          </div>

          {/* 5. Production Workflow Actions & Status Update */}
          <div className="border border-slate-200 rounded-lg p-4 space-y-4 bg-slate-50">
            <span className="text-[10px] font-mono uppercase text-slate-600 font-bold block">
              OPERATIONAL WORKFLOW CONTROLS
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleUpdate('PAYMENT_VERIFIED')}
                className={`p-2 rounded text-xs font-mono font-semibold border flex flex-col items-center justify-center gap-1 transition-all ${
                  currentStatus === 'PAYMENT_VERIFIED'
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                    : 'bg-white hover:bg-emerald-50 text-emerald-800 border-slate-200'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                <span>1. ยืนยันสลิป</span>
              </button>

              <button
                type="button"
                onClick={() => handleUpdate('PRINTING')}
                className={`p-2 rounded text-xs font-mono font-semibold border flex flex-col items-center justify-center gap-1 transition-all ${
                  currentStatus === 'PRINTING'
                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
                    : 'bg-white hover:bg-indigo-50 text-indigo-800 border-slate-200'
                }`}
              >
                <Printer className="w-4 h-4" />
                <span>2. กำลังพิมพ์</span>
              </button>

              <button
                type="button"
                onClick={() => handleUpdate('COMPLETED')}
                className={`p-2 rounded text-xs font-mono font-semibold border flex flex-col items-center justify-center gap-1 transition-all ${
                  currentStatus === 'COMPLETED'
                    ? 'bg-teal-600 text-white border-teal-700 shadow-sm'
                    : 'bg-white hover:bg-teal-50 text-teal-800 border-slate-200'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                <span>3. พิมพ์เสร็จ</span>
              </button>

              <button
                type="button"
                onClick={() => handleUpdate('SHIPPED')}
                className={`p-2 rounded text-xs font-mono font-semibold border flex flex-col items-center justify-center gap-1 transition-all ${
                  currentStatus === 'SHIPPED'
                    ? 'bg-slate-900 text-white border-black shadow-sm'
                    : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200'
                }`}
              >
                <Truck className="w-4 h-4" />
                <span>4. จัดส่งแล้ว</span>
              </button>
            </div>

            {/* Tracking Number Input */}
            <div>
              <label className="block text-xs font-mono font-semibold text-slate-700 mb-1">
                เลขพัสดุจัดส่ง (Tracking Number)
              </label>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="เช่น TH-EX-8891024, KEX-12345678"
                className="w-full text-xs font-mono p-2 rounded border border-slate-300 bg-white"
              />
            </div>

            {/* Staff Internal Notes */}
            <div>
              <label className="block text-xs font-mono font-semibold text-slate-700 mb-1">
                บันทึกการทำงานของช่าง (Internal Staff Notes)
              </label>
              <textarea
                rows={2}
                value={staffNotes}
                onChange={(e) => setStaffNotes(e.target.value)}
                placeholder="เช่น สั่งพิมพ์บนเครื่อง Prusa MK4 #2 Nozzle 0.4mm, ติด brim 5mm..."
                className="w-full text-xs font-sans p-2 rounded border border-slate-300 bg-white"
              />
            </div>

            <button
              type="button"
              disabled={isUpdating}
              onClick={() => handleUpdate()}
              className="w-full py-2.5 rounded bg-slate-900 hover:bg-black text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>บันทึกการเปลี่ยนแปลงทั้งหมด</span>
            </button>
          </div>
        </div>

        {/* Zoom Slip Modal */}
        {slipModalOpen && order.payment.slipUrl && (
          <div
            className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setSlipModalOpen(false)}
          >
            <div className="relative max-w-lg w-full bg-white rounded-lg p-2 overflow-hidden shadow-2xl">
              <img
                src={order.payment.slipUrl}
                alt="Full Slip Inspection"
                className="w-full max-h-[85vh] object-contain rounded"
              />
              <button
                onClick={() => setSlipModalOpen(false)}
                className="absolute top-4 right-4 bg-black/70 text-white p-1.5 rounded-full hover:bg-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
