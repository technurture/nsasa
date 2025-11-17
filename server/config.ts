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
  const port = parseInt(process.env.PORT || '5000', 10);

  let baseUrl: string;
  let frontendUrl: string;
  let apiUrl: string;
  let isLocal: boolean;

  // Priority order for URL configuration:
  // 1. Explicit environment variables (BASE_URL, FRONTEND_URL, API_URL)
  // 2. Replit deployment/dev domain
  // 3. Local development (localhost)

  // Check for explicit URL overrides (for standalone production deployments)
  const explicitBaseUrl = process.env.BASE_URL;
  const explicitFrontendUrl = process.env.FRONTEND_URL;
  const explicitApiUrl = process.env.API_URL;

  if (explicitBaseUrl || explicitFrontendUrl || explicitApiUrl) {
    // Standalone production or custom deployment
    baseUrl = explicitBaseUrl || explicitFrontendUrl || explicitApiUrl || `http://localhost:${port}`;
    frontendUrl = explicitFrontendUrl || baseUrl;
    apiUrl = explicitApiUrl || baseUrl;
    isLocal = false;
  } else if (process.env.REPLIT_DEPLOYMENT === '1') {
    // Replit production deployment
    const domain = process.env.REPLIT_DOMAINS?.split(',')[0];
    baseUrl = domain ? `https://${domain}` : 'https://your-app.replit.app';
    frontendUrl = baseUrl;
    apiUrl = baseUrl;
    isLocal = false;
  } else if (process.env.REPLIT_DEV_DOMAIN) {
    // Replit development environment
    baseUrl = `https://${process.env.REPLIT_DEV_DOMAIN}`;
    frontendUrl = baseUrl;
    apiUrl = baseUrl;
    isLocal = false;
  } else {
    // Local development
    baseUrl = `http://localhost:${port}`;
    frontendUrl = baseUrl;
    apiUrl = baseUrl;
    isLocal = true;
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
