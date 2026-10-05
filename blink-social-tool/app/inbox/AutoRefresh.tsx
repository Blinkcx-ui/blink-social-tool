'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AutoRefresh() {
  const router = useRouter();

  useEffect(() => {
    // Silently refreshes the server data every 3 seconds
    const interval = setInterval(() => {
      router.refresh();
    }, 3000);

    return () => clearInterval(interval);
  }, [router]);

  return null; // This component is invisible
}