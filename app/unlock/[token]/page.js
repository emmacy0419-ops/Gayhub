'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function UnlockContact() {
  const { token } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [contactInfo, setContactInfo] = useState(null);

  useEffect(() => {
    const fetchContact = async () => {
      if (!token) return;
      const res = await fetch('/api/unlock/' + token);
      const data = await res.json();
      if (res.ok) setContactInfo(data);
      else setError(data.error || 'Invalid link.');
      setLoading(false);
    };
    fetchContact();
  }, [token]);

  if (loading) return <div style={{ padding: '40px' }}>Verifying...</div>;
  if (error) return <div style={{ padding: '40px' }}><h2 style={{ color: 'red' }}>Denied</h2><p>{error}</p></div>;

  return (
    <div style={{ padding: '40px', maxWidth: '500px', margin: '0 auto', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <div style={{ border: '2px solid green', padding: '30px', background: '#f0fff4' }}>
        <h1 style={{ color: 'green' }}>Unlocked!</h1>
        <p>Contact for <strong>{contactInfo.display_name}</strong>:</p>
        <div style={{ background: 'white', padding: '20px', marginTop: '20px', border: '1px solid #ccc' }}>
          <p>{contactInfo.contact_method}</p>
          <h2>{contactInfo.contact_value}</h2>
        </div>
      </div>
    </div>
  );
}
