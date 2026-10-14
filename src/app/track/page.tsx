'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { OrderItem, OrderStatus } from '@/lib/types';
import { OrderStatusBadge } from '@/components/OrderStatusBadge';
import {
  Search,
  Box,
  Truck,
  Printer,
  CheckCircle2,
  Clock,
  Upload,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get('id') || '';
  const { data: session } = useSession();

  const [query, setQuery] = useState<string>(initialId);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searched, setSearched] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);

  // Additional slip upload for pending order
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [uploadingSlip, setUploadingSlip] = useState<boolean>(false);

  const fetchOrders = async (param: string) => {
    setLoading(true);
    setSearched(true);
    try {
      if (param.startsWith('ORD-')) {
        // Fetch by single ID
        const res = await fetch(`/api/orders/${param}`);
        if (res.ok) {
          const data = await res.json();
          setOrders(data.order ? [data.order] : []);
          setSelectedOrder(data.order || null);
        } else {
          setOrders([]);
          setSelectedOrder(null);
        }
      } else {
        // Search by email
        const res = await fetch(`/api/orders?email=${encodeURIComponent(param)}`);
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
          setSelectedOrder(data.orders?.[0] || null);
        } else {
          setOrders([]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialId) {
      fetchOrders(initialId);
    } else if (session?.user?.email) {
      setQuery(session.user.email);
      fetchOrders(session.user.email);
    }
  }, [initialId, session?.user?.email]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      fetchOrders(query.trim());
    }
  };

  const handleAttachSlip = async (orderId: string) => {
    if (!slipFile) return;
    setUploadingSlip(true);
    try {
      // 1. Upload slip
      const formData = new FormData();
      formData.append('file', slipFile);
      formData.append('type', 'slip');

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) throw new Error('Failed to upload slip');
      const uploadData = await uploadRes.json();

      // 2. Patch order
      const updateRes = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment: { slipUrl: uploadData.url },
        }),
      });

      if (!updateRes.ok) throw new Error('Failed to update order');
      const updatedData = await updateRes.json();

      // Refresh state
      setSelectedOrder(updatedData.order);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updatedData.order : o)));
      setSlipFile(null);
      alert('แนบสลิปเรียบร้อยแล้ว เจ้าหน้าที่จะทำการตรวจสอบและเริ่มพิมพ์งานให้ครับ');
    } catch (err: any) {
      alert(err.message || 'Error uploading slip');
    } finally {
      setUploadingSlip(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-10 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="border-b border-slate-200 pb-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-slate-500 font-semibold">
              REAL-TIME PRODUCTION PIPELINE
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            ติดตามสถานะชิ้นงานพิมพ์ 3D (Track Order)
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-sans">
            ค้นหาด้วย Order ID (เช่น ORD-2026-9041) หรือ อีเมลที่คุณใช้ในการสั่งซื้อ
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="กรอก Order ID หรือ Email ของคุณ..."
              className="w-full pl-9 pr-4 py-2.5 text-xs font-mono rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded bg-slate-900 hover:bg-black text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2"
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <span>ค้นหา</span>}
          </button>
        </form>

        {/* Results Area */}
        {orders.length === 0 && searched && !loading && (
          <div className="bg-white border border-slate-200 rounded-lg p-10 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Box className="w-6 h-6" />
            </div>
            <h4 className="text-xs font-mono font-bold text-slate-800 uppercase">
              ไม่พบข้อมูลคำสั่งพิมพ์
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              กรุณาตรวจสอบความถูกต้องของ Order ID หรือ Email อีกครั้ง
            </p>
          </div>
        )}

        {orders.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Orders list column */}
            <div className="lg:col-span-5 space-y-3">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">
                คำสั่งพิมพ์ที่พบ ({orders.length} รายการ)
              </span>
              <div className="space-y-2">
                {orders.map((o) => {
                  const isSelected = selectedOrder?.id === o.id;
                  return (
                    <div
                      key={o.id}
                      onClick={() => setSelectedOrder(o)}
                      className={`p-4 rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-blue-600 bg-white shadow-technical ring-1 ring-blue-600'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono font-bold text-slate-900">{o.id}</span>
                        <OrderStatusBadge status={o.status} size="sm" />
                      </div>
                      <div className="text-xs text-slate-700 font-medium line-clamp-1">
                        {o.fileName}
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] font-mono text-slate-500">
                        <span>{o.config.material} • {o.config.quantity} ชิ้น</span>
                        <span className="font-bold text-slate-900">
                          ฿{o.estimation.totalPrice.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Order Telemetry Details */}
            {selectedOrder && (
              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-lg p-6 shadow-technical space-y-6">
                <div className="flex items-start justify-between pb-4 border-b border-slate-200">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block">
                      PRODUCTION REPORT
                    </span>
                    <h3 className="text-base font-mono font-bold text-slate-900 mt-0.5">
                      {selectedOrder.id}
                    </h3>
                    <p className="text-xs text-slate-500">
                      สั่งพิมพ์เมื่อ: {new Date(selectedOrder.createdAt).toLocaleString('th-TH')}
                    </p>
                  </div>
                  <OrderStatusBadge status={selectedOrder.status} size="md" />
                </div>

                {/* Progress Steps Visualizer */}
                <div className="py-2">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block mb-4">
                    ขั้นตอนการผลิต (FABRICATION LIFECYCLE)
                  </span>
                  <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
                    <div
                      className={`p-2.5 rounded border ${
                        selectedOrder.status !== 'CANCELLED'
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                          : 'border-slate-200 bg-slate-50 text-slate-400'
                      }`}
                    >
                      <span className="text-[10px] block">STEP 1</span>
                      <span className="font-bold">ได้รับออเดอร์</span>
                    </div>

                    <div
                      className={`p-2.5 rounded border ${
                        selectedOrder.status === 'PAYMENT_VERIFIED' ||
                        selectedOrder.status === 'PRINTING' ||
                        selectedOrder.status === 'COMPLETED' ||
                        selectedOrder.status === 'SHIPPED'
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                          : selectedOrder.status === 'PAYMENT_SUBMITTED'
                          ? 'border-blue-300 bg-blue-50 text-blue-800'
                          : 'border-slate-200 bg-slate-50 text-slate-400'
                      }`}
                    >
                      <span className="text-[10px] block">STEP 2</span>
                      <span className="font-bold">ตรวจสลิป</span>
                    </div>

                    <div
                      className={`p-2.5 rounded border ${
                        selectedOrder.status === 'PRINTING' ||
                        selectedOrder.status === 'COMPLETED' ||
                        selectedOrder.status === 'SHIPPED'
                          ? 'border-indigo-300 bg-indigo-50 text-indigo-800'
                          : 'border-slate-200 bg-slate-50 text-slate-400'
                      }`}
                    >
                      <span className="text-[10px] block">STEP 3</span>
                      <span className="font-bold">กำลังพิมพ์ 3D</span>
                    </div>

                    <div
                      className={`p-2.5 rounded border ${
                        selectedOrder.status === 'SHIPPED'
                          ? 'border-slate-800 bg-slate-900 text-white'
                          : 'border-slate-200 bg-slate-50 text-slate-400'
                      }`}
                    >
                      <span className="text-[10px] block">STEP 4</span>
                      <span className="font-bold">จัดส่งแล้ว</span>
                    </div>
                  </div>
                </div>

                {/* Tracking Number Callout (If dispatched) */}
                {selectedOrder.trackingNumber && (
                  <div className="p-4 rounded-lg bg-slate-900 text-white flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-mono uppercase text-slate-300">
                          จัดส่งพัสดุเรียบร้อยแล้ว
                        </span>
                      </div>
                      <div className="text-sm font-mono font-bold mt-1 text-white">
                        เลขพัสดุ: {selectedOrder.trackingNumber}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 border border-emerald-400/40 px-2 py-0.5 rounded">
                      IN TRANSIT
                    </span>
                  </div>
                )}

                {/* Print Specifications */}
                <div className="space-y-2 text-xs font-mono border-t border-slate-100 pt-4">
                  <span className="text-[10px] uppercase text-slate-400 font-semibold block">
                    รายละเอียดโมเดลและการพิมพ์
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-slate-700">
                    <div>
                      <span className="text-slate-400">ไฟล์:</span> {selectedOrder.fileName}
                    </div>
                    <div>
                      <span className="text-slate-400">วัสดุ:</span> {selectedOrder.config.material} ({selectedOrder.config.color})
                    </div>
                    <div>
                      <span className="text-slate-400">ความละเอียด:</span> {selectedOrder.config.quality}
                    </div>
                    <div>
                      <span className="text-slate-400">Infill:</span> {selectedOrder.config.infillPercent}%
                    </div>
                    <div>
                      <span className="text-slate-400">จำนวน:</span> {selectedOrder.config.quantity} ชิ้น
                    </div>
                    <div>
                      <span className="text-slate-400">ยอดชำระ:</span> ฿{selectedOrder.estimation.totalPrice} THB
                    </div>
                  </div>
                </div>

                {/* Slip upload form if still pending */}
                {(!selectedOrder.payment.slipUrl || selectedOrder.status === 'PENDING_PAYMENT') && (
                  <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 space-y-3">
                    <div className="flex items-center gap-2 text-amber-800 text-xs font-mono font-bold">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>ยังไม่พบสลิปการโอนเงิน (หากโอนแล้วสามารถแนบสลิปด้านล่าง)</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setSlipFile(e.target.files?.[0] || null)}
                        className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-mono file:bg-amber-200 file:text-amber-900 hover:file:bg-amber-300"
                      />
                      <button
                        type="button"
                        disabled={!slipFile || uploadingSlip}
                        onClick={() => handleAttachSlip(selectedOrder.id)}
                        className="px-4 py-1.5 rounded bg-amber-800 hover:bg-amber-900 text-white text-xs font-mono font-bold disabled:opacity-50"
                      >
                        {uploadingSlip ? 'กำลังส่ง...' : 'แนบสลิปนี้'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><span className="text-xs font-mono text-slate-400">Loading order tracker...</span></div>}>
      <TrackOrderContent />
    </React.Suspense>
  );
}
