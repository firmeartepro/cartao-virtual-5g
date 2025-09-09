import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Layout from '../../components/Layout';

export default function CompanyDashboard(){
  const [profile, setProfile] = useState(null);
  const [card, setCard] = useState(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    (async()=>{
      const s = await supabase.auth.getSession();
      const session = s.data?.session;
      if (!session) return;
      const { data: p } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      setProfile(p);
      if (p?.company_id) {
        const { data: c } = await supabase.from('cards').select('*').eq('company_id', p.company_id).single();
        setCard(c);
      }
    })();
  }, []);

  async function save() {
    setMsg('Salvando...');
    const { error } = await supabase.from('cards').update({ title: card.title, description: card.description }).eq('id', card.id);
    if (error) setMsg('Erro: ' + error.message); else setMsg('Salvo.');
  }

  async function uploadLogo(e) {
    const file = e.target.files[0];
    if (!file) return;
    setMsg('Enviando logo...');
    const s = await supabase.auth.getSession();
    const session = s.data?.session;
    const { data: p } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
    const companyId = p.company_id;
    const path = `${companyId}/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from('logos').upload(path, file);
    if (error) return setMsg('Erro upload: ' + error.message);
    const { data } = await supabase.storage.from('logos').getPublicUrl(path);
    await supabase.from('cards').update({ logo_path: data.publicUrl }).eq('company_id', companyId);
    setMsg('Logo enviado.');
    const { data: c } = await supabase.from('cards').select('*').eq('company_id', companyId).single();
    setCard(c);
  }

  if (!profile) return <Layout><p>Faça login (use /auth/login)</p></Layout>;

  return (
    <Layout>
      <h2>Painel da Empresa</h2>
      {card && (
        <div className="card" style={{maxWidth:720}}>
          <label>Título</label>
          <input className="input" value={card.title || ''} onChange={e=>setCard({...card, title:e.target.value})} />
          <label>Descrição</label>
          <textarea className="input" value={card.description || ''} onChange={e=>setCard({...card, description:e.target.value})} />
          <label>Logo</label>
          <input type="file" accept="image/*" onChange={uploadLogo} />
          <button className="btn" onClick={save}>Salvar</button>
          <div style={{marginTop:12}}>{msg}</div>
        </div>
      )}
    </Layout>
  );
}
