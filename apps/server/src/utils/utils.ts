import { type Request } from 'express';

export const getHost = (req: Request): string => {
  // remove the last /
  const host =
    req.headers.origin ||
    req.headers.referer ||
    req.headers.host?.replace(/\/$/, '') ||
    '';

  // if it is an array then return the first element
  if (Array.isArray(host)) {
    return host[0];
  }

  return host;
};

export const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
