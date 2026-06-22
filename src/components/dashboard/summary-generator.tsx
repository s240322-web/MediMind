'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ClipboardList, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function SummaryGenerator({ hasDocuments }: { hasDocuments: boolean }) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [docCount, setDocCount] = useState<number | null>(null);

  async function generateSummary() {
    setLoading(true);
    setSummary(null);

    try {
      const res = await fetch('/api/summary', { method: 'POST', body: JSON.stringify({}) });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to generate summary');

      setSummary(data.summary);
      setDocCount(data.documentCount);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not generate summary');
    } finally {
      setLoading(false);
    }
  }

  if (!hasDocuments) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="mx-auto h-10 w-10 rounded-full bg-secondary flex items-center justify-center mb-3">
            <ClipboardList className="h-4.5 w-4.5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium mb-1">No reports to summarize yet</p>
          <p className="text-xs text-muted-foreground">Upload a report first to generate a health summary.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Button onClick={generateSummary} disabled={loading} className="gap-2">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        Generate Health Summary
      </Button>

      {summary && (
        <Card className="fade-up">
          <CardContent className="p-6">
            {docCount !== null && (
              <p className="text-xs font-mono text-muted-foreground mb-4">
                Based on {docCount} document{docCount !== 1 ? 's' : ''}
              </p>
            )}
            <div className="prose-summary">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{summary}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
