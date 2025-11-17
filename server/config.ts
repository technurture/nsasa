export interface EnvironmentConfig {
  isDevelopment: boolean;
  isProduction: boolean;
  isReplit: boolean;
  isLocal: boolean;
  baseUrl: string;
  apiUrl: string;
  frontendUrl: string;
  port: number;
}

function getEnvironmentConfig(): EnvironmentConfig {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isDevelopment = nodeEnv === 'development';
  const isProduction = nodeEnv === 'production';
  const isReplit = Boolean(process.env.REPLIT_DEPLOYMENT || process.env.REPLIT_DEV_DOMAIN);
  const isLocal = !isReplit;
  const port = parseInt(process.env.PORT || '5000', 10);

  let baseUrl: string;
  let frontendUrl: string;
  let apiUrl: string;

  if (isLocal) {
    baseUrl = `http://localhost:${port}`;
    frontendUrl = baseUrl;
    apiUrl = baseUrl;
  } else if (process.env.REPLIT_DEPLOYMENT === '1') {
    const domain = process.env.REPLIT_DOMAINS?.split(',')[0];
    baseUrl = domain ? `https://${domain}` : 'https://your-app.replit.app';
    frontendUrl = baseUrl;
    apiUrl = baseUrl;
  } else if (process.env.REPLIT_DEV_DOMAIN) {
    baseUrl = `https://${process.env.REPLIT_DEV_DOMAIN}`;
    frontendUrl = baseUrl;
    apiUrl = baseUrl;
  } else {
    baseUrl = `http://localhost:${port}`;
    frontendUrl = baseUrl;
    apiUrl = baseUrl;
  }

  return {
    isDevelopment,
    isProduction,
    isReplit,
    isLocal,
    baseUrl,
    apiUrl,
    frontendUrl,
    port,
  };
}

export const config = getEnvironmentConfig();

export function getBaseUrl(): string {
  return config.baseUrl;
}

export function getApiUrl(): string {
  return config.apiUrl;
}

export function getFrontendUrl(): string {
  return config.frontendUrl;
}

export function getFullUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${config.baseUrl}${cleanPath}`;
}

export function logEnvironmentInfo(): void {
  console.log('Environment Configuration:');
  console.log(`  Environment: ${config.isDevelopment ? 'Development' : 'Production'}`);
  console.log(`  Platform: ${config.isReplit ? 'Replit' : 'Local'}`);
  console.log(`  Base URL: ${config.baseUrl}`);
  console.log(`  API URL: ${config.apiUrl}`);
  console.log(`  Frontend URL: ${config.frontendUrl}`);
  console.log(`  Port: ${config.port}`);
}
