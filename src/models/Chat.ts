import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IChat extends Document {
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
  listing?: Types.ObjectId;
  message: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const chatSchema = new Schema<IChat>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender is required'],
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Receiver is required'],
    },
    listing: {
      type: Schema.Types.ObjectId,
      ref: 'Listing',
      default: null,
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: [5000, 'Message cannot exceed 5000 characters'],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Index for fast queries
chatSchema.index({ sender: 1, receiver: 1 });
chatSchema.index({ receiver: 1, isRead: 1 });
chatSchema.index({ createdAt: -1 });

export default mongoose.models.Chat || mongoose.model<IChat>('Chat', chatSchema);
