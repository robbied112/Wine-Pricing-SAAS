import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// You might have this check here already, or you can add it
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL or Anon Key might be missing or empty!");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)