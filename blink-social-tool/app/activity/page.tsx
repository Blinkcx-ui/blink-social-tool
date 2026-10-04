import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import Link from 'next/link';

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export const dynamic = 'force-dynamic';

export default async function ActivityPage() {
  const cookieStore = await cookies();
  const lang = cookieStore.get('NEXT_LOCALE')?.value || 'en';

  let notifications: any[] = [];

  try {
    const dbNotification = (prisma as any).notification || (prisma as any).Notification;
    if (dbNotification) {
      notifications = await dbNotification.findMany({
        include: { socialAccount: true },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
    }
  } catch (err) {
    console.error('Fetch activity notifications error:', err);
  }

  const getPlatformBadge = (platform?: string) => {
    if (!platform) return <span className="bg-stone-100 text-stone-800 text-xs px-2.5 py-1 rounded-full font-bold">System</span>;
    switch (platform.toLowerCase()) {
      case 'whatsapp': return <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-bold">WhatsApp</span>;
      case 'instagram': return <span className="bg-pink-100 text-pink-800 text-xs px-2.5 py-1 rounded-full font-bold">Instagram</span>;
      case 'tiktok': return <span className="bg-stone-900 text-white text-xs px-2.5 py-1 rounded-full font-bold">TikTok</span>;
      default: return <span className="bg-stone-100 text-stone-800 text-xs px-2.5 py-1 rounded-full font-bold">{platform}</span>;
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 text-stone-950 p-6">
      <div className="bg-[#2D2D2D] border-l-4 border-[#FF7A00] rounded-2xl p-8 text-white shadow-xl flex items-center justify-between">
        <div>
          <span className="bg-[#FF7A00]/20 text-[#FF7A00] text-xs font-semibold px-3 py-1 rounded-full border border-[#FF7A00]/30">
            SOCIAL ACTIVITY & NOTIFICATIONS
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight mt-3 text-white">
            {lang === 'ar' ? 'سجل النشاطات والتفاعلات' : 'Activity Stream & Social Alerts'}
          </h1>
          <p className="text-stone-300 text-sm mt-1">
            {lang === 'ar' 
              ? 'متابعة المتابعين الجدد، التعليقات، التقييمات، والإشارات في الوقت الفعلي.' 
              : 'Live feed of new followers, comments, mentions, reviews, and account updates.'}
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-stone-950 border-b border-stone-100 pb-3 flex justify-between items-center">
          <span>{lang === 'ar' ? 'جميع الإشعارات والأنشطة' : 'All Notifications & Events'}</span>
          <span className="text-xs bg-stone-100 text-stone-700 px-3 py-1 rounded-full font-mono font-bold">
            {notifications.length} Total
          </span>
        </h3>

        <div className="divide-y divide-stone-100">
          {notifications.map((item: any) => (
            <div key={item.id} className="py-4 flex items-center justify-between hover:bg-stone-50 px-4 rounded-xl transition">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  {getPlatformBadge(item.socialAccount?.platform)}
                  <span className="text-xs font-bold uppercase tracking-wider text-[#FF7A00] bg-orange-50 px-2 py-0.5 rounded border border-orange-100">
                    {item.type}
                  </span>
                  {!item.isRead && (
                    <span className="w-2 h-2 rounded-full bg-[#FF7A00] animate-pulse" title="Unread"></span>
                  )}
                </div>
                <p className="text-sm font-bold text-stone-950">{item.content}</p>
                <p className="text-xs text-stone-400 font-mono">
                  {new Date(item.createdAt).toLocaleString()}
                </p>
              </div>

              <div>
                <Link
                  href="/inbox"
                  className="bg-orange-50 text-[#FF7A00] hover:bg-orange-100 border border-orange-200 text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm inline-block"
                >
                  {lang === 'ar' ? 'عرض في الوارد' : 'View in Inbox →'}
                </Link>
              </div>
            </div>
          ))}

          {notifications.length === 0 && (
            <div className="text-center py-16 text-stone-400 space-y-2">
              <p className="text-base font-bold text-stone-700">{lang === 'ar' ? 'لا توجد إشعارات مسجلة بعد' : 'No activity notifications found.'}</p>
              <p className="text-xs">
                {lang === 'ar' ? 'ستظهر تفاعلات حساباتك الاجتماعية هنا تلقائياً.' : 'Webhook events for followers, comments, and reviews will appear here automatically.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}