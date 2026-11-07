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
      else setError(data.error || 'Invalid or expired link.');
      setLoading(false);
    };
    fetchContact();
  }, [token]);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Verifying secure link...</div>;

  if (error) {
    return (
      <div style={{ padding: '40px', maxWidth: '500px', margin: '0 auto', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h2 style={{ color: 'red' }}>Access Denied</h2>
        <p>{error}</p>
        <button onClick={() => router.push('/')} style={{ padding: '10px 20px', marginTop: '20px', cursor: 'pointer' }}>Return Home</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', maxWidth: '500px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <div style={{ border: '2px solid green', borderRadius: '8px', padding: '30px', textAlign: 'center', background: '#f0fff4' }}>
        <h1 style={{ color: 'green', marginTop: 0 }}>Unlocked!</h1>
        <p>You have successfully unlocked the contact information for <strong>{contactInfo.display_name}</strong>.</p>
        
        <div style={{ background: 'white', padding: '20px', borderRadius: '5px', marginTop: '20px', border: '1px solid #ccc' }}>
          <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>Contact Method: {contactInfo.contact_method}</p>
          <h2 style={{ margin: 0, wordBreak: 'break-all' }}>{contactInfo.contact_value}</h2>
        </div>
        <p style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>Copy this information and reach out to them directly!</p>
      </div>
    </div>
  );
}
