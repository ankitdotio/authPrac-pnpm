import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
import { project } from './config/config.js';

export default defineConfig({
  out: './drizzle',
  schema: './db/models/',
  dialect: 'postgresql',
  dbCredentials: {
    url: project.db_url,
  },
});
