import { useState } from "react";
import "./App.css";
import {
  AppShell,
  Avatar,
  Burger,
  Button,
  Grid,
  Group,
  Menu,
  Title,
  UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { NavLink } from "@mantine/core";
import HomePage from "./HomePage";

type NavigationState =
  | "home"
  | "list-builder"
  | "tournaments"
  | "profile"
  | "sign-up"
  | "sign-in";

function App() {
  const [navOpened, { toggle: navToggle }] = useDisclosure(true);
  const [user, setUser] = useState<boolean>(false);
  const [navigationState, setNavigationState] =
    useState<NavigationState>("home");
  return (
    <AppShell
      header={{ height: "4em" }}
      navbar={{
        width: "10em",
        breakpoint: "sm",
        collapsed: { mobile: !navOpened, desktop: !navOpened },
      }}
      padding="sm"
    >
      <AppShell.Header px="lg" py="md">
        <Grid>
          <Grid.Col span={1}>
            <Burger opened={navOpened} onClick={navToggle}></Burger>
          </Grid.Col>
          <Grid.Col offset={4} span={2}>
            <Title>NEXUS</Title>
          </Grid.Col>
          <Grid.Col offset={0} span={5}>
            <Group justify="end">
              {!user && <Button onClick={() => setUser(true)}>Sign Up</Button>}
              {!user && <Button onClick={() => setUser(true)}>Sign In</Button>}
              {user && (
                <Menu trigger="click-hover" openDelay={100} closeDelay={400}>
                  <Menu.Target>
                    <UnstyledButton>
                      <Avatar name="User Name" />
                    </UnstyledButton>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item onClick={() => setUser(false)}>
                      Sign Out
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              )}
            </Group>
          </Grid.Col>
        </Grid>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        <NavLink
          active={navigationState === "home"}
          label="Home"
          component="button"
          onClick={() => setNavigationState("home")}
        />
        <NavLink
          active={navigationState === "list-builder"}
          label="List Builder"
          component="button"
          onClick={() => setNavigationState("list-builder")}
        />
        <NavLink
          active={navigationState === "tournaments"}
          label="Tournaments"
          component="button"
          onClick={() => setNavigationState("tournaments")}
        />
        {user && (
          <NavLink
            active={navigationState === "profile"}
            label="Profile"
            component="button"
            onClick={() => setNavigationState("profile")}
          />
        )}
      </AppShell.Navbar>
      <AppShell.Main>
        {navigationState === "home" && <HomePage />}
        {navigationState === "list-builder" && (
          <Title>List Builder is Under Construction</Title>
        )}
      </AppShell.Main>
      <AppShell.Footer>Footer</AppShell.Footer>
    </AppShell>
  );
}

export default App;
