// Fill these from Supabase Project Settings → API.
export const SUPABASE_URL = "https://nxubnurriaapwvzfrfvw.supabase.co";
export const SUPABASE_ANON_KEY = "sb_publishable_6fefX_93-FKfJbJRxBCR5g_rKfCcwlZ";

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
