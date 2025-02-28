import {ArmyListData, parseArmyList, SongData} from "../../songTypes.ts";
import {Button} from "@mantine/core";
import {useContext} from "react";
import FilterContext from "../FilterContext.ts";
import {FilterSongData} from "../filter.tsx";


function UnitCard({songObj}: { songObj: SongData }) {
    const imgSrc = `https://raw.githubusercontent.com/Pf2eTools/asoiaf-tmg-data/refs/heads/master/portraits/square/${songObj.id}.jpg`;
    const attachmentClass = songObj._prop === "attachments" && !songObj.statistics.enemy ? "card--attachment" : ""
    return <div className={"flex card " + attachmentClass}>
        <img src={imgSrc} alt="?" className="m-0 unit-img"/>
        <p className="card__p">
            <span className="unit-name">{songObj.name}</span>
            <span className="unit-name unit-sub-name">{songObj.subname || ""}</span>
        </p>
    </div>
}

interface AddToArmyButtonProps {
    text: string
    onClick: () => void
}

function AddToArmyButton({text, onClick}: AddToArmyButtonProps) {
    return <>
        <Button
            className={text === "Add Attachment" ? "card--attachment w-70" : "w-70 my-1"}
            variant="outline"
            size="xs"
            onClick={onClick}
        >
            {text}
        </Button>
    </>
}

interface ArmyDisplayProps {
    data: SongData[]
    armyData: ArmyListData
    filterData: FilterSongData
}

function ArmyDisplay({data, armyData, filterData}: ArmyDisplayProps) {
    const {setFilterState} = useContext(FilterContext);
    const parsedArmy = parseArmyList(armyData, data);

    const setTypeFilter = (newVal: string) => {
        const typeFilter = filterData.typeFilter;
        setFilterState(prevState => {
            const newState = {...prevState, ...typeFilter.defaultFilterState};
            newState[typeFilter.getFilterStateHash(newVal)] = 1;
            return newState
        });
    }

    return <>
        <h3>{parsedArmy.faction}{parsedArmy.commander !== undefined ? ` (${parsedArmy.commander.name})` : ""}</h3>
        <h3>Combat Units</h3>
        {parsedArmy.units.map(uo => [uo.unit, ...uo.attachments]).map(sd => {
            const cards = sd.map((o, ix) => <UnitCard key={ix} songObj={o}/>);
            if (cards.length === 1) cards.push(<AddToArmyButton
                text="Add Attachment"
                onClick={() => setTypeFilter("attachments")}></AddToArmyButton>);
            return cards;
        })}
        <AddToArmyButton text="Add Combat Unit" onClick={() => setTypeFilter("units")}></AddToArmyButton>
        <h3>NCUs</h3>
        {parsedArmy.ncu.map((obj, ix) => <UnitCard key={ix} songObj={obj}/>)}
        <AddToArmyButton
            text="Add NCU"
            onClick={() => setTypeFilter("ncus")}
        ></AddToArmyButton>
    </>
}

export default ArmyDisplay
