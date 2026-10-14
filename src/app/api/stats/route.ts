import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAdminStats } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const isAdmin = (session?.user as any)?.role === 'ADMIN';

    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const stats = getAdminStats();
    return NextResponse.json({ stats });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
  }
}
