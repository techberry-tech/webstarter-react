import { IconDashboard, IconUsersGroup, type Icon, type IconProps } from "@tabler/icons-react";
import type { LinkProps } from "@tanstack/react-router";

type AnyRoutePath = LinkProps["to"];

export interface MyMenu {
  title: string;
  items: MyMenuItem[];
}

export interface MyMenuItem {
  icon: React.ForwardRefExoticComponent<IconProps & React.RefAttributes<Icon>>;
  label: string;
  href: AnyRoutePath;
}

export const MENUS: MyMenu[] = [
  {
    title: "Flight Booking",
    items: [
      {
        icon: IconDashboard,
        label: "Dashboard",
        href: "/flight-booking/dashboard",
      },
    ],
  },
  {
    title: "Accounting",
    items: [
      {
        icon: IconUsersGroup,
        label: "Users",
        href: "/accounting/users",
      },
    ],
  },
] as const;
