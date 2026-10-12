export function JSONLD({ data, id }: { data: object; id?: string }) {
  return (
    <script
      type="application/ld+json"
      id={id}
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data, null, 2) }}
    />
  );
}

export function OrganizationJSONLD() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Tecrese',
    alternateName: 'Tecrese - The Intelligence Layer for the Agentic Internet',
    url: 'https://tecrese.com',
    logo: {
      '@type': 'ImageObject',
      url: 'https://tecrese.com/images/brand/logo.svg',
      width: 128,
      height: 128,
    },
    description: 'The intelligence layer for the agentic internet. Discover, compare, and integrate AI agents, tools, and models.',
    foundingDate: '2024',
    sameAs: [
      'https://twitter.com/tecrese',
      'https://linkedin.com/company/tecrese',
      'https://github.com/tecrese',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-000-000-0000',
      contactType: 'customer service',
      availableLanguage: ['English'],
      areaServed: 'World',
    },
    knowsAbout: [
      'AI Agents',
      'AI Tools',
      'Machine Learning Models',
      'Agentic AI',
      'LLM Applications',
      'Model Context Protocol',
    ],
  };

  return <JSONLD data={data} id="organization-schema" />;
}

export function WebsiteJSONLD() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Tecrese',
    url: 'https://tecrese.com',
    description: 'The intelligence layer for the agentic internet. Discover, compare, and integrate AI agents, tools, and models.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://tecrese.com/search?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Tecrese',
      logo: {
        '@type': 'ImageObject',
        url: 'https://tecrese.com/images/brand/logo.svg',
      },
      sameAs: [
        'https://twitter.com/tecrese',
        'https://linkedin.com/company/tecrese',
        'https://github.com/tecrese',
      ],
    },
  };

  return <JSONLD data={data} id="website-schema" />;
}

export function BreadcrumbJSONLD(items: Array<{ name: string; url: string }>) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return <JSONLD data={data} id="breadcrumb-schema" />;
}

export function ArticleJSONLD(article: {
  title: string;
  description: string;
  url: string;
  image?: string;
  datePublished: string;
  dateModified: string;
  author: { name: string; url?: string };
  category?: string;
  tags?: string[];
  readingTime?: number;
}) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    image: article.image,
    url: article.url,
    datePublished: article.datePublished,
    dateModified: article.dateModified,
    author: {
      '@type': 'Person',
      name: article.author.name,
      url: article.author.url,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Tecrese',
      logo: {
        '@type': 'ImageObject',
        url: 'https://tecrese.com/images/brand/logo.svg',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': article.url,
    },
    articleSection: article.category,
    keywords: article.tags?.join(', '),
    timeRequired: article.readingTime ? `PT${article.readingTime}M` : undefined,
  };

  return <JSONLD data={data} id="article-schema" />;
}

export function FAQJSONLD(faqs: Array<{ question: string; answer: string }>) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return <JSONLD data={data} id="faq-schema" />;
}

export function AgentJSONLD(agent: {
  name: string;
  description: string;
  url: string;
  image?: string;
  provider: string;
  category: string;
  capabilities: string[];
  pricing?: string;
  status: string;
}) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: agent.name,
    description: agent.description,
    url: agent.url,
    image: agent.image,
    applicationCategory: 'AI Agent',
    operatingSystem: 'Cloud',
    offers: agent.pricing
      ? {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        }
      : undefined,
    publisher: {
      '@type': 'Organization',
      name: agent.provider,
    },
    featureList: agent.capabilities,
    softwareVersion: '1.0',
  };

  return <JSONLD data={data} id="agent-schema" />;
}

export function ProductJSONLD(product: {
  name: string;
  description: string;
  url: string;
  image?: string;
  price?: number;
  currency?: string;
  availability?: string;
  brand: string;
  category: string;
  rating?: { value: number; count: number };
  features?: string[];
}) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    url: product.url,
    image: product.image,
    brand: {
      '@type': 'Brand',
      name: product.brand,
    },
    category: product.category,
    offers: product.price
      ? {
          '@type': 'Offer',
          price: product.price,
          priceCurrency: product.currency || 'USD',
          availability: product.availability || 'https://schema.org/InStock',
        }
      : undefined,
    aggregateRating: product.rating
      ? {
          '@type': 'AggregateRating',
          ratingValue: product.rating.value,
          reviewCount: product.rating.count,
        }
      : undefined,
    additionalProperty: product.features?.map((feature) => ({
      '@type': 'PropertyValue',
      name: 'Feature',
      value: feature,
    })),
  };

  return <JSONLD data={data} id="product-schema" />;
}