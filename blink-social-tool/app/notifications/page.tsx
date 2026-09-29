'use client';

import { useState, useEffect } from 'react';

type Notification = {
  id: string;
  type: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  socialAccount?: { platform: string };
};

export default function NotificationsPage() {
  const [clientId] = useState('YOUR_CLIENT_ID_HERE'); // Replace with auth context later
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const res = await fetch(`/api/notifications?clientId=${clientId}`);
        const data = await res.json();
        if (data.notifications) {
          setNotifications(data.notifications);
        }
      } catch (error) {
        console.error('Failed to load notifications', error);
      } finally {
        setLoading(false);
      }
    }
    fetchNotifications();
  }, [clientId]);

  const getPlatformColor = (platform?: string) => {
    switch (platform?.toLowerCase()) {
      case 'instagram': return 'bg-pink-100 text-pink-700';
      case 'twitter': return 'bg-blue-100 text-blue-700';
      case 'whatsapp': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Activity & Notifications</h1>
          <p className="text-sm text-slate-500 mt-1">Stay updated on comments, mentions, and follows.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading activity...</div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              You're all caught up! No new notifications.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notif) => (
                <div key={notif.id} className={`p-5 flex items-start gap-4 transition-colors ${notif.isRead ? 'bg-white' : 'bg-blue-50/30'}`}>
                  
                  {/* Platform Badge */}
                  {notif.socialAccount && (
                    <div className={`mt-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shrink-0 ${getPlatformColor(notif.socialAccount.platform)}`}>
                      {notif.socialAccount.platform}
                    </div>
                  )}

                  {/* Notification Content */}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">{notif.content}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-semibold text-slate-500">{notif.type}</span>
                      <span className="text-xs text-slate-400">&bull; {new Date(notif.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  {/* Unread Indicator */}
                  {!notif.isRead && (
                    <div className="w-2.5 h-2.5 bg-brand-orange rounded-full shrink-0 mt-1.5" />
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