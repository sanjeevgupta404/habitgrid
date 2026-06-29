import { useEffect, useState, useMemo } from 'react';
import { RefreshCw, Quote, Heart, Bookmark, History, Settings, List } from 'lucide-react';
import { useUserContext } from '../hooks/useUserContext';
import { ContentCard } from '../components/home/ContentCard';
import { AIAssistant } from '../components/ai/AIAssistant';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { tmdbService } from '../services/tmdb';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { favorites, watchlist, history, watching, planToWatch, completed } = useUserContext();
  const [activeTab, setActiveTab] = useState<'favorites' | 'watchlist' | 'history' | 'ai' | 'status'>('favorites');
  const [activeStatusTab, setActiveStatusTab] = useState<'watching' | 'planToWatch' | 'completed'>('watching');
  const [randomQuote, setRandomQuote] = useState({ text: '', movie: '' });
  const navigate = useNavigate();

  const quotes = useMemo(() => [
    { text: "May the Force be with you.", movie: "Star Wars" },
    { text: "I'm going to make him an offer he can't refuse.", movie: "The Godfather" },
    { text: "Here's looking at you, kid.", movie: "Casablanca" },
    { text: "There's no place like home.", movie: "The Wizard of Oz" },
    { text: "I'll be back.", movie: "The Terminator" },
  ], []);

  useEffect(() => {
    setRandomQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, [quotes]);

  const handleRandom = async () => {
    const isMovie = Math.random() > 0.5;
    const page = Math.floor(Math.random() * 10) + 1;
    const data = isMovie ? await tmdbService.getPopularMovies(page) : await tmdbService.getPopularTV(page);
    const randomItem = data[Math.floor(Math.random() * data.length)];
    navigate(`/${isMovie ? 'movie' : 'tv'}/${randomItem.id}`);
  };

  const getItemsForTab = () => {
    switch (activeTab) {
      case 'favorites': return favorites;
      case 'watchlist': return watchlist;
      case 'history': return history;
      case 'status':
        if (activeStatusTab === 'watching') return watching;
        if (activeStatusTab === 'planToWatch') return planToWatch;
        return completed;
      default: return [];
    }
  };

  return (
    <div className='container px-4 py-10 space-y-12 mx-auto'>
      <div className='flex flex-col md:flex-row items-center justify-between gap-8 bg-muted/30 p-8 rounded-2xl border'>
        <div className='flex items-center gap-6'>
          <div className='h-24 w-24 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-4xl font-bold text-white'>
            U
          </div>
          <div>
            <h1 className='text-3xl font-bold'>Guest User</h1>
            <p className='text-muted-foreground'>Managing your collections & preferences</p>
          </div>
        </div>
        <div className='flex gap-4'>
           <Button variant='outline' className='gap-2' onClick={handleRandom}>
             <RefreshCw className='h-4 w-4' /> Random Pick
           </Button>
           <Button variant='outline' size='icon'>
             <Settings className='h-4 w-4' />
           </Button>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        <div className='lg:col-span-2 space-y-8'>
          <div className='flex border-b overflow-x-auto no-scrollbar'>
             {['favorites', 'watchlist', 'status', 'history', 'ai'].map((tab) => (
               <button
                 key={tab}
                 className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap capitalize ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                 onClick={() => setActiveTab(tab as any)}
               >
                 {tab}
               </button>
             ))}
          </div>

          <div className='min-h-[400px]'>
            {activeTab === 'ai' ? (
              <AIAssistant />
            ) : (
              <div className='space-y-6'>
                {activeTab === 'status' && (
                  <div className='flex gap-2'>
                    {['watching', 'planToWatch', 'completed'].map((st) => (
                       <Button
                         key={st}
                         variant={activeStatusTab === st ? 'primary' : 'outline'}
                         size='sm'
                         onClick={() => setActiveStatusTab(st as any)}
                         className='capitalize'
                       >
                         {st.replace('planToWatch', 'Plan to Watch')}
                       </Button>
                    ))}
                  </div>
                )}
                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6'>
                  {getItemsForTab().map((item) => (
                    <ContentCard key={item.id} item={item} />
                  ))}
                  {getItemsForTab().length === 0 && (
                    <div className='col-span-full py-20 text-center text-muted-foreground border-2 border-dashed rounded-xl'>
                      No items found in this collection.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className='space-y-8'>
          <Card className='bg-primary text-primary-foreground overflow-hidden relative'>
            <Quote className='absolute -right-4 -bottom-4 h-24 w-24 opacity-10 rotate-12' />
            <CardContent className='p-8 space-y-4'>
              <h3 className='text-lg font-bold flex items-center gap-2'>
                <Quote className='h-5 w-5' /> Quote of the Day
              </h3>
              <p className='text-xl italic font-serif'>"{randomQuote.text}"</p>
              <p className='text-sm opacity-80 text-right'>— {randomQuote.movie}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6 space-y-4'>
              <h3 className='font-bold flex items-center gap-2'><List className='h-4 w-4' /> Quick Stats</h3>
              <div className='space-y-4'>
                {[
                  { label: 'Favorites', icon: Heart, count: favorites.length },
                  { label: 'Watchlist', icon: Bookmark, count: watchlist.length },
                  { label: 'History', icon: History, count: history.length },
                  { label: 'Watching', icon: List, count: watching.length },
                ].map((stat) => (
                  <div key={stat.label} className='flex justify-between items-center'>
                    <span className='text-sm text-muted-foreground flex items-center gap-2'>
                      <stat.icon className='h-4 w-4' /> {stat.label}
                    </span>
                    <span className='font-bold'>{stat.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
