import { geminiClient, EMBEDDING_MODEL } from './gemini-client';

/**
 * Generates a single embedding vector for a piece of text.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const cleaned = text.replace(/\n+/g, ' ').trim();

  const response = await geminiClient.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: cleaned,
    config: { outputDimensionality: 768 },
  });

  const values = response.embeddings?.[0]?.values;
  if (!values) throw new Error('Failed to generate embedding');

  return values;
}

/**
 * Generates embeddings for many chunks in a single batched API call.
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];

  const cleaned = texts.map((t) => t.replace(/\n+/g, ' ').trim());

  const BATCH_SIZE = 100;
  const results: number[][] = [];

  for (let i = 0; i < cleaned.length; i += BATCH_SIZE) {
    const batch = cleaned.slice(i, i + BATCH_SIZE);
    const response = await geminiClient.models.embedContent({
      model: EMBEDDING_MODEL,
      contents: batch,
      config: { outputDimensionality: 768 },
    });
    // Ensure we handle potentially undefined values safely
    results.push(...(response.embeddings || []).map((d) => d.values ?? []));
  }

  return results;
}
