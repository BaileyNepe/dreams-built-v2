import { Container, Typography } from '@mui/material';

import { env } from 'config/env';
import { type FC } from 'react';
import styled from 'styled-components';

import { Logo } from './Logo';
import { Socials } from './Socials';

const FooterRoot = styled.footer``;

const ContentWrapper = styled.div`
  padding: 4rem 0;
`;

const LogoContainer = styled.div`
  display: flex;
  justify-content: center;
`;

const BottomSection = styled.div`
  align-items: center;
  border-top: 1px solid rgba(71, 85, 105, 0.1);
  display: flex;
  flex-direction: column;
  padding: 2.5rem 0;

  @media (min-width: 640px) {
    flex-direction: row-reverse;
    justify-content: space-between;
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
        <Socials />
        <Typography
          variant="body2"
          sx={{ color: 'text.secondary', mt: { xs: 2, sm: 0 } }}
        >
          &copy; 2015 - {new Date().getFullYear()} {env.company} Ltd. All rights reserved.
        </Typography>
      </BottomSection>
    </Container>
  </FooterRoot>
);
