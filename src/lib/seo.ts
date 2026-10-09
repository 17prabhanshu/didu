import { Metadata } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

type SEOProps = {
  title: string
  description: string
  slug: string
  type?: 'website' | 'article'
  image?: string
  noIndex?: boolean
  publishedTime?: string
  modifiedTime?: string
  author?: string
  section?: string
}

export function generateMetadata({
  title,
  description,
  slug,
  type = 'website',
  image = '/og-image.jpg',
  noIndex = false,
  publishedTime,
  modifiedTime,
  author,
  section,
}: SEOProps): Metadata {
  const url = `${SITE_URL}${slug.startsWith('/') ? slug : `/${slug}`}`

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Agentverse',
      type,
      images: [
        {
          url: image.startsWith('http') ? image : `${SITE_URL}${image}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(author && { authors: [author] }),
      ...(section && { section }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image.startsWith('http') ? image : `${SITE_URL}${image}`],
    },
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  }
}

export function generateArticleStructuredData(article: {
  headline: string
  description: string
  image?: string
  datePublished: string
  dateModified?: string
  authorName?: string
  url: string
}): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.headline,
    description: article.description,
    image: article.image ? (article.image.startsWith('http') ? article.image : `${SITE_URL}${article.image}`) : undefined,
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    author: article.authorName ? {
      '@type': 'Person',
      name: article.authorName
    } : undefined,
    publisher: {
      '@type': 'Organization',
      name: 'Agentverse',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': article.url
    }
  }
}

export function generateEntityStructuredData(entity: {
  name: string
  description: string
  image?: string
  url: string
  type: 'SoftwareApplication' | 'Product'
  category?: string
}): object {
  return {
    '@context': 'https://schema.org',
    '@type': entity.type,
    name: entity.name,
    description: entity.description,
    url: entity.url,
    applicationCategory: entity.category,
    image: entity.image ? (entity.image.startsWith('http') ? entity.image : `${SITE_URL}${entity.image}`) : undefined,
  }
}

type BreadcrumbItem = {
  name: string
  item: string
}

export function generateBreadcrumbStructuredData(items: BreadcrumbItem[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.item.startsWith('http') ? item.item : `${SITE_URL}${item.item}`
    }))
  }
}

export function generateOrganizationStructuredData(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Agentverse',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: 'An intelligence and discovery platform for the agentic internet.',
    sameAs: [
      'https://twitter.com/tecrese',
      'https://github.com/tecrese'
    ]
  }
}

export function generateWebSiteStructuredData(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Agentverse',
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  }
}
