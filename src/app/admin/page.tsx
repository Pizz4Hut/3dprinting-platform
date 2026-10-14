'use client';

import React, { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { AdminStats, OrderItem, OrderStatus } from '@/lib/types';
import { OrderStatusBadge } from '@/components/OrderStatusBadge';
import { AdminOrderDrawer } from '@/components/AdminOrderDrawer';
import {
  Shield,
  Lock,
  Download,
  Search,
  Filter,
  Eye,
  CheckCircle,
  Clock,
  Printer,
  Truck,
  TrendingUp,
  RefreshCw,
  KeyRound,
  FileCheck,
  AlertTriangle,
} from 'lucide-react';

export default function AdminPage() {
  const { data: session, status: authStatus } = useSession();
  const isAdmin = (session?.user as any)?.role === 'ADMIN';

  // PIN / Master password login for admin security
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [isVerifyingPin, setIsVerifyingPin] = useState<boolean>(false);

  // Data
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [ordersRes, statsRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/stats'),
      ]);

      if (ordersRes.ok) {
        const data = await ordersRes.json();
        setOrders(data.orders || []);
      }
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.stats || null);
      }
    } catch (err) {
      console.error('Failed to load admin telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin]);

  // Handle Admin Quick PIN Login
  const handlePinLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifyingPin(true);
    setPinError('');

    const res = await signIn('credentials', {
      redirect: false,
      pin: pinInput,
    });

    setIsVerifyingPin(false);
    if (res?.error) {
      setPinError('รหัส PIN ไม่ถูกต้อง (ค่าเริ่มต้นคือ 9876)');
    } else {
      window.location.reload();
    }
  };

  // If Not Authenticated as Admin -> Show Palantir Security Clearance Gate
  if (authStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 bg-slate-50">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-xl p-8 shadow-card text-center space-y-6">
          <div className="w-14 h-14 bg-slate-900 text-white rounded-full flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-6 h-6 text-blue-400" />
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
              SECURITY LEVEL 4 REQUIRED
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              เจ้าหน้าที่และผู้ดูแลระบบเท่านั้น
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              ระบบหลังบ้านได้รับการปกป้อง กรุณายืนยันตัวตนด้วย Admin PIN หรือเข้าสู่ระบบด้วยบัญชีเจ้าหน้าที่
            </p>
          </div>

          {pinError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded flex items-center gap-2 text-left font-mono">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{pinError}</span>
            </div>
          )}

          <form onSubmit={handlePinLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-semibold text-slate-700 uppercase mb-1">
                กรอก Staff PIN (4 หลัก)
              </label>
              <input
                type="password"
                maxLength={6}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="••••"
                className="w-full text-center tracking-[0.5em] text-lg font-mono py-2.5 rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              <span className="text-[10px] font-mono text-slate-400 mt-1 block">
                (PIN ค่าเริ่มต้นสำหรับการทดสอบ: 9876)
              </span>
            </div>

            <button
              type="submit"
              disabled={isVerifyingPin}
              className="w-full py-2.5 rounded bg-slate-900 hover:bg-black text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm"
            >
              <KeyRound className="w-4 h-4" />
              <span>{isVerifyingPin ? 'กำลังตรวจสอบ...' : 'ปลดล็อกระบบหลังบ้าน'}</span>
            </button>
          </form>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-2 text-xs">
            <span className="text-slate-400">หรือเข้าสู่ระบบด้วย</span>
            <button
              onClick={() => signIn('credentials', { email: 'admin@printcraft3d.com', password: 'AdminPrintcraft2026!', callbackUrl: '/admin' })}
              className="text-blue-600 font-mono font-semibold hover:underline"
            >
              Admin Master Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'PENDING_VERIFY' && o.status === 'PAYMENT_SUBMITTED') ||
      (statusFilter === 'PRINTING' && o.status === 'PRINTING') ||
      (statusFilter === 'COMPLETED' && (o.status === 'COMPLETED' || o.status === 'SHIPPED'));

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      {/* Top Admin Header */}
      <div className="bg-white border-b border-slate-200 py-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold">
                COMMAND & CONTROL // FABRICATION PIPELINE
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              ระบบหลังบ้านจัดการออเดอร์พิมพ์ 3D (Admin Center)
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 font-sans">
              ตรวจสอบสลิปโอนเงิน ดาวน์โหลดไฟล์ STL เข้าสู่ Slicer ควบคุมสถานะเครื่องพิมพ์ และออกเลขพัสดุ
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadAdminData}
              className="flex items-center gap-1.5 px-3 py-2 rounded border border-slate-200 bg-white text-xs font-mono text-slate-700 hover:bg-slate-50 shadow-technical"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>รีเฟรชข้อมูล</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Telemetry Stats Cards (Palantir White Foundry Style) */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-technical">
              <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold">
                คำสั่งพิมพ์ทั้งหมด
              </div>
              <div className="text-2xl font-mono font-extrabold text-slate-900 mt-1">
                {stats.totalOrders}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">รวมทุกสถานะ</div>
            </div>

            <div className="bg-white border border-blue-200 p-4 rounded-lg shadow-technical bg-blue-50/20">
              <div className="text-[10px] font-mono uppercase text-blue-600 font-semibold">
                รอตรวจสอบสลิป
              </div>
              <div className="text-2xl font-mono font-extrabold text-blue-600 mt-1">
                {stats.pendingVerification}
              </div>
              <div className="text-[11px] text-blue-500 mt-0.5">สลิปใหม่รอตรวจ</div>
            </div>

            <div className="bg-white border border-indigo-200 p-4 rounded-lg shadow-technical bg-indigo-50/20">
              <div className="text-[10px] font-mono uppercase text-indigo-600 font-semibold">
                กำลังพิมพ์ (In Queue)
              </div>
              <div className="text-2xl font-mono font-extrabold text-indigo-600 mt-1">
                {stats.inProduction}
              </div>
              <div className="text-[11px] text-indigo-500 mt-0.5">ชิ้นงานบนเตาพิมพ์</div>
            </div>

            <div className="bg-white border border-emerald-200 p-4 rounded-lg shadow-technical bg-emerald-50/20">
              <div className="text-[10px] font-mono uppercase text-emerald-600 font-semibold">
                ยอดขายรวม (Revenue)
              </div>
              <div className="text-2xl font-mono font-extrabold text-emerald-700 mt-1">
                ฿{stats.totalRevenue.toLocaleString()}
              </div>
              <div className="text-[11px] text-emerald-600 mt-0.5">ชำระผ่าน PromptPay</div>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-technical">
              <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold">
                เนื้อพลาสติกที่ใช้
              </div>
              <div className="text-2xl font-mono font-extrabold text-slate-800 mt-1">
                {(stats.totalFilamentUsedGrams / 1000).toFixed(2)} kg
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Filament Telemetry</div>
            </div>
          </div>
        )}

        {/* Orders Table Container */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-technical overflow-hidden">
          {/* Controls Bar */}
          <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหา Order ID, ชื่อลูกค้า, ชื่อไฟล์ STL..."
                className="w-full pl-9 pr-3 py-1.5 text-xs font-mono rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
              />
            </div>

            {/* Status Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto">
              {[
                { id: 'ALL', label: 'ทั้งหมด' },
                { id: 'PENDING_VERIFY', label: 'รอตรวจสลิป' },
                { id: 'PRINTING', label: 'กำลังพิมพ์' },
                { id: 'COMPLETED', label: 'เสร็จ/จัดส่งแล้ว' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1.5 text-xs font-mono rounded border transition-all ${
                    statusFilter === tab.id
                      ? 'bg-slate-900 text-white font-bold border-black'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100/70 text-[10px] text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">Order ID</th>
                  <th className="py-3 px-4 font-semibold">ลูกค้า (Customer)</th>
                  <th className="py-3 px-4 font-semibold">ไฟล์ STL (ชิ้นงาน)</th>
                  <th className="py-3 px-4 font-semibold">สเปกการพิมพ์</th>
                  <th className="py-3 px-4 font-semibold">สลิปโอนเงิน</th>
                  <th className="py-3 px-4 font-semibold">ยอดเงิน (THB)</th>
                  <th className="py-3 px-4 font-semibold">สถานะงาน</th>
                  <th className="py-3 px-4 font-semibold text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      ไม่พบรายการออเดอร์ตามเงื่อนไขที่กำหนด
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                        {order.id}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 font-sans">
                          {order.customer.name}
                        </div>
                        <div className="text-[11px] text-slate-400">{order.customer.phone}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800 max-w-xs truncate">
                          {order.fileName}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {order.metrics.dimensionsMm.x}×{order.metrics.dimensionsMm.y}×{order.metrics.dimensionsMm.z} mm
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-800">
                          {order.config.material}
                        </span>{' '}
                        • {order.config.infillPercent}% • {order.config.quantity} ชิ้น
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {order.payment.slipUrl ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <CheckCircle className="w-3 h-3" />
                            แนบสลิปแล้ว
                          </span>
                        ) : (
                          <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            ยังไม่มีสลิป
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                        ฿{order.estimation.totalPrice.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <OrderStatusBadge status={order.status} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={`/api/orders/${order.id}/download`}
                            download
                            title="ดาวน์โหลดไฟล์ STL สำหรับเข้าเครื่องพิมพ์"
                            className="p-1.5 rounded border border-slate-200 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                          <button
                            onClick={() => setSelectedOrder(order)}
                            title="ดูรายละเอียดและอัปเดตสถานะ"
                            className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Admin Order Inspection Drawer */}
      {selectedOrder && (
        <AdminOrderDrawer
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusUpdated={(updated) => {
            setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
            setSelectedOrder(updated);
            loadAdminData(); // Refresh metrics
          }}
        />
      )}
    </div>
  );
}
