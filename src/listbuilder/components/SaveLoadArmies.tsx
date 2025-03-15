import {Button, Flex, Image, Modal, Table, Text, TextInput} from "@mantine/core";
import {ArmyStorageLocalstorage, SavableArmyData} from "../armyStorage.ts";
import {useContext, useState} from "react";
import {useDisclosure, useForceUpdate} from "@mantine/hooks";
import ArmyContext from "../ArmyContext.ts";
import {Dictionary} from "../../utils.ts";
import * as React from "react";
import {armyIdsToArmyData, SongData} from "../../songTypes.ts";
import SongHoverWrapper from "../../components/SongHoverWrapper.tsx";
import ExportArmyButton from "./ExportArmyButton.tsx";


// This doesn't feel great because the storage keeps track of state which is decoupled from ui state
const armyStorage = new ArmyStorageLocalstorage();
armyStorage.load();

interface LoadModalProps {
    savedArmies: Dictionary<SavableArmyData>
    setSavedArmies: React.Dispatch<React.SetStateAction<Dictionary<SavableArmyData>>>
    data: SongData[]
}

function LoadModal({savedArmies, setSavedArmies, data}: LoadModalProps) {
    const [opened, {open, close}] = useDisclosure(false);
    const {loadArmy} = useContext(ArmyContext);
    const forceUpdate = useForceUpdate();

    const getTableRow = (army: SavableArmyData) => {
        const armyData = armyIdsToArmyData(army.army, data);
        const factionImageSrc = `https://raw.githubusercontent.com/Pf2eTools/asoiaf-tmg-data/refs/heads/master/assets/warcouncil/${armyData.faction}/crest-shadow.png`;
        const getCmdrImgSrc = (commander: SongData) => `https://raw.githubusercontent.com/Pf2eTools/asoiaf-tmg-data/refs/heads/master/portraits/square/${commander.id}.jpg`;

        return <Table.Tr key={army.id}>
            <Table.Td></Table.Td>
            <Table.Td><Image h={50} w="auto" src={factionImageSrc}/></Table.Td>
            <Table.Td>{armyData.commander
                ? <Flex gap={10} align="center">
                    <SongHoverWrapper entity={armyData.commander}>
                        <Image h={50} w="auto" src={getCmdrImgSrc(armyData.commander)}/>
                    </SongHoverWrapper>
                    <Text>{armyData.commander._fullName}</Text>
                </Flex>
                : "No Commander"}
            </Table.Td>
            <Table.Td>{army.name}</Table.Td>
            <Table.Td>{army.army.points}</Table.Td>
            <Table.Td>{army.army.format}</Table.Td>
            <Table.Td><Button color="blue" variant="light" onClick={() => loadArmy(army.army)}>Load</Button></Table.Td>
            <Table.Td><ExportArmyButton army={armyData} /></Table.Td>
            <Table.Td><Button color="red" onClick={() => {
                armyStorage.delete(army.id);
                setSavedArmies(armyStorage.armies);
                forceUpdate();
            }}>Delete</Button></Table.Td>
        </Table.Tr>
    }
    const hasSavedArmies = Object.values(savedArmies).length !== 0;

    return <>
        <Modal
            opened={opened}
            onClose={close}
            title={<Text fw={600}>Load Armies</Text>}
            centered
            size={hasSavedArmies ? "80%" : "md"}
        >
            {!hasSavedArmies
                ? <Text>You don't have any saved armies.</Text>
                : <Table>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th></Table.Th>
                            <Table.Th>Faction</Table.Th>
                            <Table.Th>Commander</Table.Th>
                            <Table.Th>Name</Table.Th>
                            <Table.Th>Size</Table.Th>
                            <Table.Th>Format</Table.Th>
                            <Table.Th>Load</Table.Th>
                            <Table.Th>Export</Table.Th>
                            <Table.Th>Delete</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {Object.values(savedArmies).map(army => getTableRow(army))}
                    </Table.Tbody>
                </Table>
            }
        </Modal>
        <Button color="blue" onClick={open}>Load</Button>
    </>
}

interface SaveModalProps {
    setSavedArmies: React.Dispatch<React.SetStateAction<Dictionary<SavableArmyData>>>
}


function SaveModal({setSavedArmies}: SaveModalProps) {
    const [opened, {open, close}] = useDisclosure(false);
    const [armyName, setArmyName] = useState("");
    const {armyIds, armyData} = useContext(ArmyContext);

    const doSave = () => {
        const savable = armyStorage.getSavableArmyData(armyIds, armyName);
        armyStorage.save(savable);
        setSavedArmies(armyStorage.armies);
        setArmyName("");
        close();
    }

    return <>
        <Modal
            opened={opened}
            onClose={close}
            title="Save Army"
        >
            <Flex direction="column" gap={20}>
                <TextInput
                    data-autofocus
                    value={armyName}
                    onChange={evt => setArmyName(evt.currentTarget.value)}
                    label="Army Name"
                    placeholder={`${armyData.commander?.name || armyData.faction} (${armyData.format})`}
                    mt="md"
                    error={armyName === "" ? "Required" : null}
                />
                <Flex gap={5} align="center" justify="center">
                    <Button color="red" onClick={close}>Cancel</Button>
                    <Button color="green" onClick={doSave} disabled={armyName === ""}>Save</Button>
                </Flex>
            </Flex>
        </Modal>
        <Button color="green" onClick={open}>Save</Button>
    </>
}

function SaveLoadControls({data}: { data: SongData[] }) {
    const [savedArmies, setSavedArmies] = useState(armyStorage.armies);

    return <>
        <LoadModal
            savedArmies={savedArmies}
            setSavedArmies={setSavedArmies}
            data={data}
        />
        <SaveModal
            setSavedArmies={setSavedArmies}
        />
    </>
}

export default SaveLoadControls;
