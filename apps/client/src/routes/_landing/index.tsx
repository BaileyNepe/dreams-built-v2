import { createFileRoute } from '@tanstack/react-router';
import LandingAbout from 'features/Sections/About';
import { FeatureSection } from 'features/Sections/Feature';
import LandingServices from 'features/Sections/Services';
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
      description="At Dreams Built, we care about every detail. We specialise in quality residential and commercial foundations, driveways, patios, fences, and landscaping."
      buttonText="Request a Free Quote"
      buttonLink={paths.contact}
    />
    <LandingServices />
    <LandingAbout />
  </>
);

export const Route = createFileRoute('/_landing/')({
  head: () => ({
    meta: [
      {
        title:
          'Dreams Built | Concrete Foundations, Driveways & Landscaping – Waikato, NZ'
      },
      {
        name: 'description',
        content:
          'Dreams Built specialises in expert concrete foundations, driveways, patios, fencing and landscaping for residential and commercial projects across Waikato and Hamilton, NZ.'
      }
    ]
  }),
  component: HomePage
});
