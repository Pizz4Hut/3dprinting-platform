import fs from 'fs';
import path from 'path';
import { AdminStats, OrderItem, OrderStatus } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');
const STL_DIR = path.join(UPLOADS_DIR, 'stl');
const SLIPS_DIR = path.join(UPLOADS_DIR, 'slips');

// Ensure required directories exist
function ensureDirs() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  if (!fs.existsSync(STL_DIR)) fs.mkdirSync(STL_DIR, { recursive: true });
  if (!fs.existsSync(SLIPS_DIR)) fs.mkdirSync(SLIPS_DIR, { recursive: true });
}

// Initial sample orders for immediate testing & demonstration
const INITIAL_ORDERS: OrderItem[] = [
  {
    id: 'ORD-2026-9041',
    createdAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
    customer: {
      name: 'Somchai Prasert',
      email: 'somchai.p@gmail.com',
      phone: '089-123-4567',
      address: '99/12 หมู่บ้านพฤกษาลดา ถ.ราชพฤกษ์ ต.บางกร่าง อ.เมือง จ.นนทบุรี 11000',
    },
    userEmail: 'somchai.p@gmail.com',
    fileName: 'benchy_calibration_test.stl',
    fileSize: 2458320,
    fileUrl: '/samples/benchy.stl',
    metrics: {
      volumeCm3: 15.4,
      dimensionsMm: { x: 60.0, y: 31.0, z: 48.0 },
      surfaceAreaCm2: 82.5,
      triangleCount: 22450,
    },
    config: {
      material: 'PLA',
      color: 'Galaxy Blue',
      quality: 'HIGH',
      infillPercent: 20,
      infillPattern: 'gyroid',
      supports: false,
      quantity: 1,
      specialInstructions: 'ขอเก็บขอบให้เรียบเนียนที่สุดครับ ใช้เป็นตัวโชว์หน้าร้าน',
    },
    estimation: {
      weightGrams: 18.2,
      printTimeMinutes: 145,
      materialCost: 22,
      machineTimeCost: 68,
      supportCost: 0,
      baseSetupFee: 35,
      unitPrice: 150,
      totalPrice: 150,
    },
    status: 'PRINTING',
    payment: {
      method: 'PROMPTPAY',
      amount: 150,
      slipUrl: '/samples/sample_slip.png',
      paidAt: new Date(Date.now() - 3600 * 1000 * 1.5).toISOString(),
      verifiedAt: new Date(Date.now() - 3600 * 1000 * 1.2).toISOString(),
      verifiedBy: 'Staff Operator 01',
    },
    trackingNumber: 'TH-EX-8891024',
    staffNotes: 'Bambu Lab X1-Carbon #03 assigned. Bed temp 60C, Nozzle 215C.',
  },
  {
    id: 'ORD-2026-9042',
    createdAt: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 1).toISOString(),
    customer: {
      name: 'Nattaporn Srisuk',
      email: 'nattaporn.s@outlook.com',
      phone: '081-987-6543',
      address: '55/4 อาคารสำนักงานเอ็มไพร์ทาวเวอร์ ชั้น 24 ถ.สาทรใต้ แขวงยานนาวา เขตสาทร กทม. 10120',
    },
    userEmail: 'nattaporn.s@outlook.com',
    fileName: 'drone_motor_mount_v2.stl',
    fileSize: 4120890,
    fileUrl: '/samples/drone_mount.stl',
    metrics: {
      volumeCm3: 42.8,
      dimensionsMm: { x: 110.0, y: 95.0, z: 28.5 },
      surfaceAreaCm2: 148.2,
      triangleCount: 48900,
    },
    config: {
      material: 'PETG',
      color: 'Jet Black',
      quality: 'STANDARD',
      infillPercent: 50,
      infillPattern: 'grid',
      supports: true,
      quantity: 4,
      specialInstructions: 'เน้นความแข็งแรงสูงครับ เป็นชิ้นส่วนยึดมอเตอร์โดรน',
    },
    estimation: {
      weightGrams: 58.6,
      printTimeMinutes: 280,
      materialCost: 94,
      machineTimeCost: 130,
      supportCost: 20,
      baseSetupFee: 35,
      unitPrice: 280,
      totalPrice: 1120,
    },
    status: 'PAYMENT_SUBMITTED',
    payment: {
      method: 'PROMPTPAY',
      amount: 1120,
      slipUrl: '/samples/sample_slip.png',
      paidAt: new Date(Date.now() - 3600 * 1000 * 1).toISOString(),
    },
    staffNotes: 'รอเจ้าหน้าที่ตรวจสอบสลิป 1,120 บาท ยอดตรงกับรายการโอน',
  },
  {
    id: 'ORD-2026-9043',
    createdAt: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
    customer: {
      name: 'Kittisak Techaphan',
      email: 'kittisak.t@gmail.com',
      phone: '086-555-4321',
      address: '12/8 หมู่ 3 ต.สุเทพ อ.เมือง จ.เชียงใหม่ 50200',
    },
    userEmail: 'kittisak.t@gmail.com',
    fileName: 'custom_phone_case_magsafe.stl',
    fileSize: 1850320,
    fileUrl: '/samples/phone_case.stl',
    metrics: {
      volumeCm3: 28.1,
      dimensionsMm: { x: 150.0, y: 75.0, z: 12.0 },
      surfaceAreaCm2: 190.4,
      triangleCount: 31200,
    },
    config: {
      material: 'TPU',
      color: 'Translucent White',
      quality: 'HIGH',
      infillPercent: 100,
      infillPattern: 'gyroid',
      supports: false,
      quantity: 1,
    },
    estimation: {
      weightGrams: 34.0,
      printTimeMinutes: 210,
      materialCost: 95,
      machineTimeCost: 98,
      supportCost: 0,
      baseSetupFee: 35,
      unitPrice: 275,
      totalPrice: 275,
    },
    status: 'SHIPPED',
    payment: {
      method: 'PROMPTPAY',
      amount: 275,
      slipUrl: '/samples/sample_slip.png',
      paidAt: new Date(Date.now() - 3600 * 1000 * 20).toISOString(),
      verifiedAt: new Date(Date.now() - 3600 * 1000 * 18).toISOString(),
      verifiedBy: 'Admin',
    },
    trackingNumber: 'KEX-002918239TH',
    staffNotes: 'จัดส่ง Flash Express แล้ว',
  },
];

export function readOrders(): OrderItem[] {
  ensureDirs();
  if (!fs.existsSync(ORDERS_FILE)) {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(INITIAL_ORDERS, null, 2), 'utf-8');
    return INITIAL_ORDERS;
  }
  try {
    const raw = fs.readFileSync(ORDERS_FILE, 'utf-8');
    return JSON.parse(raw) as OrderItem[];
  } catch (err) {
    console.error('Failed to read orders.json:', err);
    return [];
  }
}

export function writeOrders(orders: OrderItem[]): void {
  ensureDirs();
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');
}

export function getOrders(filterEmail?: string): OrderItem[] {
  const all = readOrders();
  if (filterEmail) {
    return all.filter((o) => o.userEmail?.toLowerCase() === filterEmail.toLowerCase() || o.customer.email.toLowerCase() === filterEmail.toLowerCase());
  }
  return all;
}

export function getOrderById(id: string): OrderItem | null {
  const all = readOrders();
  return all.find((o) => o.id === id) || null;
}

export function createOrder(order: OrderItem): OrderItem {
  const all = readOrders();
  all.unshift(order);
  writeOrders(all);
  return order;
}

export function updateOrder(id: string, updates: Partial<OrderItem>): OrderItem | null {
  const all = readOrders();
  const index = all.findIndex((o) => o.id === id);
  if (index === -1) return null;

  const updated: OrderItem = {
    ...all[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  all[index] = updated;
  writeOrders(all);
  return updated;
}

export function deleteOrder(id: string): boolean {
  const all = readOrders();
  const filtered = all.filter((o) => o.id !== id);
  if (filtered.length === all.length) return false;
  writeOrders(filtered);
  return true;
}

export function getAdminStats(): AdminStats {
  const orders = readOrders();
  return {
    totalOrders: orders.length,
    pendingPayment: orders.filter((o) => o.status === 'PENDING_PAYMENT').length,
    pendingVerification: orders.filter((o) => o.status === 'PAYMENT_SUBMITTED').length,
    inProduction: orders.filter((o) => o.status === 'PAYMENT_VERIFIED' || o.status === 'PRINTING').length,
    completed: orders.filter((o) => o.status === 'COMPLETED' || o.status === 'SHIPPED').length,
    totalRevenue: orders
      .filter((o) => o.status !== 'CANCELLED' && o.status !== 'PENDING_PAYMENT')
      .reduce((sum, o) => sum + o.estimation.totalPrice, 0),
    totalFilamentUsedGrams: orders
      .filter((o) => o.status !== 'CANCELLED')
      .reduce((sum, o) => sum + o.estimation.weightGrams * (o.config.quantity || 1), 0),
  };
}
