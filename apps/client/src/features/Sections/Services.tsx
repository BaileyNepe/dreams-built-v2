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

import A from 'assets/service/ic_service_analysis.svg';
import B from 'assets/service/ic_service_bullhorn.svg';
import C from 'assets/service/ic_service_mail.svg';
import D from 'assets/service/ic_service_seo.svg';

// ----------------------------------------------------------------------

const COLORS = ['primary', 'secondary', 'success', 'warning'] as const;

const SERVICES = [
  {
    name: 'SEO',
    icon: D,
    content: 'Nunc nonummy metus. Donec elit libero',
    path: paths.services
  },
  {
    name: 'Email Marketing',
    icon: C,
    content: 'Nunc nonummy metus. Donec elit libero',
    path: paths.services
  },
  {
    name: 'Search Engine Oprimization',
    icon: A,
    content: 'Nunc nonummy metus. Donec elit libero',
    path: paths.services
  },
  {
    name: 'Social Marketing',
    icon: B,
    content: 'Nunc nonummy metus. Donec elit libero',
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
          Nunc nonummy metus. Donec elit libero, sodales nec, volutpat a, suscipit non,
          turpis.
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
