'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from('unlock_requests')
      .select(`*, profiles ( display_name ), payment_methods ( label )`)
      .order('created_at', { ascending: false });

    if (!error && data) setRequests(data);
    setLoading(false);
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleApprove = async (id) => {
    setMessage('Generating access token...');
    const token = Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2, '0')).join('');

    const { error } = await supabase.from('unlock_requests').update({ status: 'confirmed', access_token: token, confirmed_at: new Date().toISOString() }).eq('id', id);

    if (error) {
      setMessage('Error approving: ' + error.message);
    } else {
      const unlockLink = window.location.origin + '/unlock/' + token;
      setMessage(`Approved! Send this link to the buyer: ${unlockLink}`);
      fetchRequests();
    }
  };

  const handleReject = async (id) => {
    if (!confirm('Reject this request?')) return;
    const { error } = await supabase.from('unlock_requests').update({ status: 'rejected' }).eq('id', id);
    if (!error) fetchRequests();
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading requests...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1>Payment Requests</h1>
      {message && <div style={{ padding: '15px', background: '#eef', border: '1px solid #0070f3', borderRadius: '5px', marginBottom: '20px', wordBreak: 'break-all' }}><strong>{message}</strong></div>}
      {requests.length === 0 && <p>No unlock requests yet.</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {requests.map((req) => (
          <div key={req.id} style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', background: req.status === 'pending' ? '#fff3cd' : '#f8f9fa' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3 style={{ margin: 0 }}>Profile: {req.profiles?.display_name || 'Unknown'}</h3>
              <span style={{ padding: '5px 10px', borderRadius: '15px', fontSize: '12px', fontWeight: 'bold', color: 'white', background: req.status === 'pending' ? 'orange' : req.status === 'confirmed' ? 'green' : 'red' }}>{req.status.toUpperCase()}</span>
            </div>
            <p style={{ margin: '5px 0' }}><strong>Buyer Email:</strong> {req.buyer_email}</p>
            <p style={{ margin: '5px 0' }}><strong>Method Used:</strong> {req.payment_methods?.label}</p>
            <p style={{ margin: '5px 0' }}><strong>TxID / Reference:</strong> <span style={{ background: '#eee', padding: '2px 6px', borderRadius: '3px' }}>{req.buyer_reference}</span></p>
            
            {req.status === 'pending' && (
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button onClick={() => handleApprove(req.id)} style={{ padding: '10px 20px', background: 'green', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Verify & Approve</button>
                <button onClick={() => handleReject(req.id)} style={{ padding: '10px 20px', background: 'red', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Reject (Fake/No Payment)</button>
              </div>
            )}

            {req.status === 'confirmed' && req.access_token && (
              <div style={{ marginTop: '15px', padding: '10px', background: '#d4edda', borderRadius: '5px' }}>
                <strong>Access Link (Send this to buyer):</strong><br/>
                <span style={{ fontSize: '14px', wordBreak: 'break-all' }}>{window.location.origin}/unlock/{req.access_token}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
