import knex from 'knex';
import { config } from './index';

const knexConfig = {
  client: 'pg',
  connection: config.databaseUrl,
  pool: { min: 2, max: 10 },
  migrations: {
    directory: '../migrations',
    extension: 'ts',
  },
  seeds: {
    directory: '../seeds',
  },
};

export const db = knex(knexConfig);
