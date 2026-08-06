import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { token } = await request.json();
    if (!token) {
      return NextResponse.json({ error: 'Token missing' }, { status: 400 });
    }

    const response = NextResponse.json({ success: true });
    
    // Set HttpOnly cookie
    response.cookies.set({
      name: 'accessToken',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 15 // 15 minutes (match backend)
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
