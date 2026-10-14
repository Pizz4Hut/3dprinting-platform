'use client';

import React, { useState, useEffect } from 'react';
import { CustomerInfo, ModelMetrics, OrderItem, PrintConfig } from '@/lib/types';
import { estimatePrice } from '@/lib/stl-utils';
import { generatePromptPayQR } from '@/lib/promptpay';
import {
  X,
  QrCode,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  ArrowRight,
  Shield,
  Loader2,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  metrics: ModelMetrics;
  config: PrintConfig;
  stlFile: File | null;
  stlUrl?: string;
  userEmail?: string;
  userName?: string;
}

export const CheckoutModal: React.FC<Props> = ({
  isOpen,
  onClose,
  metrics,
  config,
  stlFile,
  stlUrl,
  userEmail = '',
  userName = '',
}) => {
  const [step, setStep] = useState<'DETAILS' | 'PAYMENT' | 'SUCCESS'>('DETAILS');
  const [customer, setCustomer] = useState<CustomerInfo>({
    name: userName || '',
    email: userEmail || '',
    phone: '',
    address: '',
  });

  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [createdOrder, setCreatedOrder] = useState<OrderItem | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const estimation = estimatePrice(metrics, config);
  const promptPayNumber = process.env.NEXT_PUBLIC_PROMPTPAY_NUMBER || '0812345678';
  const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'PrintCraft 3D Studio';
  const bankName = process.env.NEXT_PUBLIC_BANK_NAME || 'Kasikorn Bank (KBANK)';
  const accountNo = process.env.NEXT_PUBLIC_ACCOUNT_NUMBER || '012-3-45678-9';

  // Generate QR Code when entering PAYMENT step
  useEffect(() => {
    if (step === 'PAYMENT') {
      generatePromptPayQR(promptPayNumber, estimation.totalPrice)
        .then((url) => setQrCodeUrl(url))
        .catch((err) => console.error('Failed to generate PromptPay QR:', err));
    }
  }, [step, estimation.totalPrice, promptPayNumber]);

  if (!isOpen) return null;

  const handleSlipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSlipFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setSlipPreview(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer.name || !customer.phone || !customer.address || !customer.email) {
      setErrorMessage('กรุณากรอกข้อมูลให้ครบถ้วนทุกช่องเพื่อความถูกต้องในการจัดส่ง');
      return;
    }
    setErrorMessage('');
    setStep('PAYMENT');
  };

  const handleFinalOrderSubmit = async () => {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      let finalStlUrl = stlUrl || '';
      let finalSlipUrl = '';

      // 1. Upload STL file if local file
      if (stlFile) {
        const stlFormData = new FormData();
        stlFormData.append('file', stlFile);
        stlFormData.append('type', 'stl');

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: stlFormData,
        });

        if (!uploadRes.ok) throw new Error('ไม่สามารถอัปโหลดไฟล์ STL ได้ กรุณาลองใหม่อีกครั้ง');
        const uploadData = await uploadRes.json();
        finalStlUrl = uploadData.url;
      }

      // 2. Upload Slip file if attached
      if (slipFile) {
        const slipFormData = new FormData();
        slipFormData.append('file', slipFile);
        slipFormData.append('type', 'slip');

        const slipRes = await fetch('/api/upload', {
          method: 'POST',
          body: slipFormData,
        });

        if (!slipRes.ok) throw new Error('ไม่สามารถอัปโหลดสลิปได้');
        const slipData = await slipRes.json();
        finalSlipUrl = slipData.url;
      }

      // 3. Create Order
      const payload = {
        customer,
        fileName: stlFile ? stlFile.name : (stlUrl?.split('/').pop() || 'model.stl'),
        fileSize: stlFile ? stlFile.size : 2048000,
        fileUrl: finalStlUrl,
        metrics,
        config,
        payment: {
          slipUrl: finalSlipUrl || undefined,
        },
      };

      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!orderRes.ok) {
        const err = await orderRes.json();
        throw new Error(err.error || 'Failed to submit order');
      }

      const orderData = await orderRes.json();
      setCreatedOrder(orderData.order);
      setStep('SUCCESS');
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'เกิดข้อผิดพลาดในการสั่งซื้อ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xl max-w-xl w-full overflow-hidden transition-all">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-900" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900">
              {step === 'DETAILS' && 'STEP 1: Delivery Information & Contact'}
              {step === 'PAYMENT' && 'STEP 2: PromptPay QR Settlement & Slip Upload'}
              {step === 'SUCCESS' && 'FABRICATION ORDER DISPATCHED'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {errorMessage && (
            <div className="mb-4 p-3 rounded bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: Details */}
          {step === 'DETAILS' && (
            <form onSubmit={handleDetailsSubmit} className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 p-3 rounded flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-slate-500">ชิ้นงาน:</span> {stlFile?.name || '3D Model'} ({config.material})
                </div>
                <div className="font-bold text-slate-900">
                  รวม: ฿{estimation.totalPrice.toLocaleString()} THB
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-semibold text-slate-700 mb-1">
                    ชื่อ-นามสกุล ผู้รับ *
                  </label>
                  <input
                    type="text"
                    required
                    value={customer.name}
                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                    placeholder="สมชาย ประเสริฐ"
                    className="w-full text-xs p-2.5 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono font-semibold text-slate-700 mb-1">
                    เบอร์โทรศัพท์ติดต่อ *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    placeholder="081-234-5678"
                    className="w-full text-xs p-2.5 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold text-slate-700 mb-1">
                  อีเมล (สำหรับรับแจ้งเตือนสถานะการพิมพ์) *
                </label>
                <input
                  type="email"
                  required
                  value={customer.email}
                  onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                  placeholder="somchai@example.com"
                  className="w-full text-xs p-2.5 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold text-slate-700 mb-1">
                  ที่อยู่สำหรับจัดส่งพัสดุ *
                </label>
                <textarea
                  rows={3}
                  required
                  value={customer.address}
                  onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                  placeholder="บ้านเลขที่, ถนน, แขวง/ตำบล, เขต/อำเภอ, จังหวัด, รหัสไปรษณีย์..."
                  className="w-full text-xs p-2.5 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded border border-slate-200 text-xs font-mono text-slate-600 hover:bg-slate-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded bg-slate-900 hover:bg-black text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5"
                >
                  <span>ต่อไป: ชำระเงิน</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: PromptPay QR & Slip Upload */}
          {step === 'PAYMENT' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row gap-5 items-center bg-slate-50 border border-slate-200 p-4 rounded-lg">
                {/* QR Display */}
                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm shrink-0 text-center">
                  {qrCodeUrl ? (
                    <img
                      src={qrCodeUrl}
                      alt="PromptPay QR Code"
                      className="w-48 h-48 object-contain mx-auto"
                    />
                  ) : (
                    <div className="w-48 h-48 flex items-center justify-center text-xs font-mono text-slate-400">
                      Generating QR...
                    </div>
                  )}
                  <span className="inline-block mt-1 text-[10px] font-mono text-slate-500 font-semibold">
                    PROMPTPAY THAI QR
                  </span>
                </div>

                {/* Account & Amount Info */}
                <div className="space-y-2 text-xs font-mono w-full">
                  <div className="pb-2 border-b border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase">ยอดเงินที่ต้องชำระ</span>
                    <div className="text-2xl font-extrabold text-slate-900">
                      ฿{estimation.totalPrice.toLocaleString()}.00
                    </div>
                  </div>

                  <div className="space-y-1 text-slate-600">
                    <div>
                      <span className="text-slate-400">บัญชี:</span> {storeName}
                    </div>
                    <div>
                      <span className="text-slate-400">ธนาคาร:</span> {bankName}
                    </div>
                    <div>
                      <span className="text-slate-400">เลขที่บัญชี:</span> {accountNo}
                    </div>
                    <div>
                      <span className="text-slate-400">พร้อมเพย์:</span> {promptPayNumber}
                    </div>
                  </div>

                  <p className="text-[11px] text-emerald-700 bg-emerald-50 p-2 rounded border border-emerald-200 font-sans mt-2">
                    สแกน QR ได้ทุกแอปธนาคาร ยอดเงินระบุไว้ใน QR อัตโนมัติ
                  </p>
                </div>
              </div>

              {/* Slip Upload Area */}
              <div className="space-y-2">
                <label className="block text-xs font-mono font-semibold text-slate-700 uppercase">
                  แนบหลักฐานการโอนเงิน (สลิปการโอน)
                </label>

                <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-slate-400 transition-colors bg-white">
                  {slipPreview ? (
                    <div className="flex flex-col items-center gap-2">
                      <img
                        src={slipPreview}
                        alt="Slip Preview"
                        className="max-h-40 rounded border border-slate-200 object-contain shadow-sm"
                      />
                      <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>แนบสลิปเรียบร้อย ({slipFile?.name})</span>
                      </div>
                      <label className="text-xs text-blue-600 underline cursor-pointer hover:text-blue-800">
                        เปลี่ยนรูปสลิป
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleSlipChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <span className="text-xs font-mono font-medium text-slate-700 block">
                        คลิกเพื่ออัปโหลดภาพสลิป หรือลากไฟล์มาวางที่นี่
                      </span>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        รองรับ JPG, PNG, WEBP (สูงสุด 10MB)
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleSlipChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setStep('DETAILS')}
                  className="px-4 py-2 rounded border border-slate-200 text-xs font-mono text-slate-600 hover:bg-slate-50"
                >
                  ย้อนกลับ
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleFinalOrderSubmit}
                  className="px-6 py-2.5 rounded bg-slate-900 hover:bg-black text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 disabled:opacity-50 shadow-sm"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>กำลังประมวลผลคำสั่งซื้อ...</span>
                    </>
                  ) : (
                    <>
                      <span>ยืนยันการสั่งพิมพ์</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SUCCESS */}
          {step === 'SUCCESS' && createdOrder && (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-600 font-bold">
                  ORDER REGISTERED SUCCESSFULLY
                </span>
                <h4 className="text-lg font-bold text-slate-900 mt-0.5">
                  ได้รับข้อมูลคำสั่งพิมพ์เรียบร้อยแล้ว!
                </h4>
                <div className="mt-2 inline-block px-3 py-1 rounded bg-slate-100 border border-slate-200 font-mono text-xs font-bold text-slate-800">
                  ORDER ID: {createdOrder.id}
                </div>
              </div>

              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                เจ้าหน้าที่กำลังตรวจสอบสลิปและเตรียมไฟล์ STL เข้าสู่เครื่องพิมพ์ 3D ของร้าน ท่านสามารถติดตามความคืบหน้าของชิ้นงานได้ตลอดเวลา
              </p>

              <div className="pt-4 flex flex-col sm:flex-row gap-2 justify-center">
                <Link
                  href={`/track?id=${createdOrder.id}`}
                  onClick={onClose}
                  className="px-5 py-2.5 rounded bg-slate-900 hover:bg-black text-white text-xs font-mono font-bold uppercase tracking-wider shadow-sm"
                >
                  ติดตามสถานะออเดอร์นี้ (Track Order)
                </Link>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded border border-slate-200 text-xs font-mono text-slate-600 hover:bg-slate-50"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
