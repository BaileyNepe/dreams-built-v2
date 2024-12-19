import { type RoutePaths } from '@tanstack/react-router';
import { type routeTree } from 'routeTree.gen';

export type Routes = RoutePaths<typeof routeTree>;
