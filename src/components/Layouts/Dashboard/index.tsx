import Sidebar from '@/components/ui/organisms/Sidebar';
import Header from '@/components/ui/organisms/Sidebar/header';
import { useState, type ReactNode } from 'react';
import styled from 'styled-components';

const Grid = styled.div`
  display: grid;
  min-height: 100vh;
  grid-template-rows: min-content auto min-content;
  grid-template-areas: 'header' 'main' 'footer';
`;

const getMenuGridStyle = (sidebar: boolean) => {
  if (sidebar) {
    return ` 
    grid-template-rows: auto;
    grid-template-areas: 'sidebar';
    @media only screen and (min-width: 50rem) {
        grid-template-columns: min-content 1fr;
        grid-template-rows: 3rem auto;
        grid-template-areas: 'sidebar header' 'sidebar main';
    }
    `;
  }
  return `
  grid-template-rows: min-content auto;
  grid-template-areas: 'header' 'main';
  `;
};

const MenuGrid = styled.div<{ sidebar: boolean }>`
  display: grid;
  min-height: 100vh;
  grid-template-columns: 1fr;
  ${(props) => getMenuGridStyle(props.sidebar)}
`;

const HeaderContainer = styled.header`
  grid-area: header;
`;

const Main = styled.main`
  grid-area: main;
  justify-self: center;
  width: 100%;
  max-width: 120rem;
`;

const StyledSidebar = styled.div<{ sidebar: boolean }>`
  grid-area: sidebar;
  display: ${(props) => (props.sidebar ? 'block' : 'none')};
`;

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const [sidebar, setSidebar] = useState(true);
  return (
    <Grid>
      <MenuGrid sidebar={sidebar}>
        <HeaderContainer>
          <Header setSidebar={setSidebar} sidebar={sidebar} />
        </HeaderContainer>
        <StyledSidebar sidebar={sidebar}>
          <Sidebar setSidebar={setSidebar} />
        </StyledSidebar>
        <Main>{children}</Main>
      </MenuGrid>
    </Grid>
  );
};

export default DashboardLayout;
