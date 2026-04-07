import knex from 'knex';
import knexConfig from '../../knexfile';
import { config } from './index';

const environment = config.nodeEnv === 'production' ? 'production' : 'development';

export const db = knex(knexConfig[environment]);
