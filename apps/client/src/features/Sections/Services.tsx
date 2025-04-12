import ArrowRightAltRoundedIcon from '@mui/icons-material/ArrowRightAltRounded';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link } from '@tanstack/react-router';
import SvgColor from 'components/SvgColor';
import { paths } from 'utils/paths';

import C from 'assets/service/commercial.svg';
import D from 'assets/service/concrete.svg';
import A from 'assets/service/driveways.svg';
import B from 'assets/service/fence.svg';

// ----------------------------------------------------------------------

const COLORS = ['primary', 'secondary', 'success', 'warning'] as const;

const SERVICES = [
  {
    name: 'Commercial Foundations',
    icon: C,
    content:
      'Expert concrete foundation solutions for commercial buildings, warehouses, and multi-unit residential properties.',
    path: paths.services
  },
  {
    name: 'Concrete Driveways & Patios',
    icon: A,
    content:
      'Custom concrete driveways, patios, and walkways built to enhance your property with durability and aesthetic appeal.',
    path: paths.services
  },
  {
    name: 'Residential Foundations',
    icon: D,
    content:
      'Quality concrete foundations for residential properties, ensuring structural integrity and longevity for your home construction.',

    path: paths.services
  },
  {
    name: 'Fencing Solutions',
    icon: B,
    content:
      "Professional fence installation services to secure and beautify your property, complementing your home's foundation and landscaping.",
    path: paths.services
  }
];

function ServiceItem({
  service,
  index
}: {
  service: {
    name: string;
    content: string;
    path: string;
    icon: string;
  };
  index: number;
}) {
  const { name, icon, content, path } = service;

  return (
    <Card
      sx={{
        px: 4,
        py: 5,
        textAlign: 'center',
        boxShadow: (theme) => theme.customShadows.outline,
        backgroundColor: 'background.paper',
        ...(index === 1 && {
          py: { xs: 5, md: 8 }
        }),
        ...(index === 2 && {
          py: { xs: 5, md: 10 },
          boxShadow: (theme) => ({
            md: theme.customShadows.medium,
            xs: theme.customShadows.outline
          })
        })
      }}
    >
      <SvgColor
        src={icon}
        sx={{
          width: 88,
          height: 88,
          mx: 'auto',
          color: (theme) => theme.palette[COLORS[index]].main
        }}
      />

      <Stack spacing={1} sx={{ my: 5 }}>
        <Typography variant="h6">{name}</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {content}
        </Typography>
      </Stack>

      <IconButton
        component={Link}
        href={path}
        color={
          (index === 0 && 'primary') ||
          (index === 1 && 'secondary') ||
          (index === 2 && 'success') ||
          'warning'
        }
      >
        <ArrowRightAltRoundedIcon sx={{ width: 20, height: 20 }} />
      </IconButton>
    </Card>
  );
}

// ----------------------------------------------------------------------

export default function LandingServices() {
  return (
    <Container
      sx={{
        py: { xs: 5, md: 10 }
      }}
    >
      <Stack
        spacing={3}
        sx={{
          maxWidth: 480,
          mb: { xs: 8, md: 5 },
          mx: { xs: 'auto', md: 'unset' },
          textAlign: { xs: 'center', md: 'unset' }
        }}
      >
        <Typography variant="overline" sx={{ color: 'text.disabled' }}>
          Our Services
        </Typography>

        <Typography variant="h2" fontSize={40}>
          We Provide
        </Typography>

        <Typography sx={{ color: 'text.secondary' }}>
          With decades of experience in concrete construction, we deliver high-quality
          foundations and concrete structures for residential and commercial properties.
          Our expert team ensures durability, structural integrity, and aesthetic
          excellence in every project.
        </Typography>
      </Stack>

      <Box
        sx={{
          gap: 4,
          display: 'grid',
          alignItems: 'center',
          gridTemplateColumns: {
            xs: 'repeat(1, 1fr)',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)'
          }
        }}
      >
        {SERVICES.map((service, index) => (
          <ServiceItem key={service.name} service={service} index={index} />
        ))}
      </Box>
    </Container>
  );
}

// ----------------------------------------------------------------------
