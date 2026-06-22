import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { geminiClient, CHAT_MODEL } from '@/lib/ai/gemini-client';

export const runtime = 'nodejs';
export const maxDuration = 45;

const SUMMARY_PROMPT = `You are a healthcare assistant generating a patient-friendly summary of medical reports.

Using ONLY the report excerpts below, produce a structured summary with these sections (use Markdown headings):

## Overview
A 2-3 sentence plain-language overview of what these reports cover.

## Key Values
A bullet list of the specific measured values found in the reports, each with the value, the normal reference range if mentioned, and a flag of whether it appears Normal or Abnormal. Format each line like:
- **[Test name]**: [value] — [Normal/Abnormal] (reference range if known)

## What This Means
Plain-language explanation of any abnormal or notable values, written for someone with no medical background.

## Suggested Next Steps
General, non-prescriptive suggestions (e.g. "consider discussing this with your doctor") — never recommend specific treatments or medications.

If a report excerpt doesn't contain clear numeric values, summarize its content qualitatively instead. Do not invent any values not present in the text.

REPORT EXCERPTS:
{context}`;

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const documentId: string | undefined = body?.documentId;

    // Pull this user's chunks only — filtered explicitly AND protected by RLS.
    let query = supabase
      .from('document_chunks')
      .select('chunk_text, document_id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(60);

    if (documentId) {
      query = query.eq('document_id', documentId);
    }

    const { data: chunks, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!chunks || chunks.length === 0) {
      return NextResponse.json(
        { error: 'No processed documents found. Upload a report first.' },
        { status: 404 }
      );
    }

    const context = chunks.map((c) => c.chunk_text).join('\n\n---\n\n');
    const prompt = SUMMARY_PROMPT.replace('{context}', context);

    const completion = await geminiClient.models.generateContent({
      model: CHAT_MODEL,
      contents: prompt,
      config: {
        temperature: 0.2,
        maxOutputTokens: 1200,
      },
    });

    const summary =
      completion.text ?? 'Unable to generate a summary at this time.';

    return NextResponse.json({ summary, documentCount: new Set(chunks.map((c) => c.document_id)).size });
  } catch (err) {
    console.error('Summary route error:', err);
    return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 });
  }
}
