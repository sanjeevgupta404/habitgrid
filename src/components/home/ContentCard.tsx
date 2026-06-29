import type { Movie, TVShow } from '../../types';
import { getImageUrl } from '../../api/client';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface ContentCardProps {
  item: Movie | TVShow;
  type?: 'movie' | 'tv';
}

export const ContentCard = ({ item, type }: ContentCardProps) => {
  const title = (item as Movie).title || (item as TVShow).name;
  const releaseDate = (item as Movie).release_date || (item as TVShow).first_air_date;
  const mediaType = type || ((item as Movie).title ? 'movie' : 'tv');

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
      className='relative group cursor-pointer'
    >
      <Link to={`/${mediaType}/${item.id}`}>
        <div className='aspect-[2/3] overflow-hidden rounded-lg border bg-muted'>
          <img
            src={getImageUrl(item.poster_path, 'w500')}
            alt={title}
            className='h-full w-full object-cover transition-transform group-hover:scale-110'
            loading='lazy'
          />
        </div>
        <div className='mt-2 space-y-1'>
          <h3 className='font-semibold line-clamp-1 group-hover:text-primary transition-colors'>
            {title}
          </h3>
          <div className='flex items-center justify-between text-xs text-muted-foreground'>
            <span>{releaseDate ? new Date(releaseDate).getFullYear() : 'N/A'}</span>
            <div className='flex items-center gap-1'>
              <Star className='h-3 w-3 fill-primary text-primary' />
              <span>{item.vote_average.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
