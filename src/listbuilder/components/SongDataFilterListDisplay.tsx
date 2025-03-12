import {SongData} from "../../songTypes.ts";
import {useContext, useState} from "react";
import ArmyContext from "../ArmyContext.ts";
import {Button, Flex, Grid, Image, ScrollArea, Switch, Table} from "@mantine/core";
import SongHoverWrapper from "../../components/SongHoverWrapper.tsx";

interface ListDisplayProps {
    displayData: SongData[],
}

function FilterListTextDisplay({displayData}: ListDisplayProps) {
    const {addToArmy} = useContext(ArmyContext);

    const tableRows = displayData.sort((a, b) => {
        if (a._roleBuilder < b._roleBuilder) return -1;
        else if (a._roleBuilder > b._roleBuilder) return 1;
        return 0;
    }).map((entity) => (
        <SongHoverWrapper key={entity.id} entity={entity}><Table.Tr>
            <Table.Td>{entity._fullName}</Table.Td>
            <Table.Td>{entity.statistics.faction}</Table.Td>
            <Table.Td>{entity._roleBuilder}</Table.Td>
            <Table.Td>{entity.statistics.cost}</Table.Td>
            <Table.Td>
                <Button
                    size="xs"
                    variant="light"
                    onClick={() => addToArmy(entity)}
                >Add</Button>
            </Table.Td>
        </Table.Tr></SongHoverWrapper>
    ));

    return <ScrollArea scrollbars="y" offsetScrollbars>
        <Table striped>
            <Table.Thead>
                <Table.Tr>
                    <Table.Th>Name</Table.Th>
                    <Table.Th>Faction</Table.Th>
                    <Table.Th>Type</Table.Th>
                    <Table.Th>Cost</Table.Th>
                    <Table.Th>Add</Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{tableRows}</Table.Tbody>
        </Table>
    </ScrollArea>
}

function DisplayCard({entity}: { entity: SongData }) {
    const src = `https://raw.githubusercontent.com/Pf2eTools/asoiaf-tmg-data/refs/heads/master/generated/en/${entity.statistics.faction}/${entity.id}.jpg`;
    const {addToArmy} = useContext(ArmyContext);

    return <>
        <Image src={src} onClick={() => addToArmy(entity)}></Image>
        <p className="my-0 pointer">
            <b>{entity._fullName}</b>{` (${entity.statistics.cost})`}
        </p>
    </>
}

function FilterListImageDisplay({displayData}: ListDisplayProps) {
    return <ScrollArea scrollbars="y" offsetScrollbars>
        <Grid>
            {displayData.map(it => <Grid.Col
                key={it.id}
                span={it._prop === "units" ? 6 : 3}>
                <DisplayCard
                    key={it.id}
                    entity={it}
                ></DisplayCard>
            </Grid.Col>)}
        </Grid>
    </ScrollArea>
}

function SongDataFilterListDisplay({displayData}: ListDisplayProps) {
    const [isDisplayImages, setIsDisplayImages] = useState(true);
    return <>
        <Flex>
            <Switch
                className="m-1"
                defaultChecked
                label="Display Images"
                onChange={(event) => setIsDisplayImages(event.currentTarget.checked)}
            ></Switch>
            <span className="m-1 ml-auto"><b>{displayData.length} Items</b></span>
        </Flex>
        {isDisplayImages
            ? <FilterListImageDisplay displayData={displayData}></FilterListImageDisplay>
            : <FilterListTextDisplay displayData={displayData}></FilterListTextDisplay>}
    </>
}

export default SongDataFilterListDisplay;
