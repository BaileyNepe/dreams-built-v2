import { paths } from '@/components/utils/paths';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import styled from 'styled-components';

const SidebarLink = styled(Link)`
  display: flex;
  color: #e1e9fc;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  list-style: none;
  height: 60px;
  text-decoration: none;
  font-size: 1.1rem;

  &:hover {
    background: #252831;
    border-left: 4px solid #632ce4;
    color: #8f68e8;
    cursor: pointer;
  }
`;

const SidebarLabel = styled.span`
  margin-left: 1rem;
`;

const DropdownLink = styled(Link)`
  background: #414757;
  height: 60px;
  padding-left: 2rem;
  display: flex;
  align-items: center;
  color: #f5f5f5;
  font-size: 1.1rem;

  &:hover {
    background: #632ce4;
    color: #f5f5f5;
    cursor: pointer;
  }
`;

const SubMenu = ({
  item,
  setSidebar,
}: {
  item: {
    title: string;
    path?: string;
    icon?: React.ReactNode;
    subNav?: Array<{
      title: string;
      path: string;
    }>;
    iconOpened?: React.ReactNode;
    iconClosed?: React.ReactNode;
  };
  setSidebar: (open: boolean) => void;
}) => {
  const [subNav, setSubNav] = useState(false);
  const getWindowDimensions = () => {
    const { innerWidth: width } = window;
    return width;
  };

  const toggleNavigation = () => setSubNav(!subNav);

  const checkScreen = (subNav: boolean) => {
    const width = getWindowDimensions();
    if (subNav) {
      toggleNavigation();
    } else {
      if (width <= 799) {
        setSidebar(false);
      }
    }
  };

  if (item.title === 'Logout') {
    return (
      <SidebarLink href={paths.logout}>
        <div>
          {item.icon}
          <SidebarLabel>{item.title}</SidebarLabel>
        </div>
      </SidebarLink>
    );
  }
  return (
    <>
      <SidebarLink onClick={() => checkScreen(!!item.subNav)} href={item.path || ''}>
        <div>
          {item.icon}
          <SidebarLabel>{item.title}</SidebarLabel>
        </div>
        <div>{item.subNav && subNav ? item.iconOpened : item.subNav ? item.iconClosed : null}</div>
      </SidebarLink>

      {subNav &&
        item.subNav?.map((subItem, index) => (
          <DropdownLink href={subItem.path || ''} key={index}>
            {subItem.title}
          </DropdownLink>
        ))}
    </>
  );
};

export default SubMenu;
