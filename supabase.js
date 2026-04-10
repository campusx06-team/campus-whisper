import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = "https://agturuuuvmobphjmxwra.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFndHVydXV1dm1vYnBoam14d3JhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NDg3NDIsImV4cCI6MjA5MTMyNDc0Mn0.9BMdIahpprGf4EqOpydyJpihEvIBpUEhJV4uizAo0bc"

export const supabase = createClient(supabaseUrl, supabaseKey)