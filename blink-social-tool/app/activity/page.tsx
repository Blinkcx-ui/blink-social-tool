import { prisma } from '@/lib/prisma';

export const revalidate = 0;

export default async function ActivityLogPage() {
  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-6 rounded-xl shadow-lg flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Activity Stream & Audit Log</h1>
          <p className="text-sm text-gray-300 mt-1">Real-time system events, ticket creations, and account alerts.</p>
        </div>
        <span className="bg-brand-orange text-white text-xs font-semibold px-3 py-1.5 rounded-full">
          {notifications.length} Total Events
        </span>
      </div>

      <div className="bg-white border border-brand-border rounded-xl shadow-sm overflow-hidden">
        <div className="divide-y divide-brand-border">
          {notifications.length > 0 ? (
            notifications.map((event) => (
              <div key={event.id} className="p-4 hover:bg-gray-50 flex items-center justify-between transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center text-brand-orange font-bold text-sm">
                    ⚡
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800 text-sm">{event.type}</span>
                      <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200">
                        {new Date(event.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5">{event.content}</p>
                  </div>
                </div>
                {event.targetUrl && (
                  <a 
                    href={event.targetUrl} 
                    className="text-xs bg-brand-light text-brand-orange border border-brand-orange/30 hover:bg-brand-orange hover:text-white px-3 py-1.5 rounded-md font-medium transition-colors"
                  >
                    View Details →
                  </a>
                )}
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500 text-sm">No activity events recorded yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}