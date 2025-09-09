import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Layout from '../../components/Layout';

export default function CompanyServices() {
  const [profile, setProfile] = useState(null);
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({ title:'', duration_minutes:30, price:0 });

  useEffect(() => {
    (async()=>{
      const s = await supabase.auth.getSession();
      const session = s.data?.session; if (!session) return;
      const { data: p } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      setProfile(p);
      if (p?.company_id) {
        const { data } = await supabase.from('services').select('*').eq('company_id', p.company_id).order('created_at', { ascending:false });
        setServices(data || []);
      }
    })();
  }, []);

  async function createService(e) {
    e.preventDefault();
    const s = await supabase.auth.getSession(); const token = s.data?.session?.access_token;
    if (!token) return alert('login');
    const { data: profileData } = await supabase.from('profiles').select('*').eq('id', s.data.session.user.id).single();
    const companyId = profileData?.company_id;
    const { data, error } = await supabase.from('services').insert([{ company_id: companyId, ...form }]).select().single();
    if (error) return alert('Erro: ' + error.message);
    setServices(prev => [data, ...prev]); setForm({ title:'', duration_minutes:30, price:0 });
  }

  return (
    <Layout>
      <h2>Serviços</h2>
      {!profile && <p>Faça login</p>}
      {profile && (
        <div className="card" style={{maxWidth:720}}>
          <form onSubmit={createService}>
            <input className="input" placeholder="Título" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} />
            <input className="input" placeholder="Duração em minutos" value={form.duration_minutes} onChange={e=>setForm({...form,duration_minutes:parseInt(e.target.value||30)})} />
            <input className="input" placeholder="Preço" value={form.price} onChange={e=>setForm({...form,price:parseFloat(e.target.value||0)})} />
            <button className="btn" type="submit">Criar serviço</button>
          </form>

          <h3 style={{marginTop:16}}>Seus serviços</h3>
          <ul>
            {services.map(srv => (<li key={srv.id}><strong>{srv.title}</strong> — {srv.duration_minutes} min — R$ {srv.price || '0.00'}</li>))}
          </ul>
        </div>
      )}
    </Layout>
  );
}
