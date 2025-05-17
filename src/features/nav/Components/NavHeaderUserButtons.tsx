import {useAuth} from "../../auth/AuthContext.ts";
import {useNavigate} from "react-router";
import {Avatar, Button, Group, Menu, UnstyledButton} from "@mantine/core";

function NavHeaderUserButtons() {
    const {isUserLoggedIn, doSignOut} = useAuth();
    const navigate = useNavigate();

    return <Group gap={2} visibleFrom="xs" wrap="nowrap">
        {!isUserLoggedIn
            && <>
                <Button size="xs" variant="subtle" onClick={() => navigate("login")}>Sign In</Button>
                <Button size="xs" variant="light" onClick={() => navigate("signup")}>Sign Up</Button>
            </>
        }
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
}

export default NavHeaderUserButtons;
