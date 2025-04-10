import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { createLazyFileRoute } from '@tanstack/react-router';
import { Button } from 'components/Button';
import SvgColor from 'components/SvgColor';
import styled from 'styled-components';
import { paths } from 'utils/paths';

// Import service icons
import A from 'assets/service/ic_service_analysis.svg';
import B from 'assets/service/ic_service_bullhorn.svg';
import C from 'assets/service/ic_service_mail.svg';
import D from 'assets/service/ic_service_seo.svg';

const FOUNDATION_SERVICES = [
  {
    title: 'Residential Foundations',
    description:
      'Custom designed residential foundations for new home builds, ensuring durability and stability that lasts for decades.',
    icon: A
  },
  {
    title: 'Commercial Foundations',
    description:
      'Expertly engineered commercial building foundations that meet all code requirements and support your business infrastructure.',
    icon: B
  },
  {
    title: 'Foundation Repair',
    description:
      'Comprehensive repair services for cracked, settling, or damaged foundations, restoring structural integrity.',
    icon: C
  },
  {
    title: 'Concrete Slabs',
    description:
      'Precision-poured concrete slabs for garages, sheds, and other structures requiring a solid and level base.',
    icon: D
  }
];

const ADDITIONAL_SERVICES = [
  {
    title: 'Driveways & Patios',
    description:
      "Beautiful, durable concrete driveways and patios designed to enhance your property's curb appeal and outdoor living space.",
    icon: C
  },
  {
    title: 'Fencing Solutions',
    description:
      'Professional fence installation using quality materials for privacy, security, and aesthetic enhancement of your property.',
    icon: D
  },
  {
    title: 'Landscaping',
    description:
      'Comprehensive landscaping services to transform your outdoor areas into beautiful, functional spaces.',
    icon: A
  },
  {
    title: 'Project Consulting',
    description:
      'Expert consultation for your construction projects, helping you plan effectively and avoid costly mistakes.',
    icon: B
  }
];

const HeroSection = styled(Box)`
  background-color: ${({ theme }) => theme.palette.background.paper};
  padding: 10rem 0 5rem;
  text-align: center;
`;

const SectionContainer = styled(Container)`
  padding: 5rem 1rem;

  @media (min-width: 768px) {
    padding: 7rem 1rem;
  }
`;

const ServiceCard = styled(Card)`
  height: 100%;
  padding: 2rem;
  transition:
    transform 0.3s ease-in-out,
    box-shadow 0.3s ease-in-out;

  &:hover {
    box-shadow: ${({ theme }) => theme.customShadows.z20};
    transform: translateY(-5px);
  }
`;

const ProcessSection = styled(Box)`
  background-color: ${({ theme }) => theme.palette.background.default};
  padding: 5rem 0;
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
  background-color: ${({ theme }) => theme.palette.primary.main};
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
        <Container>
          <Typography
            variant="overline"
            sx={{ color: 'text.disabled', display: 'block', mb: 1 }}
          >
            Professional Services
          </Typography>
          <Typography variant="h1" fontSize={{ xs: 40, md: 60 }} mb={4}>
            Building Dreams from the Ground Up
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: 700, mx: 'auto', mb: 4 }}
          >
            At Dreams Built, we specialize in creating solid foundations for residential
            and commercial buildings, along with complementary services that ensure your
            property is beautiful, functional, and built to last.
          </Typography>
          <Button
            size="large"
            variant="contained"
            color="primary"
            href={paths.contact}
            endIcon={<ChevronRightIcon />}
          >
            Request a Free Quote
          </Button>
        </Container>
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
              <ServiceCard>
                <SvgColor
                  src={service.icon}
                  sx={{
                    width: 60,
                    height: 60,
                    mb: 3,
                    color: (theme) => theme.palette.primary.main
                  }}
                />
                <Typography variant="h6" mb={1}>
                  {service.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
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
                  Initial Consultation
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  We meet to understand your needs, assess your property, and provide a
                  detailed quote.
                </Typography>
              </ProcessStep>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <ProcessStep>
                <StepNumber>2</StepNumber>
                <Typography variant="h6" mb={1}>
                  Design & Planning
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Our engineers create detailed plans and obtain necessary permits for
                  your project.
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
                  Final Inspection
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  We conduct a thorough inspection and walkthrough to ensure everything
                  meets our high standards.
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
              <ServiceCard>
                <SvgColor
                  src={service.icon}
                  sx={{
                    width: 60,
                    height: 60,
                    mb: 3,
                    color: (theme) => theme.palette.secondary.main
                  }}
                />
                <Typography variant="h6" mb={1}>
                  {service.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
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
          <Typography variant="h3" mb={3}>
            Ready to Start Your Project?
          </Typography>
          <Typography variant="body1" mb={4} sx={{ maxWidth: 600, mx: 'auto' }}>
            Contact us today for a free consultation and quote. Our team is ready to turn
            your vision into reality.
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            href={paths.contact}
            endIcon={<ChevronRightIcon />}
          >
            Contact Us Now
          </Button>
        </Container>
      </Box>
    </>
  );
}

export const Route = createLazyFileRoute('/_landing/services')({
  component: ServicesPage
});
