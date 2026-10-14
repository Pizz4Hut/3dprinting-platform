import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getOrderById } from '@/lib/db';
import fs from 'fs';
import path from 'path';

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

    // Security check: only authenticated Admin or the file owner can download the STL
    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: 'Unauthorized: Staff or Admin role required to download customer STL files' },
        { status: 403 }
      );
    }

    // Resolve file path
    let absolutePath = '';
    if (order.fileUrl.startsWith('/uploads/')) {
      absolutePath = path.join(process.cwd(), 'public', order.fileUrl);
    } else if (order.fileUrl.startsWith('/samples/')) {
      absolutePath = path.join(process.cwd(), 'public', order.fileUrl);
    } else {
      absolutePath = path.join(process.cwd(), 'public', 'uploads', 'stl', path.basename(order.fileUrl));
    }

    if (!fs.existsSync(absolutePath)) {
      return NextResponse.json({ error: 'STL file not found on disk' }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(absolutePath);
    const downloadName = order.fileName.endsWith('.stl') ? order.fileName : `${order.fileName}.stl`;

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'model/stl',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(downloadName)}"`,
        'Content-Length': fileBuffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Failed to download file' }, { status: 500 });
  }
}
