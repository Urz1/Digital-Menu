import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  getRestaurantBySlug,
  getMenuCategories,
  getMenuItems,
  getOffers,
  getDishReviews,
  getReviewSettings,
} from '@/lib/data-provider';
import { ThemeManager } from '@/components/ThemeManager';
import { ClientMenuContainer } from '@/components/ClientMenuContainer';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ table?: string }>;
}

// -----------------------------------------------------------------------------
// DYNAMIC SEO METADATA & OPEN GRAPH PREVIEWS
// -----------------------------------------------------------------------------
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);

  if (!restaurant) {
    return {
      title: 'Menu Not Found',
    };
  }

  const title = `${restaurant.name} — Digital Menu`;
  const description = `${restaurant.tagline}. View our seasonal food, wood-fired specials, and craft beverages.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: restaurant.logo_url || 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=1200&h=630&q=80',
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
      images: [restaurant.logo_url || 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=1200&h=630&q=80'],
    },
  };
}

// -----------------------------------------------------------------------------
// SERVER-RENDERED PAGE COMPONENT
// -----------------------------------------------------------------------------
export default async function RestaurantMenuPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { table } = await searchParams;

  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant) {
    notFound();
  }

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
    servesCuisine: 'Artisanal & Modern',
    telephone: '+1-555-0199',
    address: {
      '@type': 'PostalAddress',
      streetAddress: restaurant.address,
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
