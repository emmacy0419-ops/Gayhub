import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const KEY = Buffer.from(process.env.CONTACT_KEY || '', 'hex');

function decrypt(payload) {
  if (!payload) return '';
  const buf = Buffer.from(payload, 'base64');
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const enc = buf.subarray(28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', KEY, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString('utf8');
}

export async function GET(req, { params }) {
  try {
    const token = params.token;
    const { data, error } = await supabase.from('unlock_requests').select(`status, profiles ( display_name, contact_method, contact_value_encrypted )`).eq('access_token', token).single();
    
    if (error || !data) return NextResponse.json({ error: 'Invalid link' }, { status: 404 });
    if (data.status !== 'confirmed') return NextResponse.json({ error: 'Not confirmed' }, { status: 403 });
    
    const decryptedContact = decrypt(data.profiles.contact_value_encrypted);
    
    return NextResponse.json({ display_name: data.profiles.display_name, contact_method: data.profiles.contact_method, contact_value: decryptedContact });
  } catch (error) { 
    return NextResponse.json({ error: 'Server error' }, { status: 500 }); 
  }
}
