import { supabaseAdmin } from '../../../lib/supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.split('Bearer ')[1];
    if (!token) return res.status(401).json({ error: 'Missing auth token' });

    // get user with service role (safe on server)
    const userResp = await supabaseAdmin.auth.getUser(token);
    if (!userResp || userResp.error) return res.status(401).json({ error: 'Invalid token' });
    const user = userResp.data.user;
    if (!user) return res.status(401).json({ error: 'Invalid user' });

    // fetch profile
    const { data: profile } = await supabaseAdmin.from('profiles').select('*').eq('id', user.id).single();
    if (!profile || !profile.verified || !profile.company_id) {
      return res.status(403).json({ error: 'Only verified company representatives can post' });
    }

    const { title, kind, payload } = req.body;
    if (!title || !kind) return res.status(400).json({ error: 'title and kind required' });

    // initial moderation: you may run an AI check here
    // For MVP we'll approve automatically for verified reps
    const { data, error } = await supabaseAdmin
      .from('letreiro_posts')
      .insert({
        author_profile: profile.id,
        company_id: profile.company_id,
        title,
        kind,
        payload: payload || {},
        approved: true
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error });
    return res.status(200).json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}
