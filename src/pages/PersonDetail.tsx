import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { tmdbService } from '../services/tmdb';
import type { Person, Movie, TVShow } from '../types';
import { getImageUrl } from '../api/client';
import { ContentCard } from '../components/home/ContentCard';

const PersonDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [person, setPerson] = useState<Person & {
    combined_credits: { cast: (Movie | TVShow)[]; crew: (Movie | TVShow)[] }
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerson = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await tmdbService.getPersonDetails(parseInt(id));
        setPerson(data);
      } catch (error) {
        console.error('Failed to fetch person details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPerson();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading || !person) {
    return <div className='container py-20 px-4'>Loading profile...</div>;
  }

  const knownFor = person.combined_credits.cast
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 8);

  return (
    <div className='container px-4 py-10 space-y-12'>
      <div className='flex flex-col md:flex-row gap-8'>
        <div className='w-full md:w-80 shrink-0'>
          <div className='aspect-[2/3] rounded-xl overflow-hidden border bg-muted'>
            <img
              src={getImageUrl(person.profile_path, 'h632')}
              alt={person.name}
              className='w-full h-full object-cover'
            />
          </div>
          <div className='mt-6 space-y-4'>
            <h2 className='text-xl font-bold'>Personal Info</h2>
            <div className='space-y-2 text-sm'>
              <div>
                <p className='text-muted-foreground'>Known For</p>
                <p>{person.known_for_department}</p>
              </div>
              <div>
                <p className='text-muted-foreground'>Gender</p>
                <p>{person.gender === 1 ? 'Female' : 'Male'}</p>
              </div>
              <div>
                <p className='text-muted-foreground'>Birthday</p>
                <p>{person.birthday || 'N/A'}</p>
              </div>
              <div>
                <p className='text-muted-foreground'>Place of Birth</p>
                <p>{person.place_of_birth || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className='flex-1 space-y-8'>
          <div className='space-y-4'>
            <h1 className='text-4xl font-bold'>{person.name}</h1>
            <div className='space-y-2'>
              <h2 className='text-xl font-semibold'>Biography</h2>
              <p className='text-muted-foreground leading-relaxed whitespace-pre-wrap'>
                {person.biography || `We don't have a biography for ${person.name}.`}
              </p>
            </div>
          </div>

          <div className='space-y-6'>
            <h2 className='text-2xl font-bold'>Known For</h2>
            <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6'>
              {knownFor.map((item) => (
                <ContentCard key={`${item.id}-${(item as Movie).title ? 'movie' : 'tv'}`} item={item} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonDetail;
