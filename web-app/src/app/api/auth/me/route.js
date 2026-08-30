import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken');
  
  if (token?.value) {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    try {
      const response = await fetch(`${backendUrl}/api/v1/profiles`, {
        headers: { Authorization: `Bearer ${token.value}` },
        cache: 'no-store',
      });
      if (response.ok) return NextResponse.json({ authenticated: true });
    } catch {
      return NextResponse.json({ authenticated: false }, { status: 503 });
    }
  }
  
  return NextResponse.json({ authenticated: false }, { status: 401 });
}
