import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPayment extends Document {
  user: Types.ObjectId;
  listing: Types.ObjectId;
  amount: number;
  type: 'featured_listing';
  status: 'pending' | 'completed' | 'failed';
  transactionId?: string;
  paymentMethod?: string;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    listing: {
      type: Schema.Types.ObjectId,
      ref: 'Listing',
      required: [true, 'Listing is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [50, 'Amount must be at least 50'],
    },
    type: {
      type: String,
      enum: ['featured_listing'],
      default: 'featured_listing',
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    transactionId: {
      type: String,
      default: null,
    },
    paymentMethod: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Index for fast queries
paymentSchema.index({ user: 1 });
paymentSchema.index({ listing: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: -1 });

export default mongoose.models.Payment || mongoose.model<IPayment>('Payment', paymentSchema);
