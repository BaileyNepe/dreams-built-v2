export const getObjectValue = (obj: Record<string, unknown>, path: string) => {
  const keys = path
    .replace(/\[(\w+)\]/g, '.$1')
    .replace(/^\./, '')
    .split('.');

  return keys.reduce(
    (accumulator, key) =>
      accumulator !== null && accumulator !== undefined
        ? (accumulator[key as keyof typeof accumulator] as Record<string, unknown>)
        : accumulator,
    obj as Record<string, unknown> | undefined
  );
};
