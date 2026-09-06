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
        'x-djelis-raw-body': Buffer.from(rawBody, 'utf8').toString('base64'),
      },
      body: rawBody,
    });

    if (!res.ok) {
      console.error('Wave webhook: backend forwarding failed', res.status, await res.text().catch(() => ''));
      return NextResponse.json({ error: 'Webhook forwarding failed' }, { status: 502 });
    }

    const responseData = await res.json();
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Wave webhook: processing error', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
