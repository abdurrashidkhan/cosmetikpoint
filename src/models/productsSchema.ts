import mongoose, { Schema, type Model, type Types } from 'mongoose';

// ============================================================================
// Types & Interfaces
// ============================================================================

export type InventoryStatus = 'In Stock' | 'Out of Stock' | 'Discontinued';

export type SkinType = 'All' | 'Oily' | 'Dry' | 'Combination' | 'Sensitive' | 'Normal';

export interface IProductVariant {
  sku: string;
  attributes: {
    color?: string;
    shade?: string;
    size?: string;
    volume?: string;
    material?: string;
    scent?: string;
    finish?: string;
  };
  price: number;
  stock: number;
  images: string[];
}

export interface IProductSpecification {
  key: string;
  value: string;
}

export interface IProduct {
  // 1. Basic Information
  title: string;
  brand: string;
  description: string;
  bulletPoints: string[];

  // 2. Identification
  asin?: string;
  sku: string;
  gtin?: string;

  // 3. Categories & Taxonomy
  category: Types.ObjectId;
  subCategories: string[];
  tags: string[];

  // 4. Pricing & Inventory
  price: {
    basePrice: number;
    discountPrice?: number;
    currency: string;
  };
  stock: number;
  inventoryStatus: InventoryStatus;

  // 5. Media
  mainImage: string;
  gallery: string[];

  // 6. Product Specifications & Cosmetics Details
  specifications: IProductSpecification[];
  cosmeticsDetails?: {
    skinType?: SkinType[];
    ingredients?: string;
    howToUse?: string;
    countryOfOrigin?: string;
    shelfLifeMonths?: number;
    isAuthentic?: boolean;
  };

  // 7. Shipping Details
  shipping: {
    weight?: number;
    dimensions?: {
      length?: number;
      width?: number;
      height?: number;
      unit: string;
    };
    isPrimeEligible: boolean;
  };

  // 8. Social Proof & Ratings
  ratings: {
    average: number;
    count: number;
  };

  // 9. Variations
  variants: IProductVariant[];

  // 10. Status & Visibility
  isActive: boolean;
  seller?: Types.ObjectId;

  createdAt?: Date;
  updatedAt?: Date;
}

// ============================================================================
// Sub-Schemas
// ============================================================================

const variantSchema = new Schema<IProductVariant>({
  sku: { type: String, required: true, unique: true, sparse: true, trim: true },
  attributes: {
    color: { type: String, trim: true },
    shade: { type: String, trim: true },
    size: { type: String, trim: true },
    volume: { type: String, trim: true },
    material: { type: String, trim: true },
    scent: { type: String, trim: true },
    finish: { type: String, trim: true },
  },
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, default: 0, min: 0 },
  images: { type: [String], default: [] },
});

const specificationSchema = new Schema<IProductSpecification>(
  {
    key: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
  },
  { _id: false },
);

// ============================================================================
// Main Schema
// ============================================================================

const productSchema = new Schema<IProduct>(
  {
    // 1. Basic Information
    title: { type: String, required: true, index: true, trim: true },
    brand: { type: String, required: true, index: true, trim: true },
    description: { type: String, required: true, trim: true },
    bulletPoints: { type: [String], default: [] },

    // 2. Identification
    asin: { type: String, unique: true, sparse: true, trim: true },
    sku: { type: String, required: true, unique: true, trim: true },
    gtin: { type: String, trim: true },

    // 3. Categories & Taxonomy
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    subCategories: { type: [String], default: [] },
    tags: { type: [String], index: true, default: [] },

    // 4. Pricing & Inventory
    price: {
      basePrice: { type: Number, required: true, min: 0 },
      discountPrice: { type: Number, min: 0 },
      currency: { type: String, default: 'BDT', trim: true },
    },
    stock: { type: Number, default: 0, min: 0 },
    inventoryStatus: {
      type: String,
      enum: ['In Stock', 'Out of Stock', 'Discontinued'],
      default: 'In Stock',
    },

    // 5. Media
    mainImage: { type: String, required: true, trim: true },
    gallery: { type: [String], default: [] },

    // 6. Product Specifications & Cosmetics Details
    specifications: { type: [specificationSchema], default: [] },
    cosmeticsDetails: {
      skinType: {
        type: [String],
        enum: ['All', 'Oily', 'Dry', 'Combination', 'Sensitive', 'Normal'],
        default: ['All'],
      },
      ingredients: { type: String, trim: true },
      howToUse: { type: String, trim: true },
      countryOfOrigin: { type: String, trim: true },
      shelfLifeMonths: { type: Number, min: 0 },
      isAuthentic: { type: Boolean, default: true },
    },

    // 7. Shipping Details
    shipping: {
      weight: { type: Number, min: 0 },
      dimensions: {
        length: { type: Number, min: 0 },
        width: { type: Number, min: 0 },
        height: { type: Number, min: 0 },
        unit: { type: String, default: 'cm' },
      },
      isPrimeEligible: { type: Boolean, default: false },
    },

    // 8. Social Proof & Ratings
    ratings: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0, min: 0 },
    },

    // 9. Variations
    variants: { type: [variantSchema], default: [] },

    // 10. Status & Visibility
    isActive: { type: Boolean, default: true, index: true },
    seller: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  },
);

// Text Search Index for Cosmetik Point storefront search bar
productSchema.index({ title: 'text', description: 'text', brand: 'text', tags: 'text' });

const Product: Model<IProduct> =
  (mongoose.models.Product as Model<IProduct>) ||
  mongoose.model<IProduct>('Product', productSchema);

export default Product;
