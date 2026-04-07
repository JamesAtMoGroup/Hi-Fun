import type { Knex } from 'knex';

const defaults: Partial<Knex.Config> = {
  client: 'pg',
  migrations: {
    directory: './migrations',
    extension: 'ts',
  },
  seeds: {
    directory: './seeds',
    extension: 'ts',
  },
};

const config: Record<string, Knex.Config> = {
  development: {
    ...defaults,
    connection: process.env.DATABASE_URL || 'postgresql://localhost:5432/fomo',
  },
  production: {
    ...defaults,
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    },
    pool: {
      min: 2,
      max: 10,
    },
  },
};

export default config;
