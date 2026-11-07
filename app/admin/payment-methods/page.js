'use client';
import { useState, useEffect } from 'react';

export default function PaymentMethods() {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ label: '', type: 'crypto', instructions: '', receiving_details: '' });

  const fetchMethods = async () => {
    const res = await fetch('/api/admin/payment-methods');
    if (res.ok) setMethods(await res.json());
    setLoading(false);
  };
  useEffect(() => { fetchMethods(); }, []);
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAdd = async (e) => {
    e.preventDefault();
    setMessage('');
    const res = await fetch('/api/admin/payment-methods', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if (res.ok) {
      setMessage('Payment method added!');
      setForm({ label: '', type: 'crypto', instructions: '', receiving_details: '' });
      fetchMethods();
    } else setMessage('Error adding.');
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this?')) return;
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
          <input name="label" placeholder="Label (e.g. Bitcoin, USDT, Game Card)" value={form.label} onChange={handleChange} required style={{ padding: '10px' }} />
          <select name="type" value={form.type} onChange={handleChange} style={{ padding: '10px' }}>
            <option value="crypto">Crypto</option>
            <option value="gamecard">Game Card</option>
          </select>
          <textarea name="instructions" placeholder="Instructions for buyer" value={form.instructions} onChange={handleChange} required style={{ padding: '10px' }} />
          <input name="receiving_details" placeholder="Your Address / Details" value={form.receiving_details} onChange={handleChange} required style={{ padding: '10px' }} />
          <button type="submit" style={{ padding: '10px', background: 'black', color: 'white' }}>Add Method</button>
        </form>
        {message && <p style={{ color: 'green', fontWeight: 'bold' }}>{message}</p>}
      </div>
      <h3>Current Methods</h3>
      {methods.map((m) => (
        <div key={m.id} style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '10px' }}>
          <h4>{m.label} ({m.type})</h4>
          <p><strong>Instructions:</strong> {m.instructions}</p>
          <p><strong>Details:</strong> {m.receiving_details}</p>
          <button onClick={() => handleDelete(m.id)} style={{ background: 'red', color: 'white', padding: '5px 10px' }}>Delete</button>
        </div>
      ))}
    </div>
  );
}
