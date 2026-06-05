import { createClient } from '@supabase/supabase-js'

export const supabaseVideoke = createClient(
  process.env.NEXT_PUBLIC_VIDEOKE_SUPABASE_URL,
  process.env.NEXT_PUBLIC_VIDEOKE_SUPABASE_PUBLISHABLE_KEY
)