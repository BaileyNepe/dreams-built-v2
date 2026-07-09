import { Box, Typography } from '@mui/material';
import BasicModal from 'components/Modal';
import { type FC } from 'react';

const Section: FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children
}) => (
  <Box>
    <Typography variant="subtitle2" fontWeight={700} gutterBottom>
      {title}
    </Typography>
    <Typography variant="body2" component="div" color="text.secondary">
      {children}
    </Typography>
  </Box>
);

/** Conventions primer for new workers, per Bailey's trade rules. */
export const InstructionsDialog: FC<{ open: boolean; onClose: () => void }> = ({
  open,
  onClose
}) => (
  <BasicModal open={open} onClose={onClose} title="How to fill in a job sheet" width="36rem">
    <Box sx={{ display: 'grid', gap: 2 }}>
      <Section title="Wall numbering">
        Wall 1 is the wall containing the garage door. Number the remaining walls
        clockwise around the foundation perimeter (2, 3, 4…). Reorder rows by
        dragging the handle, or focus the handle and use Space + arrow keys.
      </Section>

      <Section title="Corners: External vs Internal">
        Each wall end meets a corner. <strong>External</strong> = the corner is
        exposed (the foundation turns away) — the shutter is allowed to overhang
        past the end, so the app rounds the last piece up to the next standard size.{' '}
        <strong>Internal</strong> = the corner is sheltered (the foundation turns
        into itself) — no room to overhang, so the leftover becomes an exact short
        cut.
      </Section>

      <Section title="Absorbing the shutter width">
        A shutter runs until it hits the next wall (internal corner — exact) or
        overflows past it (external corner — overhang). The wall LEAVING an
        internal corner starts one shutter width in, because the previous
        wall&apos;s board already sits against its face. Exception: wall 1 is
        boxed first, so it always starts from the very beginning of its face —
        the last wall accounts for wall 1&apos;s board at the closing corner
        instead. That&apos;s the automatic default; flip any corner with the
        &ldquo;Absorb at start/end&rdquo; boxes if the crew runs that joint the
        other way. The
        floor plan flags any corner where boards would overlap (neither wall
        absorbs) or leave a gap (both absorb): concrete escapes through gaps,
        and two boards can&apos;t occupy the same space. Rebate corners work the
        same way with the rebate offsets.
      </Section>

      <Section title='Polystyrene shorts ("p")'>
        When both ends of a wall are internal, the short is padded with polystyrene
        so it crushes when the concrete sets and the boxing comes out cleanly. The
        app flags these automatically (e.g. <strong>355p</strong>); override per
        wall if the call is different.
      </Section>

      <Section title="Rebates">
        The brick rebate runs along the inside of the perimeter shutter and never
        overhangs. Where a perpendicular brick face crosses, the departing
        wall&apos;s strip gives way one rebate width — except wall 1, which is
        bricked first and always starts from its very beginning; the last
        wall&apos;s strip gives way at the closing corner instead. Walls without
        brick veneer (e.g. garage walls): untick &ldquo;Has rebate&rdquo; and the
        row shows &ldquo;-&rdquo;.
      </Section>

      <Section title="Partial brick: type the wall in segments">
        When brick covers only part of a wall, type the measurement as
        slash-separated segments with <strong>b</strong> (or <strong>r</strong>) on
        the brick stretches: <strong>4200/810b</strong> = 4200 bare then 810 of
        brick; <strong>3600b/2500/300b</strong> = brick, bare, brick. The wall
        length becomes the total and the bare stretches inset to the frame line
        automatically — stepped shutter runs, BLKs at the transitions and the
        matching rebate segments are computed for you. A plain number (or a
        suffix-free sum like 11610/1960) clears the segmentation. The same
        stretches can be edited under the wall&apos;s &ldquo;Rebate insets&rdquo;
        panel.
      </Section>

      <Section title="BLK insets">
        Where a wall has brick rebate over only part of its length, a BLK inset (a
        rebate-width × shutter-width block) marks the transition. These come from
        the segments above automatically; for one-off cases tick BLK at the
        relevant end, or place BLK pieces exactly where they belong with
        &ldquo;Override breakdown&rdquo;.
      </Section>

      <Section title="Angled corners">
        Corners that aren&apos;t 90° need their shorts cut at an angle — enter the
        angle on the wall so it prints next to the short (e.g.{' '}
        <strong>420 @45°</strong>).
      </Section>

      <Section title="Manual overrides">
        Any wall&apos;s computed pieces can be replaced by hand (Override
        breakdown). Overridden walls show an &ldquo;edited&rdquo; badge, stop
        auto-recomputing, and keep your pieces until you press &ldquo;Reset to
        computed&rdquo;.
      </Section>
    </Box>
  </BasicModal>
);
