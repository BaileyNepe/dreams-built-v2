import {
  type ComputedSheet,
  type JobSheetData,
  type JobSheetRules
} from '@dreams-built/shared/src/jobsheet/types';
import { type FloorOutline } from '@dreams-built/shared/src/jobsheet/engine/geometry';
import { FloorPlanSvg } from '../FloorPlan/FloorPlanSvg';

/**
 * One-click PDF export. Everything heavy (@react-pdf/renderer, the PDF
 * layout, react-dom/server for the plan rasterisation) is imported on
 * demand so the editor bundle stays lean.
 */

/** Render the floor plan to a PNG data URL via an offscreen canvas. */
const rasterizeFloorPlan = async (
  outline: FloorOutline,
  rules: JobSheetRules
): Promise<string | null> => {
  const { renderToStaticMarkup } = await import('react-dom/server');
  // Standalone SVG images need the xmlns attribute, which React omits.
  const markup = renderToStaticMarkup(
    <FloorPlanSvg outline={outline} rules={rules} title="Floor plan" />
  ).replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
  const viewBox = markup.match(/viewBox="([-\d. ]+)"/)?.[1]?.split(' ').map(Number);
  if (!viewBox || viewBox.length !== 4) return null;
  const [, , viewWidth, viewHeight] = viewBox;

  const url = URL.createObjectURL(
    new Blob([markup], { type: 'image/svg+xml;charset=utf-8' })
  );
  try {
    const image = new Image();
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('floor plan rasterisation failed'));
      image.src = url;
    });
    const width = 2200;
    const height = Math.round((viewHeight / viewWidth) * width);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) return null;
    context.fillStyle = '#fff';
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);
    return canvas.toDataURL('image/png');
  } finally {
    URL.revokeObjectURL(url);
  }
};

export const exportJobSheetPdf = async ({
  headerText,
  jobNumber,
  data,
  rules,
  computed,
  outline,
  fileName
}: {
  headerText: string;
  jobNumber: number | string;
  data: JobSheetData;
  rules: JobSheetRules;
  computed: ComputedSheet;
  /** Included as a second page when provided (auto mode with walls). */
  outline?: FloorOutline;
  fileName: string;
}): Promise<void> => {
  const [{ pdf }, { JobSheetPdf }, planPngDataUrl] = await Promise.all([
    import('@react-pdf/renderer'),
    import('./JobSheetPdf'),
    outline && outline.walls.length > 0
      ? rasterizeFloorPlan(outline, rules)
      : Promise.resolve(null)
  ]);

  const blob = await pdf(
    <JobSheetPdf
      headerText={headerText}
      jobNumber={jobNumber}
      data={data}
      rules={rules}
      computed={computed}
      planPngDataUrl={planPngDataUrl}
    />
  ).toBlob();

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  // Keep the blob alive long enough for save dialogs / download prompts.
  setTimeout(() => URL.revokeObjectURL(url), 5 * 60_000);
};
