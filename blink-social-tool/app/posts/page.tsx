import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export default async function PostsPage() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
  });

  // Action to delete a post
  async function deletePost(formData: FormData) {
    'use server';
    const postId = formData.get('postId') as string;
    if (!postId) return;

    await prisma.post.delete({ where: { id: postId } });
    revalidatePath('/posts');
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8 flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto">

        {/* Header & Create Button */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Social Posts</h1>
            <p className="text-sm text-slate-500 mt-1">Manage, edit, and publish content across your channels.</p>
          </div>
          <Link
            href="/posts/new"
            className="bg-brand-orange hover:bg-orange-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm"
          >
            + Create New Post
          </Link>
        </div>

        {/* Posts List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {posts.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              No posts found. Click &quot;Create New Post&quot; to publish your first update!
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {posts.map((post) => (
                <div key={post.id} className="p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                  <div className="space-y-1.5 flex-1 pr-4">
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 capitalize border border-blue-100">
                        {post.platform}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 capitalize border border-emerald-100">
                        {post.status}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-800">{post.content}</p>
                    <p className="text-xs text-slate-400">Published on {new Date(post.createdAt).toLocaleDateString()}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    {post.mediaUrl && (
                      <div className="w-16 h-16 relative rounded-lg overflow-hidden border border-gray-200 shrink-0 shadow-sm">
                        <img src={post.mediaUrl} alt="Post media" className="w-full h-full object-cover" />
                      </div>
                    )}

                    {/* Management Controls: Delete & Edit */}
                    <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
                      <Link 
                        href={`/posts/edit/${post.id}`} 
                        className="p-2 text-slate-500 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-md transition-colors text-xs font-medium"
                        title="Edit Post"
                      >
                        ✏️ Edit
                      </Link>
                      
                      <form action={deletePost}>
                        <input type="hidden" name="postId" value={post.id} />
                        <button 
                          type="submit" 
                          className="p-2 text-slate-500 hover:text-red-600 bg-gray-50 hover:bg-red-50 rounded-md transition-colors text-xs font-medium cursor-pointer"
                          title="Delete Post"
                        >
                          🗑️ Delete
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}