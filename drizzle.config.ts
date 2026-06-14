import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
import { project } from './config/config.js';

export default defineConfig({
  out: './drizzle',
  schema: './db/models/user.model.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: project.db_url,
  },
});
