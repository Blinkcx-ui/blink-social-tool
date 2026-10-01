import './globals.css';

export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex h-screen bg-slate-50 antialiased overflow-hidden">
        {/* Main Application Shell */}
        <div className="flex h-screen w-full overflow-hidden">
          {children}
        </div>
      </body>
    </html>
  );
}