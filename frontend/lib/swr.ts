import useSWR, { SWRConfiguration } from 'swr';
import { apiFetch, ApiError } from './api';

export function useAuthedSWR<T>(
  path: string | null,
  token: string | null,
  config?: SWRConfiguration,
) {
  const key = path && token ? [path, token] : null;

  return useSWR<T, ApiError>(
    key,
    ([url, tkn]: [string, string]) => apiFetch<T>(url, { token: tkn }),
    { revalidateOnFocus: false, ...config },
  );
}
