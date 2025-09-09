import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { supabase } from '../../lib/supabaseClient';
import LetreiroTicker from '../../components/LetreiroTicker';
import axios from 'axios';

export default function CardPage() {
  const router = useRouter();
  const { id } = router.query;
  const [card, setCard] = useState(null);
  const [services, setServices] = useState([]);
  const [booking, setBooking] = useState({ serviceId:'', scheduledFor:'', customerName:'', customerPhone:'' });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data } = await supabase.from('cards').select('*, companies(name)').eq('id', id).single();
      setCard(data);
      if (data?.company_id) {
        const { data: srv } = await supabase.from('services').select('*').eq('company_id', data.company_id).eq('active', true);
        setServices(srv || []);
      }
    })();
  }, [id]);

  async function handleBook(e) {
    e.preventDefault();
    setMsg('Enviando agendamento...');
    const s = await supabase.auth.getSession();
    const token = s.data?.session?.access_token;
    try {
      const payload = {
        serviceId: booking.serviceId,
        scheduledFor: booking.scheduledFor,
        customerName: booking.customerName,
        customerPhone: booking.customerPhone
      };
      await axios.post('/api/appointments/create', payload, { headers: { Authorization: `Bearer ${token}` }});
      setMsg('Agendamento solicitado. A empresa receberá notificação.');
      setBooking({ serviceId:'', scheduledFor:'', customerName:'', customerPhone:'' });
    } catch (err) {
      console.error(err);
      setMsg('Erro: ' + (err.response?.data?.error || err.message));
    }
  }

  return (
    <>
      <Layout>
        {!card && <p>Carregando...</p>}
        {card && (
          <>
            <div style={{display:'flex',gap:12,alignItems:'center'}} className="card">
              <div style={{width:80,height:80,background:'#eee',borderRadius:8}}>
                {card.logo_path && <img src={card.logo_path} alt="logo" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:8}} />}
              </div>
              <div>
                <h2>{card.title}</h2>
                <div style={{opacity:0.8}}>{card.companies?.name}</div>
                <p>{card.description}</p>
              </div>
            </div>

            <div style={{marginTop:16}} className="card">
              <h3>Agende um serviço</h3>
              {services.length === 0 && <p>Esta empresa ainda não cadastrou serviços.</p>}
              {services.length > 0 && (
                <form onSubmit={handleBook}>
                  <label>Serviço</label>
                  <select className="input" required value={booking.serviceId} onChange={e=>setBooking({...booking, serviceId:e.target.value})}>
                    <option value="">-- escolha --</option>
                    {services.map(s=> <option key={s.id} value={s.id}>{s.title} — {s.duration_minutes} min — R$ {s.price || '0.00'}</option>)}
                  </select>
                  <label>Data e hora</label>
                  <input className="input" required type="datetime-local" value={booking.scheduledFor} onChange={e=>setBooking({...booking, scheduledFor:e.target.value})} />
                  <label>Seu nome</label>
                  <input className="input" value={booking.customerName} onChange={e=>setBooking({...booking, customerName:e.target.value})} />
                  <label>Telefone (WhatsApp)</label>
                  <input className="input" value={booking.customerPhone} onChange={e=>setBooking({...booking, customerPhone:e.target.value})} placeholder="+55119..." />
                  <button className="btn" type="submit">Solicitar agendamento</button>
                </form>
              )}
              <div style={{marginTop:10}}>{msg}</div>
            </div>
          </>
        )}
      </Layout>
      <LetreiroTicker />
    </>
  );
}
