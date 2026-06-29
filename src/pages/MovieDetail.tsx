import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star, Play, Calendar, Clock, Heart, Bookmark, AlertCircle
} from 'lucide-react';
import { tmdbService } from '../services/tmdb';
import { omdbService } from '../services/omdb';
import type { Movie, Video, Cast, Crew, Review, OMDbData } from '../types';
import { getImageUrl } from '../api/client';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ContentSection } from '../components/home/ContentSection';
import { useUserContext } from '../hooks/useUserContext';

const MovieDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<Movie & {
    videos: { results: Video[] };
    credits: { cast: Cast[]; crew: Crew[] };
    reviews: { results: Review[] };
    similar: { results: Movie[] };
    recommendations: { results: Movie[] };
  } | null>(null);
  const [omdbData, setOmdbData] = useState<OMDbData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addFavorite, removeFavorite, addToWatchlist, removeFromWatchlist, isFavorite, isInWatchlist, addToHistory } = useUserContext();

  useEffect(() => {
    const fetchMovieData = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const movieData = await tmdbService.getMovieDetails(parseInt(id));
        setMovie(movieData);
        addToHistory(movieData);

        if (movieData.imdb_id) {
          try {
            const extra = await omdbService.getExtraMetadata(movieData.imdb_id);
            setOmdbData(extra);
          } catch (e) {
             console.error('OMDb fetch failed', e);
          }
        }
      } catch (err) {
        console.error('Failed to fetch movie details:', err);
        setError('Failed to load movie details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMovieData();
    window.scrollTo(0, 0);
  }, [id, addToHistory]);

  if (loading) {
    return <div className='container py-20 px-4 text-center'>Loading movie details...</div>;
  }

  if (error || !movie) {
    return (
      <div className='container py-40 px-4 text-center space-y-4'>
        <AlertCircle className='h-12 w-12 text-destructive mx-auto' />
        <h2 className='text-2xl font-bold'>Oops!</h2>
        <p className='text-muted-foreground'>{error || 'Movie not found.'}</p>
        <Link to='/'>
           <Button variant='outline'>Back to Home</Button>
        </Link>
      </div>
    );
  }

  const director = movie.credits.crew.find((p) => p.job === 'Director');
  const trailer = movie.videos.results.find((v) => v.type === 'Trailer' && v.site === 'YouTube');

  return (
    <div className='flex flex-col space-y-12 pb-20'>
      {/* Backdrop & Hero */}
      <div className='relative h-[60vh] w-full overflow-hidden'>
        <div className='absolute inset-0'>
          <img
            src={getImageUrl(movie.backdrop_path)}
            alt={movie.title}
            className='h-full w-full object-cover'
          />
          <div className='absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent' />
        </div>

        <div className='container relative h-full flex flex-col md:flex-row items-end pb-10 gap-8 px-4 mx-auto'>
          <div className='hidden md:block w-64 aspect-[2/3] rounded-lg overflow-hidden border shadow-2xl shrink-0'>
            <img src={getImageUrl(movie.poster_path, 'w500')} alt={movie.title} className='w-full h-full object-cover' />
          </div>
          <div className='flex-1 space-y-4'>
            <div className='flex flex-wrap gap-2'>
              {movie.genres?.map((g) => (
                <Badge key={g.id} variant='secondary'>{g.name}</Badge>
              ))}
            </div>
            <h1 className='text-4xl md:text-5xl font-bold'>{movie.title}</h1>
            <div className='flex flex-wrap items-center gap-6 text-sm md:text-base'>
              <div className='flex items-center gap-1 text-primary'>
                <Star className='h-5 w-5 fill-current' />
                <span className='font-bold'>{movie.vote_average.toFixed(1)}</span>
              </div>
              <div className='flex items-center gap-1'>
                <Calendar className='h-4 w-4' />
                <span>{new Date(movie.release_date).getFullYear()}</span>
              </div>
              <div className='flex items-center gap-1'>
                <Clock className='h-4 w-4' />
                <span>{movie.runtime} min</span>
              </div>
            </div>
            <div className='flex flex-wrap gap-4 pt-4'>
              <Button size='lg' className='gap-2' onClick={() => window.open(trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : '#', '_blank')}>
                <Play className='h-5 w-5 fill-current' /> Watch Trailer
              </Button>
              <Button size='icon' variant='outline' onClick={() => isFavorite(movie.id) ? removeFavorite(movie.id) : addFavorite(movie)}>
                <Heart className={isFavorite(movie.id) ? 'fill-destructive text-destructive' : ''} />
              </Button>
              <Button size='icon' variant='outline' onClick={() => isInWatchlist(movie.id) ? removeFromWatchlist(movie.id) : addToWatchlist(movie)}>
                <Bookmark className={isInWatchlist(movie.id) ? 'fill-primary text-primary' : ''} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className='container px-4 mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12'>
        <div className='lg:col-span-2 space-y-8'>
          <section className='space-y-4'>
            <h2 className='text-2xl font-bold'>Overview</h2>
            <p className='text-lg text-muted-foreground leading-relaxed'>{movie.overview}</p>
          </section>

          <section className='space-y-4'>
            <h2 className='text-2xl font-bold'>Top Cast</h2>
            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6'>
              {movie.credits.cast.slice(0, 5).map((person) => (
                <Link key={person.id} to={`/person/${person.id}`} className='space-y-2 group'>
                  <div className='aspect-square rounded-full overflow-hidden border bg-muted'>
                    <img
                      src={getImageUrl(person.profile_path, 'w185')}
                      alt={person.name}
                      className='w-full h-full object-cover transition-transform group-hover:scale-110'
                    />
                  </div>
                  <div className='text-center'>
                    <p className='font-semibold text-sm line-clamp-1'>{person.name}</p>
                    <p className='text-xs text-muted-foreground line-clamp-1'>{person.character}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {movie.reviews.results.length > 0 && (
            <section className='space-y-4'>
              <h2 className='text-2xl font-bold'>Reviews</h2>
              <div className='space-y-4'>
                {movie.reviews.results.slice(0, 2).map((review) => (
                  <div key={review.id} className='p-4 rounded-lg bg-muted/50 border'>
                    <p className='font-semibold mb-2'>{review.author}</p>
                    <p className='text-sm text-muted-foreground line-clamp-4'>{review.content}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className='space-y-8'>
          <section className='space-y-4 p-6 rounded-xl bg-muted/30 border'>
            <h2 className='text-xl font-bold'>Information</h2>
            <div className='space-y-4 text-sm'>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Director</span>
                <span className='font-medium'>{director?.name || 'N/A'}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Budget</span>
                <span className='font-medium'>${movie.budget?.toLocaleString() || 'N/A'}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Revenue</span>
                <span className='font-medium'>${movie.revenue?.toLocaleString() || 'N/A'}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Awards</span>
                <span className='font-medium text-right'>{omdbData?.Awards || 'N/A'}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Box Office</span>
                <span className='font-medium'>{omdbData?.BoxOffice || 'N/A'}</span>
              </div>
            </div>
          </section>

          <section className='space-y-4'>
             <h2 className='text-xl font-bold'>Production</h2>
             <div className='flex flex-wrap gap-4'>
               {movie.production_companies?.slice(0, 3).map(c => (
                 c.logo_path && (
                   <img key={c.id} src={getImageUrl(c.logo_path, 'w92')} alt={c.name} className='h-8 object-contain filter grayscale invert brightness-0 dark:invert-0 dark:brightness-100 opacity-50' />
                 )
               ))}
             </div>
          </section>
        </div>
      </div>

      <div className='container px-4 mx-auto space-y-12'>
        <ContentSection title='Recommendations' items={movie.recommendations.results} />
        <ContentSection title='Similar Movies' items={movie.similar.results} />
      </div>
    </div>
  );
};

export default MovieDetail;
