export type MaterialType = 'PLA' | 'PETG' | 'ABS' | 'TPU' | 'RESIN';

export type QualityType = 'DRAFT' | 'STANDARD' | 'HIGH' | 'ULTRA';

export type InfillPattern = 'grid' | 'gyroid' | 'honeycomb' | 'triangles';

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAYMENT_SUBMITTED'
  | 'PAYMENT_VERIFIED'
  | 'PRINTING'
  | 'COMPLETED'
  | 'SHIPPED'
  | 'CANCELLED';

export interface MaterialOption {
  id: MaterialType;
  name: string;
  density: number; // g/cm³
  pricePerGram: number; // THB
  description: string;
  colors: string[];
}

export interface QualityOption {
  id: QualityType;
  name: string;
  layerHeight: number; // mm
  speedMultiplier: number; // affects print time
  priceMultiplier: number;
  description: string;
}

export interface ModelMetrics {
  volumeCm3: number;
  dimensionsMm: {
    x: number;
    y: number;
    z: number;
  };
  surfaceAreaCm2: number;
  triangleCount: number;
}

export interface PrintConfig {
  material: MaterialType;
  color: string;
  quality: QualityType;
  infillPercent: number;
  infillPattern: InfillPattern;
  supports: boolean;
  quantity: number;
  specialInstructions?: string;
}

export interface PriceEstimation {
  weightGrams: number;
  printTimeMinutes: number;
  materialCost: number;
  machineTimeCost: number;
  supportCost: number;
  baseSetupFee: number;
  unitPrice: number;
  totalPrice: number;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface OrderItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  customer: CustomerInfo;
  userEmail?: string;
  fileName: string;
  fileSize: number;
  fileUrl: string; // STL file path
  previewImageUrl?: string;
  metrics: ModelMetrics;
  config: PrintConfig;
  estimation: PriceEstimation;
  status: OrderStatus;
  payment: {
    method: 'PROMPTPAY';
    amount: number;
    slipUrl?: string;
    paidAt?: string;
    verifiedAt?: string;
    verifiedBy?: string;
  };
  trackingNumber?: string;
  staffNotes?: string;
}

export interface AdminStats {
  totalOrders: number;
  pendingPayment: number;
  pendingVerification: number;
  inProduction: number;
  completed: number;
  totalRevenue: number;
  totalFilamentUsedGrams: number;
}
