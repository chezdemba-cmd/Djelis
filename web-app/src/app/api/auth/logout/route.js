import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refreshToken')?.value;

  // Révoque la session côté backend (best-effort).
  if (refreshToken) {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      await fetch(`${backendUrl}/api/v1/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
        cache: 'no-store',
      });
    } catch {
      /* on nettoie les cookies quoi qu'il arrive */
    }
  }

  const response = NextResponse.json({ success: true });
  const secure = process.env.NODE_ENV === 'production';
  response.cookies.set({ name: 'accessToken', value: '', httpOnly: true, secure, sameSite: 'lax', path: '/', maxAge: 0 });
  response.cookies.set({ name: 'refreshToken', value: '', httpOnly: true, secure, sameSite: 'lax', path: '/api/auth', maxAge: 0 });
  return response;
}
