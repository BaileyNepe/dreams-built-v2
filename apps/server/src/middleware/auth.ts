import { env } from '@config/env';
import { auth } from 'express-oauth2-jwt-bearer';

export const checkJwt = auth({
  issuerBaseURL: env.auth0IssuerBaseURL,
  audience: env.auth0Audience
});
