import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://vista-clean.fr', lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: 'https://vista-clean.fr/reservation', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: 'https://vista-clean.fr/faq', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: 'https://vista-clean.fr/mentions-legales', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ]
}
