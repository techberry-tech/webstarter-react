import useAuthLogout from "@/api/auth/use-auth-logout";
import { MENUS, type MyMenu } from "@/config/menu";
import { cn } from "@/lib/utils";
import { Box, Button, Divider, Menu, Popover, Text } from "@mantine/core";
import { Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMainLayoutStore } from "./main-layout-store";

export default function MainLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { isPending, mutate: logout } = useAuthLogout();

  const [signOutOpened, setSignOutOpened] = useState<boolean>(false);

  const selectedMenu = useMainLayoutStore((state) => state.selectedMenu);
  const setSelectedMenu = useMainLayoutStore((state) => state.setSelectedMenu);

  const menuItems = selectedMenu.items.map(({ icon: Icon, label, href }) => {
    const isActive = pathname === href;
    return (
      <div
        onClick={() => navigate({ to: href })}
        key={label}
        className={cn("flex grow items-center gap-2 rounded-md px-3 py-1.5 cursor-pointer text-sm hover:bg-gray-100", {
          "bg-gray-100": isActive,
        })}
      >
        <Box component="span" mr={9} fz={16}>
          <Icon size={18} stroke={isActive ? 2 : 1.5} />
        </Box>
        <Text size="sm" fw={isActive ? 600 : 400}>
          {label}
        </Text>
      </div>
    );
  });

  const handleSelectMenu = (menu: MyMenu) => {
    if (selectedMenu !== menu) {
      setSelectedMenu(menu);
    }
  };

  const handleConfirmLogout = () => {
    setSignOutOpened(false);
    logout();
  };

  useEffect(() => {
    if (selectedMenu && pathname !== selectedMenu.items[0].href) {
      navigate({ to: selectedMenu.items[0].href });
    }
  }, [selectedMenu, navigate, pathname]);

  return (
    <main className="grid grid-cols-[220px_1fr] h-screen">
      <nav className="flex flex-col bg-[var(--mantine-color-body)] h-full border-r-[var(--mantine-color-gray-3)] border-r">
        <div className="flex flex-col p-4 gap-2">
          <Text size="xs" fw={500} c="dimmed">
            Select Application
          </Text>
          <Menu shadow="md" width={200}>
            <Menu.Target>
              <Button fullWidth variant="default">
                {selectedMenu.title}
              </Button>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>Application</Menu.Label>
              {MENUS.map((menu) => (
                <Menu.Item key={menu.title} onClick={() => handleSelectMenu(menu)}>
                  {menu.title}
                </Menu.Item>
              ))}
            </Menu.Dropdown>
          </Menu>
        </div>
        <Divider />
        <div className="flex flex-col p-4 gap-2 h-[calc(100vh-165px)] overflow-y-auto">
          <Text size="xs" fw={500} c="dimmed">
            Menu
          </Text>
          <div>{menuItems}</div>
        </div>
        <Divider />
        <div className="flex flex-col p-4 gap-2">
          <Popover position="top" withArrow shadow="md" opened={signOutOpened} onChange={setSignOutOpened}>
            <Popover.Target>
              <Button variant="light" color="red" onClick={() => setSignOutOpened((prev) => !prev)} loading={isPending}>
                Sign Out
              </Button>
            </Popover.Target>
            <Popover.Dropdown>
              <Text size="sm">Are you sure you want to sign out?</Text>
              <div className="flex justify-end mt-2 gap-1.5">
                <Button size="compact-xs" variant="default" onClick={() => setSignOutOpened(false)}>
                  No
                </Button>
                <Button size="compact-xs" color="red" onClick={handleConfirmLogout}>
                  Yes
                </Button>
              </div>
            </Popover.Dropdown>
          </Popover>
        </div>
      </nav>
      <div className="overflow-auto">
        <Outlet />
      </div>
    </main>
  );
}
