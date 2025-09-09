import { supabaseAdmin } from '../../../lib/supabaseAdmin';

async function sendWhatsApp(phone, text) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneId) return { ok: false, reason: 'not configured' };
  const url = `https://graph.facebook.com/v16.0/${phoneId}/messages`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product:'whatsapp', to: phone, type:'text', text:{ body: text } })
  });
  const data = await res.json();
  return { ok: res.ok, data };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    // token optional: allow guest booking — but we still create appointment with provided phone
    let profile = null;
    if (token) {
      const u = await supabaseAdmin.auth.getUser(token);
      if (u?.data?.user) {
        const pr = await supabaseAdmin.from('profiles').select('*').eq('id', u.data.user.id).maybeSingle();
        if (pr?.data) profile = pr.data;
      }
    }

    const { serviceId, scheduledFor, customerName, customerPhone } = req.body;
    if (!serviceId || !scheduledFor) return res.status(400).json({ error: 'serviceId and scheduledFor required' });

    const { data: service } = await supabaseAdmin.from('services').select('*').eq('id', serviceId).single();
    if (!service) return res.status(400).json({ error: 'service not found' });

    const insert = {
      company_id: service.company_id,
      service_id: service.id,
      customer_profile: profile?.id || null,
      customer_name: customerName || profile?.full_name || 'Cliente',
      customer_phone: customerPhone || profile?.phone || null,
      scheduled_for: scheduledFor,
      duration_minutes: service.duration_minutes || 30,
      status: 'pending'
    };

    const { data: appt, error } = await supabaseAdmin.from('appointments').insert(insert).select().single();
    if (error) return res.status(500).json({ error: error.message });

    // notify company via whatsapp if configured
    const { data: company } = await supabaseAdmin.from('companies').select('*').eq('id', service.company_id).single();
    if (company?.whatsapp_enabled && company?.whatsapp_phone) {
      const text = `Novo agendamento: ${insert.customer_name}\nServiço: ${service.title}\nQuando: ${new Date(insert.scheduled_for).toLocaleString()}\nTelefone: ${insert.customer_phone || 'não informado'}`;
      const wa = await sendWhatsApp(company.whatsapp_phone, text);
      if (wa.ok) await supabaseAdmin.from('appointments').update({ notified: true }).eq('id', appt.id);
    }

    return res.status(200).json(appt);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
