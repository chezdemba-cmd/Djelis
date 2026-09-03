import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('wave-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    }

    const secret = process.env.WAVE_WEBHOOK_SECRET;
    
    if (!secret) {
      return NextResponse.json({ error: 'Webhook secret is not configured' }, { status: 500 });
    }

    const hmac = crypto.createHmac('sha256', secret);
    const expectedSignature = hmac.update(rawBody).digest('hex');

    // Use constant-time comparison to prevent timing attacks
    const signatureBuffer = Buffer.from(signature, 'hex');
    const expectedSignatureBuffer = Buffer.from(expectedSignature, 'hex');

    if (
      signatureBuffer.length !== expectedSignatureBuffer.length ||
      !crypto.timingSafeEqual(signatureBuffer, expectedSignatureBuffer)
    ) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Forward the verified webhook payload to NestJS backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const res = await fetch(`${backendUrl}/api/v1/payments/webhooks/wave`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'wave-signature': signature,
      },
      body: rawBody,
    });

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json(
        { error: 'Forwarding webhook to backend failed', details: errorText },
        { status: res.status }
      );
    }

    const responseData = await res.json();
    return NextResponse.json(responseData);
  } catch (error) {
    return NextResponse.json({ error: 'Webhook processing failed', message: error.message }, { status: 500 });
  }
}
