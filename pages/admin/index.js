import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import axios from 'axios';

export default function Admin() {
  const [form, setForm] = useState({ name: '', slug: '', cnpj: '', title: '', description: '' });
  const [msg, setMsg] = useState('');

  async function handleCreate(e) {
    e.preventDefault();
    setMsg('Criando...');
    const session = (await supabase.auth.getSession()).data.session;
    if (!session) return setMsg('Faça login como admin no Supabase (console) e marque seu profile.role=admin');
    try {
      const res = await axios.post('/api/cards/create', form, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      setMsg('Criado! company id: ' + res.data.company.id);
    } catch (err) {
      console.error(err);
      setMsg('Erro: ' + (err.response?.data?.error?.message || err.message));
    }
  }

  return (
    <div className="container">
      <h2>Admin — Criar Company + Card</h2>
      <form onSubmit={handleCreate}>
        <input placeholder="Nome da Company" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /><br/>
        <input placeholder="Slug (único)" value={form.slug} onChange={e=>setForm({...form,slug:e.target.value})} /><br/>
        <input placeholder="CNPJ" value={form.cnpj} onChange={e=>setForm({...form,cnpj:e.target.value})} /><br/>
        <input placeholder="Título do cartão" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} /><br/>
        <textarea placeholder="Descrição" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} /><br/>
        <button type="submit">Criar</button>
      </form>
      <div style={{marginTop:12}}>{msg}</div>
      <p>Observação: para que funcione, seu profile no Supabase deve ter role = "admin". Altere manualmente no console se necessário.</p>
    </div>
  );
}
