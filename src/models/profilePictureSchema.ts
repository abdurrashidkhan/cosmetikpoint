import mongoose, { Schema, type Model } from 'mongoose';

// ============================================================================
// Interfaces
// ============================================================================

export interface IProfilePicture {
  caption: string;
  date: Date;
  image: string;
  email: string;
  profile: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// ============================================================================
// Main Schema
// ============================================================================

const profilePictureSchema = new Schema<IProfilePicture>(
  {
    // 1. Media Details
    caption: { type: String, required: true, trim: true },
    date: { type: Date, required: true, default: Date.now },
    image: { type: String, required: true, trim: true },

    // 2. Owner & Profile Flag
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    profile: { type: Boolean, required: true, default: true },
  },
  {
    timestamps: true,
  }
);

// Fixed: Separate model name so it does not collide with `post` in newPostSchema
const ProfilePicture: Model<IProfilePicture> =
  (mongoose.models.ProfilePicture as Model<IProfilePicture>) ||
  mongoose.model<IProfilePicture>('ProfilePicture', profilePictureSchema);

export default ProfilePicture;
