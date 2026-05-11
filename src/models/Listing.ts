import mongoose, { Schema, Document, Types } from 'mongoose';
import {
  ALL_CATEGORY_IDS,
  ALL_SUB_CATEGORY_IDS,
  FABRICS,
  OCCASIONS,
  WORK_TYPES,
  BRANDS,
  SIZE_LABELS,
} from '@/lib/constants';

const OCCASION_IDS = OCCASIONS.map((o) => o.id);
const SIZE_IDS     = SIZE_LABELS.map((s) => s.id);

export interface IListing extends Document {
  title: string;
  description: string;

  // Categorization
  category: string;          // e.g. 'bridal'
  subCategory?: string;      // e.g. 'bridal-lehenga'
  occasion?: string[];       // ['barat', 'walima']  — multi-select
  gender?: 'women' | 'men' | 'kids' | 'unisex';

  // Pricing
  price: number;
  originalPrice?: number;
  listingType: 'sell' | 'rent' | 'both';
  rentPricePerDay?: number;
  rentDuration?: number;     // default rental days

  // Product details
  condition: string;
  fabric: string;
  workType?: string;
  brand?: string;
  color?: string;
  sizeLabel?: string;        // 'M', 'L', 'CUSTOM'
  size: {
    bust?: number;
    chest?: number;
    waist?: number;
    hip?: number;
    shoulder?: number;
    sleeve?: number;
    length?: number;         // shirt/kurta length
    bottomLength?: number;   // lehenga/trouser length
    armhole?: number;
    neckDepth?: number;
    neck?: number;
    inseam?: number;
  };

  // Media
  images: string[];

  // Disclosure (TRUST!)
  defects?: string;
  damageDisclosed: boolean;  // Mandatory — seller must confirm
  hasOriginalReceipt?: boolean;

  // Location & delivery
  city: string;
  area?: string;
  deliveryOptions?: string[];

  // Seller & meta
  seller: Types.ObjectId;
  featured: boolean;
  isFeatured?: boolean;
  featuredUntil?: Date;
  views: number;
  status: 'active' | 'paused' | 'sold' | 'rented';

  createdAt: Date;
  updatedAt: Date;
}

const listingSchema = new Schema<IListing>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      minlength: [20, 'Description must be at least 20 characters'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },

    // ── Categorization ────────────────────────────────
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ALL_CATEGORY_IDS as unknown as string[],
    },
    subCategory: {
      type: String,
      enum: [...(ALL_SUB_CATEGORY_IDS as unknown as string[]), null],
      default: null,
    },
    occasion: {
      type: [String],
      enum: OCCASION_IDS,
      default: [],
    },
    gender: {
      type: String,
      enum: ['women', 'men', 'kids', 'unisex'],
      default: 'women',
    },

    // ── Pricing ───────────────────────────────────────
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [100, 'Price must be at least Rs. 100'],
    },
    originalPrice: { type: Number, default: null },
    listingType: {
      type: String,
      enum: ['sell', 'rent', 'both'],
      default: 'sell',
    },
    rentPricePerDay: { type: Number, default: null },
    rentDuration:    { type: Number, default: null },

    // ── Product details ───────────────────────────────
    condition: {
      type: String,
      required: [true, 'Condition is required'],
      enum: ['new_with_tags', 'unworn_no_tags', 'worn_once', 'worn_few_times', 'minor_alterations'],
    },
    fabric: {
      type: String,
      required: [true, 'Fabric type is required'],
      enum: FABRICS as unknown as string[],
    },
    workType: { type: String, enum: [...(WORK_TYPES as unknown as string[]), null], default: null },
    brand:    { type: String, enum: [...(BRANDS as unknown as string[]), null], default: null },
    color:    { type: String, default: null },
    sizeLabel:{ type: String, enum: [...SIZE_IDS, null], default: null },
    size: {
      bust:         { type: Number, default: null },
      chest:        { type: Number, default: null },
      waist:        { type: Number, default: null },
      hip:          { type: Number, default: null },
      shoulder:     { type: Number, default: null },
      sleeve:       { type: Number, default: null },
      length:       { type: Number, default: null },
      bottomLength: { type: Number, default: null },
      armhole:      { type: Number, default: null },
      neckDepth:    { type: Number, default: null },
      neck:         { type: Number, default: null },
      inseam:       { type: Number, default: null },
    },

    // ── Media ────────────────────────────────────────
    images: {
      type: [String],
      required: [true, 'At least one image is required'],
      validate: {
        validator: function (v: string[]) {
          return v && v.length >= 1 && v.length <= 10;
        },
        message: 'Images must be between 1 and 10',
      },
    },

    // ── Disclosure (Trust) ────────────────────────────
    defects: { type: String, default: null },
    damageDisclosed: {
      type: Boolean,
      required: [true, 'Damage disclosure is required'],
      default: false,
    },
    hasOriginalReceipt: { type: Boolean, default: false },

    // ── Location & delivery ───────────────────────────
    city: {
      type: String,
      required: [true, 'City is required'],
    },
    area: { type: String, default: null },
    deliveryOptions: { type: [String], default: ['pickup'] },

    // ── Seller & meta ─────────────────────────────────
    seller: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Seller is required'],
    },
    featured:      { type: Boolean, default: false },
    isFeatured:    { type: Boolean, default: false },
    featuredUntil: { type: Date,    default: null },
    views:         { type: Number,  default: 0 },
    status: {
      type: String,
      enum: ['active', 'paused', 'sold', 'rented'],
      default: 'active',
    },
  },
  { timestamps: true }
);

// Indexes for fast queries
listingSchema.index({ category: 1, subCategory: 1, city: 1, status: 1 });
listingSchema.index({ seller: 1 });
listingSchema.index({ createdAt: -1 });
listingSchema.index({ featured: 1, status: 1 });
listingSchema.index({ occasion: 1 });
listingSchema.index({ color: 1 });
listingSchema.index({ brand: 1 });
// Text index for search
listingSchema.index({ title: 'text', description: 'text', brand: 'text' });

export default mongoose.models.Listing || mongoose.model<IListing>('Listing', listingSchema);
