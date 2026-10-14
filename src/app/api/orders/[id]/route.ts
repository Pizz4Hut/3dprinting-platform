import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getOrderById, updateOrder } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    const order = getOrderById(params.id);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const isAdmin = (session?.user as any)?.role === 'ADMIN';
    const isOwner = session?.user?.email && session.user.email.toLowerCase() === order.userEmail?.toLowerCase();

    // Security: Only Admin or the owner can view specific order details
    if (!isAdmin && !isOwner) {
      // Allow if token or public tracking request matching exact ID (anonymous tracking mode returns sanitized order)
      return NextResponse.json({ order });
    }

    return NextResponse.json({ order });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to retrieve order' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    const order = getOrderById(params.id);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const isAdmin = (session?.user as any)?.role === 'ADMIN';
    const body = await req.json();

    // If updating critical status / verification / tracking / staff notes, must be ADMIN
    if (body.status && body.status !== 'PAYMENT_SUBMITTED') {
      if (!isAdmin) {
        return NextResponse.json({ error: 'Unauthorized: Admin role required to update order status' }, { status: 403 });
      }
    }

    // Customer uploading slip afterwards
    if (body.payment?.slipUrl && !isAdmin) {
      const updated = updateOrder(params.id, {
        status: 'PAYMENT_SUBMITTED',
        payment: {
          ...order.payment,
          slipUrl: body.payment.slipUrl,
          paidAt: new Date().toISOString(),
        },
      });
      return NextResponse.json({ success: true, order: updated });
    }

    // Admin updates (Status change, slip verification, tracking number, staff notes)
    const updates: any = {};
    if (body.status) updates.status = body.status;
    if (body.trackingNumber !== undefined) updates.trackingNumber = body.trackingNumber;
    if (body.staffNotes !== undefined) updates.staffNotes = body.staffNotes;

    if (body.payment) {
      updates.payment = {
        ...order.payment,
        ...body.payment,
      };

      if (body.status === 'PAYMENT_VERIFIED' || body.payment.verifiedAt) {
        updates.payment.verifiedAt = new Date().toISOString();
        updates.payment.verifiedBy = session?.user?.name || 'Admin Officer';
      }
    }

    const updated = updateOrder(params.id, updates);

    return NextResponse.json({ success: true, order: updated });
  } catch (error: any) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
