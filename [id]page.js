'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

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
      const { data: methodsData } = await supabase.from('payment_methods').select('*').eq('is_active', true).order('created_at', { ascending: false });

      if (profileData) setProfile(profileData);
      if (methodsData) setPaymentMethods(methodsData);
      setLoading(false);
    };
    if (id) fetchData();
  }, [id]);

  const handleUnlockSubmit = async (e) => {
    e.preventDefault();
    setSubmitMessage('Sending request...');

    const { error } = await supabase.from('unlock_requests').insert([
      { profile_id: id, payment_method_id: selectedMethod, buyer_email: buyerEmail, buyer_reference: buyerReference, status: 'pending' }
    ]);

    if (error) {
      setSubmitMessage('Error submitting request. Try again.');
    } else {
      setSubmitMessage('Request submitted! The admin will verify your payment and email your access link shortly.');
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  if (!profile) return <div style={{ padding: '40px', textAlign: 'center' }}>Profile not found.</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <button onClick={() => router.push('/')} style={{ marginBottom: '20px', padding: '10px', cursor: 'pointer' }}>
        &larr; Back to Home
      </button>

      <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '30px', background: '#fafafa' }}>
        <h1>{profile.display_name}, {profile.age}</h1>
        <p><strong>Location:</strong> {profile.city}, {profile.country}</p>
        <p><strong>Occupation:</strong> {profile.occupation}</p>
        <p><strong>Status:</strong> {profile.relationship_status}</p>
        
        <hr style={{ margin: '20px 0' }} />
        <h3>About Me</h3>
        <p>{profile.bio}</p>

        <h3>Why I'm Here</h3>
        <p style={{ fontStyle: 'italic' }}>"{profile.reason_for_joining}"</p>
        <hr style={{ margin: '20px 0' }} />

        {!showUnlock ? (
          <div style={{ textAlign: 'center' }}>
            <h2>Want to chat?</h2>
            <p>Unlock {profile.display_name}'s contact info to start chatting directly.</p>
            <button onClick={() => setShowUnlock(true)} style={{ padding: '15px 30px', fontSize: '18px', background: 'green', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
              Unlock Contact - $100
            </button>
          </div>
        ) : (
          <div style={{ background: '#fff', padding: '20px', borderRadius: '5px', border: '1px solid #ccc' }}>
            <h3>Unlock Contact</h3>
            <p>Select a payment method, send exactly $100 worth, and submit the transaction ID below.</p>
            
            <form onSubmit={handleUnlockSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input type="email" placeholder="Your Email (to receive the contact link)" value={buyerEmail} onChange={(e) => setBuyerEmail(e.target.value)} required style={{ padding: '10px' }} />
              <select value={selectedMethod} onChange={(e) => setSelectedMethod(e.target.value)} required style={{ padding: '10px' }}>
                <option value="">-- Select Payment Method --</option>
                {paymentMethods.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
              </select>

              {selectedMethod && (
                <div style={{ background: '#eef', padding: '15px', borderRadius: '5px' }}>
                  <p style={{ margin: '0 0 10px 0' }}><strong>Instructions:</strong> {paymentMethods.find(m => m.id === selectedMethod)?.instructions}</p>
                  <p style={{ margin: 0, wordBreak: 'break-all' }}><strong>Send To:</strong> {paymentMethods.find(m => m.id === selectedMethod)?.receiving_details}</p>
                </div>
              )}

              <input type="text" placeholder="Transaction ID or Card Code" value={buyerReference} onChange={(e) => setBuyerReference(e.target.value)} required style={{ padding: '10px' }} />
              <button type="submit" style={{ padding: '12px', background: 'black', color: 'white', cursor: 'pointer', border: 'none', borderRadius: '5px' }}>Submit Payment Proof</button>
              {submitMessage && <p style={{ color: 'blue', fontWeight: 'bold' }}>{submitMessage}</p>}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
