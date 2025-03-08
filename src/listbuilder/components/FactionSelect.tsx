import {Select} from "@mantine/core";
import {useContext} from "react";
import FilterContext from "../FilterContext.ts";
import ArmyContext from "../ArmyContext.ts";
import {FilterSongData} from "../filter.tsx";
import {FACTIONS} from "../../songTypes.ts";


interface FactionSelectOpts {
    filterData: FilterSongData
}
function FactionSelect({filterData}: FactionSelectOpts) {
    const {setFilterState} = useContext(FilterContext);
    const {armyData, setArmyFaction} = useContext(ArmyContext);

    return <Select
        data={Object.values(FACTIONS)}
        value={armyData.faction}
        onChange={(faction) => {
            if (faction === null) return;

            setFilterState(() => {
                const newState = filterData.defaultFilterStates;
                const factionFilter = filterData.factionFilter;
                newState[factionFilter.getFilterStateHash(faction)] = 1;
                return newState;
            });

            setArmyFaction(faction);
        }}
        className="m-1 mx-0">
    </Select>
}

export default FactionSelect;
