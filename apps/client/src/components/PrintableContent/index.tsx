import { forwardRef, ReactNode } from 'react';
import { createGlobalStyle, styled } from 'styled-components';

type Orientation = 'portrait' | 'landscape';

const PrintableOrientation = createGlobalStyle<{
  orientation: Orientation;
  margin: number;
  verticalMargin?: number;
  horizontalMargin?: number;
}>`
  /* 
   * We can't hide the printable content, otherwise it will break SVGs that have masks 
   * using IDs.  Both the printable and displayed content have the same ID, so the content 
   * in the modal uses the mask rule from the printable content.
   * An alternative would be to modify the cloned content in printable content to have 
   * unique IDs.
   */
  #print {
    left: 10000rem;  
    position: absolute;
    top: 10000rem;
  }

  @media print {
    body {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      position: relative;
    }
    #root {
      display: none;
    }
    #print {
      left: 0;
      position: relative;
      top: 0;
    }
  }

  @page {

   // A page print margin of 5mm on all sides hides the print header and footer
   margin-right: ${(p) => p.horizontalMargin ?? p.margin}mm;
   margin-left: ${(p) => p.horizontalMargin ?? p.margin}mm;
   margin-top: ${(p) => p.verticalMargin ?? p.margin}mm;
   margin-bottom: ${(p) => p.verticalMargin ?? p.margin}mm;
   
    size: A4 ${(p) => p.orientation};
  }
`;

const Container = styled.div<{ $isHidden?: boolean }>`
  display: ${(p) => (p.$isHidden ? 'none' : 'block')};
  @media print {
    display: block;
  }
`;

export const PrintableContent = forwardRef<
  HTMLDivElement,
  {
    children?: ReactNode;
    orientation?: Orientation;
    isHidden?: boolean;
    margin?: number;
    verticalMargin?: number;
    horizontalMargin?: number;
  }
>(
  (
    {
      children,
      orientation = 'portrait',
      isHidden = false,
      margin,
      verticalMargin,
      horizontalMargin,
    },
    ref,
  ) => (
    <div data-testid="printable-content" ref={ref}>
      <PrintableOrientation
        orientation={orientation}
        margin={margin ?? 5}
        verticalMargin={verticalMargin}
        horizontalMargin={horizontalMargin}
      />
      <Container $isHidden={isHidden}>{children}</Container>
    </div>
  ),
);

PrintableContent.displayName = 'PrintableContent';
