import mongoose, { Schema, Document, Types } from 'mongoose';

/**
 * Order model — implements the ESCROW / Buyer Protection flow.
 *
 * State machine:
 *   pending_payment → paid (held by platform)
 *     → shipped → delivered → buyer inspection window (3 days)
 *       → completed (release funds to seller)   OR
 *       → disputed → resolved_buyer / resolved_seller
 *     → cancelled (refund buyer)
 */

export type OrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'shipped'
  | 'delivered'
  | 'completed'
  | 'disputed'
  | 'resolved_buyer'
  | 'resolved_seller'
  | 'cancelled'
  | 'refunded';

export interface IOrder extends Document {
  buyer: Types.ObjectId;
  seller: Types.ObjectId;
  listing: Types.ObjectId;

  // Pricing
  amount: number;                  // Item price in PKR
  platformFee: number;             // Commission (typically 3-5%)
  shippingFee: number;
  totalAmount: number;             // buyer pays this

  // Payment
  paymentMethod: 'jazzcash' | 'easypaisa' | 'bank_transfer' | 'cod';
  paymentTransactionId?: string;
  paidAt?: Date;

  // Shipping
  shippingAddress: {
    name: string;
    phone: string;
    city: string;
    area: string;
    fullAddress: string;
  };
  courier?: 'tcs' | 'leopards' | 'mnp' | 'pickup';
  trackingNumber?: string;
  shippedAt?: Date;
  deliveredAt?: Date;

  // Escrow state
  status: OrderStatus;
  inspectionDeadline?: Date;       // 3 days after delivery
  buyerConfirmedAt?: Date;         // When buyer pressed "confirm received & happy"

  // Dispute
  disputeReason?: string;
  disputeImages?: string[];
  disputeOpenedAt?: Date;
  resolvedAt?: Date;
  resolvedBy?: Types.ObjectId;     // Admin
  resolutionNotes?: string;

  // Payout
  sellerPaidOut: boolean;
  sellerPayoutAt?: Date;
  sellerPayoutTxnId?: string;

  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    buyer:   { type: Schema.Types.ObjectId, ref: 'User',    required: true },
    seller:  { type: Schema.Types.ObjectId, ref: 'User',    required: true },
    listing: { type: Schema.Types.ObjectId, ref: 'Listing', required: true },

    amount:       { type: Number, required: true, min: 100 },
    platformFee:  { type: Number, default: 0 },
    shippingFee:  { type: Number, default: 0 },
    totalAmount:  { type: Number, required: true, min: 100 },

    paymentMethod: {
      type: String,
      enum: ['jazzcash', 'easypaisa', 'bank_transfer', 'cod'],
      required: true,
    },
    paymentTransactionId: { type: String, default: null },
    paidAt:               { type: Date, default: null },

    shippingAddress: {
      name:        { type: String, required: true },
      phone:       { type: String, required: true },
      city:        { type: String, required: true },
      area:        { type: String, required: true },
      fullAddress: { type: String, required: true },
    },
    courier:        { type: String, enum: ['tcs', 'leopards', 'mnp', 'pickup'], default: null },
    trackingNumber: { type: String, default: null },
    shippedAt:      { type: Date, default: null },
    deliveredAt:    { type: Date, default: null },

    status: {
      type: String,
      enum: [
        'pending_payment', 'paid', 'shipped', 'delivered',
        'completed', 'disputed', 'resolved_buyer', 'resolved_seller',
        'cancelled', 'refunded',
      ],
      default: 'pending_payment',
    },
    inspectionDeadline: { type: Date, default: null },
    buyerConfirmedAt:   { type: Date, default: null },

    disputeReason:    { type: String, default: null },
    disputeImages:    { type: [String], default: [] },
    disputeOpenedAt:  { type: Date, default: null },
    resolvedAt:       { type: Date, default: null },
    resolvedBy:       { type: Schema.Types.ObjectId, ref: 'User', default: null },
    resolutionNotes:  { type: String, default: null },

    sellerPaidOut:     { type: Boolean, default: false },
    sellerPayoutAt:    { type: Date, default: null },
    sellerPayoutTxnId: { type: String, default: null },
  },
  { timestamps: true }
);

orderSchema.index({ buyer: 1, status: 1 });
orderSchema.index({ seller: 1, status: 1 });
orderSchema.index({ status: 1, inspectionDeadline: 1 });

export default mongoose.models.Order || mongoose.model<IOrder>('Order', orderSchema);
