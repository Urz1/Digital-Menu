import { createBrowserClient } from '@supabase/ssr';

// Node 20 SSR polyfill: Ensure global WebSocket exists for realtime-js constructor
if (typeof window === 'undefined' && typeof globalThis.WebSocket === 'undefined') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    globalThis.WebSocket = require('ws');
  } catch {
    // Handled in environments where ws is not required or already present
  }
}

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co';
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    'demo-anon-key';

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
