'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, MessageSquare, UploadCloud, FileText, UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const MOBILE_NAV_ITEMS = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/chat', label: 'Chat', icon: MessageSquare },
  { href: '/upload', label: 'Upload', icon: UploadCloud },
  { href: '/documents', label: 'Docs', icon: FileText },
  { href: '/profile', label: 'Profile', icon: UserCircle },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-stone dark:border-pine-400/30 bg-card/95 backdrop-blur-sm">
      <div className="flex items-stretch justify-around">
        {MOBILE_NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-0.5 py-2.5 px-3 text-[10px] font-medium flex-1',
                isActive ? 'text-sage-600 dark:text-sage-300' : 'text-muted-foreground'
              )}
            >
              <Icon className="h-4.5 w-4.5" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
