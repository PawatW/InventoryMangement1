import useSWR, { SWRConfiguration } from 'swr';
import { apiFetch, ApiError } from './api';
import { isTokenExpired } from './auth';

function authedFetcher<T>(path: string): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token && isTokenExpired(token)) {
    localStorage.removeItem('token');
    window.location.href = '/login';
    return Promise.reject(new ApiError(401, 'Session expired'));
  }
  return apiFetch<T>(path);
}

export function useAuthedSWR<T>(
  path: string | null,
  config?: SWRConfiguration,
) {
  return useSWR<T, ApiError>(path, authedFetcher, {
    revalidateOnFocus: false,
    ...config,
  });
}
