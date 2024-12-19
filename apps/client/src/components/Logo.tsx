import LogoImage from 'assets/logo.png';
import { env } from 'config/env';
import styled from 'styled-components';

const Image = styled.img`
  width: 120px;
`;

export const Logo = () => <Image src={LogoImage} alt={env.company} />;
