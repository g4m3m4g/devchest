import { describe, it, expect } from 'vitest';
import { UNIT_CATEGORIES, convert } from '../../lib/unitConverter';

describe('UNIT_CATEGORIES', () => {
  it('includes length, weight, temperature, area, and volume', () => {
    const ids = UNIT_CATEGORIES.map(c => c.id);
    expect(ids).toEqual(['length', 'weight', 'temperature', 'area', 'volume']);
  });

  it('each category has at least 2 units', () => {
    for (const category of UNIT_CATEGORIES) {
      expect(category.units.length).toBeGreaterThanOrEqual(2);
    }
  });
});

describe('convert - length', () => {
  it('converts meters to centimeters', () => {
    expect(convert(1, 'm', 'cm', 'length')).toBeCloseTo(100);
  });

  it('converts kilometers to miles', () => {
    expect(convert(1, 'km', 'mi', 'length')).toBeCloseTo(0.621371, 5);
  });

  it('converts a unit to itself unchanged', () => {
    expect(convert(42, 'm', 'm', 'length')).toBe(42);
  });

  it('converts feet to inches', () => {
    expect(convert(1, 'ft', 'in', 'length')).toBeCloseTo(12);
  });
});

describe('convert - weight', () => {
  it('converts kilograms to pounds', () => {
    expect(convert(1, 'kg', 'lb', 'weight')).toBeCloseTo(2.20462, 4);
  });

  it('converts grams to kilograms', () => {
    expect(convert(1000, 'g', 'kg', 'weight')).toBeCloseTo(1);
  });
});

describe('convert - temperature', () => {
  it('converts 0 Celsius to 32 Fahrenheit', () => {
    expect(convert(0, 'c', 'f', 'temperature')).toBeCloseTo(32);
  });

  it('converts 100 Celsius to 212 Fahrenheit', () => {
    expect(convert(100, 'c', 'f', 'temperature')).toBeCloseTo(212);
  });

  it('converts 0 Celsius to 273.15 Kelvin', () => {
    expect(convert(0, 'c', 'k', 'temperature')).toBeCloseTo(273.15);
  });

  it('converts 32 Fahrenheit to 0 Celsius', () => {
    expect(convert(32, 'f', 'c', 'temperature')).toBeCloseTo(0);
  });

  it('converts Kelvin to Fahrenheit', () => {
    expect(convert(273.15, 'k', 'f', 'temperature')).toBeCloseTo(32);
  });

  it('converts a unit to itself unchanged', () => {
    expect(convert(37, 'c', 'c', 'temperature')).toBe(37);
  });
});

describe('convert - area', () => {
  it('converts square meters to square feet', () => {
    expect(convert(1, 'm2', 'ft2', 'area')).toBeCloseTo(10.7639, 3);
  });

  it('converts hectares to square meters', () => {
    expect(convert(1, 'ha', 'm2', 'area')).toBeCloseTo(10000);
  });
});

describe('convert - volume', () => {
  it('converts liters to gallons', () => {
    expect(convert(1, 'l', 'gal', 'volume')).toBeCloseTo(0.264172, 4);
  });

  it('converts milliliters to liters', () => {
    expect(convert(1000, 'ml', 'l', 'volume')).toBeCloseTo(1);
  });
});

describe('convert - invalid input', () => {
  it('throws for an unknown unit', () => {
    expect(() => convert(1, 'xx', 'm', 'length')).toThrow();
  });

  it('throws for an unknown category', () => {
    // @ts-expect-error testing runtime guard against an invalid category
    expect(() => convert(1, 'm', 'cm', 'bogus')).toThrow();
  });
});
