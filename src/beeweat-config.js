// ============================================================================
// BEEWEAT — CONFIGURAZIONE (le vostre chiavi, UNA volta sola)
// ----------------------------------------------------------------------------
// Questo file va compilato UNA volta e poi NON si tocca più:
// gli aggiornamenti di beeweat.jsx e beeweat-supabase.js non lo riguardano.
//
// Dove trovare le chiavi:
//  - SUPABASE_URL e SUPABASE_ANON_KEY: Supabase → Project Settings → API
//    (usa la chiave "publishable"/anon, MAI la service_role)
//  - VAPID_PUBLIC_KEY: generata con `npx web-push generate-vapid-keys`
//    (la PRIVATE va SOLO nei Secrets delle Edge Functions, mai qui)
// ============================================================================

export const SUPABASE_URL = "https://bdgypqgtzrqoqbkqgnnj.supabase.co";
export const SUPABASE_ANON_KEY = "sb_publishable_HtXEzXb12JA-6GjY-EwQtw_VxmncYdC";
export const VAPID_PUBLIC_KEY = "BBTQRvIBEAxom-19cD8u6ZpF0cOIaz8rqJsOpp72kiIH9jxS9UqU6vqhjn3VZDYEhllT0YrCjSTOEkWDtFoYinw";
