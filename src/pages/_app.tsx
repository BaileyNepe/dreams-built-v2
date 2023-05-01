import { api } from '@/utils/api';
import { type AppType } from 'next/app';
import 'react-toastify/dist/ReactToastify.css';

import '@styles/bootstrap.min.css';

import '@/styles/globals.css';

const MyApp: AppType = ({ Component, pageProps }) => {
  return <Component {...pageProps} />;
};

export default api.withTRPC(MyApp);
