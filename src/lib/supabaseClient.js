import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const configurationError = {
  message: "Configuration Supabase absente. Renseignez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans le fichier .env.",
};

function unavailableQuery() {
  const query = {
    select: () => query,
    insert: () => query,
    update: () => query,
    delete: () => query,
    upsert: () => query,
    eq: () => query,
    neq: () => query,
    in: () => query,
    order: () => query,
    limit: () => query,
    maybeSingle: () => Promise.resolve({ data: null, error: configurationError }),
    single: () => Promise.resolve({ data: null, error: configurationError }),
    then: (resolve, reject) => Promise.resolve({ data: null, error: configurationError }).then(resolve, reject),
  };
  return query;
}

function createUnavailableClient() {
  // This fallback keeps the application renderable and lets the UI display
  // a recoverable configuration error instead of producing a white screen.
  const auth = {
    getSession: async () => ({ data: { session: null }, error: configurationError }),
    getUser: async () => ({ data: { user: null }, error: configurationError }),
    signInWithPassword: async () => ({ data: { session: null }, error: configurationError }),
    signOut: async () => ({ error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  };
  return {
    auth,
    from: () => unavailableQuery(),
    rpc: async () => ({ data: null, error: configurationError }),
  };
}

if (!url || !anonKey) {
  // eslint-disable-next-line no-console
  console.error("Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Copy .env.example to .env and fill them in.");
}

// Only the anon (public) key is ever used in this frontend.
// The service_role key must NEVER appear in client code.
export const supabase = url && anonKey ? createClient(url, anonKey) : createUnavailableClient();
