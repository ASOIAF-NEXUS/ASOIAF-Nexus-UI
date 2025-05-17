export type T_NavItem = { name: string, route: string, divider?: boolean }
export type T_NavDivider = { divider: true }
export type T_NavMenuItem = T_NavItem & {
    children?: (T_NavItem | T_NavDivider)[]
}

export const navMenuItems: T_NavMenuItem[] = [
    {
        name: "Play",
        route: "play"
    },
    {
        name: "Community",
        route: "players",
        children: [
            {
                name: "Players",
                route: "players"
            },
            {
                name: "Clubs",
                route: "clubs"
            },
            {
                divider: true
            },
            {
                name: "Blog",
                route: "blog"
            }
        ]
    },
    {
        name: "Events",
        route: "events",
        children: [
            {
                name: "Events",
                route: "events"
            },
            {
                name: "Champions",
                route: "champions"
            }
        ]
    },
    {
        name: "Armies",
        route: "builder",
        children: [
            {
                name: "Army Builder",
                route: "builder"
            },
            {
                name: "Your Armies",
                route: "saved"
            }
        ]
    }
];
