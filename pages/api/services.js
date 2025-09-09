import { supabaseAdmin } from '../../lib/supabaseAdmin'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { company_id } = req.query
    const { data, error } = await supabaseAdmin
      .from('services')
      .select('*')
      .eq('company_id', company_id)

    if (error) return res.status(400).json({ error })
    return res.status(200).json(data)
  }

  if (req.method === 'POST') {
    const { company_id, title, duration_minutes, price } = req.body
    const { data, error } = await supabaseAdmin
      .from('services')
      .insert([{ company_id, title, duration_minutes, price }])
      .select()

    if (error) return res.status(400).json({ error })
    return res.status(200).json(data[0])
  }

  res.status(405).json({ error: 'Method not allowed' })
}
