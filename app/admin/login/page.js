'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) router.push('/admin/profiles/new');
    else setError('Wrong password bro. Try again.');
  };

  return (
    <div style={{ padding: '40px', maxWidth: '400px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1>Admin Login</h1>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input type="password" placeholder="Enter admin password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ padding: '10px', fontSize: '16px' }} />
        <button type="submit" style={{ padding: '10px', fontSize: '16px', cursor: 'pointer' }}>Login</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
}
