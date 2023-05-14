export const ordinal = (number: number) => {
  const superScript = ['th', 'st', 'nd', 'rd'];
  return superScript[(number - 20) % 10] || superScript[number] || superScript[0];
};
