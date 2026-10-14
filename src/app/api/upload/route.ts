import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const type = (formData.get('type') as string) || 'stl'; // 'stl' | 'slip'

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = path.extname(file.name).toLowerCase();
    const baseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    const finalFilename = `${baseName}-${uniqueSuffix}${ext}`;

    const targetSubdir = type === 'slip' ? 'slips' : 'stl';
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', targetSubdir);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, finalFilename);
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${targetSubdir}/${finalFilename}`;

    return NextResponse.json({
      success: true,
      filename: file.name,
      storedFilename: finalFilename,
      url: publicUrl,
      size: file.size,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message || 'Failed to upload file' }, { status: 500 });
  }
}
