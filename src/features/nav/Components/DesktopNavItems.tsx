import {Button, Group, Menu, Text} from "@mantine/core";
import {matchPath, useLocation, useNavigate} from "react-router";
import * as React from "react";
import {navMenuItems, T_NavItem, T_NavMenuItem} from "../navItems.ts";


interface TargetButtonProps extends React.ComponentPropsWithRef<"button">{
    item: T_NavItem
    isActive: boolean
}

function TargetButton(props: TargetButtonProps) {
    const {item, isActive, onClick, ...others} = props;
    const navigate = useNavigate();
    return <Button
        size="compact-lg"
        variant={isActive ? "light" : "subtle"}
        radius={0}
        p={4}
        h="100%"
        style={{border: 0, flex: 1, outline: 0, maxWidth: "200px"}}
        onClick={(event) => {
            if (onClick !== undefined) onClick(event);
            navigate(item.route);
        }}
        {...others}
    >
        <Text fw={700} hiddenFrom="md" size="sm">{item.name}</Text>
        <Text fw={700} visibleFrom="md" size="lg">{item.name}</Text>
    </Button>;
}

function NavMenu({item}: { item: T_NavMenuItem }) {
    const location = useLocation();
    const navigate = useNavigate();

    const childRoutes = (item.children || []).filter(it  => !it.divider).map(it => (it as T_NavItem).route);
    const isActive = [item.route, ...childRoutes].some(r => matchPath(r, location.pathname) !== null);

    if (!item.children) return <TargetButton isActive={isActive} item={item}></TargetButton>

    return <Menu trigger="hover" closeDelay={100} position="bottom-start" offset={0} withinPortal={false} width="target">
        <Menu.Target>
            <TargetButton isActive={isActive} item={item}></TargetButton>
        </Menu.Target>

        <Menu.Dropdown miw="180px">
            {item.children.map((it, ix) => {
                if (it.divider) return <Menu.Divider key={ix} />
                return <Menu.Item onClick={() => navigate(it.route)} key={ix}>
                    <Text hiddenFrom="md" size="sm">{it.name}</Text>
                    <Text visibleFrom="md" size="lg">{it.name}</Text>
                </Menu.Item>
            })}
        </Menu.Dropdown>
    </Menu>
}


function DesktopNavItems() {
    return <Group h="100%" w="60%" visibleFrom="sm" ml="auto" gap={0}>
        {navMenuItems.map(it => <NavMenu key={it.name} item={it}></NavMenu>)}
    </Group>

}

export default DesktopNavItems;
