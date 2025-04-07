import { api } from './trpc';

export const useContactMutation = () => api.contact.contact.useMutation();
