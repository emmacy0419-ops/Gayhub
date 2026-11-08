import { NextResponse } from 'next/server';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return NextResponse.json({
    message: "Diagnostic Check",
    url_found: url ? url : "MISSING",
    key_found: key ? "Key exists (starts with " + key.substring(0, 10) + "...)" : "MISSING",
    url_length: url ? url.length : 0
  });
}
