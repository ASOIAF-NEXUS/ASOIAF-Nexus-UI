import {useState} from "react";
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
import {useDisclosure} from "@mantine/hooks";
import Home from "./pages/Home.tsx";
import AboutUs from "./pages/AboutUs.tsx";
import SignIn from "./pages/SignIn.tsx";
import SignUp from "./pages/SignUp.tsx";
import {NavigationState} from "./features/nav/navTypes.ts";
import {useAuth} from "./features/auth/AuthContext.ts";
import ListBuilder from "./pages/ListBuilder.tsx";
import Tools from "./pages/Tools.tsx";


function App() {
    const [navOpened, {toggle: navToggle}] = useDisclosure(true);
    const [navigationState, setNavigationState] = useState<NavigationState>("home");
    const {isUserLoggedIn, doSignOut} = useAuth();

    return (
        <AppShell
            header={{height: "4em"}}
            navbar={{
                width: "10em",
                breakpoint: "sm",
                collapsed: {mobile: !navOpened, desktop: !navOpened},
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
                            {!isUserLoggedIn && <Button onClick={() => setNavigationState("sign-up")}>Sign Up</Button>}
                            {!isUserLoggedIn && <Button onClick={() => setNavigationState("sign-in")}>Sign In</Button>}
                            {isUserLoggedIn && (
                                <Menu trigger="click-hover" openDelay={100} closeDelay={400}>
                                    <Menu.Target>
                                        <UnstyledButton>
                                            <Avatar name="User Name"/>
                                        </UnstyledButton>
                                    </Menu.Target>
                                    <Menu.Dropdown>
                                        <Menu.Item onClick={doSignOut}>
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
                <Divider my="md"/>
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
                <NavLink active={navigationState === "tools"} label="Tools" component="button"
                         onClick={() => setNavigationState("tools")}/>
                <Divider my="md"/>
                <NavLink
                    active={navigationState === "about-us"}
                    label="About Us"
                    component="button"
                    onClick={() => setNavigationState("about-us")}
                />
                {isUserLoggedIn && (
                    <>
                        <Divider my="md"/>
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
                {navigationState === "sign-up" && <SignUp setNavigationState={setNavigationState}/>}
                {navigationState === "sign-in" && <SignIn setNavigationState={setNavigationState}/>}
                {navigationState === "home" && <Home/>}
                {navigationState === "list-builder" && <ListBuilder/>}
                {navigationState === "about-us" && <AboutUs/>}
                {navigationState === "tools" && <Tools/>}
            </AppShell.Main>
            <AppShell.Footer>Footer</AppShell.Footer>
        </AppShell>
    );
}

export default App;
