import Footer from '@/components/ui/atoms/Footer';
import Header from '@/components/ui/molecules/Header';
import type React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: grid;
  min-height: 100vh;
  grid-template-rows: min-content auto min-content;
  grid-template-areas: 'header' 'main' 'footer';
`;

const Main = styled.main`
  grid-area: main;
  justify-self: center;
  width: 100%;
  max-width: 120rem;
`;

const StandardLayout = ({ children }: { children: React.ReactNode }) => (
  <Container>
    <Header />
    <Main>{children}</Main>
    <Footer />
  </Container>
);

export default StandardLayout;
