// ReportStyles.ts
import styled, { css } from 'styled-components';

export const ReportBlock = styled.div<{ $isPrinted?: boolean; $isLast?: boolean }>`
  margin-bottom: 1rem;
  padding: 1rem;

  ${({ $isPrinted, $isLast }) =>
    $isPrinted
      ? css`
          @media print {
            margin-bottom: 0.5rem;
            padding: 0.5rem;
            page-break-inside: avoid;
            break-inside: avoid;

            /* Only add page break if this isn't the last block and there's not enough space */
            ${!$isLast &&
            css`
              &:not(:last-child) {
                @media print {
                  page-break-after: auto;
                  break-after: auto;
                }
              }
            `}
          }
        `
      : css`
          @media print {
            display: none;
          }
        `}
`;

export const TotalRow = styled.div`
  display: flex;
  font-weight: bold;
  justify-content: flex-end;
  margin-top: 1rem;

  @media print {
    margin-top: 0.5rem;
  }
`;
