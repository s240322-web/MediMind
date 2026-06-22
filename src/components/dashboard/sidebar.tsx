'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MessageSquare,
  UploadCloud,
  FileText,
  ClipboardList,
  UserCircle,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/chat', label: 'Chat', icon: MessageSquare },
  { href: '/upload', label: 'Upload', icon: UploadCloud },
  { href: '/documents', label: 'Documents', icon: FileText },
  { href: '/summary', label: 'Health Summary', icon: ClipboardList },
  { href: '/profile', label: 'Profile', icon: UserCircle },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:flex-col w-60 shrink-0 border-r border-stone dark:border-pine-400/30 bg-paper-dim/40 dark:bg-pine-500/20">
      <div className="flex items-center gap-2 px-5 h-16 border-b border-stone dark:border-pine-400/30">
        <div className="h-7 w-7 rounded-md bg-sage flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-paper" />
        </div>
        <span className="font-display text-base font-semibold tracking-tight">MediMind AI</span>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sage-50 text-sage-700 dark:bg-sage-600/15 dark:text-sage-200'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-5">
        <p className="px-3 text-[10px] uppercase tracking-[0.1em] text-muted-foreground/70 font-mono">
          v1.0 · final-year project
        </p>
      </div>
    </aside>
  );
}
