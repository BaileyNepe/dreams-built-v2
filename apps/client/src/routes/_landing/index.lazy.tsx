import { createLazyFileRoute } from '@tanstack/react-router';
import { type FC } from 'react';
import styled from 'styled-components';
import { bgBlur } from 'themes/css';
import { useResponsive } from 'utils/hooks/useResponsive';
import video from '../../assets/dreamsbuilt.webm';
import posterImage from '../../assets/poster.webp';

const VideoBackground = styled.video`
  height: 100%;
  left: 0;
  max-height: 50rem;
  object-fit: cover;
  top: 0;
  width: 100%;
  z-index: -1;
`;

const PosterImage = styled.img`
  height: 100%;
  left: 0;
  max-height: 50rem;
  object-fit: cover;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: -1;
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  height: 80rem;
`;

const Container = styled.div`
  ${({ theme }) =>
    bgBlur({
      color: theme.palette.common.black,
      overlay: true,
      blur: 0.001,
      opacity: 0.1
    })};
`;

const HomePage: FC = () => {
  const isMobile = useResponsive('down', 'sm');
  if (isMobile) {
    return <PosterImage src={posterImage} alt="Background poster" />;
  }
  return (
    <>
      <Container>
        <VideoBackground
          src={video}
          poster={posterImage}
          preload="auto"
          autoPlay
          loop
          muted
          playsInline
        >
          Your browser does not support the video tag.
        </VideoBackground>
      </Container>
      <Section />
    </>
  );
};

export const Route = createLazyFileRoute('/_landing/')({
  component: HomePage
});
