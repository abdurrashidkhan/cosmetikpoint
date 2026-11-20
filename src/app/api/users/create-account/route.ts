import { NextResponse, type NextRequest } from 'next/server';
import connectMongodb from '@/lib/mongodb';
import Users, { type IUser } from '@/models/usersSchema';

// ============================================================================
// Types
// ============================================================================

interface CreateAccountBody {
  displayName?: string;
  userNumber?: string;
  email?: string;
  emailVerified?: boolean;
  photoURL?: string;
}

// ============================================================================
// Route Handler: PUT /api/users/create-account
// ============================================================================

export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as CreateAccountBody;
    const normalizedEmail = body.email?.trim().toLowerCase();

    if (!normalizedEmail) {
      return NextResponse.json(
        { status: false, message: 'Valid email is required' },
        { status: 400 }
      );
    }

    await connectMongodb();

    const trimmedPhone = body.userNumber?.trim();

    // Fields updated on every login/signup
    const updateFields: Partial<IUser> = {
      displayName: body.displayName?.trim() || 'CosmetikPoint User',
      email: normalizedEmail,
      emailVerified: Boolean(body.emailVerified),
      photoURL: body.photoURL?.trim() || '',
      ...(trimmedPhone ? { userNumber: trimmedPhone } : {}),
    };

    // Fields set ONLY when creating a new user (zero overlap with $set)
    const insertDefaults: Partial<IUser> = {
      role: 'user',
      ...(trimmedPhone ? {} : { userNumber: '' }),
    };

    const user = await Users.findOneAndUpdate(
      { email: normalizedEmail },
      {
        $set: updateFields,
        $setOnInsert: insertDefaults,
      },
      {
        upsert: true,
        returnDocument: 'after',
        runValidators: true,
        // Disable auto-injection so Mongoose doesn't duplicate $set keys into $setOnInsert
        setDefaultsOnInsert: false,
      }
    );

    return NextResponse.json(
      {
        message: 'User Registered',
        status: true,
        user,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Database operation failed';
    console.error('Error in /api/users/create-account:', error);

    return NextResponse.json(
      {
        status: false,
        message: 'Failed to register user in database',
        details: process.env.NODE_ENV === 'development' ? message : undefined,
      },
      { status: 500 }
    );
  }
}
