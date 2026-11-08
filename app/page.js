'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

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

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f9f9f9', fontFamily: 'sans-serif' }}>Loading...</div>;

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5', fontFamily: 'system-ui, -apple-system, sans-serif', paddingBottom: '50px' }}>
      
      {/* Header */}
      <div style={{ background: '#ffffff', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ margin: 0, fontSize: '28px', color: '#1a1a1a', letterSpacing: '-0.5px' }}>GayHub</h1>
        <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>Find your perfect match worldwide</p>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
        {profiles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px', background: 'white', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <h2 style={{ color: '#333' }}>No profiles yet</h2>
            <p style={{ color: '#666' }}>Check back later as new members join!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {profiles.map((profile) => (
              <div key={profile.id} style={{ background: '#ffffff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', transition: 'transform 0.2s', display: 'flex', flexDirection: 'column' }}>
                
                {/* Profile Header */}
                <div style={{ padding: '24px 24px 15px 24px', borderBottom: '1px solid #f0f0f0' }}>
                  <h2 style={{ margin: '0 0 5px 0', fontSize: '22px', color: '#1a1a1a' }}>{profile.display_name}, {profile.age}</h2>
                  <p style={{ margin: 0, color: '#0070f3', fontSize: '14px', fontWeight: '500' }}>
                    📍 {profile.city}, {profile.country}
                  </p>
                </div>

                {/* Profile Details */}
                <div style={{ padding: '15px 24px', flexGrow: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px' }}>
                    <span style={{ color: '#888' }}>Status</span>
                    <span style={{ color: '#333', fontWeight: '500' }}>{profile.relationship_status}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '14px' }}>
                    <span style={{ color: '#888' }}>Occupation</span>
                    <span style={{ color: '#333', fontWeight: '500' }}>{profile.occupation || 'Not specified'}</span>
                  </div>
                  
                  <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '10px', marginTop: '15px' }}>
                    <p style={{ margin: 0, fontSize: '14px', color: '#555', fontStyle: 'italic', lineHeight: '1.5' }}>
                      "{profile.reason_for_joining || 'Looking to meet new people.'}"
                    </p>
                  </div>
                </div>

                {/* Call to Action */}
                <div style={{ padding: '0 24px 24px 24px' }}>
                  <Link href={`/profile/${profile.id}`} style={{ display: 'block', textAlign: 'center', padding: '14px', background: '#1a1a1a', color: 'white', textDecoration: 'none', borderRadius: '10px', fontWeight: '600', fontSize: '15px', transition: 'background 0.2s' }}>
                    View Full Profile
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
