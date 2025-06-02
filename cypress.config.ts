import { defineConfig } from 'cypress';
import dotenv from 'dotenv';
dotenv.config({
  path: '.env.test',
});

export default defineConfig({
  projectId: process.env.CYPRESS_PROJECT_ID,
  e2e: {
    baseUrl: `http://localhost:${process.env.HTTP_PORT}`,
    specPattern: 'tests/e2e/**/*.cy.{ts,js}',
    supportFile: false,
    projectId: process.env.CYPRESS_PROJECT_ID,
  },
});
