import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-token');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    }

    const secret = process.env.CINETPAY_SECRET;
    if (!secret) {
      return NextResponse.json({ error: 'Webhook secret is not configured' }, { status: 500 });
    }
    const hmac = crypto.createHmac('sha256', secret);
    const expectedSignature = hmac.update(rawBody).digest('hex');

    const signatureBuffer = /^[0-9a-f]+$/i.test(signature) ? Buffer.from(signature, 'hex') : Buffer.alloc(0);
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');
    if (signatureBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Forward the verified webhook payload to NestJS backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const res = await fetch(`${backendUrl}/api/v1/payments/webhooks/cinetpay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-token': signature,
        'x-djelis-raw-body': Buffer.from(rawBody, 'utf8').toString('base64'),
      },
      body: rawBody,
    });

    if (!res.ok) {
      console.error('CinetPay webhook: backend forwarding failed', res.status, await res.text().catch(() => ''));
      return NextResponse.json({ error: 'Webhook forwarding failed' }, { status: 502 });
    }

    const responseData = await res.json();
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('CinetPay webhook: processing error', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
