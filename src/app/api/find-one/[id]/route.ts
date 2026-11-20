import connectMongodb from '@/lib/mongodb';
import products from '@/models/productsSchema';
import { ObjectId } from 'mongodb';
import { NextResponse, type NextRequest } from 'next/server';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(_request: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  const { id } = await params;

  // Validate 24-character hex MongoDB ObjectId
  if (!id || !/^[a-fA-F0-9]{24}$/.test(id) || !ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
  }

  try {
    await connectMongodb();

    const query = { _id: new ObjectId(id) };
    const product = await products.findOne(query);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
