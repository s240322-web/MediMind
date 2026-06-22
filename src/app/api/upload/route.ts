import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@/lib/supabase/server';
import { ingestDocument } from '@/lib/rag/ingest';

export const runtime = 'nodejs';
export const maxDuration = 60;

const ALLOWED_TYPES: Record<string, 'pdf' | 'docx' | 'txt'> = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'text/plain': 'txt',
};

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const fileType = ALLOWED_TYPES[file.type];
    if (!fileType) {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload a PDF, DOCX, or TXT file.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 20MB.' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Storage path is scoped under the user's own folder — this is
    // what the storage RLS policies key off of (see migration 0001).
    const storagePath = `${user.id}/${uuidv4()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from('medical-documents')
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('medical-documents').getPublicUrl(storagePath);

    const { data: documentRow, error: dbError } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        file_name: file.name,
        file_url: publicUrl,
        file_type: fileType,
        file_size_bytes: file.size,
        status: 'processing',
      })
      .select()
      .single();

    if (dbError || !documentRow) {
      // Clean up the orphaned storage object if the DB insert failed
      await supabase.storage.from('medical-documents').remove([storagePath]);
      return NextResponse.json(
        { error: `Failed to save document record: ${dbError?.message}` },
        { status: 500 }
      );
    }

    // Process synchronously for simplicity/reliability in a college-project
    // deployment context. For production scale, move this to a background
    // job queue (e.g. Supabase Edge Function or a queue worker) and return
    // immediately with status: "processing".
    try {
      const { chunkCount } = await ingestDocument({
        supabase,
        userId: user.id,
        documentId: documentRow.id,
        fileBuffer: buffer,
        fileType,
      });

      return NextResponse.json({
        success: true,
        document: { ...documentRow, status: 'ready' },
        chunkCount,
      });
    } catch (ingestError) {
      return NextResponse.json(
        {
          error: `Document uploaded but processing failed: ${
            ingestError instanceof Error ? ingestError.message : 'Unknown error'
          }`,
          document: { ...documentRow, status: 'failed' },
        },
        { status: 207 }
      );
    }
  } catch (err) {
    console.error('Upload route error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
