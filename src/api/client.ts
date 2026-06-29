import axios from 'axios';

const TMDB_BASE_URL = import.meta.env.VITE_TMDB_BASE_URL || 'https://api.themoviedb.org/3';
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

export const tmdbClient = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
  },
});

export const omdbClient = axios.create({
  baseURL: 'https://www.omdbapi.com/',
  params: {
    apikey: import.meta.env.VITE_OMDB_API_KEY,
  },
});

export const getImageUrl = (path: string | null, size: string = 'original') => {
  if (!path) return '';
  return `https://image.tmdb.org/t/p/${size}${path}`;
};
