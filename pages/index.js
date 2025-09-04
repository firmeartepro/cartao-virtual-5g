import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import Link from 'next/link';

export default function Home() {
  const [cards, setCards] = useState([]);
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('cards').select('id,title,description,company_id').limit(50);
      setCards(data || []);
    })();
  }, []);
  return (
    <div className="container">
      <h1>Cartão Virtual 5G — Cidade</h1>
      <p>Lista de cartões (exemplo)</p>
      <ul>
        {cards.map(c => (
          <li key={c.id}>
            <Link href={`/card/${c.id}`}><a><strong>{c.title || 'Sem título'}</strong> — {c.description?.slice(0,80)}</a></Link>
          </li>
        ))}
      </ul>
      <p style={{marginTop: 24}}>Admin: <Link href="/admin"><a>Painel</a></Link> • Empresa: <Link href="/company/dashboard"><a>Painel Empresa</a></Link></p>
    </div>
  );
}
