import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const ACCESS_MAX_AGE = 60 * 15;
const REFRESH_MAX_AGE = 60 * 60 * 24 * 30;

function clearCookies(response) {
  const secure = process.env.NODE_ENV === 'production';
  response.cookies.set({ name: 'accessToken', value: '', httpOnly: true, secure, sameSite: 'lax', path: '/', maxAge: 0 });
  response.cookies.set({ name: 'refreshToken', value: '', httpOnly: true, secure, sameSite: 'lax', path: '/api/auth', maxAge: 0 });
}

/**
 * Échange le cookie HttpOnly `refreshToken` contre un nouvel access token
 * (renvoyé dans le corps pour les appels directs à l'API) et fait tourner
 * les deux cookies. 401 + purge des cookies si le refresh est invalide.
 */
export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refreshToken')?.value;

  if (!refreshToken) {
    const res = NextResponse.json({ error: 'No refresh token' }, { status: 401 });
    clearCookies(res);
    return res;
  }

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  let data;
  try {
    const backendRes = await fetch(`${backendUrl}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
      cache: 'no-store',
    });
    if (!backendRes.ok) {
      const res = NextResponse.json({ error: 'Refresh rejected' }, { status: 401 });
      clearCookies(res);
      return res;
    }
    data = await backendRes.json();
  } catch {
    // Backend injoignable : on ne purge pas la session, on signale un 503.
    return NextResponse.json({ error: 'Auth service unavailable' }, { status: 503 });
  }

  const newAccess = data.access_token || data.accessToken;
  const newRefresh = data.refresh_token || data.refreshToken || refreshToken;
  if (!newAccess) {
    const res = NextResponse.json({ error: 'Malformed refresh response' }, { status: 502 });
    clearCookies(res);
    return res;
  }

  const response = NextResponse.json({ access_token: newAccess });
  const secure = process.env.NODE_ENV === 'production';
  response.cookies.set({
    name: 'accessToken', value: newAccess,
    httpOnly: true, secure, sameSite: 'lax', path: '/', maxAge: ACCESS_MAX_AGE,
  });
  response.cookies.set({
    name: 'refreshToken', value: newRefresh,
    httpOnly: true, secure, sameSite: 'lax', path: '/api/auth', maxAge: REFRESH_MAX_AGE,
  });
  return response;
}
