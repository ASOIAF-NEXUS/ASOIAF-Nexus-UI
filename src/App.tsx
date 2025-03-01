import { useState } from "react";
import "./App.css";
import {
  AppShell,
  Avatar,
  Burger,
  Flex,
  Group,
  Menu,
  Title,
  UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { NavLink } from "@mantine/core";
import HomePage from "./HomePage";

function App() {
  const [navOpened, { toggle: navToggle }] = useDisclosure(true);
  const [navigationState, setNavigationState] = useState<
    "home" | "list-builder"
  >("home");
  return (
    <AppShell
      header={{ height: "4em" }}
      navbar={{
        width: 300,
        breakpoint: "sm",
        collapsed: { mobile: !navOpened, desktop: !navOpened },
      }}
      padding="sm"
    >
      <AppShell.Header px="lg" py="md">
        <Group justify={"space-between"} align={"center"} gap={"md"}>
          <Flex justify={"flex-start"}>
            <Burger opened={navOpened} onClick={navToggle}></Burger>
          </Flex>
          <Title>ASOIAF NEXUS</Title>
          <Flex>
            <Menu trigger="click-hover" openDelay={100} closeDelay={400}>
              <Menu.Target>
                <UnstyledButton>
                  <Avatar name="User Name" />
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item onClick={() => console.log("Yo")}>Sign Up</Menu.Item>
                <Menu.Item onClick={() => console.log("Profile")}>Profile </Menu.Item>
                  <Menu.Item
                    onClick={() => console.log("Sign out")}
                  >Sign Out</Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Flex>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        Navbar
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
      </AppShell.Navbar>
      <AppShell.Main>
        {navigationState === "home" && <HomePage />}
        {navigationState === "list-builder" && <Title>List Builder is Under Construction</Title>}
      </AppShell.Main>
      <AppShell.Footer>Footer</AppShell.Footer>
    </AppShell>
  );
}

export default App;
