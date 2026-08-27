// Human Design 64 Gates mapped to 360° zodiac wheel.
// Sequence starts at Aries 0° = Gate 25 (per HD convention) and runs through 64 gates of 5.625° each.

export const GATE_SEQUENCE: number[] = [
  25, 17, 21, 51, 42, 3, 27, 24, 2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53,
  62, 56, 31, 33, 7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50, 28, 44,
  1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60, 41, 19, 13, 49, 30, 55,
  37, 63, 22, 36,
];

export const GATE_TO_CENTER: Record<number, string> = {
  // Head
  64: 'Head', 61: 'Head', 63: 'Head',
  // Ajna
  47: 'Ajna', 24: 'Ajna', 4: 'Ajna', 17: 'Ajna', 43: 'Ajna', 11: 'Ajna',
  // Throat
  62: 'Throat', 23: 'Throat', 56: 'Throat', 16: 'Throat', 20: 'Throat',
  31: 'Throat', 8: 'Throat', 33: 'Throat', 35: 'Throat', 12: 'Throat', 45: 'Throat',
  // G
  1: 'G', 13: 'G', 25: 'G', 46: 'G', 2: 'G', 15: 'G', 10: 'G', 7: 'G',
  // Heart / Ego
  21: 'Heart', 40: 'Heart', 26: 'Heart', 51: 'Heart',
  // Solar Plexus
  6: 'SolarPlexus', 37: 'SolarPlexus', 22: 'SolarPlexus', 36: 'SolarPlexus',
  30: 'SolarPlexus', 55: 'SolarPlexus', 49: 'SolarPlexus',
  // Sacral
  5: 'Sacral', 14: 'Sacral', 29: 'Sacral', 59: 'Sacral', 9: 'Sacral',
  3: 'Sacral', 42: 'Sacral', 27: 'Sacral', 34: 'Sacral',
  // Spleen
  48: 'Spleen', 57: 'Spleen', 44: 'Spleen', 50: 'Spleen', 32: 'Spleen', 28: 'Spleen', 18: 'Spleen',
  // Root
  53: 'Root', 60: 'Root', 52: 'Root', 19: 'Root', 39: 'Root', 41: 'Root', 58: 'Root', 38: 'Root', 54: 'Root',
};

export type HDCenter =
  | 'Head'
  | 'Ajna'
  | 'Throat'
  | 'G'
  | 'Heart'
  | 'SolarPlexus'
  | 'Sacral'
  | 'Spleen'
  | 'Root';

export const CHANNELS: Array<{ gates: [number, number]; centers: [HDCenter, HDCenter] }> = [
  { gates: [1, 8], centers: ['G', 'Throat'] },
  { gates: [2, 14], centers: ['G', 'Sacral'] },
  { gates: [3, 60], centers: ['Sacral', 'Root'] },
  { gates: [4, 63], centers: ['Ajna', 'Head'] },
  { gates: [5, 15], centers: ['Sacral', 'G'] },
  { gates: [6, 59], centers: ['SolarPlexus', 'Sacral'] },
  { gates: [7, 31], centers: ['G', 'Throat'] },
  { gates: [9, 52], centers: ['Sacral', 'Root'] },
  { gates: [10, 20], centers: ['G', 'Throat'] },
  { gates: [10, 34], centers: ['G', 'Sacral'] },
  { gates: [10, 57], centers: ['G', 'Spleen'] },
  { gates: [11, 56], centers: ['Ajna', 'Throat'] },
  { gates: [12, 22], centers: ['Throat', 'SolarPlexus'] },
  { gates: [13, 33], centers: ['G', 'Throat'] },
  { gates: [16, 48], centers: ['Throat', 'Spleen'] },
  { gates: [17, 62], centers: ['Ajna', 'Throat'] },
  { gates: [18, 58], centers: ['Spleen', 'Root'] },
  { gates: [19, 49], centers: ['Root', 'SolarPlexus'] },
  { gates: [20, 34], centers: ['Throat', 'Sacral'] },
  { gates: [20, 57], centers: ['Throat', 'Spleen'] },
  { gates: [21, 45], centers: ['Heart', 'Throat'] },
  { gates: [23, 43], centers: ['Throat', 'Ajna'] },
  { gates: [24, 61], centers: ['Ajna', 'Head'] },
  { gates: [25, 51], centers: ['G', 'Heart'] },
  { gates: [26, 44], centers: ['Heart', 'Spleen'] },
  { gates: [27, 50], centers: ['Sacral', 'Spleen'] },
  { gates: [28, 38], centers: ['Spleen', 'Root'] },
  { gates: [29, 46], centers: ['Sacral', 'G'] },
  { gates: [30, 41], centers: ['SolarPlexus', 'Root'] },
  { gates: [32, 54], centers: ['Spleen', 'Root'] },
  { gates: [34, 57], centers: ['Sacral', 'Spleen'] },
  { gates: [35, 36], centers: ['Throat', 'SolarPlexus'] },
  { gates: [37, 40], centers: ['SolarPlexus', 'Heart'] },
  { gates: [39, 55], centers: ['Root', 'SolarPlexus'] },
  { gates: [42, 53], centers: ['Sacral', 'Root'] },
  { gates: [47, 64], centers: ['Ajna', 'Head'] },
];
