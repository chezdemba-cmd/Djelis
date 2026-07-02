import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-token');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    }

    const secret = process.env.CINETPAY_SECRET_KEY || 'default-secret';
    const hmac = crypto.createHmac('sha256', secret);
    const expectedSignature = hmac.update(rawBody).digest('hex');

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const body = JSON.parse(rawBody);
    
    // TODO: Verify transaction status with CinetPay API
    // TODO: Update subscription in Supabase using Prisma/Supabase client

    return NextResponse.json({ status: 'success', message: 'Webhook processed' });
  } catch (error) {
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
