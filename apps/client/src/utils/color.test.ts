import { describe, expect, it } from 'vitest';
import { generateRandomColor } from './color';

describe('generateColor', () => {
  it('should generate a color', () => {
    const color = generateRandomColor();
    expect(color).toMatch(/^#[0-9a-f]{6}$/i);
  });
});
