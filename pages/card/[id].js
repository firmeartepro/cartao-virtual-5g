import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import LetreiroTicker from '../../components/LetreiroTicker';

export default function CardPage() {
  const router = useRouter();
  const { id } = router.query;
  const [card, setCard] = useState(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data } = await supabase.from('cards').select('*, companies(name)').eq('id', id).single();
      setCard(data);
    })();
  }, [id]);

  return (
    <>
      <div className="container" style={{paddingBottom: 80}}>
        {!card && <p>Carregando...</p>}
        {card && (
          <>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              {card.logo_path ? <img src={card.logo_path} alt="logo" style={{width:72,height:72,objectFit:'cover',borderRadius:8}} /> : <div style={{width:72,height:72,background:'#ddd',borderRadius:8}} />}
              <div>
                <h2>{card.title}</h2>
                <div style={{opacity:0.8}}>{card.companies?.name}</div>
              </div>
            </div>
            <hr style={{margin:'16px 0'}} />
            <div>
              <h3>Sobre</h3>
              <p>{card.description || 'Sem descrição'}</p>
            </div>
            {/* Aqui as abas (Visão geral, Ofertas, Serviços, Agendamento, Avaliações) podem ser adicionadas */}
          </>
        )}
      </div>

      {/* Letreiro fixo no rodapé do cartão */}
      <LetreiroTicker />
    </>
  );
}
