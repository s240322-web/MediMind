import { ShieldAlert } from 'lucide-react';

export function MedicalDisclaimer({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
        <ShieldAlert className="h-3 w-3 shrink-0" />
        Informational only — not a substitute for professional medical advice.
      </p>
    );
  }

  return (
    <div className="flex items-start gap-2.5 rounded-md border border-clay-200 bg-clay-50 px-4 py-2.5 text-clay-600 dark:border-clay-600/30 dark:bg-clay-600/10 dark:text-clay-200">
      <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
      <p className="text-xs leading-relaxed">
        This application provides informational assistance only and does not replace
        professional medical advice, diagnosis, or treatment.
      </p>
    </div>
  );
}
