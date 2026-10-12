import { NextResponse } from 'next/server';
import { setCSRFTokenCookie } from '@/lib/csrf';

export async function GET() {
  const token = await setCSRFTokenCookie();
  return NextResponse.json({ token });
}