declare module "@supabase/supabase-js" {
  type SupabaseUser = {
    id: string;
    email?: string;
    user_metadata?: Record<string, unknown>;
  };

  type QueryRowsResult = {
    data: Record<string, unknown>[] | null;
    error: { message: string } | null;
  };

  type QueryBuilder = PromiseLike<QueryRowsResult> & {
    eq: (column: string, value: unknown) => QueryBuilder;
    order: (
      column: string,
      options?: { ascending?: boolean }
    ) => QueryBuilder;
    limit: (count: number) => QueryBuilder;
    single: () => Promise<{
      data: Record<string, unknown> | null;
      error: { message: string } | null;
    }>;
    maybeSingle: () => Promise<{
      data: Record<string, unknown> | null;
      error: { message: string } | null;
    }>;
  };

  export function createClient(
    supabaseUrl: string,
    supabaseKey: string
  ): {
    auth: {
      getSession: () => Promise<{
        data: { session: { user: SupabaseUser } | null };
        error: { message: string } | null;
      }>;
      getUser: () => Promise<{
        data: { user: SupabaseUser | null };
        error: { message: string } | null;
      }>;
      signUp: (credentials: {
        email: string;
        password: string;
        options?: {
          data?: Record<string, unknown>;
        };
      }) => Promise<{
        data: { user: SupabaseUser | null };
        error: { message: string } | null;
      }>;
      signInWithPassword: (credentials: {
        email: string;
        password: string;
      }) => Promise<{
        data: { user: SupabaseUser | null };
        error: { message: string } | null;
      }>;
      signOut: () => Promise<{
        error: { message: string } | null;
      }>;
    };
    from: (table: string) => {
      insert: (values: Record<string, unknown>) => Promise<{
        data: unknown;
        error: { message: string } | null;
      }>;
      select: (columns?: string) => QueryBuilder;
      update: (values: Record<string, unknown>) => {
        eq: (column: string, value: unknown) => Promise<{
          data: unknown;
          error: { message: string } | null;
        }>;
      };
      upsert: (
        values: Record<string, unknown>,
        options?: { onConflict?: string; ignoreDuplicates?: boolean }
      ) => Promise<{
        data: unknown;
        error: { message: string } | null;
      }>;
    };
  };
}
