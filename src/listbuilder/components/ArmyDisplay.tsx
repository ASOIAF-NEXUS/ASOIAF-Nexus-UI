import {BuilderRoles, SongData} from "../../songTypes.ts";
import {Button, ScrollArea, Stack} from "@mantine/core";
import {useContext} from "react";
import FilterContext from "../FilterContext.ts";
import {FilterSongData} from "../filter.tsx";
import ArmyContext from "../ArmyContext.ts";


function UnitCard({songObj, onClickDelete}: { songObj: SongData, onClickDelete: () => void }) {
    const imgSrc = `https://raw.githubusercontent.com/Pf2eTools/asoiaf-tmg-data/refs/heads/master/portraits/square/${songObj.id}.jpg`;
    const attachmentClass = songObj._prop === "attachments" && !songObj.statistics.enemy ? "card--attachment" : ""
    return <div className={"flex card " + attachmentClass}>
        <img src={imgSrc} alt="?" className="m-0 unit-img"/>
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
    const {setFilterState} = useContext(FilterContext);
    const {armyData, slot, deleteFromArmy} = useContext(ArmyContext);

    const setFilterAndSlot = (newVal: string, newSlot: number) => {
        slot.current = newSlot;
        const typeFilter = filterData.typeFilter;
        setFilterState(prevState => {
            const newState = {...prevState, ...typeFilter.defaultFilterState};
            newState[typeFilter.getFilterStateHash(newVal)] = 1;
            return newState
        });
    }

    return <ScrollArea scrollbars="y" offsetScrollbars><Stack className="gap-0">
        {armyData.commander === undefined
            ? <AddToArmyButton text="Add Commander" onClick={() => setFilterAndSlot(BuilderRoles.commander, -1)}></AddToArmyButton>
            : <h3>{armyData.commander.name}</h3>}

        <h3 className="m-1 mx-0">Combat Units</h3>
        {armyData.unit.map((obj, idx) => {
            const out = [];
            if (obj.unit === null) {
                out.push(<AddToArmyButton
                    key={idx}
                    text="Add Combat Unit"
                    variant={slot.current === idx ? "light" : undefined}
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

            const isUnitAttachable = obj.unit && obj.unit.statistics.tray !== "solo";
            if (obj.attachments.length < 1 && isUnitAttachable) {
                out.push(<AddToArmyButton
                    key={idx + 1000}
                    text="Add Attachment"
                    variant={slot.current === idx ? "light" : undefined}
                    onClick={() => setFilterAndSlot(BuilderRoles.attachment, idx)}></AddToArmyButton>);
            }

            return out;
        })}
        <AddToArmyButton
            text="Add Combat Unit"
            variant={slot.current === armyData.unit.length ? "light" : undefined}
            onClick={() => setFilterAndSlot(BuilderRoles.unit, armyData.unit.length)}>
        </AddToArmyButton>
        <AddToArmyButton
            text="Add Attachment"
            variant={slot.current === armyData.unit.length ? "light" : undefined}
            onClick={() => setFilterAndSlot(BuilderRoles.attachment, armyData.unit.length)}>
        </AddToArmyButton>

        <h3>NCUs</h3>
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
