import { ROUTE_PATHS } from "@/core/router/config";
import { IconDashboard, IconUsersGroup, type Icon, type IconProps } from "@tabler/icons-react";

export interface MyMenu {
  title: string;
  items: MyMenuItem[];
}

export interface MyMenuItem {
  icon: React.ForwardRefExoticComponent<IconProps & React.RefAttributes<Icon>>;
  label: string;
  href: string;
}

export const MENUS: MyMenu[] = [
  {
    title: "Flight Booking",
    items: [
      {
        icon: IconDashboard,
        label: "Dashboard",
        href: ROUTE_PATHS.FLIGHT_BOOKING.DASHBOARD,
      },
    ],
  },
  {
    title: "Accounting",
    items: [
      {
        icon: IconUsersGroup,
        label: "Users",
        href: ROUTE_PATHS.ACCOUNTING.USERS,
      },
    ],
  },
] as const;
