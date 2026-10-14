'use client';

import React, { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Viewer3D } from '@/components/Viewer3D';
import { PrintConfigPanel } from '@/components/PrintConfigPanel';
import { PriceCalculator } from '@/components/PriceCalculator';
import { CheckoutModal } from '@/components/CheckoutModal';
import { ModelMetrics, PrintConfig } from '@/lib/types';
import {
  Upload,
  Box,
  Layers,
  Cpu,
  FileCheck,
  CheckCircle2,
  Sparkles,
  Zap,
  ShieldCheck,
  Clock,
  ArrowRight,
} from 'lucide-react';

const SAMPLE_MODELS = [
  {
    name: '3DBenchy Calibration',
    file: '/samples/benchy.stl',
    desc: 'โมเดลทดสอบความแม่นยำและการพิมพ์ Overhang',
    tag: 'Standard Test',
  },
  {
    name: 'Drone Motor Mount',
    file: '/samples/drone_mount.stl',
    desc: 'ชิ้นส่วนวิศวกรรม mechanical รับแรงบิดสูง',
    tag: 'Engineering',
  },
  {
    name: 'MagSafe Phone Case',
    file: '/samples/phone_case.stl',
    desc: 'เคสโทรศัพท์มือถือ สำหรับพิมพ์ TPU หรือ PLA',
    tag: 'Consumer',
  },
];

export default function HomePage() {
  const { data: session } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stlFile, setStlFile] = useState<File | null>(null);
  const [stlUrl, setStlUrl] = useState<string>('/samples/benchy.stl'); // Default loaded sample for instant wow effect
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);

  const [config, setConfig] = useState<PrintConfig>({
    material: 'PLA',
    color: 'Galaxy Blue',
    quality: 'STANDARD',
    infillPercent: 20,
    infillPattern: 'gyroid',
    supports: false,
    quantity: 1,
    specialInstructions: '',
  });

  const handleFileUpload = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.stl')) {
      alert('กรุณาอัปโหลดไฟล์นามสกุล .STL เท่านั้น');
      return;
    }
    setStlUrl('');
    setStlFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleSelectSample = (sampleUrl: string) => {
    setStlFile(null);
    setStlUrl(sampleUrl);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      {/* Hero / Studio Header */}
      <section className="bg-white border-b border-slate-200 py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-[11px] font-mono uppercase font-bold tracking-widest text-blue-600">
                AUTONOMOUS 3D FABRICATION ENGINE
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              สตูดิโอรับพิมพ์ 3D ประเมินราคา & Slice อัตโนมัติ
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl font-sans">
              อัปโหลดไฟล์ STL คำนวณปริมาตรชิ้นงานจริง ลองปรับแต่งความละเอียด จำลองการ Slice ทีละเลเยอร์
              พร้อมชำระเงินผ่าน PromptPay QR และส่งเข้าเครื่องพิมพ์ทันที
            </p>
          </div>

          {/* Quick upload button */}
          <div className="flex items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              accept=".stl"
              onChange={(e) => {
                if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
              }}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 rounded bg-slate-900 hover:bg-black text-white text-xs font-mono font-bold uppercase tracking-wider shadow-sm transition-all hover:shadow"
            >
              <Upload className="w-4 h-4 text-blue-400" />
              <span>อัปโหลดไฟล์ STL ของคุณ</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Workspace Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {/* Sample selector & File Drag Zone bar */}
        <div className="mb-6 flex flex-col lg:flex-row items-stretch gap-4">
          {/* Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex-1 p-4 rounded-lg border-2 border-dashed transition-all cursor-pointer flex items-center justify-between ${
              isDragOver
                ? 'border-blue-600 bg-blue-50/50'
                : 'border-slate-300 bg-white hover:border-slate-400'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-600">
                <Box className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-mono font-bold text-slate-800">
                  {stlFile ? stlFile.name : 'ลากไฟล์ STL มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์'}
                </div>
                <div className="text-[11px] font-mono text-slate-500">
                  {stlFile
                    ? `ขนาดไฟล์: ${(stlFile.size / 1024 / 1024).toFixed(2)} MB • พร้อมคำนวณราคา`
                    : 'รองรับ Binary & ASCII STL สูงสุด 100MB'}
                </div>
              </div>
            </div>
            <span className="hidden sm:inline-block px-2.5 py-1 text-[10px] font-mono rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200">
              DROP STL HERE
            </span>
          </div>

          {/* Preset Sample STL Models */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
            <span className="text-[10px] font-mono text-slate-400 uppercase shrink-0">
              หรือลองไฟล์ตัวอย่าง:
            </span>
            {SAMPLE_MODELS.map((sample) => {
              const isSelected = stlUrl === sample.file && !stlFile;
              return (
                <button
                  key={sample.name}
                  onClick={() => handleSelectSample(sample.file)}
                  className={`px-3 py-2 rounded text-left border transition-all shrink-0 ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="text-xs font-mono font-bold">{sample.name}</div>
                  <div className="text-[10px] text-slate-500 font-sans">{sample.tag}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: 3D Interactive Viewer + Slicer Controls (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="h-[520px] w-full">
              <Viewer3D
                file={stlFile}
                fileUrl={stlUrl}
                config={config}
                onMetricsCalculated={(m) => setMetrics(m)}
              />
            </div>

            {/* Viewer Hint / Feature Pills */}
            <div className="bg-white border border-slate-200 rounded-lg p-3 text-xs font-mono text-slate-600 flex flex-wrap items-center justify-between gap-3 shadow-technical">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span>คลิกซ้ายลาก = หมุน 3D</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span>Scroll เมาส์ = ซูมเข้า-ออก</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span>กดปุ่ม SLICER VIEW เพื่อลองตัดดูเลเยอร์ภายใน</span>
              </div>
            </div>
          </div>

          {/* Right Column: Print Configuration & Price Calculation (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Realtime Price Valuation */}
            <PriceCalculator
              metrics={metrics}
              config={config}
              onProceedToCheckout={() => setIsCheckoutOpen(true)}
            />

            {/* Print Parameters & Material Selection */}
            <PrintConfigPanel config={config} onChange={(c) => setConfig(c)} />
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {metrics && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          metrics={metrics}
          config={config}
          stlFile={stlFile}
          stlUrl={stlUrl}
          userEmail={session?.user?.email || ''}
          userName={session?.user?.name || ''}
        />
      )}
    </div>
  );
}
