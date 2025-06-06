import { useEffect, useState } from "react";
import "./App.css";
import {
  AppShell,
  Avatar,
  Burger,
  Button,
  Divider,
  Grid,
  Group,
  Menu,
  NavLink,
  Title,
  UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import HomePage from "./HomePage";
import AboutUs from "./AboutUs";
import { AuthForm, signIn, signUp } from "./AuthForms";
import { AuthContext } from "./AuthContext";
import { defaultErrorNotification, invalidLoginNotification, successfulSignupNotification } from "./Notifications";
import { AxiosError } from "axios";

type NavigationState =
  | "home"
  | "list-builder"
  | "tournaments"
  | "profile"
  | "sign-up"
  | "sign-in"
  | "tools"
  | "about-us";

function App() {
  const [navOpened, { toggle: navToggle }] = useDisclosure(true);
  const [authToken, setAuthToken] = useState<string>("");
  const [user, setUser] = useState<boolean>(false);
  const [navigationState, setNavigationState] =
    useState<NavigationState>("home");
  useEffect(() => {
    if (authToken === "") {
      setUser(false);
    } else {
      setUser(true);
    }
  }, [authToken, setUser]);
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
            <Group justify="start">
              <Burger opened={navOpened} onClick={navToggle}></Burger>
            </Group>
          </Grid.Col>
          <Grid.Col offset={4} span={2}>
            <Title>NEXUS</Title>
          </Grid.Col>
          <Grid.Col offset={0} span={5}>
            <Group justify="end">
              {!user && <Button onClick={() => setNavigationState("sign-up")}>Sign Up</Button>}
              {!user && <Button onClick={() => setNavigationState("sign-in")}>Sign In</Button>}
              {user && (
                <Menu trigger="click-hover" openDelay={100} closeDelay={400}>
                  <Menu.Target>
                    <UnstyledButton>
                      <Avatar name="User Name" />
                    </UnstyledButton>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item onClick={() => setAuthToken("")}>
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
        <Divider my="md" />
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
        <NavLink active={navigationState === "tools"} label="Tools" component="button" onClick={() => setNavigationState("tools")} />
        <Divider my="md" />
        <NavLink
          active={navigationState === "about-us"}
          label="About Us"
          component="button"
          onClick={() => setNavigationState("about-us")}
        />
        {user && (
          <>
            <Divider my="md" />
            <NavLink
              active={navigationState === "profile"}
              label="Profile"
              component="button"
              onClick={() => setNavigationState("profile")}
            />
          </>
        )}
      </AppShell.Navbar>
      <AppShell.Main>
        <AuthContext.Provider value={authToken}>
          {navigationState === "sign-up" &&
            <AuthForm type={navigationState}
              action={async (login) => {
                try {
                  await signUp(login);
                  notifications.show(successfulSignupNotification);
                  setAuthToken(await signIn(login));
                  setNavigationState("home");
                } catch (ex) {
                  notifications.show(defaultErrorNotification);
                }
              }} />}
          {navigationState === "sign-in" &&
            <AuthForm type={navigationState}
              action={async (login) => {
                try {
                  setAuthToken(await signIn(login));
                  setNavigationState("home");
                } catch (ex: unknown) {
                  if(ex instanceof AxiosError && ex.status === 400) {
                    notifications.show(invalidLoginNotification);
                  } else {
                    notifications.show(defaultErrorNotification);
                  }
                }
              }} />}
          {navigationState === "home" && <HomePage />}
          {navigationState === "list-builder" && (
            <Title>List Builder is Under Construction</Title>
          )}
          {navigationState === "about-us" && <AboutUs />}
          {navigationState === "tools" && <Title>Under construction</Title>}
        </AuthContext.Provider>
      </AppShell.Main>
      <AppShell.Footer>Footer</AppShell.Footer>
    </AppShell>
  );
}

export default App;
