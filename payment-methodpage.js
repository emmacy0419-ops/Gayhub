'use client';

import { useState, useEffect } from 'react';

export default function PaymentMethods() {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ label: '', type: 'crypto', instructions: '', receiving_details: '' });

  const fetchMethods = async () => {
    const res = await fetch('/api/admin/payment-methods');
    if (res.ok) {
      const data = await res.json();
      setMethods(data);
    }
    setLoading(false);
  };

  useEffect(() => { fetchMethods(); }, []);

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); };

  const handleAdd = async (e) => {
    e.preventDefault();
    setMessage('');
    const res = await fetch('/api/admin/payment-methods', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setMessage('Payment method added!');
      setForm({ label: '', type: 'crypto', instructions: '', receiving_details: '' });
      fetchMethods();
    } else {
      const data = await res.json();
      setMessage('Error: ' + data.error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this?')) return;
    const res = await fetch('/api/admin/payment-methods?id=' + id, { method: 'DELETE' });
    if (res.ok) fetchMethods();
  };

  if (loading) return <p style={{ padding: '20px' }}>Loading...</p>;

  return (
    <div style={{ padding: '20px', maxWidth: '700px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1>Manage Payment Methods</h1>

      <div style={{ background: '#f4f4f4', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <h3>Add New Method</h3>
        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input name="label" placeholder="Label (e.g. Bitcoin (BTC), USDT (TRC-20), Google Play Card)" value={form.label} onChange={handleChange} required style={{ padding: '10px' }} />
          <select name="type" value={form.type} onChange={handleChange} style={{ padding: '10px' }}>
            <option value="crypto">Crypto</option>
            <option value="gamecard">Game Card</option>
          </select>
          <textarea name="instructions" placeholder="Instructions for the buyer (e.g. Send exactly $100 worth of BTC, then submit txid)" value={form.instructions} onChange={handleChange} required style={{ padding: '10px', minHeight: '60px' }} />
          <input name="receiving_details" placeholder="Your Address / Email / Details" value={form.receiving_details} onChange={handleChange} required style={{ padding: '10px' }} />
          <button type="submit" style={{ padding: '10px', background: 'black', color: 'white', cursor: 'pointer' }}>Add Method</button>
        </form>
        {message && <p style={{ color: 'green', fontWeight: 'bold' }}>{message}</p>}
      </div>

      <h3>Current Active Methods</h3>
      {methods.length === 0 && <p>No payment methods added yet.</p>}
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {methods.map((m) => (
          <div key={m.id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '5px' }}>
            <h4 style={{ margin: '0 0 10px 0' }}>{m.label} ({m.type})</h4>
            <p style={{ margin: '5px 0' }}><strong>Instructions:</strong> {m.instructions}</p>
            <p style={{ margin: '5px 0' }}><strong>Receiving Details:</strong> {m.receiving_details}</p>
            <button onClick={() => handleDelete(m.id)} style={{ marginTop: '10px', background: 'red', color: 'white', padding: '5px 10px', cursor: 'pointer', border: 'none', borderRadius: '3px' }}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
