import { NextResponse, type NextRequest } from 'next/server';
import connectMongodb from '@/lib/mongodb';
import PaymentForAdmin, {
  type IPaymentForAdmin,
  type PaymentAdminStatus,
} from '@/models/paymentForAdminSchema';

// ============================================================================
// Helpers
// ============================================================================

function toNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toStringValue(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value.trim() : fallback;
}

function toDateValue(value: unknown): Date {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }
  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  return new Date();
}

function normalizeStatus(value: unknown): PaymentAdminStatus {
  const allowed: PaymentAdminStatus[] = [
    'VALID',
    'VALIDATED',
    'FAILED',
    'PENDING',
    'CANCELLED',
  ];
  const upper = toStringValue(value).toUpperCase() as PaymentAdminStatus;
  return allowed.includes(upper) ? upper : 'PENDING';
}

async function parseRequestBody(
  request: NextRequest
): Promise<Record<string, unknown>> {
  const contentType = request.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    const json: unknown = await request.json();
    return typeof json === 'object' && json !== null
      ? (json as Record<string, unknown>)
      : {};
  }

  if (
    contentType.includes('application/x-www-form-urlencoded') ||
    contentType.includes('multipart/form-data')
  ) {
    const formData = await request.formData();
    return Object.fromEntries(formData.entries());
  }

  const textData = await request.text();
  if (!textData.trim()) {
    return {};
  }

  try {
    const parsed: unknown = JSON.parse(textData);
    return typeof parsed === 'object' && parsed !== null
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    const params = new URLSearchParams(textData);
    return Object.fromEntries(params.entries());
  }
}

// ============================================================================
// Route Handler: POST
// ============================================================================

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const paymentData = await parseRequestBody(request);

    if (Object.keys(paymentData).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid payment data received' },
        { status: 400 }
      );
    }

    const tranId = toStringValue(paymentData.tran_id);
    if (!tranId) {
      return NextResponse.json(
        { success: false, error: 'Missing transaction ID (tran_id)' },
        { status: 400 }
      );
    }

    const normalizedPayment: Omit<IPaymentForAdmin, 'createdAt' | 'updatedAt'> = {
      tran_id: tranId,
      val_id: toStringValue(paymentData.val_id),
      bank_tran_id: toStringValue(paymentData.bank_tran_id),

      amount: toNumber(paymentData.amount),
      store_amount: toNumber(paymentData.store_amount),
      currency: toStringValue(paymentData.currency, 'BDT'),
      currency_amount: paymentData.currency_amount
        ? toNumber(paymentData.currency_amount)
        : undefined,
      currency_rate: toNumber(paymentData.currency_rate, 1.0),
      base_fair: toNumber(paymentData.base_fair, 0),

      card_type: toStringValue(paymentData.card_type),
      card_issuer: toStringValue(paymentData.card_issuer),
      card_brand: toStringValue(paymentData.card_brand),
      card_sub_brand: toStringValue(paymentData.card_sub_brand) || undefined,
      card_no: toStringValue(paymentData.card_no) || undefined,
      card_issuer_country: toStringValue(paymentData.card_issuer_country),
      card_issuer_country_code: toStringValue(
        paymentData.card_issuer_country_code
      ),

      status: normalizeStatus(paymentData.status),
      error: toStringValue(paymentData.error),
      store_id: toStringValue(paymentData.store_id),
      tran_date: toDateValue(paymentData.tran_date),

      verify_sign: toStringValue(paymentData.verify_sign),
      verify_sign_sha2: toStringValue(paymentData.verify_sign_sha2),
      verify_key: toStringValue(paymentData.verify_key) || undefined,

      value_a: toStringValue(paymentData.value_a) || undefined,
      value_b: toStringValue(paymentData.value_b) || undefined,
      value_c: toStringValue(paymentData.value_c) || undefined,
      value_d: toStringValue(paymentData.value_d) || undefined,

      risk_level: toStringValue(paymentData.risk_level, '0'),
      risk_title: toStringValue(paymentData.risk_title, 'Safe'),
      subscription_id: toStringValue(paymentData.subscription_id),
    };

    // Save or update transaction idempotently
    await connectMongodb();
    await PaymentForAdmin.findOneAndUpdate(
      { tran_id: tranId },
      { $set: normalizedPayment },
      { upsert: true, new: true, runValidators: true }
    );

    // Redirect browser using 303 See Other (converts POST -> GET)
    const origin =
      process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;
    const redirectUrl = new URL('/payment/statement', origin);

    return NextResponse.redirect(redirectUrl, 303);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Unknown payment error';

    console.error('Payment processing error:', {
      message,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Payment processing failed',
        details: process.env.NODE_ENV === 'development' ? message : undefined,
      },
      { status: 500 }
    );
  }
}
