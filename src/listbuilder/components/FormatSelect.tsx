import {Button, Flex, Popover, Text} from "@mantine/core";
import {useContext} from "react";
import ArmyContext from "../ArmyContext.ts";
import {Dictionary} from "../../utils.ts";

type T_format = {
    name: string
    description: string
}

const FORMATS: Dictionary<T_format> = {
    standard: {name: "Standard", description: "The rules described in the official rulebook."},
    decisive: {name: "Decisive Encounters", description: "Armies may include a few attachments for free."},
    draft: {name: "Draft", description: "Build from a drafted pool, but with fewer restrictions."},
    milestone: {name: "Milestone", description: "Armies change over the course of campaigns."},
}

function FormatSelect() {
    const {armyData, setArmyFormat} = useContext(ArmyContext);

    const renderBtn = (format: T_format, formatName: string)=> {
        return <Button h={50} w={300} variant="default" style={{padding: 2, margin: 5}}
        onClick={() => setArmyFormat(formatName)} key={formatName}>
            <Flex direction="column">
                <Text
                    fw={600}
                    lineClamp={1}
                >
                    {format.name}
                </Text>
                <Text
                    size="xs"
                    c="dark.4"
                    fs="italic"
                    lineClamp={1}
                    truncate="end"
                >
                    {format.description}
                </Text>
            </Flex>
        </Button>
    }

    return <Popover width={342} position="bottom" withArrow shadow="md">
        <Popover.Target>
            {renderBtn(FORMATS[armyData.format], armyData.format)}
        </Popover.Target>
        <Popover.Dropdown>
            {Object.entries(FORMATS).map(([n, f]) => renderBtn(f, n))}
        </Popover.Dropdown>
    </Popover>
}

export default FormatSelect;
