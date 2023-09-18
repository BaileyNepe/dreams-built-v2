import { describe, expect, it } from 'vitest';
import { generateColor } from './generateColor';

describe('generateColor', () => {
  it('should generate a color', () => {
    const color = generateColor();
    expect(color).toMatch(/^#[0-9a-f]{6}$/i);
  });
});
