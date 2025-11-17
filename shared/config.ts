export interface ClientConfig {
  apiUrl: string;
  baseUrl: string;
}

function getClientConfig(): ClientConfig {
  if (typeof window === 'undefined') {
    return {
      apiUrl: '',
      baseUrl: ''
    };
  }

  const origin = window.location.origin;
  
  return {
    apiUrl: origin,
    baseUrl: origin
  };
}

export const clientConfig = getClientConfig();

export function getApiUrl(): string {
  return clientConfig.apiUrl;
}

export function getBaseUrl(): string {
  return clientConfig.baseUrl;
}

export function getFullUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${clientConfig.baseUrl}${cleanPath}`;
}
