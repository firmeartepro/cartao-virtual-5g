# SETUP RÁPIDO (resumo)

1. Supabase
   - New project → pegar URL e anon key e SERVICE_ROLE key (service role).
   - SQL Editor → colar `sql/supabase_init.sql` e executar.
   - Storage → criar bucket `logos` (public).

2. GitHub
   - Conferir arquivos (já adicionados).

3. Vercel
   - Import Project → este repo.
   - Set environment variables (veja `.env.example`).
   - Deploy.

4. Stripe / Mercado Pago
   - Criar produtos e preços (Básico, Plus, VIP).
   - Copiar keys para Vercel.

5. Testes
   - Criar usuário no Supabase Auth → marcar profile como `verified = true` e `role = 'admin'` no console para o primeiro admin.
   - Usar /admin para criar companies/cards (ou inserir direto no Supabase).
