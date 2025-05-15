import {Button, Menu} from "@mantine/core";
import {ArmyListData, armyToString, armyToTTS} from "../../../utils/songTypes.ts";
import {useContext} from "react";
import ArmyContext from "../ArmyContext.ts";
import {useClipboard} from "@mantine/hooks";

interface ExportArmyButtonProps {
    army?: ArmyListData
}

function ExportArmyButton({army}: ExportArmyButtonProps) {
    const {armyData} = useContext(ArmyContext);
    const clipboard = useClipboard();
    const armyToExport = army || armyData;

    return <Menu>
        <Menu.Target>
            <Button color="orange">Export</Button>
        </Menu.Target>

        <Menu.Dropdown>
            <Menu.Item
                onClick={() => clipboard.copy(armyToTTS(armyToExport))}
            >
                TTS / NEXUS
            </Menu.Item>
            <Menu.Item
                onClick={() => clipboard.copy(armyToString(armyToExport))}
            >
                Copy Army Text
            </Menu.Item>
        </Menu.Dropdown>
    </Menu>
}

export default ExportArmyButton;
