import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zkvjtnsxitlzmumyuyzn.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inprdmp0bnN4aXRsem11bXl1eXpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExNzkzNDEsImV4cCI6MjA5Njc1NTM0MX0.3hPgm_QGYJXZB3mDJEn8QvARss1kiZMhM2mAEjDTHAA'
  )
}
