import { IconPlane, IconUsersGroup, type Icon, type IconProps } from "@tabler/icons-react";
import type { LinkProps } from "@tanstack/react-router";

type AnyRoutePath = LinkProps["to"];

export interface MyMenu {
  title: string;
  items: MyMenuItem[];
  index: AnyRoutePath;
}

export interface MyMenuItem {
  icon: React.ForwardRefExoticComponent<IconProps & React.RefAttributes<Icon>>;
  label: string;
  href: AnyRoutePath;
}

export const MENUS: MyMenu[] = [
  {
    title: "Flight Booking",
    index: "/flight-booking/search-flight",
    items: [
      {
        icon: IconPlane,
        label: "Search Flights",
        href: "/flight-booking/search-flight",
      },
    ],
  },
  {
    title: "Accounting",
    index: "/accounting/users",
    items: [
      {
        icon: IconUsersGroup,
        label: "Users",
        href: "/accounting/users",
      },
    ],
  },
] as const;
