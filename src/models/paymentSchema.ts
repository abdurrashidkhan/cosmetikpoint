import mongoose, { Schema, type Model } from 'mongoose';

// ============================================================================
// Interfaces
// ============================================================================

export interface IPayment {
  // 1. Transaction Identifiers
  tran_id: string;
  val_id: string;
  bank_tran_id: string;

  // 2. Customer & Amount
  email: string;
  amount: number;
  currency: string;

  // 3. Payment Method & Status
  card_type: string;
  card_issuer: string;
  card_brand: string;
  card_issuer_country: string;
  status: string;
  risk_title: string;

  // 4. Timing
  tran_date: Date;
  timestamp: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

// ============================================================================
// Main Schema
// ============================================================================

const paymentSchema = new Schema<IPayment>(
  {
    // 1. Transaction Identifiers
    tran_id: { type: String, required: true, trim: true, index: true },
    val_id: { type: String, required: true, trim: true }, // Fixed: String (not Date)
    bank_tran_id: { type: String, required: true, trim: true },

    // 2. Customer & Amount
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'BDT', trim: true },

    // 3. Payment Method & Status
    card_type: { type: String, required: true, trim: true },
    card_issuer: { type: String, required: true, trim: true },
    card_brand: { type: String, required: true, trim: true },
    card_issuer_country: { type: String, required: true, trim: true },
    status: { type: String, required: true, trim: true, index: true },
    risk_title: { type: String, required: true, trim: true },

    // 4. Timing
    tran_date: { type: Date, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

const Payment: Model<IPayment> =
  (mongoose.models.payment as Model<IPayment>) ||
  mongoose.model<IPayment>('payment', paymentSchema);

export default Payment;
