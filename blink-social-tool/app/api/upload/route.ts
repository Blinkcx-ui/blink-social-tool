import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Convert file buffer to base64 Data URL (Fully serverless-compatible on Vercel)
    const base64String = buffer.toString('base64');
    const mimeType = file.type || 'image/png';
    const dataUrl = `data:${mimeType};base64,${base64String}`;

    const mediaType = mimeType.startsWith('video/') 
      ? 'video' 
      : mimeType.includes('pdf') || mimeType.includes('document') 
        ? 'document' 
        : 'image';

    return NextResponse.json({ 
      success: true, 
      url: dataUrl, 
      type: mediaType, 
      fileName: file.name 
    });
  } catch (error: any) {
    console.error('File upload error:', error);
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
  }
}