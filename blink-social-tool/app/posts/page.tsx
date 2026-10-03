import Link from 'next/link';
import { prisma } from '@/lib/prisma'; // Using the global instance instead of new PrismaClient() so Vercel doesn't run out of database connections

export const dynamic = 'force-dynamic';

export default async function PostsPage() {
  // Fetch real posts from your database
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">

        {/* Header & Create Button */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Social Posts</h1>
            <p className="text-sm text-slate-500 mt-1">Manage and publish content across your channels.</p>
          </div>
          <Link
            href="/posts/new"
            className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            + Create New Post
          </Link>
        </div>

        {/* Posts Table / List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {posts.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              No posts found. Click "Create New Post" to publish your first update!
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {posts.map((post) => (
                <div key={post.id} className="p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 capitalize">
                        {post.platform}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 capitalize">
                        {post.status}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-800 line-clamp-1 mt-1">{post.content}</p>
                    <p className="text-xs text-slate-400">Published on {new Date(post.createdAt).toLocaleDateString()}</p>
                  </div>
                  {post.mediaUrl && (
                    <div className="w-16 h-16 relative rounded-lg overflow-hidden border border-gray-200 shrink-0">
                      <img src={post.mediaUrl} alt="Post media" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}