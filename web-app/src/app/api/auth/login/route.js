import { NextResponse } from 'next/server';

const ACCESS_MAX_AGE = 60 * 15;            // 15 min (aligné sur le backend)
const REFRESH_MAX_AGE = 60 * 60 * 24 * 30; // 30 jours

export async function POST(request) {
  try {
    const { token, refreshToken } = await request.json();
    if (!token) {
      return NextResponse.json({ error: 'Token missing' }, { status: 400 });
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const verification = await fetch(`${backendUrl}/api/v1/profiles`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!verification.ok) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });
    const secure = process.env.NODE_ENV === 'production';

    response.cookies.set({
      name: 'accessToken',
      value: token,
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/',
      maxAge: ACCESS_MAX_AGE,
    });

    // Le refresh token n'est envoyé qu'aux routes /api/auth (jamais au reste
    // de l'app) et n'est jamais lisible par le JavaScript.
    if (refreshToken) {
      response.cookies.set({
        name: 'refreshToken',
        value: refreshToken,
        httpOnly: true,
        secure,
        sameSite: 'lax',
        path: '/api/auth',
        maxAge: REFRESH_MAX_AGE,
      });
    }

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
