import { createClient } from '@/lib/supabase/server';
import { SummaryGenerator } from '@/components/dashboard/summary-generator';
import { MedicalDisclaimer } from '@/components/shared/medical-disclaimer';

export default async function SummaryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { count } = await supabase
    .from('documents')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user!.id)
    .eq('status', 'ready');

  return (
    <div className="px-4 md:px-6 py-6 space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Health summary</h1>
        <p className="text-sm text-muted-foreground mt-1">
          A patient-friendly recap of your uploaded reports, with abnormal values highlighted.
        </p>
      </div>

      <SummaryGenerator hasDocuments={(count ?? 0) > 0} />
      <MedicalDisclaimer />
    </div>
  );
}
