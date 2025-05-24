import { NextResponse } from 'next/server';
import { createPaymentIntent } from '@/services/stripe';

export async function POST(request: Request) {
  try {
    const { amount, currency } = await request.json();

    if (!amount) {
      return NextResponse.json(
        { error: 'Le montant est requis' },
        { status: 400 }
      );
    }

    const { clientSecret, paymentIntentId } = await createPaymentIntent(
      amount,
      currency
    );

    return NextResponse.json({
      clientSecret,
      paymentIntentId,
    });
  } catch (error) {
    console.error('Erreur lors de la création du PaymentIntent:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du paiement' },
      { status: 500 }
    );
  }
} 