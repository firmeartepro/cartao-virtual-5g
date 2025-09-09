import { useState } from 'react';
import axios from 'axios';
import Layout from '../../components/Layout';
import { supabase } from '../../lib/supabaseClient';

export default function Admin() {
  const [form, setForm] = useState({ name:'', slug:'', cnpj:'', title:'', description:'' });
  const [msg, setMsg] = useState('');

  async function handleCreate(e) {
    e.preventDefault();
    setMsg('Criando...');
    const s = await supabase.auth.getSession();
    const token = s.data?.session?.access_token;
    try {
      const res = await axios.post('/api/admin/create-company', form, { headers: { Authorization: `Bearer ${token}` }});
      setMsg('Criado: ' + res.data.company.id);
    } catch (err) {
      console.error(err);
      setMsg('Erro: ' + (err.response?.data?.error || err.message));
    }
  }

  return (
    <Layout>
      <div className="card" style={{maxWidth:720}}>
        <h2>Admin — Criar Company + Card</h2>
        <form onSubmit={handleCreate}>
          <input className="input" placeholder="Nome da company" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
          <input className="input" placeholder="slug (único)" value={form.slug} onChange={e=>setForm({...form,slug:e.target.value})} />
          <input className="input" placeholder="cnpj" value={form.cnpj} onChange={e=>setForm({...form,cnpj:e.target.value})} />
          <input className="input" placeholder="Título do cartão" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} />
          <textarea className="input" placeholder="Descrição" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
          <button className="btn" type="submit">Criar</button>
        </form>
        <div style={{marginTop:12}}>{msg}</div>
        <p style={{marginTop:12}}>OBS: seu profile deve ter role='admin' (defina no Supabase console).</p>
      </div>
    </Layout>
  );
}
