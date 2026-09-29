'use client';

import { useState } from 'react';

export default function NewPostPage() {
  // For testing right now, you can hardcode or dynamically fetch your client ID.
  // Once session auth is tied in, you can pull this from your logged-in user context.
  const [clientId] = useState('YOUR_CLIENT_ID_HERE'); 
  
  const [platform, setPlatform] = useState('instagram');
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Handle direct file upload from PC using Vercel Blob
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setMediaUrl(data.url);
      setMessage('Image uploaded successfully from your device!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/posts/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, platform, content, mediaUrl }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to publish post');

      setMessage('Post published successfully!');
      setContent('');
      setMediaUrl('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Create & Publish Post</h1>
          <p className="text-sm text-slate-500 mt-1">
            Publish updates or upload images straight from your PC.
          </p>
        </div>

        {message && (
          <div className="bg-emerald-50 text-emerald-700 text-sm p-3 rounded-lg mb-6 border border-emerald-100">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-6 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handlePublish} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Select Platform</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-brand-orange"
            >
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="twitter">Twitter / X</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Caption / Message</label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              placeholder="Write your post caption..."
              className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-brand-orange"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Upload Image from PC</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full p-2 border border-gray-200 rounded-lg text-sm bg-gray-50 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-800 file:text-white hover:file:bg-slate-700"
            />
            {uploading && <p className="text-xs text-slate-500 mt-1">Uploading image...</p>}
            {mediaUrl && <p className="text-xs text-emerald-600 mt-1">Attached URL: {mediaUrl}</p>}
          </div>

          <button
            type="submit"
            disabled={loading || uploading}
            className="w-full bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {loading ? 'Publishing...' : 'Publish Now'}
          </button>
        </form>
      </div>
    </div>
  );
}