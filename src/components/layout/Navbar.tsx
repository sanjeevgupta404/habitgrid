import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, Moon, Sun, User } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAppContext } from '../../hooks/useAppContext';
import { Input } from '../ui/Input';
import { tmdbService } from '../../services/tmdb';
import { getImageUrl } from '../../api/client';

export const Navbar = () => {
  const { theme, toggleTheme, toggleSidebar } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const suggestionRef = useRef<HTMLDivElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length > 2) {
        try {
          const data = await tmdbService.searchMulti(searchQuery);
          setSuggestions(data.results.slice(0, 6));
          setShowSuggestions(true);
        } catch (error) {
          console.error('Suggestion fetch error:', error);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='container flex h-16 items-center justify-between px-4 mx-auto'>
        <div className='flex items-center gap-6 md:gap-10'>
          <Link to='/' className='flex items-center space-x-2'>
            <span className='inline-block font-bold text-2xl bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent'>
              CineVerse
            </span>
          </Link>
          <div className='hidden md:flex gap-6'>
            <Link to='/movies' className='text-sm font-medium hover:text-primary transition-colors'>
              Movies
            </Link>
            <Link to='/tv' className='text-sm font-medium hover:text-primary transition-colors'>
              TV Shows
            </Link>
            <Link to='/discover' className='text-sm font-medium hover:text-primary transition-colors'>
              Discover
            </Link>
            <Link to='/compare' className='text-sm font-medium hover:text-primary transition-colors'>
              Compare
            </Link>
          </div>
        </div>

        <div className='flex flex-1 items-center justify-end space-x-4'>
          <div className='hidden md:flex relative w-full max-w-sm' ref={suggestionRef}>
            <form onSubmit={handleSearch} className='relative w-full'>
              <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
              <Input
                type='search'
                placeholder='Search movies, TV shows...'
                className='pl-9 bg-muted/50 border-none focus-visible:ring-1'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length > 2 && setShowSuggestions(true)}
              />
            </form>

            {showSuggestions && suggestions.length > 0 && (
              <div className='absolute top-full mt-2 w-full bg-popover border rounded-lg shadow-xl overflow-hidden'>
                {suggestions.map((s) => (
                  <Link
                    key={`${s.media_type}-${s.id}`}
                    to={`/${s.media_type}/${s.id}`}
                    className='flex items-center gap-3 p-2 hover:bg-accent transition-colors'
                    onClick={() => setShowSuggestions(false)}
                  >
                    <img
                      src={getImageUrl(s.poster_path || s.profile_path, 'w92')}
                      className='w-8 h-12 object-cover rounded'
                      alt=''
                    />
                    <div className='min-w-0'>
                      <p className='text-sm font-medium truncate'>{s.title || s.name}</p>
                      <p className='text-xs text-muted-foreground capitalize'>{s.media_type} • {new Date(s.release_date || s.first_air_date || 0).getFullYear() || 'N/A'}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className='flex items-center space-x-2'>
            <Button variant='ghost' size='icon' onClick={toggleTheme}>
              {theme === 'light' ? <Moon className='h-5 w-5' /> : <Sun className='h-5 w-5' />}
            </Button>
            <Link to='/profile'>
              <Button variant='ghost' size='icon'>
                <User className='h-5 w-5' />
              </Button>
            </Link>
            <Button variant='ghost' size='icon' className='md:hidden' onClick={toggleSidebar}>
              <Menu className='h-5 w-5' />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
