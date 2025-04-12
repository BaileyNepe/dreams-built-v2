import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { createLazyFileRoute } from '@tanstack/react-router';
import { Button } from 'components/Button';
import styled from 'styled-components';
import { paths } from 'utils/paths';

// Import background images
import Contact from 'assets/contact.webp';
import DrivewayExposed from 'assets/driveway_2.webp';
import Fence from 'assets/fence.webp';
import Foundations from 'assets/foundations.webp';
import FoundationsComplete from 'assets/foundations_complete.webp';
import Landscape from 'assets/landscape.webp';
import Patio from 'assets/patio.webp';
import Repair from 'assets/repair.webp';
import Repair2 from 'assets/repair_2.webp';
import { RouterLink } from 'components/Link';
import { bgBlur } from 'themes/css';

const FOUNDATION_SERVICES = [
  {
    title: 'Residential Foundations',
    description:
      'Custom designed residential foundations for new home builds, ensuring durability and stability that lasts for decades.',
    backgroundImage: FoundationsComplete
  },
  {
    title: 'Commercial Foundations',
    description:
      'Expertly engineered commercial building foundations that meet all code requirements and support your business infrastructure.',
    backgroundImage: Contact
  },
  {
    title: 'Foundation Repair',
    description:
      'Comprehensive repair services for cracked, settling, or damaged foundations, restoring structural integrity.',
    backgroundImage: Repair
  },
  {
    title: 'Concrete Slabs',
    description:
      'Precision-poured concrete slabs for garages, sheds, and other structures requiring a solid and level base.',
    backgroundImage: Foundations
  }
];

const ADDITIONAL_SERVICES = [
  {
    title: 'Driveways & Patios',
    description:
      "Beautiful, durable concrete driveways and patios designed to enhance your property's curb appeal and outdoor living space.",
    backgroundImage: DrivewayExposed
  },
  {
    title: 'Fencing Solutions',
    description:
      'Professional fence installation using quality materials for privacy, security, and aesthetic enhancement of your property.',
    backgroundImage: Fence
  },
  {
    title: 'Landscaping',
    description:
      'Comprehensive landscaping services to transform your outdoor areas into beautiful, functional spaces.',
    backgroundImage: Landscape
  },
  {
    title: 'Project Consulting',
    description:
      'Expert consultation for your construction projects, helping you plan effectively and avoid costly mistakes.',
    backgroundImage: Repair2
  }
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

const StyledHeading = styled(Typography)`
  && {
    text-align: center;
    text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.6);
    text-transform: uppercase;
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

    /* Background image setup */
    &::before {
      background-image: url(${(props) => props.backgroundImg});
      background-position: center;
      background-size: cover;
      content: '';
      height: 100%;
      left: 0;
      position: absolute;
      top: 0;
      width: 100%;
      z-index: -2;
    }

    /* Dark overlay for improved text readability */
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
        <PosterImage src={Patio} alt="Dreams Built Services" />
        <HeroContent>
          <StyledHeading variant="h1" fontSize={{ xs: 30, md: 40 }} color="common.white">
            Building Dreams from the Ground Up
          </StyledHeading>
          <Typography
            variant="body1"
            color="common.white"
            sx={{ maxWidth: 700, mx: 'auto' }}
          >
            At Dreams Built, we specialize in creating solid foundations for residential
            and commercial buildings, along with complementary services that ensure your
            property is beautiful, functional, and built to last.
          </Typography>
        </HeroContent>
      </HeroSection>

      <SectionContainer>
        <Typography variant="h2" fontSize={40} mb={1}>
          Foundation Services
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={5}>
          Our core expertise is in creating solid, lasting foundations for all types of
          structures.
        </Typography>

        <Grid container spacing={3}>
          {FOUNDATION_SERVICES.map((service, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <ServiceCard backgroundImg={service.backgroundImage}>
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
              Our streamlined process ensures quality, efficiency, and complete
              satisfaction at every step of your project.
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
                  We meet to understand your needs, assess your property, and provide a
                  detailed, transparent quote.
                </Typography>
              </ProcessStep>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <ProcessStep>
                <StepNumber>2</StepNumber>
                <Typography variant="h6" mb={1}>
                  Project Organisation
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  We organise all aspects of your project, sourcing quality materials and
                  preparing for efficient execution.
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
                  Our experienced team executes the project with precision, quality
                  materials, and attention to detail.
                </Typography>
              </ProcessStep>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <ProcessStep>
                <StepNumber>4</StepNumber>
                <Typography variant="h6" mb={1}>
                  Completion & Inspection
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  We handle all required inspections and ensure that all work is completed
                  to the highest standard before final walkthrough.
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
          Beyond foundations, we offer comprehensive solutions for all your property
          needs.
        </Typography>

        <Grid container spacing={3}>
          {ADDITIONAL_SERVICES.map((service, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <ServiceCard backgroundImg={service.backgroundImage}>
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
            Contact us today for a free consultation and quote. Our team is ready to turn
            your vision into reality.
          </Typography>
          <RouterLink to={paths.contact}>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              endIcon={<ChevronRightIcon />}
            >
              Contact Us Now
            </Button>
          </RouterLink>
        </Container>
      </Box>
    </>
  );
}

export const Route = createLazyFileRoute('/_landing/services')({
  component: ServicesPage
});
