import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Container } from '@mui/material';
import Typography from '@mui/material/Typography';
import { Button } from 'components/Button';
import styled from 'styled-components';
import { fShortenNumber } from 'utils/format-number';

const ROWS = [
  {
    label: 'projects',
    total: 600,
    content: 'Praesent turpis. Praesent blandit laoreet nibh. Nunc nonummy metus.'
  },
  {
    label: 'Happy clients',
    total: 32000,
    content: 'Praesent turpis. Praesent blandit laoreet nibh. Nunc nonummy metus.'
  },
  {
    label: 'years of experience',
    total: new Date().getFullYear() - 1996,
    content: 'Praesent turpis. Praesent blandit laoreet nibh. Nunc nonummy metus.'
  }
];

/* Outer container with responsive vertical padding */
const StyledContainer = styled(Container)`
  padding: 5rem 1rem;
  @media (min-width: 768px) {
    padding: 10rem 1rem;
  }
`;

/* Wrapper for the overall about layout (already using grid) */
const GridWrapper = styled.div`
  display: grid;
  gap: 4rem;
  grid-template-columns: 1fr;

  @media (min-width: 768px) {
    gap: 6rem;
    grid-template-columns: 0.8fr 1fr;
  }
`;

const LeftColumn = styled.div`
  text-align: center;
  @media (min-width: 768px) {
    text-align: right;
  }
`;

const RightColumn = styled.div`
  width: 100%;
`;

const StatRow = styled.div`
  margin-bottom: 2rem;

  @media (max-width: 767px) {
    display: grid;
    gap: 1rem;
    text-align: center;
    grid-template-columns: 6rem 1fr;
  }
  @media (min-width: 768px) {
    display: flex;
    align-items: center;
  }
`;

/* Container for the statistic value and label */
const StatInfo = styled.div`
  display: grid;
  gap: 0.5rem;
  max-width: 100px;
  width: 100%;
`;

/* Styling for the number and plus sign */
const StatValue = styled.div`
  align-items: start;
  color: ${({ theme }) => theme.palette.common.black};
  display: grid;
  font-size: 2rem;
  font-weight: bold;
  grid-template-columns: min-content min-content;
`;

/* Plus sign styling */
const PlusSign = styled.span`
  color: ${({ theme }) => theme.palette.warning.main};
  font-size: 1.2rem;
  margin-left: 0;
  margin-top: -1rem;
`;

/* Label for the statistic */
const StatLabel = styled(Typography)`
  && {
    color: ${({ theme }) => theme.palette.text.disabled};
    font-size: 0.7rem;
    justify-self: start;
    line-height: 1.7;
    text-align: left;
    text-transform: uppercase;
  }
`;

/* The descriptive content next to the stat info.
   When in horizontal mode this will be to the right with a left border;
   In vertical mode it will appear below without that border. */
const StatContent = styled(Typography)`
  && {
    border-left: 1px dashed ${({ theme }) => theme.palette.divider};
    color: ${({ theme }) => theme.palette.text.secondary};
    flex: 1;
    padding: 1rem 0 1rem 1rem;
    padding-left: 1rem;
    text-align: left;

    @media (min-width: 768px) {
      margin-left: 1rem;
      padding-left: 1rem;
    }
  }
`;

/* Override the MUI button if you need additional layout styling. */
const AboutButton = styled(Button)`
  margin: 2rem 0;
`;

export default function LandingAbout() {
  return (
    <StyledContainer>
      <GridWrapper>
        <LeftColumn>
          <Typography
            component="div"
            variant="overline"
            fontWeight={700}
            sx={{ color: 'text.disabled' }}
          >
            About us
          </Typography>
          <Typography variant="h2" fontSize={40} style={{ margin: '1.5rem 0' }}>
            Who We Are
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            In hac habitasse platea dictumst. Aliquam lobortis. Lorem ipsum dolor sit
            amet, consectetuer adipiscing elit. In dui magna, posuere eget, vestibulum et,
            tempor auctor, justo. Pellentesque habitant morbi tristique senectus et netus
            et malesuada fames ac turpis egestas.
          </Typography>
          <AboutButton
            size="small"
            color="inherit"
            endIcon={<ChevronRightIcon />}
            sx={{ mt: 4 }}
          >
            Learn more
          </AboutButton>
        </LeftColumn>
        <RightColumn>
          {ROWS.map((row) => (
            <StatRow key={row.label}>
              <StatInfo>
                <StatValue>
                  {fShortenNumber(row.total)}
                  <PlusSign>+</PlusSign>
                </StatValue>
                <StatLabel variant="overline">{row.label}</StatLabel>
              </StatInfo>
              <StatContent variant="body2">{row.content}</StatContent>
            </StatRow>
          ))}
        </RightColumn>
      </GridWrapper>
    </StyledContainer>
  );
}
