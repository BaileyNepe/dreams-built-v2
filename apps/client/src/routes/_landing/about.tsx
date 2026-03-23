import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import StarIcon from '@mui/icons-material/Star';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { createFileRoute } from '@tanstack/react-router';
import Driveway from 'assets/driveway.webp';
import { Button } from 'components/Button';
import { RouterLink } from 'components/Link';
import { StyledCaption, StyledHeading } from 'components/styles';
import styled from 'styled-components';
import { fShortenNumber } from 'utils/format-number';
import { paths } from 'utils/paths';

const FOUNDING_YEAR = 2015;

const COMPANY_STATS = [
  {
    label: 'projects completed',
    total: 600,
    content:
      'Completed projects across the Waikato region, from small residential slabs to large-scale commercial foundations in Hamilton and beyond.'
  },
  {
    label: 'happy clients',
    total: 550,
    content:
      'Homeowners, developers, and commercial clients who trust Dreams Built for reliable, high-quality concrete and construction work.'
  },
  {
    label: 'years of experience',
    total: new Date().getFullYear() - FOUNDING_YEAR,
    content:
      'Years of hands-on experience in concrete foundations, driveways, patios, and landscaping across Waikato and Hamilton.'
  }
];

const VALUES = [
  {
    title: 'Quality',
    tagline: 'No shortcuts, ever.',
    description:
      'Every pour, every finish, every job meets the highest standards of craftsmanship. We use quality materials and proven techniques because your foundation is the most important part of your build.'
  },
  {
    title: 'Integrity',
    tagline: 'Straight talk, always.',
    description:
      'Honesty and transparency are at the core of everything we do. You get clear pricing, honest timelines, and straightforward communication from the first call to final sign-off.'
  },
  {
    title: 'Reliability',
    tagline: 'We show up. We deliver.',
    description:
      'When we make a commitment, we keep it. Our clients count on us to show up on time, work consistently, and finish what we start — on schedule and on budget.'
  },
  {
    title: 'Innovation',
    tagline: 'Better ways to build.',
    description:
      'We continuously improve our techniques, materials, and processes. From modern concrete mixes to more efficient site management, we look for smarter ways to deliver better results.'
  }
];

const WHY_HIGHLIGHTS = [
  { stat: '600+', label: 'Projects completed', detail: 'Across Waikato and Hamilton' },
  { stat: 'Free', label: 'No-obligation quotes', detail: 'On-site assessment at no cost' },
  { stat: 'Local', label: 'Waikato-based team', detail: 'Hamilton, Morrinsville, Cambridge & beyond' }
];

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

// ── Styled components ─────────────────────────────────────────────────────────

const HeroSection = styled(Box)`
  height: 30rem;
  isolation: isolate;
  position: relative;
`;

const PosterImage = styled.img`
  height: 30rem;
  left: 0;
  object-fit: cover;
  position: absolute;
  top: 0;
  width: 100%;
  z-index: -1;
`;

const HeroOverlay = styled(Box)`
  background-color: rgba(0, 0, 0, 0.65);
  bottom: 0;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
  z-index: 0;
`;

const HeroContent = styled.div`
  display: grid;
  gap: 1rem;
  justify-content: center;
  max-width: 60rem;
  padding: 0 1rem;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;

  @media (min-width: 735px) {
    left: 50%;
    transform: translate(-50%, -50%);
  }
`;

const HighlightBar = styled(Box)`
  background-color: ${({ theme }) => theme.palette.primary.main};
  padding: 2.5rem 0;
`;

const HighlightItem = styled(Box)`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 1rem 1.5rem;
  text-align: center;

  @media (min-width: 768px) {
    border-right: 1px solid rgba(255, 255, 255, 0.15);

    &:last-child {
      border-right: none;
    }
  }
`;

const SectionContainer = styled(Container)`
  padding: 5rem 1rem;

  @media (min-width: 768px) {
    padding: 7rem 1rem;
  }
`;

const ValueCard = styled(Card)`
  && {
    border-top: 3px solid ${({ theme }) => theme.palette.primary.main};
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
  && {
    border-left: 4px solid ${({ theme }) => theme.palette.primary.main};
    height: 100%;
    padding: 2rem;
  }
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

// ── Component ─────────────────────────────────────────────────────────────────

function AboutComponent() {
  return (
    <>
      <HeroSection>
        <PosterImage src={Driveway} alt="Dreams Built concrete driveway in Waikato" />
        <HeroOverlay />
        <HeroContent>
          <StyledHeading variant="h1" fontSize={{ xs: 30, md: 40 }}>
            Waikato's Trusted Concrete Specialists
          </StyledHeading>
          <StyledCaption variant="body1" sx={{ maxWidth: 700, mx: 'auto' }}>
            Founded in {FOUNDING_YEAR}, Dreams Built has grown from a small family
            operation into one of the Waikato region's most trusted names in concrete
            foundations and construction. We're proud of every job we've completed across
            Hamilton, Morrinsville, Cambridge, and beyond.
          </StyledCaption>
        </HeroContent>
      </HeroSection>

      <HighlightBar>
        <Container>
          <Grid container>
            {WHY_HIGHLIGHTS.map((item) => (
              <Grid item xs={12} md={4} key={item.stat}>
                <HighlightItem>
                  <Typography
                    variant="h3"
                    fontWeight={800}
                    sx={{ color: 'secondary.main', lineHeight: 1 }}
                  >
                    {item.stat}
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    fontWeight={700}
                    sx={{ color: 'common.white', mt: 0.5 }}
                  >
                    {item.label}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: 'rgba(255,255,255,0.6)', mt: 0.25 }}
                  >
                    {item.detail}
                  </Typography>
                </HighlightItem>
              </Grid>
            ))}
          </Grid>
        </Container>
      </HighlightBar>

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
          These aren't just words on a wall — they're the principles our team brings to
          every job, every day.
        </Typography>

        <Grid container spacing={3}>
          {VALUES.map((value) => (
            <Grid item xs={12} sm={6} md={3} key={value.title}>
              <ValueCard>
                <Typography variant="h5" mb={0.5} color="primary.main" fontWeight={700}>
                  {value.title}
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  color="text.secondary"
                  mb={1.5}
                  sx={{ fontStyle: 'italic' }}
                >
                  {value.tagline}
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
                Dreams Built started in {FOUNDING_YEAR} as a small family operation
                focused on residential foundations in the Waikato. Word spread quickly —
                quality work, honest pricing, and a team that actually shows up — and our
                reputation grew alongside our capabilities.
              </Typography>
              <Typography variant="body1" paragraph>
                Over the years we've taken on larger commercial foundations for Hamilton
                subdivisions and rural Waikato builds, expanded into driveways, patios,
                fencing, and landscaping, and built a team of experienced tradespeople who
                share the same standards we started with.
              </Typography>
              <Typography variant="body1">
                Today, Dreams Built works on everything from single-house slabs in
                Cambridge to multi-lot foundation packages in Hamilton — but the approach
                hasn't changed: quality materials, correct technique, and a job finished
                to a standard we're proud to put our name on.
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
          Hear from some of the homeowners and businesses we've worked with across
          Waikato.
        </Typography>

        <Grid container spacing={3}>
          {TESTIMONIALS.map((testimonial) => (
            <Grid item xs={12} md={4} key={testimonial.author}>
              <TestimonialCard>
                <QuoteIcon />
                <Stack direction="row" spacing={0.25} mb={2}>
                  {['1', '2', '3', '4', '5'].map((n) => (
                    <StarIcon key={n} sx={{ fontSize: '1rem', color: 'warning.main' }} />
                  ))}
                </Stack>
                <Typography variant="body1" paragraph color="text.primary">
                  {testimonial.quote}
                </Typography>
                <Typography variant="subtitle2" fontWeight={700}>
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
          <Typography
            variant="body1"
            mb={4}
            sx={{ maxWidth: 600, mx: 'auto', color: 'grey.400' }}
          >
            Whether it's a new home foundation, a commercial build, or a driveway
            renovation, we'd love to hear about your project. Get in touch for a free,
            no-obligation quote.
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

export const Route = createFileRoute('/_landing/about')({
  head: () => ({
    meta: [
      { title: "About Us | Dreams Built – Waikato's Trusted Concrete Specialists" },
      {
        name: 'description',
        content:
          'Learn about Dreams Built — a Waikato-based concrete and construction company founded in 2015. 600+ projects completed across Hamilton, Morrinsville, Cambridge and the wider Waikato region.'
      }
    ]
  }),
  component: AboutComponent
});
