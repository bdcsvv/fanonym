import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin',
        '/fyn-secure-panel-x7k2',
        '/dashboard',
        '/settings',
        '/chat',
        '/topup',
        '/auth/confirm',
        '/auth/reset-password',
        '/auth/success',
      ],
    },
    sitemap: 'https://fanonym.id/sitemap.xml',
  }
}
