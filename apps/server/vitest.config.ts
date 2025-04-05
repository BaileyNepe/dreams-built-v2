/* istanbul ignore file */
/// <reference types="vitest" />
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

const isUnitTest = process.env.TEST_TYPE === 'unit';

const sharedEnv = {
  NODE_ENV: 'test',
  BACKEND_SERVER_URL: 'test_url',
  MEDIA_SERVER_URL: 'http://localhost:5002',
  MUX_ACCESS_TOKEN: 'mux_access_token',
  MUX_SECRET_KEY: 'mux_access_key',
  MUX_SIGNING_KEY: 'mux_signing_key',
  MUX_SIGNING_KEY_SECRET: 'ggji0-2j3g9-23jgkfopwejf9weopf==',
  MUX_WEBHOOK_SECRET: 'gsjgiepsajkfoejgfsld',
  STRIPE_SECRET_KEY: 'stripe_secret_key',
  STRIPE_PUBLISHABLE_KEY: 'stripe_publishable_key',
  STRIPE_WEBHOOK_SECRET: 'stripe_webhook_secret',
  RESOURCES_DOMAIN: 'resources_domain',
  ACCESS_TOKEN_SECRET:
    'I16tF&GrbtTckycyVbqjJ0F2gsdhag33bEHyB@7huFegrLn48$e1cOKuebHb&1xzdHqiYQL',
  REFRESH_TOKEN_SECRET:
    'I16tF&GrbtTckygwouhonjt32g9hng92pjg89ojslf93j9g0efj29eg02jefklsdb&1xzdHqiYQL',
  TEMPORARY_TOKEN_SECRET:
    'ag30iujt29gjg9pjsleoguj9egjpg0j49gsoldigh8e3jfmiv9p3vj930jgfeolgujsolv3zdHqiYQL',

  EMAIL_PASSWORD: 'test_password',
  EMAIL_USER: 'test_user',
  EMAIL_HOST: 'test_host',

  COOKIE_SECRET:
    'I16tF&GrbtTckycyVbqjJ0F2xitBU033bEHyB@7huFrLn48$e1cOKuebHb&1xzdHqiYQLfsa',
  GOOGLE_CLIENT_ID: 'google_client_id',
  GOOGLE_CLIENT_SECRET: 'google_client_secret',

  GOOGLE_RECAPTCHA_SECRET: 'google_recaptcha_secret',

  IP_INFO_TOKEN: 'ip_info_token',
  MEDIA_TOKEN_SECRET: 'ggu90342j90gj02gj9g8942uhjg829hgdo9sgaxv0edsgj9'
};

const integrationEnv = {};

const unitEnv = {
  DATABASE_URL: 'postgresql://test_user:password@test_db:5432/lms',
  EXPRESS_PORT: 5002
};

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    coverage: {
      exclude: [
        '**/node_modules/**',
        '**/__mocks__/**',
        '**/__tests__/**',
        '**/*.test.ts',
        './dist/**',
        'vitest.config.ts'
      ]
    },
    include: isUnitTest
      ? ['**/unit.test.ts']
      : ['**/integration.test.ts', '**/unit.test.ts'],
    globals: true,
    setupFiles: isUnitTest ? [] : ['./src/test/vitest.setup.ts'],
    environment: 'node',
    clearMocks: true,
    env: { ...sharedEnv, ...(isUnitTest ? unitEnv : integrationEnv) }
  }
});
