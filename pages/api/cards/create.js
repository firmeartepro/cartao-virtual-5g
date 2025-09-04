import { supabaseAdmin } from '../../../lib/supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.split('Bearer ')[1];
    if (!token) return res.status(401).json({ error: 'Missing auth token' });

    const userResp = await supabaseAdmin.auth.getUser(token);
    if (!userResp || userResp.error) return res.status(401).json({ error: 'Invalid token' });
    const user = userResp.data.user;
    if (!user) return res.status(401).json({ error: 'Invalid user' });

    // check admin
    const { data: profile } = await supabaseAdmin.from('profiles').select('*').eq('id', user.id).single();
    if (!profile || profile.role !== 'admin') return res.status(403).json({ error: 'Only admin allowed' });

    const { name, slug, cnpj, title, description, modules } = req.body;
    // create company
    const { data: company, error: compErr } = await supabaseAdmin
      .from('companies')
      .insert({ name, slug, cnpj, owner_profile: profile.id })
      .select()
      .single();
    if (compErr) return res.status(500).json({ error: compErr });

    const { data: card, error: cardErr } = await supabaseAdmin
      .from('cards')
      .insert({ company_id: company.id, title, description, modules: modules || {} })
      .select()
      .single();
    if (cardErr) return res.status(500).json({ error: cardErr });

    return res.status(200).json({ company, card });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}
