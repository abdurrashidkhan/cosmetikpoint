import mongoose, { Schema, type Model } from 'mongoose';

// ============================================================================
// Interfaces
// ============================================================================

export interface IPostReaction {
  email: string;
  timestamp: Date;
}

export interface INewPost {
  caption: string;
  date: Date;
  image: string;
  email: string;
  react: number;
  reactEmail: IPostReaction[];
  createdAt?: Date;
  updatedAt?: Date;
}

// ============================================================================
// Sub-Schemas
// ============================================================================

const postReactionSchema = new Schema<IPostReaction>(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

// ============================================================================
// Main Schema
// ============================================================================

const newPostSchema = new Schema<INewPost>(
  {
    // 1. Post Content
    caption: { type: String, required: true, trim: true },
    date: { type: Date, required: true, default: Date.now },
    image: { type: String, required: true, trim: true },

    // 2. Author Reference
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    // 3. Engagement Metrics
    react: { type: Number, default: 0, min: 0 },
    reactEmail: { type: [postReactionSchema], default: [] },
  },
  {
    timestamps: true,
  }
);

const Post: Model<INewPost> =
  (mongoose.models.post as Model<INewPost>) ||
  mongoose.model<INewPost>('post', newPostSchema);

export default Post;
