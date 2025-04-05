import UAParser from 'ua-parser-js';

export const getDeviceInfo = (userAgent: string) => {
  const deviceInfo = new UAParser(userAgent).getResult();
  return deviceInfo;
};
