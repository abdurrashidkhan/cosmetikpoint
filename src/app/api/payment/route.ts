import { randomBytes } from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';

// ============================================================================
// Interfaces
// ============================================================================

interface PaymentInitRequestBody {
  totalPrice?: number | string;
  email?: string;
  customerName?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postcode?: string | number;
  productName?: string;
  productCategory?: string;
  orderId?: string;
}

interface SSLCommerzInitResponse {
  status?: string;
  failedreason?: string;
  GatewayPageURL?: string;
  sessionkey?: string;
}

// ============================================================================
// Route Handler: POST
// ============================================================================

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const storeId = process.env.STORE_ID;
    const storePasswd = process.env.STORE_PASSWORD;

    if (!storeId || !storePasswd) {
      console.error('Missing STORE_ID or STORE_PASSWORD environment variables.');
      return NextResponse.json(
        { success: false, message: 'Payment gateway configuration error' },
        { status: 500 }
      );
    }

    const body = (await request.json()) as PaymentInitRequestBody;
    const totalAmount = Number(body.totalPrice);

    if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid totalPrice amount' },
        { status: 400 }
      );
    }

    const customerEmail = body.email?.trim();
    if (!customerEmail) {
      return NextResponse.json(
        { success: false, message: 'Customer email is required' },
        { status: 400 }
      );
    }

    const baseUrl =
      process.env.BASE_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      request.nextUrl.origin;

    // 24-character hex transaction ID (within SSLCommerz 30-char limit)
    const tranId = randomBytes(12).toString('hex');

    const payload = new URLSearchParams({
      store_id: storeId,
      store_passwd: storePasswd,
      total_amount: totalAmount.toFixed(2),
      currency: 'BDT',
      tran_id: tranId,

      // Callback URLs
      success_url: `${baseUrl}/api/payment/success-payment`,
      fail_url: `${baseUrl}/payment/fail`,
      cancel_url: `${baseUrl}/payment/cancel`,
      ipn_url: `${baseUrl}/api/payment/ipn-payment-success`,

      // Customer Information
      cus_name: body.customerName?.trim() || 'Cosmetik Point Customer',
      cus_email: customerEmail,
      cus_add1: body.address?.trim() || 'Dhaka',
      cus_add2: 'Bangladesh',
      cus_city: body.city?.trim() || 'Dhaka',
      cus_state: body.state?.trim() || 'Dhaka',
      cus_postcode: String(body.postcode ?? '1000'),
      cus_country: 'Bangladesh',
      cus_phone: body.phone?.trim() || '01700000000',
      cus_fax: body.phone?.trim() || '01700000000',

      // Product & Shipping Information (Cosmetik Point)
      shipping_method: 'NO',
      product_name: body.productName?.trim() || 'Cosmetik Point Beauty Order',
      product_category: body.productCategory?.trim() || 'Cosmetics & Skincare',
      product_profile: 'general',
      multi_card_name: 'mastercard, visacard, amexcard',

      // Custom References
      value_a: body.orderId?.trim() || 'Cosmetik Point',
      value_b: customerEmail,
      value_c: 'BDT',
      value_d: 'online-order',
    });

    const sslcommerzUrl =
      process.env.SSLCOMMERZ_IS_LIVE === 'true'
        ? 'https://securepay.sslcommerz.com/gwprocess/v4/api.php'
        : 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php';

    const gatewayResponse = await fetch(sslcommerzUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: payload.toString(),
      cache: 'no-store',
    });

    if (!gatewayResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to connect to SSLCommerz gateway',
        },
        { status: 502 }
      );
    }

    const data = (await gatewayResponse.json()) as SSLCommerzInitResponse;

    if (data.status !== 'SUCCESS' || !data.GatewayPageURL) {
      return NextResponse.json(
        {
          success: false,
          message: data.failedreason || 'Payment session initiation failed',
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      {
        status: 200,
        message: 'Payment initiated successfully',
        success: true,
        tranId,
        gatewayUrl: data.GatewayPageURL,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Internal Server Error';
    console.error('Error initiating payment:', message);

    return NextResponse.json(
      {
        status: false,
        success: false,
        message: 'Internal Server Error',
        details: process.env.NODE_ENV === 'development' ? message : undefined,
      },
      { status: 500 }
    );
  }
}
