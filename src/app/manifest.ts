import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Addis Digital Menu',
    short_name: 'Addis Menu',
    description: 'Mobile-first QR digital restaurant menu and instant ordering',
    start_url: '/',
    display: 'standalone',
    background_color: '#101115',
    theme_color: '#E8590C',
    icons: [
      {
        src: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=192&h=192&q=80',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=512&h=512&q=80',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
