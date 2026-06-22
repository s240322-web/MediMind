export type FileType = 'pdf' | 'docx' | 'txt';
export type DocumentStatus = 'processing' | 'ready' | 'failed';

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          email?: string;
          name?: string | null;
          avatar_url?: string | null;
        };
      };
      documents: {
        Row: {
          id: string;
          user_id: string;
          file_name: string;
          file_url: string;
          file_type: FileType;
          file_size_bytes: number | null;
          status: DocumentStatus;
          uploaded_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          file_name: string;
          file_url: string;
          file_type: FileType;
          file_size_bytes?: number | null;
          status?: DocumentStatus;
          uploaded_at?: string;
        };
        Update: {
          status?: DocumentStatus;
        };
      };
      document_chunks: {
        Row: {
          id: string;
          user_id: string;
          document_id: string;
          chunk_text: string;
          chunk_index: number;
          embedding: number[] | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          document_id: string;
          chunk_text: string;
          chunk_index?: number;
          embedding?: number[] | null;
          created_at?: string;
        };
        Update: Record<string, never>;
      };
      global_medical_dataset: {
        Row: {
          id: string;
          title: string;
          category: string | null;
          chunk_text: string;
          embedding: number[] | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          category?: string | null;
          chunk_text: string;
          embedding?: number[] | null;
          created_at?: string;
        };
        Update: Record<string, never>;
      };
      chat_history: {
        Row: {
          id: string;
          user_id: string;
          question: string;
          answer: string;
          source_document_ids: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          question: string;
          answer: string;
          source_document_ids?: string[];
          created_at?: string;
        };
        Update: Record<string, never>;
      };
    };
    Functions: {
      match_user_document_chunks: {
        Args: {
          query_embedding: number[];
          match_user_id: string;
          match_count?: number;
          match_threshold?: number;
        };
        Returns: {
          id: string;
          document_id: string;
          chunk_text: string;
          similarity: number;
        }[];
      };
      match_global_medical_chunks: {
        Args: {
          query_embedding: number[];
          match_count?: number;
          match_threshold?: number;
        };
        Returns: {
          id: string;
          title: string;
          category: string | null;
          chunk_text: string;
          similarity: number;
        }[];
      };
    };
  };
}

export type DocumentRow = Database['public']['Tables']['documents']['Row'];
export type ChatHistoryRow = Database['public']['Tables']['chat_history']['Row'];
export type UserRow = Database['public']['Tables']['users']['Row'];
