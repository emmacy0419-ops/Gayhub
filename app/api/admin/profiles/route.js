import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const KEY = Buffer.from(process.env.CONTACT_KEY || '', 'hex');

function encrypt(text) {
  if (!text) return '';
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', KEY, iv);
  const enc = Buffer.concat([cipher.update(String(text), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString('base64');
}

export async function POST(req) {
  try {
    const isAdmin = cookies().get('admin_auth')?.value === 'true';
    if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const body = await req.json();
    if (!body.consent_date || !body.consent_reference) return NextResponse.json({ error: 'Consent required' }, { status: 400 });
    
    const encryptedContact = encrypt(body.contact_value);
    
    const { data: profileData, error: profileError } = await supabase.from('profiles').insert([{
      display_name: body.display_name, age: parseInt(body.age), occupation: body.occupation, relationship_status: body.relationship_status, country: body.country, city: body.city, bio: body.bio, reason_for_joining: body.reason_for_joining, contact_method: body.contact_method, contact_value_encrypted: encryptedContact,
    }]).select().single();

    if (profileError) throw profileError;
    
    const { error: consentError } = await supabase.from('consent_records').insert([{
      profile_id: profileData.id, consent_method: body.consent_method, consent_date: body.consent_date, consent_reference: body.consent_reference, consent_scope: 'Listed on site',
    }]);
    
    if (consentError) throw consentError;
    
    return NextResponse.json({ success: true, profile: profileData });
  } catch (error) { 
    return NextResponse.json({ error: error.message }, { status: 500 }); 
  }
}
