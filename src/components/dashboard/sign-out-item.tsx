'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';

export function SignOutItem() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <DropdownMenuItem onClick={handleSignOut} className="text-clay-600 dark:text-clay-300">
      <LogOut className="h-4 w-4" />
      Sign out
    </DropdownMenuItem>
  );
}
