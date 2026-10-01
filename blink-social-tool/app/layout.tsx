import './globals.css';

export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="h-screen w-screen bg-slate-900 antialiased overflow-x-hidden m-0 p-0">
        {children}
      </body>
    </html>
  );
}