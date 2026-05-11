import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IListing extends Document {
  title: string;
  description: string;
  category: string;
  price: number;
  originalPrice?: number;
  condition: string;
  fabric: string;
  size: {
    chest?: number;
    waist?: number;
    hip?: number;
    length?: number;
    shoulder?: number;
  };
  images: string[];
  defects?: string;
  city: string;
  seller: Types.ObjectId;
  featured: boolean;
  isFeatured?: boolean;
  featuredUntil?: Date;
  views: number;
  status: 'active' | 'paused' | 'sold';
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
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['bridal', 'groom-wear', 'formal-party', 'casual-ethnic', 'kids', 'accessories'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [100, 'Price must be at least 100'],
    },
    originalPrice: {
      type: Number,
      default: null,
    },
    condition: {
      type: String,
      required: [true, 'Condition is required'],
      enum: ['new_with_tags', 'worn_once', 'worn_few_times', 'minor_alterations'],
    },
    fabric: {
      type: String,
      required: [true, 'Fabric type is required'],
      enum: [
        'Silk',
        'Chiffon',
        'Banarsi',
        'Organza',
        'Velvet',
        'Georgette',
        'Net',
        'Cotton',
        'Lawn',
        'Khaddar',
        'Jamawar',
      ],
    },
    size: {
      chest: { type: Number, default: null },
      waist: { type: Number, default: null },
      hip: { type: Number, default: null },
      length: { type: Number, default: null },
      shoulder: { type: Number, default: null },
    },
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
    defects: {
      type: String,
      default: null,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
    },
    seller: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Seller is required'],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    featuredUntil: {
      type: Date,
      default: null,
    },
    views: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'paused', 'sold'],
      default: 'active',
    },
  },
  { timestamps: true }
);

// Index for fast queries
listingSchema.index({ category: 1, city: 1, status: 1 });
listingSchema.index({ seller: 1 });
listingSchema.index({ createdAt: -1 });
listingSchema.index({ featured: 1, status: 1 });

export default mongoose.models.Listing || mongoose.model<IListing>('Listing', listingSchema);
