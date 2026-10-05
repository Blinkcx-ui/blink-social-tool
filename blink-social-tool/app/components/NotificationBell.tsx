'use client';

import { useState, useEffect } from 'react';

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const fetchAlerts = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (e) {
      console.error('Failed to fetch notifications');
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-300 hover:text-white transition-colors"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-brand-border rounded-lg shadow-xl z-50">
          <div className="p-3 border-b border-brand-border font-semibold text-sm flex justify-between items-center text-slate-800">
            <span>Notifications</span>
            <span className="text-xs bg-brand-orange text-white px-2 py-0.5 rounded-full">{unreadCount} New</span>
          </div>
          <div className="max-h-64 overflow-y-auto divide-y divide-brand-border">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <a href={n.targetUrl || '#'} key={n.id} className="block p-3 hover:bg-slate-50 text-xs">
                  <div className="font-semibold text-slate-800">{n.type}</div>
                  <p className="text-slate-600 mt-0.5">{n.content}</p>
                </a>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-slate-500">No new notifications</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}