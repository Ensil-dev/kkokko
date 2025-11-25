export const CONFIG = {
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  HUGGINGFACE_API_KEY: import.meta.env.VITE_HUGGINGFACE_API_KEY || '',
  ADMIN_EMAIL: import.meta.env.VITE_ADMIN_EMAIL || '',
} as const
