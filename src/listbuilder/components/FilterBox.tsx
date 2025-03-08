import {
    PillGroup,
    Pill,
    MantineSize, ButtonVariant, DefaultMantineColor,
    Button,
    TextInput,
    Input,
    ButtonGroup,
    Modal,
    ScrollArea,
    Divider, Switch, Flex,
    Table, Grid, Image,
} from "@mantine/core";
import {FilterData, Filter} from "../filter.tsx"
import {useContext, useMemo, useState} from "react";
import {useDisclosure} from "@mantine/hooks";
import FilterContext from "../FilterContext.ts";
import {SongData} from "../../songTypes.ts";
import ArmyContext from "../ArmyContext.ts";


export interface FilterPillProps {
    variant: ButtonVariant
    color: DefaultMantineColor
    children: string
    item: string
    size?: MantineSize
    onClick?: () => void
}

function FilterPill({...props}: FilterPillProps) {
    return <Button
        {...props}
        size="xs"
    ></Button>
}

export interface FilterMiniPillProps {
    isRenderPill: boolean
    className: string
    children: string
    item: string
    size?: MantineSize
    onClick?: () => void
}

function FilterMiniPill({isRenderPill, ...props}: FilterMiniPillProps) {
    if (!isRenderPill) return null
    return <Pill {...props}></Pill>
}


interface FilterModalProps {
    isOpen: boolean
    onClose: () => void
    dataFilter: FilterData
}

function FilterModal({isOpen, onClose, dataFilter}: FilterModalProps) {
    const {filterState, setFilterState} = useContext(FilterContext);

    const onClickPill = (filter: Filter, filterItem: string) => {
        setFilterState(prevState => {
            const newState = {...prevState};
            newState[filter.getFilterStateHash(filterItem)] = filter.cycleState(filterState[filter.getFilterStateHash(filterItem)]);
            return newState;
        });
    }

    return <Modal
        opened={isOpen}
        onClose={onClose}
        title="Filter"
        centered size="70%"
        scrollAreaComponent={ScrollArea.Autosize}
        overlayProps={{blur: 1}}
    >
        {dataFilter.filters.map((filter, fIx) =>
            <div className="m-1 mx-0" key={fIx}>
                <p>{filter.header}</p>
                <PillGroup>

                    {filter.getPillProps(filterState)
                        .map((props, iIx) => {
                            return <FilterPill
                                {...props}
                                key={`${fIx}-${iIx}`}
                                onClick={() => onClickPill(filter, props.item)}
                            />
                        })
                    }

                </PillGroup>
                <Divider className="m-1 mx-0"></Divider>
            </div>
        )}
    </Modal>
}


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
        <Table.Tr key={entity.id}>
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
        </Table.Tr>
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
    const src = `https://pf2etools.github.io/asoiaf-tmg-data/generated/en/${entity.statistics.faction}/${entity.id}.jpg`;
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

function FilterListDisplay({displayData}: ListDisplayProps) {
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


interface FilterBoxProps {
    data: SongData[],
    filterData: FilterData,
}

function FilterBox({data, filterData}: FilterBoxProps) {
    const {filterState, setFilterState} = useContext(FilterContext);
    const [searchText, setSearchText] = useState("");
    const [isFilterModalOpen, {open: doOpenFilterModal, close: doCloseFilterModal}] = useDisclosure(false);

    const doSetNextFilterState = (filter: Filter, filterItem: string, nextState: number) => {
        setFilterState(prevState => {
            const newState = {...prevState};
            newState[filter.getFilterStateHash(filterItem)] = nextState;
            return newState;
        });
    }

    const filteredData = useMemo(() => {
        return data.filter(ent => filterData.doFilterEntity(ent, filterState));
    }, [filterData, data, filterState]);
    const filteredSearchedData = useMemo(() => {
        if (searchText === "") return filteredData;
        return filteredData.filter(item => item._fullName.toLowerCase().includes(searchText.toLowerCase()));
    }, [filteredData, searchText]);

    return <Flex className="h-100" direction="column">
        <FilterModal
            isOpen={isFilterModalOpen}
            onClose={doCloseFilterModal}
            dataFilter={filterData}
        ></FilterModal>

        <ButtonGroup className="m-1 filter-search-group">
            <Button
                variant="default"
                onClick={doOpenFilterModal}
            >Filter</Button>

            <TextInput
                className="filter-search__input"
                placeholder="Search..."
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                rightSection={searchText !== "" ? <Input.ClearButton onClick={() => setSearchText("")}/> : null}
                rightSectionPointerEvents="auto"
            ></TextInput>

            <Button
                variant="default"
                onClick={() => setFilterState(filterData.defaultFilterStates)}
            >Reset</Button>
        </ButtonGroup>
        <PillGroup className="mx-1">
            {filterData.filters.map((filter, fIx) => filter.getMiniPillProps(filterState)
                .map((props, iIx) => {
                    return <FilterMiniPill
                        {...props}
                        size="xs"
                        key={`${fIx}-${iIx}`}
                        onClick={() => doSetNextFilterState(filter, props.item, 0)}/>
                }))}
        </PillGroup>
        <FilterListDisplay displayData={filteredSearchedData}></FilterListDisplay>
    </Flex>
}

export default FilterBox
