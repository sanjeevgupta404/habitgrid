import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { tmdbService } from '../services/tmdb';
import type { SearchResult as ISearchResult } from '../types';
import { ContentCard } from '../components/home/ContentCard';
import { Button } from '../components/ui/Button';

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<ISearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    if (!query) return;

    const fetchResults = async () => {
      setLoading(true);
      try {
        const data = await tmdbService.searchMulti(query, page);
        if (page === 1) {
          setResults(data.results);
        } else {
          setResults((prev) => [...prev, ...data.results]);
        }
        setTotalPages(data.total_pages);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, page]);

  // Reset search when query changes
  useEffect(() => {
    setPage(1);
    setResults([]);
  }, [query]);

  return (
    <div className='container px-4 py-10 space-y-8'>
      <div className='space-y-2'>
        <h1 className='text-3xl font-bold'>Search Results</h1>
        <p className='text-muted-foreground'>
          {query ? `Showing results for "${query}"` : 'Enter a search query to find movies and TV shows.'}
        </p>
      </div>

      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6'>
        {results.map((item) => (
          <ContentCard key={`${item.media_type}-${item.id}`} item={item as any} type={item.media_type as any} />
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

      {!loading && results.length === 0 && query && (
        <div className='text-center py-20'>
          <p className='text-xl text-muted-foreground'>No results found for "{query}".</p>
        </div>
      )}
    </div>
  );
};

export default Search;
