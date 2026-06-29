import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { tmdbService } from '../services/tmdb';
import type { Movie, TVShow, Genre } from '../types';
import { ContentCard } from '../components/home/ContentCard';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

interface DiscoverProps {
  type?: 'movie' | 'tv';
}

const Discover = ({ type: initialType }: DiscoverProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const type = (searchParams.get('type') as 'movie' | 'tv') || initialType || 'movie';
  const [results, setResults] = useState<(Movie | TVShow)[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState(searchParams.get('genre') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'popularity.desc');
  const [year, setYear] = useState(searchParams.get('year') || '');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const fetchGenres = async () => {
      const data = await tmdbService.getGenres(type);
      setGenres(data);
    };
    fetchGenres();
  }, [type]);

  useEffect(() => {
    const fetchDiscover = async () => {
      setLoading(true);
      try {
        const params: any = {
          page,
          sort_by: sortBy,
          with_genres: selectedGenre,
        };
        if (year) {
          if (type === 'movie') params.primary_release_year = year;
          else params.first_air_date_year = year;
        }

        const data = await tmdbService.discover(type, params);
        if (page === 1) {
          setResults(data.results);
        } else {
          setResults((prev) => [...prev, ...data.results]);
        }
        setTotalPages(data.total_pages);
      } catch (error) {
        console.error('Discover failed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscover();
  }, [type, selectedGenre, sortBy, year, page]);

  // Reset when filters change
  useEffect(() => {
    setPage(1);
    setResults([]);
  }, [type, selectedGenre, sortBy, year]);

  const handleFilterChange = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set(key, value);
    else newParams.delete(key);
    setSearchParams(newParams);

    if (key === 'genre') setSelectedGenre(value);
    if (key === 'sort') setSortBy(value);
    if (key === 'year') setYear(value);
  };

  return (
    <div className='container px-4 py-10 space-y-8'>
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <h1 className='text-3xl font-bold capitalize'>Discover {type === 'movie' ? 'Movies' : 'TV Shows'}</h1>

        <div className='flex flex-wrap gap-4'>
          <select
            className='bg-muted rounded-md px-3 py-2 text-sm outline-none focus:ring-1 ring-primary'
            value={type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
          >
            <option value='movie'>Movies</option>
            <option value='tv'>TV Shows</option>
          </select>

          <select
            className='bg-muted rounded-md px-3 py-2 text-sm outline-none focus:ring-1 ring-primary'
            value={selectedGenre}
            onChange={(e) => handleFilterChange('genre', e.target.value)}
          >
            <option value=''>All Genres</option>
            {genres.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>

          <select
            className='bg-muted rounded-md px-3 py-2 text-sm outline-none focus:ring-1 ring-primary'
            value={sortBy}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
          >
            <option value='popularity.desc'>Popularity Desc</option>
            <option value='popularity.asc'>Popularity Asc</option>
            <option value='vote_average.desc'>Rating Desc</option>
            <option value='primary_release_date.desc'>Release Date Desc</option>
          </select>

          <Input
            type='number'
            placeholder='Year'
            className='w-24 bg-muted border-none'
            value={year}
            onChange={(e) => handleFilterChange('year', e.target.value)}
          />
        </div>
      </div>

      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6'>
        {results.map((item) => (
          <ContentCard key={item.id} item={item} type={type} />
        ))}
      </div>

      {loading && (
        <div className='grid grid-cols-2 md:grid-cols-6 gap-6'>
          {[...Array(6)].map((_, i) => (
            <div key={i} className='aspect-[2/3] bg-muted animate-pulse rounded-lg' />
          ))}
        </div>
      )}

      {!loading && page < totalPages && (
        <div className='flex justify-center pt-8'>
          <Button onClick={() => setPage((prev) => prev + 1)}>Load More</Button>
        </div>
      )}
    </div>
  );
};

export default Discover;
