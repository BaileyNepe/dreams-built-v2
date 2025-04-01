import { createLazyFileRoute } from '@tanstack/react-router';
import { type FC } from 'react';
import styled from 'styled-components';
import { useResponsive } from 'utils/hooks/useResponsive';
import video from '../../assets/dreamsbuilt.webm';
import posterImage from '../../assets/poster.webp';

const VideoBackground = styled.video`
  height: 100%;
  left: 0;
  max-height: 50rem;
  object-fit: cover;
  position: fixed;
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

const HomePage: FC = () => {
  const isMobile = useResponsive('down', 'sm');
  if (isMobile) {
    return <PosterImage src={posterImage} alt="Background poster" />;
  }
  return (
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
  );
};

export const Route = createLazyFileRoute('/_landing/')({
  component: HomePage
});
