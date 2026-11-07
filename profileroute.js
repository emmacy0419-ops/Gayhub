import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';
import { encrypt } from '@/lib/crypto';

export async function POST(req) {
  try {
    const cookieStore = cookies();
    const isAdmin = cookieStore.get('admin_auth')?.value === 'true';
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    if (!body.consent_date || !body.consent_reference) {
      return NextResponse.json({ error: 'Consent date and reference are required.' }, { status: 400 });
    }

    const encryptedContact = encrypt(body.contact_value);

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          display_name: body.display_name,
          age: parseInt(body.age),
          occupation: body.occupation,
          relationship_status: body.relationship_status,
          country: body.country,
          city: body.city,
          bio: body.bio,
          reason_for_joining: body.reason_for_joining,
          contact_method: body.contact_method,
          contact_value_encrypted: encryptedContact,
        }
      ])
      .select()
      .single();

    if (profileError) throw profileError;

    const { error: consentError } = await supabase
      .from('consent_records')
      .insert([
        {
          profile_id: profileData.id,
          consent_method: body.consent_method,
          consent_date: body.consent_date,
          consent_reference: body.consent_reference,
          consent_scope: 'Listed on site; contact released to paying members',
        }
      ]);

    if (consentError) throw consentError;

    return NextResponse.json({ success: true, profile: profileData });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Failed to add profile' }, { status: 500 });
  }
}
