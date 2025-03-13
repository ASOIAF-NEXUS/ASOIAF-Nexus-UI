import {Button, NumberInput, Popover} from "@mantine/core";
import {useContext} from "react";
import ArmyContext from "../ArmyContext.ts";


function ArmySizeSelect() {
    const {armyData, setArmyPoints} = useContext(ArmyContext);

    return <Popover width={275} position="bottom" withArrow shadow="md">
        <Popover.Target>
            <Button size="xl" h={50} w={50} variant="default" style={{padding: 5, margin: 5}}>
                {armyData.points}
            </Button>
        </Popover.Target>
        <Popover.Dropdown>
            <Button size="xl" style={{padding: 5, margin: 5}} h={70} w={70} variant="default" onClick={() => setArmyPoints(30)}>30</Button>
            <Button size="xl" style={{padding: 5, margin: 5}} h={70} w={70} variant="default" onClick={() => setArmyPoints(40)}>40</Button>
            <Button size="xl" style={{padding: 5, margin: 5}} h={70} w={70} variant="default" onClick={() => setArmyPoints(50)}>50</Button>
            <NumberInput
                description="Custom"
                value={armyData.points}
                style={{margin: 5}}
                onChange={(val) => setArmyPoints(Number(val))}
            />
        </Popover.Dropdown>
    </Popover>
}

export default ArmySizeSelect;
