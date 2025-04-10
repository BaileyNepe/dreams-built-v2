import { createLazyFileRoute } from '@tanstack/react-router';
import LandingAbout from 'features/Sections/About';
import { FeatureSection } from 'features/Sections/Feature';
import { type FC } from 'react';
import { paths } from 'utils/paths';
import video from '../../assets/dreamsbuilt.webm';
import posterImage from '../../assets/poster.webp';

const HomePage: FC = () => (
  <>
    <FeatureSection
      videoUrl={video}
      imageUrl={posterImage}
      imageAlt="Dreams Built Video Background"
      title="Building the Foundation to Your Dream"
      description="At Dreams Built, we care about every detail. We specialize in quality residential and commercial foundations, driveways, patios, fences, and landscaping."
      buttonText="Request a Free Quote"
      buttonLink={paths.contact}
    />
    <LandingAbout />
  </>
);

export const Route = createLazyFileRoute('/_landing/')({
  component: HomePage
});
