import Image from 'next/image';
import Link from 'next/link';

interface ArticleCardProps {
  article: {
    title: string;
    slug: string;
    excerpt?: string | null;
    subtitle?: string | null;
    categoryName?: string;
    category?: { name: string } | null;
    authorName?: string;
    author?: { name: string } | null;
    publishedAt?: string | Date | null;
    createdAt?: string | Date | null;
    readingTime?: number | null;
    featuredImage?: string | null;
    contentType?: string;
  };
}

export function ArticleCard({ article }: ArticleCardProps) {
  const section =
    article.contentType === 'GUIDE' || article.contentType === 'TUTORIAL'
      ? 'guides'
      : 'news';
  const category = article.categoryName || article.category?.name;
  const author = article.authorName || article.author?.name || 'Tecrese Editorial';
  const publishedAt = article.publishedAt || article.createdAt;
  const readingTime = article.readingTime ?? 5;
  const excerpt = article.excerpt || article.subtitle || '';

  return (
    <Link href={`/${section}/${article.slug}`} className="group flex flex-col rounded-xl overflow-hidden border border-border bg-card hover:shadow-lg transition-all hover:-translate-y-1">
      <div className="relative aspect-video bg-muted overflow-hidden">
        {article.featuredImage ? (
          <Image src={article.featuredImage} alt={article.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover transition-transform group-hover:scale-105" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-500" />
        )}
        {category ? (
          <div className="absolute top-3 left-3 bg-primary/90 text-primary-foreground text-xs font-semibold px-2 py-1 rounded">
            {category}
          </div>
        ) : null}
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-bold text-xl mb-2 line-clamp-2 group-hover:text-primary transition-colors">{article.title}</h3>
        <p className="text-muted-foreground text-sm line-clamp-2 mb-4 flex-1">{excerpt}</p>
        <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto">
          <div className="font-medium">{author}</div>
          <div>
            {publishedAt ? new Date(publishedAt).toLocaleDateString() : ''}
            {publishedAt ? ' • ' : ''}
            {readingTime} min read
          </div>
        </div>
      </div>
    </Link>
  );
}
