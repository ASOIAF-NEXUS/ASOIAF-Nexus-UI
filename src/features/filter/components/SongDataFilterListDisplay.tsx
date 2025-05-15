import {BuilderRoles, SongData} from "../../../utils/songTypes.ts";
import {useContext, useState} from "react";
import ArmyContext from "../../listbuild/ArmyContext.ts";
import {Button, Flex, Grid, Image, Overlay, ScrollArea, Switch, Table, Text, Tooltip} from "@mantine/core";
import SongHoverWrapper from "../../hoverwindows/components/SongHoverWrapper.tsx";
import {SortUtil} from "../../../utils/utils.ts";
import {LazyLoadImage, ScrollPosition, trackWindowScroll} from "react-lazy-load-image-component";


interface ListDisplayProps {
    displayData: SongData[],
}

function FilterListTextDisplay({displayData}: ListDisplayProps) {
    const {addToArmy, armyValidator, allowIllegal} = useContext(ArmyContext);
    const [sortMeta, setSortMeta] = useState({by: "Name", dir: 0})

    const sortData = (a: SongData, b: SongData) => {
        const l = sortMeta.dir === 0 ? a : b;
        const r = sortMeta.dir === 0 ? b : a;
        const byName = SortUtil.ascSortLower(l._fullName, r._fullName);
        if (sortMeta.by === "Name") return byName;
        if (sortMeta.by === "Legal") return SortUtil.ascSortNumbers(armyValidator.getEntityReasonsIllegal(l).length, armyValidator.getEntityReasonsIllegal(r).length)
            || SortUtil.ascSortNumbers(armyValidator.getEntityReasonsIllegalSlot(l).length, armyValidator.getEntityReasonsIllegalSlot(r).length)
            || byName;
        if (sortMeta.by === "Faction") return SortUtil.ascSort(l.statistics.faction, r.statistics.faction) || byName;
        if (sortMeta.by === "Type") return SortUtil.ascSort(l._roleBuilder, r._roleBuilder) || byName;
        if (sortMeta.by === "Cost") return SortUtil.ascSortNumbers(Number(l.statistics.cost), Number(r.statistics.cost)) || byName;
        return 0;
    }
    const tableRows = displayData.sort(sortData).map((entity) => {
        const legality = armyValidator.getEntityReasonsIllegal(entity);
        const slotLegality = armyValidator.getEntityReasonsIllegalSlot(entity);
        return <Table.Tr key={entity.id}>
            <SongHoverWrapper entity={entity}><Table.Td>{entity._fullName}</Table.Td></SongHoverWrapper>
            <Table.Td>{entity.statistics.faction}</Table.Td>
            <Table.Td>{entity._roleBuilder}</Table.Td>
            <Table.Td>{entity.statistics.cost}</Table.Td>
            <Table.Td>
                {legality.length === 0 && slotLegality.length === 0
                    ? "Yes"
                    : legality.length === 0
                        ? <Tooltip label={slotLegality[0]}><Text>Yes*</Text></Tooltip>
                        : <Tooltip label={legality[0]}><Text>⚠</Text></Tooltip>
                }
            </Table.Td>
            <Table.Td>
                <Button
                    size="xs"
                    variant="light"
                    disabled={legality.length !== 0 && !allowIllegal}
                    onClick={() => addToArmy(entity)}
                >Add</Button>
            </Table.Td>
        </Table.Tr>
    });

    const onClickHeader = (title: string) => {
        setSortMeta(prevState => {
            const newState = {by: title, dir: 0}
            if (prevState.by === title) newState.dir = (prevState.dir + 1) % 2
            return newState;
        })
    }
    const renderTableHeader = (title: string) => {
        return <Table.Th onClick={() => onClickHeader(title)} key={title}>
            <Button size="compact-sm" color="dark" variant="subtle" className="mx-0">
                <Text fw={700}>{title}{sortMeta.by === title ? sortMeta.dir === 0 ? " ↓" : " ↑" : ""}</Text>
            </Button>
        </Table.Th>
    }

    return <ScrollArea scrollbars="y" offsetScrollbars>
        <Table striped stickyHeader highlightOnHover>
            <Table.Thead>
                <Table.Tr>
                    {["Name", "Faction", "Type", "Cost", "Legal"].map(renderTableHeader)}
                    <Table.Th>Add</Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{tableRows}</Table.Tbody>
        </Table>
    </ScrollArea>
}

function DisplayCard({entity, scrollPosition}: { entity: SongData, scrollPosition: ScrollPosition }) {
    const src = `./img/${entity.id}x1.webp`;
    const {addToArmy, armyValidator, allowIllegal} = useContext(ArmyContext);
    const legality = armyValidator.getEntityReasonsIllegal(entity);
    const slotLegality = armyValidator.getEntityReasonsIllegalSlot(entity);
    const isLegal = legality.length === 0;

    // TODO: Would be nice to calculate image height to prevent the layout from jumping

    if (isLegal && slotLegality.length === 0) return <>
        <LazyLoadImage
            src={src}
            scrollPosition={scrollPosition}
            effect="opacity"
            width="100%"
            className="pointer block"
            onClick={() => addToArmy(entity)}
            wrapperClassName="block"
        ></LazyLoadImage>
        <p className="my-0">
            <b>{entity._fullName}</b>{` (${entity.statistics.cost})`}
        </p>
    </>

    const color = isLegal ? "#f7d931" : "#900";
    const reason = isLegal ? `Warning: ${slotLegality.join(", ")}` : `Illegal: ${legality.join(", ")}`;

    return <>
        <Tooltip label={reason}>
            <div style={{position: "relative"}}>
                <LazyLoadImage
                    src={src}
                    scrollPosition={scrollPosition}
                    effect="opacity"
                    width="100%"
                    wrapperClassName="block"
                    className="block">
                </LazyLoadImage>
                <Overlay
                    className={allowIllegal || isLegal ? "pointer" : undefined}
                    color={color}
                    backgroundOpacity={0.35}
                    onClick={allowIllegal || isLegal ? () => addToArmy(entity) : undefined}
                />
            </div>
        </Tooltip>
        <Text c={legality.length === 0 ? "yellow.8" : "red.9"} className="my-0">
            <b>{entity._fullName}</b>{` (${entity.statistics.cost})`}
        </Text>
    </>
}

function ImageDisplayCategory({category, entities, scrollPosition}: { category: string, entities: SongData[], scrollPosition: ScrollPosition}) {
    const [isHidden, setIsHidden] = useState(false);
    const {armyValidator} = useContext(ArmyContext);

    const sortListDisplay = (a: SongData, b: SongData) => {
        const legal = SortUtil.ascSortNumbers(armyValidator.getEntityReasonsIllegal(a).length, armyValidator.getEntityReasonsIllegal(b).length)
        const slotLegal = SortUtil.ascSortNumbers(armyValidator.getEntityReasonsIllegalSlot(a).length, armyValidator.getEntityReasonsIllegalSlot(b).length)
        const faction = SortUtil.ascSortLower(a.statistics.faction, b.statistics.faction)
        const cost = SortUtil.ascSortNumbers(Number(a.statistics.cost), Number(b.statistics.cost))
        const name = SortUtil.ascSortLower(a._fullName, b._fullName)
        return legal || slotLegal || faction || cost || name;
    }

    const renderHeader = (role: string) => {
        return <Grid.Col
            key={role}
            span={12}
            onClick={() => setIsHidden(prev => !prev)}
        >
            <Flex pos="relative">
                <Text fw={700} size="lg" className="mx-1">{role}s</Text>
                <Image src={isHidden ? "icon/hide.png" : "icon/show.png"} className="ml-1"></Image>
                <Overlay
                    gradient="linear-gradient(90deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0) 100%)"
                    opacity={0.85}
                    radius="md"
                />
            </Flex>
        </Grid.Col>
    }

    if (entities.length === 0) {
        if (isHidden) setIsHidden(false);
        return null;
    }

    return <>
        {renderHeader(category)}
        {isHidden
            ? null
            : entities.sort(sortListDisplay).map(ent => {
                return <Grid.Col key={ent.id} span={ent._prop === "units" ? 6 : 3}>
                    <DisplayCard entity={ent} scrollPosition={scrollPosition}></DisplayCard>
                </Grid.Col>;
            })
        }
    </>
}

interface ListDisplayPropsWithScroll extends ListDisplayProps {
    scrollPosition: ScrollPosition,
}

function FilterListImageDisplayUntracked({displayData, scrollPosition}: ListDisplayPropsWithScroll) {
    const byCategory = {
        [BuilderRoles.commander]: displayData.filter(sd => sd._roleBuilder === BuilderRoles.commander),
        [BuilderRoles.unit]: displayData.filter(sd => sd._roleBuilder === BuilderRoles.unit),
        [BuilderRoles.attachment]: displayData.filter(sd => sd._roleBuilder === BuilderRoles.attachment),
        [BuilderRoles.ncu]: displayData.filter(sd => sd._roleBuilder === BuilderRoles.ncu),
        [BuilderRoles.enemy]: displayData.filter(sd => sd._roleBuilder === BuilderRoles.enemy),
    }
    const isNoItemDisplayed = Object.values(byCategory).every(arr => arr.length === 0);

    return <ScrollArea scrollbars="y" offsetScrollbars>
        <Grid>
            {Object.entries(byCategory).map(([category, entities]) => <ImageDisplayCategory
                scrollPosition={scrollPosition} key={category} category={category}
                entities={entities}></ImageDisplayCategory>)}
            {isNoItemDisplayed
                ? <Grid.Col span={12}><Text ta="center" fw={700}>No items to display! Widen your search...</Text></Grid.Col>
                : null}
        </Grid>
    </ScrollArea>
}

const FilterListImageDisplay = trackWindowScroll(FilterListImageDisplayUntracked);

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
