import React from 'react';
import type { Metadata } from 'next';
import {
  getRestaurantBySlug,
  getMenuCategories,
  getMenuItems,
  getOffers,
  getDishReviews,
  getReviewSettings,
  MOCK_RESTAURANT_ADDIS,
} from '@/lib/data-provider';
import { ThemeManager } from '@/components/ThemeManager';
import { ClientMenuContainer } from '@/components/ClientMenuContainer';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ table?: string }>;
}

// -----------------------------------------------------------------------------
// DYNAMIC SEO METADATA & OPEN GRAPH PREVIEWS FOR ADDIS DIGITAL MENU
// -----------------------------------------------------------------------------
export async function generateMetadata(): Promise<Metadata> {
  const restaurant = (await getRestaurantBySlug('addis')) || MOCK_RESTAURANT_ADDIS;
  const title = `${restaurant.name} — Digital Menu`;
  const description = `${restaurant.tagline}. Authentic Ethiopian cuisine, sizzling tibs, wood-fired mendi & artisanal bakery.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url:
            restaurant.logo_url ||
            'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&h=630&q=80',
          width: 1200,
          height: 630,
          alt: restaurant.name,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [
        restaurant.logo_url ||
          'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&h=630&q=80',
      ],
    },
  };
}

// -----------------------------------------------------------------------------
// SERVER-RENDERED ROOT PAGE: ADDIS CAFETERIA DIGITAL MENU DIRECTLY
// -----------------------------------------------------------------------------
export default async function HomePage({ searchParams }: PageProps) {
  const { table } = await searchParams;
  const restaurant = (await getRestaurantBySlug('addis')) || MOCK_RESTAURANT_ADDIS;

  const [categories, items, offers, reviews, reviewSettings] = await Promise.all([
    getMenuCategories(restaurant.id),
    getMenuItems(restaurant.id),
    getOffers(restaurant.id),
    getDishReviews(restaurant.id),
    getReviewSettings(restaurant.id),
  ]);

  // Schema.org Structured Data for Google Search
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: restaurant.name,
    description: restaurant.tagline,
    servesCuisine: 'Authentic Ethiopian, Mendi & Artisanal Bakery',
    telephone: '+251-11-661-0000',
    address: {
      '@type': 'PostalAddress',
      streetAddress: restaurant.address,
      addressLocality: 'Addis Ababa',
      addressCountry: 'ET',
    },
    hasMenu: {
      '@type': 'Menu',
      name: `${restaurant.name} Full Menu`,
      hasMenuSection: categories.map((cat) => ({
        '@type': 'MenuSection',
        name: cat.name,
        description: cat.description,
        hasMenuItem: items
          .filter((i) => i.category_id === cat.id)
          .map((item) => ({
            '@type': 'MenuItem',
            name: item.name,
            description: item.description,
            offers: {
              '@type': 'Offer',
              price: item.price.toString(),
              priceCurrency: restaurant.currency_code,
            },
          })),
      })),
    },
  };

  return (
    <>
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <ThemeManager themeConfig={restaurant.theme_config}>
        <ClientMenuContainer
          restaurant={restaurant}
          categories={categories}
          initialItems={items}
          initialOffers={offers}
          initialReviews={reviews}
          initialReviewSettings={reviewSettings}
          initialTable={table}
        />
      </ThemeManager>
    </>
  );
}
