import type { Movie, TVShow } from '../../types';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { ContentCard } from './ContentCard';

interface ContentSectionProps {
  title: string;
  items: (Movie | TVShow)[];
  viewAllLink?: string;
}

export const ContentSection = ({ title, items, viewAllLink }: ContentSectionProps) => {
  if (!items || items.length === 0) return null;

  return (
    <section className='space-y-4 px-4'>
      <div className='flex items-center justify-between'>
        <h2 className='text-2xl font-bold tracking-tight'>{title}</h2>
        {viewAllLink && (
          <Link
            to={viewAllLink}
            className='flex items-center text-sm font-medium text-primary hover:underline'
          >
            View all <ChevronRight className='ml-1 h-4 w-4' />
          </Link>
        )}
      </div>
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6'>
        {items.slice(0, 6).map((item) => (
          <ContentCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
};
