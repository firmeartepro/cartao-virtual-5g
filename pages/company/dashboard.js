import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function CompanyDashboard(){
  const [profile, setProfile] = useState(null);
  const [card, setCard] = useState(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    (async () => {
      const sessionResp = await supabase.auth.getSession();
      const session = sessionResp.data.session;
      if (!session) return;
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      setProfile(profileData);
      if (profileData?.company_id) {
        const { data: cardData } = await supabase.from('cards').select('*').eq('company_id', profileData.company_id).single();
        setCard(cardData);
      }
    })();
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setMsg('Salvando...');
    const session = (await supabase.auth.getSession()).data.session;
    if (!session) return setMsg('Faça login');
    try {
      const updated = await supabase
        .from('cards')
        .update({ title: card.title, description: card.description })
        .eq('id', card.id);
      setMsg('Salvo.');
    } catch (err) {
      console.error(err);
      setMsg('Erro ao salvar');
    }
  }

  async function uploadLogo(ev) {
    const file = ev.target.files[0];
    if (!file) return;
    setMsg('Enviando logo...');
    const session = (await supabase.auth.getSession()).data.session;
    const profileResp = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
    const companyId = profileResp.data.company_id;
    const path = `${companyId}/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from('logos').upload(path, file);
    if (error) return setMsg('Erro upload: ' + error.message);
    const { publicUrl } = supabase.storage.from('logos').getPublicUrl(path);
    // update card
    await supabase.from('cards').update({ logo_path: publicUrl }).eq('company_id', companyId);
    setMsg('Logo enviado');
    // refresh
    const { data: c } = await supabase.from('cards').select('*').eq('company_id', companyId).single();
    setCard(c);
  }

  if (!profile) return <div className="container"><p>Faça login (Supabase) para ver o painel.</p></div>;

  return (
    <div className="container">
      <h2>Painel da Empresa</h2>
      {card && (
        <form onSubmit={handleSave}>
          <label>Título</label><br/>
          <input value={card.title || ''} onChange={e=>setCard({...card, title:e.target.value})} /><br/>
          <label>Descrição</label><br/>
          <textarea value={card.description || ''} onChange={e=>setCard({...card, description:e.target.value})} /><br/>
          <label>Logo</label><br/>
          <input type="file" accept="image/*" onChange={uploadLogo} /><br/>
          <button type="submit">Salvar</button>
        </form>
      )}
      <div style={{marginTop:12}}>{msg}</div>
    </div>
  );
}
