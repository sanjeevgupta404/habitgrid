import { tmdbClient } from '../api/client';
import type { Movie, TVShow, Genre } from '../types';

export const tmdbService = {
  // Movies
  getTrendingMovies: async (timeWindow: 'day' | 'week' = 'day') => {
    const { data } = await tmdbClient.get(`/trending/movie/${timeWindow}`);
    return data.results as Movie[];
  },
  getPopularMovies: async (page = 1) => {
    const { data } = await tmdbClient.get('/movie/popular', { params: { page } });
    return data.results as Movie[];
  },
  getTopRatedMovies: async (page = 1) => {
    const { data } = await tmdbClient.get('/movie/top_rated', { params: { page } });
    return data.results as Movie[];
  },
  getUpcomingMovies: async (page = 1) => {
    const { data } = await tmdbClient.get('/movie/upcoming', { params: { page } });
    return data.results as Movie[];
  },
  getMovieDetails: async (id: number) => {
    const { data } = await tmdbClient.get(`/movie/${id}`, {
      params: { append_to_response: 'videos,credits,reviews,similar,recommendations' },
    });
    return data;
  },

  // TV Shows
  getTrendingTV: async (timeWindow: 'day' | 'week' = 'day') => {
    const { data } = await tmdbClient.get(`/trending/tv/${timeWindow}`);
    return data.results as TVShow[];
  },
  getPopularTV: async (page = 1) => {
    const { data } = await tmdbClient.get('/tv/popular', { params: { page } });
    return data.results as TVShow[];
  },
  getTopRatedTV: async (page = 1) => {
    const { data } = await tmdbClient.get('/tv/top_rated', { params: { page } });
    return data.results as TVShow[];
  },
  getTVDetails: async (id: number) => {
    const { data } = await tmdbClient.get(`/tv/${id}`, {
      params: { append_to_response: 'videos,credits,reviews,similar,recommendations,external_ids' },
    });
    return data;
  },
  getSeasonDetails: async (tvId: number, seasonNumber: number) => {
    const { data } = await tmdbClient.get(`/tv/${tvId}/season/${seasonNumber}`);
    return data;
  },

  // Search
  searchMulti: async (query: string, page = 1) => {
    const { data } = await tmdbClient.get('/search/multi', { params: { query, page } });
    return data;
  },

  // Discover
  discover: async (type: 'movie' | 'tv', params: any) => {
    const { data } = await tmdbClient.get(`/discover/${type}`, { params });
    return data;
  },

  // People
  getPersonDetails: async (id: number) => {
    const { data } = await tmdbClient.get(`/person/${id}`, {
      params: { append_to_response: 'combined_credits,images' },
    });
    return data;
  },

  // Genres
  getGenres: async (type: 'movie' | 'tv') => {
    const { data } = await tmdbClient.get(`/genre/${type}/list`);
    return data.genres as Genre[];
  },
};
