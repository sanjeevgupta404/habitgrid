import { createContext, useState, useEffect, useCallback } from 'react';
import type { Movie, TVShow } from '../types';

interface UserContextType {
  favorites: (Movie | TVShow)[];
  watchlist: (Movie | TVShow)[];
  history: (Movie | TVShow)[];
  watching: (Movie | TVShow)[];
  planToWatch: (Movie | TVShow)[];
  completed: (Movie | TVShow)[];
  addFavorite: (item: Movie | TVShow) => void;
  removeFavorite: (id: number) => void;
  addToWatchlist: (item: Movie | TVShow) => void;
  removeFromWatchlist: (id: number) => void;
  addToHistory: (item: Movie | TVShow) => void;
  updateStatus: (item: Movie | TVShow, status: 'watching' | 'planToWatch' | 'completed' | 'none') => void;
  isFavorite: (id: number) => boolean;
  isInWatchlist: (id: number) => boolean;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<(Movie | TVShow)[]>([]);
  const [watchlist, setWatchlist] = useState<(Movie | TVShow)[]>([]);
  const [history, setHistory] = useState<(Movie | TVShow)[]>([]);
  const [watching, setWatching] = useState<(Movie | TVShow)[]>([]);
  const [planToWatch, setPlanToWatch] = useState<(Movie | TVShow)[]>([]);
  const [completed, setCompleted] = useState<(Movie | TVShow)[]>([]);

  useEffect(() => {
    const load = (key: string) => {
       const data = localStorage.getItem(key);
       return data ? JSON.parse(data) : [];
    };

    setFavorites(load('favorites'));
    setWatchlist(load('watchlist'));
    setHistory(load('history'));
    setWatching(load('watching'));
    setPlanToWatch(load('planToWatch'));
    setCompleted(load('completed'));
  }, []);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
    localStorage.setItem('history', JSON.stringify(history));
    localStorage.setItem('watching', JSON.stringify(watching));
    localStorage.setItem('planToWatch', JSON.stringify(planToWatch));
    localStorage.setItem('completed', JSON.stringify(completed));
  }, [favorites, watchlist, history, watching, planToWatch, completed]);

  const addFavorite = (item: Movie | TVShow) => {
    setFavorites((prev) => [...prev.filter((i) => i.id !== item.id), item]);
  };

  const removeFavorite = (id: number) => {
    setFavorites((prev) => prev.filter((item) => item.id !== id));
  };

  const addToWatchlist = (item: Movie | TVShow) => {
    setWatchlist((prev) => [...prev.filter((i) => i.id !== item.id), item]);
  };

  const removeFromWatchlist = (id: number) => {
    setWatchlist((prev) => prev.filter((item) => item.id !== id));
  };

  const addToHistory = useCallback((item: Movie | TVShow) => {
    setHistory((prev) => [item, ...prev.filter((i) => i.id !== item.id)].slice(0, 50));
  }, []);

  const updateStatus = (item: Movie | TVShow, status: 'watching' | 'planToWatch' | 'completed' | 'none') => {
     setWatching(prev => prev.filter(i => i.id !== item.id));
     setPlanToWatch(prev => prev.filter(i => i.id !== item.id));
     setCompleted(prev => prev.filter(i => i.id !== item.id));

     if (status === 'watching') setWatching(prev => [...prev, item]);
     if (status === 'planToWatch') setPlanToWatch(prev => [...prev, item]);
     if (status === 'completed') setCompleted(prev => [...prev, item]);
  };

  const isFavorite = (id: number) => favorites.some((item) => item.id === id);
  const isInWatchlist = (id: number) => watchlist.some((item) => item.id === id);

  return (
    <UserContext.Provider
      value={{
        favorites,
        watchlist,
        history,
        watching,
        planToWatch,
        completed,
        addFavorite,
        removeFavorite,
        addToWatchlist,
        removeFromWatchlist,
        addToHistory,
        updateStatus,
        isFavorite,
        isInWatchlist,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
