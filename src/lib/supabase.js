import { createClient } from '@supabase/supabase-js'

var supabaseUrl = import.meta.env.VITE_SUPABASE_URL
var supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export var supabase = createClient(supabaseUrl, supabaseKey)
