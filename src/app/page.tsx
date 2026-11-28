import type { Metadata } from 'next';
import type { ReactElement } from 'react';

export const metadata: Metadata = {
  title: {
    absolute: 'Cosmetik Point | Authentic Cosmetics & Skincare Shop in Bangladesh',
  },
  description:
    'Explore the latest skincare, makeup, haircare, and fragrances at Cosmetik Point Bangladesh. Shop 100% authentic beauty products with fast nationwide delivery.',
};

export default function Home(): ReactElement {
  return (
    <main>
      {/* Hero Banner */}
      {/* <Banner /> */}

      {/* Latest & Featured Cosmetics */}
      {/* <LatestProducts /> */}
      {/* <TopCategories /> */}
      {/* <ComingProducts /> */}
      {/* <TotalProducts /> */}

      {/* Featured Beauty Brands */}
      {/* <Brand /> */}

      {/* Newsletter & Customer Trust */}
      {/* <SubscribeSection /> */}
      {/* <Review /> */}
      {/* <Commitment /> */}
      <h1>Root</h1>
    </main>
  );
}
