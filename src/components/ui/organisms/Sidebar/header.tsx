import { theme } from '@/components/theme';
import React, { ReactNode } from 'react';
import { FaBars } from 'react-icons/fa';
import { IconContext } from 'react-icons/lib';
import styled from 'styled-components';
import { NavIcon } from './styles';

const Nav = styled.div`
  background: #15171c;
  height: 3rem;
  display: flex;
  justify-content: flex-start;
  align-items: center;
`;

const Header = ({ sidebar, setSidebar }: { sidebar: boolean; setSidebar: (state: boolean) => void }) => {
  const renderSidebarToggle = (): ReactNode => {
    if (!sidebar) {
      return (
        <NavIcon>
          <FaBars onClick={() => setSidebar(true)} />
        </NavIcon>
      );
    }
    return null;
  };

  return (
    <Nav>
      <IconContext.Provider value={{ color: theme.colors.iconColor }}>{renderSidebarToggle()}</IconContext.Provider>
    </Nav>
  );
};

export default Header;
