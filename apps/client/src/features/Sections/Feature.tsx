import { Typography } from '@mui/material';
import { type LinkProps } from '@tanstack/react-router';
import { Button } from 'components/Button';
import { RouterLink } from 'components/Link';
import { type FC } from 'react';
import styled from 'styled-components';
import { bgBlur } from 'themes/css';
import { useResponsive } from 'utils/hooks/useResponsive';

const VideoBackground = styled.video`
  height: 100dvh;
  left: 0;
  max-height: 100dvh;
  object-fit: cover;
  top: 0;
  width: 100%;
  z-index: -2;
`;

const PosterImage = styled.img`
  height: 100dvh;
  left: 0;
  max-height: 100dvh;
  object-fit: cover;
  top: 0;
  width: 100%;
  z-index: -2;
`;

const Container = styled.div`
  height: 100dvh;

  ${({ theme }) =>
    bgBlur({
      color: theme.palette.common.black,
      overlay: true,
      blur: 0.01,
      opacity: 0.5
    })};
`;

const Content = styled.div`
  display: grid;
  gap: 1.5rem;
  justify-content: center;
  max-width: 60rem;
  padding: 0 1rem;
  position: absolute;
  top: clamp(20rem, 40%, 50%);
  transform: translateY(-50%);
  z-index: 1;

  @media (min-width: 735px) {
    left: 50%;
    transform: translate(-50%, -50%);
  }
`;

const Block = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  margin-top: 1rem;
`;

const StyledHeading = styled(Typography)`
  text-align: center;
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.6);
  text-transform: uppercase;
`;

const StyledCaption = styled(Typography)`
  && {
    display: block;
    margin: 0.2rem auto 0.5rem;
    max-width: 30rem;
    text-align: center;
    text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.6);
  }
`;

export const FeatureSection: FC<{
  title: string;
  description: string;
  videoUrl: string;
  imageUrl: string;
  imageAlt: string;
  buttonText: string;
  buttonLink: LinkProps['to'];
}> = ({ title, description, videoUrl, imageUrl, imageAlt, buttonText, buttonLink }) => {
  const isMobile = useResponsive('down', 'sm');

  return (
    <>
      <Container>
        {isMobile ? (
          <PosterImage src={imageUrl} alt={imageAlt} />
        ) : (
          <VideoBackground
            src={videoUrl}
            poster={imageUrl}
            preload="auto"
            autoPlay
            loop
            muted
            playsInline
          />
        )}
        <Content>
          <StyledHeading variant="h1" color="white" gutterBottom>
            {title}
          </StyledHeading>
          <StyledCaption variant="caption" color="white" gutterBottom>
            {description}
          </StyledCaption>

          <Block>
            <RouterLink to={buttonLink}>
              <Button variant="contained" color="secondary" size="large">
                {buttonText}
              </Button>
            </RouterLink>
          </Block>
        </Content>
      </Container>
    </>
  );
};
