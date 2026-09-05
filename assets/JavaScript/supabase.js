//===============================================
//              SUPABASE CONNECTION
//              TrendSphere Media
//===============================================

const SUPABASE_URL = "https://mbbcdvqnwwydawtwipas.supabase.co";

const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_hHvYkE9Pxvepj_DYrJtBwA_bp8HZ_de";

const supabaseClient = supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );

console.log(
    "TrendSphere Media: Supabase connected."
);