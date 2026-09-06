import { NextResponse } from 'next/server';

/**
 * Proxy de webhook CinetPay.
 *
 * La vérification de signature (`x-token` = HMAC-SHA256 d'une concaténation de
 * champs POST précis) est faite côté backend NestJS (source unique de vérité,
 * cf. backend/src/payments/webhook-signature.ts). Cette route relaie la requête
 * telle quelle, en conservant le Content-Type d'origine
 * (`application/x-www-form-urlencoded`) pour que le backend parse les champs.
 *
 * NB : en production, le `notify_url` transmis à CinetPay pointe directement sur
 * le backend ; ce proxy ne sert que si CinetPay est configuré vers le domaine web.
 */
export async function POST(request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-token');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    }

    const contentType =
      request.headers.get('content-type') || 'application/x-www-form-urlencoded';

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const res = await fetch(`${backendUrl}/api/v1/payments/webhooks/cinetpay`, {
      method: 'POST',
      headers: {
        'Content-Type': contentType,
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
