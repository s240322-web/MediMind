import { UploadDropzone } from '@/components/upload/upload-dropzone';
import { MedicalDisclaimer } from '@/components/shared/medical-disclaimer';

export default function UploadPage() {
  return (
    <div className="px-4 md:px-6 py-6 space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Upload a report</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your file is processed and indexed under your account only — never shared with other users.
        </p>
      </div>

      <UploadDropzone />
      <MedicalDisclaimer compact />
    </div>
  );
}
