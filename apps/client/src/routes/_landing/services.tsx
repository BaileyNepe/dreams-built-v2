import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { createFileRoute } from '@tanstack/react-router';
import { Button } from 'components/Button';
import { RouterLink } from 'components/Link';
import { StyledCaption, StyledHeading } from 'components/styles';
import styled from 'styled-components';
import { bgBlur } from 'themes/css';
import { paths } from 'utils/paths';

import Contact from 'assets/contact.webp';
import DrivewayExposed from 'assets/driveway_2.webp';
import Fence from 'assets/fence.webp';
import Foundations from 'assets/foundations.webp';
import FoundationsComplete from 'assets/foundations_complete.webp';
import Landscape from 'assets/landscape.webp';
import Patio from 'assets/patio.webp';
import Repair from 'assets/repair.webp';
import Repair2 from 'assets/repair_2.webp';

const FOUNDATION_SERVICES = [
  {
    title: 'Residential Foundations',
    tag: 'Residential',
    description:
      'Engineered concrete slabs, strip footings, and raft foundations for new home builds across Waikato and Hamilton — built to last decades and meet all consent requirements.',
    backgroundImage: FoundationsComplete
  },
  {
    title: 'Commercial Foundations',
    tag: 'Commercial',
    description:
      'Heavy-duty foundations for commercial and industrial builds. We work with engineers and project managers to meet code requirements and tight construction schedules.',
    backgroundImage: Contact
  },
  {
    title: 'Foundation Repair',
    tag: 'Repair',
    description:
      'Cracked, settling, or subsiding foundations restored to full structural integrity. We diagnose the cause and apply lasting solutions, not just surface patches.',
    backgroundImage: Repair
  },
  {
    title: 'Concrete Slabs',
    tag: 'Slabs',
    description:
      'Precision-poured slabs for garages, sheds, sleepouts, and outbuildings. Reinforced and finished to a high standard with proper drainage and moisture barriers.',
    backgroundImage: Foundations
  }
];

const ADDITIONAL_SERVICES = [
  {
    title: 'Driveways & Patios',
    tag: 'Outdoor Living',
    description:
      'Exposed aggregate, broom-finish, and coloured concrete driveways and patios designed to boost kerb appeal and withstand the Waikato climate year-round.',
    backgroundImage: DrivewayExposed
  },
  {
    title: 'Fencing Solutions',
    tag: 'Fencing',
    description:
      'Concrete and timber fence installations for privacy, security, and boundary definition. We handle everything from posts to panels with a clean, durable finish.',
    backgroundImage: Fence
  },
  {
    title: 'Landscaping',
    tag: 'Landscaping',
    description:
      'Retaining walls, garden borders, paths, and outdoor feature work that integrates with your property and stands up to everyday use.',
    backgroundImage: Landscape
  },
  {
    title: 'Project Consulting',
    tag: 'Consulting',
    description:
      'Not sure where to start? We offer practical, no-nonsense advice on concrete specifications, consents, sequencing, and cost planning before a single shovel hits the ground.',
    backgroundImage: Repair2
  }
];

const WHY_HIGHLIGHTS = [
  { stat: '600+', label: 'Projects completed', detail: 'Across Waikato and Hamilton' },
  { stat: 'Free', label: 'No-obligation quotes', detail: 'On-site assessment at no cost' },
  { stat: 'Local', label: 'Waikato-based team', detail: 'Hamilton, Morrinsville, Cambridge & beyond' }
];

const PosterImage = styled.img`
  height: 30rem;
  left: 0;
  object-fit: cover;
  position: absolute;
  top: 0;
  width: 100%;
  z-index: -2;
`;

const HeroSection = styled(Box)`
  height: 30rem;
  position: relative;

  ${({ theme }) =>
    bgBlur({
      color: theme.palette.common.black,
      overlay: true,
      blur: 0.02,
      opacity: 0.7
    })};
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

const SectionContainer = styled(Container)`
  padding: 5rem 1rem;

  @media (min-width: 768px) {
    padding: 7rem 1rem;
  }
`;

interface ServiceCardProps {
  backgroundImg: string;
}

const ServiceCard = styled(Card)<ServiceCardProps>`
  && {
    color: white;
    height: 100%;
    overflow: hidden;
    padding: 2rem;
    position: relative;
    transition: all 0.3s ease-in-out;

    &::before {
      background-image: url(${(props) => props.backgroundImg});
      background-position: center;
      background-size: cover;
      content: '';
      height: 100%;
      left: 0;
      position: absolute;
      top: 0;
      transition: background-size 0.4s ease-in-out;
      width: 100%;
      z-index: -2;
    }

    &::after {
      background-color: rgba(0, 0, 0, 0.7);
      content: '';
      height: 100%;
      left: 0;
      position: absolute;
      top: 0;
      width: 100%;
      z-index: -1;
    }

    z-index: 1;

    &:hover {
      box-shadow: ${({ theme }) => theme.customShadows.z20};
      transform: translateY(-5px);

      &::before {
        background-size: 110%;
      }
    }
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

const ProcessSection = styled(Box)`
  background-color: ${({ theme }) => theme.palette.background.default};
  padding: 2rem 0;
`;

const ProcessStep = styled(Box)`
  padding: 2rem 0;
  position: relative;

  @media (min-width: 768px) {
    &:not(:last-child)::after {
      content: '';
      position: absolute;
      top: 2.5rem;
      right: -1rem;
      width: 2rem;
      height: 2px;
      background-color: ${({ theme }) => theme.palette.divider};
    }
  }
`;

const StepNumber = styled(Box)`
  align-items: center;
  background-color: ${({ theme }) => theme.palette.secondary.main};
  border-radius: 50%;
  color: white;
  display: flex;
  font-weight: bold;
  height: 3rem;
  justify-content: center;
  margin-bottom: 1rem;
  width: 3rem;
`;

function ServicesPage() {
  return (
    <>
      <HeroSection>
        <PosterImage src={Patio} alt="Dreams Built concrete services in Waikato" />
        <HeroContent>
          <StyledHeading variant="h1" fontSize={{ xs: 30, md: 40 }}>
            Expert Concrete & Construction Services in Waikato
          </StyledHeading>
          <StyledCaption variant="body1" sx={{ maxWidth: 700, mx: 'auto' }}>
            From engineered foundations to exposed aggregate driveways, Dreams Built
            delivers quality concrete work across Hamilton, Morrinsville, Cambridge, Te
            Awamutu, and the wider Waikato region.
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
        <Typography variant="h2" fontSize={40} mb={1}>
          Foundation Services
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={5}>
          Our core expertise — solid, lasting concrete foundations for every type of
          structure and terrain across the Waikato.
        </Typography>

        <Grid container spacing={3}>
          {FOUNDATION_SERVICES.map((service) => (
            <Grid item xs={12} sm={6} md={3} key={service.title}>
              <ServiceCard backgroundImg={service.backgroundImage}>
                <Chip
                  label={service.tag}
                  size="small"
                  sx={{
                    mb: 1.5,
                    bgcolor: 'rgba(255,255,255,0.15)',
                    color: 'white',
                    fontWeight: 600
                  }}
                />
                <Typography variant="h6" mb={1} color="white" fontWeight={600}>
                  {service.title}
                </Typography>
                <Typography variant="body2" color="grey.400">
                  {service.description}
                </Typography>
              </ServiceCard>
            </Grid>
          ))}
        </Grid>
      </SectionContainer>

      <ProcessSection>
        <Container>
          <Stack
            spacing={3}
            sx={{
              maxWidth: 480,
              mb: { xs: 5, md: 8 },
              mx: { xs: 'auto', md: 'unset' },
              textAlign: { xs: 'center', md: 'unset' }
            }}
          >
            <Typography variant="overline" sx={{ color: 'text.disabled' }}>
              Our Process
            </Typography>
            <Typography variant="h2" fontSize={40}>
              How We Work
            </Typography>
            <Typography sx={{ color: 'text.secondary' }}>
              A clear, structured process means no surprises — just quality work delivered
              on time and within budget.
            </Typography>
          </Stack>

          <Grid container spacing={4}>
            <Grid item xs={12} sm={6} md={3}>
              <ProcessStep>
                <StepNumber>1</StepNumber>
                <Typography variant="h6" mb={1}>
                  Consultation & Quote
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  We visit your site, understand your requirements, and provide a
                  detailed, transparent quote — no hidden costs.
                </Typography>
              </ProcessStep>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <ProcessStep>
                <StepNumber>2</StepNumber>
                <Typography variant="h6" mb={1}>
                  Planning & Consent
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  We coordinate consents, engineer sign-offs, and material sourcing so
                  everything is in place before work begins.
                </Typography>
              </ProcessStep>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <ProcessStep>
                <StepNumber>3</StepNumber>
                <Typography variant="h6" mb={1}>
                  Construction
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Our experienced crew gets to work with quality materials, correct
                  techniques, and attention to every detail.
                </Typography>
              </ProcessStep>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <ProcessStep>
                <StepNumber>4</StepNumber>
                <Typography variant="h6" mb={1}>
                  Completion & Sign-off
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  We handle required inspections and walk through the finished work with
                  you before calling the job done.
                </Typography>
              </ProcessStep>
            </Grid>
          </Grid>
        </Container>
      </ProcessSection>

      <SectionContainer>
        <Typography variant="h2" fontSize={40} mb={1}>
          Additional Services
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={5}>
          Beyond foundations, we handle everything your property needs — driveways,
          patios, fencing, landscaping, and more.
        </Typography>

        <Grid container spacing={3}>
          {ADDITIONAL_SERVICES.map((service) => (
            <Grid item xs={12} sm={6} md={3} key={service.title}>
              <ServiceCard backgroundImg={service.backgroundImage}>
                <Chip
                  label={service.tag}
                  size="small"
                  sx={{
                    mb: 1.5,
                    bgcolor: 'rgba(255,255,255,0.15)',
                    color: 'white',
                    fontWeight: 600
                  }}
                />
                <Typography variant="h6" mb={1} color="white" fontWeight={600}>
                  {service.title}
                </Typography>
                <Typography variant="body2" color="grey.400">
                  {service.description}
                </Typography>
              </ServiceCard>
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
            Ready to Start Your Project?
          </Typography>
          <Typography
            variant="body1"
            mb={4}
            sx={{ maxWidth: 600, mx: 'auto', color: 'grey.400' }}
          >
            Get in touch for a free, no-obligation quote. We work across Hamilton,
            Morrinsville, Cambridge, Te Awamutu, and the wider Waikato.
          </Typography>
          <RouterLink to={paths.contact}>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              endIcon={<ChevronRightIcon />}
            >
              Get a Free Quote
            </Button>
          </RouterLink>
        </Container>
      </Box>
    </>
  );
}

export const Route = createFileRoute('/_landing/services')({
  head: () => ({
    meta: [
      {
        title:
          'Concrete & Construction Services | Dreams Built – Waikato & Hamilton, NZ'
      },
      {
        name: 'description',
        content:
          'Expert concrete foundations, driveways, patios, fencing and landscaping in Waikato and Hamilton, NZ. Residential and commercial. Contact Dreams Built for a free quote.'
      }
    ]
  }),
  component: ServicesPage
});
