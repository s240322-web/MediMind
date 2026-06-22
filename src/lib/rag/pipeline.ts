import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { generateEmbedding } from '@/lib/ai/embeddings';
import { geminiClient, CHAT_MODEL } from '@/lib/ai/gemini-client';

export interface RetrievedChunk {
  text: string;
  source: 'user_document' | 'global_knowledge';
  sourceLabel: string;
  similarity: number;
  documentId?: string;
}

export interface RagResponse {
  answer: string;
  sources: RetrievedChunk[];
}

const USER_MATCH_COUNT = 5;
const GLOBAL_MATCH_COUNT = 3;
const MATCH_THRESHOLD = 0.25;

/**
 * Retrieves relevant chunks from BOTH the requesting user's private
 * documents and the shared global medical knowledge base.
 *
 * SECURITY-CRITICAL: the user-document search is filtered server-side
 * by match_user_id inside the `match_user_document_chunks` SQL function
 * (see supabase/migrations/0001_init.sql), AND that table additionally
 * has Row Level Security enabled. This is defense in depth — even if
 * this function were called with a forged userId, RLS on the underlying
 * table means the database connection (scoped to the requester's JWT)
 * could still only ever see that user's own rows.
 */
export async function retrieveContext(
  supabase: SupabaseClient<Database>,
  userId: string,
  question: string
): Promise<RetrievedChunk[]> {
  const queryEmbedding = await generateEmbedding(question);

  const [userResults, globalResults] = await Promise.all([
    supabase.rpc('match_user_document_chunks', {
      query_embedding: queryEmbedding,
      match_user_id: userId,
      match_count: USER_MATCH_COUNT,
      match_threshold: MATCH_THRESHOLD,
    }),
    supabase.rpc('match_global_medical_chunks', {
      query_embedding: queryEmbedding,
      match_count: GLOBAL_MATCH_COUNT,
      match_threshold: MATCH_THRESHOLD,
    }),
  ]);

  if (userResults.error) {
    throw new Error(`User document search failed: ${userResults.error.message}`);
  }
  if (globalResults.error) {
    throw new Error(`Global knowledge search failed: ${globalResults.error.message}`);
  }

  type UserChunkRow = Database['public']['Functions']['match_user_document_chunks']['Returns'][number];
  type GlobalChunkRow = Database['public']['Functions']['match_global_medical_chunks']['Returns'][number];

  const userChunks: RetrievedChunk[] = (userResults.data ?? []).map((row: UserChunkRow) => ({
    text: row.chunk_text,
    source: 'user_document' as const,
    sourceLabel: 'Your uploaded document',
    similarity: row.similarity,
    documentId: row.document_id,
  }));

  const globalChunks: RetrievedChunk[] = (globalResults.data ?? []).map((row: GlobalChunkRow) => ({
    text: row.chunk_text,
    source: 'global_knowledge' as const,
    sourceLabel: row.title,
    similarity: row.similarity,
  }));

  // User's own data first — it's the most specific and relevant context.
  return [...userChunks, ...globalChunks];
}

function buildPrompt(question: string, chunks: RetrievedChunk[]): string {
  const userContext = chunks
    .filter((c) => c.source === 'user_document')
    .map((c, i) => `[Personal Report Excerpt ${i + 1}]\n${c.text}`)
    .join('\n\n');

  const globalContext = chunks
    .filter((c) => c.source === 'global_knowledge')
    .map((c, i) => `[Medical Reference ${i + 1}: ${c.sourceLabel}]\n${c.text}`)
    .join('\n\n');

  return `You are a careful, empathetic healthcare information assistant. Answer the user's question using ONLY the context provided below. If the context doesn't contain enough information to answer confidently, say so plainly rather than guessing.

Always:
- Explain medical terms in plain language
- Be precise about numbers and values when quoting the user's own reports
- Remind the user this is informational only when discussing anything that could affect a medical decision
- Never invent values, diagnoses, or results that are not present in the context

${userContext ? `=== USER'S PERSONAL MEDICAL DATA ===\n${userContext}\n` : ''}
${globalContext ? `=== GENERAL MEDICAL REFERENCE ===\n${globalContext}\n` : ''}

USER QUESTION: ${question}

Provide a clear, well-structured answer using Markdown formatting where helpful (e.g. bullet points for multiple values).`;
}

/**
 * Full RAG pipeline: retrieve user + global context, build a grounded
 * prompt, and generate a response with GPT.
 */
export async function answerHealthQuestion(
  supabase: SupabaseClient<Database>,
  userId: string,
  question: string
): Promise<RagResponse> {
  const chunks = await retrieveContext(supabase, userId, question);
  const prompt = buildPrompt(question, chunks);

  const completion = await geminiClient.models.generateContent({
    model: CHAT_MODEL,
    contents: prompt,
    config: {
      temperature: 0.3,
      maxOutputTokens: 900,
    },
  });

  const answer =
    completion.text ??
    "I wasn't able to generate a response. Please try rephrasing your question.";

  return { answer, sources: chunks };
}
