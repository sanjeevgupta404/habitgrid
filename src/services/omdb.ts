import { omdbClient } from '../api/client';
import type { OMDbData } from '../types';

export const omdbService = {
  getExtraMetadata: async (imdbId: string) => {
    const { data } = await omdbClient.get('', { params: { i: imdbId } });
    return data as OMDbData;
  },
};
