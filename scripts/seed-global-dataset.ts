/**
 * Seeds the global_medical_dataset table with admin-curated healthcare
 * knowledge, generating embeddings for each chunk along the way.
 *
 * Run with: npm run seed:global
 * Requires SUPABASE_SERVICE_ROLE_KEY and GEMINI_API_KEY in .env.local
 */
import 'dotenv/config';
import { createAdminClient } from '../src/lib/supabase/admin';
import { chunkText } from '../src/lib/ai/chunking';
import { generateEmbeddings } from '../src/lib/ai/embeddings';
import { globalMedicalSeedData } from './global-dataset-content';

async function seedGlobalDataset() {
  console.log('Starting global medical dataset seed...\n');

  const supabase = createAdminClient();

  // Clear existing seed data so this script is safely re-runnable.
  const { error: deleteError } = await supabase
    .from('global_medical_dataset')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (deleteError) {
    console.error('Failed to clear existing dataset:', deleteError.message);
    process.exit(1);
  }

  let totalChunks = 0;

  for (const entry of globalMedicalSeedData) {
    console.log(`Processing: ${entry.title}`);

    const chunks = await chunkText(entry.content);
    const embeddings = await generateEmbeddings(chunks);

    const rows = chunks.map((chunk_text, i) => ({
      title: entry.title,
      category: entry.category,
      chunk_text,
      embedding: embeddings[i],
    }));

    const { error } = await supabase.from('global_medical_dataset').insert(rows);

    if (error) {
      console.error(`  ✗ Failed to insert chunks for "${entry.title}":`, error.message);
      continue;
    }

    console.log(`  ✓ Inserted ${rows.length} chunks`);
    totalChunks += rows.length;
  }

  console.log(`\nDone. Seeded ${totalChunks} chunks across ${globalMedicalSeedData.length} topics.`);
}

seedGlobalDataset().catch((err) => {
  console.error('Seed script failed:', err);
  process.exit(1);
});
