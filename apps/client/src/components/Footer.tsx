import { Container, Typography } from '@mui/material';

import { env } from 'config/env';
import { type FC } from 'react';
import styled from 'styled-components';
import { RouterLink } from './Link';
import { Logo } from './Logo';

const FooterRoot = styled.footer`
  background-color: #f8fafc; /* slate-50 background */
`;

const ContentWrapper = styled.div`
  padding-bottom: 4rem; /* py-16 */
  padding-top: 4rem;
`;

const LogoContainer = styled.div`
  display: flex;
  justify-content: center;
`;

const BottomSection = styled.div`
  align-items: center;
  border-top: 1px solid rgba(71, 85, 105, 0.1);
  display: flex;
  flex-direction: column; /* border-slate-400/10 */
  padding-bottom: 2.5rem; /* py-10 */
  padding-top: 2.5rem;

  @media (min-width: 640px) {
    flex-direction: row-reverse;
    justify-content: space-between;
  }
`;

const IconLinkContainer = styled.div`
  display: flex;
  gap: 1.5rem;
`;

const IconStyledLink = styled((props: React.ComponentProps<typeof RouterLink>) => (
  <RouterLink {...props} />
))`
  display: inline-flex;

  svg {
    fill: #94a3b8; /* slate-500 */
    transition: fill 0.2s ease-in-out;
  }

  &:hover svg {
    fill: #475569; /* slate-700 */
  }
`;

export const Footer: FC = () => (
  <FooterRoot>
    <Container>
      <ContentWrapper>
        <LogoContainer>
          <Logo />
        </LogoContainer>
      </ContentWrapper>
      <BottomSection>
        <IconLinkContainer>
          <IconStyledLink href="#" aria-label="Company on X">
            <svg width="24" height="24" aria-hidden="true" viewBox="0 0 24 24">
              <path d="M13.3174 10.7749L19.1457 4H17.7646L12.7039 9.88256L8.66193 4H4L10.1122 12.8955L4 20H5.38119L10.7254 13.7878L14.994 20H19.656L13.3171 10.7749H13.3174ZM11.4257 12.9738L10.8064 12.0881L5.87886 5.03974H8.00029L11.9769 10.728L12.5962 11.6137L17.7652 19.0075H15.6438L11.4257 12.9742V12.9738Z" />
            </svg>
          </IconStyledLink>
          <IconStyledLink href="#" aria-label="Company on GitHub">
            <svg width="24" height="24" aria-hidden="true" viewBox="0 0 24 24">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
            </svg>
          </IconStyledLink>
        </IconLinkContainer>
        <Typography
          variant="body2"
          sx={{ color: 'text.secondary', mt: { xs: 2, sm: 0 } }}
        >
          &copy; {new Date().getFullYear()} {env.company} Ltd. All rights reserved.
        </Typography>
      </BottomSection>
    </Container>
  </FooterRoot>
);
