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
        At an internal corner, the perpendicular wall&apos;s shutter sits inside the
        floor and eats one shutter width off the run. Only one of the two walls
        meeting at the corner absorbs it — tick &ldquo;Absorb at start/end&rdquo; on
        whichever wall gives the tidier cut. The floor plan flags any corner where
        boards would overlap (neither wall absorbs) or leave a gap (both absorb):
        concrete escapes through gaps, and two boards can&apos;t occupy the same
        space. Rebate corners work the same way with the rebate offsets.
      </Section>

      <Section title='Polystyrene shorts ("p")'>
        When both ends of a wall are internal, the short is padded with polystyrene
        so it crushes when the concrete sets and the boxing comes out cleanly. The
        app flags these automatically (e.g. <strong>355p</strong>); override per
        wall if the call is different.
      </Section>

      <Section title="Rebates">
        The brick rebate runs along the inside of the perimeter shutter and never
        overhangs. Where a perpendicular brick face crosses, tick the rebate offset
        for that end. Walls without brick veneer (e.g. garage walls): untick
        &ldquo;Has rebate&rdquo; and the row shows &ldquo;-&rdquo;.
      </Section>

      <Section title="BLK insets">
        Where a wall has brick rebate over only part of its length, a BLK inset (a
        rebate-width × shutter-width block) marks the transition. Tick BLK at the
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
