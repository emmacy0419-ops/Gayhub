'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function AdminRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchRequests = async () => {
    const { data } = await supabase.from('unlock_requests').select(`*, profiles ( display_name ), payment_methods ( label )`).order('created_at', { ascending: false });
    if (data) setRequests(data);
    setLoading(false);
  };
  useEffect(() => { fetchRequests(); }, []);

  const handleApprove = async (id) => {
    setMessage('Generating token...');
    const token = Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2, '0')).join('');
    const { error } = await supabase.from('unlock_requests').update({ status: 'confirmed', access_token: token, confirmed_at: new Date().toISOString() }).eq('id', id);
    if (error) setMessage('Error: ' + error.message);
    else {
      setMessage(`Approved! Link: ${window.location.origin}/unlock/${token}`);
      fetchRequests();
    }
  };

  const handleReject = async (id) => {
    if (!confirm('Reject?')) return;
    await supabase.from('unlock_requests').update({ status: 'rejected' }).eq('id', id);
    fetchRequests();
  };

  if (loading) return <div style={{ padding: '40px' }}>Loading...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1>Payment Requests</h1>
      {message && <div style={{ padding: '15px', background: '#eef', border: '1px solid #0070f3', marginBottom: '20px', wordBreak: 'break-all' }}><strong>{message}</strong></div>}
      {requests.map((req) => (
        <div key={req.id} style={{ border: '1px solid #ccc', padding: '20px', marginBottom: '15px', background: req.status === 'pending' ? '#fff3cd' : '#f8f9fa' }}>
          <h3>{req.profiles?.display_name} - <span style={{ color: req.status === 'pending' ? 'orange' : 'green' }}>{req.status.toUpperCase()}</span></h3>
          <p><strong>Email:</strong> {req.buyer_email} | <strong>Method:</strong> {req.payment_methods?.label}</p>
          <p><strong>TxID:</strong> {req.buyer_reference}</p>
          {req.status === 'pending' && (
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button onClick={() => handleApprove(req.id)} style={{ padding: '10px', background: 'green', color: 'white' }}>Approve</button>
              <button onClick={() => handleReject(req.id)} style={{ padding: '10px', background: 'red', color: 'white' }}>Reject</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
