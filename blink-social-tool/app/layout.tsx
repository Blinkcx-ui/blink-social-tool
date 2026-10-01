import './globals.css';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = headers();
  // Check if we are currently on the login page path
  const pathname = headersList.get('x-invoke-path') || '';
  const isLoginPage = pathname.includes('/login');

  return (
    <html lang="en">
      <body className="flex h-screen bg-brand-light antialiased">
        {/* If it's the login page, render ONLY the login component full screen without sidebar */}
        {isLoginPage ? (
          <main className="w-full h-full">{children}</main>
        ) : (
          <>
            {/* Your standard dashboard sidebar and navigation */}
            <aside className="w-64 bg-brand-light border-r border-brand-border h-screen flex flex-col">
              {/* Sidebar content */}
            </aside>
            <main className="flex-1 overflow-y-auto">
              {children}
            </main>
          </>
        )}
      </body>
    </html>
  );
}