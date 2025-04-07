import FacebookIcon from '@mui/icons-material/Facebook';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import { env } from 'config/env';
import styled from 'styled-components';
import { RouterLink } from './Link';

const IconLinkContainer = styled.div`
  display: flex;
  gap: 0.7rem;
`;

const IconStyledLink = styled((props: React.ComponentProps<typeof RouterLink>) => (
  <RouterLink {...props} />
))`
  display: inline-flex;

  svg {
    color: #94a3b8; /* slate-500 */
    transition: color 0.2s ease-in-out;
  }

  &:hover svg {
    color: #475569; /* slate-700 */
  }
`;

export const Socials = () => (
  <IconLinkContainer>
    <IconStyledLink
      href="https://www.facebook.com/profile.php?id=61556609252800"
      aria-label={`${env.company} on Facebook`}
    >
      <FacebookIcon />
    </IconStyledLink>
    <IconStyledLink
      href="https://www.linkedin.com/company/dreams-built"
      aria-label={`${env.company} on LinkedIn`}
    >
      <LinkedInIcon />
    </IconStyledLink>
  </IconLinkContainer>
);
