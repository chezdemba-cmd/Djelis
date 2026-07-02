import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('wave-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    }

    const secret = process.env.WAVE_WEBHOOK_SECRET || 'default-secret';
    const hmac = crypto.createHmac('sha256', secret);
    const expectedSignature = hmac.update(rawBody).digest('hex');

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const body = JSON.parse(rawBody);
    
    // TODO: Verify transaction details
    // TODO: Update subscription in Supabase using Prisma/Supabase client

    return NextResponse.json({ status: 'success', message: 'Wave Webhook processed' });
  } catch (error) {
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
