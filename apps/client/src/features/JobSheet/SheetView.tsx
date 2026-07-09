import {
  formatCuts,
  formatRun
} from '@dreams-built/shared/src/jobsheet/engine/format';
import { BLK_KEY, SHORTS_KEY } from '@dreams-built/shared/src/jobsheet/engine/tallies';
import {
  type ComputedSheet,
  type ComputedWall,
  type JobSheetData,
  type JobSheetRules,
  type Tally
} from '@dreams-built/shared/src/jobsheet/types';
import { Fragment, type FC } from 'react';
import { derivedGarageItems } from './SectionItems';
import { styled } from 'styled-components';
import { SECTION_COLORS } from './constants';

/**
 * The paper-sheet layout, shared by the read-only snapshot viewer and the
 * A4 print view: job header line, the wall grid with the magenta "300
 * Shutters" and green "REBATE" columns (numbered per wall), the two tally
 * tables, then the Joinery / Shower Boxes / Garage boxes.
 *
 * Deliberately plain HTML + print-safe CSS — no MUI — so it renders
 * identically on screen and through PrintableContent.
 */

const Page = styled.div`
  background: #fff;
  color: #000;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 12px;
  padding: 4mm;

  @media print {
    padding: 0;
  }
`;

const HeaderLine = styled.div`
  border: 1.5px solid #000;
  display: flex;
  font-size: 16px;
  gap: 0.75rem;
  margin-bottom: 8px;
  padding: 4px 8px;

  .job-label {
    font-weight: 700;
  }
  .job-number {
    color: #e00;
    font-weight: 700;
  }
`;

const WallGrid = styled.table`
  border-collapse: collapse;
  margin-bottom: 10px;
  width: 100%;

  th,
  td {
    border: 1px solid #444;
    padding: 3px 6px;
    text-align: left;
    vertical-align: top;
  }

  th.shutters {
    background: ${SECTION_COLORS.shutters.header};
    text-align: center;
  }
  th.rebate {
    background: ${SECTION_COLORS.rebate.header};
    text-align: center;
  }
  td.number {
    font-weight: 700;
    text-align: center;
    width: 2.2em;
  }
  td.measurement {
    text-align: right;
    width: 6em;
  }
  tr {
    break-inside: avoid;
  }
`;

const Short = styled.span<{ $section: 'shutters' | 'rebate' }>`
  background: ${(p) => SECTION_COLORS[p.$section].highlight};
  font-weight: 700;
  padding: 0 3px;
`;

const BottomGrid = styled.div`
  align-items: start;
  break-inside: avoid;
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
`;

const TallyTable = styled.table`
  border-collapse: collapse;
  width: 100%;

  th,
  td {
    border: 1px solid #444;
    padding: 2px 6px;
  }
  th.shutters {
    background: ${SECTION_COLORS.shutters.header};
  }
  th.rebate {
    background: ${SECTION_COLORS.rebate.header};
  }
  td.qty {
    text-align: center;
    width: 3.5em;
  }
`;

const ItemsBox = styled.table`
  border-collapse: collapse;
  width: 100%;

  th,
  td {
    border: 1px solid #444;
    padding: 2px 6px;
  }
  th {
    background: #eee;
  }
`;

/** Render a run with shorts/BLK visually highlighted like the paper sheet. */
// million-ignore -- fragments inside table cells; Million's <slot> wrapper breaks table nesting
const RunText: FC<{
  cuts: ComputedWall['shutters']['cuts'];
  section: 'shutters' | 'rebate';
}> = ({ cuts, section }) => (
  <>
    {cuts.map((cut, index) => (
      // Positional keys: cuts have no identity.
      // eslint-disable-next-line react/no-array-index-key
      <Fragment key={index}>
        {index > 0 && ' '}
        {cut.kind === 'standard' ? (
          formatCuts([cut])
        ) : (
          <Short $section={section}>{formatCuts([cut])}</Short>
        )}
      </Fragment>
    ))}
  </>
);

// million-ignore -- Million wraps this in a <slot>, which is invalid inside <table>
const TallyRows: FC<{ tally: Tally; rules: JobSheetRules }> = ({ tally, rules }) => (
  <tbody>
    {[...rules.standardSizesMm]
      .sort((a, b) => b - a)
      .map((size) => (
        <tr key={size}>
          <td>{size}</td>
          <td className="qty">{tally[String(size)] || '-'}</td>
        </tr>
      ))}
    <tr>
      <td>Shorts</td>
      <td className="qty">{tally[SHORTS_KEY] || '-'}</td>
    </tr>
    <tr>
      <td>BLK</td>
      <td className="qty">{tally[BLK_KEY] || '-'}</td>
    </tr>
  </tbody>
);

// million-ignore -- table-heavy layout; Million's <slot> wrappers corrupt the print DOM
export const SheetView: FC<{
  headerText: string;
  jobNumber: number | string;
  data: JobSheetData;
  rules: JobSheetRules;
  computed: ComputedSheet;
}> = ({ headerText, jobNumber, data, rules, computed }) => {
  const hasOverrides = computed.walls.some((wall) => wall.isOverridden);

  return (
    <Page>
      <HeaderLine>
        <span className="job-label">JOB:</span>
        <span>
          {headerText} - Job # <span className="job-number">{jobNumber}</span>
        </span>
        <span style={{ marginLeft: 'auto' }}>{data.system}</span>
      </HeaderLine>

      <WallGrid>
        <thead>
          <tr>
            <th>mm</th>
            <th aria-label="wall number (300)" />
            <th className="shutters">300 Shutters</th>
            <th aria-label="wall number (rebate)" />
            <th className="rebate">REBATE</th>
          </tr>
        </thead>
        <tbody>
          {computed.walls.map((wall) => (
            <tr key={wall.id}>
              <td className="measurement">
                {wall.lengthMm ? wall.lengthMm.toLocaleString() : ''}
              </td>
              <td className="number">{wall.number}</td>
              <td>
                <RunText cuts={wall.shutters.cuts} section="shutters" />
                {wall.isOverridden && ' *'}
              </td>
              <td className="number">{wall.number}</td>
              <td>
                {wall.rebate.length === 0 ? (
                  '-'
                ) : (
                  wall.rebate.map((run, index) => (
                    // Rebate segments are positional.
                    // eslint-disable-next-line react/no-array-index-key
                    <Fragment key={index}>
                      {index > 0 && ' | '}
                      <RunText cuts={run.cuts} section="rebate" />
                    </Fragment>
                  ))
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </WallGrid>

      <BottomGrid>
        <TallyTable>
          <thead>
            <tr>
              <th className="shutters" colSpan={2}>
                300 SHUTTERS
              </th>
            </tr>
          </thead>
          <TallyRows tally={computed.tallies.shutters} rules={rules} />
        </TallyTable>

        <TallyTable>
          <thead>
            <tr>
              <th className="rebate" colSpan={2}>
                REBATE SHUTTERS
              </th>
            </tr>
          </thead>
          <TallyRows tally={computed.tallies.rebate} rules={rules} />
        </TallyTable>

        {(['joinery', 'showerBoxes', 'garage'] as const).map((section) => (
          <ItemsBox key={section}>
            <thead>
              <tr>
                <th colSpan={2}>
                  {section === 'joinery' && 'Joinery'}
                  {section === 'showerBoxes' && 'Shower Boxes'}
                  {section === 'garage' && 'Garage'}
                </th>
              </tr>
            </thead>
            <tbody>
              {section === 'garage' &&
                derivedGarageItems(data.walls).map((item) => (
                  <tr key={item.text}>
                    <td>{item.text}</td>
                    <td className="qty" />
                  </tr>
                ))}
              {data[section].length === 0 &&
              (section !== 'garage' || derivedGarageItems(data.walls).length === 0) ? (
                <tr>
                  <td colSpan={2}>&nbsp;</td>
                </tr>
              ) : (
                data[section].map((item) => (
                  <tr key={item.id}>
                    <td>{item.text}</td>
                    <td className="qty">{item.qty ?? ''}</td>
                  </tr>
                ))
              )}
            </tbody>
          </ItemsBox>
        ))}
      </BottomGrid>

      {data.notes && <p>Notes: {data.notes}</p>}
      {hasOverrides && (
        <p style={{ fontSize: 10 }}>* breakdown manually overridden</p>
      )}
      {computed.walls.some((wall) => wall.notes) && (
        <ul style={{ fontSize: 10, paddingLeft: 16 }}>
          {computed.walls
            .filter((wall) => wall.notes)
            .map((wall) => (
              <li key={wall.id}>
                Wall {wall.number}: {wall.notes}
              </li>
            ))}
        </ul>
      )}
    </Page>
  );
};

/** Plain-text one-liner for a wall, used by diff rows and tooltips. */
export const wallSummaryText = (wall: ComputedWall): string =>
  `${wall.lengthMm}mm → ${formatRun(wall.shutters)}`;
