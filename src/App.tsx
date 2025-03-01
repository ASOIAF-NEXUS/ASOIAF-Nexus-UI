import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import {
  AppShell,
  Avatar,
  Burger,
  Button,
  Flex,
  Group,
  Menu,
  Title,
  UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { NavLink } from "@mantine/core";
import HomePage from "./HomePage";
// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.tsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

// export default App

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
