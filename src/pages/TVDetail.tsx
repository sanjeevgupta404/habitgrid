import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star, Play, Calendar, Tv, ListChecks, Heart, Bookmark, AlertCircle
} from 'lucide-react';
import { tmdbService } from '../services/tmdb';
import type { TVShow, Video, Cast, Crew, Review } from '../types';
import { getImageUrl } from '../api/client';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ContentSection } from '../components/home/ContentSection';
import { useUserContext } from '../hooks/useUserContext';

const TVDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [show, setShow] = useState<TVShow & {
    videos: { results: Video[] };
    credits: { cast: Cast[]; crew: Crew[] };
    reviews: { results: Review[] };
    similar: { results: TVShow[] };
    recommendations: { results: TVShow[] };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
  const [seasonData, setSeasonData] = useState<any>(null);

  const { addFavorite, removeFavorite, addToWatchlist, removeFromWatchlist, isFavorite, isInWatchlist, addToHistory } = useUserContext();

  useEffect(() => {
    const fetchTVData = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const tvData = await tmdbService.getTVDetails(parseInt(id));
        setShow(tvData);
        addToHistory(tvData);
        if (tvData.seasons && tvData.seasons.length > 0) {
          setSelectedSeason(tvData.seasons[0].season_number);
        }
      } catch (err) {
        console.error('Failed to fetch TV details:', err);
        setError('Failed to load TV show details.');
      } finally {
        setLoading(false);
      }
    };

    fetchTVData();
    window.scrollTo(0, 0);
  }, [id, addToHistory]);

  useEffect(() => {
    const fetchSeason = async () => {
      if (show && selectedSeason !== null) {
        try {
          const data = await tmdbService.getSeasonDetails(show.id, selectedSeason);
          setSeasonData(data);
        } catch (error) {
          console.error('Failed to fetch season details:', error);
        }
      }
    };
    fetchSeason();
  }, [show, selectedSeason]);

  if (loading) {
    return <div className='container py-20 px-4 text-center'>Loading TV show details...</div>;
  }

  if (error || !show) {
    return (
      <div className='container py-40 px-4 text-center space-y-4'>
        <AlertCircle className='h-12 w-12 text-destructive mx-auto' />
        <h2 className='text-2xl font-bold'>Oops!</h2>
        <p className='text-muted-foreground'>{error || 'TV show not found.'}</p>
        <Link to='/'>
           <Button variant='outline'>Back to Home</Button>
        </Link>
      </div>
    );
  }

  const trailer = show.videos.results.find((v) => v.type === 'Trailer' && v.site === 'YouTube');

  return (
    <div className='flex flex-col space-y-12 pb-20'>
      {/* Backdrop & Hero */}
      <div className='relative h-[60vh] w-full overflow-hidden'>
        <div className='absolute inset-0'>
          <img
            src={getImageUrl(show.backdrop_path)}
            alt={show.name}
            className='h-full w-full object-cover'
          />
          <div className='absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent' />
        </div>

        <div className='container relative h-full flex flex-col md:flex-row items-end pb-10 gap-8 px-4 mx-auto'>
          <div className='hidden md:block w-64 aspect-[2/3] rounded-lg overflow-hidden border shadow-2xl shrink-0'>
            <img src={getImageUrl(show.poster_path, 'w500')} alt={show.name} className='w-full h-full object-cover' />
          </div>
          <div className='flex-1 space-y-4'>
            <div className='flex flex-wrap gap-2'>
              {show.genres?.map((g) => (
                <Badge key={g.id} variant='secondary'>{g.name}</Badge>
              ))}
            </div>
            <h1 className='text-4xl md:text-5xl font-bold'>{show.name}</h1>
            <div className='flex flex-wrap items-center gap-6 text-sm md:text-base'>
              <div className='flex items-center gap-1 text-primary'>
                <Star className='h-5 w-5 fill-current' />
                <span className='font-bold'>{show.vote_average.toFixed(1)}</span>
              </div>
              <div className='flex items-center gap-1'>
                <Tv className='h-4 w-4' />
                <span>{show.number_of_seasons} Seasons</span>
              </div>
              <div className='flex items-center gap-1'>
                <Calendar className='h-4 w-4' />
                <span>{new Date(show.first_air_date).getFullYear()}</span>
              </div>
            </div>
            <div className='flex flex-wrap gap-4 pt-4'>
              <Button size='lg' className='gap-2' onClick={() => window.open(trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : '#', '_blank')}>
                <Play className='h-5 w-5 fill-current' /> Watch Trailer
              </Button>
              <Button size='icon' variant='outline' onClick={() => isFavorite(show.id) ? removeFavorite(show.id) : addFavorite(show)}>
                <Heart className={isFavorite(show.id) ? 'fill-destructive text-destructive' : ''} />
              </Button>
              <Button size='icon' variant='outline' onClick={() => isInWatchlist(show.id) ? removeFromWatchlist(show.id) : addToWatchlist(show)}>
                <Bookmark className={isInWatchlist(show.id) ? 'fill-primary text-primary' : ''} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className='container px-4 mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12'>
        <div className='lg:col-span-2 space-y-12'>
          <section className='space-y-4'>
            <h2 className='text-2xl font-bold'>Overview</h2>
            <p className='text-lg text-muted-foreground leading-relaxed'>{show.overview}</p>
          </section>

          <section className='space-y-6'>
            <div className='flex items-center justify-between'>
              <h2 className='text-2xl font-bold'>Seasons</h2>
              <select
                className='bg-muted rounded-md px-3 py-2 text-sm outline-none focus:ring-1 ring-primary'
                value={selectedSeason || ''}
                onChange={(e) => setSelectedSeason(parseInt(e.target.value))}
              >
                {show.seasons?.map((s) => (
                  <option key={s.id} value={s.season_number}>{s.name}</option>
                ))}
              </select>
            </div>

            {seasonData && (
              <div className='space-y-4'>
                <div className='flex gap-4 p-4 rounded-lg bg-muted/30 border'>
                  <img src={getImageUrl(seasonData.poster_path, 'w185')} alt={seasonData.name} className='w-24 rounded shadow' />
                  <div>
                    <h3 className='font-bold text-lg'>{seasonData.name}</h3>
                    <p className='text-sm text-muted-foreground'>{seasonData.episodes.length} Episodes • {new Date(seasonData.air_date).getFullYear()}</p>
                    <p className='text-sm mt-2 line-clamp-2'>{seasonData.overview || 'No overview available.'}</p>
                  </div>
                </div>

                <div className='grid gap-4'>
                  {seasonData.episodes.slice(0, 10).map((ep: any) => (
                    <div key={ep.id} className='flex gap-4 items-center group cursor-pointer'>
                      <div className='w-32 aspect-video bg-muted rounded overflow-hidden shrink-0'>
                         <img src={getImageUrl(ep.still_path, 'w300')} alt={ep.name} className='w-full h-full object-cover transition-transform group-hover:scale-105' />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <p className='text-xs text-primary font-bold'>Episode {ep.episode_number}</p>
                        <h4 className='font-semibold line-clamp-1'>{ep.name}</h4>
                        <p className='text-xs text-muted-foreground line-clamp-1'>{ep.overview}</p>
                      </div>
                      <Button variant='ghost' size='icon'><ListChecks className='h-4 w-4' /></Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section className='space-y-4'>
            <h2 className='text-2xl font-bold'>Top Cast</h2>
            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6'>
              {show.credits.cast.slice(0, 5).map((person) => (
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
        </div>

        <div className='space-y-8'>
          <section className='space-y-4 p-6 rounded-xl bg-muted/30 border'>
            <h2 className='text-xl font-bold'>Information</h2>
            <div className='space-y-4 text-sm'>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Status</span>
                <span className='font-medium'>{show.status}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Network</span>
                <span className='font-medium'>{show.networks?.[0]?.name || 'N/A'}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Type</span>
                <span className='font-medium'>{show.type}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Last Air Date</span>
                <span className='font-medium'>{show.last_air_date ? new Date(show.last_air_date).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
          </section>

          <section className='space-y-4'>
             <h2 className='text-xl font-bold'>Created By</h2>
             <div className='grid grid-cols-2 gap-4'>
                {show.created_by?.map(c => (
                  <div key={c.id} className='text-center space-y-2'>
                    <img src={getImageUrl(c.profile_path, 'w185')} alt={c.name} className='w-full aspect-square object-cover rounded-lg border' />
                    <p className='text-xs font-medium'>{c.name}</p>
                  </div>
                ))}
             </div>
          </section>
        </div>
      </div>

      <div className='container px-4 mx-auto space-y-12'>
        <ContentSection title='Recommendations' items={show.recommendations.results} />
        <ContentSection title='Similar Shows' items={show.similar.results} />
      </div>
    </div>
  );
};

export default TVDetail;
