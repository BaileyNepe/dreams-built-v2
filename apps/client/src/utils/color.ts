export const getContrastingColor = (hex: string): string => {
  const stripped = hex.replace('#', '');
  const r = parseInt(stripped.substring(0, 2), 16) || 0;
  const g = parseInt(stripped.substring(2, 4), 16) || 0;
  const b = parseInt(stripped.substring(4, 6), 16) || 0;
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? '#000' : '#fff';
};

export const generateRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};
