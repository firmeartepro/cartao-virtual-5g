import { supabaseAdmin } from '../../../lib/supabaseAdmin';

export default async function handler(req, res) {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return res.status(401).json({ error: 'Missing token' });
  const userResp = await supabaseAdmin.auth.getUser(token);
  if (!userResp?.data?.user) return res.status(401).json({ error: 'Invalid token' });
  const uid = userResp.data.user.id;
  // try company profile
  const { data: profile } = await supabaseAdmin.from('profiles').select('*').eq('id', uid).maybeSingle();
  if (profile?.company_id) {
    const { data, error } = await supabaseAdmin.from('appointments').select('*, services(title)').eq('company_id', profile.company_id).order('scheduled_for', { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ appointments: data });
  }
  // else return appointments for the customer
  const { data, error } = await supabaseAdmin.from('appointments').select('*, services(title)').eq('customer_profile', uid).order('scheduled_for', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ appointments: data });
}
