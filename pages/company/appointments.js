import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import axios from 'axios';
import Layout from '../../components/Layout';

export default function CompanyAppointments() {
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    (async()=>{
      const s = await supabase.auth.getSession();
      const session = s.data?.session; if (!session) return;
      const { data: p } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      setProfile(p);
      if (p?.company_id) {
        const res = await fetch('/api/appointments/list', { headers: { Authorization: `Bearer ${session.access_token}` }});
        const json = await res.json();
        setAppointments(json.appointments || []);
      }
    })();
  }, []);

  async function updateStatus(id, status) {
    const s = await supabase.auth.getSession();
    const token = s.data?.session?.access_token;
    await axios.post('/api/appointments/update', { appointmentId: id, status }, { headers: { Authorization: `Bearer ${token}` }});
    const res = await fetch('/api/appointments/list', { headers: { Authorization: `Bearer ${token}` }});
    const json = await res.json();
    setAppointments(json.appointments || []);
  }

  return (
    <Layout>
      <h2>Agendamentos</h2>
      {!profile && <p>Faça login</p>}
      {appointments.length === 0 && <p>Nenhum agendamento</p>}
      <ul>
        {appointments.map(a => (
          <li key={a.id} className="card" style={{marginBottom:12}}>
            <div><strong>{a.services?.title || 'Serviço'}</strong> — {new Date(a.scheduled_for).toLocaleString()}</div>
            <div>{a.customer_name} — {a.customer_phone} — <em>{a.status}</em></div>
            <div style={{marginTop:8}}>
              <button className="btn" onClick={()=>updateStatus(a.id,'confirmed')}>Confirmar</button>
              <button style={{marginLeft:8}} onClick={()=>updateStatus(a.id,'cancelled')}>Cancelar</button>
            </div>
          </li>
        ))}
      </ul>
    </Layout>
  );
}
