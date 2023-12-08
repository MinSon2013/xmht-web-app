export interface Navbar {
    id?: number;
    level?: number;
    routeLink: string;
    icon?: string;
    label: string,
    expanded?: boolean;
    items?: Navbar[];
  }