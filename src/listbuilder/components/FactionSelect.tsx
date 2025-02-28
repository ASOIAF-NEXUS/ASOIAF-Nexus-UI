import {Select} from "@mantine/core";
import * as React from "react";
import {useContext} from "react";
import FilterContext from "../FilterContext.ts";
import {FilterSongData} from "../filter.tsx";
import {ArmyListData, FACTIONS} from "../../songTypes.ts";


interface FactionSelectOpts {
    armyData: ArmyListData
    setArmyData: React.Dispatch<React.SetStateAction<ArmyListData>>
    filterData: FilterSongData
}
function FactionSelect({armyData, setArmyData, filterData}: FactionSelectOpts) {
    const {setFilterState} = useContext(FilterContext);
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

            setArmyData(prev => {
                if (faction === prev.faction) return {...prev, faction: faction} as ArmyListData
                return {faction: faction, ids: []} as ArmyListData
            });
        }}
        className="m-1 mx-0">
    </Select>
}

export default FactionSelect;
