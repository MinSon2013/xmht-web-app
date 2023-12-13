
export class MenuRo {
  id: number;
  routeLink: string;
  label: string;
  icon: string;
  items: MenuRo[] = [];
  expanded?: boolean;
  position: number;
}