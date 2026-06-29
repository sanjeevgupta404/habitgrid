import { useEffect, useState } from 'react';
import { tmdbService } from '../services/tmdb';
import type { Movie, TVShow } from '../types';
import { Hero } from '../components/home/Hero';
import { ContentSection } from '../components/home/ContentSection';
import { useUserContext } from '../hooks/useUserContext';

const Home = () => {
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [trendingTV, setTrendingTV] = useState<TVShow[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [popularTV, setPopularTV] = useState<TVShow[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<Movie[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  const { history } = useUserContext();

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [trendingM, trendingT, popularM, popularT, topRatedM, upcomingM] = await Promise.all([
          tmdbService.getTrendingMovies('week'),
          tmdbService.getTrendingTV('week'),
          tmdbService.getPopularMovies(),
          tmdbService.getPopularTV(),
          tmdbService.getTopRatedMovies(),
          tmdbService.getUpcomingMovies(),
        ]);

        setTrendingMovies(trendingM);
        setTrendingTV(trendingT);
        setPopularMovies(popularM);
        setPopularTV(popularT);
        setTopRatedMovies(topRatedM);
        setUpcomingMovies(upcomingM);
      } catch (error) {
        console.error('Failed to fetch home data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  if (loading) {
    return (
      <div className='flex flex-col space-y-8 pb-10'>
        <div className='h-[70vh] bg-muted animate-pulse' />
        <div className='container px-4 space-y-8'>
          {[...Array(4)].map((_, i) => (
            <div key={i} className='space-y-4'>
              <div className='h-8 w-48 bg-muted animate-pulse rounded' />
              <div className='grid grid-cols-2 md:grid-cols-6 gap-6'>
                {[...Array(6)].map((_, j) => (
                  <div key={j} className='aspect-[2/3] bg-muted animate-pulse rounded-lg' />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col space-y-12 pb-20'>
      <Hero item={trendingMovies[0]} />

      <div className='container space-y-12'>
        {history.length > 0 && (
          <ContentSection title='Continue Watching' items={history} />
        )}

        <ContentSection
          title='Trending Movies'
          items={trendingMovies}
          viewAllLink='/movies?sort=trending'
        />

        <ContentSection
          title='Trending TV Shows'
          items={trendingTV}
          viewAllLink='/tv?sort=trending'
        />

        <ContentSection
          title='Popular Movies'
          items={popularMovies}
          viewAllLink='/movies?sort=popularity.desc'
        />

        <ContentSection
          title='Popular TV Series'
          items={popularTV}
          viewAllLink='/tv?sort=popularity.desc'
        />

        <ContentSection
          title='Top Rated Movies'
          items={topRatedMovies}
          viewAllLink='/movies?sort=vote_average.desc'
        />

        <ContentSection
          title='Upcoming Movies'
          items={upcomingMovies}
          viewAllLink='/movies?sort=upcoming'
        />
      </div>
    </div>
  );
};

export default Home;
