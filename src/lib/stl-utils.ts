import * as THREE from 'three';
import { MaterialOption, MaterialType, ModelMetrics, PriceEstimation, PrintConfig, QualityOption, QualityType } from './types';

export const MATERIALS: Record<MaterialType, MaterialOption> = {
  PLA: {
    id: 'PLA',
    name: 'PLA (Standard)',
    density: 1.24, // g/cm³
    pricePerGram: 1.2, // THB per gram
    description: 'Eco-friendly, easy to print, excellent surface detail. Ideal for prototypes, display models, and figurines.',
    colors: ['Pure White', 'Matte Black', 'Industrial Grey', 'Galaxy Blue', 'Forest Green', 'Fire Red', 'Sunset Orange'],
  },
  PETG: {
    id: 'PETG',
    name: 'PETG (Durable)',
    density: 1.27,
    pricePerGram: 1.6,
    description: 'Stronger, heat & UV resistant. High impact strength. Best for mechanical parts, outdoor use, and functional enclosures.',
    colors: ['Pure White', 'Jet Black', 'Translucent Clear', 'Translucent Blue', 'Safety Orange'],
  },
  ABS: {
    id: 'ABS',
    name: 'ABS (Engineering)',
    density: 1.04,
    pricePerGram: 1.8,
    description: 'High thermal resistance (up to 100°C), machinable, can be acetone smoothed. Great for automotive and functional tooling.',
    colors: ['White', 'Black', 'Steel Grey'],
  },
  TPU: {
    id: 'TPU',
    name: 'TPU 95A (Flexible)',
    density: 1.21,
    pricePerGram: 2.8,
    description: 'Rubber-like flexibility, high shock absorption, tear-resistant. Best for phone cases, gaskets, damping pads.',
    colors: ['Black', 'Translucent White', 'Vibrant Red'],
  },
  RESIN: {
    id: 'RESIN',
    name: 'Standard Resin (SLA 8K)',
    density: 1.15,
    pricePerGram: 3.5,
    description: 'Ultra-high detail 8K resin printing, virtually invisible layer lines. Perfect for miniatures, jewelry, dental, and fine models.',
    colors: ['Matte Grey', 'Onyx Black', 'Dental Beige', 'Clear Amber'],
  },
};

export const QUALITIES: Record<QualityType, QualityOption> = {
  DRAFT: {
    id: 'DRAFT',
    name: 'Draft (0.28 mm)',
    layerHeight: 0.28,
    speedMultiplier: 0.65, // Faster
    priceMultiplier: 0.85,
    description: 'Fast printing speed, visible layer lines. Great for rapid conceptual prototyping.',
  },
  STANDARD: {
    id: 'STANDARD',
    name: 'Standard (0.20 mm)',
    layerHeight: 0.20,
    speedMultiplier: 1.0,
    priceMultiplier: 1.0,
    description: 'The sweet spot between good visual quality and reliable printing speed.',
  },
  HIGH: {
    id: 'HIGH',
    name: 'High Detail (0.16 mm)',
    layerHeight: 0.16,
    speedMultiplier: 1.35,
    priceMultiplier: 1.2,
    description: 'Smooth surfaces and crisp fine details for visible display models.',
  },
  ULTRA: {
    id: 'ULTRA',
    name: 'Ultra Fine (0.12 mm)',
    layerHeight: 0.12,
    speedMultiplier: 1.85,
    priceMultiplier: 1.45,
    description: 'Top-tier FDM resolution. Minimum visible layer steps, great for detailed art pieces.',
  },
};

/**
 * Calculates volume of a closed triangle mesh using the Divergence Theorem / Signed Tetrahedron Volume
 */
export function calculateVolumeAndMetrics(geometry: THREE.BufferGeometry): ModelMetrics {
  geometry.computeBoundingBox();
  const bbox = geometry.boundingBox || new THREE.Box3();

  const dimensionsMm = {
    x: Math.max(0.1, bbox.max.x - bbox.min.x),
    y: Math.max(0.1, bbox.max.y - bbox.min.y),
    z: Math.max(0.1, bbox.max.z - bbox.min.z),
  };

  const position = geometry.attributes.position;
  let totalVolume = 0;
  let totalSurfaceArea = 0;
  const triangleCount = position.count / 3;

  const p1 = new THREE.Vector3();
  const p2 = new THREE.Vector3();
  const p3 = new THREE.Vector3();
  const edge1 = new THREE.Vector3();
  const edge2 = new THREE.Vector3();
  const cross = new THREE.Vector3();

  for (let i = 0; i < position.count; i += 3) {
    p1.fromBufferAttribute(position, i);
    p2.fromBufferAttribute(position, i + 1);
    p3.fromBufferAttribute(position, i + 2);

    // Signed volume of tetrahedron formed by origin and triangle
    // V = (p1 . (p2 x p3)) / 6
    cross.crossVectors(p2, p3);
    const signedVolume = p1.dot(cross) / 6.0;
    totalVolume += signedVolume;

    // Surface area of triangle: 0.5 * |(p2 - p1) x (p3 - p1)|
    edge1.subVectors(p2, p1);
    edge2.subVectors(p3, p1);
    cross.crossVectors(edge1, edge2);
    totalSurfaceArea += cross.length() * 0.5;
  }

  // Convert mm³ to cm³ (1 cm³ = 1000 mm³)
  let volumeCm3 = Math.abs(totalVolume) / 1000.0;

  // Fallback in case of non-manifold / inverted models: estimate from bounding box * 0.35
  const bboxVolumeCm3 = (dimensionsMm.x * dimensionsMm.y * dimensionsMm.z) / 1000.0;
  if (volumeCm3 < 0.05 || volumeCm3 > bboxVolumeCm3 * 1.5) {
    volumeCm3 = bboxVolumeCm3 * 0.38;
  }

  const surfaceAreaCm2 = totalSurfaceArea / 100.0;

  return {
    volumeCm3: Number(volumeCm3.toFixed(2)),
    dimensionsMm: {
      x: Number(dimensionsMm.x.toFixed(1)),
      y: Number(dimensionsMm.y.toFixed(1)),
      z: Number(dimensionsMm.z.toFixed(1)),
    },
    surfaceAreaCm2: Number(surfaceAreaCm2.toFixed(1)),
    triangleCount,
  };
}

/**
 * Instant Price Estimation Engine
 */
export function estimatePrice(metrics: ModelMetrics, config: PrintConfig): PriceEstimation {
  const material = MATERIALS[config.material] || MATERIALS.PLA;
  const quality = QUALITIES[config.quality] || QUALITIES.STANDARD;

  // Effective infill ratio (perimeter walls account for ~20% solid + infill% inside)
  const wallRatio = 0.22;
  const effectiveInfill = wallRatio + (1 - wallRatio) * (config.infillPercent / 100);

  // Model weight
  const modelVolumeCm3 = metrics.volumeCm3 * effectiveInfill;
  let weightGrams = modelVolumeCm3 * material.density;

  // Support material factor
  let supportWeightGrams = 0;
  if (config.supports) {
    // Estimating supports based on overhang risk and surface area
    supportWeightGrams = weightGrams * 0.18;
    weightGrams += supportWeightGrams;
  }

  // Material cost
  const materialCost = weightGrams * material.pricePerGram;
  const supportCost = supportWeightGrams * material.pricePerGram * 1.1;

  // Print time estimation (Minutes)
  // Base volumetric flow rate: ~10 mm³/s => 0.6 cm³/min for standard nozzle
  const baseMinutesPerCm3 = 2.4 * quality.speedMultiplier;
  const layerCount = Math.ceil(metrics.dimensionsMm.z / quality.layerHeight);
  const layerTimeMinutes = layerCount * 0.12; // Z-hop / layer change overhead
  let printTimeMinutes = Math.round(modelVolumeCm3 * baseMinutesPerCm3 + layerTimeMinutes + 12); // +12 min bed prep & heatup

  if (config.supports) {
    printTimeMinutes = Math.round(printTimeMinutes * 1.25);
  }

  // Machine hourly rate (e.g., 25 THB / hour)
  const machineRatePerHour = 28;
  const machineTimeCost = (printTimeMinutes / 60) * machineRatePerHour;

  // Base setup / slicing / bed prep fee
  const baseSetupFee = 35;

  // Unit price calculation
  let unitPrice = (materialCost + machineTimeCost + baseSetupFee) * quality.priceMultiplier;

  // Minimum job threshold
  if (unitPrice < 80) {
    unitPrice = 80;
  }

  // Round up to nice integer
  unitPrice = Math.ceil(unitPrice);
  const totalPrice = unitPrice * Math.max(1, config.quantity);

  return {
    weightGrams: Number(weightGrams.toFixed(1)),
    printTimeMinutes,
    materialCost: Math.round(materialCost),
    machineTimeCost: Math.round(machineTimeCost),
    supportCost: Math.round(supportCost),
    baseSetupFee,
    unitPrice,
    totalPrice,
  };
}

/**
 * Format print time nicely
 */
export function formatPrintTime(minutes: number): string {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs === 0) return `${mins} นาที`;
  if (mins === 0) return `${hrs} ชั่วโมง`;
  return `${hrs} ชม. ${mins} นาที`;
}
