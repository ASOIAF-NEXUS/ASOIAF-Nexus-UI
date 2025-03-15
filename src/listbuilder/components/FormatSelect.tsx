import {Button, Flex, Popover, Text} from "@mantine/core";
import {useContext} from "react";
import ArmyContext from "../ArmyContext.ts";
import {FORMATS, T_armyFormat} from "../../songTypes.ts";

function FormatSelect() {
    const {armyData, setArmyFormat} = useContext(ArmyContext);

    const renderBtn = (format: T_armyFormat, formatName: string)=> {
        return <Button h={50} w={300} variant="default" style={{padding: 2}}
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
            <Flex direction="column" gap={5}>
                {Object.entries(FORMATS).map(([n, f]) => renderBtn(f, n))}
            </Flex>
        </Popover.Dropdown>
    </Popover>
}

export default FormatSelect;
