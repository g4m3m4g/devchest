export type UnitCategoryId = 'length' | 'weight' | 'temperature' | 'area' | 'volume';

export interface Unit {
  id: string;
  name: string;
  /** Multiplier to convert this unit to the category's base unit. Unused for temperature. */
  toBase?: number;
}

export interface UnitCategory {
  id: UnitCategoryId;
  name: string;
  units: Unit[];
}

export const UNIT_CATEGORIES: UnitCategory[] = [
  {
    id: 'length',
    name: 'Length',
    units: [
      { id: 'mm', name: 'Millimeters', toBase: 0.001 },
      { id: 'cm', name: 'Centimeters', toBase: 0.01 },
      { id: 'm', name: 'Meters', toBase: 1 },
      { id: 'km', name: 'Kilometers', toBase: 1000 },
      { id: 'in', name: 'Inches', toBase: 0.0254 },
      { id: 'ft', name: 'Feet', toBase: 0.3048 },
      { id: 'yd', name: 'Yards', toBase: 0.9144 },
      { id: 'mi', name: 'Miles', toBase: 1609.344 },
    ],
  },
  {
    id: 'weight',
    name: 'Weight',
    units: [
      { id: 'mg', name: 'Milligrams', toBase: 0.001 },
      { id: 'g', name: 'Grams', toBase: 1 },
      { id: 'kg', name: 'Kilograms', toBase: 1000 },
      { id: 't', name: 'Metric Tons', toBase: 1_000_000 },
      { id: 'oz', name: 'Ounces', toBase: 28.349523125 },
      { id: 'lb', name: 'Pounds', toBase: 453.59237 },
    ],
  },
  {
    id: 'temperature',
    name: 'Temperature',
    units: [
      { id: 'c', name: 'Celsius' },
      { id: 'f', name: 'Fahrenheit' },
      { id: 'k', name: 'Kelvin' },
    ],
  },
  {
    id: 'area',
    name: 'Area',
    units: [
      { id: 'mm2', name: 'Square Millimeters', toBase: 0.000001 },
      { id: 'cm2', name: 'Square Centimeters', toBase: 0.0001 },
      { id: 'm2', name: 'Square Meters', toBase: 1 },
      { id: 'ha', name: 'Hectares', toBase: 10000 },
      { id: 'km2', name: 'Square Kilometers', toBase: 1_000_000 },
      { id: 'ft2', name: 'Square Feet', toBase: 0.09290304 },
      { id: 'acre', name: 'Acres', toBase: 4046.8564224 },
    ],
  },
  {
    id: 'volume',
    name: 'Volume',
    units: [
      { id: 'ml', name: 'Milliliters', toBase: 0.001 },
      { id: 'l', name: 'Liters', toBase: 1 },
      { id: 'm3', name: 'Cubic Meters', toBase: 1000 },
      { id: 'gal', name: 'Gallons (US)', toBase: 3.785411784 },
      { id: 'qt', name: 'Quarts (US)', toBase: 0.946352946 },
      { id: 'pt', name: 'Pints (US)', toBase: 0.473176473 },
      { id: 'cup', name: 'Cups (US)', toBase: 0.2365882365 },
      { id: 'floz', name: 'Fluid Ounces (US)', toBase: 0.0295735295625 },
    ],
  },
];

function toCelsius(value: number, unit: string): number {
  switch (unit) {
    case 'c': return value;
    case 'f': return (value - 32) * (5 / 9);
    case 'k': return value - 273.15;
    default: throw new Error(`Unknown temperature unit "${unit}"`);
  }
}

function fromCelsius(value: number, unit: string): number {
  switch (unit) {
    case 'c': return value;
    case 'f': return value * (9 / 5) + 32;
    case 'k': return value + 273.15;
    default: throw new Error(`Unknown temperature unit "${unit}"`);
  }
}

export function convert(value: number, fromUnit: string, toUnit: string, categoryId: UnitCategoryId): number {
  const category = UNIT_CATEGORIES.find(c => c.id === categoryId);
  if (!category) {
    throw new Error(`Unknown unit category "${categoryId}"`);
  }

  if (categoryId === 'temperature') {
    return fromCelsius(toCelsius(value, fromUnit), toUnit);
  }

  const from = category.units.find(u => u.id === fromUnit);
  const to = category.units.find(u => u.id === toUnit);
  if (!from || !to) {
    throw new Error(`Unknown unit "${!from ? fromUnit : toUnit}" for category "${categoryId}"`);
  }

  return (value * from.toBase!) / to.toBase!;
}
