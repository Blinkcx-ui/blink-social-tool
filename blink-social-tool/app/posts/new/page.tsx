'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewPostPage() {
  const [platform, setPlatform] = useState('instagram');
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setMediaUrl(data.url);
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch (err) {
      alert('Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/posts/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, content, mediaUrl }),
      });

      const data = await res.json();
      if (res.ok) {
        router.push('/posts');
        router.refresh();
      } else {
        alert(data.error || 'Failed to publish post');
      }
    } catch (err) {
      alert('Network error publishing post');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center">
      <div className="max-w-xl w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Create & Publish Post</h1>
          <p className="text-xs text-slate-500 mt-1">Publish updates or upload images straight from your PC.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Platform</label>
            <select 
              value={platform} 
              onChange={e => setPlatform(e.target.value)}
              className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-orange-500"
            >
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="twitter">X (Twitter)</option>
              <option value="tiktok">TikTok</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Caption / Message</label>
            <textarea 
              value={content}
              onChange={e => setContent(e.target.value)}
              required
              rows={4}
              placeholder="What would you like to share?"
              className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Upload Image from PC</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={handleFileUpload}
              className="w-full p-2 border border-gray-200 rounded-lg text-sm bg-gray-50 cursor-pointer"
            />
            {uploading && <p className="text-xs text-orange-500 mt-1">Processing image...</p>}
            {mediaUrl && <p className="text-xs text-emerald-600 mt-1 font-semibold">✓ Image Attached Successfully</p>}
          </div>

          <button 
            type="submit" 
            disabled={submitting || uploading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 rounded-lg text-sm transition-colors disabled:opacity-50 cursor-pointer"
          >
            {submitting ? 'Publishing...' : 'Publish Now'}
          </button>
        </form>
      </div>
    </div>
  );
}