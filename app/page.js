'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

export default function Homepage() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfiles = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id, display_name, age, occupation, relationship_status, country, city, bio, reason_for_joining,
          consent_records ( revoked_at )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (!error && data) {
        const activeProfiles = data.filter(p => {
          const consents = p.consent_records || [];
          return consents.length > 0 && !consents[0].revoked_at;
        });
        setProfiles(activeProfiles);
      }
      setLoading(false);
    };
    fetchProfiles();
  }, []);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Find Your Match</h1>
      {profiles.length === 0 && <p style={{ textAlign: 'center' }}>No profiles available right now.</p>}
      
      <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {profiles.map((profile) => (
          <div key={profile.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', background: '#fafafa' }}>
            <h2 style={{ margin: '0 0 10px 0' }}>{profile.display_name}, {profile.age}</h2>
            
            <p style={{ margin: '5px 0', color: '#555' }}>
              <strong>Location:</strong> {profile.city}, {profile.country}
            </p>
            <p style={{ margin: '5px 0', color: '#555' }}>
              <strong>Occupation:</strong> {profile.occupation || 'Not specified'}
            </p>
            <p style={{ margin: '5px 0', color: '#555' }}>
              <strong>Status:</strong> {profile.relationship_status}
            </p>
            
            <div style={{ marginTop: '15px', padding: '10px', background: '#fff', borderLeft: '4px solid #0070f3' }}>
              <p style={{ margin: 0, fontSize: '14px', fontStyle: 'italic' }}>
                "Looking for: {profile.reason_for_joining || 'Not specified'}"
              </p>
            </div>

            <Link href={`/profile/${profile.id}`} style={{ display: 'block', textAlign: 'center', marginTop: '20px', padding: '10px', background: 'black', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>
              View Full Profile
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
