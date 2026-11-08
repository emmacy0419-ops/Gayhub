import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

export async function POST(req) {
  try {
    const isAdmin = cookies().get('admin_auth')?.value === 'true';
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized. Please log in again.' }, { status: 401 });
    }
    
    const body = await req.json();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Missing Supabase keys in Vercel.' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: profileData, error: profileError } = await supabase.from('profiles').insert([{
      display_name: body.display_name, 
      age: parseInt(body.age), 
      occupation: body.occupation, 
      relationship_status: body.relationship_status, 
      country: body.country, 
      city: body.city, 
      bio: body.bio, 
      photo_url: body.photo_url,
      reason_for_joining: body.reason_for_joining, 
      contact_method: body.contact_method, 
      contact_value_encrypted: body.contact_value,
    }]).select().single();

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }
    
    const { error: consentError } = await supabase.from('consent_records').insert([{
      profile_id: profileData.id, 
      consent_method: body.consent_method, 
      consent_date: body.consent_date, 
      consent_reference: body.consent_reference, 
      consent_scope: 'Listed on site',
    }]);
    
    if (consentError) {
      return NextResponse.json({ error: consentError.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, profile: profileData });

  } catch (error) { 
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 }); 
  }
}
