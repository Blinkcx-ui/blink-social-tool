import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Upload directly to Vercel Blob storage to get a public HTTP URL
    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const blob = await put(filename, file, {
      access: 'public',
    });

    const mediaType = file.type.startsWith('video/') 
      ? 'video' 
      : file.type.includes('pdf') || file.type.includes('document') 
        ? 'document' 
        : 'image';

    return NextResponse.json({ 
      success: true, 
      url: blob.url, // Public URL needed for Meta publishing
      type: mediaType, 
      fileName: file.name 
    });
  } catch (error: any) {
    console.error('Blob upload error:', error);
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
  }
}