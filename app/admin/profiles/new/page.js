'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

export default function AddProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [form, setForm] = useState({
    display_name: '',
    age: '',
    occupation: '',
    relationship_status: 'Single',
    country: '',
    city: '',
    bio: '',
    photo_url: '',
    reason_for_joining: '',
    contact_method: 'WhatsApp',
    contact_value: '',
    consent_method: 'Signed Form',
    consent_date: new Date().toISOString().split('T')[0],
    consent_reference: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('Saving directly to database...');

    try {
      // Create Supabase client directly in the browser
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );

      // 1. Save Profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert([{
          display_name: form.display_name, 
          age: parseInt(form.age), 
          occupation: form.occupation, 
          relationship_status: form.relationship_status, 
          country: form.country, 
          city: form.city, 
          bio: form.bio, 
          photo_url: form.photo_url,
          reason_for_joining: form.reason_for_joining, 
          contact_method: form.contact_method, 
          contact_value_encrypted: form.contact_value, // Plain text for now
        }])
        .select()
        .single();

      if (profileError) throw new Error("Profile Error: " + profileError.message);

      // 2. Save Consent
      const { error: consentError } = await supabase
        .from('consent_records')
        .insert([{
          profile_id: profileData.id, 
          consent_method: form.consent_method, 
          consent_date: form.consent_date, 
          consent_reference: form.consent_reference, 
          consent_scope: 'Listed on site',
        }]);

      if (consentError) throw new Error("Consent Error: " + consentError.message);

      setMessage('Profile added successfully!');
      setForm({ ...form, display_name: '', age: '', occupation: '', country: '', city: '', bio: '', photo_url: '', reason_for_joining: '', contact_value: '', consent_reference: '' });
      
    } catch (error) {
      setMessage('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px 20px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif', background: '#f9f9f9', minHeight: '100vh' }}>
      <div style={{ background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
        <h1 style={{ marginTop: 0 }}>Add New Profile</h1>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h3>Personal Info</h3>
          <input name="display_name" placeholder="Display Name (Required)" value={form.display_name} onChange={handleChange} required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} />
          <input name="age" type="number" placeholder="Age (Required)" value={form.age} onChange={handleChange} required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} />
          <input name="occupation" placeholder="Occupation" value={form.occupation} onChange={handleChange} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} />
          
          <label>Relationship Status:</label>
          <select name="relationship_status" value={form.relationship_status} onChange={handleChange} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}>
            <option value="Single">Single</option>
            <option value="Partnered">Partnered</option>
            <option value="Open relationship">Open relationship</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>

          <input name="country" placeholder="Country" value={form.country} onChange={handleChange} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} />
          <input name="city" placeholder="City" value={form.city} onChange={handleChange} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} />
          <input name="photo_url" placeholder="Photo URL (Link to an image)" value={form.photo_url} onChange={handleChange} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} />
          
          <textarea name="bio" placeholder="Short Bio" value={form.bio} onChange={handleChange} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', minHeight: '80px' }} />
          <textarea name="reason_for_joining" placeholder="Reason for joining" value={form.reason_for_joining} onChange={handleChange} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', minHeight: '80px' }} />

          <h3>Contact Info (Will be encrypted)</h3>
          <select name="contact_method" value={form.contact_method} onChange={handleChange} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}>
            <option value="WhatsApp">WhatsApp</option>
            <option value="Telegram">Telegram</option>
            <option value="Email">Email</option>
            <option value="Phone Number">Phone Number</option>
          </select>
          <input name="contact_value" placeholder="Contact info (Required)" value={form.contact_value} onChange={handleChange} required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} />

          <h3>Consent Tracking (Required)</h3>
          <select name="consent_method" value={form.consent_method} onChange={handleChange} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}>
            <option value="Signed Form">Signed Form</option>
            <option value="Email Screenshot">Email Screenshot</option>
            <option value="Recorded Call">Recorded Call</option>
          </select>
          <label>Date Consent Given:</label>
          <input name="consent_date" type="date" value={form.consent_date} onChange={handleChange} required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} />
          <input name="consent_reference" placeholder="Reference (e.g. Form #0042)" value={form.consent_reference} onChange={handleChange} required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} />

          <button type="submit" disabled={loading} style={{ padding: '15px', fontSize: '16px', background: '#1a1a1a', color: 'white', borderRadius: '8px', cursor: 'pointer', marginTop: '20px' }}>
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </form>

        {message && <p style={{ marginTop: '20px', fontWeight: 'bold', color: message.includes('Error') ? 'red' : 'green' }}>{message}</p>}
      </div>
    </div>
  );
}
