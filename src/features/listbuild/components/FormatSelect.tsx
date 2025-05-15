import {Button, ButtonGroup, Flex, Image, List, Popover, Stack, Text, Tooltip} from "@mantine/core";
import {useContext} from "react";
import ArmyContext from "../ArmyContext.ts";
import {FORMATS, T_armyFormat} from "../../../utils/songTypes.ts";


function FormatButton({format}: { format: T_armyFormat }) {
    const {setArmyFormat} = useContext(ArmyContext);

    return <Button h={50} w={300} variant="default" style={{padding: 2}} onClick={() => setArmyFormat(format.id)}>
        <Flex direction="column">
            <Text fw={600} lineClamp={1}>
                {format.name}
            </Text>
            <Text size="xs" c="dark.4" fs="italic" lineClamp={1} truncate="end">
                {format.description}
            </Text>
        </Flex>
    </Button>
}

function FormatSelect() {
    const {armyIds, armyData, allowIllegal, setAllowIllegal, armyValidator} = useContext(ArmyContext);
    const format = FORMATS[armyData.format];
    const legal = armyValidator.getArmyReasonsIllegal();

    const displayWarnings = legal.warnings.length ? legal.warnings : ["No warnings"];
    const displayErrors = legal.errors.length ? legal.errors : ["No Errors"];

    return <ButtonGroup>
        <Popover width={342} position="bottom" withArrow shadow="md">
            <Popover.Target>
                <Button h={50} w={100} variant="default" size="compact-md">{format.name}</Button>
            </Popover.Target>
            <Popover.Dropdown>
                <Flex direction="column" gap={5}>
                    {Object.values(FORMATS).map(format => <FormatButton format={format} key={format.id}></FormatButton>)}
                </Flex>
            </Popover.Dropdown>
        </Popover>

        <Tooltip label={`${allowIllegal ? "Allow" : "Disallow"} building illegal lists`}>
            <Button h={50} variant="default" onClick={() => setAllowIllegal(!allowIllegal)}>
                <Image  src={allowIllegal ? "icon/lock-open.png" : "icon/lock.png"}></Image>
            </Button>
        </Tooltip>

        <Popover width={300} position="bottom" withArrow shadow="md">
            <Popover.Target>
                <Button h={50} variant={armyIds.ids.length ? "filled" : "default"} color={legal.errors.length ? "red.4" : legal.warnings.length ? "yellow.2" : "green.2"}>
                    <Image h={32} src="icon/legal.png"></Image>
                </Button>
            </Popover.Target>
            <Popover.Dropdown>
                <Stack gap={3} className="mx-1">
                    <Text fw={700}>Warnings</Text>
                    <List>
                        {displayWarnings.map((warn, ix) => <List.Item key={ix}>{warn}</List.Item>)}
                    </List>
                    <Text fw={700}>Errors</Text>
                    <List>
                        {displayErrors.map((err, ix) => <List.Item key={ix}>{err}</List.Item>)}
                    </List>
                </Stack>
            </Popover.Dropdown>
        </Popover>
    </ButtonGroup>
}

export default FormatSelect;
