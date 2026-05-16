'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';

export function InboxBadge({ mobile = false }: { mobile?: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const fetchCount = async () => {
      try {
        const res = await fetch('/api/chat/unread-by-listing');
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setCount(data.totalUnread || 0);
      } catch {}
    };
    fetchCount();
    const id = setInterval(fetchCount, 30_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  if (mobile) {
    return (
      <Link href="/chat" className="flex items-center justify-between text-white hover:text-[#d4a853] py-2 font-semibold">
        <span>💬 Messages</span>
        {count > 0 && (
          <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">{count}</span>
        )}
      </Link>
    );
  }

  return (
    <Link
      href="/chat"
      className="relative text-white hover:text-[#d4a853] p-1.5"
      title="Messages"
    >
      <MessageCircle size={20} />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center font-bold">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
}
