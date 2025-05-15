import {BuilderRoles, SongData} from "../../../utils/songTypes.ts";
import {Button, Flex, ScrollArea, Stack, Text} from "@mantine/core";
import {useContext} from "react";
import ArmyContext from "../ArmyContext.ts";
import SongHoverWrapper from "../../hoverwindows/components/SongHoverWrapper.tsx";
import {useFilterContext} from "../../filter/FilterContext.ts";
import {FilterSongData} from "../../filter/filter.tsx";


function UnitCard({songObj, onClickDelete}: { songObj: SongData, onClickDelete: () => void }) {
    const imgSrc = `./img/${songObj.id}p.webp`;
    const attachmentClass = songObj._prop === "attachments" && !songObj.statistics.enemy ? "card--attachment" : ""
    return <div className={"flex card " + attachmentClass}>
        <SongHoverWrapper entity={songObj}>
            <img src={imgSrc} alt="?" className="m-0 unit-img"/>
        </SongHoverWrapper>
        <p className="card__p">
            <span className="unit-name">{songObj.name}</span>
            <span className="unit-name unit-sub-name">{songObj.subname || ""}</span>
        </p>
        <Button
            className="unit-img"
            color="red"
            size="compact-xs"
            variant="light"
            onClick={onClickDelete}
        >Remove
        </Button>
    </div>
}

interface AddToArmyButtonProps {
    text: string
    onClick: () => void
    variant?: string
}

function AddToArmyButton({text, onClick, variant}: AddToArmyButtonProps) {
    return <>
        <Button
            className={text === "Add Attachment" ? "card--attachment w-70" : "w-70 my-1"}
            variant={variant || "outline"}
            size="xs"
            onClick={onClick}
        >
            {text}
        </Button>
    </>
}

interface ArmyDisplayProps {
    filterData: FilterSongData
}

function ArmyDisplay({filterData}: ArmyDisplayProps) {
    const {setFilterState} = useFilterContext();
    const {armyData, slot, setSlot, deleteFromArmy, armyValidator, allowIllegal} = useContext(ArmyContext);

    const setFilterAndSlot = (newVal: string, newSlot: number) => {
        const typeFilter = filterData.typeFilter;
        setFilterState(prevState => {
            const newState = {...prevState, ...typeFilter.defaultFilterState};
            newState[typeFilter.getFilterStateHash(newVal)] = 1;
            return newState;
        });
        setSlot(newSlot);
    }
    const pools = armyValidator.pointPools;
    const armySize = <Text fw={700} size="lg" c={armyValidator.exceedsPoints() ? "red" : undefined} component="span" className="ml-auto">
        Points: {pools[1].points}/{pools[1].max} ({pools[0].points}/{pools[0].max})
    </Text>;

    return <ScrollArea scrollbars="y" offsetScrollbars><Stack className="gap-0">
        <Flex className="my-1">
        {armyData.commander === undefined
            ? <><Text fw={700} size="lg">No Commander Selected</Text>{armySize}</>
            : <><Text fw={700} size="lg">{armyData.commander.name}</Text>{armySize}</>}
        </Flex>
        {armyData.commander === undefined
            ? <AddToArmyButton text="Add Commander" onClick={() => setFilterAndSlot(BuilderRoles.commander, -1)}></AddToArmyButton>
            : null}

        <Text fw={700} size="lg">Combat Units</Text>
        {armyData.unit.map((obj, idx) => {
            const out = [];
            if (obj.unit === null) {
                out.push(<AddToArmyButton
                    key={idx}
                    text="Add Combat Unit"
                    variant={slot === idx ? "light" : undefined}
                    onClick={() => setFilterAndSlot(BuilderRoles.unit, idx)}>
                </AddToArmyButton>);
            } else {
                out.push(<UnitCard
                    key={idx}
                    songObj={obj.unit}
                    onClickDelete={() => deleteFromArmy({ixRemove: idx, key: "unit"})}
                />);
            }

            obj.attachments.forEach((attachment, ixAttachment) => {
                out.push(<UnitCard
                    key={ixAttachment + 100}
                    songObj={attachment}
                    onClickDelete={() => deleteFromArmy({ixRemoveChild: ixAttachment, ixRemove: idx, key: "attachment"})}
                />)
            })

            const isUnitAttachable = armyValidator.isSlotAttachable(idx);
            if (isUnitAttachable || allowIllegal) {
                out.push(<AddToArmyButton
                    key={idx + 1000}
                    text="Add Attachment"
                    variant={slot === idx ? "light" : undefined}
                    onClick={() => setFilterAndSlot(BuilderRoles.attachment, idx)}></AddToArmyButton>);
            }

            return out;
        })}
        <AddToArmyButton
            text="Add Combat Unit"
            variant={slot === armyData.unit.length ? "light" : undefined}
            onClick={() => setFilterAndSlot(BuilderRoles.unit, armyData.unit.length)}>
        </AddToArmyButton>
        <AddToArmyButton
            text="Add Attachment"
            variant={slot === armyData.unit.length ? "light" : undefined}
            onClick={() => setFilterAndSlot(BuilderRoles.attachment, armyData.unit.length)}>
        </AddToArmyButton>

        <Text fw={700} size="lg">NCUs</Text>
        {armyData.ncu.map((obj, idx) => {
            return <UnitCard
                key={idx}
                songObj={obj}
                onClickDelete={() => deleteFromArmy({ixRemove: idx, key: "ncu"})}/>
        })}
        <AddToArmyButton text="Add NCU" onClick={() => setFilterAndSlot(BuilderRoles.ncu, -1)}></AddToArmyButton>
    </Stack></ScrollArea>
}

export default ArmyDisplay
