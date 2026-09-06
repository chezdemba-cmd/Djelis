import { NextResponse } from 'next/server';

/**
 * Proxy de webhook Wave.
 *
 * La vérification de signature (`Wave-Signature`) est faite côté backend NestJS
 * (source unique de vérité, cf. backend/src/payments/webhook-signature.ts) :
 * cette route se contente de relayer le corps brut et l'en-tête de signature
 * sans le modifier.
 */
export async function POST(request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('wave-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
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
