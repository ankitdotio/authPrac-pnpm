import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { project } from '../config/config.js';

export const db = drizzle(project.db_url);
