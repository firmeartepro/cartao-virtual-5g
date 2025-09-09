import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Layout from '../../components/Layout';

export default function Login() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  async function handleLogin(e) {
    e.preventDefault();
    setMsg('Enviando magic link...');
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) setMsg('Erro: ' + error.message);
    else setMsg('Cheque seu email para o link magico.');
  }
  return (
    <Layout>
      <div className="card" style={{maxWidth:420}}>
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <input className="input" placeholder="seu@email.com" value={email} onChange={e=>setEmail(e.target.value)} />
          <button className="btn" type="submit">Enviar link</button>
        </form>
        <div style={{marginTop:12}}>{msg}</div>
      </div>
    </Layout>
  );
}
