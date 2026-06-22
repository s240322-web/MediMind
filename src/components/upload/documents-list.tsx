'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { DocumentRow } from '@/types/database';

export function DocumentsList({ documents }: { documents: DocumentRow[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string, name: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/documents?id=${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete');
      }
      toast.success(`Removed ${name}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete document');
    } finally {
      setDeletingId(null);
    }
  }

  if (documents.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="mx-auto h-10 w-10 rounded-full bg-secondary flex items-center justify-center mb-3">
            <FileText className="h-4.5 w-4.5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium mb-1">No documents uploaded</p>
          <p className="text-xs text-muted-foreground">Reports you upload will appear here.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2.5">
      {documents.map((doc) => (
        <Card key={doc.id}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-md bg-sage-50 dark:bg-sage-600/15 flex items-center justify-center shrink-0">
              <FileText className="h-4 w-4 text-sage-600 dark:text-sage-300" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{doc.file_name}</p>
              <p className="text-xs text-muted-foreground font-mono">
                {doc.file_type.toUpperCase()} · {formatDistanceToNow(new Date(doc.uploaded_at), { addSuffix: true })}
              </p>
            </div>
            <span
              className={
                doc.status === 'ready'
                  ? 'badge-normal'
                  : doc.status === 'failed'
                  ? 'badge-abnormal'
                  : 'text-xs font-mono text-muted-foreground'
              }
            >
              {doc.status}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(doc.id, doc.file_name)}
              disabled={deletingId === doc.id}
              aria-label={`Delete ${doc.file_name}`}
              className="text-muted-foreground hover:text-clay-500"
            >
              {deletingId === doc.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
