import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createOrder, getOrders } from '@/lib/db';
import { OrderItem } from '@/lib/types';
import { estimatePrice } from '@/lib/stl-utils';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const searchParams = req.nextUrl.searchParams;
    const emailParam = searchParams.get('email');

    const isAdmin = (session?.user as any)?.role === 'ADMIN';

    // If admin, can view all orders or filter by query
    if (isAdmin) {
      const orders = getOrders(emailParam || undefined);
      return NextResponse.json({ orders });
    }

    // If regular logged-in customer, only view their own
    if (session?.user?.email) {
      const orders = getOrders(session.user.email);
      return NextResponse.json({ orders });
    }

    // If anonymous tracking by email query
    if (emailParam) {
      const orders = getOrders(emailParam);
      return NextResponse.json({ orders });
    }

    return NextResponse.json({ orders: [] });
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();

    const { customer, fileName, fileSize, fileUrl, metrics, config, payment, previewImageUrl } = body;

    if (!customer || !fileUrl || !metrics || !config) {
      return NextResponse.json({ error: 'Missing required order fields' }, { status: 400 });
    }

    // Verify / recalculate price for data integrity
    const calculatedPrice = estimatePrice(metrics, config);

    const year = new Date().getFullYear();
    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    const orderId = `ORD-${year}-${randomSeq}`;

    const newOrder: OrderItem = {
      id: orderId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      customer,
      userEmail: session?.user?.email || customer.email,
      fileName: fileName || 'model.stl',
      fileSize: fileSize || 0,
      fileUrl,
      previewImageUrl,
      metrics,
      config,
      estimation: calculatedPrice,
      status: payment?.slipUrl ? 'PAYMENT_SUBMITTED' : 'PENDING_PAYMENT',
      payment: {
        method: 'PROMPTPAY',
        amount: calculatedPrice.totalPrice,
        slipUrl: payment?.slipUrl,
        paidAt: payment?.slipUrl ? new Date().toISOString() : undefined,
      },
    };

    const saved = createOrder(newOrder);

    return NextResponse.json({ success: true, order: saved }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: error.message || 'Failed to create order' }, { status: 500 });
  }
}
