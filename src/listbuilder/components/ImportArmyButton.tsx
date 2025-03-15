import {useDisclosure} from "@mantine/hooks";
import {useContext, useState} from "react";
import ArmyContext from "../ArmyContext.ts";
import {Button, Flex, Modal, TextInput} from "@mantine/core";
import {defaultArmyFormat, defaultArmySize, FACTIONS} from "../../songTypes.ts";


function ImportArmyButton() {
    const [opened, {open, close}] = useDisclosure(false);
    const [armyString, setArmyString] = useState("");
    const {loadArmy} = useContext(ArmyContext);

    const [faction, idString, ...rest] = armyString.split(";");
    let error = "";
    if (armyString === "") error = "Required";
    // @ts-expect-error checking if faction is of type faction
    else if (!Object.values(FACTIONS).includes(faction) || idString === "" || rest.length) error = "Invalid import!"

    const doImport = () => {
        loadArmy({
            faction: faction as FACTIONS,
            ids: idString.split(","),
            points: defaultArmySize,
            format: defaultArmyFormat,
        });
        setArmyString("");
        close();
    }

    return <>
        <Modal
            opened={opened}
            onClose={close}
            title="Import Army"
        >
            <Flex direction="column" gap={20}>
                <TextInput
                    data-autofocus
                    value={armyString}
                    onChange={evt => setArmyString(evt.currentTarget.value)}
                    label="Import"
                    placeholder=""
                    mt="md"
                    error={error}
                />
                <Flex gap={5} align="center" justify="center">
                    <Button color="yellow" onClick={doImport} disabled={error !== ""}>Import</Button>
                </Flex>
            </Flex>
        </Modal>
        <Button color="yellow" onClick={open}>Import</Button>
    </>
}

export default ImportArmyButton;
