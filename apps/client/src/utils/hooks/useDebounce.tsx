import { useDebounce as debounceHook } from 'use-debounce';

export const useDebounce = <T,>(value: T, delay = 600) => {
  const [debouncedValue] = debounceHook(value, delay);

  return debouncedValue;
};
