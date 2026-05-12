import mongoose, { Schema, Document, Types } from 'mongoose';

/**
 * SHAADI SAHARA — Social impact donation system.
 *
 * Two types of records:
 *   1. DonationListing  — A donated dress available for free.
 *   2. DonationRequest  — A low-income bride applying for a dress.
 *
 * Workflow:
 *   1. Donor posts dress as donation (verified seller required)
 *   2. Recipient applies (Edhi/JDC/similar verification)
 *   3. Admin reviews & matches
 *   4. Dress shipped to recipient (free + platform covers courier)
 */

// ── Donation Listing ─────────────────────────────────────────
export interface IDonationListing extends Document {
  donor: Types.ObjectId;
  listing?: Types.ObjectId;        // Link to original listing (optional)

  title: string;
  description: string;
  category: string;
  subCategory?: string;
  sizeLabel?: string;
  images: string[];
  city: string;

  // Status
  status: 'available' | 'matched' | 'shipped' | 'delivered' | 'withdrawn';
  matchedRequest?: Types.ObjectId;
  matchedAt?: Date;
  deliveredAt?: Date;

  // Social impact tracking
  estimatedValue: number;          // For donor's tax/CSR records

  createdAt: Date;
  updatedAt: Date;
}

const donationListingSchema = new Schema<IDonationListing>(
  {
    donor:   { type: Schema.Types.ObjectId, ref: 'User',    required: true },
    listing: { type: Schema.Types.ObjectId, ref: 'Listing', default: null },

    title:       { type: String, required: true, minlength: 5,  maxlength: 100 },
    description: { type: String, required: true, minlength: 20, maxlength: 2000 },
    category:    { type: String, required: true },
    subCategory: { type: String, default: null },
    sizeLabel:   { type: String, default: null },
    images:      { type: [String], required: true },
    city:        { type: String, required: true },

    status: {
      type: String,
      enum: ['available', 'matched', 'shipped', 'delivered', 'withdrawn'],
      default: 'available',
    },
    matchedRequest: { type: Schema.Types.ObjectId, ref: 'DonationRequest', default: null },
    matchedAt:      { type: Date, default: null },
    deliveredAt:    { type: Date, default: null },

    estimatedValue: { type: Number, default: 0 },
  },
  { timestamps: true }
);

donationListingSchema.index({ status: 1, city: 1 });
donationListingSchema.index({ donor: 1 });

// ── Donation Request ─────────────────────────────────────────
export interface IDonationRequest extends Document {
  applicant: Types.ObjectId;

  // Personal info
  fullName: string;
  cnicNumber: string;
  phone: string;
  city: string;
  fullAddress: string;

  // Story & verification
  story: string;                    // Why does she need help
  weddingDate: Date;
  monthlyIncome?: number;
  familySize?: number;
  referenceNgo?: 'edhi' | 'jdc' | 'akhuwat' | 'other' | 'none';
  referenceContact?: string;
  supportingDocuments: string[];   // Income proof, NGO letter

  // What she needs
  neededCategories: string[];      // ['bridal', 'jewelry']
  sizePreferences?: {
    sizeLabel?: string;
    bust?: number;
    waist?: number;
    hip?: number;
  };
  colorPreferences?: string[];

  // Admin review
  status: 'pending_review' | 'approved' | 'rejected' | 'matched' | 'fulfilled' | 'closed';
  reviewedBy?: Types.ObjectId;
  reviewNotes?: string;
  matchedListing?: Types.ObjectId; // DonationListing
  matchedAt?: Date;
  fulfilledAt?: Date;

  // Privacy
  isPubliclyVisible: boolean;       // Only show name + city + story, hide CNIC

  createdAt: Date;
  updatedAt: Date;
}

const donationRequestSchema = new Schema<IDonationRequest>(
  {
    applicant: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    fullName:     { type: String, required: true, trim: true },
    cnicNumber:   { type: String, required: true, match: /^[0-9]{5}-?[0-9]{7}-?[0-9]$/ },
    phone:        { type: String, required: true },
    city:         { type: String, required: true },
    fullAddress:  { type: String, required: true },

    story:        { type: String, required: true, minlength: 50, maxlength: 2000 },
    weddingDate:  { type: Date, required: true },
    monthlyIncome:{ type: Number, default: null },
    familySize:   { type: Number, default: null },
    referenceNgo: { type: String, enum: ['edhi', 'jdc', 'akhuwat', 'other', 'none'], default: 'none' },
    referenceContact:    { type: String, default: null },
    supportingDocuments: { type: [String], default: [] },

    neededCategories:  { type: [String], default: [] },
    sizePreferences: {
      sizeLabel: { type: String, default: null },
      bust:      { type: Number, default: null },
      waist:     { type: Number, default: null },
      hip:       { type: Number, default: null },
    },
    colorPreferences: { type: [String], default: [] },

    status: {
      type: String,
      enum: ['pending_review', 'approved', 'rejected', 'matched', 'fulfilled', 'closed'],
      default: 'pending_review',
    },
    reviewedBy:     { type: Schema.Types.ObjectId, ref: 'User', default: null },
    reviewNotes:    { type: String, default: null },
    matchedListing: { type: Schema.Types.ObjectId, ref: 'DonationListing', default: null },
    matchedAt:      { type: Date, default: null },
    fulfilledAt:    { type: Date, default: null },

    isPubliclyVisible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

donationRequestSchema.index({ status: 1, city: 1 });
donationRequestSchema.index({ applicant: 1 });
donationRequestSchema.index({ weddingDate: 1 });

// Export both models
export const DonationListing =
  (mongoose.models.DonationListing as mongoose.Model<IDonationListing>) ||
  mongoose.model<IDonationListing>('DonationListing', donationListingSchema);

export const DonationRequest =
  (mongoose.models.DonationRequest as mongoose.Model<IDonationRequest>) ||
  mongoose.model<IDonationRequest>('DonationRequest', donationRequestSchema);
