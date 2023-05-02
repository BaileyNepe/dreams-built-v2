type SubNav = {
  title: string;
  path: string;
  roles: string[];
};

export interface MenuItem {
  title: string;
  path?: string;
  icon: JSX.Element;
  roles: string[];
  subNav?: SubNav[];
  iconClosed?: JSX.Element;
  iconOpened?: JSX.Element;
}
