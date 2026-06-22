import Link from 'next/link';
import { Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { DocumentsList } from '@/components/upload/documents-list';
import { Button } from '@/components/ui/button';

export default async function DocumentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', user!.id)
    .order('uploaded_at', { ascending: false });

  return (
    <div className="px-4 md:px-6 py-6 space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Your documents</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Only visible to you — isolated from every other account.
          </p>
        </div>
        <Link href="/upload">
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" /> Upload
          </Button>
        </Link>
      </div>

      <DocumentsList documents={documents ?? []} />
    </div>
  );
}
