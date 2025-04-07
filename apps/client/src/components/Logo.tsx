import LightLogoImage from 'assets/light.webp';
import DarkLogoImage from 'assets/logo_dark.webp';
import { env } from 'config/env';
import { type FC } from 'react';
import styled from 'styled-components';

const Image = styled.img`
  width: 120px;
`;

export const Logo: FC<{
  light?: boolean;
}> = ({ light = false }) => (
  <Image src={light ? LightLogoImage : DarkLogoImage} alt={env.company} />
);
