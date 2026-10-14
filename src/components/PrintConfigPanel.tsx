'use client';

import React from 'react';
import { MATERIALS, QUALITIES } from '@/lib/stl-utils';
import { InfillPattern, MaterialType, PrintConfig, QualityType } from '@/lib/types';
import { Layers, Sliders, Shield, Zap, Sparkles, AlertCircle } from 'lucide-react';

interface Props {
  config: PrintConfig;
  onChange: (config: PrintConfig) => void;
}

export const PrintConfigPanel: React.FC<Props> = ({ config, onChange }) => {
  const selectedMaterial = MATERIALS[config.material] || MATERIALS.PLA;

  const handleMaterialChange = (mat: MaterialType) => {
    const defaultColor = MATERIALS[mat].colors[0] || 'Pure White';
    onChange({
      ...config,
      material: mat,
      color: defaultColor,
    });
  };

  const handleQualityChange = (q: QualityType) => {
    onChange({
      ...config,
      quality: q,
    });
  };

  const handleInfillChange = (percent: number) => {
    onChange({
      ...config,
      infillPercent: percent,
    });
  };

  const handlePatternChange = (pat: InfillPattern) => {
    onChange({
      ...config,
      infillPattern: pat,
    });
  };

  const handleQuantityChange = (delta: number) => {
    const next = Math.max(1, config.quantity + delta);
    onChange({
      ...config,
      quantity: next,
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-technical space-y-6">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-slate-700" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900">
            Print Configuration & Parameters
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-400">PRECISION OS</span>
      </div>

      {/* 1. Material Selector */}
      <div className="space-y-2.5">
        <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-700">
          1. Material (วัสดุการพิมพ์)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {(Object.keys(MATERIALS) as MaterialType[]).map((matKey) => {
            const mat = MATERIALS[matKey];
            const isSelected = config.material === matKey;
            return (
              <button
                key={matKey}
                type="button"
                onClick={() => handleMaterialChange(matKey)}
                className={`p-2.5 text-left rounded border transition-all ${
                  isSelected
                    ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono">{matKey}</span>
                  <span
                    className={`text-[10px] font-mono ${
                      isSelected ? 'text-blue-300' : 'text-slate-400'
                    }`}
                  >
                    ฿{mat.pricePerGram}/g
                  </span>
                </div>
                <p
                  className={`text-[11px] mt-1 line-clamp-1 ${
                    isSelected ? 'text-slate-300' : 'text-slate-500'
                  }`}
                >
                  {mat.name.split('(')[1]?.replace(')', '') || matKey}
                </p>
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-100 font-sans">
          💡 <span className="font-semibold text-slate-700">{selectedMaterial.name}:</span> {selectedMaterial.description}
        </p>
      </div>

      {/* 2. Color Selection */}
      <div className="space-y-2">
        <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-700">
          2. Filament Color (สีชิ้นงาน)
        </label>
        <div className="flex flex-wrap gap-2">
          {selectedMaterial.colors.map((color) => {
            const isSelected = config.color === color;
            return (
              <button
                key={color}
                type="button"
                onClick={() => onChange({ ...config, color })}
                className={`px-3 py-1.5 text-xs font-medium rounded border transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600 font-semibold'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                {color}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Layer Height / Quality */}
      <div className="space-y-2.5">
        <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-700">
          3. Print Resolution / Layer Height (ความละเอียดชิ้นงาน)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(Object.keys(QUALITIES) as QualityType[]).map((qKey) => {
            const q = QUALITIES[qKey];
            const isSelected = config.quality === qKey;
            return (
              <button
                key={qKey}
                type="button"
                onClick={() => handleQualityChange(qKey)}
                className={`p-2.5 text-left rounded border transition-all ${
                  isSelected
                    ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="text-xs font-bold font-mono">{q.layerHeight} mm</div>
                <div
                  className={`text-[11px] font-medium mt-0.5 ${
                    isSelected ? 'text-slate-300' : 'text-slate-500'
                  }`}
                >
                  {q.name.split('(')[0].trim()}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Infill Density & Pattern */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-700">
            4. Infill Density (ความหนาแน่นภายใน)
          </label>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
            {config.infillPercent}%
          </span>
        </div>

        <input
          type="range"
          min="10"
          max="100"
          step="5"
          value={config.infillPercent}
          onChange={(e) => handleInfillChange(Number(e.target.value))}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
        />

        <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <button
            type="button"
            onClick={() => handleInfillChange(15)}
            className="hover:text-slate-900 underline"
          >
            15% (Light Prototype)
          </button>
          <button
            type="button"
            onClick={() => handleInfillChange(35)}
            className="hover:text-slate-900 underline"
          >
            35% (Functional Mechanical)
          </button>
          <button
            type="button"
            onClick={() => handleInfillChange(100)}
            className="hover:text-slate-900 underline"
          >
            100% (Solid)
          </button>
        </div>

        {/* Pattern Selection */}
        <div className="pt-2">
          <label className="block text-[11px] font-mono text-slate-500 mb-1.5 uppercase">
            Infill Pattern (โครงสร้างลายถัก)
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(['grid', 'gyroid', 'honeycomb', 'triangles'] as InfillPattern[]).map((pat) => (
              <button
                key={pat}
                type="button"
                onClick={() => handlePatternChange(pat)}
                className={`py-1.5 px-2 text-center text-xs font-mono capitalize rounded border transition-all ${
                  config.infillPattern === pat
                    ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                {pat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Support & Quantity */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        {/* Supports Toggle */}
        <div className="p-3 rounded border border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <div className="text-xs font-mono font-semibold text-slate-800">
              SUPPORTS (โครงสร้างค้ำยัน)
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Auto generate for overhang angles &gt; 45°
            </p>
          </div>
          <button
            type="button"
            onClick={() => onChange({ ...config, supports: !config.supports })}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
              config.supports ? 'bg-slate-900 justify-end' : 'bg-slate-300 justify-start'
            }`}
          >
            <div className="bg-white w-4 h-4 rounded-full shadow-md" />
          </button>
        </div>

        {/* Quantity */}
        <div className="p-3 rounded border border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <div className="text-xs font-mono font-semibold text-slate-800">
              QUANTITY (จำนวนชิ้น)
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Batch printing discount</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleQuantityChange(-1)}
              className="w-7 h-7 rounded border border-slate-300 bg-white flex items-center justify-center font-bold text-slate-700 hover:bg-slate-100"
            >
              -
            </button>
            <span className="w-8 text-center font-mono font-bold text-sm text-slate-900">
              {config.quantity}
            </span>
            <button
              type="button"
              onClick={() => handleQuantityChange(1)}
              className="w-7 h-7 rounded border border-slate-300 bg-white flex items-center justify-center font-bold text-slate-700 hover:bg-slate-100"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Special instructions */}
      <div className="space-y-1.5 pt-1">
        <label className="block text-xs font-mono font-medium text-slate-600">
          หมายเหตุเพิ่มเติมสำหรับช่างพิมพ์ (Optional)
        </label>
        <textarea
          rows={2}
          value={config.specialInstructions || ''}
          onChange={(e) => onChange({ ...config, specialInstructions: e.target.value })}
          placeholder="เช่น ขอให้เน้นความแข็งแรงตรงเกลียว, ขัดผิวเรียบ, ไม่ต้องลบ support..."
          className="w-full text-xs font-sans p-2.5 rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 placeholder:text-slate-400"
        />
      </div>
    </div>
  );
};
