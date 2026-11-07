import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import { decrypt } from '../../../../lib/crypto';

export async function GET(req, { params }) {
  try {
    const token = params.token;
    const { data, error } = await supabase.from('unlock_requests').select(`status, profiles ( display_name, contact_method, contact_value_encrypted )`).eq('access_token', token).single();
    if (error || !data) return NextResponse.json({ error: 'Invalid link' }, { status: 404 });
    if (data.status !== 'confirmed') return NextResponse.json({ error: 'Not confirmed' }, { status: 403 });
    const decryptedContact = decrypt(data.profiles.contact_value_encrypted);
    return NextResponse.json({ display_name: data.profiles.display_name, contact_method: data.profiles.contact_method, contact_value: decryptedContact });
  } catch (error) { return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
}
