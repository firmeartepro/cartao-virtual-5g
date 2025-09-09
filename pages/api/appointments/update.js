import { supabaseAdmin } from '../../../lib/supabaseAdmin';

async function sendWhatsApp(phone, text) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneId) return { ok: false, reason:'not configured' };
  const url = `https://graph.facebook.com/v16.0/${phoneId}/messages`;
  const res = await fetch(url, {
    method:'POST',
    headers:{ Authorization:`Bearer ${token}`, 'Content-Type':'application/json' },
    body: JSON.stringify({ messaging_product:'whatsapp', to: phone, type:'text', text:{ body: text }})
  });
  const data = await res.json();
  return { ok: res.ok, data };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error:'Method not allowed' });
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) return res.status(401).json({ error:'Missing token' });
    const userResp = await supabaseAdmin.auth.getUser(token);
    if (!userResp?.data?.user) return res.status(401).json({ error:'Invalid token' });
    const uid = userResp.data.user.id;
    const { appointmentId, status } = req.body;
    const { data: appt } = await supabaseAdmin.from('appointments').select('*').eq('id', appointmentId).single();
    if (!appt) return res.status(404).json({ error:'Appointment not found' });
    // verify requester is company owner
    const { data: profile } = await supabaseAdmin.from('profiles').select('*').eq('id', uid).maybeSingle();
    if (!profile?.company_id || profile.company_id !== appt.company_id) return res.status(403).json({ error:'Not allowed' });
    const { data, error } = await supabaseAdmin.from('appointments').update({ status }).eq('id', appointmentId).select().single();
    if (error) return res.status(500).json({ error: error.message });
    if (data.customer_phone) {
      const text = `Seu agendamento (${data.id}) foi atualizado: ${status.toUpperCase()}\nQuando: ${new Date(data.scheduled_for).toLocaleString()}`;
      await sendWhatsApp(data.customer_phone, text);
    }
    return res.status(200).json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
