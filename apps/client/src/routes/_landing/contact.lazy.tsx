import { createLazyFileRoute } from '@tanstack/react-router';
import backgroundImage from 'assets/contact.webp';
import ContactSection from 'features/Sections/Contact';
import styled from 'styled-components';
import { bgBlur } from 'themes/css';

const PageContainer = styled.div`
  height: 100dvh;
  position: relative;
`;

const BackgroundImage = styled.div`
  ${({ theme }) =>
    bgBlur({
      imgUrl: backgroundImage,
      color: theme.palette.common.black,
      blur: 8,
      opacity: 0.04
    })}

  background-size: cover;
  height: 100%;
  position: absolute;
  width: 100%;
  z-index: -1;
`;

/* Wrapper to ensure content is above the background */
const ContentWrapper = styled.div`
  padding-top: 6rem;
  position: relative;
  z-index: 1;
`;

function RouteComponent() {
  return (
    <PageContainer>
      <BackgroundImage />
      <ContentWrapper>
        <ContactSection />
      </ContentWrapper>
    </PageContainer>
  );
}

export const Route = createLazyFileRoute('/_landing/contact')({
  component: RouteComponent
});
