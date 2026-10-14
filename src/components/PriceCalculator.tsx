'use client';

import React from 'react';
import { ModelMetrics, PriceEstimation, PrintConfig } from '@/lib/types';
import { estimatePrice, formatPrintTime } from '@/lib/stl-utils';
import { Calculator, Clock, Weight, CheckCircle, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

interface Props {
  metrics: ModelMetrics | null;
  config: PrintConfig;
  onProceedToCheckout: () => void;
}

export const PriceCalculator: React.FC<Props> = ({
  metrics,
  config,
  onProceedToCheckout,
}) => {
  if (!metrics) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-technical text-center">
        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
          <Calculator className="w-5 h-5" />
        </div>
        <h4 className="text-xs font-mono font-bold uppercase text-slate-800">
          Awaiting 3D Mesh Analysis
        </h4>
        <p className="text-xs text-slate-500 mt-1">
          Upload an STL file above to trigger instant automated price estimation.
        </p>
      </div>
    );
  }

  const estimation: PriceEstimation = estimatePrice(metrics, config);

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-technical overflow-hidden">
      {/* Header ribbon */}
      <div className="bg-slate-900 text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-blue-400">
              REAL-TIME VALUATION ENGINE
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-3xl font-extrabold font-mono tracking-tight text-white">
                ฿{estimation.totalPrice.toLocaleString()}
              </span>
              <span className="text-xs font-mono text-slate-300">
                THB {config.quantity > 1 ? `(฿${estimation.unitPrice}/ชิ้น)` : 'สุทธิ'}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-400/30">
              <Zap className="w-3 h-3" />
              INSTANT QUOTE
            </span>
            <p className="text-[10px] font-mono text-slate-400 mt-1">
              EST. TIME: ~{formatPrintTime(estimation.printTimeMinutes)}
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Physical Metrics Grid */}
        <div>
          <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold mb-2">
            PHYSICAL TELEMETRY
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="bg-slate-50 border border-slate-200 p-2.5 rounded">
              <span className="text-[10px] font-mono text-slate-500 block">DIMENSIONS (X×Y×Z)</span>
              <span className="text-xs font-mono font-bold text-slate-800">
                {metrics.dimensionsMm.x}×{metrics.dimensionsMm.y}×{metrics.dimensionsMm.z} mm
              </span>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-2.5 rounded">
              <span className="text-[10px] font-mono text-slate-500 block">TOTAL VOLUME</span>
              <span className="text-xs font-mono font-bold text-slate-800">
                {metrics.volumeCm3} cm³
              </span>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-2.5 rounded">
              <span className="text-[10px] font-mono text-slate-500 block">EST. FILAMENT</span>
              <span className="text-xs font-mono font-bold text-slate-800">
                {estimation.weightGrams} g / ชิ้น
              </span>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-2.5 rounded">
              <span className="text-[10px] font-mono text-slate-500 block">TRIANGLES</span>
              <span className="text-xs font-mono font-bold text-slate-800">
                {metrics.triangleCount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Transparent Cost Breakdown */}
        <div>
          <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold mb-2">
            COST BREAKDOWN (PALANTIR AUDIT SPEC)
          </div>
          <div className="border border-slate-100 rounded divide-y divide-slate-100 text-xs font-mono">
            <div className="flex justify-between py-2 px-3 text-slate-600">
              <span>
                Filament Material ({config.material} @ {config.infillPercent}% infill)
              </span>
              <span className="font-semibold text-slate-800">฿{estimation.materialCost}</span>
            </div>
            <div className="flex justify-between py-2 px-3 text-slate-600">
              <span>Machine Runtime & Energy (~{formatPrintTime(estimation.printTimeMinutes)})</span>
              <span className="font-semibold text-slate-800">฿{estimation.machineTimeCost}</span>
            </div>
            {estimation.supportCost > 0 && (
              <div className="flex justify-between py-2 px-3 text-slate-600">
                <span>Support Material & Dissolution</span>
                <span className="font-semibold text-slate-800">฿{estimation.supportCost}</span>
              </div>
            )}
            <div className="flex justify-between py-2 px-3 text-slate-600">
              <span>Bed Calibration & Prep Setup</span>
              <span className="font-semibold text-slate-800">฿{estimation.baseSetupFee}</span>
            </div>
            {config.quantity > 1 && (
              <div className="flex justify-between py-2 px-3 bg-slate-50 text-slate-700 font-bold">
                <span>Quantity Multiplier ({config.quantity} ชิ้น)</span>
                <span>× {config.quantity}</span>
              </div>
            )}
            <div className="flex justify-between py-2.5 px-3 bg-blue-50/50 text-blue-900 font-bold text-sm">
              <span>ราคาสุทธิรวม (Total Due)</span>
              <span>฿{estimation.totalPrice.toLocaleString()} THB</span>
            </div>
          </div>
        </div>

        {/* Quality Guarantee Note */}
        <div className="flex items-center gap-2 text-xs text-slate-500 bg-emerald-50/70 border border-emerald-200/80 p-2.5 rounded">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            รับประกันคุณภาพงานพิมพ์ หากชิ้นงานชำรุดจากการพิมพ์ ทางร้านพิมพ์ให้ใหม่ฟรีทันที
          </span>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={onProceedToCheckout}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded bg-slate-900 hover:bg-black text-white font-mono font-bold text-xs uppercase tracking-wider shadow-sm transition-all hover:shadow hover:-translate-y-0.5 active:translate-y-0"
        >
          <span>สั่งพิมพ์และชำระเงินผ่าน PromptPay QR</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
