'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud, FileText, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface UploadItem {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'processing' | 'done' | 'error';
  error?: string;
}

const ACCEPTED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

const ACCEPTED_EXTENSIONS = '.pdf,.docx,.txt';

export function UploadDropzone() {
  const router = useRouter();
  const [items, setItems] = useState<UploadItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (fileList: FileList | null) => {
    if (!fileList) return;
    const files = Array.from(fileList).filter((f) => ACCEPTED_TYPES.includes(f.type));

    if (files.length === 0) {
      toast.error('Please select a PDF, DOCX, or TXT file.');
      return;
    }

    for (const file of files) {
      const id = `${file.name}-${Date.now()}`;
      setItems((prev) => [...prev, { id, file, progress: 10, status: 'uploading' }]);

      try {
        const formData = new FormData();
        formData.append('file', file);

        setItems((prev) => prev.map((i) => (i.id === id ? { ...i, progress: 40 } : i)));

        const res = await fetch('/api/upload', { method: 'POST', body: formData });

        setItems((prev) => prev.map((i) => (i.id === id ? { ...i, progress: 80, status: 'processing' } : i)));

        const data = await res.json();

        if (!res.ok && res.status !== 207) {
          throw new Error(data.error || 'Upload failed');
        }

        setItems((prev) =>
          prev.map((i) =>
            i.id === id
              ? { ...i, progress: 100, status: res.status === 207 ? 'error' : 'done', error: data.error }
              : i
          )
        );

        if (res.status === 207) {
          toast.error(`${file.name}: processing failed`);
        } else {
          toast.success(`${file.name} processed and ready to query`);
        }
      } catch (err) {
        setItems((prev) =>
          prev.map((i) =>
            i.id === id
              ? { ...i, status: 'error', error: err instanceof Error ? err.message : 'Upload failed' }
              : i
          )
        );
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    router.refresh();
  }, [router]);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors',
          isDragging
            ? 'border-sage bg-sage-50 dark:bg-sage-600/10'
            : 'border-stone-dark dark:border-pine-400/40 hover:border-sage-300'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED_EXTENSIONS}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="mx-auto h-12 w-12 rounded-full bg-sage-50 dark:bg-sage-600/15 flex items-center justify-center mb-4">
          <UploadCloud className="h-5 w-5 text-sage-600 dark:text-sage-300" />
        </div>
        <p className="text-sm font-medium mb-1">Drag and drop a report, or click to browse</p>
        <p className="text-xs text-muted-foreground">PDF, DOCX, or TXT — up to 20MB</p>
      </div>

      {items.length > 0 && (
        <div className="space-y-2.5">
          {items.map((item) => (
            <div key={item.id} className="data-card p-3.5 flex items-center gap-3 fade-up">
              <div className="h-9 w-9 rounded-md bg-secondary flex items-center justify-center shrink-0">
                <FileText className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <p className="text-sm font-medium truncate">{item.file.name}</p>
                  <StatusBadge status={item.status} />
                </div>
                {item.status !== 'done' && item.status !== 'error' && (
                  <Progress value={item.progress} className="h-1" />
                )}
                {item.error && <p className="text-xs text-clay-500 mt-1">{item.error}</p>}
              </div>
              <button
                onClick={() => setItems((prev) => prev.filter((i) => i.id !== item.id))}
                className="text-muted-foreground hover:text-foreground shrink-0"
                aria-label="Remove from list"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: UploadItem['status'] }) {
  if (status === 'done') {
    return (
      <span className="badge-normal">
        <CheckCircle2 className="h-3 w-3" /> Ready
      </span>
    );
  }
  if (status === 'error') {
    return (
      <span className="badge-abnormal">
        <AlertCircle className="h-3 w-3" /> Failed
      </span>
    );
  }
  return (
    <span className="text-xs font-mono text-muted-foreground flex items-center gap-1">
      <Loader2 className="h-3 w-3 animate-spin" />
      {status === 'uploading' ? 'Uploading' : 'Processing'}
    </span>
  );
}
