/**
 * Hand-typed sheet data for 9 Warren Lane (job # 26035) — the golden
 * parity fixture.
 *
 * Sourced from the foundation-architectural plan (sheet A206) and
 * reconciled against the QS-issued job sheet. The expected cut lists in
 * computeSheet.test.ts are transcribed from that sheet verbatim; any drift
 * is either an engine regression or a fixture entry that was misread.
 *
 * Wall 1 is the garage-door wall (6420mm with a 4850mm garage door opening
 * centred between two 785mm rebated segments); numbering proceeds clockwise.
 *
 * Corner kinds were reverse-engineered from the QS's cut lists:
 *   - external where overhang appears in the shutter row (wall 1's
 *     "4800 1800" sums to 6600 vs wall length 6420, +180mm overhang);
 *   - internal where the trade refused the easy overhang and used a short
 *     instead (wall 3's "1800 260" rather than "1800 600" with overhang).
 *
 * Rebate offsets sit at corners where a perpendicular brick face crosses
 * (wall 2's rebate sums to 6890 = 7010 - 120, so one offset).
 */

import type { JobSheetData, Wall } from '../types';

const wall = (w: Partial<Wall> & Pick<Wall, 'id' | 'lengthMm'>): Wall => ({
  cornerStart: 'external',
  cornerEnd: 'external',
  absorbShutterAtStart: false,
  absorbShutterAtEnd: false,
  hasRebate: true,
  rebateOffsetAtStart: false,
  rebateOffsetAtEnd: false,
  rebateExtendAtStart: false,
  rebateExtendAtEnd: false,
  overhangCapAtEnd: false,
  blkAtStart: false,
  blkAtEnd: false,
  openings: [],
  rebateInsets: [],
  polystyreneOverride: null,
  angledCornerDeg: null,
  isGarageDoorWall: false,
  notes: '',
  override: null,
  ...w
});

export const nineWarrenLaneData: JobSheetData = {
  system: 'PROBASE',
  rebatesEnabled: true,
  walls: [
    wall({
      id: 'w01',
      lengthMm: 6420,
      isGarageDoorWall: true,
      openings: [
        {
          kind: 'garage_door',
          widthMm: 4850,
          offsetFromStartMm: 785,
          hasRebate: false,
          blk: false,
          label: 'Garage Door 4850mm'
        }
      ]
    }),
    wall({ id: 'w02', lengthMm: 7010, rebateOffsetAtStart: true }),
    wall({ id: 'w03', lengthMm: 2060, cornerEnd: 'internal' }),
    wall({ id: 'w04', lengthMm: 5940, cornerStart: 'internal' }),
    wall({ id: 'w05', lengthMm: 14270, rebateOffsetAtEnd: true }),
    wall({ id: 'w06', lengthMm: 5980, cornerEnd: 'internal' }),
    wall({
      id: 'w07',
      lengthMm: 600,
      cornerStart: 'internal',
      cornerEnd: 'internal'
    }),
    wall({
      id: 'w08',
      lengthMm: 5010,
      rebateOffsetAtEnd: true,
      cornerStart: 'internal'
    }),
    wall({
      id: 'w09',
      lengthMm: 4410,
      rebateOffsetAtStart: true,
      cornerEnd: 'internal'
    }),
    wall({
      id: 'w10',
      lengthMm: 3780,
      hasRebate: false,
      cornerStart: 'internal'
    }),
    wall({ id: 'w11', lengthMm: 4480, hasRebate: false }),
    wall({ id: 'w12', lengthMm: 3200, hasRebate: false, cornerEnd: 'internal' }),
    wall({
      id: 'w13',
      lengthMm: 1620,
      hasRebate: false,
      cornerStart: 'internal',
      cornerEnd: 'internal',
      // The wall 13 -> 14 corner is an inside corner where wall 14's
      // perpendicular shutter eats one board thickness off this wall's run,
      // leaving 1555mm effective and a 355mm trailing short (matches the
      // QS sheet's "1200 355p" rather than the un-adjusted "1200 420p").
      // The polystyrene "p" comes from the both-ends-internal auto rule.
      absorbShutterAtEnd: true,
      notes: 'Inset wall: tight fit, polystyrene padding on short shutter.'
    }),
    wall({
      id: 'w14',
      lengthMm: 1380,
      rebateOffsetAtEnd: true,
      cornerStart: 'internal'
    })
  ],
  joinery: [{ id: 'j01', text: 'Garage Door 4850mm', qty: 1 }],
  showerBoxes: [
    { id: 's01', text: 'Ensuite 1100mm', qty: 1 },
    { id: 's02', text: 'Main bathroom 900mm', qty: 1 }
  ],
  garage: [],
  notes: ''
};

/** Perimeter total from the A206 "Over Foundation Area" annotation. */
export const NINE_WARREN_LANE_PERIMETER_MM = 66_160;
