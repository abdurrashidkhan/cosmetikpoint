import mongoose, { Schema, type Model } from 'mongoose';

// ============================================================================
// Types & Interfaces
// ============================================================================

export type PaymentAdminStatus = 'VALID' | 'VALIDATED' | 'FAILED' | 'PENDING' | 'CANCELLED';

export interface IPaymentForAdmin {
  // 1. Transaction Identifiers
  tran_id: string;
  val_id: string;
  bank_tran_id: string;

  // 2. Payment Information
  amount: number;
  store_amount: number;
  currency: string;
  currency_amount?: number;
  currency_rate: number;
  base_fair: number;

  // 3. Payment Method Details
  card_type: string;
  card_issuer: string;
  card_brand: string;
  card_sub_brand?: string;
  card_no?: string;
  card_issuer_country: string;
  card_issuer_country_code: string;

  // 4. Transaction Status & Timing
  status: PaymentAdminStatus;
  error: string;
  store_id: string;
  tran_date: Date;

  // 5. Gateway Verification
  verify_sign: string;
  verify_sign_sha2: string;
  verify_key?: string;

  // 6. Custom References
  value_a?: string;
  value_b?: string;
  value_c?: string;
  value_d?: string;

  // 7. Risk Assessment & Subscription
  risk_level: string;
  risk_title: string;
  subscription_id: string;

  createdAt?: Date;
  updatedAt?: Date;
}

// ============================================================================
// Main Schema
// ============================================================================

const paymentForAdminSchema = new Schema<IPaymentForAdmin>(
  {
    // 1. Transaction Identifiers
    tran_id: { type: String, required: true, unique: true, trim: true },
    val_id: { type: String, required: true, trim: true, index: true },
    bank_tran_id: { type: String, required: true, trim: true },

    // 2. Payment Information
    amount: { type: Number, required: true, min: 0 },
    store_amount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, default: 'BDT', trim: true },
    currency_amount: { type: Number, min: 0 },
    currency_rate: { type: Number, default: 1.0, min: 0 },
    base_fair: { type: Number, default: 0, min: 0 },

    // 3. Payment Method Details
    card_type: { type: String, required: true, trim: true },
    card_issuer: { type: String, required: true, trim: true },
    card_brand: { type: String, required: true, trim: true },
    card_sub_brand: { type: String, trim: true },
    card_no: { type: String, trim: true },
    card_issuer_country: { type: String, required: true, trim: true },
    card_issuer_country_code: { type: String, required: true, trim: true },

    // 4. Transaction Status & Timing
    status: {
      type: String,
      required: true,
      enum: ['VALID', 'VALIDATED', 'FAILED', 'PENDING', 'CANCELLED'],
      index: true,
    },
    error: { type: String, default: '' },
    store_id: { type: String, required: true, trim: true },
    tran_date: { type: Date, required: true },

    // 5. Gateway Verification
    verify_sign: { type: String, required: true },
    verify_sign_sha2: { type: String, required: true },
    verify_key: { type: String },

    // 6. Custom References
    value_a: { type: String, trim: true },
    value_b: { type: String, trim: true },
    value_c: { type: String, trim: true },
    value_d: { type: String, trim: true },

    // 7. Risk Assessment & Subscription
    risk_level: { type: String, default: '0' },
    risk_title: { type: String, default: 'Safe' },
    subscription_id: { type: String, default: '' },
  },
  {
    timestamps: true,
  },
);

const PaymentForAdmin: Model<IPaymentForAdmin> =
  (mongoose.models.paymentForAdmin as Model<IPaymentForAdmin>) ||
  mongoose.model<IPaymentForAdmin>('paymentForAdmin', paymentForAdminSchema);

export default PaymentForAdmin;
