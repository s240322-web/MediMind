# MediMind AI — Personalized Healthcare Report Assistant

A full-stack AI healthcare assistant where users upload their own medical
documents (PDF, DOCX, TXT) and chat with an AI that answers using **both**
their private reports and a shared general medical knowledge base — with
strict per-user data isolation enforced at the database layer.

Built with Next.js 15, TypeScript, Tailwind CSS, Supabase (Postgres + pgvector
+ Auth + Storage), and OpenAI.

---

## 1. Folder structure

```
medimind/
├── src/
│   ├── app/
│   │   ├── page.tsx                     # Landing page
│   │   ├── layout.tsx                   # Root layout (fonts, theme, toaster)
│   │   ├── globals.css                  # Design tokens + signature components
│   │   ├── (auth)/
│   │   │   ├── layout.tsx
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx               # Sidebar + header + mobile nav shell
│   │   │   ├── dashboard/page.tsx       # Overview / stats
│   │   │   ├── chat/page.tsx            # RAG chat interface
│   │   │   ├── upload/page.tsx          # File upload
│   │   │   ├── documents/page.tsx       # Document management
│   │   │   ├── summary/page.tsx         # Health summary generator
│   │   │   └── profile/page.tsx         # Account settings
│   │   └── api/
│   │       ├── auth/callback/route.ts   # OAuth code exchange
│   │       ├── upload/route.ts          # Upload + ingest pipeline
│   │       ├── documents/route.ts       # List / delete documents
│   │       ├── chat/route.ts            # RAG question answering
│   │       └── summary/route.ts         # Health summary generation
│   ├── components/
│   │   ├── ui/                          # Shadcn-style primitives
│   │   ├── dashboard/                   # Sidebar, header, theme toggle, etc.
│   │   ├── chat/                        # Chat bubbles, typing indicator
│   │   ├── upload/                      # Dropzone, documents list
│   │   └── shared/                      # Disclaimer, theme provider, Google auth
│   ├── lib/
│   │   ├── supabase/                    # client.ts / server.ts / admin.ts
│   │   ├── ai/                          # OpenAI client, embeddings, parsing, chunking
│   │   ├── rag/                         # pipeline.ts (retrieval+generation), ingest.ts
│   │   └── utils/
│   ├── types/database.ts                # Generated-style DB types
│   └── middleware.ts                    # Session refresh + route protection
├── scripts/
│   ├── global-dataset-content.ts        # Admin-curated knowledge base content
│   └── seed-global-dataset.ts           # Seeds + embeds the global dataset
├── supabase/
│   └── migrations/0001_init.sql         # Schema, RLS policies, RPC functions
├── .env.example
└── package.json
```

---

## 2. Database schema

See `supabase/migrations/0001_init.sql` for the full SQL. Summary:

| Table | Purpose |
|---|---|
| `users` | Profile mirror of `auth.users`, auto-populated via trigger on signup |
| `documents` | Metadata for each uploaded file (name, URL, type, status) |
| `document_chunks` | Chunked + embedded text from a user's documents (`vector(1536)`) |
| `global_medical_dataset` | Admin-seeded, shared medical reference knowledge |
| `chat_history` | Saved Q&A pairs per user |

Two Postgres RPC functions wrap the pgvector cosine-similarity search:
- `match_user_document_chunks(query_embedding, match_user_id, ...)` — filtered by user
- `match_global_medical_chunks(query_embedding, ...)` — open to all authenticated users

---

## 3. Multi-tenant data isolation (how it works)

This is enforced with **defense in depth**, not just application logic:

1. **Row Level Security (RLS)** is enabled on every user-owned table. Policies
   restrict all `select`/`insert`/`update`/`delete` to rows where
   `auth.uid() = user_id`. This holds even if application code has a bug.
2. The vector-search RPC functions take `match_user_id` as an explicit
   parameter, sourced from the **verified server-side session**, never from
   client input — so a request can't impersonate another user's ID.
3. **Supabase Storage** policies scope file access to a `{user_id}/...` path
   prefix, so uploaded files are isolated the same way.
4. The `global_medical_dataset` table is the one exception by design — it's
   readable by any authenticated user, but **only writable by the service
   role** (used solely by the seed script), never by the client.

---

## 4. Setup

### Prerequisites
- Node.js 18.18+
- A [Supabase](https://supabase.com) project
- An [OpenAI](https://platform.openai.com) API key

### Steps

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Fill in `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY` (Project Settings → API), and `OPENAI_API_KEY`.

3. **Run the database migration**
   In the Supabase Dashboard → SQL Editor, paste and run the contents of
   `supabase/migrations/0001_init.sql`. This creates all tables, indexes,
   RLS policies, RPC functions, and the private `medical-documents` storage
   bucket.

4. **Enable Google OAuth (optional)**
   In Supabase Dashboard → Authentication → Providers → Google, add your
   Google OAuth Client ID/Secret. Set the authorized redirect URI to:
   ```
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```

5. **Seed the global medical knowledge base**
   ```bash
   npm run seed:global
   ```
   This embeds and inserts the admin-curated content in
   `scripts/global-dataset-content.ts` (cholesterol, diabetes, blood pressure,
   vitamin deficiencies, medications, general FAQs).

6. **Run the dev server**
   ```bash
   npm run dev
   ```
   Visit `http://localhost:3000`.

---

## 5. RAG pipeline (how a question gets answered)

1. User submits a question via `/chat` → `POST /api/chat`.
2. The question is embedded with `text-embedding-3-small`.
3. Two vector searches run in parallel:
   - The user's own `document_chunks` (filtered by `user_id`)
   - The shared `global_medical_dataset`
4. Both result sets are merged into a single grounded prompt, clearly
   labeling which excerpts are "your personal data" vs. "general reference."
5. `gpt-4.1-mini` generates an answer using only that context.
6. The Q&A pair is saved to `chat_history`, and the response includes
   source badges so the user can see what grounded the answer.

The same retrieval pattern (minus generation) powers **Generate Health
Summary**, which pulls all of a user's chunks and produces a structured,
patient-friendly recap with abnormal values flagged.

---

## 6. Deployment (Vercel)

1. Push this repository to GitHub.
2. Import the repo into [Vercel](https://vercel.com/new).
3. Add the same environment variables from `.env.local` in
   Vercel → Project → Settings → Environment Variables. Set
   `NEXT_PUBLIC_SITE_URL` to your production domain.
4. Update the Supabase Auth redirect URLs (Authentication → URL
   Configuration) to include your Vercel domain, e.g.
   `https://your-app.vercel.app/api/auth/callback`.
5. Deploy. The seed script (`npm run seed:global`) only needs to be run once,
   from your local machine against the production Supabase project — it
   doesn't need to run on every deploy.

**Note on upload processing:** the upload route currently processes
documents synchronously (parse → chunk → embed → store) within the API
request for simplicity, which is fine for typical report sizes within
Vercel's function timeout. For very large documents or higher traffic,
move `ingestDocument()` to a background job (e.g., a Supabase Edge Function
triggered by a queue) and have `/api/upload` return immediately with
`status: "processing"`.

---

## 7. Tech stack reference

| Layer | Choice |
|---|---|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS |
| UI primitives | Custom Shadcn-style components (Radix UI under the hood) |
| Auth | Supabase Auth (email/password + Google OAuth) |
| Database | PostgreSQL via Supabase, with `pgvector` |
| File storage | Supabase Storage (private bucket, per-user folder policies) |
| Embeddings | OpenAI `text-embedding-3-small` (1536 dimensions) |
| Chat model | OpenAI `gpt-4.1-mini` |
| Chunking | `@langchain/textsplitters` `RecursiveCharacterTextSplitter` (1000 chars, 200 overlap) |
| Document parsing | `pdf-parse` (PDF), `mammoth` (DOCX) |

---

## 8. Safety

Every page displays: *"This application provides informational assistance
only and does not replace professional medical advice, diagnosis, or
treatment."* The RAG prompt is explicitly instructed to answer only from
retrieved context and to say so plainly when it doesn't have enough
information, rather than guessing.
