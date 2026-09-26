import Link from "next/link";
import { clientConfig } from '@/lib/clientConfig';

export default function Sidebar() {
  return (
    <aside className="w-64 bg-brand-light border-r border-brand-border h-screen flex flex-col">
      {/* Logo & Client Header */}
      <div className="p-6 border-b border-brand-border bg-brand-card">
        <Link href="/" className="flex items-center gap-3">
          <div className="bg-brand-orange text-white font-bold w-9 h-9 rounded-lg flex items-center justify-center text-lg shadow-sm">
            {clientConfig.appLogoChar}
          </div>
          <span className="font-bold text-xl text-slate-800">
            {clientConfig.appName}
          </span>
        </Link>

        {/* Client Dropdown */}
        <select className="mt-4 w-full p-2 border border-brand-border rounded-md text-sm bg-brand-light focus:outline-brand-orange cursor-pointer">
          <option>Client: Alpha Corp</option>
          <option>Client: Beta LLC</option>
        </select>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-2">
        <Link href="/" className="block p-3 rounded-md bg-brand-card text-brand-orange border border-brand-border font-medium shadow-sm">
          Dashboard
        </Link>
        <Link href="/inbox" className="block p-3 rounded-md text-gray-600 hover:bg-brand-card hover:text-brand-orange transition-colors">
          Unified Inbox
        </Link>
        <Link href="/reports" className="block p-3 rounded-md text-gray-600 hover:bg-brand-card hover:text-brand-orange transition-colors">
          Reports
        </Link>
        <Link href="/settings" className="block p-3 rounded-md text-gray-600 hover:bg-brand-card hover:text-brand-orange transition-colors">
          Settings
        </Link>
      </nav>
    </aside>
  );
}