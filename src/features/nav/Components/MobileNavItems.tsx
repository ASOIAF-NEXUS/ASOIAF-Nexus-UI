import {Button, Divider, Flex, NavLink, Stack, Text} from "@mantine/core";
import {useAuth} from "../../auth/AuthContext.ts";
import {useNavigate} from "react-router";
import {navMenuItems, T_NavItem} from "../navItems.ts";
import {ReactNode} from "react";

interface MobileNavProps {
    navToggle: () => void
    navOpened: boolean
}

function MobileNavItems({navToggle, navOpened}: MobileNavProps) {
    const {isUserLoggedIn} = useAuth();
    const navigate = useNavigate();

    const doNavigate = (path: string) => {
        navigate(path);
        if (navOpened) navToggle();
    }

    const NavButton = ({item}: { item: T_NavItem }) => {
        return <Button
            radius={0}
            variant="subtle"
            color="gray"
            h={50}
            onClick={() => doNavigate(item.route)}
        >
            <Text fw={700} size="lg">{item.name}</Text>
        </Button>
    }
    const navElements: ReactNode[] = [];
    navMenuItems.forEach((item, ix) => {
        if (ix !== 0) navElements.push(<Divider/>);
        if (item.children === undefined) navElements.push(<NavButton item={item} />);
        else item.children.forEach(it => {
            if (!it.divider) navElements.push(<NavButton item={it}/>);
        });
    })

    return <Stack justify="space-between" h="100%">
        <Stack gap={0}>
            {...navElements}
        </Stack>
        <Stack my="md">
            <Divider></Divider>
            {isUserLoggedIn
                ? <NavLink onClick={() => navigate("/player/me")}>Profile</NavLink>
                : <Flex direction="column" justify="center" align="center" gap={4}>
                    <Button w="40%" size="md" variant="subtle" onClick={() => doNavigate("login")}>Sign In</Button>
                    <Button w="40%" size="md" variant="light" onClick={() => doNavigate("signup")}>Sign Up</Button>
                </Flex>
            }
        </Stack>
    </Stack>
}

export default MobileNavItems;
