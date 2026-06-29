import { useState } from 'react';
import { Search, X, Plus, BarChart3, TrendingUp, Clock, Star, Trophy, Users } from 'lucide-react';
import { tmdbService } from '../services/tmdb';
import { omdbService } from '../services/omdb';
import type { Movie, TVShow, OMDbData } from '../types';
import { getImageUrl } from '../api/client';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { cn } from '../utils/cn';

const Compare = () => {
  const [items, setItems] = useState<((Movie | TVShow) & { omdb?: OMDbData })[]>([]);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const handleSearch = async (val: string) => {
    setQuery(val);
    if (val.length > 2) {
      const data = await tmdbService.searchMulti(val);
      setSuggestions(data.results.filter((i: any) => i.media_type !== 'person').slice(0, 5));
    } else {
      setSuggestions([]);
    }
  };

  const addItem = async (item: any) => {
    let fullItem: any;
    if (item.media_type === 'movie') {
      fullItem = await tmdbService.getMovieDetails(item.id);
    } else {
      fullItem = await tmdbService.getTVDetails(item.id);
    }

    if (fullItem.imdb_id) {
      try {
        const extra = await omdbService.getExtraMetadata(fullItem.imdb_id);
        fullItem.omdb = extra;
      } catch (e) {
        console.error('OMDb failed', e);
      }
    }

    setItems((prev) => [...prev, fullItem].slice(0, 3));
    setQuery('');
    setSuggestions([]);
  };

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  // Logic to find max values for highlighting
  const maxRating = Math.max(...items.map((i) => i.vote_average), 0);
  const maxPopularity = Math.max(...items.map((i) => i.popularity), 0);
  const maxRevenue = Math.max(
    ...items.map((i) => ((i as Movie).revenue || 0)),
    0
  );

  return (
    <div className='container px-4 py-10 space-y-12 mx-auto'>
      <div className='space-y-4 text-center'>
        <h1 className='text-4xl font-bold'>Compare Titles</h1>
        <p className='text-muted-foreground'>Compare up to 3 movies or TV shows side-by-side.</p>

        <div className='max-w-md mx-auto relative'>
          <div className='relative'>
            <Search className='absolute left-3 top-3 h-5 w-5 text-muted-foreground' />
            <Input
              placeholder='Search to add...'
              className='pl-10 h-12 text-lg'
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              disabled={items.length >= 3}
            />
          </div>

          {suggestions.length > 0 && (
            <div className='absolute z-50 w-full mt-2 bg-popover border rounded-lg shadow-xl overflow-hidden text-left'>
              {suggestions.map((s) => (
                <button
                  key={s.id}
                  className='w-full px-4 py-3 flex items-center gap-4 hover:bg-accent transition-colors text-left'
                  onClick={() => addItem(s)}
                >
                  <img src={getImageUrl(s.poster_path, 'w92')} className='w-10 rounded' alt='' />
                  <div>
                    <p className='font-medium'>{s.title || s.name}</p>
                    <p className='text-xs text-muted-foreground capitalize'>
                      {s.media_type} • {new Date(s.release_date || s.first_air_date).getFullYear()}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {items.length > 0 ? (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {items.map((item) => {
            const isMovie = (item as Movie).title !== undefined;
            const title = isMovie ? (item as Movie).title : (item as TVShow).name;
            const year = new Date(
              isMovie ? (item as Movie).release_date : (item as TVShow).first_air_date
            ).getFullYear();

            return (
              <Card
                key={item.id}
                className='relative overflow-hidden group border-2 hover:border-primary transition-colors'
              >
                <Button
                  variant='destructive'
                  size='icon'
                  className='absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity'
                  onClick={() => removeItem(item.id)}
                >
                  <X className='h-4 w-4' />
                </Button>
                <div className='aspect-[16/9] w-full overflow-hidden'>
                  <img
                    src={getImageUrl(item.backdrop_path, 'w780')}
                    className='w-full h-full object-cover'
                    alt=''
                  />
                </div>
                <CardContent className='p-6 space-y-6'>
                  <div className='space-y-1 text-center'>
                    <h2 className='text-xl font-bold line-clamp-1'>{title}</h2>
                    <p className='text-sm text-muted-foreground'>
                      {isMovie ? 'Movie' : 'TV Show'} • {year}
                    </p>
                  </div>

                  <div className='grid grid-cols-2 gap-4 border-y py-4'>
                    <div className={cn('space-y-1 p-2 rounded-lg transition-colors', item.vote_average === maxRating && items.length > 1 && 'bg-primary/10 border border-primary/20')}>
                      <div className='flex items-center gap-2 text-primary'>
                        <Star className='h-4 w-4 fill-current' />
                        <span className='font-bold'>{item.vote_average.toFixed(1)}</span>
                      </div>
                      <p className='text-[10px] uppercase text-muted-foreground font-bold'>Rating</p>
                    </div>
                    <div className={cn('space-y-1 p-2 rounded-lg transition-colors', item.popularity === maxPopularity && items.length > 1 && 'bg-green-500/10 border border-green-500/20')}>
                      <div className='flex items-center gap-2 text-green-500'>
                        <TrendingUp className='h-4 w-4' />
                        <span className='font-bold'>{Math.round(item.popularity)}</span>
                      </div>
                      <p className='text-[10px] uppercase text-muted-foreground font-bold'>Popularity</p>
                    </div>
                    <div className='space-y-1 p-2'>
                      <div className='flex items-center gap-2'>
                        <Clock className='h-4 w-4' />
                        <span className='font-bold'>
                          {isMovie
                            ? (item as Movie).runtime
                            : (item as TVShow).episode_run_time?.[0] || 'N/A'}{' '}
                          m
                        </span>
                      </div>
                      <p className='text-[10px] uppercase text-muted-foreground font-bold'>Runtime</p>
                    </div>
                    <div className={cn('space-y-1 p-2 rounded-lg transition-colors', isMovie && (item as Movie).revenue === maxRevenue && items.length > 1 && maxRevenue > 0 && 'bg-yellow-500/10 border border-yellow-500/20')}>
                      <div className='flex items-center gap-2'>
                        <BarChart3 className='h-4 w-4' />
                        <span className='font-bold'>
                          {isMovie
                            ? `$${(((item as Movie).revenue || 0) / 1000000).toFixed(1)}M`
                            : `${(item as TVShow).number_of_seasons} S`}
                        </span>
                      </div>
                      <p className='text-[10px] uppercase text-muted-foreground font-bold'>
                        {isMovie ? 'Revenue' : 'Seasons'}
                      </p>
                    </div>
                  </div>

                  <div className='space-y-4'>
                    <div className='space-y-1'>
                      <p className='text-xs font-bold uppercase text-muted-foreground flex items-center gap-1'>
                        <Trophy className='h-3 w-3' /> Awards
                      </p>
                      <p className='text-xs line-clamp-2'>{item.omdb?.Awards || 'N/A'}</p>
                    </div>

                    <div className='space-y-1'>
                      <p className='text-xs font-bold uppercase text-muted-foreground flex items-center gap-1'>
                        <Users className='h-3 w-3' /> Cast
                      </p>
                      <p className='text-xs line-clamp-2'>
                        {(item as any).credits?.cast
                          ?.slice(0, 3)
                          .map((c: any) => c.name)
                          .join(', ') || 'N/A'}
                      </p>
                    </div>

                    <div className='space-y-1'>
                      <p className='text-xs font-bold uppercase text-muted-foreground'>Genres</p>
                      <div className='flex flex-wrap gap-1'>
                        {item.genres?.slice(0, 3).map((g) => (
                          <span
                            key={g.id}
                            className='px-2 py-0.5 rounded-full bg-secondary text-[10px] font-medium'
                          >
                            {g.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className='space-y-2 pt-2 border-t'>
                    <p className='text-xs font-bold uppercase text-muted-foreground'>Status</p>
                    <p className='text-sm'>{item.status}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {items.length < 3 && (
            <div className='border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-12 text-muted-foreground space-y-4 min-h-[500px]'>
              <Plus className='h-12 w-12' />
              <p>Add another title to compare</p>
            </div>
          )}
        </div>
      ) : (
        <div className='text-center py-20'>
          <BarChart3 className='h-16 w-16 mx-auto text-muted-foreground opacity-20' />
          <p className='mt-4 text-xl text-muted-foreground'>
            Start by searching for a movie or TV show above.
          </p>
        </div>
      )}
    </div>
  );
};

export default Compare;
