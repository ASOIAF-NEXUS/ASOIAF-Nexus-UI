import '@mantine/core/styles.css';
import "../filter.css";
import {FilterSongData} from "../filter.tsx";
import {dataLoader} from "../../dataLoader.ts";
import FilterBox from "./FilterBox.tsx"
import ArmyDisplay from "./ArmyDisplay.tsx";
import FilterContextProvider from "./FilterContextProvider.tsx";
import FactionSelect from "./FactionSelect.tsx";
import {FACTIONS, SongData} from "../../songTypes.ts";
import "../../utils.ts"
import {Flex} from "@mantine/core";
import ArmyContextProvider from "./ArmyContextProvider.tsx";
import SongDataFilterListDisplay from "./SongDataFilterListDisplay.tsx";


const data = dataLoader.load().filter(d => d._prop != "tactics" && d._prop != "specials");
const filterSongData = new FilterSongData();
data.forEach(item => filterSongData.addToFilters(item));

const defaultArmyData = {
    faction: FACTIONS.greyjoy,
    ids: []
}

function ListBuilder() {
    const defaultFilterStates = filterSongData.defaultFilterStates;
    defaultFilterStates[filterSongData.factionFilter.getFilterStateHash(defaultArmyData.faction)] = 1;

    return <>
        <FilterContextProvider defaultFilterStates={defaultFilterStates}>
            <ArmyContextProvider defaultArmyData={defaultArmyData} data={data}>
                <Flex gap="xl" direction="row" className="h-100">
                    <Flex className="h-100 w-60" direction="column">
                        <FilterBox<SongData>
                            data={data}
                            filterData={filterSongData}
                            FilterListDisplay={SongDataFilterListDisplay}
                        ></FilterBox>
                    </Flex>
                    <Flex className="h-100 w-40" direction="column">
                        <FactionSelect
                            filterData={filterSongData}
                        ></FactionSelect>
                        <ArmyDisplay
                            filterData={filterSongData}
                        ></ArmyDisplay>
                    </Flex>
                </Flex>
            </ArmyContextProvider>
        </FilterContextProvider>
    </>
}

export default ListBuilder
