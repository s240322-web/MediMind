import { createClient } from '@/lib/supabase/server';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/dashboard/theme-toggle';
import { SignOutItem } from '@/components/dashboard/sign-out-item';
import { UserCircle } from 'lucide-react';
import Link from 'next/link';

export async function DashboardHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from('users').select('name, avatar_url, email').eq('id', user.id).single()
    : { data: null };

  const displayName = profile?.name || user?.email?.split('@')[0] || 'there';
  const initials = displayName
    .split(' ')
    .map((p: string) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="flex items-center justify-between h-16 px-4 md:px-6 border-b border-stone dark:border-pine-400/30 bg-card/60 backdrop-blur-sm sticky top-0 z-30">
      <div>
        <p className="text-xs text-muted-foreground font-mono">Welcome back</p>
        <p className="text-sm font-medium font-display">{displayName}</p>
      </div>

      <div className="flex items-center gap-1">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger className="outline-none ml-1">
            <Avatar>
              {profile?.avatar_url && <AvatarImage src={profile.avatar_url} alt={displayName} />}
              <AvatarFallback>{initials || <UserCircle className="h-4 w-4" />}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{profile?.email ?? user?.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <UserCircle className="h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <SignOutItem />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
