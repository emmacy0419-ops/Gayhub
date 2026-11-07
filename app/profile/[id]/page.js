'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function ProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUnlock, setShowUnlock] = useState(false);
  const [buyerEmail, setBuyerEmail] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [buyerReference, setBuyerReference] = useState('');
  const [submitMessage, setSubmitMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', id).single();
      const { data: methodsData } = await supabase.from('payment_methods').select('*').eq('is_active', true);
      if (profileData) setProfile(profileData);
      if (methodsData) setPaymentMethods(methodsData);
      setLoading(false);
    };
    if (id) fetchData();
  }, [id]);

  const handleUnlockSubmit = async (e) => {
    e.preventDefault();
    setSubmitMessage('Sending...');
    const { error } = await supabase.from('unlock_requests').insert([{ profile_id: id, payment_method_id: selectedMethod, buyer_email: buyerEmail, buyer_reference: buyerReference, status: 'pending' }]);
    if (error) setSubmitMessage('Error. Try again.');
    else setSubmitMessage('Request submitted! Admin will verify and email your link.');
  };

  if (loading) return <div style={{ padding: '40px' }}>Loading...</div>;
  if (!profile) return <div style={{ padding: '40px' }}>Profile not found.</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <button onClick={() => router.push('/')} style={{ marginBottom: '20px', padding: '10px' }}>&larr; Back</button>
      <div style={{ border: '1px solid #ddd', padding: '30px', background: '#fafafa' }}>
        <h1>{profile.display_name}, {profile.age}</h1>
        <p><strong>Location:</strong> {profile.city}, {profile.country}</p>
        <p><strong>Occupation:</strong> {profile.occupation}</p>
        <p><strong>Status:</strong> {profile.relationship_status}</p>
        <hr style={{ margin: '20px 0' }} />
        <p>{profile.bio}</p>
        <p style={{ fontStyle: 'italic' }}>"{profile.reason_for_joining}"</p>
        <hr style={{ margin: '20px 0' }} />
        {!showUnlock ? (
          <div style={{ textAlign: 'center' }}>
            <button onClick={() => setShowUnlock(true)} style={{ padding: '15px 30px', background: 'green', color: 'white', border: 'none' }}>Unlock Contact - $100</button>
          </div>
        ) : (
          <div style={{ background: '#fff', padding: '20px', border: '1px solid #ccc' }}>
            <form onSubmit={handleUnlockSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input type="email" placeholder="Your Email" value={buyerEmail} onChange={(e) => setBuyerEmail(e.target.value)} required style={{ padding: '10px' }} />
              <select value={selectedMethod} onChange={(e) => setSelectedMethod(e.target.value)} required style={{ padding: '10px' }}>
                <option value="">-- Select Payment --</option>
                {paymentMethods.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
              </select>
              {selectedMethod && (
                <div style={{ background: '#eef', padding: '15px' }}>
                  <p>{paymentMethods.find(m => m.id === selectedMethod)?.instructions}</p>
                  <p><strong>Send To:</strong> {paymentMethods.find(m => m.id === selectedMethod)?.receiving_details}</p>
                </div>
              )}
              <input type="text" placeholder="TxID or Card Code" value={buyerReference} onChange={(e) => setBuyerReference(e.target.value)} required style={{ padding: '10px' }} />
              <button type="submit" style={{ padding: '12px', background: 'black', color: 'white' }}>Submit Proof</button>
              {submitMessage && <p style={{ color: 'blue' }}>{submitMessage}</p>}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
