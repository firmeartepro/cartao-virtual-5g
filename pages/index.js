import Link from 'next/link';
import Layout from '../components/Layout';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Home() {
  const [cards, setCards] = useState([]);
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('cards').select('id,title,description,company_id').limit(50);
      setCards(data || []);
    })();
  }, []);
  return (
    <Layout>
      <h1>PulseLocal — Empresas Cadastradas</h1>
      <div className="card">
        <ul>
          {cards.map(c => (
            <li key={c.id}><Link href={`/card/${c.id}`}><a><strong>{c.title || 'Sem título'}</strong> — {c.description?.slice(0,80)}</a></Link></li>
          ))}
        </ul>
      </div>
    </Layout>
  );
}

