import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { extractTextFromFile } from '@/lib/ai/document-parser';
import { chunkText } from '@/lib/ai/chunking';
import { generateEmbeddings } from '@/lib/ai/embeddings';

interface IngestParams {
  supabase: SupabaseClient<Database>;
  userId: string;
  documentId: string;
  fileBuffer: Buffer;
  fileType: 'pdf' | 'docx' | 'txt';
}

/**
 * Processes an uploaded document end-to-end: extract text, split into
 * overlapping chunks, embed each chunk, and persist to document_chunks.
 *
 * Every inserted row is stamped with the owning user_id, which is what
 * Row Level Security and the RAG retrieval RPC key off of — this is
 * what guarantees User A's report never surfaces in User B's chat.
 */
export async function ingestDocument({
  supabase,
  userId,
  documentId,
  fileBuffer,
  fileType,
}: IngestParams): Promise<{ chunkCount: number }> {
  try {
    const rawText = await extractTextFromFile(fileBuffer, fileType);

    if (!rawText || rawText.trim().length === 0) {
      throw new Error('No extractable text found in document');
    }

    const chunks = await chunkText(rawText);

    if (chunks.length === 0) {
      throw new Error('Document produced no usable chunks');
    }

    const embeddings = await generateEmbeddings(chunks);

    const rows = chunks.map((chunk_text, index) => ({
      user_id: userId,
      document_id: documentId,
      chunk_text,
      chunk_index: index,
      embedding: embeddings[index],
    }));

    // Insert in batches to avoid oversized payloads on large reports.
    const INSERT_BATCH = 50;
    for (let i = 0; i < rows.length; i += INSERT_BATCH) {
      const batch = rows.slice(i, i + INSERT_BATCH);
      const { error } = await supabase.from('document_chunks').insert(batch);
      if (error) throw new Error(`Failed to store chunks: ${error.message}`);
    }

    await supabase
      .from('documents')
      .update({ status: 'ready' })
      .eq('id', documentId)
      .eq('user_id', userId);

    return { chunkCount: rows.length };
  } catch (err) {
    await supabase
      .from('documents')
      .update({ status: 'failed' })
      .eq('id', documentId)
      .eq('user_id', userId);
    throw err;
  }
}
