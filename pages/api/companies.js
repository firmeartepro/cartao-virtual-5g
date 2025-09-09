import { supabaseAdmin } from '../../lib/supabaseAdmin'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin.from('companies').select('*')
    if (error) return res.status(400).json({ error })
    return res.status(200).json(data)
  }

  if (req.method === 'POST') {
    const { name, cnpj, slug } = req.body
    const { data, error } = await supabaseAdmin
      .from('companies')
      .insert([{ name, cnpj, slug }])
      .select()

    if (error) return res.status(400).json({ error })
    return res.status(200).json(data[0])
  }

  res.status(405).json({ error: 'Method not allowed' })
}
