// ReportStyles.ts
import styled, { css } from 'styled-components';

export const ReportBlock = styled.div<{ $isPrinted?: boolean; $isLast?: boolean }>`
  margin-bottom: 1rem;
  padding: 1rem;

  ${({ $isPrinted, $isLast }) =>
    $isPrinted
      ? css`
          @media print {
            ${!$isLast &&
            css`
              break-after: always;
              page-break-after: always;
            `}
            &:last-child {
              break-after: auto;
              page-break-after: auto;
            }
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
`;
