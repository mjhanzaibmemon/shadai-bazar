import mongoose, { Schema, Document, Types } from 'mongoose';
import { CITIES } from '@/lib/constants';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  city: string;
  avatar?: string;
  role: 'user' | 'admin';

  // Suspension
  isSuspended: boolean;

  // ── CNIC Verification (Trust) ─────────────────
  isVerified: boolean;
  verification: {
    cnicNumber?: string;            // 13-digit Pakistani CNIC
    cnicFrontImage?: string;        // Cloudinary URL or base64
    cnicBackImage?: string;
    selfieWithCnic?: string;
    status: 'unverified' | 'pending' | 'approved' | 'rejected';
    rejectionReason?: string;
    submittedAt?: Date;
    approvedAt?: Date;
    approvedBy?: Types.ObjectId;
  };

  // ── Wedding Profile (countdown + budget) ──────
  weddingProfile?: {
    weddingDate?: Date;
    role: 'bride' | 'groom' | 'family' | 'guest' | 'none';
    budget?: number;
    spent?: number;
    shareToken?: string;            // For family sharing
  };

  // ── Wishlist ─────────────────────────────────
  wishlist: Types.ObjectId[];        // Listing IDs

  // ── Language preference ──────────────────────
  language: 'en' | 'ur';

  // ── Push notification token ──────────────────
  pushSubscription?: string;          // JSON-stringified Web Push subscription

  // ── Email verification ───────────────────────
  isEmailVerified: boolean;
  emailVerifyToken?: string;
  emailVerifyTokenExpiry?: Date;

  // ── Password reset ───────────────────────────
  passwordResetToken?: string;
  passwordResetTokenExpiry?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      match: [/^(\+92|0)?[0-9]{10}$/, 'Please enter a valid Pakistani phone number'],
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      enum: CITIES as unknown as string[],
    },
    avatar:      { type: String, default: null },
    role:        { type: String, enum: ['user', 'admin'], default: 'user' },
    isSuspended: { type: Boolean, default: false },

    // Verification
    isVerified: { type: Boolean, default: false },
    verification: {
      cnicNumber:       { type: String, default: null },
      cnicFrontImage:   { type: String, default: null },
      cnicBackImage:    { type: String, default: null },
      selfieWithCnic:   { type: String, default: null },
      status: {
        type: String,
        enum: ['unverified', 'pending', 'approved', 'rejected'],
        default: 'unverified',
      },
      rejectionReason: { type: String, default: null },
      submittedAt:     { type: Date,   default: null },
      approvedAt:      { type: Date,   default: null },
      approvedBy:      { type: Schema.Types.ObjectId, ref: 'User', default: null },
    },

    // Wedding profile
    weddingProfile: {
      weddingDate: { type: Date, default: null },
      role: {
        type: String,
        enum: ['bride', 'groom', 'family', 'guest', 'none'],
        default: 'none',
      },
      budget:     { type: Number, default: 0 },
      spent:      { type: Number, default: 0 },
      shareToken: { type: String, default: null, index: true },
    },

    // Wishlist
    wishlist: [{ type: Schema.Types.ObjectId, ref: 'Listing' }],

    // Language
    language: { type: String, enum: ['en', 'ur'], default: 'en' },

    // Push subscription
    pushSubscription: { type: String, default: null },

    // Email verification
    isEmailVerified:         { type: Boolean, default: false },
    emailVerifyToken:        { type: String,  default: null, index: true },
    emailVerifyTokenExpiry:  { type: Date,    default: null },

    // Password reset
    passwordResetToken:        { type: String, default: null, index: true },
    passwordResetTokenExpiry:  { type: Date,   default: null },
  },
  { timestamps: true }
);

// Indexes
userSchema.index({ 'verification.status': 1 });
userSchema.index({ 'weddingProfile.shareToken': 1 });

export default mongoose.models.User || mongoose.model<IUser>('User', userSchema);
