# Setup rápido

1. Supabase
   - Run SQL tables & triggers (já fez).
   - Create bucket `logos` (public read).
2. GitHub
   - Cole todos os arquivos deste repo.
3. Vercel
   - Connect repo.
   - Add environment variables:
     - NEXT_PUBLIC_SUPABASE_URL
     - NEXT_PUBLIC_SUPABASE_ANON_KEY
     - SUPABASE_SERVICE_ROLE_KEY
     - NEXT_PUBLIC_APP_URL
     - (WHATSAPP_TOKEN & WHATSAPP_PHONE_NUMBER_ID se for usar)
4. Deploy
   - Deploy via Vercel → ver logs.
5. Testes
   - Create user in Supabase Auth.
   - Make user admin via Supabase console (role = 'admin') to use /admin.
   - Create company via /admin and then test /company pages.
