import "./App.css";
import {
    AppShell,
    Burger,
    Button,
    Group,
    Title,
    useMantineColorScheme,
} from "@mantine/core";
import {useDisclosure} from "@mantine/hooks";
import {useNavigate, Routes, Route} from "react-router";
import MobileNavItems from "./features/nav/Components/MobileNavItems.tsx";
import DesktopNavItems from "./features/nav/Components/DesktopNavItems.tsx";
import NavHeaderUserButtons from "./features/nav/Components/NavHeaderUserButtons.tsx";
import Home from "./pages/Home.tsx";
import AboutUs from "./pages/AboutUs.tsx";
import SignIn from "./pages/SignIn.tsx";
import SignUp from "./pages/SignUp.tsx";
import ListBuilder from "./pages/ListBuilder.tsx";
import NotFound from "./pages/NotFound.tsx";


function App() {
    const [navOpened, {toggle: navToggle}] = useDisclosure(true);
    const {toggleColorScheme, colorScheme} = useMantineColorScheme();
    const navigate = useNavigate();

    return (
        <AppShell
            header={{height: "4em"}}
            navbar={{
                width: "10em",
                breakpoint: "sm",
                collapsed: {mobile: !navOpened, desktop: true},
            }}
            padding="md"
        >
            <AppShell.Header px="md" py={0}>
                <Group h="100%" px="md" justify="space-between" wrap="nowrap">
                    <Group wrap="nowrap">
                        <Burger hiddenFrom="sm" size="sm" opened={navOpened} onClick={navToggle}></Burger>
                        <Title style={{cursor: "pointer"}} onClick={() => navigate("/")}>NEXUS</Title>
                    </Group>
                    <DesktopNavItems/>
                    <Group wrap="nowrap" gap={8}>
                        <NavHeaderUserButtons/>
                        <Button
                            color={colorScheme === "light" ? "yellow.6" : "gray.7"}
                            size="compact-md"
                            onClick={toggleColorScheme}
                        >
                            🌛🌞
                        </Button>
                    </Group>
                </Group>
            </AppShell.Header>
            <AppShell.Navbar p={0}>
                <MobileNavItems navOpened={navOpened} navToggle={navToggle}/>
            </AppShell.Navbar>
            <AppShell.Main>
                <Routes>
                    <Route path={"signup"} element={<SignUp/>}></Route>
                    <Route path={"login"} element={<SignIn/>}></Route>
                    <Route path={"home"} element={<Home/>}></Route>
                    <Route path={"builder"} element={<ListBuilder/>}></Route>
                    <Route path={"about"} element={<AboutUs/>}></Route>
                    <Route path={"/"} element={<Home/>}></Route>
                    <Route path={"*"} element={<NotFound/>}></Route>
                </Routes>
            </AppShell.Main>
        </AppShell>
    );
}

export default App;
