import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { createLazyFileRoute } from '@tanstack/react-router';
import { Button } from 'components/Button';
import { RouterLink } from 'components/Link';
import { StyledCaption, StyledHeading } from 'components/styles';
import styled from 'styled-components';
import { bgGradient } from 'themes/css';
import { fShortenNumber } from 'utils/format-number';
import { paths } from 'utils/paths';

// Company statistics to display
const COMPANY_STATS = [
  {
    label: 'projects',
    total: 600,
    content:
      'Completed projects throughout Waikato and Hamilton regions, ranging from residential to commercial foundations.'
  },
  {
    label: 'Happy clients',
    total: 550,
    content:
      'Satisfied clients who trust Dreams Built for quality construction services and professional workmanship.'
  },
  {
    label: 'years of experience',
    total: new Date().getFullYear() - 1996,
    content:
      'Decades of combined experience in concrete foundations, landscaping, and construction services.'
  }
];

// Company values
const VALUES = [
  {
    title: 'Quality',
    description:
      'We never compromise on the quality of our work. Every project we undertake meets the highest standards of craftsmanship and durability.'
  },
  {
    title: 'Integrity',
    description:
      'Honesty and transparency are at the core of our business. We build trust through straightforward communication and ethical practices.'
  },
  {
    title: 'Reliability',
    description:
      'When we make a commitment, we stand by it. Our clients can count on us to deliver projects on time and within budget.'
  },
  {
    title: 'Innovation',
    description:
      'We continuously seek better ways to serve our clients through improved techniques, materials, and construction methods.'
  }
];

// Client testimonials
const TESTIMONIALS = [
  {
    quote:
      "Dreams Built transformed our property with a beautiful new driveway and patio. The team was professional, the work was completed on time, and the quality is outstanding. Couldn't be happier!",
    author: 'Hannah V.',
    location: 'Hamilton'
  },
  {
    quote:
      'When we needed a solid foundation for our new home, Dreams Built delivered beyond our expectations. Their attention to detail and expertise gave us confidence throughout the entire building process.',
    author: 'Kelly S.',
    location: 'Morrinsville'
  },
  {
    quote:
      'The team at Dreams Built exceeded our expectations with their professionalism and quality of work. Our new patio looks fantastic! We highly recommend them for any concrete work.',
    author: 'John E.',
    location: 'Hamilton'
  }
];

// Styled components
const HeroSection = styled(Box)`
  align-items: center;
  display: flex;
  height: 30rem;
  ${({ theme }) =>
    bgGradient({
      direction: '135deg',
      startColor: theme.palette.secondary.darkest,
      endColor: theme.palette.secondary.main
    })};

  text-align: center;
`;

const SectionContainer = styled(Container)`
  padding: 5rem 1rem;

  @media (min-width: 768px) {
    padding: 7rem 1rem;
  }
`;

const ValueCard = styled(Card)`
  && {
    height: 100%;
    padding: 2rem;

    transition:
      transform 0.3s ease-in-out,
      box-shadow 0.3s ease-in-out;

    &:hover {
      box-shadow: ${({ theme }) => theme.customShadows.z20};
      transform: translateY(-5px);
    }
  }
`;

const StorySection = styled(Box)`
  background-color: ${({ theme }) => theme.palette.background.default};
  padding: 5rem 0;
`;

const TestimonialCard = styled(Card)`
  height: 100%;
  padding: 2rem;
  position: relative;
`;

const QuoteIcon = styled(FormatQuoteIcon)`
  color: ${({ theme }) => theme.palette.primary.main};
  font-size: 2rem;
  margin-bottom: 1rem;
  opacity: 0.2;
`;

const StatRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;

  @media (min-width: 768px) {
    align-items: center;
    flex-direction: row;
  }
`;

const StatInfo = styled.div`
  display: grid;
  gap: 0.5rem;
  max-width: 100px;
  width: 100%;
`;

const StatValue = styled.div`
  align-items: start;
  color: ${({ theme }) => theme.palette.common.black};
  display: grid;
  font-size: 2rem;
  font-weight: bold;
  grid-template-columns: min-content min-content;
`;

const PlusSign = styled.span`
  color: ${({ theme }) => theme.palette.warning.main};
  font-size: 1.2rem;
  margin-left: 0;
  margin-top: -1rem;
`;

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

const StatContent = styled(Typography)`
  && {
    border-left: 1px dashed ${({ theme }) => theme.palette.divider};
    color: ${({ theme }) => theme.palette.text.secondary};
    flex: 1;
    padding: 1rem 0 1rem 1rem;
    text-align: left;

    @media (min-width: 768px) {
      margin-left: 1rem;
      padding-left: 1rem;
    }
  }
`;

function AboutComponent() {
  return (
    <>
      <HeroSection>
        <Container>
          <StyledHeading variant="h1" fontSize={{ xs: 40, md: 45 }} mb={4}>
            Building Excellence
          </StyledHeading>
          <StyledCaption variant="caption" sx={{ maxWidth: 700, mx: 'auto', mb: 4 }}>
            Dreams Built was founded on a simple principle: provide the highest quality
            foundations and concrete work with unmatched service and reliability. Today,
            we're proud to be one of Waikato's most trusted construction specialists.
          </StyledCaption>
        </Container>
      </HeroSection>

      <SectionContainer>
        <Typography variant="h2" fontSize={40} mb={1} textAlign="center">
          Our Values
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          mb={5}
          textAlign="center"
          sx={{ maxWidth: 700, mx: 'auto' }}
        >
          At Dreams Built, our work is guided by a set of core principles that define who
          we are and how we operate.
        </Typography>

        <Grid container spacing={3}>
          {VALUES.map((value, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <ValueCard>
                <Typography variant="h5" mb={2} color="primary.main">
                  {value.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {value.description}
                </Typography>
              </ValueCard>
            </Grid>
          ))}
        </Grid>
      </SectionContainer>

      <StorySection>
        <Container>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" fontSize={40} mb={3}>
                Our Story
              </Typography>
              <Typography variant="body1" paragraph>
                Dreams Built began as a small family operation in 2015, specialising in
                residential foundations. With a commitment to quality and a passion for
                craftsmanship, our reputation quickly grew throughout the Waikato region.
              </Typography>
              <Typography variant="body1" paragraph>
                Over the years, we've expanded our services to include commercial
                foundations, driveways, patios, fencing, and landscaping, but our core
                values remain the same: quality, integrity, and reliability in everything
                we do.
              </Typography>
              <Typography variant="body1">
                Today, Dreams Built employs a team of dedicated professionals who share
                our vision of excellence in construction. From small residential projects
                to large commercial foundations, we approach each job with the same
                attention to detail and commitment to quality.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              {COMPANY_STATS.map((row) => (
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
            </Grid>
          </Grid>
        </Container>
      </StorySection>

      <SectionContainer>
        <Typography variant="h2" fontSize={40} mb={1} textAlign="center">
          What Our Clients Say
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          mb={5}
          textAlign="center"
          sx={{ maxWidth: 700, mx: 'auto' }}
        >
          Don't just take our word for it - hear from some of our satisfied clients
          throughout Waikato.
        </Typography>

        <Grid container spacing={4}>
          {TESTIMONIALS.map((testimonial, index) => (
            <Grid item xs={12} md={4} key={index}>
              <TestimonialCard>
                <QuoteIcon />
                <Typography variant="body1" paragraph>
                  {testimonial.quote}
                </Typography>
                <Typography variant="subtitle1" fontWeight="bold">
                  {testimonial.author}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {testimonial.location}
                </Typography>
              </TestimonialCard>
            </Grid>
          ))}
        </Grid>
      </SectionContainer>

      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          py: { xs: 5, md: 10 },
          textAlign: 'center'
        }}
      >
        <Container>
          <Typography variant="h3" mb={3} color="white">
            Ready to Work with Us?
          </Typography>
          <Typography variant="body1" mb={4} sx={{ maxWidth: 600, mx: 'auto' }}>
            Whether you're planning a new home foundation, a commercial project, or a
            driveway renovation, our team is ready to help turn your vision into reality.
          </Typography>
          <RouterLink to={paths.contact}>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              endIcon={<ChevronRightIcon />}
            >
              Contact Us Today
            </Button>
          </RouterLink>
        </Container>
      </Box>
    </>
  );
}

export const Route = createLazyFileRoute('/_landing/about')({
  component: AboutComponent
});
