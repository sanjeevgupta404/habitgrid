import type { Movie, TVShow } from '../../types';
import { getImageUrl } from '../../api/client';
import { Link } from 'react-router-dom';
import { Star, Play, Info } from 'lucide-react';
import { Button } from '../ui/Button';

interface HeroProps {
  item: Movie | TVShow | null;
}

export const Hero = ({ item }: HeroProps) => {
  if (!item) return null;

  const title = (item as Movie).title || (item as TVShow).name;
  const releaseDate = (item as Movie).release_date || (item as TVShow).first_air_date;

  return (
    <div className='relative h-[70vh] w-full overflow-hidden'>
      <div className='absolute inset-0'>
        <img
          src={getImageUrl(item.backdrop_path)}
          alt={title}
          className='h-full w-full object-cover'
        />
        <div className='absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent' />
        <div className='absolute inset-0 bg-gradient-to-r from-background via-background/20 to-transparent' />
      </div>

      <div className='container relative h-full flex flex-col justify-center px-4 space-y-4'>
        <div className='flex items-center space-x-2 text-primary'>
          <Star className='h-5 w-5 fill-current' />
          <span className='font-bold'>{item.vote_average.toFixed(1)} Rating</span>
          <span className='text-muted-foreground'>|</span>
          <span className='text-muted-foreground'>{new Date(releaseDate).getFullYear()}</span>
        </div>
        <h1 className='text-4xl md:text-6xl font-extrabold max-w-2xl tracking-tight'>{title}</h1>
        <p className='text-lg text-muted-foreground max-w-xl line-clamp-3'>{item.overview}</p>
        <div className='flex items-center space-x-4 pt-4'>
          <Link to={`/${(item as Movie).title ? 'movie' : 'tv'}/${item.id}`}>
            <Button size='lg' className='gap-2'>
              <Play className='h-5 w-5 fill-current' /> Watch Trailer
            </Button>
          </Link>
          <Link to={`/${(item as Movie).title ? 'movie' : 'tv'}/${item.id}`}>
            <Button size='lg' variant='secondary' className='gap-2'>
              <Info className='h-5 w-5' /> More Info
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
