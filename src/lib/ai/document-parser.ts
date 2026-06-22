import mammoth from 'mammoth';

/**
 * Extracts raw text from an uploaded medical document buffer based
 * on its file type. Each branch isolates a single parsing library so
 * a malformed file in one format can't take down the others.
 */
export async function extractTextFromFile(
  buffer: Buffer,
  fileType: 'pdf' | 'docx' | 'txt'
): Promise<string> {
  switch (fileType) {
    case 'pdf':
      return extractFromPdf(buffer);
    case 'docx':
      return extractFromDocx(buffer);
    case 'txt':
      return buffer.toString('utf-8');
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
}

async function extractFromPdf(buffer: Buffer): Promise<string> {
  // pdf-parse has a quirky default export pattern depending on bundler;
  // dynamic import keeps it out of the client bundle entirely.
  const pdfParse = (await import('pdf-parse')).default;
  const data = await pdfParse(buffer);
  return data.text;
}

async function extractFromDocx(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}
