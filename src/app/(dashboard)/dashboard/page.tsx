import Link from 'next/link';
import { FileText, MessageSquare, UploadCloud, ClipboardList, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MedicalDisclaimer } from '@/components/shared/medical-disclaimer';

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ count: docCount }, { count: readyCount }, { count: chatCount }, { data: recentDocs }] =
    await Promise.all([
      supabase.from('documents').select('*', { count: 'exact', head: true }).eq('user_id', user!.id),
      supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id)
        .eq('status', 'ready'),
      supabase.from('chat_history').select('*', { count: 'exact', head: true }).eq('user_id', user!.id),
      supabase
        .from('documents')
        .select('id, file_name, status, uploaded_at')
        .eq('user_id', user!.id)
        .order('uploaded_at', { ascending: false })
        .limit(4),
    ]);

  const hasDocuments = (docCount ?? 0) > 0;

  return (
    <div className="px-4 md:px-6 py-6 space-y-6 max-w-5xl">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          A quick look at your reports and conversations.
        </p>
      </div>

      {/* Vitals strip — signature element, reused as a live stats readout */}
      <div className="vitals-strip rounded-md">
        <div className="vitals-strip__item">
          <span className="vitals-strip__pulse" />
          <span className="vitals-strip__label">Documents</span>
          <span className="vitals-strip__value">{docCount ?? 0}</span>
        </div>
        <div className="vitals-strip__divider" />
        <div className="vitals-strip__item">
          <span className="vitals-strip__label">Ready to query</span>
          <span className="vitals-strip__value">{readyCount ?? 0}</span>
        </div>
        <div className="vitals-strip__divider" />
        <div className="vitals-strip__item">
          <span className="vitals-strip__label">Conversations</span>
          <span className="vitals-strip__value">{chatCount ?? 0}</span>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-3 gap-4">
        <QuickAction href="/upload" icon={UploadCloud} title="Upload a report" desc="PDF, DOCX, or TXT" />
        <QuickAction href="/chat" icon={MessageSquare} title="Ask a question" desc="Chat with your data" />
        <QuickAction href="/summary" icon={ClipboardList} title="Generate summary" desc="Patient-friendly recap" />
      </div>

      {/* Recent documents */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Recent documents</CardTitle>
          <Link href="/documents">
            <Button variant="ghost" size="sm" className="gap-1 text-sage-600 dark:text-sage-300">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {!hasDocuments ? (
            <EmptyState />
          ) : (
            <ul className="divide-y divide-border">
              {recentDocs?.map((doc) => (
                <li key={doc.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-8 w-8 rounded-md bg-sage-50 dark:bg-sage-600/15 flex items-center justify-center shrink-0">
                      <FileText className="h-4 w-4 text-sage-600 dark:text-sage-300" />
                    </div>
                    <span className="text-sm font-medium truncate">{doc.file_name}</span>
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
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <MedicalDisclaimer compact />
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  title,
  desc,
}: {
  href: string;
  icon: React.ElementType;
  title: string;
  desc: string;
}) {
  return (
    <Link href={href}>
      <Card className="hover:border-sage-300 dark:hover:border-sage-600 transition-colors h-full">
        <CardContent className="p-5 flex items-center gap-3">
          <div className="h-10 w-10 rounded-md bg-sage-50 dark:bg-sage-600/15 flex items-center justify-center shrink-0">
            <Icon className="h-5 w-5 text-sage-600 dark:text-sage-300" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium font-display">{title}</p>
            <p className="text-xs text-muted-foreground">{desc}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-8">
      <div className="mx-auto h-10 w-10 rounded-full bg-secondary flex items-center justify-center mb-3">
        <FileText className="h-4.5 w-4.5 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium mb-1">No reports yet</p>
      <p className="text-xs text-muted-foreground mb-4">
        Upload your first medical document to get started.
      </p>
      <Link href="/upload">
        <Button size="sm">Upload a report</Button>
      </Link>
    </div>
  );
}
