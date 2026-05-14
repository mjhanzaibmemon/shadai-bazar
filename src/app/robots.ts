import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://44-248-29-160.sslip.io';
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/chat', '/orders'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
