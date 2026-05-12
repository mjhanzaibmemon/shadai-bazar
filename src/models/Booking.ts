import mongoose, { Schema, Document, Types } from 'mongoose';

/**
 * Rental Booking model.
 *
 * Lifecycle:
 *   requested → confirmed (seller accepts + buyer pays deposit)
 *     → active (dress dispatched) → returned (dress back)
 *     → completed (deposit returned) OR damage_claim
 *   declined / cancelled
 */

export type BookingStatus =
  | 'requested'
  | 'confirmed'
  | 'active'
  | 'returned'
  | 'completed'
  | 'damage_claim'
  | 'declined'
  | 'cancelled';

export interface IBooking extends Document {
  renter: Types.ObjectId;          // buyer
  owner: Types.ObjectId;           // seller
  listing: Types.ObjectId;

  // Dates
  startDate: Date;
  endDate: Date;
  numberOfDays: number;

  // Pricing
  rentPricePerDay: number;
  subtotal: number;                // days × price/day
  securityDeposit: number;         // refundable
  platformFee: number;
  totalAmount: number;

  // Address (where to pick up / deliver)
  deliveryAddress: {
    name: string;
    phone: string;
    city: string;
    area: string;
    fullAddress: string;
  };

  status: BookingStatus;

  // Payment
  paidAt?: Date;
  paymentTransactionId?: string;
  paymentMethod?: 'jazzcash' | 'easypaisa' | 'bank_transfer' | 'cod';

  // Dispatch/return
  dispatchedAt?: Date;
  returnedAt?: Date;

  // Damage / dispute
  damageClaim?: string;
  damageClaimImages?: string[];
  damageDeduction?: number;        // From deposit

  // Notes
  renterNote?: string;
  ownerResponse?: string;

  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    renter:  { type: Schema.Types.ObjectId, ref: 'User',    required: true },
    owner:   { type: Schema.Types.ObjectId, ref: 'User',    required: true },
    listing: { type: Schema.Types.ObjectId, ref: 'Listing', required: true },

    startDate:    { type: Date, required: true },
    endDate:      { type: Date, required: true },
    numberOfDays: { type: Number, required: true, min: 1 },

    rentPricePerDay: { type: Number, required: true },
    subtotal:        { type: Number, required: true },
    securityDeposit: { type: Number, default: 0 },
    platformFee:     { type: Number, default: 0 },
    totalAmount:     { type: Number, required: true },

    deliveryAddress: {
      name:        { type: String, required: true },
      phone:       { type: String, required: true },
      city:        { type: String, required: true },
      area:        { type: String, required: true },
      fullAddress: { type: String, required: true },
    },

    status: {
      type: String,
      enum: ['requested', 'confirmed', 'active', 'returned', 'completed', 'damage_claim', 'declined', 'cancelled'],
      default: 'requested',
    },

    paidAt:               { type: Date, default: null },
    paymentTransactionId: { type: String, default: null },
    paymentMethod:        { type: String, enum: ['jazzcash', 'easypaisa', 'bank_transfer', 'cod', null], default: null },

    dispatchedAt: { type: Date, default: null },
    returnedAt:   { type: Date, default: null },

    damageClaim:        { type: String, default: null },
    damageClaimImages:  { type: [String], default: [] },
    damageDeduction:    { type: Number, default: 0 },

    renterNote:    { type: String, default: null },
    ownerResponse: { type: String, default: null },
  },
  { timestamps: true }
);

bookingSchema.index({ renter: 1, status: 1 });
bookingSchema.index({ owner: 1, status: 1 });
bookingSchema.index({ listing: 1, startDate: 1, endDate: 1 });

export default mongoose.models.Booking || mongoose.model<IBooking>('Booking', bookingSchema);
