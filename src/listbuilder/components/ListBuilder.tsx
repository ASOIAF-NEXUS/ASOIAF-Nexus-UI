import '@mantine/core/styles.css';
import "../filter.css";
import {useState} from "react";
import {FilterSongData} from "../filter.tsx";
import {dataLoader} from "../../dataLoader.ts";
import FilterBox from "./FilterBox.tsx"
import ArmyDisplay from "./ArmyDisplay.tsx";
import FilterContextProvider from "./FilterContextProvider.tsx";
import FactionSelect from "./FactionSelect.tsx";
import {ArmyListData, FACTIONS} from "../../songTypes.ts";
import "../../utils.ts"


const data = dataLoader.load().filter(d => d._prop != "tactics" && d._prop != "specials");
const filterSongData = new FilterSongData();
data.forEach(item => filterSongData.addToFilters(item));

function ListBuilder() {
    const [armyData, setArmyData] = useState({
        faction: FACTIONS.greyjoy,
        ids: [10807, 20803, 10803, 20818, 10809, 10802, 10808, 30803, 30801, 30807]
    } as ArmyListData);

    const defaultFilterStates = filterSongData.defaultFilterStates;
    defaultFilterStates[filterSongData.factionFilter.getFilterStateHash(FACTIONS.greyjoy)] = 1;

    return <>
        <FilterContextProvider defaultFilterStates={defaultFilterStates}>
            <div className="flex h-100vh">
                <div className="filter-wrapper w-70">
                    <FilterBox
                        data={data}
                        filterData={filterSongData}>
                    </FilterBox>
                </div>
                <div className="w-30">
                    <FactionSelect
                        armyData={armyData}
                        setArmyData={setArmyData}
                        filterData={filterSongData}
                    ></FactionSelect>
                    <ArmyDisplay
                        data={data}
                        armyData={armyData}
                        filterData={filterSongData}>
                    </ArmyDisplay>
                </div>
            </div>
        </FilterContextProvider>
    </>
}

export default ListBuilder
