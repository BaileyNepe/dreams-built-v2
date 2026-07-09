import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View
} from '@react-pdf/renderer';
import { formatCuts } from '@dreams-built/shared/src/jobsheet/engine/format';
import { wallLoops } from '@dreams-built/shared/src/jobsheet/engine/loops';
import { BLK_KEY, SHORTS_KEY } from '@dreams-built/shared/src/jobsheet/engine/tallies';
import {
  type ComputedSheet,
  type ComputedWall,
  type Cut,
  type JobSheetData,
  type JobSheetRules,
  type Tally
} from '@dreams-built/shared/src/jobsheet/types';
import { Fragment, type FC } from 'react';
import { derivedGarageItems } from '../SectionItems';
import { SECTION_COLORS } from '../constants';

/**
 * The paper sheet rendered straight to PDF — same layout as SheetView
 * (header line, wall grid, tallies, item boxes) plus an optional floor
 * plan page. Loaded lazily: only the export button pulls this in.
 */

const SHORT_COLORS = { shutters: '#b219b3', rebate: '#2e7d32' } as const;

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    padding: 28,
    color: '#000'
  },
  headerLine: {
    borderWidth: 1.5,
    borderColor: '#000',
    flexDirection: 'row',
    fontSize: 12,
    marginBottom: 8,
    paddingVertical: 4,
    paddingHorizontal: 8
  },
  bold: { fontFamily: 'Helvetica-Bold' },
  jobNumber: { color: '#e00', fontFamily: 'Helvetica-Bold' },
  table: { marginBottom: 10 },
  row: { flexDirection: 'row' },
  cell: {
    borderWidth: 0.75,
    borderColor: '#444',
    paddingVertical: 2,
    paddingHorizontal: 4
  },
  measurement: { width: 52, textAlign: 'right' },
  number: { width: 22, textAlign: 'center', fontFamily: 'Helvetica-Bold' },
  run: { flex: 1 },
  foundation: { flex: 1, backgroundColor: '#e8e8e8' },
  headShutters: {
    backgroundColor: SECTION_COLORS.shutters.header,
    textAlign: 'center',
    fontFamily: 'Helvetica-Bold'
  },
  headRebate: {
    backgroundColor: SECTION_COLORS.rebate.header,
    textAlign: 'center',
    fontFamily: 'Helvetica-Bold'
  },
  bottomGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  smallTable: { width: 120 },
  itemsBox: { width: 160 },
  qty: { width: 30, textAlign: 'center' },
  grow: { flex: 1 },
  footnote: { fontSize: 8, marginTop: 6 },
  planImage: { width: '100%', objectFit: 'contain', maxHeight: 720 }
});

const RunText: FC<{ cuts: Cut[]; section: 'shutters' | 'rebate' }> = ({
  cuts,
  section
}) => (
  <Text>
    {cuts.map((cut, index) => (
      // Positional keys: cuts have no identity.
      // eslint-disable-next-line react/no-array-index-key
      <Fragment key={index}>
        {index > 0 ? ' ' : ''}
        {cut.kind === 'standard' ? (
          formatCuts([cut])
        ) : (
          <Text style={[styles.bold, { color: SHORT_COLORS[section] }]}>
            {formatCuts([cut])}
          </Text>
        )}
      </Fragment>
    ))}
  </Text>
);

const RebateCell: FC<{ wall: ComputedWall }> = ({ wall }) =>
  wall.rebate.length === 0 ? (
    <Text>-</Text>
  ) : (
    <Text>
      {wall.rebate.map((run, index) => (
        // Rebate segments are positional.
        // eslint-disable-next-line react/no-array-index-key
        <Fragment key={index}>
          {index > 0 ? '  |  ' : ''}
          <RunText cuts={run.cuts} section="rebate" />
        </Fragment>
      ))}
    </Text>
  );

const TallyBlock: FC<{
  title: string;
  headStyle: (typeof styles)['headShutters' | 'headRebate' | 'bold'];
  tally: Tally;
  rules: JobSheetRules;
}> = ({ title, headStyle, tally, rules }) => (
  <View style={styles.smallTable}>
    <View style={[styles.cell, headStyle]}>
      <Text>{title}</Text>
    </View>
    {[...rules.standardSizesMm]
      .sort((a, b) => b - a)
      .map((size) => (
        <View key={size} style={styles.row}>
          <View style={[styles.cell, styles.grow]}>
            <Text>{size}</Text>
          </View>
          <View style={[styles.cell, styles.qty]}>
            <Text>{tally[String(size)] || '-'}</Text>
          </View>
        </View>
      ))}
    <View style={styles.row}>
      <View style={[styles.cell, styles.grow]}>
        <Text>Shorts</Text>
      </View>
      <View style={[styles.cell, styles.qty]}>
        <Text>{tally[SHORTS_KEY] || '-'}</Text>
      </View>
    </View>
    <View style={styles.row}>
      <View style={[styles.cell, styles.grow]}>
        <Text>BLK</Text>
      </View>
      <View style={[styles.cell, styles.qty]}>
        <Text>{tally[BLK_KEY] || '-'}</Text>
      </View>
    </View>
  </View>
);

export const JobSheetPdf: FC<{
  headerText: string;
  jobNumber: number | string;
  data: JobSheetData;
  rules: JobSheetRules;
  computed: ComputedSheet;
  planPngDataUrl?: string | null;
}> = ({ headerText, jobNumber, data, rules, computed, planPngDataUrl }) => {
  const hasOverrides = computed.walls.some((wall) => wall.isOverridden);
  const hasThirdColumn =
    computed.tallies.extra !== undefined || computed.walls.some((wall) => wall.extra);
  const wallNotes = computed.walls.filter((wall) => wall.notes);
  const showFoundationDividers =
    wallLoops(data).filter((loop) => loop.walls.length > 0).length > 1;

  return (
    <Document title={`Job ${jobNumber} — job sheet`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerLine}>
          <Text style={[styles.bold, { marginRight: 6 }]}>JOB:</Text>
          <Text style={{ flex: 1, paddingRight: 8 }}>
            {headerText} - Job # <Text style={styles.jobNumber}>{jobNumber}</Text>
          </Text>
          <Text>{data.system}</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.row}>
            <View style={[styles.cell, styles.measurement]}>
              <Text style={styles.bold}>mm</Text>
            </View>
            <View style={[styles.cell, styles.number]} />
            <View style={[styles.cell, styles.run, styles.headShutters]}>
              <Text>{rules.shutterLabel}</Text>
            </View>
            <View style={[styles.cell, styles.number]} />
            <View style={[styles.cell, styles.run, styles.headRebate]}>
              <Text>{rules.rebateLabel.toUpperCase()}</Text>
            </View>
            {hasThirdColumn && <View style={[styles.cell, styles.number]} />}
            {hasThirdColumn && (
              <View style={[styles.cell, styles.run]}>
                <Text style={styles.bold}>{data.thirdColumnLabel.toUpperCase()}</Text>
              </View>
            )}
          </View>
          {wallLoops(data).map((loop, loopIndex) => (
            <Fragment key={loop.foundationId}>
              {showFoundationDividers && loop.walls.length > 0 && (
                <View style={styles.row} wrap={false}>
                  <View style={[styles.cell, styles.foundation]}>
                    <Text style={styles.bold}>
                      {(loop.name || `Foundation ${loopIndex + 1}`).toUpperCase()}
                    </Text>
                  </View>
                </View>
              )}
              {computed.walls
                .slice(loop.startIndex, loop.startIndex + loop.walls.length)
                .map((wall) => (
                  <View key={wall.id} style={styles.row} wrap={false}>
                    <View style={[styles.cell, styles.measurement]}>
                      <Text>{wall.lengthMm ? wall.lengthMm.toLocaleString() : ''}</Text>
                    </View>
                    <View style={[styles.cell, styles.number]}>
                      <Text>{wall.number}</Text>
                    </View>
                    <View style={[styles.cell, styles.run]}>
                      <Text>
                        <RunText cuts={wall.shutters.cuts} section="shutters" />
                        {wall.isOverridden ? ' *' : ''}
                      </Text>
                    </View>
                    <View style={[styles.cell, styles.number]}>
                      <Text>{wall.number}</Text>
                    </View>
                    <View style={[styles.cell, styles.run]}>
                      <RebateCell wall={wall} />
                    </View>
                    {hasThirdColumn && (
                      <View style={[styles.cell, styles.number]}>
                        <Text>{wall.number}</Text>
                      </View>
                    )}
                    {hasThirdColumn && (
                      <View style={[styles.cell, styles.run]}>
                        {wall.extra ? (
                          <RunText cuts={wall.extra.cuts} section="rebate" />
                        ) : (
                          <Text>-</Text>
                        )}
                      </View>
                    )}
                  </View>
                ))}
            </Fragment>
          ))}
        </View>

        <View style={styles.bottomGrid}>
          <TallyBlock
            title={rules.shutterLabel.toUpperCase()}
            headStyle={styles.headShutters}
            tally={computed.tallies.shutters}
            rules={rules}
          />
          <TallyBlock
            title={`${rules.rebateLabel} Shutters`.toUpperCase()}
            headStyle={styles.headRebate}
            tally={computed.tallies.rebate}
            rules={rules}
          />
          {computed.tallies.extra && (
            <TallyBlock
              title={data.thirdColumnLabel.toUpperCase()}
              headStyle={styles.bold}
              tally={computed.tallies.extra}
              rules={rules}
            />
          )}

          {(['joinery', 'showerBoxes', 'garage'] as const).map((section) => {
            const derived = section === 'garage' ? derivedGarageItems(data.walls) : [];
            const items = [
              ...derived.map((item) => ({ id: item.text, text: item.text, qty: null })),
              ...data[section]
            ];
            return (
              <View key={section} style={styles.itemsBox}>
                <View style={[styles.cell, { backgroundColor: '#eee' }]}>
                  <Text style={styles.bold}>
                    {section === 'joinery' && 'Joinery'}
                    {section === 'showerBoxes' && 'Shower Boxes'}
                    {section === 'garage' && 'Garage'}
                  </Text>
                </View>
                {items.length === 0 ? (
                  <View style={[styles.cell]}>
                    <Text> </Text>
                  </View>
                ) : (
                  items.map((item) => (
                    <View key={item.id} style={styles.row}>
                      <View style={[styles.cell, styles.grow]}>
                        <Text>{item.text}</Text>
                      </View>
                      <View style={[styles.cell, styles.qty]}>
                        <Text>{item.qty ?? ''}</Text>
                      </View>
                    </View>
                  ))
                )}
              </View>
            );
          })}
        </View>

        {data.notes ? <Text style={styles.footnote}>Notes: {data.notes}</Text> : null}
        {hasOverrides && (
          <Text style={styles.footnote}>* breakdown manually overridden</Text>
        )}
        {wallNotes.map((wall) => (
          <Text key={wall.id} style={styles.footnote}>
            Wall {wall.number}: {wall.notes}
          </Text>
        ))}
      </Page>

      {planPngDataUrl ? (
        <Page size="A4" style={styles.page}>
          <Text style={[styles.bold, { fontSize: 12, marginBottom: 8 }]}>
            Floor plan — Job # {jobNumber}
          </Text>
          <Image src={planPngDataUrl} style={styles.planImage} />
        </Page>
      ) : null}
    </Document>
  );
};
