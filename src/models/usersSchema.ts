import mongoose, { Schema, type Model } from 'mongoose';

// ============================================================================
// Types & Interfaces
// ============================================================================

export type UserRole = 'user' | 'customer' | 'seller' | 'moderator' | 'admin';

export interface IUser {
  displayName: string;
  userNumber?: string;
  email: string;
  emailVerified: boolean;
  photoURL: string;
  accessToken?: string;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}

// ============================================================================
// Main Schema
// ============================================================================

const usersSchema = new Schema<IUser>(
  {
    // 1. Identity & Profile
    displayName: { type: String, required: true, trim: true },
    userNumber: { type: String, trim: true, default: '' },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    emailVerified: { type: Boolean, required: true, default: false },
    photoURL: { type: String, default: '', trim: true },

    // 2. Auth & Access Control
    accessToken: { type: String, select: false },
    role: {
      type: String,
      required: true,
      enum: ['user', 'customer', 'seller', 'moderator', 'admin'],
      default: 'user',
    },
  },
  {
    timestamps: true,
  }
);

const Users: Model<IUser> =
  (mongoose.models.users as Model<IUser>) ||
  mongoose.model<IUser>('users', usersSchema);

export default Users;
