import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req) {
  try {
    const body = await req.json();
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    const { data: profileData, error: profileError } = await supabase.from('profiles').insert([{
      display_name: body.display_name, age: parseInt(body.age), occupation: body.occupation, relationship_status: body.relationship_status, country: body.country, city: body.city, bio: body.bio, photo_url: body.photo_url, reason_for_joining: body.reason_for_joining, contact_method: body.contact_method, contact_value_encrypted: body.contact_value
    }]).select().single();

    if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 });
    
    await supabase.from('consent_records').insert([{
      profile_id: profileData.id, consent_method: body.consent_method, consent_date: body.consent_date, consent_reference: body.consent_reference, consent_scope: 'Listed on site'
    }]);
    
    return NextResponse.json({ success: true });
  } catch (error) { 
    return NextResponse.json({ error: error.message }, { status: 500 }); 
  }
}
