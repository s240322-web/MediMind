import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;

/**
 * Splits extracted document text into overlapping chunks suitable
 * for embedding. Overlap preserves context across chunk boundaries
 * so a sentence split mid-thought doesn't lose meaning.
 */
export async function chunkText(text: string): Promise<string[]> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
    separators: ['\n\n', '\n', '. ', ' ', ''],
  });

  const docs = await splitter.createDocuments([text]);
  return docs
    .map((d) => d.pageContent.trim())
    .filter((chunk) => chunk.length > 0);
}
