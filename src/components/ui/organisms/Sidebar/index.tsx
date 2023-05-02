import { theme } from '@/components/theme';
import { useUser } from '@/components/utils/hooks/useUser';
import { AiOutlineClose } from 'react-icons/ai';
import { IconContext } from 'react-icons/lib';
import styled from 'styled-components';
import { menuItems } from './menuItems';
import { NavIcon } from './styles';
import SubMenu from './subMenu';
import { MenuItem } from './types';

const Nav = styled.nav`
  grid-area: side-navbar;
  background: #15171c;
  min-width: 250px;
  min-height: 100vh;
  height: 100%;
  display: flex;
  justify-content: center;
  overflow: scroll;
  top: 0;
  transition: 200ms;
`;

const SidebarWrap = styled.div`
  width: 100%;
`;

const filterMenuItems = (menu: MenuItem[], role: string): MenuItem[] => {
  return menu.reduce((acc: MenuItem[], item) => {
    if (item.roles && !item.roles.includes(role)) {
      return acc;
    }

    if (item.subNav) {
      const filteredSubNav = item.subNav.filter((subItem) => (subItem.roles ? subItem.roles.includes(role) : true));

      if (filteredSubNav.length === 1) {
        acc.push({
          title: filteredSubNav[0]?.title ?? '',
          path: filteredSubNav[0]?.path ?? '',
          icon: item.icon,
          roles: item.roles,
        });
      } else if (filteredSubNav.length > 1) {
        acc.push({ ...item, subNav: filteredSubNav });
      }
    } else {
      acc.push(item);
    }

    return acc;
  }, []);
};

const Sidebar = ({ setSidebar }: { setSidebar: (state: boolean) => void }) => {
  const { role } = useUser();

  const filteredMenu = filterMenuItems(menuItems, role);

  return (
    <Nav>
      <SidebarWrap>
        <IconContext.Provider value={{ color: theme.colors.iconColor }}>
          <NavIcon>
            <AiOutlineClose onClick={() => setSidebar(false)} />
          </NavIcon>
          {filteredMenu.map((item, index) => (
            <SubMenu item={item} key={index} setSidebar={setSidebar} />
          ))}
        </IconContext.Provider>
      </SidebarWrap>
    </Nav>
  );
};

export default Sidebar;
