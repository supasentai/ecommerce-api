interface EnvConfig {
  DATABASE_URL?: string;
  JWT_SECRET?: string;
  JWT_EXPIRES_IN?: string;
  PORT?: string;
}

export function validateEnv(config: EnvConfig) {
  const errors: string[] = [];

  if (!config.DATABASE_URL) {
    errors.push('DATABASE_URL is required');
  }

  if (!config.JWT_SECRET) {
    errors.push('JWT_SECRET is required');
  }

  const port = config.PORT ? Number(config.PORT) : 3000;

  if (!Number.isInteger(port) || port <= 0) {
    errors.push('PORT must be a positive integer');
  }

  if (errors.length > 0) {
    throw new Error(`Environment validation failed: ${errors.join(', ')}`);
  }

  return {
    ...config,
    PORT: port,
    JWT_EXPIRES_IN: config.JWT_EXPIRES_IN || '7d',
  };
}
