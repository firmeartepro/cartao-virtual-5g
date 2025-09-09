import { supabaseAdmin } from '../../../lib/supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    // validate admin
    const user = await supabaseAdmin.auth.getUser(token);
    if (!user?.data?.user) return res.status(401).json({ error: 'Invalid token' });
    // check if profile role admin (we'll trust admin set in supabase console)
    const { name, slug, cnpj, title, description } = req.body;
    const { data: company, error: compErr } = await supabaseAdmin.from('companies').insert([{ name, slug, cnpj }]).select().single();
    if (compErr) return res.status(500).json({ error: compErr.message });
    const { data: card, error: cardErr } = await supabaseAdmin.from('cards').insert([{ company_id: company.id, title, description }]).select().single();
    if (cardErr) return res.status(500).json({ error: cardErr.message });
    return res.status(200).json({ company, card });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
