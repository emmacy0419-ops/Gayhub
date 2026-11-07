'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
    reason_for_joining: '',
    contact_method: 'WhatsApp',
    contact_value: '',
    consent_method: 'Signed Form',
    consent_date: new Date().toISOString().split('T')[0],
    consent_reference: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const res = await fetch('/api/admin/profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      setMessage('Profile added successfully!');
      setForm({
        ...form,
        display_name: '', age: '', occupation: '', country: '', city: '', bio: '', reason_for_joining: '', contact_value: '', consent_reference: '',
      });
    } else {
      setMessage('Error: ' + data.error);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1>Add New Profile</h1>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <h3>Personal Info</h3>
        <input name="display_name" placeholder="Display Name (Required)" value={form.display_name} onChange={handleChange} required style={{ padding: '10px' }} />
        <input name="age" type="number" placeholder="Age (Required)" value={form.age} onChange={handleChange} required style={{ padding: '10px' }} />
        <input name="occupation" placeholder="Occupation" value={form.occupation} onChange={handleChange} style={{ padding: '10px' }} />
        
        <label>Relationship Status:</label>
        <select name="relationship_status" value={form.relationship_status} onChange={handleChange} style={{ padding: '10px' }}>
          <option value="Single">Single</option>
          <option value="Partnered">Partnered</option>
          <option value="Open relationship">Open relationship</option>
          <option value="Prefer not to say">Prefer not to say</option>
        </select>

        <input name="country" placeholder="Country" value={form.country} onChange={handleChange} style={{ padding: '10px' }} />
        <input name="city" placeholder="City" value={form.city} onChange={handleChange} style={{ padding: '10px' }} />
        <textarea name="bio" placeholder="Short Bio" value={form.bio} onChange={handleChange} style={{ padding: '10px', minHeight: '80px' }} />
        <textarea name="reason_for_joining" placeholder="Reason for joining (What are they looking for?)" value={form.reason_for_joining} onChange={handleChange} style={{ padding: '10px', minHeight: '80px' }} />

        <h3>Contact Info (Will be encrypted)</h3>
        <select name="contact_method" value={form.contact_method} onChange={handleChange} style={{ padding: '10px' }}>
          <option value="WhatsApp">WhatsApp</option>
          <option value="Telegram">Telegram</option>
          <option value="Email">Email</option>
          <option value="Phone Number">Phone Number</option>
        </select>
        <input name="contact_value" placeholder="Phone number, username, or email (Required)" value={form.contact_value} onChange={handleChange} required style={{ padding: '10px' }} />

        <h3>Consent Tracking (Required)</h3>
        <select name="consent_method" value={form.consent_method} onChange={handleChange} style={{ padding: '10px' }}>
          <option value="Signed Form">Signed Form</option>
          <option value="Email Screenshot">Email Screenshot</option>
          <option value="Recorded Call">Recorded Call</option>
        </select>
        <label>Date Consent Given:</label>
        <input name="consent_date" type="date" value={form.consent_date} onChange={handleChange} required style={{ padding: '10px' }} />
        <input name="consent_reference" placeholder="Reference (e.g. Form #0042 on my laptop) (Required)" value={form.consent_reference} onChange={handleChange} required style={{ padding: '10px' }} />

        <button type="submit" disabled={loading} style={{ padding: '15px', fontSize: '16px', background: 'black', color: 'white', cursor: 'pointer', marginTop: '20px' }}>
          {loading ? 'Saving...' : 'Save Profile'}
        </button>
      </form>

      {message && <p style={{ marginTop: '20px', fontWeight: 'bold' }}>{message}</p>}
    </div>
  );
}
