import { createLazyFileRoute } from '@tanstack/react-router';
import { type FC } from 'react';

const HomePage: FC = () => <div>HomePage</div>;

export const Route = createLazyFileRoute('/_landing/')({
  component: HomePage
});
