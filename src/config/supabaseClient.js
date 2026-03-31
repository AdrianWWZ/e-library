import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// This single client handles auth, database, and storage!
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
