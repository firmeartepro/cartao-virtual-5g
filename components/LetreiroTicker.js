import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function LetreiroTicker() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase
        .from('letreiro_posts')
        .select('id,title,kind,approved,created_at')
        .order('created_at', { ascending: false })
        .limit(50);
      if (mounted) setItems(data ? data.filter(i => i.approved) : []);
    })();

    const channel = supabase
      .channel('public:letreiro_posts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'letreiro_posts' },
        payload => {
          if (payload.new && payload.new.approved) {
            setItems(prev => [payload.new, ...prev].slice(0, 50));
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  if (!items.length) return null;

  return (
    <div style={{position:'fixed',bottom:0,left:0,right:0,background:'#111',color:'#fff',height:42,display:'flex',alignItems:'center',overflow:'hidden',zIndex:999}}>
      <div style={{paddingLeft:16}}>
        <strong style={{marginRight:12}}>O que rola hoje:</strong>
      </div>
      <div style={{flex:1,overflow:'hidden'}}>
        <div className="marquee">
          {items.map(it => (
            <span key={it.id} style={{marginRight:28,opacity:0.95}}>
              [{(it.kind||'info').toUpperCase()}] {it.title}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
